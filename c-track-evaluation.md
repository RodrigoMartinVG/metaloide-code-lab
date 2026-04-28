# Evaluación Pedagógica — C Track Map (Forja)

> Evaluación del diseño didáctico del C Track a nivel de unidad.
> Cubre: estructura de módulos, D-levels, Action-IDEs, portales, gaps de contenido, herramientas faltantes y sugerencias concretas.

---

## 1. Diagnóstico General

El C Track Map es el documento más detallado y cuidado del proyecto. La filosofía pedagógica es consistente de principio a fin: cada unidad conecta el concepto de C con su consecuencia en Rust, OS o Compilers. Los Action-IDEs están especificados con el nivel correcto de granularidad. Las preguntas de cierre son genuinamente reflexivas y sostienen el contrato del "¿Por qué así?".

Los problemas no están en la estructura macro sino en cinco áreas específicas:

1. **Herramientas listadas pero ausentes** — GDB y strace aparecen en el entorno pero no tienen unidades propias, siendo ambas portales directos a OS.
2. **CC2.1 está sobrecargada** — 7 unidades en un módulo es demasiado; hay oportunidad de dividir y fortalecer.
3. **File I/O está completamente ausente** — la primera interfaz de un programa C con el OS no aparece en ninguna parte del track.
4. **CC3.4 (reverse engineering) tiene el argumento pedagógico más débil** — el cierre del track debería ser la Capstone, no el patching de binarios.
5. **La Capstone es demasiado corta** — 8-12 horas para el proyecto final de un track de esta densidad.

---

## 2. CC1 — El entorno y los tipos

### CC1.1 — Cadena de compilación

**Fortalezas**

La unidad CC1.1.2 (la cadena de compilación) es una de las mejores del track. El stepper de cuatro fases (`.c → .i → .s → .o → binary`) con el estudiante corriendo cada fase manualmente es pedagógicamente correcto — el concepto abstracto de "compilar" se descompone en pasos verificables. La conexión con Compilers A es el portal más natural de todo el track.

La unidad CC1.1.3 (inspección de binarios con objdump/readelf/nm) está bien posicionada como D2 — no es material introductorio, pero tampoco es avanzado. El estudiante que aprende a leer el output de `nm` antes de llegar a punteros tiene una ventaja significativa cuando los símbolos de Valgrind empiecen a aparecer.

**Gap: GDB no tiene unidad propia**

GDB aparece en la lista de herramientas del entorno (`gcc, make, gdb, valgrind, objdump, strace`) pero no tiene ninguna unidad en el track. Esto es una omisión significativa por dos razones:

Primero, el estudiante que llega a CC2.2.3 (Valgrind) sin saber usar GDB no puede investigar los bugs que Valgrind reporta. Valgrind dice "invalid read at 0x402A3C" — para entender qué línea de código es, el estudiante necesita GDB o addr2line. Segundo, el stack frame visualizado en CC1.4.4 se vuelve concreto y verificable cuando el estudiante puede hacer `break main`, `next`, y `info registers` en GDB. La visualización interactiva del mini-sim es útil pero GDB es la herramienta real.

**Sugerencia**: Agregar CC1.1.4 — Debugger: GDB básico. Contenido: `break`, `run`, `next`, `step`, `print`, `x` (examinar memoria), `backtrace`. D1, modo blog. Puede ser la última unidad de CC1.1 porque el stack frame (CC1.4.4) es más significativo cuando el estudiante puede verificarlo en GDB en tiempo real.

---

### CC1.2 — La sintaxis esencial

**Fortalezas**

La estructura general es correcta: variables y tipos → control de flujo → funciones → arrays/strings. No presupone nada. Las closing questions son buenas — especialmente la de CC1.2.4 ("¿por qué C no comprueba límites de arrays?") que establece la tensión entre rendimiento y seguridad que aparecerá en todo el resto de la plataforma.

**Problema: CC1.2.2 es demasiado densa para D1**

