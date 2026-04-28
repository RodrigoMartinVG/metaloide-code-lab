import type { Track, Lab } from '../types.js'

// ── Platform BlogPost ─────────────────────────────────────────────────────────

export const PLATFORM_BLOG: Lab = {
  unitId: 'platform',
  title:  'El Viaje',
  blocks: [
    {
      type: 'prose',
      content: `# El Viaje

Cuatro disciplinas que forman un sistema. No son cursos independientes — son capas del mismo problema, ordenadas por la dirección en que se explican mejor.

## Por qué este orden importa

**C** es el punto de partida empírico. No porque sea el lenguaje más importante, sino porque te obliga a ver la máquina directamente: punteros que son números, stack frames que aparecen y desaparecen, heap que crece cuando vos lo pedís. No hay abstracciones que medien entre tu código y lo que ejecuta el procesador.

Cuando algo falla en C, el compilador no te dice por qué. Valgrind sí. El output de \`-S\` sí. Aprendés a leer evidencia.

**Rust** viene después porque el borrow checker se entiende cualitativamente diferente cuando ya sufriste use-after-free. Lo que en un tutorial parece una restricción arbitraria, después de C parece la solución obvia a un problema que ya conocés de primera mano.

**Compilers** y **OS** son los dos destinos que se abren desde Rust Core. Ambos se vuelven más legibles si ya pasaste por C — el ensamblador que genera tu compilador y el context switch que hace tu OS son más claros si ya viste punteros y registros de cerca.

## La regla del segundo encuentro

Cada concepto importante aparece dos veces en este recorrido: primero en C, después en Rust; primero en Rust, después en OS o Compilers. El segundo encuentro es cualitativamente diferente — reconocés algo en lugar de aprenderlo desde cero.

Ese momento de reconexión es el objetivo central del viaje.`,
    },
    {
      type:       'nav-card',
      label:      'C — La Máquina',
      description:'El punto de partida empírico. Sin red de seguridad, sin abstracciones. La máquina tal como es.',
      targetType: 'track',
      targetId:   'c',
      trackId:    'c',
      color:      '#3fb950',
    },
    {
      type:       'nav-card',
      label:      'Rust — El Suelo',
      description:'El modelo que hace razonables las ideas de C. El borrow checker como solución, no como restricción.',
      targetType: 'track',
      targetId:   'rust',
      trackId:    'rust',
      color:      '#e05c1a',
    },
    {
      type:       'nav-card',
      label:      'Compilers — Destino 1',
      description:'Cómo el texto se convierte en máquina. RISC-V, parsing, codegen. Requiere Rust Core.',
      targetType: 'track',
      targetId:   'compilers',
      trackId:    'compilers',
      color:      '#58a6ff',
    },
    {
      type:       'nav-card',
      label:      'Operating Systems — Destino 2',
      description:'Qué provee la máquina cuando tu programa corre. Bare metal, QEMU, scheduler. Requiere Rust Core.',
      targetType: 'track',
      targetId:   'os',
      trackId:    'os',
      color:      '#bc8cff',
    },
    {
      type: 'prose',
      content: `## Dónde empezar

Si es tu primer track: empezá por C. No hay prerequisitos. Necesitás \`gcc\` o \`clang\` y un editor.

Si ya sabés C: podés entrar directo a Rust Core. El track de C te va a resultar familiar; si lo hacés igual, hacelo rápido.

Si ya sabés Rust: Compilers y OS están abiertos. El track de C sigue siendo recomendado si querés el modelo mental completo, pero no es bloqueante.`,
    },
    {
      type:   'portal',
      to:     'c',
      unitId: 'cc1.1',
      label:  'Environment & Toolchain',
      reason: 'El primer paso: instalar el toolchain y entender qué hace el compilador antes de escribir una línea.',
    },
  ],
}

// ── C Track BlogPost ──────────────────────────────────────────────────────────

