# Propuesta: Bridge Modules y Systems Lab Track

> Documento de diseño curricular para los módulos de transición CC4 y RC9,
> y el quinto track de Forja: Systems Lab.
> Prerequisito de lectura: evaluaciones del C Track y del OS Track.

---

## 1. El Problema que Este Documento Resuelve

El curriculum actual tiene cuatro tracks: C, Rust, Compilers, OS. Cada uno está bien diseñado internamente. El problema está en los saltos entre ellos.

**Salto 1 — C → OS**: El C track termina con el estudiante sabiendo cómo funciona la memoria *dentro* de un proceso. El OS track arranca con código corriendo *sin proceso*, sin syscalls, sin nada. Entre los dos existe una capa completa que ninguno toca: la interfaz entre el programa de usuario y el kernel. El estudiante usó `malloc`, `printf`, y `fopen` durante todo el C track sin saber que detrás hay `brk()`, `write()`, y `open()` — las mismas syscalls que el OS track va a implementar.

**Salto 2 — Rust → OS**: El Rust track termina con async, traits, y unsafe. El OS track necesita `no_std`, sin allocator, sin runtime. El estudiante sabe Rust de alto nivel pero no sabe qué desaparece cuando se quita la std — ni por qué desaparece.

**Salto 3 — C + Rust → conclusión**: Los dos lenguajes se enseñan en tracks separados. El estudiante nunca los ve en el mismo cuadro resolviendo el mismo problema. La comparación — que es el insight más importante del curriculum — queda como ejercicio mental implícito.

**La solución tiene dos partes**:
- **Bridge modules** (CC4 y RC9): escalones que eliminan los saltos hacia OS.
- **Systems Lab** (quinto track): el destino donde C y Rust convergen en el mismo problema.

```
C Track ──── CC4 (bridge) ────┐
                               ├──→ OS Track
Rust Track ── RC9 (bridge) ───┘

C Track ─────────────────────┐
                              ├──→ Systems Lab (quinto track)
Rust Track ───────────────────┘
```

---

## 2. CC4 — El Programa y el Kernel

### Posición en el curriculum

CC4 es el Course 4 del C track. Se ubica **después de CC3 y antes de la Capstone**. No reemplaza la Capstone — la prepara. El estudiante que completa CC4 llega a la Capstone sabiendo que su Vector va a interactuar con el kernel para obtener memoria, y llega al OS track sabiendo que ese kernel es lo que va a implementar.

**Prerequisito**: CC1 + CC2 + CC3 completos.
**Desbloquea**: OS Track (junto con RC7).

---

### Course BlogPost — "El otro lado del syscall"

**Eje conceptual**: Cada función de la librería estándar que usaste en CC1–CC3 es un wrapper. Debajo hay una syscall — una instrucción que le pide al kernel que haga algo que tu programa no puede hacer solo. Este curso abre esa capa. No para implementarla (eso es el OS track) sino para verla, usarla directamente, y entender qué significa que exista.

**Lo que cubre**:
- Por qué los programas no pueden hablar directamente con el hardware
- Qué es una syscall mecánicamente: la instrucción `ecall`/`syscall`, el cambio de privilege mode
- La interfaz POSIX: el contrato entre programas y el kernel
- Las herramientas para ver esa interfaz en acción: `strace`, `/proc`

---

### Module CC4.1 — Syscalls directas

**Module BlogPost**: `printf` no escribe en la terminal. `write()` escribe en la terminal. `printf` llama a `write()`. Esta distinción no es académica — es la diferencia entre entender lo que hace tu programa y creer que lo entendés.

---

#### Unit CC4.1.1 — La instrucción syscall

*D2 · render_mode = "blog"*

**Eje**: Una syscall es una instrucción de CPU que transfiere el control al kernel con privilegios elevados. En x86-64 es `syscall`. En RISC-V es `ecall`. El número en RAX/a7 le dice al kernel qué operación se pide. Los argumentos van en los mismos registros que la calling convention normal. El kernel ejecuta la operación y retorna el resultado.

**Topics**:
- User space vs. kernel space: por qué el programa no puede acceder directamente al hardware
- La instrucción `syscall` en x86-64: número de syscall en RAX, argumentos en RDI/RSI/RDX
- La tabla de syscalls de Linux: `write` = 1, `read` = 0, `open` = 2, `exit` = 60
- Por qué los números de syscall son distintos en cada arquitectura
- `strace ./program`: ver cada syscall en tiempo real

**Action-IDEs**:
- `stepper` — trazar `printf("hola\n")` hasta el `write()` syscall: printf → fwrite → __write → syscall instrucción
- `expanded-ide` — escribir un programa que llame a `write()` directamente sin printf; comparar el strace de ambos
- `inline-action` — ¿qué número de syscall corresponde a `exit()`? ¿qué registros llevan los argumentos de `write(fd, buf, n)`?

**Portales**:
- → OS A.3: "El privilege mode que viste aquí — la transición user → kernel — es lo que vas a implementar en RISC-V con los modos M/S/U."
- → OS D.4: "La tabla de syscalls que usaste aquí es la que tu kernel va a implementar como trap handler."

**Closing question**: ¿Por qué el kernel necesita un modo de privilegio separado? ¿Qué pasaría si cualquier programa pudiera escribir directamente en los registros de hardware de la placa de red?

---

#### Unit CC4.1.2 — write(), read(), open(), close()

*D1 · render_mode = "blog"*

**Eje**: Las cuatro syscalls fundamentales de I/O. Todo lo que un programa hace con el mundo exterior — archivos, terminales, sockets, pipes — pasa por estas cuatro operaciones sobre file descriptors. La std de C es un wrapper con buffer. Las syscalls son la realidad.

