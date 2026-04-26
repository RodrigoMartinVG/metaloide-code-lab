# Justificación de Infraestructura: Ecosistema Linux y Virtualización por Backend

Para una plataforma educativa que enseña **C, Rust y Sistemas Operativos**, la elección del entorno de ejecución no es una preferencia cosmética, sino una decisión de ingeniería pedagógica. La combinación de un **Kernel Linux** (vía Docker) y un **Backend en Rust** garantiza un entorno profesional, seguro y determinista.

## 1. Linux: El Laboratorio de Sistemas por Excelencia
Linux no es solo un sistema operativo; en este contexto, es nuestra **herramienta de diagnóstico**.
* **Transparencia de la API de Sistemas:** A diferencia de Windows, donde las APIs de bajo nivel son opacas y verbosas (Win32), Linux sigue el estándar POSIX. Esto permite que el alumno aprenda conceptos universales de gestión de archivos, señales y procesos que son directamente aplicables a la teoría de Sistemas Operativos.
* **Herramientas de Introspección Críticas:** Linux ofrece el ecosistema estándar de la industria para el desarrollo de sistemas:
    * **Valgrind:** Inexistente en Windows nativo; es vital para detectar fugas de memoria en C.
    * **GDB:** El depurador estándar que permite ver registros y desensamblar binarios en tiempo real.
    * **Strace:** Permite al alumno ver exactamente qué "System Calls" está haciendo su programa al Kernel.

## 2. Docker: Aislamiento y Determinismo Pedagógico
El uso de contenedores en el backend resuelve el problema histórico de *"en mi computadora no funciona"*.
* **Entornos Inmutables:** Cada vez que un alumno presiona "Run", recibe un contenedor Linux fresco con la versión exacta de GCC o Rustc que el curso requiere. Esto elimina horas de soporte técnico por desajustes de versiones.
* **Seguridad (Sandboxing):** Ejecutar código de alumnos (especialmente en C) es peligroso. El código puede tener punteros fuera de control o bucles infinitos. Docker permite aislar ese código en un entorno con recursos limitados (CPU/RAM), protegiendo la estabilidad del servidor principal.
* **Patio de Juegos para "Destruir":** En el curso de Sistemas Operativos, los alumnos pueden intentar colapsar el sistema o manipular archivos sensibles. Si rompen el contenedor, el backend lo destruye y crea uno nuevo en milisegundos. Esta libertad para fallar es esencial para el aprendizaje profundo.

## 3. Backend en Rust: El Orquestador de Alto Rendimiento
Elegir Rust para construir el backend que gestiona estos contenedores aporta beneficios de infraestructura:
* **Concurrencia Segura:** Rust permite manejar cientos de conexiones de terminales (WebSockets) simultáneas con un consumo de memoria mínimo y sin riesgos de condiciones de carrera.
* **Baja Latencia:** La comunicación entre el backend y el Docker Engine es extremadamente eficiente, lo que brinda al alumno una sensación de terminal local, incluso cuando el proceso está ocurriendo en la nube.
* **Sostenibilidad:** Un backend en Rust optimiza los costos de servidor, permitiendo ejecutar más laboratorios con menos hardware.

## 4. Portabilidad y Escalabilidad
Esta arquitectura permite que la plataforma crezca sin fricciones:
* **De la Web al Local:** Si un alumno desea trabajar offline, puede descargar la misma imagen de Docker que usa la plataforma y tener exactamente el mismo entorno en su máquina (vía WSL2).
* **Nube Agnóstica:** Al estar todo contenido en Docker y orquestado por un binario de Rust, la plataforma puede migrarse de AWS a Azure o a un servidor propio en Ushuaia en cuestión de minutos.

## Conclusión
La combinación de **Linux + Docker + Rust Backend** transforma la plataforma de un simple editor de texto a un **Laboratorio de Ingeniería de Sistemas**. Provee al alumno las herramientas profesionales desde el primer día, eliminando las barreras de configuración inicial y enfocando el 100% de su energía cognitiva en el código y la arquitectura de sistemas.