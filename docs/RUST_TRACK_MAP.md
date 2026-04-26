# Rust Track Map — El Suelo

Full unit-level specification for the Rust Track. Includes BlogPost structure at every layer, Action-IDE types, portals/anchors, and source references.

**Color**: `#e05c1a` (forge orange)
**Label**: `EL SUELO`
**Prerequisite**: C Track completion.

---

## Track BlogPost — "El modelo que hace razonable la máquina"

**Conceptual axis**: After C, the student has seen the machine directly — dangling pointers, use-after-free, Valgrind reports. Rust is the answer to the question C forced them to ask: *is there a way to have the same control over memory without the same failure modes?* Ownership is not a restriction — it is a formal model of what C programmers already do correctly in their heads, enforced statically.

**What it covers**:
- What Rust offers to someone who already knows C: not safety as a restriction, but safety as a proof
- Ownership as a model of resource management: the same contract C demands manually, now verified by the compiler
- The borrow checker as a static version of what Valgrind does at runtime
- How Rust is the foundation for Compilers and OS work: every portal outward passes through the concepts in this track

**Action-IDEs at track level**:
- `compare` — the same dangling pointer from C's CC2.2.4 (runtime crash) vs. Rust (compile-time rejection with exact error message)
- `mini-sim` — ownership transfer animated: a value being moved, borrowed, and returned
- `reveal` — "¿Por qué no empezamos directamente con Rust?" — the pedagogical argument for starting with C

**Portals from track BlogPost**:
- → Compilers Track: every concept in Rust that can't fully explain itself (why unsafe? why the borrow checker?) opens a portal to Compilers
- → OS Track: no_std, the allocator, and unsafe are the direct on-ramp to OS work

---

## Course RC1 — La superficie y las herramientas

**Course BlogPost**: "El entorno es parte del lenguaje"

Conceptual axis: Rust's toolchain is unusually coherent — rustup, cargo, rustfmt, clippy are first-class tools, not afterthoughts. Understanding the toolchain is not overhead before the real content; it is part of how Rust programs are written and how the compiler communicates. The student who reads compiler errors carefully learns faster than the student who guesses.

Action-IDEs at course level:
- `stepper` — a Rust program from source to binary: cargo build → rustc → linker → ELF
- `mini-sim` — a compiler error annotated: the error code, the span, the help, the note — where each piece of information lives

---

### Module RC1.1 — La cadena de herramientas

**Module BlogPost**: The Rust toolchain is designed to be the primary teaching surface. The compiler error is the first teacher. This module makes the tools legible before the language demands they be used under pressure.

---

#### Unit RC1.1.1 — rustup, cargo y el ecosistema
*D1 · render_mode = "blog"*

**BlogPost axis**: `cargo` is not a wrapper around the compiler — it is the build system, the package manager, the test runner, and the formatter in one coherent tool. Knowing its commands from the start eliminates an entire class of environment friction.

**Topics**:
- `rustup`: installing Rust, switching toolchains (stable/nightly), adding components and targets
- `cargo new`, `cargo init`: creating a project; the structure of a new project (`src/main.rs`, `Cargo.toml`)
- `cargo build`, `cargo run`, `cargo check`: build vs. check vs. run; why `check` is faster
- `cargo test`: running the test suite; where tests live
- `cargo clippy`: linting; what clippy catches that the compiler doesn't
- `cargo fmt`: formatting; the `.rustfmt.toml` config
- `Cargo.toml`: package metadata, `[dependencies]`, semantic versioning, `crates.io`
- `Cargo.lock`: what it is, when to commit it
- Reading a compiler error: the error code, the span annotation, the help message, the note

**Action-IDEs**:
- `inline-action` — predict: what does `cargo check` do that `cargo build` doesn't?
- `expanded-ide` — create a new cargo project; add a dependency from crates.io; build it; run the tests
- `reveal` — reading E0308 (type mismatch): anatomy of the full error message

**Closing question**: ¿Por qué Rust tiene un gestor de paquetes oficial en lugar de depender de gestores externos como C/C++? ¿Qué problema de ecosistema resuelve esa decisión?

---

#### Unit RC1.1.2 — El compilador como herramienta de razonamiento
*D2 · render_mode = "blog"*

**BlogPost axis**: `rustc --explain Exxxx` is a built-in resource — the compiler can explain every error code it produces. `cargo expand` shows what macros generate. These tools make the compiler's reasoning transparent, not opaque.

**Topics**:
- `rustc --explain Exxxx`: extended explanation of any error code
- `cargo check` vs `cargo build`: the cost of code generation; when to use each
- `cargo build --verbose`: seeing the actual rustc invocations
- `RUSTFLAGS`: passing flags to rustc; `-C opt-level`, `-C target-cpu`
- `cargo expand` (cargo-expand): seeing the result of macro expansion
- `cargo tree`: visualizing the dependency tree; finding duplicate dependencies
- `rustc --emit=mir`: inspecting the Mid-level Intermediate Representation
- Diagnostic levels: error, warning, note, help — reading them in order

**Action-IDEs**:
- `expanded-ide` — trigger a type mismatch error; run `rustc --explain` on the error code; read the full explanation
- `expanded-ide` — use `cargo expand` on a `#[derive(Debug)]` struct; read the generated impl
- `inline-action` — given a Rust error, identify: which part is the error message, which is the span, which is the help?

**Portals**:
- → Compilers A: "El compilador invoca rustc con flags. Tu compilador también tendrá una CLI que recibe fuente y produce binarios."

**Closing question**: ¿Por qué es útil que el compilador produzca errores con spans que señalan la línea exacta del problema? ¿Qué información necesita guardar el compilador para hacer eso?

---

### Module RC1.2 — Variables, tipos y funciones

**Module BlogPost**: Rust's surface syntax is C-adjacent on purpose — the mental model of a C programmer maps cleanly onto Rust's variables and functions. The differences (immutability by default, type inference, shadowing) each carry a deliberate reason. Understanding those reasons from the first line of code builds the right intuitions.

---

#### Unit RC1.2.1 — Variables y mutabilidad
*D1 · render_mode = "blog"*

**BlogPost axis**: Variables in Rust are immutable by default. This is not a restriction — it is a declaration of intent. `let mut` is an explicit annotation that says "this value will change." The compiler enforces it, which means the absence of `mut` is also information: this value will not change.

**Topics**:
- `let x = 5;` — variable binding; immutability by default
- `let mut x = 5; x = 6;` — explicit mutability
- Type inference: `let x = 5;` vs `let x: i32 = 5;` — when to annotate
- Type annotations: `i8`, `i16`, `i32`, `i64`, `i128`, `isize`; `u8`–`u128`, `usize`; `f32`, `f64`; `bool`; `char` (Unicode scalar, 4 bytes)
- Integer literals: `42`, `42_000`, `0xff`, `0b1010`, `0o17`; type suffixes: `42u8`, `3.14f64`
- Shadowing: `let x = 5; let x = x + 1;` — new binding, not mutation; useful for type conversion
- `const`: compile-time constant; must have a type; evaluated at compile time; can be used in array sizes
- `static`: a fixed memory location for the lifetime of the program; `static mut` is unsafe
- Integer overflow: panics in debug, wraps in release; `wrapping_add`, `checked_add`, `saturating_add`

**Action-IDEs**:
- `inline-action` — which of these requires `let mut`? (list of variable usage patterns)
- `expanded-ide` — write a program that shadows a variable to change its type (`let x = "5"; let x: u32 = x.parse().unwrap();`); compile and run
- `compare` — `let x = 5; x = 6;` (error) vs `let mut x = 5; x = 6;` (ok) — the compiler error explained
- `inline-action` — what is the size in bytes of `char` in Rust? Why is it different from C's `char`?

**Closing question**: ¿Por qué Rust eligió la inmutabilidad por defecto en lugar de la mutabilidad por defecto de C? ¿Qué clase de bugs previene esa decisión?

---

#### Unit RC1.2.2 — Tipos compuestos y funciones
*D1 · render_mode = "blog"*

**BlogPost axis**: Tuples group heterogeneous values into one; arrays group homogeneous values of a fixed size. Functions take arguments and return one value — or the unit type `()` when they return nothing. The distinction between statements and expressions is not syntactic sugar — it is the foundation of how `if` and `match` work as values.

**Topics**:
- Tuples: `let t = (1, "hello", 3.14);`; destructuring: `let (a, b, c) = t;`; index access: `t.0`, `t.1`
- Arrays: `let arr = [1, 2, 3, 4, 5];`; type `[T; N]`; fixed size at compile time; `arr[i]`; bounds checked at runtime
- The difference between tuples and arrays: heterogeneous vs homogeneous; size vs type
- Functions: `fn name(param: Type) -> ReturnType { body }`
- Parameters: pass-by-value (same semantics as C for Copy types; move for non-Copy)
- The implicit return: the last expression of a block is the return value (no semicolon)
- `return` for early returns; the difference between `return x;` and `x`
- The unit type `()`: what functions return when they have no return value; what `println!` returns
- Statements vs expressions: `let x = 5;` is a statement (no value); `5 + 3` is an expression (has value); `{ let x = 3; x + 1 }` is a block expression
- Nested blocks as expressions: `let y = { let x = 3; x * 2 };`

**Action-IDEs**:
- `inline-action` — which of these is a statement and which is an expression? (list)
- `inline-action` — what does this function return? `fn f() { let x = 5; x }` vs `fn f() { let x = 5; x; }` (with and without semicolon)
- `expanded-ide` — write a function that takes two integers and returns their GCD (greatest common divisor) using Euclid's algorithm; use the implicit return

**Closing question**: ¿Por qué Rust hace que `if` y `match` sean expresiones con valor en lugar de solo sentencias de control de flujo? ¿Qué código permite escribir esa decisión?

---

#### Unit RC1.2.3 — Lo que el compilador hace con tus variables
*D3 · render_mode = "studio"*

**BlogPost axis**: Variables in the source code are not necessarily variables in the binary. The compiler transforms your code through MIR — a simpler intermediate representation — before generating machine code. MIR makes explicit what the source hides: when values move, when they drop, and how the borrow checker actually works.

**Topics**:
- `rustc --emit=mir`: generating and reading MIR output
- MIR basics: basic blocks, terminators, places, rvalues
- Shadowing in MIR: each shadow creates a new `_N` variable; no mutation
- Integer overflow in MIR: the explicit `CheckedAdd` operation in debug mode
- `std::mem::size_of::<T>()`: the size in bytes of any type
- `std::mem::align_of::<T>()`: the alignment requirement
- `std::mem::size_of_val(&x)`: size of a value (useful for dynamically-sized types)
- Variables in registers vs. on the stack: the compiler decides; `volatile` doesn't exist in Rust
- The MIR-level representation of moves and drops: seeing when `drop()` is called

**Action-IDEs**:
- `expanded-ide` — compile a simple function with `rustc --emit=mir`; identify the basic blocks and the terminators
- `mini-sim` — a value being moved: watch the MIR-level drop insertion as the value transfers ownership
- `inline-action` — what is `std::mem::size_of::<(u8, u32)>()`? (hint: alignment padding applies)

**Portals**:
- → Compilers B: "El MIR de rustc es exactamente el tipo de IR que tu compilador va a generar. Las mismas ideas: basic blocks, terminadores, representación explícita del control flow."

**Closing question**: ¿Por qué el compilador necesita una representación intermedia (IR) entre el código fuente y el código máquina? ¿Qué hace más fácil el MIR que hacer directamente desde el AST?

---

### Module RC1.3 — Control de flujo

**Module BlogPost**: Rust's control flow is C's control flow plus one major addition: `match`. The difference is not cosmetic — `match` is exhaustive, which means the compiler verifies you've handled every case. Combined with enums, it makes incomplete handling a compile error rather than a runtime bug.

---

#### Unit RC1.3.1 — Condicionales y loops
*D1 · render_mode = "blog"*

**BlogPost axis**: `if` in Rust is an expression — it can produce a value. This means you can write `let x = if condition { 1 } else { 2 };` without a mutable binding. Loops have the same property: `loop { ... break value }` can return a value from the loop.

**Topics**:
- `if condition { } else if { } else { }` — conditions must be `bool` (no implicit integer conversion)
- `if` as expression: `let max = if a > b { a } else { b };`
- `loop { }` — infinite loop; `break` to exit; `break value` to return a value from the loop
- `while condition { }` — loop while condition is true; condition is `bool`
- `for item in collection { }` — iterating over anything that implements `IntoIterator`
- `for i in 0..10 { }` — range syntax; `0..10` is exclusive, `0..=10` is inclusive
- `continue` — skip to the next iteration
- Loop labels: `'outer: for i in 0..10 { for j in 0..10 { break 'outer; } }` — breaking out of nested loops

