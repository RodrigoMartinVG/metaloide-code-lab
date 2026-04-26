# Portal / Anchor / Xref Spec

## Purpose

Forja's pedagogical model depends on the connection between tracks. Rust is the ground; Compilers and OS are destinations that Rust invites you toward. When a student is in an OS lab and gets stuck on a Rust concept, the system offers a path back — not as a prerequisite gate, but as a navigation offer.

PORTAL, ANCHOR, and XREF are the block types that make these connections explicit. They are not decorative links. They are first-order navigation elements with their own visual treatment, their own behavior in the skill tree, and their own entries in the progress store.

---

## Block Types

### `portal`

**Direction**: Rust Core → Compilers or OS

A portal is an invitation. It appears in a Rust lab at the moment where the concept being taught opens a door into a deeper subject. It says: "if you want to understand *why* this works the way it does, here is where that explanation lives."

A portal is never a prerequisite. The student can ignore it and continue. But following it records the navigation and opens the destination unit if it was locked (only if the prerequisite for the destination was otherwise met).

**Example placement**: At the end of `[ownership] D1`, after the student has completed the exercises:

```markdown
```portal
target_pillar: compilers
target_unit: semantic-analysis
target_depth: 1
text: |
  The borrow checker is a pass in Rust's compilation pipeline.
  It runs on MIR — the Mid-level Intermediate Representation —
  after type checking but before code generation.
  
  If you want to understand where it lives mechanically and how
  it works, this leads to Compilers › Semantic Analysis D1.
cta: "Explore the borrow checker's home"
```
```

**Example placement**: In `[unsafe] D1`, after the student understands what `unsafe` enables:

```markdown
```portal
target_pillar: os
target_unit: virtual-memory
target_depth: 1
text: |
  unsafe lets you bypass Rust's memory safety guarantees.
  But those guarantees exist because the hardware is
  unforgiving — not because the compiler is cautious.
  
  The kernel's virtual memory system is what makes any
  memory model possible. This is where it lives.
cta: "See why unsafe has to exist"
```
```

---

### `anchor`

**Direction**: Compilers or OS → Rust Core

An anchor is an offer of return. It appears in an OS or Compilers lab at the point where a Rust concept is required to proceed — specifically, a concept that the student may not have fully internalized.

An anchor is not a prerequisite warning. It is positioned at the moment of likely confusion, not at the top of the lab. It says: "if the compiler is rejecting this and you don't know why, here is where to find the answer."

**Example placement**: In `[paging-sv39] D1`, when the student first tries to hold two references to the page table structure:

```markdown
```anchor
source_unit: ownership
source_depth: 2
text: |
  If Rust is refusing to let you have two references to the
  page table and you're not sure why, that's the aliasing
  XOR mutation invariant.
  
  Go back to Rust › Ownership D2 — specifically the section
  on interior mutability. After seeing why you need it here,
  the pattern will make sense in a way it didn't the first time.
cta: "Revisit Rust › Ownership D2"
```
```

**Example placement**: In `[codegen-calling-conventions] D1`, when the student first encounters lifetime issues in the code generator:

```markdown
```anchor
source_unit: lifetimes
source_depth: 2
text: |
  The code generator needs to hold references to both the
  IR graph and the instruction buffer simultaneously.
  
  If the borrow checker is rejecting this, Rust › Lifetimes D2
  has the pattern you need — specifically higher-ranked
  trait bounds and why they exist.
cta: "Revisit Rust › Lifetimes D2"
```
```

---

### `xref`

**Direction**: OS ↔ Compilers (bidirectional)

An xref marks a mirror concept — the same idea viewed from two different layers. It appears in both labs that share the mirror relationship, pointing to each other.

**Example placement**: In `[context-switching] D1` (OS):

```markdown
```xref
partner_pillar: compilers
partner_unit: codegen-calling-conventions
partner_depth: 1
text: |
  Context switching saves and restores a specific set of registers.
  That set is not arbitrary — it's exactly the set defined by
  the RISC-V calling convention.
  
  The calling convention specifies which registers a function
  must preserve across calls. The scheduler uses the same list
  when switching between processes.
direction: "os_to_compilers"
```
```

The same xref appears in `[codegen-calling-conventions] D1` (Compilers), with `direction: "compilers_to_os"`.

---

## Rendering

### In the Lab

All three block types render as visually distinct cards in the content flow:

```
┌── PORTAL ──────────────────────────────────────────┐
│ (left border: destination pillar color)            │
│                                                    │
│ → Compilers › Semantic Analysis D1                 │
│                                                    │
│ "The borrow checker is a pass in Rust's            │
│  compilation pipeline..."                           │
│                                                    │
│                        [Explore the borrow checker's home →]
└────────────────────────────────────────────────────┘
```

