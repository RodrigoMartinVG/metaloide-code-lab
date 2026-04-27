# Compilers Track Map — Destino 1

Full unit-level specification for the Compilers Track. Includes BlogPost structure at every layer, Action-IDE types, anchors/xrefs, and source references.

**Color**: `#58a6ff` (compiler blue)
**Label**: `DESTINO 1`
**Prerequisite**: Rust Track Courses RC1–RC3 complete.

---

## Track BlogPost — "Tu código no es texto para la máquina"

**Conceptual axis**: Source code is a string of characters. Machine code is a sequence of bytes. Between those two representations lies a pipeline of formal transformations — each one precise, each one informed by decades of theory. This track constructs that pipeline from scratch, in Rust. By the end, the student will have written a compiler that takes source text and produces executable machine code running in QEMU.

**What it covers**:
- The full compiler pipeline: lexing → parsing → semantic analysis → IR → optimization → code generation → ELF output
- Why each phase exists: what would break if you tried to skip it
- The RISC-V codegen arc: direct assembly first (feel the coupling), then abstraction (`CodegenTarget` trait), then Cranelift (understand what industrial backends solve)
- The deep connections to Rust and OS: the borrow checker is a dataflow analysis; the calling convention is what the OS saves in a context switch; the ELF output is what the OS loader loads

**Action-IDEs at track level**:
- `stepper` — source string to executable: each stage shown with a concrete example passing through it
- `mini-sim` — the full pipeline diagram: six boxes connected by arrows, each labeled with its input/output type
- `reveal` — "¿Por qué no compilar directamente del AST al ensamblador?" → sets up the entire IR arc

**Portals to this track from C and Rust**:
- From CC1.1.2 (toolchain): "El preprocesador, compilador, ensamblador y linker que usaste en C son las fases que vas a implementar aquí."
- From CC3.3.3 (calling convention): "La ABI que estudiaste es la que tu codegen RISC-V debe generar."
- From RC3.2.3 (borrow checker as analysis): "El borrow checker es un dataflow analysis sobre el CFG. Vas a implementar dataflow analysis en el Compilers track."
- From RC8.1.2 (proc macros): "Las proc macros reciben y retornan TokenStream — el mismo concepto que tu lexer."

---

## Course A — El Frontend

**Course BlogPost**: "De texto a estructura"

Conceptual axis: The source file is text. The compiler needs to work with structure. The frontend's job is to transform unstructured text into a structured, typed, traversable representation — the AST — while rejecting all input that doesn't conform to the grammar. This course builds the first two stages: the lexer (characters to tokens) and the parser (tokens to tree).

Action-IDEs at course level:
- `mini-sim` — character stream → token stream → AST: animated transformation of `1 + 2 * 3` through all three representations
- `stepper` — parsing an expression: the token stream and the emerging AST node tree, side by side

---

### Module A.1 — Lenguajes Formales y Lexing

**Module BlogPost**: A lexer is a recognizer for a regular language. Before writing one, you need the formal model — regular expressions, DFAs, NFAs — that tells you what a lexer can and cannot recognize. Most programming language tokens are regular. Comments with nested structure are not. The module builds the theory, then the implementation.

---

#### Unit A.1.1 — Lenguajes formales y expresiones regulares
*D1 · render_mode = "blog"*

**BlogPost axis**: A formal language is a set of strings. A regular language is one describable by a regular expression. Most programming language tokens are regular — identifiers, numbers, keywords, operators. Understanding this tells you what a lexer can recognize and what must be deferred to the parser.

**Topics**:
- Alphabet Σ, strings over Σ, language L ⊆ Σ*
- Regular expressions: literals, concatenation, alternation (`a|b`), Kleene star (`a*`), plus (`a+`), optional (`a?`)
- Character classes: `[a-z]`, `[0-9]`, `.` (any)
- What regular languages can express: identifiers, integers, string literals, keywords
- What they cannot express: nested structures, matched pairs — the parser handles those
- The formal boundary: regular = lexer; context-free = parser
- Examples: identifier = `[a-zA-Z_][a-zA-Z0-9_]*`; integer = `[0-9]+`

**Action-IDEs**:
- `inline-action` — classify: which of these can be described by a regular expression? (nested parentheses, identifier, palindrome, integer literal, XML tag pair)
- `stepper` — match the regex `[a-z]+[0-9]*` against several strings: watch which parts match which subexpressions
- `reveal` — why `/* ... */` comments with nesting require a counter, not a regex: the formal argument

**Closing question**: ¿Por qué los lenguajes de programación fueron diseñados de manera que los tokens sean lenguajes regulares? ¿Qué alternativa existiría y qué costaría?

---

#### Unit A.1.2 — DFAs y NFAs: reconocimiento de patrones
*D2 · render_mode = "blog"*

**BlogPost axis**: A regular expression is a declarative description. A deterministic finite automaton (DFA) is a machine that executes that description. Every regex can be converted to a DFA. Every DFA can be simulated in O(1) per character. The hand-written lexer is essentially a DFA in code.

**Topics**:
- DFA: states, transitions, alphabet, start state, accepting states
- Simulating a DFA: current state × input character → next state; accept if final state is accepting
- NFA: multiple transitions for the same input, plus ε-transitions
- Thompson's construction: building an NFA from a regex
- Subset construction: converting NFA to DFA — each DFA state is a *set* of NFA states
- The exponential blowup: why it rarely matters in practice
- Maximal munch: when multiple regexes match, the longest match wins (how `>=` beats `>`)

**Action-IDEs**:
- `mini-sim` — interactive DFA simulator: the student clicks transitions; the current state is highlighted; input accepted or rejected
- `stepper` — Thompson's construction on `a(b|c)*d`: build the NFA step by step; run subset construction to get a DFA
- `inline-action` — given a DFA diagram, trace two inputs and determine which is accepted

**Closing question**: ¿Por qué la implementación real de un lexer no convierte regexes a DFAs automáticamente? ¿Cuándo tiene sentido escribir el DFA a mano y cuándo usar un generador?

---

#### Unit A.1.3 — Escribir un lexer a mano
*D2 · render_mode = "studio"*

**BlogPost axis**: A hand-written lexer is a DFA implemented with a `while` loop and a `match` on the current character. This is not a compromise — it is the approach used by GCC, Clang, and rustc, because it gives precise control over error recovery, maximal munch, and edge cases.

**Topics**:
- The `Token` enum: one variant per token type; data where needed (`Ident(String)`, `Integer(i64)`)
- The `Lexer` struct: input bytes, current position, line/column tracking
- The `next_token()` method: skip whitespace, peek at current character, enter the right arm
- Keyword recognition: lex as identifier first, then check against a keyword table
- String literals: handle escape sequences (`\n`, `\t`, `\\`, `\"`)
- Error handling: unexpected character → emit `LexError` with span; continue lexing
- Testing: assert the `Vec<Token>` produced from a source string

**Action-IDEs**:
- `full-lab` — implement the complete lexer for our language: operators, delimiters, keywords (`if`, `else`, `while`, `fn`, `let`, `return`), identifiers, integer literals, string literals, line comments (`//`); pass the provided test suite
- `inline-action` — trace: what does the lexer produce for `if x >= 10 { return "done"; }`?

**Anchors**:
- ⇠ RC1.2 if the Rust Token enum and exhaustive match are unfamiliar
- ⇠ RC3.4.1 if the lexer's `&str` input produces lifetime errors

**Closing question**: ¿Por qué los compiladores modernos no usan generadores de lexers (como `lex`/`flex`) en lugar de escribirlos a mano? ¿Qué ganan y qué pierden?

---

### Module A.2 — Parsing

**Module BlogPost**: The parser transforms a flat sequence of tokens into a tree that reflects the grammatical structure of the source. It understands that `1 + 2 * 3` means `1 + (2 * 3)` and not `(1 + 2) * 3`. This module covers two algorithms: recursive descent (the classic approach) and Pratt parsing (the elegant solution to operator precedence), plus error recovery.

---

#### Unit A.2.1 — Descenso recursivo
*D1 · render_mode = "blog"*

**BlogPost axis**: A recursive descent parser is a direct translation of a context-free grammar into mutually recursive functions — one function per nonterminal. Each function consumes tokens matching its production and returns an AST node. The student writes a parser this way and discovers both its elegance and its limitations.

**Topics**:
- Context-free grammars: nonterminals, terminals, productions, start symbol
- BNF/EBNF notation: `expr → term ('+' term)*`
- Recursive descent: `parse_expr`, `parse_term`, `parse_factor` — one function per nonterminal
- The `peek()`/`expect()` pattern: look at the next token; consume if it matches; error otherwise
- Left recursion: why `expr → expr '+' term` causes infinite recursion; fix by converting to iteration
- Precedence in the grammar: encoding tighter binding as deeper nesting of production rules
- Limitation: with precedence encoded, the grammar becomes unreadable; Pratt parsing solves this

