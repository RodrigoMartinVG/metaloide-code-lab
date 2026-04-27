# Forja — Claude Code Context

## What This Is

A self-hosted interactive learning platform for C, Rust, Compilers, and Operating Systems.
Two processes: `web/` (TypeScript + Vite + Lit + Monaco) and `backend/` (Rust + Axum).

## The Topology (Critical)

Four tracks. Not four equal pillars — a topology with direction.

```
C          → La Máquina     #3fb950  (la realidad física sin red de seguridad)
Rust       → El Suelo       #e05c1a  (el modelo que hace la máquina razonable)
Compilers  → Destino 1      #58a6ff  (cómo el código se convierte en máquina)
OS         → Destino 2      #bc8cff  (qué provee la máquina cuando tu programa corre)
```

**C is the empirical layer.** The student suffers the machine directly — dangling pointers, use-after-free, Valgrind reports, x86-64 assembly output. This is the prerequisite for understanding *why* Rust's constraints exist. A student who learned C first sees the borrow checker as a solution, not an obstacle.

**Rust is the ground.** After C, Rust's ownership model lands differently. Rust Core can be completed standalone; Compilers and OS are destinations reachable from it. Every point where Rust can't fully explain itself (why `unsafe`? why the borrow checker?) is a **portal** outward.

**Compilers and OS are destinations.** Both reachable from Rust. Both benefit directly from C/assembly foundations — the assembly module in C feeds directly into Compilers codegen and OS context-switch mechanics.

The second reading of a concept (first in C, then in Rust; first in Rust, then in OS or Compilers) is qualitatively different. That moment of reconnection is the core pedagogical goal.

## Documentation Index

| Document | What it covers |
|----------|----------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, block type system, rendering modes, execution pipeline, content format, full API |
| [docs/UNIT_STRUCTURE.md](docs/UNIT_STRUCTURE.md) | Full BlogPost hierarchy (Platform→Track→Course→Module→Unit), Action-IDE taxonomy, splitting threshold |
| [docs/UI_DESIGN.md](docs/UI_DESIGN.md) | Visual language, color palette, Cuaderno de Campo spec, editor config, gamification UI |
| [docs/CURRICULUM.md](docs/CURRICULUM.md) | Four tracks: C, Rust, Compilers, OS — topology, courses, modules, OS↔Compilers mirror table |
| [docs/CONTENT_STRATEGY.md](docs/CONTENT_STRATEGY.md) | Scale, sources, BlogPost contract, theory-twice principle, splitting rules, closing question, quality bar |
| [docs/SKILL_GRAPH.md](docs/SKILL_GRAPH.md) | Concept × depth model, full node list, cross-pillar unlocks |
| [docs/COURSE_MAP.md](docs/COURSE_MAP.md) | Full Track → Course → Module → Unit map for all four tracks |
| [docs/C_TRACK_MAP.md](docs/C_TRACK_MAP.md) | C Track: full unit content, BlogPost per layer, D-levels, portal/anchor map, sources |
| [docs/RUST_TRACK_MAP.md](docs/RUST_TRACK_MAP.md) | Rust Track: full unit content, BlogPost per layer, D-levels, portal/anchor/xref map, sources |
| [docs/COMPILERS_TRACK_MAP.md](docs/COMPILERS_TRACK_MAP.md) | Compilers Track: full unit content, BlogPost per layer, D-levels, anchor/xref map, sources |
| [docs/OS_TRACK_MAP.md](docs/OS_TRACK_MAP.md) | OS Track: full unit content, BlogPost per layer, D-levels, anchor/xref map, sources |
| [docs/INTEGRATION_LABS.md](docs/INTEGRATION_LABS.md) | I1–I5 integration labs where tracks converge |
| [docs/PORTAL_ANCHOR_SPEC.md](docs/PORTAL_ANCHOR_SPEC.md) | PORTAL/ANCHOR/XREF block format, rendering, skill graph appearance |
| [docs/ONBOARDING.md](docs/ONBOARDING.md) | Bootstrap problem, web-detects-backend flow, installation steps |
| [docs/MILESTONES.md](docs/MILESTONES.md) | M1–M6 implementation sequence |

## Content Hierarchy

Every level has a BlogPost. No level is purely navigational.

```
Platform    (1 — el viaje completo, las cuatro ramas)
  └── Track (4: C, Rust, Compilers, OS)
        └── Course    (3 for C, 8 for Rust, 5 for Compilers, 6 for OS)
              └── Module   (2-4 per course — groups related concepts)
                    └── Unit     (2-4 per module — one concept + its depths)
```

Each level: 1 BlogPost + optional Action-IDEs. Unit level is the primary locus of Action-IDEs. Higher levels tend toward `mini-sim`, `compare`, `stepper`, `branch`.

The skill tree renders **Courses** as the primary navigation nodes. Expanding a Course shows its Units and their progress.

## Key Architecture Decisions

**Unit structure rule**: Every unit = **1 BlogPost + N Action-IDEs**. The BlogPost is the narrative backbone (one conceptual axis). If a unit needs two conceptual cores, it splits. See [UNIT_STRUCTURE.md](docs/UNIT_STRUCTURE.md).

**Rendering modes**:
- **Blog-mode ("Cuaderno de Campo")**: Reading-first. Light warm palette (`#f8f4ef`), editorial scroll, Action-IDEs embedded inline. Topbar shows `FORJA · CUADERNO DE CAMPO`. Default for D1 units.
- **Studio-mode ("Taller")**: Building-first. Dark panels, Monaco editor, memory viz, output panel. Default for D3 units. Set via `render_mode = "blog" | "studio"` in `meta.toml`.

