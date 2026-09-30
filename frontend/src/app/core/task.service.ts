import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from './api';
import { Task, TaskInput } from './models';

/** Las tareas viven anidadas: /api/projects/:projectId/tasks */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);

  private url(projectId: string) {
    return `${API_URL}/projects/${projectId}/tasks`;
  }

  getByProject(projectId: string) {
    return this.http.get<Task[]>(this.url(projectId));
  }

  create(projectId: string, data: TaskInput) {
    return this.http.post<Task>(this.url(projectId), data);
  }

  update(projectId: string, taskId: string, data: Partial<TaskInput>) {
    return this.http.put<Task>(`${this.url(projectId)}/${taskId}`, data);
  }

  delete(projectId: string, taskId: string) {
    return this.http.delete<{ message: string }>(`${this.url(projectId)}/${taskId}`);
  }
}
