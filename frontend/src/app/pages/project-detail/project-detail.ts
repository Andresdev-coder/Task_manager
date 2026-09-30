import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  PRIORITY_OPTIONS,
  Project,
  STATUS_OPTIONS,
  Task,
  TaskInput,
  TaskPriority,
  TaskStatus,
} from '../../core/models';
import { ProjectService } from '../../core/project.service';
import { TaskService } from '../../core/task.service';

@Component({
  selector: 'app-project-detail',
  imports: [ReactiveFormsModule, FormsModule, RouterLink, DatePipe],
  templateUrl: './project-detail.html',
})
export class ProjectDetail implements OnInit {
  // Gracias a withComponentInputBinding(), el :id de la URL llega como input
  readonly id = input.required<string>();

  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly taskService = inject(TaskService);

  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly priorityOptions = PRIORITY_OPTIONS;

  // ---- Estado (signals) ----
  protected readonly project = signal<Project | null>(null);
  protected readonly tasks = signal<Task[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly editingId = signal<string | null>(null);

  // Filtros
  protected readonly search = signal('');
  protected readonly statusFilter = signal<TaskStatus | ''>('');
  protected readonly priorityFilter = signal<TaskPriority | ''>('');

  // ---- Estado derivado (computed): se recalcula solo cuando cambian sus signals ----
  protected readonly filteredTasks = computed(() => {
    const query = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    const priority = this.priorityFilter();

    return this.tasks().filter(
      (t) =>
        (!status || t.status === status) &&
        (!priority || t.priority === priority) &&
        (!query || t.title.toLowerCase().includes(query)),
    );
  });

  protected readonly stats = computed(() => {
    const list = this.tasks();
    const total = list.length;
    const completed = list.filter((t) => t.status === 'completada').length;
    return {
      total,
      pending: list.filter((t) => t.status === 'pendiente').length,
      inProgress: list.filter((t) => t.status === 'en_progreso').length,
      completed,
      percent: total ? Math.round((completed / total) * 100) : 0,
    };
  });

  // ---- Formulario reactivo (crear y editar comparten el mismo formulario) ----
  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    status: ['pendiente' as TaskStatus],
    priority: ['media' as TaskPriority],
    dueDate: [''],
  });

  // Clases de Tailwind para las etiquetas de color
  protected readonly priorityClass: Record<TaskPriority, string> = {
    baja: 'bg-slate-100 text-slate-700',
    media: 'bg-amber-100 text-amber-800',
    alta: 'bg-red-100 text-red-700',
  };

  ngOnInit() {
    // forkJoin espera a que ambas peticiones terminen y entrega los dos resultados juntos
    forkJoin({
      project: this.projectService.getById(this.id()),
      tasks: this.taskService.getByProject(this.id()),
    }).subscribe({
      next: ({ project, tasks }) => {
        this.project.set(project);
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? 'No se pudo cargar el proyecto');
        this.loading.set(false);
      },
    });
  }

  protected save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    // El <input type="date"> devuelve '' si está vacío; el backend espera null
    const payload: TaskInput = { ...raw, dueDate: raw.dueDate || null };
    const editing = this.editingId();

    this.saving.set(true);
    this.error.set(null);

    const request$ = editing
      ? this.taskService.update(this.id(), editing, payload)
      : this.taskService.create(this.id(), payload);

    request$.subscribe({
      next: (task) => {
        this.tasks.update((list) =>
          editing ? list.map((t) => (t._id === task._id ? task : t)) : [task, ...list],
        );
        this.resetForm();
        this.saving.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? 'No se pudo guardar la tarea');
        this.saving.set(false);
      },
    });
  }

  protected startEdit(task: Task) {
    this.editingId.set(task._id);
    this.form.patchValue({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      // El backend devuelve una fecha ISO; el input date necesita solo YYYY-MM-DD
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected resetForm() {
    this.editingId.set(null);
    this.form.reset({
      title: '',
      description: '',
      status: 'pendiente',
      priority: 'media',
      dueDate: '',
    });
  }

  protected changeStatus(task: Task, event: Event) {
    const status = (event.target as HTMLSelectElement).value as TaskStatus;

    this.taskService.update(this.id(), task._id, { status }).subscribe({
      next: (updated) =>
        this.tasks.update((list) => list.map((t) => (t._id === updated._id ? updated : t))),
      error: (err: HttpErrorResponse) =>
        this.error.set(err.error?.message ?? 'No se pudo cambiar el estado'),
    });
  }

  protected remove(task: Task) {
    if (!confirm(`¿Eliminar la tarea "${task.title}"?`)) return;

    this.taskService.delete(this.id(), task._id).subscribe({
      next: () => this.tasks.update((list) => list.filter((t) => t._id !== task._id)),
      error: (err: HttpErrorResponse) =>
        this.error.set(err.error?.message ?? 'No se pudo eliminar la tarea'),
    });
  }

  protected isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'completada') return false;
    // 'en-CA' formatea como YYYY-MM-DD en la zona horaria local
    const today = new Date().toLocaleDateString('en-CA');
    return task.dueDate.slice(0, 10) < today;
  }

  protected statusLabel(status: TaskStatus): string {
    return this.statusOptions.find((o) => o.value === status)?.label ?? status;
  }
}
