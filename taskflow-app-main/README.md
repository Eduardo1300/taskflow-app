# TaskFlow - Aplicación de Gestión de Tareas

<div align="center">

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?style=flat-square&logo=vite)
![NestJS](https://img.shields.io/badge/NestJS-10.0.0-E0234D?style=flat-square&logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)

**TaskFlow** es una aplicación completa de gestión de tareas con backend NestJS + PostgreSQL y frontend React.

</div>

---

## 📝 Descripción

TaskFlow es una aplicación de gestión de tareas diseñada para equipos y usuarios individuales. Fue migrada de Supabase a una arquitectura personalizada con NestJS y PostgreSQL.

### Características Principales

- **Gestión de tareas** - CRUD completo con prioridades, categorías y etiquetas
- **Vistas múltiples** - Kanban, Lista, Calendario y Agenda
- **Colaboración** - Compartir tareas con permisos granulares
- **Metas y objetivos** - Seguimiento de productividad
- **Integraciones** - Google Calendar, Slack, Discord
- **Analytics** - Métricas y gráficos interactivos
- **Modo oscuro** - Tema claro/oscuro
- **Diseño responsive** - Funciona en desktop, tablet y móvil

---

## 🛠️ Tecnologías

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.2.0 | Interfaz de usuario |
| TypeScript | 5.2.2 | Tipado estático |
| Vite | 5.0.0 | Build tool |
| Tailwind CSS | 3.3.5 | Estilos |
| React Router | 6.20.1 | Enrutamiento |
| Axios | 1.7.0 | Cliente HTTP |
| Lucide React | 0.292.0 | Iconos |
| date-fns | 4.1.0 | Fechas |

### Backend

| Tecnología | Propósito |
|------------|-----------|
| NestJS | Framework Node.js |
| TypeORM | ORM |
| PostgreSQL | Base de datos |
| JWT | Autenticación |
| Passport | Estrategia auth |

---

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+
- PostgreSQL 14+
- npm

### Backend

```bash
cd taskflow-backend

npm install

# Configurar .env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskflow
JWT_SECRET=tu-secreto-aqui
PORT=3000

npm run start:dev
```

### Frontend

```bash
cd taskflow-app-main

npm install

# Configurar .env
VITE_API_URL=http://localhost:3000/api

npm run dev
```

### Docker

```bash
docker-compose up -d
```

---

## 📁 Estructura

```
taskflow/
├── taskflow-backend/          # Backend NestJS
│   ├── src/
│   │   ├── auth/            # Autenticación
│   │   ├── tasks/          # Tareas
│   │   ├── categories/      # Categorías
│   │   ├── goals/          # Metas
│   │   ├── collaborations/  # Colaboraciones
│   │   ├── notifications/  # Notificaciones
│   │   └── integrations/   # Integraciones
│   └── Dockerfile
│
├── taskflow-app-main/        # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes
│   │   ├── contexts/        # Contextos React
│   │   ├── hooks/          # Hooks
│   │   ├── pages/          # Páginas
│   │   ├── services/       # Servicios API
│   │   └── lib/           # Utilidades (API client)
│   └── Dockerfile
│
├── docker-compose.yml        # Orquestación
└── README.md
```

---

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Perfil actual

### Tareas
- `GET /api/tasks` - Listar
- `POST /api/tasks` - Crear
- `PUT /api/tasks/:id` - Actualizar
- `DELETE /api/tasks/:id` - Eliminar
- `GET /api/tasks/stats` - Estadísticas

### Categorías
- `GET /api/categories` - Listar
- `POST /api/categories` - Crear
- `DELETE /api/categories/:id` - Eliminar

### Metas
- `GET /api/goals` - Listar
- `POST /api/goals` - Crear
- `PUT /api/goals/:id` - Actualizar
- `DELETE /api/goals/:id` - Eliminar

---

## 🔒 Seguridad

- JWT tokens para autenticación
- Contraseñas hasheadas con bcrypt
- Validación de datos
- CORS configurado

---

## 📄 Licencia

MIT
