# C Track Map — La Máquina Desnuda

Full unit-level specification for the C Track. Includes BlogPost structure at every layer, Action-IDE types, portals/anchors, and source references.

**Color**: `#3fb950` (terminal green)
**Label**: `LA MÁQUINA`
**Prerequisite**: None — entry point of the curriculum.

---

## Track BlogPost — "La máquina antes del lenguaje"

**Conceptual axis**: C is not a detour before Rust. It is the empirical layer — the one where you see the machine directly, without safety nets, and suffer the consequences so that Rust's constraints can be understood as solutions rather than restrictions.

**What it covers**:
- Why C exists in this curriculum (not to become a C developer)
- What "undefined behavior" means and why it matters
- The three questions C answers: What is memory? What is a pointer? What does the compiler actually do with my code?
- A preview of where each C concept opens a door to Rust, OS, or Compilers

**Action-IDEs at track level**:
- `compare` — same use-after-free bug in C (runtime crash) vs. Rust (compile-time rejection)
- `mini-sim` — the four-track topology, showing C as foundation, with portal arrows to the other tracks
- `reveal` — "¿Por qué no empezamos directamente con Rust?" → unlocks the pedagogical argument

**Portals from track BlogPost**:
- C Track → Rust Track: the natural next step after completing CC3
- C Track → OS: assembly and memory concepts open OS Course A immediately

---

## Course CC1 — El entorno y los tipos

**Course BlogPost**: "El compilador no es magia"

Conceptual axis: compiling a program is a pipeline of four distinct tools, each with a specific job. The output of each is inspectable. A student who understands the toolchain is never mystified by what "compiling" means again.

Action-IDEs at course level:
- `stepper` — walking through the four phases (preprocessor → compiler → assembler → linker) with a concrete example at each step
- `mini-sim` — a C file flowing through the pipeline, showing what each tool produces

---

### Module CC1.1 — El ecosistema y la cadena de compilación

**Module BlogPost**: Framing — "before you write a program, you need to understand what happens when you compile one."

---

#### Unit CC1.1.1 — El entorno
*D1 · render_mode = "blog"*

**BlogPost axis**: Setting up a POSIX environment (WSL2 on Windows, or native Linux) and running the first C program. The environment is the lab — Linux is not incidental.

**Why Linux**: POSIX APIs are transparent; strace/GDB/Valgrind exist; the student is one step away from the OS track's bare-metal environment.

**Action-IDEs**:
- `inline-action` — predict: what does `gcc hello.c` produce?
- `expanded-ide` — write, compile, and run the first C program; observe the output and the generated binary

**Closing question**: ¿Por qué las plataformas de sistemas usan Linux en lugar de Windows como entorno de trabajo? ¿Qué tiene Linux que hace más fácil entender lo que pasa debajo?

---

#### Unit CC1.1.2 — La cadena de compilación
*D2 · render_mode = "blog"*

**BlogPost axis**: gcc -E, -c, -S, and the final link step — four separate tools, not one. The student runs each phase manually and inspects the output.

**Action-IDEs**:
- `stepper` — four steps: .c → .i (preprocessor) → .s (compiler) → .o (assembler) → binary (linker)
- `expanded-ide` — run each phase manually; read the .i and .s files
- `inline-action` — "¿En qué fase se resuelven los #include?" / "¿En qué fase se resuelven las referencias a funciones en otros archivos?"

**Portals**:
- → Compilers A: "El preprocesador, compilador, ensamblador y linker son las fases de un compilador. Tu compilador implementará una versión de esta pipeline."

**Closing question**: ¿Por qué es útil que la cadena de compilación esté dividida en fases separadas? ¿Qué permite hacer cada separación?

---

#### Unit CC1.1.3 — Inspección de binarios
*D2 · render_mode = "blog"*

**BlogPost axis**: objdump, readelf, nm — tools for reading what the compiler produced. These are not advanced tools; they are the normal way to inspect a binary.

**Action-IDEs**:
- `expanded-ide` — run objdump -d on a compiled binary; find the main function; read a few instructions
- `inline-action` — "¿Qué sección contiene el código? ¿Cuál contiene las variables globales inicializadas?"

**Portals**:
- → Compilers: "objdump muestra el output de tu compiler. En el track de Compilers, vas a generar exactamente este formato."

---

### Module CC1.2 — La sintaxis esencial

**Module BlogPost**: Before memory layout, before pointers, the student must be able to read and write basic C. This module covers every syntactic element that appears in every other unit: variables, types, control flow, functions, and arrays. Nothing is presupposed.

---

#### Unit CC1.2.1 — Variables, tipos primitivos y I/O básica
*D1 · render_mode = "blog"*

**BlogPost axis**: C has a small set of built-in types. Every value lives in a variable. Every variable has a type and a name. `printf` and `scanf` are the first tools for interacting with the outside world — you cannot write a useful program without them.

**Topics**:
- Variable declaration and initialization: `int x = 5;`, `char c = 'A';`
- The basic types: `int`, `char`, `float`, `double`, `void`
- Type qualifiers: `signed`, `unsigned`, `short`, `long`
- Literal forms: integer literals, character literals (`'a'`), string literals (`"hello"`)
- `printf`: %d, %c, %f, %lf, %s, %p format specifiers
- `scanf`: reading integers and strings from stdin
- Constants: `#define MAX 100` and `const int max = 100;`
- Integer division truncation: `5 / 2 == 2`

**Action-IDEs**:
- `inline-action` — predict the output: `printf("%d %d\n", 3, 3+2);`
- `expanded-ide` — write a program that reads two integers and prints their sum, product, and quotient; observe integer division
- `inline-action` — which format specifier for each type? (match: int, char, float, double, pointer)
- `reveal` — why `scanf("%d", x)` is wrong and `scanf("%d", &x)` is right — the missing &

**Closing question**: ¿Por qué C distingue entre `int`, `long`, `short` en lugar de tener un único tipo entero con un tamaño fijo? ¿Qué problema de portabilidad crea esa decisión?

---

#### Unit CC1.2.2 — Control de flujo: if, while, for, switch
*D1 · render_mode = "blog"*

**BlogPost axis**: Programs make decisions and repeat actions. C has five control flow constructs: if/else, while, do/while, for, and switch. This unit covers all of them — their exact syntax, their evaluation semantics, and the classic bugs each one produces.