const C_TRACK_BLOG: Lab = {
  unitId: 'c-track',
  title:  'C — La Máquina',
  blocks: [
    {
      type: 'prose',
      content: `# C — La Máquina

C no tiene red de seguridad. No hay borrow checker, no hay garbage collector, no hay runtime que te avise cuando pisás memoria que no es tuya. Lo que escribís es lo que pasa — y lo que pasa a veces no tiene relación directa con lo que creías escribir.

Esto no es un defecto. Es exactamente la razón por la que C es la mejor herramienta para entender cómo funciona la memoria: el stack frame que aparece y desaparece con cada llamada, el heap que crece cuando lo pedís, los punteros que son simplemente números con un tipo asociado.

## Qué vas a construir

Tres cursos, cada uno sobre un eje distinto del mismo problema: entender qué hace la máquina cuando corre tu código.`,
    },
    {
      type:       'nav-card',
      label:      'C Core',
      description:'Syntax, tipos, punteros y el modelo mental de un lenguaje sin red de seguridad. El punto de partida.',
      targetType: 'course',
      targetId:   'cc1',
      trackId:    'c',
      color:      '#3fb950',
    },
    {
      type:       'nav-card',
      label:      'Memory',
      description:'Stack vs heap, malloc, free, y las herramientas que hacen visible lo invisible: Valgrind, ASan.',
      targetType: 'course',
      targetId:   'cc2',
      trackId:    'c',
      color:      '#3fb950',
    },
    {
      type:       'nav-card',
      label:      'Undefined Behavior',
      description:'Las partes de C donde el estándar dice "cualquier cosa puede pasar" — y por qué el compilador lo explota.',
      targetType: 'course',
      targetId:   'cc3',
      trackId:    'c',
      color:      '#3fb950',
    },
    {
      type: 'prose',
      content: `## El objetivo real

No vas a convertirte en un programador C profesional. El objetivo es darte el modelo mental correcto para que cuando llegues a Rust, el borrow checker no parezca arbitrario — sino inevitable.

Cada bug que encontrás en C, cada use-after-free que reporta Valgrind, cada output de \`-S\` que leés, es preparación para ese momento.

## Después de C

Cuando termines los tres cursos de C, vas a poder leer ensamblador básico, debuggear con Valgrind y ASan, y entender exactamente qué hace el compilador con tu código. Ese es el punto de partida para Rust.`,
    },
    {
      type:   'portal',
      to:     'rust',
      unitId: 'rc1.3',
      label:  'Ownership en Rust',
      reason: 'Cuando termines Pointers en C, el ownership de Rust va a ser una solución a un problema que ya conocés — no una restricción nueva.',
    },
  ],
}

// ── C Core Course BlogPost ────────────────────────────────────────────────────

const CC1_BLOG: Lab = {
  unitId: 'cc1-blog',
  title:  'C Core',
  blocks: [
    {
      type: 'prose',
      content: `# C Core

Todo en C empieza por entender qué es una variable en términos de memoria — no en términos abstractos. Una variable \`int x\` son cuatro bytes en algún lugar del stack. Un puntero \`int *p\` es la dirección de esos bytes. Esa distinción, que en otros lenguajes está oculta, acá es el centro de todo.

C Core construye esa base en cuatro unidades. Cada una usa lo que construyó la anterior.`,
    },
    {
      type:       'nav-card',
      label:      'Environment & Toolchain',
      description:'gcc, clang, las cuatro fases de compilación, y los flags que vas a usar en cada build. El setup completo.',
      targetType: 'unit',
      targetId:   'cc1.1',
      trackId:    'c',
    },
    {
      type:       'nav-card',
      label:      'Syntax & Mental Model',
      description:'Variables como cajas de memoria, tipos como promesas al compilador, el preprocessor como sustitución de texto.',
      targetType: 'unit',
      targetId:   'cc1.2',
      trackId:    'c',
    },
    {
      type:       'nav-card',
      label:      'Pointers',
      description:'& y * son los dos operadores que cambian todo. Qué es un puntero, cómo leer declaraciones, por qué existen.',
      targetType: 'unit',
      targetId:   'cc1.3',
      trackId:    'c',
    },
    {
      type:       'nav-card',
      label:      'Arrays & Strings',
      description:'Arrays como punteros a su primer elemento. Strings como arrays de char con terminador nulo.',
      targetType: 'unit',
      targetId:   'cc1.4',
      trackId:    'c',
    },
    {
      type: 'prose',
      content: `## Qué queda después

Cuando termines C Core, sabés leer y escribir C con punteros. Lo que no sabés todavía es qué pasa cuando la memoria que usás no se limpia sola — eso es Memory.

La pregunta que C Core deja abierta: *¿qué pasa cuando llamás a \`free()\` dos veces sobre el mismo puntero?* Memory responde.`,
    },
  ],
}

