# Unit Structure

The spec for how every unit in Forja is composed. Applies across all three tracks.

---

## The Rule

**Every unit = 1 BlogPost + N Action-IDEs**

The BlogPost is the narrative core. Action-IDEs are always in its service. If a unit needs two independent conceptual cores, it must split into two units — a second BlogPost is never added to the same unit.

---

## Rendering Modes

Every unit renders in one of two modes. The default is set in `meta.toml`; the student can switch at any time.

### Blog-mode — Cuaderno de Campo

The primary reading experience. Named "Cuaderno de Campo" in the UI.

- Full-bleed scrollable column, max ~680px, centered
- Light warm background (`#f8f4ef`), dark body text (`#1a1a1a`)
- Editorial prose with mixed regular/italic typography in section headers
- Dark-background code blocks contrast against the light page
- Action-IDEs embedded inline in the prose flow
- Fixed bottom bar: lab ID · status · next lab →
- Top header: `FORJA · CUADERNO DE CAMPO` + breadcrumb

Default for: D1 units and concept-heavy D2 units.

### Studio-mode — Taller

The IDE-first building experience.

- Dark panels throughout (`#0f1117`)
- Editor, output, memory visualization, portal cards as discrete panels
- Used when code work is the primary activity

Default for: action-heavy D2 units and all D3 units.

The same unit content renders in both modes. No content is exclusive to one mode.

---

## The BlogPost

One per unit. The narrative backbone.

### What it does

- Presents the one conceptual axis of the unit
- Builds the mental model from the ground up
- Explains *why* the concept matters — the invariant, the tradeoff, the machine reality
- Prepares the transition to practice: the student must be able to anticipate the experiment before doing it

### What it is not

- Not a reference page
- Not a list of API signatures
- Not an aggregation of two concepts that happen to be adjacent
- Not a container for N independent ideas

### Editorial contract

The BlogPost reads like a well-written technical essay. Each section (§ N.M) has a title that mixes regular and italic typography — the italic element names the insight. Example: "La *memoria*, observada". The narrative has a clear arc: motivation → model → practice-bridge.

Body text targets ~65 characters per line. Paragraphs open with a drop-cap large first word in longer reads. Section labels use `JetBrains Mono`, uppercase, small, muted.

---

## Closing Question — ¿Por qué así?

Every unit ends with a mandatory reflective section. It appears after the last Action-IDE, before the portal section.

```
¿Por qué así?

[Prompt: una pregunta abierta sobre la decisión de diseño central de la unidad.
No tiene respuesta correcta. Invita a razonar sobre la tradeoff.]

[ ANOTAR RESPUESTA → ]
```

The student's written answer is stored in their Cuaderno (personal notebook, local SQLite). It is not graded. It is visible on revisit — the student sees what they thought when they first encountered the concept, then what they think after returning from OS or Compilers.

This is the private record of the revelation moment.

---

## Portal Section at End of BlogPost

After the closing question, the unit surfaces its open portals as a numbered list — not as sidebar widgets but as narrative continuation.

```
Los portales abiertos

Lo que acabás de ver no es solo una regla de Rust.
Acá hay tres senderos que se abrieron con esta lección:

  i.   [TRACK · TOPIC]
       [One sentence connecting this unit to the portal destination]
       →

  ii.  [TRACK · TOPIC]
       ...

  iii. [PRACTICE · PROJECT]
       ...
```

Portals are rendered in narrative context, not as UI components bolted on after the content. The connection is spelled out in one sentence of plain prose.

---

## Action-IDE Taxonomy

Nine types. Each serves a specific pedagogical role. The type is set in the block's TOML header.

### Type 1 — Inline Action  
`type = "inline-action"`

Quick interaction embedded mid-prose. Does not interrupt the reading flow.

- Multiple choice
- True/false
- Complete a phrase
- Predict the output
- Pick between two code variants

Serves: immediate comprehension check, keeping the student active during reading.

### Type 2 — Inline Reveal  
`type = "reveal"`

A block that shows hidden content on tap. The hidden content could be: an explanation, a comparison, the compiler's reasoning, a counter-example.

```toml
[[blocks]]
type = "reveal"
trigger = "¿Qué ocurre si s1 y s2 apuntan al mismo heap al salir del scope?"
content = "Los dos llamarían a drop(). El heap se liberaría dos veces. Eso es undefined behavior — un use-after-free. Por eso Rust lo prohíbe en el análisis estático."
```

Serves: resolving anticipated doubts without breaking narrative momentum.