CC1.2.2 cubre: `if/else`, `while`, `do/while`, `for`, `break`, `continue`, `switch` con fall-through, y Duff's device — todo en D1. La densidad de construcciones es alta, pero más importante, el nivel de análisis requerido no es D1: el bug de `=` vs `==`, la semántica del fall-through, y por qué Duff's device usa fall-through intencionalmente son conceptos que requieren razonamiento sobre el modelo de evaluación de C. D2 sería más apropiado, o la unidad podría dividirse en CC1.2.2a (control básico) y CC1.2.2b (switch y fall-through).

**CC1.2.3 (funciones) le falta un elemento crítico**

La unidad cubre funciones, recursión, y stack overflow por recursión profunda. Lo que no cubre: el problema del "stack frame que persiste después del retorno". La frase "¿por qué las variables locales no se pueden retornar por referencia?" aparece en la closing question pero no está tratada como un Action-IDE en la unidad. Este es exactamente el concepto que el estudiante necesita para que CC2.1 (punteros) y CC2.2 (heap) tengan sentido motivacional. Un `reveal` que muestre el dangling reference con variable local antes de introducir los punteros al heap sería el puente correcto.

**Sugerencia**: En CC1.2.3 agregar un `reveal` — "¿por qué no podés retornar la dirección de una variable local?" — con visualización del frame desapareciendo. Esto genera el problema que CC2.1 resuelve antes de introducir la solución.

---

### CC1.3 — El layout de memoria

**Sólido**. Las tres unidades fluyen bien. El mini-sim de CC1.3.1 (toggle variables y ver en qué sección caen) es uno de los mejores Action-IDEs del track — interactivo, concreto, y conecta directamente con OS A (el loader mapea esas secciones).

**Una observación sobre CC1.3.2**: el `compare` de la misma variable declarada como local, global, y `static local` es excelente. Le falta un caso: la diferencia entre `static local` y `static` al inicio de la función de una variable global. Los estudiantes frecuentemente confunden los dos usos de `static` — uno para persistencia de variable local, otro para linkage interno. Un cuarto caso en el compare lo resolvería.

---

### CC1.4 — Tipos con consciencia de la máquina

**CC1.4.3 (operadores de bits) — el portal a OS A está bien pero podría ser más concreto**

El portal dice: "Los registros de hardware de los periféricos se configuran exactamente así — escribir un bit en una dirección de memoria para activar un dispositivo." Esto es correcto pero abstracto. El patrón concreto del UART (leer el bit TX_FULL del registro de estado, esperar a que esté libre, escribir el byte al registro de datos) es lo que el estudiante va a encontrar en OS A.2. Un `reveal` o `inline-action` que muestre ese patrón en pseudocódigo con `value |= (1 << BIT)` haría el portal tangible.

**CC1.4.4 (stack frame) — falta la dirección del stack**

El mini-sim animado del stack frame es bueno. Lo que no está explícito: el stack crece hacia abajo (hacia direcciones menores) y el heap crece hacia arriba. Esta dirección opuesta es la razón por la que un stack overflow y un heap overflow pueden colisionar. El estudiante que no entiende la dirección del stack frame no va a entender por qué el buffer overflow de CC2.2.4 corrompe el stack de la manera que corrompe. Agregar una sección o `mini-sim` que muestre la dirección de crecimiento y el layout completo del espacio de direcciones (stack arriba, heap abajo, secciones en el medio) antes de las funciones en CC1.4.4.

---

## 3. CC2 — Punteros y el heap

### CC2.1 — El corazón de C: punteros (7 unidades)

**El problema principal: CC2.1 es demasiado extensa para un solo módulo**

7 unidades en un módulo es el mayor problema estructural del C Track. El estudiante que termina CC2.1 ha cubierto: la dirección como valor, aritmética de punteros, arrays/strings/decay, punteros a punteros, NULL, void*, y const — todo antes de llegar al heap. El módulo tiene una coherencia temática (todos son aspectos de punteros) pero no tiene progresión pedagógica clara dentro de él.

**Propuesta de división**:

