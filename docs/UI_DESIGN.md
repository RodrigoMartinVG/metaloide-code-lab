# UI Design

## Premise

The interface is a tool, not a product. It should feel like a good IDE or a well-typeset technical book — dense, purposeful, nothing decorative. The learner is spending serious time here. Every pixel of chrome is time not spent on the content.

No mascots. No confetti. No progress bars that animate for 3 seconds when you do nothing. No tooltips that explain what a button does if the label already does that.

---

## Visual Language

### Color Palette

Base: near-black with warm undertones. Not pure #000000 — that reads as cheap.

```
Background (primary):    #0f1117   -- main canvas
Background (surface):    #161b22   -- panels, cards, sidebar
Background (elevated):   #1c2128   -- modals, dropdowns, active states
Border:                  #30363d   -- separators, panel edges
Border (subtle):         #21262d   -- secondary separators

Text (primary):          #e6edf3   -- main content
Text (secondary):        #8b949e   -- metadata, labels, de-emphasized
Text (muted):            #484f58   -- placeholders, very de-emphasized
Text (inverse):          #0f1117   -- text on light backgrounds

Accent (Rust/forge):     #e05c1a   -- primary CTA, active states, links
Accent (dim):            #7a3010   -- hover states, backgrounds
Accent (glow):           #ff7b35   -- active editor gutter, current block indicator

Success:                 #3fb950   -- passing tests, completed exercises
Warning:                 #d29922   -- compiler warnings, slow benchmarks
Error:                   #f85149   -- compiler errors, failing tests
Info:                    #388bfd   -- hints, reference links

Pillar: Rust:            #e05c1a   -- the forge orange
Pillar: Compilers:       #58a6ff   -- cool blue (parsing = logic)
Pillar: OS:              #bc8cff   -- purple (kernel = deep, abstract)
```

Cross-track edge colors (for skill tree):
```
Portal edge (Rust → Compilers/OS): dashed, pillar color of destination, 60% opacity
Anchor edge (Compilers/OS → Rust): dashed, Rust orange, 60% opacity
Xref edge (OS ↔ Compilers):        dotted, both pillar colors as gradient
```

### Typography

```
Prose font:     Inter (variable) — clean, technical, excellent at small sizes
Code font:      JetBrains Mono — readable ligatures, good Rust symbol support
Display font:   Inter (semibold/bold) — same family, no mixing

Base prose size: 15px / 1.6 line-height
Code size:       13px / 1.5 line-height
Small labels:    12px / 1.4 line-height

No font below 11px. No line-height below 1.4.
```

### Spacing

8px base unit. Spacing is always a multiple of 4px.

```
xs:   4px
sm:   8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px
3xl: 64px
```

### Elevation / Depth

No box shadows. Depth is communicated through background color stepping (surface → elevated) and border contrast, not shadows. Shadows on dark backgrounds look cheap and are visually noisy.

---

## Layout

### Shell

The platform has two primary views: the **Skill Tree** (map/navigation) and the **Lab** (learning). They're separate screens, not panels. You're either navigating or working.

```
┌──────────────────────────────────────────────────────────┐
│  Forja    [Rust] [Compilers] [OS]          [settings] [?] │  ← Topbar (48px)
├──────────────────────────────────────────────────────────┤
│                                                          │
│                  SKILL TREE VIEW                         │
│            (the map — between labs)                      │
│                                                          │
│   ○─────○              ○ = available                     │
│   │      \             ● = in progress                   │
│   ●       ○            ✓ = completed                     │
│   │      /             ★ = mastered                      │
│   ✓─────✓              ⊘ = locked (visible, not enterable)│
│           \                                              │
│   - - → ⊘             - - = cross-track edge (navigable) │
│                                                          │
│   [hover any node → tooltip: name, time, prereqs, revisit context]
│   [click available/started node → enter Lab View]        │
│   [click cross-track edge → edge detail card]            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

```
┌──────────────────────────────────────────────────────────┐
│  Forja    [← Map]  Rust › Ownership › D1   [★ challenge] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│                    LAB VIEW                              │
│              (where learning happens)                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Topbar** (48px, fixed):
- In Skill Tree View: logo + pillar tabs (Rust / Compilers / OS)
- In Lab View: logo + back arrow to map + breadcrumb (Pillar › Course › Unit D1) + challenge button if available
- Right: settings icon only

