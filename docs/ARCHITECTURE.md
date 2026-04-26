# Architecture

## System Overview

Forja is three things that work together:

1. **A content system** — tracks, courses, and units defined as structured files on disk
2. **An execution engine** — a Rust backend that compiles and runs code, streams results, drives interactive simulations
3. **A rendering surface** — a web frontend that assembles the content, drives the editor, renders visualizations, and tracks progress

```
┌──────────────────────────────────────────────────────────────────┐
│  BROWSER                                                          │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  web/  TypeScript · Vite · Lit · Monaco                     │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │ │
│  │  │  El Bosque  │  │  El Mapa     │  │  Cuaderno         │  │ │
│  │  │  (atlas)    │  │  (topology)  │  │  / Taller         │  │ │
│  │  └─────────────┘  └──────────────┘  └───────────────────┘  │ │
│  └─────────────┬──────────────────────────────────┬────────────┘ │
└────────────────┼──────────────────────────────────┼──────────────┘
                 │ HTTP / REST                       │ WebSocket /run
                 │ content · progress                │ compiler stream
                 ▼                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│  backend/  Rust · Axum · Tokio                                    │
│                                                                   │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │  content server │  │  execution       │  │  progress store │  │
│  │                 │  │  engine          │  │                 │  │
│  │  GET /content   │  │  WS /run         │  │  SQLite         │  │
│  │  GET /lab       │  │  POST /sim/*     │  │  unit_progress  │  │
│  │                 │  │                  │  │  lab_visits     │  │
│  │  .md + .toml    │  │  spawn · stream  │  │  closing_answer │  │
│  │  files on disk  │  │  · destroy       │  │                 │  │
│  └─────────────────┘  └────────┬─────────┘  └─────────────────┘  │
└───────────────────────────────┬┴──────────────────────────────────┘
                                │
                                ▼
               ┌────────────────────────────────┐
               │  Docker container              │
               │  (ephemeral · sandboxed)       │
               │                                │
               │  gcc · valgrind · gdb          │
               │  rustc · cargo · clippy        │
               │  qemu  (RISC-V bare metal)     │
               │                                │
               │  CPU + RAM limits enforced     │
               └────────────────────────────────┘
```

---

## Content Hierarchy

Every level in the hierarchy has a BlogPost. No level is purely navigational.

```
  Platform BlogPost
  │   "el mapa completo — las cuatro ramas y la filosofía del viaje"
  │
  ├── Track BlogPost  (×4: C · Rust · Compilers · OS)
  │   │   "¿de qué va este track? ¿por qué existe en este orden?"
  │   │
  │   └── Course BlogPost  (×N per track)
  │       │   "orientación — qué preguntas responde este curso"
  │       │
  │       └── Module BlogPost  (×N per course)
  │           │   "integración — cómo se conectan las unidades"
  │           │   (también aparece como recap al cerrar el módulo)
  │           │
  │           └── Unit  [BlogPost + N Action-IDEs]   ← locus principal
  │                   │
  │                   ├── BlogPost  (un eje conceptual — §N.M sections)
  │                   ├── Action-IDEs  (inline-action · reveal · mini-sim ·
  │                   │                stepper · expanded-ide · compare ·
  │                   │                branch · full-lab · project-action)
  │                   ├── ¿Por qué así?  (closing question — mandatory)
  │                   └── Portales  (narrative numbered list)
```

Content lives on disk as `.md` + `.toml` files. Adding content means adding files — no migrations, no admin panels.

```
  content/
  ├── c/           (C Track — CC1 · CC2 · CC3)
  ├── rust/        (Rust Track — C1 through C8)
  ├── compilers/   (Compilers Track — A through E)
  ├── os/          (OS Track — A through F)
  └── integration/ (I1–I5 cross-track labs)
```

The **atomic unit of progress** is `(unit_id, depth)` — not a lab.  
Labs are the mechanism to earn depth in a unit, not the curriculum unit itself.  
The curriculum is a DAG of `(unit, depth)` nodes. Prerequisites are edges in that graph.