**Action-IDEs**:
- `inline-action` — what is the value of `x` after `let x = if true { 1 } else { "hello" };`? (compile error — why?)
- `expanded-ide` — write a number guessing game using `loop`, `break`, and `if`
- `stepper` — trace a `for` loop over a range: what is `IntoIterator` doing behind the scenes?

**Closing question**: ¿Por qué Rust no permite condiciones no-bool en `if` (como `if 1 { }` en C)? ¿Qué bugs previene esa restricción?

---

#### Unit RC1.3.2 — Pattern matching
*D1 · render_mode = "blog"*

**BlogPost axis**: `match` is an exhaustive switch — the compiler verifies that every possible case is handled. Patterns are not just literal values; they can destructure tuples, structs, enums, and bind variables. This makes `match` the primary control flow tool for working with enums and complex data.

**Topics**:
- `match value { pattern => expression, ... }` — the basic form
- Literal patterns: `match x { 1 => ..., 2 => ..., _ => ... }` — the wildcard `_`
- Exhaustiveness: what happens if you forget a case (compile error)
- Binding patterns: `match x { n if n < 0 => ..., n => ... }` — capturing the value
- Range patterns: `1..=5 => ...`
- Tuple patterns: `match (x, y) { (0, 0) => ..., (x, 0) => ..., (0, y) => ..., _ => ... }`
- `if let pattern = value { }` — match for one case; `else` branch optional
- `while let pattern = value { }` — loop while the pattern matches
- `let...else`: `let Ok(x) = result else { return; };` — handle the failure branch first
- Irrefutable patterns (always match): used in `let` bindings, function params
- Refutable patterns (may not match): used in `if let`, `while let`, `match` arms

**Action-IDEs**:
- `inline-action` — which of these `match` arms is unreachable? why does the compiler warn? (example with overlapping ranges)
- `expanded-ide` — rewrite a chain of `if/else if` comparisons as a `match` expression
- `inline-action` — what does `if let Some(x) = option` do when `option` is `None`?
- `reveal` — `let...else`: when it's cleaner than `if let` with a nested block

**Closing question**: ¿Por qué el `match` exhaustivo en Rust es una característica de seguridad y no solo sintaxis? ¿Qué tipo de bug en producción previene?

---

## Course RC2 — Structs, enums y organización

**Course BlogPost**: "Modelar con tipos, no con valores"

Conceptual axis: a well-typed program cannot be in an invalid state. Structs model domain entities; enums model variant cases where exactly one applies. Organizing these into modules and crates is not administrative overhead — it is how you control what your API can and cannot do. A student who thinks in types writes fundamentally different (and safer) programs than one who thinks in values.

Action-IDEs at course level:
- `compare` — a C struct with a status integer field (any int is valid, including invalid values) vs. a Rust struct with an enum field (only valid variants exist)
- `branch` — "¿Cómo modelarías un resultado de red?" → [con un bool de éxito + valor] [con un Option] [con un Result] — each branch shows the implications

---

### Module RC2.1 — Structs

**Module BlogPost**: A struct names a collection of related fields. Its methods are the operations that make sense on that collection. This is not object-oriented programming — there is no inheritance, no virtual dispatch (unless you add it). It is data with associated behavior, nothing more.

---

#### Unit RC2.1.1 — Structs
*D1 · render_mode = "blog"*

**BlogPost axis**: Named structs are the primary way to create new types in Rust. An `impl` block defines the methods. The `self` parameter determines whether the method consumes, borrows, or mutably borrows the value — and the compiler enforces that contract at every call site.

**Topics**:
- Named struct: `struct Point { x: f64, y: f64 }` — field names and types
- Tuple struct: `struct Meters(f64)` — newtype pattern; `struct Unit;` — unit struct
- Instantiation: `Point { x: 1.0, y: 2.0 }` — all fields required
- Field access: `p.x`, `p.y`
- Field init shorthand: `let x = 1.0; Point { x, y: 2.0 }` — when field name = variable name
- Struct update syntax: `Point { x: 3.0, ..p }` — copy remaining fields from another instance
- `impl` blocks: methods and associated functions (constructors)
- `fn new(x: f64, y: f64) -> Self` — the conventional constructor
- `self`: takes ownership; `&self`: immutable borrow; `&mut self`: mutable borrow
- When to use `self` vs `&self` vs `&mut self`: the decision
- Method call syntax: `p.distance(&q)` — the compiler auto-borrows and auto-derefs
- `derive` macros: `#[derive(Debug, Clone, PartialEq)]` — automatic trait implementations
- Printing with `{:?}` (Debug) and `{}` (Display)

**Action-IDEs**:
- `mini-sim` — a struct in memory: its fields laid out with their offsets; compare to a C struct from CC3
- `expanded-ide` — implement a `Rectangle` struct with `area()`, `perimeter()`, and `is_square()` methods
- `inline-action` — which of these method signatures consumes the value? which borrows? `fn f(self)`, `fn f(&self)`, `fn f(&mut self)`

**Portals**:
- ← Anchor from CC3.1.1 C track: "El struct de C que analizaste con offsetof() es lo que Rust implementa aquí con garantías adicionales."

**Closing question**: ¿Por qué Rust separa los datos (la declaración del struct) del comportamiento (el bloque impl) en lugar de combinarlos como en una clase? ¿Qué facilita esa separación?

---

#### Unit RC2.1.2 — Structs bajo el microscopio
*D2 · render_mode = "blog"*

**BlogPost axis**: Rust struct layout respects the same alignment rules as C by default — but the compiler may reorder fields to minimize padding. `#[repr(C)]` guarantees C-compatible layout. This is the bridge between Rust's type system and the hardware's expectations.

**Topics**:
- Alignment and padding: why `struct { u8, u32 }` is 8 bytes, not 5
- How the compiler reorders fields by default (`repr(Rust)`)
- `#[repr(C)]`: field ordering preserved; identical layout to the C equivalent
- `#[repr(packed)]`: remove padding; the cost (unaligned access may be UB or slow)
- `#[repr(transparent)]`: single-field struct has the same layout as the field
- `std::mem::offset_of!(Type, field)`: byte offset of a field
- When a struct is `Copy`: all fields must be `Copy`; no `Drop` impl allowed
- The `Copy` vs `Clone` distinction: `Copy` is implicit (assignment copies); `Clone` is explicit (`.clone()`)
- Zero-sized types (ZST): `struct Phantom;` — exists in the type system, zero bytes at runtime

**Action-IDEs**:
- `mini-sim` — struct layout visualizer: student adds fields of different types and watches alignment padding appear and total size change
- `expanded-ide` — write the same struct with C-compatible layout; verify with `std::mem::size_of` and `offset_of`; compare to C's `offsetof`
- `inline-action` — what is `size_of::<(u8, u16, u8)>()`? Draw the padding manually first.

**Portals**:
- → OS A: "El `#[repr(C)]` que vas a usar en el OS track garantiza que el kernel ve exactamente el layout que espera el hardware."
- → Compilers E: "El layout de struct que estudiaste aquí es lo que tu codegen debe respetar para que la calling convention funcione."

**Closing question**: ¿Por qué `#[repr(C)]` existe como atributo opt-in en lugar de ser el comportamiento por defecto de Rust? ¿Qué optimizaciones permite el `repr(Rust)` que `repr(C)` no permite?

---

### Module RC2.2 — Enums y pattern matching

**Module BlogPost**: A Rust enum is not a list of integers — it is a type with variants that can each carry data. This is the primitive that makes `Option` and `Result` possible, and it is fundamentally different from C's enum. The exhaustive match on an enum is a guarantee that the compiler gives you that no switch statement in C can give.

---

#### Unit RC2.2.1 — Enums con datos
*D1 · render_mode = "blog"*

**BlogPost axis**: Rust enums are sum types — a value is exactly one variant, and each variant can carry different data. `Option<T>` replaces null. `Result<T, E>` replaces exceptions and error codes. The compiler requires exhaustive handling: every variant must be addressed.

**Topics**:
- Enum declaration: `enum Direction { North, South, East, West }`
- Data-carrying variants: `enum Shape { Circle(f64), Rectangle(f64, f64), Triangle(f64, f64, f64) }`
- Struct-like variants: `enum Message { Move { x: i32, y: i32 }, Write(String) }`
- Instantiation: `let s = Shape::Circle(3.14);`
- Methods on enums: `impl Shape { fn area(&self) -> f64 { match self { ... } } }`
- `Option<T>`: `Some(value)` | `None` — the type that replaces null
- Why `None` is safer than `NULL`: the compiler forces you to handle both cases
- `Result<T, E>`: `Ok(value)` | `Err(error)` — the type that replaces exceptions and C-style error codes
- The `?` operator: propagate errors up automatically (returns from the function if `Err`)
- `match` on enums: destructuring the carried data; exhaustiveness requirement
- `unwrap()`, `expect()`: panicking on `None`/`Err`; when it's acceptable vs when it isn't

**Action-IDEs**:
- `compare` — a C function that returns -1 on error vs. a Rust function that returns `Result<i32, MyError>`: the same logic, different safety guarantees
- `expanded-ide` — implement a parser for a simple expression (number or +-*/): return `Result<f64, ParseError>` and use `?` to propagate errors
- `inline-action` — what does `let x: i32 = None.unwrap();` do at runtime?
- `reveal` — the `Option` type as the solution to Tony Hoare's "billion-dollar mistake"

**Portals**:
- ← Anchor from CC3.1.4 C track: "El enum de C sin seguridad que construiste en CC3.1.4 es el precursor de esto. Aquí el compilador garantiza lo que allá eras tú quien debía garantizar."

**Closing question**: ¿Por qué `Option<T>` tiene más seguridad que un puntero nullable en C, si ambos representan "puede haber un valor o puede no haberlo"?

---

#### Unit RC2.2.2 — Enums como máquinas de estado
*D2 · render_mode = "blog"*

**BlogPost axis**: An enum whose variants represent states, combined with methods that transition between them, produces a state machine that is verified by the compiler. Invalid transitions — like transitioning from `Closed` to `Writing` — become type errors. This pattern is used throughout the Rust ecosystem and throughout the Compilers and OS tracks.

**Topics**:
- The state machine pattern: an enum represents the current state; methods take `self` and return the next state
- Typestate pattern: different states are different types; transitions are functions between types
- The discriminant: the integer the compiler uses to distinguish variants at runtime
- `std::mem::discriminant(&value)`: comparing discriminants without matching on data
- `repr(u8)` enums: controlling the discriminant type for FFI or protocol use
- Enums and `match` in MIR: how the compiler lowers a match to a jump table or comparison chain
- The connection to the Compilers track: a `Token` enum; a parser matching tokens
- The connection to the OS track: process states (Running, Blocked, Zombie) as an enum

**Action-IDEs**:
- `expanded-ide` — implement a traffic light state machine where invalid transitions are compile errors (typestate pattern)
- `mini-sim` — the discriminant: student toggles which variant is active and sees the underlying integer representation
- `stepper` — how `match` is compiled: a simple enum match → a MIR switchInt → a comparison or jump table

**Portals**:
- → Compilers B: "Tu lexer va a retornar un enum `Token`. El parser lo va a exhaustivamente hacer match. Este patrón es la columna vertebral de ambas fases."
- → OS C: "Los estados de proceso (Running, Sleeping, Zombie) son exactamente este patrón — una máquina de estados donde el kernel verifica transiciones válidas."

**Closing question**: ¿Qué diferencia hay entre usar un entero con constantes (como en C) y usar un enum en Rust para representar estados? ¿Cuándo importa esa diferencia?

---

### Module RC2.3 — Organización del código

**Module BlogPost**: A Rust crate is a compilation unit. A module is a namespace. Together they control what is visible and what is not. The default is private — you must explicitly expose what you intend to be public. This is the opposite of C, where everything in a header is public.

---

#### Unit RC2.3.1 — Módulos, crates y packages
*D1 · render_mode = "blog"*

**BlogPost axis**: Privacy in Rust is the default. Everything is private to its module unless declared `pub`. This is the mechanism for encapsulation — a struct can expose its methods while hiding its fields. `use` brings names into scope without changing visibility.

**Topics**:
- `mod name { }`: inline module; `mod name;`: module in a file
- File-based modules: `src/lib.rs` + `src/graphics.rs` → `mod graphics;`
- `pub`: making an item public; `pub(crate)`, `pub(super)`: restricted visibility
- The default-private rule: why everything is private and how to opt out
- `use path::to::Item;`: bringing items into scope; `use std::collections::HashMap;`
- `use super::*`: glob import (use sparingly)
- `crate`: the root of the current crate; `super`: the parent module; `self`: the current module
- Splitting modules into files: `mod.rs` (old style) vs `graphics.rs` + `graphics/` (new style)
- A crate: a compilation unit; a package: a Cargo.toml + one or more crates
- `src/lib.rs` vs `src/main.rs`: library crate vs binary crate; both in one package