**Skill Tree View — layout**:
- The tree is rendered as an SVG/Canvas graph. Nodes are unit cards (grouped by Course), edges show unlock direction.
- Pillar selector at top switches which track's tree is shown.
- **Cross-track edges are first-class, navigable elements** — not decorative. See below.
- Clicking a locked node: tooltip shows what's required and the revisit context if applicable. No hover lecture.
- Clicking an available/started node: opens the Lab View for that unit/depth.

**Main Viewport**: everything else.

---

## Cross-Track Edges in the Skill Tree

Cross-track edges (portals, anchors, xrefs) are not "a small inset." They are navigable, meaningful connections. This is the heart of the pedagogical model.

### Visual Representation

**Portal edges** (Rust → Compilers/OS):
- Rendered as dashed lines exiting the Rust tree
- Color: destination pillar color (blue for Compilers, purple for OS)
- Line style: dashed, slightly translucent
- Arrowhead points toward the destination

**Anchor edges** (Compilers/OS → Rust):
- Rendered as dashed lines pointing back into Rust Core
- Color: Rust orange
- Line style: dashed, slightly translucent
- Arrowhead points toward Rust Core

**Xref edges** (OS ↔ Compilers):
- Rendered as dotted lines between the two pillars
- Color: gradient from OS purple to Compilers blue
- Bidirectional arrowheads

### Interaction

Clicking a cross-track edge (not the nodes it connects) opens an **edge detail card** — a small overlay showing:

```
┌──────────────────────────────────────────────────────────┐
│  PORTAL                                                  │
│  Rust › Ownership D1  →  Compilers › Semantic Analysis D1│
│                                                          │
│  "The borrow checker is a semantic analysis pass. If you │
│   want to understand where it lives mechanically, this    │
│   shows you."                                            │
│                                                          │
│  [Go to Semantic Analysis D1]   [Dismiss]                │
└──────────────────────────────────────────────────────────┘
```

The student can follow the edge or dismiss it. Following it records a `portal` visit in the progress store.

### Across Pillars

When viewing the Rust tree, portal edges are visible at the edges of the canvas — they "leave" the tree toward an offscreen destination pillar. A small label at the edge exit point names the destination: "→ Compilers: Semantic Analysis."

When viewing the Compilers or OS tree, anchor edges are visible — they point back toward Rust Core. A label names the source: "← Rust: Ownership D2."

The student can see the full picture: which Rust concepts open which doors, which OS/Compilers concepts lean back on which Rust foundations.

---

## Lab Layout

The lab viewport has three possible configurations depending on the current block type:

### Reading mode (prose, quiz, reference, portal, anchor)
```
┌──────────────────────────────────────┐
│  [breadcrumb] Rust › Ownership › D1  │  (24px)
├──────────────────────────────────────┤
│                                      │
│   Prose content, centered column,    │
│   max-width: 720px, margins auto     │
│                                      │
│   Typography-first. No sidebars.     │
│   Full vertical scrolling.           │
│                                      │
│   ┌─ PORTAL ─────────────────────┐   │
│   │ → Compilers › Semantic       │   │
│   │   Analysis D1                │   │
│   │   "Where the borrow checker  │   │
│   │    lives in the pipeline"    │   │
│   │         [Explore →]          │   │
│   └──────────────────────────────┘   │
│                                      │
└──────────────────────────────────────┘
```

