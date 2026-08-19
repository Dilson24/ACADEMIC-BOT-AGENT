# Notion Data Dictionary

## Descripción del dataset

Este dataset forma parte del esquema de Notion diseñado para realizar un seguimiento detallado de las actividades del semestre. Corresponde a la base de datos principal que consolida el total de las actividades académicas y sus tiempos por cada materia. Todas las tareas aquí registradas deben cumplirse en su totalidad para asegurar un buen resultado durante el semestre.

## Documentación por columna

### Columna 1
* **Columna:** Realizada
* **Tipo:** Checkbox / Booleano
* **Ejemplo:** Checkbox (☑️) para marcar una tarea
* **Uso:** Al marcarse, la tarea cambia su estado a realizada.
* **Obligatoria:** Sí, ayuda a normalizar la base diferenciando lo que está pendiente.
* **Destino futuro:** `academic_tasks.completed`

### Columna 2
* **Columna:** Urgencia
* **Tipo:** Fórmula
* **Ejemplo:** Emojis dinámicos de estado visual (⚠️, ✔️, 🔴, 🟡, 🟢, ☠️)
* **Uso:** Evalúa automáticamente el nivel de prioridad y el estado de la tarea combinando la fecha de entrega, los días restantes, la materia y el estado de realización:
  * ⚠️: Falta ingresar la Fecha de Entrega o la Materia.
  * ✔️: La tarea fue marcada como Realizada.
  * 🔴: La entrega es hoy (0 días restantes).
  * 🟡: Entrega próxima (quedan entre 1 y 3 días).
  * 🟢: Sin riesgo (quedan más de 3 días).
  * ☠️: Tarea atrasada o vencida.
* **Obligatoria:** No (se calcula automáticamente).
* **Destino futuro:** `academic_tasks.urgency`

### Columna 3
* **Columna:** Actividad
* **Tipo:** Texto
* **Ejemplo:** Tarea 1 - Contextualización - Conocimientos previos
* **Uso:** Se usa para identificar el título o nombre de la actividad.
* **Obligatoria:** Sí
* **Destino futuro:** `academic_tasks.title`

### Columna 4
* **Columna:** Materia
* **Tipo:** Select / Lista
* **Ejemplo:** Física General ⚛, Cálculo Integral 🧮, Probabilidad 🎰, P. Servicio Social 🤝🏻, Gestión De TI 👨🏻‍💻
* **Uso:** Se usa para categorizar y filtrar por las materias del semestre previamente definidas.
* **Obligatoria:** Sí
* **Destino futuro:** `academic_tasks.subject`

### Columna 5
* **Columna:** Tipo
* **Tipo:** Select / Lista
* **Ejemplo:** Equipo, Estudiar, Examen, Exposición, Investigación, Práctica, Reporte
* **Uso:** Añade una categoría metodológica para dar un contexto rápido sobre la naturaleza de la tarea.
* **Obligatoria:** Sí
* **Destino futuro:** `academic_tasks.type`

### Columna 6
* **Columna:** Prioridad
* **Tipo:** Select / Lista
* **Ejemplo:** ❄️ Baja; ⚖️ Media; 🔥 ALTA
* **Uso:** Sirve para filtrar por prioridad.
* **Obligatoria:** Sí (aunque en el dataset inicial solo aparezca "🔥 ALTA" por el peso evaluativo de las tareas documentadas, las demás opciones deben existir).
* **Destino futuro:** `academic_tasks.priority`

### Columna 7
* **Columna:** Fecha Recibida
* **Tipo:** Fecha-Hora
* **Ejemplo:** 17 de agosto de 2026 0:00 (GMT-5)
* **Uso:** Se usa para cuantificar el inicio de una tarea desde su fecha real de asignación.
* **Obligatoria:** Sí, marca el inicio del periodo a calcular.
* **Destino futuro:** `academic_tasks.receipt_date`

### Columna 8
* **Columna:** Fecha de Entrega
* **Tipo:** Fecha-Hora
* **Ejemplo:** 30 de agosto de 2026 23:55 (GMT-5)
* **Uso:** Se usa para establecer el límite de una tarea y calcular tiempos de entrega.
* **Obligatoria:** Sí, marca el fin del periodo a calcular.
* **Destino futuro:** `academic_tasks.delivery_date`

### Columna 9
* **Columna:** Días Restantes
* **Tipo:** Fórmula
* **Ejemplo:** 11
* **Uso:** Calcula los días restantes usando de referencia la fecha de entrega frente a la fecha actual.
* **Obligatoria:** No (se calcula automáticamente basándose en las fechas).
* **Destino futuro:** `academic_tasks.days_remaining`

### Columna 10
* **Columna:** Tiempo Restante
* **Tipo:** Fórmula
* **Ejemplo:** 11 días 13 horas
* **Uso:** Calcula los días y las horas restantes de forma más granular.
* **Obligatoria:** No (se calcula automáticamente).
* **Destino futuro:** `academic_tasks.time_remaining`

### Columna 11
* **Columna:** Apoyo de
* **Tipo:** Personas
* **Ejemplo:** @Juan Pablo
* **Uso:** Sirve para identificar a un compañero de trabajo para la tarea.
* **Obligatoria:** No (está en el esquema actual, pero tras 4 ciclos no se ha utilizado).
* **Destino futuro:** `academic_tasks.colleague`

### Columna 12
* **Columna:** Documentos
* **Tipo:** Relación
* **Ejemplo:** (FG) Tarea 1 - Contextualización - Conocimientos previos
* **Uso:** Relaciona documentación de apoyo para la tarea.
* **Obligatoria:** No (la información proviene de otra base de datos destinada a referencias).
* **Destino futuro:** `academic_tasks.documents`

### Columna 13
* **Columna:** Micro Tareas
* **Tipo:** Relación
* **Ejemplo:** (FG) Tarea 1 - Contextualización - Conocimientos previos
* **Uso:** Relaciona microtareas o mini sprints asociados a la tarea principal.
* **Obligatoria:** No (la información proviene de otra base de datos de subtareas).
* **Destino futuro:** `academic_tasks.micro_tasks`

## Consideraciones Finales

Lo anterior representa un mapeo general de la base de datos principal, la cual será el corazón de este proyecto. Cabe destacar que la columna 11 no ha demostrado utilidad y debería ser eliminada del esquema en Notion. Las columnas 12 y 13 corresponden a una fase futura del proyecto (funcionalidades adicionales que se abordarán a medida que se consolide el desarrollo). De momento, para los primeros sprints, se trabajará exclusivamente con las bases consolidadas en este diccionario.