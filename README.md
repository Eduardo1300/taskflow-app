# 📝 TaskFlow

Una aplicación moderna y robusta para gestionar tareas, construida con React + TypeScript + Supabase.

[![Demo](https://img.shields.io/badge/Demo-Live-green)](https://taskflow-app-xi.vercel.app)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)](https://typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.3.5-blue)](https://tailwindcss.com/)

![TaskFlow Screenshot](./public/screenshot.png)

🌐 **Deployment**  
Este proyecto está desplegado en Vercel:  
🔗 https://taskflow-app-xi.vercel.app

## ✨ Características

### 🎯 **Gestión Completa de Tareas**
- 📝 **CRUD completo** - Crear, editar, completar y eliminar tareas en tiempo real
- 🏷️ **Categorías predefinidas** - Organiza tus tareas (Trabajo, Personal, Urgente, Ideas)
- 🏷️ **Etiquetas personalizadas** - Agrega etiquetas ilimitadas para clasificar mejor
- 📅 **Fechas de vencimiento** - Asigna deadlines y visualiza tareas vencidas
- ⭐ **Prioridades** - Clasifica tareas por prioridad (Alta, Media, Baja) con códigos de color
- 🔍 **Búsqueda avanzada** - Encuentra tareas por título, descripción, categoría o etiquetas
- 🎛️ **Filtros múltiples** - Filtra por estado, prioridad, categoría y fechas

### 🤝 **Colaboración Avanzada**
- 👥 **Compartir tareas** - Invita a otros usuarios a colaborar en tiempo real
- 🔐 **Gestión de permisos** - Control granular (view, edit, admin, owner)
- 📧 **Sistema de invitaciones** - Invita por email con notificaciones automáticas
- 📊 **Activity tracking** - Historial completo de todas las actividades
- 🔔 **Notificaciones en vivo** - Alertas instantáneas de invitaciones y cambios

### ⚡ **Experiencia en Tiempo Real**
- 🔄 **Actualizaciones instantáneas** - Supabase Realtime para sincronización automática
- 🌐 **Multi-dispositivo** - Mantén todos tus dispositivos sincronizados
- 📱 **PWA completa** - Instalable como app nativa con soporte offline
- 🔄 **Sincronización offline avanzada** - Cache inteligente y sync automático al reconectar

### 🎨 **Interfaz Moderna**
- 🌙 **Tema oscuro completo** - Modo claro/oscuro con detección automática del sistema
- 📱 **Totalmente responsivo** - Perfecto en desktop, tablet y móvil
- 🎨 **Diseño Material** - Interfaz limpia con Tailwind CSS y animaciones suaves
- 🏃‍♂️ **Ultra-rápido** - Construido con Vite para rendimiento óptimo

### 📊 **Analytics y Productividad**
- 📈 **Analytics avanzados** - Estadísticas detalladas de productividad
- 📊 **Gráficos interactivos** - Visualización de progreso y tendencias
- 🏆 **Métricas de rendimiento** - Racha de días productivos, tiempo promedio
- � **Insights personalizados** - Recomendaciones basadas en tu actividad
- 📤 **Exportación de datos** - Exporta analytics en JSON para análisis

### � **Seguridad y Autenticación**
- 🔐 **Autenticación completa** - Sistema seguro con Supabase Auth
- 🛡️ **Row Level Security** - Protección a nivel de base de datos
- � **Perfiles de usuario** - Gestión completa de cuentas
- 🔑 **JWT tokens** - Autenticación moderna y segura

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - Biblioteca de interfaz de usuario con hooks modernos
- **TypeScript** - Tipado estático para mejor desarrollo y mantenimiento
- **Tailwind CSS** - Framework de CSS utilitario para diseño rápido
- **React Router DOM** - Enrutamiento declarativo del lado del cliente
- **Lucide React** - Iconos modernos y consistentes
- **Vite** - Herramienta de construcción ultra-rápida con HMR

### Backend & Base de Datos
- **Supabase** - Backend como servicio (BaaS) completo
- **PostgreSQL** - Base de datos relacional robusta
- **Supabase Auth** - Autenticación completa con JWT
- **Supabase Realtime** - Actualizaciones en tiempo real
- **Row Level Security (RLS)** - Seguridad a nivel de fila en la base de datos

### DevOps & Herramientas
- **Vite PWA Plugin** - Progressive Web App con soporte offline
- **Workbox** - Service Worker para cache y offline
- **ESLint** - Linting para código consistente
- **PostCSS** - Procesamiento de CSS
- **Autoprefixer** - Prefijos CSS automáticos

## � Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta en [Supabase](https://supabase.com)

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/taskflow.git
cd taskflow
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Supabase

#### 3.1 Crear proyecto en Supabase
1. Ve a [Supabase](https://supabase.com) y crea una nueva cuenta
2. Crea un nuevo proyecto
3. Espera a que se complete la configuración

### 3.2 Configurar base de datos
1. Ve a **SQL Editor** en tu proyecto de Supabase
2. Ejecuta el script SQL ubicado en `supabase-setup.sql` para crear las tablas básicas
3. Luego ejecuta `supabase-update-features.sql` para agregar las nuevas funcionalidades
4. Finalmente ejecuta `supabase-create-default-categories.sql` para crear categorías por defecto
5. Esto creará todas las tablas necesarias con políticas de seguridad completas

#### 3.3 Obtener credenciales
1. Ve a **Settings > API** en tu proyecto de Supabase
2. Copia la **Project URL** y **anon public key**

### 4. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_publica_de_supabase
```

### 5. Iniciar aplicación
```bash
npm run dev
```

🎉 ¡Tu aplicación estará disponible en `http://localhost:5173`!

## � Funcionalidades Avanzadas

### 🤝 Colaboración
- **Compartir tareas**: Invita a otros usuarios a colaborar en tus tareas
- **Gestión de permisos**: Controla quien puede ver, editar o administrar cada tarea
- **Invitaciones**: Sistema completo de invitaciones con notificaciones
- **Activity tracking**: Seguimiento de todas las actividades en tareas compartidas

### ⚡ Tiempo Real
- **Actualizaciones instantáneas**: Los cambios se reflejan inmediatamente en todos los usuarios conectados
- **Notificaciones en vivo**: Recibe alertas cuando te invitan a colaborar o hay cambios en tareas compartidas
- **Sincronización automática**: Mantén todos tus dispositivos sincronizados sin recargar

### 📱 Progressive Web App (PWA)
- **Instalable**: Añade la app a tu pantalla de inicio como una app nativa
- **Soporte offline**: Accede a tus tareas incluso sin conexión a internet
- **Cache inteligente**: Carga rápida con contenido almacenado en cache
- **Actualizaciones automáticas**: La app se actualiza automáticamente en segundo plano

## �🗄️ Base de datos

La aplicación utiliza **Supabase** como backend, con las siguientes tablas:

### Tablas Principales

- **`tasks`**: Almacena las tareas de los usuarios
  - `id` (BIGSERIAL): Identificador único
  - `title` (VARCHAR): Título de la tarea
  - `description` (TEXT): Descripción opcional
  - `completed` (BOOLEAN): Estado de completado
  - `category` (TEXT): Categoría de la tarea ✨ NUEVO
  - `tags` (TEXT[]): Array de etiquetas ✨ NUEVO
  - `due_date` (TIMESTAMPTZ): Fecha de vencimiento ✨ NUEVO
  - `priority` (TEXT): Prioridad (low, medium, high) ✨ NUEVO
  - `created_at` (TIMESTAMP): Fecha de creación
  - `user_id` (UUID): ID del usuario propietario

- **`categories`**: Categorías predefinidas por usuario ✨ NUEVO
  - `id` (BIGSERIAL): Identificador único
  - `name` (TEXT): Nombre de la categoría
  - `color` (TEXT): Color en hexadecimal
  - `user_id` (UUID): ID del usuario propietario
  - `created_at` (TIMESTAMP): Fecha de creación

- **`profiles`**: Perfiles de usuario extendidos
  - `id` (UUID): Referencia a `auth.users`
  - `email` (VARCHAR): Email del usuario
  - `full_name` (VARCHAR): Nombre completo
  - `created_at` (TIMESTAMP): Fecha de creación

### Tablas de Colaboración

- **`task_collaborators`**: Gestión de colaboradores en tareas
  - `id` (BIGSERIAL): Identificador único
  - `task_id` (BIGINT): Referencia a la tarea
  - `user_id` (UUID): Usuario colaborador
  - `permission` (TEXT): Nivel de permiso (view, edit, admin)
  - `added_by` (UUID): Quien añadió al colaborador
  - `created_at` (TIMESTAMP): Fecha de creación

- **`collaboration_invitations`**: Invitaciones de colaboración
  - `id` (BIGSERIAL): Identificador único
  - `task_id` (BIGINT): Referencia a la tarea
  - `inviter_id` (UUID): Usuario que invita
  - `invitee_email` (VARCHAR): Email del invitado
  - `permission` (TEXT): Nivel de permiso propuesto
  - `status` (TEXT): Estado (pending, accepted, declined)
  - `created_at` (TIMESTAMP): Fecha de creación

- **`task_activity`**: Registro de actividades
  - `id` (BIGSERIAL): Identificador único
  - `task_id` (BIGINT): Referencia a la tarea
  - `user_id` (UUID): Usuario que realizó la acción
  - `action` (TEXT): Tipo de acción realizada
  - `details` (JSONB): Detalles adicionales
  - `created_at` (TIMESTAMP): Fecha de la acción

### 🔒 Seguridad

- **Row Level Security (RLS)** habilitado
- Los usuarios solo pueden ver/modificar sus propias tareas
- Autenticación completa con Supabase Auth

## 🏗️ Estructura del proyecto

```
src/
├── components/              # Componentes reutilizables
│   ├── Analytics/          # ✨ Componentes de analytics y reportes
│   ├── Auth/               # Componentes de autenticación
│   ├── Collaboration/      # ✨ Componentes de colaboración
│   ├── Layout/             # Componentes de diseño (Header, Sidebar)
│   ├── Offline/            # ✨ Indicadores de estado offline
│   ├── PWA/                # ✨ Componentes PWA y actualizaciones
│   ├── Tasks/              # Componentes relacionados con tareas
│   └── Theme/              # ✨ Componentes de tema oscuro/claro
├── contexts/               # Contextos de React
│   ├── AuthContext.tsx     # Contexto de autenticación
│   └── ThemeContext.tsx    # ✨ Contexto de tema
├── hooks/                  # Hooks personalizados
│   ├── useOffline.ts       # ✨ Hook para gestión offline
│   ├── useRealtime.ts      # ✨ Hook para tiempo real
│   └── useRealtimeNotifications.ts # ✨ Hook para notificaciones
├── lib/                    # Configuración de librerías
│   └── supabase.ts         # Configuración de Supabase
├── pages/                  # Páginas principales
│   ├── DashboardPage.tsx   # Dashboard principal con analytics
│   ├── LandingPage.tsx     # Página de inicio
│   ├── LoginPage.tsx       # Página de login
│   └── RegisterPage.tsx    # Página de registro
├── services/               # Servicios para API calls
│   ├── analyticsService.ts # ✨ Servicio de analytics
│   ├── categoryService.ts  # ✨ Servicio de categorías
│   ├── collaborationService.ts # ✨ Servicio de colaboración
│   ├── offlineService.ts   # ✨ Servicio de sincronización offline
│   └── taskService.ts      # Servicio de tareas
├── types/                  # Definiciones de tipos TypeScript
│   ├── database.ts         # ✨ Tipos de base de datos actualizados
│   └── index.ts            # Tipos generales
├── App.tsx                 # Componente principal
├── main.tsx                # Punto de entrada
└── index.css               # Estilos globales con modo oscuro
```

## 🎯 Funcionalidades

### Páginas principales:
- **Landing Page**: Página de inicio con información del producto
- **Login/Register**: Autenticación real con Supabase Auth
- **Dashboard**: Gestión completa de tareas con base de datos

### Gestión de tareas:
- ✅ Crear nuevas tareas con categorías, etiquetas, fechas y prioridades
- ✏️ Editar tareas existentes con todos los campos
- 🔄 Marcar como completado/pendiente con indicadores visuales
- 🗑️ Eliminar tareas con confirmación
- 🔍 Búsqueda avanzada por título, descripción, categoría y etiquetas
- 🎛️ Filtros múltiples (estado, prioridad, categoría, fechas)
- 🏷️ Gestión de categorías predefinidas y personalizadas
- ⭐ Indicadores visuales de prioridad con códigos de color
- 📅 Alertas de tareas vencidas y próximas a vencer

### Características avanzadas:
- 📊 **Analytics completos** - Estadísticas detalladas, gráficos, métricas de productividad
- 🤝 **Colaboración en tiempo real** - Invitaciones, permisos, activity tracking
- � **Sincronización offline avanzada** - Cache inteligente, sync automático
- 🌙 **Tema oscuro completo** - Modo claro/oscuro con persistencia
- 📱 **PWA instalable** - Funciona como app nativa
- 🔔 **Notificaciones en tiempo real** - Alertas de invitaciones y cambios
- 📤 **Exportación de datos** - Analytics en JSON
- 👤 **Perfiles de usuario** - Gestión completa de cuentas
- 📱 **Diseño totalmente responsivo** - Perfecto en todos los dispositivos
- 🎨 **Interfaz moderna** - Animaciones suaves y transiciones

## 📱 Diseño Responsive

La aplicación ahora es totalmente responsive, adaptándose correctamente a móviles, tablets y escritorios usando Tailwind CSS y sus breakpoints (`sm`, `md`, `lg`, `xl`).

### 🛠 Mejoras realizadas:
- **Cabecera y Menú:** El ícono de usuario y el botón de cerrar sesión ahora se muestran correctamente en pantallas pequeñas con un diseño tipo "dropdown" más limpio y accesible.
- **Dashboard de Tareas:** Las tarjetas de tareas y el layout general se reorganizan adecuadamente según el tamaño de pantalla.
- **Modal de Tareas:** Los formularios y botones se ajustan con paddings y tamaños de fuente responsivos.
- **Tipografía y Espaciado:** Mejoras en el uso de `truncate`, `max-w`, y espaciado para evitar desbordes.
- **Experiencia en móviles:** Sin errores visuales, ni texto oculto, ni botones inaccesibles.

🧪 Probado en dispositivos móviles como iPhone SE, iPhone 14 Pro, iPad y pantallas de escritorio de 1440px.

---

📲 Puedes redimensionar la ventana o abrir la app desde tu celular para ver la mejora de diseño responsive en acción.

## 🚀 Scripts disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la construcción de producción
- `npm run lint` - Ejecuta el linter para verificar el código

## 🎨 Personalización

El proyecto utiliza Tailwind CSS para los estilos. Puedes personalizar:

- **Colores**: Modifica el archivo `tailwind.config.js`
- **Fuentes**: Actualiza las fuentes en `index.html` y `tailwind.config.js`
- **Componentes**: Todos los componentes están en la carpeta `src/components/`

## 🎯 Estado de Funcionalidades

### ✅ **Completadas - Core Features**
- [x] 🔐 **Autenticación completa** - Sistema de registro e inicio de sesión
- [x] 🛡️ **Seguridad RLS** - Row Level Security implementado
- [x] 📝 **CRUD completo** - Crear, leer, actualizar y eliminar tareas
- [x] 🔍 **Búsqueda y filtros** - Encuentra tareas rápidamente
- [x] 📊 **Dashboard** - Estadísticas y resumen de tareas
- [x] 📱 **Diseño responsivo** - Perfecto en todos los dispositivos

### ✅ **Completadas - Advanced Features**
- [x] 🏷️ **Categorías predefinidas** - Sistema completo de categorías por usuario
- [x] 🏷️ **Etiquetas personalizadas** - Tags ilimitados para clasificación
- [x] 📅 **Fechas de vencimiento** - Deadlines con indicadores visuales
- [x] ⭐ **Prioridades** - Alta, Media, Baja con códigos de color
- [x] 🌙 **Tema oscuro completo** - Modo claro/oscuro con persistencia
- [x] 🤝 **Colaboración avanzada** - Comparte tareas con otros usuarios
- [x] ⚡ **Tiempo real** - Actualizaciones en vivo con Supabase Realtime
- [x] 📱 **PWA completa** - Instalable como app nativa
- [x] 🔔 **Notificaciones en tiempo real** - Sistema de invitaciones y alertas
- [x] 🔄 **Sincronización offline avanzada** - Cache inteligente y sync automático
- [x] 📊 **Analytics avanzados** - Estadísticas detalladas, gráficos, métricas
- [x] 📤 **Exportación de datos** - Analytics exportables en JSON

### 🔄 **En Desarrollo Futuro**
- [ ] 🌐 **API REST completa** - Endpoints públicos para integración
- [ ] � **Exportación avanzada** - PDF, CSV para tareas y reportes
- [ ] � **Integraciones** - Calendario, Slack, Trello
- [ ] 🤖 **IA y Sugerencias** - Recomendaciones inteligentes
- [ ] � **Analytics predictivos** - Predicción de carga de trabajo

### 🎉 **Resumen del Proyecto**
**TaskFlow es una aplicación completa y moderna** que incluye todas las funcionalidades solicitadas:

✅ **Categorías y etiquetas** - Sistema completo implementado  
✅ **Fechas de vencimiento** - Con indicadores visuales  
✅ **Tema oscuro** - Totalmente funcional  
✅ **Sincronización offline avanzada** - Cache inteligente  
✅ **Analytics avanzados** - Reportes completos  

**Estado actual: PROYECTO COMPLETO** 🚀

## 🤝 Contribuir

¡Las contribuciones son muy bienvenidas! Este proyecto sigue las mejores prácticas de código abierto.

### Proceso de contribución

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commitea** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### Tipos de contribuciones

- 🐛 **Bug fixes** - Reporta y corrige errores
- ✨ **Features** - Nuevas funcionalidades
- � **Documentación** - Mejoras en docs y README
- 🎨 **UI/UX** - Mejoras en diseño e interfaz
- ⚡ **Performance** - Optimizaciones de rendimiento
- 🧪 **Tests** - Agregar o mejorar tests

### Guías de desarrollo

- Sigue las convenciones de TypeScript
- Usa Tailwind CSS para estilos
- Documenta funciones complejas
- Mantén los commits atómicos y descriptivos

## �📄 Licencia

Este proyecto está bajo la [Licencia MIT](./LICENSE). Puedes usar, modificar y distribuir este código libremente.

## 🙏 Reconocimientos

- [React](https://reactjs.org/) - Por la increíble biblioteca de UI
- [Supabase](https://supabase.com/) - Por el backend completo y fácil de usar
- [Tailwind CSS](https://tailwindcss.com/) - Por el framework de CSS utilitario
- [Lucide Icons](https://lucide.dev/) - Por los iconos hermosos y consistentes

## 👨‍💻 Autor

**Christopher Eduardo Valdivia Baca**

- 🌐 [LinkedIn](https://www.linkedin.com/in/christopher-eduardo-valdivia-baca-899051318/)
- 📧 eduardovaldivia130@outlook.com
- 💻 [GitHub](https://github.com/Eduardo1300)



---

⭐ **¡Si te gusta este proyecto, dale una estrella en GitHub!**

Desarrollado con ❤️ usando React + TypeScript + Supabase
