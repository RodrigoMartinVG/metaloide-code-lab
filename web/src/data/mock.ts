export type NodeStatus = 'locked' | 'available' | 'started' | 'completed' | 'mastered'
export type Pillar = 'c' | 'rust' | 'compilers' | 'os'

export interface ConceptNode {
  id: string
  depth: 1 | 2 | 3
  pillar: Pillar
  name: string
  status: NodeStatus
  estimatedMinutes: number
  x: number
  y: number
}

export interface GraphEdge {
  from: { id: string; depth: number }
  to:   { id: string; depth: number }
}

export interface Lab {
  id: string
  conceptId: string
  depth: number
  title: string
  blocks: Block[]
}

export type Block =
  | { type: 'prose';    content: string }
  | { type: 'code';     id: string; language: string; starter: string; description: string }

// ── Mock graph ────────────────────────────────────────────────────────────────

export const MOCK_C_NODES: ConceptNode[] = [
  { id: 'c-toolchain',  depth: 1, pillar: 'c', name: 'Toolchain',          status: 'completed', estimatedMinutes: 20, x: 256, y:  40 },
  { id: 'c-syntax',     depth: 1, pillar: 'c', name: 'Syntax & Model',     status: 'started',   estimatedMinutes: 30, x:  40, y: 180 },
  { id: 'c-pointers',   depth: 1, pillar: 'c', name: 'Pointers',           status: 'available', estimatedMinutes: 35, x: 256, y: 180 },
  { id: 'c-arrays',     depth: 1, pillar: 'c', name: 'Arrays & Strings',   status: 'available', estimatedMinutes: 30, x: 472, y: 180 },
  { id: 'c-functions',  depth: 1, pillar: 'c', name: 'Functions & Scope',  status: 'locked',    estimatedMinutes: 30, x:  40, y: 320 },
  { id: 'c-structs',    depth: 1, pillar: 'c', name: 'Structs & Unions',   status: 'locked',    estimatedMinutes: 40, x: 256, y: 320 },
  { id: 'c-memory',     depth: 1, pillar: 'c', name: 'Manual Memory',      status: 'locked',    estimatedMinutes: 45, x: 472, y: 320 },
  { id: 'c-undefined',  depth: 1, pillar: 'c', name: 'Undefined Behavior', status: 'locked',    estimatedMinutes: 40, x: 256, y: 460 },
]

export const MOCK_C_EDGES: GraphEdge[] = [
  { from: { id: 'c-toolchain', depth: 1 }, to: { id: 'c-syntax',    depth: 1 } },
  { from: { id: 'c-toolchain', depth: 1 }, to: { id: 'c-pointers',  depth: 1 } },
  { from: { id: 'c-toolchain', depth: 1 }, to: { id: 'c-arrays',    depth: 1 } },
  { from: { id: 'c-syntax',    depth: 1 }, to: { id: 'c-functions', depth: 1 } },
  { from: { id: 'c-pointers',  depth: 1 }, to: { id: 'c-structs',   depth: 1 } },
  { from: { id: 'c-pointers',  depth: 1 }, to: { id: 'c-memory',    depth: 1 } },
  { from: { id: 'c-memory',    depth: 1 }, to: { id: 'c-undefined', depth: 1 } },
]

export const MOCK_NODES: ConceptNode[] = [
  { id: 'tooling',         depth: 1, pillar: 'rust', name: 'Tooling',           status: 'completed', estimatedMinutes: 20, x: 256, y:  40 },
  { id: 'variables-types', depth: 1, pillar: 'rust', name: 'Variables & Types', status: 'started',   estimatedMinutes: 30, x:  40, y: 180 },
  { id: 'functions',       depth: 1, pillar: 'rust', name: 'Functions',         status: 'available', estimatedMinutes: 20, x: 256, y: 180 },
  { id: 'control-flow',    depth: 1, pillar: 'rust', name: 'Control Flow',      status: 'available', estimatedMinutes: 25, x: 472, y: 180 },
  { id: 'structs',         depth: 1, pillar: 'rust', name: 'Structs',           status: 'locked',    estimatedMinutes: 35, x:  40, y: 320 },
  { id: 'enums-match',     depth: 1, pillar: 'rust', name: 'Enums & Match',     status: 'locked',    estimatedMinutes: 40, x: 256, y: 320 },
  { id: 'stack-heap',      depth: 1, pillar: 'rust', name: 'Stack & Heap',      status: 'locked',    estimatedMinutes: 45, x: 472, y: 320 },
  { id: 'ownership',       depth: 1, pillar: 'rust', name: 'Ownership',         status: 'locked',    estimatedMinutes: 45, x: 256, y: 460 },
]