- **CC2.1 — Mecánica básica de punteros** (D1-D2): CC2.1.1 (dirección como valor), CC2.1.2 (aritmética), CC2.1.3 (arrays/strings/decay)
- **CC2.1b — Correctitud y contratos** (D1-D2): CC2.1.5 (NULL y validación), CC2.1.7 (const con punteros)
- **CC2.1c — Patrones avanzados** (D2-D3): CC2.1.4 (punteros a punteros), CC2.1.6 (void*)

Esta división tiene una lógica pedagógica: la mecánica antes de la correctitud, la correctitud antes de los patrones avanzados. También permite que el estudiante que solo necesita el nivel básico tenga un punto de pausa natural.

**CC2.1.4 (punteros a punteros) — el lab es correcto pero le falta el caso más común**

El full-lab de matriz 2D con `int**` es bueno. Pero el caso más frecuente en código real de punteros a punteros es la función que alloca y retorna por parámetro: `int init_buffer(char **buf, size_t size)`. Este patrón aparece en toda biblioteca C (OpenSSL, libcurl, SQLite). Agregar ese patrón como segundo ejercicio del lab.

**CC2.1.6 (void*) — el lab de generic_swap es excelente**

`generic_swap(void *a, void *b, size_t size)` usando `memcpy` es exactamente el ejercicio correcto. Le agregaría un tercer caso al test: un struct, no solo `int` y `double` — para que el estudiante vea que `void*` + `size_t` realmente es genérico para cualquier tipo copiable.

---

### CC2.2 — El heap manual

**CC2.2.3 (Valgrind) — muy bien estructurado**

Los dos labs (leak y use-after-free) están bien. El stepper de anatomía del reporte Valgrind ("definitely lost", "still reachable", etc.) es material que no existe en ninguna plataforma educativa de manera estructurada. Excelente.

**Una adición importante: `strace` no tiene unidad**

`strace` aparece en la lista de herramientas del entorno junto con GDB y Valgrind. Si Valgrind tiene dos labs completos (correctamente), `strace` merece al menos una unidad en CC2.2. El argumento pedagógico es fuerte: `strace ./program` muestra cada syscall que hace el programa, incluyendo `mmap` y `brk` — que son exactamente las syscalls que `malloc` usa para pedir memoria al kernel. Un `strace` de un programa con malloc activo antes del portal "malloc llama a brk/mmap" (CC2.2.1 → OS C) haría ese portal concreto y verificable en lugar de afirmativo.

**Sugerencia**: Agregar CC2.2.5 — strace: el programa visto desde el kernel. Contenido: `strace ./program`, identificar `brk` y `mmap` en el output de un programa con malloc, `strace -e trace=file` para ver solo syscalls de filesystem, introducción a la idea de que toda interacción con el OS es una syscall. D2, modo blog. Portal directo a OS D (syscalls) y OS C (mmap como asignación de páginas).

**CC2.2.4 (los errores clásicos) — el central portal está correctamente posicionado**

El full-lab de cuatro estaciones (dangling, use-after-free, buffer overflow, double free) es el corazón del track. El portal a Rust C3 es correcto como "CENTRAL PORTAL". Una observación: el compare que muestra "cada bug en C vs. lo que Rust diría en compile time" necesita el error message real de Rust, no una paráfrasis. El estudiante que ve `error[E0382]: borrow of moved value` con el número de línea y la flecha va a recordar ese momento. La paráfrasis lo diluye.

---

## 4. CC3 — Composición y la máquina

### CC3.1 — Tipos complejos

**CC3.1.1 (structs y alignment) — el mini-sim de layout es el mejor Action-IDE del track**

El visualizador interactivo donde el estudiante reordena campos y ve cambiar `sizeof()` y el padding es exactamente el tipo de aprendizaje que justifica la plataforma. No hay texto que lo reemplace. Correcto.

**CC3.1.2 (unions) — el lab es demasiado abstracto**

