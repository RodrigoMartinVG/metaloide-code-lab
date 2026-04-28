use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use serde::{Deserialize, Serialize};

use crate::{error::ForjaError, state::AppState};

const VALID_STATUSES: &[&str] = &["available", "started", "completed", "mastered"];

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct ProgressRecord {
    pub unit_id:    String,
    pub status:     String,
    pub updated_at: i64,
}

#[derive(Deserialize)]
pub struct UpdateProgress {
    pub status: String,
}

#[derive(Deserialize)]
pub struct ClosingAnswerPayload {
    pub unit_id:  String,
    pub question: String,
    pub answer:   String,
}

// ── GET /api/progress ────────────────────────────────────────────────────────
// Returns all stored records in one shot so the frontend can hydrate on load.

pub async fn get_all_progress(
    State(state): State<AppState>,
) -> Result<Json<Vec<ProgressRecord>>, ForjaError> {
    let rows: Vec<ProgressRecord> = sqlx::query_as(
        "SELECT unit_id, status, updated_at FROM unit_progress ORDER BY updated_at DESC",
    )
    .fetch_all(&state.db)
    .await?;

    Ok(Json(rows))
}

// ── GET /api/progress/:unit_id ────────────────────────────────────────────────

pub async fn get_progress(
    Path(unit_id): Path<String>,
    State(state): State<AppState>,
) -> Result<Json<ProgressRecord>, ForjaError> {
    let row: Option<ProgressRecord> = sqlx::query_as(
        "SELECT unit_id, status, updated_at FROM unit_progress WHERE unit_id = ?",
    )
    .bind(&unit_id)
    .fetch_optional(&state.db)
    .await?;

    Ok(Json(row.unwrap_or(ProgressRecord {
        unit_id,
        status:     "available".into(),
        updated_at: 0,
    })))
}

// ── PUT /api/progress/:unit_id ────────────────────────────────────────────────

pub async fn put_progress(
    Path(unit_id): Path<String>,
    State(state): State<AppState>,
    Json(body): Json<UpdateProgress>,
) -> Result<Json<ProgressRecord>, ForjaError> {
    if !VALID_STATUSES.contains(&body.status.as_str()) {
        return Err(ForjaError::InvalidStatus(body.status));
    }

    let now = unix_now();

    sqlx::query(
        "INSERT INTO unit_progress (unit_id, status, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(unit_id) DO UPDATE
         SET status = excluded.status, updated_at = excluded.updated_at",
    )
    .bind(&unit_id)
    .bind(&body.status)
    .bind(now)
    .execute(&state.db)
    .await?;

    Ok(Json(ProgressRecord { unit_id, status: body.status, updated_at: now }))
}

// ── POST /api/closing ─────────────────────────────────────────────────────────

pub async fn post_closing(
    State(state): State<AppState>,
    Json(body): Json<ClosingAnswerPayload>,
) -> Result<StatusCode, ForjaError> {
    let now = unix_now();

    sqlx::query(
        "INSERT INTO closing_answers (unit_id, question, answer, created_at) VALUES (?, ?, ?, ?)",
    )
    .bind(&body.unit_id)
    .bind(&body.question)
    .bind(&body.answer)
    .bind(now)
    .execute(&state.db)
    .await?;

    Ok(StatusCode::CREATED)
}

fn unix_now() -> i64 {
    // SystemTime::now() is always after UNIX_EPOCH on any supported platform
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}
