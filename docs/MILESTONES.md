# Milestones

## M1 — "El shell existe" *(solo frontend, sin backend)*
**Resultado**: abrir `localhost:5173` y ver Forja.

- Scaffold Vite + Lit + TypeScript, con la paleta y tipografía definidas
- Topbar, skill tree con 4–5 nodos hardcodeados (algunos locked, algunos available)
- Click en un nodo → entra a la vista de lab
- La vista de lab muestra un bloque `prose` con markdown renderizado
- Monaco editor presente pero sin ejecutar nada
- Layout completo: split editor/output, breadcrumb, botón "Run" (no hace nada todavía)
- Si el backend no está corriendo → la UI muestra la guía de instalación (flujo de onboarding)

**Valor**: el diseño es real, se puede evaluar si la dirección visual es la correcta.

---

## M2 — "El editor ejecuta" *(backend mínimo)*
**Resultado**: escribir Rust en el browser, hacer click en Run, ver output.

- Backend Rust: `cargo new`, Axum, `GET /health`, CORS abierto
- `WS /run` que por ahora devuelve output hardcodeado (simula compilación)
- Frontend conecta al backend: Monaco → Run → output panel se llena con texto
- El flujo completo existe, aunque el backend sea fake

**Valor**: el loop central del producto funciona.

---

## M3 — "El código real corre en el browser"
**Resultado**: el código que escribís en Monaco se compila y ejecuta de verdad.

- Backend invoca `gcc` / `rustc` / `cargo` en un subprocess con timeout (dentro de Docker)
- Docker containers sandboxed, ephemeral, resource-limited — uno para C (gcc + valgrind), uno para Rust (cargo)
- Output streamea por WebSocket línea a línea
- Frontend renderiza output diferenciando `stdout`, `stderr`, errores del compilador
- Los errores del compilador son clickeables (saltan a la línea en Monaco)
- Primer lab real: C Track "Hola, máquina" — escribe C, compila con gcc, ve el output
- El mismo WebSocket sirve para Rust: misma infraestructura, distinto container

**Valor**: el producto central ya existe y es usable para el primer track (C).

---

## M4 — "El skill tree es real"
**Resultado**: el mapa se ve como un mapa real, navegar entre conceptos funciona.

- Backend sirve el grafo de units desde archivos en disco (los primeros 6–8 units del C Track: CC1.1–CC1.2)
- Frontend renderiza el grafo como SVG interactivo: nodos agrupados por Course, edges, estados visuales
- C Track visible como entrada al grafo; nodos de Rust, Compilers y OS visibles pero locked con tooltips
- Hover en nodo locked → tooltip con requisitos
- Click en nodo available → entra al lab de ese concepto
- Progress persiste en SQLite: completar un ejercicio cambia el estado del nodo en el tree
- Cross-track edges visibles (aún no clickeables — eso va en M6+)

**Valor**: la mecánica de progresión y desbloqueo es visible y funciona.

---

## M5 — "Un lab completo de punta a punta"
**Resultado**: la unidad `c-syntax` D1 (CC1.2.1 — Variables, tipos primitivos, I/O) existe como experiencia real de aprendizaje.

- Lab con prosa real, visualización simple (diagrama de tipos primitivos en SVG: tamaños, rangos), y 2–3 ejercicios con tests en gcc
- Tests corren en el backend (Docker con gcc) y el resultado aparece en el output panel (pass/fail por test)
- Completar todos los ejercicios → el nodo en el skill tree cambia a `completed` → desbloquea CC1.2.2
- El contenido está escrito con el nivel de rigor y tono del proyecto (directo, sin "easy"/"just")
- La pregunta `¿Por qué así?` aparece al final y la respuesta se guarda en SQLite

**Valor**: el ciclo completo de aprendizaje funciona: teoría → práctica → feedback → progresión → cierre reflexivo.

---

## M6 — "La primera visualización real"
**Resultado**: una viz interactiva funcionando en un lab.

- Elegimos la más tractable para arrancar: `mem-layout` (stack frames + heap, estático con steps)
- Implementada como Lit component, datos desde el lab TOML
- Integrada en el lab de `stack-heap` D1
- Se puede avanzar paso a paso viendo cómo el stack crece y decrece

**Valor**: se demuestra que el sistema de visualizaciones funciona y puede escalar.

---

## Después de M6
Con esto el producto tiene esqueleto, motor, navegación, progresión y visualizaciones.
Lo que sigue es contenido + más tipos de viz, en paralelo.

Candidatos para M7+:
- Portal/anchor blocks: renderer + tracking de revisitas en SQLite
- Cross-track edges clickeables en el skill tree (edge detail card)
- Primer lab real de Compilers (lexer-trace viz)
- Primer lab real de OS (mem-layout viz conectada a QEMU)
- Integration Lab I2 como demostración del sistema completo
