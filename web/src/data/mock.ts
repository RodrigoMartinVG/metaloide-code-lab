import type { Track, Lab } from '../types.js'

// ── C Track ───────────────────────────────────────────────────────────────────

export const C_TRACK: Track = {
  id:      'c',
  label:   'C',
  tagline: 'La Máquina',
  color:   '#3fb950',
  courses: [
    {
      id:          'cc1',
      trackId:     'c',
      name:        'C Core',
      description: 'Syntax, types, pointers, and the mental model of a language without a safety net.',
      status:      'started',
      units: [
        { id: 'cc1.1', courseId: 'cc1', name: 'Environment & Toolchain', depth: 1, renderMode: 'blog',   status: 'completed', estimatedMinutes: 20 },
        { id: 'cc1.2', courseId: 'cc1', name: 'Syntax & Mental Model',   depth: 1, renderMode: 'blog',   status: 'started',   estimatedMinutes: 30 },
        { id: 'cc1.3', courseId: 'cc1', name: 'Pointers',                depth: 2, renderMode: 'studio', status: 'available', estimatedMinutes: 35 },
        { id: 'cc1.4', courseId: 'cc1', name: 'Arrays & Strings',        depth: 1, renderMode: 'blog',   status: 'locked',    estimatedMinutes: 30 },
      ],
    },
    {
      id:          'cc2',
      trackId:     'c',
      name:        'Memory',
      description: 'Stack, heap, malloc, free, and the tools that make the invisible visible.',
      status:      'locked',
      units: [
        { id: 'cc2.1', courseId: 'cc2', name: 'Stack & Heap',          depth: 2, renderMode: 'studio', status: 'locked', estimatedMinutes: 40 },
        { id: 'cc2.2', courseId: 'cc2', name: 'Dynamic Allocation',    depth: 2, renderMode: 'studio', status: 'locked', estimatedMinutes: 45 },
        { id: 'cc2.3', courseId: 'cc2', name: 'Valgrind & ASan',       depth: 2, renderMode: 'studio', status: 'locked', estimatedMinutes: 35 },
      ],
    },
    {
      id:          'cc3',
      trackId:     'c',
      name:        'Undefined Behavior',
      description: 'The parts of C where the language standard says anything can happen — and why that matters.',
      status:      'locked',
      units: [
        { id: 'cc3.1', courseId: 'cc3', name: 'What UB Is',           depth: 1, renderMode: 'blog',   status: 'locked', estimatedMinutes: 25 },
        { id: 'cc3.2', courseId: 'cc3', name: 'Traps & Sanitizers',   depth: 2, renderMode: 'studio', status: 'locked', estimatedMinutes: 40 },
        { id: 'cc3.3', courseId: 'cc3', name: 'Reading Asm Output',   depth: 3, renderMode: 'studio', status: 'locked', estimatedMinutes: 50 },
      ],
    },
  ],
}

// ── Rust Track (stub) ─────────────────────────────────────────────────────────

export const RUST_TRACK: Track = {
  id:           'rust',
  label:        'Rust',
  tagline:      'El Suelo',
  color:        '#e05c1a',
  prerequisite: 'Recommended: complete C Core first.',
  courses: [
    {
      id:          'rc1',
      trackId:     'rust',
      name:        'Rust Core',
      description: 'Ownership, borrowing, and the type system that makes C\'s dangers compile errors.',
      status:      'locked',
      units: [
        { id: 'rc1.1', courseId: 'rc1', name: 'Tooling',            depth: 1, renderMode: 'blog',   status: 'locked', estimatedMinutes: 20 },
        { id: 'rc1.2', courseId: 'rc1', name: 'Variables & Types',  depth: 1, renderMode: 'blog',   status: 'locked', estimatedMinutes: 30 },
        { id: 'rc1.3', courseId: 'rc1', name: 'Ownership',          depth: 3, renderMode: 'studio', status: 'locked', estimatedMinutes: 45 },
      ],
    },
  ],
}

