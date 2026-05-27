# Especificación del sistema TaskCampus

## Problema
Los estudiantes universitarios necesitan una herramienta sencilla para organizar sus tareas
académicas, controlar fechas de entrega y hacer seguimiento del estado de avance de cada actividad.

## Objetivo
Desarrollar una aplicación web para registrar, consultar, actualizar y eliminar tareas académicas,
con filtros por estado, prioridad y asignatura, y un resumen estadístico del avance.

## Usuarios
Estudiantes universitarios de nivel superior.

---

## Historias de usuario

- Como estudiante, quiero **registrar tareas** con título, descripción, asignatura, fecha y prioridad para organizar mis actividades.
- Como estudiante, quiero **listar todas mis tareas** para tener una vista general de mis pendientes.
- Como estudiante, quiero **filtrar tareas por estado** para identificar rápidamente las que tengo pendientes.
- Como estudiante, quiero **filtrar por prioridad** para atender primero las tareas más urgentes.
- Como estudiante, quiero **filtrar por asignatura** para organizar mi trabajo por materia.
- Como estudiante, quiero **editar una tarea** para actualizar su información si cambia.
- Como estudiante, quiero **eliminar una tarea** para mantener la lista limpia.
- Como estudiante, quiero **marcar tareas como finalizadas** para controlar mi avance.
- Como estudiante, quiero **ver un resumen estadístico** para saber cuántas tareas tengo pendientes, en proceso y finalizadas.

---

## Requisitos funcionales

| ID    | Descripción |
|-------|-------------|
| RF01  | El sistema debe permitir registrar una tarea con: título, descripción, asignatura, fecha de entrega, prioridad (baja/media/alta) y estado (pendiente/en proceso/finalizada). |
| RF02  | El sistema debe listar todas las tareas registradas. |
| RF03  | El sistema debe permitir filtrar tareas por estado, prioridad y asignatura. |
| RF04  | El sistema debe permitir editar cualquier campo de una tarea existente. |
| RF05  | El sistema debe permitir eliminar una tarea. |
| RF06  | El sistema debe mostrar un resumen con: total de tareas, pendientes, finalizadas y de alta prioridad. |

---

## Requisitos no funcionales

| ID    | Descripción |
|-------|-------------|
| RNF01 | La interfaz debe ser clara, responsiva y fácil de usar. |
| RNF02 | El backend debe exponer una API REST con los métodos GET, POST, PUT y DELETE. |
| RNF03 | El código debe estar versionado en GitHub usando ramas, commits y pull requests. |
| RNF04 | El proyecto debe incluir documentación de instalación en el README. |
| RNF05 | La persistencia se realiza en un archivo JSON en el servidor. |

---

## Endpoints de la API REST

| Método | Ruta              | Descripción              |
|--------|-------------------|--------------------------|
| GET    | /tasks            | Listar tareas (con filtros opcionales) |
| GET    | /tasks/{id}       | Consultar una tarea      |
| POST   | /tasks            | Crear una tarea          |
| PUT    | /tasks/{id}       | Actualizar una tarea     |
| DELETE | /tasks/{id}       | Eliminar una tarea       |
| GET    | /tasks/summary    | Mostrar resumen estadístico |

---

## Plan técnico de desarrollo

| Fase | Actividad |
|------|-----------|
| 1    | Crear repositorio en GitHub |
| 2    | Definir especificación funcional (este archivo) |
| 3    | Crear plan técnico de desarrollo |
| 4    | Dividir el trabajo en tareas (Issues en GitHub) |
| 5    | Implementar backend en Python con FastAPI |
| 6    | Implementar frontend en TypeScript + Tailwind |
| 7    | Probar funcionalidades end-to-end |
| 8    | Documentar instalación y uso en README |
| 9    | Publicar evidencias de commits y ramas en GitHub |

---

## Tecnologías utilizadas

- **Frontend:** TypeScript, HTML, Tailwind CSS
- **Backend:** Python, FastAPI, Uvicorn
- **Persistencia:** Archivo JSON (`tasks.json`)
- **Control de versiones:** Git + GitHub
