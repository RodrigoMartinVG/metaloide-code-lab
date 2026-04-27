# Skill Graph Model

## The Problem with Linear Curricula

A linear curriculum has one answer to "where do you start?": the beginning. That means
everyone — including someone who's been writing Python for 10 years and knows what a
stack frame is — sits through the same introduction to variables.

Forja's curriculum is a graph, not a list. The learner's profile tracks their level in
each concept, and unlocks are driven by that level. Someone with existing knowledge can
place themselves higher in the graph. Someone starting from zero gets a clear, deep path
from the root.

**The key invariant**: nothing is simplified to the point of being wrong. Depth 1 of any
concept is still the correct mental model — just not the complete one. You never have to
unlearn anything Forja teaches you.

---

## The Concept × Depth Model

The atomic unit of curriculum is not a lab. It's a **(unit, depth)** pair.

Every unit has up to 3 depth levels:

| Depth | What it covers |
|-------|----------------|
| 1 — Surface | What it is. How to use it. Correct but not complete. |
| 2 — Solid | Why it works this way. The invariants. What breaks it. |
| 3 — Deep | How it's implemented. The machine-level truth. Trade-offs. |

Labs are the mechanism for earning depth in a unit — not the unit of the curriculum
itself. A unit at depth 1 might be one short lab. The same unit at depth 3 might be
three labs spanning theory, implementation, and a hard exercise.

**Example: `ownership`**

- Depth 1: The ownership invariant. Move semantics. The `Copy` trait. `clone()` and when
  it's the right answer. `Drop` order. RAII pattern.
  "Every value has exactly one owner at any given moment."

- Depth 2: The borrow checker as a static analysis. Non-lexical lifetimes conceptually.
  `Rc<T>` and `Arc<T>`. Interior mutability: `Cell<T>`, `RefCell<T>`.

- Depth 3: The NLL algorithm in detail. MIR and how the borrow checker operates on it.
  Reading `--emit=mir`. Writing a safe abstraction over unsafe code.

A learner on day 1 gets depth 1. They don't need to know about MIR to understand why
`let s2 = s1` invalidates `s1`. But when they want to understand *why* the borrow checker
rejected their code, depth 2 is there. And when they want to read the compiler's output,
depth 3 is there.

---

## Content Hierarchy

```
Track (4: C, Rust, Compilers, OS)
  └── Course  (3–8 per track — the student's orientation unit)
        └── Module  (2-4 per course)
              └── Unit    (2-4 per module — one concept + its depths)
                    └── Action-IDE  (2-4 per unit — one learning interaction)
                          └── Block  (atomic content unit)
```

The skill tree renders **Courses** as the primary navigation nodes. Expanding a Course shows its Units and their depth progress. Students navigate primarily at the Course level — "I'm in Course 2: Ownership" — not at the Unit or Lab level.

---

## The Skill Tree

The full skill tree is always visible. Locked nodes show their name, estimated time, and
what they require — but their content is not accessible until prerequisites are met.

The learner sees the whole map from day 1. They know where they're going.

Cross-track edges (portals, anchors, xrefs) are rendered as navigable elements, not
just visible lines. See [UI_DESIGN.md](UI_DESIGN.md) for the visual spec.

### Tree Conventions

```
[unit-id] (depth levels available: 1-3)
  ├─ D1: unit at surface level
  ├─ D2: unit at solid level
  └─ D3: unit at deep level

→  means "completing this unlocks" (same pillar)
⇢  means "portal: this invites you toward" (cross-track)
⇠  means "anchor: this points back to" (Rust Core)
↔  means "xref: mirror concept in" (OS ↔ Compilers)
```

---

## C Track Pillar

**Entry point — no prerequisites.**

Root (always unlocked):
```
[c-toolchain]          (D1-D2)   gcc, WSL2, la cadena de compilación
[c-syntax]             (D1)      variables, tipos, control de flujo, funciones, arrays
[c-memory-layout]      (D1-D2)   secciones Text/Data/BSS/Stack/Heap, nm, readelf
[c-types-machine]      (D1-D2)   sizeof, complemento a dos, operadores de bits, stack frame
```