**Action-IDE taxonomy** (9 types, all map to block types):
- `inline-action` (quiz/fill) — quick check mid-prose
- `reveal` — hidden explanation shown on tap
- `mini-sim` — lightweight viz inline in prose
- `stepper` — step-through transformation with `paso N / M` nav
- `expanded-ide` — full editor launched from blog-mode; returns on close
- `compare` — two variants side by side (the difference is the lesson)
- `branch` — student choice changes the content path
- `full-lab` — multi-step coding session in Studio-mode
- `project-action` — takes student to local IDE with spec; Forja becomes a spec viewer

**Layer-level BlogPosts**: Each Course and each Module has its own BlogPost. Course BlogPost = orientation ("¿De qué va esta parte del viaje?"). Module BlogPost = integration framing + closing recap.

**Closing question**: Every unit ends with "¿Por qué así?" — a reflective question about the design decision at the unit's center. Student's written answer stored in `closing_answers` SQLite table. Surfaces on revisit so the student sees what they thought before and after.

**Project Action**: Explicit "work in your local IDE" block type. The student clones a real project, works in VS Code (or similar), runs tests. Forja shows the spec and tracks self-reported checkpoints. This is how professional-workflow skills are developed.

**Block system**: A lab is an ordered sequence of typed blocks. Each type maps to a registered Lit component.

Universal types: `prose`, `code`, `exercise`, `quiz`, `fill`, `checkpoint`, `reference`

Action-IDE extension types: `reveal`, `mini-sim`, `stepper`, `expanded-ide`, `compare`, `branch`, `full-lab`, `project-action`, `closing-question`

Cross-track navigation types (first-order, not decorative links):
- `portal` — invitation forward: "if you want to understand where the borrow checker comes from, this leads to Compilers A3"
- `anchor` — return to Rust Core when stuck: "if the compiler is rejecting this and you don't know why, go back to Rust › Ownership D2"
- `xref` — OS↔Compilers mirror: "what you're implementing here has its mirror in OS B5"

Visualization types: `mem-layout`, `ownership-graph`, `lexer-trace`, `parse-tree`, `ast-view`, `cfg-diagram`, `ssa-form`, `reg-alloc`, `page-table`, `scheduler-sim`, etc.

**Content on disk**: Labs are directories with `meta.toml` + `content.md` (+ optionally `theory-intro.md` / `theory-deep.md`) + `starter/` + `tests/` + `solution/`. Adding content = adding a directory.

**Execution**: WebSocket `/run`. Backend spawns sandboxed subprocess, streams `{ type, data }` JSON objects. Types: `compiler`, `stdout`, `stderr`, `test`, `done`.

**Simulations**: POST `/sim/start` → `/sim/step` → `/sim/reset`. Backend-driven state machine for complex interactive visualizations.

**Progress**: SQLite. Tables: `unit_progress`, `exercise_progress`, `challenge_results`, `lab_visits` (revisit tracking with context), `closing_answers` (reflective journal). Status: `started` → `completed` → `mastered`. Mastery requires the optional challenge.

**Auth**: None in local mode. CORS `*`.

## Compilers Track: RISC-V Arc

The Compilers track does NOT go straight to x86-64. The codegen arc is:
1. **RISC-V direct** — 47 base instructions, designed to be understood, runs in QEMU
2. **Backend abstraction** — student feels the coupling, introduces `CodegenTarget` trait
3. **Cranelift / LLVM** — now understood as the obvious solution to a problem already lived

This matters because: if the OS track uses RISC-V bare metal in QEMU, the Compilers track should generate for the same target. Integration Lab I4 (your compiler generates an ELF that your OS executes) only works if both tracks speak the same machine language.

## Integration Labs

Five labs (I1–I5) that don't belong to a single track. They exist at track intersections:
- **I1**: unsafe boundary — allocator talking directly to page tables
- **I2**: what your compiler generates — disassembly + QEMU + syscall trace
- **I3**: the minimal runtime — crt0, connecting OS loader with compiler entry point
- **I4**: full stack own — your language → your compiler → ELF → your OS loads and runs it
- **I5**: multi-architecture — Cranelift backend, same source on RISC-V/x86-64/WASM

## Tone and UX Philosophy

- Learners are treated as capable adults, not students who need encouragement
- Professional, dense aesthetic — no mascots, no confetti, no fake gamification
- Gamification = real challenges with real constraints (timed, optimization, no-clone, etc.)
- The interface is a tool. Every element earns its place.
- Pillar colors: Rust = orange `#e05c1a`, Compilers = blue `#58a6ff`, OS = purple `#bc8cff`
- Base background: `#0f1117`, accent: `#e05c1a` (forge orange)

## Content Scale

~144 labs total across ~24 modules (organized as ~8-10 Courses per track). Content developed in 5 phases.
Sources: TRPL, Programming Rust, Rust for Rustaceans, The Rustonomicon, Crafting Interpreters,
Engineering a Compiler, OSTEP, CS:APP, Writing an OS in Rust (blog series), Computer Organization and Design: RISC-V Edition, and more.

## Current State

Documentation phase. No code written yet. Next step: scaffold `backend/` and `web/`.

## Development

```bash
cd backend && cargo run         # port 3000
cd web && npm run dev           # port 5173
```
