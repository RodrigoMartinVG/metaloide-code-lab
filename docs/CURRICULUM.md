# Curriculum Design

## Principles

**Depth over breadth.** Each concept is covered until it's understood, not until it's introduced. A learner who finishes Forja should be able to read the Rust compiler source, write an OS scheduler, or implement a type-checker from scratch — not because they memorized steps, but because they understand the underlying model.

**Theory and practice are inseparable.** Every theoretical concept has a corresponding lab. Every lab is grounded in a conceptual model. The learner isn't writing code to "practice" — they're writing code to verify that they understand something.

**Prerequisites are real.** The dependency graph between concepts isn't decorative. You won't understand a borrow checker without understanding stack vs. heap. You won't write a register allocator without understanding liveness analysis. The order exists for a reason.

**The learner is the expert on their own pace.** Estimated times exist as calibration, not pressure. The curriculum doesn't time out. Progress persists indefinitely.

---

## The Shape of the Curriculum

Four tracks. Not four equal pillars — a topology.

```
C          → La Máquina     (la realidad física: memoria, UB, el compilador sin red)
Rust       → El Suelo       (el modelo que hace la máquina segura y razonable)
Compilers  → Destino 1      (cómo el código se convierte en máquina)
OS         → Destino 2      (qué provee la máquina cuando tu programa corre)
```

```
  ┌──────────────────────────────────────────────────────────────┐
  │  C Track   #3fb950   LA MÁQUINA                              │
  │  CC1 (entorno · tipos) · CC2 (punteros · heap) · CC3 (asm)  │
  │  prerequisito: ninguno — punto de entrada                    │
  └───────────────────┬──────────────────────┬───────────────────┘
        portal        │                      │  portal
  use-after-free →    │                      │  asm · calling
  borrow checker      │                      │  convention
                      ▼                      │
  ┌──────────────────────────────────────┐   │
  │  Rust Track   #e05c1a   EL SUELO     │◄──┘
  │  C1 · C2 · C3 · C4 · C5 · C6 · C7   │
  │  prerequisito: C Track               │
  └──────────────────────────────────────┘
       portals ↙                  ↘ portals
  ┌────────────────┐        ┌──────────────────────┐
  │  Compilers     │        │  OS Track            │
  │  #58a6ff       │        │  #bc8cff             │
  │  DESTINO 1     │        │  DESTINO 2           │
  │  A · B · C     │        │  A · B · C · D       │
  │  D · E         │        │  E · F               │
  │  prereq:       │        │  prereq:             │
  │  Rust C1–C3    │        │  Rust C1, C2, C6, C7 │
  └────────┬───────┘        └──────────┬───────────┘
           │                           │
           └──────── xref (mirror) ────┘
               same concept, two layers

  Integration Labs I1–I5  at track intersections
```

**C is the empirical layer.** The student suffers the machine directly — dangling pointers, use-after-free, undefined behavior, Valgrind reports, x86-64 assembly output. This is not a detour. It is the prerequisite for understanding *why* Rust's constraints exist. A student who learned C first doesn't see the borrow checker as a syntax obstacle — they see it as the solution to a problem they lived.

**Rust is the ground.** After C, Rust's ownership model lands differently — not as arbitrary rules but as a precise answer to what broke in C. Rust Core can be completed standalone; Compilers and OS are destinations reachable from it. Every point where Rust can't fully explain itself (why `unsafe`? why the borrow checker?) is a portal outward.

**Compilers and OS are destinations.** Both are reachable from Rust (via portals). Both benefit directly from C foundations — the assembly module in C feeds directly into Compilers codegen and OS context-switch mechanics.

The OS↔Compilers relationship is particularly dense. Many concepts are the same concept viewed from different layers. See the mirror table below.

---

## C Track — La Máquina Desnuda

**Color**: `#3fb950` (terminal green)
**Label in UI**: `LA MÁQUINA`
**Prerequisite**: None. C is the entry point of the curriculum.
**Placement assessment**: Students with prior C experience may skip to Rust Core via assessment.

The goal is not to become a C developer. The goal is to see the machine directly — before any safety net exists — and to understand what goes wrong so that what Rust does can be understood as solution rather than restriction.

The student who finishes this track has:
- Compiled a program and read its binary anatomy
- Written a program that segfaults — and found the bug in Valgrind
- Watched a use-after-free corrupt memory at runtime
- Read the x86-64 assembly their C compiler generated
- Built a generic dynamic data structure in C with zero memory leaks

> Full unit-level detail with portals, BlogPost structure, and source references:
> see [C_TRACK_MAP.md](C_TRACK_MAP.md).