Tier 1 (unlocked by Root D1):
```
[c-toolchain] D1  → [c-pointers]      (D1-D3)   & y *, aritmética, arrays/strings, NULL, void*, const
[c-syntax]    D1  → [c-pointers]
```

Tier 2 (unlocked by pointers):
```
[c-pointers] D1   → [c-heap]          (D1-D2)   malloc/free/Valgrind/errores clásicos
[c-pointers] D1   → [c-structs]       (D1-D2)   structs, alignment, unions, punteros a función
[c-pointers] D1   → [c-preprocessor]  (D1-D2)   macros, headers, include guards, compilación condicional
```

Tier 3 (assembly and reverse engineering):
```
[c-structs] D1 + [c-memory-layout] D2 → [c-asm]    (D1-D2)   registros x86-64, gcc -S, calling convention
[c-asm]    D1                          → [c-reveng] (D2-D3)   objdump, lógica de control en ASM, parchear binarios
```

**[c-pointers] D2**: Arrays, strings, NULL, void*, const.
*⇢ portal: "El aritmética de punteros es la instrucción LEA" → Compilers [codegen-riscv] D1*

**[c-heap] D2**: Dangling pointer, use-after-free, buffer overflow, double free.
*⇢ portal: "Escribiste un use-after-free. Rust lo hace imposible en compile time." → Rust [ownership] D1* ← **PRIMARY PORTAL TO RUST**
*⇢ portal: "malloc llama a brk/mmap" → OS [physical-memory] D1*

**[c-asm] D2**: Calling convention — System V AMD64 ABI.
*⇢ portal: "La ABI que leíste es lo que tu backend debe generar" → Compilers [codegen-calling-conventions] D1*
*↔ xref: OS [context-switching] D1 — the OS saves exactly these registers*

**[c-reveng] D3**: Parchear un binario.
*⇢ portal: "Leer un binario es lo que hace el linker/loader" → Compilers [codegen-elf] D1*
*⇢ portal: "El loader mapea estas secciones en páginas de memoria virtual" → OS [bare-metal-boot] D1*

---

## Rust Core Pillar

**Course 1: The Memory Model**

### Root (always unlocked)
```
[tooling]            (D1-D3)
[variables-types]    (D1-D3)
[control-flow]       (D1-D3)
[functions]          (D1-D3)
```

**[tooling] D1**: `rustc` and `cargo`. `cargo new`, `build`, `run`, `check`, `clippy`, `fmt`.
Reading a compiler error. The `Cargo.toml`. What a crate is.

**[variables-types] D1**: `let`, `let mut`, type inference, type annotation.
Scalar types: `i8`–`i128`, `u8`–`u128`, `isize`, `usize`, `f32`, `f64`, `bool`, `char`.
String literals (`&str`). Shadowing. Constants (`const`, `static`).

**[control-flow] D1**: `if`/`else`. `loop`, `while`, `for in`. `break`, `continue`.
`match` with literal patterns. `if let`.

**[functions] D1**: `fn`, parameters, return types, `return`, implicit return.
Unit type `()`. Function signatures as documentation.

### Tier 1 (unlocked by Root D1)
```
Root D1 → [structs]           (D1-D3)
Root D1 → [enums-match]       (D1-D3)
Root D1 → [collections]       (D1-D3)
Root D1 → [error-handling]    (D1-D3)
Root D1 → [closures]          (D1-D3)
```

### Tier 2: Memory Model
```
[structs] D1 + [variables-types] D2 → [stack-heap]     (D1-D3)
[stack-heap] D1                     → [ownership]       (D1-D3)
[ownership] D1                      → [borrowing]       (D1-D3)
[borrowing] D1                      → [lifetimes]       (D1-D3)
[ownership] D1 + [closures] D1      → [iterators]       (D1-D3)
```

**[stack-heap] D1**: Stack vs. heap: not a metaphor, a layout. What gets allocated where.
`Box<T>` as explicit heap allocation. The `Drop` trait and RAII. Move vs. copy semantics.

**[ownership] D1**: The ownership invariant. Move semantics. The `Copy` trait.
`clone()` and when it's the right answer. `Drop` order.
*⇢ portal: "Where the borrow checker lives" → Compilers [semantic-analysis] D1*

