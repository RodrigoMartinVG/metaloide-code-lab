# Backlog

Items capturados para no perderlos de vista. Sin orden de prioridad dentro de cada sección.

---

## Editor (CodeMirror 6)

### Frontend-only
- [ ] Modo Vim (`@codemirror/vim`) — alguien lo va a pedir
- [ ] Diff view — mostrar delta entre starter y estado actual del editor
- [ ] Panel de atajos de teclado (overlay con `?`)
- [ ] Control de font size (persistido en localStorage)

### Requiere backend ligero
- [ ] **Assembly view** — split panel que muestra el output de `gcc -S` / `rustc --emit=asm`. Pedagógicamente central en el track C: el estudiante ve qué genera su código. Costo: handler nuevo en el WebSocket o endpoint REST `/api/asm`.
- [ ] **Sanitizer inline** — compilar con `-fsanitize=address,undefined`, parsear output de ASan/UBSan y mostrarlo como anotaciones en el gutter via `@codemirror/lint`. Costo: flag de compilación + parser de output.
- [ ] **Diagnostics sin ejecutar** — `clang --fsyntax-only` / `rustc --emit=metadata` con debounce mientras el estudiante escribe. Errores y warnings en el gutter en tiempo real. Costo: endpoint `/api/check`, más liviano que `/run`.

### Requiere infraestructura seria
- [ ] **LSP** — `clangd` (C) y `rust-analyzer` (Rust) corriendo en backend, bridgeados a WebSocket. Completions, go-to-definition, hover con tipos. Costo alto: process lifecycle, cancelación de requests, memory pressure. Dejar para cuando el proyecto tenga más tracción.

---

## UX / Navegación

- [ ] **Mapa global (vista plataforma)** — landing page que muestra los 4 tracks con su topología (C → Rust → Compilers/OS) y progreso global. Actualmente la navegación empieza directamente en el track map sin contexto del viaje completo.

---

## Contenido

- [ ] CC1.4 Arrays & Strings (C Core)
- [ ] CC2.x módulos de Memory (C Core)
- [ ] Onboarding flow — cuando el backend no está corriendo, mostrar instrucciones de instalación en vez de error silencioso

---

## Backend

- [ ] Docker sandbox — actualmente la ejecución es subprocess directo (Option A). Migrar a contenedores para aislamiento real (Option B).
- [ ] Timeout tuning — revisar 30s compile / 10s run una vez que haya más ejercicios con diferentes perfiles de carga.
