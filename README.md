# TaskFlow - Gestión de Tareas

Aplicación completa de gestión de tareas con backend **NestJS + PostgreSQL** y frontend **Vue 3 + TypeScript + Vite**.

## Arquitectura

```
taskflow-app/
├── taskflow-backend/      # Backend NestJS + TypeORM + PostgreSQL
├── taskflow-app-vue/      # Frontend Vue 3 + TypeScript + Vite
├── docker-compose.yml     # Orquestación Docker
├── .env.example           # Template de variables de entorno
└── README.md
```

## Tecnologías

### Backend
- **NestJS** - Framework Node.js modular
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos
- **JWT + Passport** - Autenticación

### Frontend
- **Vue 3** - UI Framework con Composition API
- **TypeScript** - Lenguaje tipado
- **Vite** - Build tool
- **TailwindCSS** - Estilos
- **Pinia** - State management
- **Vue Router** - Enrutamiento
- **Recharts** - Gráficos
- **Lucide Vue** - Iconos

## Requisitos Previos

- Node.js 18+
- PostgreSQL 14+
- Docker (opcional)

## Instalación Local

### 1. Base de Datos

```bash
# Crear base de datos local
psql -U postgres -c "CREATE DATABASE taskflow;"

# Ejecutar schema completo (21 tablas)
psql -U postgres -d taskflow -f taskflow-backend/taskflow-supabase.sql
```

### 2. Backend

```bash
cd taskflow-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp ../.env.example .env
# Editar .env con tus valores

# Iniciar en desarrollo
npm run start:dev
```

El backend corre en `http://localhost:3000`

### 3. Frontend Vue

```bash
cd taskflow-app-vue

# Instalar dependencias
npm install

# Configurar variables de entorno
cp ../.env.example .env

# Iniciar en desarrollo
npm run dev
```

El frontend Vue corre en `http://localhost:5173`

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

Ver `.env.example` para la plantilla completa.

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
- `PUT /api/profiles/me` - Actualizar perfil

### Tareas
- `GET /api/tasks` - Listar tareas
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

### Notificaciones
- `GET /api/notifications` - Listar notificaciones
- `PUT /api/notifications/:id/read` - Marcar como leída

## Funcionalidades Principales

- ✅ **Autenticación** (Registro, Login, JWT, Perfil)
- ✅ **Gestión de Tareas** (CRUD, favoritos, prioridades, fechas, etiquetas)
- ✅ **Dashboard** con estadísticas y filtros
- ✅ **Vista Kanban** (drag & drop básico)
- ✅ **Vista Calendario**
- ✅ **Analytics/Gráficos** (Recharts)
- ✅ **Categorías** personalizables
- ✅ **Metas/Objetivos** con progreso
- ✅ **Notificaciones**
- ✅ **Modo oscuro**
- ✅ **Diseño responsive**

## Estructura del Proyecto

### Backend
```
taskflow-backend/src/
├── main.ts                 # Entry point + CORS
├── app.module.ts           # Módulo raíz
├── modules/
│   ├── auth/               # Autenticación JWT
│   ├── tasks/              # CRUD tareas
│   ├── profiles/           # Perfiles usuario
│   ├── categories/         # Categorías
│   ├── goals/              # Metas
│   └── productivity/       # Métricas + Insights
├── common/                 # Guards, pipes, decorators
└── setup/                  # Inicialización BD
```

### Frontend Vue
```
taskflow-app-vue/src/
├── main.ts                 # Entry point
├── App.vue                 # Root component
├── components/             # Componentes reutilizables
│   ├── Header.vue
│   ├── Sidebar.vue
│   ├── TaskCard.vue
│   └── TaskModal.vue
├── pages/                  # Páginas (route-level)
├── stores/                 # Pinia stores
│   ├── auth.ts
│   ├── tasks.ts
│   └── theme.ts
├── services/               # Servicios API
│   └── api.ts
├── router/                 # Vue Router config
├── types/                  # TypeScript types
└── style.css               # Global styles (Tailwind)
```

## Base de Datos

El schema completo está en `taskflow-backend/taskflow-supabase.sql` (21 tablas):

**Core (5)**: profiles, tasks, categories, goals, task_activity
**Colaboración (2)**: task_collaborators, collaboration_invitations
**Notificaciones (3)**: notifications, notification_configs, email_preferences
**Productividad (2)**: productivity_metrics, productivity_insights
**IA (1)**: ai_suggestions_history
**Otros (8)**: integrations, calendar_events, integration_sync_history, api_keys, api_rate_limits, automation_rules, webhooks

Incluye: índices optimizados, datos de ejemplo, constraints, checks.

## Licencia

MIT