**Topics**:
- `if (condition) { } else if { } else { }` — condition must be a scalar, zero = false
- The classic bug: `=` vs `==` in conditions — both compile, only one is a check
- `while (condition) { }` — condition checked at entry; body may never execute
- `do { } while (condition);` — body executes at least once
- `for (init; condition; increment) { }` — all three parts optional; `for(;;)` is infinite
- `break` and `continue`
- `switch (integer_expression) { case N: ... break; default: ... }` — fall-through is the default
- The missing `break` bug: what happens when fall-through is unintentional
- Nested control flow and early returns

**Action-IDEs**:
- `inline-action` — spot the bug: `if (x = 5) { ... }` — what does this do? what should it say?
- `stepper` — trace a `for` loop step by step: initialization → condition check → body → increment → condition check again
- `expanded-ide` — write FizzBuzz from 1 to 30 using for and if/else
- `inline-action` — trace a switch with fall-through: given the code, what is the output?
- `reveal` — why fall-through in switch can be intentional: the Duff's device pattern

**Closing question**: ¿Por qué `switch` en C tiene fall-through por defecto en lugar de break-by-default? ¿En qué casos es esa semántica una ventaja deliberada?

---

#### Unit CC1.2.3 — Funciones: declaración, definición, prototipos, recursión
*D1 · render_mode = "blog"*

**BlogPost axis**: A function is a named block of code that takes arguments by value and returns one value. C requires that a function be declared before it is used — this forces the programmer to write a prototype. Recursion works because every call gets its own stack frame, a physical mechanism students will analyze in CC1.4.4.

**Topics**:
- Function syntax: `return_type name(type param, ...) { body }`
- Forward declarations (prototypes): `int add(int a, int b);`
- Why prototypes exist: the compiler processes one file top-to-bottom
- Pass-by-value: the function receives a copy; modifying a parameter doesn't modify the caller's variable
- Returning values: `return expression;`; `void` functions return nothing
- Multiple return paths; functions with no explicit return (undefined behavior)
- Recursive functions: factorial, Fibonacci
- Each recursive call gets its own frame — the stack grows; base case stops it
- Stack overflow: too-deep recursion crashes the program

**Action-IDEs**:
- `stepper` — recursive factorial: each call shown as a stack frame appearing, then the frames unwinding on return
- `expanded-ide` — implement `power(base, exp)` recursively and iteratively; compare the assembly output with gcc -S
- `inline-action` — what happens if you call a function before its prototype in C?
- `reveal` — the problem with implicit `int` return in old C (K&R era)

**Portals**:
- → CC1.4.4: "El stack frame que crea cada llamada a función es el mecanismo físico que vas a analizar en la unidad CC1.4.4."

**Closing question**: ¿Por qué C es un lenguaje de paso por valor? ¿Qué implicación tiene para funciones que necesitan modificar sus argumentos?

---

#### Unit CC1.2.4 — Arrays en el stack y strings como arrays de char
*D1 · render_mode = "blog"*

**BlogPost axis**: An array is a fixed-size sequence of same-type values laid out contiguously in memory, declared at compile time and living on the stack. A string in C is an array of chars terminated by a `\0` null byte — not a type, not an object, just a convention. Both facts are the foundation for pointer arithmetic and the source of C's most notorious vulnerabilities.

**Topics**:
- Array declaration: `int arr[5];`, `int arr[] = {1, 2, 3};`
- Zero indexing: arr[0] through arr[N-1]; arr[N] is out of bounds
- The size of an array: `sizeof(arr)` vs the number of elements
- Multi-dimensional arrays: `int matrix[3][4];` is contiguous in memory, row by row
- Char arrays and string literals: `char name[10] = "hello";`
- The null terminator `\0`: every string ends with it; strlen counts up to but not including it
- `strlen`, `strcpy`, `strcat`, `strcmp` — what they do and where they can overflow
- Writing past the end of an array: undefined behavior, stack corruption in practice

**Action-IDEs**:
- `mini-sim` — array in memory: the student sees contiguous cells with index labels; can set values and see the layout
- `expanded-ide` — write a program that reads a string and reverses it in place; verify the null terminator stays at the new end
- `inline-action` — what is `sizeof(arr)` vs `strlen(arr)` for `char arr[] = "hello";`?
- `reveal` — what happens when you write past the end of a stack array: stack frame corruption, then crash or silent data corruption

**Closing question**: ¿Por qué C no comprueba los límites de los arrays en tiempo de ejecución? ¿Qué coste tendría esa comprobación, y cómo lo resuelven lenguajes que sí la hacen?

---

### Module CC1.3 — El layout de memoria

**Module BlogPost**: Every program has a map in memory. The student who can read that map is never confused about "where does this variable live?"

---

#### Unit CC1.3.1 — Las secciones
*D1 · render_mode = "blog"*

**BlogPost axis**: Text, Data, BSS, Stack, Heap — not metaphors but actual segments visible in the binary. The student writes a program that has variables in each section and reads where they land.

**Action-IDEs**:
- `mini-sim` — a C program's memory layout, interactive: the student can toggle which variables exist and see which section they land in
- `inline-action` — classify: "¿En qué sección vive cada variable?" (list of variable declarations)
- `expanded-ide` — use readelf -S to inspect the real sections of a compiled binary

**Portals**:
- → OS A: "Las secciones de tu binario son exactamente lo que el OS loader mapea en páginas de memoria virtual cuando ejecuta tu programa."

**Closing question**: ¿Por qué existen BSS y Data como secciones separadas? ¿Qué ahorra esa separación en el binario?

---

#### Unit CC1.3.2 — Variables y sus ubicaciones
*D2 · render_mode = "blog"*

**BlogPost axis**: Where does each kind of variable live? Local variables (stack), global variables (data/bss), string literals (text/rodata). The student writes programs and uses GDB/nm to verify.

**Action-IDEs**:
- `compare` — same data declared in three different ways (local, global, static local): different section, different lifetime
- `expanded-ide` — use nm to list all symbols in a binary; identify the section of each

---

#### Unit CC1.3.3 — El primer Makefile
*D1 · render_mode = "blog"*

**BlogPost axis**: A Makefile is not a build system — it is a dependency graph. Understanding targets, prerequisites, and rules from first principles.

**Action-IDEs**:
- `stepper` — building a Makefile incrementally: first rule → pattern rules → phony targets → auto-dependencies
- `expanded-ide` — write a Makefile for a two-file project; verify incremental compilation works

---

### Module CC1.4 — Tipos con consciencia de la máquina

**Module BlogPost**: C types are not abstractions over values — they are specifications of how many bytes something occupies and how those bytes are interpreted.

---