// ── C Memory Course BlogPost ──────────────────────────────────────────────────

const CC2_BLOG: Lab = {
  unitId: 'cc2-blog',
  title:  'Memory',
  blocks: [
    {
      type: 'prose',
      content: `# Memory

El stack existe desde el momento en que tu función comienza. El heap existe cuando vos lo pedís.

Esta diferencia no es administrativa — define el ciclo de vida de cada byte. Stack frames aparecen y desaparecen en orden estricto (LIFO). El heap es un pool libre donde vos decidís cuándo liberar, y donde los errores más difíciles de encontrar viven.

## Los tres ejes del curso`,
    },
    {
      type:       'nav-card',
      label:      'Stack & Heap',
      description:'Cómo el compilador organiza la memoria. Stack frames, el heap como pool, la diferencia entre automatic y dynamic storage.',
      targetType: 'unit',
      targetId:   'cc2.1',
      trackId:    'c',
    },
    {
      type:       'nav-card',
      label:      'Dynamic Allocation',
      description:'malloc, calloc, realloc, free. El contrato de ownership manual: quien pide, libera.',
      targetType: 'unit',
      targetId:   'cc2.2',
      trackId:    'c',
    },
    {
      type:       'nav-card',
      label:      'Valgrind & ASan',
      description:'Las herramientas que hacen visible lo invisible: leaks, use-after-free, double-free. Cómo leer sus reportes.',
      targetType: 'unit',
      targetId:   'cc2.3',
      trackId:    'c',
    },
    {
      type: 'prose',
      content: `## La conexión con Rust

Cuando Rust habla de *ownership*, está formalizando exactamente el contrato que Memory te enseñó a mantener manualmente: cada bloque de memoria tiene exactamente un dueño, y cuando el dueño desaparece, la memoria se libera.

El borrow checker no inventa una restricción nueva — verifica en tiempo de compilación lo que vos verificabas mentalmente (o no verificabas).`,
    },
  ],
}

// ── C Undefined Behavior Course BlogPost ─────────────────────────────────────

const CC3_BLOG: Lab = {
  unitId: 'cc3-blog',
  title:  'Undefined Behavior',
  blocks: [
    {
      type: 'prose',
      content: `# Undefined Behavior

Undefined Behavior es el contrato roto. Cuando tu código lo activa, el compilador tiene permiso para hacer cualquier cosa — incluyendo producir código que funciona en debug y falla silenciosamente en producción bajo optimización.

UB no es un error de runtime que podés atrapar. Es una propiedad del código fuente que el compilador detecta (o explota) durante la compilación. Entender esto es la diferencia entre "funciona en \`-O0\` pero no en \`-O2\`" y saber exactamente por qué.`,
    },
    {
      type:       'nav-card',
      label:      'What UB Is',
      description:'El modelo formal del estándar C. Por qué el compilador asume que UB no ocurre — y qué consecuencias tiene.',
      targetType: 'unit',
      targetId:   'cc3.1',
      trackId:    'c',
    },
    {
      type:       'nav-card',
      label:      'Traps & Sanitizers',
      description:'Los UBs más comunes: desbordamiento de entero, acceso fuera de bounds, shift por más de la anchura del tipo.',
      targetType: 'unit',
      targetId:   'cc3.2',
      trackId:    'c',
    },
    {
      type:       'nav-card',
      label:      'Reading Asm Output',
      description:'Leer el output de -S para ver qué decidió hacer el compilador con tu código. La evidencia definitiva.',
      targetType: 'unit',
      targetId:   'cc3.3',
      trackId:    'c',
    },
    {
      type: 'prose',
      content: `## Por qué terminar aquí

Después de Undefined Behavior, tenés el modelo mental completo de C: sabés qué hace la memoria (Memory), sabés qué garantiza el lenguaje y qué no (UB), y sabés leer ensamblador para verificar tus hipótesis.

Ese es el prerequisito real para Rust — no haber *usado* C, sino haber *visto* exactamente lo que Rust está previniendo.`,
    },
  ],
}

