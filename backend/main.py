from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json, os, uuid
from typing import Optional

app = FastAPI(title="TaskCampus API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = os.path.join(os.path.dirname(__file__), "tasks.json")


def read_tasks():
    if not os.path.exists(DB_FILE):
        return []
    with open(DB_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def write_tasks(tasks):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(tasks, f, indent=2, ensure_ascii=False)


class Task(BaseModel):
    titulo: str
    descripcion: Optional[str] = ""
    asignatura: str
    fecha: Optional[str] = ""
    prioridad: str = "media"
    estado: str = "pendiente"


@app.get("/")
def root():
    return {"message": "TaskCampus API corriendo", "docs": "/docs"}


@app.get("/tasks")
def list_tasks(
    estado: Optional[str] = None,
    prioridad: Optional[str] = None,
    asignatura: Optional[str] = None,
):
    tasks = read_tasks()
    if estado:
        tasks = [t for t in tasks if t["estado"] == estado]
    if prioridad:
        tasks = [t for t in tasks if t["prioridad"] == prioridad]
    if asignatura:
        tasks = [t for t in tasks if t["asignatura"] == asignatura]
    return tasks


@app.get("/tasks/summary")
def summary():
    tasks = read_tasks()
    return {
        "total": len(tasks),
        "pendientes": sum(1 for t in tasks if t["estado"] == "pendiente"),
        "en_proceso": sum(1 for t in tasks if t["estado"] == "en proceso"),
        "finalizadas": sum(1 for t in tasks if t["estado"] == "finalizada"),
        "alta_prioridad": sum(1 for t in tasks if t["prioridad"] == "alta"),
    }


@app.get("/tasks/{task_id}")
def get_task(task_id: str):
    task = next((t for t in read_tasks() if t["id"] == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    return task


@app.post("/tasks", status_code=201)
def create_task(task: Task):
    tasks = read_tasks()
    new_task = {"id": str(uuid.uuid4()), **task.dict()}
    tasks.append(new_task)
    write_tasks(tasks)
    return new_task


@app.put("/tasks/{task_id}")
def update_task(task_id: str, task: Task):
    tasks = read_tasks()
    for i, t in enumerate(tasks):
        if t["id"] == task_id:
            tasks[i] = {"id": task_id, **task.dict()}
            write_tasks(tasks)
            return tasks[i]
    raise HTTPException(status_code=404, detail="Tarea no encontrada")


@app.delete("/tasks/{task_id}")
def delete_task(task_id: str):
    tasks = read_tasks()
    new_tasks = [t for t in tasks if t["id"] != task_id]
    if len(new_tasks) == len(tasks):
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    write_tasks(new_tasks)
    return {"ok": True, "message": "Tarea eliminada"}