**Action-IDEs**:
- `stepper` — parsing `a + b * c`: the call stack grows and shrinks; the AST appears on the right; watch how `*` binds tighter than `+`
- `expanded-ide` — implement a recursive descent parser for arithmetic expressions (`+`, `-`, `*`, `/`, parentheses, integer literals); produce an AST; evaluate it
- `inline-action` — which production applies when the current token is `(`? Trace the parse manually.

**Closing question**: ¿Qué hace que una gramática sea ambigua? ¿Cómo resuelve el diseño del lenguaje la ambigüedad en operadores aritméticos?

---

#### Unit A.2.2 — Pratt parsing y precedencia de operadores
*D2 · render_mode = "blog"*

**BlogPost axis**: Pratt parsing handles arbitrary operator precedence through two numeric properties per token: "null denotation" (how a token begins an expression) and "left denotation" (how a token continues one). The precedence table replaces the pyramid of nested grammar rules. The student replaces the recursive descent expression parser with a Pratt parser.

**Topics**:
- Binding power: each infix operator has a left binding power (how strongly it binds to the left) and a right binding power
- `nud` (null denotation): called when the token appears at the start of an expression (prefix operators, literals)
- `led` (left denotation): called when the token appears after an existing expression (infix, postfix)
- The `parse_expr(min_bp: u8)` loop: parse a left operand; while the next operator's BP > min_bp, recurse
- Right associativity: right BP = left BP − 1 (e.g., `**` is right-associative)
- Prefix operators: `−x`, `!x` — high right BP, no left operand
- Why Pratt replaces the grammar pyramid: one table of binding powers replaces 8 levels of nested productions

**Action-IDEs**:
- `compare` — the recursive descent expression grammar (8 nested rules) vs. the Pratt binding power table (8 rows): same semantics, radically different structure
- `expanded-ide` — replace the recursive descent expression parser with a Pratt parser; add support for unary minus and right-associative exponentiation (`**`); all existing tests must pass
- `stepper` — Pratt parse of `−a * b + c ** 2`: binding power comparisons at each step; the emerging AST

**Closing question**: ¿Por qué Pratt parsing funciona para el 99% de los lenguajes de programación pero no para el 1% restante? ¿Qué característica sintáctica rompe el modelo de binding power?

---

#### Unit A.2.3 — Recuperación de errores
*D2 · render_mode = "blog"*

**BlogPost axis**: A compiler that stops at the first error is useless for real development. Error recovery lets the parser continue after an error — skipping tokens until it reaches a known-good state — so all errors in a file can be reported in one run.

**Topics**:
- Panic mode recovery: on error, discard tokens until a synchronization token is found (`}`, `;`, `return`)
- Error nodes in the AST: representing a failed parse as an `ErrorNode` so analysis can continue
- Error cascades: one syntax error can generate 20 misleading semantic errors; strategies to suppress them
- The `Span` type on errors: the byte range in the source that caused the problem
- Collecting errors: `Vec<Diagnostic>` instead of returning `Result<Ast, Error>`
- Error message quality: "expected `;`" vs. "expected `;` after expression in let binding"

**Action-IDEs**:
- `full-lab` — add error recovery to the parser: introduce three deliberate syntax errors in a source file; verify the parser reports all three, produces an AST for the valid portions, and doesn't crash
- `compare` — two error messages for the same mistake: naive parser vs. error-aware parser; the difference in actionability

**Closing question**: ¿Cuál es el costo de producir mensajes de error de alta calidad? ¿Qué información necesita el compilador para decir "probablemente quisiste escribir X"?

---

### Module A.3 — El AST

**Module BlogPost**: The AST is the central data structure of the compiler. Every subsequent phase operates on it. The choices made here — node representation, source tracking, traversal strategy — propagate through the entire compiler. This module establishes those choices.

---

#### Unit A.3.1 — Diseño del AST
*D1 · render_mode = "blog"*

**BlogPost axis**: In Rust, the natural AST representation is a recursive enum — a variant for each construct, with fields for sub-nodes. Recursive enums require `Box<T>` for indirection. The alternative — arena allocation — stores nodes in a flat `Vec` and uses indices instead of pointers, avoiding lifetimes in traversal code.

**Topics**:
- AST node categories: `Expr`, `Stmt`, `Item` — top-level groupings
- Recursive enum: `Expr::Binary { op: BinOp, lhs: Box<Expr>, rhs: Box<Expr> }`
- Why `Box<T>`: recursive enums have infinite size without indirection
- Node variants: `Expr::Literal(Literal)`, `Expr::Ident(String)`, `Expr::Call { callee: Box<Expr>, args: Vec<Expr> }`
- Statements: `Stmt::Let`, `Stmt::If`, `Stmt::While`, `Stmt::Return`, `Stmt::Expr`
- Items: `Item::FnDef { name, params, return_ty, body }`
- Arena allocation (introduction): one `Vec<Node>` for all nodes; index-based references avoid lifetimes; better cache behavior
- Tradeoff: `Box<T>` is idiomatic and easy; arenas are faster and avoid lifetime annotations in complex traversals

**Action-IDEs**:
- `expanded-ide` — define the AST enums for our language; wire the parser to produce them; print the AST as indented text
- `compare` — `Box<Expr>` recursive enum vs. index-based arena: the same traversal implemented both ways

**Anchors**:
- ⇠ RC4.3.1 (Box<T>) if the recursive enum indirection is unclear

**Closing question**: ¿Por qué rustc y LLVM usan arenas en lugar de `Box<T>` para los nodos del AST? ¿Qué problema resuelve el arena allocator específicamente para un compilador?

---

#### Unit A.3.2 — Visitor pattern vs. match exhaustivo
*D2 · render_mode = "blog"*

**BlogPost axis**: Traversing an AST means visiting every node and doing something with it. In Rust, exhaustive `match` achieves this directly. The Visitor pattern (a trait with one method per node type) separates traversal from operation. The student implements both and learns when each earns its complexity.

**Topics**:
- Recursive traversal: `fn walk_expr(e: &Expr) -> T` with exhaustive `match`
- The expression problem: adding new node types breaks all match arms; adding new operations breaks all visitor implementations
- The `Visitor` trait: one method per node type; a default implementation that just recurses
- When match is better: few passes, evolving node types; the compiler is small
- When visitor is better: many passes, stable node types; the passes share traversal logic

**Action-IDEs**:
- `compare` — the same analysis (count all integer literals) as a recursive `match` function vs. a `Visitor` trait: identical output, different extensibility
- `expanded-ide` — implement `PrettyPrint` (renders AST as source) and `CountIdents` (counts unique names) using a shared `Visitor` infrastructure

**Anchors**:
- ⇠ RC4.1.1 (traits) if the Visitor trait definition is unfamiliar

**Closing question**: ¿Por qué LLVM usa el Visitor pattern para sus passes en lugar de match exhaustivo? ¿Qué escala de base de código hace que el Visitor sea la elección correcta?

---

## Course B — Semántica

**Course BlogPost**: "Lo que el programa significa"

Conceptual axis: The parser verifies grammatical correctness — valid syntax. Semantic analysis verifies *meaning* — that variables are declared before use, that types are consistent, that functions receive the right argument types. The parser asks "is this valid syntax?"; the semantic analyzer asks "does this make sense?"

Action-IDEs at course level:
- `compare` — two programs that parse correctly but fail semantic analysis: (1) undefined variable, (2) type mismatch
- `mini-sim` — the symbol table being built as code is scanned; lookup succeeding and failing

---

### Module B.1 — Tablas de Símbolos

**Module BlogPost**: A symbol table maps names to their declarations. Scoping rules determine which declaration a name refers to at any given program point. Getting this right — nested scopes, forward references, shadowing — is the foundation for all further semantic analysis.

---

#### Unit B.1.1 — Scope y resolución de nombres
*D1 · render_mode = "blog"*

**BlogPost axis**: A scope is a region where a name is valid. When a name is used, the compiler searches enclosing scopes outward until it finds a declaration. The symbol table implements this search as a stack of maps.

**Topics**:
- The symbol table: a `Vec<HashMap<String, Symbol>>` — a stack of scopes
- Lookup: search from the top of the stack downward; the innermost declaration wins (shadowing)
- Entering a scope: push a new `HashMap`; leaving: pop it
- Shadowing: inner scope declaration hides outer; both exist simultaneously
- Block scope: `{ let x = 1; }` — `x` goes out of scope at `}`
- Function scope: parameters live in the function's outermost scope; locals in nested blocks
- Name resolution pass: a tree walk that resolves each `Ident` to its declaration

**Action-IDEs**:
- `mini-sim` — scope stack animated: push scope, define `x`, push inner scope, shadow `x`, pop inner scope, `x` resolves to outer again
- `expanded-ide` — implement the scope stack and a name resolution pass; handle: undefined variable error, shadowing, use-before-declaration

**Anchors**:
- ⇠ RC3.3.2 (borrowing in practice) if mutable borrows into the scope stack produce borrow checker errors

**Closing question**: ¿Por qué los lenguajes de programación tienen scope léxico en lugar de scope dinámico? ¿Qué cambiaría en el compilador si el lenguaje usara scope dinámico?

---

