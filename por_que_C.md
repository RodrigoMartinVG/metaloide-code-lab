# Diseño Curricular: C como Fundación para Ingeniería de Sistemas

## 1. Justificación Pedagógica del Orden Secuencial
En la formación de ingenieros de software enfocados en infraestructura, sistemas operativos y compiladores, la secuencia pedagógica **C → Rust → SO → Compiladores** es imperativa. 

C no se enseña aquí como un lenguaje de desarrollo de aplicaciones generales, sino como el **lenguaje de la máquina**. Es la herramienta de "Rayos X" que permite al alumno visualizar la memoria física, el *stack frame*, y la traducción a código ensamblador. Sufrir la gestión manual de memoria y el comportamiento indefinido (*Undefined Behavior*) en C es el requisito cognitivo previo para que el alumno valore y entienda verdaderamente el *Borrow Checker* y la seguridad de Rust, en lugar de percibirlo como un obstáculo sintáctico.

---

## 2. Temario Detallado: "La Realidad de la Máquina"

### Módulo 1: La Anatomía del Binario
El objetivo de este módulo es desmitificar la "magia" del botón de compilar.
* **1.1 El Ecosistema de Bajo Nivel:** Uso de la terminal, introducción a POSIX y configuración del entorno (WSL2 / Docker nativo).
* **1.2 La Cadena de Compilación (Toolchain):** Preprocesador, Compilador, Ensamblador y Linker. 
* **1.3 Inspección de Código:** Uso de `gcc -E` (ver macros) y `gcc -c` (archivos objeto).
* **1.4 El Layout de Memoria:** Secciones *Text, Data, BSS, Stack* y *Heap*. ¿Dónde vive cada variable de nuestro programa?
* **1.5 Automatización Básica:** Escribiendo el primer `Makefile`.

### Módulo 2: Sintaxis con Conciencia de Memoria
Se enseña la sintaxis de C, pero siempre atada a su representación física.
* **2.1 Tipos de Datos y Tamaños:** `sizeof()`, límites de tipos enteros (`limits.h`), *signed* vs *unsigned* y la representación en complemento a dos.
* **2.2 Operadores a Nivel de Bits:** `&`, `|`, `^`, `<<`, `>>`. Creación y lectura de *flags* en un solo byte (crucial para futuros drivers en SO).
* **2.3 Control de Flujo:** Traducción mental de `if`, `for`, `while` a saltos lógicos. El peligro de evaluar `0` como falso y todo lo demás como verdadero.
* **2.4 Funciones y el Stack Frame:** Pasaje por valor. Introducción visual a cómo se apilan las variables locales en la memoria y cómo se destruyen al hacer `return`.

### Módulo 3: El Corazón de C (Punteros)
El punto de inflexión del curso. Sin abstracciones, solo direcciones físicas.
* **3.1 Direccionamiento:** Los operadores `&` (referencia) y `*` (desreferencia).
* **3.2 Aritmética de Punteros:** Sumar y restar posiciones de memoria.
* **3.3 Arrays vs Punteros:** La ilusión del array en C. Cómo un array "decae" (*decays*) a un puntero al primer elemento.
* **3.4 Strings en C:** Arreglos de caracteres terminados en `\0`. Por qué funciones como `strcpy` son famosas por romper sistemas.
* **3.5 Punteros a Punteros:** Matrices dinámicas y modificación de direcciones dentro de funciones.

### Módulo 4: El Administrador (Gestión del Heap)
Transición de memoria estática/automática a memoria dinámica.
* **4.1 Solicitud de Memoria:** `malloc`, `calloc`, `realloc`. Comprendiendo que la memoria puede ser denegada por el OS.
* **4.2 Liberación de Memoria:** `free`. El ciclo de vida de los datos.
* **4.3 Herramientas Quirúrgicas:** Uso obligatorio de **Valgrind**. Detección y lectura de reportes de *Memory Leaks* y *Segmentation Faults*.
* **4.4 Los Errores Clásicos:** *Dangling pointers*, *Use-After-Free* y *Buffer Overflows*.

### Módulo 5: Composición y Tipos Complejos
Preparando el terreno para estructuras de datos y conceptos orientados a objetos en bajo nivel.
* **5.1 Structs:** Agrupación heterogénea de datos.
* **5.2 Alineación de Memoria (Padding):** Por qué el orden de las variables dentro de un `struct` afecta el tamaño final en bytes (optimización para la CPU).
* **5.3 Unions:** Compartiendo la misma dirección de memoria para diferentes tipos de datos.
* **5.4 Punteros a Funciones:** La base para crear abstracciones, callbacks y polimorfismo primitivo (preludio a los *Traits* de Rust).

### Módulo 6: Rayos X al Compilador (Ingeniería Inversa Básica)
El puente directo hacia los cursos de Sistemas Operativos y Compiladores.
* **6.1 Introducción a x86-64 Assembler:** Lectura (no escritura) de sintaxis Intel. Registros principales (`rax`, `rsp`, `rdi`, etc.).
* **6.2 Generación de Assembler:** Uso de `gcc -S -masm=intel`.
* **6.3 La Convención de Llamadas (Calling Convention):** Cómo se pasan los argumentos a una función por registros y cómo se recibe el retorno.
* **6.4 Observando la Optimización:** Compilar el mismo código con `-O0` y `-O3` para ver cómo el compilador reescribe nuestra lógica.

---

## 3. Metodología y Entorno de Trabajo
* **Fase Temprana:** Ejercicios interactivos en consola virtualizada (Docker Backend) para minimizar la fricción inicial. El alumno tiene acceso a un entorno Linux estandarizado desde el navegador con `gcc` y `valgrind` preconfigurados.
* **Fase Avanzada:** Transición a entorno local usando **WSL2** en Windows o entorno Linux nativo. El alumno debe dominar el *toolchain* de GNU en su propia terminal.

## 4. Proyecto Final (Capstone)
**"Implementación de una Estructura de Datos Dinámica y Genérica"**
El alumno deberá crear una biblioteca en C (por ejemplo, un `Vector` dinámico o un `HashMap` básico) que:
1. Utilice memoria dinámica de forma agresiva.
2. Maneje datos genéricos usando `void*`.
3. Sea empaquetada con su propio `Makefile`.
4. Pase un conjunto estricto de pruebas automatizadas y certifique **cero fugas de memoria** mediante un reporte limpio de Valgrind.