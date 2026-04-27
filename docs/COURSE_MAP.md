# Course Map

Full Track → Course → Module → Unit map for all four tracks.

This is the navigational skeleton of the curriculum. Unit-level detail (portals, D-levels, BlogPost structure, source references) lives in each track's `*_TRACK_MAP.md`.

---

## C Track — La Máquina Desnuda

**Prerequisite**: None. C Track is the entry point of the curriculum.
**Color**: `#3fb950`

> Full unit-level detail: see [C_TRACK_MAP.md](C_TRACK_MAP.md).

### Course CC1: El entorno y los tipos
*"El compilador no es magia. Es una cadena de herramientas, y cada eslabón hace algo concreto."*

| Module | Units |
|--------|-------|
| CC1.1 El ecosistema y la cadena de compilación | El entorno — WSL2, terminal, gcc (D1); La cadena — preprocesador, compilador, ensamblador, linker (D2); Inspección — objdump, readelf, nm (D2) |
| CC1.2 La sintaxis esencial | Variables, tipos primitivos y I/O básica (D1); Control de flujo — if, while, for, switch (D1); Funciones — declaración, prototipos, recursión (D1); Arrays en el stack y strings como arrays de char (D1) |
| CC1.3 El layout de memoria | Las secciones — Text, Data, BSS, Stack, Heap (D1); Variables y sus ubicaciones (D2); El primer Makefile (D1) |
| CC1.4 Tipos con consciencia de la máquina | sizeof() y límites de tipos (D1); Complemento a dos y representación binaria (D2); Operadores de bits — flags, máscaras, protocolos (D2); Funciones y el stack frame (D2) |

Portals from CC1:
- `[layout-memoria] D1` → OS A: "Las secciones de tu binario son lo que el OS loader mapea en memoria virtual."
- `[toolchain] D2` → Compilers A: "El preprocesador, compilador, ensamblador y linker son las fases de un compilador."

### Course CC2: Punteros y el heap
*"El punto de inflexión. Sin abstracciones, solo direcciones físicas y consecuencias reales."*
*Prerequisite: CC1 complete.*

| Module | Units |
|--------|-------|
| CC2.1 El corazón de C — punteros | La dirección como valor — & y * (D1); Aritmética de punteros (D2); Arrays, strings y el decay (D2); Punteros a punteros (D3); El puntero NULL y validación (D1); void* y genericidad en C (D2); const con punteros (D1) |
| CC2.2 El heap manual | malloc, calloc, realloc — pedir memoria al OS (D1); free y el ciclo de vida (D1); Valgrind — leer reportes de leaks y segfaults (D2); Los errores clásicos — dangling, use-after-free, buffer overflow (D2) |

Portals from CC2:
- `[heap-manual] D2` → Rust C3: "Acabás de escribir un use-after-free. Rust lo hace imposible en compile time." ← **PRIMARY PORTAL TO RUST**
- `[heap-manual] D2` → OS C: "malloc llama a brk o mmap. Eso es exactamente lo que el kernel implementa."
- `[errores-clasicos] D2` → Rust C3: "Cada error clásico de C corresponde a un error que Rust rechaza en el análisis estático."

### Course CC3: Composición y la máquina
*"Cómo C organiza la memoria compleja — y cómo el compilador traduce todo esto a instrucciones reales."*
*Prerequisite: CC2 complete.*

| Module | Units |
|--------|-------|
| CC3.1 Tipos complejos | Structs y alignment (D1); Unions (D2); Punteros a funciones — callbacks y polimorfismo primitivo (D2); enum: tipos enumerados y valores simbólicos (D1); typedef: nombres para tipos (D1) |
| CC3.2 El preprocesador y múltiples archivos | Macros — #define, macros con parámetros, peligros (D1); Compilación separada — headers, include guards, extern, static (D2); Compilación condicional — #ifdef, #ifndef, #if (D1) |
| CC3.3 El ensamblador como microscopio | Registros x86-64 — RAX, RSP, RDI y familia (D1); gcc -S — generación y lectura de ASM (D1); La calling convention — System V AMD64 ABI (D2); -O0 vs -O3 — el compilador reescribe tu lógica (D2) |
| CC3.4 Ingeniería inversa básica | objdump -d y la lectura de binarios (D2); Identificar lógica de control en ASM (D2); Parchear un binario — el lab ético (D3) |