**Course CC1: El entorno y los tipos**
- Module CC1.1: El ecosistema y la cadena de compilación — entorno POSIX, gcc, objdump
- Module CC1.2: La sintaxis esencial — variables, control de flujo, funciones, arrays y strings
- Module CC1.3: El layout de memoria — Text, Data, BSS, Stack, Heap
- Module CC1.4: Tipos con consciencia de la máquina — sizeof, complemento a dos, bits, stack frame

**Course CC2: Punteros y el heap**
- Module CC2.1: El corazón de C — punteros, aritmética, arrays, strings, NULL, void*, const
- Module CC2.2: El heap manual — malloc/free/Valgrind/los errores clásicos

**Course CC3: Composición y la máquina**
- Module CC3.1: Tipos complejos — structs, alignment, unions, punteros a funciones, enum, typedef
- Module CC3.2: El preprocesador y múltiples archivos — macros, headers, include guards, compilación condicional
- Module CC3.3: El ensamblador como microscopio — registros x86-64, gcc -S, calling convention, -O0 vs -O3
- Module CC3.4: Ingeniería inversa básica — objdump, identificar lógica en ASM, parchear binarios [capstone]

Portals from C Track:
- `[CC2.2 · errores-clasicos] D2` → Rust RC3: "Escribiste un use-after-free. Rust lo hace imposible en compile time." ← PORTAL CENTRAL
- `[CC2.2 · valgrind] D2` → OS C: "malloc llama a brk/mmap. Eso es lo que el kernel provee."
- `[CC3.3 · calling-conv] D2` → Compilers E: "La ABI que leíste es lo que tu backend debe generar."
- `[CC3.3 · registers] D2` → OS D: "El context switch guarda exactamente los registros que estudiaste aquí."
- `[CC3.2 · separate-comp] D2` → Compilers A: "El linker que une .o files es la última fase del pipeline."
- `[CC3.4 · reverse-engineering] D3` → Compilers: "Leer un binario es lo que hace el linker/loader."

---

## Rust Track

**Prerequisite**: C Track completion (or placement assessment for students with prior C/systems experience).

The goal is not to learn Rust. The goal is to internalize a precise mental model of ownership, borrowing, and the relationship between types and memory — and to recognize every rule as the answer to a problem the student already lived in C.

> Full unit-level detail with portal/anchor/xref map and source coverage:
> see [RUST_TRACK_MAP.md](RUST_TRACK_MAP.md).

**Course RC1: La superficie y las herramientas**
- Module RC1.1: La cadena de herramientas — rustup, cargo, leer errores del compilador
- Module RC1.2: Variables, tipos y funciones — let/mut, tipos escalares, funciones, expresiones
- Module RC1.3: Control de flujo — if/else, loops, match, if let, let...else

**Course RC2: Structs, enums y organización**
- Module RC2.1: Structs — campos, métodos, impl, repr(C), alignment
- Module RC2.2: Enums con datos — Option, Result, máquinas de estado, discriminante
- Module RC2.3: Organización del código — módulos, crates, workspaces, regla orphan

**Course RC3: El modelo de memoria**
- Module RC3.1: Stack y heap — no es una metáfora (Box, Drop, RAII, GlobalAlloc)
- Module RC3.2: Ownership — el invariante fundamental, move semantics, Rc/Arc, NLL
- Module RC3.3: Borrowing — referencias, aliasing XOR mutation, entry API
- Module RC3.4: Lifetimes — anotaciones, elisión, structs con referencias, varianza

**Course RC4: El sistema de tipos**
- Module RC4.1: Traits — definición, implementación, blanket impls, object safety, vtable
- Module RC4.2: Generics — monomorphización, const generics, PhantomData, ZSTs
- Module RC4.3: Smart pointers — Box/Rc/Arc/RefCell/Mutex, interior mutability, Deref

**Course RC5: Colecciones y manejo de errores**
- Module RC5.1: Colecciones — Vec, String, HashMap, iterators, closures, zero-cost
- Module RC5.2: Manejo de errores — Result, ?, thiserror, anyhow

**Course RC6: Concurrencia**
- Module RC6.1: Threads y estado compartido — Send/Sync, Mutex, RwLock, channels, atomics
- Module RC6.2: Async y el modelo de ejecución — Future, Poll, Waker, Pin, executor

**Course RC7: Unsafe y el runtime mínimo**
- Module RC7.1: Unsafe Rust — los cinco superpoderes, raw pointers, transmute, MIRI
- Module RC7.2: no_std y el runtime mínimo — core vs std, #[panic_handler], GlobalAlloc

**Course RC8: Macros, FFI y Rust en el sistema**
- Module RC8.1: Macros — macro_rules!, proc macros, syn, quote
- Module RC8.2: FFI e interoperabilidad — extern "C", bindgen, build scripts, linker scripts

---

## Compilers Track

The goal is to understand the full pipeline from source text to executable code. By the end, the learner will have built a compiler for a small but non-trivial language — in Rust.

