export type Prioridad = 'baja' | 'media' | 'alta';
export type Estado = 'pendiente' | 'en proceso' | 'finalizada';

export interface Task {
  id: string;
  titulo: string;
  descripcion: string;
  asignatura: string;
  fecha: string;
  prioridad: Prioridad;
  estado: Estado;
}

export interface Summary {
  total: number;
  pendientes: number;
  en_proceso: number;
  finalizadas: number;
  alta_prioridad: number;
}

export interface TaskFilters {
  estado?: string;
  prioridad?: string;
  asignatura?: string;
}