#### Unit B.1.2 — Resolución de nombres en múltiples pasadas
*D2 · render_mode = "studio"*

**BlogPost axis**: Some languages allow forward references — using a name before declaring it (mutually recursive functions, for example). A single-pass resolver cannot handle this. The student adds a first-pass declaration scan before the full resolution pass.

**Topics**:
- The forward reference problem: in single-pass resolution, `fn foo() { bar(); } fn bar() { }` fails because `bar` is not yet declared when `foo` is resolved
- Two-pass approach: first pass collects all top-level declarations (function names); second pass resolves all uses
- The declaration vs. definition distinction: a declaration is a name and type; a definition includes the body
- What can and cannot be forward-referenced: top-level items yes; local variables no
- Implementing the two-pass: a `collect_declarations` walk that populates the global scope without descending into bodies

**Action-IDEs**:
- `full-lab` — add a declaration collection pass; test with mutually recursive functions; verify the symbol table is populated before resolution begins
- `inline-action` — which of these is a forward reference error: a function calling a later-defined function vs. a variable used before its `let`?

**Closing question**: ¿Por qué C requiere declaraciones antes del uso (prototipos de función) mientras que Rust no? ¿Qué implica eso para el compilador de cada lenguaje?

---

### Module B.2 — Verificación de Tipos

**Module BlogPost**: Type checking verifies that every expression has a consistent type and that types match at every point of use. For a statically typed language, this eliminates an entire class of runtime errors at compile time.

---

#### Unit B.2.1 — Reglas de tipo y verificación
*D1 · render_mode = "blog"*

**BlogPost axis**: A type system is a set of inference rules of the form: "if the sub-expressions have these types, then this expression has this type." The type checker applies these rules recursively to every node in the AST. An expression is type-correct if a derivation using these rules exists.

**Topics**:
- Type environments (Γ): a mapping from variables to their declared types
- Typing judgment notation: `Γ ⊢ e : T` — "in environment Γ, expression e has type T"
- Rules for base cases: integer literal has type Int; variable `x` has type Γ(x)
- Rules for operations: if `e1 : Int` and `e2 : Int` then `e1 + e2 : Int`
- Rules for conditionals: condition must be Bool; both branches must have the same type
- Rules for functions: parameter types declared; body type must match the declared return type
- Type errors: reporting the expected type, the actual type, and the source span

**Action-IDEs**:
- `stepper` — type-checking `if x > 0 { 1 + 1 } else { "hello" }`: the rules applied at each node; the mismatch at the if branches
- `expanded-ide` — implement a type checker for our language: binary operators, conditionals, let bindings, function calls; produce typed errors with spans

**Xrefs**:
- ↔ Rust RC4.1: "The type system you're implementing has formal rules. Rust's type system has the same structure — more complex, but the same formal foundations."

**Closing question**: ¿Qué significa que un sistema de tipos sea "sound"? ¿Puede un sistema sound rechazar programas correctos? ¿Cómo afecta ese tradeoff a un lenguaje real?

---

#### Unit B.2.2 — Inferencia local de tipos
*D2 · render_mode = "blog"*

**BlogPost axis**: Type annotation on every variable is tedious. Local type inference lets the compiler deduce types from usage within a single expression or binding. The student extends the type checker to infer types in `let` bindings without explicit annotations.

**Topics**:
- Local inference: `let x = 5` → infer `x : Int` from the right-hand side
- Bidirectional type checking: type flows outward (from expression) or inward (from annotation or context)
- The `expected_type` parameter: an `Option<Type>` threading through the checker; guides literal inference
- Where local inference fails: mutually dependent bindings where the type of each depends on the other
- Type annotations as documentation: even when inference would work, function signature annotations are required
- How Rust does it: local bidirectional inference plus constraint solving for generics

**Action-IDEs**:
- `expanded-ide` — extend the type checker to support both annotated and unannotated let bindings; infer types from the RHS; report errors when annotation doesn't match
- `compare` — the same program with full annotations vs. with inferred types: the checker's work is identical; the programmer writes less

**Closing question**: ¿Por qué Rust exige anotaciones de tipo en las firmas de funciones incluso cuando podría inferirlas? ¿Qué garantía le ofrece eso al lector del código?

---

### Module B.3 — Hindley-Milner

**Module BlogPost**: Hindley-Milner (HM) is the type inference algorithm behind Haskell, ML, and Rust's generic type resolution. Instead of local deduction, it assigns type variables to unknown types and solves a constraint system to determine what those variables must be. Understanding HM explains why Rust needs annotations for generic functions and where the borrow checker fits in.

---

#### Unit B.3.1 — Variables de tipo y el sistema de restricciones
*D2 · render_mode = "blog"*

**BlogPost axis**: HM works by generating type constraints during AST traversal, then solving them. Unknown types are represented as fresh type variables `α`. The traversal emits equations (`α = Int`, `α = β → γ`). Solving these equations produces a concrete type for every subexpression.

**Topics**:
- Type variables: `α`, `β`, `γ` — placeholders for unknown types
- Constraint generation: for each expression, emit a constraint expressing what must hold for it to type-check
- The `let` polymorphism example: `let id = fn x -> x in (id 1, id "hello")` — `id` is used at two different types; this works in HM
- Type schemes (polytypes): `∀α. α → α` — the type of the identity function; `α` can be instantiated to any concrete type
- Substitutions: a mapping from type variables to types; applying it replaces all occurrences of the variable

**Action-IDEs**:
- `stepper` — constraint generation for a small program: each AST node generates a constraint; the set accumulates; then unification solves it
- `mini-sim` — the substitution applied iteratively: type variables replaced one by one as constraints are solved

**Portals**:
- → Rust RC4.2: "HM is the foundation of Rust's generic type resolution. When you write `fn id<T>(x: T) -> T`, the compiler runs something analogous to HM to infer what `T` is at each call site."

**Closing question**: ¿Por qué Hindley-Milner no puede inferir tipos para todos los programas? ¿Qué característica de los lenguajes con traits (como Rust) requiere anotaciones adicionales?

---

#### Unit B.3.2 — El algoritmo de unificación
*D3 · render_mode = "studio"*

**BlogPost axis**: Unification finds a substitution that makes two types equal. Given `α` and `Int`, the substitution is `{α ↦ Int}`. Given `α → Int` and `Bool → β`, the substitution is `{α ↦ Bool, β ↦ Int}`. Robinson's unification algorithm solves the complete constraint set and detects circular types (the occurs check). This unit implements it.

**Topics**:
- Unification rules: `unify(Int, Int)` = trivial; `unify(α, T)` = `{α ↦ T}`; `unify(T1 → T2, T3 → T4)` = `unify(T1, T3)` combined with `unify(T2, T4)`
- The occurs check: `unify(α, α → Int)` would produce an infinite type; detect and reject
- Union-find: an efficient data structure for substitutions; amortized O(α(N)) per operation
- Algorithm W: the complete HM algorithm — constraint generation plus unification in one pass
- Why Rust requires annotations for generic functions: the borrow checker adds constraints beyond what HM handles alone

**Action-IDEs**:
- `full-lab` — implement Robinson unification over `T = Int | Bool | T → T | α`; run it on the constraint set from the previous unit; add the occurs check; pass the provided test suite

**Portals**:
- → Rust RC3.2.3: "The borrow checker runs after HM-style type inference. Types are resolved first; the borrow checker then adds lifetime constraints on top of that resolved type information."

**Closing question**: ¿Qué pasa cuando el occurs check falla — cuando se forma un tipo circular? ¿Hay lenguajes que permiten tipos infinitos? ¿Para qué sirven?

---

## Course C — Representaciones Intermedias

**Course BlogPost**: "Entre el árbol y el metal"

Conceptual axis: The AST is structured for readability. Machine code is structured for execution. Neither form is good for optimization: the AST is tree-shaped (analysis is hard), machine code is machine-specific (not portable). Intermediate representations exist between these two extremes: low enough to be close to machine code, high enough to be machine-independent. This is where optimization happens.

Action-IDEs at course level:
- `stepper` — the same simple program lowered from AST → TAC → SSA: three representations side by side
- `mini-sim` — a constant fold shown before and after on the three-address code

---

### Module C.1 — Por Qué Existen los IRs

**Module BlogPost**: You cannot optimize the AST — it's tree-structured, which makes data flow analysis hard. You don't want to optimize machine code — it would be target-specific. The IR is designed specifically to make analysis and transformation tractable.

---

#### Unit C.1.1 — La brecha entre el AST y el ensamblador
*D1 · render_mode = "blog"*

**BlogPost axis**: Why not compile directly from the AST? Because the AST encodes syntactic structure, not computational structure. An `if` expression in the AST is a single node; in machine code it is a conditional branch to one of two code sequences. The lowering from AST to IR makes that structure explicit.

