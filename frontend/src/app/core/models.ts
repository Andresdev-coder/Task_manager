// Tipos que reflejan lo que devuelve el backend.
// En Angular/TypeScript usamos interfaces para "describir la forma" de los datos.

export type TaskStatus = 'pendiente' | 'en_progreso' | 'completada';
export type TaskPriority = 'baja' | 'media' | 'alta';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse extends User {
  token: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  project: string;
  createdAt: string;
}

// Lo que enviamos al crear/editar una tarea
export interface TaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
}

// Opciones para los <select> del formulario y los filtros
export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'completada', label: 'Completada' },
];

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
];