Portals from CC3:
- `[calling-conv] D2` → Compilers E: "La ABI System V que estudiaste es lo que tu backend de código debe generar."
- `[registers] D2` → OS D: "El context switch guarda exactamente los registros que viste aquí — RSP, RAX, los caller-saved."
- `[fn-pointers] D2` → Rust C4: "Los punteros a función de C son la base de las vtables y los trait objects de Rust."
- `[asm-reading] D2` → Compilers E: "Leer el ASM que genera gcc te da intuición sobre lo que tu codegen debería producir."
- `[preprocessor] D1` → Compilers A: "El preprocesador es la primera fase del pipeline de compilación que tu compilador va a implementar."
- `[separate-comp] D2` → Compilers A: "El linker que une los .o files es la última fase del pipeline."
- `[reverse-eng] D3` → Compilers: "Parsear un binario es lo que el linker y el loader hacen antes de ejecutar."

**Capstone: Proyecto final — Estructura de datos dinámica y genérica**
Implementar un `Vector` dinámico o `HashMap` básico en C:
- Memoria dinámica agresiva
- Datos genéricos con `void*`
- `Makefile` propio
- Pruebas automatizadas
- Cero fugas — reporte limpio de Valgrind obligatorio

---

## Rust Core

**Prerequisite**: C Track completion (or placement assessment).
**Color**: `#e05c1a`

> Full unit-level detail with canonical references, portal/anchor/xref map, and source coverage:
> see [RUST_TRACK_MAP.md](RUST_TRACK_MAP.md).

### Course 1: Surface and Tooling
*"The student can write, compile, and reason about simple Rust programs."*

| Module | Units |
|--------|-------|
| 1.1 Tooling | rustup/cargo/ecosystem (D1), The compiler as a thinking tool (D2) |
| 1.2 Variables, Types, Functions | Variables and mutability (D1), Compound types and functions (D1), What the compiler does with variables (D3) |
| 1.3 Control Flow | Conditionals and loops (D1), Pattern matching (D1) |

Portals from this course:
- `[tooling] D2` → OS: "The compiler produces binaries. The OS executes them."
- `[tooling] D2` → Compilers: "cargo invokes rustc with flags. Your compiler will also have a CLI."

### Course 2: Structs, Enums, and Organization
*"Model data precisely. Think in types, not values."*

| Module | Units |
|--------|-------|
| 2.1 Structs | Structs basics (D1), Structs under the microscope — alignment, repr (D2) |
| 2.2 Enums and Pattern Matching | Enums with data (D1), Enums as state machines — discriminant, MIR (D2) |
| 2.3 Code Organization | Modules, crates, packages (D1), Workspaces and real scale (D2) |

Portals from this course:
- `[structs] D2` → OS: "Rust structs have a memory layout. The OS sees them as bytes."
- `[structs] D2` → Compilers: "The struct layout is what your codegen must respect."
- `[enums-match] D1` → Compilers: "Your lexer returns a Token enum. Your parser matches it exhaustively."

### Course 3: The Memory Model
*"The most important course in the track. Everything else is built on this."*
*Prerequisite: Courses 1–2 complete.*

| Module | Units |
|--------|-------|
| 3.1 Stack and Heap | Not a metaphor — physical reality (D1), The activation frame (D2), The allocator — GlobalAlloc, bump alloc (D3) |
| 3.2 Ownership | The fundamental invariant (D1), Shared ownership — Rc/Arc/Weak (D2), The borrow checker as analysis — NLL, polonius (D3) |
| 3.3 Borrowing | References and the aliasing contract (D1), Borrowing in practice — two-phase, entry() (D2) |
| 3.4 Lifetimes | Lifetimes as scope names (D1), Advanced lifetimes — variance, HRTB (D2) |

Portals from this course:
- `[stack-heap] D2` → OS: "The activation frame — what the OS saves/restores in context switches"
- `[stack-heap] D3` → OS: "Your bump allocator is what the kernel implements for the heap"
- `[ownership] D2` → Compilers: "Your AST will use Rc/Arc to share nodes"
- `[ownership-borrow-checker] D3` → Compilers: "The borrow checker is a dataflow analysis on the CFG"
- `[lifetimes] D2` → OS: "The OS manages resource lifetimes manually. Lifetimes do this statically."

Xrefs from this course:
- `[stack-heap] D2` ↔ OS `[context-switching] D1`: activation frame = what the OS saves/restores

