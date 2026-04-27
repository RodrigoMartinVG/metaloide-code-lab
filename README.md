# Forja

> A deep learning platform for C, Rust, Compilers, and Operating Systems.  
> No shortcuts. No hand-holding. Just you, the machine, and what actually happens inside it.

---

## What This Is

**Forja** is a self-hosted, interactive learning platform for programmers who want to understand what happens below the abstractions they use every day. It covers four tracks — C, Rust, Compilers, and Operating Systems — organized as a topology with direction, not as four independent courses.

The platform is gamified in the real sense: mastery unlocks depth, challenges have real constraints, and progress is earned. Not in the fake sense: no XP bars, no daily streaks, no confetti.

---

## The Four Tracks

```
C          → La Máquina     (the physical reality without a safety net)
Rust       → El Suelo       (the model that makes the machine reasonable)
Compilers  → Destino 1      (how your code becomes machine code)
OS         → Destino 2      (what the machine provides when your program runs)
```

**C is the empirical layer — the entry point.** The student works directly on Linux with gcc, GDB, and Valgrind. Dangling pointers, use-after-free, buffer overflows, x86-64 assembly — all encountered first-hand. C is not a detour before Rust; it is the prerequisite that makes Rust's constraints legible as solutions rather than restrictions.

**Rust is the ground.** After C, ownership lands differently. The borrow checker is recognized as a static version of Valgrind. Every C bug from CC2 has an exact counterpart that Rust rejects at compile time. Rust Core can be completed standalone; Compilers and OS are destinations reachable from it.

**Compilers and OS are destinations.** Both benefit directly from the C and assembly foundations. The calling convention studied in C feeds into Compilers codegen. The stack frame analyzed in C is what the OS context switch saves and restores. Both tracks are reachable from Rust alone — but richer after C.

The second reading of a concept — first in C, then in Rust; first in Rust, then in OS or Compilers — is qualitatively different from the first. That moment of reconnection is the core pedagogical goal.

---

## The Environment

The C track and OS track require a **POSIX environment**. On Windows, this means WSL2 (Windows Subsystem for Linux). On macOS or Linux, the native terminal is sufficient.

The C track uses: `gcc`, `make`, `gdb`, `valgrind`, `objdump`, `strace`.  
The Rust track uses: `rustup`, `cargo`, and the standard Rust toolchain.  
The OS track runs bare-metal RISC-V in `qemu-system-riscv64`.  
The Compilers track produces RISC-V ELF binaries that run in the same QEMU environment.

See [docs/ONBOARDING.md](docs/ONBOARDING.md) for the full setup flow, including platform-specific instructions.

---

## How It Works

Every unit is a **BlogPost + N Action-IDEs**. The BlogPost is the narrative — one conceptual axis, built from first principles. Action-IDEs are interactive elements embedded in or launched from the prose: simulators, code editors, steppers, comparisons, branching exercises.

Learning happens in two modes:

**Cuaderno de Campo** (blog mode) — Reading-first. Warm light background, editorial prose, Action-IDEs embedded inline. Default for foundational units.

**Taller** (studio mode) — Building-first. Dark panels, Monaco editor, execution output, memory visualization. Default for practical and deep-dive units.

Every unit ends with a **¿Por qué así?** — an open reflective question about the design decision at the unit's center. The student's answer is stored privately and resurfaces when they revisit the unit after completing Compilers or OS. The second answer is different. That difference is the record of the revelation.

---

## Getting Started

### Prerequisites

A POSIX environment with:

```bash
# C track requirements
gcc --version       # gcc 12+
make --version
gdb --version
valgrind --version  # Linux only (not available on macOS natively)

# Rust track requirement
rustup --version    # install from https://rustup.rs
```

On Windows: install [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install) first, then install the above inside the WSL2 Ubuntu environment.

### Running Forja

```bash
git clone <repo-url> forja
cd forja

# Start the execution backend (Rust + Axum)
cd backend && cargo run

# Start the web frontend (in a second terminal)
cd web && npm install && npm run dev

# Open the browser
open http://localhost:5173
```