**Topics**:
- `write(fd, buf, n)` — retorna bytes escritos o -1 con errno
- `read(fd, buf, n)` — bloqueante por defecto; retorna 0 en EOF
- `open(path, flags)` — retorna un fd o -1; flags: O_RDONLY, O_WRONLY, O_CREAT, O_TRUNC
- `close(fd)` — libera el fd; qué pasa si olvidás cerrarlo (fd leak)
- errno: el mecanismo de error de POSIX; `perror()` y `strerror()`
- La diferencia entre `printf` (buffered) y `write` (unbuffered): cuándo importa

**Action-IDEs**:
- `compare` — copiar un archivo: primero con `fopen/fread/fwrite/fclose`, después con `open/read/write/close`; strace de ambos; contar syscalls
- `expanded-ide` — escribir un `cat` mínimo: leer de stdin (fd=0), escribir a stdout (fd=1), terminar en EOF
- `mini-sim` — la tabla de file descriptors de un proceso: 0/1/2 ya abiertos; `open()` agrega una fila; `close()` la elimina
- `reveal` — por qué `printf` sin `\n` puede no aparecer en pantalla: el buffer de stdout y cuándo se vacía

**Portales**:
- → OS E (VFS): "El fd que retorna `open()` es el handle que el VFS de tu kernel va a gestionar. Cada `read()` sobre un fd es una llamada al método `read` del VFS backend."
- → CC2.3 (si existe): refuerza el portal FILE* → fd → open()

---

#### Unit CC4.1.3 — strace como microscopio del OS

*D2 · render_mode = "blog"*

**Eje**: `strace` intercepta cada syscall que hace un programa y la muestra en tiempo real. No requiere acceso al código fuente. Es la herramienta con la que se diagnostica cualquier problema de interacción programa-kernel.

**Topics**:
- `strace ./program` — output básico: nombre de syscall, argumentos, valor de retorno
- `strace -e trace=read,write ./program` — filtrar por syscall específica
- `strace -p PID` — attachar a un proceso ya corriendo
- Leer el strace de `ls`: cuántas syscalls hace `ls /tmp`
- Leer el strace de `malloc`: encontrar el `brk()` o `mmap()` subyacente
- Diagnóstico con strace: "por qué mi programa no puede abrir este archivo" (ENOENT, EACCES)

**Action-IDEs**:
- `expanded-ide` — strace de un programa con malloc; identificar el `brk()` o `mmap()` que malloc genera; correlacionar con CC2.2.1
- `expanded-ide` — strace de `fopen()`: ver el `open()` subyacente, el `fstat()`, y la alocación inicial del buffer
- `full-lab` — diagnóstico: dado un programa que falla silenciosamente al abrir un archivo, usar strace para encontrar el errno y la syscall que falla

**Portales**:
- → OS D.4: "Cada línea del strace es una entrada a la tabla de syscalls de tu kernel. Implementar el OS track es implementar lo que strace muestra."

---

### Module CC4.2 — File Descriptors y el modelo unificado de I/O

**Module BlogPost**: El kernel de Linux tiene una abstracción central: todo es un file descriptor. Una terminal, un archivo, un socket, un pipe, un timer — todos son fds. Las mismas cuatro operaciones (open, read, write, close) funcionan sobre todos. Este módulo muestra cómo.

---

#### Unit CC4.2.1 — La tabla de file descriptors

*D1 · render_mode = "blog"*

**Eje**: Cada proceso tiene una tabla de file descriptors — un array donde el índice es el fd y el valor es un puntero a una estructura del kernel que describe el archivo abierto. 0, 1, y 2 siempre están abiertos. `open()` agrega una entrada. `close()` la elimina. `fork()` la hereda.

**Topics**:
- fd como índice en una tabla privada del proceso
- stdin (0), stdout (1), stderr (2) — siempre presentes
- `/proc/self/fd` — ver la tabla de fds de tu propio proceso
- `dup2(oldfd, newfd)` — redirigir stdout a un archivo
- fd leak: qué pasa cuando un proceso abre muchos fds sin cerrarlos (`ulimit -n`)

**Action-IDEs**:
- `mini-sim` — tabla de fds interactiva: el estudiante hace open/close/dup2 y ve la tabla cambiar
- `expanded-ide` — redirigir stdout a un archivo con `dup2(fd, 1)` antes de `printf`; verificar que el output va al archivo
- `expanded-ide` — leer `/proc/self/fd` con `ls -la`; identificar cada fd y a qué apunta

**Portales**:
- → OS E (VFS): "La tabla de fds que viste aquí es la estructura que tu kernel mantiene por proceso. El VFS es el mecanismo que permite que el mismo fd pueda apuntar a un archivo, un pipe, o un socket."

---

#### Unit CC4.2.2 — Pipes

*D2 · render_mode = "blog"*

**Eje**: Un pipe es un canal unidireccional entre dos procesos: uno escribe, el otro lee, el kernel gestiona el buffer. `pipe()` retorna dos fds. Es el mecanismo detrás de `cmd1 | cmd2` en el shell.

**Topics**:
- `pipe(int fds[2])` — fds[0] para leer, fds[1] para escribir
- El buffer del pipe: en el kernel, tamaño fijo (~64KB en Linux)
- `fork()` + pipe: el padre escribe, el hijo lee (o viceversa)
- Cerrar el extremo que no se usa: por qué es necesario para que `read()` retorne EOF
- El shell implementado con pipes: cómo `ls | grep foo` usa exactamente este mecanismo

