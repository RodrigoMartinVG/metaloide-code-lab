# Evaluación Pedagógica — OS Track (Forja)

> Evaluación independiente del diseño didáctico del track de Sistemas Operativos.  
> Cubre: secuencia, prerequisitos, densidad por curso, labs, portales, gaps de contenido y sugerencias concretas.

---

## 1. Diagnóstico General

El OS track tiene una columna vertebral correcta: bare metal → interrupts → memoria → procesos → filesystem → concurrencia. La elección de RISC-V es una decisión pedagógica sólida y la integración con el Compilers track a través de QEMU y ELF es uno de los diseños más originales del proyecto.

Los problemas no están en la secuencia macro sino en tres áreas específicas:

1. **Prerequisitos de Rust mal ordenados** — el estudiante necesita aprender async antes de tocar hardware, lo cual está al revés.
2. **Densidad desigual entre cursos** — Course B es demasiado corto para el peso conceptual que carga el puente hacia Course D.
3. **Course E pierde la narrativa** — el track tiene una historia muy clara hasta Course D; Course E (filesystem) se siente como un apéndice técnico más que como una capa del mismo sistema.

Lo que sigue es el análisis curso por curso.

---

## 2. Prerequisitos de Rust — Problema de Orden

### Estado actual

```
OS Track prerequisite: RC1, RC2, RC6, RC7
```

RC6 cubre concurrencia: threads, estado compartido, Mutex, channels, `async/await`, `Future`, `Poll`, `Waker`, `Pin`, executors.  
RC7 cubre: unsafe, raw pointers, `no_std`, `#[panic_handler]`, `GlobalAlloc`.

### El problema

Para OS Course A (bare metal) lo que se necesita es **RC7** — `no_std`, `unsafe`, y el modelo de compilación sin runtime. RC6 (concurrencia de alto nivel, async) no aporta nada a escribir una UART handler sin sistema operativo.

El estudiante hoy tiene que completar todo el stack de async/await y executors *antes* de poder encender un LED en RISC-V. Conceptualmente es al revés: el executor de async es un scheduler de usuario — algo que el estudiante *construye* en OS Course D. Aprenderlo antes, como primitiva de Rust, le quita la revelación de entender qué hay abajo.

### Sugerencia

Desacoplar los prerequisitos por curso, no por track:

| Curso OS | Prerequisito mínimo |
|---|---|
| OS A — Bare Metal | RC3 + RC7 |
| OS B — Interrupts | RC3 + RC7 |
| OS C — Memory | RC3 + RC7 |
| OS D — Processes | RC3 + RC7 + RC6.1 (threads/Mutex, no async) |
| OS E — File Systems | RC4 (traits) |
| OS F — Concurrency | RC6 completo |

**Beneficio adicional**: el estudiante que termina OS D y después ve RC6.2 (async/await) tiene la revelación correcta — "esto es un scheduler de usuario construido sobre el modelo de memoria que acabo de implementar en el kernel".

---

## 3. Course A — Bare Metal

### Fortalezas

La secuencia boot → MMIO → privilege modes es correcta. Arrancar con "escribe en esta dirección de memoria y algo físico sucede" es una de las mejores formas de demostrar que la abstracción de I/O existe sobre algo concreto.

El lab (programa bare-metal que imprime por UART sin OS) es el lab correcto para este curso. Simple, verificable, y da al estudiante algo que funciona antes de que el track se complique.

### Gaps

**A.1 — El boot sequence necesita más granularidad.**  
"Power-on to your first instruction" es mucho terreno. Los estudiantes necesitan entender específicamente:
- El rol de la ROM de arranque de QEMU (OpenSBI como M-mode firmware)
- La secuencia SBI → supervisor mode → tu código
- Por qué el entry point importa y cómo se le dice al linker dónde está

Sin esto, el linker script del lab es magia. Con esto, es la consecuencia lógica de lo que acaban de leer.

**Falta un módulo explícito sobre linker scripts.**  
El linker script es el artefacto que conecta "yo escribo Rust" con "el procesador ejecuta desde esta dirección". Es pequeño pero es un portal directo hacia Compilers (relocations, symbol resolution). Actualmente aparece implícito en el lab pero no tiene lugar explícito en el módulo.