### Course 4: The Type System
*"Use the type system to make invalid states unrepresentable."*
*Prerequisite: Course 3 complete.*

| Module | Units |
|--------|-------|
| 4.1 Traits | Shared behavior (D1), Trait system in depth — orphan rule, object safety (D2), How the compiler resolves traits — vtable, monomorphization (D3) |
| 4.2 Generics | Generics and monomorphization (D1), Advanced generics — const generics, GATs, ZSTs (D2) |
| 4.3 Smart Pointers | The smart pointer zoo (D1), Interior mutability pattern — UnsafeCell, Deref (D2) |

Portals from this course:
- `[traits] D3` → Compilers: "The vtable is a table of function pointers. Your codegen emits it."

Xrefs from this course:
- `[traits] D3` ↔ Compilers `[codegen-calling-conventions] D2`: vtable = struct of function pointers

### Course 5: Collections and Error Handling
*"Write idiomatic Rust that handles failures correctly."*

| Module | Units |
|--------|-------|
| 5.1 Collections | Vec, String, HashMap (D1), Iterators and closures (D1), Iterators as zero-cost abstraction (D2) |
| 5.2 Error Handling | Result and the error flow (D1), Idiomatic error handling — thiserror, anyhow (D2) |

### Course 6: Concurrency
*"The type system as a race condition detector."*
*Prerequisite: Courses 3–4 complete.*

| Module | Units |
|--------|-------|
| 6.1 Threads and Shared State | Threads and the type system — Send/Sync (D1), Mutex/RwLock/channels (D1), Lock-free concurrency — atomics, Ordering (D2) |
| 6.2 Async and the Execution Model | async/await surface (D1), The runtime and the executor — state machine, Pin, Waker (D2) |

Portals from this course:
- `[atomics] D2` → OS: "Spinlocks in the kernel are built on the same atomic operations."
- `[async-await] D2` → OS: "An executor is a user-space scheduler. The kernel has one in ring 0."
- `[async-await] D2` → Compilers: "async/await is a compiler transformation — your function becomes a state machine."

Xrefs from this course:
- `[async-await] D2` ↔ OS `[scheduling] D2`: executor = user-space scheduler
- `[atomics] D2` ↔ OS `[spinlocks] D1`: same atomic operations, different layer

### Course 7: Unsafe and the Minimum Runtime
*"unsafe doesn't disable the rules. It means you're taking responsibility for them."*
*Prerequisite: Courses 3, 4, 6 complete.*

| Module | Units |
|--------|-------|
| 7.1 Unsafe Rust | What unsafe enables (D1), Raw pointers and transmute (D2), Undefined Behavior and MIRI — Stacked Borrows (D3) |
| 7.2 no_std and the Minimum Runtime | Rust without stdlib — no_std, core (D1), The Allocator trait and the heap — no_std allocator (D2) |

Portals from this course:
- `[unsafe] D3` → OS: "The entire kernel lives in unsafe."
- `[no-std] D1` → OS: "This is the entry point to the OS track. OS Course A starts here." ← PRIMARY PORTAL
- `[no-std] D2` → OS: "The allocator you implement here is what the kernel provides."
- `[unsafe] D3` → Integration Lab I1

### Course 8: Macros, FFI, and Rust in the System
*"Rust as a systems tool: interoperability, metaprogramming, build system."*
*Prerequisite: Courses 4, 7.*

| Module | Units |
|--------|-------|
| 8.1 Macros | Declarative macros (D1), Procedural macros — proc_macro2, syn, quote (D2) |
| 8.2 FFI and Interoperability | Calling C from Rust and Rust from C (D1), Build scripts and the linker — linker scripts, link_section (D2) |

Portals from this course:
- `[proc-macros] D2` → Compilers: "Procedural macros receive a TokenStream and return a TokenStream. Same idea as your lexer."
- `[ffi-linker] D2` → OS: "Linker scripts control where the OS places your code in memory."
- `[ffi-linker] D2` → Compilers: "The linker is the last step of your compiler."

Xrefs from this course:
- `[ffi-linker] D2` ↔ Compilers `[codegen-elf] D2`: linker scripts = what the ELF emitter produces

---

## Compilers Track

> Full unit-level detail with canonical references, anchor/xref map, and source coverage:
> see [COMPILERS_TRACK_MAP.md](COMPILERS_TRACK_MAP.md).

