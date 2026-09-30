import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Project } from '../../core/models';
import { ProjectService } from '../../core/project.service';

@Component({
  selector: 'app-projects',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './projects.html',
})
export class Projects implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);

  protected readonly projects = signal<Project[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
  });

  // ngOnInit se ejecuta una vez, cuando el componente ya está listo
  ngOnInit() {
    this.projectService.getAll().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? 'No se pudieron cargar los proyectos');
        this.loading.set(false);
      },
    });
  }

  protected create() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.projectService.create(this.form.getRawValue()).subscribe({
      next: (project) => {
        // update() recibe el valor actual y devuelve el nuevo (nunca mutamos el array)
        this.projects.update((list) => [project, ...list]);
        this.form.reset();
        this.saving.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? 'No se pudo crear el proyecto');
        this.saving.set(false);
      },
    });
  }

  protected remove(project: Project) {
    if (!confirm(`¿Eliminar el proyecto "${project.name}"?`)) return;

    this.projectService.delete(project._id).subscribe({
      next: () => this.projects.update((list) => list.filter((p) => p._id !== project._id)),
      error: (err: HttpErrorResponse) =>
        this.error.set(err.error?.message ?? 'No se pudo eliminar el proyecto'),
    });
  }
}