### Type 3 — Mini Simulator  
`type = "mini-sim"`

A lightweight interactive visualization embedded inline. The student modifies a parameter and observes a consequence in real time.

Examples: memory diagram responding to a move, a lexer tokenizing an editable string, a page table walk animated step by step.

Serves: building the causal intuition behind a concept without leaving the BlogPost.

### Type 4 — Trace / Stepper  
`type = "stepper"`

A step-by-step walkthrough of a transformation. The student advances manually through states: initial → step 1 → … → final.

Can be inline (simple) or expanded (taking up more vertical space). Rendered with `paso N / M` navigation and a figure caption below.

Serves: making transformations visible — execution steps, parsing stages, scheduler decisions.

### Type 5 — Expanded Web Action-IDE  
`type = "expanded-ide"`

A full editor + console session launched from the BlogPost via an "Abrir en Taller" button. When expanded, the student enters Studio-mode for this exercise only; on close, they return to the BlogPost.

Contains: Monaco editor, compilation output, optional memory visualization. Single-step or multi-step.

Serves: code exercises that need more vertical and cognitive space than inline actions allow. This is the primary mechanism for turning a blog-mode unit into a coding session without abandoning the narrative context.

### Type 6 — Compare Mode  
`type = "compare"`

Two versions of the same thing side by side.

Examples: `s1` vs `s1.clone()` — stack state comparison; safe vs unsafe version; simple allocator vs bump allocator.

Rust concepts in particular are often best understood by contrast. This type makes the contrast the primary teaching device.

Serves: making the *difference* the lesson rather than the individual cases.

### Type 7 — Branching Action  
`type = "branch"`

The student's choice changes the path through the content. Not a quiz with a right answer — a genuine fork where each branch shows different consequences.

Example: "¿Qué querés hacer con s1 después de esto?" → [Clonar] [Mover] [Hacer referencia] — each branch shows the code, the memory state, and the compiler's verdict.

Serves: exploring alternative design decisions in context; making the possibility space of a concept visible.

### Type 8 — Full Lab / Deep Action-IDE  
`type = "full-lab"`

A multi-step coding session tightly scoped to one concept. Multiple checkpoints, deliberate error introduction, correction, validation. Runs inside Studio-mode.

This is the action type for D2/D3 units where the practice is itself the primary learning activity.

Serves: mastery through extended deliberate practice on a single concept.

### Type 9 — Project Action  
`type = "project-action"`

Takes the student to their **local IDE** (VS Code, Zed, or any editor). Forja provides a specification and guide; the student works in their own environment on a real repository.

```toml
[[blocks]]
type = "project-action"
repo = "forja-projects/rust-core/ownership-box"
branch = "start"
objective = "Implement a Box<T> from scratch using raw pointers and GlobalAlloc"
verify = "cargo test"
estimated_time = "4h"
```

The web interface becomes a spec viewer + progress tracker while the student is working locally. On return, the student marks checkpoints manually or the test suite reports back.

Serves: professional-workflow practice — multi-file navigation, build systems, test-driven development, reading real documentation. The skills that actually matter when the course ends.

---

## Layer-Level BlogPosts

The BlogPost + Action-IDE formula applies at **every level** of the hierarchy — from the platform itself down to individual units. No level is purely navigational. Every level is a narrative.

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
  │           │   (también como recap al cerrar el módulo)
  │           │
  │           └── Unit  [BlogPost + N Action-IDEs]   ← locus principal
  │                   │
  │                   ├── BlogPost  (un eje conceptual · §N.M sections)
  │                   ├── Action-IDEs  (inline-action · reveal · mini-sim ·
  │                   │                stepper · expanded-ide · compare ·
  │                   │                branch · full-lab · project-action)
  │                   ├── ¿Por qué así?  (closing question — mandatory)
  │                   └── Portales  (narrative numbered list)

  Action-IDEs por nivel:
  Platform / Track  →  mini-sim · branch · stepper · reveal
  Course            →  stepper · mini-sim · compare
  Module            →  checkpoint · compare · mini-sim
  Unit              →  todos los tipos (full-lab y project-action: solo aquí)
