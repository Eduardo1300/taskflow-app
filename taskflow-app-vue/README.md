# TaskFlow Frontend - Vue 3 + TypeScript + Vite

Frontend de TaskFlow construido con Vue 3, TypeScript, Vite, TailwindCSS y Pinia.

## Características

- ✅ **Vue 3** - Composition API + TypeScript
- ✅ **Vite** - Build tool ultrarrápido
- ✅ **TailwindCSS** - Utility-first CSS framework
- ✅ **Pinia** - State management moderno
- ✅ **Vue Router** - SPA routing
- ✅ **Recharts** - Gráficos interactivos
- ✅ **Lucide Vue** - Iconos modernos
- ✅ **vuedraggable** - Drag & drop para Kanban
- ✅ **Modo oscuro** - Soporte completo
- ✅ **PWA ready** - Service worker configurado

## Características Principales

### Vistas Principales
- **Landing Page** - Página de bienvenida con features y CTA
- **Login / Registro** - Autenticación completa
- **Dashboard** - Vista principal con stats, filtros, búsqueda inteligente
- **Kanban** - Vista tablero con drag & drop (4 columnas)
- **Calendario** - Vista mes/semana/día con eventos
- **Analytics** - Gráficos de productividad (5 pestañas)
- **Perfil** - Configuración de usuario, preferencias
- **Pronósticos** - Predicciones de carga de trabajo

### Componentes Reutilizables
- **TaskCardEnhanced** - Tarjeta de tarea completa con menú contextual
- **TaskModal** - Modal completo para crear/editar tareas
- **GoalsSystem** - Sistema de metas con progreso
- **QuickActions** - Acciones rápidas con atajos de teclado
- **SmartSearch** - Búsqueda avanzada con filtros guardados
- **GoalsSystem** - Sistema de metas diario/semanal/mensual
- **Header/Sidebar** - Layout responsivo con tema oscuro

### Servicios
- **analyticsService.ts** - Motor completo de analytics
- **calendarAnalyticsService** - Métricas de calendario
- **exportService.ts** - Exportación a PDF
- **api.ts** - Cliente API tipado

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp ../.env.example .env
# Editar .env con VITE_API_URL

# Desarrollo
npm run dev

# Build producción
npm run build

# Preview producción
npm run preview

# Tests
npm run test
npm run test:coverage
```

## Scripts Disponibles

```bash
npm run dev          # Servidor desarrollo (puerto 5173)
npm run build        # Build producción (carpeta dist/)
npm run preview      # Preview build producción
npm run test         # Tests unitarios (vitest)
npm run test:coverage # Coverage reporte
npm run lint         # ESLint
```

## Variables de Entorno (.env)

```env
VITE_API_URL=http://localhost:3000/api
```

## Estructura del Proyecto

```
src/
├── main.ts                 # Entry point + Pinia + Router
├── App.vue                 # Root component + layout
├── components/             # Componentes reutilizables
│   ├── Header.vue          # Header con búsqueda, tema, user menu
│   ├── Sidebar.vue         # Navegación lateral + filtros
│   ├── TaskCardEnhanced.vue # Tarjeta tarea completa
│   ├── TaskModal.vue       # Modal crear/editar tarea
│   ├── TaskCard.vue        # Tarjeta simple
│   ├── GoalsSystem.vue     # Sistema de metas
│   ├── QuickActions.vue    # Acciones rápidas + shortcuts
│   ├── SmartSearch.vue     # Búsqueda avanzada
│   └── ...
├── pages/                  # Páginas (route-level)
│   ├── LandingPage.vue
│   ├── LoginPage.vue
│   ├── RegisterPage.vue
│   ├── DashboardPage.vue
│   ├── KanbanPage.vue
│   ├── CalendarPage.vue
│   ├── AnalyticsPage.vue
│   ├── ProfilePage.vue
│   └── ...
├── stores/                 # Pinia stores
│   ├── auth.ts            # Auth state + actions
│   ├── tasks.ts           # Tasks state + filters
│   └── theme.ts           # Dark/light mode
├── services/               # Servicios API
│   ├── api.ts             # Cliente HTTP (axios)
│   ├── analyticsService.ts # Motor analytics
│   ├── calendarAnalyticsService.ts
│   └── exportService.ts   # Export PDF
├── router/                # Vue Router config
├── stores/                # Pinia stores
├── types/                 # TypeScript interfaces
└── style.css              # Tailwind + globals
```

## Vistas Principales

### Dashboard (`/dashboard`)
- Hero banner con saludo personalizado
- 4 tarjetas de stats (Total, Completadas, Alta Prioridad, Productividad)
- Búsqueda inteligente (SmartSearch)
- Sistema de metas (diarias/semanales/mensuales)
- Grid de tareas con filtros (Todas/Pendientes/Completadas/Favoritas)
- Tarjetas TaskCardEnhanced con menú contextual

### Kanban (`/kanban`)
- 4 columnas: Por hacer → En progreso → En revisión → Completado
- Drag & drop nativo (vuedraggable)
- Límites WIP por columna
- Badges: vencida, urgente, compartida
- Filtros: búsqueda, prioridad, fecha

### Calendario (`/calendar`)
- 3 vistas: Mes / Semana / Día
- Eventos con colores por prioridad
- Navegación mes/semana/día
- Lista de eventos del día seleccionado

### Analytics (`/analytics`)
- **Resumen**: Insights, métricas clave, salud calendario, riesgo burnout
- **Productividad**: Stats detalladas, actividad semanal, balance trabajo/vida
- **Calendario**: Salud del calendario, recomendaciones, distribución categorías
- **Gráficos**: Prioridad, tendencias 7 días, horarias, semanales, mensuales
- **Pronósticos**: Próximos 7 días, tareas vencidas

### Perfil (`/profile`)
- Info personal editable
- Stats de productividad
- Configuración: bio, teléfono, ubicación, zona horaria, idioma
- Tema oscuro/claro

## TailwindCSS

Clases personalizadas en `src/style.css`:
- Animaciones: `animate-fade-in`, `animate-scale-up`, `animate-fade-in-up`
- Scrollbars personalizados: `.custom-scrollbar`
- Gradientes: `bg-gradient-to-r from-blue-600 to-purple-600`
- Dark mode completo con `dark:` prefix

## TypeScript

Interfaces principales en `src/types/index.ts`:
- `Task`, `Category`, `Goal`, `Notification`
- `TaskStats`, `CalendarMetrics`, `AnalyticsData`
- `CalendarMetrics`, `ProductivityInsights`, `BurnoutRisk`

## Build Producción

```bash
npm run build
# Output: dist/
# Servir con nginx (ver nginx.conf) o cualquier static server
```

## Docker

```bash
# Desarrollo
docker-compose up -d

# Producción
docker build -t taskflow-frontend .
docker run -p 80:80 taskflow-frontend
```

## Nginx Config

Ver `nginx.conf` - Configurado para SPA + proxy API

## Licencia

MIT