The skill tree renders **Courses** as the primary navigation nodes. Expanding a Course shows its Units and their depth progress.

Content lives on disk. The backend reads and serves it. The frontend renders it. Adding new content means adding new files — no database migrations, no admin panels.

---

## The Block System

A lab is a sequence of blocks. This is the core abstraction. Every block has:
- a `type` that determines which renderer handles it
- a `data` payload specific to that type
- optional `id` for progress tracking
- optional `required: true` to gate further progress

The block type registry is how the system stays extensible: new types are registered once and become available to all lab authors.

### Block Type Taxonomy

#### Universal Blocks (always available)

| Type | Description |
|------|-------------|
| `prose` | Markdown content, can embed KaTeX math, Mermaid diagrams |
| `code` | Monaco editor + backend execution. Modes: `run`, `test`, `bench` |
| `exercise` | Like `code`, but with hidden tests and a pass/fail result |
| `quiz` | Multiple choice, validated client-side |
| `fill` | Partial code with gaps the learner fills in |
| `checkpoint` | Gate: must pass the previous exercise before continuing |
| `reference` | Links to a book/paper/RFC with annotation |

#### Action-IDE Blocks (interaction taxonomy)

The block types above map to a taxonomy of nine Action-IDE types defined in [UNIT_STRUCTURE.md](UNIT_STRUCTURE.md). Additional block types completing that taxonomy:

| Type | Maps to | Description |
|------|---------|-------------|
| `reveal` | Inline Reveal | Hidden content shown on tap. Anticipates the student's next question. |
| `mini-sim` | Mini Simulator | Lightweight interactive viz inline in the prose. No backend required. |
| `stepper` | Trace / Stepper | Step-through of a transformation. Renders `paso N / M` + figure caption. |
| `expanded-ide` | Expanded Web Action-IDE | Full editor session launched from blog-mode via "Abrir en Taller". Returns to BlogPost on close. |
| `compare` | Compare Mode | Two variants side by side. Stack before/after a move. Safe vs unsafe. |
| `branch` | Branching Action | Student choice changes the content path. Shows different consequences of different decisions. |
| `full-lab` | Full Lab / Deep Action-IDE | Multi-step coding session. Multiple checkpoints. Runs in Studio-mode. |
| `project-action` | Project Action | Takes the student to their local IDE with a spec. Forja becomes a spec viewer + progress tracker. |
| `closing-question` | — | The reflective "¿Por qué así?" section at the end of every unit. Answer stored in SQLite `closing_answers`. |

For full spec of each type (pedagogical role, rendering, authoring format) see [UNIT_STRUCTURE.md](UNIT_STRUCTURE.md).

#### Cross-Track Navigation Blocks

These are first-order navigation, not decorative links. They are how the skill graph becomes a connected graph across tracks. See [PORTAL_ANCHOR_SPEC.md](PORTAL_ANCHOR_SPEC.md) for full format and rendering spec.

| Type | Description |
|------|-------------|
| `portal` | Invitation forward into another track. "If you want to understand where the borrow checker comes from, this leads to Compilers A3 — Semantic Analysis." |
| `anchor` | Return to Rust Core when stuck. "The compiler is rejecting this. Go back to Rust › Ownership D2 — now you'll understand why that concept exists." |
| `xref` | Cross-reference between OS and Compilers. "What you're implementing here has its mirror in OS B5 — Calling Conventions." |

These blocks render as visually distinct navigation elements (not plain links). When a student follows a portal or anchor, the system records the navigation context (see revisit tracking in SQLite schema).

#### Visualization Blocks (domain-specific)

Interactive, animated, or step-through components. Each is a registered Lit component that accepts structured data from the lab definition.

**Rust / Memory:**

| Type | What it shows |
|------|---------------|
| `mem-layout` | Stack frames + heap, live-updated as code runs |
| `ownership-graph` | Ownership tree and borrow arrows between values |
| `lifetime-scope` | Lexical scopes as nested boxes, lifetime ticks |
| `drop-order` | Animated drop sequence for a struct with nested fields |
| `race-detector` | Two threads, shared state, highlight potential races |