```

Higher-level BlogPosts tend toward lighter Action-IDEs (`mini-sim`, `compare`, `stepper`, `branch`). Full labs and project actions live at the Unit level. But the rule is the same at every level: one conceptual axis, the narrative earns the practice.

---

### Platform BlogPost

One. Appears as the platform's entry point — the manifesto of the journey.

Purpose: explain the shape of the whole curriculum. Why four tracks? Why in this order? What is the student actually learning to do?

Contains the topology map as an interactive element: the four tracks and the portal network between them, navigable, showing where concepts converge.

Action-IDEs appropriate here:
- `mini-sim` — the four-track topology map, animated, showing portal connections
- `branch` — "¿Dónde estás ahora?" → personalizes the recommended starting point
- `stepper` — walking through what each track answers ("¿qué pregunta responde C?", "¿qué pregunta responde Rust?")

---

### Track BlogPost

One per track. Appears before the first course.

Purpose: establish the track's identity, justify its existence in the curriculum, name the question it answers.

- **C Track**: Why do we start with C? What does the machine look like without abstractions? Why is suffering the machine the pedagogical prerequisite to appreciating Rust?
- **Rust Track**: Why Rust as ground? What does Rust uniquely make possible as a foundation for Compilers and OS work?
- **Compilers Track**: What question does this track answer? ("Why does the code you write become the machine code that runs?")
- **OS Track**: What question does this track answer? ("What is the machine actually providing when your program runs?")

Action-IDEs appropriate here:
- `compare` — C dangling pointer vs. Rust compile-time rejection (at the C→Rust boundary track BlogPost)
- `mini-sim` — the track's curriculum arc as a course map
- `reveal` — "¿Por qué este orden?" — unlocking the reasoning behind the course sequence

---

### Course BlogPost

One per course. Appears before the first module.

Purpose: orientation. The student learns what zone they are entering, what questions the course answers, how the modules connect.

Format: shorter than a Unit BlogPost. A high-level map or branching exploration of the course structure is appropriate.

Questions it answers: *"¿De qué va esta parte del viaje?"* / *"¿Qué podré hacer cuando termine esto?"*

---

### Module BlogPost

One per module. Appears before the module's first unit.

Purpose: integration framing. The module's units share a common theme; the Module BlogPost names that theme and explains how the units will build on each other.

Also appears *after* the module ends as a closing integration — a brief recap that names what was consolidated and what it unlocks.

Questions it answers: *"¿Qué habilidades se consolidan aquí?"* / *"¿Cómo se conectan las unidades de este módulo?"*

Module-level Action-IDEs:
- Checkpoints (required to close the module)
- Comparison across units (mini-sim or compare block)
- Integration exercise combining two or more concepts from the module

---

## Splitting Threshold

A unit must split into two units when any of these conditions is met:

1. The BlogPost covers more than one independent conceptual axis.
2. The practice requires validating two unrelated skills — completing one doesn't prepare for the other.
3. The student must close one mental model before opening the next.
4. There are more than one "moment of revelation" — distinct instants where understanding shifts.
5. The Action-IDE sequence has lost coherence: some actions feel like they belong to a different conversation.
6. The content, on reflection, reads like two units with a transition paragraph glued between them.

**Operational complexity stays in the Action-IDE.** If a Full Lab has five steps, that's fine — it doesn't split. What triggers a split is conceptual density, not action count.

---

## D1 / D2 / D3 Applied to Unit Composition

### D1 — Foundational

- BlogPost: shorter, one model, minimal assumed knowledge
- Inline Actions and Mini Simulators
- Rendering default: Blog-mode
- Closing question: required but can be brief
- No Project Action

### D2 — Practical

- BlogPost: more technical, assumes D1 is solid, introduces edge cases
- Expanded Web Action-IDE, Compare Mode, Stepper
- Rendering default: Blog-mode or Studio-mode depending on action density
- Closing question: required
- Project Action: optional, appropriate if the concept appears in real codebases

### D3 — Deep Dive

- BlogPost: specialized, references implementation details and invariants
- Full Lab, Project Action
- Rendering default: Studio-mode
- Closing question: required; the prompt should reference the connection to Compilers or OS
- Integration with cross-track concepts expected at this level

---

## Unit meta.toml fields

```toml
[unit]
id         = "rust-c2-ownership-d1"
title      = "El gran descubrimiento"
track      = "rust-core"
course     = "C2"
module     = "2.3"
depth      = 1
render_mode = "blog"          # blog | studio
estimated_time = "25min"

[portals]
  [[portals.outbound]]
  target  = "os-b-trap-handling-d1"
  trigger = "stack-frame"
  label   = "El stack frame que ves aquí es lo que el kernel guarda en un context switch."

[closing_question]
prompt = "¿Por qué Rust eligió mover la propiedad en lugar de copiar implícitamente, usar reference counting, o garbage collection?"
```