**Action-IDEs**:
- `stepper` — anatomía de `ls | grep`: fork padre → fork hijo1 (ls) → fork hijo2 (grep) → pipe conectando stdout de ls con stdin de grep
- `expanded-ide` — implementar un pipeline de dos procesos: el padre genera números, el hijo los filtra; conectados por pipe
- `full-lab` — implementar un mini-shell que soporte un pipe: `cmd1 | cmd2`

**Portales**:
- → OS G.1: "El pipe que implementaste aquí desde el lado del usuario es lo que vas a implementar en el kernel en OS G.1 — mismo mecanismo, visto desde abajo."
- → Systems Lab M2: "El shell que vas a construir en Systems Lab usa exactamente este patrón."

---

### Module CC4.3 — Procesos desde adentro

**Module BlogPost**: Un proceso no es solo "un programa corriendo". Es un espacio de direcciones privado, una tabla de file descriptors, un PID, un estado, y una relación con el proceso que lo creó. Este módulo muestra esas estructuras desde el lado del usuario antes de que el OS track las implemente desde adentro.

---

#### Unit CC4.3.1 — fork() y exec()

*D2 · render_mode = "blog"*

**Eje**: `fork()` crea una copia exacta del proceso actual. `exec()` reemplaza el programa en un proceso con otro programa. La combinación fork+exec es cómo el shell crea cualquier proceso. Copy-on-write hace que fork sea barato — el espacio de direcciones no se copia hasta que uno de los dos escribe.

**Topics**:
- `fork()` retorna PID del hijo en el padre y 0 en el hijo
- El hijo hereda: espacio de direcciones (COW), fds, variables — pero tiene su propio PID
- `exec()` family: `execve()`, `execlp()`, `execvp()` — reemplaza el programa completamente
- `wait()` y `waitpid()`: el padre espera al hijo; zombie processes si no se hace wait
- Copy-on-write: por qué fork es O(1) aunque el proceso tenga 1GB de memoria

**Action-IDEs**:
- `stepper` — fork+exec+wait: paso a paso; qué tiene cada proceso en cada momento
- `mini-sim` — árbol de procesos: el estudiante hace fork y ve el árbol crecer; exec reemplaza el nodo
- `expanded-ide` — implementar `system()` desde cero: fork, exec, wait

**Portales**:
- → OS D: "El PCB que el kernel mantiene para cada proceso es la estructura que contiene lo que acabás de ver — PID, estado, tabla de fds, espacio de direcciones. En OS D lo vas a implementar."
- → Systems Lab M2: "El shell de Systems Lab hace exactamente fork+exec+wait para cada comando."

---

#### Unit CC4.3.2 — /proc como interfaz al kernel

*D1 · render_mode = "blog"*

**Eje**: `/proc` es un sistema de archivos virtual que el kernel expone para que los programas puedan inspeccionarse a sí mismos y al sistema. No hay archivos reales — cada lectura genera datos frescos del estado del kernel.

**Topics**:
- `/proc/self/maps` — el mapa de memoria del proceso: texto, heap, stack, librerías
- `/proc/self/status` — PID, PPID, memoria usada, estado
- `/proc/self/fd` — los file descriptors abiertos
- `/proc/PID/` — lo mismo para cualquier proceso del sistema
- `cat /proc/self/maps` y leer el output: identificar cada región

**Action-IDEs**:
- `expanded-ide` — leer `/proc/self/maps` desde un programa C; identificar la región de texto, la del heap, la del stack; correlacionar con CC1.3.1 (las secciones)
- `mini-sim` — mapa de memoria interactivo: el estudiante hace malloc y ve aparecer nuevas regiones en el mapa

**Portales**:
- → OS C: "El mapa de memoria que leíste en /proc/self/maps es la page table de tu proceso. En OS C vas a implementar esa tabla."
- → OS E: "/proc es un VFS backend — el kernel implementa read() para estos archivos generando datos en tiempo real. En OS E.4 vas a ver ese mecanismo."

---

### Module CC4.4 — mmap() directa

**Module BlogPost**: `malloc` usa `mmap`. Pero `mmap` hace más que memoria anónima: puede mapear archivos directamente en el espacio de direcciones, puede crear regiones compartidas entre procesos, y puede controlar permisos con precisión de página. Esta es la syscall que más directamente expone el sistema de memoria virtual del kernel.

---

#### Unit CC4.4.1 — mmap() anónima y de archivos

*D2 · render_mode = "blog"*

**Topics**:
- `mmap(NULL, size, PROT_READ|PROT_WRITE, MAP_ANONYMOUS|MAP_PRIVATE, -1, 0)` — memoria anónima
- `mmap(NULL, size, PROT_READ, MAP_PRIVATE, fd, 0)` — mapear un archivo en memoria
- `munmap()` — liberar el mapeo
- Por qué leer un archivo con mmap puede ser más eficiente que read() en ciertos casos
- `MAP_SHARED` vs `MAP_PRIVATE`: shared modifica el archivo, private usa COW

**Action-IDEs**:
- `expanded-ide` — implementar un allocator mínimo usando solo mmap; comparar con malloc con strace
- `expanded-ide` — mapear un archivo de texto con mmap; leerlo como un array de chars; modificar una palabra y verificar que el archivo cambió (MAP_SHARED)

**Portales**:
- → OS C: "La syscall mmap que usaste aquí es lo que tu kernel implementa en OS C — asignar páginas físicas y mapearlas en el espacio de direcciones virtual del proceso."
- → OS G.3: "MAP_SHARED anónimo es exactamente el mecanismo de memoria compartida entre procesos que OS G.3 implementa."
- → Systems Lab M1: "Tu allocator de Systems Lab va a usar mmap como primitiva, igual que acabás de hacer."

---

### Portales de CC4 — Resumen

