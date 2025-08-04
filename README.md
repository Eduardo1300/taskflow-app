# 📝 TaskFlow

Una aplicación moderna y robusta para gestionar tareas, construida con React + TypeScript + Supabase.

[![Demo](https://img.shields.io/badge/Demo-Live-green)](https://taskflow-app-xi.vercel.app)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)](https://typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.3.5-blue)](https://tailwindcss.com/)

![TaskFlow Screenshot](./public/screenshot.png)

🌐 Deployment
Este proyecto está desplegado en Vercel y puede accederse en:
🔗 https://taskflow-app-xi.vercel.app


## ✨ Características

- 🔐 **Autenticación completa** - Sistema de registro e inicio de sesión con Supabase Auth
- 📝 **Gestión completa de tareas** - Crear, editar, completar y eliminar tareas en tiempo real
- 🎨 **Interfaz moderna** - Diseño limpio y responsivo con Tailwind CSS
- 🔍 **Búsqueda y filtros** - Encuentra tareas rápidamente por título, descripción o estado
- 📊 **Dashboard con estadísticas** - Visualiza tu progreso y productividad
- 🛡️ **Seguridad robusta** - Row Level Security (RLS) para proteger los datos de cada usuario
- 📱 **Totalmente responsivo** - Funciona perfectamente en desktop, tablet y móvil
- ⚡ **Rendimiento optimizado** - Construido con Vite para una experiencia ultra-rápida

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
- **Row Level Security (RLS)** - Seguridad a nivel de fila en la base de datos

### DevOps & Herramientas
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

#### 3.2 Configurar base de datos
1. Ve a **SQL Editor** en tu proyecto de Supabase
2. Ejecuta el script SQL ubicado en `supabase-setup.sql` en la raíz del proyecto
3. Esto creará las tablas `tasks` y `profiles` con todas las políticas de seguridad

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

## 🗄️ Base de datos

La aplicación utiliza **Supabase** como backend, con las siguientes tablas:

- **`tasks`**: Almacena las tareas de los usuarios
 - `id` (BIGSERIAL): Identificador único
  - `title` (VARCHAR): Título de la tarea
  - `description` (TEXT): Descripción opcional
  - `completed` (BOOLEAN): Estado de completado
  - `created_at` (TIMESTAMP): Fecha de creación
  - `user_id` (UUID): ID del usuario propietario

- **`profiles`**: Perfiles de usuario extendidos
  - `id` (UUID): Referencia a `auth.users`
  - `email` (VARCHAR): Email del usuario
  - `full_name` (VARCHAR): Nombre completo
  - `created_at` (TIMESTAMP): Fecha de creación

### 🔒 Seguridad

- **Row Level Security (RLS)** habilitado
- Los usuarios solo pueden ver/modificar sus propias tareas
- Autenticación completa con Supabase Auth

## 🏗️ Estructura del proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Auth/           # Componentes de autenticación
│   ├── Layout/         # Componentes de diseño (Header, Sidebar)
│   └── Tasks/          # Componentes relacionados con tareas
├── contexts/           # Contextos de React (AuthContext)
├── lib/               # Configuración de librerías (Supabase)
├── pages/             # Páginas principales
├── services/          # Servicios para API calls (TaskService)
├── types/             # Definiciones de tipos TypeScript
├── App.tsx            # Componente principal
├── main.tsx           # Punto de entrada
└── index.css          # Estilos globales
```

## 🎯 Funcionalidades

### Páginas principales:
- **Landing Page**: Página de inicio con información del producto
- **Login/Register**: Autenticación real con Supabase Auth
- **Dashboard**: Gestión completa de tareas con base de datos

### Gestión de tareas:
- ✅ Crear nuevas tareas
- ✏️ Editar tareas existentes
- 🔄 Marcar como completado/pendiente
- 🗑️ Eliminar tareas
- 🔍 Buscar tareas por título/descripción
- 🎛️ Filtrar por estado (todas, pendientes, completadas)

### Características adicionales:
- 📊 Estadísticas de progreso
- 👤 Perfil de usuario
- 📱 Diseño completamente responsivo
- 🎨 Interfaz moderna con animaciones

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

## � Próximas Funcionalidades

### En desarrollo
- [ ] 🏷️ **Categorías y etiquetas** - Organiza tus tareas por categorías
- [ ] 📅 **Fechas de vencimiento** - Establece deadlines para tus tareas
- [ ] 🔔 **Notificaciones** - Recordatorios automáticos
- [ ] 🌙 **Tema oscuro** - Modo oscuro para trabajar de noche

### Funcionalidades avanzadas
- [ ] 🤝 **Colaboración** - Comparte tareas con otros usuarios
- [ ] ⚡ **Tiempo real** - Actualizaciones en vivo con Supabase Realtime
- [ ] 📱 **PWA** - Instalable como app nativa
- [ ] 🔄 **Sincronización offline** - Trabaja sin conexión
- [ ] 📊 **Analytics avanzados** - Reportes de productividad
- [ ] 🔗 **API REST** - Integración con otras aplicaciones
- [ ] 📤 **Exportación** - Exporta tus tareas en PDF, CSV, JSON

### Completadas ✅
- [x] ✅ **Autenticación completa** - Sistema de registro e inicio de sesión
- [x] 🛡️ **Seguridad RLS** - Row Level Security implementado
- [x] 📝 **CRUD completo** - Crear, leer, actualizar y eliminar tareas
- [x] 🔍 **Búsqueda y filtros** - Encuentra tareas rápidamente
- [x] 📊 **Dashboard** - Estadísticas y resumen de tareas

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