**Action-IDEs**:
- `expanded-ide` — take a single-file program and split it into two modules; expose only the public API; verify that private fields are inaccessible from outside
- `stepper` — resolving a path: `use crate::graphics::renderer::Renderer` — trace each component
- `inline-action` — which of these is accessible from outside the module? (list of items with different visibility)

**Closing question**: ¿Por qué Rust hace que la privacidad sea el default en lugar de requerir que el programador marque lo que es privado? ¿Qué diferencia de actitud implica ese diseño?

---

#### Unit RC2.3.2 — Workspaces y escala real
*D2 · render_mode = "blog"*

**BlogPost axis**: A Cargo workspace is a repository with multiple crates that can depend on each other. This is how real Rust projects are structured — the compiler, the standard library, and every large Rust application uses workspaces. Understanding how crates compose is also the prerequisite for understanding coherence: why you can't implement external traits on external types.

**Topics**:
- `[workspace]` in `Cargo.toml`: declaring member crates
- `path` dependencies: `my-parser = { path = "../parser" }`
- `dev-dependencies`: dependencies only for tests and benchmarks
- `build-dependencies`: dependencies for `build.rs`
- Feature flags: `[features]` section; conditional compilation with `#[cfg(feature = "...")]`
- The orphan rule (coherence): you can implement a trait for a type only if you own either the trait or the type — prevents conflicting implementations across crates
- Why coherence matters: without it, two crates could implement the same trait for the same type differently

**Action-IDEs**:
- `expanded-ide` — set up a workspace with two crates: a library and a binary that depends on it; add a shared dependency
- `inline-action` — why can't you implement `Display` for `Vec<T>` in your own crate? What does the orphan rule prevent?
- `reveal` — the newtype pattern: wrapping an external type to work around the orphan rule

**Portals**:
- → Compilers A: "Tu compilador va a ser un workspace: lexer, parser, ir, codegen como crates separados que se componen."

**Closing question**: ¿Por qué la regla orphan (que impide implementar traits externos en tipos externos) es necesaria para que el sistema de crates funcione? ¿Qué conflicto evita?

---

## Course RC3 — El modelo de memoria

**Course BlogPost**: "El curso más importante del track"

Conceptual axis: Everything in Rust builds on the memory model. Ownership, borrowing, and lifetimes are not three separate concepts — they are one concept viewed from three angles: who is responsible for a value, who can access it, and for how long. A student who understands this completely can derive the rest of the language. A student who doesn't will be confused indefinitely.

Action-IDEs at course level:
- `mini-sim` — the three memory regions together: stack (function calls), heap (malloc/Box), static (globals/literals)
- `branch` — "¿Qué querés hacer con este valor?" → [Transferirlo] [Compartirlo temporalmente] [Compartirlo por tiempo indefinido] — each shows the ownership/borrow/Rc solution

---

### Module RC3.1 — Stack y heap

**Module BlogPost**: Stack and heap are not metaphors — they are hardware realities. The stack is a region of memory the CPU manages with a dedicated register (RSP). The heap is memory the allocator manages. Rust makes the stack/heap distinction explicit: `Box<T>` forces a value onto the heap; everything else goes on the stack. This explicitness is the reason Rust programs have predictable memory behavior.

---

#### Unit RC3.1.1 — No es una metáfora: una realidad física
*D1 · render_mode = "blog"*

**BlogPost axis**: Every local variable lives on the stack. Stack allocation is free — the CPU just moves a register. Heap allocation requires asking the allocator, which may fail. `Box<T>` is the Rust way to say "put this on the heap." The price: one indirection, one allocation, one deallocation.

**Topics**:
- The stack: a contiguous region of memory; grows downward on x86; managed by RSP; automatic allocation with function calls; automatic deallocation on return
- The heap: a pool of memory managed by the allocator (malloc/free in C, `GlobalAlloc` in Rust); survives function returns; manual lifecycle
- Stack-allocated types: all local variables, function arguments, return values (when they fit in registers or are small enough)
- Heap-allocated types: `Box<T>`, `Vec<T>`, `String`, `Rc<T>`, `Arc<T>` — any type whose size is determined at runtime
- `Box<T>`: a unique pointer to a heap-allocated `T`; creates a `T` on the heap and gives you ownership
- `Box<T>` and `*T` in C: the same idea — one pointer, one heap allocation, you own it
- `Copy` types: stored on the stack; assignment copies the value; no `Drop` needed
- Non-`Copy` types: owned by one variable; assignment moves ownership; `Drop` is called when the owner goes out of scope

**Action-IDEs**:
- `mini-sim` — stack vs heap side by side: student creates a local variable (stack) and a Box (heap); sees the memory layout with addresses
- `compare` — `let x = 5;` (stack, Copy) vs `let b = Box::new(5);` (heap, not Copy); assignment behavior shown
- `inline-action` — which of these allocates on the heap? `let a = [1, 2, 3];` / `let b = vec![1, 2, 3];` / `let c = Box::new(42);`

**Portals**:
- ← Anchor from CC1.3 (El layout de memoria): "El stack que estudiaste en C con %rsp y los stack frames es exactamente este stack."

**Closing question**: ¿Por qué `Box<T>` es preferible a gestionar un raw pointer manualmente, si bajo el capó es lo mismo? ¿Qué garantía adicional ofrece?

---

#### Unit RC3.1.2 — El activation frame
*D2 · render_mode = "blog"*

**BlogPost axis**: Every function call pushes an activation frame onto the stack. That frame contains the function's local variables, its return address, and the saved registers it needs. This is not an implementation detail — it is the physical mechanism behind function calls, recursion, and the stack overflow. Rust names this reality at the type level through lifetimes.

**Topics**:
- Activation frame contents: return address, saved registers (callee-saved), local variables
- Prologue and epilogue: `sub rsp, N` / `add rsp, N` — the compiler emits these
- Stack frame direction: grows downward (lower addresses); RSP points to the top
- The frame pointer `RBP`: optional in optimized builds; used for stack unwinding and debugging
- Stack overflow: unbounded recursion fills the stack; the OS sends a signal; no cleanup runs
- `std::mem::size_of_val(&x)` for dynamic types
- `alloca`-style patterns in Rust: dynamic stack arrays don't exist safely; `Vec` is the idiomatic substitute
- The connection to lifetimes: a reference to a local variable can't outlive the function because the frame will be gone

**Action-IDEs**:
- `mini-sim` — animated stack: student calls nested functions and watches frames appear and disappear; a reference is shown pointing into a frame that disappears
- `stepper` — assembly of a Rust function: identify the prologue, the local variable access via `[rbp-N]`, the epilogue

**Portals**:
- ↔ OS D (context-switch): "El context switch del kernel guarda y restaura exactamente este activation frame. Cuando el scheduler interrumpe un proceso, es esto lo que guarda."
- → Compilers E: "Tu codegen emite el prólogo y epílogo de cada función. Este es el contrato que tu backend debe generar."

**Closing question**: ¿Por qué Rust no permite retornar una referencia a una variable local? ¿Qué pasa físicamente en el stack cuando la función retorna?

---

#### Unit RC3.1.3 — El allocator
*D3 · render_mode = "studio"*

**BlogPost axis**: The allocator is the machinery behind every `Box`, `Vec`, and `String`. In Rust, the allocator is a trait — `GlobalAlloc` — which means you can replace it. Writing a bump allocator from scratch reveals that memory management is not magic: it is a data structure over a region of bytes.

**Topics**:
- `GlobalAlloc` trait: `alloc(layout: Layout) -> *mut u8` and `dealloc(ptr, layout)` — the two operations
- `Layout`: the size and alignment requirements; `Layout::new::<T>()`
- The system allocator: `std::alloc::System`; wraps `malloc`/`free` on most platforms
- `jemalloc` vs the system allocator: fragmentation, thread-local arenas, performance tradeoffs
- Writing a bump allocator: a pointer into a region; bump it forward for each allocation; no individual deallocation
- `#[global_allocator]`: replacing the default allocator
- `Allocator` trait (nightly): per-collection local allocators; `Vec<T, A: Allocator>`
- Arena allocators: allocate many short-lived objects, free them all at once

**Action-IDEs**:
- `full-lab` — implement a bump allocator with `GlobalAlloc`; test it by replacing the global allocator; observe that `Vec` and `Box` now use your allocator
- `compare` — bump allocator (O(1) alloc, no individual free) vs. slab allocator (O(1) alloc and free for same-size objects): the tradeoffs

**Portals**:
- → OS C: "El bump allocator que implementaste aquí es lo que el kernel implementa para gestionar páginas físicas. La misma idea, aplicada al hardware."

**Closing question**: ¿Por qué el allocator más simple (bump) no puede liberar memoria individualmente? ¿Qué tradeoff decide qué allocator usar en qué contexto?

---

### Module RC3.2 — Ownership

**Module BlogPost**: Ownership is one rule: each value has exactly one owner at any time. When that owner goes out of scope, the value is dropped. This rule is the foundation for the entire memory model. Everything else — borrowing, lifetimes, `Rc`, `Arc` — is built on top of it. A student who internalizes this rule (not just memorizes it) can predict the behavior of any Rust program.

---

#### Unit RC3.2.1 — El invariante fundamental
*D1 · render_mode = "blog"*

**BlogPost axis**: When you assign a value to a new variable, the old one no longer owns it. This is a move, not a copy. The old variable is invalid and cannot be used. The compiler verifies this statically. This single rule eliminates use-after-free, double-free, and memory leaks — the three bugs Valgrind hunted in the C track.

**Topics**:
- The ownership rule: one owner, one value, one lifetime
- Move semantics: `let s1 = String::from("hello"); let s2 = s1;` — s1 is moved into s2; s1 is invalid
- Why move is not copy: `String` owns heap memory; two owners would mean two frees (double-free)
- `Clone`: explicit deep copy; `let s2 = s1.clone();` — now both are valid, each owns a copy
- `Copy` types: types that are fully on the stack and trivially copyable; integers, booleans, `char`, tuples of Copy types
- `Drop` trait: automatic destructor; called when the owner goes out of scope
- RAII: resource acquisition is initialization — the pattern that emerges when Drop is automatic
- `drop(x)`: explicitly dropping a value before its scope ends; useful for releasing locks early
- Ownership and functions: passing a value to a function moves it (unless Copy); the function becomes the owner

**Action-IDEs**:
- `compare` — C code with a dangling pointer (CC2.2 class bug) vs. the Rust equivalent: the compiler error shown verbatim
- `mini-sim` — ownership transfer: student assigns a String from s1 to s2; watches s1 become invalid; watches Drop called at the end of scope
- `expanded-ide` — write a function that takes ownership of a `String`; observe that the caller can't use it afterwards; return it to transfer ownership back
- `stepper` — the lifecycle: allocate → use → drop; where Drop is inserted by the compiler

**Closing question**: ¿Por qué Rust eligió move semantics como el default en lugar de copy semantics? ¿Qué problema de escala tiene el copy-by-default?

---

#### Unit RC3.2.2 — Ownership compartido
*D2 · render_mode = "blog"*

**BlogPost axis**: Sometimes you genuinely need multiple owners. `Rc<T>` implements reference counting for single-threaded scenarios. `Arc<T>` does the same with atomic operations for thread safety. Both have a runtime cost. Neither is garbage collection — the programmer still controls when memory is freed by controlling when all owners drop.