| Unidad | Portal hacia | Concepto |
|---|---|---|
| CC4.1.1 | OS A.3 | Privilege modes: user → kernel |
| CC4.1.1 | OS D.4 | Tabla de syscalls = trap handler |
| CC4.1.2 | OS E (VFS) | fd → VFS backend |
| CC4.1.3 | OS D.4 | Cada línea de strace es una entrada al kernel |
| CC4.2.1 | OS E (VFS) | Tabla de fds por proceso |
| CC4.2.2 | OS G.1 | Pipe desde usuario → pipe en kernel |
| CC4.2.2 | Systems Lab M2 | Shell usa fork+pipe |
| CC4.3.1 | OS D | PCB contiene lo que fork() muestra |
| CC4.3.2 | OS C | /proc/self/maps = page table del proceso |
| CC4.3.2 | OS E.4 | /proc = VFS backend generativo |
| CC4.4.1 | OS C | mmap syscall = asignación de páginas |
| CC4.4.1 | OS G.3 | MAP_SHARED = memoria compartida entre procesos |
| CC4.4.1 | Systems Lab M1 | Allocator usa mmap como primitiva |

---

## 3. RC9 — std como Interfaz al OS

### Posición en el curriculum

RC9 es el Course 9 del Rust track. Se ubica **después de RC8 (macros) y antes de completar el track**. Su función es doble: mostrar que `std` es una capa sobre las mismas syscalls que CC4 expuso, y preparar al estudiante para `no_std` — el Rust que corre en el OS track.

**Prerequisito**: RC1–RC8 + CC4 (recomendado, no bloqueante).
**Desbloquea**: OS Track con RC7.

---

### Course BlogPost — "Lo que std esconde, y lo que pasa cuando lo sacás"

**Eje conceptual**: La std de Rust es una librería, no el lenguaje. Cuando escribís `std::fs::File::open()`, hay una syscall `open()` abajo. Cuando creás un `Vec`, hay un allocator que llama a `mmap`. Este curso hace explícita esa capa — y después la remueve, para que el estudiante sepa exactamente a qué está renunciando cuando escribe `#![no_std]`.

---

### Module RC9.1 — std como wrapper de syscalls

**Module BlogPost**: Cada módulo de std tiene un análogo en el mundo de las syscalls. No son abstracciones que ocultan la realidad — son abstracciones que hacen la realidad más segura. Este módulo mapea std a sus syscalls subyacentes.

---

#### Unit RC9.1.1 — std::fs mapeada a open/read/write/close

*D1 · render_mode = "blog"*

**Eje**: `std::fs::File` es un wrapper seguro sobre un file descriptor. `File::open()` llama a `open()`. `file.read()` llama a `read()`. `file.write()` llama a `write()`. El Drop de File llama a `close()`. El ownership de Rust garantiza que close siempre se llama.

**Topics**:
- `File::open()` → syscall `open()`; retorna `Result<File, io::Error>` en lugar de fd o -1
- `file.read(&mut buf)` → syscall `read()`; el borrow checker garantiza que buf es válido
- `BufReader<File>` — el equivalente de FILE* en C: agrega buffering sobre el fd raw
- `File` implementa `Drop` → `close()` garantizado aunque el código haga panic
- `strace` de un programa Rust que abre un archivo: ver el `open()` subyacente

**Action-IDEs**:
- `compare` — copiar un archivo en C (`open/read/write/close`) vs Rust (`File::open`, `io::copy`); strace de ambos; los syscalls son idénticos
- `expanded-ide` — strace de un programa Rust; identificar `open()`, `read()`, `write()`, `close()`; correlacionar con CC4.1.2
- `reveal` — qué pasa si olvidás cerrar el archivo en C (fd leak) vs qué pasa en Rust (Drop lo cierra automáticamente)

**Portales**:
- ↔ CC4.1.2: "Las syscalls que std::fs llama son las que usaste directamente en CC4."
- → RC9.2 (no_std): "Cuando removés std, std::fs desaparece. Lo que queda es unsafe y las syscalls directas."

---

#### Unit RC9.1.2 — std::process como fork/exec/wait

*D2 · render_mode = "blog"*

**Topics**:
- `Command::new("ls").arg("-la").spawn()` → fork + exec internamente
- `child.wait()` → waitpid
- `Command::stdout(Stdio::piped())` → pipe() + dup2 para conectar stdout del hijo
- Por qué Rust hace más difícil el fork puro: los threads y el fork no se llevan bien

**Action-IDEs**:
- `compare` — lanzar un proceso en C (fork+exec+wait) vs Rust (Command); strace de ambos
- `expanded-ide` — implementar un pipeline de dos comandos con `Command` y `Stdio::piped()`

**Portales**:
- ↔ CC4.3.1: "Command::spawn() es fork+exec. La diferencia es que Rust no te deja hacer fork sin exec fácilmente — por buenas razones relacionadas con threads."

---

#### Unit RC9.1.3 — std::thread como pthreads/futex

*D2 · render_mode = "blog"*

**Topics**:
- `thread::spawn()` → `pthread_create()` o `clone()` syscall
- `Mutex<T>` en Rust → `pthread_mutex_t` + el futex del kernel internamente
- `Arc<Mutex<T>>` — el ownership garantiza que no hay data races; el kernel provee la exclusión mutua
- `strace` de un programa multithreaded: ver los `futex()` syscalls

**Action-IDEs**:
- `expanded-ide` — strace de un programa Rust con Mutex: identificar los syscalls `futex(FUTEX_WAIT)` y `futex(FUTEX_WAKE)`
- `compare` — implementar un contador compartido con `Arc<Mutex<u64>>` en Rust vs `pthread_mutex_t` en C; mismo strace

