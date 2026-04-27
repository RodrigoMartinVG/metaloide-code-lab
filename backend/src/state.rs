/// Shared application state injected into every handler via axum's State extractor.
/// SqlitePool is internally Arc-backed — Clone here is cheap.
#[derive(Clone)]
pub struct AppState {
    pub db: sqlx::SqlitePool,
}