Portal/anchor/xref blocks render as visually distinct cards — left-bordered in the destination pillar's color, with a clear call to action. They are in the content flow, not sidebars or footnotes.

### Code mode (code, exercise)
```
┌──────────────┬────────────────────────┐
│  Context     │  Monaco Editor         │
│  (lab prose  │                        │
│  above the   │  (takes 60% of width)  │
│  exercise,   ├────────────────────────┤
│  40% width)  │  Output Panel          │
│              │  (compiler + stdout    │
│              │   + tests, streamed)   │
└──────────────┴────────────────────────┘
```

The split is resizable. The editor is always right. Context scrolls independently.

### Visualization mode (viz blocks)
```
┌──────────────────────────────────────┐
│  Viz component takes the full width  │
│  (or near-full, with controls panel) │
│                                      │
│  Scrolling prose above and below     │
│  the viz as part of the block flow.  │
└──────────────────────────────────────┘
```

Visualization blocks are inline in the content flow — not in popups or tabs.

---

## Cuaderno de Campo — Blog-Mode Rendering

Blog-mode is a distinct rendering mode for units. When a unit opens in blog-mode, the entire visual contract changes: the interface becomes a reading surface, not a building surface. This mode is called "Cuaderno de Campo" in the UI.

### When Blog-Mode Is Active

The topbar changes to show:
```
FORJA  ·  CUADERNO DE CAMPO          [breadcrumb] Pillar › Course › Unit
```

"CUADERNO DE CAMPO" is monospace, uppercase, small letter-spacing — a fixed ambient label that signals the reading mode. It does not appear in Studio-mode.

A toggle button ("Abrir en Taller →") is available in the topbar for units where Studio-mode is also supported.

### Color Palette — Blog-Mode

Blog-mode uses a separate light palette. It is not a "light theme" of the dark palette — it is a deliberately warm, paper-like tone that signals "reading" rather than "building."

```
Background:          #f8f4ef   -- warm off-white, not pure white
Surface:             #f0ebe3   -- cards, inline action containers
Border:              #d8cfc4   -- separators, subtle dividers
Text (primary):      #1a1a1a   -- near-black, slightly warm
Text (secondary):    #5a5550   -- captions, labels, metadata
Text (muted):        #9a9590   -- section labels, figure numbers

Accent (italic):     #e05c1a   -- same forge orange — the bridge to the dark UI
Code background:     #1c2128   -- intentionally dark — contrast against light page
Code text:           #e6edf3   -- same as dark mode
```

Code blocks are the only dark elements in blog-mode. This contrast is deliberate: the student is reading warm text, then encounters a dark code block — a signal that something active is about to happen.

### Typography — Blog-Mode

```
Body text:       Inter, 15px/1.85, color #1a1a1a — generous leading for extended reading
Section labels:  JetBrains Mono, 10px, uppercase, letter-spacing 1.5px, color #9a9590
Section titles:  Inter 26–36px, weight 700, line-height 1.15
  — Mix regular + italic, italic word in #e05c1a accent color
  — Examples: "El código que rompe" / "La memoria, *observada*" / "El error, en sus *palabras*"
Pull quotes:     Inter italic, 22–28px, line-height 1.4, used for key insights
Captions:        JetBrains Mono, 11px, letter-spacing 0.5px, color #9a9590
  — Format: "FIG. N  DESCRIPTION IN SMALL CAPS"
```

The italic element in section titles is always the conceptual insight — the thing the section is teaching. Regular words set the scene; the italic word names the discovery.

### Layout — Blog-Mode

