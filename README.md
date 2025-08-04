# TaskFlow

Una aplicación moderna para gestionar tareas, construida con React + TypeScript + Tailwind CSS.

## 🚀 Características

- **Interfaz moderna**: Diseño limpio y responsivo con Tailwind CSS
- **Gestión de tareas**: Crear, editar, completar y eliminar tareas
- **Autenticación**: Sistema de login y registro simulado
- **Filtros y búsqueda**: Filtra tareas por estado y busca por título/descripción
- **Estadísticas**: Visualiza el progreso de tus tareas
- **Base de datos real**: Conectado a Supabase PostgreSQL

## 🛠️ Tecnologías

- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Tailwind CSS** - Framework de estilos utilitarios
- **React Router DOM** - Enrutamiento del lado del cliente
- **Supabase** - Backend como servicio (BaaS)
- **Lucide React** - Iconos modernos
- **Vite** - Herramienta de construcción rápida

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd taskflow
```

2. Instala las dependencias:
```bash
npm install
```

3. Configurar Supabase:
   - Crea un proyecto en [Supabase](https://supabase.com)
   - Ve al Editor SQL y ejecuta el script `supabase-setup.sql`
   - Copia las credenciales de tu proyecto

4. Configurar variables de entorno:
```bash
cp .env.example .env
```
Edita `.env` y agrega tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_publica_de_supabase
```

5. Inicia el servidor de desarrollo:
```bash
npm run dev
```

6. Abre tu navegador en `http://localhost:5173`

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

## 📝 Próximas funcionalidades

- [x] Persistencia en base de datos real (Supabase)
- [x] Autenticación con Supabase Auth
- [ ] Categorías para tareas
- [ ] Fechas de vencimiento
- [ ] Notificaciones push
- [ ] Colaboración en tiempo real con Supabase Realtime
- [ ] Temas oscuro/claro
- [ ] PWA (Progressive Web App)
- [ ] Sincronización offline
- [ ] Exportar tareas (PDF, CSV)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios importantes:

1. Haz un fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Confirma tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Sube a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

Desarrollado con ❤️ usando React + TypeScript + Tailwind CSS