**Prerequisite**: Rust Core Courses 1–3 complete.

### Course A: Front End
*"From source text to a structured representation."*

| Module | Units |
|--------|-------|
| A.1 Lexing | Formal languages and regular grammars (D1-D2), DFAs and NFAs (D2-D3), Hand-writing a lexer (D1-D3) |
| A.2 Parsing | Recursive descent (D1-D2), Pratt parsing (D1-D2), Error recovery (D2-D3) |
| A.3 The AST | AST design principles (D1-D2), Visitor pattern vs. match (D1-D2), Source spans (D1-D2) |

### Course B: Semantics
*"What the program means, not just what it says."*

| Module | Units |
|--------|-------|
| B.1 Symbol Tables | Scope resolution (D1-D2), Name resolution multi-pass (D2-D3) |
| B.2 Type Checking | Type inference (D1-D2), Annotation vs. inference (D1-D2) |
| B.3 Type Inference | Hindley-Milner (D2-D3), Unification (D3) |

Xrefs from this course:
- `[type-checking] D2` ↔ Rust `[ownership] D2`: borrow checker as semantic analysis

### Course C: Intermediate Representations
*"Why compilers don't compile directly from the AST."*

| Module | Units |
|--------|-------|
| C.1 IR Basics | Why IRs exist (D1), Three-address code (D1-D2) |
| C.2 SSA Form | SSA construction (D1-D2), Phi nodes (D2-D3) |
| C.3 Control Flow | Basic blocks (D1-D2), CFG construction (D1-D2), Dataflow analysis (D2-D3) |

### Course D: Optimization
*"Making the generated code faster without changing what it does."*

| Module | Units |
|--------|-------|
| D.1 Local Optimizations | Constant folding/propagation (D1-D2), Dead code elimination (D1-D2) |
| D.2 Global Optimizations | Inlining (D1-D2), Loop optimizations (D2-D3) |
| D.3 Benchmarking | Measuring optimization impact (D1-D2) |

### Course E: Code Generation — The RISC-V Arc
*"Phase 1: generate code. Phase 2: feel the coupling. Phase 3: abstract it."*

**Phase 1 — RISC-V direct:**

| Module | Units |
|--------|-------|
| E.1 Register Allocation | Interference graphs (D1-D2), Graph coloring (D2-D3) |
| E.2 Instruction Selection | Pattern matching on IR (D1-D2), RISC-V instruction set (D1-D2) |
| E.3 Calling Conventions | RISC-V ABI (D1-D2), Stack frame layout (D1-D2) |
| E.4 ELF Output | ELF sections and symbols (D1-D2), Relocations (D2-D3) |

Xrefs from Phase 1:
- E.2 ↔ OS A: "Your first instruction is what codegen produces"
- E.3 ↔ OS D: "The OS saves exactly the registers you declare in your calling convention"
- E.4 ↔ OS D: "ELF loader loads exactly what you produce here"

**Phase 2 — Backend abstraction:**

| Module | Units |
|--------|-------|
| E.5 The Coupling Problem | Why your RISC-V compiler can't easily target x86-64 (D1-D2) |
| E.6 CodegenTarget Trait | Designing the abstraction (D1-D2), Two implementations (D2-D3) |

**Phase 3 — Industrial backends:**

| Module | Units |
|--------|-------|
| E.7 What Cranelift Solves | Cranelift's design and why it exists (D1-D2) |
| E.8 Using Cranelift | Cranelift API, multi-target output (D1-D3) |

---

## OS Track

> Full unit-level detail with canonical references, anchor/xref map, and source coverage:
> see [OS_TRACK_MAP.md](OS_TRACK_MAP.md).

**Prerequisite**: Rust Core Courses 1, 2, 6 complete.

**Note**: This track targets RISC-V bare metal running in QEMU. This is the same architecture the Compilers track generates code for. Integration Lab I4 depends on this alignment.

### Course A: Bare Metal
*"From power-on to your first instruction."*

| Module | Units |
|--------|-------|
| A.1 The Boot Sequence | From reset vector to first instruction (D1-D2), RISC-V boot protocol (D1-D2) |
| A.2 Memory-Mapped I/O | Writing to hardware by writing to memory (D1-D2), UART driver (D1-D2) |
| A.3 Privilege Modes | Machine/Supervisor/User modes (D1-D2), Mode transitions (D2-D3) |