**Portales**:
- → OS F: "El futex que viste en el strace es la primitiva del kernel sobre la que se construyen los mutexes. En OS F.2 vas a implementar el sleeping mutex que usa futex."

---

### Module RC9.2 — no_std: la remoción de la capa

**Module BlogPost**: `#![no_std]` es una declaración: "este código no depende de la librería estándar". Lo que eso significa en la práctica es que desaparecen el allocator global, los tipos que lo usan (Vec, String, Box), el manejo de panics estándar, y la interfaz con el OS. Lo que queda es el lenguaje puro, unsafe, y las primitivas de bajo nivel. Este módulo hace explícito ese proceso de remoción — antes de que el OS track lo asuma como dado.

---

#### Unit RC9.2.1 — Qué desaparece con no_std

*D1 · render_mode = "blog"*

**Topics**:
- La diferencia entre `core`, `alloc`, y `std`
- `core`: el lenguaje sin allocator ni OS — primitivos, traits, iteradores sin heap
- `alloc`: estructuras que necesitan heap (Vec, Box, String) — sin std si hay allocator custom
- `std`: todo lo anterior + interfaz con el OS (fs, net, thread, process)
- `#![no_std]` + `#[panic_handler]` — el mínimo para compilar sin std
- Por qué el OS track usa no_std: el kernel no puede depender de sí mismo para sus propias primitivas

**Action-IDEs**:
- `expanded-ide` — compilar un programa con `#![no_std]`; observar cada error de compilación; entender qué falta
- `stepper` — agregar `#[panic_handler]`, `#[global_allocator]`, `#[no_mangle] extern "C" fn _start()` — el scaffolding mínimo
- `compare` — el mismo algoritmo (búsqueda binaria) en std vs no_std: qué cambia, qué no cambia

---

#### Unit RC9.2.2 — GlobalAlloc: implementar un allocator

*D3 · render_mode = "studio"*

**Eje**: Para usar `Vec` y `Box` en no_std, necesitás un allocator que implemente `GlobalAlloc`. Este módulo implementa un bump allocator — el más simple posible — usando `mmap` directa para obtener memoria del OS.

**Topics**:
- El trait `GlobalAlloc`: `alloc()` y `dealloc()`
- Bump allocator: un puntero que solo avanza; `dealloc` no hace nada
- Usar `mmap` desde Rust con `unsafe` para obtener la memoria inicial
- `#[global_allocator]` para registrarlo
- Las limitaciones del bump allocator: no puede reusar memoria

**Action-IDEs**:
- `full-lab` — implementar un BumpAllocator con GlobalAlloc; usar Vec en no_std con ese allocator; verificar con strace que usa mmap

**Portales**:
- → OS C: "El mmap que tu allocator llama es lo que el kernel provee. En OS C vas a implementar esa provisión."
- → Systems Lab M1: "En Systems Lab vas a implementar un allocator real que reemplaza a este bump allocator."

---

#### Unit RC9.2.3 — El puente: de no_std a bare metal RISC-V

*D2 · render_mode = "blog"*

**Eje**: El OS track usa no_std en RISC-V con QEMU. Este módulo muestra exactamente qué scaffolding necesita ese entorno — linker script, entry point, panic handler — y por qué cada pieza existe. Es una preview del primer lab de OS A.

**Topics**:
- El linker script: por qué el entry point debe estar en la dirección correcta
- `#[no_mangle] pub extern "C" fn _start()` — el entry point
- El panic handler en bare metal: por qué no puede llamar a `eprintln!`
- La diferencia entre correr en QEMU (con firmware) y correr en hardware real
- Conexión con OpenSBI: el firmware que corre antes que tu código

**Action-IDEs**:
- `expanded-ide` — compilar y correr un programa no_std para RISC-V en QEMU; ver el "Hello from bare metal" por UART

**Portales**:
- → OS A: "Lo que acabás de hacer es exactamente el primer lab del OS track. La diferencia es que ahora sabés por qué funciona cada línea del linker script."

---

### Portales de RC9 — Resumen

| Unidad | Portal hacia | Concepto |
|---|---|---|
| RC9.1.1 | CC4.1.2 (↔) | std::fs → syscalls open/read/write/close |
| RC9.1.2 | CC4.3.1 (↔) | Command → fork+exec+wait |
| RC9.1.3 | OS F.2 | futex = primitiva del sleeping mutex |
| RC9.2.1 | OS A | no_std = punto de partida del OS track |
| RC9.2.2 | OS C | GlobalAlloc → mmap → asignación de páginas |
| RC9.2.2 | Systems Lab M1 | Allocator real en Systems Lab |
| RC9.2.3 | OS A (preview) | Scaffolding bare metal RISC-V |

---

## 4. Systems Lab — El Quinto Track

### 4.1 Posición y propósito

**Prerequisito**: C Track completo + Rust Track completo (RC9 recomendado).
**No prerequisito**: OS Track ni Compilers Track — Systems Lab es una vía alternativa, no secuencial.

**El problema que resuelve**: Los cuatro tracks enseñan C y Rust por separado. El estudiante nunca los ve en el mismo cuadro. La comparación — el insight más importante del curriculum — queda implícita. Systems Lab la hace explícita.

**Color propuesto**: `#e8b000` (ámbar — entre el verde terminal de C y el naranja de Rust)
**Label**: `LA DECISIÓN`

---

### Track BlogPost — "Elegir con conocimiento"

**Eje conceptual**: En este track no aprendés un lenguaje nuevo. Usás los dos que ya sabés para resolver el mismo problema de sistemas. El objetivo no es demostrar que Rust es mejor que C. Es entender *exactamente* qué compra cada uno, en qué contextos, y a qué costo — para que cuando tengas que elegir (o leer código que alguien más eligió, o migrar de uno al otro), tu decisión sea informada.