El lab de "tagged union para representar un entero o un float" es correcto pero poco motivador. El caso de uso más memorable de unions en código real es el parsing de paquetes de red o protocolos binarios: un union de varios tipos de header (ICMP, TCP, UDP) sobre el mismo buffer de bytes. Aunque el track no cubre networking, un ejemplo de parsing de un header simple (e.g., un pixel RGB empaquetado en un uint32) sería más recordable que el union int/float y generaría un portal más natural a Compilers (parsing binario) y a OS (drivers de hardware).

**CC3.1.5 (typedef) — correcta pero podría tener un portal más rico**

La conexión entre `typedef` y los tipos de `<stdint.h>` está bien. Lo que podría fortalecerse es la conexión con `<stddef.h>` y específicamente `size_t` — porque `size_t` es el tipo correcto para índices de arrays y tamaños en C, y el estudiante que lo usa mal (por ejemplo, comparando un `size_t` con -1) produce bugs sutiles relacionados con enteros sin signo. Este bug específico aparece en código real y su explicación conecta con CC1.4.2 (complemento a dos y representación).

---

### CC3.2 — El preprocesador y múltiples archivos

**CC3.2.1 (macros) — las closing questions son las mejores del módulo**

"¿Qué mecanismo usa Rust para reemplazar las macros de constantes y las macros tipo función?" es exactamente la pregunta correcta. El portal implícito hacia Rust macros (declarativas y procedurales) es uno de los más ricos pero está sub-explicitado. El track de Rust tiene RC8.1 (macros declarativas y procedurales) — este portal debería estar en la tabla de portales del track.

**CC3.2.2 (compilación separada) — sólida**

El stepper de tres pasos (utils.c → utils.o, main.c → main.o, link → binary) es correcto. Una adición valiosa: mostrar el output de `nm utils.o` y `nm main.o` antes de linkear — los símbolos undefined en main.o y los defined en utils.o — para que el estudiante vea concretamente qué problema está resolviendo el linker.

---

### CC3.3 — El ensamblador como microscopio

**Módulo en general: excelente decisión pedagógica**

La aclaración en el module blogpost — "students read assembly, never write it from scratch for complex programs" — es correcta y necesita estar explícita exactamente ahí. La mayoría de los tratamientos de assembly en educación caen en uno de dos errores: o lo evitan completamente o lo presentan como un skill de escritura. El C Track hace lo correcto: lectura y reconocimiento como herramienta diagnóstica.

**CC3.3.1 (registros x86-64) — el mini-sim de sub-registros es esencial**

El visualizador interactivo donde el estudiante ve RAX/EAX/AX/AL como distintas vistas del mismo registro es una de las mejores ideas del track. Este es uno de los conceptos más confusos para los principiantes y la visualización es la única forma de explicarlo correctamente.

**CC3.3.3 (calling convention) — el portal más importante del C Track**

El portal a Compilers E es correcto como "CENTRAL PORTAL TO COMPILERS". Lo que falta: el xref a OS D debería ser más explícito sobre cuáles registros específicamente guarda el context switch. "El trap handler del kernel respeta esta misma ABI" es correcto pero no especifica. La tabla de callee-saved registers (RBX, RBP, R12-R15 en System V AMD64) es exactamente lo que el context switch guarda, y esa correspondencia específica es el insight. Un `inline-action` que pregunte "¿cuáles de estos registros debe guardar el kernel en un context switch?" con la respuesta siendo los callee-saved haría el portal concreto.

**CC3.3.4 (-O0 vs -O3) — falta una medición de tiempo real**

El compare de conteo de instrucciones es necesario pero no suficiente. El estudiante necesita ver que -O3 es genuinamente más rápido — no solo "parece que debería ser más rápido". Un `expanded-ide` que incluya `time ./program_O0` y `time ./program_O3` sobre un loop de suma de 100M elementos haría tangible la diferencia de rendimiento. Los números de tiempo hacen el concepto de "optimización" real de una manera que el conteo de instrucciones no logra.

---

### CC3.4 — Ingeniería inversa básica

**El argumento pedagógico más débil del track**

