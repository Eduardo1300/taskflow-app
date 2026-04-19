<script setup lang="ts">
import { ref } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import { FileText, Search, Copy, Check, ExternalLink, BookOpen, Code, Zap, Shield, Terminal, ChevronRight, Layers, Globe, FolderKanban, BarChart3 } from 'lucide-vue-next';

const activeSection = ref('overview');
const copied = ref(false);

const sections = [
  { id: 'overview', title: 'Resumen', icon: BookOpen },
  { id: 'getting-started', title: 'Comenzar', icon: Zap },
  { id: 'tasks', title: 'Gestión de Tareas', icon: FolderKanban },
  { id: 'api', title: 'Referencia API', icon: Code },
  { id: 'integrations', title: 'Integraciones', icon: Globe }
];

const apiEndpoints = ref([
  { method: 'GET', path: '/tasks', desc: 'Obtener todas las tareas del usuario', status: 'Activo', example: null },
  { method: 'POST', path: '/tasks', desc: 'Crear una nueva tarea', status: 'Activo', example: null },
  { method: 'GET', path: '/tasks/:id', desc: 'Obtener una tarea específica', status: 'Activo', example: null },
  { method: 'PUT', path: '/tasks/:id', desc: 'Actualizar una tarea', status: 'Activo', example: null },
  { method: 'DELETE', path: '/tasks/:id', desc: 'Eliminar una tarea', status: 'Activo', example: null },
  { method: 'GET', path: '/tasks/stats', desc: 'Obtener estadísticas de tareas', status: 'Activo', example: null },
  { method: 'GET', path: '/categories', desc: 'Obtener todas las categorías', status: 'Activo', example: null },
  { method: 'POST', path: '/categories', desc: 'Crear una categoría', status: 'Activo', example: null },
  { method: 'PUT', path: '/categories/:id', desc: 'Actualizar una categoría', status: 'Activo', example: null },
  { method: 'DELETE', path: '/categories/:id', desc: 'Eliminar una categoría', status: 'Activo', example: null },
  { method: 'GET', path: '/goals', desc: 'Obtener todas las metas', status: 'Activo', example: null },
  { method: 'POST', path: '/goals', desc: 'Crear una meta', status: 'Activo', example: null },
  { method: 'GET', path: '/notifications', desc: 'Obtener notificaciones', status: 'Activo', example: null },
  { method: 'PUT', path: '/notifications/:id/read', desc: 'Marcar notificación como leída', status: 'Activo', example: null },
  { method: 'GET', path: '/auth/me', desc: 'Obtener perfil del usuario', status: 'Activo', example: null },
  { method: 'PUT', path: '/profiles/me', desc: 'Actualizar perfil del usuario', status: 'Activo', example: null }
]);

const integrations = ref([
  { name: 'Slack', desc: 'Recibe notificaciones en canales de Slack', icon: '💬', connected: false },
  { name: 'GitHub', desc: 'Vincula commits a tareas', icon: '🐙', connected: false },
  { name: 'Google Calendar', desc: 'Sincroniza tareas con el Calendario', icon: '📅', connected: false },
  { name: 'Jira', desc: 'Sincronización bidireccional con Jira', icon: '🎯', connected: false },
  { name: 'Notion', desc: 'Incrusta páginas de Notion en tareas', icon: '📝', connected: false },
  { name: 'Figma', desc: 'Vista previa de diseños de Figma', icon: '🎨', connected: false }
]);

function copyApiKey() {
  copied.value = true;
  setTimeout(() => copied.value = false, 2000);
}