**[ownership] D2**: The borrow checker as a static analysis. Non-lexical lifetimes
conceptually. `Rc<T>` and `Arc<T>`. Interior mutability.
*⇢ portal: "The runtime cost of Rc vs. Arc" → OS [kernel-sync] D1*

**[borrowing] D1**: Shared references (`&T`) and exclusive references (`&mut T`).
The aliasing XOR mutation invariant. Borrow checker errors: how to read them.

**[lifetimes] D1**: Lifetime annotations as names for borrow scopes.
`'a` in function signatures. Lifetime elision rules. `'static`.

**[lifetimes] D2**: Lifetime bounds on structs. Higher-ranked trait bounds.
Variance (covariance, contravariance, invariance).
The NLL algorithm: what the compiler actually computes.

### Tier 3: Type System
```
[borrowing] D1 + [enums-match] D1 → [traits]           (D1-D3)
[traits] D1                        → [generics]         (D1-D3)
[traits] D2                        → [trait-objects]    (D1-D3)
[generics] D1 + [lifetimes] D1     → [advanced-types]   (D1-D3)
```

**[traits] D1**: Trait definition and implementation. Trait bounds.
Derive macros. The standard library's key traits.
*⇢ portal: "Where traits become vtables" → Compilers [ir-basics] D1*

**[traits] D3**: Trait resolution internals. The vtable layout. Coherence.
*↔ xref: Compilers [codegen-calling-conventions] D2 — vtable is a struct of fn pointers*

### Tier 4: Concurrency
```
[ownership] D2 + [traits] D1 → [threads]           (D1-D3)
[threads] D1                  → [shared-state]      (D1-D3)
[threads] D1                  → [message-passing]   (D1-D3)
[shared-state] D2             → [atomics]           (D1-D3)
[atomics] D1                  → [async-await]       (D1-D3)
```

**[async-await] D2**: The state machine desugaring. `Pin<T>`. `Waker`. Toy executor.
*↔ xref: OS [scheduling] D2 — async/await is a user-space scheduler*

### Tier 5: Unsafe
```
[atomics] D1 + [lifetimes] D2 + [trait-objects] D1 → [unsafe]  (D1-D3)
```

**[unsafe] D1**: Raw pointers, unsafe functions, unsafe traits, mutable statics.
The contract: invariants you must maintain manually.
*⇢ portal: "What unsafe lets you do to the kernel's memory model" → OS [virtual-memory] D1*

**[unsafe] D3**: The Rustonomicon in depth. MIRI. Stacked Borrows. Allocators.
*⇢ portal: "Writing an allocator that talks to page tables" → Integration Lab I1*

---

## Compilers Pillar

Root unlock: **Rust Core Tier 1 complete + [functions] D2**

**Course A: Front End**
```
[formal-languages]    → [lexing]
[lexing]              → [parsing-rd]
[parsing-rd]          → [parsing-pratt]
[parsing-pratt]       → [ast-design]
```

**Course B: Semantics**
```
[ast-design]          → [symbol-tables]
[symbol-tables]       → [type-checking]
[type-checking]       → [hindley-milner]
```

**[type-checking] D2**: How the Rust borrow checker fits into semantic analysis.
*↔ xref: Rust [ownership] D2 — the borrow checker is a semantic analysis pass*

**Course C: IR and Optimization**
```
[ast-design]          → [ir-basics]
[ir-basics]           → [ir-ssa]
[ir-ssa]              → [dataflow]
[dataflow]            → [optimizations]
```

**Course D: Code Generation — RISC-V Arc**
```
[optimizations]       → [reg-alloc]
[ir-ssa]              → [codegen-riscv]
[codegen-riscv]       → [codegen-calling-conventions]
[codegen-calling-conventions] → [codegen-elf]
[codegen-elf]         → [codegen-backend-abstraction]
[codegen-backend-abstraction] → [codegen-cranelift]
```

**[codegen-calling-conventions] D1**: x86-64 and RISC-V calling conventions; what the
compiler must emit to interoperate.
*↔ xref: OS [context-switching] D1 — the OS saves/restores exactly these registers*

**[codegen-riscv] D1**: 47 base instructions. What "generate code" means.
Runs in QEMU. Same target as the OS track.
*↔ xref: OS [bare-metal-boot] D2 — your first instruction is what codegen produces*