CC3.4 es el módulo final del track y cubre: leer binarios con objdump, identificar patrones de control en assembly, y parchear un binario cambiando bytes. El problema no es el contenido — es la posición y el peso que tiene en el track.

**El problema específico**:

La Capstone (el proyecto final) genera el portal más importante del track: "el Vector que implementaste en C es `Box<[T]>` + longitud — Rust lo hace seguro. Ahora entendés qué significa 'seguro' aquí." Eso es el cierre correcto del track. CC3.4, que viene *después* de CC3.3 (calling convention) y *antes* de la Capstone, interrumpe esa narrativa.

El portal que CC3.4.3 genera ("el linker y el loader trabajan con binarios exactamente como vos") es verdadero pero más débil que los portales de CC3.3. Y el binary patching específicamente lleva el track hacia security, que está fuera del scope declarado de la plataforma.

**Sugerencia**:

Dos opciones:

1. **Mover CC3.4 a extensión opcional** (D3 gated content, no en el camino crítico). El estudiante que quiere profundizar en reverse engineering lo desbloquea; el que quiere avanzar a Rust o OS no necesita hacerlo.

2. **Reemplazar CC3.4 por un módulo de herramientas del sistema**: `strace`, `ltrace`, `perf stat`, `nm`, `ldd`. Estas herramientas tienen portales directos a OS (syscalls, dynamic linking, performance) y son más alineadas con el objetivo del track. `ldd` en particular — que muestra las shared libraries que un binario necesita — es el portal natural a "¿qué hace el dynamic linker?" que Compilers necesita.

---

## 5. Gaps Transversales

### 5.1 File I/O — Ausencia notable

El track cubre `printf` y `scanf` pero no toca file I/O: `fopen`, `fread`, `fwrite`, `fclose`, `fprintf`, `fgets`. Esta es una omisión significativa para un track de sistemas porque:

- File I/O es la primera interfaz visible de un programa con el OS. Antes de estudiar syscalls en OS D, el estudiante debería haber experimentado qué hace `fopen` desde el lado de C — que devuelve un `FILE*` que es una abstracción sobre un file descriptor del OS.
- El concepto de buffered I/O (`fflush`) versus unbuffered (`write()` syscall directa) es uno de los mejores ejemplos de abstracción con costo oculto en toda la carrera de sistemas.
- El portal de `FILE*` → `fd` → `open()` syscall → VFS → inode es el hilo que conecta C con OS E (filesystem). Sin file I/O en C, ese hilo no existe.

**Sugerencia**: Agregar Module CC2.3 — I/O y el sistema de archivos, entre CC2.2 y CC3. Contenido: `fopen/fclose`, `fread/fwrite`, `fgets/fputs`, buffered vs unbuffered I/O, `FILE*` como abstracción sobre fd, `strace` de `fopen` mostrando el `open()` syscall subyacente. D1-D2. Portal a OS D (syscalls) y OS E (filesystem/VFS).

---

### 5.2 strace — Herramienta listada pero ausente

Ya mencionado en §3. strace es la herramienta más directa para mostrar que "C habla con el OS" — cada `malloc`, `printf`, `fopen`, y `exit` genera syscalls visibles con strace. Su ausencia completa del track es la brecha más fácil de cerrar dado que ya está en la lista de herramientas del entorno.

---

### 5.3 GDB — Herramienta listada pero ausente

Ya mencionado en §2.1. GDB es necesario para investigar lo que Valgrind reporta. Sin GDB, el estudiante llega a CC2.2.3 (Valgrind) sin la herramienta que convierte "Valgrind dice que hay un error en la dirección 0x402A3C" en "el error está en la línea 47 de main.c en la función foo()".

---

### 5.4 C en el contexto de programas reales

El track usa programas pequeños en cada unidad. La Capstone es el único ejercicio de escala real (8-12 horas). Para un track cuyo objetivo es dar al estudiante una comprensión de sistemas, no hay ningún ejercicio que involucre leer o modificar código existente de cierta escala — por ejemplo, un fragmento de la libc o un driver simple de Linux.

