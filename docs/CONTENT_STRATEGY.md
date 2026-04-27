# Content Strategy

## Scale

This curriculum is large. Not "large for an online course" — large in the sense of a graduate program compressed into self-directed study. The full content will take a serious learner 18–30 months to complete properly.

Rough scale:
- 4 tracks (C + Rust + Compilers + OS)
- C: 3 courses, Rust: 8 courses, Compilers: 5 courses, OS: 6 courses = ~22 courses total
- ~3 modules per course = ~66 modules
- ~3 units per module = ~200 units
- ~2–3 Action-IDEs per unit = ~500 Action-IDEs
- ~4 blocks per Action-IDE on average = ~2000 blocks
- 4 cross-track projects + 5 integration labs
- Hundreds of external references

Content will be developed in phases. Labs within a module can be published incrementally. Locked labs with "coming soon" state are preferable to broken or shallow labs.

---

## Sources

Forja does not invent its own explanations from scratch. It synthesizes from:

### Books (primary sources)

**C:**
- *The C Programming Language* (Kernighan, Ritchie) — K&R, the canonical reference
- *C Programming: A Modern Approach* (King) — clearest pedagogical treatment of C
- *Hacking: The Art of Exploitation* (Erickson) — for the reverse engineering and exploitation modules

**Rust:**
- *The Rust Programming Language* (Klabnik, Nichols) — canonical reference
- *Programming Rust* (Blandy, Orendorff, Tindall) — deeper, more practical
- *Rust for Rustaceans* (Gjengset) — for the advanced courses
- *The Rustonomicon* — for the unsafe course, there is no substitute

**Compilers:**
- *Crafting Interpreters* (Nystrom) — best pedagogical intro, used for the first project
- *Engineering a Compiler* (Cooper, Torczon) — the academic reference for the full pipeline
- *Modern Compiler Implementation in ML* (Appel) — for type systems and register allocation
- *Compilers: Principles, Techniques, and Tools* (Aho et al.) — "the dragon book", for specific topics

**Operating Systems:**
- *Operating Systems: Three Easy Pieces* (Arpaci-Dusseau) — free, pedagogically excellent
- *Modern Operating Systems* (Tanenbaum) — comprehensive reference
- *The Linux Programming Interface* (Kerrisk) — for the syscall-level content
- *Writing an OS in Rust* (Philipp Oppermann's blog series) — the practical Rust OS reference

**Architecture (underlying all three tracks):**
- *Computer Systems: A Programmer's Perspective* (Bryant, O'Hallaron) — CS:APP, the gold standard
- *Computer Organization and Design: RISC-V Edition* (Patterson, Hennessy) — the RISC-V reference

### Online Resources

- The Rust Reference (doc.rust-lang.org/reference)
- The Rustonomicon (doc.rust-lang.org/nomicon)
- Godbolt Compiler Explorer (for showing assembly output)
- The OSDev Wiki (for OS topics)
- RISC-V ISA specification
- Intel Software Developer Manuals (for x86 OS content, where relevant)
- Papers: relevant ACM/IEEE papers on specific topics (SSA, GC algorithms, schedulers)
- RISC-V Sv39 virtual memory specification

---

## Lab Authoring Guidelines

### What a Lab Is Not

- Not a tutorial. A tutorial tells you what to do. A lab tells you what the problem is and expects you to figure out the doing.
- Not a lecture with a quiz at the end. The theory and the practice are interleaved — you read enough to attempt the exercise, do it, then read what the result means.
- Not a copy of the book. The books are references, not scripts. Labs synthesize and reframe; they don't transcribe.

### What a Lab Is

A lab is a **guided confrontation with a specific concept**. The learner should finish it having done the thing, not having read about the thing.

Structure of a well-designed lab:
1. **The problem** — what does this concept solve? What goes wrong without it?
2. **The model** — the precise mental model, stated clearly (not simplified)
3. **The exercise** — write the code that requires using the model
4. **The consequence** — what does the result tell you? What would change if you did it differently?