**Compilers:**

| Type | What it shows |
|------|---------------|
| `lexer-trace` | Input string → token stream, character-by-character stepping |
| `parse-tree` | Grammar rules → parse tree, node-by-node construction |
| `ast-view` | Rendered AST with collapsible nodes, source span highlighting |
| `cfg-diagram` | Control flow graph of a function (basic blocks + edges) |
| `ssa-form` | SSA transformation: original IR → versioned IR, side by side |
| `reg-alloc` | Interference graph + coloring animation |
| `ir-lowering` | AST node → IR instruction, step-by-step |

**Operating Systems:**

| Type | What it shows |
|------|---------------|
| `page-table` | Sv39 (RISC-V) or 4-level x86-64 page table walk, virtual → physical |
| `process-map` | Address space layout: text, data, heap, stack, vDSO |
| `scheduler-sim` | Timeline of processes, CPU assignment, preemption |
| `ipc-channel` | Two processes, pipe/channel between them, data flowing |
| `fs-tree` | File system tree (inode-level), block allocation on disk |
| `syscall-trace` | User-space call → kernel transition → return |
| `cache-sim` | Memory hierarchy: L1/L2/L3/RAM, hit/miss visualization |

---

## Visualization Architecture

Visualizations are the hardest part. They need to be:
- **Data-driven**: defined in the lab file, not hardcoded
- **Interactive**: the learner can step forward/backward, or manipulate state
- **Accurate**: they show what actually happens, not a simplified cartoon
- **Backend-connected (optionally)**: complex simulations can stream state from the backend

### Two Modes

**Standalone (client-only):**
The visualization component has its own state machine. The lab file provides initial data and parameters. No backend involvement. Good for: lexer stepping, AST rendering, page table walks, ownership graphs — things that are deterministic given inputs.

**Backend-driven:**
The frontend sends a step request; the backend advances the simulation and returns the new state. Good for: actual process scheduling with real timing, file system operations, anything that requires running real Rust code and observing its effects.

```
Lab file defines:
  type: scheduler-sim
  mode: backend-driven
  config:
    processes: [{ name: "proc_a", priority: 1 }, ...]
    algorithm: round-robin
    time_quantum_ms: 50

Frontend:
  1. Renders initial state from config
  2. "Step" button → POST /sim/step { sim_id, action: "next" }
  3. Backend advances sim, returns new state JSON
  4. Frontend re-renders
```

### Rendering Technology

| Use case | Technology |
|----------|------------|
| Diagrams and trees (AST, CFG, page tables) | SVG, computed layout |
| Animated flows (data moving through pipelines) | SVG + CSS transitions |
| Dense, real-time visualizations (scheduler timeline, cache sim) | Canvas via PixiJS |
| Static diagrams in prose blocks | Mermaid (rendered at load) |
| Math in theory blocks | KaTeX (fast, LaTeX subset) |

No single rendering technology. Each visualization type uses what fits. The Lit component encapsulates the choice.

---

## Frontend Architecture

### Technology

| Concern | Choice | Why |
|---------|--------|-----|
| Build | Vite | Fast HMR, native ESM, simple config |
| Language | TypeScript (strict) | Required for a codebase this large |
| Component model | Lit | Web components, reactive, no virtual DOM, small runtime |
| Code editor | Monaco | VS Code quality, Rust syntax, LSP-ready |
| Diagrams (structural) | SVG (hand-rolled or D3 for layout) | Full control over rendering |
| Animations (complex) | PixiJS | Canvas 2D/WebGL, high performance |
| Math | KaTeX | Fast, accurate, self-contained |
| Routing | History API (custom, minimal) | No need for a full router library |
| State | Lit reactive props + a signal bus | No Redux, no Zustand — too heavy |

### Component Tree