Esto no es un error de diseño — es una decisión de scope deliberada, y tiene sentido para un track introductorio. La observación es que la closing question de CC3.3.4 ("¿qué información pierde el assembly con respecto al código fuente?") apunta a un tipo de comprensión que solo se desarrolla trabajando con código existente, no solo código propio.

---

## 6. Labs — Evaluación Transversal

| Unidad | Lab actual | Evaluación | Sugerencia |
|---|---|---|---|
| CC1.1.2 | Correr cada fase manualmente | ✅ Correcto | Agregar: leer el .s completo de una función de 5 líneas |
| CC1.4.4 | Imprimir address de variables locales en nested calls | ✅ Correcto | Agregar: visualizar dirección de crecimiento del stack |
| CC2.1.2 | Traversal con índices y con aritmética de punteros | ✅ Correcto | Agregar: verificar que el assembly es idéntico (gcc -S) |
| CC2.1.4 | Matriz 2D con int** | ✅ Correcto | Agregar: función que alloca por parámetro (init_buffer pattern) |
| CC2.1.6 | generic_swap con int y double | ✅ Correcto | Agregar: tercer caso con struct |
| CC2.2.3 | Valgrind sobre leak y use-after-free | ✅ Excelente | Agregar: GDB para localizar la línea del error que Valgrind reporta |
| CC2.2.4 | Cuatro estaciones: dangling, UAF, BOF, double-free | ✅ Excelente | Mostrar error message REAL de Rust, no paráfrasis |
| CC3.1.1 | Reordenar structs y ver sizeof() | ✅ Excelente | — |
| CC3.1.2 | Tagged union int/float | ⚠️ Abstracto | Reemplazar con parsing de pixel RGB empaquetado en uint32 |
| CC3.3.4 | Comparar instrucciones -O0 vs -O3 | ⚠️ Incompleto | Agregar medición de tiempo real (time ./prog) |
| CC3.4.3 | Parchear un binario | ⚠️ Fuera de scope | Mover a extensión opcional D3 |
| Capstone | Vector o HashMap con Valgrind limpio | ✅ Correcto | Ampliar a 15-20 horas, agregar benchmark obligatorio |

---

## 7. Portales — Gaps y Correcciones

### Portales presentes que pueden fortalecerse

| Portal | Estado actual | Sugerencia |
|---|---|---|
| CC1.4.3 → OS A | "Los registros de hardware se configuran así" | Agregar patrón concreto: UART TX_FULL bit check |
| CC2.2.1 → OS C | "malloc llama a brk/mmap" | Verificar con strace antes de hacer la afirmación |
| CC2.2.4 → Rust C3 | "CENTRAL PORTAL" — correcto | Mostrar error message real de Rust en el compare |
| CC3.3.3 → OS D | "El context switch respeta la ABI" | Especificar: callee-saved registers = RBX, RBP, R12-R15 |

### Portales que faltan y deberían agregarse

| Concepto en C | Portal hacia | Módulo origen |
|---|---|---|
| `strace` de malloc | OS D (syscalls = interfaz con el kernel) | CC2.2 (nuevo: CC2.2.5) |
| `FILE*` y fopen | OS E (VFS, file descriptors) | CC2.3 (nuevo) |
| `FILE*` → fd → open() | OS D (syscalls, open como syscall) | CC2.3 (nuevo) |
| Buffered vs unbuffered I/O | OS E (page cache, write-back) | CC2.3 (nuevo) |
| `ldd` (dynamic linking) | Compilers E (ELF, dynamic symbols) | CC3.4 (reorganizado) |
| Macros C vs macros Rust | Rust RC8.1 (proc-macros, declarative) | CC3.2.1 |

---

## 8. D-levels — Consistencia

El sistema de D-levels está bien usado en general pero tiene algunas inconsistencias:

**Unidades marcadas D1 que requieren razonamiento D2**:
- CC1.2.2 (control de flujo) — el análisis de fall-through y `=` vs `==` es D2
- CC1.2.4 (arrays y strings) — la pregunta "¿cuántos bytes tiene este string en memoria?" incluyendo el null terminator requiere D2
- CC2.1.5 (NULL) — "la diferencia entre null pointer y uninitialized pointer" es D2