**[codegen-elf] D1**: ELF sections, symbol table, relocations.
*↔ xref: OS [process-model] D1 — ELF loader loads exactly what you produce here*

---

## OS Pillar

Root unlock: **Rust Core [unsafe] D1 + [stack-heap] D2**

**Course A: Bare Metal**
```
[bare-metal-boot]        → [mmio]
[mmio]                   → [riscv-privilege-modes]
```

**[bare-metal-boot] D1**: The boot sequence on RISC-V. The handoff from BIOS/bootloader.
*↔ xref: Compilers [codegen-elf] D1 — what the loader loads is what the compiler emits*

**Course B: Interrupts and Exceptions**
```
[riscv-privilege-modes]  → [trap-mechanism]
[trap-mechanism]         → [timer-interrupts]
```

**[trap-mechanism] D2**: How interrupts relate to exceptions in compiled code.
*↔ xref: Compilers [codegen-basics] D2 — panics and unwinds are kernel mechanisms*

**Course C: Memory Management**
```
[trap-mechanism]         → [physical-memory]
[physical-memory]        → [virtual-memory]
[virtual-memory]         → [paging-sv39]
```

**[virtual-memory] D1**: Physical vs. virtual. The memory model the compiler assumes.
*↔ xref: Compilers [codegen-cranelift] D1 — memory model assumptions in code generation*
*⇠ anchor: if stuck on borrow checker errors here → Rust [ownership] D2*

**[paging-sv39] D1**: The Sv39 RISC-V page table structure.
*↔ xref: Compilers [codegen-elf] D2 — how ELF sections map to virtual addresses*

**Course D: Processes**
```
[paging-sv39]            → [process-model]
[process-model]          → [context-switching]
[context-switching]      → [scheduling]
[scheduling]             → [syscalls]
```

**[context-switching] D1**: Saving/restoring CPU state. Which registers matter.
*↔ xref: Compilers [codegen-calling-conventions] D1 — the compiler saves exactly these*

**[scheduling] D2**: The scheduler as a user-space analog.
*↔ xref: Rust [async-await] D2 — async/await is a scheduler in user space*

**[syscalls] D1**: The ecall/sret mechanism on RISC-V. The syscall ABI.
*↔ xref: Compilers [codegen-calling-conventions] D2 — how the compiler emits syscalls*

**Course E: File Systems** (from physical-memory)
```
[physical-memory]        → [file-systems-basics]
[file-systems-basics]    → [fat32]
[fat32]                  → [vfs]
```

**Course F: Concurrency Primitives** (from scheduling)
```
[scheduling]             → [kernel-sync]
[kernel-sync]            → [spinlocks]
[spinlocks]              → [sleeping-mutex]
```

**[spinlocks] D1**: When busy-waiting is correct.
*↔ xref: Rust [atomics] D2 — spinlocks are implemented with the same atomic operations*

---

## Cross-Pillar Unlocks (Full List)

```
--- C → Rust (PRIMARY) ---
C [c-heap] D2            ⇢ portal → Rust [ownership] D1          ← PRIMARY PORTAL: use-after-free → borrow checker
C [c-heap] D2            ⇢ portal → OS [physical-memory] D1       brk/mmap → kernel allocator

--- C → Compilers ---
C [c-pointers] D2        ⇢ portal → Compilers [codegen-riscv] D1  pointer arithmetic → LEA instruction
C [c-asm] D2             ⇢ portal → Compilers [codegen-calling-conventions] D1  System V AMD64 ABI → what codegen must emit
C [c-reveng] D3          ⇢ portal → Compilers [codegen-elf] D1    objdump → ELF sections/linker

--- C → OS ---
C [c-asm] D2             ↔ xref  ↔ OS [context-switching] D1      calling convention → what OS saves/restores
C [c-reveng] D3          ⇢ portal → OS [bare-metal-boot] D1       ELF sections → loader maps to pages

--- Rust → Compilers / OS ---
Rust [ownership] D1      ⇢ portal → Compilers [semantic-analysis] D1
Rust [ownership] D2      ⇢ portal → OS [kernel-sync] D1
Rust [traits] D1         ⇢ portal → Compilers [ir-basics] D1
Rust [unsafe] D1         ⇢ portal → OS [virtual-memory] D1
Rust [unsafe] D3         ⇢ portal → Integration Lab I1
Rust [async-await] D2    ↔ xref  ↔ OS [scheduling] D2

--- Compilers ↔ OS ---
Compilers [type-checking] D2     ↔ xref ↔ Rust [ownership] D2
Compilers [codegen-riscv] D1     ↔ xref ↔ OS [bare-metal-boot] D2
Compilers [codegen-calling-conventions] D1 ↔ xref ↔ OS [context-switching] D1
Compilers [codegen-elf] D1       ↔ xref ↔ OS [process-model] D1
Compilers [codegen-elf] D2       ↔ xref ↔ OS [paging-sv39] D1

--- Anchors (return to Rust from OS/Compilers) ---
OS [virtual-memory] D1   ⇠ anchor ← Rust [ownership] D2
OS [paging-sv39] D1      ⇠ anchor ← Rust [stack-heap] D2
OS [context-switching] D1 ↔ xref ↔ Compilers [codegen-calling-conventions] D1
OS [scheduling] D2       ↔ xref ↔ Rust [async-await] D2
```