```
<forja-app>
  ├── <forja-nav>           # Left sidebar: course/unit/lab tree + progress
  ├── <forja-header>        # Breadcrumb, module title, challenge status
  └── <forja-lab-viewport>  # Main content area
        ├── <forja-block-renderer type="prose">
        │     └── (rendered Markdown + KaTeX + Mermaid)
        ├── <forja-block-renderer type="portal">
        │     └── <forja-portal-card>  # Cross-track navigation card
        ├── <forja-block-renderer type="lexer-trace">
        │     └── <forja-viz-lexer-trace> (PixiJS or SVG canvas)
        ├── <forja-block-renderer type="code">
        │     ├── <forja-editor>       # Monaco instance
        │     └── <forja-output>       # Streamed stdout/stderr/tests
        └── <forja-block-renderer type="exercise">
              ├── <forja-editor>
              └── <forja-test-results>
```

### Navigation and Routing

Routes:
```
/                          → Dashboard (pillar overview, overall progress)
/pillar/:slug              → Pillar page (course list, progress)
/course/:slug              → Course page (module list, intro)
/lab/:slug                 → Lab page (the actual learning experience)
/project/:slug             → Project overview (spec, tests, hints)
/settings                  → Backend URL, theme, preferences
```

Hash routing (`/#/lab/rust-ownership-basics`) for static hosting compatibility.

---

## Backend Architecture

### Technology

| Concern | Choice | Why |
|---------|--------|-----|
| HTTP framework | Axum | Ergonomic, async, tower middleware, excellent ecosystem |
| Async runtime | Tokio | The standard. Axum requires it. |
| Database | SQLite via sqlx | No server, no migration pain, embeds in the binary |
| Serialization | serde + serde_json | The Rust standard |
| Config | TOML via toml crate | Matches Cargo, readable |
| Logging | tracing + tracing-subscriber | Structured, async-aware |

### Module Structure

```
backend/src/
│
├── main.rs                 # Router construction, server bootstrap
├── config.rs               # Config loading (file + env vars)
│
├── api/
│   ├── mod.rs              # Route registration
│   ├── labs.rs             # GET /labs, GET /labs/:id
│   ├── run.rs              # WS /run — code execution
│   ├── sim.rs              # POST /sim/step, POST /sim/reset
│   ├── progress.rs         # GET /progress, POST /progress
│   └── health.rs           # GET /health
│
├── runner/
│   ├── mod.rs
│   ├── executor.rs         # Subprocess management, timeout, streaming
│   ├── sandbox.rs          # OS-level resource limits
│   ├── compiler.rs         # rustc / cargo invocation
│   └── validator.rs        # Test result parsing
│
├── sim/
│   ├── mod.rs
│   ├── scheduler.rs        # Process scheduler simulation
│   ├── vm.rs               # Virtual memory simulation
│   ├── lexer.rs            # Lexer step-through engine
│   └── fs.rs               # File system simulation
│
├── content/
│   ├── mod.rs
│   ├── loader.rs           # Reads lab directories from disk
│   ├── schema.rs           # Lab, Module, Block type definitions
│   └── index.rs            # In-memory content index (built at startup)
│
└── store/
    ├── mod.rs
    ├── db.rs               # sqlx pool, migration runner
    └── progress.rs         # Progress read/write operations
```

### Execution Pipeline

```
WS /run receives { lab_id, exercise_id, code }
  │
  ├─ 1. Validate: lab exists, exercise exists, code not empty
  │
  ├─ 2. Write code to temp dir: /tmp/forja/{uuid}/src/main.rs
  │       (or Cargo project skeleton if exercise requires it)
  │
  ├─ 3. Spawn: cargo build --manifest-path /tmp/forja/{uuid}/Cargo.toml
  │       with: timeout=30s, stderr captured
  │
  ├─ 4. Stream compiler output back over WebSocket
  │       { type: "compiler", data: "error[E0...]" }
  │
  ├─ 5. On build success: spawn the binary
  │       with: timeout=10s, stdout/stderr piped
  │
  ├─ 6. Stream output: { type: "stdout", data: "..." }
  │
  ├─ 7. Run exercise tests (if exercise mode):
  │       - Link test harness with the student's code
  │       - Parse test output: { type: "test", name, passed, message }
  │
  └─ 8. { type: "done", success: bool, duration_ms: u64, score: u8 }
```

