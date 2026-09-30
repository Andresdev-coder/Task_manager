import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    return {
      client: TestBed.inject(HttpClient),
      http: TestBed.inject(HttpTestingController),
    };
  }

  beforeEach(() => localStorage.clear());

  it('agrega el header Authorization cuando hay token', () => {
    localStorage.setItem(
      'task-manager-auth',
      JSON.stringify({ id: '1', name: 'Ana', email: 'ana@test.com', token: 'xyz' }),
    );
    const { client, http } = setup();

    client.get('/datos').subscribe();
    const req = http.expectOne('/datos');

    expect(req.request.headers.get('Authorization')).toBe('Bearer xyz');
    req.flush({});
  });

  it('no agrega el header cuando no hay sesión', () => {
    const { client, http } = setup();

    client.get('/datos').subscribe();
    const req = http.expectOne('/datos');

    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