```
┌──────────────────────────────────────────────────────────────────┐
│  FORJA  ·  CUADERNO DE CAMPO              [breadcrumb]  [taller→] │  ← topbar (48px, light bg)
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                ┌─────────────────────────────┐                   │
│                │   CAPÍTULO N · Track › Unit  │  (mono, 10px)    │
│                │                              │                   │
│                │   Title                      │  (32-48px bold)  │
│                │   *italic accent*            │  (italic orange) │
│                │                              │                   │
│                │   [lede paragraph — larger   │  (16px, lead)    │
│                │    introductory text]         │                   │
│                │                              │                   │
│                │   TIPO  TIEMPO  ESTADO  PASO │  (meta strip)    │
│                │                              │                   │
│                │   § N.M  Section title here  │  (section label) │
│                │                              │                   │
│                │   Body prose at 15px/1.85.   │                   │
│                │   Max ~65ch per line.        │                   │
│                │                              │                   │
│                │   ┌──────────── dark ──────┐ │  (code block)    │
│                │   │  code block             │ │                   │
│                │   │  + COMPILAR button      │ │                   │
│                │   └─────────────────────────┘ │                   │
│                │                              │                   │
│                │   FIG. N  CAPTION TEXT       │  (figure label)  │
│                │                              │                   │
│                │   [inline action or viz]     │  (embedded)      │
│                │                              │                   │
│                │   ¿Por qué así?              │  (closing)       │
│                │   [prompt text]              │                   │
│                │   [ ANOTAR RESPUESTA → ]     │                   │
│                │                              │                   │
│                │   Los portales abiertos      │  (portal section)│
│                │   i.   [portal entry]        │                   │
│                │   ii.  [portal entry]        │                   │
│                └─────────────────────────────┘                   │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  LB4 · OWNERSHIP  ·  CERRADO A LAS 22:14  ·  SIGUIENTE: LB5 →   │  ← bottom bar (32px)
└──────────────────────────────────────────────────────────────────┘
```

Content column: max-width 680px, centered, padding 40px horizontal.
No sidebar. No panels. One column.

### Metadata Strip

Below the unit title, a single horizontal row in `JetBrains Mono`, small, muted:

```
TIPO  LAB    ·    TIEMPO  25 MIN    ·    ESTADO  EN CURSO    ·    AVANCE  2 / 7 PASOS
```

### Inline Action-IDEs in Blog-Mode

Action-IDEs embedded in blog-mode are visually contained without feeling like popups:

**Inline Action** (quiz, fill): Rendered as a lightly bordered card with warm surface background, no drop shadow. Appears mid-prose, full column width.

**Inline Reveal**: A line of text with a toggle — `[§ Mostrar explicación]`. On tap, the explanation appears below in a slightly indented style. Collapses again on re-tap.

**Mini Simulator / Stepper**: Rendered full column width. Always has a figure caption below (`FIG. N  DESCRIPTION`). Step navigation `← ANTERIOR | SIGUIENTE PASO → | PASO N / M` appears inline below the visualization.

**Expanded IDE** (`expanded-ide` block): Renders as a bordered call-to-action section:
```
┌── EJERCICIO ──────────────────────────────────────────────┐
│  [brief task description in prose style]                  │
│                                                           │
│  [ Abrir en Taller → ]                                    │
└───────────────────────────────────────────────────────────┘
```
Clicking opens Studio-mode for this exercise only. The blog-mode background dims to indicate the context switch. On close, the student returns to the BlogPost at the same position. The exercise's pass/fail state is shown back in the card.

### Closing Question Section

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   ¿                                                      │
│                                                          │
│   ¿Por qué así?                (large, italic, orange)  │
│                                                          │
│   [The question — specific design decision, 2-3 sentences│
│    in regular body text]                                 │
│                                                          │
│   Lo que escribas queda en tu cuaderno y se conecta     │
│   automáticamente con los próximos labs que toquen       │
│   esta decisión.   (small, muted)                        │
│                                                          │
│   [ ANOTAR RESPUESTA → ]    (CTA button, full-width)    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

The `¿` character is displayed large (display size) as a visual anchor for the section.

On revisit, if a previous answer exists, it surfaces above the prompt:
```
  La última vez que estuviste aquí escribiste:
  "[previous answer in italic]"
  — [date] · [context: "antes de OS · Trap Handling"]
```