**Lo que cubre**:
- Cuatro proyectos de sistemas implementados dos veces: en C y en Rust
- Análisis explícito de dónde cada lenguaje gana, dónde pierde, y por qué
- El costo real de FFI: cruzar el boundary C ↔ Rust
- Los bugs que el borrow checker no puede ver
- Los contextos donde C es la respuesta correcta

---

### Module SL1 — El Allocator

**Module BlogPost**: malloc es el programa más usado y menos comprendido en sistemas. Todo programa C lo usa. Vec en Rust lo usa. El kernel lo implementa. Este módulo implementa un allocator completo — primero en C, después en Rust — y compara cada decisión de diseño.

---

#### Unit SL1.1 — Allocator en C

*D3 · render_mode = "studio"*

**Spec**: Implementar un allocator con `mmap` como backend, free list con first-fit, y coalescing de bloques libres adyacentes.

**Topics**:
- `mmap(MAP_ANONYMOUS)` para obtener páginas del OS
- El header del bloque: tamaño, flag libre/ocupado, puntero al siguiente
- First-fit: recorrer la free list hasta encontrar un bloque suficientemente grande
- Splitting: si el bloque es mucho más grande que lo pedido, dividirlo
- Coalescing: al liberar, fusionar con bloques adyacentes libres
- Alignment: garantizar que cada bloque retornado esté alineado a 16 bytes

**Action-IDEs**:
- `mini-sim` — heap visualizer: el estudiante llama a malloc/free y ve los bloques aparecer, dividirse, y fusionarse
- `full-lab` — implementar el allocator completo; pasar una suite de tests; correr con Valgrind limpio

**Análisis post-lab**:
- ¿Qué bugs encontraste? ¿El off-by-one en el header? ¿El coalescing incompleto?
- ¿Cuántos de esos bugs hubiera atrapado Rust en tiempo de compilación?

---

#### Unit SL1.2 — El mismo allocator en Rust

*D3 · render_mode = "studio"*

**Spec**: Implementar el mismo allocator implementando el trait `GlobalAlloc`. Sin std, sin unsafe innecesario.

**Topics**:
- `unsafe impl GlobalAlloc` — por qué GlobalAlloc es unsafe
- El problema del interior mutability: la free list necesita mutación detrás de una referencia compartida
- `UnsafeCell` y cuándo es la respuesta correcta
- Los invariantes que el borrow checker no puede verificar en unsafe
- `#[test]` en no_std: cómo testear el allocator

**Action-IDEs**:
- `full-lab` — implementar GlobalAlloc; pasar la misma suite de tests que el allocator en C
- `compare` — el mismo test de coalescing en C y en Rust: ¿cuál fue más difícil de hacer correcto? ¿cuál fue más difícil de debuguear?

---

#### Unit SL1.3 — Análisis: C vs Rust en código de bajo nivel

*D2 · render_mode = "blog"*

**Eje**: El allocator es el caso donde C y Rust son más parecidos — ambos usan unsafe, ambos tienen que razonar sobre los mismos invariantes. Pero la experiencia de implementarlo no es la misma.

**Análisis**:
- **Bugs atrapados en compile time por Rust**: use-after-free del header al splitear, aliasing incorrecto del puntero al bloque
- **Bugs que Rust no puede ver**: invariantes lógicos (el free bit está mal), corrupción del header del bloque vecino
- **Costo de Rust**: el diseño de tipos alrededor de UnsafeCell requiere pensar más antes de escribir; el C se puede iterar más rápido al inicio
- **Beneficio de Rust**: los tests pasan más rápido porque la clase de bugs más silenciosa ya fue eliminada en compilación

**Closing question**: ¿En qué tipo de proyecto elegirías C para el allocator? ¿En cuál Rust? ¿Qué factores cambian esa decisión?

---

### Module SL2 — El Shell Mínimo

**Module BlogPost**: El shell es el programa de sistemas más familiar: todos lo usan, casi nadie lo ha implementado. Es también el programa que más claramente muestra cómo fork, exec, pipe, y señales se componen. Implementarlo en C y en Rust pone en evidencia dónde cada lenguaje hace la vida más fácil.

---

#### Unit SL2.1 — Shell en C

*D2 · render_mode = "studio"*

**Spec**: Un shell que soporte: ejecución de comandos simples, un nivel de pipe (`cmd1 | cmd2`), redirección de stdout a archivo (`cmd > file`), y manejo de SIGINT (Ctrl+C no mata el shell, solo el proceso hijo).

**Topics**:
- El REPL del shell: read → parse → fork+exec+wait → repeat
- Implementar pipe: `pipe()`, fork dos veces, `dup2` para conectar stdout e stdin
- Redirección: `open()` del archivo, `dup2(fd, STDOUT_FILENO)` antes de exec
- SIGINT: `sigaction()` en el padre para ignorarlo; el hijo lo recibe por defecto

**full-lab**: implementar el shell completo; pasar una suite de tests de integración.

---

#### Unit SL2.2 — El mismo shell en Rust

*D3 · render_mode = "studio"*

**Spec**: El mismo shell usando `std::process::Command` para los casos simples, y `unsafe` + syscalls directas para pipe y redirección donde Command no llega.

**Topics**:
- `Command` cubre el caso simple — y lo hace más seguro
- El pipe entre dos `Command`: `Stdio::piped()` y `child.stdout`
- Donde Command no llega: señales, `dup2` custom, control de job
- La tensión entre "usar la abstracción de Rust" y "necesitar el control de C"
- `nix` crate como wrapper seguro sobre las syscalls POSIX