### Sugerencias

- Agregar A.1b: "El firmware y el linker script" — OpenSBI, entry point, `.text` en la dirección correcta. 15-20 minutos de contenido, portal a Compilers C (relocations).
- El lab debería incluir un segundo ejercicio que rompa el linker script intencionalmente y muestre qué pasa (el programa no arranca, o arranca en el lugar equivocado). Ver el fallo antes de ver la solución correcta.

---

## 4. Course B — Interrupts and Exceptions

### El problema central

Course B es el curso más corto del track pero carga el peso pedagógico más pesado. Los interrupts son el mecanismo sobre el que se construyen scheduling, syscalls, y concurrencia del kernel. Tres módulos no alcanzan para establecer ese fundamento con la solidez que el resto del track requiere.

El salto de "implementé un trap handler" (B.3) a "implementé context switching" (D.2) es el salto más grande del track. En ese gap el estudiante necesita entender:
- Que el trap handler *es* el lugar donde el scheduler toma decisiones
- Que guardar y restaurar estado de CPU es lo que hace posible que dos cosas "corran al mismo tiempo"
- Que los timer interrupts son el mecanismo por el cual el scheduler tiene control forzado

Actualmente ese entendimiento tiene que construirse implícitamente entre B y D.

### Sugerencias

**Agregar B.4 — El trap como punto de control.**  
No es hardware nuevo — es la misma trampa vista desde la perspectiva del kernel: "cada vez que entra aquí, el kernel decide qué pasa después". Esto cierra el puente hacia D.2 explícitamente.

**El lab de B necesita un segundo nivel.**  
El lab actual (scheduling cooperativo por timer interrupt) está bien. Pero "cooperativo" significa que el proceso cede voluntariamente. Agregar un ejercicio donde un proceso *no cede* y el timer interrupt lo interrumpe forzosamente (preemptivo) hace explícita la diferencia que importa en OS D. No necesita ser un scheduler completo — solo demostrar que el kernel puede tomar control sin cooperación.

---

## 5. Course C — Memory Management

### Fortalezas

La secuencia física → virtual → TLB → frame allocator es la secuencia correcta. Sv39 como estructura concreta de page tables (en lugar de hablar en abstracto de "paging") es una buena elección — tiene la complejidad suficiente para ser real sin la complejidad accidental de x86-64 paging.

El lab (bitmap frame allocator + mapear una página virtual a un frame físico) es correcto en scope y cubre exactamente lo que los cursos siguientes necesitan.

### Gaps

**C.3 — TLB flushing necesita el contexto de por qué importa en el scheduler.**  
El TLB flush es uno de los costos ocultos más importantes del context switch — cambiar de proceso implica invalidar el TLB porque las traducciones de virtual a físico cambian. Si esto no se establece en C.3, el estudiante que llega a D.2 (context switch) va a implementar el switch sin entender por qué hay que hacer `sfence.vma` después.

**Falta un módulo sobre memory-mapped files y la distinción kernel/user space en términos de page tables.**  
Actualmente Course C habla de virtual memory pero no establece explícitamente que el kernel y cada proceso tienen page tables *distintas* y que la transición syscall implica un cambio de context que incluye las page tables. Eso se vuelve necesario en D.4 (syscalls).

### Sugerencias

- En C.3 agregar una sección sobre "TLB y context switch — el costo que no ves" con portal directo a D.2.
- Agregar C.5 — "Espacios de direcciones separados": kernel space vs. user space, por qué cada proceso tiene su propio mapa, qué pasa en la transición. Es el prerequisito conceptual para D.4 (syscalls) y actualmente está implícito.

---

## 6. Course D — Processes

### Fortalezas

Este es el mejor curso del track después de F. La secuencia proceso → context switch → scheduler → syscall es la secuencia correcta y los módulos están bien delimitados.

El lab (round-robin para tres kernel threads + priority level) es un buen scope — suficientemente concreto para ser implementable, suficientemente rico para mostrar el problema de priority inversion que aparece en F.