### Portal Section at End of BlogPost

After the closing question, portals render as a numbered narrative list — not cards, not sidebar items:

```
Los portales abiertos

Lo que acabás de ver no es solo una regla de Rust. Es una decisión que
reverbera en otros tracks del bosque. Acá hay tres senderos que se
abrieron con esta lección:

  i.   [TRACK LABEL · TOPIC LABEL]
       [One sentence connecting the concept to the destination]
                                                              →

  ii.  [TRACK LABEL · TOPIC LABEL]
       ...

  iii. [PRÁCTICA · PROJECT LABEL]
       ...
```

Track labels are in their pillar color (monospace, uppercase, small). The `→` is a right-arrow navigation indicator. Clicking a portal entry records the visit and navigates to the destination.

### Bottom Fixed Bar

32px fixed bar at the bottom of the viewport in blog-mode:

```
LB4 · OWNERSHIP  ·  EN CURSO  ·  SIGUIENTE: LB5 · BORROWING →
```

Format: `[lab ID] · [unit name]  ·  [status]  ·  SIGUIENTE: [next lab] →`

Clicking "SIGUIENTE" advances to the next lab in the unit. If the current lab is incomplete (required exercises not passed), the next lab is still reachable — there are no hard gates in blog-mode navigation. Progress is recorded automatically.

---

## Code Editor (Monaco)

### Configuration

```typescript
monaco.editor.create(container, {
  theme: 'forja-dark',           // custom theme, see below
  language: 'rust',
  fontSize: 13,
  fontFamily: 'JetBrains Mono, monospace',
  fontLigatures: true,
  lineNumbers: 'on',
  minimap: { enabled: false },   // minimap is noise in small editors
  scrollBeyondLastLine: false,
  wordWrap: 'off',
  tabSize: 4,
  insertSpaces: true,
  renderWhitespace: 'selection',
  bracketPairColorization: { enabled: true },
  padding: { top: 16, bottom: 16 },
  overviewRulerBorder: false,
  hideCursorInOverviewRuler: true,
  renderLineHighlight: 'gutter',
})
```

### Custom Theme: `forja-dark`

Built on the Monaco theming API. Based on the color palette:
- Background: `#0f1117`
- Gutter background: `#161b22`
- Selection: `#388bfd22` (info blue, low opacity)
- Active line gutter: accent orange `#e05c1a` (2px left bar, not full highlight)
- Rust keywords: pillar orange `#e05c1a`
- Strings: `#a5c261`
- Comments: `#6e7681` (muted, not colorful — comments are secondary)
- Types/traits: `#58a6ff`
- Macros: `#bc8cff`
- Errors: red underline `#f85149`, no red backgrounds

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Run code |
| `Ctrl+Shift+Enter` | Run tests |
| `Ctrl+K Ctrl+R` | Reset to starter |
| `Ctrl+K Ctrl+S` | Save local snapshot |
| `F1` | Command palette (standard Monaco) |

---

## Output Panel

The output panel renders compiler output, stdout, and test results. It is not a terminal — it's a structured renderer that understands what the Rust compiler produces.