---

#### Unit SL2.3 — Análisis: dónde cada lenguaje facilita y dónde complica

*D2 · render_mode = "blog"*

**Análisis**:
- **C más directo**: señales y control de job — el modelo de señales de POSIX asume C; en Rust hay más fricción
- **Rust más seguro**: el parsing del input — sin buffer overflow posible
- **Empate**: fork+exec+wait — ambos tienen la misma complejidad
- **Lección central**: La abstracción de `Command` de Rust es excelente para el caso común. Cuando necesitás control fino (señales, dup2 custom, process groups), tenés que bajar a unsafe — y ahí el C es más directo porque POSIX está diseñado para C.

---

### Module SL3 — El Servidor Concurrente

**Module BlogPost**: Un servidor que acepta múltiples clientes es el programa donde la diferencia entre C y Rust es más dramática. En C, los data races son silenciosos y frecuentes. En Rust, el compilador rechaza los data races en tiempo de compilación — pero no puede ver todos los errores de concurrencia. Este módulo implementa el mismo servidor en ambos lenguajes y hace explícito qué puede y qué no puede ver el compilador.

---

#### Unit SL3.1 — Servidor con threads en C

*D3 · render_mode = "studio"*

**Spec**: Un servidor TCP que acepta conexiones, lanza un thread por cliente, y mantiene un contador global de conexiones activas. Con una race condition introducida deliberadamente.

**Topics**:
- `socket()`, `bind()`, `listen()`, `accept()` — el server loop
- `pthread_create()` por cada cliente
- El contador global sin mutex: la race condition deliberada
- Detectarla con ThreadSanitizer (`gcc -fsanitize=thread`)
- Arreglarla con `pthread_mutex_t`

---

#### Unit SL3.2 — El mismo servidor en Rust

*D2 · render_mode = "studio"*

**Spec**: El mismo servidor usando `std::net::TcpListener` y `std::thread::spawn`. Intentar reproducir la race condition del servidor en C.

**Topics**:
- El compilador rechaza el acceso no sincronizado al contador: `Arc<Mutex<u64>>` es obligatorio
- Por qué el compilador de Rust puede ver esta race condition y el de C no
- Los errores de concurrencia que Rust **no puede ver**: deadlock, starvation, livelock
- Introducir un deadlock deliberado con dos mutexes en orden incorrecto: Rust compila; el programa se cuelga

---

#### Unit SL3.3 — Análisis: lo que el compilador puede y no puede garantizar

*D2 · render_mode = "blog"*

**Análisis — La tabla más importante del track**:

| Clase de error | C + TSan | Rust |
|---|---|---|
| Data race en variable compartida | Detección en runtime | Rechazado en compilación |
| Use-after-free en thread | Detección en runtime (Valgrind) | Rechazado en compilación |
| Deadlock (dos mutexes, orden incorrecto) | Detección en runtime (si ocurre) | Compila; falla en runtime |
| Starvation | No detectable automáticamente | No detectable automáticamente |
| Livelock | No detectable automáticamente | No detectable automáticamente |
| Error de lógica en la sincronización | No detectable | No detectable |

**Lección central**: Rust elimina una clase entera de bugs (data races, use-after-free en threads). No elimina todos los bugs de concurrencia. El programador que entiende esa tabla sabe exactamente qué le está comprando el compilador y qué sigue siendo su responsabilidad.

---

### Module SL4 — FFI: El Boundary

**Module BlogPost**: En el mundo real, C y Rust no son lenguajes que se eligen excluyentemente — se combinan. Una librería existente en C se llama desde Rust. Un componente nuevo en Rust se embebe en un proyecto C. Este módulo muestra cómo funciona ese boundary, cuánto cuesta cruzarlo, y qué invariantes el compilador no puede verificar una vez que lo cruzás.

---

#### Unit SL4.1 — Rust llamando a C (FFI como consumidor)

*D2 · render_mode = "blog"*

**Topics**:
- `extern "C"` blocks: declarar funciones C para llamarlas desde Rust
- Por qué todas las llamadas FFI son `unsafe`: el compilador no puede verificar los invariantes de la librería C
- `bindgen`: generar bindings automáticamente desde un header de C
- Tipos que cruzan el boundary: `c_int`, `c_char`, `*mut u8`, `size_t`
- El ownership problem: si C retorna un puntero, ¿quién lo libera?

**full-lab**: llamar al allocator de SL1 (implementado en C) desde Rust; usar los tipos correctos; liberar correctamente.

---

#### Unit SL4.2 — C llamando a Rust (FFI como productor)

*D2 · render_mode = "blog"*

**Topics**:
- `#[no_mangle] pub extern "C" fn` — exponer una función Rust a C
- `cbindgen`: generar el header C desde el código Rust
- Lo que Rust no puede garantizar una vez que la función es llamada desde C: el caller puede pasar un puntero null, un buffer demasiado corto, un entero fuera de rango
- El patrón defensivo: validar todos los argumentos al inicio de cada función exportada
- `repr(C)` en structs para garantizar el layout correcto

**Portales**:
- → Compilers E: "La calling convention que usás para cruzar el boundary C ↔ Rust es la System V ABI que estudiaste en CC3.3.3. El compilador la respeta en ambos lados."

---

#### Unit SL4.3 — Análisis: el costo real del boundary

*D2 · render_mode = "blog"*

**Análisis**:
- **Costo de seguridad**: cada función que cruza el boundary requiere validación manual — el compilador de Rust no puede ayudarte del otro lado
- **Costo de complejidad**: ownership y lifetimes no cruzan el boundary; tenés que diseñar la API para que el ownership sea explícito
- **Costo de rendimiento**: llamadas FFI tienen overhead mínimo (la calling convention es la misma) pero la serialización de tipos complejos puede ser cara
- **Cuándo vale la pena**: migración incremental de C a Rust, integración con ecosistemas C existentes (OpenSSL, SQLite, libcurl)