// ── Rust Track BlogPost ───────────────────────────────────────────────────────

const RUST_TRACK_BLOG: Lab = {
  unitId: 'rust-track',
  title:  'Rust — El Suelo',
  blocks: [
    {
      type: 'prose',
      content: `# Rust — El Suelo

Rust resuelve el problema que C te hizo sentir. El borrow checker no es una restricción arbitraria — es un modelo de propiedad que previene exactamente las categorías de bugs que acabás de sufrir: use-after-free, double-free, data races.

Si llegaste desde C Core, el ownership tiene una traducción directa: una variable es un puntero con ciclo de vida garantizado en tiempo de compilación. El borrow checker verifica formalmente lo que vos verificabas mentalmente — o no verificabas.

## El arco de Rust Core

Rust Core es el punto de entrada al track. Una vez que terminás Rust Core, Compilers y OS se abren como dos destinos posibles — y el track de Rust sigue con módulos que profundizan en cada área.

Rust Core no es fácil. El compilador va a rechazar código que parece correcto. Ese momento no es un fracaso — es la primera vez que el compilador te está enseñando algo. Leé el error con atención.`,
    },
    {
      type:       'nav-card',
      label:      'Rust Core',
      description:'Tooling, variables, tipos, ownership, borrowing. La base desde la que se abren Compilers y OS.',
      targetType: 'course',
      targetId:   'rc1',
      trackId:    'rust',
      color:      '#e05c1a',
    },
    {
      type: 'prose',
      content: `## Más cursos próximamente

El track de Rust continúa con módulos sobre traits y generics, lifetimes avanzados, concurrencia con \`Arc\`/\`Mutex\`, async/await, y unsafe Rust. Todos se desbloquean desde Rust Core.

## La conexión con los destinos

Compilers requiere Rust Core RC1 + RC2. OS requiere RC1 + RC2 + RC6 (unsafe Rust). Ambos tracks tienen portales de vuelta a Rust cuando necesitás profundizar en un concepto específico.`,
    },
  ],
}

// ── Rust Core Course BlogPost ─────────────────────────────────────────────────