**Topics**:
- `Rc<T>`: reference-counted smart pointer; `Rc::new(value)`, `Rc::clone(&rc)` (increments count)
- The reference count: `Rc::strong_count(&rc)` — the number of owners
- Drop with Rc: when the last `Rc` drops, the value drops
- Reference cycles: two `Rc`s pointing to each other — they never drop; memory leak
- `Weak<T>`: a non-owning reference that doesn't prevent deallocation; breaks cycles
- `Weak::upgrade()`: returns `Option<Rc<T>>` — `Some` if the value still exists
- `Arc<T>`: `Rc<T>` with atomic reference counting; `Send + Sync`; slightly more expensive
- When to use `Rc` vs `Arc`: single-thread vs multi-thread; the performance difference
- Why reference counting is not garbage collection: no GC pause, no cycle detection (that's your job)
- `Rc<RefCell<T>>`: the pattern for single-thread shared mutable state

**Action-IDEs**:
- `mini-sim` — reference count visualization: student creates an Rc, clones it multiple times; watches the count; watches it drop to zero and the value disappear
- `expanded-ide` — implement a tree where each node holds `Rc<RefCell<Node>>`; create a cycle; observe the memory leak with a counter in Drop; then fix with `Weak`

**Portals**:
- → Compilers B: "El AST de tu compilador va a usar Rc o Arc para compartir nodos entre el AST y las tablas de símbolos. ¿Por qué no Box?"

**Closing question**: ¿Por qué Rc tiene reference counting explícito en lugar de garbage collection implícita? ¿Qué tradeoffs hay entre los dos enfoques?

---

#### Unit RC3.2.3 — El borrow checker como análisis
*D3 · render_mode = "studio"*

**BlogPost axis**: The borrow checker is a dataflow analysis over the Control Flow Graph of your program. Non-Lexical Lifetimes (NLL) made it more precise by tracking the actual flow of borrows rather than just their syntactic scope. Understanding this as an analysis algorithm — not a set of rules to memorize — is what allows you to reason about why code that should work is rejected, and how to fix it.

**Topics**:
- NLL (Non-Lexical Lifetimes): lifetimes end at the last use, not the closing brace
- The borrow checker as dataflow analysis over the CFG: borrows propagate forward; uses are checked
- Why NLL exists: the pre-NLL checker rejected valid code that was obviously correct to a human
- The five most common borrow checker errors: use after move, use after borrow ends, two mutable borrows, borrow while borrowed mutably, returning local reference
- `rustc -Z polonius`: the new borrow checker (WIP); solves more cases
- Reading borrow checker errors: "value does not live long enough", "cannot borrow as mutable because it is also borrowed as immutable"
- Strategies for fighting the borrow checker: restructure borrows, use indices instead of references, use `Rc`/`Arc`, use unsafe (last resort)

**Action-IDEs**:
- `full-lab` — five borrow checker errors: trigger each one, read the error, fix it; the fix is different for each
- `stepper` — NLL dataflow: the student traces the borrow through a CFG; sees where it ends; sees why the old lexical checker would have rejected valid code

**Portals**:
- → Compilers C: "El borrow checker es un análisis de dataflow sobre el CFG. Tu compilador en el track de Compilers va a implementar análisis de dataflow — los mismos algoritmos, aplicados a otros problemas."

**Closing question**: ¿Por qué el borrow checker hace análisis estático en lugar de runtime checks? ¿Qué programa válido podría rechazar un análisis estático conservador? ¿Cómo resuelve Rust ese problema con NLL?

---

### Module RC3.3 — Borrowing

**Module BlogPost**: Borrowing is the mechanism that lets you use a value without taking ownership of it. A shared reference `&T` lets many readers coexist. An exclusive reference `&mut T` guarantees no other reference exists. These two rules together are the "aliasing XOR mutation" invariant — the formal property that makes safe concurrency and safe memory access possible.

---

#### Unit RC3.3.1 — Referencias y el contrato de aliasing
*D1 · render_mode = "blog"*

**BlogPost axis**: A reference is a borrow — you get access to the value, but you don't own it. Shared references (`&T`) are copyable and many can coexist. Exclusive references (`&mut T`) are unique: while one exists, no other reference to the same value can. This is the aliasing XOR mutation rule, and it is why Rust can guarantee there are no data races.

**Topics**:
- `&T`: creating a reference with `&`; dereferencing with `*`; the compiler inserts deref automatically in most cases
- Shared references: multiple `&T` can coexist; none can modify the value
- `&mut T`: one exclusive reference; no other reference (shared or exclusive) can exist simultaneously
- The aliasing rule: you can have any number of `&T` OR exactly one `&mut T`, never both
- Slices: `&[T]` — a reference to a contiguous portion of a slice or array; `&str` — a reference to a UTF-8 string slice
- Slice creation: `&arr[1..3]`, `&s[0..5]`; the bounds are checked
- Auto-deref: Rust inserts deref operations automatically in method calls and field access
- Reborrowing: `let r2 = &mut *r1;` — temporarily lending a `&mut T` without giving up ownership
- Why `&mut T` is not a pointer in C: the exclusivity guarantee makes concurrent mutation impossible

**Action-IDEs**:
- `mini-sim` — aliasing XOR mutation: student tries to create `&mut` while a `&` exists; sees the compile error; sees the rule visually
- `expanded-ide` — write a function that takes `&mut Vec<i32>` and sorts it in place; the caller can still use the vec after
- `compare` — C pointer (can alias, can mutate, UB if both) vs. Rust `&mut T` (no aliasing guaranteed by the compiler)

**Closing question**: ¿Por qué la regla de aliasing (muchas lecturas O una escritura) es exactamente la regla de un RwLock de concurrencia? ¿Coincidencia o diseño?

---

#### Unit RC3.3.2 — Borrowing en la práctica
*D2 · render_mode = "blog"*

**BlogPost axis**: The borrow checker is correct — but it sometimes rejects code that looks obviously valid to the programmer. These cases are not bugs in the checker; they are cases where the checker's conservatism intersects with real program structure. Understanding the patterns — split borrows, the entry API, borrowing across function boundaries — turns borrow checker fights into predictable, solvable problems.

**Topics**:
- The two-phase borrow: `vec.push(vec.len())` — why it used to fail, why it works now
- Split borrows: borrowing two different fields of a struct simultaneously; the checker tracks field-level borrows
- Borrowing across function boundaries: why a function returning `&T` must have a lifetime annotation
- The `entry()` API in `HashMap`: why `map.get().unwrap_or(map.insert(...))` fails; how `entry()` solves it
- Iterating while modifying: why `for x in &v { v.push(x); }` is rejected; solutions: index loop, `collect` into new vec
- Interior mutability as escape: `RefCell`, `Cell` — when you need mutation through a shared reference and you can guarantee exclusivity yourself

**Action-IDEs**:
- `full-lab` — four real borrow checker conflicts: (1) iterating and modifying, (2) split borrow through functions, (3) HashMap entry, (4) struct with overlapping borrows; each with the fix
- `reveal` — why the entry API exists: the alternative code pattern and the borrow checker error it produces

**Closing question**: ¿Cuándo es apropiado usar `RefCell` para evitar el borrow checker? ¿Qué garantía estás asumiendo vos en tiempo de ejecución que el compilador te estaba dando gratis?

---

### Module RC3.4 — Lifetimes

**Module BlogPost**: A lifetime annotation is not something Rust adds to slow you down — it is the name for something that already exists in your program: the span of time during which a reference is valid. The compiler infers most lifetimes; annotations are needed only when the compiler can't infer the relationship between the lifetimes of inputs and outputs.

---

#### Unit RC3.4.1 — Lifetimes como nombres de scope
*D1 · render_mode = "blog"*

**BlogPost axis**: Lifetime annotations don't change how long a value lives — they describe the constraint that must hold for the code to be safe. `'a` in `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str` means: "the returned reference is valid for at least as long as both inputs."

**Topics**:
- Why lifetime annotations exist: the compiler needs to verify that references don't outlive the values they point to
- The lifetime parameter `'a`: a generic parameter on references; constrained but not assigned by the programmer
- Lifetime in function signatures: `fn f<'a>(x: &'a T) -> &'a T` — "the output lifetime is at least as long as the input lifetime"
- The `longest` example: `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str` — why both inputs need the same lifetime
- Lifetime elision: the three rules the compiler applies to infer lifetimes without annotations
  1. Each input reference gets its own lifetime
  2. If there is exactly one input lifetime, it applies to all output lifetimes
  3. If one input is `&self`/`&mut self`, its lifetime applies to all output lifetimes
- `'static`: the lifetime that lasts for the duration of the program; string literals, `Box::leak`, statics
- When elision fails and annotations are required: multiple input lifetimes, no `self`, multiple possible output sources

**Action-IDEs**:
- `stepper` — applying elision rules: three function signatures; trace which rule applies to each; the third requires explicit annotation
- `expanded-ide` — write a function that returns the first word of a `&str` without allocation; add the lifetime annotation; explain why it's needed
- `inline-action` — does this function need a lifetime annotation? `fn first_word(s: &str) -> &str` — apply elision rules

**Closing question**: ¿Por qué las anotaciones de lifetime no cambian cuánto tiempo vive un valor? ¿Qué información comunican exactamente al compilador?

---

#### Unit RC3.4.2 — Lifetimes avanzados
*D2 · render_mode = "blog"*

**BlogPost axis**: Lifetimes in structs mean "this struct cannot outlive the data it references." Variance determines how lifetimes relate when types are nested — `&mut T` is invariant over `T` because changing the lifetime of the contained reference would break the aliasing guarantee. These are not arbitrary rules; they are logical consequences of the aliasing contract.

**Topics**:
- Lifetimes in structs: `struct Important<'a> { part: &'a str }` — the struct can't outlive the borrowed str
- Why a struct with a reference needs `'a`: if the struct outlived the reference, it would hold a dangling reference
- Higher-ranked trait bounds (HRTB): `for<'a> Fn(&'a T)` — "this function works for any lifetime"
- When HRTB appears: trait objects that take references; `impl Fn(&str)`
- Variance:
  - Covariant: `&'a T` — a longer lifetime can substitute for a shorter one
  - Contravariant: function arguments — a function accepting shorter-lived references is more general
  - Invariant: `&'a mut T` — the lifetime of the mutable reference must match exactly
- Why `&mut T` is invariant over T: allowing covariance would permit aliasing through lifetime extension
- The `PhantomData<T>` pattern: marking variance when the compiler can't infer it (e.g., raw pointers)

**Action-IDEs**:
- `mini-sim` — variance diagram: student sees covariant, contravariant, and invariant positions; tries to substitute longer/shorter lifetimes
- `expanded-ide` — write a struct that wraps a borrowed slice; add a method that returns a sub-slice; work out the lifetime annotations

**Portals**:
- → OS B: "El OS gestiona el lifetime de los recursos (procesos, file descriptors) manualmente. Los lifetimes de Rust hacen exactamente lo mismo — pero verificado en compilación."

**Closing question**: ¿Por qué `&mut T` es invariante sobre T cuando `&T` es covariante? ¿Qué bug de memoria permitiría la covarianza en referencias mutables?

---

## Course RC4 — El sistema de tipos

**Course BlogPost**: "Haciendo que los estados inválidos sean irrepresentables"

Conceptual axis: The type system is not just for catching typos. Traits define shared behavior. Generics write code once for any type that satisfies a bound. Smart pointers encode ownership and sharing semantics into types. Together, these tools let you express program invariants as types — and when the program compiles, those invariants are verified. "Making invalid states unrepresentable" is the design principle.

---

### Module RC4.1 — Traits

**Module BlogPost**: A trait is an interface — a set of methods any type can implement. But Rust traits are more expressive than interfaces in most languages: they can have default implementations, associated types, and blanket implementations. The standard library's trait hierarchy is the grammar of Rust idioms.

---

#### Unit RC4.1.1 — Traits: comportamiento compartido
*D1 · render_mode = "blog"*

**BlogPost axis**: A trait defines a contract: "any type that implements this trait can do these things." Trait bounds on generic functions say "I accept any type that can do X." The standard library's most important traits — `Iterator`, `Display`, `From`/`Into`, `Clone`, `Debug` — are the vocabulary every Rust program uses.

**Topics**:
- Defining a trait: `trait Summary { fn summarize(&self) -> String; }`
- Implementing a trait: `impl Summary for NewsArticle { ... }`
- Default implementations: `fn summarize(&self) -> String { format!("...") }` in the trait body
- Trait bounds on functions: `fn notify<T: Summary>(item: &T)` — T must implement Summary
- Multiple bounds: `T: Summary + Display`
- `where` clauses: `where T: Summary + Display` — same as inline bounds, better readability for complex constraints
- `derive` macros: `#[derive(Debug, Clone, PartialEq, Eq, Hash, Default)]` — auto-implementing common traits
- `Display` vs `Debug`: `{}` vs `{:?}`; when to implement each; Display is user-facing, Debug is programmer-facing
- `Iterator` trait: `fn next(&mut self) -> Option<Self::Item>` — the single required method; everything else derives from it
- `From<T>` and `Into<T>`: type conversions; if you implement `From`, you get `Into` for free

**Action-IDEs**:
- `expanded-ide` — define a `Shape` trait with `area()` and `perimeter()`; implement it for `Circle`, `Rectangle`, and `Triangle`; write a function that takes `&impl Shape`
- `stepper` — the `From`/`Into` relationship: implement `From<Celsius> for Fahrenheit`; show that `Into<Fahrenheit>` is automatically available
- `inline-action` — which trait do you need to implement to use `{}` in `println!`? Which for `{:?}`?

**Closing question**: ¿Por qué `From` y `Into` son dos traits separados si implementar uno implica el otro? ¿Qué caso de uso permite `From` que no tendría sentido con solo `Into`?

---

#### Unit RC4.1.2 — El sistema de traits en profundidad
*D2 · render_mode = "blog"*

**BlogPost axis**: Blanket implementations let you implement a trait for "any type that satisfies constraint X" — the entire stdlib is built on this. Associated types make trait APIs more ergonomic than generic parameters when there is a unique implementation per type. `impl Trait` and `dyn Trait` serve different purposes: static vs dynamic dispatch.

**Topics**:
- Blanket implementations: `impl<T: Display> ToString for T` — every type that implements `Display` automatically implements `ToString`
- Orphan rule (coherence): you can implement a trait for a type only if you own either the trait or the type
- Associated types vs generic parameters: `trait Iterator { type Item; }` vs `trait Converter<T> { }` — when the implementation uniquely determines the type vs when it doesn't
- Object safety: which traits can be used as `dyn Trait`; the rules: no generics on methods, no `Self` in non-method positions
- `impl Trait` as argument: `fn f(x: impl Display)` — static dispatch; monomorphized
- `impl Trait` as return type: `fn f() -> impl Display` — hides the concrete type; can't return different types in different branches
- `dyn Trait`: dynamic dispatch via vtable; `Box<dyn Error>`, `Box<dyn Fn()>`; object-safe traits only

**Action-IDEs**:
- `compare` — `impl Trait` (static dispatch, monomorphized) vs `dyn Trait` (dynamic dispatch, vtable): same code, different performance characteristics and different flexibility
- `expanded-ide` — write a function that accepts `Box<dyn Iterator<Item = i32>>`; compare it to a function that accepts `impl Iterator<Item = i32>`; observe what each can and cannot do

**Closing question**: ¿Cuándo elegirías `dyn Trait` sobre `impl Trait` a pesar del overhead de dynamic dispatch? ¿Qué escenario lo requiere?

---

#### Unit RC4.1.3 — Cómo el compilador resuelve los traits
*D3 · render_mode = "studio"*

**BlogPost axis**: Trait resolution is the algorithm by which the compiler selects which implementation to use for a given type and trait combination. Monomorphization is the code generation consequence: a separate copy of every generic function for every concrete type. Understanding both explains why Rust generics have zero overhead — and why they can increase binary size.

**Topics**:
- Trait resolution: how the compiler finds the right `impl` for a given `(Type, Trait)` pair
- Coherence: why there can only be one implementation; the orphan rule as coherence enforcement
- Monomorphization: `fn print<T: Display>(x: T)` compiled once per concrete type used; the LLVM IR has `print_i32`, `print_f64`, etc.
- The vtable: a struct of function pointers; one per `dyn Trait` object; layout: data pointer + vtable pointer
- Monomorphization vs dynamic dispatch: code size vs runtime flexibility
- `cargo build --timings`: seeing the compile time cost of monomorphization

**Action-IDEs**:
- `expanded-ide` — compile a generic function with `--emit=llvm-ir`; observe the monomorphized versions in the IR
- `mini-sim` — vtable layout: a `dyn Trait` object shown as data pointer + vtable pointer; vtable contents shown

**Portals**:
- ↔ Compilers E (codegen-calling-conv): "La vtable que viste aquí es una struct de function pointers. Tu codegen va a emitir exactamente esto para dynamic dispatch."
- ← Anchor from CC3.1.3 (Punteros a funciones): "La vtable que construiste manualmente en C con function pointers es lo que Rust genera aquí automáticamente para `dyn Trait`."

**Closing question**: ¿Por qué la monomorphización da zero-cost abstractions pero puede aumentar el tamaño del binario? ¿Cómo decidirías entre monomorphización y dynamic dispatch en un sistema embebido?

---

### Module RC4.2 — Generics

**Module BlogPost**: Generics let you write one implementation that works for many types. The type parameter is constrained by bounds — the bounds define the contract. At compile time, each unique combination of concrete types produces a specialized copy. The result is zero runtime overhead compared to writing the same function for each type manually.

---

#### Unit RC4.2.1 — Generics y monomorphización
*D1 · render_mode = "blog"*

**BlogPost axis**: A generic function is a template — the compiler instantiates it for each concrete type used. The bounds (`T: Clone`) express exactly what the code needs from the type parameter. The resulting machine code is identical to what you would write if you had written separate functions for each type.

**Topics**:
- Generic functions: `fn largest<T: PartialOrd>(list: &[T]) -> &T`
- Generic structs: `struct Pair<T> { first: T, second: T }`
- Generic enums: `Option<T>`, `Result<T, E>` — both are generic; you've been using generics since Day 1
- Trait bounds: `T: Display + Clone`; multiple bounds with `+`
- `where` clauses: `where T: Display + Clone, E: Error`
- Monomorphization: the compiler generates a copy of the function for each concrete type used
- Why zero overhead: the machine code for `largest::<i32>` is identical to a hand-written `largest_i32`
- The cost: binary size; compile time

**Action-IDEs**:
- `expanded-ide` — implement a generic `Stack<T>` with `push`, `pop`, and `peek`; use it with `i32` and with `String`
- `inline-action` — why does `fn print<T>(x: T) { println!("{}", x); }` not compile without a bound on T?

**Closing question**: ¿Por qué C++ templates (que también se monomorphizan) tienen fama de producir errores difíciles de entender, mientras que los generics de Rust producen errores claros? ¿Cuál es la diferencia de diseño?

---

#### Unit RC4.2.2 — Generics avanzados
*D2 · render_mode = "blog"*

**BlogPost axis**: Const generics allow the size or value of an array to be a compile-time parameter. `PhantomData` encodes type information that exists only for the compiler — it carries no runtime data but changes what the type system allows. Zero-sized types are the mechanism behind marker traits and typestate.

**Topics**:
- Const generics: `struct Array<T, const N: usize> { data: [T; N] }` — generic over a compile-time value
- Uses of const generics: SIMD types, fixed-size buffers, generic array operations
- Generic associated types (GATs): `trait Container { type Item<'a>; }` — associated types that are themselves generic
- `PhantomData<T>`: a zero-sized field that tells the compiler "this type is associated with T but doesn't hold a T"
- When PhantomData is needed: raw pointers; variance; Drop check
- Zero-sized types (ZST): `struct Marker;` — zero bytes; no runtime cost; participates in the type system
- ZST in collections: `HashMap<Key, ()>` as a set; zero-cost marker

**Action-IDEs**:
- `expanded-ide` — implement a type-safe units system using PhantomData: `Meters(f64)` and `Seconds(f64)` are different types that can't be accidentally mixed
- `inline-action` — what is `size_of::<PhantomData<Vec<String>>>()`?

---

### Module RC4.3 — Smart Pointers

**Module BlogPost**: Rust's smart pointers are not magic — they are structs that implement `Deref` and `Drop`. `Deref` lets them act like references. `Drop` makes them manage memory automatically. Knowing how each smart pointer works, and when to use which, is the practical knowledge needed for any real Rust program.

---

#### Unit RC4.3.1 — El zoológico de smart pointers
*D1 · render_mode = "blog"*

**BlogPost axis**: Six smart pointers cover nearly every use case: `Box` for unique heap ownership, `Rc`/`Arc` for shared ownership, `RefCell`/`Mutex` for interior mutability. Each one encodes a different ownership and access contract into the type. Choosing the wrong one is a compile error; there's no runtime surprise.

**Topics**:
- `Box<T>`: unique ownership, heap allocation; derefs to `T`; dropped when Box drops
- `Rc<T>`: shared ownership (reference counting), single-thread; `Rc::clone` increments the count
- `Arc<T>`: shared ownership, thread-safe (atomic reference count); `Send + Sync`
- `RefCell<T>`: single-thread interior mutability; `borrow()` → `Ref<T>`; `borrow_mut()` → `RefMut<T>`; panics if the borrow rule is violated at runtime
- `Mutex<T>`: multi-thread interior mutability; `.lock()` → `MutexGuard<T>`; blocks until the lock is available
- `RwLock<T>`: multiple concurrent readers OR one exclusive writer; `.read()` and `.write()`
- Decision tree: single-thread vs multi-thread? unique ownership vs shared? need mutation through shared ref?
- `Deref` trait: makes `Box<T>` behave like `&T` in most contexts; deref coercion chains

**Action-IDEs**:
- `branch` — "¿Qué tipo de acceso necesitás?" → [Único dueño, heap] [Múltiples dueños, un thread] [Múltiples dueños, varios threads] [Mutación a través de shared ref] — each shows the right smart pointer
- `compare` — `RefCell<T>` (runtime borrow checking, panics) vs `Mutex<T>` (thread-safe, blocks): the same concept at different layers

**Closing question**: ¿Por qué `RefCell` verifica las reglas de borrowing en runtime en lugar de en compilación? ¿Qué clase de programa requiere exactamente eso?

---

#### Unit RC4.3.2 — El patrón de mutabilidad interior
*D2 · render_mode = "blog"*

**BlogPost axis**: Interior mutability is the escape hatch from the aliasing rule — but it doesn't violate it. `UnsafeCell<T>` is the foundation: it tells the compiler "I am managing the aliasing invariant myself." Everything above it — `Cell`, `RefCell`, `Mutex` — provides safe interfaces over that promise.

**Topics**:
- `UnsafeCell<T>`: the only legal way to have mutable aliasing in Rust; the compiler won't optimize through it
- `Cell<T>`: interior mutability for `Copy` types; `get()`/`set()`; no references to the inner value
- `RefCell<T>`: interior mutability for non-Copy types; `borrow()` and `borrow_mut()` checked at runtime
- The `Deref` and `DerefMut` traits: auto-dereference through smart pointers; the deref coercion chain
- `Deref` coercions: `Box<T>` → `T`; `String` → `str`; `Vec<T>` → `[T]`; chaining multiple coercions
- The Newtype pattern over smart pointers: adding behavior or restricting access
- Why `RefCell<T>` panics instead of returning `Result`: the borrow rule violation is a programmer bug, not a recoverable error

**Action-IDEs**:
- `expanded-ide` — implement a mock cache using `RefCell<HashMap<...>>` inside an immutable struct; the struct looks immutable from outside but caches internally
- `stepper` — deref coercion chain: `Box<String>` → `String` → `str`; trace each step

---

## Course RC5 — Colecciones y manejo de errores

**Course BlogPost**: "Escribir código idiomático"

Conceptual axis: idiomatic Rust uses collections with iterators, not index loops. It handles errors with `Result` and `?`, not panics. The patterns taught in this course are what distinguish Rust code that reads naturally from code that fights the language. This course is about fluency.

---

### Module RC5.1 — Colecciones

**Module BlogPost**: `Vec`, `String`, and `HashMap` cover 90% of collection needs. Iterators cover the other 90% of what you want to do with those collections. The zero-cost abstraction guarantee means a chain of iterator adapters compiles to the same machine code as a hand-optimized loop.

---

#### Unit RC5.1.1 — Vec, String, HashMap
*D1 · render_mode = "blog"*

**BlogPost axis**: The three most-used collections each encode a specific contract: `Vec<T>` is a resizable array of one type; `String` is a heap-allocated, growable, valid-UTF-8 sequence of bytes; `HashMap<K, V>` is a key-value store with O(1) average lookup. Each has an API designed around Rust's ownership and borrowing rules.

**Topics**:
- `Vec<T>`: `Vec::new()`, `vec![...]`, `push`, `pop`, `len`, `is_empty`, `get(i)` (returns `Option`), `v[i]` (panics on out-of-bounds)
- Growing a `Vec`: capacity vs length; `with_capacity` to avoid reallocations
- `String`: `String::new()`, `String::from("...")`, `push_str`, `push(char)`, `len`, `is_empty`
- `String` vs `&str`: owned vs borrowed; `String` owns heap data; `&str` is a reference to UTF-8 bytes
- String indexing: you cannot index a `String` with `s[0]`; UTF-8 makes byte indices invalid for characters; use `chars()`, `bytes()`, or slices
- `HashMap<K, V>`: `HashMap::new()`, `insert(k, v)`, `get(&k)` → `Option<&V>`, `contains_key`, `remove`
- The `entry()` API: `map.entry(key).or_insert(value)` — insert if absent, use if present
- Hashing: default hasher (SipHash); `BTreeMap` for sorted keys; `HashSet`/`BTreeSet` for sets

**Action-IDEs**:
- `expanded-ide` — build a word frequency counter using `HashMap`; use the `entry` API
- `compare` — `v[i]` (panics on OOB) vs `v.get(i)` (returns `Option<&T>`): same operation, different error handling

**Closing question**: ¿Por qué `String` en Rust no permite indexar con `s[0]`? ¿Qué problema de Unicode resuelve esa restricción, y qué usas en su lugar?

---

#### Unit RC5.1.2 — Iterators y closures
*D1 · render_mode = "blog"*

**BlogPost axis**: An iterator produces values one at a time on demand. Adapters transform an iterator into another iterator — lazily, without allocating intermediate collections. Consumers drive the iteration. A closure captures variables from its environment and is the primary way to pass behavior to adapters.

**Topics**:
- The `Iterator` trait: `next() -> Option<Self::Item>` — the only required method
- Creating iterators: `v.iter()` (yields `&T`), `v.iter_mut()` (yields `&mut T`), `v.into_iter()` (yields `T`, consuming the Vec)
- Adapters (lazy, return a new iterator): `map`, `filter`, `flat_map`, `take`, `skip`, `chain`, `zip`, `enumerate`, `peekable`
- Consumers (drive iteration, produce a final value): `collect`, `fold`, `sum`, `product`, `count`, `any`, `all`, `find`, `max`, `min`
- `collect::<Vec<_>>()`: the type annotation drives what collection is built
- Closures: `|x| x * 2`; `|x, y| x + y`; can capture from the enclosing scope
- `Fn`, `FnMut`, `FnOnce`: which captures are allowed; `Fn` = shared borrow, `FnMut` = exclusive borrow, `FnOnce` = move
- `move` closures: `move |x| x + captured_value` — moves captured values into the closure

**Action-IDEs**:
- `expanded-ide` — rewrite an imperative loop (find all even numbers, square them, sum) as an iterator chain; compare the assembly output with -O2
- `compare` — `for` loop (imperative) vs iterator chain (declarative): same result, different style; which is more readable?
- `inline-action` — which closure trait does `|x: i32| x * captured` require if `captured` is `i32`? What if `captured` is `String`?

**Closing question**: ¿Por qué los adaptadores de iteradores son lazy (no ejecutan hasta que se consumen) en lugar de eager (ejecutan inmediatamente)? ¿Qué problema de eficiencia resuelve la evaluación lazy?

---

#### Unit RC5.1.3 — Iterators como abstracción de cero costo
*D2 · render_mode = "blog"*

**BlogPost axis**: The "zero-cost abstraction" claim is verifiable: compile a chained iterator with -O2 and compare the assembly to the equivalent hand-written loop. They are identical. This is because the compiler sees through the iterator protocol at compile time — there is no virtual dispatch, no allocation, and no overhead from the adapter chain.

**Topics**:
- How the compiler optimizes iterators: inlining the `next()` calls; the resulting assembly
- Why there's no overhead: trait bounds are resolved at compile time (monomorphization); no vtable
- Lazy evaluation and fusion: multiple adapters produce a single loop body
- Implementing `Iterator` for your own type: the `next()` method; using `self.state` to track position
- `ExactSizeIterator`: when you know the number of remaining elements; `size_hint()`
- `DoubleEndedIterator`: iterating from both ends; `rev()`
- `std::iter::from_fn`: creating an iterator from a closure; `std::iter::successors`

**Action-IDEs**:
- `expanded-ide` — compile a multi-step iterator chain with `-C opt-level=2 --emit=asm`; count the loop instructions; compare to the hand-written loop
- `expanded-ide` — implement `Fibonacci` as a custom `Iterator`; use it with `take(10).collect::<Vec<_>>()`

---

### Module RC5.2 — Manejo de errores

**Module BlogPost**: Rust has no exceptions. Instead, it has `Result<T, E>` — a type that explicitly represents success or failure. This forces the programmer to handle errors at the call site. The `?` operator makes propagating errors ergonomic. Custom error types make APIs communicative. These tools produce programs where errors are impossible to silently ignore.

---

#### Unit RC5.2.1 — Result y el flujo de errores
*D1 · render_mode = "blog"*

**BlogPost axis**: Every operation that can fail returns `Result<T, E>`. The `?` operator desugars to: "if this is `Ok(v)`, bind `v`; if this is `Err(e)`, convert `e` to the function's error type and return it." This makes error propagation explicit, composable, and zero-overhead compared to exceptions.

**Topics**:
- `Result<T, E>`: `Ok(value)` | `Err(error)` — the canonical success/failure type
- When to return `Result`: any operation that can fail in a recoverable way
- `panic!`: for unrecoverable errors (bugs, invariant violations); not for recoverable errors
- `unwrap()` and `expect("message")`: converting `Result` to a value by panicking on `Err`; appropriate in tests and prototypes
- The `?` operator: desugars to `match result { Ok(v) => v, Err(e) => return Err(From::from(e)) }`
- `?` requires `From`: the error type of the `?` must implement `From<SourceError>` for the function's error type
- `Option` and `?`: `?` also works on `Option` in functions returning `Option`
- Converting between `Option` and `Result`: `ok_or(error)`, `ok_or_else(|| error)`, `ok()`
- `and_then`, `map`, `map_err`, `unwrap_or`, `unwrap_or_else`: combinators for working with `Result` without `match`

**Action-IDEs**:
- `stepper` — desugaring `?`: show the code before and after; show the implicit `From` conversion happening
- `expanded-ide` — write a multi-step file processing function using `?`; observe that the error type must be compatible across all `?` uses
- `compare` — C error handling (check return code, propagate manually) vs Rust `?` (automatic propagation): the same logic, dramatically different verbosity

**Closing question**: ¿Por qué `?` requiere que el tipo de error implemente `From` en lugar de solo aceptar el mismo tipo? ¿Qué permite esa conversión implícita?

---

#### Unit RC5.2.2 — Manejo idiomático de errores
*D2 · render_mode = "blog"*

**BlogPost axis**: A custom error type communicates what went wrong. The `thiserror` crate generates the boilerplate. The `anyhow` crate provides a convenient box for error propagation when you don't need to distinguish error types. Knowing when to use each — and what information to include in an error type — is a design skill, not just a coding skill.

**Topics**:
- Implementing `std::error::Error`: the supertrait of `Display` and `Debug`; `source()` for chaining
- `Box<dyn Error>`: the simplest "any error" return type; good for applications, not libraries
- The `thiserror` crate: `#[derive(Error)]`; `#[error("message {field}")]` for Display; `#[from]` for automatic From implementations
- The `anyhow` crate: `anyhow::Result<T>` = `Result<T, anyhow::Error>`; `context()` and `with_context()` for adding context
- When to use `thiserror` vs `anyhow`: library code (use thiserror: define your errors precisely) vs application code (use anyhow: context-rich propagation)
- Error context: "failed to read config" wrapping "file not found" — preserving the causal chain
- Downcasting: recovering the original error type from a `Box<dyn Error>`

**Action-IDEs**:
- `expanded-ide` — define a custom error type for a file parser using `thiserror`; use `anyhow` in a binary that calls the parser; observe how both compose
- `compare` — an error without context ("file not found") vs with context ("failed to initialize server: failed to read config: file not found"): what debugging looks like with each

**Closing question**: ¿Por qué las librerías de Rust deberían usar `thiserror` (errores tipados) en lugar de `anyhow` (errores de caja)? ¿Qué pierden los callers si una librería retorna `anyhow::Error`?

---

## Course RC6 — Concurrencia

**Course BlogPost**: "El sistema de tipos como detector de race conditions"

Conceptual axis: Rust's concurrency model uses the type system as a safety net. `Send` and `Sync` are auto-traits that the compiler derives — if you try to share a non-`Sync` type across threads, it's a compile error. This is not a runtime check. It's the same guarantee the borrow checker gives for memory: the class of bugs is eliminated before the program runs.

---

### Module RC6.1 — Threads y estado compartido

**Module BlogPost**: Spawning a thread creates a concurrent execution context. Everything shared between threads must be `Send`. Everything accessible from multiple threads simultaneously must be `Sync`. These two constraints, enforced at compile time, are why "fearless concurrency" is not a marketing claim.

---

#### Unit RC6.1.1 — Threads y el sistema de tipos
*D1 · render_mode = "blog"*

**BlogPost axis**: `thread::spawn` takes a closure that is `FnOnce + Send + 'static`. This constraint is not arbitrary: the closure moves into the new thread (FnOnce); everything it captures must be safe to send to another thread (Send); it can't borrow from the calling stack because the thread might outlive it ('static). The type system encodes the concurrency contract.

