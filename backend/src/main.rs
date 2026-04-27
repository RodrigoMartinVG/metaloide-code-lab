mod db;
mod error;
mod routes;
mod state;

use axum::http::Method;
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "forja=debug,tower_http=info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let pool = db::create_pool().await?;

    let app_state = state::AppState { db: pool };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers(Any);

    let app = axum::Router::new()
        .nest("/api", routes::api_router())
        .nest("/ws",  routes::ws_router())
        .layer(TraceLayer::new_for_http())
        .layer(cors)
        .with_state(app_state);

    let addr = "127.0.0.1:3000";
    tracing::info!("Forja listening on http://{addr}");

    let listener = tokio::net::TcpListener::bind(addr).await?;

    // Graceful shutdown on Ctrl-C.
    // M2: extend this to drain active sandbox processes before exit.
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}

async fn shutdown_signal() {
    tokio::signal::ctrl_c()
        .await
        // If we can't install a Ctrl-C handler, the OS environment is broken.
        .expect("failed to install Ctrl-C signal handler");
    tracing::info!("shutdown signal received");
}
