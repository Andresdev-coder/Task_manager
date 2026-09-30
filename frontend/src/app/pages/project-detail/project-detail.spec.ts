import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_URL } from '../../core/api';
import { Task } from '../../core/models';
import { ProjectDetail } from './project-detail';

const project = { _id: 'p1', name: 'Demo', description: '', createdAt: '2026-01-01T00:00:00Z' };

const makeTask = (id: string, title: string, status: Task['status'], priority: Task['priority']): Task => ({
  _id: id,
  title,
  description: '',
  status,
  priority,
  dueDate: null,
  project: 'p1',
  createdAt: '2026-01-01T00:00:00Z',
});

const tasks: Task[] = [
  makeTask('1', 'Diseñar logo', 'pendiente', 'alta'),
  makeTask('2', 'Escribir API', 'completada', 'media'),
  makeTask('3', 'Probar app', 'en_progreso', 'baja'),
  makeTask('4', 'Publicar', 'completada', 'alta'),
];

describe('ProjectDetail', () => {
  async function setup() {
    TestBed.configureTestingModule({
      imports: [ProjectDetail],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ProjectDetail);
    fixture.componentRef.setInput('id', 'p1');

    await fixture.whenStable(); // dispara ngOnInit -> peticiones HTTP
    http.expectOne(`${API_URL}/projects/p1`).flush(project);
    http.expectOne(`${API_URL}/projects/p1/tasks`).flush(tasks);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    return { fixture, http, el, component: fixture.componentInstance as any };
  }

  it('muestra las estadísticas calculadas (computed)', async () => {
    const { el } = await setup();
    expect(el.textContent).toContain('50%'); // 2 de 4 completadas
    expect(el.querySelectorAll('ul > li').length).toBe(4);
  });

  it('filtra por estado', async () => {
    const { fixture, el, component } = await setup();
    component.statusFilter.set('completada');
    await fixture.whenStable();
    expect(el.querySelectorAll('ul > li').length).toBe(2);
  });

  it('filtra por texto de búsqueda', async () => {
    const { fixture, el, component } = await setup();
    component.search.set('api');
    await fixture.whenStable();
    expect(el.querySelectorAll('ul > li').length).toBe(1);
    expect(el.textContent).toContain('Escribir API');
  });

  it('no permite guardar una tarea sin título', async () => {
    const { component, http } = await setup();
    component.save();
    http.expectNone(`${API_URL}/projects/p1/tasks`);
    expect(component.form.controls.title.touched).toBe(true);
  });
});
