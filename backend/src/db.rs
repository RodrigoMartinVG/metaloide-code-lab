use sqlx::SqlitePool;
use std::path::PathBuf;

use crate::error::ForjaError;

const SCHEMA: &str = r#"
CREATE TABLE IF NOT EXISTS unit_progress (
    unit_id    TEXT    PRIMARY KEY,
    status     TEXT    NOT NULL DEFAULT 'available',
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS closing_answers (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id    TEXT    NOT NULL,
    question   TEXT    NOT NULL,
    answer     TEXT    NOT NULL,
    created_at INTEGER NOT NULL
);
"#;

pub async fn create_pool() -> Result<SqlitePool, ForjaError> {
    let path = db_path();

    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }

    // `mode=rwc` creates the file if it doesn't exist
    let url = format!("sqlite:{}?mode=rwc", path.display());
    let pool = SqlitePool::connect(&url).await?;

    sqlx::query(SCHEMA).execute(&pool).await?;

    Ok(pool)
}

fn db_path() -> PathBuf {
    // FORJA_DB overrides the path; default keeps the file next to the binary
    // for local development so `cargo run` just works.
    match std::env::var_os("FORJA_DB") {
        Some(p) => PathBuf::from(p),
        None    => PathBuf::from("forja.db"),
    }
}
