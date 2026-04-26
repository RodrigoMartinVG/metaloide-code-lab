# Integration Labs

Integration Labs (I1–I5) are where the tracks converge. They are not standard labs (they belong to a single concept in a single track) and not full projects (they're scoped to a few hours, not weeks). They exist at the intersections: moments where OS and Compilers and Rust stop being separate subjects and become one picture.

Each Integration Lab has prerequisites spanning multiple tracks. They appear in the skill tree as a separate "Integration" category — visible as nodes once their prerequisite cluster is within reach, locked until all prerequisites are met.

---

## I1 — The Unsafe Boundary

**Prerequisites:**
- Rust Core: `[unsafe]` D3
- OS: `[paging-sv39]` D1

**Time estimate:** ~3 hours

**The question:** What exactly does `unsafe` let you do to the kernel's memory model? And why does the borrow checker have nothing to say about it?

In this lab, you implement a minimal kernel allocator that talks directly to page tables. There is no safe abstraction between you and the physical frames. The allocator must:
- Maintain a free list of physical frames
- Map virtual addresses to physical frames via the Sv39 page table
- Return properly aligned `*mut u8` pointers that Rust code can use

What happens to Rust's guarantees here? What invariants does `unsafe` require you to uphold manually, that the type system used to enforce? What would a memory safety violation look like at this level?

**The insight:** `unsafe` doesn't disable Rust's rules. It acknowledges that you, the programmer, are taking responsibility for them. At the kernel level, there is no one to delegate to — the rules exist because the hardware is unforgiving, not because the compiler is cautious.

**Exercises:**
1. Implement a bitmap frame allocator (4KB frames, 128 frames max)
2. Write `map_page(virt: u64, phys: u64, flags: u64)` using raw page table manipulation
3. Trigger an intentional page fault by mapping a page with wrong permissions; observe the trap
4. Write a `KernelAllocator` that implements the `GlobalAlloc` trait using your frame allocator

---

## I2 — What Your Compiler Generates

**Prerequisites:**
- Compilers: `[codegen-elf]` D1 (your compiler can emit ELF output)
- OS: `[bare-metal-boot]` D2 (you know what the bootloader hands the kernel)

**Time estimate:** ~3 hours

**The question:** Your compiler produces bytes. What are those bytes? Where do they go? What does the CPU actually execute?

In this lab, you take a program written in the language your compiler supports, compile it, and trace it from source to execution:
1. Compile to RISC-V assembly (your codegen pass)
2. Inspect the ELF sections: `.text`, `.data`, `.rodata`, `.bss`
3. Load the binary in QEMU
4. Use `riscv64-unknown-elf-objdump` to disassemble and compare against your IR
5. Trace the syscalls with QEMU's tracing flags

**The insight:** The abstraction your compiler builds is real. Every node in your AST becomes a sequence of instructions. Every function call becomes a stack frame. Every allocation becomes a pointer. Walking this path end-to-end makes the compilation pipeline concrete in a way that building each phase in isolation does not.

**Exercises:**
1. Compile a fibonacci function to RISC-V ELF; disassemble and annotate each instruction
2. Identify which calling convention your compiler uses; compare to the RISC-V ABI spec
3. Find one optimization opportunity in the generated code; implement it in your optimizer
4. Run the binary under QEMU and use `--trace-file` to capture the execution trace

---

## I3 — The Minimal Runtime

**Prerequisites:**
- Compilers: `[codegen-elf]` D1
- OS: `[syscalls]` D1

**Time estimate:** ~4 hours

**The question:** Your compiler generates code that starts at `main`. But what happens before `main`? And how does the OS loader know where `main` is?

`crt0` (C runtime zero) is the code that runs before `main()`. It sets up the stack, initializes global variables, calls constructors, and finally calls `main`. Then it handles the return value and makes the exit syscall.

In this lab, you write `crt0.s` in RISC-V assembly and link it against the code your compiler generates. You then modify your compiler to emit the correct entry point symbol and link against your crt0.

**The insight:** There is no magic. The distance between "the OS loads your ELF" and "your code starts executing" is about 30 lines of assembly that most programmers never write. Understanding them makes the entire compilation pipeline legible.

**Exercises:**
1. Write `crt0.s` that: sets up the stack pointer, calls `main`, and makes the `exit` syscall with the return value
2. Modify your linker script to use `_start` as the entry point
3. Modify your compiler to emit a compatible `_start` or to link against your crt0
4. Verify the binary runs correctly under QEMU and exits with the right code
5. Add support for `argc`/`argv` passing from the OS to `main`

---

## I4 — Full Stack Own

**Prerequisites:**
- I2 completed
- I3 completed
- OS: `[process-model]` D2

**Time estimate:** ~6–8 hours

**The question:** Can your compiler generate a program that your OS can load and execute?

This is the lab where the circuit closes. You will:
1. Write a program in your compiler's language
2. Compile it to a RISC-V ELF using your compiler
3. Load it in your OS kernel's ELF loader
4. Have your kernel execute it as a user-space process
5. The program makes a syscall that your kernel handles

Every piece in this chain was built by you. The language, the compiler, the OS, the syscall interface. When the syscall returns and your program prints its output, you have built a complete computing stack from source to execution.

**Exercises:**
1. Implement a minimal ELF loader in your OS that can load and map a static RISC-V binary
2. Implement `exec()` syscall semantics: create a new process from an ELF image
3. Write a hello-world program in your language that uses a `write` syscall
4. Compile it with your compiler, load it with your OS's exec, run it in QEMU
5. Add one more syscall: `exit` — handle the process termination cleanly

---

## I5 — Multi-Architecture

**Prerequisites:**
- Compilers: `[codegen-cranelift]` D1

**Time estimate:** ~4 hours

**The question:** Now that you have a compiler with a pluggable backend, what does it cost to run on a different architecture?

In the RISC-V arc (Compilers Course E), you built a `CodegenTarget` abstraction after feeling the pain of being coupled to RISC-V. You then used Cranelift as a backend. In this lab, you prove that the abstraction is real.

You will compile the same source program and emit binaries for three targets:
- RISC-V 64-bit (QEMU)
- x86-64 (your local machine)
- WASM (run in a browser sandbox)

Each binary must produce the same output for the same input. The source code does not change between targets.

**Exercises:**
1. Compile a program that computes the first 20 Fibonacci numbers; run it on RISC-V in QEMU
2. Change only the Cranelift target triple; compile for x86-64; run natively
3. Change the target to WASM; compile; run in a WASM runtime (wasmtime or browser)
4. Measure code size across the three targets; explain the differences
5. Find one IR optimization that helps on x86-64 but not RISC-V; explain why

---

## How Integration Labs Appear in the Skill Tree

Integration labs are not inside any pillar's Course tree. They appear in a separate section that becomes visible once any of their prerequisites are within reach (i.e., unlocked or started).

Visual treatment:
- Node shape: distinct from standard unit nodes — a diamond or hexagon instead of a rectangle
- Node color: gradient blending the colors of the prerequisite pillars
- Edges: prerequisites are shown as incoming edges from multiple pillars simultaneously

When hovered, the tooltip shows:
```
I2 — What Your Compiler Generates
Prerequisites: Compilers › codegen-elf D1 (✓), OS › bare-metal-boot D2 (locked)
~3 hours
"Trace your compiler's output from source to QEMU execution."
```

Once all prerequisites are met, the node transitions from locked to available.
