use axum::Json;

pub async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status":    "ok",
        "milestone": "M1",
        "version":   env!("CARGO_PKG_VERSION"),
    }))
}