const RC1_BLOG: Lab = {
  unitId: 'rc1-blog',
  title:  'Rust Core',
  blocks: [
    {
      type: 'prose',
      content: `# Rust Core

Rust Core introduce el modelo de propiedad desde cero. Cada concepto construye sobre el anterior: sistema de tipos → ownership → borrowing → lifetimes. No hay salto.

El objetivo no es que escribas Rust idiomático al terminar. Es que el borrow checker deje de parecer un obstáculo y empiece a parecer una herramienta. Ese cambio tarda exactamente lo que tarda en pasar el primer momento en que el compilador rechaza tu código *correcto* — y después le encontrás la razón.`,
    },
    {
      type:       'nav-card',
      label:      'Tooling',
      description:'rustup, cargo, rustfmt, clippy. El ecosistema de herramientas antes de escribir la primera línea.',
      targetType: 'unit',
      targetId:   'rc1.1',
      trackId:    'rust',
    },
    {
      type:       'nav-card',
      label:      'Variables & Types',
      description:'Inmutabilidad por defecto, inferencia de tipos, shadowing. Rust como lenguaje con opiniones.',
      targetType: 'unit',
      targetId:   'rc1.2',
      trackId:    'rust',
    },
    {
      type:       'nav-card',
      label:      'Ownership',
      description:'La regla central: cada valor tiene exactamente un dueño. Move semantics, Copy trait, drop.',
      targetType: 'unit',
      targetId:   'rc1.3',
      trackId:    'rust',
    },
    {
      type: 'prose',
      content: `## La pregunta que Rust Core deja abierta

Ownership resuelve el problema del *dueño*, pero ¿qué pasa cuando necesitás referirte a un valor sin apropiarte de él? Eso es borrowing — y es el siguiente módulo de Rust Core.

Si venís de C, borrowing es la formalización de lo que los punteros hacían sin garantías. Si es tu primer track, borrowing es donde el compilador empieza a ser tu aliado más que tu obstáculo.`,
    },
    {
      type:   'anchor',
      to:     'c',
      unitId: 'cc1.3',
      label:  'Pointers en C',
      reason: 'Si el borrow checker está rechazando código que parece correcto, volver a punteros en C ayuda a entender el invariante que Rust está protegiendo.',
    },
  ],
}

// ── Compilers Track BlogPost ──────────────────────────────────────────────────

const COMPILERS_TRACK_BLOG: Lab = {
  unitId: 'compilers-track',
  title:  'Compilers — Destino 1',
  blocks: [
    {
      type: 'prose',
      content: `# Compilers — Destino 1

Un compilador es un programa que toma texto y produce máquina. Eso es todo. La dificultad no está en la definición — está en que cada fase transforma el programa en una representación diferente, y cada transformación introduce invariantes que las fases siguientes asumen cumplidos.

## El arco de RISC-V

Este track no va directamente a x86-64. El arco de codegen es:

1. **RISC-V directo** — 47 instrucciones base, diseñadas para ser entendidas. Runs en QEMU.
2. **Abstracción de backend** — el estudiante siente el acoplamiento; se introduce \`CodegenTarget\` como trait.
3. **Cranelift / LLVM** — ahora entendidos como la solución obvia a un problema ya vivido.

Si el track de OS usa RISC-V bare metal en QEMU, el compilador genera para el mismo target. Integration Lab I4 — *tu compilador genera un ELF que tu OS ejecuta* — solo funciona si ambos hablan el mismo lenguaje de máquina.

## Prerequisito

Requiere Rust Core RC1 + RC2. El parser, el AST, y el generador de código están escritos en Rust. El track de C es recomendado pero no bloqueante — aunque si ya leíste ensamblador de los módulos de C, el output de tu compilador va a ser mucho más legible.

*Contenido disponible próximamente.*`,
    },
  ],
}

// ── OS Track BlogPost ─────────────────────────────────────────────────────────

const OS_TRACK_BLOG: Lab = {
  unitId: 'os-track',
  title:  'Operating Systems — Destino 2',
  blocks: [
    {
      type: 'prose',
      content: `# Operating Systems — Destino 2

Un sistema operativo es la capa que convierte hardware en abstracciones utilizables: procesos, memoria virtual, archivos, señales. Nada de eso existe en la máquina — todo es código que el OS mantiene ilusorio para el programa que corre encima.

## Bare metal desde el principio

Este track empieza donde el hardware termina: bare metal en QEMU, sin biblioteca estándar, sin runtime. El primer programa que escribís no tiene \`main\` — tiene un entry point en ensamblador que inicializa el stack y salta a Rust.

Vas a implementar, en orden: boot, gestión de memoria física, memoria virtual con page tables, context switch, scheduler, y syscalls. Cuando llegues al scheduler, el context switch va a ser código que vos escribiste — no una abstracción opaca.

## La conexión con Compilers

El punto de contacto directo con Compilers Track es **Integration Lab I4**: tu compilador genera un ELF, tu OS lo carga y ejecuta. Ambos tracks apuntan a RISC-V para que esa integración sea posible.

## Prerequisito

Requiere Rust Core RC1 + RC2 + RC6 (unsafe Rust). El track de C es recomendado pero no bloqueante.

*Contenido disponible próximamente.*`,
    },
    {
      type:   'portal',
      to:     'compilers',
      unitId: 'cc1.1',
      label:  'Integration Lab I4',
      reason: 'Tu compilador genera un ELF. Tu OS lo carga. Ese es el punto donde los dos destinos se encuentran.',
    },
  ],
}

