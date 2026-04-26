export type NodeStatus = 'locked' | 'available' | 'started' | 'completed' | 'mastered'
export type Pillar = 'rust' | 'compilers' | 'os'

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