**Topics**:
- `std::thread::spawn(f: FnOnce() + Send + 'static) -> JoinHandle<T>`: spawning a thread
- `JoinHandle::join()`: waiting for the thread to finish; returns `Result<T, Box<dyn Any + Send>>`
- Why `FnOnce`: the closure runs once and is consumed
- Why `Send`: the closure and everything it captures moves to a new OS thread; non-`Send` types can't cross thread boundaries
- Why `'static`: the spawned thread may outlive the calling function; no borrows of local variables allowed
- `Send` and `Sync` as auto-traits: the compiler derives them automatically; `!Send` and `!Sync` are how you opt out
- Why `Rc<T>` is not `Send`: its reference count is not atomic; concurrent increment/decrement is a data race
- Why `Arc<T>` is `Send`: atomic reference count; safe to send across threads
- Thread panics: a panicking thread unwinds; `join()` returns `Err`; the panic doesn't propagate to the spawner

**Action-IDEs**:
- `expanded-ide` — spawn a thread that computes a sum; join it and print the result; observe that the captured data must be moved into the closure
- `compare` — `Rc<T>` in a thread closure (compile error) vs `Arc<T>` (compiles): the error message explained

**Closing question**: ¿Por qué `Send` y `Sync` son auto-traits que el compilador deriva automáticamente en lugar de traits que el programador implementa manualmente? ¿Qué ventaja ofrece eso?

