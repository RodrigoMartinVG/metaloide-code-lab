# OS Track Map — Destino 2

Full unit-level specification for the OS Track. Includes BlogPost structure at every layer, Action-IDE types, anchors/xrefs, and source references.

**Color**: `#bc8cff` (OS purple)
**Label**: `DESTINO 2`
**Prerequisite**: Rust Track Courses RC1, RC2, RC6 complete. RC7 strongly recommended before Course C.

---

## Track BlogPost — "El programa que corre antes de tu programa"

**Conceptual axis**: Every program that has ever run did so because an operating system set up the environment for it: mapped virtual memory, loaded the binary, initialized the stack, handled the first interrupt. The OS is invisible until it isn't — until a page fault occurs, until a context switch drops the wrong registers, until two processes race on shared memory and a spinlock fails. This track makes the invisible visible. The student implements each of these abstractions from scratch, in Rust, on bare-metal RISC-V running in QEMU. By the end, a minimal kernel exists — one that boots, manages memory, runs processes, handles interrupts, reads a filesystem, and synchronizes concurrent execution.

**What it covers**:
- The full OS stack from reset vector to system call, in implementation order
- Why each abstraction exists: what breaks without it (privilege modes, virtual memory, the scheduler)
- The RISC-V privilege architecture: M/S/U modes, CSRs, the trap mechanism, Sv39 paging
- The deep connections to Rust and Compilers: the borrow checker is a dataflow analysis; the context switch saves exactly the callee-saved registers the ABI specifies; the ELF the OS loads is what the Compilers track produces

**Action-IDEs at track level**:
- `stepper` — the journey from `ecall` to return: privilege transition, kernel handler, context restore, `sret` — each step labeled
- `mini-sim` — the OS abstraction stack: hardware → machine mode → supervisor mode → user process; each layer shows what it provides to the one above
- `reveal` — "¿Por qué el kernel no puede estar escrito en Rust seguro puro?" → establishes the `unsafe` arc from RC7 to the entire OS track

**Portals to this track from C and Rust**:
- From CC2.2.2 (malloc/valgrind): "malloc llama a brk y mmap. Esas son las primitivas que el kernel provee. Aquí es donde se implementan."
- From CC3.3.2 (gcc -S, registros): "Los registros que viste en el output del ensamblador son exactamente los que el context switch debe guardar."
- From RC6.2.2 (async/await, executor): "El executor de Rust es un scheduler cooperativo en user space. El OS scheduler es la versión preemptiva en kernel space — la misma idea, otra capa." ← PRIMARY PORTAL
- From RC7.2.2 (no_std, GlobalAlloc): "El trait GlobalAlloc que tu kernel debe implementar viene de aquí." ← PRIMARY PORTAL

---

## Course A — Metal Desnudo

**Course BlogPost**: "Antes del sistema operativo"

Conceptual axis: Before any OS abstraction exists, there is a CPU, some RAM, and a piece of firmware that hands control to your code. The first instruction runs in the most privileged mode, with no virtual memory, no interrupts, no heap. This course builds the environment in which an OS can exist: a Rust binary that boots, configures machine mode, and outputs text via UART — without any OS beneath it.

Action-IDEs at course level:
- `stepper` — the boot sequence: ROM → reset vector → machine mode → supervisor mode → your Rust code
- `mini-sim` — RISC-V privilege levels: what each mode can access; what happens when user code tries to execute a privileged instruction

---

### Module A.1 — La Secuencia de Arranque

**Module BlogPost**: Every computer starts by executing a fixed address. On RISC-V, after reset the CPU jumps to the machine-mode reset vector, typically address `0x80000000` in QEMU. Before your `main` function can run, someone must initialize the BSS segment, set up the stack pointer, and jump to Rust. This module traces that path.

---

#### Unit A.1.1 — Del reset vector al primer salto
*D1 · render_mode = "blog"*

**BlogPost axis**: At power-on, a RISC-V CPU does one thing: load the program counter from a fixed address (the reset vector) and begin executing. In QEMU, that address is `0x80000000`. Before any Rust code can run, a tiny assembly stub must set up the stack pointer and zero the BSS segment. This unit is about what happens before `main`.

**Topics**:
- RISC-V reset behavior: program counter starts at `0x80000000` in QEMU's `-machine virt`
- The entry stub: `_start` in assembly; `la sp, _stack_end`; `call main`
- Why the stack pointer must be set before calling any function
- BSS initialization: the linker places zero-initialized globals in `.bss`; the CPU does not zero them; the stub must
- The linker script: `ENTRY(_start)`, memory regions (`FLASH`, `RAM`), section placement (`SECTIONS { . = 0x80000000; .text ... }`)
- QEMU invocation: `qemu-system-riscv64 -machine virt -bios none -kernel output.elf -nographic`

**Action-IDEs**:
- `stepper` — from power-on to `main`: reset → `_start` assembly → stack set → BSS cleared → `main` called; each step labeled with the address it executes
- `expanded-ide` — write the linker script and `_start` stub; build a bare-metal Rust binary that prints a byte via the QEMU test device; the test passes if QEMU exits with code 0

**Closing question**: ¿Por qué QEMU implementa la carga de código en `0x80000000` en lugar de `0x0`? ¿Qué habría en `0x0` en hardware real?

---

#### Unit A.1.2 — El protocolo de arranque RISC-V
*D2 · render_mode = "blog"*

**BlogPost axis**: RISC-V boot is not just "jump to an address." The machine-mode CSRs must be configured before transitioning to supervisor mode: the trap vector (`mtvec`), the exception delegation registers (`medeleg`, `mideleg`), and the status register (`mstatus`). This unit configures the machine-mode environment and delegates to supervisor mode where the kernel will live.

**Topics**:
- Control and Status Registers (CSRs): read with `csrr`, write with `csrw`, read-modify-write with `csrrs`/`csrrc`
- `mstatus`: machine mode status; `MPP` field sets the mode returned to on `mret`; `MIE` for interrupt enable
- `mtvec`: machine-mode trap vector; direct mode vs. vectored mode; setting to our handler address
- `medeleg` and `mideleg`: which exceptions/interrupts the M-mode delegates to S-mode
- `mepc`: machine exception program counter; set to the supervisor entry point before `mret`
- The `mret` instruction: transitions from M-mode to the mode in `MPP`, jumping to `mepc`
- Hart IDs: `mhartid` CSR; park all harts except hart 0

**Action-IDEs**:
- `full-lab` — implement the M-mode boot stub: park all harts but 0; set up `mtvec`; delegate all traps to S-mode; set `mepc` to the Rust supervisor entry; `mret` into supervisor mode; the test verifies you're executing in S-mode
- `mini-sim` — CSR state during boot: watch `mstatus.MPP`, `mepc`, and `mtvec` change as each boot step executes

**Xrefs**:
- ↔ Compilers E.2.2: "The first instruction your kernel executes is the output of a code generator. In the Compilers track, you generate that code. Here, you receive it."

**Closing question**: ¿Por qué el kernel no vive directamente en M-mode? ¿Qué gana la separación M-mode/S-mode?

---

### Module A.2 — I/O Mapeada en Memoria

**Module BlogPost**: Hardware devices on RISC-V QEMU are not accessed through special instructions — they are memory. The UART, the interrupt controller, the timer: each is a region of physical address space. Writing to `0x10000000` sends a byte to the terminal. This is memory-mapped I/O, and it is how all low-level hardware interaction works.

---

#### Unit A.2.1 — Periféricos como memoria
*D1 · render_mode = "blog"*

**BlogPost axis**: A hardware register is a physical address. Writing to it causes a hardware effect — a byte transmitted, an interrupt triggered, a clock configured. Reading from it reveals hardware state. The CPU has no special knowledge of this; it just executes loads and stores. The distinction between DRAM and an MMIO register is purely about what's behind that address.

**Topics**:
- MMIO principle: load/store instructions used to access hardware registers; the CPU cannot distinguish DRAM from MMIO
- QEMU virt machine memory map: UART at `0x1000_0000`, CLINT at `0x2000_000`, PLIC at `0xC00_0000`, RAM at `0x8000_0000`
- Why accesses must be volatile: the compiler must not reorder or elide MMIO reads/writes; `read_volatile`/`write_volatile` in Rust
- The UART 16550: `THR` (transmit holding register) at offset 0; write one byte → one character transmitted
- Device tree: QEMU provides a device tree blob (DTB) that describes the memory map; for this unit we hardcode the QEMU virt layout

**Action-IDEs**:
- `inline-action` — classify: for each memory access pattern, is it safe to let the compiler reorder it? (UART write, DRAM array read, flag poll loop, increment counter)
- `reveal` — why `*ptr = byte` is wrong but `write_volatile(ptr, byte)` is right: the optimizer is allowed to prove the write is "dead" and eliminate it if it doesn't see a subsequent read

**Closing question**: ¿Por qué el compilador no puede simplemente detectar automáticamente que una dirección es MMIO y tratar el acceso como volátil?

---

#### Unit A.2.2 — Driver UART
*D2 · render_mode = "studio"*

**BlogPost axis**: A UART driver is a thin layer of safe Rust over volatile MMIO operations. The `Uart` struct wraps the base address, exposes a `write_byte` method, and implements `core::fmt::Write` so the rest of the kernel can use `write!` macros. This is the first piece of the kernel that crosses the hardware boundary.

**Topics**:
- The UART 16550 registers: THR (transmit, offset 0), LSR (line status, offset 5), IER (interrupt enable, offset 1)
- Checking LSR bit 5 before transmitting: the transmit holding register may be full
- The `Uart` struct: stores the base `*mut u8`; all methods `unsafe` internally; the public API is safe
- `core::fmt::Write`: implementing `write_str` for use with `write!` and `writeln!`
- A global `UART` with a spinlock: `static UART: Mutex<Uart> = ...` — the first use of synchronization in the kernel
- `println!` macro for the kernel: a thin wrapper over the global UART

**Action-IDEs**:
- `full-lab` — implement the UART driver: `Uart::new(base: usize)`, `write_byte`, `impl fmt::Write`; wrap in a global; implement `kprint!`/`kprintln!` macros; the test suite sends known strings and verifies QEMU output

**Anchors**:
- ⇠ RC7.1.2 if raw pointer manipulation and `write_volatile` produce compilation errors

**Closing question**: ¿Por qué el driver UART usa `*mut u8` como base en lugar de un tipo más específico? ¿Qué ganaría y qué perdería un diseño más tipado?

---

### Module A.3 — Modos de Privilegio

**Module BlogPost**: RISC-V has three privilege levels: Machine (M), Supervisor (S), and User (U). The kernel runs in S-mode. User programs run in U-mode. M-mode is the highest privilege — it initializes the hardware and delegates control downward. The boundary between modes is not just a semantic distinction; it is enforced by hardware. Crossing it — intentionally (syscall) or accidentally (invalid memory access) — triggers a trap.

---

#### Unit A.3.1 — Los tres mundos de RISC-V
*D1 · render_mode = "blog"*

**BlogPost axis**: Privilege modes are not a kernel construct — they are a hardware feature. RISC-V provides three, and each has precise rules about what instructions it can execute and what memory it can access. The OS kernel lives in supervisor mode, enforcing rules on user mode from a position the hardware guarantees user code cannot violate.