#### Unit CC1.4.1 — sizeof() y límites de tipos
*D1 · render_mode = "blog"*

**BlogPost axis**: The size of a type is not incidental — it determines overflow behavior, alignment, and what hardware instruction must be used. `limits.h` is documentation of the machine.

**Action-IDEs**:
- `inline-action` — predict: sizeof(int), sizeof(long), sizeof(char*) on a 64-bit machine
- `mini-sim` — interactive: change a variable's type and watch sizeof() change, watch the assembly instruction change
- `expanded-ide` — write a program that prints sizeof() for every basic type; observe the pattern

**Closing question**: ¿Por qué el estándar de C no especifica el tamaño exacto de `int`? ¿Qué ventaja y qué problema crea esa decisión?

---

#### Unit CC1.4.2 — Complemento a dos y representación binaria
*D2 · render_mode = "blog"*

**BlogPost axis**: signed vs. unsigned is not a semantic choice — it determines the bit pattern that represents negative numbers, and therefore what overflow means.

**Action-IDEs**:
- `mini-sim` — interactive binary representation: the student flips bits and sees the decimal interpretation change (both signed and unsigned)
- `stepper` — how complemento a dos works: the student steps through a negative number's construction
- `inline-action` — predict: what does `(unsigned char)(-1)` evaluate to?

---

#### Unit CC1.4.3 — Operadores de bits
*D2 · render_mode = "blog"*

**BlogPost axis**: Bitwise operations are not niche — they are the standard vocabulary of systems programming. Flags, masks, and packed data structures use them constantly. A driver writer who can't read `value |= (1 << 3)` is lost.

**Action-IDEs**:
- `mini-sim` — a byte visualizer: the student applies bitwise operations and watches individual bits change
- `expanded-ide` — implement a permissions flag system using a single byte; set/check/clear individual bits
- `inline-action` — read a flag expression and state what bit is being set/cleared/toggled

**Portals**:
- → OS A: "Los registros de hardware de los periféricos se configuran exactamente así — escribir un bit en una dirección de memoria para activar un dispositivo."

---

#### Unit CC1.4.4 — Funciones y el stack frame
*D2 · render_mode = "blog"*

**BlogPost axis**: When a function is called, the CPU allocates a frame on the stack for its local variables. When it returns, that frame is gone. This is not implementation detail — it is the physical mechanism that makes recursion and nested calls possible.

**Action-IDEs**:
- `mini-sim` — animated stack: the student calls a function and watches the frame appear; returns and watches it disappear
- `stepper` — step through a function call at the assembly level: CALL, SUB RSP, variable access via [rbp-N], LEAVE, RET
- `expanded-ide` — write a program that prints the address of local variables in nested calls; observe the stack direction

**Portals**:
- → OS D: "El context switch del kernel guarda y restaura exactamente este stack frame para poder reanudar un proceso."
- → Rust C3: "El activation frame que viste aquí es lo que Rust modela con sus reglas de ownership y lifetimes."

**Closing question**: ¿Por qué las variables locales no se pueden retornar por referencia en C? ¿Qué pasa físicamente cuando la función retorna?

---

## Course CC2 — Punteros y el heap

**Course BlogPost**: "El punto de inflexión"

Conceptual axis: C gives you direct access to memory addresses. This is not a convenience feature — it is the mechanism behind every abstraction in systems programming. It is also the source of every major class of security vulnerability in the history of computing.

Action-IDEs at course level:
- `branch` — "¿Qué querés hacer con este bloque de memoria?" → [Pasarlo a una función] [Almacenarlo después del scope] [Compartirlo entre funciones] — each branch shows the C approach and its failure mode, then previews the Rust solution

---

### Module CC2.1 — El corazón de C: punteros

**Module BlogPost**: A pointer is a number. That number happens to be a memory address. Everything else about pointers — arithmetic, arrays, function pointers — follows from this.

---

#### Unit CC2.1.1 — La dirección como valor
*D1 · render_mode = "blog"*

**BlogPost axis**: `&` gives you the address of a variable. `*` dereferences an address to get the value at that address. These are the only two operations. Everything else is built from them.

**Action-IDEs**:
- `mini-sim` — two-panel: left shows variables with their values; right shows memory addresses; the student takes the address of a variable and watches the arrow appear
- `expanded-ide` — write a swap() function in C using pointers; verify it works; explain why pass-by-value wouldn't
- `inline-action` — predict: what does `*(&x)` evaluate to?

**Closing question**: ¿Por qué C eligió exponer las direcciones de memoria directamente en lugar de ocultar esa información detrás de una abstracción? ¿Qué gana el programador? ¿Qué pierde?

---

#### Unit CC2.1.2 — Aritmética de punteros
*D2 · render_mode = "blog"*

**BlogPost axis**: Adding 1 to a pointer doesn't add 1 byte — it adds `sizeof(type)` bytes. This is how arrays work. This is also how buffer overflows happen.

**Action-IDEs**:
- `mini-sim` — pointer arithmetic visualizer: the student increments a pointer and watches it jump by sizeof(T) bytes in the memory diagram
- `expanded-ide` — traverse an array two ways: with array indexing and with pointer arithmetic; verify they produce identical assembly (gcc -S)
- `stepper` — the LEA assembly instruction: how the CPU computes base + (index × size) in one instruction

**Portals**:
- → Compilers E: "La instrucción LEA que viste aquí es lo que el compilador emite para accesos a arrays. Tu codegen la va a necesitar."

---

#### Unit CC2.1.3 — Arrays, strings y el decay
*D2 · render_mode = "blog"*

**BlogPost axis**: An array in C is not a first-class value — it decays to a pointer to its first element when passed to a function. Strings are arrays of char terminated by `\0`. Both facts create the entire class of string-related security vulnerabilities.

**Action-IDEs**:
- `compare` — passing an array to a function vs. passing a pointer: they compile to the same thing; sizeof() reveals the difference
- `expanded-ide` — implement a safe version of strcpy that checks bounds; demonstrate what strcpy does without bounds checking
- `inline-action` — "¿Cuántos bytes tiene este string en memoria?" (with the null terminator)
- `reveal` — why strcpy is banned in secure C code — full explanation with example

**Closing question**: ¿Por qué C eligió representar strings como arrays de chars terminados en null en lugar de como una estructura con longitud? ¿Qué tradeoff implica esa decisión?

---

#### Unit CC2.1.4 — Punteros a punteros
*D3 · render_mode = "studio"*

