# TaskCampus 🎓

Aplicación web para gestionar tareas académicas estudiantiles.  
Desarrollada con **Python (FastAPI)** en el backend y **TypeScript + Tailwind CSS** en el frontend.

---

## Descripción del proyecto

TaskCampus permite a los estudiantes registrar, consultar, actualizar y eliminar sus tareas académicas.
Incluye filtros por estado, prioridad y asignatura, además de un resumen estadístico del avance.

---

## Estructura del repositorio

```
taskcampus/
├── specs/
│   └── taskcampus-spec.md      ← Especificación funcional (SDD)
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── main.ts             ← Lógica principal (TypeScript)
│       ├── main.js             ← Versión compilada para el navegador
│       ├── api.ts              ← Consumo de la API REST
│       └── types.ts            ← Tipos TypeScript
├── backend/
│   ├── main.py                 ← API REST con FastAPI
│   ├── tasks.json              ← Base de datos en archivo JSON
│   └── requirements.txt        ← Dependencias Python
└── README.md
```

---

## Instalación y ejecución

### Requisitos previos
- Python 3.10 o superior
- Node.js 18 o superior (opcional, solo para compilar TypeScript)

---

### 1. Backend (Python + FastAPI)

```bash
# Entrar a la carpeta del backend
cd backend

# Instalar dependencias
pip install -r requirements.txt

# Iniciar el servidor
uvicorn main:app --reload --port 8000
```

El backend quedará disponible en: **http://localhost:8000**  
Documentación interactiva de la API: **http://localhost:8000/docs**

---

### 2. Frontend (TypeScript + Tailwind)

**Opción A – Abrir directamente (sin instalar nada):**

```bash
# Solo abrir el archivo en el navegador
cd frontend
# Doble clic en index.html   ← Así de simple
```

> ⚠️ Si el navegador bloquea módulos ES por CORS, usar la Opción B.

**Opción B – Servidor local simple:**

```bash
cd frontend
npm install
npm run dev
# Abre http://localhost:3000
```

---

## Endpoints disponibles

| Método | Ruta               | Descripción                          |
|--------|--------------------|--------------------------------------|
| GET    | `/tasks`           | Listar tareas (acepta filtros)       |
| GET    | `/tasks/{id}`      | Consultar una tarea por ID           |
| POST   | `/tasks`           | Crear una nueva tarea                |
| PUT    | `/tasks/{id}`      | Actualizar una tarea existente       |
| DELETE | `/tasks/{id}`      | Eliminar una tarea                   |
| GET    | `/tasks/summary`   | Resumen estadístico de tareas        |

### Filtros disponibles en GET /tasks

```
GET /tasks?estado=pendiente
GET /tasks?prioridad=alta
GET /tasks?asignatura=Matemáticas
GET /tasks?estado=pendiente&prioridad=alta
```

### Ejemplo de cuerpo para POST/PUT

```json
{
  "titulo": "Informe de laboratorio",
  "descripcion": "Resultados del experimento de química",
  "asignatura": "Química General",
  "fecha": "2026-06-10",
  "prioridad": "alta",
  "estado": "pendiente"
}
```

---

## Funcionalidades

- ✅ Registrar tarea con título, descripción, asignatura, fecha, prioridad y estado
- ✅ Listar todas las tareas
- ✅ Filtrar por estado, prioridad y asignatura
- ✅ Editar tarea existente
- ✅ Eliminar tarea
- ✅ Marcar tarea como finalizada / reactivar
- ✅ Resumen estadístico (total, pendientes, finalizadas, alta prioridad)

---

## Integrantes del grupo

| Nombre |      Rol         |
|--------|------------------|
| Jerson |desarrollador     |

---

## Evidencia GitHub

- Ramas utilizadas: `main`, `feature/backend`, `feature/frontend`
- Pull Requests realizados para integrar cada feature a `main`
- Commits descriptivos por cada avance del proyecto
