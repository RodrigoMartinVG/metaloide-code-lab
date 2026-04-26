# Onboarding

## The Bootstrap Problem

Forja teaches Rust. The backend that runs your code is written in Rust. To install it, you need Rust.

This is not a problem we solve elegantly — it's a problem we acknowledge honestly. The answer:

1. Install Rust via `rustup` (the pre-Forja step, covered in this document)
2. Clone the repo
3. `cargo run` in the backend directory
4. Open the browser

The first Rust you run is `cargo run` to start Forja. The first Rust you write is inside Forja. This is acceptable.

---

## The Web-Detects-Backend Flow

Forja's frontend is hosted (or run locally) at a URL. The backend is always local — it runs on your machine.

When you open the frontend for the first time:

1. The frontend loads in the browser
2. It sends a health check to `localhost:3000`
3. **If the backend is running**: the frontend transitions to the full platform immediately
4. **If the backend is not running**: the frontend shows the installation guide

The installation guide is interactive — it detects your OS, shows the right commands, and updates as you complete each step. The URL does not change. There is no redirect to a "setup" page. The same URL serves both states.

Once the backend starts and passes the health check, the frontend transitions automatically. No page reload.

---

## Installation Guide

### Step 0: Check what you already have

```bash
rustc --version    # should be >= 1.75.0
cargo --version    # should be >= 1.75.0
node --version     # should be >= 18.0.0 (for the frontend dev server)
git --version      # should be >= 2.30.0
```

If you already have all of these at the right versions, skip to Step 3.

### Step 1: Install Rust

```bash
# Linux / macOS
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Windows
# Download and run: https://win.rustup.rs/
```

After installation:
```bash
source ~/.cargo/env   # or open a new terminal
rustc --version       # verify
```

`rustup` installs Rust and keeps it updated. It also manages toolchains (nightly vs. stable). Forja uses stable.

### Step 2: Install Node.js

```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | sh
nvm install --lts
nvm use --lts

# Or via package manager:
# macOS:  brew install node
# Ubuntu: sudo apt install nodejs npm
# Windows: https://nodejs.org/en/download/
```

### Step 3: Clone and build

```bash
git clone <repo-url> forja
cd forja

# Build and start the backend
cd backend
cargo build             # first build: downloads dependencies, may take 2-3 minutes
cargo run               # starts on localhost:3000
```

The first `cargo build` compiles Forja's backend and all its dependencies. This takes a while once. After that, incremental builds are fast.

### Step 4: Start the frontend

In a second terminal:

```bash
cd forja/web
npm install             # downloads frontend dependencies
npm run dev             # starts on localhost:5173
```

### Step 5: Open the browser

```
http://localhost:5173
```

The frontend will detect the running backend and show the skill tree.

---

## Platform Notes

### macOS

Everything above works. If you get permission errors with `rustup`, check that your shell profile is sourcing `~/.cargo/env`.

QEMU (required for OS track labs): `brew install qemu`

### Linux (Ubuntu/Debian)

```bash
# System dependencies for the backend
sudo apt update
sudo apt install build-essential pkg-config libssl-dev

# QEMU for OS track
sudo apt install qemu-system-riscv64
```

### Windows

Rust on Windows requires the MSVC build tools. The `rustup` installer will prompt you to install them if they're missing (via Visual Studio Build Tools — the free version is sufficient).

QEMU on Windows: download from https://www.qemu.org/download/#windows

WSL2 is an alternative that may be simpler for the OS and Compilers tracks. The web frontend runs in your host browser; the backend and QEMU run in WSL2.

---

## Configuration

The backend reads `backend/config.toml` (or falls back to defaults):

```toml
[server]
port = 3000
host = "127.0.0.1"

[content]
labs_dir = "../labs"
projects_dir = "../projects"
integration_dir = "../integration"

[execution]
timeout_compile_s = 30
timeout_run_s = 10
max_output_bytes = 1_048_576  # 1 MB

[database]
path = "~/.forja/progress.db"
```

The database lives outside the repo directory by default, so git operations don't affect your progress.

---

## Updating

```bash
git pull

# Backend
cd backend && cargo build

# Frontend
cd web && npm install && npm run dev
```

If the database schema changed between versions, the backend runs migrations automatically on startup.

---

## Troubleshooting

**"Backend not detected" — I already ran `cargo run`**

Check that the backend started successfully (no panic in the terminal). The health check hits `localhost:3000/health`. If you changed the port in `config.toml`, update the frontend settings to match.

**Compilation errors in my lab code aren't showing**

The WebSocket connection to `/run` may have dropped. Reload the page — the connection re-establishes on load.

**I can't find my progress after an update**

Progress lives in `~/.forja/progress.db`. It is not affected by updating the repo.

**QEMU not found for OS track labs**

Install QEMU for your platform (see Platform Notes above). The backend checks for `qemu-system-riscv64` in your PATH when you start a RISC-V lab.