**BlogPost axis**: To modify a pointer from inside a function, you need a pointer to that pointer. This is the pattern behind argc/argv, linked list operations, and any function that allocates memory and returns it through a parameter.

**Action-IDEs**:
- `mini-sim` — two-level pointer diagram: the student follows the chain of indirection
- `full-lab` — implement a function that allocates a 2D matrix dynamically using int**; fill it; print it; free it correctly

**Portals**:
- → Rust C2: "El problema que resuelven los punteros a punteros es exactamente el que Rust resuelve con `&mut &mut T` — y con mucho más control."

---

#### Unit CC2.1.5 — El puntero NULL y validación
*D1 · render_mode = "blog"*

**BlogPost axis**: NULL is the pointer value zero — a sentinel meaning "this pointer points to nothing." Dereferencing NULL is undefined behavior (in practice: segfault). Every pointer received from an external source (malloc, a function parameter) must be validated before use. Skipping this check is not an optimization — it is a bug waiting to happen.

**Topics**:
- `int *p = NULL;` — NULL as an explicit invalid pointer
- malloc returns NULL on allocation failure; every malloc call must check
- Dereferencing NULL: the segfault and why it reliably crashes
- The defensive pattern: `if (p == NULL) { handle_error(); }`
- `assert(p != NULL)` as a debug-mode contract
- `free(NULL)` is safe and defined — it does nothing
- The difference between a null pointer and an uninitialized pointer

**Action-IDEs**:
- `expanded-ide` — write a program that calls malloc; first without checking for NULL (compile with -fsanitize=address to catch it); then add the check and handle the failure
- `inline-action` — which of these is safe? `free(NULL)`, `*NULL`, `p = NULL; free(p)` — multiple choice
- `reveal` — why an uninitialized pointer is more dangerous than NULL: NULL reliably crashes, garbage addresses silently corrupt

**Closing question**: ¿Por qué NULL existe como concepto en lugar de que los punteros inválidos simplemente no existan? ¿Qué problema de diseño del lenguaje resuelve?

---

#### Unit CC2.1.6 — void* y genericidad en C
*D2 · render_mode = "blog"*

**BlogPost axis**: `void*` is a pointer to memory with no type information. It can hold any address; it requires an explicit cast to use; it cannot be dereferenced or used in arithmetic directly. This is C's mechanism for generic programming — malloc returns void*, qsort takes a void* comparator. It is also where type safety ends.

**Topics**:
- `void *p;` — declaration and assignment from any pointer
- Casting back to a typed pointer: `int *ip = (int *)p;`
- Why void* cannot be dereferenced: the compiler doesn't know the size
- malloc's return type `void*`: how every malloc call is an implicit cast
- qsort's signature: `int (*compar)(const void *, const void *)` — the comparator receives void*
- memcpy, memset: operating on bytes without knowing the type
- The tradeoff: maximum flexibility, zero type safety

**Action-IDEs**:
- `expanded-ide` — implement `generic_swap(void *a, void *b, size_t size)` using memcpy; test it with int, double, and a struct
- `compare` — sorting with qsort using an int comparator vs. a struct comparator: same function, different comparators
- `inline-action` — can you do pointer arithmetic on a `void*`? What does GCC say? (answer: GCC extension allows it as 1-byte steps, strict C does not)

**Portals**:
- → Rust C2: "El `void*` de C es lo que los genéricos de Rust reemplazan con seguridad en tipos. `<T>` hace lo que void* hace, pero sin perder la información de tipo en compilación."

**Closing question**: ¿Qué información perdés cuando pasás un puntero como `void*`? ¿Por qué qsort acepta `void*` en lugar de tener versiones sobrecargadas para cada tipo?

---

#### Unit CC2.1.7 — const con punteros
*D1 · render_mode = "blog"*

**BlogPost axis**: `const` modifies what can be written to — but with pointers, there are three distinct combinations depending on whether const applies to the pointer itself or the data it points to. Reading the difference is necessary to read any C library header.

**Topics**:
- `const int *p` — pointer to const: cannot write through p, can reassign p to point elsewhere
- `int * const p` — const pointer: can write through p, cannot reassign p to point elsewhere
- `const int * const p` — both: cannot write through p, cannot reassign p
- The mnemonic: read right-to-left from the variable name
- Reading const in function signatures: `size_t strlen(const char *s)` — I won't modify what you give me
- Using const to document contracts and catch bugs at compile time
- Why dropping const (casting it away) is undefined behavior if the original was const

**Action-IDEs**:
- `compare` — three const pointer declarations side by side with annotated arrows: what is const, what is mutable
- `inline-action` — which of these assignments compile? (list of assignments involving const and non-const pointers)
- `expanded-ide` — write a `string_length` function that takes `const char *`; attempt to modify the string inside; observe the compiler error

**Closing question**: ¿Por qué la mayoría de funciones de la librería estándar que reciben strings los declaran como `const char *`? ¿Qué garantía le ofrece eso al caller?

---

### Module CC2.2 — El heap manual

**Module BlogPost**: The stack is automatic — variables appear and disappear with function calls. The heap is manual — you ask the OS for memory, you use it, and you are responsible for returning it. This responsibility is the source of the hardest bugs in C.

---

#### Unit CC2.2.1 — malloc, calloc, realloc
*D1 · render_mode = "blog"*

**BlogPost axis**: malloc returns a pointer to N bytes of uninitialized memory — or NULL if the OS refuses. calloc zeros the memory. realloc resizes. The OS can say no. The student writes programs that handle this correctly.

**Action-IDEs**:
- `mini-sim` — a heap diagram: blocks appear when malloc is called, with address and size labels
- `expanded-ide` — allocate a dynamic array; fill it; resize it with realloc; free it; check with Valgrind
- `inline-action` — "¿Qué pasa si usás memoria de un malloc que retornó NULL?"

**Portals**:
- → OS C: "La función malloc llama a brk o mmap — dos syscalls que le piden al kernel páginas de memoria física. Eso es lo que vas a implementar en el OS track."

**Closing question**: ¿Por qué malloc no inicializa la memoria a cero por defecto? ¿Qué implica eso para la seguridad y el rendimiento?

---

#### Unit CC2.2.2 — free y el ciclo de vida
*D1 · render_mode = "blog"*

**BlogPost axis**: free returns memory to the allocator. The rules: free exactly once, only memory you own, and never use the memory after freeing it. Violating any rule produces undefined behavior — which may crash immediately or silently corrupt memory.