---

### 4.2 Capstone de Systems Lab

*D3 · project-action · ~20-30 horas*

**Spec**: Implementar una de las siguientes opciones:

**Opción A — Librería de colecciones con FFI dual**:
Una librería que implementa una estructura de datos no trivial (skip list, arena allocator, ring buffer) con una API usable desde C y desde Rust. El estudiante decide el lenguaje de implementación y genera los bindings para el otro. Tests de integración en ambos lenguajes.

**Opción B — El servidor de archivos**:
Un servidor que sirve archivos por TCP, con múltiples clientes concurrentes, logging a disco, y manejo de señales para shutdown ordenado. Implementado en C con Valgrind + TSan limpios, y en Rust con el compilador satisfecho. Benchmark de rendimiento comparativo.

**Por qué este proyecto cierra el track**: requiere combinar todos los módulos — allocator, procesos, concurrencia, y FFI — en un sistema completo. La decisión de qué lenguaje usar para qué parte es explícita y tiene que justificarse.

---

### 4.3 Portales desde Systems Lab hacia el resto del curriculum

| Concepto en SL | Portal hacia | Dirección |
|---|---|---|
| Allocator con mmap | OS C (asignación de páginas) | → |
| Free list y coalescing | OS C (frame allocator) | → |
| Shell: fork+exec+wait | OS D (scheduler, PCB) | → |
| Shell: pipe | OS G.1 (pipe en kernel) | → |
| Shell: SIGINT | OS G.2 (señales en kernel) | ↔ bidireccional |
| Servidor: data race | OS F (concurrencia en kernel) | → |
| Servidor: deadlock | OS F.5 (deadlock en kernel) | → |
| FFI boundary | Compilers E (calling convention, ABI) | ↔ bidireccional |
| FFI: cbindgen | Compilers C (symbol tables, ELF) | → |

---

## 5. El Curriculum Completo con los Nuevos Componentes

```
FORJA — Mapa curricular completo

C Track ──────────────────────────────────────────────────────
  CC1  El entorno y los tipos
  CC2  Punteros y el heap
  CC3  Composición y la máquina
  CC4  [NUEVO] El programa y el kernel          ← bridge → OS
    CC4.1  Syscalls directas
    CC4.2  File descriptors y el modelo unificado de I/O
    CC4.3  Procesos desde adentro
    CC4.4  mmap() directa
  Capstone C

Rust Track ────────────────────────────────────────────────────
  RC1  Ownership y borrowing
  RC2  Structs, enums, pattern matching
  RC3  Ownership profundo
  RC4  Traits y generics
  RC5  Colecciones y error handling
  RC6  Concurrencia
  RC7  Unsafe y no_std
  RC8  Macros
  RC9  [NUEVO] std como interfaz al OS          ← bridge → OS
    RC9.1  std mapeada a syscalls
    RC9.2  no_std: la remoción de la capa
  Capstone Rust

OS Track ──────────────────────────────────────────────────────
  OS A  Bare Metal                              ← desbloqueado por CC4 + RC9
  OS B  Interrupts
  OS C  Memory Management
  OS D  Processes
  OS E  File Systems
  OS F  Concurrency Primitives
  OS G  [PROPUESTO] IPC y Comunicación
  Capstone: irk

Compilers Track ───────────────────────────────────────────────
  Compilers A–E
  Capstone: compilador completo

Systems Lab (Quinto Track) ────────────────────────────────────
  prerequisito: C Track + Rust Track            ← síntesis de ambos
  SL1  El Allocator          (C + Rust + análisis)
  SL2  El Shell Mínimo       (C + Rust + análisis)
  SL3  El Servidor Concurrente (C + Rust + análisis)
  SL4  FFI: El Boundary      (C ↔ Rust)
  Capstone Systems Lab
```

---

## 6. Flujos de Estudio

El curriculum con los nuevos componentes habilita flujos distintos según el objetivo del estudiante:

**Flujo 1 — El programador de sistemas completo**:
```
C Track → Rust Track → OS Track → Compilers Track → Systems Lab
```
Cubre todo. El orden maximiza los portales y la comprensión acumulada.

**Flujo 2 — El programador que viene del mundo de aplicaciones**:
```
C Track (CC1-CC4) → Rust Track → Systems Lab
```
No hace OS ni Compilers, pero entiende qué hay debajo de los lenguajes que usa.

**Flujo 3 — El que quiere OS rápido**:
```
C Track → CC4 → Rust Track (RC1-RC7, RC9) → OS Track
```
Llega a OS con los prerequisitos mínimos y suficientes.

**Flujo 4 — El curioso de la comparación**:
```
C Track → Rust Track → Systems Lab
```
No hace OS ni Compilers. Entiende la diferencia entre los dos lenguajes en contextos reales.

---

## 7. Resumen de Componentes Nuevos

| Componente | Tipo | Posición | Prerequisito | Desbloquea |
|---|---|---|---|---|
| CC4 | Course (4 módulos) | Final del C Track | CC1-CC3 | OS Track (junto con RC7) |
| RC9 | Course (2 módulos) | Final del Rust Track | RC1-RC8 | OS Track reforzado |
| Systems Lab | Quinto Track (4 módulos + capstone) | Paralelo a OS/Compilers | C Track + Rust Track | — |

---

*Documento generado como propuesta curricular para Forja. Complementa las evaluaciones del OS Track (os-track-evaluation.md) y del C Track (c-track-evaluation.md).*