### Gaps

**D.2 — Context switching necesita hablar de floating point.**  
En RISC-V, guardar y restaurar el estado de CPU incluye los registros de punto flotante (F/D extensions), y la decisión de si guardarlos siempre o lazy (como hace Linux) es una de las optimizaciones más ilustrativas del tema. Actualmente el módulo dice "saving and restoring CPU state" sin especificar qué es ese estado exactamente. Para un track que usa RISC-V como telescopio, esto es una oportunidad perdida.

**D.3 — El scheduler necesita más variedad antes del "algo más inteligente".**  
Round-robin primero es correcto. Pero "something smarter" es vago. Los candidatos naturales son:
- **Priority scheduling** (directo, fácil de implementar, motiva priority inversion en F)
- **Multilevel feedback queue** (más complejo, muestra el tradeoff throughput vs. latency)

Dado que Course F tiene un lab sobre priority inversion, D.3 debería llegar a priority scheduling explícitamente — no como opcional sino como el paso que crea el problema que F va a resolver.

**D.4 — Syscalls necesita hablar de la ABI de syscall.**  
Los números de syscall, la convención de registros para pasar argumentos, y cómo el kernel distingue qué syscall se pidió — eso es ABI de syscall. Es un portal directo y denso hacia Compilers E (cómo el compilador emite llamadas al sistema). Actualmente el módulo habla del "transition from user space to kernel space" pero no especifica la ABI.

### Sugerencias

- En D.2 agregar una sección sobre FPU state y lazy saving como ejemplo de optimización real de kernel.
- En D.3 reemplazar "something smarter" por "priority scheduling" explícitamente, con motivación en "esto crea el problema que F resuelve".
- En D.4 agregar una sección sobre syscall ABI (`ecall` en RISC-V, `a0-a7` para argumentos, `a0` para return) con portal a Compilers E.3 (calling conventions y ABI).

---

## 7. Course E — File Systems

### El problema narrativo

Los Courses A-D tienen una historia muy clara: el estudiante construye progresivamente las capas de lo que hace que un programa pueda correr — hardware, traps, memoria, procesos. Hay una narrativa de "esto depende de aquello".

Course E rompe esa narrativa. Un filesystem no es una capa que hace posible el scheduling o los procesos — es una funcionalidad adicional. El estudiante que llega a E después de implementar un scheduler puede sentir que cambió de tema.

Esto no significa que E no deba existir — un kernel sin filesystem está incompleto. Pero necesita ser reencuadrado.

### Sugerencia de reencuadre

El puente correcto es **E.4 (VFS)**. La pregunta que hace a E coherente con el resto del track es: "¿cómo puede el mismo código de proceso abrir un archivo, un socket, y un dispositivo con la misma syscall `open()`?" La respuesta es VFS — y eso conecta directamente con D.4 (syscalls) y con la idea de que el kernel es una capa de abstracción sobre hardware. Si E se introduce desde esa pregunta, no desde "vamos a ver filesystems", la narrativa se mantiene.

### Gaps de contenido

**E.2 — FAT32 es correcto como primer filesystem**, pero el lab (read-only FAT32 que lista un directorio) debería incluir explícitamente la lectura de la FAT table como estructura de datos — no solo "listar". Entender que FAT es literalmente una tabla de linked list de clusters es el insight que hace que todo lo demás (fragmentación, por qué FAT es lento para archivos grandes) tenga sentido.

**E.3 — Journaling necesita un ejemplo de corrupción.** "¿Por qué ext4 sobrevive crashes?" se responde mejor con un ejemplo concreto de qué pasa sin journaling (escribís los datos pero no el inode, el filesystem queda inconsistente) antes de explicar la solución. El crash como motivación antes de la solución.

**Falta E.0 — Motivación: ¿por qué el kernel media el acceso a disco?**  
El salto de "tengo procesos" a "hay filesystems" necesita un módulo o sección que establezca: los procesos compiten por el mismo disco, el kernel necesita serializar el acceso, y además necesita proveer una abstracción uniforme sobre hardware distinto. Sin eso, E parece arbitrario.