**Action-IDEs**:
- `stepper` — the lifecycle of a heap allocation: malloc → use → free → invalid
- `expanded-ide` — write a program that correctly manages the lifecycle of a linked list (alloc, use, free every node)
- `inline-action` — identify the bug: which of these code samples double-frees? which leaks?

---

#### Unit CC2.2.3 — Valgrind
*D2 · render_mode = "blog"*

**BlogPost axis**: Valgrind's memcheck runs your program under an interpreter that tracks every memory operation. It cannot be fooled by clever code. Reading its output is a skill — and a necessary one for C development.

**Action-IDEs**:
- `expanded-ide` — run Valgrind on a program with a known memory leak; read the output; fix the leak; verify the report is clean
- `expanded-ide` — run Valgrind on a program with a use-after-free; read the output; understand what "Invalid read of size 8" means
- `stepper` — anatomy of a Valgrind report: "definitely lost", "still reachable", "invalid read", "invalid write" — what each means

**Portals**:
- → Rust C3: "Lo que Valgrind detecta en runtime — use-after-free, double-free, memory leak — Rust lo previene en compile time. Mismos bugs, diferente momento de detección."

**Closing question**: ¿Por qué Valgrind tiene un costo de rendimiento de ~20x? ¿Qué está haciendo internamente que lo hace tan lento?

---

#### Unit CC2.2.4 — Los errores clásicos
*D2 · render_mode = "blog"*

**BlogPost axis**: Dangling pointer, use-after-free, buffer overflow, double free — these are not academic bugs. They are the bugs that have caused the most security vulnerabilities in production systems. The student writes each one deliberately, observes the failure, and understands *why* it fails.

**Action-IDEs**:
- `full-lab` — four stations: (1) write a dangling pointer bug; observe the crash; (2) write a use-after-free; run in Valgrind; (3) write a buffer overflow; observe stack corruption; (4) write a double free
- `compare` — each bug in C vs. what Rust would say at compile time (compile error message shown)

**Portals**:
- → Rust C3: "Cada uno de estos errores corresponde a una categoría de error que el borrow checker rechaza estáticamente. Este lab es el 'por qué' del track de Rust." ← **CENTRAL PORTAL**
- → OS: "Los buffer overflows que escribiste aquí son la clase de vulnerabilidad que los sistemas operativos modernos intentan mitigar con ASLR, stack canaries, y NX bits."

**Closing question**: ¿Cuál de estos cuatro bugs es el más peligroso desde el punto de vista de seguridad? ¿Por qué el más silencioso suele ser el más peligroso?

---

## Course CC3 — Composición y la máquina

**Course BlogPost**: "Lo que el compilador realmente hace"

Conceptual axis: the tools you've used so far are black boxes. This course opens them. Structs reveal how the compiler organizes memory for complex types. The preprocessor and multi-file compilation reveal how real projects are structured. The assembly output reveals what the compiler does with every operation. The reverse engineering lab closes the loop: you read a binary without source code.

---

### Module CC3.1 — Tipos complejos

**Module BlogPost**: C lets you define your own memory layouts. Understanding how the compiler implements them — alignment, padding, union semantics — is the prerequisite for writing any non-trivial C program or understanding what Rust does with its own struct layouts.

---

#### Unit CC3.1.1 — Structs y alignment
*D1 · render_mode = "blog"*

**BlogPost axis**: A struct's fields are laid out in order in memory — but the compiler inserts padding between fields to satisfy alignment requirements. The total size of a struct depends on field order. The student controls it with deliberate ordering.

**Action-IDEs**:
- `mini-sim` — struct layout visualizer: the student adds/reorders fields and watches sizeof() change and padding appear
- `expanded-ide` — write two identical structs with different field ordering; compare their sizeof(); verify with offsetof()
- `inline-action` — given a struct definition, predict its sizeof()

**Portals**:
- → Rust C2: "Rust tiene `#[repr(C)]` exactamente para garantizar el mismo layout que C. Tu OS va a necesitar estructuras que coincidan con lo que el hardware espera."
- → Compilers E: "El struct layout que estudiaste aquí es lo que tu codegen debe respetar para que la calling convention funcione."

**Closing question**: ¿Por qué la CPU requiere que los datos estén alineados? ¿Qué pasa físicamente si accedés a un int en una dirección impar en x86?

---

#### Unit CC3.1.2 — Unions
*D2 · render_mode = "blog"*

**BlogPost axis**: A union stores all its fields at the same address. Only one is valid at any time. This is the primitive mechanism behind tagged unions, network packet parsing, and type punning.

**Action-IDEs**:
- `mini-sim` — union memory diagram: the student writes to one field and reads from another; watches the byte overlap
- `compare` — struct vs. union side by side: layout, sizeof(), what happens when you write to one field and read from another
- `expanded-ide` — implement a simple tagged union (discriminant + union) to represent an integer or a float

**Portals**:
- → Rust C2: "Los enums de Rust con datos son uniones etiquetadas con seguridad en tipos. La 'unión' que construiste aquí es lo que Rust genera internamente."

---

#### Unit CC3.1.3 — Punteros a funciones
*D2 · render_mode = "blog"*

**BlogPost axis**: A function pointer stores the address of a function. This is the mechanism behind callbacks, dispatch tables, and polymorphism in C. The vtable of a C++ class is a struct of function pointers.

**Action-IDEs**:
- `stepper` — building a vtable from scratch: struct with function pointer fields, two "implementations", dispatch through the table
- `expanded-ide` — implement a sorting function that takes a comparator as a function pointer; use it to sort ascending and descending
- `compare` — function pointer dispatch (C) vs. trait object dispatch (Rust): same mechanism, different syntax and safety

**Portals**:
- → Rust C4: "Los trait objects de Rust son exactamente esto — un puntero a datos y un puntero a una vtable de function pointers."
- → Compilers E: "La vtable que construiste aquí es lo que tu codegen emite para dynamic dispatch."

**Closing question**: ¿Qué limitaciones tiene el polimorfismo por punteros a función en C comparado con el sistema de traits de Rust?

---

#### Unit CC3.1.4 — enum: tipos enumerados y valores simbólicos
*D1 · render_mode = "blog"*

**BlogPost axis**: An enum gives symbolic names to integers. The names live in the enclosing scope (not scoped to the enum itself, unlike C++). Enums in C are just ints — the compiler does not enforce that a variable holds a valid enum value, and a switch on an enum gets no exhaustiveness check. These omissions are exactly what Rust's enum model corrects.