---

#### Unit RC6.1.2 — Mutex, RwLock y channels
*D1 · render_mode = "blog"*

**BlogPost axis**: `Mutex<T>` wraps a value and requires locking before access. The lock and the data are the same type — you cannot access the data without holding the lock. This is a guarantee C mutexes don't provide. Channels transfer ownership between threads — one sender, one receiver, no shared state required.

**Topics**:
- `Mutex<T>`: `Mutex::new(value)`, `.lock()` → `MutexGuard<T>`; the guard derefs to `&mut T`; released when dropped
- Deadlock: two threads each hold a lock and wait for the other; Rust doesn't prevent this at compile time
- Poisoning: if a thread panics while holding the lock, the mutex is poisoned; `.lock()` returns `Err`
- `Arc<Mutex<T>>`: the canonical pattern for shared mutable state across threads
- `RwLock<T>`: `.read()` for shared read access, `.write()` for exclusive write access; more efficient when reads dominate
- Channels: `std::sync::mpsc::channel()` → `(Sender<T>, Receiver<T>)`; `send(value)`, `recv()` (blocking)
- `sync_channel(bound)`: bounded channel that blocks on `send` when full
- Ownership transferred through channels: the value moves into the channel; the receiver owns it
- `select!`-style patterns: checking multiple receivers without blocking

**Action-IDEs**:
- `expanded-ide` — implement a thread pool using `Arc<Mutex<VecDeque<Task>>>`; workers pull tasks from the queue; observe contention
- `compare` — shared state via `Arc<Mutex<T>>` vs message passing via channels: same counter, different architectures; discuss which is easier to reason about

**Closing question**: ¿Por qué el patrón de paso de mensajes (channels) a veces es preferible al estado compartido (Arc<Mutex<T>>), si ambos pueden implementar la misma funcionalidad?

---

#### Unit RC6.1.3 — Concurrencia lock-free
*D2 · render_mode = "blog"*

**BlogPost axis**: Atomic operations are hardware primitives that appear to execute indivisibly. `Ordering` specifies how atomic operations relate to other memory operations on all threads. The C++ memory model, which Rust inherits, is the formal specification of what "happens before" means in a concurrent program. Getting it wrong produces data races that the compiler and CPU can't catch.

**Topics**:
- `AtomicUsize`, `AtomicBool`, `AtomicPtr<T>`: atomic types with lock-free operations
- `load`, `store`, `fetch_add`, `fetch_sub`, `compare_exchange`, `swap`
- `Ordering`: `Relaxed` (no synchronization), `Acquire` (all subsequent reads see prior stores), `Release` (all prior writes visible to subsequent loads), `AcqRel`, `SeqCst` (total order)
- The memory model: why `Relaxed` is not always safe; the happens-before relationship
- x86 vs ARM: x86 has a stronger memory model (Total Store Ordering); `Relaxed` on x86 often behaves like `Acquire`/`Release`; ARM does not have this guarantee
- Lock-free data structures: `AtomicPtr` for a lock-free stack; the ABA problem
- When lock-free is worth it: contention, no blocking, progress guarantees; when it isn't: complexity, hardware-dependent behavior

**Action-IDEs**:
- `expanded-ide` — implement a shared counter with AtomicUsize; benchmark vs Mutex<u64>; observe the throughput difference under high contention
- `compare` — `Relaxed` counter (fast, may produce stale reads) vs `SeqCst` counter (correct, slight overhead): measure the difference

**Portals**:
- ↔ OS E (spinlocks): "Los spinlocks del kernel se construyen exactamente sobre estas operaciones atómicas con los mismos ordenamientos."

**Closing question**: ¿Por qué el ordering `SeqCst` (el más fuerte) no es el default para todas las operaciones atómicas? ¿Qué costo tiene usarlo siempre?

---

### Module RC6.2 — Async y el modelo de ejecución

**Module BlogPost**: Async/await is a compiler transformation. An `async fn` becomes a state machine that implements the `Future` trait. The executor drives these state machines by polling them. Understanding the transformation explains every confusing behavior of async Rust: why you can't `await` inside a non-async function, why `Mutex` behaves differently in async, and why `Pin` exists.

---

#### Unit RC6.2.1 — async/await: la superficie
*D1 · render_mode = "blog"*

**BlogPost axis**: `async fn` returns a `Future` — a value that represents a computation that might not have finished yet. `.await` suspends the current async function and returns control to the executor. The executor runs on a thread pool and switches between futures when one is waiting. This is not preemptive multithreading — it is cooperative multitasking.