**Prerequisite**: Rust Core Courses 1–3.

**Course A: Front End**
- Module A.1: Lexing — formal languages, DFAs, hand-writing a lexer
- Module A.2: Parsing — recursive descent, Pratt parsing, error recovery
- Module A.3: The AST — design, visitor pattern, source spans
- *Lab:* Write a lexer and parser for a C-like language

**Course B: Semantics**
- Module B.1: Symbol tables and scope resolution
- Module B.2: Type checking — inference vs. annotation
- Module B.3: The Hindley-Milner algorithm
- *Lab:* Implement type inference for a lambda calculus with let-polymorphism

**Course C: Intermediate Representations**
- Module C.1: Why IRs exist; three-address code
- Module C.2: SSA form
- Module C.3: Basic blocks and control flow graphs
- *Lab:* Lower your AST to SSA form; visualize the CFG

**Course D: Optimization**
- Module D.1: Constant folding and propagation
- Module D.2: Dead code elimination
- Module D.3: Inlining: when it helps and when it hurts
- *Lab:* Implement three optimization passes; benchmark the output

**Course E: Code Generation**

The codegen arc is explicitly three phases. The student must feel the coupling before they understand the abstraction.

*Phase 1 — RISC-V direct:*
- Module E.1: Register allocation — the graph coloring problem
- Module E.2: Instruction selection on RISC-V (47 base instructions)
- Module E.3: Calling conventions and the ABI
- Module E.4: Generating ELF output; running in QEMU
- *Lab:* Generate real RISC-V assembly from your IR; link and run it in QEMU

*Phase 2 — Backend abstraction:*
- Module E.5: The coupling problem — your compiler is welded to RISC-V
- Module E.6: The `CodegenTarget` trait; implementing RISC-V and x86-64
- *Lab:* Refactor to a backend trait; add x86-64 as a second target

*Phase 3 — Industrial backends:*
- Module E.7: What Cranelift and LLVM actually solve (now you know)
- Module E.8: Using Cranelift as a backend; same source on RISC-V, x86-64, WASM
- *Lab:* Swap your backend for Cranelift; run the same program on three targets

---

## OS Track

The goal is to understand what the OS provides, why it works the way it does, and how to implement the core abstractions. Written in Rust, targeting RISC-V bare metal in QEMU.

**Note**: RISC-V is chosen intentionally. The same target as the Compilers track, which makes Integration Lab I4 possible: your compiler generates an ELF that your OS executes.

**Prerequisite**: Rust Core Courses 1, 2, 6.

**Course A: Bare Metal**
- Module A.1: The boot sequence — from power-on to your first instruction
- Module A.2: Memory-mapped I/O — writing to hardware by writing to memory
- Module A.3: RISC-V privilege modes and the machine/supervisor/user boundary
- *Lab:* Write a bare-metal Rust program that prints via UART without any OS

**Course B: Interrupts and Exceptions**
- Module B.1: Hardware interrupts vs. software exceptions
- Module B.2: The RISC-V trap mechanism
- Module B.3: Implementing a trap handler
- *Lab:* Handle a timer interrupt to implement cooperative scheduling

**Course C: Memory Management**
- Module C.1: Physical vs. virtual memory
- Module C.2: Page tables — the Sv39 RISC-V structure
- Module C.3: The TLB and why flushing it matters
- Module C.4: A physical frame allocator
- *Lab:* Implement a bitmap frame allocator; then map a new virtual page to a physical frame

**Course D: Processes**
- Module D.1: What a process is at the kernel level
- Module D.2: Context switching — saving and restoring CPU state
- Module D.3: The scheduler — round-robin first, then something smarter
- Module D.4: System calls — the transition from user space to kernel space
- *Lab:* Implement a round-robin scheduler for three kernel threads; add a priority level

**Course E: File Systems**
- Module E.1: Storage abstractions — blocks, inodes, directories
- Module E.2: The FAT filesystem — simple, universal, worth understanding
- Module E.3: Journaling — why ext4 survives crashes
- Module E.4: VFS — the abstraction layer between syscalls and drivers
- *Lab:* Implement a read-only FAT32 driver that can list a directory

**Course F: Concurrency Primitives**
- Module F.1: Spinlocks — when busy-waiting is correct
- Module F.2: Mutexes at the kernel level — blocking without user-space futexes
- Module F.3: Priority inversion and Mars Pathfinder
- Module F.4: Memory ordering — why the compiler and CPU both reorder your code
- *Lab:* Implement a sleeping mutex using your scheduler; trigger and fix a priority inversion

---

## OS ↔ Compilers Mirror Table

These are not analogies. They are the same concept viewed from two different layers. When a lab in one track touches one of these concepts, it should have an XREF block pointing to the mirror concept in the other track.

