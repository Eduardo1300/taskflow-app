import { User, Calendar, BarChart3, Users, Zap, Shield } from 'lucide-react';

export interface Guide {
  id: string;
  title: string;
  description: string;
  icon: any; // Lucide Icon component
  steps: string[];
  fullContent?: string; // Optional: for more detailed guide content
}

export const guidesData: Guide[] = [
  {
    id: 'getting-started',
    title: 'Primeros Pasos con TaskFlow',
    description: 'Aprende lo básico para empezar a usar TaskFlow eficientemente y maximizar tu productividad desde el día uno.',
    icon: User,
    steps: [
      'Crea tu primera tarea con título y descripción claros',
      'Organiza tus tareas por categorías y proyectos relevantes',
      'Establece fechas de vencimiento y niveles de prioridad',
      'Marca tareas como completadas para seguir tu progreso',
      'Explora las diferentes vistas: Lista, Kanban y Calendario'
    ],
    fullContent: `## Bienvenido a TaskFlow: Tu Guía de Inicio Rápido
TaskFlow está diseñado para ayudarte a organizar tus tareas y proyectos de manera intuitiva. Aquí te mostramos cómo empezar:

### 1. Crea tu Primera Tarea
Para añadir una nueva tarea, simplemente haz clic en el botón **"+"** en la parte superior de tu Dashboard o en la vista de proyecto que estés utilizando. Se abrirá un formulario donde podrás ingresar:
*   **Título:** Un nombre corto y descriptivo para tu tarea.
*   **Descripción:** Detalles adicionales, instrucciones o notas importantes.
*   **Fecha de Vencimiento:** La fecha límite para completar la tarea.
*   **Categoría:** Asigna la tarea a una categoría (ej. Trabajo, Personal, Estudio) para una mejor organización.
*   **Prioridad:** Define si es Baja, Media o Alta.
*   **Asignado a:** Si trabajas en equipo, asigna la tarea a un miembro específico.

### 2. Organiza tus Tareas
TaskFlow te ofrece varias formas de organizar tu trabajo:
*   **Categorías:** Agrupa tareas similares. Puedes crear tus propias categorías en la sección de configuración.
*   **Proyectos:** Ideal para agrupar tareas relacionadas con un objetivo más grande.
*   **Etiquetas:** Añade etiquetas personalizadas para filtros rápidos (ej. #urgente, #revisar).

### 3. Establece Fechas y Prioridades
No olvides asignar una **fecha de vencimiento** y una **prioridad** a cada tarea. Esto te ayudará a:
*   Visualizar tu carga de trabajo en el Calendario.
*   Priorizar lo más importante en tu Dashboard.
*   Recibir recordatorios automáticos antes de que una tarea venza.

### 4. Sigue tu Progreso
A medida que completas tareas, márcalas como realizadas. TaskFlow registrará tu progreso y te mostrará estadísticas en la sección de Analytics.

### 5. Explora las Vistas
TaskFlow ofrece múltiples vistas para adaptarse a tu estilo de trabajo:
*   **Lista:** Una visión general de todas tus tareas.
*   **Kanban:** Organiza tus tareas en columnas para visualizar el flujo de trabajo (ej. Pendiente, En Progreso, Completado).
*   **Calendario:** Ve tus tareas y eventos en un formato de calendario para una mejor gestión del tiempo.
¡Con estos pasos básicos, estás listo para empezar a ser más productivo con TaskFlow!
`
  },
  {
    id: 'calendar-setup',
    title: 'Configurar y Sincronizar tu Calendario',
    description: 'Aprende a integrar TaskFlow con tus calendarios externos favoritos y mantén toda tu agenda sincronizada.',
    icon: Calendar,
    steps: [
      'Accede a la sección de Integraciones desde tu perfil',
      'Selecciona tu proveedor de calendario (Google Calendar, Outlook)',
      'Autoriza la conexión segura con tu cuenta',
      'Configura opciones de sincronización (unidireccional o bidireccional)',
      'Verifica que tus eventos y tareas aparezcan en TaskFlow'
    ],
    fullContent: `## Integración de Calendarios: Mantén Todo en Sincronía
Conectar TaskFlow con tu calendario externo es crucial para tener una visión unificada de tus compromisos. Sigue estos pasos para configurarlo:

### 1. Accede a Integraciones
Desde tu Dashboard, haz clic en tu foto de perfil o nombre de usuario (usualmente en la esquina superior derecha) y selecciona **"Configuración"**. Luego, busca la opción **"Integraciones"** en el menú lateral.

### 2. Selecciona tu Calendario
Verás una lista de integraciones disponibles. Elige tu proveedor de calendario preferido, como **Google Calendar** o **Outlook Calendar**.

### 3. Autoriza la Conexión
Se te redirigirá a una página de autorización de tu proveedor de calendario. Asegúrate de iniciar sesión en la cuenta correcta y concede los permisos necesarios para que TaskFlow pueda leer y/o escribir eventos en tu calendario. Esta conexión es segura y tus datos se manejan con la máxima privacidad.

### 4. Configura Opciones de Sincronización
Una vez autorizado, volverás a TaskFlow. Aquí podrás elegir cómo quieres que funcione la sincronización:
*   **Sincronización Unidireccional:** TaskFlow envía tus tareas con fecha de vencimiento al calendario externo, pero los eventos del calendario externo no se importan a TaskFlow.
*   **Sincronización Bidireccional:** Las tareas de TaskFlow se envían a tu calendario externo, y los eventos de tu calendario externo se importan como tareas o eventos en TaskFlow (configuración personalizable).
*   También puedes elegir qué calendarios específicos quieres sincronizar si tienes varios.

### 5. Verifica la Sincronización
Una vez configurado, tus tareas con fechas de vencimiento en TaskFlow aparecerán automáticamente en tu calendario externo, y viceversa si elegiste la sincronización bidireccional. Puedes hacer una tarea de prueba para asegurarte de que todo funciona correctamente. ¡Ahora tienes una vista completa de tus compromisos en un solo lugar!
`
  },
  {
    id: 'team-collaboration',
    title: 'Optimiza la Colaboración en Equipo',
    description: 'Descubre cómo invitar a tu equipo, asignar roles y trabajar de forma conjunta en proyectos para lograr objetivos más grandes.',
    icon: Users,
    steps: [
      'Crea un nuevo proyecto o selecciona uno existente',
      'Invita a miembros del equipo utilizando sus direcciones de correo electrónico',
      'Asigna roles específicos (ej. Editor, Visor, Comentador) a cada colaborador',
      'Utiliza la sección de comentarios en tareas para la comunicación',
      'Revisa el historial de actividad para un seguimiento transparente'
    ],
    fullContent: `## Trabajo en Equipo: Colaboración Efectiva con TaskFlow
TaskFlow está diseñado para facilitar el trabajo en equipo. Colabora con tus compañeros y mantén a todos en la misma página con estas funcionalidades:

### 1. Crea o Selecciona un Proyecto
La colaboración se gestiona a nivel de proyecto. Para empezar, ve a la sección **"Proyectos"** y crea uno nuevo o selecciona un proyecto existente donde quieras colaborar.

### 2. Invita a Miembros del Equipo
Dentro de la configuración de tu proyecto (normalmente accesible desde un icono de engranaje o "Configuración del Proyecto"), busca la opción **"Invitar Miembros"**. Introduce las direcciones de correo electrónico de las personas con las que quieres colaborar y envía las invitaciones.
Los invitados recibirán un correo electrónico con un enlace para unirse al proyecto. Si aún no tienen una cuenta de TaskFlow, se les guiará para crear una.

### 3. Asigna Roles y Permisos
Al invitar a alguien o después de que se una, puedes asignarles un rol que determine sus permisos dentro del proyecto:
*   **Editor:** Puede crear, editar y eliminar tareas y subtareas, así como invitar a otros.
*   **Visor:** Puede ver todas las tareas y el progreso, pero no puede realizar cambios.
*   **Comentador:** Puede ver las tareas y añadir comentarios, pero no editar su contenido.
Puedes cambiar los roles en cualquier momento desde la configuración del proyecto.

### 4. Comunicación en Tareas
Cada tarea tiene una sección de **"Comentarios"**. Utiliza este espacio para:
*   Hacer preguntas específicas sobre una tarea.
*   Compartir actualizaciones de progreso.
*   Pedir feedback o asistencia a tus colaboradores.
*   Adjuntar archivos relevantes a la discusión.
Todos los participantes de la tarea recibirán notificaciones sobre nuevos comentarios.

### 5. Historial de Actividad
Para mantener la transparencia y la trazabilidad, cada tarea y proyecto tiene un **"Historial de Actividad"**. Aquí puedes ver quién hizo qué y cuándo, incluyendo:
*   Creación y eliminación de tareas.
*   Cambios de estado o prioridad.
*   Actualizaciones de fechas de vencimiento.
*   Comentarios y asignaciones.
¡Con estas herramientas, tu equipo puede colaborar de manera eficiente y efectiva en todos tus proyectos!
`
  },
  {
    id: 'analytics-insights',
    title: 'Análisis y Métricas de Productividad',
    description: 'Comprende tu productividad y la de tu equipo con análisis detallados, identificando patrones y oportunidades de mejora.',
    icon: BarChart3,
    steps: [
      'Navega a la sección de Analytics en tu Dashboard',
      'Revisa tu tasa de finalización de tareas y tendencias históricas',
      'Analiza la distribución de tareas por categoría y prioridad',
      'Identifica tus días y horas más productivas',
      'Obtén recomendaciones personalizadas para optimizar tu flujo de trabajo'
    ],
    fullContent: `## Analytics: Desbloquea Insights de Tu Productividad
La sección de Analytics de TaskFlow te proporciona una visión profunda de cómo trabajas, ayudándote a identificar fortalezas y áreas de mejora. Aquí te explicamos qué puedes encontrar y cómo usarlo:

### 1. Accede a la Sección de Analytics
Simplemente haz clic en **"Analytics"** en el menú lateral de tu Dashboard.

### 2. Métricas Clave de Rendimiento
La página de Analytics muestra varios gráficos y estadísticas:
*   **Tasa de Finalización:** El porcentaje de tareas que completas. Un indicador clave de tu eficiencia.
*   **Distribución de Tareas:** Gráficos que muestran tus tareas divididas por categoría (ej. Trabajo, Personal) y por prioridad (Alta, Media, Baja).
*   **Tendencias de Productividad:** Observa cómo tu rendimiento cambia a lo largo de semanas y meses.
*   **Días y Horas Más Productivas:** Descubre cuándo eres más eficiente para programar tus tareas más importantes.
*   **Riesgo de Burnout:** Una evaluación basada en tu carga de trabajo para ayudarte a mantener un equilibrio saludable.
*   **Previsiones:** Predicciones sobre tu capacidad para completar tareas en el futuro cercano.

### 3. Filtrado por Rango de Tiempo
En la parte superior de la página, puedes seleccionar el rango de tiempo (semana, mes, trimestre) para el cual deseas ver los datos. Esto te permite analizar tu rendimiento en diferentes periodos.

### 4. Recomendaciones Personalizadas
TaskFlow utiliza inteligencia artificial para ofrecerte recomendaciones basadas en tus patrones de trabajo. Estas pueden incluir sugerencias para:
*   Reprogramar tareas.
*   Ajustar tu carga de trabajo.
*   Enfocarte en ciertas categorías.
*   Tomar descansos.

### 5. Exportar tus Reportes
Para compartir tus insights o guardarlos para referencia futura, utiliza el botón **"Exportar PDF"**. Esto generará un documento PDF con todos los gráficos y estadísticas de tu sección de Analytics.
¡Usa Analytics para tomar decisiones informadas y mejorar continuamente tu forma de trabajar!
`
  },
  {
    id: 'kanban-board',
    title: 'Dominando la Vista Kanban',
    description: 'Organiza y visualiza tu flujo de trabajo de manera intuitiva con la potente vista Kanban de TaskFlow.',
    icon: Zap,
    steps: [
      'Accede a la sección Kanban desde tu menú principal',
      'Crea y personaliza columnas para representar etapas de tu flujo de trabajo',
      'Arrastra y suelta tareas entre columnas para actualizar su estado',
      'Filtra y agrupa tareas para obtener una visión más clara de tu progreso',
      'Identifica cuellos de botella y optimiza tus procesos'
    ],
    fullContent: `## Kanban: Visualiza y Optimiza Tu Flujo de Trabajo
La vista Kanban es una herramienta visual increíblemente efectiva para gestionar el flujo de trabajo y el progreso de las tareas. Con TaskFlow, puedes adaptar tu tablero Kanban a tus necesidades.

### 1. Accede a la Vista Kanban
Simplemente haz clic en **"Kanban"** en el menú lateral de tu Dashboard.

### 2. Columnas Personalizables
Un tablero Kanban se compone de columnas, cada una representando una etapa en tu flujo de trabajo. Las columnas predeterminadas suelen ser "Pendiente", "En Progreso" y "Completado", pero puedes:
*   **Crear nuevas columnas:** Para etapas específicas de tu proyecto (ej. "Revisión", "Aprobación", "En Espera").
*   **Renombrar columnas:** Adapta los nombres a la terminología de tu equipo.
*   **Reordenar columnas:** Ajusta el orden para reflejar tu proceso.

### 3. Arrastra y Suelta Tareas
La magia de Kanban reside en su simplicidad. Cada tarea se representa como una "tarjeta". Para actualizar el estado de una tarea, simplemente **arrastra y suelta** la tarjeta de una columna a otra.
*   Mueve una tarea de "Pendiente" a "En Progreso" cuando empieces a trabajar en ella.
*   De "En Progreso" a "Revisión" cuando esté lista para feedback.
*   Y finalmente a "Completado" cuando esté terminada.

### 4. Filtra y Agrupa Tareas
Para enfocarte en lo que importa, utiliza las opciones de filtro y agrupación en la parte superior del tablero. Puedes:
*   **Filtrar por asignado:** Ve solo las tareas de un miembro específico del equipo.
*   **Filtrar por prioridad:** Enfócate en las tareas de alta prioridad.
*   **Agrupar por categoría o fecha:** Organiza las tarjetas de diferentes maneras para obtener nuevas perspectivas.

### 5. Identifica Cuellos de Botella
La vista Kanban te permite ver rápidamente dónde se acumulan las tareas. Si una columna tiene muchas tarjetas estancadas, es una señal de un posible cuello de botella en tu flujo de trabajo. Esto te ayuda a:
*   Distribuir la carga de trabajo de manera más efectiva.
*   Identificar y resolver problemas de proceso.
¡Con el tablero Kanban, tu equipo puede visualizar el trabajo, limitar el trabajo en curso y maximizar la eficiencia!
`
  },
  {
    id: 'security-setup',
    title: 'Configuración de Seguridad y Privacidad',
    description: 'Protege tu cuenta y tus datos con las avanzadas opciones de seguridad y privacidad de TaskFlow.',
    icon: Shield,
    steps: [
      'Accede a la sección de Configuración de Seguridad y Privacidad',
      'Cambia tu contraseña regularmente para mantener tu cuenta segura',
      'Habilita la autenticación de dos factores (2FA) para una capa extra de protección',
      'Revisa y gestiona los permisos de los colaboradores en tus proyectos',
      'Ajusta tu configuración de privacidad para controlar qué información compartes'
    ],
    fullContent: `## Tu Seguridad es Nuestra Prioridad: Configuración de Cuenta
En TaskFlow, nos tomamos muy en serio la seguridad de tus datos. Aquí te mostramos cómo puedes proteger tu cuenta:

### 1. Accede a Configuración de Seguridad
Desde tu Dashboard, haz clic en tu foto de perfil o nombre de usuario y selecciona **"Configuración"**. Luego, busca la opción **"Privacidad y Seguridad"** en el menú lateral.

### 2. Cambia tu Contraseña
Es una buena práctica cambiar tu contraseña regularmente. En esta sección, encontrarás la opción **"Cambiar Contraseña"**. Asegúrate de usar una contraseña fuerte que combine letras mayúsculas y minúsculas, números y símbolos.

### 3. Autenticación de Dos Factores (2FA)
Recomendamos encarecidamente habilitar la **autenticación de dos factores (2FA)**. Esto añade una capa extra de seguridad al requerir un código de tu teléfono (o de una aplicación de autenticación) además de tu contraseña cada vez que inicias sesión. Si alguien obtiene tu contraseña, no podrá acceder a tu cuenta sin tu segundo factor.

### 4. Gestión de Permisos de Colaboradores
En la configuración de cada proyecto, puedes revisar y ajustar los permisos de cada colaborador. Asegúrate de que cada persona tenga el nivel de acceso adecuado para su rol:
*   **Editor:** Para quienes necesitan modificar el contenido.
*   **Visor:** Para quienes solo necesitan información.
*   **Comentador:** Para quienes solo necesitan participar en discusiones.

### 5. Configuración de Privacidad
También puedes ajustar tu configuración de privacidad global:
*   Controla la visibilidad de tu perfil.
*   Decide si otros usuarios pueden invitarte a proyectos.
*   Gestiona la información que se comparte en integraciones de terceros.
Revisa estas opciones periódicamente para asegurarte de que tu cuenta esté siempre protegida según tus preferencias.
`
  }
];