### Sugerencias

- Reencuadrar E desde VFS como pregunta inicial: "¿cómo funciona `open()` si puede abrir cualquier cosa?"
- Agregar E.0 (motivación) o expandir E.1 para establecer por qué el kernel media el acceso a almacenamiento.
- En el lab de E.2 hacer explícita la FAT table como estructura antes de "listar el directorio".

---

## 8. Course F — Concurrency Primitives

### Fortalezas

El mejor curso del track. Mars Pathfinder como motivación para priority inversion es el tipo de historia que vuelve un concepto abstracto en algo que el estudiante no va a olvidar. La secuencia spinlock → mutex durmiente → priority inversion → memory ordering es correcta.

F.4 (memory ordering) es el cierre correcto para todo el track — el estudiante que llegó hasta aquí ya construyó un kernel, y entender que el compilador y la CPU reordenan código es el último nivel de "nada funciona por magia".

### Gaps

**F.1 — Spinlocks necesita hablar de cuándo son incorrectos, no solo cuándo son correctos.**  
"When busy-waiting is correct" implica que hay casos donde no lo es. Esos casos son: cuando el lock se va a mantener por mucho tiempo, cuando hay un solo core (el spinlock no puede liberar el lock porque el dueño no puede correr), y cuando se puede dormir. Esos tres casos deberían estar explícitos antes de F.2.

**F.4 — Memory ordering necesita anclaje en código Rust real.**  
`Ordering::SeqCst` vs `Ordering::Acquire/Release` en los atomics de Rust es el puente concreto entre la teoría de memory ordering y el código que el estudiante ya escribió. Sin eso, F.4 puede quedarse en teoría de arquitectura sin conexión con las primitivas que el estudiante usó en RC6.

**Falta F.5 — Deadlock: detección y prevención.**  
El track habla de priority inversion (un tipo de liveness failure) pero no de deadlock (otro tipo de liveness failure, más común). Lock ordering como convención de prevención, y `trylock` como herramienta de detección, son conceptos que cualquier programador de sistemas necesita. Es una omisión notable dado que F ya cubre las otras patologías de concurrencia.

### Sugerencias

- En F.1 agregar sección "cuándo el spinlock es incorrecto" antes de la implementación.
- En F.4 anclar memory ordering en `std::sync::atomic::Ordering` — los mismos tipos que el estudiante ya usó en RC6.
- Agregar F.5 — Deadlock: lock ordering, `trylock`, ejemplos de deadlock clásico (dining philosophers como diagnóstico, no como curiosidad).

---

## 9. Labs — Evaluación Transversal

| Curso | Lab actual | Evaluación | Sugerencia |
|---|---|---|---|
| A | UART sin OS | ✅ Correcto en scope | Agregar ejercicio que rompa el linker script |
| B | Cooperative scheduling por timer | ⚠️ Incompleto | Agregar nivel preemptivo para mostrar la diferencia |
| C | Bitmap allocator + mapear página | ✅ Correcto | Agregar test que demuestre TLB miss post-context-switch |
| D | Round-robin + priority level | ✅ Correcto | Especificar que "priority" es el prerequisito explícito de F |
| E | Read-only FAT32, listar directorio | ⚠️ Demasiado pasivo | Agregar lectura de FAT table como estructura explícita |
| F | Sleeping mutex + priority inversion | ✅ Excelente | Agregar ejercicio de deadlock intencional |

---

## 10. Portales y XREFs — Gaps

El curriculum define portales hacia Compilers y Rust. Los siguientes están implícitos en el contenido pero no aparecen formalizados en el track:

| Concepto en OS | Portal hacia | Módulo origen sugerido |
|---|---|---|
| Linker script (entry point, secciones) | Compilers C (IR, relocations) | OS A.1 |
| Syscall ABI (`ecall`, registros a0-a7) | Compilers E.3 (calling conventions) | OS D.4 |
| TLB flush en context switch | OS D.2 (costo real del switch) | OS C.3 |
| Lazy FPU save | Compilers E.1 (register allocation) | OS D.2 |
| VFS como interfaz uniforme | RC4 (traits, object safety, vtable) | OS E.4 |
| Sleeping mutex implementación | RC6.1 (Mutex en Rust = esto, abajo) | OS F.2 |

