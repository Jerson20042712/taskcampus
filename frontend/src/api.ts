import { Task, TaskFilters, Summary } from './types';

const BASE_URL = 'http://localhost:8000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  getTasks: (filters: TaskFilters = {}): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (filters.estado)     params.set('estado', filters.estado);
    if (filters.prioridad)  params.set('prioridad', filters.prioridad);
    if (filters.asignatura) params.set('asignatura', filters.asignatura);
    const qs = params.toString();
    return request<Task[]>(`/tasks${qs ? '?' + qs : ''}`);
  },

  getTask: (id: string): Promise<Task> =>
    request<Task>(`/tasks/${id}`),

  createTask: (task: Omit<Task, 'id'>): Promise<Task> =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify(task) }),

  updateTask: (id: string, task: Omit<Task, 'id'>): Promise<Task> =>
    request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) }),

  deleteTask: (id: string): Promise<{ ok: boolean }> =>
    request<{ ok: boolean }>(`/tasks/${id}`, { method: 'DELETE' }),

  getSummary: (): Promise<Summary> =>
    request<Summary>('/tasks/summary'),
};
