# Academic Brain - Modelo de Dominio (Enfoque de Aprendizaje Autónomo)

## 1. Filosofía del Modelo
Este modelo de dominio está diseñado para entornos de **aprendizaje autónomo y asincrónico** (universidades a distancia, bootcamps, ingenieros autodidactas). Resuelve el problema fundamental del estudiante independiente: la gestión de entregables a largo plazo que causan procrastinación y posterior *burnout*.

**Principios de diseño:**
* **El tiempo es el recurso crítico:** A diferencia del modelo presencial (basado en horarios fijos), aquí el sistema gestiona los "espacios en blanco" alrededor de la vida laboral y personal del usuario.
* **Deuda técnica académica:** Las tareas no son de un día para otro. Son "Macro-Entregables" o proyectos que duran semanas. Si no se fragmentan, generan picos de estrés irreversibles al final del ciclo.
* **Planificación Predictiva:** El sistema no espera a que el usuario decida cuándo estudiar; el motor calcula el esfuerzo requerido, la fecha de cierre y la disponibilidad, generando una ruta de ejecución progresiva.

---

## 2. Entidades Principales

### 2.1. User (Capacidad y Límites)
Define las reglas de juego y los límites para evitar el *burnout*.
* **Campos Clave:**
  * `id`, `email`, `telegram_id`
  * `weekly_capacity_hours`: (Ej: 15 horas). Cuota de tiempo real que el usuario puede dedicar a la semana.
  * `max_daily_hours`: Límite máximo diario para prevenir la saturación.
  * `default_study_block_minutes`: (Ej: 60 mins). Preferencia de duración para la fragmentación de tareas (tipo Pomodoro).

### 2.2. Course (El Contenedor de Carga)
Representa el área de estudio, materia, certificación o proyecto macro.
* **Campos Clave:**
  * `id`, `name`, `active` (Booleano).
  * `complexity_multiplier`: (Ej: 1.0 a 2.0). Un factor que permite al sistema saber si esta materia requiere más esfuerzo relativo que las demás.

### 2.3. MacroActivity (El Entregable / Hito Principal)
Representa los grandes hitos evaluativos. En el aprendizaje autónomo, estos eventos abarcan semanas de trabajo (ej. Fases de proyectos, preparación para exámenes finales, investigaciones).
* **Campos Clave:**
  * `id`, `course_id`, `title`.
  * `type`: Enum (`PROJECT`, `RESEARCH`, `EXAM`, `PRACTICAL_LAB`).
  * `impact_weight`: (Ej: Porcentaje o puntos). Define qué tan crítica es la tarea para priorizarla sobre otras en caso de colisión de tiempos.
  * `open_date`: Cuándo está disponible el material o las instrucciones.
  * `deadline`: Fecha límite inamovible o fecha del examen.

### 2.4. Event (Bloqueos de Tiempo y Sincronía)
Registra la vida del usuario (trabajo, personal) y los raros momentos de sincronía obligatoria (mentorías, webinars en vivo).
* **Campos Clave:**
  * `id`, `title`, `start_time`, `end_time`.
  * `is_blocking`: Booleano (Si es `true`, el motor no puede agendar estudio aquí).
  * `event_type`: Enum (`SYNC_CLASS`, `MENTORING`, `WORK`, `PERSONAL`).

### 2.5. ExecutionBlock / MicroTask (La Ruta de Acción)
**El núcleo de Academic Brain.** Es la salida del motor de planificación determinista. Despedaza una `MacroActivity` de 3 semanas en pasos ejecutables de 1 hora.
* **Campos Clave:**
  * `id`, `macro_activity_id`.
  * `title`: (Ej: "Leer documentación técnica", "Escribir borrador", "Revisión final de código/texto").
  * `scheduled_start`, `scheduled_end`: El bloque de tiempo sugerido por el sistema.
  * `status`: Enum (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `SKIPPED`).
  * `actual_duration_minutes`: Para retroalimentar el sistema y ajustar futuras estimaciones de esfuerzo.
* **Propósito:** Garantizar progreso constante. Si el usuario hace sus *ExecutionBlocks* diarios, la *MacroActivity* se completa días antes del *deadline* sin requerir trasnochos ni esfuerzo excesivo de última hora.