// ── C Track ───────────────────────────────────────────────────────────────────

export const C_TRACK: Track = {
  id:      'c',
  label:   'C',
  tagline: 'La Máquina',
  color:   '#3fb950',
  intro: `
C no tiene red de seguridad. No hay borrow checker, no hay garbage collector, no hay runtime que te avise cuando pisás memoria que no es tuya. Lo que escribís es lo que pasa — y lo que pasa a veces no tiene relación directa con lo que creías escribir.

Esto no es un defecto. Es la razón por la que C sigue siendo la mejor herramienta para entender cómo funciona la memoria de verdad: el stack frame que aparece y desaparece con cada llamada, el heap que crece cuando lo pedís, los punteros que son simplemente números con un tipo asociado.

El objetivo de este track no es hacerte un programador C profesional. Es darte el modelo mental correcto para que cuando llegues a Rust, el borrow checker no parezca arbitrario — sino inevitable.
`.trim(),
  blog: C_TRACK_BLOG,
  courses: [
    {
      id:          'cc1',
      trackId:     'c',
      name:        'C Core',
      description: 'Syntax, types, pointers, and the mental model of a language without a safety net.',
      status:      'started',
      intro: `
Todo en C empieza por entender qué es una variable en términos de memoria — no en términos abstractos. Una variable \`int x\` son cuatro bytes en algún lugar del stack. Un puntero \`int *p\` es la dirección de esos bytes.

C Core construye esa base: tipos, operadores, estructuras de control, y los dos operadores que cambian todo — \`&\` (la dirección de) y \`*\` (el valor en esa dirección). Cada unidad usa la anterior.
`.trim(),
      blog: CC1_BLOG,
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
      intro: `
El stack existe desde el momento en que tu función comienza. El heap existe cuando vos lo pedís.

Esta diferencia no es administrativa — define el ciclo de vida de cada byte. Stack frames aparecen y desaparecen en orden estricto. El heap es un pool donde vos decidís cuándo liberar, y donde los errores más difíciles de debuggear viven.

Memory construye el modelo correcto: cómo malloc navega el heap, qué hace free, por qué Valgrind reporta lo que reporta.
`.trim(),
      blog: CC2_BLOG,
      units: [
        { id: 'cc2.1', courseId: 'cc2', name: 'Stack & Heap',       depth: 2, renderMode: 'studio', status: 'locked', estimatedMinutes: 40 },
        { id: 'cc2.2', courseId: 'cc2', name: 'Dynamic Allocation', depth: 2, renderMode: 'studio', status: 'locked', estimatedMinutes: 45 },
        { id: 'cc2.3', courseId: 'cc2', name: 'Valgrind & ASan',    depth: 2, renderMode: 'studio', status: 'locked', estimatedMinutes: 35 },
      ],
    },
    {
      id:          'cc3',
      trackId:     'c',
      name:        'Undefined Behavior',
      description: 'The parts of C where the language standard says anything can happen — and why that matters.',
      status:      'locked',
      intro: `
Undefined Behavior es el contrato roto. Cuando tu código lo activa, el compilador tiene permiso para hacer cualquier cosa — incluyendo producir código que funciona en debug y falla silenciosamente en producción bajo optimización.

UB no es un error de runtime. Es una propiedad del código fuente que el compilador explota para optimizar. Entender esto es la diferencia entre "funciona en -O0 pero no en -O2" y saber exactamente por qué.
`.trim(),
      blog: CC3_BLOG,
      units: [
        { id: 'cc3.1', courseId: 'cc3', name: 'What UB Is',         depth: 1, renderMode: 'blog',   status: 'locked', estimatedMinutes: 25 },
        { id: 'cc3.2', courseId: 'cc3', name: 'Traps & Sanitizers', depth: 2, renderMode: 'studio', status: 'locked', estimatedMinutes: 40 },
        { id: 'cc3.3', courseId: 'cc3', name: 'Reading Asm Output', depth: 3, renderMode: 'studio', status: 'locked', estimatedMinutes: 50 },
      ],
    },
  ],
}