Xrefs from this course:
- A.1/A.2 ↔ Compilers E.2: "Your first instruction is what codegen produces"

### Course B: Interrupts and Exceptions
*"How the CPU interrupts what it's doing and does something else."*

| Module | Units |
|--------|-------|
| B.1 Interrupt Architecture | Hardware vs. software interrupts (D1-D2), RISC-V trap mechanism (D1-D2) |
| B.2 Trap Handling | Writing a trap handler (D1-D2), The trap frame (D2-D3) |
| B.3 Timer Interrupts | RISC-V timer (D1-D2), Cooperative scheduling via timer (D1-D2) |

### Course C: Memory Management
*"Physical frames, virtual pages, and the hardware that translates between them."*

| Module | Units |
|--------|-------|
| C.1 Physical Memory | Frame allocator basics (D1-D2), Bitmap allocator (D1-D2) |
| C.2 Virtual Memory | Physical vs. virtual (D1-D2), Why virtual memory exists (D1-D2) |
| C.3 Sv39 Paging | RISC-V Sv39 page table structure (D1-D3), Page walks (D1-D2), TLB management (D2-D3) |

Xrefs from this course:
- C.2 ↔ Compilers E.3: memory model that codegen assumes
- C.3 ↔ Compilers E.4: ELF sections map to virtual addresses

Anchors in this course:
- C.3 → Rust `[ownership] D2` when student tries to hold multiple references to page table structures

### Course D: Processes
*"Address spaces, context switches, and the scheduler."*

| Module | Units |
|--------|-------|
| D.1 The Process Model | What a process is at the kernel level (D1-D2), Address space layout (D1-D2) |
| D.2 Context Switching | Saving/restoring CPU state (D1-D3), Switch assembly (D2-D3) |
| D.3 Scheduling | Round-robin (D1-D2), Priority scheduling (D2-D3) |
| D.4 Syscalls | The ecall/sret mechanism (D1-D2), Syscall ABI (D1-D2), Implementing write/exit (D1-D2) |

Xrefs from this course:
- D.2 ↔ Compilers E.3: context switch saves exactly what calling convention requires
- D.3 ↔ Rust `[async-await] D2`: kernel scheduler vs. user-space scheduler

### Course E: File Systems
*"Blocks, inodes, directories, and the illusion of a persistent hierarchy."*

| Module | Units |
|--------|-------|
| E.1 Storage Abstractions | Blocks and sectors (D1-D2), Inodes and directories (D1-D2) |
| E.2 FAT32 | FAT filesystem structure (D1-D2), Read-only driver (D1-D2) |
| E.3 Journaling | Why ext4 survives crashes (D1-D2), Write-ahead logging (D2-D3) |
| E.4 VFS | The VFS abstraction layer (D1-D2), Implementing a VFS backend (D2-D3) |

### Course F: Concurrency Primitives
*"How the kernel synchronizes concurrent execution."*

| Module | Units |
|--------|-------|
| F.1 Spinlocks | When busy-waiting is correct (D1-D2), Spinlock implementation (D1-D2) |
| F.2 Sleeping Mutex | Blocking without futexes (D1-D2), Integration with scheduler (D2-D3) |
| F.3 Priority Inversion | The problem (D1-D2), Mars Pathfinder case study (D1), Solutions (D2-D3) |
| F.4 Memory Ordering | Hardware memory models (D1-D2), Compiler barriers vs. hardware barriers (D2-D3) |

Xrefs from this course:
- F.1 ↔ Rust `[atomics] D2`: spinlocks use the same atomic operations
- F.4 ↔ Rust `[atomics] D2`: the C++ memory model underlying both

---

## Integration Section (cross-track)

These appear in the skill tree as a separate category, not inside any pillar's course tree.

| Lab | Tracks | Core Prerequisite Cluster |
|-----|--------|--------------------------|
| I1 — The Unsafe Boundary | Rust + OS | Rust C6 complete, OS C3 started |
| I2 — What Your Compiler Generates | Compilers + OS | Compilers E.4 complete, OS A complete |
| I3 — The Minimal Runtime | Compilers + OS | Compilers E.4 complete, OS D.4 complete |
| I4 — Full Stack Own | All three | I2 complete, I3 complete, OS D.2 complete |
| I5 — Multi-Architecture | Compilers | Compilers E.8 complete |

See [INTEGRATION_LABS.md](INTEGRATION_LABS.md) for full specifications of each lab.