| Concept in OS | Mirror in Compilers |
|---------------|---------------------|
| Call stack (stack frames) | Calling conventions; stack frame layout that codegen produces |
| Activation frame | What the function prologue/epilogue emits |
| Context switch | Register saving — what the compiler must preserve across calls |
| Virtual memory (Sv39 / x86-64 paging) | Memory model the compiler assumes when generating code |
| Page fault handler | Runtime exceptions in the compiled program |
| ELF loader (OS loads a binary) | ELF emitter (compiler produces that binary) |
| Linker script | Relocations and symbol resolution |
| Scheduler (round-robin → CFS) | `async/await` as a user-space scheduler |
| Syscall ABI (`ecall` / `int 0x80`) | How the compiler emits system calls |
| Kernel heap allocator | The `Allocator` trait the compiler/stdlib uses |
| Interrupt handler | Exception mechanism in the language (panics, unwind) |

---

## Integration Labs

Integration Labs (I1–I5) are where the tracks converge. They are not projects (too large) and not standard labs (they span multiple tracks). They exist at track intersections.

See [INTEGRATION_LABS.md](INTEGRATION_LABS.md) for full specifications.

| Lab | Where | Prerequisites |
|-----|-------|---------------|
| I1 — The unsafe boundary | Rust + OS | Rust C6, OS C3 |
| I2 — What your compiler generates | Compilers + OS | Compilers E4, OS A3 |
| I3 — The minimal runtime | Compilers + OS | Compilers E4, OS D4 |
| I4 — Full stack own | All three | All tracks substantially complete |
| I5 — Multi-architecture | Compilers | Compilers E8 |

---

## Cross-Pillar Projects

These are the complex projects that live in `/projects`. They require completing specific courses across multiple tracks and are done entirely in the local repo.

### Project 1: `rlox` — A Lox Interpreter in Rust
*Requires: Rust Courses 1–4, Compilers Courses A–B*

Implement the tree-walking interpreter from _Crafting Interpreters_, in Rust, with proper error handling, no panics, and a test suite that you extend yourself. Then add one feature that isn't in the book.

### Project 2: `rustyc` — A Subset-C Compiler
*Requires: Compilers Courses A–E (complete)*

Compile a subset of C (integers, pointers, functions, loops) to RISC-V assembly. Output must run in QEMU. Must pass a provided test suite. No libraries allowed except `std`.

### Project 3: `irk` — A Minimal Kernel
*Requires: OS Courses A–E, Rust Course 6*

A kernel that boots on RISC-V (QEMU), manages memory, runs two concurrent processes that communicate through a shared ring buffer, and doesn't corrupt memory on a scheduler switch.

### Project 4: `broom` — A Garbage Collector
*Requires: Rust Courses 1, 2, 6; Compilers Course B (AST)*

Implement a mark-and-sweep GC in Rust using `unsafe`. It must correctly collect cycles. It must not leak. It must pass a provided stress test that allocates and drops 100,000 objects in various patterns.

---

## Progression Graph (simplified)

```
C Track (entry point — no prerequisites)
  CC1 (entorno, sintaxis, memoria, tipos)
    └─ CC2 (punteros, heap, Valgrind, errores clásicos)
         └─ CC3 (structs, preprocesador, ASM, ingeniería inversa)
              └─ CAPSTONE: estructura de datos dinámica en C

              │ ← PORTAL CENTRAL: use-after-free → Rust RC3
              ▼

Rust Track RC1 (superficie, herramientas)
  └─ RC2 (structs, enums, organización)
       └─ RC3 (modelo de memoria — ownership, borrowing, lifetimes)
            ├─ RC4 (tipos — traits, generics, smart pointers)
            │    ├─ RC5 (colecciones, error handling)
            │    └─ RC6 (concurrencia)
            │         └─ RC7 (unsafe, no_std) ──────────── Project: broom
            │              └─ RC8 (macros, FFI)
            │
            ├─ Compilers A (Front End) ────── unlocked by RC1–RC3
            │    └─ Compilers B (Semantics) ── Project: rlox (with RC4)
            │         └─ Compilers C (IR)
            │              ├─ Compilers D (Optimization)
            │              └─ Compilers E (Codegen: RISC-V → abstraction → Cranelift)
            │                   └─ Project: rustyc
            │
            └─ OS A (Bare Metal) ───────────── unlocked by RC3, RC7
                 └─ OS B (Interrupts)
                      └─ OS C (Memory)
                           └─ OS D (Processes) ── Project: irk
                                └─ OS E (File Systems)
                                     └─ OS F (Concurrency)

Integration Labs (at track intersections):
  I1 — RC7 + OS C3
  I2 — Compilers E4 + OS A
  I3 — Compilers E4 + OS D4
  I4 — all tracks (your compiler generates ELF your OS executes)
  I5 — Compilers E8 (multi-architecture)
```
