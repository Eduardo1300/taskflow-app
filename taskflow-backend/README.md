# TaskFlow Backend - NestJS API

Backend REST API para TaskFlow construido con NestJS, TypeORM y PostgreSQL.

## Características

- ✅ Autenticación JWT
- ✅ CRUD de tareas, categorías, metas
- ✅ Sistema de colaboraciones
- ✅ Notificaciones
- ✅ Integraciones
- ✅ Webhooks

## Instalación

```bash
npm install
```

## Configuración

Crear archivo `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskflow
JWT_SECRET=tu-secreto-aqui
PORT=3000
```

## Base de Datos

```bash
# Crear base de datos
psql -U postgres -c "CREATE DATABASE taskflow;"

# Ejecutar schema
psql -U postgres -d taskflow -f src/database/schema.sql
```

## Desarrollo

```bash
npm run start:dev
```

El servidor corre en `http://localhost:3000`

## Producción

```bash
npm run build
npm run start:prod
```

## Docker

```bash
docker build -t taskflow-backend .
docker run -p 3000:3000 taskflow-backend
```

## Estructura

```
src/
├── auth/           # Módulo de autenticación
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   └── jwt.strategy.ts
├── tasks/          # Módulo de tareas
├── profiles/       # Perfiles
├── categories/     # Categorías
├── goals/         # Metas
├── collaborations/# Colaboraciones
├── notifications/ # Notificaciones
├── integrations/   # Integraciones
└── webhooks/     # Webhooks
```

## API

Prefix: `/api`

### Auth
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión
- `GET /auth/me` - Obtener perfil

### Tasks
- `GET /tasks` - Listar tareas
- `POST /tasks` - Crear tarea
- `PUT /tasks/:id` - Actualizar tarea
- `DELETE /tasks/:id` - Eliminar tarea
- `PUT /tasks/:id/toggle` - Alternar completado

### Categories
- `GET /categories` - Listar categorías
- `POST /categories` - Crear categoría
- `DELETE /categories/:id` - Eliminar categoría

### Goals
- `GET /goals` - Listar metas
- `POST /goals` - Crear meta
- `PUT /goals/:id` - Actualizar meta
- `DELETE /goals/:id` - Eliminar meta

## Licencia

MIT