Optional but valuable:
- A visualization block that makes the model concrete before the exercise
- A "go deeper" reference block at the end pointing to book sections or papers
- A challenge that extends the concept to a harder case
- A `portal` block where Rust concepts invite the student toward Compilers/OS
- An `anchor` block in OS/Compilers labs where a Rust concept is required to proceed

### The Theory-Twice Principle

**Theory appears twice in every substantive lab.** This is not optional — it is the core of how Forja teaches.

```
Theory-intro  → opens the practice. Gives the minimum model needed to attempt the exercise.
Practice      → writes code, breaks things, learns from errors.
Theory-deep   → the questions that only arise AFTER the code. The second pass.
```

The second-pass theory is the most important. It is only possible after the practice. A student who reads about the TLB before implementing a page-table walker is reading about something abstract. After breaking the implementation twice, they are reading about something they lived.

Concretely: the lab file structure supports this explicitly:

```
labs/os/02-paging/
├── theory-intro.md    ← minimum model (what is a page table? what is Sv39?)
├── content.md         ← the exercises
└── theory-deep.md     ← second-pass theory (TLB, shootdowns, huge pages, Sv48)
```

Both theory files are rendered as `prose` blocks inline in the content flow. The split is not visible to the student as a file structure — it is visible as a natural rhythm: intro → practice → debrief.

### Prohibition: No Theory of Coverage

**There is no "theory of coverage" in Forja.** This is an absolute rule.

Theory of coverage means: "we need to cover this concept, so let's put a prose block about it." Every prose block must exist because there is an exercise that needs it or follows it. Theory that is not connected to practice is not a feature — it is noise that dilutes the lab.

Before writing a theory block, ask:
- Is there an exercise in this lab that would be impossible (or meaningless) without this model?
- Does this theory make sense *now*, at this point in the lab, or only in retrospect?

If a theory block exists to "introduce" a concept that the exercises don't touch, delete it and link to the reference instead.

### Length and Scope

Each lab covers exactly one concept. If you find yourself writing "and now, another thing related to this..." — that's a second lab.

Estimated times in `meta.toml` should be honest. 45 minutes means a focused person will be done in 45 minutes. If a lab takes 3 hours, split it.

### Visualization Blocks: When to Use Them

Use a visualization when the concept has a spatial or temporal dimension that prose cannot convey efficiently. Good candidates:
- Memory layout (spatial: stack frames, heap cells)
- Process execution timeline (temporal: scheduling, preemption)
- Data transformations (lexer tokens, AST construction, IR lowering)
- Algorithms with non-obvious invariants (SSA, register coloring, page table walk)

Don't use a visualization as decoration. If the prose already makes the concept clear, a visualization adds noise.

### Portal and Anchor Blocks: When to Use Them

Use a `portal` block in a Rust lab when the concept being taught is a doorway into deeper understanding that lives in another track. Good candidates:
- Ownership → "where the borrow checker comes from" → Compilers semantic analysis
- `unsafe` → "what it means to bypass the kernel's memory model" → OS virtual memory
- Move semantics → "what the codegen actually emits" → Compilers RISC-V codegen

Use an `anchor` block in a Compilers or OS lab when the student is likely to hit a Rust concept they don't fully understand. An anchor is not a prerequisite gate — it's a navigation offer: "if you're stuck on this Rust error, here's where to go."

An anchor should be positioned at the point where the student is likely to hit the confusion — not at the beginning of the lab as a generic prerequisite warning.

### Exercise Design

Exercises should be:
- **Minimal**: solve exactly one thing. No scaffolding unless the scaffolding is the point.
- **Verifiable**: the test suite should catch wrong approaches, not just wrong outputs.
- **Instructive on failure**: a failing test should tell the learner *why* it failed, not just that it did.

Things to avoid:
- Exercises with a "trick" solution that passes the tests without understanding the concept
- Exercises that are so scaffolded the learner just fills in one line
- Exercises with multiple valid approaches where the tests only accept one

---

## The BlogPost Contract

Every unit has exactly one BlogPost. It is the narrative backbone of the unit — a technical essay with a clear conceptual axis. The rule is absolute: **one BlogPost per unit, one conceptual axis per BlogPost.**

### What "one conceptual axis" means

