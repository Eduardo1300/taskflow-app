# TaskFlow - Gestión de Tareas

Aplicación completa de gestión de tareas con backend NestJS + PostgreSQL y frontend React.

## Arquitectura

```
taskflow/
├── taskflow-backend/     # Backend NestJS + TypeORM + PostgreSQL
├── taskflow-app-main/    # Frontend React + TypeScript + Vite
└── docker-compose.yml    # Orquestación Docker
```

## Tecnologías

### Backend
- **NestJS** - Framework Node.js
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **Passport** - Estrategia de autenticación

### Frontend
- **React 18** - UI Framework
- **TypeScript** - Lenguaje tipado
- **Vite** - Build tool
- **TailwindCSS** - Estilos
- **Axios** - Cliente HTTP
- **React Router** - Enrutamiento

## Requisitos Previos

- Node.js 18+
- PostgreSQL 14+
- Docker (opcional)

## Instalación Local

### 1. Base de Datos

```bash
# Crear base de datos
psql -U postgres -c "CREATE DATABASE taskflow;"

# Ejecutar schema
psql -U postgres -d taskflow -f taskflow-backend/src/database/schema.sql
```

### 2. Backend

```bash
cd taskflow-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
# Editar .env con tus valores

# Iniciar en desarrollo
npm run start:dev
```

El backend corre en `http://localhost:3000`

### 3. Frontend

```bash
cd taskflow-app-main

# Instalar dependencias
npm install

# Iniciar en desarrollo
npm run dev
```

El frontend corre en `http://localhost:5173`

## Docker

```bash
# Construir y ejecutar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

## Variables de Entorno

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskflow
JWT_SECRET=tu-secreto-aqui
PORT=3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener perfil

### Tareas
- `GET /api/tasks` - Listar tareas
- `POST /api/tasks` - Crear tarea
- `PUT /api/tasks/:id` - Actualizar tarea
- `DELETE /api/tasks/:id` - Eliminar tarea
- `GET /api/tasks/stats` - Estadísticas

### Categorías
- `GET /api/categories` - Listar categorías
- `POST /api/categories` - Crear categoría
- `DELETE /api/categories/:id` - Eliminar categoría

### Metas
- `GET /api/goals` - Listar metas
- `POST /api/goals` - Crear meta
- `PUT /api/goals/:id` - Actualizar meta
- `DELETE /api/goals/:id` - Eliminar meta

### Colaboraciones
- `POST /api/collaborations/invite` - Invitar colaborador
- `GET /api/collaborations/task/:id/collaborators` - Obtener colaboradores

### Notificaciones
- `GET /api/notifications` - Listar notificaciones
- `PUT /api/notifications/:id/read` - Marcar como leída

## Tests

```bash
# Frontend
cd taskflow-app-main
npm run test:run
```

## Estructura del Proyecto

### Backend
```
src/
├── auth/           # Módulo de autenticación
├── tasks/          # CRUD de tareas
├── profiles/       # Perfiles de usuario
├── categories/     # Categorías
├── goals/          # Metas
├── collaborations/ # Colaboraciones
├── notifications/  # Notificaciones
├── integrations/   # Integraciones
└── webhooks/       # Webhooks
```

### Frontend
```
src/
├── components/      # Componentes React
├── contexts/       # Contextos de React
├── hooks/          # Custom hooks
├── pages/          # Páginas
├── services/       # Servicios API
├── types/         # Tipos TypeScript
└── lib/           # Utilidades
```

## Funcionalidades

- ✅ Gestión de tareas (CRUD)
- ✅ Categorías y etiquetas
- ✅ Metas y objetivos
- ✅ Sistema de prioridades
- ✅ Fechas de vencimiento
- ✅ Colaboración en tareas
- ✅ Notificaciones
- ✅ Integraciones (Google Calendar, Slack, Discord)
- ✅ Modo oscuro
- ✅ Diseño responsive

## Licencia

MIT