### Simulation Engine

For backend-driven visualizations:

```
POST /sim/start { lab_id, exercise_id, config }
  → { sim_id: "uuid" }

POST /sim/step { sim_id, action }
  → { state: { ... visualization-specific JSON ... } }

POST /sim/reset { sim_id }
  → { state: { ... initial state ... } }
```

Each simulation type implements a trait:
```rust
trait Simulation {
    type Config: DeserializeOwned;
    type State: Serialize;
    type Action: DeserializeOwned;

    fn init(config: Self::Config) -> Self;
    fn step(&mut self, action: Self::Action) -> &Self::State;
    fn state(&self) -> &Self::State;
}
```

---

## Rendering Modes

Every unit renders in one of two modes. The student can toggle between them at any time. The default is set in `meta.toml`.

### Blog-mode — Cuaderno de Campo

The reading-first experience. Named "Cuaderno de Campo" in the UI header.

Purpose: the student encounters the concept as a narrative — a technical essay with embedded interactions. Reading is the primary activity; actions are embedded inline and do not interrupt the flow.

Layout:
- Scrollable single column, max ~680px, centered
- Light warm background (`#f8f4ef`), dark body text
- Editorial typography: large section headers mixing regular + italic, italic in accent color
- Code blocks use dark background — a deliberate contrast against the light page
- Fixed bottom bar: `[lab ID] · [status] · SIGUIENTE: [next lab] →`
- Top header: `FORJA · CUADERNO DE CAMPO` + breadcrumb

Action-IDEs in blog-mode are embedded inline. When an `expanded-ide` or `full-lab` block is reached, an "Abrir en Taller" button launches Studio-mode for that exercise only; on close, the student returns to the BlogPost at the same scroll position.

Default for: D1 units and concept-heavy D2 units. Specified via `render_mode = "blog"` in `meta.toml`.

### Studio-mode — Taller

The code-first building experience.

Purpose: the student is building. The editor, output panel, and visualizations are the primary affordances.

Layout:
- Dark panels throughout (`#0f1117`)
- Editor panel (center) + memory/viz panel (right) + output panel (bottom)
- Sidebar with course tree navigation (left, collapsible)
- Breadcrumb + step navigation in fixed topbar

Blog-mode content (prose sections) still exists in Studio-mode and renders in a left column or as collapsible sections, but it is secondary to the code experience.

Default for: action-heavy D2 units and all D3 units. Specified via `render_mode = "studio"` in `meta.toml`.

---

## Layer-Level BlogPosts

The BlogPost + Action-IDE formula applies at every level of the content hierarchy. Each Course and each Module has its own BlogPost rendered at the level-entry point.

### Course BlogPost

Rendered when the student enters a course for the first time (or revisits from the Course node in the skill tree).

Content: orientation. What zone is this? What questions does this course answer? How do the modules connect? What will the student be able to do at the end?

Format: shorter than a Unit BlogPost. An overview map (Action-IDE of type `mini-sim` or `stepper` showing the course structure) is appropriate but not required. No `closing-question`.

Files:
```
courses/rust-c2/
├── course-blog.md     # The course-level BlogPost
└── course-meta.toml
```

### Module BlogPost

Rendered at the start of a module and again as a closing integration after the last unit.

Opening content: framing. What is the theme of this module? How do the units in it build on each other?

Closing content (after last unit): integration. What skills were consolidated? What does this unlock? What would be worth revisiting from this module later?

Module-level Action-IDEs: checkpoints (required to close the module), comparison across units, mini integration exercises.

Files:
```
modules/rust-c2-m1/
├── module-blog-open.md    # Opening framing
├── module-blog-close.md   # Closing integration (rendered after last unit)
└── module-meta.toml
```