**Sugerencia general**: revisar los D-levels de CC1.2 con más rigor. Un criterio útil: D1 es "el estudiante puede hacer esto después de una lectura"; D2 requiere que el estudiante haya visto al menos un bug relacionado antes de entender el concepto. Las closing questions de CC1.2 apuntan a D2 incluso cuando la unidad está marcada D1.

---

## 9. Capstone — Evaluación

La Capstone (Vector o HashMap, 8-12 horas) es el proyecto correcto. La condición de "Valgrind --leak-check=full produce zero errors, zero leaks" es el bar correcto.

**Dos problemas**:

**Alcance temporal**: 8-12 horas es poco para el cierre de un track de esta densidad. Un Vector dinámico con Valgrind limpio puede hacerse en 4-6 horas de trabajo concentrado. Un HashMap con open addressing y resize puede tomar 10-15 horas. La estimación parece calibrada para el HashMap fácil. Ajustar a 12-20 horas y especificar que el HashMap es la opción recomendada por ser más reveladora.

**Falta un benchmark**: La Capstone debería incluir un benchmark obligatorio — comparar el rendimiento del Vector propio contra `realloc` a mano con distintos factores de crecimiento (1.5x vs 2x). Este benchmark hace visible la diferencia entre implementaciones y genera la pregunta "¿qué factor de crecimiento usa `Vec` de Rust?" — que es el mejor portal de graduación posible.

---

## 10. Mapa de Cambios Propuesto

```
CC1: El entorno y los tipos
  CC1.1.1  El entorno (sin cambios)
  CC1.1.2  La cadena de compilación (sin cambios)
  CC1.1.3  Inspección de binarios (sin cambios)
  CC1.1.4  [NUEVO] GDB básico — break, next, step, print, x, backtrace

  CC1.2.1  Variables, tipos primitivos, I/O (sin cambios)
  CC1.2.2  Control de flujo (ascender a D2)
  CC1.2.3  Funciones (agregar: reveal "dangling local variable" como motivación)
  CC1.2.4  Arrays y strings (ascender a D2)

  CC1.3.1  Las secciones (sin cambios)
  CC1.3.2  Variables y sus ubicaciones (agregar: cuarto caso "static en scope de función")
  CC1.3.3  El primer Makefile (sin cambios)

  CC1.4.1  sizeof() y límites (sin cambios)
  CC1.4.2  Complemento a dos (sin cambios)
  CC1.4.3  Operadores de bits (agregar: patrón MMIO concreto como portal a OS A)
  CC1.4.4  Stack frame (agregar: dirección de crecimiento del stack, layout completo)

CC2: Punteros y el heap
  CC2.1    → dividir en CC2.1, CC2.1b, CC2.1c (ver §3)
  CC2.1.1  La dirección como valor (sin cambios)
  CC2.1.2  Aritmética de punteros (agregar: verificar assembly idéntico con gcc -S)
  CC2.1.3  Arrays, strings, decay (sin cambios)
  CC2.1.4  Punteros a punteros (agregar: patrón init_buffer como segundo ejercicio)
  CC2.1.5  NULL y validación (ascender a D2)
  CC2.1.6  void* (agregar: tercer caso con struct en generic_swap)
  CC2.1.7  const con punteros (sin cambios)

  CC2.2.1  malloc, calloc, realloc (agregar: strace como verificación del portal)
  CC2.2.2  free y ciclo de vida (sin cambios)
  CC2.2.3  Valgrind (agregar: GDB para localizar línea desde dirección Valgrind)
  CC2.2.4  Los errores clásicos (mostrar error message real de Rust)
  CC2.2.5  [NUEVO] strace — el programa visto desde el kernel

  CC2.3    [NUEVO MÓDULO] I/O y el sistema de archivos
  CC2.3.1  [NUEVO] fopen, fread, fwrite, fclose — FILE* como abstracción
  CC2.3.2  [NUEVO] Buffered vs unbuffered I/O — fflush, write() syscall
  CC2.3.3  [NUEVO] strace de fopen — del FILE* al open() del OS    ←── portal OS D + OS E

CC3: Composición y la máquina
  CC3.1.1  Structs y alignment (sin cambios)
  CC3.1.2  Unions (reemplazar lab: pixel RGB empaquetado en uint32)
  CC3.1.3  Punteros a funciones (sin cambios)
  CC3.1.4  enum (sin cambios)
  CC3.1.5  typedef (agregar: bug de size_t vs -1 como portal a CC1.4.2)

  CC3.2.1  Macros (agregar portal: → Rust RC8.1 declarative macros)
  CC3.2.2  Compilación separada (agregar: nm de .o files antes del link)
  CC3.2.3  Compilación condicional (sin cambios)

  CC3.3.1  Registros x86-64 (sin cambios)
  CC3.3.2  gcc -S y lectura de ASM (sin cambios)
  CC3.3.3  Calling convention (agregar: inline-action sobre callee-saved registers)
  CC3.3.4  -O0 vs -O3 (agregar: medición de tiempo real con time)

  CC3.4    → reorganizar como extensión opcional
  CC3.4.1  objdump -d (mantener, D2)
  CC3.4.2  Identificar lógica de control (mantener, D2)
  CC3.4.3  Parchear un binario (mover a extensión D3 opcional)
  CC3.4b   [NUEVO, reemplaza CC3.4.3] ldd y dynamic linking   ←── portal Compilers E (ELF)

Capstone
  Ampliar estimación: 12-20 horas
  Agregar: benchmark obligatorio (factores de crecimiento, comparar Vec growth)
  Agregar: portal de graduación expandido: "¿qué factor usa Vec de Rust? ¿y por qué?"
```

