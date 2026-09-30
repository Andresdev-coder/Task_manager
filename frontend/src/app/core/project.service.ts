import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from './api';
import { Project } from './models';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/projects`;

  getAll() {
    return this.http.get<Project[]>(this.url);
  }

  getById(id: string) {
    return this.http.get<Project>(`${this.url}/${id}`);
  }

  create(data: { name: string; description: string }) {
    return this.http.post<Project>(this.url, data);
  }

  delete(id: string) {
    return this.http.delete<{ message: string }>(`${this.url}/${id}`);
  }
}