**Topics**:
- The three modes: Machine (most privileged), Supervisor, User (least privileged)
- What each mode can do: M-mode can access all CSRs; S-mode can access supervisor CSRs; U-mode cannot access CSRs at all
- Why the kernel cannot trust user code: U-mode code cannot execute privileged instructions — the hardware enforces this
- The transition mechanism: user code → trap → S-mode handler → `sret` back to user code
- `sstatus`: supervisor mode status; `SPP` field tracks which mode we came from; `SIE` for supervisor interrupt enable
- `sepc`, `scause`, `stval`, `stvec`: the supervisor trap CSRs that mirror the machine-mode equivalents

**Action-IDEs**:
- `mini-sim` — privilege mode explorer: attempt various instructions from U-mode; observe which cause illegal instruction exceptions; the handler logs `scause`
- `stepper` — a syscall round-trip: user code executes `ecall`; hardware transitions to S-mode; handler runs; `sret` returns to user code at `sepc + 4`

**Closing question**: ¿Por qué la separación de privilegios no puede implementarse en software? ¿Qué impide que user code modifique el bit que lo restringe?

---

#### Unit A.3.2 — Transiciones de modo
*D2 · render_mode = "blog"*

**BlogPost axis**: Entering the kernel (trap) and returning to user space (`sret`) require precise manipulation of several CSRs. The hardware saves `pc` in `sepc`, the mode in `sstatus.SPP`, and the cause in `scause`. The trap handler must read these, handle the event, and restore state. A single wrong bit in `sstatus` returns to the wrong mode.

**Topics**:
- What the hardware does on a trap: saves `pc → sepc`, mode → `sstatus.SPP`, cause → `scause`, fault address → `stval`; jumps to `stvec`
- The trap handler prologue: saving all general-purpose registers to the stack (the trap frame)
- Distinguishing trap types from `scause`: bit 63 = interrupt (1) or exception (0); lower bits = cause code
- The `sret` instruction: restores `pc` from `sepc`, mode from `sstatus.SPP`, re-enables interrupts per `sstatus.SPIE`
- Why `sepc` must sometimes be incremented: synchronous exceptions return to the faulting instruction; syscalls should return to the *next* instruction
- The trap frame struct: 32 general-purpose registers + relevant CSRs; laid out at a fixed offset from the stack pointer

**Action-IDEs**:
- `full-lab` — implement the trap entry and exit: assembly prologue saves all 32 registers to a `TrapFrame` on the stack; Rust handler receives a `*mut TrapFrame`; assembly epilogue restores and `sret`s; test fires an `ebreak` and verifies the handler sees the correct `scause`
- `compare` — correct `sret` setup vs. wrong `sstatus.SPP` value: one returns to user mode, the other loops back to kernel mode

**Closing question**: ¿Por qué el trap frame guarda los 32 registros aunque el handler de Rust sólo use algunos? ¿Qué ocurriría si sólo guardases los registros caller-saved?

---

## Course B — Interrupciones y Excepciones

**Course BlogPost**: "Cuando el CPU hace otra cosa"

Conceptual axis: A running program assumes the CPU is entirely its own. Interrupts break that assumption: hardware inserts an event — a timer expiry, a received byte, a disk completion — into the middle of whatever was executing. Exceptions are the synchronous counterpart: illegal instructions, page faults, system calls. Handling both correctly is the foundation on which scheduling and virtual memory stand.

Action-IDEs at course level:
- `mini-sim` — interrupt timeline: a running program; a timer interrupt fires; the CPU jumps to the handler; the handler runs; the program resumes — visualized as a timeline
- `stepper` — `scause` decoding: given a raw `scause` value, identify the type and cause

---

### Module B.1 — Arquitectura de Interrupciones

**Module BlogPost**: Interrupts and exceptions differ in a key way: interrupts are asynchronous (they arrive between instructions, triggered by hardware), while exceptions are synchronous (they are caused by executing a specific instruction). RISC-V uses the same trap mechanism for both — but `scause` bit 63 tells the handler which kind arrived.

---

#### Unit B.1.1 — Interrupciones vs. excepciones
*D1 · render_mode = "blog"*

**BlogPost axis**: The CPU executes instructions sequentially. Two things can break that sequence: an exception caused by the currently-executing instruction (synchronous), and an interrupt caused by something external (asynchronous). Both divert execution to the trap vector, but they require different responses. Understanding this distinction is required to write correct trap handlers.

**Topics**:
- Synchronous exceptions: illegal instruction, load address misaligned, page fault, environment call (`ecall`)
- Asynchronous interrupts: timer interrupt, external interrupt (PLIC), software interrupt (inter-hart)
- `scause`: bit 63 = interrupt flag; bits 62:0 = cause code; the cause codes for each type
- Why the distinction matters for `sepc`: for exceptions, `sepc` points to the faulting instruction; for interrupts, `sepc` points to the interrupted instruction (which is valid and must be re-executed)
- The PLIC (Platform-Level Interrupt Controller): prioritizes and routes external interrupts to harts
- Enabling interrupts: `sstatus.SIE` (supervisor interrupt enable) + `sie` register (which interrupt sources to accept)

**Action-IDEs**:
- `inline-action` — for each event, synchronous exception or asynchronous interrupt? (timer expiry, divide by zero, `ecall`, UART receive, page fault, software interrupt)
- `stepper` — `scause` decoding: given five raw `scause` values, identify each; use the RISC-V privileged spec table

**Closing question**: ¿Por qué las interrupciones pueden desactivarse temporalmente (con `sstatus.SIE`) pero las excepciones no? ¿Qué pasaría si las excepciones también pudieran desactivarse?

---

#### Unit B.1.2 — El mecanismo de traps RISC-V
*D2 · render_mode = "blog"*