The web interface detects whether the backend is running. If it isn't, it shows the installation guide inline. The URL doesn't change.

---

## Stack

| | Technology |
|-|------------|
| Frontend | TypeScript · Vite · Lit · Monaco Editor · PixiJS · D3 · KaTeX |
| Backend | Rust · Axum · Tokio · SQLite (sqlx) |
| Content | Markdown + TOML (files on disk) |
| Execution | Docker (sandboxed, ephemeral, resource-limited containers) |
| C sandbox | gcc inside Docker, Valgrind available |
| Rust sandbox | rustc/cargo inside Docker |
| OS/Compilers | qemu-system-riscv64 inside Docker |

---

## Documentation

| Document | What it covers |
|----------|----------------|
| [Architecture](docs/ARCHITECTURE.md) | System design, block type system, rendering modes, execution pipeline, API |
| [Unit Structure](docs/UNIT_STRUCTURE.md) | BlogPost hierarchy Platform→Track→Course→Module→Unit, 9 Action-IDE types |
| [UI Design](docs/UI_DESIGN.md) | Visual language, Cuaderno de Campo spec, Taller layout, gamification |
| [Curriculum](docs/CURRICULUM.md) | Four-track topology, courses, modules, portal network overview |
| [Content Strategy](docs/CONTENT_STRATEGY.md) | Scale, sources, BlogPost contract, splitting rules, quality bar |
| [Skill Graph](docs/SKILL_GRAPH.md) | Concept × depth model, full node list, cross-track unlocks |
| [Course Map](docs/COURSE_MAP.md) | Full Track → Course → Module → Unit map for all four tracks |
| [C Track Map](docs/C_TRACK_MAP.md) | C Track: full unit content, BlogPost per layer, D-levels, portals, sources |
| [Rust Track Map](docs/RUST_TRACK_MAP.md) | Rust Track: full unit content, BlogPost per layer, D-levels, portals, sources |
| [Integration Labs](docs/INTEGRATION_LABS.md) | I1–I5: labs at track intersections |
| [Portal / Anchor Spec](docs/PORTAL_ANCHOR_SPEC.md) | PORTAL/ANCHOR/XREF block format and rendering |
| [Onboarding](docs/ONBOARDING.md) | Installation, WSL2 setup, bootstrap problem, web-detects-backend flow |
| [Milestones](docs/MILESTONES.md) | M1–M6: implementation sequence |

---

## Project Structure

```
forja/
├── web/                  # Frontend (Vite + Lit + TypeScript)
├── backend/              # Execution server (Rust + Axum)
├── content/
│   ├── c/                # C track units (meta.toml + content.md + starter/ + tests/)
│   ├── rust/             # Rust track units
│   ├── compilers/        # Compilers track units
│   ├── os/               # OS track units
│   └── integration/      # I1–I5 integration labs
└── docs/                 # Design and architecture documentation
```

---

## Philosophy

C is not in this curriculum to make the student a C developer. It is here because the machine doesn't care about abstractions, and a programmer who has never faced a dangling pointer or a use-after-free has only a theoretical understanding of why Rust's rules exist. The C track is the empirical prerequisite: you suffer the machine directly so that Rust's constraints arrive as answers to questions you already asked.

Every time Rust does something "strange" — rejects something that looks reasonable, forces you to be explicit, demands `unsafe` — there is a reason. That reason lives in processors, in kernels, in compilers. Most platforms skip the reason, or defer it indefinitely. Forja is built on the belief that the reason is the lesson.

The first time you read about ownership, it's theory. After writing a kernel allocator and breaking the stack twice, it's a revelation. The platform is designed around that second reading.

RISC-V is not the destination. It's the telescope. Once you have generated RISC-V from a compiler you wrote, and executed it on a kernel you also wrote, LLVM stops being magic and becomes the obvious solution to a problem you already lived.

The learner is treated as a capable adult who came here to understand things correctly. That assumption is not altered by difficulty.
