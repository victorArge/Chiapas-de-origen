# Chiapas de origen

Plataforma web que conecta a productores agrícolas de plátano con profesionales que ofrecen asesoría agronómica. Funciona como un directorio especializado y un medio para enviar solicitudes de asesoría (no incluye cursos ni videollamadas).

Especialidades incluidas desde la primera versión:

1. Establecimiento de la plantación.
2. Control de plagas y enfermedades.
3. Gestión del agua y riego.
4. Nutrición y fertilización.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite 8 (JavaScript) + React Router |
| Estilos | CSS adaptable (verde / blanco) |
| Backend | Node.js + Express 5 |
| API | REST |
| Base de datos | PostgreSQL |
| ORM | Prisma 7 (`prisma-client` + `@prisma/adapter-pg`) |
| Autenticación | JWT (`jsonwebtoken`) + `bcryptjs` |
| Validación | Zod |

## Estructura

```
Chiapas_de_origen/
├── backend/     API REST (Express + Prisma)
│   ├── prisma/  esquema, migraciones y seed
│   └── src/     app, rutas, middleware, validadores, lib
├── frontend/    SPA (React + Vite)
│   └── src/     componentes, páginas, contexto, servicios
└── PROJECT_CONTEXT.md.txt
```

## Requisitos

- Node.js 22 o superior
- PostgreSQL en ejecución (este proyecto se probó con PostgreSQL 15 en el puerto **5433**)
- npm

## Puesta en marcha

### 1. Backend

```bash
cd backend
npm install
```

Crea `backend/.env` a partir de `backend/.env.example` y coloca tus credenciales:

```env
PORT=4000
DATABASE_URL="postgresql://postgres:TU_CONTRASENA@localhost:5433/chiapas_de_origen?schema=public"
JWT_SECRET="un_valor_aleatorio_largo"
JWT_EXPIRES_IN="7d"
```

Genera un `JWT_SECRET` con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Crea la base de datos, aplica las migraciones y carga las especialidades:

```bash
npm run db:migrate
npm run db:seed
```

Inicia el servidor:

```bash
npm run dev      # con recarga automática (node --watch)
# o
npm start
```

La API queda en `http://localhost:4000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda en `http://localhost:5173`. Por defecto consume la API en `http://localhost:4000/api`; puedes cambiarla con `VITE_API_URL`.

## Scripts del backend

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor con recarga automática |
| `npm start` | Servidor en modo normal |
| `npm run db:generate` | Regenera el cliente de Prisma |
| `npm run db:migrate` | Crea/aplica migraciones |
| `npm run db:seed` | Inserta las 4 especialidades |
| `npm run db:studio` | Abre Prisma Studio |

## Endpoints de la API

Todas las rutas parten de `/api`.

### Autenticación

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/auth/register` | Público | Registro (`PRODUCER` o `ADVISOR`) |
| POST | `/auth/login` | Público | Inicio de sesión |
| GET | `/auth/me` | Autenticado | Usuario actual |

### Especialidades

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/advisory-types` | Público | Lista las especialidades |

### Asesores

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/advisors` | Público | Directorio con filtros `specialty`, `state`, `municipality`, `q` |
| GET | `/advisors/:id` | Público | Perfil de un asesor |
| GET | `/advisors/me` | Asesor | Perfil propio |
| POST | `/advisors` | Asesor | Crear perfil |
| PUT | `/advisors/me` | Asesor | Actualizar perfil y especialidades |

### Solicitudes de asesoría

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/requests` | Productor | Crear solicitud |
| GET | `/requests/me` | Autenticado | Productor: enviadas; Asesor: recibidas |
| PATCH | `/requests/:id/status` | Asesor dueño | `ACCEPTED`, `REJECTED` o `FINISHED` |

Las transiciones permitidas son `PENDING → ACCEPTED/REJECTED` y `ACCEPTED → FINISHED`.

## Modelo de datos

`User`, `AdvisorProfile`, `AdvisoryType`, `AdvisorSpecialty` (relación N:M asesor–especialidad) y `AdvisoryRequest`. Las contraseñas se almacenan con hash (`bcrypt`), nunca en texto plano.

## Estado del proyecto

- [x] Etapa 1 — Inspección y preparación
- [x] Etapa 2 — Interfaz y diseño visual
- [x] Etapa 3 — PostgreSQL + Prisma
- [x] Etapa 4 — Registro, inicio de sesión y permisos
- [x] Etapa 5 — Perfiles profesionales y especialidades
- [x] Etapa 6 — Búsqueda, filtros y solicitudes
- [x] Etapa 7 — Pruebas, correcciones y documentación

## Problemas conocidos

- **Advertencia de `pg`:** al realizar escrituras con varias relaciones incluidas, `@prisma/adapter-pg` emite `DeprecationWarning: Calling client.query() when the client is already executing a query`. Es un problema conocido y **no bloqueante** de la librería (issues de Prisma [#29646](https://github.com/prisma/prisma/issues/29646) y [#29407](https://github.com/prisma/prisma/issues/29407)); no afecta la funcionalidad.

## Seguridad

- No se versionan secretos: `.env`, `node_modules` y el cliente generado por Prisma están en `.gitignore`.
- Las entradas se validan con Zod y los permisos se comprueban en el backend (JWT + roles).