The BlogPost covers one idea from motivation to consequence. It can have multiple sections, multiple code examples, multiple perspectives on the same thing — but they all orbit the same central concept. When you finish reading the BlogPost, you should be able to state the concept in one sentence.

If you find yourself needing two sentences — two independent ideas, each of which could stand alone — that's two BlogPosts, which means two units.

### Editorial voice

The BlogPost reads like a carefully written technical essay, not a documentation page. It:

- Opens with the *problem* — what breaks without this concept, or what the student is about to discover
- Builds the model precisely, without simplifying to the point of being wrong
- Names the tradeoffs — Rust didn't make arbitrary decisions; each constraint has a reason in the machine
- Transitions naturally into the first Action-IDE — the student should be able to anticipate the experiment before doing it

Tone: direct, precise, no hand-holding. The student is a capable adult. Don't say "easy" or "just" or "simply". If the concept were simple, there wouldn't be a unit about it.

### Section structure in blog-mode

Sections are labeled `§ N.M` in a small monospace header. The section title uses mixed typography: a regular word + an italic word that names the insight. Examples:

```
§ 4.1  El código que *rompe*
§ 4.2  La *memoria*, observada
§ 4.3  El error, en sus *palabras*
```

The italic word is the conceptual insight. It signals what the section is about at a glance.

### The transition to Action-IDE

The transition from prose to the first interactive block must feel like a natural continuation, not a mode switch. The student should be in the middle of a thought when the code block appears — they just read *why* the problem exists, and now they're going to see it.

Before the transition, the BlogPost must have given enough context that the student can:
- State what they expect to happen
- Recognize the value of the experiment
- Understand what a successful outcome looks like

If a student could skip the BlogPost and do the exercise correctly without it, the BlogPost isn't earning its place.

---

## Splitting Threshold

A unit must split into two units when any of these conditions is met:

1. **Two conceptual axes**: The BlogPost covers more than one independent conceptual core — removing one section would leave a complete unit.
2. **Disconnected practice**: The Action-IDEs validate two unrelated skills; doing the first one doesn't prepare you for the second.
3. **Two closure moments**: The student needs to fully close one mental model before opening the next — there is a natural boundary where the first concept feels complete.
4. **Two moments of revelation**: There are two distinct instants where understanding shifts. A single unit earns one revelation.
5. **Incoherent Action-IDE sequence**: Some actions feel like they belong to a different conversation. The thread has broken.
6. **The two-unit smell**: Reading the BlogPost, you can feel the seam where two units were glued together with a transition paragraph.

**Operational complexity does not trigger a split.** A Full Lab with seven steps is fine — that's one concept practiced thoroughly. What triggers a split is conceptual density: when you need two separate mental models to understand what's happening.

---

## The Closing Question — ¿Por qué así?

Every unit ends with a mandatory reflective section. It appears after the last Action-IDE, before the portal section.

This is not a quiz. There is no correct answer. It is a prompt that asks the student to reason about the *design decision* at the center of the unit — the tradeoff Rust (or the OS, or the compiler) made, and why.

Good closing questions:
- Name a specific design decision, not a general topic
- Invite comparison with alternatives that were deliberately not chosen
- Connect to the machine reality or the language philosophy

Examples:
- "¿Por qué Rust eligió mover la propiedad en lugar de copiar implícitamente, usar reference counting, o garbage collection? ¿Qué haría cada alternativa en un contexto de sistema?"
- "¿Por qué el borrow checker analiza el grafo de flujo de control y no el árbol sintáctico? ¿Qué casos no podría detectar con el árbol?"
- "¿Por qué el kernel usa una tabla de páginas de tres niveles en lugar de una tabla plana? ¿Qué costaría la tabla plana en memoria y en tiempo?"

The student's written answer is stored in `closing_answers` in SQLite. On revisit — especially a revisit that came via a portal or anchor — the system surfaces the previous answer: *"La última vez que estuviste aquí escribiste:"* → [previous answer]. This is the private record of the revelation moment before and after.

---

## Project Action: Work in the Real Environment

Units at D2 and D3 can include a `project-action` block. This is deliberately different from everything else in Forja: it takes the student out of the browser and into their own IDE.