// ── Rust Track ────────────────────────────────────────────────────────────────

export const RUST_TRACK: Track = {
  id:           'rust',
  label:        'Rust',
  tagline:      'El Suelo',
  color:        '#e05c1a',
  prerequisite: 'Recommended: complete C Core first.',
  intro: `
Rust resuelve el problema que C te hizo sentir. El borrow checker no es una restricción arbitraria — es un modelo de propiedad que previene exactamente las categorías de bugs que acabás de sufrir: use-after-free, double-free, data races.

Si llegaste desde C Core, el ownership tiene una traducción directa: una variable es un puntero con ciclo de vida garantizado en tiempo de compilación. El borrow checker verifica formalmente lo que vos verificabas mentalmente — o no verificabas.
`.trim(),
  blog: RUST_TRACK_BLOG,
  courses: [
    {
      id:          'rc1',
      trackId:     'rust',
      name:        'Rust Core',
      description: 'Ownership, borrowing, and the type system that makes C\'s dangers compile errors.',
      status:      'locked',
      intro: `
Rust Core introduce el modelo de propiedad desde cero. Cada concepto construye sobre el anterior: sistema de tipos → ownership → borrowing → lifetimes. No hay salto.

El borrow checker va a rechazar tu primer código que parece correcto. Ese momento no es un fracaso — es la primera vez que el compilador te está enseñando algo.
`.trim(),
      blog: RC1_BLOG,
      units: [
        { id: 'rc1.1', courseId: 'rc1', name: 'Tooling',           depth: 1, renderMode: 'blog',   status: 'locked', estimatedMinutes: 20 },
        { id: 'rc1.2', courseId: 'rc1', name: 'Variables & Types', depth: 1, renderMode: 'blog',   status: 'locked', estimatedMinutes: 30 },
        { id: 'rc1.3', courseId: 'rc1', name: 'Ownership',         depth: 3, renderMode: 'studio', status: 'locked', estimatedMinutes: 45 },
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
  intro: `
Un compilador es un programa que toma texto y produce máquina. Cada fase transforma el programa en una representación diferente, y cada transformación introduce invariantes que las fases siguientes asumen cumplidos.

Este track sigue el arco de RISC-V: 47 instrucciones base, diseñadas para ser entendidas. Tu compilador va a generar ensamblador RISC-V antes de generar x86-64.
`.trim(),
  blog: COMPILERS_TRACK_BLOG,
  courses: [],
}

export const OS_TRACK: Track = {
  id:           'os',
  label:        'Operating Systems',
  tagline:      'Destino 2',
  color:        '#bc8cff',
  prerequisite: 'Requires: Rust Core RC1 + RC2 + RC6.',
  intro: `
Un sistema operativo es la capa que convierte hardware en abstracciones utilizables: procesos, memoria virtual, archivos, señales. Nada de eso existe en la máquina — todo es código que el OS mantiene ilusorio.

Este track empieza donde el hardware termina: bare metal en QEMU, sin biblioteca estándar, sin runtime.
`.trim(),
  blog: OS_TRACK_BLOG,
  courses: [],
}

export const ALL_TRACKS: Track[] = [C_TRACK, RUST_TRACK, COMPILERS_TRACK, OS_TRACK]

export function getTrack(id: string) {
  return ALL_TRACKS.find(t => t.id === id)
}

export function getCourse(courseId: string) {
  for (const track of ALL_TRACKS) {
    const course = track.courses.find(c => c.id === courseId)
    if (course) return { course, track }
  }
  return null
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