---

## Integration Lab Nodes

Integration labs are a separate category in the skill graph. They don't belong to a single pillar — they live at intersections. They are nodes with prerequisites spanning multiple pillars.

```
[I1: unsafe-boundary]
  Prerequisites: Rust [unsafe] D3, OS [paging-sv39] D1
  
[I2: what-compiler-generates]
  Prerequisites: Compilers [codegen-elf] D1, OS [bare-metal-boot] D2

[I3: minimal-runtime]
  Prerequisites: Compilers [codegen-elf] D1, OS [syscalls] D1

[I4: full-stack-own]
  Prerequisites: I2, I3, OS [process-model] D2

[I5: multi-architecture]
  Prerequisites: Compilers [codegen-cranelift] D1
```

Integration labs are shown in the skill tree as distinct nodes — neither in the Rust tree, the Compilers tree, nor the OS tree. They appear in a separate "Integration" section that becomes visible once the first prerequisite cluster is within reach.

---

## Day 1 Experience

The learner opens Forja for the first time. They see:

```
Bienvenido a Forja.

Empezás por el principio: C y Linux.
No hay prerequisitos. Hay cuatro conceptos desbloqueados.

  ○ El entorno        [~25 min]  WSL2, gcc, tu primer programa en C
  ○ La cadena         [~30 min]  preprocesador → compilador → ensamblador → linker
  ○ Inspección        [~25 min]  objdump, readelf, nm — leer lo que gcc produjo
  ○ La sintaxis       [~30 min]  variables, tipos, printf, scanf

Debajo está el árbol de habilidades.
La forma de lo que vas a saber cuando termines.
```

The skill tree is rendered in full — grey nodes for locked concepts, with labels visible.
The learner sees the scope of the map from day 1: C at the root, Rust as the next layer,
Compilers and OS as destinations. Cross-track edges are visible (but dim) — the student
can see that C concepts open doors into Rust, and Rust opens doors into OS and Compilers.

---

## Progression Pacing

The graph doesn't have a fixed pace. But as a reference:

| Milestone | Approximate depth |
|-----------|------------------|
| "Reads the machine directly" | C Track CC1–CC2 complete (~40 h) |
| "Understands why Rust exists" | C Track CC1–CC3 complete (~60 h) |
| "Can write real Rust" | Rust RC1–RC2 complete after C (~40 h) |
| "Understands why Rust is the way it is" | Rust RC1–RC3 complete |
| "Can write a tree-walking interpreter" | Rust RC1-RC2 + Compilers A–B |
| "Can write a compiler to machine code" | Full Compilers track |
| "Can write OS kernel components" | Rust RC1-RC5 + Full OS track |
| "Forja complete" | All four tracks, all depths, all integration labs |

Reaching "can write real Rust" — starting from zero — takes ~100 hours total: C Track first
(~60 h), then Rust RC1-RC2 (~40 h). Someone who already knows C can start Rust directly.
The full curriculum is 500–800 hours. It is not designed to be completed quickly.