```
┌── ANCHOR ──────────────────────────────────────────┐
│ (left border: Rust orange)                         │
│                                                    │
│ ← Rust › Ownership D2                              │
│                                                    │
│ "If Rust is refusing to let you have two           │
│  references to the page table..."                  │
│                                                    │
│                    [Revisit Rust › Ownership D2 →] │
└────────────────────────────────────────────────────┘
```

```
┌── XREF ────────────────────────────────────────────┐
│ (left border: gradient, both pillar colors)        │
│                                                    │
│ ↔ Compilers › Calling Conventions D1              │
│                                                    │
│ "Context switching saves exactly the registers     │
│  that the calling convention requires preserved." │
│                                                    │
│                    [See the mirror in Compilers →] │
└────────────────────────────────────────────────────┘
```

Cards use the pillar color system:
- Rust color: `#e05c1a`
- Compilers color: `#58a6ff`
- OS color: `#bc8cff`
- Left border: 3px solid, pillar color of the destination (or gradient for xref)

### In the Skill Tree

Cross-track edges are rendered as navigable lines between trees:

**Portal edges** (Rust → Compilers/OS):
- Line style: dashed
- Color: destination pillar color at 60% opacity
- Arrow: pointing toward destination
- On click: opens edge detail card (see UI_DESIGN.md)

**Anchor edges** (Compilers/OS → Rust):
- Line style: dashed
- Color: Rust orange at 60% opacity
- Arrow: pointing toward Rust Core

**Xref edges** (OS ↔ Compilers):
- Line style: dotted
- Color: gradient from OS purple to Compilers blue
- Arrows: both directions

All cross-track edges are **clickable**. Clicking opens the edge detail card:

```
PORTAL: Rust › Ownership D1 → Compilers › Semantic Analysis D1
"The borrow checker is a pass in Rust's compilation pipeline..."
[Go to Semantic Analysis D1]   [Dismiss]
```

---

## Progress Tracking

When a student follows a portal, anchor, or xref, the navigation is recorded in `lab_visits`:

```sql
INSERT INTO lab_visits (visit_id, lab_id, visited_at, visit_type, from_lab_id, from_pillar)
VALUES (
  'uuid',
  'compilers-semantic-analysis-1',
  '2025-01-15T14:32:00',
  'portal',          -- 'portal' | 'anchor' | 'xref'
  'rust-ownership-1',
  'rust'
);
```

This data surfaces in two places:
1. **Skill tree tooltip**: "Visited from Rust › Ownership D1 (via portal)" — shown on the destination node
2. **Anchor context**: when a student follows an anchor back to a Rust concept, the lab can display "You're revisiting this because you needed it in OS › Paging D1" — making the second reading intentional

The revisit context is not announced. It is visible in the tooltip on the Rust node. The student sees it if they look; it doesn't interrupt the flow if they don't.

---

## Content File Format

In `content.md`:

````markdown
```portal
target_pillar: compilers
target_unit: semantic-analysis
target_depth: 1
text: |
  Multi-line text describing what this portal leads to
  and why it's interesting from where the student stands now.
cta: "Short call-to-action text"
```

```anchor
source_pillar: rust
source_unit: ownership
source_depth: 2
text: |
  Multi-line text describing what the student is probably
  confused about and what they'll find if they go back.
cta: "Revisit Rust › Ownership D2"
```

```xref
partner_pillar: compilers
partner_unit: codegen-calling-conventions
partner_depth: 1
direction: "os_to_compilers"
text: |
  Multi-line text describing the mirror relationship.
cta: "See the mirror in Compilers"
```
````

These blocks are parsed by the content loader and serialized into the lab's block sequence. The renderer handles them as `ForjaPortalCard`, `ForjaAnchorCard`, and `ForjaXrefCard` Lit components respectively.

---

## Authoring Guidelines

**When to write a portal:**
- The current lab has surfaced a concept whose deeper explanation lives in another track
- The student has just done the exercise that would make the other track's content meaningful
- Position the portal at the end of the relevant exercise or section, not at the top of the lab

**When to write an anchor:**
- The OS or Compilers lab is about to require a Rust concept
- The concept is one that students commonly underestimate or half-remember
- Position the anchor at the moment of likely confusion — not as a preface to the lab
- Be specific: name the exact unit and depth, and describe what they'll find there

**When to write an xref:**
- Two concepts in OS and Compilers are genuinely the same thing at different layers
- Both labs can be more fully understood by knowing the other
- Write the xref in both labs, pointing to each other
- Be concrete about the relationship, not just the existence: explain what is the same

**What portals, anchors, and xrefs are not:**
- Not a prerequisite warning ("make sure you've done X before proceeding")
- Not a bibliography entry (that's a `reference` block)
- Not a "you might also be interested in" suggestion
- Not a cross-promotional link to unrelated content

Each block should earn its place. A portal that doesn't connect to something the student just confronted is noise. An anchor that fires before the student is confused is an interruption.
