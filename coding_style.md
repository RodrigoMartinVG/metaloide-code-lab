# Forja: Estándares de Ingeniería y Arquitectura del Código

> "La máquina no entiende de abstracciones." — Filosofía Forja.

Este documento define las reglas de diseño, arquitectura y estilo para todo el código de Forja, con especial énfasis en el backend orquestador escrito en Rust. 

El código fuente de esta plataforma tiene un **doble propósito**:
1. **Infraestructura de Producción:** Debe ser un motor local invulnerable que gestione procesos pesados, redes virtuales y contenedores sin comprometer la máquina host del usuario.
2. **Material de Estudio Supremo:** Tras completar los tracks de C y Rust, el alumno leerá este código como caso de estudio de ingeniería de sistemas reales. El código es el libro de texto.

---

## 1. Principios Generales de Diseño

Para evitar la entropía del software y mantener la base de código como una herramienta pedagógica legible, se aplican los siguientes principios:

* **Sistemas sobre "Clean Code" Genérico:** Rechazamos el "over-engineering" y las capas de abstracción innecesarias (ej. fábricas de interfaces redundantes). Si una llamada directa a `std::process` es más clara que envolverla en un trait genérico, se usa la llamada directa.
* **Explícito y Defensivo:** El código debe asumir la hostilidad del entorno. Se asume que el demonio de Docker fallará, que el disco se quedará sin espacio y que el alumno escribirá código C diseñado para colapsar el sandbox.
* **Fallos Ruidosos (Fail-Fast):** Prohibido silenciar errores o devolver estados vacíos genéricos para "mantener la app viva". Si la infraestructura falla, el sistema debe detenerse e informar con precisión quirúrgica del motivo.

---

## 2. Estándares para el Backend (Rust)

El backend es el corazón de la plataforma y actúa como puente entre el frontend web y la realidad física del sistema operativo.

### 2.1. Abstracción Estricta del Sistema Operativo
Windows, macOS y Linux tienen modelos de procesos, permisos y redes diametralmente opuestos. El backend debe aislar estas diferencias.

* Uso estricto de directivas de compilación condicional (`#[cfg(windows)]`, `#[cfg(target_os = "linux")]`).
* **Windows requiere tratamiento de primera clase:** La lógica para gestionar WSL2, la conversión de rutas (de `C:\` a `/mnt/c/`) y la conexión al Named Pipe de Docker (`//./pipe/docker_engine`) debe estar aislada en módulos específicos (`windows_setup.rs`).
* Nunca se usarán `String` para manejar rutas de archivos; el uso de `PathBuf` es obligatorio para evitar fragilidad multiplataforma.

### 2.2. Manejo de Errores y Tipado Semántico
El alumno debe aprender a modelar errores de sistemas leyendo nuestra implementación.

* **Cero Tolerancia a Pánicos No Controlados:** Prohibido el uso de `.unwrap()` y `.expect()` en código de producción, salvo que exista un comentario exhaustivo justificando la imposibilidad matemática del fallo.
* **Errores de Dominio:** Los errores de bajo nivel (I/O, Sockets) deben envolverse en tipos semánticos usando librerías como `thiserror`. 
  * *Ejemplo:* Un fallo al conectar con Docker no devuelve un genérico `std::io::Error`, devuelve un `ForjaError::DockerSocketNotFound`.

### 2.3. Gestión del Ciclo de Vida y Recursos
El sistema debe ser impecable en la limpieza de la máquina del usuario.

* **Prevención de Zombis:** Todo proceso hijo (contenedores Docker, instancias de QEMU) debe estar atado al ciclo de vida del backend.
* Implementación rigurosa del trait `Drop` y manejadores de señales (Signals) del OS para garantizar que, si el backend se cierra repentinamente, todos los contenedores efímeros sean destruidos.

---

## 3. Documentación Pedagógica ("Mentorship Driven Development")

Dado que el código fuente es material de estudio, la documentación no solo debe explicar *qué* hace el código, sino *por qué* se tomó esa decisión arquitectónica frente a otras alternativas.

* **Docstrings (`///`):** Reservados estrictamente para definir el contrato de la función, parámetros esperados y garantías de seguridad.
* **Comentarios Internos (`//`):** Actúan como la voz del mentor. Deben explicar los trade-offs.
  * *Ejemplo:* Si se utiliza un `Arc<RwLock<T>>` en lugar de un `Arc<Mutex<T>>`, el comentario debe explicar la ratio de lectura/escritura esperada que justifica esa elección.
* **Mapeo a la Realidad:** Conectar las funciones de alto nivel de Rust con las llamadas al sistema (syscalls) subyacentes que el alumno estudió en el track de C (ej. "Esta función equivale a realizar un fork/exec en POSIX").

---

## 4. Orquestación y Directrices para IAs

Cualquier código generado mediante asistentes de IA para este repositorio debe cumplir con un prompt de sistema (System Prompt) que imponga estas reglas. El LLM debe actuar como un *Principal Engineer* enfocado en la enseñanza, prohibiendo la generación de código "corporativo genérico" que oculte el funcionamiento real del sistema operativo.