```
┌──────────────────────────────────────────────────────┐
│  [Compiler]  [Output]  [Tests]               [Clear] │  ← tabs
├──────────────────────────────────────────────────────┤
│                                                      │
│  error[E0502]: cannot borrow `s` as mutable          │
│    --> src/main.rs:8:5                               │
│     │                                                │
│   6 │   let r = &s;                                  │
│     │           -- immutable borrow here             │
│   8 │   s.push_str("!");                             │
│     │   ^^^^^^^^^ mutable borrow here                │
│                                                      │
│  For more information: rustc --explain E0502         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Key behaviors:
- Compiler errors are syntax-highlighted and clickable (jump to line in editor)
- `rustc --explain Exxxx` is offered as an inline link
- Warnings are collapsible (not hidden, but not screaming)
- Test results: green checkmark / red X per test, with failure message expanded
- Execution output: plain, monospace, line-buffered

---

## Navigation and Progress

### Skill Tree Node States

Each node in the skill tree is a unit at a specific depth. Visual states:

```
○   available     white ring, full opacity, clickable
●   in progress   accent orange fill, pulsing ring
✓   completed     muted green fill, static
★   mastered      gold fill, star icon
⊘   locked        ghost — visible but at 35% opacity, not clickable
```

Locked nodes always show their name and estimated time in the tooltip.
The learner sees the full shape of the graph from day 1.

### Skill Tree Node Tooltip

```
┌─────────────────────────────────────────┐
│  Ownership                 D2           │
│  Status: locked                         │
│  ~60 min                                │
│  Requires: Ownership D1                 │
│                                         │
│  Revisited from: OS › Paging (anchor)   │
└─────────────────────────────────────────┘
```

The "Revisited from" line appears when the student has previously visited this node via an anchor from another track. This tells them something meaningful about their own learning: they've connected these concepts before, even if they didn't fully absorb it the first time.

If the node has been revisited multiple times from different contexts, all contexts are listed.

### Challenge Mode

When a lab has a challenge and the learner has completed the required exercises, a challenge prompt appears at the bottom of the lab:

```
┌────────────────────────────────────────────────────────┐
│  ★ Challenge available                                 │
│                                                        │
│  Complete ex-2 without using .clone() anywhere.        │
│  This doesn't unlock anything. It's just harder.       │
│                                                        │
│                              [Accept challenge]        │
└────────────────────────────────────────────────────────┘
```

On acceptance: a banner appears in the editor area noting the constraint. If the constraint is violated (e.g., `.clone()` appears in the code), the test runner reports it explicitly.

No countdown timers for timed challenges unless the learner explicitly activates it. Time challenges are opt-in even after accepting.

---

## Gamification UI — What It Looks Like

**Progress** is visible, not hidden. The sidebar shows completion per course. The pillar tab shows completion per track.

**Mastery** is marked differently from completion: a star instead of a checkmark. Mastery requires passing the optional challenge. It is visible in the nav, not announced with a popup.

**Unlocked concepts**: when a lab is unlocked by completing a prerequisite, the nav item transitions from muted to normal (smooth fade, 200ms). No popup, no "congratulations" message.

**Cross-track connections**: when a student follows a portal and later completes the destination, the original node in the Rust tree gains a subtle indicator — a small colored dot in the destination pillar's color. This shows, without announcement, that the student has walked one of the deeper paths.

**What there isn't**: XP bars, points, leaderboards, streak counters, daily challenges, achievement popups, confetti, or any mechanic designed to create compulsion. The learning is the game. The platform trusts that the learner knows why they're here.

---

## Responsive Behavior

Target: desktop-first, minimum width 1024px. The platform is a coding environment — it can't reasonably work on a phone.

At 1024px: sidebar collapses to 48px icon rail, main viewport takes everything.  
At 1280px: sidebar at full 240px.  
At 1440px+: content column gets more breathing room.

No mobile layout. A note in the UI if the viewport is below 768px: "Forja is designed for desktop use."

---

## Accessibility

- All color pairs meet WCAG AA contrast minimum (4.5:1 for normal text)
- Keyboard navigable: all interactive elements reachable with Tab, activated with Enter/Space
- Screenreader: ARIA labels on icon-only buttons, roles on region elements
- No reliance on color alone: status icons have text labels in the nav tree
- Reduced motion: `@media (prefers-reduced-motion)` — no animations, only instant transitions

---

## Loading States

No spinners if the operation is under 200ms. If over 200ms, a 2px top-of-panel progress bar (linear, not a spinner). If over 2s (compilation), a text status: "Compiling..." in the output panel gutter.

No skeleton screens — the content structure doesn't change on navigation, so the layout is stable without placeholders.
