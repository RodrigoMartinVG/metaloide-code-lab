# Rust Core — Complete Content Map
## Course → Module → Unit with Canonical References

> Each Unit entry specifies: depth level (D1/D2/D3), content description,
> TRPL reference (when applicable), supplemental sources for TRPL gaps,
> and portal/anchor/xref connections to other tracks.
>
> This is the authoritative Rust Core structure. COURSE_MAP.md reflects it.

---

## Course Index

| Course | Title | Prerequisite |
|--------|-------|--------------|
| 1 | [Surface and Tooling](#course-1--surface-and-tooling) | None |
| 2 | [Structs, Enums, and Organization](#course-2--structs-enums-and-organization) | Course 1 |
| 3 | [The Memory Model](#course-3--the-memory-model) | Courses 1–2 |
| 4 | [The Type System](#course-4--the-type-system) | Course 3 |
| 5 | [Collections and Error Handling](#course-5--collections-and-error-handling) | Course 3 |
| 6 | [Concurrency](#course-6--concurrency) | Courses 3–4 |
| 7 | [Unsafe and the Minimum Runtime](#course-7--unsafe-and-the-minimum-runtime) | Courses 3, 4, 6 |
| 8 | [Macros, FFI, and Rust in the System](#course-8--macros-ffi-and-rust-in-the-system) | Courses 4, 7 |

---

## COURSE 1 — Surface and Tooling

*Goal: the student can write, compile, and reason about simple Rust programs.
No prerequisites. Universal entry point.*

---

### Module 1.1 — Tooling

**Unit 1.1.1 — rustup, cargo, and the ecosystem** `D1`
- `rustup`: toolchains, targets, components
- `cargo`: `new`, `build`, `run`, `check`, `test`, `clippy`, `fmt`
- `Cargo.toml`: dependencies, features, workspaces introduced
- Reading a compiler error: anatomy of a diagnostic
- *TRPL:* Ch 1 (Getting Started) + Ch 14 (More about Cargo)
- *Supplement:* [The Cargo Book](https://doc.rust-lang.org/cargo/)

**Unit 1.1.2 — The compiler as a thinking tool** `D2`
- `rustc --explain Exxxx`: understanding error codes
- `cargo check` vs `cargo build`: why the distinction matters
- Reading `cargo build --verbose` output
- `RUSTFLAGS`, `cargo expand` (macros), `cargo tree` (deps)
- *TRPL:* Appendix D (Development Tools)
- *Supplement:* [rustc Book](https://doc.rust-lang.org/rustc/)
- *→ portal [bare-metal-boot] D1:* "The compiler produces binaries. The OS executes them."
- *→ portal [lexing] D1:* "cargo invokes rustc with flags. Your compiler will also have a CLI."

---

### Module 1.2 — Variables, Types, and Functions

**Unit 1.2.1 — Variables and mutability** `D1`
- `let`, `let mut`, type inference, type annotations
- Shadowing: what it is and why it exists
- `const`, `static`: when to use each
- Scalar types: `i8`–`i128`, `u8`–`u128`, `isize`, `usize`, `f32`, `f64`, `bool`, `char`
- *TRPL:* Ch 3 §Variables and Mutability, §Data Types

**Unit 1.2.2 — Compound types and functions** `D1`
- Tuples, arrays: differences, when to use each
- `fn`: parameters, return types, implicit return
- The unit type `()`: what it means and when it appears
- Statements vs expressions: the distinction that trips everyone
- *TRPL:* Ch 3 §Compound Types, §Functions

**Unit 1.2.3 — What the compiler does with your variables** `D3`
- Variables and MIR: `rustc --emit=mir`
- Shadowing in the MIR: not mutation, a new binding
- Integer overflow: debug vs release, `wrapping_*`, `checked_*`
- `std::mem::size_of`, `std::mem::align_of`: real sizes
- Variables in registers vs memory: introduction to register allocation
- *Supplement:* [Rust MIR docs](https://rustc-dev-guide.rust-lang.org/mir/index.html), *Programming Rust* Ch 6
- *→ portal [ir-basics] D1:* "MIR is rustc's intermediate representation. Your compiler will also need one."

---

### Module 1.3 — Control Flow

**Unit 1.3.1 — Conditionals and loops** `D1`
- `if`/`else` as expression
- `loop`, `while`, `for in`
- `break` with value, `continue`, loop labels
- *TRPL:* Ch 3 §Control Flow

**Unit 1.3.2 — Pattern matching** `D1`
- `match` with literals, ranges, tuples
- `if let`, `while let`, `let...else`
- Irrefutable vs refutable patterns
- *TRPL:* Ch 6, Ch 19 (Patterns and Matching)

---

## COURSE 2 — Structs, Enums, and Organization

*Goal: model data precisely. The student starts thinking in types, not values.*

---

### Module 2.1 — Structs

**Unit 2.1.1 — Structs basics** `D1`
- Named structs, tuple structs, unit structs
- `impl` blocks: methods vs associated functions
- `self`, `&self`, `&mut self`: what the compiler chooses and when
- Field init shorthand, struct update syntax
- *TRPL:* Ch 5

**Unit 2.1.2 — Structs under the microscope** `D2`
- Alignment and padding: why structs are not as compact as you think
- `#[repr(C)]`, `#[repr(packed)]`, `#[repr(transparent)]`
- `std::mem::offset_of!`
- When a struct is Copy and when it isn't
- *Supplement:* *Programming Rust* Ch 9, *The Rustonomicon* §Type Layout
- *→ portal [virtual-memory] D1:* "Rust structs have a memory layout. The OS sees them as bytes."
- *→ portal [codegen-riscv] D1:* "The struct layout is what your codegen must respect."

---

### Module 2.2 — Enums and Pattern Matching

**Unit 2.2.1 — Enums with data** `D1`
- Enums with data-carrying variants: the difference from other languages
- `Option<T>`: why there's no null
- `Result<T, E>`: first contact with error handling
- Exhaustive `match`: why the compiler requires covering everything
- *TRPL:* Ch 6

**Unit 2.2.2 — Enums as state machines** `D2`
- Enums as state representation: the state machine pattern
- Discriminant: the integer behind each variant
- `std::mem::discriminant`
- Enums and `match` in the MIR: how the compiler lowers them
- *Supplement:* *Programming Rust* Ch 10
- *→ portal [lexing] D1:* "Your lexer returns a Token enum. Your parser exhaustively matches it."
- *→ portal [scheduling] D1:* "Process states (Running, Sleeping, Zombie) are naturally an enum."

---

### Module 2.3 — Code Organization

**Unit 2.3.1 — Modules, crates, and packages** `D1`
- `mod`, `pub`, `use`, `super`, `crate`
- The default-private rule: why everything is private
- Splitting modules into files: `mod.rs` vs the new style
- *TRPL:* Ch 7

**Unit 2.3.2 — Workspaces and real scale** `D2`
- Cargo workspaces: multiple crates in one repo
- `path` dependencies, `dev-dependencies`, `build-dependencies`
- Feature flags: opt-in functionality
- Coherence: why you can't implement external traits on external types
- *TRPL:* Ch 14
- *Supplement:* [The Cargo Book §Workspaces](https://doc.rust-lang.org/cargo/reference/workspaces.html)
- *→ portal [lexing] D1:* "Your compiler will be a workspace: lexer, parser, codegen as separate crates."

---

## COURSE 3 — The Memory Model

*The most important course in the track. Everything else is built on this.*
*Prerequisite: Courses 1 and 2 complete.*

---

### Module 3.1 — Stack and Heap

**Unit 3.1.1 — Not a metaphor: a physical reality** `D1`
- Stack: what it is, how it grows, why it's fast
- Heap: what it is, how it's allocated, why it's flexible
- `Box<T>`: the most explicit way to put something on the heap
- Copy types vs non-Copy types: the concrete rule
- *TRPL:* Ch 4 §What Is Ownership? (the memory section), Ch 15 §Box\<T\>

**Unit 3.1.2 — The activation frame** `D2`
- What a stack frame contains: return address, saved registers, locals
- The prologue and epilogue of a function in assembly
- `alloca` and dynamic-size arrays on the stack
- Stack overflow: why it happens and how to detect it
- `std::mem::size_of_val` for dynamic types
- *Supplement:* *CS:APP* Ch 3, *Programming Rust* Ch 4
- *↔ xref [context-switching] D1:* "The OS saves/restores stack frames when switching processes."
- *→ portal [context-switching] D1:* "The OS provides the process's initial stack."
- *→ portal [codegen-calling-conventions] D1:* "Your codegen emits the prologue and epilogue of every function."

**Unit 3.1.3 — The allocator** `D3`
- `GlobalAlloc` trait: the interface between Rust and the heap
- The default allocator: jemalloc vs system allocator
- Writing a simple allocator: bump allocator from scratch
- `Allocator` trait (nightly): per-collection local allocators
- *Supplement:* *The Rustonomicon* §Implementing Vec, [Allocator docs](https://doc.rust-lang.org/std/alloc/)
- *→ portal [physical-memory] D2:* "Your bump allocator is exactly what the kernel implements for the heap."

---

### Module 3.2 — Ownership

**Unit 3.2.1 — The fundamental invariant** `D1`
- The rule: each value has exactly one owner at any moment
- Move semantics: what happens when you assign
- `Clone`: the explicit copy
- Drop: who frees memory and when
- RAII: the pattern that emerges from Drop
- *TRPL:* Ch 4 complete

**Unit 3.2.2 — Shared ownership** `D2`
- `Rc<T>`: reference counting for single-thread
- `Arc<T>`: thread-safe reference counting
- Reference cycles and `Weak<T>`
- Why reference counting is not a garbage collector
- Explicit `drop()`: when and why
- *TRPL:* Ch 15 §Rc\<T\>, §Reference Cycles
- *Supplement:* *Programming Rust* Ch 5
- *→ portal [ir-basics] D1:* "Your AST will use Rc or Arc to share nodes. Why not Box?"

**Unit 3.2.3 — The borrow checker as analysis** `D3`
- NLL (Non-Lexical Lifetimes): the real algorithm, conceptually
- The borrow checker as dataflow analysis over the CFG
- `rustc -Z polonius`: the new borrow checker
- Reading borrow checker errors: the five most common patterns
- *Supplement:* *Rust for Rustaceans* Ch 1, [Polonius paper](https://rust-lang.github.io/polonius/)
- *→ portal [semantic-analysis] D1:* "The borrow checker is a dataflow analysis on the CFG. Your compiler will also do dataflow."

---

### Module 3.3 — Borrowing

**Unit 3.3.1 — References and the aliasing contract** `D1`
- `&T`: shared references (immutable)
- `&mut T`: exclusive references (mutable)
- The rule: aliasing XOR mutation
- Slices: references to a portion of a collection
- *TRPL:* Ch 4 §References and Borrowing, §The Slice Type

**Unit 3.3.2 — Borrowing in practice** `D2`
- The two-phase borrow: why `vec.push(vec.len())` doesn't compile
- Why `entry()` exists in HashMap
- Borrowing across function boundaries
- Iterating while modifying: the problem and the solutions
- *TRPL:* Ch 8 §HashMap (entry pattern)
- *Supplement:* *Programming Rust* Ch 5

---

### Module 3.4 — Lifetimes

**Unit 3.4.1 — Lifetimes as scope names** `D1`
- Why the compiler needs lifetime annotations
- `'a` in function signatures: what you're telling the compiler
- Lifetime elision: the three rules and how to read code without annotations
- `'static`: what it really means
- *TRPL:* Ch 10 §Validating References with Lifetimes

**Unit 3.4.2 — Advanced lifetimes** `D2`
- Lifetimes in structs: when a struct needs `'a`
- Higher-ranked trait bounds: `for<'a> Fn(&'a T)`
- Variance: covariance, contravariance, invariance
- Why `&mut T` is invariant over `T`
- *Supplement:* *Rust for Rustaceans* Ch 1, *The Rustonomicon* §Subtyping and Variance
- *→ portal [process-model] D1:* "The OS manages the lifetime of resources (processes, file descriptors) manually. Lifetimes do this statically."

---

## COURSE 4 — The Type System

*Goal: use the type system to make invalid states unrepresentable.*
*Prerequisite: Course 3 complete.*

---

### Module 4.1 — Traits

**Unit 4.1.1 — Traits: shared behavior** `D1`
- Defining and implementing traits
- Trait bounds on functions and structs
- `derive`: Clone, Debug, PartialEq, Hash, Default
- The stdlib traits everyone uses: Display, Iterator, From/Into
- *TRPL:* Ch 10 §Defining Shared Behavior with Traits

**Unit 4.1.2 — The trait system in depth** `D2`
- Blanket implementations: `impl<T: Display> ToString for T`
- The orphan rule: why it exists and how to live with it
- Associated types vs generic parameters: when to use each
- Object safety: what makes a trait `dyn`-able
- `impl Trait` as argument and as return type: the difference
- *TRPL:* Ch 10 §Advanced Traits (partial), Ch 18 §Trait Objects
- *Supplement:* *Rust for Rustaceans* Ch 2

**Unit 4.1.3 — How the compiler resolves traits** `D3`
- Trait resolution: the algorithm for selecting implementations
- Coherence and specialization (pending RFC)
- The vtable: memory layout of a trait object
- Monomorphization: how much code the compiler generates for your generics
- Reading `cargo build --timings` to understand the cost
- *Supplement:* *Rust for Rustaceans* Ch 2, [rustc dev guide §Trait solving](https://rustc-dev-guide.rust-lang.org/traits/resolution.html)
- *↔ xref [codegen-calling-conventions] D2:* "A vtable is a struct of function pointers. Your codegen emits it."
- *→ portal [codegen-riscv] D1:* "The vtable is a table of function pointers. Your codegen has to emit it."

---

### Module 4.2 — Generics

**Unit 4.2.1 — Generics and monomorphization** `D1`
- Generic functions, structs, and enums
- Trait bounds: `T: Display + Clone`
- Monomorphization: the compiler generates a copy per concrete type
- `where` clauses: when to use them
- *TRPL:* Ch 10 §Generic Data Types

**Unit 4.2.2 — Advanced generics** `D2`
- Const generics: `[T; N]` with generic N
- Generic associated types (GATs): the problem they solve
- PhantomData: types that exist only for the compiler
- Zero-sized types (ZST): how Rust optimizes them
- *Supplement:* *Rust for Rustaceans* Ch 2, [GATs stabilization](https://blog.rust-lang.org/2022/10/28/gats-stabilization.html)

---

### Module 4.3 — Smart Pointers

**Unit 4.3.1 — The smart pointer zoo** `D1`
- `Box<T>`: unique heap ownership
- `Rc<T>` / `Arc<T>`: shared ownership
- `RefCell<T>`: interior mutability in single-thread
- `Mutex<T>` / `RwLock<T>`: thread-safe interior mutability
- When to use which: the decision map
- *TRPL:* Ch 15 complete

**Unit 4.3.2 — Interior mutability pattern** `D2`
- `UnsafeCell<T>`: the foundation of everything
- `Cell<T>`: for Copy types
- The Newtype pattern over smart pointers
- `Deref` and `DerefMut`: automatic coercion
- *TRPL:* Ch 15 §Interior Mutability, §The Deref Trait
- *Supplement:* *The Rustonomicon* §Interior Mutability

---

## COURSE 5 — Collections and Error Handling

*Goal: write idiomatic Rust code that handles failures correctly.*

---

### Module 5.1 — Collections

**Unit 5.1.1 — Vec, String, HashMap** `D1`
- `Vec<T>`: growth, indexing, iteration
- `String` vs `&str`: the distinction that always confuses
- `HashMap<K, V>`: the entry pattern, the hash function
- When to use `Vec` vs `VecDeque` vs `LinkedList`
- *TRPL:* Ch 8 complete

**Unit 5.1.2 — Iterators and closures** `D1`
- The `Iterator` trait: `next()` as the fundamental method
- Adapters: `map`, `filter`, `flat_map`, `chain`, `zip`, `enumerate`
- Consumers: `collect`, `fold`, `sum`, `count`
- Closures: `Fn`, `FnMut`, `FnOnce` — what each captures
- `move` closures: when and why
- *TRPL:* Ch 13 complete

**Unit 5.1.3 — Iterators as zero-cost abstraction** `D2`
- The compiler and abstraction elimination: generated assembly
- Lazy evaluation: iterators don't run until consumed
- Implementing `Iterator` for your own type
- `ExactSizeIterator`, `DoubleEndedIterator`
- *Supplement:* *Programming Rust* Ch 15

---

### Module 5.2 — Error Handling

**Unit 5.2.1 — Result and the error flow** `D1`
- `panic!`: when it's appropriate and when it isn't
- `Result<T, E>`: the type that replaces exceptions
- `?` operator: complete desugaring with `From` and `Into`
- `Option<T>` and its methods: `unwrap_or`, `map`, `and_then`
- *TRPL:* Ch 9 complete

**Unit 5.2.2 — Idiomatic error handling** `D2`
- Creating custom error types: `std::error::Error` trait
- `Box<dyn Error>`: when and why
- `thiserror` and `anyhow`: the crates everyone uses (and why)
- Error context: adding information without losing the original error
- *Supplement:* *Programming Rust* Ch 7

---

## COURSE 6 — Concurrency

*Goal: write correct concurrent code using the type system as a race condition detector.*
*Prerequisite: Courses 3 and 4 complete.*

---

### Module 6.1 — Threads and Shared State

**Unit 6.1.1 — Threads and the type system** `D1`
- `std::thread::spawn`: why it takes `FnOnce + Send + 'static`
- `JoinHandle` and `join()`
- `Send` and `Sync`: the auto-traits the compiler derives
- Why `Rc<T>` is not `Send`: the concrete invariant
- *TRPL:* Ch 16 §Threads, §Send and Sync

**Unit 6.1.2 — Mutex, RwLock, and channels** `D1`
- `Mutex<T>` and `MutexGuard`: the lock as part of the type
- Deadlock: how it happens and how to avoid it
- `RwLock<T>`: concurrent reads, exclusive writes
- Channels: `mpsc::channel`, `mpsc::sync_channel`
- Ownership transferred through channels
- *TRPL:* Ch 16 §Shared State, §Message Passing

**Unit 6.1.3 — Lock-free concurrency** `D2`
- Atomic types: `AtomicUsize`, `AtomicBool`, compare-and-swap
- `Ordering`: Relaxed, Acquire, Release, AcqRel, SeqCst
- The C++ memory model inherited by Rust
- Memory ordering on ARM vs x86: why the architecture matters
- Lock-free data structures: when they make sense
- *TRPL:* Ch 16 (partial)
- *Supplement:* *Rust for Rustaceans* Ch 10, *The Rustonomicon* §Atomics
- *↔ xref [spinlocks] D1:* "Kernel spinlocks use exactly these atomic primitives."
- *→ portal [spinlocks] D1:* "Spinlocks in the kernel are built on the same atomic operations."

---

### Module 6.2 — Async and the Execution Model

**Unit 6.2.1 — async/await: the surface** `D1`
- `async fn` and `.await`
- The `Future` trait
- `tokio::spawn` vs `tokio::task::spawn_blocking`
- When to use async vs threads: the decision map
- *TRPL:* Ch 17 §Futures and the Async Syntax

**Unit 6.2.2 — The runtime and the executor** `D2`
- The state machine transformation: your `async fn` compiled
- `Poll::Ready` and `Poll::Pending`
- `Waker` and `Context`: how the executor knows when to call back
- `Pin<T>` and `Unpin`: why self-referential futures need it
- Writing a minimal executor from scratch
- *TRPL:* Ch 17 §A Closer Look at the Traits for Async
- *Supplement:* *Rust for Rustaceans* Ch 10, [async-book](https://rust-lang.github.io/async-book/)
- *↔ xref [scheduling] D2:* "An executor is a user-space scheduler. The kernel has one in ring 0."
- *→ portal [scheduling] D2:* "An executor is a user-space scheduler. The kernel has one in ring 0."
- *→ portal [ir-ssa] D1:* "async/await is a compiler transformation. Your function becomes a state machine."

---

## COURSE 7 — Unsafe and the Minimum Runtime

*Goal: understand exactly what guarantees Rust delegates to the programmer in unsafe,
and how to write safe abstractions over unsafe code.*
*Prerequisite: Courses 3, 4, and 6 complete.*

---

### Module 7.1 — Unsafe Rust

**Unit 7.1.1 — What unsafe enables** `D1`
- The five superpowers: raw pointers, unsafe functions, unsafe traits, mutable statics, union fields
- The contract: which invariants you must maintain yourself
- `unsafe` as a signal to the reader, not the compiler
- Writing safe abstractions over unsafe code: the pattern
- *TRPL:* Ch 20 §Unsafe Rust

**Unit 7.1.2 — Raw pointers and transmute** `D2`
- `*const T` and `*mut T`: creation, dereference, arithmetic
- `transmute`: why it's the most dangerous function in the stdlib
- `from_raw_parts`, `slice::from_raw_parts`
- `NonNull<T>`: raw pointers that can't be null
- Provenance: Rust's memory model and why raw pointers are complicated
- *Supplement:* *The Rustonomicon* §Ownership, §Raw Pointers

**Unit 7.1.3 — Undefined Behavior and MIRI** `D3`
- What UB is in Rust: the complete list
- Stacked Borrows: the formal memory model
- MIRI: the interpreter that detects UB at test time
- Using MIRI on your own code: setup and use cases
- *Supplement:* *The Rustonomicon* complete, [MIRI](https://github.com/rust-lang/miri), [Stacked Borrows paper](https://plv.mpi-sws.org/rustbelt/stacked-borrows/)
- *→ portal [virtual-memory] D1:* "The entire kernel lives in unsafe. The OS track is unsafe applied."

---

### Module 7.2 — no_std and the Minimum Runtime

**Unit 7.2.1 — Rust without stdlib** `D1`
- `#![no_std]`: what you lose and what remains
- `core` vs `std`: the boundary
- `#![no_main]`: without a conventional entry point
- First bare-metal program: output to UART
- *Supplement:* [Writing an OS in Rust (Oppermann)](https://os.phil-opp.com/), [The Embedonomicon](https://docs.rust-embedded.org/embedonomicon/)
- *→ portal [bare-metal-boot] D1:* "This is the entry point to the OS track. OS Course A starts exactly here."

**Unit 7.2.2 — The Allocator trait and the heap** `D2`
- `GlobalAlloc`: the interface between Rust and the heap
- Implementing a `no_std` allocator
- `alloc` crate: collections without stdlib
- Linking: `#[panic_handler]`, `#[alloc_error_handler]`
- *Supplement:* [Writing an OS in Rust §Heap Allocation](https://os.phil-opp.com/heap-allocation/)
- *→ portal [physical-memory] D2:* "The allocator you implement here is what the kernel provides."

---

## COURSE 8 — Macros, FFI, and Rust in the System

*Goal: Rust as a systems tool: interoperability, metaprogramming, build system.*
*Prerequisite: Courses 4 and 7.*

---

### Module 8.1 — Macros

**Unit 8.1.1 — Declarative macros** `D1`
- `macro_rules!`: syntax, patterns, repetitions
- The most-used stdlib macros: `vec!`, `format!`, `assert!`
- When a macro is the right answer
- *TRPL:* Ch 20 §Macros §Declarative Macros

**Unit 8.1.2 — Procedural macros** `D2`
- Derive macros: `#[derive(MyTrait)]`
- Attribute macros: `#[route(GET, "/")]`
- Function-like macros: `sql!(SELECT * FROM users)`
- `proc_macro2`, `syn`, `quote`: the real toolkit
- *TRPL:* Ch 20 §Procedural Macros
- *Supplement:* [proc-macro-workshop](https://github.com/dtolnay/proc-macro-workshop)
- *→ portal [lexing] D1:* "Procedural macros are a compiler: they receive a TokenStream and return a TokenStream. Your compiler track starts with the same idea."

---

### Module 8.2 — FFI and Interoperability

**Unit 8.2.1 — Calling C from Rust, Rust from C** `D1`
- `extern "C"` blocks
- C-compatible types: `c_int`, `c_char`, `c_void`
- `#[no_mangle]` and the C ABI
- `bindgen`: automatic binding generation
- *TRPL:* Ch 20 §Advanced Functions §FFI (partial)
- *Supplement:* [Rust FFI Guide](https://doc.rust-lang.org/nomicon/ffi.html)

**Unit 8.2.2 — Build scripts and the linker** `D2`
- `build.rs`: what it can do and when to use it
- `cargo:rustc-link-lib`, `cargo:rustc-link-search`
- Linker scripts: `.text`, `.data`, `.bss`
- `#[link_section]`: controlling where your code goes
- *Supplement:* [The Cargo Book §Build Scripts](https://doc.rust-lang.org/cargo/reference/build-scripts.html)
- *↔ xref [codegen-elf] D2:* "Linker scripts control where the OS places your code in memory."
- *→ portal [bare-metal-boot] D1:* "Linker scripts control where the OS places your code in memory."
- *→ portal [codegen-elf] D1:* "The linker is the last step of your compiler. Here you understand what it does."

---

## Portal Map — Rust Core Outbound

Every portal from Rust Core to another track, organized by source unit.

```
Rust Core → OS Track
────────────────────────────────────────────────────────────
[tooling] D2           → [bare-metal-boot] D1
[stack-heap] D1        → [context-switching] D1  (stack frames)
[stack-heap] D2        → [context-switching] D1  (activation frame)
[stack-heap] D3        → [physical-memory] D2    (allocator)
[ownership] D2         → [ir-basics] D1          (Rc/Arc in AST)
[lifetimes] D2         → [process-model] D1      (resource lifetimes)
[atomics] D2           → [spinlocks] D1          (atomic primitives)
[async-await] D2       → [scheduling] D2         (user-space scheduler)
[unsafe] D3            → [virtual-memory] D1     (unsafe in the kernel)
[no-std] D1            → [bare-metal-boot] D1    ← PRIMARY PORTAL
[no-std] D2            → [physical-memory] D2    (allocator)
[ffi-linker] D2        → [bare-metal-boot] D1    (linker scripts)

Rust Core → Compilers Track
────────────────────────────────────────────────────────────
[tooling] D2           → [lexing] D1             (compiler CLI)
[variables-types] D3   → [ir-basics] D1          (MIR as IR)
[enums-match] D1       → [lexing] D1             (Token enum)
[enums-match] D2       → [parsing-rd] D1         (state machine parser)
[modules-workspaces] D2 → [lexing] D1            (compiler workspace)
[ownership] D2         → [ir-basics] D1          (Rc/Arc in AST)
[ownership-borrow-checker] D3 → [semantic-analysis] D1  (borrow checker as dataflow)
[traits] D3            → [codegen-riscv] D1      (vtable layout)
[async-await] D2       → [ir-ssa] D1             (async as state machine)
[proc-macros] D2       → [lexing] D1             (TokenStream)
[ffi-linker] D2        → [codegen-elf] D1        (linker is last compiler step)
```

---

## Anchor Map — Points of Return to Rust Core

Friction points in OS and Compilers labs where a Rust concept blocks progress,
with the specific Rust Core unit to revisit.

```
From OS Track → Rust Core
────────────────────────────────────────────────────────────
[bare-metal-boot]    "No compile without #[panic_handler]"   → [no-std] D1
[paging-sv39]        "Two &mut to the page table"            → [borrowing] D1
[physical-memory]    "Allocator doesn't implement GlobalAlloc correctly" → [stack-heap] D3
[trap-mechanism]     "Interrupt handler must be unsafe"      → [unsafe] D1
[scheduling]         "Scheduler breaks the borrow checker"   → [ownership] D1, [borrowing] D1
[spinlocks]          "Spinlocks and Ordering"                → [atomics] D2

From Compilers Track → Rust Core
────────────────────────────────────────────────────────────
[lexing]             "Lexer needs a lifetime for the input string" → [lifetimes] D1
[ast-design]         "The AST can't be a recursive struct"   → [smart-pointers] D1 (Box<T>)
[ast-design]         "Visitor pattern with traits"           → [traits] D1
[symbol-tables]      "Symbol table and borrowing"            → [borrowing] D1, D2
[ir-basics]          "CFG with references to basic blocks"   → [ownership] D2 (Rc/Arc)
[codegen-riscv]      "Codegen in unsafe"                     → [unsafe] D1, D2
```

---

## Xref Map — Rust Core ↔ Other Tracks

Concepts that are the same idea viewed from different layers.

```
[stack-heap] D2        ↔ [context-switching] D1    (activation frame = what OS saves/restores)
[traits] D3            ↔ [codegen-calling-conventions] D2  (vtable = struct of fn pointers)
[async-await] D2       ↔ [scheduling] D2           (executor = user-space scheduler)
[atomics] D2           ↔ [spinlocks] D1            (same operations, different layer)
[ffi-linker] D2        ↔ [codegen-elf] D2          (linker scripts = what ELF emitter produces)
```

---

## Source Coverage by Topic

Topics where TRPL is not sufficient and the primary source is elsewhere.

| Topic | Primary Source |
|-------|----------------|
| Formal memory model | *The Rustonomicon*, Stacked Borrows paper |
| MIR and compiler internals | rustc-dev-guide.rust-lang.org |
| `no_std` and bare metal | Oppermann blog, The Embedonomicon |
| Advanced unsafe and UB | *The Rustonomicon* complete |
| Advanced traits, GATs, variance | *Rust for Rustaceans* (Gjengset) |
| Advanced concurrency and lock-free | *Rust for Rustaceans* Ch 10 |
| Procedural macros | proc-macro-workshop (dtolnay) |
| Rust as systems tool | *Programming Rust* (Blandy et al.) |
| Async internals | async-book, *Rust for Rustaceans* Ch 10 |
| Type layout, repr | *Programming Rust* Ch 9, Rustonomicon §Type Layout |
| Allocators | *The Rustonomicon* §Implementing Vec |
