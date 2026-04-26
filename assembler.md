# Integración de Assembler: El Microscopio del Programador de Sistemas

## 1. El Rol del Assembler en el Aprendizaje de C
En esta currícula, el Assembler no es un fin en sí mismo, sino un medio para alcanzar la **transparencia total**. Al observar cómo el compilador traduce las estructuras de C a instrucciones de máquina, el alumno deja de memorizar reglas y comienza a entender causas físicas.

## 2. Objetivos de Aprendizaje (Lectura y Análisis)
El enfoque es de **exposición estratégica**. El alumno no escribirá programas complejos en Assembler, sino que aprenderá a "leer" la intención del código generado.

* **Identificación de Registros:** Comprender el uso de los registros de propósito general de x86-64 (`RAX`, `RDI`, `RSI`, `RDX`, `RCX`, `R8`, `R9`).
* **Control de Flujo Físico:** Identificar cómo los `if` y `while` se transforman en comparaciones (`CMP`) y saltos (`JMP`, `JE`, `JNE`).
* **Gestión del Stack:** Visualizar el "Prólogo" y "Epílogo" de las funciones, entendiendo cómo se reserva y libera el espacio para variables locales (`SUB RSP, X`).
* **Llamadas a Funciones (ABI):** Entender la convención de llamadas de Linux (System V AMD64 ABI) para saber cómo viajan los parámetros entre funciones.

## 3. Hoja de Ruta de Integración (Hitos)

### Hito 1: La Realidad del Dato (Módulo 2)
* **Concepto:** Tamaños y representación de datos.
* **Práctica:** Compilar una suma de un `char` y un `long`. Observar el uso de registros de diferentes tamaños (`AL` vs `RAX`) y entender el costo del casting de tipos.

### Hito 2: La Desaparición de las Variables (Módulo 3)
* **Concepto:** El ciclo de vida de las variables locales (Stack).
* **Práctica:** Analizar el código ensamblador de una función que retorna. Ver cómo el puntero de la pila (`RSP`) se mueve hacia arriba, invalidando técnicamente los datos anteriores, lo que justifica por qué no se debe retornar una dirección local.

### Hito 3: La Ilusión del Array (Módulo 4)
* **Concepto:** Aritmética de punteros.
* **Práctica:** Inspeccionar la instrucción `LEA` (Load Effective Address). Observar cómo el compilador calcula `base + (índice * tamaño)` en una sola instrucción de hardware para acceder a un array.

## 4. Laboratorio de Cierre: Ingeniería Inversa Básica
Como proyecto de integración del componente de Assembler, el alumno realizará un ejercicio de "Cracking" ético:
1. **Análisis:** Dado un binario sin código fuente, el alumno deberá desensamblarlo usando `objdump -d`.
2. **Localización:** Identificar la lógica de validación de una contraseña mediante la búsqueda de instrucciones de comparación (`CMP`) y salto condicional.
3. **Modificación:** Utilizando un editor hexadecimal en el backend, el alumno deberá "parchear" el binario (por ejemplo, cambiando un `JNE` por un `JE` o por `NOPs`) para alterar el flujo de ejecución.

## 5. Justificación para el Futuro (Rust y Compiladores)
Esta exposición temprana garantiza que:
* En **Rust**, el alumno entienda por qué el *Zero-Cost Abstractions* es posible (al ver que el código generado es tan eficiente como el de C).
* En **Sistemas Operativos**, el concepto de "Cambio de Contexto" sea trivial al entender que solo se trata de guardar y cargar registros.
* En **Compiladores**, el backend de generación de código sea un terreno conocido y no un abismo técnico.