---

## Content Format

### Lab Directory Structure

```
labs/
└── rust/
    └── 02-ownership/
        ├── meta.toml          # Metadata, prerequisites, challenge config
        ├── content.md         # Ordered block definitions
        ├── theory-intro.md    # Opening theory (optional — minimum model to attempt exercises)
        ├── theory-deep.md     # Post-practice theory (optional — questions that only arise after coding)
        ├── assets/            # Images, data files for viz blocks
        │   └── ownership-diagram.svg
        ├── starter/           # Initial code for each code block
        │   ├── ex-1.rs
        │   └── ex-2.rs
        ├── tests/             # Hidden test harnesses for exercises
        │   ├── ex-1-tests.rs
        │   └── ex-2-tests.rs
        └── solution/          # Reference solutions (excluded from learner bundle)
            ├── ex-1.rs
            └── ex-2.rs
```

**Note on theory-intro / theory-deep**: These files follow the "theory appears twice" principle documented in [CONTENT_STRATEGY.md](CONTENT_STRATEGY.md). Theory-intro gives the minimum model needed to attempt the exercises. Theory-deep gives the second-pass theory — the questions that only arise after coding. Both are rendered as `prose` blocks inline in the content flow, but splitting them into separate files makes the structure explicit.

### `meta.toml`

```toml
id = "rust-02-ownership"
title = "Ownership: The Core Model"
pillar = "rust"
course = "rust-ownership"
module = "rust-memory"
unit = "ownership"
order = 2
depth = 1
estimated_minutes = 45
render_mode = "blog"        # blog | studio — default view when opening this lab
tags = ["ownership", "borrow-checker", "memory"]

[prerequisites]
units = ["rust-stack-heap"]

[portals]
# Blocks that invite the student toward another track
# (rendered as portal blocks at the relevant point in content.md)
compilers = ["compilers-semantic-analysis"]  # "where the borrow checker lives"
os = []

[challenge]
type = "constrained"
description = "Complete ex-2 without using .clone() anywhere"
constraint = "no_clone"
```

### `content.md`

Labs are written in Markdown with fenced blocks for non-prose content. The fence language tag determines the block type.

````markdown
# Ownership: The Core Model

Rust's ownership system is a static analysis that runs at compile time.
It enforces one invariant: every value has exactly one owner at any given moment.

This is not a garbage collector. There is no runtime involved.
The compiler either accepts your program or it doesn't.

```prose
**Why does this matter?** Because aliasing and mutation together are
the root cause of most memory bugs: use-after-free, data races,
iterator invalidation. Rust's type system makes this class of bug
*impossible to express*, not just unlikely.
```

```viz type="ownership-graph"
values:
  - id: s1
    type: "String"
    label: "s1"
    owner: true
  - id: s2
    type: "String"
    label: "s2"
    moved_from: s1
caption: "After `let s2 = s1;`, s1 is no longer valid."
```

When you write `let s2 = s1`, the value is **moved**. `s1` is gone.
The compiler will reject any subsequent use of `s1`.

```code id="ex-1" starter="starter/ex-1.rs" mode="run"
Try to compile and run this. Read the error carefully.
Then fix it so that both `s1` and `s2` are valid after the assignment.
```

```exercise id="ex-2" starter="starter/ex-2.rs" tests="tests/ex-2-tests.rs"
Implement `fn first_word(s: &str) -> &str` that returns a slice
of the first word in `s`, without allocating.
The function signature is fixed. Do not change it.
```

```checkpoint requires="ex-2"
The next section covers borrowing. You need to understand ownership
before borrowing makes sense. Make sure ex-2 passes before continuing.
```

```portal
target_pillar: compilers
target_unit: semantic-analysis
target_depth: 1
text: "The borrow checker is a semantic analysis pass in the Rust compiler.
       If you want to understand where it lives in the compilation pipeline
       and how it works mechanically, this leads to Compilers › Semantic Analysis."
```
````