**Topics**:
- What the AST is good for: traversal, source location tracking, semantic analysis
- What the AST is bad for: optimization (hard to see data dependencies), register allocation (no notion of temporaries)
- The gap: between `1 + 2 * 3` as a tree and `t1 = 2 * 3; t2 = 1 + t1` as sequential instructions
- Why sequential instructions work better for optimization: data flow is explicit; each instruction has explicit inputs and outputs
- Multiple IRs in real compilers: GCC has GIMPLE and RTL; LLVM has IR and MachineIR — each optimized for a specific phase

**Action-IDEs**:
- `compare` — the same `for` loop as AST vs. as three-address code: the loop condition, increment, and body as explicit instructions vs. nested nodes
- `inline-action` — lower this expression to TAC manually: `x = (a + b) * (a - b)`; introduce temporaries; verify the result

**Closing question**: ¿Por qué LLVM tiene múltiples IRs (LLVM IR, SelectionDAG, MachineIR) en lugar de uno solo? ¿Qué problema resuelve cada transición?

---

#### Unit C.1.2 — Código de tres direcciones
*D1 · render_mode = "blog"*

**BlogPost axis**: Three-address code (TAC) is the simplest IR: each instruction has at most two source operands and one destination. Every complex expression is broken into a sequence of simple instructions with explicit temporaries. The student lowers the AST to TAC for our language.

**Topics**:
- TAC instruction types: `t = a op b` (binary), `t = op a` (unary), `t = a` (copy), `goto L` (unconditional), `if a goto L` (conditional), `call f(a, b) → t`, `return a`
- Labels: targets for `goto`; virtual at this stage (not yet memory addresses)
- Temporaries: synthetic variables (`t0`, `t1`, ...) not visible in the source language
- Lowering an if/else: fresh labels for each branch and one for the join point
- Lowering a while loop: loop header label, condition check, body, back edge `goto`
- The lowering function: recursive over the AST; returns the temporary holding the result of each expression

**Action-IDEs**:
- `expanded-ide` — implement the AST-to-TAC lowering pass for expressions and statements; include if/else and while loops; print the TAC and verify by tracing execution mentally
- `stepper` — lowering a while loop: the AST node becomes six TAC instructions with two labels

**Anchors**:
- ⇠ RC6.2.2 (async/await as state machine): "The lowering of while to gotos is the same kind of transformation the async desugaring does."

**Closing question**: ¿Por qué los temporaries en TAC no tienen tipos explícitos, aunque el lenguaje fuente sea tipado estáticamente? ¿Dónde se guarda la información de tipos en esta fase?

---

### Module C.2 — La Forma SSA

**Module BlogPost**: Single Static Assignment (SSA) form is a property of the IR where every variable is assigned exactly once. This constraint, combined with explicit φ (phi) nodes at control flow join points, makes many analyses trivially easy. GCC, LLVM, V8 — all convert to SSA before optimizing.

---

#### Unit C.2.1 — Static Single Assignment
*D2 · render_mode = "blog"*

**BlogPost axis**: In TAC, a variable can be assigned multiple times — tracing where a value came from requires following all assignments. In SSA form, each variable has exactly one static assignment. This makes the definition of every variable trivially findable and reduces most optimizations from O(N²) to O(N).

**Topics**:
- The SSA property: every variable assigned exactly once (statically); multiple dynamic executions are fine
- Renaming: `x = 1; x = x + 1; use(x)` becomes `x_0 = 1; x_1 = x_0 + 1; use(x_1)`
- The use-def chain: in SSA, each use has exactly one def; no ambiguity, no aliasing
- Why SSA simplifies constant propagation: a single assignment propagates to every use immediately
- Why SSA simplifies dead code elimination: a variable with no uses is trivially dead

**Action-IDEs**:
- `stepper` — converting a TAC function to SSA: renaming variables step by step; watch each use-def link become unambiguous
- `compare` — constant propagation in TAC (must trace all assignments) vs. SSA (single assignment; propagation is immediate)
- `inline-action` — how many distinct SSA variable versions does this TAC produce?

**Portals**:
- → from RC3.2.3: "The borrow checker's NLL analysis is a liveness-based dataflow. SSA form makes dataflow efficient — the borrow checker operates on a representation closely related to SSA."

**Closing question**: ¿Por qué SSA hace que constant propagation sea O(N) en lugar de O(N²)? ¿Qué propiedad de SSA hace la diferencia?

---

#### Unit C.2.2 — Phi nodes y el problema del join
*D2 · render_mode = "studio"*

**BlogPost axis**: When control flow merges — after an if/else, at a loop header — the same name can have come from different paths. SSA uses a φ (phi) node to express this: a special instruction that selects the correct version depending on which predecessor the current execution came from. Computing where phi nodes are needed requires dominance analysis.

**Topics**:
- The join problem: at the merge point after `if (c) { x = 1 } else { x = 2 }`, which `x` do you use?
- Phi node: `x_2 = φ(x_0, x_1)` — "x_0 if from the true branch, x_1 if from the false branch"
- Dominance: block A dominates block B if every path from the entry to B passes through A
- The dominance frontier: the set of blocks just beyond A's dominance region — where phi nodes for variables defined in A are needed
- Algorithm: compute dominance tree → compute dominance frontiers → insert phi nodes at frontiers → rename variables

**Action-IDEs**:
- `full-lab` — implement phi node insertion: given a TAC function with branches, compute the dominance frontier and insert phi nodes; rename to SSA form; verify against expected output
- `mini-sim` — a CFG with a join: animate which predecessor each phi node selects from across two execution paths

**Closing question**: ¿Por qué LLVM eliminó los phi nodes clásicos en favor de "block arguments" en las versiones recientes? ¿Qué problema resuelve esa transición?

---

### Module C.3 — Flujo de Control

**Module BlogPost**: The control flow graph (CFG) is the graph-theoretic view of a function's possible executions. Nodes are basic blocks; edges are jumps. Once the CFG is explicit, most compiler analyses become graph algorithms: dominance (tree traversal), liveness (backward dataflow), reaching definitions (forward dataflow).

---

#### Unit C.3.1 — Basic blocks
*D1 · render_mode = "blog"*

**BlogPost axis**: A basic block is a maximal sequence of instructions with one entry point and one exit point — no jumps in except at the start, no jumps out except at the end. Control flow within a block is sequential; control flow between blocks is explicit as CFG edges.

**Topics**:
- Leader detection: an instruction is a leader if it is the first instruction, a jump target, or follows a jump
- Basic block construction: partition instructions at leaders; each block ends with a jump or return
- Terminators: `goto L`, `if c goto L else M`, or `return v`
- The `BasicBlock` struct: a label, `Vec<Instruction>` for the body, and a `Terminator`
- Why basic blocks matter: within a block, all instructions execute in sequence — local analysis is straightforward

**Action-IDEs**:
- `stepper` — identify basic block leaders in a TAC listing; partition into basic blocks; draw the CFG edges
- `expanded-ide` — implement basic block partitioning; build a `Vec<BasicBlock>` from a `Vec<Instruction>`

---

#### Unit C.3.2 — El grafo de flujo de control
*D2 · render_mode = "blog"*

**BlogPost axis**: The CFG is the directed graph where nodes are basic blocks and edges represent control flow. Building it from basic blocks is straightforward — follow the jumps. Using it is more interesting: dominance, postorder traversal, and predecessor/successor relationships underlie all major compiler analyses.

**Topics**:
- CFG construction: for each terminator, add edges to the target blocks
- Entry and exit nodes: the CFG has a single entry; add a synthetic exit for functions with multiple returns
- Predecessor and successor lists: each block stores both; analyses need them in both directions
- Postorder and reverse postorder traversal: the canonical order for most dataflow analyses
- Dominance computation: the iterative algorithm; the dominator tree; immediate dominators

**Action-IDEs**:
- `expanded-ide` — implement CFG construction; compute predecessor/successor lists; print the CFG in DOT format for visualization
- `mini-sim` — an interactive CFG: add edges and watch the dominator tree update; postorder traversal shown step by step

**Portals**:
- → from RC3.2.3: "The borrow checker performs liveness analysis on the CFG. You're building the infrastructure that analysis runs on."

---

#### Unit C.3.3 — Análisis de flujo de datos: liveness
*D2 · render_mode = "blog"*

**BlogPost axis**: A variable is *live* at a program point if its current value will be used on some future execution path. Liveness analysis is a backward dataflow problem: starting from uses, propagate liveness backward through the CFG. The result tells the register allocator which variables must simultaneously occupy registers.

**Topics**:
- Dataflow equations: `LiveIn(B) = Use(B) ∪ (LiveOut(B) − Def(B))`; `LiveOut(B) = ∪ LiveIn(S)` for each successor S
- The iterative fixed-point algorithm: initialize all sets to empty; apply equations; stop when nothing changes
- `use(B)`: variables used in B before any definition in B; `def(B)`: variables defined in B
- Complexity: O(N × E) iterations in the worst case; in practice, converges in a few iterations
- What liveness is used for: register allocation (live variable needs a register); dead code elimination (never-live definition is dead)

**Action-IDEs**:
- `full-lab` — implement liveness analysis: given a CFG with use/def sets per block, compute LiveIn and LiveOut using the iterative algorithm; verify against expected output
- `stepper` — one iteration of the fixpoint: sets for each block before and after; see which blocks changed