---

## 11. Resumen de Sugerencias por Prioridad

### Alta prioridad (gaps estructurales)

1. **Agregar CC1.1.4 — GDB básico** — herramienta listada en el entorno sin unidad propia.
2. **Agregar CC2.2.5 — strace** — herramienta listada sin unidad; portal más directo a OS D.
3. **Agregar CC2.3 — File I/O** — módulo completo (3 unidades); el portal FILE* → fd → VFS es uno de los más ricos del track.
4. **Dividir CC2.1** — 7 unidades es demasiado; dividir en CC2.1 / CC2.1b / CC2.1c con lógica pedagógica explícita.

### Media prioridad (mejoras de calidad)

5. **Mostrar error message real de Rust en CC2.2.4** — el compare debe usar el mensaje exacto del compilador.
6. **Agregar reveal de "dangling local variable" en CC1.2.3** — motivación para CC2.1 antes de introducirla.
7. **Agregar dirección de crecimiento del stack en CC1.4.4** — necesario para que CC2.2.4 (buffer overflow) tenga sentido físico.
8. **Agregar medición de tiempo real en CC3.3.4** — el rendimiento debe ser medible, no solo teórico.
9. **Reemplazar lab de unions en CC3.1.2** — parsing de uint32 empaquetado es más real que tagged union int/float.
10. **Mover CC3.4.3 a extensión opcional** — el patching de binarios está fuera del scope declarado del track.

### Baja prioridad (refinamiento)

11. **Revisar D-levels de CC1.2** — CC1.2.2 y CC1.2.4 son D2, no D1.
12. **Agregar cuarto caso de static en CC1.3.2** — disambiguar static local vs. static file-scope.
13. **Hacer portal CC1.4.3 → OS A más concreto** — patrón MMIO con UART como ejemplo.
14. **Especificar callee-saved registers en CC3.3.3** — el portal a OS D necesita el detalle concreto.
15. **Ampliar Capstone** — 12-20 horas, agregar benchmark con factores de crecimiento.

---

*Evaluación generada sobre la base de C_TRACK_MAP.md y COURSE_MAP.md. No cubre UNIT_STRUCTURE.md ni el contenido ya generado de unidades individuales.*
