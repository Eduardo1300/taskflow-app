# TaskFlow - Aplicación de Gestión de Tareas

<div align="center">

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.5-38B2AC?style=flat-square&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-latest-3ECF8E?style=flat-square&logo=supabase)

**TaskFlow** es una aplicación de gestión de tareas de nivel empresarial con funcionalidades avanzadas de colaboración, inteligencia artificial, analytics y trabajo offline.

[Características](#características) • [Instalación](#instalación) • [API](#api) • [Contribuir](#contribuir)

**Demo:** https://taskflow-app-xi.vercel.app

</div>

---

## 📝 Descripción

TaskFlow es una aplicación completa de gestión de tareas diseñada para equipos y usuarios individuales. Combina las mejores prácticas de desarrollo moderno con una experiencia de usuario intuitiva y funcional.

### Problema que Resuelve

- **Gestión caótica de tareas**: Organización estructurada con múltiples vistas
- **Falta de colaboración**: Sistema de compartir y colaborar en tiempo real
- **Productividad limitada**: Analytics y recomendaciones de IA
- **Dependencia de conexión**: Funcionalidad offline completa
- **Integraciones dispersas**: Unificación con herramientas existentes

---

## ✨ Características

### Gestión de Tareas

- CRUD completo de tareas
- Estados: Pendiente, en progreso, completada
- Prioridades: Baja, media, alta con indicadores visuales
- Categorías con sugerencias de IA
- Etiquetas ilimitadas
- Fechas de vencimiento con predicción inteligente
- Búsqueda avanzada y filtros múltiples

### Vistas de Tareas

| Vista | Descripción |
|-------|-------------|
| **Kanban** | Tablero con columnas y drag & drop |
| **Lista** | Lista tradicional con ordenamiento |
| **Calendario** | Calendario con vistas día/semana/mes |
| **Agenda** | Lista organizada por fechas |

### Colaboración

- Compartir tareas con permisos granulares (View, Edit, Admin, Owner)
- Sistema de invitaciones por email
- Activity tracking detallado
- Comentarios en tiempo real
- Archivos adjuntos

### Inteligencia Artificial

- Sugerencias automáticas de categorías
- Predicción de fechas de vencimiento
- Evaluación inteligente de prioridades
- Análisis de productividad
- Recomendaciones contextuales

### Integraciones

- **Google Calendar**: Sincronización bidireccional
- **Slack**: Notificaciones en tiempo real
- **Discord**: Actualizaciones en servidores
- **Email**: Resúmenes y recordatorios
- **Webhooks**: Integraciones personalizadas
- **API REST completa**

### Analytics y Productividad

- Dashboard de métricas con gráficos interactivos
- Análisis predictivo y tendencias
- Métricas de rendimiento (racha, tiempo promedio, eficiencia)
- Exportación a PDF, CSV, JSON

### Experiencia de Usuario

- Tema claro/oscuro conmutables
- Diseño responsive (desktop, tablet, móvil)
- Glassmorphism y animaciones fluidas
- PWA instalable como app nativa
- Funcionamiento offline completo

---

## 🛠️ Tecnologías

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.2.0 | Biblioteca de interfaz de usuario |
| TypeScript | 5.2.2 | Tipado estático |
| Vite | 5.0.0 | Herramienta de construcción |
| Tailwind CSS | 3.3.5 | Framework utilitario CSS |
| React Router DOM | 6.20.1 | Enrutamiento |
| Lucide React | 0.292.0 | Iconos |
| @hello-pangea/dnd | 18.0.1 | Drag & drop |
| date-fns | 4.1.0 | Manipulación de fechas |
| recharts | 3.1.2 | Gráficos |

### Backend

| Tecnología | Propósito |
|------------|-----------|
| Supabase | Backend como servicio |
| PostgreSQL | Base de datos relacional |
| Supabase Auth | Autenticación JWT |
| Supabase Realtime | WebSockets |
| Edge Functions | Lógica serverless |
| Storage | Almacenamiento de archivos |

---

## 📁 Estructura del Proyecto

```
taskflow-app-main/
├── .env                          # Variables de entorno
├── .gitignore
├── index.html                    # Entry point HTML
├── package.json                  # Dependencias y scripts
├── tailwind.config.js            # Configuración Tailwind
├── tsconfig.json                 # Configuración TypeScript
├── *.sql files                   # Scripts de base de datos (27 archivos)
├── dist/                         # Build de producción
├── public/                       # Archivos estáticos
└── src/                          # Código fuente
    ├── main.tsx                  # Entry point React
    ├── App.tsx                   # Componente principal y rutas
    ├── contexts/                 # Contextos de React
    │   ├── AuthContext.tsx       # Autenticación
    │   └── ThemeContext.tsx      # Tema
    ├── components/               # Componentes (organizados por módulo)
    │   ├── Analytics/
    │   ├── Api/
    │   ├── Auth/
    │   ├── Calendar/
    │   ├── Collaboration/
    │   ├── Dashboard/
    │   ├── Help/
    │   ├── Integrations/
    │   ├── Kanban/
    │   ├── Layout/
    │   ├── Notifications/
    │   ├── Offline/
    │   ├── Profile/
    │   ├── PWA/
    │   ├── Settings/
    │   ├── Tasks/
    │   ├── Theme/
    │   └── Views/
    ├── hooks/                    # Hooks personalizados
    │   ├── useKanbanRealtime.ts
    │   ├── useOffline.ts
    │   ├── useRealtime.ts
    │   └── useRealtimeNotifications.ts
    ├── lib/
    │   └── supabase.ts           # Cliente Supabase
    ├── services/                 # Servicios de negocio
    │   ├── aiService.ts
    │   ├── analyticsService.ts
    │   ├── apiService.ts
    │   ├── attachmentService.ts
    │   ├── boardService.ts
    │   ├── calendarAnalyticsService.ts
    │   ├── categoryService.ts
    │   ├── collaborationService.ts
    │   ├── commentService.ts
    │   ├── emailPreferencesService.ts
    │   ├── emailService.ts
    │   ├── eventCollaborationService.ts
    │   ├── exportService.ts
    │   ├── goalsService.ts
    │   ├── googleCalendarService.ts
    │   ├── integrationService.ts
    │   ├── notificationService.ts
    │   ├── offlineService.ts
    │   ├── profileService.ts
    │   ├── recurringEventService.ts
    │   ├── settingsService.ts
    │   ├── statsService.ts
    │   ├── taskService.ts
    │   └── userService.ts
    ├── pages/                    # Páginas
    │   ├── AnalyticsPage.tsx
    │   ├── ApiManagementPage.tsx
    │   ├── CalendarPageEnhanced.tsx
    │   ├── DashboardPageEnhanced.tsx
    │   ├── GuidesPage.tsx
    │   ├── HelpPageEnhanced.tsx
    │   ├── IntegrationsPage.tsx
    │   ├── KanbanPageEnhanced.tsx
    │   ├── LandingPageEnhanced.tsx
    │   ├── LoginPageEnhanced.tsx
    │   ├── ProfilePageEnhanced.tsx
    │   ├── RegisterPageEnhanced.tsx
    │   └── SettingsPageEnhanced.tsx
    ├── types/                    # Tipos TypeScript
    │   ├── database.ts
    │   └── index.ts
    └── data/
        └── mockData.ts           # Datos de prueba
```

### Arquitectura de Componentes

```
src/components/
├── Layout/           # Header, Sidebar, Footer
├── Tasks/            # TaskCard, TaskModal, TaskForm
├── Kanban/           # KanbanBoard, KanbanColumn
├── Calendar/         # CalendarView, CalendarDay
├── Analytics/        # Charts, Metrics
├── Auth/             # Login, Register, ProtectedRoute
├── Collaboration/    # ShareModal, Invitations
├── Settings/         # Configuración general
└── Shared/           # Button, Input, Modal, etc.
```

---

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase (gratuita)

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/taskflow-app.git
cd taskflow-app-main
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env`:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

4. **Configurar base de datos**

Ejecutar scripts SQL en Supabase (en orden):
- `supabase-setup.sql`
- `supabase-complete-setup.sql`
- `supabase-collaboration.sql`
- `supabase-integrations-setup.sql`
- `supabase-api-setup.sql`

5. **Ejecutar**
```bash
npm run dev
```

La aplicación estará en `http://localhost:5173`

---

## ⚙️ Configuración

### Variables de Entorno

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | Sí |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima de Supabase | Sí |

### Configuración de Supabase

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar scripts SQL desde la carpeta del proyecto
3. Configurar Authentication (habilitar confirmaciones de email)
4. Copiar URL y anon key para las variables de entorno

---

## 📖 Uso

### Autenticación

```typescript
// Registro
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: { data: { full_name: 'Nombre' } }
});

// Inicio de sesión
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Cierre de sesión
await supabase.auth.signOut();
```

### Gestión de Tareas

```typescript
// Obtener tareas
const { data: tasks, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// Crear tarea
const { data: task, error } = await supabase
  .from('tasks')
  .insert({
    title: 'Nueva tarea',
    description: 'Descripción',
    priority: 'high'
  })
  .select()
  .single();

// Actualizar tarea
await supabase
  .from('tasks')
  .update({ completed: true })
  .eq('id', taskId);

// Eliminar tarea
await supabase
  .from('tasks')
  .delete()
  .eq('id', taskId);
```

### Realtime

```typescript
useRealtime({
  table: 'tasks',
  filter: `user_id=eq.${userId}`,
  onEvent: (event) => {
    console.log('Cambio:', event);
    refreshTasks();
  }
});
```

---

## 🌐 API

### Endpoints REST

#### Tareas

```http
# Obtener tareas
GET /api/v1/tasks
Authorization: Bearer <token>

# Crear tarea
POST /api/v1/tasks
Authorization: Bearer <token>
Content-Type: application/json
{"title": "Nueva tarea", "priority": "high"}

# Actualizar tarea
PUT /api/v1/tasks/:id
Authorization: Bearer <token>

# Eliminar tarea
DELETE /api/v1/tasks/:id
Authorization: Bearer <token>
```

#### Webhooks

```http
# Crear webhook
POST /api/webhooks
Authorization: Bearer <token>
{"url": "https://...", "events": ["task.created"]}

# Listar webhooks
GET /api/webhooks
Authorization: Bearer <token>
```

### Eventos de Webhook

| Evento | Descripción |
|--------|-------------|
| `task.created` | Tarea creada |
| `task.updated` | Tarea actualizada |
| `task.deleted` | Tarea eliminada |
| `task.completed` | Tarea completada |

### Rate Limiting

- Por defecto: 60 solicitudes/minuto
- Personalizable por API key

---

## 🗄️ Base de Datos

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `tasks` | Tareas principales |
| `profiles` | Perfiles de usuario |
| `task_collaborators` | Colaboradores en tareas |
| `collaboration_invitations` | Invitaciones |
| `task_activity` | Historial de actividades |
| `api_keys` | Claves de API |
| `webhooks` | Webhooks configurados |
| `task_comments` | Comentarios |
| `task_attachments` | Archivos adjuntos |
| `notifications` | Notificaciones |

### Row Level Security (RLS)

Todas las tablas tienen políticas RLS:

```sql
-- Ejemplo para tasks
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## 🔒 Seguridad

### Autenticación

- JWT tokens con Supabase Auth
- Verificación de email
- Refresh automático de tokens

### Autorización

- Row Level Security a nivel de base de datos
- Permisos granulares en colaboraciones
- Rate limiting para prevención de abusos

### Mejores Prácticas

1. No exponer claves privadas en frontend
2. Usar HTTPS en producción
3. Validar todos los inputs
4. Mantener dependencias actualizadas

---

## 👨‍💻 Desarrollo

### Scripts

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run lint         # Verificar errores de lint
npm run preview      # Vista previa del build
```

### Patrones de Arquitectura

#### Servicio

```typescript
// services/taskService.ts
class TaskService {
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    let query = supabase.from('tasks').select('*');
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    return (await query).data || [];
  }
}
export const taskService = new TaskService();
```

#### Hook Personalizado

```typescript
// hooks/useRealtime.ts
export const useRealtime = ({ table, filter, onEvent }: RealtimeOptions) => {
  useEffect(() => {
    const channel = supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table, filter }, onEvent)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [table, filter]);
};
```

#### Contexto

```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
```

---

## 🚀 Deployment

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automático en cada push

### Build de Producción

```bash
npm run build
```

Salida en `dist/`: `index.html`, `assets/`, `manifest.json`

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crear rama: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Abrir Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 🙏 Agradecimientos

- [Supabase](https://supabase.com) por el backend
- [Vite](https://vitejs.dev) por la velocidad
- [Tailwind CSS](https://tailwindcss.com) por el framework CSS
- [React](https://reactjs.org) por la biblioteca de UI
- [Lucide Icons](https://lucide.dev) por los iconos

---

<div align="center">
Desarrollado con ❤️ por el equipo de TaskFlow
</div>