**Xrefs**:
- ↔ Rust RC3.2.3: "This is the algorithm the borrow checker runs (in a more sophisticated form) to track which borrows are live at each point. Now you know exactly how it works."

**Closing question**: ¿Por qué liveness analysis es backward dataflow y reaching definitions es forward dataflow? ¿Qué determina la dirección de un análisis de dataflow?

---

## Course D — Optimizaciones

**Course BlogPost**: "Hacer más con menos"

Conceptual axis: The compiler's job is not just correctness — it is also performance. An unoptimized compiler generates correct but verbose code: constants that could be folded, dead code that could be removed, loop-invariant computations done N times instead of once. Optimization is the set of transformations that preserve semantics while improving execution characteristics.

Action-IDEs at course level:
- `compare` — the same program compiled with zero optimizations vs. with three passes: instruction count before and after
- `stepper` — the optimization pipeline: how each pass feeds the next; why ordering matters

---

### Module D.1 — Optimizaciones Locales

**Module BlogPost**: Local optimizations work within a single basic block without requiring control flow analysis. They are cheap to compute and often have large impact because they eliminate the overhead of named constants and redundant computations.

---

#### Unit D.1.1 — Constant folding y propagación de constantes
*D1 · render_mode = "blog"*

**BlogPost axis**: Constant folding evaluates expressions at compile time when both operands are constants. `t = 2 + 3` becomes `t = 5` — no instruction needed at runtime. Constant propagation replaces uses of a known-constant variable with its value. Together, they eliminate much of the overhead of named constants.

**Topics**:
- Constant folding: if both operands of a binary instruction are literals, evaluate at compile time
- The fold: `t = 2 + 3` → `t = 5`; `if true goto L1 else L2` → `goto L1`
- Constant propagation: if `x = 5` is the only definition of `x`, replace all uses of `x` with `5`
- In SSA form: constant propagation is trivial — one definition; if it's constant, every use is constant
- Sparse Conditional Constant Propagation (SCCP): combines propagation with CFG analysis to eliminate unreachable branches

**Action-IDEs**:
- `expanded-ide` — implement constant folding as a pass over basic blocks: if a binary op has two literal operands, replace with a copy of the computed constant; run to fixpoint
- `stepper` — tracing SCCP: the lattice values (⊥, constant c, ⊤) for each variable; the worklist; the final result

**Closing question**: ¿Por qué constant propagation es más poderoso en forma SSA que en TAC sin SSA? ¿Qué propiedad de SSA hace la diferencia?

---

#### Unit D.1.2 — Eliminación de código muerto
*D2 · render_mode = "blog"*

**BlogPost axis**: Dead code is code whose result is never used and whose removal doesn't change observable behavior. In SSA form, DCE is trivial: a definition is dead if the defined variable has no uses. Mark used definitions; sweep unused ones.

**Topics**:
- What makes code dead: a variable defined but never used; a block with no predecessors in the CFG; a branch the condition analysis proves unreachable
- DCE in SSA: mark any definition whose variable has at least one use; remove all unmarked definitions; iterate
- Aggressive DCE: also removes side-effect-free operations whose results are dead
- Unreachable code elimination: blocks with no predecessors in the CFG are removed
- Interaction with constant folding: folding a conditional may make a branch unreachable → unreachable block → dead code in that block

**Action-IDEs**:
- `expanded-ide` — implement DCE after running constant folding: scan for zero-use definitions; remove them; verify no observable behavior changed
- `compare` — a program with three obvious dead assignments before and after the full optimization pipeline

**Closing question**: ¿Puede el compilador eliminar instrucciones con efectos secundarios (I/O, writes a memoria compartida)? ¿Cómo decide el compilador qué instrucciones son seguras de eliminar?

---

### Module D.2 — Optimizaciones Globales

**Module BlogPost**: Global optimizations span multiple basic blocks. They require the CFG and are more expensive to compute — but they can transform patterns that no amount of local analysis can touch.

---

#### Unit D.2.1 — Inlining de funciones
*D2 · render_mode = "blog"*

**BlogPost axis**: Function inlining replaces a call with the function's body directly. The call overhead disappears, and the inlined body becomes visible to surrounding optimization passes — enabling further constant propagation and dead code elimination. The tradeoff: binary size grows; too much inlining hurts instruction cache behavior.

**Topics**:
- What inlining does: replaces `result = call f(a, b)` with a copy of f's body; parameters replaced by arguments; returns replaced by copies to `result`
- The inlining heuristic: small functions, functions called once, functions on hot paths
- What inlining enables: after inlining, callee's constants propagate into the caller; dead branches appear
- The dangers of over-inlining: code size explosion; I-cache pressure
- Recursive functions: cannot be inlined naively; bounded to N levels
- Implementation: substitute parameters, relabel temporaries and labels to avoid conflicts, splice into the caller's CFG

**Action-IDEs**:
- `expanded-ide` — implement inlining for small (≤ 10 instruction) non-recursive functions; run constant propagation and DCE after; observe the compound improvement
- `compare` — a loop calling a small function: before inlining (call overhead per iteration) vs. after (body in the loop, constant propagated, branch eliminated)

**Closing question**: ¿Cómo decide Rust cuándo hacer inlining de una función genérica? ¿Qué diferencia hay entre `#[inline]`, `#[inline(always)]`, y `#[inline(never)]`?

---

#### Unit D.2.2 — Loop optimizations: LICM
*D3 · render_mode = "studio"*

**BlogPost axis**: Loop-invariant code motion (LICM) moves computations from inside a loop to a preheader that runs once before the loop. A multiply that doesn't change across iterations runs once instead of N times. Detecting invariant code requires natural loop detection and dominance analysis.

**Topics**:
- Natural loops: a loop with a single entry point (the header); identified via back edges (edges from dominated block to dominator)
- Loop detection: find all back edges in the CFG; for each back edge n → h, the natural loop = {n} ∪ {all nodes dominated by h that reach n without passing through h}
- Loop-invariant instruction: all operands are constants or defined outside the loop
- LICM safety conditions: the instruction must dominate all loop exits; no side effects
- The preheader: a synthetic block inserted before the loop header; hoisted code goes here

**Action-IDEs**:
- `full-lab` — implement LICM: detect natural loops; identify loop-invariant instructions; insert preheaders; hoist invariant code; verify with a benchmark that the inner loop's operation count drops

**Closing question**: ¿Por qué el compilador no mueve automáticamente *toda* instrucción costosa fuera del loop? ¿Qué condición hace que LICM sea inseguro para una instrucción específica?

---

### Module D.3 — Medición

**Module BlogPost**: Optimization without measurement is guesswork. This module establishes how to verify that a pass actually helps — and what the measurements do and do not tell you.

---

#### Unit D.3.1 — Medir el impacto de las optimizaciones
*D2 · render_mode = "studio"*

**BlogPost axis**: Instruction count is a proxy for performance, not performance itself. An instruction that stalls for 100 cycles costs more than 100 fast instructions. This unit measures the optimization pipeline using QEMU's instruction counter and a benchmark suite, and teaches how to interpret the results.

**Topics**:
- QEMU's instruction counter: `qemu-riscv64 -icount 1` gives an exact count for deterministic programs
- The benchmark suite: programs stressing different passes (constant-heavy, loop-heavy, dead-code-heavy)
- Before/after comparison: compile with zero passes, each pass individually, and all together
- The interaction effect: the sum of individual improvements is less than all-passes together; passes compose
- Code size: `.text` section size before and after; inlining grows it; DCE shrinks it

**Action-IDEs**:
- `project-action` — run the optimization benchmark suite: compile each test with all combinations of passes; record instruction counts; identify which pass has the most impact on each benchmark; write a short analysis

**Closing question**: ¿Por qué el benchmarking correcto en sistemas reales es difícil? ¿Qué factores hacen que un benchmark en QEMU sea una mala predicción del rendimiento en hardware real?

---

## Course E — Generación de Código: El Arco RISC-V

**Course BlogPost**: "De IR a instrucciones reales"