**Topics**:
- `enum Color { RED, GREEN, BLUE };` — implicit values 0, 1, 2
- Explicit values: `enum Status { OK = 200, NOT_FOUND = 404 };`
- Name scoping: `RED` pollutes the enclosing namespace (no `Color::RED`)
- Using enum for state machines and flag sets
- What a switch on an enum looks like — and why the compiler won't warn about unhandled cases by default (-Wswitch helps)
- The type safety gap: `enum Color c = 999;` compiles without error

**Action-IDEs**:
- `expanded-ide` — model a traffic light state machine with enum (RED, YELLOW, GREEN); write a switch to transition states; add an unknown state and observe the (lack of) warning without and with -Wswitch
- `compare` — C enum state machine vs. Rust enum match: same logic, different guarantees (Rust: exhaustive, scoped, typed)
- `inline-action` — what is the numeric value of each member in this enum? (members with and without explicit values)

**Portals**:
- → Rust C2: "Los enums de Rust son la versión segura de esto: valores con tipos propios, exhaustividad verificada por el compilador, scope limpio."

**Closing question**: ¿Por qué el compilador de C no exige manejar todos los casos de un enum en un switch? ¿Qué consecuencias tiene esa omisión en código real?

---

#### Unit CC3.1.5 — typedef: nombres para tipos
*D1 · render_mode = "blog"*

**BlogPost axis**: `typedef` creates an alias — a new name for an existing type. It does not create a new type. Its most common use is `typedef struct { ... } Name;` to avoid writing `struct Name` everywhere. It is also the mechanism behind the fixed-size integer names (`uint32_t`, `size_t`) that appear throughout systems code.

**Topics**:
- `typedef existing_type new_name;` — the general form
- `typedef unsigned int uint;`
- `typedef struct { int x; int y; } Point;` — the struct typedef pattern
- `typedef int (*comparator_t)(const void *, const void *);` — function pointer typedef
- `<stdint.h>`: `uint8_t`, `uint16_t`, `uint32_t`, `uint64_t`, `int32_t` — exact-width types
- `<stddef.h>`: `size_t`, `ptrdiff_t` — semantic types
- When typedef improves readability vs. when it obscures (hiding that something is a pointer)

**Action-IDEs**:
- `compare` — a struct declared without vs. with typedef: the same struct, but the second requires fewer keystrokes and no `struct` keyword at use sites
- `expanded-ide` — use `<stdint.h>` types to define a network packet struct; use `offsetof` and `sizeof` to verify the exact byte layout
- `inline-action` — given a typedef, write the expanded form it aliases (function pointer, struct, pointer to struct)

**Closing question**: ¿Por qué las librerías de sistemas usan `uint32_t` en lugar de `unsigned int`? ¿Qué garantizan los tipos de `<stdint.h>` que los tipos primitivos de C no garantizan?

---

### Module CC3.2 — El preprocesador y múltiples archivos

**Module BlogPost**: Real C programs span multiple files. Before the compiler sees any of them, the preprocessor transforms the text — expanding macros, resolving includes, stripping conditional blocks. Understanding this layer explains every mysterious compilation error caused by headers and every subtle bug caused by macro expansion.

---

#### Unit CC3.2.1 — Macros: #define, macros con parámetros, y sus peligros
*D1 · render_mode = "blog"*

**BlogPost axis**: The preprocessor is a text substitution system that runs before the compiler. `#define` creates macros — simple token replacements. Macros with parameters look like functions but are not: no type checking, no separate scope, no guarantee about evaluation order. The bugs they produce are subtle and the errors the compiler gives are on the expanded code, not the macro call.

**Topics**:
- `#define PI 3.14159` — constant macro
- `#define MAX(a, b) ((a) > (b) ? (a) : (b))` — function-like macro
- Why every subexpression must be parenthesized: `SQUARE(x) x*x` → `SQUARE(2+3)` = `2+3*2+3` = 11, not 25
- The double-evaluation problem: `MAX(x++, y++)` — the larger argument increments twice
- Token stringification (`#`) and token concatenation (`##`)
- `#include <stdio.h>` — the preprocessor pastes the entire header file inline
- `gcc -E` — inspecting the preprocessed output before compilation

**Action-IDEs**:
- `stepper` — expanding `MAX(2+3, 4)` step by step: see each substitution token by token
- `expanded-ide` — compile a program with `gcc -E` and read the preprocessed output; observe what `#include <stdio.h>` becomes
- `inline-action` — spot the bug: `#define SQUARE(x) x*x` — what does `SQUARE(2+3)` evaluate to? What does `SQUARE(x++)` do?
- `reveal` — the correct definition: `#define SQUARE(x) ((x)*(x))` — and why it still has the double-evaluation problem

**Closing question**: ¿Por qué los lenguajes modernos (Rust, Go, Python) eliminaron el preprocesador de texto? ¿Qué mecanismo usa Rust para reemplazar las macros de constantes y las macros tipo función?

---

#### Unit CC3.2.2 — Compilación separada: headers, include guards, extern, static
*D2 · render_mode = "blog"*

**BlogPost axis**: A real C program is multiple .c files, each compiled independently into a .o object file, then linked. The compiler processes each file without seeing the others — it needs declarations of what exists elsewhere. That is the job of header files. The linker resolves the cross-file references. Understanding this model explains every "undefined reference" error.

**Topics**:
- The separate compilation model: each .c → one .o; the linker combines them
- Header files contain declarations, not definitions (usually)
- The one-definition rule: a definition in two .o files causes a linker error
- Include guards: `#ifndef FOO_H / #define FOO_H / ... / #endif` — why they are mandatory
- `#pragma once` — a common non-standard alternative
- `extern int x;` — declaring a variable defined in another .c file
- `static` at file scope: the symbol has internal linkage; invisible to other .o files
- The linker's job: matching each `undefined reference` to its definition
- Reading "undefined reference to `foo`": what it means and how to find it

**Action-IDEs**:
- `stepper` — a two-file project: main.c calls a function in utils.c; step through: compile utils.c → utils.o, compile main.c → main.o, link both → binary; observe that each step is independent
- `expanded-ide` — split a single-file program into utils.c/utils.h/main.c; add include guards; compile and link; introduce a missing `#include` and read the resulting error
- `inline-action` — why does `static int counter = 0;` in a .c file prevent name collisions with the same variable name in another .c file?

**Portals**:
- → CC1.1.2: "El linker que conecta los .o files es la última fase de la cadena de compilación que viste en CC1.1.2."
- → Compilers A: "El linker que viste aquí es el componente final de la pipeline de compilación. Tu compilador en el Compilers track va a producir .o files en este mismo formato."