export const MOCK_EDGES: GraphEdge[] = [
  { from: { id: 'tooling',         depth: 1 }, to: { id: 'variables-types', depth: 1 } },
  { from: { id: 'tooling',         depth: 1 }, to: { id: 'control-flow',    depth: 1 } },
  { from: { id: 'tooling',         depth: 1 }, to: { id: 'functions',       depth: 1 } },
  { from: { id: 'variables-types', depth: 1 }, to: { id: 'structs',         depth: 1 } },
  { from: { id: 'variables-types', depth: 1 }, to: { id: 'enums-match',     depth: 1 } },
  { from: { id: 'functions',       depth: 1 }, to: { id: 'stack-heap',      depth: 1 } },
  { from: { id: 'stack-heap',      depth: 1 }, to: { id: 'ownership',       depth: 1 } },
]

// ── Mock labs ─────────────────────────────────────────────────────────────────

export const MOCK_C_LABS: Record<string, Lab> = {
  'c-toolchain-1': {
    id: 'c-toolchain-1',
    conceptId: 'c-toolchain',
    depth: 1,
    title: 'Toolchain — Surface',
    blocks: [
      {
        type: 'prose',
        content: `# Environment & Toolchain

C has no official build system. The toolchain is just \`gcc\` (or \`clang\`) invoked
directly. Understanding the four-stage pipeline — preprocess, compile, assemble, link —
is not optional. It's the foundation of every debugging session you'll ever have.

## The four stages

\`\`\`
source.c  →  [preprocessor]  →  source.i
source.i  →  [compiler]      →  source.s   (assembly)
source.s  →  [assembler]     →  source.o   (object file)
source.o  →  [linker]        →  a.out      (executable)
\`\`\`

Run each stage explicitly with \`-E\`, \`-S\`, \`-c\`:

\`\`\`bash
gcc -E  hello.c -o hello.i   # preprocessor output
gcc -S  hello.c -o hello.s   # assembly output
gcc -c  hello.c -o hello.o   # object file
gcc     hello.c -o hello     # full pipeline
\`\`\`

## Flags you will always use

| Flag | Meaning |
|------|---------|
| \`-Wall -Wextra\` | Enable most warnings |
| \`-g\` | Embed debug symbols |
| \`-O2\` | Optimize (hides bugs; use \`-O0\` for debugging) |
| \`-std=c11\` | Fix the language version |
| \`-fsanitize=address\` | Enable AddressSanitizer |

The exercise below compiles and runs a minimal C program.
The goal is to read the compiler's output — not just "make it work."
`,
      },
      {
        type: 'code',
        id: 'ex-1',
        language: 'c',
        description: 'Complete main() so it prints the address and value of x using printf. Use %p for the pointer and %d for the integer.',
        starter: `#include <stdio.h>

int main(void) {
    int x = 42;
    int *p = &x;

    /* print: addr=0x..., value=42 */

    return 0;
}
`,
      },
    ],
  },
}

export const MOCK_LABS: Record<string, Lab> = {
  'variables-types-1': {
    id: 'variables-types-1',
    conceptId: 'variables-types',
    depth: 1,
    title: 'Variables & Types — Surface',
    blocks: [
      {
        type: 'prose',
        content: `# Variables & Types

In Rust, every value has a type. The compiler knows that type at compile time — always.
There is no runtime type discovery, no \`typeof\`, no implicit coercions between numeric types.

## Declaring a variable

\`\`\`rust
let x = 5;
\`\`\`

\`x\` is immutable by default. This isn't a convention — trying to assign to it again
is a compile error. Immutability is the default because most variables don't need to change,
and making mutation explicit makes code easier to reason about.

To allow mutation:

\`\`\`rust
let mut x = 5;
x = 6; // fine
\`\`\`

## Type inference

The compiler infers \`x: i32\` above. You can be explicit:

\`\`\`rust
let x: i32 = 5;
\`\`\`

Explicit annotations are required when the compiler can't infer the type from context.
They're also useful as documentation.

## Scalar types

| Type | Description | Range |
|------|-------------|-------|
| \`i8\`–\`i128\` | Signed integers | −2ⁿ⁻¹ to 2ⁿ⁻¹−1 |
| \`u8\`–\`u128\` | Unsigned integers | 0 to 2ⁿ−1 |
| \`isize\`, \`usize\` | Platform-sized | 32 or 64 bit |
| \`f32\`, \`f64\` | Floating point | IEEE 754 |
| \`bool\` | Boolean | \`true\`, \`false\` |
| \`char\` | Unicode scalar | U+0000 to U+D7FF, U+E000 to U+10FFFF |

\`usize\` is the type used for indexing into collections — it's the size of a pointer
on the target platform.
`,
      },
      {
        type: 'code',
        id: 'ex-1',
        language: 'rust',
        description: 'Declare three variables: an immutable `i32`, a mutable `u8`, and a `bool`. Print all three.',
        starter: `fn main() {
    // declare your variables here

}
`,
      },
    ],
  },
}
