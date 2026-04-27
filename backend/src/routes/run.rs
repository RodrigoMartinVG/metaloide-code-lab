use std::path::Path;
use std::process::Stdio;
use std::time::Duration;

use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::response::IntoResponse;
use serde::Deserialize;
use serde_json::json;
use tempfile::TempDir;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;
use tokio::sync::mpsc;

use crate::error::ForjaError;

const COMPILE_TIMEOUT: Duration = Duration::from_secs(30);
const RUN_TIMEOUT:     Duration = Duration::from_secs(10);

#[derive(Deserialize)]
struct RunPayload {
    language: String,
    code:     String,
}

// ── Entry point ───────────────────────────────────────────────────────────────

pub async fn ws_run(ws: WebSocketUpgrade) -> impl IntoResponse {
    ws.on_upgrade(handle_socket)
}

async fn handle_socket(mut socket: WebSocket) {
    let Some(Ok(Message::Text(text))) = socket.recv().await else { return };

    let payload: RunPayload = match serde_json::from_str(&text) {
        Ok(p)  => p,
        Err(e) => { send_error(&mut socket, &format!("invalid payload: {e}")).await; return; }
    };

    if let Err(e) = execute(&mut socket, &payload).await {
        send_error(&mut socket, &e.to_string()).await;
    }
}

// ── Dispatch ──────────────────────────────────────────────────────────────────

async fn execute(socket: &mut WebSocket, payload: &RunPayload) -> Result<(), ForjaError> {
    let dir = tempfile::tempdir().map_err(ForjaError::Io)?;

    let exit_code = match payload.language.as_str() {
        "c"    => run_c(socket, &dir, &payload.code).await?,
        "rust" => run_rust(socket, &dir, &payload.code).await?,
        other  => return Err(ForjaError::UnsupportedLanguage(other.to_string())),
    };

    send_done(socket, exit_code).await;
    Ok(())
}

// ── Language runners ──────────────────────────────────────────────────────────

async fn run_c(socket: &mut WebSocket, dir: &TempDir, code: &str) -> Result<i32, ForjaError> {
    let src = dir.path().join("main.c");
    let bin = dir.path().join(if cfg!(windows) { "main.exe" } else { "main" });

    tokio::fs::write(&src, code).await.map_err(ForjaError::Io)?;

    let ok = compile(socket, "gcc", &["-std=c11", "-Wall", "-Wextra"], &src, &bin).await?;
    if !ok { return Ok(1); }

    run_binary(socket, &bin).await
}

async fn run_rust(socket: &mut WebSocket, dir: &TempDir, code: &str) -> Result<i32, ForjaError> {
    let src = dir.path().join("main.rs");
    let bin = dir.path().join(if cfg!(windows) { "main.exe" } else { "main" });

    tokio::fs::write(&src, code).await.map_err(ForjaError::Io)?;

    let ok = compile(socket, "rustc", &[], &src, &bin).await?;
    if !ok { return Ok(1); }

    run_binary(socket, &bin).await
}

// ── Shared: compile ───────────────────────────────────────────────────────────

async fn compile(
    socket:      &mut WebSocket,
    compiler:    &str,
    extra_flags: &[&str],
    src:         &Path,
    bin:         &Path,
) -> Result<bool, ForjaError> {
    let filename = src.file_name().unwrap_or_default().to_string_lossy();
    send_event(socket, "compiler", &format!("   Compiling {filename}…")).await;

    let src_s = path_to_str(src)?;
    let bin_s = path_to_str(bin)?;

    let result = tokio::time::timeout(
        COMPILE_TIMEOUT,
        Command::new(compiler)
            .args(extra_flags)
            .arg("-o").arg(bin_s)
            .arg(src_s)
            .output(),
    )
    .await;

    match result {
        Err(_) => {
            send_event(socket, "compiler", "error: compilation timed out (30s limit).").await;
            Ok(false)
        }
        Ok(Err(e)) if e.kind() == std::io::ErrorKind::NotFound => {
            send_event(socket, "error", &format!(
                "{compiler} not found in PATH.\nInstall it and restart the backend."
            ))
            .await;
            Ok(false)
        }
        Ok(Err(e)) => Err(ForjaError::Io(e)),
        Ok(Ok(output)) => {
            // gcc/rustc write diagnostics to stderr; stdout is rare but forward it too
            for line in String::from_utf8_lossy(&output.stdout).lines() {
                send_event(socket, "compiler", line).await;
            }
            for line in String::from_utf8_lossy(&output.stderr).lines() {
                send_event(socket, "compiler", line).await;
            }

            if output.status.success() {
                send_event(socket, "compiler", "   Finished.").await;
                Ok(true)
            } else {
                Ok(false)
            }
        }
    }
}

// ── Shared: run binary ────────────────────────────────────────────────────────

async fn run_binary(socket: &mut WebSocket, bin: &Path) -> Result<i32, ForjaError> {
    let mut child = Command::new(bin)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .kill_on_drop(true) // if this future is dropped, kill the child
        .spawn()
        .map_err(ForjaError::Io)?;

    // safe: both handles were configured as piped above
    let stdout = child.stdout.take().expect("stdout is piped");
    let stderr = child.stderr.take().expect("stderr is piped");

    let (tx, mut rx) = mpsc::channel::<(&'static str, String)>(64);

    let tx_out = tx.clone();
    let out_task = tokio::spawn(async move {
        let mut lines = BufReader::new(stdout).lines();
        while let Ok(Some(line)) = lines.next_line().await {
            if tx_out.send(("stdout", line)).await.is_err() { break; }
        }
    });

    let tx_err = tx.clone();
    let err_task = tokio::spawn(async move {
        let mut lines = BufReader::new(stderr).lines();
        while let Ok(Some(line)) = lines.next_line().await {
            if tx_err.send(("stderr", line)).await.is_err() { break; }
        }
    });

    // drop the original sender so the channel closes when both reader tasks finish
    drop(tx);

    let deadline = tokio::time::sleep(RUN_TIMEOUT);
    tokio::pin!(deadline);

    let mut timed_out = false;
    loop {
        tokio::select! {
            msg = rx.recv() => match msg {
                Some((kind, data)) => { send_event(socket, kind, &data).await; }
                None => break, // both stdout and stderr streams closed → program ended
            },
            _ = &mut deadline => {
                child.kill().await.ok();
                send_event(socket, "error", "Execution timed out (10s limit).").await;
                timed_out = true;
                break;
            }
        }
    }

    out_task.abort();
    err_task.abort();

    if timed_out { return Ok(124); }

    let status = child.wait().await.map_err(ForjaError::Io)?;
    Ok(status.code().unwrap_or(-1))
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async fn send_event(socket: &mut WebSocket, kind: &str, data: &str) {
    let msg = json!({ "type": kind, "data": data }).to_string();
    let _ = socket.send(Message::Text(msg.into())).await;
}

async fn send_done(socket: &mut WebSocket, exit_code: i32) {
    let msg = json!({ "type": "done", "data": { "exit_code": exit_code } }).to_string();
    let _ = socket.send(Message::Text(msg.into())).await;
}

async fn send_error(socket: &mut WebSocket, msg: &str) {
    let payload = json!({ "type": "error", "data": msg }).to_string();
    let _ = socket.send(Message::Text(payload.into())).await;
}

fn path_to_str(p: &Path) -> Result<&str, ForjaError> {
    p.to_str().ok_or_else(|| {
        ForjaError::Io(std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            "path contains non-UTF-8 characters",
        ))
    })
}