El más importante de estos es el portal **sleeping mutex → RC6**. El estudiante que implementó un sleeping mutex en el kernel y después lee la implementación de `Mutex` en la stdlib de Rust tiene una revelación directa. Ese portal debería estar explícito y bidireccional.

---

## 11. Resumen de Sugerencias por Prioridad

### Alta prioridad (afectan la coherencia del track)

1. **Reordenar prerequisitos**: OS A–C requieren RC3+RC7, no RC6. RC6 como prerequisito de OS D–F.
2. **Agregar B.4** — El trap como punto de control del scheduler (puente hacia D).
3. **Agregar C.5** — Espacios de direcciones separados kernel/user (prerequisito para D.4).
4. **Reencuadrar Course E** desde la pregunta VFS como hilo narrativo.

### Media prioridad (mejoran la densidad y calidad de cada curso)

5. **Agregar A.1b** — Linker script y OpenSBI como módulo explícito.
6. **Expandir D.2** — FPU state, lazy saving, costo real del context switch.
7. **Hacer explícito D.3** — "Algo más inteligente" = priority scheduling, motivado por F.
8. **Expandir D.4** — Syscall ABI con portal a Compilers E.3.
9. **Agregar F.5** — Deadlock: detección y prevención.

### Baja prioridad (refinamiento)

10. **Lab B** — Agregar nivel preemptivo al lab de scheduling.
11. **Lab E** — Hacer explícita la FAT table como estructura en el lab.
12. **F.4** — Anclar memory ordering en `std::sync::atomic::Ordering` de Rust.
13. **Formalizar portales faltantes** — Los 6 portales listados en §10.

---

## 12. Mapa de Cambios Propuesto

```
OS A: Bare Metal
  A.1   Boot sequence (expandido: OpenSBI, M-mode → S-mode)
  A.1b  [NUEVO] El linker script y el entry point    ←── portal Compilers C
  A.2   Memory-mapped I/O
  A.3   RISC-V privilege modes

OS B: Interrupts and Exceptions
  B.1   Hardware interrupts vs software exceptions
  B.2   RISC-V trap mechanism
  B.3   Implementing a trap handler
  B.4   [NUEVO] El trap como punto de control        ←── puente explícito hacia D

OS C: Memory Management
  C.1   Physical vs virtual memory
  C.2   Page tables — Sv39
  C.3   TLB (expandido: costo en context switch)     ←── portal D.2
  C.4   Frame allocator
  C.5   [NUEVO] Espacios de direcciones separados    ←── prerequisito D.4

OS D: Processes
  D.1   What a process is
  D.2   Context switching (expandido: FPU, lazy save)
  D.3   Scheduler: round-robin → priority scheduling (explícito)
  D.4   Syscalls (expandido: ABI, ecall, registros)  ←── portal Compilers E.3

OS E: File Systems  [reencuadrado desde VFS como pregunta inicial]
  E.0   [NUEVO] Motivación: por qué el kernel media el acceso a almacenamiento
  E.1   Storage abstractions — blocks, inodes, directories
  E.2   FAT32 (expandido: FAT table como estructura explícita)
  E.3   Journaling (expandido: ejemplo de corrupción antes de solución)
  E.4   VFS — la interfaz que hace posible open() sobre cualquier cosa

OS F: Concurrency Primitives
  F.1   Spinlocks (expandido: cuándo son incorrectos)
  F.2   Sleeping mutex                               ←── portal RC6.1 (bidireccional)
  F.3   Priority inversion y Mars Pathfinder
  F.4   Memory ordering (expandido: Ordering en Rust)
  F.5   [NUEVO] Deadlock: detección y prevención
```

---

*Evaluación generada sobre la base de CURRICULUM.md. No cubre UNIT_STRUCTURE.md ni el detalle de BlogPosts individuales.*
