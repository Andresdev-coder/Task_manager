# Task Manager - Frontend (Angular 22)

Interfaz del gestor de tareas. Consume la API del backend (`task-manager-backend`).

## Requisitos

- **Node.js 22.22.3 o superior** (o 24.15+ / 26+). Angular CLI 22 no arranca con versiones anteriores.
- El backend corriendo en `http://localhost:4000` (ver su README).

## Instalar y ejecutar

```bash
npm install
npm start          # equivale a: ng serve
```

Abre `http://localhost:4200`. El backend ya permite ese origen por CORS.

Otros comandos:

```bash
npm test           # pruebas unitarias (Vitest)
npm run build      # build de producción en dist/
```

## Qué incluye

- Registro / login con JWT (guardado en `localStorage`)
- Rutas protegidas con guards y carga perezosa (lazy loading)
- Interceptor HTTP que agrega el token y cierra sesión si expira (401)
- CRUD de proyectos
- CRUD de tareas dentro de un proyecto, con estado, prioridad y fecha límite
- Dashboard con contadores y barra de progreso
- Filtros por estado, prioridad y búsqueda por título
- Formularios reactivos con validaciones
- Tailwind CSS v4 para los estilos

## Estructura

```
src/app/
├── app.ts / app.html        # componente raíz (barra superior + <router-outlet>)
├── app.config.ts            # providers globales: router, HttpClient, interceptor
├── app.routes.ts            # rutas, guards y lazy loading
├── core/
│   ├── models.ts            # interfaces TypeScript (User, Project, Task...)
│   ├── auth.service.ts      # sesión con signals
│   ├── auth.interceptor.ts  # interceptor funcional
│   ├── auth.guard.ts        # authGuard y guestGuard
│   ├── project.service.ts   # llamadas HTTP de proyectos
│   └── task.service.ts      # llamadas HTTP de tareas
└── pages/
    ├── login/  register/  projects/  project-detail/
    └── cada una: <nombre>.ts (lógica) + <nombre>.html (plantilla)
```

> Nota: desde Angular 20 el CLI ya no agrega el sufijo `.component` a los archivos
> (`login.ts` en vez de `login.component.ts`). En `core/` conservé los sufijos
> `.service`, `.guard`, `.interceptor` a propósito, para que se note el rol de cada archivo.

## Angular para quien viene de React

| React | Angular (este proyecto) |
|---|---|
| `.tsx` (HTML dentro de TS) | `.ts` (lógica) + `.html` (plantilla) separados |
| `useState` | `signal()` → se lee con `count()` y se escribe con `.set()` / `.update()` |
| `useMemo` / valores derivados | `computed()` (ver `stats` y `filteredTasks` en `project-detail.ts`) |
| `useEffect(() => {...}, [])` | `ngOnInit()` |
| Props | `input()` / `input.required()` |
| `{cond && <X/>}` | `@if (cond) { ... }` |
| `items.map(...)` con `key` | `@for (item of items; track item.id) { ... }` |
| Context / Zustand | Servicios con `@Injectable({ providedIn: 'root' })` + `inject()` |
| React Router | `provideRouter(routes)`, `<router-outlet />`, `routerLink` |
| Axios interceptors | `HttpInterceptorFn` (ver `auth.interceptor.ts`) |
| React Hook Form / Formik | Reactive Forms (`FormBuilder`, `formControlName`) |
| `React.lazy` | `loadComponent: () => import(...)` en las rutas |

Diferencia clave de mentalidad: en Angular la inyección de dependencias es central.
Los servicios no se "importan y llaman"; se **piden** con `inject(MiServicio)` y Angular
entrega siempre la misma instancia.

## Ruta de estudio sugerida

Lee los archivos en este orden:

1. `models.ts` → `auth.service.ts` (signals + HttpClient)
2. `app.config.ts` + `app.routes.ts` (cómo se conecta todo)
3. `login.ts` + `login.html` (formularios reactivos)
4. `auth.interceptor.ts` + `auth.guard.ts`
5. `projects.ts` y por último `project-detail.ts` (el más completo)
6. Los `*.spec.ts` (cómo se prueban servicios, interceptores y componentes)

## Ideas para seguir practicando

- Agregar un servicio/ruta para asignar tareas a otros usuarios (`assignedTo` ya existe en el backend)
- Migrar los formularios a **Signal Forms** (estable desde Angular 22) y comparar
- Agregar paginación en el backend y en la lista de tareas
- Usar `httpResource` para reemplazar los `subscribe` de carga inicial
- Desplegar: backend en Render/Railway y frontend en Netlify/Vercel
