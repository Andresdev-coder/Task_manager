# Task Manager - Backend

API REST para un gestor de tareas por proyectos, con autenticación JWT.

## Stack

- Node.js (ES Modules, `import`/`export` — nada de `require`)
- Express 4
- MongoDB + Mongoose 8
- JWT (`jsonwebtoken`) + `bcryptjs` para hash de contraseñas
- `node --watch` en vez de nodemon (disponible desde Node 18+)

## Requisitos previos

- Node.js 18 o superior
- MongoDB corriendo localmente (o una URI de MongoDB Atlas)

## Instalación

```bash
cd task-manager-backend
npm install
cp .env.example .env
```

Edita el archivo `.env` y ajusta `MONGODB_URI` y `JWT_SECRET` (usa algo largo y aleatorio en `JWT_SECRET`, nunca el valor de ejemplo).

## Ejecutar

```bash
npm run dev
```

El servidor queda en `http://localhost:4000`.

## Estructura del proyecto

```
src/
├── config/db.js              # conexión a MongoDB
├── models/                   # esquemas de Mongoose (User, Project, Task)
├── middlewares/
│   ├── auth.js                # verifica el JWT (protect)
│   └── errorHandler.js        # manejo centralizado de errores
├── controllers/               # lógica de negocio
├── routes/                    # definición de endpoints
└── server.js                  # punto de entrada
```

## Modelo de datos

- **User** → tiene muchos **Project**
- **Project** → tiene muchas **Task**
- **Task** → puede estar asignada a un **User** (`assignedTo`)

## Endpoints

### Auth (`/api/auth`)

| Método | Ruta | Body | Descripción |
|---|---|---|---|
| POST | `/register` | `{ name, email, password }` | Crea un usuario y devuelve token |
| POST | `/login` | `{ email, password }` | Devuelve token si las credenciales son correctas |
| GET | `/profile` | — (requiere `Authorization: Bearer <token>`) | Devuelve el usuario autenticado |

### Proyectos (`/api/projects`) — todos requieren token

| Método | Ruta | Body | Descripción |
|---|---|---|---|
| GET | `/` | — | Lista los proyectos del usuario |
| POST | `/` | `{ name, description }` | Crea un proyecto |
| GET | `/:id` | — | Obtiene un proyecto |
| PUT | `/:id` | `{ name, description }` | Actualiza un proyecto |
| DELETE | `/:id` | — | Elimina un proyecto |

### Tareas (`/api/projects/:projectId/tasks`) — todos requieren token

| Método | Ruta | Body | Descripción |
|---|---|---|---|
| GET | `/` | — (query opcional `?status=` `?priority=`) | Lista tareas del proyecto |
| POST | `/` | `{ title, description, status, priority, dueDate, assignedTo }` | Crea una tarea |
| PUT | `/:taskId` | campos a actualizar | Actualiza una tarea |
| DELETE | `/:taskId` | — | Elimina una tarea |

`status` acepta: `pendiente`, `en_progreso`, `completada`
`priority` acepta: `baja`, `media`, `alta`

## Probar con curl

```bash
# Registro
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana","email":"ana@test.com","password":"123456"}'

# Login (guarda el token que devuelve)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@test.com","password":"123456"}'

# Crear proyecto (reemplaza TU_TOKEN)
curl -X POST http://localhost:4000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{"name":"Proyecto Web","description":"Mi primer proyecto"}'
```

## Notas sobre buenas prácticas aplicadas

- Separación en capas: rutas → controladores → modelos
- Nunca se guarda la contraseña en texto plano (hash con bcrypt)
- Las contraseñas nunca se devuelven en las respuestas (`.select('-password')`)
- Cada proyecto y tarea valida que pertenezca al usuario autenticado antes de mostrar/editar/borrar (evita que un usuario vea datos de otro)
- Middleware centralizado de errores en vez de repetir try/catch con lógica de respuesta en cada controlador
