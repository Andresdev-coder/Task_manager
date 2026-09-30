import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { API_URL } from './api';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function doLogin() {
    service.login({ email: 'ana@test.com', password: '123456' }).subscribe();
    http
      .expectOne(`${API_URL}/auth/login`)
      .flush({ id: '1', name: 'Ana', email: 'ana@test.com', token: 'abc123' });
  }

  it('inicia sin sesión', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.token()).toBeNull();
  });

  it('login guarda la sesión, el token y el usuario', () => {
    doLogin();

    expect(service.isLoggedIn()).toBe(true);
    expect(service.token()).toBe('abc123');
    expect(service.user()?.name).toBe('Ana');
    expect(localStorage.getItem('task-manager-auth')).toContain('abc123');
  });

  it('logout limpia la sesión y el almacenamiento', () => {
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    doLogin();

    service.logout();

    expect(service.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('task-manager-auth')).toBeNull();
  });
});