export const COMPILERS_TRACK: Track = {
  id:           'compilers',
  label:        'Compilers',
  tagline:      'Destino 1',
  color:        '#58a6ff',
  prerequisite: 'Requires: Rust Core RC1 + RC2.',
  courses: [],
}

export const OS_TRACK: Track = {
  id:           'os',
  label:        'Operating Systems',
  tagline:      'Destino 2',
  color:        '#bc8cff',
  prerequisite: 'Requires: Rust Core RC1 + RC2 + RC6.',
  courses: [],
}

export const ALL_TRACKS: Track[] = [C_TRACK, RUST_TRACK, COMPILERS_TRACK, OS_TRACK]

export function getTrack(id: string) {
  return ALL_TRACKS.find(t => t.id === id)
}

export function getUnit(unitId: string) {
  for (const track of ALL_TRACKS) {
    for (const course of track.courses) {
      const unit = course.units.find(u => u.id === unitId)
      if (unit) return { unit, course, track }
    }
  }
  return null
}

// ── Labs ──────────────────────────────────────────────────────────────────────

export const MOCK_LABS: Record<string, Lab> = {

  'cc1.1': {
    unitId: 'cc1.1',
    title:  'Environment & Toolchain',
    blocks: [
      {
        type: 'prose',
        content: `# Environment & Toolchain

C has no package manager, no official build system, no standard project structure.
The "toolchain" is \`gcc\` or \`clang\` called at the shell. This is not a limitation —
it is C's philosophy. The compiler is not a black box. Every step it takes has a name.

## The four stages

Every \`.c\` file passes through four distinct transformations before becoming an executable:

\`\`\`
source.c  →  [preprocessor]  →  source.i   (macros expanded, includes inlined)
source.i  →  [compiler]      →  source.s   (C → assembly)
source.s  →  [assembler]     →  source.o   (machine code, no addresses yet)
source.o  →  [linker]        →  a.out      (addresses resolved, libraries linked)
\`\`\`

You can stop the pipeline at any stage:

\`\`\`bash
gcc -E  hello.c -o hello.i   # stop after preprocessor
gcc -S  hello.c -o hello.s   # stop after compiler — inspect the assembly
gcc -c  hello.c -o hello.o   # stop after assembler
gcc     hello.c -o hello     # full pipeline
\`\`\`

The \`-S\` stage deserves attention. Any time you wonder what the CPU actually executes,
compile with \`-S -O0\` and read the output. No abstraction layer, no runtime, no JIT.
This is what "close to the metal" means.

## Flags you will use on every build

| Flag | When | Why |
|------|------|-----|
| \`-Wall -Wextra\` | Always | Catches half the bugs before they happen |
| \`-g\` | Development | Embeds debug symbols for \`gdb\` / \`lldb\` |
| \`-std=c11\` | Always | Pins the language version |
| \`-O0\` | Debug builds | Disables optimization; machine code matches source |
| \`-O2\` | Release builds | Enables most optimizations; can reorder and eliminate code |
| \`-fsanitize=address,undefined\` | Debug | Catches memory errors and UB at runtime |

The combination \`-Wall -Wextra -Werror -fsanitize=address,undefined\` is your baseline.
If the code compiles clean with those flags, you have already eliminated a large class of bugs.`,
      },
      {
        type: 'code',
        language: 'makefile',
        content: `CC     = gcc
CFLAGS = -std=c11 -Wall -Wextra -Werror -g -fsanitize=address,undefined

hello: hello.c
\t$(CC) $(CFLAGS) -o $@ $<

.PHONY: clean
clean:
\trm -f hello`,
      },
      {
        type: 'closing-question',
        question: '¿Por qué el compilador separa las fases de preprocesado y compilación en lugar de tratarlas como una sola etapa?',
      },
    ],
  },

  'cc1.2': {
    unitId: 'cc1.2',
    title:  'Syntax & Mental Model',
    blocks: [
      {
        type: 'prose',
        content: `# Syntax & Mental Model

C is small. The entire language fits in your head. This is both its strength and its danger:
there is nothing between you and the machine except what you write.

## Variables are boxes in memory

\`\`\`c
int x = 42;
\`\`\`

This statement does three things:
1. Reserves space in memory for an integer (typically 4 bytes on modern systems)
2. Names that space \`x\`
3. Stores the bit pattern for 42 in that space

There is no garbage collector deciding when to free this. There is no runtime checking
that you haven't written outside the bounds. The compiler trusts you.

## Types are promises to the compiler

| Type | Size | Range |
|------|------|-------|
| \`char\` | 1 byte | −128 to 127 (or 0–255) |
| \`int\` | 4 bytes | −2,147,483,648 to 2,147,483,647 |
| \`long\` | 4 or 8 bytes | platform-dependent |
| \`float\` | 4 bytes | IEEE 754 single precision |
| \`double\` | 8 bytes | IEEE 754 double precision |

When you declare \`int x\`, you're telling the compiler: "interpret the bits at this address
as a signed 32-bit integer." The bits don't care what you call them.

## The preprocessor runs before the compiler

\`\`\`c
#include <stdio.h>   // textually pastes the contents of stdio.h here
#define MAX 100      // replaces every occurrence of MAX with 100
\`\`\`

Preprocessor directives (lines starting with \`#\`) are text substitutions.
They run before the compiler sees the code. \`#include\` is literally copy-paste.`,
      },
      {
        type: 'closing-question',
        question: '¿Por qué C distingue entre `int`, `long` y `long long` en lugar de tener un solo tipo entero de tamaño fijo?',
      },
    ],
  },

  'cc1.3': {
    unitId: 'cc1.3',
    title:  'Pointers',
    blocks: [
      {
        type: 'prose',
        content: `# Pointers

A pointer is a variable whose value is a memory address. That is the complete definition.
Everything else — pointer arithmetic, function pointers, double pointers — follows from
this one fact.

## The two operators

\`\`\`c
int x  = 42;
int *p = &x;   // & = "the address of"
int y  = *p;   // * = "the value at this address"
\`\`\`

- \`&x\` produces the address where \`x\` lives in memory.
- \`*p\` dereferences \`p\` — it follows the address and reads the value there.

## Reading pointer declarations

Read them right to left:

\`\`\`c
int *p       // p is a pointer to int
int **pp     // pp is a pointer to a pointer to int
const int *p // p is a pointer to a const int (can't modify through p)
int * const p// p is a const pointer to int (p itself can't be reassigned)
\`\`\`

## Why pointers exist

C was designed to write operating systems and compilers. Both need to:
- Pass large data structures without copying them
- Modify variables inside functions
- Work directly with memory addresses returned by the OS

Every modern language hides this behind references or handles. C exposes it directly.
When Rust talks about "references" and "borrowing", it is solving the exact problems
that pointers make visible here.`,
      },
      {
        type: 'exercise',
        id: 'ptr-swap',
        language: 'c',
        description: 'Implement swap(a, b) — a function that exchanges the values of two integers using pointers. Then call it from main and print the result.',
        starter: `#include <stdio.h>

/* implement swap so it modifies the originals, not copies */
void swap(int *a, int *b) {
    /* your code here */
}

int main(void) {
    int x = 10;
    int y = 20;

    swap(&x, &y);

    /* should print: x=20, y=10 */
    printf("x=%d, y=%d\\n", x, y);
    return 0;
}
`,
      },
      {
        type: 'closing-question',
        question: '¿Por qué `swap(x, y)` (sin punteros) no funciona en C, aunque en otros lenguajes sí?',
      },
    ],
  },

}

export function getLab(unitId: string): Lab | null {
  return MOCK_LABS[unitId] ?? null
}
