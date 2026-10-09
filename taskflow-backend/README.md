# TaskFlow Backend - NestJS API

Backend REST API para TaskFlow construido con NestJS, TypeORM y PostgreSQL.

## Características

- ✅ Autenticación JWT
- ✅ CRUD de tareas, categorías, metas
- ✅ Métricas de productividad
- ✅ Insights IA

## Instalación

```bash
npm install
```

## Configuración

Crear archivo `.env` (basado en `.env.example`):

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskflow
JWT_SECRET=tu-secreto-aqui
PORT=3000
```

## Base de Datos

```bash
# Crear base de datos
psql -U postgres -c "CREATE DATABASE taskflow;"

# Ejecutar schema completo (21 tablas)
psql -U postgres -d taskflow -f taskflow-supabase.sql
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
├── auth/           # Módulo de autenticación JWT
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── jwt.strategy.ts
│   └── guards/
├── tasks/          # Módulo de tareas
│   ├── tasks.module.ts
│   ├── tasks.service.ts
│   ├── tasks.controller.ts
│   ├── task.entity.ts
│   └── dto/
├── profiles/       # Perfiles de usuario
├── categories/     # Categorías
├── goals/         # Metas/Objetivos
├── productivity/   # Métricas e Insights
├── health/        # Health checks
├── setup/         # Inicialización BD
├── common/        # Guards, pipes, decorators
├── app.module.ts  # Módulo raíz
└── main.ts        # Entry point + CORS
```

## API Endpoints

Prefix: `/api`

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener perfil
- `PUT /api/profiles/me` - Actualizar perfil

### Tareas
- `GET /api/tasks` - Listar tareas (con filtros)
- `POST /api/tasks` - Crear tarea
- `PUT /api/tasks/:id` - Actualizar tarea
- `DELETE /api/tasks/:id` - Eliminar tarea
- `PUT /api/tasks/:id/toggle` - Alternar completado
- `PUT /api/tasks/:id/favorite` - Alternar favorito
- `GET /api/tasks/stats` - Estadísticas
- `GET /api/tasks/search?q=` - Buscar tareas

### Categorías
- `GET /api/categories` - Listar categorías
- `POST /api/categories` - Crear categoría
- `DELETE /api/categories/:id` - Eliminar categoría

### Metas
- `GET /api/goals` - Listar metas
- `POST /api/goals` - Crear meta
- `PUT /api/goals/:id` - Actualizar meta
- `DELETE /api/goals/:id` - Eliminar meta

### Productividad
- `GET /api/productivity/metrics` - Métricas diarias
- `GET /api/productivity/insights` - Insights de productividad

## Base de Datos

Schema completo en `taskflow-supabase.sql` (21 tablas):

**Core (5)**: profiles, tasks, categories, goals, task_activity
**Productividad (2)**: productivity_metrics, productivity_insights

Incluye: índices optimizados, datos de ejemplo, constraints, checks, triggers para updated_at.

## Variables de Entorno

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskflow
JWT_SECRET=tu-secreto-super-seguro
PORT=3000
```

## Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo con hot reload
npm run start:dev

# Build producción
npm run build

# Producción
npm run start:prod

# Tests
npm run test
npm run test:e2e
npm run test:cov
```

## Docker

```bash
docker build -t taskflow-backend .
docker run -p 3000:3000 taskflow-backend
```

## Licencia

MIT
