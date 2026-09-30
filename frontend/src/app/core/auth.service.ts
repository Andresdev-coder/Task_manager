import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_URL } from './api';
import { AuthResponse, User } from './models';

const STORAGE_KEY = 'task-manager-auth';

/**
 * Servicio de autenticación.
 * - `providedIn: 'root'` => una única instancia compartida en toda la app (singleton).
 * - El estado vive en un `signal`: cualquier componente que lo lea se actualiza solo.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  // inject() es la forma moderna de pedir dependencias (en vez del constructor)
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // Estado privado y escribible; se inicializa con lo guardado en localStorage
  private readonly session = signal<AuthResponse | null>(this.readStorage());

  // Estado público de solo lectura, derivado con computed()
  readonly token = computed(() => this.session()?.token ?? null);
  readonly isLoggedIn = computed(() => this.session() !== null);
  readonly user = computed<User | null>(() => {
    const s = this.session();
    return s ? { id: s.id, name: s.name, email: s.email } : null;
  });

  login(credentials: { email: string; password: string }) {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/login`, credentials)
      .pipe(tap((res) => this.saveSession(res)));
  }

  register(data: { name: string; email: string; password: string }) {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/register`, data)
      .pipe(tap((res) => this.saveSession(res)));
  }

  logout() {
    localStorage.removeItem(STORAGE_KEY);
    this.session.set(null);
    this.router.navigate(['/login']);
  }

  private saveSession(res: AuthResponse) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
    this.session.set(res);
  }

  private readStorage(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthResponse) : null;
    } catch {
      return null;
    }
  }
}