---

## Progress and Unlocking

### Schema

```sql
-- The skill graph: every (unit, depth) node and its prerequisites
CREATE TABLE units (
    unit_id      TEXT NOT NULL,
    pillar       TEXT NOT NULL,  -- 'rust' | 'compilers' | 'os'
    course_id    TEXT NOT NULL,
    name         TEXT NOT NULL,
    depth        INTEGER NOT NULL CHECK(depth IN (1, 2, 3)),
    PRIMARY KEY (unit_id, depth)
);

CREATE TABLE unit_prerequisites (
    unit_id         TEXT NOT NULL,
    unit_depth      INTEGER NOT NULL,
    requires_id     TEXT NOT NULL,
    requires_depth  INTEGER NOT NULL,
    PRIMARY KEY (unit_id, unit_depth, requires_id, requires_depth)
);

-- A lab belongs to exactly one (unit, depth)
CREATE TABLE labs (
    lab_id       TEXT NOT NULL PRIMARY KEY,
    unit_id      TEXT NOT NULL,
    depth        INTEGER NOT NULL,
    order_in_unit INTEGER NOT NULL DEFAULT 1
);

-- Learner progress at the unit level
CREATE TABLE unit_progress (
    unit_id      TEXT NOT NULL,
    depth        INTEGER NOT NULL,
    status       TEXT NOT NULL CHECK(status IN ('locked', 'available', 'started', 'completed', 'mastered')),
    started_at   TEXT,
    completed_at TEXT,
    PRIMARY KEY (unit_id, depth)
);

-- Granular progress at the exercise level
CREATE TABLE exercise_progress (
    lab_id       TEXT NOT NULL,
    exercise_id  TEXT NOT NULL,
    passed       INTEGER NOT NULL DEFAULT 0,
    attempts     INTEGER NOT NULL DEFAULT 0,
    best_score   INTEGER,
    completed_at TEXT,
    PRIMARY KEY (lab_id, exercise_id)
);

-- Challenge attempts
CREATE TABLE challenge_results (
    unit_id       TEXT NOT NULL,
    depth         INTEGER NOT NULL,
    challenge_type TEXT NOT NULL,
    passed        INTEGER NOT NULL,
    metadata      TEXT,   -- JSON: time_ms, constraint_violations, etc.
    attempted_at  TEXT NOT NULL
);

-- Closing question answers — the student's personal notebook
CREATE TABLE closing_answers (
    lab_id       TEXT NOT NULL,
    question     TEXT NOT NULL,
    answer       TEXT NOT NULL,
    answered_at  TEXT NOT NULL,
    -- Track the state when the answer was written — used to surface "what you thought before" on revisit
    unit_context TEXT,   -- JSON: { "from_portal": null | "os-paging-1", "depth_at_time": 1 }
    PRIMARY KEY (lab_id)
);

-- Revisit tracking: records when a lab is opened and from what context
-- This is how the system knows "you revisited Ownership D2 from OS Paging"
CREATE TABLE lab_visits (
    visit_id     TEXT NOT NULL PRIMARY KEY,  -- uuid
    lab_id       TEXT NOT NULL,
    visited_at   TEXT NOT NULL,
    -- Navigation context: was this a direct visit, a portal follow, or an anchor follow?
    visit_type   TEXT NOT NULL CHECK(visit_type IN ('direct', 'portal', 'anchor', 'xref')),
    -- If portal/anchor/xref: which lab triggered the navigation
    from_lab_id  TEXT,
    from_pillar  TEXT
);
```

### Status Model

Every `(unit, depth)` node has a status:

- **`locked`**: prerequisites not met
- **`available`**: prerequisites met, not yet started
- **`started`**: learner has opened at least one lab in this (unit, depth)
- **`completed`**: all required exercises in all labs for this (unit, depth) pass
- **`mastered`**: completed + optional challenge passed

Unlock logic: a node transitions from `locked` → `available` when all its prerequisite nodes reach `completed`. Mastery is never a prerequisite for anything — it is purely optional.