**Closing question**: ¿Por qué los headers de C contienen declaraciones y no definiciones? ¿Qué error de linker produce incluir la definición de una función en un header usado por dos archivos .c?

---

#### Unit CC3.2.3 — Compilación condicional: #ifdef, #ifndef, #if
*D1 · render_mode = "blog"*

**BlogPost axis**: The preprocessor can include or exclude entire blocks of code based on compile-time conditions. This is how C code targets multiple platforms, how debug instrumentation is stripped from release builds, and how include guards work.

**Topics**:
- `#ifdef SYMBOL` — true if the symbol has been defined
- `#ifndef SYMBOL` — true if the symbol has NOT been defined
- `#if VALUE` — numeric condition; `#elif`, `#else`, `#endif`
- Defining symbols from the command line: `gcc -DDEBUG`
- Debug-only code: `#ifdef DEBUG fprintf(stderr, "..."); #endif`
- Platform detection: `__linux__`, `_WIN32`, `__APPLE__`, `__x86_64__`
- How include guards use `#ifndef`: the first inclusion defines the guard, the second sees it defined and skips everything
- The connection between `#if 0 ... #endif` and block comments

**Action-IDEs**:
- `expanded-ide` — add a `DEBUG` compilation flag to a program; guard diagnostic `fprintf` calls with `#ifdef DEBUG`; compile with and without `-DDEBUG` and compare the preprocessed output (gcc -E)
- `inline-action` — what symbol does GCC define on a 64-bit Linux system? (multiple choice: `__linux__`, `__x86_64__`)
- `reveal` — how `#ifndef FOO_H / #define FOO_H` works as an include guard: walk through what happens on the second `#include "foo.h"`

**Closing question**: ¿Por qué la compilación condicional sucede en el preprocesador (antes de compilar) en lugar de en el propio lenguaje con algo como `if constexpr`? ¿Qué diferencia hay entre las dos aproximaciones?

---

### Module CC3.3 — El ensamblador como microscopio

**Module BlogPost**: The compiler translates your C to assembly. That translation is deterministic — you can read it, predict it, and use it to understand why certain patterns are faster than others. Assembly reading is not an advanced skill reserved for compiler engineers; it's a diagnostic tool every systems programmer uses.

**Assembly approach in Forja**: Students read assembly (gcc -S), never write it from scratch for complex programs. The goal is recognition and interpretation, not fluency.

---

#### Unit CC3.3.1 — Los registros x86-64
*D1 · render_mode = "blog"*

**BlogPost axis**: x86-64 has 16 general-purpose registers. Their names encode their original purpose. The key three for reading compiler output: RAX (return values), RSP (stack pointer), RBP (frame pointer). The argument registers (RDI, RSI, RDX, RCX, R8, R9) carry function parameters.

**Action-IDEs**:
- `mini-sim` — register map: the student can click on any register and see its sub-registers (RAX/EAX/AX/AL) and their sizes
- `inline-action` — "¿Qué registro lleva el primer argumento de una función?" / "¿Qué registro tiene el valor de retorno?"
- `stepper` — reading a simple function's assembly: identify where the argument arrives, where the result goes

**Sources**: assembler.md § 2 (register identification objectives)

---

#### Unit CC3.3.2 — gcc -S y la lectura de ASM
*D1 · render_mode = "blog"*

**BlogPost axis**: `gcc -S -masm=intel` produces human-readable assembly. The student writes a simple C function, compiles it, and reads what the compiler did — instruction by instruction.

**Action-IDEs**:
- `expanded-ide` — compile a three-line C function with gcc -S; read the output; identify: function prologue, variable access, return value placement
- `stepper` — function call anatomy: CALL → stack alignment → argument passing via registers → return value in RAX
- `inline-action` — given an assembly snippet, identify which C construct produced it (loop, conditional, function call)

**Portals**:
- → Compilers E: "El assembly que estás leyendo es el output de tu futuro compilador. Cuando implementes codegen, vas a generar exactamente este formato."

**Closing question**: ¿Qué información pierde el assembly con respecto al código fuente C? ¿Qué información revela que el código fuente no muestra?

---

#### Unit CC3.3.3 — La calling convention
*D2 · render_mode = "blog"*

**BlogPost axis**: The System V AMD64 ABI is the contract between caller and callee. Arguments in RDI, RSI, RDX, RCX, R8, R9. Return value in RAX. Caller-saved vs. callee-saved registers. Stack alignment. The ABI is why you can call C code from assembly, Rust from C, and any language from any other.

**Action-IDEs**:
- `stepper` — step through a function call at the assembly level: how arguments arrive, how the frame is set up, how the return value is placed
- `expanded-ide` — write a function with 7+ parameters; observe how the 7th argument goes on the stack instead of a register
- `compare` — C function call assembly (-O0) vs. inlined version (-O3): the ABI can be optimized away for internal calls

**Portals**:
- → Compilers E: "La calling convention que estudiaste aquí es lo que tu backend de código RISC-V y x86-64 debe implementar. Esta es la interfaz entre tu compilador y el mundo." ← **CENTRAL PORTAL TO COMPILERS**
- → OS D: "El trap handler del kernel respeta esta misma ABI para llamar a funciones internas. El context switch guarda los callee-saved registers exactamente por esta razón."

**Xref**:
- ↔ OS D `[context-switch] D2`: saved registers = the callee-saved set from this ABI
- ↔ Compilers E `[codegen-calling-conv] D2`: the ABI this unit teaches is the ABI Compilers E generates

**Closing question**: ¿Por qué existe una distinción entre caller-saved y callee-saved registers? ¿Qué problema resuelve esa convención?

---

#### Unit CC3.3.4 — -O0 vs -O3
*D2 · render_mode = "studio"*

**BlogPost axis**: The optimizer rewrites your code. An -O3 build of the same source can be unrecognizable at the assembly level. Loops become SIMD instructions. Function calls disappear. Dead code is eliminated. This is not magic — it's the consequence of formal analysis on the code's semantics.

**Action-IDEs**:
- `compare` — the same C function compiled with -O0 and -O3 side by side: count the instructions, identify what changed
- `expanded-ide` — write a loop that sums an array; compile at -O0 and -O3; observe the vectorization; run both and measure time
- `stepper` — trace a specific optimization: constant folding → dead code elimination → function inlining, each step visible

**Portals**:
- → Rust: "El 'zero-cost abstractions' de Rust significa que el compilador puede optimizar los iteradores y closures al mismo nivel que -O3 de C. Acabás de ver eso en acción."
- → Compilers D: "Las optimizaciones que observaste — constant folding, DCE, inlining — son los optimization passes que vas a implementar en el track de Compilers."