**Topics**:
- `async fn f() -> T {}`: the function body returns a `Future<Output = T>`
- `.await`: suspends the current future until the awaited future completes
- The `Future` trait: `fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output>`
- `Poll::Ready(value)` vs `Poll::Pending`: the future is done vs still waiting
- The runtime (executor): Tokio, async-std; what they provide: thread pools, I/O reactors, timers
- `tokio::spawn`: spawning a concurrent async task (equivalent to `thread::spawn` but for futures)
- `tokio::task::spawn_blocking`: running blocking code without blocking the async runtime
- When to use async vs threads: I/O-bound (async) vs CPU-bound (threads); when mixing is required

**Action-IDEs**:
- `expanded-ide` — write an async function that fetches two URLs concurrently using `tokio::join!`; observe that both requests are in flight simultaneously with one thread
- `stepper` — an async function suspended and resumed: the state machine shown between suspensions

**Closing question**: ¿Por qué async/await de Rust no tiene un runtime en la librería estándar? ¿Qué ventaja tiene que el runtime sea una dependencia externa?

---

#### Unit RC6.2.2 — El runtime y el executor
*D2 · render_mode = "studio"*

**BlogPost axis**: An `async fn` compiles into a struct that implements `Future`. Each `.await` point is a variant in an enum. The executor calls `poll()` on the future; if it returns `Pending`, the executor moves to another future; the `Waker` in the context notifies the executor when to poll again. Understanding this transforms async from magic into mechanics.

**Topics**:
- The state machine transformation: `async fn f() { let x = step1().await; step2(x).await; }` compiled to a `struct FStateMachine { state: FState, ... }`
- Each state in the state machine corresponds to a suspension point
- `Waker` and `Context`: how the executor is notified that a future can make progress; `waker.wake()` schedules a re-poll
- `Pin<T>`: why self-referential futures need pinning; `Unpin` and types that don't need it
- Why `Pin` exists: a future's state machine may contain a pointer to itself; moving the future invalidates the pointer
- Writing a minimal executor: a queue of `Pin<Box<dyn Future>>`; polling each in a loop; the `Waker` that re-enqueues
- `async` and `Mutex`: why `std::sync::Mutex` can deadlock in async; `tokio::sync::Mutex` for async-aware locking

**Action-IDEs**:
- `full-lab` — implement a minimal single-threaded executor from scratch; run simple futures on it; add a `Waker` that re-polls; observe a timer future
- `stepper` — the state machine for a two-step async function: states shown as enum variants, transitions triggered by poll results

**Portals**:
- ↔ OS C (scheduling): "Tu executor casero es exactamente un scheduler de usuario. El kernel tiene uno en ring 0. Los mismos algoritmos, diferente contexto."
- → Compilers C: "La transformación async/await es una transformación de compilación: una función se convierte en una máquina de estados. Tu compilador va a implementar transformaciones similares en el IR."

**Closing question**: ¿Por qué `Pin` solo es necesario para futures que se auto-referencian? ¿Qué tipo de future puede ser `Unpin` sin riesgo?

---

## Course RC7 — Unsafe y el runtime mínimo

**Course BlogPost**: "El puente hacia el sistema operativo"

Conceptual axis: `unsafe` in Rust does not disable the type system — it unlocks five specific capabilities: raw pointers, unsafe function calls, unsafe trait implementations, mutable statics, and union field access. The programmer takes responsibility for the invariants the compiler can no longer verify. This is the on-ramp to OS work: the kernel lives entirely in `unsafe`, and `no_std` Rust is the language of kernels.

---

### Module RC7.1 — Unsafe Rust

**Module BlogPost**: `unsafe` is a scope that says "I have checked these invariants that the compiler cannot." The code inside is not the "bad" part of Rust — it is the foundation of every safe abstraction in the standard library. `Vec`, `Box`, `Arc`, and `Mutex` are all built on `unsafe` internals with safe public interfaces.

---

#### Unit RC7.1.1 — Lo que unsafe habilita
*D1 · render_mode = "blog"*

**BlogPost axis**: The five unsafe superpowers are exactly the capabilities needed to talk to the hardware directly. Each one bypasses a specific compile-time check. The programmer's contract: maintain the invariant that the check would have enforced. `unsafe` is a signal to the reader that something needs careful attention — not that the code is necessarily dangerous.

**Topics**:
- The five unsafe superpowers:
  1. Dereferencing raw pointers
  2. Calling unsafe functions or methods
  3. Implementing unsafe traits
  4. Accessing or modifying mutable statics
  5. Accessing union fields
- `unsafe { ... }`: the unsafe block; everything inside can use the five powers
- `unsafe fn f() { ... }`: an unsafe function; callers must use an unsafe block to call it
- `unsafe trait T { ... }` and `unsafe impl T for Type { ... }`: the implementor guarantees an invariant the compiler can't verify (e.g., `Send`, `Sync`)
- Writing safe abstractions over unsafe code: the pattern; `pub fn safe_interface(x: T) -> R { unsafe { ... } }`
- `unsafe` as a code review signal: every `unsafe` block has an associated invariant; document it

**Action-IDEs**:
- `expanded-ide` — implement a safe `split_at_mut` function using `unsafe` internally; the function signature is safe but the implementation uses raw pointer arithmetic
- `reveal` — the invariants in Vec's push implementation: what `unsafe` operations it uses and why they are safe

**Closing question**: ¿Por qué `unsafe` en Rust está acotado a un bloque específico en lugar de ser un flag de todo el archivo? ¿Qué facilita ese diseño al auditar código?

---

#### Unit RC7.1.2 — Raw pointers y transmute
*D2 · render_mode = "blog"*

**BlogPost axis**: A raw pointer (`*const T` or `*mut T`) carries no lifetime and no aliasing guarantee. It can be null. It can dangle. The compiler will not protect you. Using raw pointers correctly requires manually maintaining every invariant that the borrow checker would have enforced automatically.

**Topics**:
- `*const T`: raw immutable pointer; `*mut T`: raw mutable pointer
- Creating raw pointers: `&x as *const T`, `&mut x as *mut T`; from `Box::into_raw(b)`
- Dereferencing: `*ptr` — only in unsafe; UB if null or dangling
- Pointer arithmetic: `ptr.add(n)`, `ptr.offset(n)` — equivalent to `ptr + n * size_of::<T>()`
- Null pointer: `std::ptr::null()`, `std::ptr::null_mut()`; `ptr.is_null()`
- `NonNull<T>`: a raw pointer guaranteed non-null; covariant over T; used in collections
- `std::mem::transmute::<A, B>(x)`: reinterpret the bytes of x as type B; zero overhead; UB if the bit pattern is invalid for B
- `from_raw_parts` and `slice::from_raw_parts(ptr, len)`: constructing a slice from a pointer and length; UB if invariants are violated
- Provenance: Rust's formal memory model; a pointer is not just an integer — it carries origin information that the compiler uses for aliasing analysis

**Action-IDEs**:
- `expanded-ide` — implement a basic `Vec<T>` from scratch using raw pointers: allocate with `alloc`, store pointer + length + capacity, implement push, implement Drop
- `compare` — `mem::transmute` (dangerous: zero checks) vs `as` cast (safe: only valid numeric casts): the same apparent operation with very different safety guarantees

---

#### Unit RC7.1.3 — Undefined Behavior y MIRI
*D3 · render_mode = "studio"*

**BlogPost axis**: Undefined behavior in Rust is a finite, enumerable list. MIRI is an interpreter that executes Rust programs and detects UB at test time — it is the Valgrind of the Rust world. Stacked Borrows is the formal memory model that defines which raw pointer usage is legal. These tools are what separate "probably correct" unsafe code from "provably correct" unsafe code.

**Topics**:
- Rust's UB list: dereferencing null/dangling pointers, reading uninitialized memory, data races, invalid bit patterns for types, breaking pointer aliasing rules, calling functions via the wrong ABI
- The Stacked Borrows model: a formal semantics for raw pointer usage; each pointer has a "tag" and is on a stack of borrows
- MIRI: `cargo +nightly miri test`; runs your tests under the interpreter; reports Stacked Borrows violations, uninitialized reads, and memory errors
- Setting up MIRI: `rustup component add miri`; interpreting its output
- What MIRI cannot check: soundness proofs, logic errors, most semantic bugs
- The `UnsafeCell` guarantee: the only legal way to have a mutable reference derived from a shared reference

**Action-IDEs**:
- `full-lab` — three unsafe code fragments each with a different UB: (1) stacked borrows violation, (2) reading uninitialized memory, (3) use after free through raw pointer; run MIRI on each; fix each

**Portals**:
- → OS A: "El kernel vive entero en unsafe. El OS track es unsafe aplicado — los mismos invariantes, pero a hardware directamente."

**Closing question**: ¿Por qué MIRI detecta UB en tiempo de ejecución (en tests) en lugar de en tiempo de compilación? ¿Qué clase de UB puede detectar que el análisis estático no puede?

---

### Module RC7.2 — no_std y el runtime mínimo

**Module BlogPost**: A `#![no_std]` program has no standard library — no filesystem, no threads, no heap (unless you provide an allocator). What remains is `core`: the parts of Rust that need nothing from the OS. This is the language of microcontrollers, kernels, and bootloaders. It is also the exact starting point of the OS track.

---

#### Unit RC7.2.1 — Rust sin stdlib
*D1 · render_mode = "blog"*

**BlogPost axis**: `#![no_std]` removes the standard library. `core` remains — the subset of Rust that has no platform dependencies. The entry point disappears and you must provide one. The panic handler disappears and you must provide one. What's left is a portable, dependency-free Rust that can run on bare metal.

**Topics**:
- `#![no_std]`: what it removes (std) and what remains (core, alloc with an allocator)
- `core`: iterators, `Option`, `Result`, math, formatting (without allocation), atomic types, raw pointers — all platform-independent
- `alloc`: collections that need a heap (`Vec`, `String`, `Box`, `Arc`) — available if you provide a `GlobalAlloc`
- `#![no_main]`: declaring there's no conventional entry point; defining `_start` or a custom entry point
- `#[panic_handler]`: defining what happens on panic; typically loop or halt on bare metal
- `#[alloc_error_handler]`: handling allocation failure in `no_std` + alloc environments
- Linking for bare metal: `--target thumbv7m-none-eabi`, RISC-V targets, etc.
- First bare-metal program: toggle a GPIO or write to a UART

**Action-IDEs**:
- `expanded-ide` — write a `no_std` library crate with a `#[panic_handler]`; compile it for a bare-metal target; verify it compiles without libc
- `reveal` — what `use std::...` versus `use core::...` imports: which parts of the standard library are in core

**Portals**:
- → OS A: "Este es el punto de entrada al track de OS. OS Course A empieza exactamente aquí — con `no_std`, un panic handler, y un target de bare metal."

**Closing question**: ¿Por qué la separación entre `core` y `std` es una ventaja de diseño? ¿Qué hace posible esa separación que no sería posible si todo el lenguaje requiriera un OS?

---

#### Unit RC7.2.2 — El trait Allocator y el heap
*D2 · render_mode = "blog"*

**BlogPost axis**: Providing a heap allocator in `no_std` is the prerequisite for using `Vec`, `Box`, and `Arc`. You implement `GlobalAlloc` and register it with `#[global_allocator]`. Your implementation is called by every heap operation in your program. This is the exact interface the OS kernel implements when it provides heap memory to user programs.

**Topics**:
- `GlobalAlloc` trait: `unsafe fn alloc(&self, layout: Layout) -> *mut u8` and `unsafe fn dealloc(&self, ptr, layout)`
- `Layout`: `Layout::new::<T>()`, `Layout::array::<T>(n)` — size and alignment
- `#[global_allocator]`: registering the allocator; must be a static
- The `alloc` crate: `extern crate alloc;` in `no_std`; gives access to `Vec`, `Box`, `String`, `Arc`
- Implementing a linked-list allocator for bare metal: a `no_std` allocator that manages a fixed memory region
- The `linked_list_allocator` crate: a practical production-ready `no_std` allocator
- `Allocator` trait (nightly): per-collection local allocators; the future of allocation in Rust

**Action-IDEs**:
- `full-lab` — implement a simple fixed-size arena allocator in `no_std`; register it as `#[global_allocator]`; allocate `Vec<u8>` and `Box<u32>` through it; implement `dealloc` as a no-op (arena style)

**Portals**:
- → OS C: "El allocator que implementaste aquí es lo que el kernel ofrece como heap a los procesos de usuario. Vas a implementar la versión del kernel en el OS track."

**Closing question**: ¿Por qué la interfaz `GlobalAlloc` es `unsafe` a pesar de que su implementación típica no hace nada que parezca peligroso? ¿Qué invariante debe mantener el implementador?

---

## Course RC8 — Macros, FFI y Rust en el sistema

