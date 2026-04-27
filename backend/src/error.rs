use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ForjaError {
    #[error("database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("invalid status value '{0}': expected available | started | completed | mastered")]
    InvalidStatus(String),

    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
}

impl IntoResponse for ForjaError {
    fn into_response(self) -> Response {
        let (status, msg) = match &self {
            ForjaError::InvalidStatus(_) => (StatusCode::BAD_REQUEST, self.to_string()),
            ForjaError::Database(_) | ForjaError::Io(_) => {
                tracing::error!("internal error: {self}");
                (StatusCode::INTERNAL_SERVER_ERROR, "internal server error".into())
            }
        };
        (status, Json(serde_json::json!({ "error": msg }))).into_response()
    }
}
