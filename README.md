# Forja

> A deep learning platform for Rust, Compilers, and Operating Systems.  
> No shortcuts. No hand-holding. Just you, the machine, and what actually happens inside it.

---

## What This Is

**Forja** is a self-hosted, interactive learning platform built around Rust, Compiler Construction, and Operating Systems. Designed for programmers who already know how to code and want to understand what happens below the abstractions they use every day.

The platform is gamified in the real sense: mastery unlocks depth, challenges have real constraints, and progress is earned. Not in the fake sense: no XP bars, no daily streaks, no confetti.

---

## The Shape of the Project

Rust, Compilers, and OS are not three equal pillars. **Rust is the ground. Compilers and OS are destinations.**

Rust Core can be completed entirely on its own — and it's worth doing. But at every point where Rust does something surprising — prohibits something, forces you to be explicit, asks you to use `unsafe` — there is a reason. That reason lives somewhere in the machine: in how processors manage memory, in what a compiler has to know to generate correct code, in what a kernel provides to make any of it safe.

Forja is built around that insight. Every moment where Rust reveals something it can't fully explain, there is a **portal** forward to Compilers or OS. And every moment in those tracks where a student gets stuck on a Rust concept, there is an **anchor** back — not as a retreat, but as a second reading. The second time you read about ownership — after you've tried to write a kernel allocator and broken the stack twice — it's not theory anymore. It's a revelation.

That moment — the revelation — is the goal.

Rust is the map. RISC-V is the telescope. The moment everything connects is what Forja is for.

---

## How It Works

Learning happens in two modes:

**Web labs** — Theory and practice in the same interface. Monaco editor, code runs on your local backend, output streams back in real time. Some labs include interactive visualizations: step through a lexer, walk a page table, watch a scheduler make decisions.

**Repo projects** — The complex work. A specification, a test suite, constraints. You work in your editor, run tests locally. No autograder watching. The tests tell you if you're right.

---

## Getting Started

Requires Rust installed on your machine. If you don't have it:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Then:

```bash
git clone <repo-url> forja
cd forja

# Start the execution backend (Rust)
cd backend && cargo run

# Start the web frontend (in a second terminal)
cd web && npm install && npm run dev

# Open the browser
open http://localhost:5173
```

The web interface detects whether the backend is running. If it's not, it shows an installation guide. The URL doesn't change.

See [docs/ONBOARDING.md](docs/ONBOARDING.md) for the full setup flow, including the bootstrap problem (you need Rust to install a platform that teaches Rust) and platform-specific instructions.

---

## Stack

| | Technology |
|-|------------|
| Frontend | TypeScript · Vite · Lit · Monaco Editor · PixiJS · D3 · KaTeX |
| Backend | Rust · Axum · Tokio · SQLite (sqlx) |
| Content | Markdown + TOML (files on disk, no database) |

---

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — System design, block system, execution pipeline, API, content format
- [UI Design](docs/UI_DESIGN.md) — Visual language, layout, editor config, output panel, gamification mechanics
- [Curriculum](docs/CURRICULUM.md) — The three tracks in detail: courses, modules, labs, projects, progression graph
- [Content Strategy](docs/CONTENT_STRATEGY.md) — Scale, sources, lab authoring guidelines, quality bar
- [Skill Graph](docs/SKILL_GRAPH.md) — The concept × depth model, full node list, cross-pillar unlocks
- [Course Map](docs/COURSE_MAP.md) — Full Pillar → Course → Module → Unit map for all three tracks
- [Rust Core Map](docs/RUST_CORE_MAP.md) — Full unit-level detail for Rust Core: content, sources, portal/anchor/xref
- [Integration Labs](docs/INTEGRATION_LABS.md) — I1–I5: where the tracks converge
- [Portal / Anchor Spec](docs/PORTAL_ANCHOR_SPEC.md) — Cross-track navigation blocks: format and rendering
- [Onboarding](docs/ONBOARDING.md) — Installation, bootstrap problem, web-detects-backend flow
- [Milestones](docs/MILESTONES.md) — M1–M6: implementation sequence

---

## Project Structure

```
forja/
├── web/                  # Frontend (Vite + Lit + TypeScript)
├── backend/              # Execution server (Rust + Axum)
├── labs/                 # Lab content (Markdown + TOML)
│   ├── rust/
│   ├── compilers/
│   └── os/
├── integration/          # Integration labs (cross-track)
├── projects/             # Complex local projects with test suites
│   ├── rust/
│   ├── compilers/
│   └── os/
└── docs/                 # Design and architecture documentation
```

---

## Philosophy

Rust is not just the language you use in this platform. It's the map that shows you where you stand when you program.

Every time Rust does something "strange" — rejects something that looks reasonable, forces you to be explicit, asks you to reach for `unsafe` — there is a reason. A reason that lives in processors, in kernels, in compilers. Most platforms skip that reason, or leave it for later. Forja is built on the belief that the reason is the lesson.

The first time you read about ownership, it's theory. After trying to write a kernel allocator and breaking the stack three times, it's a revelation.

RISC-V is not the destination. It's the telescope. You use it to understand what "generating code" actually means. Then you understand why LLVM exists — not as magic, but as the obvious solution to a problem you already lived.

If something is confusing, the answer is more depth, not less. Labs don't hide the hard parts. Theory doesn't skip the invariants. Projects don't have training wheels.

The learner is treated as a capable adult who came here to understand things correctly. That assumption is not altered by difficulty.