**Course BlogPost**: "Rust como herramienta de sistemas"

Conceptual axis: Macros let you extend the language's syntax. FFI lets you call C code and be called from C. Build scripts let you compile and link C libraries as part of a Cargo build. Together, these tools make Rust a practical systems language — able to interface with the existing ecosystem of C libraries, OS APIs, and hardware interfaces.

---

### Module RC8.1 — Macros

**Module BlogPost**: Macros in Rust are not text substitution (unlike C macros) — they operate on the token stream or syntax tree. Declarative macros match patterns on tokens and emit replacement tokens. Procedural macros receive a syntax tree and return a new one. Both are type-checked after expansion, which is why Rust macros produce comprehensible errors when misused.

---

#### Unit RC8.1.1 — Macros declarativas
*D1 · render_mode = "blog"*

**BlogPost axis**: `macro_rules!` defines patterns and their replacements — like a `match` on the token stream. The patterns use fragment specifiers (`:expr`, `:ty`, `:ident`) to capture parts of the input. The replacements paste those captures into new code. The result is type-checked by the compiler, so macro expansion errors are semantic errors, not text garbles.

**Topics**:
- `macro_rules! name { (pattern) => { replacement }; }` — the basic form
- Fragment specifiers: `:expr` (expression), `:ty` (type), `:ident` (identifier), `:stmt` (statement), `:block`, `:item`, `:literal`, `:pat`
- Repetitions: `$(x:expr),*` — zero or more comma-separated expressions; `$(x:expr),+` — one or more
- Matching multiple patterns: multiple `(pattern) => { replacement }` arms
- The standard library macros: `vec![...]`, `format!("...", ...)`, `println!`, `assert!`, `assert_eq!`, `dbg!`
- Macro hygiene: variables defined inside a macro don't interfere with the caller's variables
- When to use a macro vs a function: when you need to accept code (not values) as input; variadic arguments; when zero overhead is required for a type-generic operation

**Action-IDEs**:
- `expanded-ide` — define a `hashmap!` macro that creates a `HashMap` from key-value pairs with syntax `hashmap!{ "key" => value, ... }`; use `cargo expand` to see the expansion
- `inline-action` — what does this macro expansion produce? (trace a simple macro with repetition)

**Closing question**: ¿Por qué las macros de Rust tienen higiene (no contaminan el scope del caller) mientras que las macros de C no? ¿Qué problema de debugging evita esa propiedad?

---

#### Unit RC8.1.2 — Macros procedurales
*D2 · render_mode = "blog"*

**BlogPost axis**: A procedural macro is a Rust function that takes a `TokenStream` and returns a `TokenStream`. It is compiled and executed at compile time. Derive macros generate `impl` blocks. Attribute macros transform the item they annotate. This is a compiler extension written in Rust — the same idea as compiler plugins.

**Topics**:
- Three kinds of proc macros: `#[derive(MyMacro)]`, `#[my_attribute]`, `my_macro!(...)`
- The `proc_macro` crate: `TokenStream`, `TokenTree`, `Group`, `Ident`, `Literal`, `Punct`
- `proc_macro2`: the re-implementation usable outside of proc macro context (for tests and libraries)
- `syn`: parsing a `TokenStream` into a Rust syntax tree; `parse_macro_input!`, `DeriveInput`
- `quote`: generating a `TokenStream` from quasi-quoted Rust code; `quote! { impl #name { } }`
- Writing a derive macro: `derive(Builder)`, `derive(Serialize)`

**Action-IDEs**:
- `expanded-ide` — write a `#[derive(Describe)]` proc macro that implements a `describe()` method returning the struct's name and its field names as a string
- `stepper` — the pipeline: source with `#[derive(...)]` → proc macro invoked → TokenStream returned → expanded code → compiled normally

**Portals**:
- → Compilers A: "Las macros procedurales son un compilador: reciben un TokenStream y retornan un TokenStream. Tu compilador hace lo mismo — con más análisis entre medio."

**Closing question**: ¿Por qué los proc macros en Rust son más poderosos que las macros declarativas pero también más costosos en tiempo de compilación? ¿Qué capacidad añaden que `macro_rules!` no tiene?

---

### Module RC8.2 — FFI e interoperabilidad

**Module BlogPost**: Rust can call C code. C code can call Rust. The `extern "C"` blocks declare the ABI contract. Everything that crosses the boundary must be a C-compatible type. This is how Rust integrates with the existing world of system libraries, OS APIs, and hardware drivers.

---

#### Unit RC8.2.1 — Llamar a C desde Rust y viceversa
*D1 · render_mode = "blog"*

**BlogPost axis**: An `extern "C"` block in Rust declares functions that exist in a C library. Calling them is `unsafe` because the compiler can't verify the C code's memory safety. Going the other direction — exposing Rust functions to C — requires `#[no_mangle]` to prevent name mangling and `extern "C"` to fix the calling convention.

**Topics**:
- `extern "C" { fn c_function(x: i32) -> i32; }`: declaring a C function
- Calling a C function: `unsafe { c_function(42) }` — always unsafe
- C-compatible types: `std::os::raw::c_int`, `c_char`, `c_void`, `c_double`, `c_size_t`
- Pointers in FFI: `*const c_char` for a C string; `*mut c_void` for opaque pointers
- Null-terminated strings: `CString` (owned) and `CStr` (borrowed); converting to/from Rust `String`
- `#[no_mangle]`: preventing Rust's name mangling on an exported function
- `extern "C" fn rust_function() { ... }`: a Rust function callable from C
- `bindgen`: automatically generating Rust FFI bindings from a C header file
- Linking: `#[link(name = "mylib")]` in `extern` block; or `cargo:rustc-link-lib` in `build.rs`

**Action-IDEs**:
- `expanded-ide` — write a Rust function that calls `strlen` from libc; convert a Rust string to a `CString`; call `strlen` on it; compare to the Rust `len()` result
- `compare` — calling a safe Rust function vs calling a C function via FFI: identical semantics, different safety requirements

**Portals**:
- ← Anchor from CC3.3.3 (calling convention): "La calling convention AMD64 que estudiaste en C es el contrato que extern 'C' garantiza aquí."

**Closing question**: ¿Por qué llamar a una función C desde Rust es siempre `unsafe`, incluso si la función C es perfectamente segura? ¿Qué garantía no puede dar el compilador de Rust sobre el código C?

---

#### Unit RC8.2.2 — Build scripts y el linker
*D2 · render_mode = "blog"*

**BlogPost axis**: `build.rs` is a Rust program that runs before the main build. It can compile C code, link external libraries, generate Rust code from schema files, and configure the build. Linker scripts control where the linker places each section of the binary in memory — this is what you need when your binary must conform to a hardware memory map.

**Topics**:
- `build.rs`: a Rust file in the package root; runs before `cargo build`; outputs `cargo:` directives
- `cargo:rustc-link-lib=mylib`: link a library
- `cargo:rustc-link-search=path/to/libs`: add a library search path
- `cargo:rerun-if-changed=path`: re-run build.rs only when this file changes
- `cargo:rustc-cfg=feature`: set a cfg flag; checked with `#[cfg(...)]`
- The `cc` crate: compiling C files from within `build.rs`
- Linker scripts: `MEMORY { ... }`, `SECTIONS { ... }` — defining where code and data go
- `#[link_section = ".my_section"]`: placing a specific item in a named section
- Why linker scripts are needed: embedded targets where the memory map is defined by the hardware

**Action-IDEs**:
- `expanded-ide` — write a `build.rs` that compiles a C helper function using the `cc` crate; call it from Rust via FFI
- `stepper` — reading a linker script: `MEMORY` region definitions → `SECTIONS` assignments → binary layout

**Portals**:
- ↔ Compilers F (codegen-elf): "Los linker scripts controlan donde el linker coloca cada sección del binario — exactamente el ELF que tu compilador va a generar."
- → OS A: "Los linker scripts son lo que posiciona el kernel en la dirección de memoria que el hardware espera. El bootloader salta a esa dirección."

**Closing question**: ¿Por qué los proyectos de sistemas embebidos necesitan linker scripts explícitos mientras que las aplicaciones normales nunca los necesitan? ¿Qué asume el linker por defecto que no se puede asumir en bare metal?

---

## Portal Map — Rust Track Outbound

Every portal from the Rust Track to another track, organized by source unit.

```
Rust Track → OS Track
────────────────────────────────────────────────────────────
[RC1.1.2]              → Compilers A       (compiler CLI)
[RC3.1.2]              ↔ OS D             (activation frame = context switch frame)
[RC3.1.3]              → OS C             (bump allocator = kernel page allocator)
[RC3.2.2]              → Compilers B      (Rc/Arc for AST sharing)
[RC3.4.2]              → OS B             (lifetimes = resource lifetime management)
[RC6.1.3]              ↔ OS E             (atomics = spinlock primitives)
[RC6.2.2]              ↔ OS C             (executor = user-space scheduler)
[RC7.1.3]              → OS A             (unsafe = language of kernels)
[RC7.2.1]              → OS A             ← PRIMARY PORTAL to OS track
[RC7.2.2]              → OS C             (no_std allocator = kernel heap)
[RC8.2.2]              → OS A             (linker scripts = kernel memory map)

Rust Track → Compilers Track
────────────────────────────────────────────────────────────
[RC1.1.2]              → Compilers A      (cargo CLI pattern)
[RC1.2.3]              → Compilers B      (MIR as IR concept)
[RC2.3.2]              → Compilers A      (workspace = compiler crates)
[RC3.2.3]              → Compilers C      (borrow checker = dataflow analysis)
[RC4.1.3]              ↔ Compilers E      (vtable = struct of fn pointers)
[RC6.2.2]              → Compilers C      (async → state machine transformation)
[RC8.1.2]              → Compilers A      (proc macros = compiler over TokenStream)
[RC8.2.2]              ↔ Compilers F      (linker scripts ↔ ELF codegen)
```

---

## Anchor Map — Points of Return to Rust Track

Friction points in OS and Compilers labs where a Rust concept blocks progress.

```
From OS Track → Rust Track
────────────────────────────────────────────────────────────
[bare-metal-boot]    "No compile without #[panic_handler]"     → RC7.2.1
[paging-sv39]        "Two &mut to the page table"              → RC3.3.1
[physical-memory]    "Allocator doesn't implement GlobalAlloc" → RC3.1.3
[trap-mechanism]     "Interrupt handler must be unsafe"        → RC7.1.1
[scheduling]         "Scheduler breaks the borrow checker"     → RC3.2.1, RC3.3.1
[spinlocks]          "Spinlocks and Ordering"                  → RC6.1.3

From Compilers Track → Rust Track
────────────────────────────────────────────────────────────
[lexing]             "Lexer needs lifetime for input string"   → RC3.4.1
[ast-design]         "AST can't be a recursive struct"         → RC4.3.1 (Box<T>)
[ast-design]         "Visitor pattern with traits"             → RC4.1.1
[symbol-tables]      "Symbol table and borrowing"              → RC3.3.1, RC3.3.2
[ir-basics]          "CFG with references to basic blocks"     → RC3.2.2 (Rc/Arc)
[codegen-riscv]      "Codegen in unsafe"                       → RC7.1.1, RC7.1.2
```

---

## Xref Map — Rust Track ↔ Other Tracks

Concepts that are the same idea viewed from different layers.

```
[RC3.1.2]              ↔ OS D [context-switch]       (activation frame = what OS saves/restores)
[RC4.1.3]              ↔ Compilers E [codegen-conv]  (vtable = struct of fn pointers)
[RC6.2.2]              ↔ OS C [scheduling]           (executor = user-space scheduler)
[RC6.1.3]              ↔ OS E [spinlocks]            (same atomic operations, different layer)
[RC8.2.2]              ↔ Compilers F [codegen-elf]   (linker scripts ↔ ELF section layout)
```

---

## Source Coverage by Topic

| Topic | Primary Source |
|-------|----------------|
| Language basics (Ch 1–10) | *The Rust Programming Language* (TRPL) — free online |
| Ownership model in depth | *Programming Rust* (Blandy et al.) Ch 4–5 |
| Advanced types, traits, variance | *Rust for Rustaceans* (Gjengset) Ch 1–2 |
| Unsafe and formal memory model | *The Rustonomicon* — free online |
| MIR and compiler internals | rustc-dev-guide.rust-lang.org |
| no_std and bare metal | Oppermann blog, The Embedonomicon |
| Advanced concurrency and lock-free | *Rust for Rustaceans* Ch 10 |
| Procedural macros | proc-macro-workshop (dtolnay) |
| Async internals | async-book, *Rust for Rustaceans* Ch 10 |
| Type layout, repr | *Programming Rust* Ch 9, Rustonomicon §Type Layout |
| Allocators | *The Rustonomicon* §Implementing Vec |
| Stacked Borrows, MIRI | Stacked Borrows paper, MIRI docs |