The project-action block provides:
- A repository reference (the student clones or opens a pre-cloned project)
- A branch to start from
- A precise technical objective
- Verification: `cargo test`, a specific test name, or a build target
- Estimated time

What Forja's web interface does while the student is working locally: it shows the spec in a readable layout and tracks self-reported checkpoints. When the student returns and marks the project complete, the unit closes.

Why this matters: the skills that actually transfer — navigating a multi-file project, reading error messages in context, using cargo, understanding a test suite — can only be practiced in a real environment. Forja's web IDE is excellent for concept-level learning; local projects are where that learning becomes professional competence.

---

## Quality Bar

*(updated)*

A lab ships when:
- All exercises have a correct solution verified by the test suite
- All exercises have been attempted by at least one person who is not the author
- The visualization blocks (if any) accurately represent the concept
- Estimated time is within 15 minutes of actual time for the target audience
- No prose says "as we saw in the previous section" (labs must be independently readable given prerequisites)
- No prose uses "easy", "simple", "obvious", "just", "trivially"
- Theory blocks are connected to exercises (theory-of-coverage check)
- Portal/anchor blocks are positioned at the right moment
- **The BlogPost has exactly one conceptual axis** (splitting threshold check — see above)
- **The closing question is present** and names a specific design decision, not a topic
- **The transition from BlogPost to first Action-IDE** would make sense to a student who hasn't read further

---

## Module Sequencing

Within a track, courses are strictly ordered. Prerequisites are enforced. The ordering is:

1. **Foundational model** — the mental model the rest builds on
2. **Core mechanics** — the main operations on that model
3. **Edge cases and invariants** — what breaks the simple model
4. **Advanced use** — applying the model at scale or under constraints
5. **Cross-track connection** — explicit portals/anchors to the other tracks

Cross-track connections are explicit. When the OS course on virtual memory references the Rust course on raw pointers, that reference is a `xref` or `anchor` block in the lab. When the Compilers course on register allocation references the OS course on calling conventions, same.

---

## Content Phases

### Phase 1: C Track (MVP entry point)
Complete C Track CC1–CC3 (toolchain, syntax, memory, pointers, heap, assembly, reverse engineering).
~22 units. The student has seen the machine directly — Valgrind, objdump, x86-64 ASM, stack frames.
Unlocks: Rust Track.

### Phase 2: Rust Core Foundation
Rust Track RC1–RC3 (tooling, types, control flow, structs, enums, memory model, ownership, borrowing, lifetimes).
~18 units. The student can write real Rust and understand why each constraint exists.
Unlocks: Compilers Track A–B.

### Phase 3: Rust Core Complete + Compilers Front End
Rust Track RC4–RC5 (type system, traits, generics, collections, error handling) + Compilers Courses A–B (lexing, parsing, semantics).
Project `rlox` unlocked.
~20 units.

### Phase 4: Concurrency + OS Foundation
Rust Track RC6–RC7 (concurrency, unsafe, no_std) + OS Courses A–C (bare metal, interrupts, memory).
Integration Labs I1 and I2 unlocked.
~18 units. Unlocks: OS Track.

### Phase 5: Full Compilers + Full OS
Rust RC8 (macros, FFI) + Compilers Courses C–E (IR, optimization, codegen arc) + OS Courses D–F (processes, FS, concurrency).
All projects unlocked. Integration Labs I3–I5 unlocked.
~40 units.

### Phase 6: Depth extensions
Deep dives beyond the main curriculum: type theory, formal verification, kernel networking, JIT compilation, persistent data structures, lock-free algorithms. Non-required "sidebar" modules for learners who want to go further.

---

## External Resource Integration

Labs can include `reference` blocks that point to specific sections of books or online resources. These are not required — they're for learners who want to go deeper after a lab.

Format in content:
````markdown
```reference
title: "TRPL § 4.1 — What Is Ownership?"
url: https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html
annotation: "The official explanation. Read this after completing ex-2 if the borrow checker model isn't fully clear."
```
````

References to books (copyrighted) link to the book's page or a freely available section, never to pirated content. For books like OSTEP that are freely available, direct links are appropriate.