function getMethodColor(method: string) {
  switch (method) {
    case 'GET': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'POST': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'PUT': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'DELETE': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default: return 'bg-gray-100 text-gray-700';
  }
}
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900">
    <Sidebar />

    <div class="flex-1 flex flex-col">
      <Header />

      <main class="flex-1 p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-4">
            <div class="bg-gradient-to-br from-purple-500 to-blue-600 p-4 rounded-2xl shadow-xl">
              <BookOpen class="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Documentación API</h1>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Referencia completa de la API de TaskFlow</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col lg:flex-row gap-6">
          <div class="lg:w-64 space-y-2">
            <button 
              v-for="section in sections"
              :key="section.id"
              @click="activeSection = section.id"
              :class="['w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all', activeSection === section.id ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700']"
            >
              <component :is="section.icon" class="h-5 w-5" />
              <span>{{ section.title }}</span>
            </button>
          </div>

          <div class="flex-1">
            <div v-if="activeSection === 'overview'" class="space-y-6">
              <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div class="flex items-center mb-4">
                  <BookOpen class="h-6 w-6 text-blue-600 mr-3" />
                  <h2 class="text-xl font-semibold text-gray-900 dark:text-white">API de TaskFlow</h2>
                </div>
                <p class="text-gray-600 dark:text-gray-300 mb-4">
                  TaskFlow ofrece una API REST completa para integrar con tus aplicaciones. La API usa autenticación JWT y devuelve respuestas en formato JSON.
                </p>
                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <h4 class="text-blue-800 dark:text-blue-300 font-semibold mb-2 flex items-center">
                    <Zap class="h-5 w-5 mr-2" />
                    Características Principales
                  </h4>
                  <ul class="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
                    <li>• Gestión inteligente de tareas</li>
                    <li>• Vistas Kanban y Calendario</li>
                    <li>• Análisis detallados</li>
                    <li>• Integraciones con herramientas populares</li>
                  </ul>
                </div>
              </div>

              <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Primeros Pasos</h3>
                <div class="space-y-4">
                  <div class="flex items-start">
                    <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">1</div>
                    <div>
                      <h4 class="font-semibold text-gray-900 dark:text-white">Regístrate</h4>
                      <p class="text-gray-600 dark:text-gray-300 text-sm">Crea una cuenta en TaskFlow</p>
                    </div>
                  </div>
                  <div class="flex items-start">
                    <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">2</div>
                    <div>
                      <h4 class="font-semibold text-gray-900 dark:text-white">Obtén tu token</h4>
                      <p class="text-gray-600 dark:text-gray-300 text-sm">Usa /auth/login para obtener un JWT</p>
                    </div>
                  </div>
                  <div class="flex items-start">
                    <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">3</div>
                    <div>
                      <h4 class="font-semibold text-gray-900 dark:text-white">Haz requests</h4>
                      <p class="text-gray-600 dark:text-gray-300 text-sm">Usa el token en el header Authorization</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="activeSection === 'getting-started'" class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center mb-4">
                <Zap class="h-6 w-6 text-blue-600 mr-3" />
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Comenzar</h2>
              </div>
              <p class="text-gray-600 dark:text-gray-300 mb-4">Aprende a usar la API de TaskFlow en pocos minutos.</p>
              
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Ejemplo: Crear una tarea</h3>
              <div class="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 overflow-x-auto">
                <pre class="text-green-400 text-sm font-mono">{
  "title": "Mi primera tarea",
  "description": "Descripción de la tarea",
  "priority": "medium",
  "due_date": "2024-12-31"
}</pre>
              </div>
            </div>

            <div v-else-if="activeSection === 'tasks'" class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center mb-4">
                <FolderKanban class="h-6 w-6 text-blue-600 mr-3" />
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Gestión de Tareas</h2>
              </div>
              <p class="text-gray-600 dark:text-gray-300 mb-4">La API de tareas permite crear, leer, actualizar y eliminar tareas.</p>
              
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Propiedades de la Tarea</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th class="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Propiedad</th>
                      <th class="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Tipo</th>
                      <th class="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Descripción</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td class="px-4 py-3 font-mono text-blue-600 dark:text-blue-400">title</td>
                      <td class="px-4 py-3 text-gray-600 dark:text-gray-300">string</td>
                      <td class="px-4 py-3 text-gray-600 dark:text-gray-300">El título de la tarea</td>
                    </tr>
                    <tr>
                      <td class="px-4 py-3 font-mono text-blue-600 dark:text-blue-400">description</td>
                      <td class="px-4 py-3 text-gray-600 dark:text-gray-300">string</td>
                      <td class="px-4 py-3 text-gray-600 dark:text-gray-300">Descripción con formato</td>
                    </tr>
                    <tr>
                      <td class="px-4 py-3 font-mono text-blue-600 dark:text-blue-400">priority</td>
                      <td class="px-4 py-3 text-gray-600 dark:text-gray-300">'low' | 'medium' | 'high'</td>
                      <td class="px-4 py-3 text-gray-600 dark:text-gray-300">Nivel de urgencia</td>
                    </tr>
                    <tr>
                      <td class="px-4 py-3 font-mono text-blue-600 dark:text-blue-400">due_date</td>
                      <td class="px-4 py-3 text-gray-600 dark:text-gray-300">string</td>
                      <td class="px-4 py-3 text-gray-600 dark:text-gray-300">Fecha límite (YYYY-MM-DD)</td>
                    </tr>
                    <tr>
                      <td class="px-4 py-3 font-mono text-blue-600 dark:text-blue-400">completed</td>
                      <td class="px-4 py-3 text-gray-600 dark:text-gray-300">boolean</td>
                      <td class="px-4 py-3 text-gray-600 dark:text-gray-300">Estado de completado</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-else-if="activeSection === 'api'" class="space-y-4">
              <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="grid grid-cols-4 border-b border-gray-200 dark:border-gray-700 p-4 font-medium text-gray-500">
                  <span>Método</span><span>Ruta</span><span>Descripción</span><span>Estado</span>
                </div>
                <div v-for="ep in apiEndpoints" :key="ep.path" class="grid grid-cols-4 border-b border-gray-100 dark:border-gray-700 p-4 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <span :class="['px-2 py-1 rounded text-xs font-medium', getMethodColor(ep.method)]">{{ ep.method }}</span>
                  <code class="text-sm text-gray-900 dark:text-white font-mono">{{ ep.path }}</code>
                  <span class="text-sm text-gray-500">{{ ep.desc }}</span>
                  <span class="text-green-500 text-sm">{{ ep.status }}</span>
                </div>
              </div>
            </div>

            <div v-else-if="activeSection === 'integrations'" class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center mb-4">
                <Globe class="h-6 w-6 text-blue-600 mr-3" />
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Integraciones</h2>
              </div>
              <p class="text-gray-600 dark:text-gray-300 mb-4">TaskFlow se integra con herramientas populares.</p>
              
              <div class="grid md:grid-cols-2 gap-4">
                <div v-for="integration in integrations" :key="integration.name" class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 flex items-center space-x-4 hover:shadow-lg transition-shadow cursor-pointer">
                  <div class="w-12 h-12 bg-white dark:bg-gray-600 rounded-xl flex items-center justify-center text-2xl">
                    {{ integration.icon }}
                  </div>
                  <div>
                    <h4 class="font-semibold text-gray-900 dark:text-white">{{ integration.name }}</h4>
                    <p class="text-gray-600 dark:text-gray-300 text-sm">{{ integration.desc }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>