---

### Module CC3.4 — Ingeniería inversa básica

**Module BlogPost**: The closing module of the C track inverts the normal direction: instead of writing code and observing the binary, you start with a binary and reconstruct the logic. This is the skill that connects everything learned in CC1–CC3: you need to understand the toolchain, the memory layout, the assembly, and the calling convention to make sense of a binary you've never seen before.

---

#### Unit CC3.4.1 — objdump -d y la lectura de binarios
*D2 · render_mode = "blog"*

**BlogPost axis**: objdump -d disassembles a binary into assembly. The output is not the original source — but it is the complete truth about what the program does. Symbol names, function boundaries, and jump targets are visible.

**Action-IDEs**:
- `expanded-ide` — disassemble a simple binary with objdump -d; identify the main function; trace a specific code path through the jump instructions
- `stepper` — reading a disassembly listing: how to find function starts, how to read a conditional jump, how to identify a loop

---

#### Unit CC3.4.2 — Identificar lógica de control en ASM
*D2 · render_mode = "studio"*

**BlogPost axis**: if/else in C produces CMP + Jcc in assembly. Loops produce backward jumps. Function calls produce CALL. Once you can identify these patterns, you can read a program without its source code.

**Action-IDEs**:
- `stepper` — five patterns: function prologue, conditional branch, loop, function call, string comparison — each shown in C and its assembly translation
- `full-lab` — given a disassembly listing of an unknown function, describe in pseudocode what the function does; then verify against the source

---

#### Unit CC3.4.3 — Parchear un binario
*D3 · render_mode = "studio"*

**BlogPost axis**: A binary is bytes. A JNE instruction is two specific bytes. Changing them to NOP bytes changes the program's behavior. This is the mechanical reality behind patching, cracking, and binary exploitation — and it demonstrates that security by obscurity (hiding source code) does not prevent analysis.

**Action-IDEs**:
- `full-lab` — given a binary with a password validation function: (1) use objdump to find the CMP+JNE sequence; (2) identify the bytes to change; (3) patch the binary using a hex editor; (4) verify the patched binary accepts any password
- `reveal` — why this exercise is important for security: the difference between "the source is hidden" and "the binary is protected"

**Portals**:
- → Compilers: "El linker y el loader trabajan con binarios exactamente como acabás de trabajar vos. En el track de Compilers, vas a generar ELF — el formato que analizaste aquí."
- → OS A: "El loader del OS mapea las secciones del binario que acabás de analizar en páginas de memoria virtual antes de ejecutarlo."

**Closing question**: ¿Qué dice este ejercicio sobre la diferencia entre seguridad por oscuridad y seguridad por diseño? ¿Qué haría que este binario fuera genuinamente difícil de analizar?

---

## Capstone — Estructura de datos dinámica y genérica

*D3 · project-action · ~8–12 hours*

**Spec**: Implement one of: dynamic `Vector` (resizable array) or basic `HashMap` (open addressing) in C.

Requirements:
- Dynamic memory throughout — no stack arrays for the data
- Generic via `void*` and a caller-supplied element size
- Complete `Makefile` with `make`, `make test`, `make clean`
- Automated test suite (caller-written tests pass)
- `valgrind --leak-check=full make test` produces zero errors, zero leaks

**Why this project closes the track**: it requires every skill learned — memory layout, pointer arithmetic, malloc/realloc/free discipline, struct design, Makefile authoring — and produces a real library that can be inspected with objdump, checked with Valgrind, and linked from another program.

**Portal on completion**:
- → Rust C3: "El Vector que implementaste en C es `Box<[T]>` + un campo de longitud. Rust lo hace seguro. Ahora entendés qué significa 'seguro' aquí." ← **GRADUATION PORTAL**

---

## Portal / Anchor Summary

| Origin | Destination | Trigger concept |
|--------|-------------|-----------------|
| CC1.1.2 | Compilers A | La toolchain es las fases de un compilador |
| CC1.3.1 | OS A | El loader mapea las secciones del binario |
| CC1.4.3 | OS A | Los registros de hardware se configuran con bit ops |
| CC1.4.4 | OS D | El stack frame es lo que el context switch guarda |
| CC1.4.4 | Rust C3 | El activation frame es el modelo que Rust formaliza |
| CC2.1.2 | Compilers E | LEA es la instrucción de acceso a arrays |
| CC2.1.6 | Rust C2 | void* → generics: la misma necesidad, diferente seguridad |
| CC2.2.1 | OS C | malloc llama a brk/mmap — syscalls del kernel |
| CC2.2.3 | Rust C3 | Valgrind detecta lo que el borrow checker previene |
| CC2.2.4 | Rust C3 | **CENTRAL PORTAL** — cada error clásico tiene su respuesta en Rust |
| CC3.1.1 | Rust C2 + OS | repr(C) y struct layouts para el hardware |
| CC3.1.2 | Rust C2 | Enums de Rust son uniones etiquetadas |
| CC3.1.3 | Rust C4 | Vtables y trait objects |
| CC3.1.3 | Compilers E | El codegen emite vtables |
| CC3.1.4 | Rust C2 | Enums C sin seguridad → enums Rust con exhaustividad |
| CC3.2.2 | Compilers A | El linker es la fase final de la pipeline del compilador |
| CC3.3.2 | Compilers E | El ASM que leés es el output de tu futuro compiler |
| CC3.3.3 | Compilers E | **CENTRAL PORTAL** — la ABI que tu codegen debe generar |
| CC3.3.3 | OS D | La ABI es la interfaz del context switch |
| CC3.3.4 | Compilers D | Los optimization passes que vas a implementar |
| CC3.4.3 | Compilers + OS A | ELF format, el loader |
| Capstone | Rust C3 | **GRADUATION PORTAL** — el Vector en C es Vec<T> sin seguridad |

---

## Sources

- *The C Programming Language* (Kernighan, Ritchie) — K&R, canonical reference
- *C Programming: A Modern Approach* (King) — clearest pedagogical treatment
- *Computer Systems: A Programmer's Perspective* (Bryant, O'Hallaron) — CS:APP, the gold standard for the memory/assembly content
- *Hacking: The Art of Exploitation* (Erickson) — for the reverse engineering and exploitation modules
- Valgrind documentation — memcheck manual
- System V AMD64 ABI specification — calling convention reference
- GCC documentation — optimization flags reference
