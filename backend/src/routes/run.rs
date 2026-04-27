use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    response::IntoResponse,
};

/// WebSocket endpoint for code execution.
/// M1: accepts the connection and immediately sends a stub message.
/// M2: will spawn a sandboxed subprocess and stream { type, data } events.
pub async fn ws_run(ws: WebSocketUpgrade) -> impl IntoResponse {
    ws.on_upgrade(handle_socket)
}

async fn handle_socket(mut socket: WebSocket) {
    let msg = serde_json::json!({
        "type": "info",
        "data": "Backend M1 running. Code execution available in M2."
    });
    // to_string on a static json literal is infallible
    let text = msg.to_string();
    let _ = socket.send(Message::Text(text.into())).await;
    // let the socket close naturally — client will see the message and the connection end
}
