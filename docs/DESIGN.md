# Technical Design

## Overview

Forja consists of two independent processes that communicate over HTTP/WebSocket:

- **Web frontend** — the learning interface, served from `localhost:5173` (dev) or a static host
- **Execution backend** — a Rust server that runs on the learner's machine, exposed at `localhost:3000`

The separation is intentional. The frontend can eventually be hosted in the cloud (SaaS model) while the backend stays local — or both can be fully local. The contract between them is a clean HTTP API.

---

## Frontend

### Stack
- **Vite** — build tooling and dev server
- **TypeScript** — strict mode, no `any`
- **Lit** — web components, minimal abstraction over the DOM
- **Monaco Editor** — VS Code's editor, embedded in the browser
- **WebSocket** — for streaming execution output in real time

### Key Components

```
web/src/
├── components/
│   ├── lab-view.ts          # Main lab container (theory + editor + output)
│   ├── code-editor.ts       # Monaco wrapper
│   ├── output-panel.ts      # Execution output, errors, test results
│   ├── progress-bar.ts      # Pillar/concept progress
│   ├── challenge-timer.ts   # Timed challenge overlay
│   └── nav-tree.ts          # Lab navigation tree
│
├── labs/
│   ├── lab-loader.ts        # Fetches lab content from backend
│   ├── lab-runner.ts        # Sends code, receives output stream
│   └── lab-types.ts         # Lab schema types
│
├── store/
│   ├── progress.ts          # Local progress state
│   └── session.ts           # Current session state
│
└── pages/
    ├── home.ts              # Pillar selection / dashboard
    ├── lab.ts               # Lab page
    └── project.ts           # Project overview page
```

### Lab Rendering

Each lab is a structured document: a sequence of `blocks`. A block is one of:

- `theory` — Markdown content, rendered inline
- `code` — Monaco editor instance with initial code, hints, and expected behavior
- `exercise` — A code block with automated validation
- `quiz` — Multiple choice or fill-in, validated client-side

The lab renderer walks these blocks in order. The learner progresses linearly unless they've already completed the lab, in which case they can jump freely.

### Execution Flow

```
1. User writes code in Monaco
2. User clicks "Run" (or Ctrl+Enter)
3. Frontend opens WebSocket to backend: ws://localhost:3000/run
4. Sends: { code, lab_id, exercise_id }
5. Backend streams: stdout, stderr, test results
6. Frontend renders output line by line
7. On completion: receives { success, errors, score }
```

---

## Backend

### Stack
- **Rust** — the server itself
- **Axum** — HTTP framework (clean, async, tower-compatible)
- **Tokio** — async runtime
- **SQLite via sqlx** — progress persistence, no external DB dependency
- **CORS** — open for all origins in development mode

### Modules

```
backend/src/
├── main.rs               # Server bootstrap, router
│
├── api/
│   ├── labs.rs           # GET /labs, GET /labs/:id
│   ├── run.rs            # WS /run — code execution stream
│   ├── progress.rs       # GET/POST /progress
│   └── health.rs         # GET /health
│
├── runner/
│   ├── sandbox.rs        # Subprocess isolation, resource limits
│   ├── compiler.rs       # Invokes rustc/cargo, captures output
│   └── validator.rs      # Runs test assertions, parses results
│
├── labs/
│   ├── loader.rs         # Reads lab YAML/Markdown from disk
│   ├── schema.rs         # Lab data structures
│   └── index.rs          # In-memory lab index
│
└── store/
    ├── db.rs             # SQLite connection pool
    └── progress.rs       # Progress read/write
```

### Code Execution

The backend receives code as a string and executes it inside a temporary directory:

1. Write code to `tmp/{uuid}/src/main.rs` (or a Cargo project skeleton)
2. Invoke `cargo build` or `rustc` with a timeout
3. On success: run the binary with `stdout`/`stderr` piped
4. Stream output back over the WebSocket connection
5. Enforce: max execution time (configurable, default 10s), max output size

**Security model for local execution:** since the backend runs on the learner's own machine, the primary goal is preventing accidental harm (infinite loops, runaway processes) rather than adversarial sandboxing. Resource limits via OS mechanisms (ulimit on Linux/macOS, Job Objects on Windows) are sufficient for this use case.

For a future cloud deployment, proper container-level sandboxing (gVisor, Firecracker, or similar) would be added.

### Lab Format

Labs live in `labs/` as directories. Each contains:

```
labs/rust/01-ownership/
├── meta.yaml        # Title, description, pillar, order, prerequisites
├── content.md       # Theory blocks + exercise specs (MDX-like)
└── starter.rs       # Initial code shown in Monaco
```

`meta.yaml` structure:
```yaml
id: rust-01-ownership
title: "Ownership: The Core Model"
pillar: rust
order: 1
estimated_minutes: 30
prerequisites: []
challenge:
  type: timed
  time_limit_seconds: 300
  description: "Rewrite the function without cloning"
```

---

## API Reference

### `GET /labs`
Returns the full lab index (metadata only, no content).

### `GET /labs/:id`
Returns a single lab with full content.

### `WS /run`
Upgrade to WebSocket. Send:
```json
{ "lab_id": "rust-01-ownership", "exercise_id": "ex-3", "code": "fn main() { ... }" }
```
Receive a stream of messages:
```json
{ "type": "stdout", "data": "Hello\n" }
{ "type": "stderr", "data": "warning: unused variable\n" }
{ "type": "test", "name": "test_ownership_basic", "passed": true }
{ "type": "done", "success": true, "duration_ms": 1234 }
```

### `GET /progress`
Returns all progress for the current session.

### `POST /progress`
```json
{ "lab_id": "rust-01-ownership", "exercise_id": "ex-3", "passed": true, "score": 100 }
```

### `GET /health`
Returns `{ "status": "ok", "version": "..." }`. The frontend polls this on startup to confirm the backend is running.

---

## Progress and Gamification

Progress is stored in SQLite. The schema:

```sql
CREATE TABLE progress (
    lab_id       TEXT NOT NULL,
    exercise_id  TEXT NOT NULL,
    passed       INTEGER NOT NULL,
    attempts     INTEGER NOT NULL DEFAULT 1,
    best_score   INTEGER,
    completed_at TEXT,
    PRIMARY KEY (lab_id, exercise_id)
);
```

### Concept Unlocking

Labs define prerequisites. The frontend enforces them — locked labs are visible in the nav tree but not accessible until prerequisites are completed. This creates a dependency graph across the three pillars, allowing cross-pillar unlocks (e.g., completing a Rust memory section unlocks an OS virtual memory lab).

### Challenges

Some labs have an optional challenge mode:
- **Timed**: solve the exercise within a time limit
- **Optimization**: make the code pass a performance benchmark
- **Constraints**: no `clone()`, no `unwrap()`, must be under N lines

Challenges are optional. Completing them earns a different progress marker than basic completion. They don't gate anything — they exist for the learner who wants to go further.

---

## Configuration

Backend reads from `backend/config.toml` (or environment variables):

```toml
[server]
port = 3000
cors_origins = ["*"]   # restrict in cloud deployment

[runner]
timeout_seconds = 10
max_output_bytes = 65536
tmp_dir = "/tmp/forja"

[store]
db_path = "./forja.db"

[labs]
labs_dir = "../labs"
```

---

## Development Setup

```bash
# Backend
cd backend
cargo run

# Frontend
cd web
npm install
npm run dev
```

Both support hot reload. The backend uses `cargo-watch` optionally:
```bash
cargo install cargo-watch
cargo watch -x run
```