**BlogPost axis**: The RISC-V trap mechanism is a hardware state machine with four CSRs: `sepc` (where to return), `scause` (why we're here), `stval` (additional info), `stvec` (where to go). The hardware sets the first three automatically on a trap and jumps to `stvec`. The kernel sets `stvec` at boot; after that, every trap is handled.

**Topics**:
- `stvec`: the supervisor trap vector; low 2 bits = mode (direct: always jump here; vectored: jump to base + 4×cause)
- Direct vs. vectored mode: direct is simpler; vectored allows per-interrupt entry points (important for performance)
- What hardware does automatically on a trap: disables interrupts (`sstatus.SIE → 0`), saves `pc → sepc`, saves mode → `sstatus.SPP`, saves cause → `scause`, stores auxiliary info → `stval`
- What hardware does NOT do automatically: save general-purpose registers; switch stack; call a handler
- The window of vulnerability: from trap entry until the handler saves registers, state is inconsistent
- `sscratch`: a CSR reserved for the kernel's use; commonly used to temporarily hold the stack pointer or kernel base address during trap entry

**Action-IDEs**:
- `mini-sim` — trap entry: start with a running program; trigger `ecall`; observe each CSR's value change in hardware; the Rust handler receives a pointer to the trap frame
- `expanded-ide` — set up `stvec` at boot; write a minimal trap handler that reads `scause` and logs the cause; fire an `ebreak` from supervisor mode; verify the handler fires

**Closing question**: ¿Por qué el hardware no guarda automáticamente los registros generales en el trap? ¿Qué costaría hacerlo en hardware y qué gana al dejárselo al software?

---

### Module B.2 — El Trap Handler

**Module BlogPost**: The trap handler is the kernel's response to every interrupt and exception. It must save all registers (the trap frame), dispatch on `scause`, handle the specific event, and restore registers before returning. A bug here corrupts every subsequent execution.

---

#### Unit B.2.1 — Escribir un trap handler
*D2 · render_mode = "studio"*

**BlogPost axis**: The trap handler entry in assembly saves 32 registers to a trap frame on the kernel stack, calls a Rust function with a pointer to that frame, then restores all registers and executes `sret`. The Rust function dispatches on `scause` to the appropriate sub-handler. The assembly must be correct to the byte — a saved register at the wrong offset is a silent corruption.

**Topics**:
- The trap entry assembly: `csrrw sp, sscratch, sp` to swap in the kernel stack; `addi sp, sp, -256` to allocate the trap frame; `sd` for all 32 registers
- The `TrapFrame` struct in Rust: must match the assembly exactly; `#[repr(C)]` mandatory
- The dispatch function: `fn trap_handler(frame: *mut TrapFrame)` called from assembly; reads `scause`; calls the appropriate handler
- Handling `ecall` (syscall): read syscall number from `frame.a7`; dispatch to syscall table; write return value to `frame.a0`; increment `frame.sepc` by 4
- Handling timer interrupt: update `mtimecmp` to re-arm; call the scheduler's tick function
- Trap epilogue: restore all 32 registers; `csrrw sp, sscratch, sp`; `sret`

**Action-IDEs**:
- `full-lab` — implement the complete trap handler: assembly entry/exit; Rust dispatch; handle `ebreak` (log and continue), illegal instruction (log and kill), `ecall` (stub returning -1); pass the test suite which fires each trap type and verifies the handler dispatches correctly

**Anchors**:
- ⇠ RC2.1 if `#[repr(C)]` on the TrapFrame struct is unfamiliar

**Closing question**: ¿Por qué el trap handler usa `csrrw sp, sscratch, sp` en lugar de simplemente decrementar el stack pointer directamente?

---

#### Unit B.2.2 — El trap frame y la pila del kernel
*D3 · render_mode = "studio"*

**BlogPost axis**: Every trapped process has two stacks: the user stack and the kernel stack. The trap frame lives on the kernel stack. When the kernel preempts a process to schedule another, the trap frame of the first process must be preserved intact — it is the frozen snapshot of where that process was. This unit builds the data structures for per-process kernel stacks.

**Topics**:
- Per-process kernel stacks: each process has a dedicated kernel stack; its trap frame lives at a known offset at the bottom
- `sscratch`: at trap entry, holds the address of the per-process kernel stack; set when scheduling in a process
- The kernel stack region: allocated as a static array or from the physical frame allocator; mapped in the kernel's address space
- Stack overflow detection: a guard page below each kernel stack; unmapped; a stack overflow produces a page fault instead of silent corruption
- Nested traps: can a trap occur while the handler is running? In S-mode with `sstatus.SIE=0`: no. The consequences if it could.

**Action-IDEs**:
- `full-lab` — add per-process kernel stacks: allocate one stack per `Process`; store its top in `sscratch` when scheduling in; verify that switching between processes preserves each process's trap frame

**Closing question**: ¿Por qué cada proceso necesita su propia pila del kernel en lugar de que todos compartan una? ¿Qué ocurriría si el kernel tuviera una sola pila de kernel?

---

### Module B.3 — Interrupciones de Timer

**Module BlogPost**: The timer interrupt is the mechanism that makes preemptive scheduling possible. Without it, a process that loops forever holds the CPU forever. The RISC-V CLINT provides `mtime` (a monotonically increasing counter) and `mtimecmp` (the threshold that triggers an M-mode timer interrupt). The M-mode handler delegates it to S-mode via a software interrupt.

---

#### Unit B.3.1 — El timer RISC-V
*D1 · render_mode = "blog"*

**BlogPost axis**: The RISC-V Core Local INTerrupt controller (CLINT) provides two MMIO registers: `mtime` (current time, always incrementing) and `mtimecmp` (interrupt when `mtime ≥ mtimecmp`). Setting `mtimecmp` to `mtime + INTERVAL` schedules an interrupt in the future. This is the kernel's clock.

**Topics**:
- CLINT MMIO: `mtime` at `0x200_BFF8`; `mtimecmp[0]` at `0x200_4000` (per hart); 64-bit values
- Timer interrupt cause: `scause = 0x8000_0000_0000_0005` (supervisor timer interrupt)
- The M-mode→S-mode delegation: timer interrupts fire in M-mode; the M-mode stub forwards them to S-mode as a supervisor software interrupt via `sip.SSIP`
- Re-arming the timer: the handler must write `mtimecmp = mtime + INTERVAL` before returning, or the interrupt fires again immediately
- Timer frequency: QEMU's timer runs at 10 MHz; 10,000,000 ticks = 1 second
- `sie.STIE`: supervisor timer interrupt enable; must be set to receive timer interrupts in S-mode

**Action-IDEs**:
- `expanded-ide` — set up the timer: configure `mtimecmp` for 100 ms; enable supervisor timer interrupts; in the timer handler, re-arm and print a counter; verify that "tick" appears 10 times per second in QEMU output
- `mini-sim` — `mtime`/`mtimecmp` relationship: watch the two counters; the interrupt fires when they meet; re-arming sets `mtimecmp` ahead again

**Closing question**: ¿Por qué el CLINT divide el timer en `mtime` y `mtimecmp` en lugar de un simple registro de cuenta regresiva? ¿Qué ventaja tiene el diseño basado en comparación?

---

#### Unit B.3.2 — Scheduling cooperativo con timer
*D2 · render_mode = "studio"*

**BlogPost axis**: With a working timer interrupt, preemptive scheduling becomes possible: on each tick, the handler calls `schedule()`. `schedule()` saves the current process's state (already in the trap frame), picks the next process, and returns into the new process's trap frame. Preemption is not a scheduling algorithm — it is the mechanism that makes *any* scheduling algorithm work.

**Topics**:
- The scheduler tick: timer interrupt → `trap_handler` → `schedule_tick()` → possibly switch process
- What "switch process" means in the trap handler: the current process's registers are already in its trap frame; returning from the trap handler into a different trap frame runs a different process
- Round-robin in the timer: a circular queue; on each tick, move `current` to the back; run the front
- The first run of a new process: the trap frame is initialized with `sepc = entry_point`, `sstatus.SPP = User`, `sp = user_stack_top`
- Idle process: a process that loops forever; always runnable; ensures there is always a next process

**Action-IDEs**:
- `full-lab` — implement timer-based preemptive round-robin: three static kernel threads that each print their ID; verify interleaving in QEMU output; verify no thread starves

**Closing question**: ¿Por qué se llama "scheduling cooperativo" si hay un timer preemptivo? ¿Cuál es la diferencia real entre cooperativo y preemptivo en el contexto de este scheduler?

---

## Course C — Gestión de Memoria

**Course BlogPost**: "La ilusión del espacio propio"

Conceptual axis: Every process believes it owns the entire address space. It sees address `0x1000` as its own — not shared with any other process, not aliased to a hardware register, not contingent on physical layout. This belief is enforced by the MMU: a hardware unit that translates every virtual address to a physical address using a page table the kernel controls. This course builds the hardware knowledge (Sv39 paging) and the kernel implementation (frame allocator, page table management).

Action-IDEs at course level:
- `mini-sim` — virtual to physical address translation: enter a virtual address; watch the three-level Sv39 walk; arrive at the physical frame
- `stepper` — mapping a new page: allocate a physical frame; install a PTE at each level of the page table; enable the mapping

---

### Module C.1 — Memoria Física

**Module BlogPost**: Virtual memory requires a physical foundation: real frames of RAM that page tables can point to. The physical frame allocator is the kernel's answer to "give me a 4 KB chunk of RAM." It knows which frames are free; it gives one out on request; it takes one back on free.

---

#### Unit C.1.1 — El asignador de marcos físicos
*D1 · render_mode = "blog"*

**BlogPost axis**: Physical memory is divided into 4 KB pages called frames. The kernel needs a way to track which frames are free and allocate them on demand. This is the physical frame allocator — the lowest-level memory management primitive. Everything above it (page tables, kernel heap, user stacks) depends on it.

**Topics**:
- Physical frames: the unit of physical memory; 4 KB = 4096 bytes; frame number = physical address / 4096
- The allocator's job: track which frames are free; return a frame address on `alloc()`; mark it free on `free()`
- Why 4 KB? The page size is a hardware constant (Sv39 uses 4 KB pages); the allocator must match
- Discovering available RAM: the device tree describes the physical memory map; in QEMU virt, RAM starts at `0x8000_0000`
- The range to manage: skip kernel code/data; allocate from `end_of_kernel` to `end_of_ram`
- Alignment: physical frames must be aligned to their size; allocations must be page-aligned

**Action-IDEs**:
- `stepper` — the memory map at boot: kernel occupies `0x8000_0000..0x8010_0000`; available frames start at `0x8010_0000`; each allocation advances the pointer
- `inline-action` — given four operations (alloc, alloc, free(second), alloc), trace what address each allocation returns in a bump allocator vs. a bitmap allocator

**Closing question**: ¿Por qué el asignador de marcos físicos no puede reutilizar marcos liberados con un bump allocator simple? ¿Qué estructura de datos resuelve esto mínimamente?

---

#### Unit C.1.2 — Implementar un bitmap allocator
*D2 · render_mode = "studio"*

**BlogPost axis**: A bitmap allocator tracks free frames with a single bit per frame. Bit 0 = free, bit 1 = used. Allocation scans for the first zero bit and sets it; free clears the bit. The bitmap for 128 MB of RAM (the QEMU virt default) needs 32 KB — negligible, and it fits in the kernel's BSS.

**Topics**:
- Bitmap layout: one bit per 4 KB frame; for 128 MB RAM, 32,768 bits = 4 KB of bitmap storage
- Allocation: scan `u64` words for any zero bit; use `u64::leading_ones()` to find the first free bit; set it; return `base_addr + frame_index * PAGE_SIZE`
- Deallocation: compute frame index from address; clear the corresponding bit
- Alignment: the bitmap array must be aligned; ensure the base address is PAGE-aligned
- Thread safety: in a multiprocessor kernel, the allocator needs a spinlock; for now, single-hart is sufficient
- Initialization: mark the kernel's own frames as used at boot before opening the allocator

**Action-IDEs**:
- `full-lab` — implement `PhysFrameAllocator`: `alloc() -> Option<PhysAddr>`, `free(addr: PhysAddr)`; the test suite allocates all available frames, frees half, re-allocates half, and verifies no double-allocation and no leak

**Anchors**:
- ⇠ RC7.2.2 if implementing `GlobalAlloc` for the kernel heap requires review of the trait

**Closing question**: ¿Por qué el allocator de marcos físicos no necesita conocer el tamaño de la asignación? ¿Qué pasaría si hubiera frames de distintos tamaños (huge pages)?

---

### Module C.2 — Memoria Virtual

**Module BlogPost**: Two processes can both use address `0x1000`. Without virtual memory, one overwrites the other. With virtual memory, both see a private mapping. The hardware translates each `0x1000` to a different physical frame, enforcing isolation. This module establishes the model before building the hardware mechanism.

---

#### Unit C.2.1 — El problema sin memoria virtual
*D1 · render_mode = "blog"*

**BlogPost axis**: Before virtual memory, loading a program required knowing in advance where in physical memory it would run — and that address had to not conflict with any other running program. Relocation was manual, protection was impossible, and a buggy process could corrupt the kernel itself. Virtual memory was invented to solve exactly this.

**Topics**:
- The physical address collision problem: two programs both compiled to load at `0x8000_0000`; they cannot run simultaneously
- Static relocation: rewrite all addresses in the binary at load time — fragile and complex
- No isolation: a user-space bug can write to the kernel's physical frames; no hardware barrier exists
- The solution: indirection; every address is virtual; a hardware table maps virtual to physical
- Memory protection: the page table entry includes permission bits; the MMU rejects unauthorized accesses
- Process isolation follows automatically: each process has its own page table; virtual address `0x1000` maps to a different physical frame for each

**Action-IDEs**:
- `mini-sim` — the collision scenario: two processes compiled to the same address; try to load both into physical memory; observe the conflict
- `reveal` — why compilers can assume `0x0` is invalid: it is convention, enforced by the kernel mapping no page at address 0; a null pointer dereference produces a page fault because nothing is mapped there

**Closing question**: ¿Por qué se eligió hacer la traducción en hardware (MMU) en lugar de en software? ¿Qué costaría cada acceso a memoria si la traducción fuera un syscall?

---

#### Unit C.2.2 — Direcciones virtuales y frames físicos
*D2 · render_mode = "blog"*

**BlogPost axis**: A virtual address is a number that means nothing to the hardware unless a page table entry backs it. The MMU looks up the page table, finds the physical frame number, and adds the page offset to produce the physical address. The kernel controls the page table; by changing it, the kernel controls what each process can see.

**Topics**:
- Virtual address structure (Sv39): bits 63–39 = sign extension (must all be 0 for user, all 1 for kernel); bits 38–12 = VPN (virtual page number); bits 11–0 = page offset
- Physical address: 56 bits in Sv39; PPN[2:0] from the page table entry; page offset unchanged
- The page table entry (PTE): 8 bytes; bits 53–10 = PPN; bits 9–0 = flags (V, R, W, X, U, G, A, D)
- Permission flags: V (valid), R (readable), W (writable), X (executable), U (user-accessible)
- Leaf PTE vs. pointer PTE: a PTE with R=0, W=0, X=0 is a pointer to the next level; a leaf has at least one of R/W/X set
- The kernel mapping: the kernel maps its own physical frames at a fixed high virtual address (e.g., `0xFFFF_FFC0_8000_0000`) — present in every process's page table

**Action-IDEs**:
- `stepper` — decomposing a virtual address: split `0x0000_0000_0010_1234` into VPN[2], VPN[1], VPN[0], and offset; identify the three page table indices and the byte offset within the final page
- `expanded-ide` — given a flat array representing a page table, translate three virtual addresses; identify which have valid mappings and which cause page faults

**Closing question**: ¿Por qué el page offset (bits 11:0) nunca se traduce? ¿Qué garantiza que el offset es el mismo en la dirección virtual y en la física?

---

### Module C.3 — Paginación Sv39

**Module BlogPost**: Sv39 is RISC-V's virtual memory scheme: a 39-bit virtual address space, three-level page tables, 4 KB pages. The hardware page table walker traverses all three levels on each memory access — unless the TLB has a cached translation. The kernel builds and manages this structure; every allocation, process creation, and context switch involves it.

---

#### Unit C.3.1 — La estructura de la tabla de páginas Sv39
*D1 · render_mode = "blog"*

**BlogPost axis**: A Sv39 page table has three levels. Level 2 (root) has 512 entries, each pointing to a level-1 table. Level 1 has 512 entries, each pointing to a level-0 table. Level 0 has 512 entries, each a leaf PTE pointing to a 4 KB physical frame. To map a virtual address requires up to three physical frames just for the page table itself.

**Topics**:
- Three-level structure: each level has 512 PTEs (4 KB / 8 bytes per PTE = 512 entries)
- VPN decomposition: VPN[2] indexes into the root (level 2); VPN[1] into level 1; VPN[0] into level 0
- The root page table address: stored in `satp` (Supervisor Address Translation and Protection) CSR; bits 63–60 = mode (Sv39 = 8); bits 43–0 = PPN of root
- Activating the MMU: writing `satp` with mode = 8 and the root PPN turns on address translation
- Allocating page table memory: each level table needs a physical frame; allocated from the physical frame allocator
- Identity mapping the kernel: the kernel must map itself at its virtual address before enabling the MMU, or the next instruction faults

**Action-IDEs**:
- `mini-sim` — Sv39 page table tree: a visual tree with three levels; click on a VPN to trace the walk; leaf PTEs show PPN + flags
- `stepper` — mapping one page: allocate root frame; set VPN[2] PTE to point to level-1 frame; set VPN[1] PTE to point to level-0 frame; set VPN[0] PTE with leaf PPN + R/W/X flags

**Xrefs**:
- ↔ Compilers E.4.1: "The page permissions (.text = RX, .data = RW, .rodata = R) are the same flags you set in page table entries here."

**Closing question**: ¿Por qué Sv39 usa tres niveles en lugar de una tabla plana? ¿Cuánta memoria ocuparía una tabla plana para el espacio de direcciones de 39 bits?

---

#### Unit C.3.2 — El page walk
*D2 · render_mode = "studio"*

**BlogPost axis**: When the CPU executes a memory instruction, the MMU performs a page walk: it uses `satp` to find the root table, indexes with VPN[2], follows the pointer to level 1, indexes with VPN[1], follows to level 0, indexes with VPN[0], extracts the PPN, and adds the page offset. A missing or invalid PTE at any level raises a page fault. Implementing this in software is required to set up the initial kernel mapping before enabling the MMU.

**Topics**:
- The hardware page walk algorithm (described in the RISC-V privileged spec §4.3.2)
- Software page walk: implement the same algorithm to install mappings; used to set up the initial kernel mapping
- `map_page(root: *mut PageTable, vaddr: usize, paddr: usize, flags: u64)`: allocate intermediate tables as needed
- Identity mapping the kernel: map `phys_addr == virt_addr` for the kernel's range before enabling the MMU
- Higher-half kernel mapping: also map the kernel at `0xFFFF_FFC0_0000_0000 + phys_addr` so kernel code can run at a high address
- `satp` write and `sfence.vma`: after setting `satp`, execute `sfence.vma` to flush the TLB; otherwise old translations persist

**Action-IDEs**:
- `full-lab` — implement `map_page` and the kernel mapping sequence; enable Sv39 by writing `satp`; verify the kernel continues executing after the MMU is enabled; map a test page and verify reads/writes succeed

**Anchors**:
- ⇠ RC3.2.2 if mutable access to page table entries produces borrow conflicts

**Closing question**: ¿Por qué es necesario llamar a `sfence.vma` después de modificar la tabla de páginas? ¿Qué podría pasar si no se hace?

---

#### Unit C.3.3 — El TLB: por qué importa vaciarlo
*D3 · render_mode = "studio"*

**BlogPost axis**: The MMU performs a page walk on every memory access. That would make every load/store three times slower. The TLB (Translation Lookaside Buffer) is a hardware cache of recent virtual-to-physical translations. It makes paging fast — and introduces a class of subtle correctness bugs: stale TLB entries from before a page table modification.

**Topics**:
- TLB as a set-associative cache: key = (ASID, virtual page number); value = physical frame number + flags
- TLB miss: the hardware walks the page table and loads the translation; subsequent accesses are cached
- TLB invalidation: `sfence.vma` flushes TLB entries; without it, the CPU may use stale translations
- When flushing is required: after modifying or removing a page table entry; after a context switch (if no ASIDs)
- ASID (Address Space Identifier): a tag in `satp` and TLB entries; allows multiple processes' translations to coexist; reduces flush cost on context switches to just `sfence.vma asid`
- TLB shootdown in multiprocessor systems: changing a mapping on one hart requires invalidating the TLB on all harts that ran the affected process — via inter-processor interrupts

**Action-IDEs**:
- `full-lab` — demonstrate a TLB bug: map page A to frame 1; write a value; remap page A to frame 2 without flushing; read the page — observe the old value from the stale TLB entry; add `sfence.vma` and observe the correct value
- `reveal` — why ASID optimization is non-trivial to implement correctly: if an ASID is reused for a new process, all of that ASID's TLB entries must be flushed first

**Closing question**: ¿Por qué el hardware no vacía el TLB automáticamente cada vez que el kernel escribe en la tabla de páginas? ¿Qué haría inviable ese diseño?

---

## Course D — Procesos

**Course BlogPost**: "Múltiples programas, una CPU"

Conceptual axis: A process is the OS abstraction for a running program: its own address space, its own set of registers, its own open files. The illusion of simultaneous execution on one CPU requires three mechanisms: the process model (what state to maintain), context switching (how to save and restore that state), and scheduling (which process runs next). This course builds all three.

Action-IDEs at course level:
- `mini-sim` — three processes round-robin: each process's registers visible; the timer fires; the scheduler picks the next; the registers swap
- `stepper` — process lifecycle: `READY → RUNNING → BLOCKED → READY → RUNNING → ZOMBIE`

---

### Module D.1 — El Modelo de Proceso

**Module BlogPost**: A process is a data structure before it is an abstraction. The Process Control Block (PCB) holds everything the kernel needs to pause and resume a computation: saved registers, the page table root, the process state, the kernel stack pointer. Creating a process means filling in this struct and putting it on the ready queue.

---

#### Unit D.1.1 — ¿Qué es un proceso?
*D1 · render_mode = "blog"*

**BlogPost axis**: A process is not a program — it is a program in execution. The same binary can be loaded into five processes simultaneously; each has its own address space, its own stack, its own program counter. The OS maintains a Process Control Block for each, storing everything required to pause and resume it.

**Topics**:
- Process vs. program: a program is a static artifact (the ELF binary); a process is a running instance with state
- The Process Control Block (PCB): process ID, state, saved registers (the context), page table root (physical address of Sv39 root), kernel stack, open file table
- Process states: `READY` (can run, waiting for CPU), `RUNNING` (currently on CPU), `BLOCKED` (waiting for I/O or event), `ZOMBIE` (exited, waiting for parent to collect status)
- Process creation: `fork()` semantics (copy the parent's address space); `exec()` semantics (replace the address space with a new binary); for this kernel, a simpler `spawn(entry: fn())` is sufficient
- The process ID (PID): a monotonically increasing integer; unique per process; reused after the process exits and is reaped

**Action-IDEs**:
- `mini-sim` — process state machine: click buttons to trigger transitions (schedule, block, unblock, exit); observe state changes
- `stepper` — creating a process: allocate a PCB; allocate a kernel stack; initialize saved registers (pc = entry, sp = user_stack_top); set state = READY; add to ready queue

**Closing question**: ¿Por qué el proceso tiene dos stacks (user stack y kernel stack) en lugar de uno? ¿Qué problema resuelve tener una pila del kernel separada?

---

#### Unit D.1.2 — El layout del espacio de direcciones
*D2 · render_mode = "blog"*

**BlogPost axis**: A process's virtual address space is divided into regions: the text segment (code, read-execute), the data segment (initialized globals, read-write), the heap (grows upward from the end of data), and the stack (grows downward from the top of the user space). The kernel is mapped at a fixed high address in every process's page table, but is only accessible from S-mode.

**Topics**:
- The canonical address space layout: text → data/rodata/bss → heap → ... → stack (from low to high)
- Guard pages: an unmapped page below the stack catches stack overflows; a page fault instead of silent corruption
- The kernel mapping at the high end: present in every process's page table; `U` flag cleared so user code cannot access it
- ASLR (Address Space Layout Randomization): randomizing segment base addresses; why it complicates some attacks; not implemented in this kernel but worth understanding
- The ELF loader: reads the program headers; maps each segment to virtual memory using `map_page`; sets `sepc` to the entry point

**Action-IDEs**:
- `stepper` — loading an ELF: read each PT_LOAD segment; call `map_page` for each page of the segment; set the page permissions from the segment flags; place the stack at the top of user space
- `mini-sim` — address space layout: a visual map with text, data, heap gap, stack; hover each region for its size, base address, and permissions

**Xrefs**:
- ↔ Compilers E.4.2: "You produce ELF; this is the kernel-side loader that reads it. Integration Lab I4 exercises the full round-trip."

**Anchors**:
- ⇠ RC2.1.2 if `#[repr(C)]` on the PCB struct is unfamiliar

**Closing question**: ¿Por qué el heap crece hacia arriba y el stack crece hacia abajo? ¿Qué ocurriría si ambos crecieran en la misma dirección?

---

### Module D.2 — Context Switching

**Module BlogPost**: Context switching is saving one process's CPU state and loading another's. It requires saving every register the process might need when it resumes — which means the 32 general-purpose registers, the program counter, and the stack pointer. The OS calls context switch; the process pauses; the next process resumes as if it was never interrupted.

---

#### Unit D.2.1 — Guardar y restaurar el estado del CPU
*D2 · render_mode = "blog"*

**BlogPost axis**: A context switch is a function call that returns to a different process. When `switch_to(current, next)` is called, it saves the current process's callee-saved registers to its `Context` struct, loads the next process's `Context`, and returns — but now on the next process's stack. The return address in `ra` is the next process's resume point.

**Topics**:
- The `Context` struct: the callee-saved registers only (s0–s11, ra, sp) — the caller-saved registers are already saved on the stack by the calling convention
- Why only callee-saved registers: `switch_to` is a function call; by the ABI, the caller already saved its caller-saved registers; only the callee-saved ones must be explicitly preserved
- The switch: `sd` all callee-saved regs to `current.context`; `ld` all callee-saved regs from `next.context`; `ret` (jumps to `next.context.ra`)
- First run of a new process: `context.ra` = the entry function; `context.sp` = the top of the kernel stack
- The invisible hand-off: from the new process's perspective, `switch_to` was called and now returns with the saved `ra` pointing to its entry point

**Action-IDEs**:
- `full-lab` — implement `switch_to` in assembly; create two kernel threads that each loop printing their ID; verify interleaving when `switch_to` is called from a round-robin loop

**Xrefs**:
- ↔ Compilers E.3.1: "The callee-saved registers in the RISC-V ABI are exactly the registers the context switch saves — because the ABI contract guarantees they must be preserved across calls."

**Closing question**: ¿Por qué el context switch guarda sólo los registros callee-saved y no todos los 32 registros? ¿En qué caso tendría que guardar todos?

---

#### Unit D.2.2 — El ensamblador del context switch
*D3 · render_mode = "studio"*

**BlogPost axis**: The context switch is the most assembly-intensive piece of the kernel. Every instruction is load-bearing. A misaligned stack pointer, a wrong register number, a missing `sfence.vma` — any of these produces a crash that is nearly impossible to debug without understanding exactly what the assembly does at the byte level.

**Topics**:
- The full `switch_to` assembly listing: explained instruction by instruction; each `sd`/`ld` matched to its offset in `Context`
- Switching page tables: load `next.satp` into `satp`; execute `sfence.vma` to flush the TLB; now virtual addresses resolve in the new process's space
- The danger window: between switching the stack pointer and loading the saved register file, the CPU is in an inconsistent state; no interrupts, no page faults allowed
- Debugging context switch bugs: common symptoms (crash on first context switch; crash after N switches; memory corruption 4 switches later); debugging strategy
- Compiler interference: Rust may not generate assembly that matches hand-written expectations; `asm!` macros and `naked` functions

**Action-IDEs**:
- `full-lab` — implement the full context switch including page table switching; run three user processes each with their own address space; verify isolation (one process cannot read another's memory)
- `reveal` — the most common context switch bug: forgetting `sfence.vma`; the symptom; why it appears non-deterministically

**Closing question**: ¿Por qué el context switch tiene que cambiar la tabla de páginas (satp) y no sólo los registros? ¿Qué ocurriría si todos los procesos compartieran la misma tabla de páginas?

---

### Module D.3 — El Scheduler

**Module BlogPost**: A scheduler answers one question: which process runs next? The simplest answer is round-robin: give each process a time slice; when it expires, move it to the back of the queue. More sophisticated schedulers consider priority, fairness, interactivity, and real-time deadlines. This module builds both, in that order.

---

#### Unit D.3.1 — Round-robin
*D1 · render_mode = "blog"*

**BlogPost axis**: Round-robin scheduling puts all runnable processes in a circular queue and gives each a fixed time slice (quantum). When the quantum expires, the current process moves to the back of the queue and the front process runs. It is fair in the weak sense — no process waits forever — and simple enough to reason about.

**Topics**:
- The ready queue: a circular buffer or a VecDeque of `*mut Process` pointers
- The time quantum: measured in timer ticks; a quantum of 10 ticks at 100 Hz = 100 ms per process
- The timer tick: on each timer interrupt, decrement the current process's tick count; if zero, call `yield_cpu()`
- `yield_cpu()`: set current process state to READY; enqueue it; dequeue the next; call `switch_to`
- Fairness: every runnable process gets the CPU at most one quantum behind the others; maximum wait = (N–1) × quantum
- The idle process: a process that loops on `wfi` (wait-for-interrupt); always on the ready queue; prevents an empty queue

**Action-IDEs**:
- `full-lab` — implement round-robin: a `Scheduler` struct with a `VecDeque<Pid>`; `tick()` and `yield_cpu()` methods; three processes that print their PID; verify they appear in repeating order
- `mini-sim` — round-robin with 4 processes and quantum = 3: step through the schedule tick by tick; observe queue state

**Closing question**: ¿Por qué el time quantum importa? ¿Qué tradeoff hay entre un quantum muy corto y uno muy largo?

---

#### Unit D.3.2 — Prioridad y MLFQ
*D2 · render_mode = "blog"*

**BlogPost axis**: Round-robin treats all processes equally. But an interactive process (waiting for input) and a batch compute job have different latency requirements. Priority scheduling gives each process a priority level; the scheduler always runs the highest-priority runnable process. Multi-Level Feedback Queue (MLFQ) adjusts priority dynamically based on behavior.

**Topics**:
- Static priority: each process has a fixed priority; the scheduler picks the highest-priority runnable process; equal-priority processes round-robin
- Priority starvation: low-priority processes can wait forever if high-priority processes are always runnable
- MLFQ rules: new processes start at the highest priority queue; if they use their full quantum, they drop to a lower queue; if they yield early (I/O), they stay; periodic priority boost prevents starvation
- Why MLFQ approximates "reward short jobs": CPU-bound processes naturally sink to low-priority queues
- Implementing MLFQ: an array of ready queues indexed by priority level; `tick()` decrements quantum; `unblock()` inserts at the current priority
- The scheduler in Linux (CFS): the Completely Fair Scheduler uses a red-black tree keyed on virtual runtime; not implemented here but the context for understanding why MLFQ isn't the end state

**Action-IDEs**:
- `expanded-ide` — implement MLFQ with 3 priority levels: a CPU-bound process and an I/O-bound process; observe that the I/O-bound process stays at high priority and gets low latency

**Closing question**: ¿Por qué el boost periódico de prioridad en MLFQ es necesario? ¿Qué escenario sin boost conduce a starvation permanente?

---

### Module D.4 — Llamadas al Sistema

**Module BlogPost**: System calls are the interface between user space and the kernel. A user program cannot allocate memory, write to a file, or exit cleanly without asking the kernel to do it. The mechanism on RISC-V is `ecall`: a synchronous exception that transfers control to the S-mode trap handler. The handler dispatches on the syscall number and returns a result.

---

#### Unit D.4.1 — El mecanismo ecall/sret
*D1 · render_mode = "blog"*

**BlogPost axis**: `ecall` is the instruction that crosses the hardware privilege boundary from user space to the kernel. It triggers an exception with `scause = 8` (environment call from U-mode). The trap handler runs in S-mode, performs the requested operation, and `sret`s back to the instruction after `ecall`. The privilege boundary is a hardware guarantee, not a software convention.

**Topics**:
- `ecall` as a deliberate exception: the user program cannot jump directly to kernel code; `ecall` is the only legal entry point
- `scause` value for `ecall` from U-mode: 8; from S-mode: 9 (self-trap for debugging)
- The mandatory `sepc += 4`: `ecall` is a synchronous exception; without incrementing `sepc`, the handler would return to the `ecall` instruction and loop forever
- What the handler must not assume: the user's stack pointer is untrusted; the kernel must use its own stack
- Returning a result: the handler writes the return value to the trap frame's `a0` before returning; the user sees it in `a0` after `sret`
- Security boundary: the kernel must validate all arguments from the user; a pointer from user space is only valid if the kernel maps it in the user's page table

**Action-IDEs**:
- `stepper` — the `ecall` round-trip: user code sets registers; executes `ecall`; hardware saves state, jumps to handler; handler reads `scause` = 8; increments `sepc`; writes result; `sret`; user resumes
- `reveal` — why `ecall` cannot be replaced by a function call: a function call does not change privilege level; user code calling a kernel function directly would execute it in U-mode where it cannot access S-mode CSRs or kernel memory

**Xrefs**:
- ↔ Compilers E.2.2: "`ecall` is the instruction your compiler generates when the program calls `write()` or `exit()`. The codegen emits `li a7, <syscall_num>; ecall`."

**Closing question**: ¿Por qué sólo hay una puerta de entrada al kernel (`ecall`) y no múltiples, una por syscall? ¿Qué ventaja de seguridad tiene el punto de entrada único?

---

#### Unit D.4.2 — La ABI de syscalls
*D2 · render_mode = "blog"*

**BlogPost axis**: The syscall ABI is a convention: which register holds the syscall number, which hold arguments, where the return value goes. On RISC-V Linux, `a7` = syscall number, `a0`–`a5` = arguments, `a0` = return value (or `-errno` on error). The kernel and user space must agree on this convention; it is the binary interface between them.

**Topics**:
- The RISC-V Linux syscall ABI: syscall number in `a7`; up to 6 arguments in `a0`–`a5`; return in `a0`
- The syscall table: an array of function pointers indexed by syscall number; the handler reads `frame.a7` and calls `syscall_table[num](frame)`
- Error return convention: negative return value = error; `-1` = `EPERM`; the user library converts this to `errno`
- Argument passing constraints: arguments must be valid user-space addresses or scalar values; the kernel must check each pointer argument before dereferencing
- For this kernel: `SYS_WRITE = 64`, `SYS_EXIT = 93` — the two minimal syscalls needed to run a program that prints and exits

**Action-IDEs**:
- `expanded-ide` — implement the syscall dispatch table: read `a7` from the trap frame; index into the table; call the handler; write the return value to `frame.a0`; add stubs for 5 syscall numbers that return `-ENOSYS`

**Closing question**: ¿Por qué la ABI de syscalls usa números en lugar de punteros a función? ¿Qué ventaja de seguridad tiene el número sobre el puntero?

---

#### Unit D.4.3 — Implementar write y exit
*D2 · render_mode = "studio"*

**BlogPost axis**: `write` and `exit` are the two syscalls required to run any meaningful user-space program. `write` copies bytes from the user's buffer to a file descriptor (in this kernel: to the UART if fd=1). `exit` terminates the process and returns the exit code to the kernel. Implementing them correctly requires validating user pointers.

**Topics**:
- `sys_write(fd, buf, count)`: check `fd` (only 1 = stdout for now); validate that `buf..buf+count` is mapped in the user's address space with read permission; write each byte to the UART
- Pointer validation: walk the user's page table to verify each page in the range is mapped, valid, and user-accessible; return `-EFAULT` if not
- `sys_exit(code)`: set the process state to `ZOMBIE`; save the exit code in the PCB; call `schedule()` immediately (the exited process never runs again)
- Process cleanup: `ZOMBIE` processes wait for their parent to call `wait()`; for now, the kernel reclaims the physical frames and PCB when the process exits

**Action-IDEs**:
- `full-lab` — implement `sys_write` and `sys_exit`; run a user-space Rust program compiled with `no_std` that prints "hello, os!" and exits with code 42; the test verifies QEMU output and exit code

**Closing question**: ¿Por qué el kernel tiene que validar los punteros del usuario antes de dereferenciarlos? ¿Qué ataque hace posible no validarlos?

---

## Course E — Sistemas de Archivos

**Course BlogPost**: "La jerarquía persistente"

Conceptual axis: A computer's power is cut. When it restarts, the files are still there. Persistence is not free — it requires an explicit data structure on disk designed to survive incomplete writes, power failures, and partial updates. This course builds from the physical layer (blocks and sectors) through the logical layer (inodes and directories) to the durability layer (journaling) and the abstraction layer (VFS).

Action-IDEs at course level:
- `stepper` — path resolution: `/home/user/file.txt` → walk the directory tree; three inode lookups; the final inode maps to block addresses; blocks are read from disk
- `mini-sim` — the FAT32 structure: cluster chain visualization; follow a file's chain from its directory entry to the last cluster

---

### Module E.1 — Abstracciones de Almacenamiento

**Module BlogPost**: Storage devices expose a block interface: read or write N sectors of 512 bytes each at a given sector number. Everything above this interface — inodes, directories, path lookup — is software. The filesystem is the layer that builds a navigable hierarchy from a flat sequence of numbered blocks.

---

#### Unit E.1.1 — Bloques y sectores
*D1 · render_mode = "blog"*

**BlogPost axis**: A storage device is a sequence of sectors. A sector is the minimum unit of transfer (typically 512 bytes). A filesystem block is the minimum unit of allocation (typically 4 KB = 8 sectors). Everything the filesystem stores — metadata, directory entries, file data — is laid out in blocks. Understanding the block interface is required before any filesystem abstraction.

**Topics**:
- The block device interface: `read_block(n: u64, buf: &mut [u8; 512])`, `write_block(n: u64, buf: &[u8; 512])`
- Sector vs. block: sector = the physical transfer unit (512 bytes or 4096 bytes for Advanced Format); filesystem block = the logical allocation unit (4 KB typical)
- Internal fragmentation: a 1-byte file occupies an entire block; tradeoff between fragmentation and I/O efficiency
- The block cache: reading from disk is slow; frequently-used blocks are cached in RAM; the cache must be kept coherent with disk
- Simulating a disk in QEMU: a raw image file; `qemu-system-riscv64 -drive file=disk.img,format=raw,id=hd0 -device virtio-blk-device,drive=hd0`
- The VirtIO block device: MMIO-based; the kernel writes request descriptors to a ring buffer; the device signals completion via an interrupt

**Action-IDEs**:
- `expanded-ide` — implement a VirtIO block device driver: initialize the virtqueue; submit a read request; wait for the interrupt; verify the block contents match the expected data
- `mini-sim` — block device layout: a 4 MB disk image; blocks numbered 0–1023; hover any block to see its offset and size

**Closing question**: ¿Por qué los filesystems usan bloques de 4 KB en lugar de leer un sector (512 bytes) a la vez? ¿Qué tradeoff hace el tamaño del bloque?

---

#### Unit E.1.2 — Inodos y directorios
*D2 · render_mode = "blog"*

**BlogPost axis**: A filename is not a file. It is a human-readable alias for an inode — a metadata structure that holds the file's size, permissions, timestamps, and the list of block addresses where the data lives. A directory is itself a file: a list of (name, inode number) pairs. Path lookup traverses directories until it finds the target inode.

**Topics**:
- The inode: a fixed-size struct on disk; fields: size, link count, permissions, timestamps, block pointer array
- Direct blocks: the inode holds N direct block pointers; each points to a data block
- Indirect blocks: a single-indirect block pointer points to a block full of further block pointers; expands the maximum file size
- Directory entries (dirents): a sequence of (inode number, name) pairs stored in a directory's data blocks
- Path lookup algorithm: start at root inode; for each component, read the directory blocks, find the matching name, follow its inode number; repeat
- Hard links and soft links: multiple dirents can point to the same inode (hard link); a symlink dirent contains a path instead of an inode number

**Action-IDEs**:
- `stepper` — path lookup for `/usr/bin/cat`: root inode → root directory blocks → `usr` inode → `/usr` directory blocks → `bin` inode → `/bin` directory blocks → `cat` inode
- `inline-action` — inode arithmetic: given block size = 4 KB, direct block count = 12, single-indirect = 1, what is the maximum file size? Show the calculation.

**Closing question**: ¿Por qué el nombre del archivo no se guarda en el inodo? ¿Qué permite esa separación y qué lo hace más complicado?

---

### Module E.2 — FAT32

**Module BlogPost**: FAT32 is not elegant, but it is universal. Every USB drive, SD card, and BIOS partition uses it. Understanding FAT32 means understanding what a filesystem looks like before inodes were invented — and why inodes were invented.

---

#### Unit E.2.1 — Estructura de FAT32
*D1 · render_mode = "blog"*

**BlogPost axis**: FAT32 replaces the inode's block pointer array with a linked list: the File Allocation Table. Each entry in the table corresponds to one cluster; the value is the number of the next cluster in the file, or a terminator. The directory entry stores the file's starting cluster number; following the chain gives the complete file.

**Topics**:
- The BPB (BIOS Parameter Block): at sector 0; contains bytes-per-sector, sectors-per-cluster, number of FAT copies, root cluster number
- Clusters: FAT32's allocation unit; a cluster is typically 4–32 sectors; all file data is cluster-aligned
- The FAT table: an array of 32-bit entries; FAT[n] = 0 (free), FAT_EOC (end of chain), or the next cluster number
- The cluster chain: follow `start_cluster → FAT[start_cluster] → FAT[...] → FAT_EOC`
- Directory entries: 32 bytes; fields: name (8.3 format), attributes, first cluster high/low, size, timestamps
- Long File Name (LFN) entries: a sequence of special directory entries before the short name entry; stores up to 255 UCS-2 characters

**Action-IDEs**:
- `mini-sim` — cluster chain walker: a FAT table shown as an array; enter a starting cluster; follow the chain step by step until end-of-chain
- `stepper` — reading a file: directory entry → starting cluster; FAT[start] → next cluster; repeat; accumulate data blocks until FAT_EOC

**Closing question**: ¿Por qué FAT32 es más propenso a la fragmentación que un filesystem basado en extensiones? ¿Qué coste tiene la fragmentación en FAT?

---

#### Unit E.2.2 — Driver FAT32 de solo lectura
*D2 · render_mode = "studio"*

**BlogPost axis**: A read-only FAT32 driver implements three operations: mount (read the BPB, locate the FAT), read directory (read the directory cluster chain, parse 32-byte entries), and read file (follow the cluster chain, read each data cluster). No writes, no cache invalidation, no journaling — just parsing a well-defined on-disk format.

**Topics**:
- Driver state: the parsed BPB fields needed for all calculations; a reference to the block device
- `read_cluster(n: u32, buf: &mut Vec<u8>)`: compute the LBA from the cluster number using the BPB; read the sectors
- `list_dir(cluster: u32) -> Vec<DirEntry>`: read directory clusters; skip LFN and deleted entries; return short-name entries
- `open_file(path: &str) -> Option<u32>`: path lookup from root cluster; return the starting cluster
- `read_file(start_cluster: u32) -> Vec<u8>`: follow the cluster chain; accumulate data

**Action-IDEs**:
- `full-lab` — implement the FAT32 read-only driver: mount a QEMU disk image containing known files; list the root directory; read `/hello.txt`; the test compares the output to the known file content

**Closing question**: ¿Por qué FAT32 no tiene un journal? ¿Qué ocurre con el filesystem si el sistema se apaga durante una escritura?

---

### Module E.3 — Journaling

**Module BlogPost**: A write to a filesystem is rarely one block write. Creating a file requires writing a directory entry, updating the inode bitmap, writing the inode, and writing the data block. If the power fails between any two of these, the filesystem is inconsistent. Journaling solves this with a simple invariant: write the intent before the action.

---

#### Unit E.3.1 — El problema de consistencia ante crashes
*D2 · render_mode = "blog"*

**BlogPost axis**: Five writes are needed to create a file. Power fails after write three. The on-disk state is inconsistent: some updates were applied, some weren't. The filesystem scanner (`fsck`) takes hours to repair it by examining the entire disk. Journaling was invented to make this repair take milliseconds.

**Topics**:
- The create-file operation decomposed: (1) allocate inode, (2) write inode, (3) update inode bitmap, (4) write directory entry, (5) update directory inode mtime
- Partial failure scenarios: if any one of the five writes is missing, the filesystem is inconsistent in a different way
- `fsck`: the traditional repair tool; must scan the entire disk to find inconsistencies; linear in disk size; unacceptable for large disks
- Ordering constraints: some orderings are safe (write data before metadata); some are not (update metadata before writing data = data block claimed but empty)
- The journaling invariant: no update is applied to the main filesystem until its complete, committed description is in the journal
- Journal types: write-ahead logging (write-ahead log = WAL); the journal is a circular log on disk at a fixed location

**Action-IDEs**:
- `mini-sim` — crash scenarios: pick a write to interrupt; observe the resulting inconsistency; identify which `fsck` rule would catch it
- `stepper` — the cost of `fsck` on a 1 TB disk at 100 MB/s: 10,000 seconds = 2.8 hours; compare to journal replay: read the last N kilobytes of the journal

**Closing question**: ¿Por qué el journal debe estar en un lugar separado del filesystem principal en lugar de escribir en el lugar final directamente con el flag "committed"?

---

#### Unit E.3.2 — Write-ahead logging
*D3 · render_mode = "studio"*

**BlogPost axis**: Write-ahead logging (WAL) is the journal implementation: before applying any update to the main filesystem, write the complete description of the update to the journal log, write a commit record, and only then apply the updates. On recovery, replay all committed but not-yet-applied journal entries. Uncommitted entries are discarded.

**Topics**:
- The WAL algorithm: (1) write log entries for all blocks to be updated; (2) write commit record; (3) apply updates to main filesystem; (4) write checkpoint record (log can now be reclaimed)
- The journal on disk: a circular log with head and tail pointers; the journal block (at a fixed LBA) stores these pointers
- Recovery: on mount, scan from tail to head; find the last committed transaction; replay all its writes to the main filesystem
- Idempotency: applying a journal entry twice must be safe; filesystem writes are idempotent by design
- Ordered journaling vs. data journaling: ordered = journal metadata only, ensure data is written before metadata commit; data = journal both data and metadata; full data journaling doubles write traffic

**Action-IDEs**:
- `full-lab` — implement journal write and recovery: a `Journal` struct that wraps a block device; `begin_transaction()`; `log_block(lba, data)`; `commit()`; `recover()` that replays on mount; test by interrupting after commit but before checkpoint

**Closing question**: ¿Por qué WAL no garantiza durabilidad contra corrupción de hardware (bit rot)? ¿Qué añadiría un sistema como ZFS que WAL no tiene?

---

### Module E.4 — VFS

**Module BlogPost**: The kernel does not know about FAT32 or ext4. It knows about `vnode` operations: `open`, `read`, `write`, `readdir`. Every filesystem implements this interface; the VFS (Virtual Filesystem Switch) routes kernel calls to the correct implementation. The syscall `read(fd, buf, n)` calls `vfs_read`, which calls `fat32_read` or `ext4_read` — the kernel never knows which.

---

#### Unit E.4.1 — La capa VFS
*D1 · render_mode = "blog"*

**BlogPost axis**: The VFS is an indirection layer between syscalls and filesystem drivers. It defines an abstract interface — a set of operations every filesystem must implement — and ensures the kernel always calls through that interface. Adding a new filesystem means implementing the interface, not modifying the kernel.

**Topics**:
- The VFS model: `VfsOps` trait (or function pointer struct in C) with `mount`, `unmount`, `lookup`, `open`, `read`, `write`, `readdir`, `close`
- The `Vnode` (virtual inode): a kernel object representing an open file or directory; backed by a filesystem-specific struct
- The file descriptor table: a per-process array of open `Vnode` references; fd 0/1/2 = stdin/stdout/stderr
- Mount points: a directory that is associated with a `VfsOps` and a filesystem-specific `Superblock`; path lookup crosses mount points transparently
- The path through a `read(fd, buf, n)` syscall: `sys_read → fd_table[fd].vnode.ops.read(vnode, buf, n) → fat32_read(...)`

**Action-IDEs**:
- `stepper` — a `read(fd=3, buf, 512)` call traced through VFS: syscall handler → fd table lookup → vnode → ops.read → fat32_read → block_device.read
- `mini-sim` — two filesystems mounted: `/` = FAT32; `/proc` = a virtual filesystem; opening `/proc/status` routes to the virtual FS; opening `/hello.txt` routes to FAT32

**Closing question**: ¿Por qué la VFS necesita un vnode por archivo abierto en lugar de usar directamente el número de inodo? ¿Qué estado necesita el vnode que el inodo no tiene?

---

#### Unit E.4.2 — Implementar un backend VFS
*D2 · render_mode = "studio"*

**BlogPost axis**: A VFS backend implements the `VfsOps` trait for a specific filesystem. For FAT32, `lookup(name)` searches a directory's cluster chain, `read(vnode, buf, n)` follows the cluster chain and copies data, `readdir(vnode)` iterates directory entries. The kernel calls these through the trait; the filesystem sees typed structs.

**Topics**:
- Implementing `VfsOps` for FAT32: bridge the `VfsOps` trait to the FAT32 driver from E.2.2
- The `FatVnode` struct: holds the starting cluster, current read position, size; implements the `Vnode` trait
- `lookup(dir_vnode, name)` → `Option<Box<dyn Vnode>>`: search the directory's cluster chain for the matching dirent
- `read(vnode, buf, n)`: read from the current position; advance by the bytes read; follow cluster chain as needed
- `open(path)` from root: walk the path using `lookup`; return a vnode for the final component
- Plugging into the fd table and `sys_read`/`sys_write`

**Action-IDEs**:
- `full-lab` — implement the FAT32 VFS backend; connect to `sys_read` and `sys_open`; run a user-space program that opens a file from the FAT32 disk image and prints its contents; the test verifies the output

**Closing question**: ¿Qué tendría que cambiar en tu VFS backend para soportar escrituras? ¿Qué garantías de consistencia tendría que dar la VFS layer?

---

## Course F — Primitivas de Concurrencia

**Course BlogPost**: "Múltiples hilos, un estado compartido"

Conceptual axis: Preemptive scheduling creates a hazard: two processes can execute simultaneously, and if they share mutable state, they race. The kernel is not immune. Interrupt handlers run concurrently with the kernel's main execution path; multiple harts share kernel data structures. This course builds the synchronization primitives the kernel uses to protect itself.

Action-IDEs at course level:
- `mini-sim` — the race condition: two kernel threads increment a counter without synchronization; the counter reaches a value less than the expected total; the missing increments are lost writes
- `stepper` — a spinlock acquisition: thread A acquires; thread B spins; thread A releases; thread B acquires; the critical section executes serially

---

### Module F.1 — Spinlocks

**Module BlogPost**: A spinlock is the simplest mutual exclusion primitive: a shared flag that a thread atomically sets to "locked." Any other thread that tries to set it busy-waits (spins) until the flag clears. The implementation requires one atomic instruction — `compare-and-swap` — and one memory fence. It is correct, simple, and appropriate when the critical section is short.

---

#### Unit F.1.1 — Cuándo el busy-wait es correcto
*D1 · render_mode = "blog"*

**BlogPost axis**: Spinning wastes CPU cycles. A sleeping mutex is always better when the wait might be long. But sleeping requires the scheduler, which requires synchronization — a chicken-and-egg problem. For short critical sections (a few instructions) in the kernel's interrupt handlers and scheduler, the cost of spinning is less than the cost of saving context and waking up.

**Topics**:
- Busy-waiting: a loop that checks a condition until it's true; simple but burns CPU cycles
- When spinning is better: the critical section holds the lock for fewer cycles than a context switch takes; holding the lock will not trigger a scheduler switch that would give the CPU to the thread that holds the lock
- The spinlock in kernel interrupt handlers: interrupts run on the kernel stack; they cannot sleep; they must use spinlocks
- Deadlock: if a thread holds a spinlock and then is interrupted by a handler that tries to acquire the same spinlock, the system deadlocks; solution: disable interrupts while holding a spinlock
- Uniprocessor vs. SMP: on a uniprocessor, simply disabling interrupts is sufficient for mutual exclusion; spinlocks matter for multi-hart systems

**Action-IDEs**:
- `inline-action` — for each scenario, spinlock or sleeping mutex? (interrupt handler, scheduler internal queue, disk I/O waiting, short counter increment, waiting for user input)
- `reveal` — the interrupt-disable-while-spinning pattern: why disabling interrupts is necessary and sufficient on a uniprocessor, and necessary but not sufficient on SMP

**Closing question**: ¿Por qué el kernel debe deshabilitar interrupciones al adquirir un spinlock? ¿En qué tipo de deadlock cae si no lo hace?

---

#### Unit F.1.2 — Implementar un spinlock
*D2 · render_mode = "studio"*

**BlogPost axis**: A spinlock implementation requires one atomic instruction: `compare_exchange`. The lock state is an `AtomicBool`; acquiring sets it from `false` to `true` atomically; if the exchange fails, spin. The memory ordering on the `compare_exchange` and the corresponding `store` determines the visibility guarantees to other harts.

**Topics**:
- `AtomicBool::compare_exchange(current, new, success_ord, failure_ord)`: succeeds only if the current value equals `current`; returns `Ok(prev)` or `Err(prev)`
- The acquire loop: `while self.0.compare_exchange(false, true, Acquire, Relaxed).is_err() {}`; the `Acquire` ordering prevents reordering of subsequent reads across the lock acquisition
- Release: `self.0.store(false, Release)`; the `Release` ordering ensures all preceding writes are visible to the thread that next acquires the lock
- The `fence` instruction on RISC-V: `fence rw,rw` between the spinlock acquire and the critical section body
- `Spinlock<T>`: a generic wrapper similar to `Mutex<T>` in `std`; returns a `SpinlockGuard<T>` on lock; the guard `Drop` releases

**Action-IDEs**:
- `full-lab` — implement `Spinlock<T>` with `lock() -> SpinlockGuard<T>` and `Drop` on the guard; demonstrate that a counter shared between two kernel threads increments correctly; demonstrate the race without the lock

**Anchors**:
- ⇠ RC6.1.3 if `AtomicBool::compare_exchange` and memory ordering semantics are unfamiliar

**Xrefs**:
- ↔ RC6.1 [atomics]: "Kernel spinlocks use the same atomic operations as Rust's `std::sync::atomic`. The ordering semantics are identical — both implement the C++ memory model on the same hardware."

**Closing question**: ¿Por qué `compare_exchange` en Rust tiene dos memory ordering parámetros (éxito y fallo) en lugar de uno? ¿Qué optimización permite el ordering del fallo?

---

### Module F.2 — Sleeping Mutex

**Module BlogPost**: A spinlock wastes CPU cycles while waiting. For any wait longer than a few hundred nanoseconds, the thread should sleep — give up the CPU and be woken up when the lock is available. A sleeping mutex adds a wait queue to the spinlock: threads that fail to acquire add themselves to the queue and call `yield()`; the release wakes one waiter.

---

#### Unit F.2.1 — El sleeping mutex
*D2 · render_mode = "blog"*

**BlogPost axis**: A sleeping mutex combines a lock state, a wait queue (a list of threads sleeping on this mutex), and the scheduler. A thread that cannot acquire the lock adds itself to the wait queue, sets its state to `BLOCKED`, and calls the scheduler. When the mutex is released, the release path moves one waiter from the queue to the ready queue.

**Topics**:
- The sleeping mutex struct: `locked: bool`; `waiters: VecDeque<Pid>`; protected internally by a spinlock
- Acquire: disable interrupts; if `locked == false`, set true, enable interrupts, done; else add self to `waiters`, set state `BLOCKED`, enable interrupts, `yield_cpu()`; on wake-up, retry
- Release: disable interrupts; set `locked = false`; if waiters is non-empty, pop one, set its state to `READY`, add to ready queue; enable interrupts
- The interrupt-disable window: the state change (adding to waiters and calling yield) must be atomic; a timer interrupt between the two steps would produce a lost wake-up
- `MutexGuard<T>`: same RAII pattern as `Spinlock`; `Drop` calls release

**Action-IDEs**:
- `expanded-ide` — implement `Mutex<T>` with a wait queue; demonstrate two threads where thread B blocks on the lock, thread A holds it for 500 ms, releases, thread B wakes; verify the ordering in QEMU output

**Anchors**:
- ⇠ RC4.3.3 if `UnsafeCell` for interior mutability inside the mutex struct is unfamiliar

**Closing question**: ¿Qué garantía perdería el sleeping mutex si el release no desactivara interrupciones antes de actualizar la lista de waiters?

---

#### Unit F.2.2 — Integración con el scheduler
*D3 · render_mode = "studio"*

**BlogPost axis**: The sleeping mutex's correctness depends on a precise protocol between blocking a thread and the scheduler: the thread must be added to the wait queue and set to `BLOCKED` before enabling interrupts, or a wake-up that arrives between those two steps is lost forever. This is the fundamental challenge of building synchronization on top of a scheduler.

**Topics**:
- The lost wake-up problem: thread A about to sleep; B releases and finds no waiters; A then goes to sleep — and no one will ever wake it
- The solution: the acquire and the yield must be in a single uninterruptible window; disabling interrupts closes the window
- `sleep_on(queue)` and `wake_one(queue)`: the scheduler primitives the mutex builds on; `sleep_on` atomically adds to queue and yields; `wake_one` atomically removes and readies
- Condition variables: a higher-level abstraction built on sleep/wake; `wait(mutex, condition)` releases the mutex, sleeps, and re-acquires on wake-up; the kernel primitive is `sleep_on`
- The futex (fast userspace mutex): how Linux avoids kernel involvement for the uncontended case; the `FUTEX_WAIT`/`FUTEX_WAKE` syscalls

**Action-IDEs**:
- `full-lab` — implement a condition variable using `sleep_on`/`wake_one`; build a bounded producer-consumer queue where the producer blocks when full and the consumer blocks when empty; verify correctness under three concurrent producers and two consumers

**Closing question**: ¿Por qué los futexes de Linux son más eficientes que el sleeping mutex del kernel para code de user space? ¿En qué caso tienen el mismo costo?

---

### Module F.3 — Inversión de Prioridad

**Module BlogPost**: Priority scheduling has a pathological case: priority inversion. A low-priority process holds a lock needed by a high-priority process. A medium-priority process preempts the low-priority one. The high-priority process is blocked by the low-priority one, which is blocked by the medium-priority one — even though it has lower priority. Mars Pathfinder crashed because of this.

---

#### Unit F.3.1 — El problema de inversión de prioridad
*D1 · render_mode = "blog"*

**BlogPost axis**: Priority inversion occurs when a high-priority thread is transitively blocked on a low-priority thread, which is preempted by medium-priority threads. The high-priority thread effectively runs at the priority of the low-priority thread — inverted.

**Topics**:
- The scenario: three threads L (low), M (medium), H (high); L holds mutex; H tries to acquire, blocks; M becomes runnable and preempts L; H is now effectively at L's priority, blocked behind M
- Why this violates the scheduling invariant: H has higher priority than M but runs after M
- Real-world consequences: unbounded priority inversion can cause missed deadlines in real-time systems
- Detection: the scheduler notices that a thread at priority P is blocked on a mutex held by a thread at priority < P
- Why it's hard to avoid: the scheduler must track mutex ownership across the entire dependency chain

**Action-IDEs**:
- `mini-sim` — priority inversion visualized: three threads; timeline shows the inversion as L's execution time is extended by M's preemption
- `stepper` — the dependency chain: H blocked on mutex → mutex held by L → L preempted by M → M running; map each link in the chain

**Closing question**: ¿Por qué la inversión de prioridad no ocurre con spinlocks, sólo con sleeping mutexes? ¿Qué propiedad del spinlock lo evita?

---

#### Unit F.3.2 — Mars Pathfinder
*D1 · render_mode = "blog"*

**BlogPost axis**: In 1997, the Mars Pathfinder rover began resetting itself 18 hours after landing. The cause: a priority inversion bug in VxWorks. A low-priority meteorological task held a mutex needed by a high-priority communications task. A medium-priority bus management task preempted the meteorological task. The watchdog timer expired while the communications task waited. Anthropic engineers were able to diagnose and fix the bug from Earth without a software update.

**Topics**:
- The Pathfinder software: VxWorks RTOS; tasks with priority levels; the ASI (information bus) shared resource
- The three tasks: meteorological task (low priority, held the mutex), bus management task (medium priority), communications task (high priority, needed the mutex)
- The watchdog: the communications task managed a watchdog that must be kicked within a deadline; blocked on the mutex, it missed the deadline; the watchdog reset the system
- The diagnosis: engineers on Earth had a complete replica; the bug was reproducible; priority inheritance was already in VxWorks but not enabled
- The fix: enable `t_takRSrc` priority inheritance flag — uploaded via the telecommand system, no code change
- Why this was possible: VxWorks had priority inheritance implemented; it just wasn't enabled; the fix was a configuration flag

**Action-IDEs**:
- `reveal` — why the bug was non-deterministic: the inversion only occurred when the meteorological task and bus management task were both active at the same time as a communications task attempt
- `stepper` — the root cause chain: meteorological task takes mutex → bus management preempts → communications task blocks → watchdog expires → reset

**Closing question**: ¿Por qué los ingenieros de Pathfinder no habilitaron la herencia de prioridad desde el principio? ¿Qué coste tiene habilitarla siempre?

---

#### Unit F.3.3 — Soluciones: herencia y ceiling
*D2 · render_mode = "blog"*

**BlogPost axis**: Two algorithms solve priority inversion. Priority inheritance: when a high-priority thread blocks on a mutex, the mutex owner temporarily inherits the higher priority. Priority ceiling: each mutex has a ceiling equal to the highest priority of any thread that ever uses it; acquiring the mutex raises the thread's priority to the ceiling.

**Topics**:
- Priority inheritance: when H blocks on a mutex held by L, set L's effective priority to H's; L can now preempt M; when L releases, its priority reverts
- Chained inheritance: if L is blocked on a mutex held by LL, the inheritance propagates transitively up the chain
- Priority ceiling protocol: each mutex has a `ceiling_priority`; when a thread acquires the mutex, if its priority < ceiling, raise it to ceiling; release restores the original priority
- Implementing priority inheritance in the kernel: the mutex stores the owner; on contention, update the owner's `effective_priority`; the scheduler uses effective_priority for scheduling decisions
- Tradeoffs: inheritance is reactive (applies when inversion detected); ceiling is proactive (prevents inversion entirely); ceiling requires knowing priorities statically

**Action-IDEs**:
- `expanded-ide` — implement priority inheritance in the sleeping mutex: when H blocks on a mutex held by L, set L's effective priority to H's; verify in the Pathfinder scenario that the inversion no longer occurs

**Closing question**: ¿Por qué el Priority Ceiling Protocol puede ser más seguro que la herencia de prioridad en sistemas de tiempo real? ¿Qué garantía ofrece que la herencia no puede dar?

---

### Module F.4 — Ordenamiento de Memoria

**Module BlogPost**: The compiler and the CPU both reorder memory operations for performance. A store that "happens" in one thread may not be immediately visible to another. This is not a bug in the hardware — it is a defined behavior described by the memory model. Synchronization primitives work because they include the right memory fences. Understanding fences is required to implement synchronization correctly.

---

#### Unit F.4.1 — El modelo de memoria del hardware
*D2 · render_mode = "blog"*

**BlogPost axis**: Modern CPUs execute memory operations out of order. A store followed by a load may become a load followed by a store. On RISC-V, this is explicit: the memory model is "relaxed" — loads and stores can be reordered freely unless explicit fence instructions prevent it. x86 is stricter (TSO), but RISC-V's relaxed model is what this kernel runs on.

**Topics**:
- Why reordering happens: CPUs have write buffers, out-of-order execution units, and speculative loads; making them visible globally in program order would be expensive
- The RISC-V memory model (RVWMO — RISC-V Weak Memory Order): each hart executes loads and stores in program order; across harts, the order is only constrained by explicit fences
- The classic example: two harts, each storing to their own variable then loading from the other; without fences, both can read 0
- `fence` on RISC-V: `fence r,w` (predecessor reads ordered before successor writes), `fence rw,rw` (full fence), `fence.i` (instruction fence for self-modifying code)
- The difference from x86's TSO: x86 guarantees total store order — stores are globally visible in program order; RISC-V does not

**Action-IDEs**:
- `mini-sim` — the two-hart message passing litmus test: hart 0 stores data then stores flag; hart 1 loads flag then loads data; without a fence in hart 0, hart 1 may see the flag but not the data
- `reveal` — why TSO "feels" safe for simple programs: store buffering is the only reordering TSO allows; most naive programs don't hit it; RISC-V allows more reorderings, making more programs visibly wrong

**Xrefs**:
- ↔ RC6.1 [atomics]: "The C++ memory model that Rust's `Ordering` enum implements runs on top of RISC-V RVWMO. `Acquire`/`Release` map to specific fence patterns."

**Closing question**: ¿Por qué ARM y RISC-V eligieron modelos de memoria relaxed en lugar de TSO? ¿Qué ventaja de rendimiento tiene un modelo más débil?

---

#### Unit F.4.2 — Barriers del compilador y del hardware
*D3 · render_mode = "studio"*

**BlogPost axis**: Two levels of reordering must be prevented for correct synchronization: the compiler reordering (moving instructions across the synchronization point during compilation) and the hardware reordering (the CPU executing stores out-of-order at runtime). `core::sync::atomic::compiler_fence` prevents compiler reordering. The `fence` instruction prevents hardware reordering. Spinlocks need both.

**Topics**:
- Compiler reordering: the compiler may move a store or load across a function call if it can prove no aliasing; in the kernel, this is wrong — the lock protects against concurrent access the compiler cannot see
- `compiler_fence(Ordering)`: inserts a compiler barrier — the compiler cannot move loads/stores across it; zero cost at runtime
- The `fence` instruction: a hardware instruction that orders memory operations; has non-zero runtime cost
- When each is needed: compiler fence alone is sufficient on uniprocessor (there is no second hart); hardware fence is needed for SMP; the `Atomic*` types in Rust emit both
- The full spinlock: `compare_exchange(false, true, Acquire, Relaxed)` emits an LR/SC pair with acquire ordering; the `store(false, Release)` emits a fence before the store; both compiler and hardware are correctly ordered
- `sfence.vma` vs. `fence rw,rw`: `sfence.vma` orders page table modifications and TLB invalidation; `fence rw,rw` orders regular memory; different fence classes for different hazards

**Action-IDEs**:
- `full-lab` — demonstrate a compiler reordering bug: two variables, a flag and a value; store value first, then flag, without a fence; the compiler moves the flag store before the value store (observed via `objdump`); add a compiler fence and verify the correct order in the generated assembly
- `reveal` — why the Rust atomic types are not just `compiler_fence` on uniprocessor RISC-V: QEMU emulates the RISC-V memory model correctly; on real hardware the relaxed model matters

**Closing question**: ¿Por qué el hardware fence (`fence rw,rw`) es más caro que el compiler fence? ¿Qué tiene que hacer el procesador físicamente para implementarlo?

---

## Anchor Map — OS → Rust Track

Points in this track where a Rust concept blocks progress.

```
[A.2.2 — UART volatile]          "read_volatile/write_volatile for MMIO"        → RC7.1.2 (raw pointers, volatile)
[C.1.2 — bitmap allocator]       "GlobalAlloc trait for the kernel heap"         → RC7.2.2 (no_std, GlobalAlloc)
[C.2.2 — raw address arithmetic] "Virtual address as *mut u8 arithmetic"         → RC7.1.1 (unsafe, raw pointers)
[C.3.2 — page walk]              "Mutable reference into page table levels"       → RC3.2.2 (ownership, Rc/RefCell)
[D.1.2 — PCB repr(C)]            "repr(C) for the process control block"         → RC2.1.2 (structs, repr(C))
[D.2.2 — context switch naked]   "asm! / naked functions for the switch stub"    → RC7.1.2 (unsafe, inline asm)
[F.1.2 — spinlock atomic]        "AtomicBool::compare_exchange, Ordering"        → RC6.1.3 (atomics)
[F.2.1 — sleeping mutex]         "UnsafeCell inside the Mutex struct"            → RC4.3.3 (interior mutability)
```

---

## Xref Map — OS ↔ Compilers Track

Concepts that are the same idea viewed from two different layers.

```
[A.1.2 — boot, first instruction]    ↔ Compilers E.2.2   first instruction = what codegen produces; boot receives it
[A.2.1 — MMIO loads/stores]          ↔ Compilers E.2.2   same lw/sw instructions; distinction is only the address
[C.3.1 — Sv39 page permissions]      ↔ Compilers E.4.1   ELF section flags (.text RX, .data RW) = PTE flags set here
[D.1.2 — address space / ELF loader] ↔ Compilers E.4.2   compiler produces ELF; OS loads ELF; basis of I4
[D.2.1 — context switch registers]   ↔ Compilers E.3.1   callee-saved ABI contract = what context switch must save
[D.4.1 — ecall mechanism]            ↔ Compilers E.2.2   ecall = the syscall instruction your codegen emits
[F.1.2 — spinlock memory ordering]   ↔ RC6.1             kernel atomics and std atomics use the same C++ model on RVWMO
[F.4.2 — RISC-V fences]              ↔ Compilers E.3     fences enforce the same ordering the calling convention relies on
```

---

## Portal Map — Inbound to OS Track

Portals from C and Rust tracks that lead here.

```
From C Track → OS
────────────────────────────────────────────────────────────
[CC2.2.2]  malloc/valgrind          → C.1   (malloc calls brk/mmap; this is the kernel side of that call)
[CC3.3.2]  gcc -S, registros x86   → D.2   (the registers in the assembly output = what the context switch saves)
[CC3.3.3]  calling convention       → D.2   ← PRIMARY PORTAL (callee-saved reg contract = what OS must preserve at preemption)
[CC3.4.3]  ELF, objdump             → D.1   (the ELF you disassembled = what the OS loader maps into a process)

From Rust Track → OS
────────────────────────────────────────────────────────────
[RC3.1.1]  Box, Drop, heap          → C.1   (Box<T> calls the allocator; this is the kernel allocator side)
[RC6.1]    threads, Mutex           → D.2/D.3  (the threads you spawned are scheduled by an OS scheduler; this is it)
[RC6.2.2]  async/await, executor    → D.3   ← PRIMARY PORTAL (Rust executor = cooperative user-space scheduler; OS scheduler = preemptive kernel version)
[RC7.2.2]  no_std, GlobalAlloc      → C.1   ← PRIMARY PORTAL (the GlobalAlloc trait = the interface this kernel implements)
[RC7.1]    unsafe, raw pointers     → C.2   (unsafe lets you use raw addresses; the OS manages the model behind them)
```

---

## Source Coverage by Topic

| Topic | Primary Source |
|-------|----------------|
| Boot sequence, RISC-V privilege modes | RISC-V Privileged ISA Specification — Volume II (riscv.org — free) |
| Interrupt and trap mechanism | RISC-V Privileged ISA Specification §3–4; *Writing an OS in Rust* (Oppermann) |
| Memory-mapped I/O | QEMU virt machine documentation; *OSTEP* (Arpaci-Dusseau) Ch 36 |
| Physical memory management | *OSTEP* Ch 14–17 (Address Spaces, Paging) |
| Virtual memory and paging | *OSTEP* Ch 18–23 (Paging, TLBs); RISC-V Privileged ISA §4 (Sv39) |
| Process model and PCB | *OSTEP* Ch 4–6 (Processes, CPU Virtualization) |
| Context switching | *OSTEP* Ch 6; *Writing an OS in Rust* (Oppermann) |
| Scheduling algorithms | *OSTEP* Ch 7–10 (Scheduling: Introduction to MLFQ) |
| System calls | *OSTEP* Ch 6; *The Linux Programming Interface* (Kerrisk) Ch 3 |
| File systems (inodes, directories) | *OSTEP* Ch 39–42 (File System Implementation) |
| FAT32 | Microsoft FAT32 File System Specification (fatgen103.doc — free) |
| Journaling / write-ahead logging | *OSTEP* Ch 42 (Crash Consistency: Journaling) |
| VFS | *The Linux Programming Interface* Ch 14; *Modern Operating Systems* (Tanenbaum) Ch 4 |
| Spinlocks and mutexes | *OSTEP* Ch 28 (Locks); *Writing an OS in Rust* (Oppermann) |
| Priority inversion, Mars Pathfinder | Reeves (1997) "What Really Happened on Mars" — free online |
| Memory ordering, hardware fences | RISC-V Unprivileged ISA §A (RVWMO); *A Primer on Memory Consistency and Cache Coherence* (Nagarajan et al.) |
| Bare-metal Rust patterns | *Writing an OS in Rust* (Oppermann) — free online; *CS:APP* (Bryant, O'Hallaron) Ch 8–9 |