Conceptual axis: The IR is abstract — it has variables, not registers; labeled jumps, not memory addresses. Code generation maps the abstract to the concrete. This course does that mapping for RISC-V in three phases: first, generate code directly (feel the coupling); then abstract it (`CodegenTarget` trait); then understand what Cranelift solves (because you've lived the problem).

Action-IDEs at course level:
- `compare` — the same function in IR, RISC-V assembly, and x86-64 assembly: same semantics, three instruction sequences
- `mini-sim` — RISC-V pipeline overview: the 47 base instructions grouped by type

---

### Module E.1 — Asignación de Registros

**Module BlogPost**: The IR has unlimited virtual variables. RISC-V has 32 registers. Register allocation maps the infinite to the finite. It is NP-complete in general, so practical allocators use heuristics — primarily graph coloring of the interference graph.

---

#### Unit E.1.1 — Grafos de interferencia y liveness
*D2 · render_mode = "blog"*

**BlogPost axis**: Two virtual variables *interfere* if they are simultaneously live at some program point — meaning they cannot occupy the same register. The interference graph has variables as nodes and interference as edges. Register allocation is graph coloring with K colors (K = number of registers).

**Topics**:
- Liveness intervals: each variable is live from its definition to its last use
- Interference: two variables interfere if their liveness intervals overlap; this becomes an edge
- Building the interference graph: for each program point, every pair of simultaneously live variables gets an edge
- Register allocation as graph coloring: K-color the interference graph (K = 32 for RISC-V)
- Why K-colorability is NP-complete in general; why it works well in practice

**Action-IDEs**:
- `mini-sim` — interference graph builder: enter liveness intervals for five variables; watch interference edges appear; attempt to color the graph manually
- `expanded-ide` — implement interference graph construction from liveness analysis output; emit DOT format for visualization

**Xrefs**:
- ↔ OS D [context-switching]: "The registers saved in a context switch are exactly the live variables at the preemption point. The OS saves what the register allocator leaves live."

---

#### Unit E.1.2 — Graph coloring y spilling
*D3 · render_mode = "studio"*

**BlogPost axis**: Chaitin's algorithm colors the interference graph greedily: push low-degree nodes on a stack, remove them from the graph, recurse. When coloring, pop nodes and assign the smallest color not used by any neighbor. If a node cannot be colored, *spill* it — use a stack slot instead of a register.

**Topics**:
- Chaitin's simplification: push nodes with fewer than K neighbors; if all have K or more, pick a spill candidate (optimistic coloring)
- Coloring phase: pop nodes; assign the smallest color not used by any neighbor
- Spill handling: a spilled variable lives in a stack slot; each use is preceded by a load, each def by a store
- Spill cost heuristic: prefer spilling variables with low use frequency and use count outside loops
- Rematerialization: some variables can be recomputed cheaply instead of loaded from the stack

**Action-IDEs**:
- `full-lab` — implement Chaitin's allocator: simplification → select (spill) → coloring; produce a mapping from virtual register to physical register or stack slot; validate by running the compiled output in QEMU

**Portals**:
- → OS D: "The registers you're allocating map to the exact registers the OS context switch saves. When the OS interrupts your program, these are the registers that must be preserved."

**Closing question**: ¿Por qué LLVM usa linear scan allocation en su JIT (ORC) pero graph coloring en el path AOT (LLVM CodeGen)? ¿Qué tradeoff hace cada uno?

---

### Module E.2 — Selección de Instrucciones

**Module BlogPost**: Instruction selection maps IR instructions to machine instructions. It is not a one-to-one mapping — some IR constructs require multiple machine instructions, some can be combined. The student implements selection for RISC-V using pattern matching on the IR.

---

#### Unit E.2.1 — Selección de instrucciones: de IR a ISA
*D1 · render_mode = "blog"*

**BlogPost axis**: Each IR instruction maps to one or more machine instructions. Simple cases are trivial: `t = a + b` → `add rd, rs1, rs2`. Complex cases require multiple instructions: a 32-bit immediate load on RISC-V requires two instructions (LUI + ADDI) because immediates are 12 bits.

**Topics**:
- One-to-one: `add t, a, b` → `add rd, rs1, rs2`; `t = a` → `mv rd, rs1`
- One-to-many: a 32-bit constant → `lui rd, upper20` + `addi rd, rd, lower12`
- Many-to-one (strength reduction): `t = a * 4` → `slli rd, rs, 2` (shift instead of multiply)
- Address computation: `t = a[i]` → scale index, add base, load
- Memory access: loads (`lw`, `ld`, `lb`), stores (`sw`, `sd`, `sb`), with offset

**Action-IDEs**:
- `stepper` — instruction selection for `(a + b) * 4 - c`: each IR node matched to its RISC-V sequence
- `expanded-ide` — implement instruction selection for the IR core: arithmetic, comparisons, loads/stores, calls; produce an assembly listing

---

#### Unit E.2.2 — El ISA RISC-V: las 47 instrucciones base
*D1 · render_mode = "blog"*

**BlogPost axis**: The RISC-V base integer instruction set (RV64I) has 47 instructions. Each does one thing. Their simplicity is deliberate — RISC-V was designed to be understood, implemented, and formally verified. This unit covers all 47 and builds the intuition for what the codegen must emit.

**Topics**:
- Instruction formats: R-type (register-register), I-type (register-immediate), S-type (store), B-type (branch), U-type (upper immediate), J-type (jump)
- Arithmetic: `add`, `sub`, `addi`, `mul`, `div`, `rem`, `slli`, `srli`, `srai`
- Logic: `and`, `or`, `xor`, `andi`, `ori`, `xori`
- Loads: `lb`, `lh`, `lw`, `ld` (byte, halfword, word, doubleword)
- Stores: `sb`, `sh`, `sw`, `sd`
- Branches: `beq`, `bne`, `blt`, `bge`, `bltu`, `bgeu` — compare and branch in one instruction
- Jumps: `jal rd, label` (jump and link); `jalr rd, rs, imm` (indirect)
- Load Upper Immediate: `lui rd, imm20` — 32-bit constants need `lui` + `addi`
- System: `ecall` (syscall), `ebreak` (debugger trap)

**Action-IDEs**:
- `mini-sim` — RISC-V instruction reference: click any instruction; see its encoding, operation, and a concrete example
- `inline-action` — translate C expressions to RISC-V: `a + b`, `a[3]`, `if (a < b) goto L`
- `stepper` — reading a function's RISC-V assembly: prologue, body, epilogue — identify each instruction's role

**Xrefs**:
- ↔ OS A [bare-metal-boot]: "Your first instruction is the output of this code generator. The boot sequence hands off to exactly what codegen produces."
- ↔ OS A [mmio]: "Memory-mapped I/O uses the same load/store instructions you're generating here. The distinction is only the address."

**Closing question**: ¿Por qué RISC-V tiene instrucciones de branch que comparan y saltan en una sola instrucción, en lugar de una instrucción de comparación separada que escribe a un registro de flags? ¿Qué evita ese diseño?

---

### Module E.3 — Calling Conventions

**Module BlogPost**: The calling convention is the ABI — the binary interface between caller and callee. It specifies which registers pass arguments, which holds the return value, and which the callee must preserve. Every function call the codegen emits must obey this contract. Breaking it produces crashes that are nearly impossible to debug without this knowledge.

---

#### Unit E.3.1 — La ABI RISC-V
*D1 · render_mode = "blog"*

**BlogPost axis**: The RISC-V calling convention (LP64D ABI used on Linux): arguments in a0–a7 (up to 8 integer args; further args spilled to stack); return value in a0/a1; caller-saved registers (a0–a7, t0–t6, ra); callee-saved registers (s0–s11, sp). This contract is what makes it possible to call your generated code from C.

**Topics**:
- RISC-V register naming: x0 (zero), ra (return address), sp (stack pointer), a0–a7 (args/return), t0–t6 (temporaries, caller-saved), s0–s11 (saved, callee-saved)
- Argument passing: first 8 integers in a0–a7; further arguments on the stack
- Return value: integer result in a0; 64-bit result in a0/a1
- Caller-saved: the caller does not expect them to survive a call; the callee can use them freely
- Callee-saved: the callee must preserve them; save/restore from the stack if used
- The ABI as a contract: both sides must follow it; your codegen calls C (the runtime) and is called by it (the entry point)

**Action-IDEs**:
- `mini-sim` — calling convention visualizer: create a call with 10 arguments; watch which go in registers, which on the stack
- `stepper` — a function call at the assembly level: caller loads a0–a7; `jal ra, target`; callee receives; returns; caller reads a0
- `inline-action` — for each register, caller-saved or callee-saved? (given the name, choose the category)

**Xrefs**:
- ↔ OS D [context-switching]: "The callee-saved registers in this ABI are exactly the registers the OS saves in the context switch — saving what the ABI guarantees must be preserved."
- ↔ C Track CC3.3.3: "The x86-64 System V ABI you studied in CC3.3.3 has the same structure: argument registers, caller/callee-saved split, stack overflow for extra args."

**Closing question**: ¿Por qué existe la distinción entre caller-saved y callee-saved en lugar de que todos los registros sean uno u otro? ¿Qué coste tendría cada extremo?

---

#### Unit E.3.2 — Prólogo, epílogo y el stack frame
*D2 · render_mode = "studio"*

**BlogPost axis**: Every function must set up a stack frame on entry (prologue) and tear it down on exit (epilogue). The prologue saves callee-saved registers that will be used, allocates space for local variables, and sets up the frame pointer. The epilogue mirrors this. The codegen must emit correct prologues and epilogues for every function.

**Topics**:
- The prologue: `addi sp, sp, -N` (allocate frame); `sd ra, N-8(sp)` (save return address); `sd s0, N-16(sp)` (save used callee-saved regs)
- The epilogue: restore saved registers; `addi sp, sp, N`; `ret` (= `jalr x0, ra, 0`)
- Frame size: count local variables and callee-saved register slots; must be 16-byte aligned
- Stack frame layout: saved registers at top; local variables below
- Generating prologues and epilogues: for each IR function, compute the frame size; emit prologue before the translated body; emit epilogue at each return

**Action-IDEs**:
- `full-lab` — implement prologue/epilogue generation: compute used callee-saved registers and spill slots; emit correctly; the test suite verifies that callee-saved registers survive across calls and locals are accessible at the right offsets

**Closing question**: ¿Por qué el stack pointer debe estar alineado a 16 bytes antes de una llamada? ¿Qué instrucción RISC-V o rutina de runtime fallaría si no lo estuviera?

---

### Module E.4 — Output ELF

**Module BlogPost**: The assembler has emitted instructions. The ELF file packages them — with symbol tables, section headers, and relocation entries — into a format the OS can load and execute. This module produces a real ELF binary and runs it in QEMU, closing the loop from source to execution.

---

#### Unit E.4.1 — Secciones ELF y la tabla de símbolos
*D1 · render_mode = "blog"*

**BlogPost axis**: An ELF file is organized into sections. `.text` contains the machine code. `.data` contains initialized global variables. `.rodata` contains read-only data. `.bss` marks zero-initialized globals without storing them. The symbol table maps names to addresses. The student produces a minimal correct ELF.

**Topics**:
- ELF file structure: ELF header (magic, class, architecture, entry point) + section headers + program headers + sections
- `.text`: executable code; the section header marks its offset and size
- `.data` and `.rodata`: initialized data; `.rodata` is read-only (page permissions)
- `.bss`: zero-initialized; not stored in the ELF; the OS zeroes the pages at load time
- Symbol table (`.symtab`): name (index into `.strtab`), address, size, section, binding (local/global), type (function/object)
- String table (`.strtab`): null-terminated strings for symbol and section names
- Using the `object` crate: Rust's `object` crate provides an ELF writer API

**Action-IDEs**:
- `expanded-ide` — write a compiled function to a minimal ELF using the `object` crate; add a symbol for the entry point; verify with `readelf -a`
- `stepper` — anatomy of a minimal ELF: view the hex dump; match each region to its section header

**Xrefs**:
- ↔ OS D [process-model]: "The ELF loader in the OS reads exactly what you're producing here. It maps `.text` to an executable page, `.data` to a writable page, and `.bss` to a zero page."

---

#### Unit E.4.2 — Relocaciones y ejecución en QEMU
*D2 · render_mode = "studio"*

**BlogPost axis**: When the compiler emits a function call (`jal ra, func`), it doesn't know the final address of `func`. It emits a relocation entry: "at this offset, patch in the relative distance to this symbol." The linker resolves relocations and produces the final binary. Then the binary runs in QEMU.

**Topics**:
- Why relocations exist: addresses are not known at compile time; each .o file is compiled independently
- RISC-V relocation types: `R_RISCV_CALL` (AUIPC + JALR pair), `R_RISCV_HI20` + `R_RISCV_LO12_I` (32-bit address load), `R_RISCV_BRANCH` (branch within ±4 KB)
- Relocation entry: section, offset (where to patch), type (how to patch), symbol index, addend
- The linker's job: compute the symbol's final address; apply the relocation formula; patch the instruction bytes
- Linking with `riscv64-unknown-elf-ld`: the cross-linker produces a final executable
- Running in QEMU: `qemu-riscv64 output`; the exit code from `li a0, 0; ecall` (syscall exit)

**Action-IDEs**:
- `full-lab` — emit a complete ELF with relocations for function calls; link with `riscv64-unknown-elf-ld`; run in QEMU; the test passes if the program exits with the expected return code — this is the end-to-end test for the compiler pipeline
- `reveal` — what `file output` says, what `readelf -h output` shows, what `objdump -d output` shows — reading the anatomy of what you produced

**Portals**:
- → OS A: "The ELF binary you just produced is what the OS loader reads. In the OS track, you'll implement the other side: the code that takes this file and maps it into memory."

**Xrefs**:
- ↔ OS D [process-model] D1: "You produce ELF; the OS loads ELF. This is the handshake between the two tracks — and the basis of Integration Lab I4."

**Closing question**: ¿Por qué el linker no puede dejar todas las direcciones sin resolver y parchearlas en tiempo de carga? ¿Qué son los "position-independent executables" (PIE) y cómo evitan parte de ese problema?

---

### Module E.5 — El Problema del Acoplamiento

**Module BlogPost**: After Phase 1, the student has a working RISC-V compiler. But it is tightly coupled to RISC-V — instruction selection, register names, ABI, ELF output are all RISC-V-specific. Adding a second target would require duplicating enormous amounts of code. This module makes the coupling explicit.

---

#### Unit E.5.1 — Por qué tu compilador está soldado a RISC-V
*D2 · render_mode = "blog"*

**BlogPost axis**: Open the codegen source. Count the places where RISC-V-specific knowledge is embedded: register names in the instruction selector, ABI in the prologue/epilogue generator, instruction formats in the ELF writer. Adding x86-64 would require either duplication or a complete redesign. This unit makes the student feel the problem before presenting the solution.

**Topics**:
- Inventory of RISC-V-specific code: registers (`a0`, `t0`, `sp`...), instruction names (`addi`, `lw`, `beq`...), instruction encodings, ABI constants, ELF machine type (`EM_RISCV`)
- The coupling problem: machine-specific knowledge scattered throughout; adding a target requires touching all of it
- What a backend-independent compiler looks like: a `Target` trait encapsulating all machine-specific knowledge
- The design question: what is the right boundary between backend-independent and backend-specific code?

**Action-IDEs**:
- `expanded-ide` — audit: grep through the codegen for all hardcoded register names and instruction strings; produce a list; this is the problem statement for the next unit
- `branch` — two paths: (1) duplicate everything for x86-64; (2) abstract it. The student sees the duplication first, then tries the abstraction.

**Closing question**: ¿Por qué GCC ha soportado docenas de arquitecturas durante décadas mientras que otros compiladores se han limitado a una o dos? ¿Qué decisión de diseño temprana lo hace posible?

---

### Module E.6 — El Trait CodegenTarget

**Module BlogPost**: The solution to the coupling problem is a trait that encapsulates everything machine-specific. The trait becomes the boundary between machine-independent (register allocator, instruction scheduler) and machine-specific (instruction selection, ABI, ELF output) parts of the compiler.

---

#### Unit E.6.1 — Diseñar la abstracción
*D2 · render_mode = "blog"*

**BlogPost axis**: A good abstraction hides the right things and exposes the right things. `CodegenTarget` must hide register names, instruction encodings, and ABI details. It must expose how to select instructions, generate prologues/epilogues, and emit output. Getting the boundary right is the core design challenge.

**Topics**:
- What goes in the trait: `fn select_instructions(&self, ir: &Function) -> MachineFunction`; `fn emit_prologue(...)`; `fn emit_elf(...) -> Vec<u8>`
- What stays outside: register allocation (works on abstract registers numbered by the allocator); instruction scheduling (data flow edges are machine-independent)
- Trait objects vs. generics: `Box<dyn CodegenTarget>` (dynamic dispatch, one binary) vs. `Compiler<T: CodegenTarget>` (monomorphization, multiple binaries)
- The architecture after refactoring: `Frontend → IR → Optimizer → RegAlloc → CodegenTarget::select → CodegenTarget::emit`

**Action-IDEs**:
- `compare` — the monolithic RISC-V codegen vs. the refactored version with `CodegenTarget`: same behavior; trace where each machine-specific decision moved
- `expanded-ide` — define the `CodegenTarget` trait; move the existing RISC-V code behind it; all existing tests must still pass

**Anchors**:
- ⇠ RC4.1.2 (trait system in depth) if the trait design is unclear — particularly object safety

---

#### Unit E.6.2 — Segunda implementación: x86-64
*D3 · render_mode = "studio"*

**BlogPost axis**: The true test of an abstraction is whether it accommodates a second use case without being redesigned. This unit adds an x86-64 backend. If the abstraction is well-designed, the new backend fits cleanly. If not, the student discovers the gaps by trying — and learns more from the mismatch than from any lecture.

**Topics**:
- x86-64 vs. RISC-V: 16 GPRs (vs. 32); CISC instructions; complex addressing modes; variable-length encoding
- x86-64 System V ABI: rdi, rsi, rdx, rcx, r8, r9 for arguments; rax for return; two-operand instructions (destination is also a source)
- ELF with `EM_X86_64`: the only ELF-level change
- Gaps discovered: things the trait didn't account for that x86-64 requires (two-operand vs. three-operand format; richer addressing modes)
- Fixing the gaps: extend the trait, or handle in the x86-64 implementation; document the tradeoff

**Action-IDEs**:
- `full-lab` — implement the x86-64 `CodegenTarget`: instruction selection, prologue/epilogue, ELF output; the test suite runs the same programs under both `qemu-riscv64` and natively on x86-64; both must produce correct results

**Portals**:
- → Integration Lab I5: "This two-backend compiler is the foundation of I5 — where you add WASM as a third target using Cranelift."

**Closing question**: ¿Qué hizo que el diseño del trait `CodegenTarget` resultara más o menos limpio de lo esperado? ¿Qué asumiste sobre RISC-V que no era verdad para x86-64?

---

### Module E.7 — Lo que Cranelift Resuelve

**Module BlogPost**: Cranelift is a code generator library developed at Bytecode Alliance. You provide CLIF (Cranelift IR); it produces machine code for x86-64, ARM64, RISC-V, and WASM. This module explains what Cranelift provides that your compiler doesn't, and why those problems are hard.

---

#### Unit E.7.1 — El diseño de Cranelift y por qué existe
*D2 · render_mode = "blog"*

**BlogPost axis**: Now that you've built a compiler with a `CodegenTarget` trait, you know exactly what the problems are: register allocation is hard, instruction selection has many cases, supporting multiple architectures requires continuous effort. Cranelift is the answer at scale — a library that takes IR and returns machine code for multiple architectures with production-quality allocation.

**Topics**:
- What Cranelift does: takes CLIF (SSA-form IR with typed values); produces machine code for x86-64, ARM64, RISC-V, and WASM
- CLIF: SSA form; `block`-based; explicit `brz`/`brnz`/`jump` terminators; typed values
- Cranelift's register allocator: regalloc2, the same allocator used in V8 and SpiderMonkey
- What Cranelift doesn't do: high-level optimizations (inlining, loop transformations) — that's the frontend's job
- Why JIT compilers use Cranelift: Wasmtime; compilation speed matters more than peak optimization quality
- Why AOT compilers use LLVM instead: better optimization passes; Cranelift focuses on correctness and speed

**Action-IDEs**:
- `compare` — CLIF vs. your IR: the same function in both forms; what differs and why
- `stepper` — the Cranelift API: create a Function, define a Block, add instructions, define a signature; the API walkthrough before the full implementation

**Portals**:
- → Integration Lab I5: "I5 is where you use Cranelift as the backend, targeting RISC-V, x86-64, and WASM from the same frontend."

**Closing question**: ¿Por qué Wasmtime usa Cranelift en lugar de LLVM, dado que LLVM genera código más optimizado? ¿Qué garantía de Cranelift es más importante para un runtime de WebAssembly?

---

### Module E.8 — Usando Cranelift

**Module BlogPost**: Using Cranelift is the payoff of the entire codegen arc. The student replaces the custom backend with Cranelift and runs the same programs on RISC-V, x86-64, and WASM from one compilation. The same language, the same frontend, three machines.

---

#### Unit E.8.1 — API de Cranelift: tres arquitecturas desde un frontend
*D3 · render_mode = "studio"*

**BlogPost axis**: Cranelift's API takes your IR (or a translation of it to CLIF), runs its allocator and instruction selector, and produces machine code as bytes. You own the frontend. You delegate the machine-specific work to Cranelift. This is the right division of responsibility — and now you understand why.

**Topics**:
- Cranelift crates: `cranelift-codegen`, `cranelift-frontend`, `cranelift-module`, `cranelift-object`
- Building a `cranelift_codegen::ir::Function` from your IR: iterate basic blocks; translate each instruction to CLIF
- `cranelift-module`: module linking; multiple functions into one object file
- `cranelift-object`: emit an ELF (or COFF, or Mach-O) from the compiled module — replaces your hand-written ELF emitter
- Three targets: `isa::lookup_by_name("x86_64")`, `"riscv64"`, `"wasm32"` — same code, different ISA
- Running the output: x86-64 natively; RISC-V in `qemu-riscv64`; WASM in `wasmtime`

**Action-IDEs**:
- `full-lab` — implement the Cranelift backend: IR → CLIF translation; module compilation; three-target output; the test suite runs each output on its respective runtime and verifies correctness — this is the capstone of the Compilers track
- `reveal` — compare what Cranelift generates vs. what your codegen generated for the same function: instruction quality and count; understand the tradeoffs

**Portals**:
- → Integration Lab I5: "You now have a compiler with a Cranelift backend targeting three architectures. I5 formalizes this as a project."
- → Integration Lab I4: "I4 requires your compiler to produce a RISC-V ELF that your OS can execute. The Cranelift backend produces that."

**Closing question**: ¿Qué se perdería si tuvieras que reconstruir todo lo que Cranelift da por sentado — el register allocator, el instruction selector, el multi-arch ELF emission? ¿Qué partes serían más difíciles?

---

## Anchor Map — Compilers → Rust Track

Points in this track where a Rust concept blocks progress.

```
[A.1.3 — lexer lifetime]      "The lexer holds a &str to the source"      → RC3.4.1 (lifetimes)
[A.3.1 — recursive AST]       "Recursive enum needs Box<T>"                → RC4.3.1 (Box<T>)
[A.3.2 — visitor trait]       "Visitor pattern needs a trait"              → RC4.1.1 (traits)
[B.1.1 — symbol table]        "HashMap get + insert borrow conflict"       → RC3.3.2 (entry API)
[B.1.2 — scope stack]         "Multiple &mut borrows into scope stack"     → RC3.3.1
[C.2.2 — phi nodes]           "Rc<RefCell<BasicBlock>> borrow errors"      → RC3.2.2 (Rc/RefCell)
[E.1.2 — codegen unsafe]      "Raw pointer manipulation in codegen"        → RC7.1.2
[E.6.1 — CodegenTarget]       "Object safety for dyn CodegenTarget"        → RC4.1.2
```

---

## Xref Map — Compilers ↔ OS Track

Concepts that are the same idea viewed from two different layers.

```
[E.2.2 — RISC-V ISA]              ↔ OS A.1/A.2   first instruction / MMIO uses same loads/stores
[E.3 — calling convention]        ↔ OS D.2        ABI register contract = context switch saved registers
[E.4.1 — ELF sections]            ↔ OS D.1        compiler emits ELF ↔ OS loader reads ELF
[E.4.2 — ELF + relocations]       ↔ OS D.1        full round-trip: compile → link → load → execute (I4)
[B.2 — type checking]             ↔ RC4.1         formal type rules ↔ Rust type system foundations
[C.3.3 — liveness / dataflow]     ↔ RC3.2.3       liveness analysis ↔ borrow checker as dataflow
[E.1.1 — interference graph]      ↔ OS D.2        live registers at preemption = what context switch saves
```

---

## Portal Map — Inbound to Compilers Track

Portals from C and Rust tracks that lead here.

```
From C Track → Compilers
────────────────────────────────────────────────────────────
[CC1.1.2]  toolchain phases       → A.1    (the phases you used = the phases you implement)
[CC3.2.2]  separate compilation   → E.4    (the linker your compiler feeds)
[CC3.3.2]  gcc -S assembly        → E.2    (the assembly you read = the assembly your codegen produces)
[CC3.3.3]  calling convention     → E.3    ← PRIMARY PORTAL to Compilers codegen
[CC3.4.3]  reverse engineering    → E.4    (the ELF you patched = the ELF your compiler produces)

From Rust Track → Compilers
────────────────────────────────────────────────────────────
[RC3.2.3]  borrow checker         → C.3.3  (borrow checker = dataflow analysis on CFG)
[RC4.1.3]  vtables                → E.3    (vtable = struct of fn pointers in calling convention)
[RC6.2.2]  async/await            → C.1    (async desugaring = the same IR lowering as if/while)
[RC8.1.2]  proc macros            → A.1    (proc macro receives TokenStream = your lexer's output)
```

---

## Source Coverage by Topic

| Topic | Primary Source |
|-------|----------------|
| Lexing, parsing, AST | *Crafting Interpreters* (Nystrom) — free online; Chapters 1–7 |
| Formal language theory (DFAs, NFAs) | *Engineering a Compiler* (Cooper, Torczon) Ch 2 |
| Recursive descent and Pratt parsing | *Crafting Interpreters* Ch 6; Vaughan Pratt's 1973 paper |
| Type systems and type checking | *Types and Programming Languages* (Pierce) Ch 8–9; *Engineering a Compiler* Ch 6 |
| Hindley-Milner and unification | *Types and Programming Languages* Ch 22; Damas-Milner 1982 paper |
| IRs and SSA form | *Engineering a Compiler* Ch 4–5; SSA Book (Braun et al.) — free online |
| Dataflow analysis | *Engineering a Compiler* Ch 8–9; *Modern Compiler Implementation in ML* (Appel) Ch 10 |
| Constant folding, DCE, inlining | *Engineering a Compiler* Ch 10 |
| Loop optimizations (LICM) | *Engineering a Compiler* Ch 11 |
| Register allocation (graph coloring) | *Engineering a Compiler* Ch 13; Chaitin et al. 1981 paper |
| RISC-V ISA | RISC-V ISA Specification (riscv.org — free) |
| Instruction selection | *Engineering a Compiler* Ch 11 |
| Calling conventions | RISC-V psABI specification; System V AMD64 ABI specification |
| ELF format | *Linkers and Loaders* (Levine) — free online; ELF specification |
| Cranelift | Cranelift documentation (docs.rs/cranelift-codegen); Bytecode Alliance blog |
