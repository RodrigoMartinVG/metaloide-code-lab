mod health;
mod progress;
mod run;

use axum::{
    routing::{get, post, put},
    Router,
};

use crate::state::AppState;

/// REST API routes — mounted at /api
pub fn api_router() -> Router<AppState> {
    Router::new()
        .route("/health",                 get(health::health))
        .route("/progress",               get(progress::get_all_progress))
        .route("/progress/{unit_id}",     get(progress::get_progress))
        .route("/progress/{unit_id}",     put(progress::put_progress))
        .route("/closing",                post(progress::post_closing))
}

/// WebSocket routes — mounted at /ws
pub fn ws_router() -> Router<AppState> {
    Router::new()
        .route("/run", get(run::ws_run))
}
