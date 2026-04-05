import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Book, 
  ChevronRight, 
  Search, 
  Menu, 
  X,
  ArrowLeft,
  FolderKanban,
  BarChart3,
  Zap,
  Globe,
  Terminal,
  Code,
  Layers,
  HelpCircle,
  Lightbulb,
  Rocket
} from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  icon: React.ElementType;
  content: DocSubsection[];
}

interface DocSubsection {
  id: string;
  title: string;
  content: React.ReactNode;
  example?: string;
}

const docSections: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Comenzar',
    icon: Rocket,
    content: [
      {
        id: 'introduction',
        title: 'Introducción',
        content: (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              TaskFlow es una aplicación moderna de gestión de tareas construida con React, TypeScript y Supabase. 
              Proporciona una interfaz poderosa pero intuitiva para que individuos y equipos organicen, rastreen 
              y completen sus tareas de manera eficiente.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
              <h4 className="text-blue-800 dark:text-blue-300 font-semibold mb-2 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Características Principales
              </h4>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
                <li>• Gestión inteligente de tareas con sugerencias basadas en IA</li>
                <li>• Vistas Kanban y Calendario para organización flexible</li>
                <li>• Colaboración en tiempo real con miembros del equipo</li>
                <li>• Análisis detallados y conocimientos de productividad</li>
                <li>• Integraciones fluidas con herramientas populares</li>
              </ul>
            </div>
          </>
        ),
        example: `// Ejemplo de inicio rápido
const task = await createTask({
  title: "Completar propuesta del proyecto",
  priority: "high",
  dueDate: new Date("2024-01-15"),
  assignee: "id-miembro-del-equipo"
});`
      },
      {
        id: 'installation',
        title: 'Instalación',
        content: (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Para comenzar con TaskFlow, puedes usar nuestra versión alojada o desplegarla tú mismo.
            </p>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Usando npm</h4>
            <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 mb-4 overflow-x-auto">
              <pre className="text-green-400 text-sm font-mono">
{`# Instalar TaskFlow CLI globalmente
npm install -g @taskflow/cli

# Crear un nuevo proyecto
taskflow init mi-proyecto

# Navegar al directorio del proyecto
cd mi-proyecto

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev`}
              </pre>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Usando Docker</h4>
            <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm font-mono">
{`# Descargar la imagen oficial
docker pull taskflow/app:latest

# Ejecutar el contenedor
docker run -d -p 3000:3000 taskflow/app:latest

# Con configuración personalizada
docker run -d -p 3000:3000 \\
  -v taskflow-config:/app/config \\
  taskflow/app:latest`}
              </pre>
            </div>
          </>
        ),
        example: `npm install @taskflow/core @taskflow/ui`
      },
      {
        id: 'quick-start',
        title: 'Guía de Inicio Rápido',
        content: (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Sigue estos pasos para crear tu primera tarea y empezar a ser productivo.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Crear una cuenta</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Regístrate gratis en <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">taskflow.app</code> 
                    o ejecuta localmente y navega a <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">/register</code>
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Crear tu primer espacio de trabajo</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Haz clic en el botón "+" en la barra lateral para crear un nuevo espacio de trabajo para tus proyectos
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Añadir tareas</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Usa el botón "Nueva Tarea" o presiona <kbd className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm">Ctrl + K</kbd> para crear tareas rápidamente
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Organizar y colaborar</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Arrastra tareas entre columnas, asigna miembros del equipo y sigue el progreso en tiempo real
                  </p>
                </div>
              </div>
            </div>
          </>
        )
      }
    ]
  },
  {
    id: 'core-concepts',
    title: 'Conceptos Básicos',
    icon: Layers,
    content: [
      {
        id: 'workspaces',
        title: 'Espacios de Trabajo',
        content: (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Los espacios de trabajo son los contenedores de nivel superior para tus proyectos. Cada espacio de trabajo puede contener 
              múltiples tableros, tareas y miembros del equipo.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Espacio de Trabajo Personal</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Para gestión de tareas individuales con proyectos privados
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Espacio de Trabajo de Equipo</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Espacio compartido para colaboración con acceso basado en roles
                </p>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Crear un Espacio de Trabajo</h4>
            <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm font-mono">
{`import { createWorkspace } from '@taskflow/core';

// Crear un nuevo espacio de trabajo
const workspace = await createWorkspace({
  name: 'Campaña de Marketing',
  type: 'team',
  members: ['user-id-1', 'user-id-2'],
  settings: {
    isPublic: false,
    defaultView: 'kanban'
  }
});`}
              </pre>
            </div>
          </>
        ),
        example: `const workspace = await taskflow.workspaces.create({ name: "Mi Proyecto" });`
      },
      {
        id: 'tasks',
        title: 'Tareas',
        content: (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Las tareas son las unidades fundamentales de trabajo en TaskFlow. Cada tarea puede contener descripciones ricas, 
              subtareas, archivos adjuntos, comentarios y más.
            </p>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Propiedades de la Tarea</h4>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Propiedad</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Tipo</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Descripción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-4 py-3 font-mono text-blue-600 dark:text-blue-400">title</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">string</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">El título de la tarea</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-blue-600 dark:text-blue-400">description</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">string</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Descripción con formato</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-blue-600 dark:text-blue-400">priority</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">'low' | 'medium' | 'high' | 'urgent'</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Nivel de urgencia de la tarea</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-blue-600 dark:text-blue-400">dueDate</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Date</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Fecha límite de la tarea</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-blue-600 dark:text-blue-400">assignee</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">User | null</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Responsable de la tarea</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        ),
        example: `const task = await taskflow.tasks.create({ title: "Revisión de diseño", priority: "high" });`
      },
      {
        id: 'views',
        title: 'Vistas',
        content: (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              TaskFlow soporta múltiples vistas para ayudarte a visualizar y gestionar tareas según tus necesidades.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
                <FolderKanban className="h-8 w-8 mb-2" />
                <h4 className="font-semibold">Kanban</h4>
                <p className="text-sm opacity-90">Arrastra y suelta tareas entre columnas personalizables</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white">
                <CalendarIcon className="h-8 w-8 mb-2" />
                <h4 className="font-semibold">Calendario</h4>
                <p className="text-sm opacity-90">Ver tareas en una línea de tiempo de calendario</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-white">
                <BarChart3 className="h-8 w-8 mb-2" />
                <h4 className="font-semibold">Análisis</h4>
                <p className="text-sm opacity-90">Rastrea la productividad con conocimientos detallados</p>
              </div>
            </div>
          </>
        )
      }
    ]
  },
  {
    id: 'guides',
    title: 'Guías',
    icon: Book,
    content: [
      {
        id: 'task-management',
        title: 'Gestión de Tareas',
        content: (
          <>
            <p className="text-gray-600 dark-text-gray-300 mb-4">
              Aprende a gestionar tareas efectivamente en TaskFlow, desde la creación hasta la finalización.
            </p>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Crear Tareas</h4>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              Las tareas pueden crearse a través de la UI o programáticamente usando nuestra API. Cada tarea soporta 
              metadatos ricos incluyendo prioridades, fechas límite, etiquetas y campos personalizados.
            </p>
            <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 overflow-x-auto mb-4">
              <pre className="text-green-400 text-sm font-mono">
{`// Crear una tarea con todas las opciones
const task = await taskflow.tasks.create({
  title: 'Completar Informe del Q4',
  description: 'Preparar informe trimestral completo',
  priority: 'high',
  dueDate: new Date('2024-03-31'),
  labels: ['trabajo', 'informe', 'q4'],
  assignee: 'user-123',
  watchers: ['user-456', 'user-789'],
  customFields: {
    estimatedHours: 8,
    billable: true
  }
});`}
              </pre>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Subtareas</h4>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              Divide tareas complejas en subtareas manejables. El progreso se calcula automáticamente 
              basado en las subtareas completadas.
            </p>
            <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm font-mono">
{`// Añadir subtareas a una tarea
await taskflow.tasks.addSubtask(taskId, {
  title: 'Recopilar datos del Q1-Q3',
  completed: false
});

await taskflow.tasks.addSubtask(taskId, {
  title: 'Crear visualizaciones',
  completed: false
});

await taskflow.tasks.addSubtask(taskId, {
  title: 'Escribir resumen ejecutivo',
  completed: false
});`}
              </pre>
            </div>
          </>
        ),
        example: `await taskflow.tasks.create({ title: "Nueva tarea" })`
      },
      {
        id: 'collaboration',
        title: 'Colaboración',
        content: (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              TaskFlow facilita trabajar juntos con tu equipo. Comparte espacios de trabajo, asigna tareas 
              y comunica en tiempo real.
            </p>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Miembros del Equipo</h4>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600 dark:text-gray-300">Añadir miembros del equipo por email</span>
                <span className="text-sm text-green-600 dark:text-green-400">✓ Invitaciones enviadas</span>
              </div>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white font-semibold text-sm">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold text-sm">
                  +5
                </div>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Comentarios y Actividad</h4>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              Mantén las conversaciones organizadas con comentarios específicos de tareas. Toda la actividad se rastrea y 
              es visible en el historial de la tarea.
            </p>
            <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm font-mono">
{`// Añadir un comentario a una tarea
await taskflow.comments.create({
  taskId: task.id,
  content: 'Se actualizaron los mockups de diseño según los comentarios.',
  mentions: ['user-456']
});

// Suscribirse a actualizaciones en tiempo real
taskflow.tasks.subscribe(taskId, (update) => {
  console.log('Tarea actualizada:', update);
});`}
              </pre>
            </div>
          </>
        ),
        example: `await taskflow.workspaces.addMember(workspaceId, "usuario@ejemplo.com")`
      }
    ]
  },
  {
    id: 'api',
    title: 'Referencia API',
    icon: Code,
    content: [
      {
        id: 'authentication',
        title: 'Autenticación',
        content: (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              TaskFlow usa Supabase para autenticación. Puedes autenticarte usando email/contraseña, 
              proveedores OAuth o enlaces mágicos.
            </p>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Inicialización del Cliente</h4>
            <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 overflow-x-auto mb-4">
              <pre className="text-green-400 text-sm font-mono">
{`import api from './lib/api';

const API_URL = 'https://tu-url-api.com/api';`}
              </pre>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Métodos de Autenticación</h4>
            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Email y Contraseña</h5>
                <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-3 overflow-x-auto">
                  <pre className="text-green-400 text-sm font-mono">
{`const { user, session } = await client.auth.signUp({
  email: 'usuario@ejemplo.com',
  password: 'contraseña-segura'
});`}
                  </pre>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">OAuth (Google)</h5>
                <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-3 overflow-x-auto">
                  <pre className="text-green-400 text-sm font-mono">
{`const { user, session } = await client.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://taskflow.app/auth/callback'
  }
});`}
                  </pre>
                </div>
              </div>
            </div>
          </>
        ),
        example: `const { user } = await client.auth.signInWithPassword({ email, password })`
      },
      {
        id: 'tasks-api',
        title: 'API de Tareas',
        content: (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Referencia completa para la API de Tareas.
            </p>
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded text-sm mr-2">GET</span>
                  Listar Tareas
                </h4>
                <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm font-mono">
{`// Listar todas las tareas en un espacio de trabajo
const tasks = await client
  .from('tasks')
  .select('*, labels(*), assignee(*)')
  .eq('workspace_id', workspaceId)
  .order('created_at', { ascending: false });`}
                  </pre>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded text-sm mr-2">POST</span>
                  Crear Tarea
                </h4>
                <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm font-mono">
{`const { data, error } = await client
  .from('tasks')
  .insert({
    title: 'Nuevo título de tarea',
    description: 'Descripción de la tarea',
    workspace_id: workspaceId,
    priority: 'medium',
    due_date: '2024-12-31'
  })
  .select()
  .single();`}
                  </pre>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded text-sm mr-2">PATCH</span>
                  Actualizar Tarea
                </h4>
                <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm font-mono">
{`const { data, error } = await client
  .from('tasks')
  .update({
    status: 'completed',
    completed_at: new Date().toISOString()
  })
  .eq('id', taskId)
  .select()
  .single();`}
                  </pre>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded text-sm mr-2">DELETE</span>
                  Eliminar Tarea
                </h4>
                <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm font-mono">
{`const { error } = await client
  .from('tasks')
  .delete()
  .eq('id', taskId);`}
                  </pre>
                </div>
              </div>
            </div>
          </>
        )
      }
    ]
  },
  {
    id: 'integrations',
    title: 'Integraciones',
    icon: Globe,
    content: [
      {
        id: 'available-integrations',
        title: 'Integraciones Disponibles',
        content: (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              TaskFlow se integra con herramientas populares para optimizar tu flujo de trabajo.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {[
                { name: 'Slack', desc: 'Recibe notificaciones en canales de Slack', icon: '💬' },
                { name: 'GitHub', desc: 'Vincula commits a tareas', icon: '🐙' },
                { name: 'Google Calendar', desc: 'Sincroniza tareas con el Calendario', icon: '📅' },
                { name: 'Jira', desc: 'Sincronización bidireccional con Jira', icon: '🎯' },
                { name: 'Notion', desc: 'Incrusta páginas de Notion en tareas', icon: '📝' },
                { name: 'Figma', desc: 'Vista previa de diseños de Figma', icon: '🎨' }
              ].map((integration) => (
                <div key={integration.name} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center space-x-4 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-2xl">
                    {integration.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{integration.name}</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{integration.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ),
        example: `await taskflow.integrations.connect('slack', { channel: '#general' })`
      }
    ]
  }
];

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

const DocumentationPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('introduction');
  const [activeSubsection, setActiveSubsection] = useState('introduction');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleBackToApp = () => {
    navigate('/dashboard');
  };

  const currentSection = docSections.find(s => s.id === activeSection) || docSections[0];
  const currentSubsection = currentSection.content.find(s => s.id === activeSubsection) || currentSection.content[0];

  const filteredSections = searchQuery 
    ? docSections.filter(section => 
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.content.some(sub => 
          sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          typeof sub.content === 'string' && sub.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : docSections;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">TaskFlow Docs</span>
          </Link>
        </div>

        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar documentación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
            />
            <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden sm:inline-flex items-center px-2 py-0.5 text-xs text-gray-400 bg-gray-200 dark:bg-gray-600 rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/help" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <HelpCircle className="h-5 w-5 mr-1" />
            <span className="hidden sm:inline">Ayuda</span>
          </Link>
          <a 
            href="https://github.com/taskflow/taskflow" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </header>

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-16 bottom-0 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto transition-transform z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-6">
          <div>
            <button onClick={handleBackToApp} className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la App
            </button>
          </div>
          
          {filteredSections.map((section) => (
            <div key={section.id}>
              <button
                onClick={() => {
                  setActiveSection(section.id);
                  setActiveSubsection(section.content[0].id);
                }}
                className={`flex items-center w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <section.icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{section.title}</span>
              </button>
              
              {activeSection === section.id && (
                <div className="ml-8 mt-2 space-y-1">
                  {section.content.map((subsection) => (
                    <button
                      key={subsection.id}
                      onClick={() => setActiveSubsection(subsection.id)}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeSubsection === subsection.id
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {subsection.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main 
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? 'ml-72' : 'ml-0'
        }`}
      >
        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-8">
            <span>Docs</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-blue-600 dark:text-blue-400">{currentSection.title}</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-900 dark:text-white">{currentSubsection.title}</span>
          </div>

          {/* Content */}
          <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
            <div className="flex items-center mb-6">
              <currentSection.icon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-4" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentSubsection.title}
              </h1>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {currentSubsection.content}
            </div>

            {/* Code Example */}
            {currentSubsection.example && (
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Terminal className="h-5 w-5 mr-2" />
                  Ejemplo
                </h3>
                <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm font-mono">
                    {currentSubsection.example}
                  </pre>
                </div>
              </div>
            )}
          </article>

          {/* Navigation Footer */}
          <div className="flex justify-between items-center">
            <button 
              onClick={() => {
                const sectionIndex = docSections.findIndex(s => s.id === activeSection);
                const subsectionIndex = currentSection.content.findIndex(s => s.id === activeSubsection);
                if (subsectionIndex > 0) {
                  setActiveSubsection(currentSection.content[subsectionIndex - 1].id);
                } else if (sectionIndex > 0) {
                  const prevSection = docSections[sectionIndex - 1];
                  setActiveSection(prevSection.id);
                  setActiveSubsection(prevSection.content[prevSection.content.length - 1].id);
                }
              }}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ChevronRight className="h-5 w-5 rotate-180 mr-2" />
              Anterior
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {docSections.reduce((acc, s) => acc + s.content.length, 0)} artículos
              </span>
            </div>

            <button 
              onClick={() => {
                const sectionIndex = docSections.findIndex(s => s.id === activeSection);
                const subsectionIndex = currentSection.content.findIndex(s => s.id === activeSubsection);
                if (subsectionIndex < currentSection.content.length - 1) {
                  setActiveSubsection(currentSection.content[subsectionIndex + 1].id);
                } else if (sectionIndex < docSections.length - 1) {
                  const nextSection = docSections[sectionIndex + 1];
                  setActiveSection(nextSection.id);
                  setActiveSubsection(nextSection.content[0].id);
                }
              }}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Siguiente
              <ChevronRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocumentationPage;