### The Graph at Runtime

At startup, the backend builds the full unit graph from content on disk and the `unit_prerequisites` table. This graph is served to the frontend as a single JSON payload:

```json
{
  "nodes": [
    {
      "id": "ownership", "depth": 1, "pillar": "rust",
      "course": "rust-ownership", "name": "Ownership",
      "status": "available", "estimated_minutes": 45,
      "revisit_contexts": []
    },
    {
      "id": "ownership", "depth": 2, "pillar": "rust",
      "course": "rust-ownership", "name": "Ownership",
      "status": "locked", "estimated_minutes": 60,
      "revisit_contexts": [
        { "from_lab": "os-paging-1", "from_pillar": "os", "via": "anchor" }
      ]
    }
  ],
  "edges": [
    { "from": { "id": "ownership", "depth": 1 }, "to": { "id": "borrowing", "depth": 1 }, "type": "prerequisite" },
    { "from": { "id": "ownership", "depth": 1 }, "to": { "id": "compilers-semantic-analysis", "depth": 1 }, "type": "portal" }
  ]
}
```

Edge types:
- `prerequisite` — standard unlock dependency, same pillar
- `portal` — cross-track invitation from Rust toward Compilers/OS
- `anchor` — cross-track return from Compilers/OS toward Rust
- `xref` — mirror reference between OS and Compilers (navigable in both directions)

The `revisit_contexts` field in a node tells the student how this node has been reached before — "Revisited from OS › Paging via anchor." Shown in the skill tree tooltip.

The frontend renders this as the skill tree. Locked nodes are visible with labels and time estimates. Their labs are not loaded until status becomes `available`. Cross-track edges are rendered in a distinct style and are clickable (not just visible).

---

## API Reference

```
GET  /health                          → { status, version, content_hash }

-- Skill graph
GET  /graph                           → full unit graph (nodes + edges + learner status)
GET  /units/:id/:depth                → UnitFull (with lab list and blocks)

-- Labs
GET  /labs/:id                        → LabFull (with blocks)

-- Progress
GET  /progress                        → ProgressSummary (per-unit status counts)
POST /progress/unit                   → { unit_id, depth, status }
POST /progress/exercise               → { lab_id, exercise_id, passed, score }
POST /progress/challenge              → { unit_id, depth, challenge_type, passed, metadata }
POST /progress/visit                  → { lab_id, visit_type, from_lab_id?, from_pillar? }
POST /progress/closing-answer         → { lab_id, answer, unit_context? }
GET  /progress/closing-answer/:lab_id → { answer, answered_at, unit_context? }

-- Project Actions (local project tracking)
GET  /projects/:id                    → ProjectSpec (repo, branch, objective, verify cmd, estimated_time)
POST /projects/:id/checkpoint         → { checkpoint_id, passed }

-- Execution
WS   /run                             → Code execution stream

-- Simulations
POST /sim/start                       → { sim_id }
POST /sim/step                        → { state }
POST /sim/reset                       → { state }
```

All responses: `Content-Type: application/json`.  
CORS: `Access-Control-Allow-Origin: *` (dev) or configured origin (prod).  
No auth in local mode.

---

## Deployment Modes

### Fully Local (default)
```
localhost:5173  → frontend (npm run dev, or nginx serving dist/)
localhost:3000  → backend (cargo run)
```
The learner runs both. The frontend is just a SPA — it can also be opened as a file:// URL if the backend URL is configured in settings.

### Frontend Cloud, Backend Local
```
https://forja.dev  → frontend (static hosting: Vercel, Cloudflare Pages)
localhost:3000     → backend (learner's machine)
```
The frontend asks for the backend URL on first load (default: localhost:3000). If the backend is not reachable, the frontend shows the installation guide. This is the intended production model: the frontend is always up to date; the backend is local.

### Fully Cloud (future)
Both services in containers. Backend needs proper sandboxing (gVisor / Firecracker) for untrusted code execution. Out of scope for v1.
