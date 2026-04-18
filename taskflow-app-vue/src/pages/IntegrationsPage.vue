<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import {
  Calendar, Mail, MessageSquare, Webhook, Plus, Trash2,
  CheckCircle, AlertCircle, Zap, Bot, X, Link
} from 'lucide-vue-next';

const integrations = ref<any[]>([]);
const aiSuggestions = ref([
  { id: 1, title: 'Reunión con el equipo', description: 'Considera agregar recordatorio', confidence: 0.85 },
  { id: 2, title: 'Revisar estrategia Q4', description: 'Alta prioridad detectada', confidence: 0.72 },
  { id: 3, title: 'Actualizar presupuesto', description: 'Tarea repetitiva sugerida', confidence: 0.68 },
  { id: 4, title: 'Revisión de código', description: 'Requiere revisión antes de merge', confidence: 0.91 }
]);

const showNewModal = ref(false);
const selectedType = ref('');
const integrationName = ref('');
const integrationConfig = ref<Record<string, any>>({});
const loading = ref(false);
const error = ref<string | null>(null);

const integrationTypes = [
  { type: 'google_calendar', name: 'Google Calendar', icon: Calendar, color: 'from-blue-100 to-blue-200', iconColor: 'text-blue-600' },
  { type: 'slack', name: 'Slack', icon: MessageSquare, color: 'from-purple-100 to-purple-200', iconColor: 'text-purple-600' },
  { type: 'discord', name: 'Discord', icon: MessageSquare, color: 'from-indigo-100 to-indigo-200', iconColor: 'text-indigo-600' },
  { type: 'email', name: 'Email', icon: Mail, color: 'from-green-100 to-green-200', iconColor: 'text-green-600' },
  { type: 'webhook', name: 'Webhook', icon: Webhook, color: 'from-gray-100 to-gray-200', iconColor: 'text-gray-600' }
];

function getIntegrationIcon(type: string) {
  switch (type) {
    case 'google_calendar': return Calendar;
    case 'slack': return MessageSquare;
    case 'discord': return MessageSquare;
    case 'email': return Mail;
    case 'webhook': return Webhook;
    default: return Link;
  }
}

function connectIntegration(type: string) {
  selectedType.value = type;
  integrationName.value = integrationTypes.find(t => t.type === type)?.name || '';
  showNewModal.value = true;
}

function deleteIntegration(id: string) {
  if (confirm('¿Estás seguro de que quieres eliminar esta integración?')) {
    integrations.value = integrations.value.filter(i => i.id !== id);
  }
}

function createIntegration() {
  if (!integrationName.value.trim() || !selectedType.value) {
    error.value = 'Nombre y tipo de integración son requeridos';
    return;
  }
  loading.value = true;
  setTimeout(() => {
    integrations.value.push({
      id: Date.now().toString(),
      name: integrationName.value,
      type: selectedType.value,
      config: integrationConfig.value,
      is_active: true,
      created_at: new Date().toISOString()
    });
    showNewModal.value = false;
    resetForm();
    loading.value = false;
  }, 1000);
}

function resetForm() {
  selectedType.value = '';
  integrationName.value = '';
  integrationConfig.value = {};
  error.value = null;
}

function closeModal() {
  showNewModal.value = false;
  resetForm();
}

function isConnected(type: string) {
  return integrations.value.some(i => i.type === type && i.is_active);
}
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900">
    <Sidebar />
    <div class="flex-1 flex flex-col">
      <Header />
      <main class="flex-1 p-6">
        <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div class="flex items-center space-x-4">
            <div class="bg-gradient-to-br from-purple-500 to-blue-600 p-3 sm:p-4 rounded-2xl shadow-xl">
              <Zap class="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Integraciones & IA
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Conecta TaskFlow con tus herramientas favoritas
              </p>
            </div>
          </div>
          <button
            @click="showNewModal = true"
            class="flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Plus class="h-5 w-5 mr-2" />
            Nueva Integración
          </button>
        </header>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div class="flex items-center gap-2">
            <AlertCircle class="h-5 w-5 text-red-500" />
            <span class="text-sm text-red-700 dark:text-red-400">{{ error }}</span>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div class="flex items-center mb-4 gap-2">
            <Bot class="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Sugerencias de IA
            </h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="suggestion in aiSuggestions"
              :key="suggestion.id"
              class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div class="flex items-start justify-between mb-2 gap-2">
                <h4 class="font-medium text-gray-900 dark:text-white text-sm">
                  {{ suggestion.title }}
                </h4>
                <span class="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
                  {{ Math.round(suggestion.confidence * 100) }}%
                </span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ suggestion.description }}
              </p>
            </div>
          </div>
          <div class="mt-4 text-sm text-purple-600 dark:text-purple-400">
            La IA puede sugerir categorías, fechas y prioridades automáticamente cuando creas tareas
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center mb-4">
              <div class="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl mr-3">
                <Calendar class="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">Google Calendar</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Sincroniza tus tareas</p>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Crea eventos automáticamente en Google Calendar cuando asignes fechas de vencimiento a tus tareas.
            </p>
            <div class="flex items-center justify-between">
              <span class="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                {{ isConnected('google_calendar') ? '✓ Conectado' : 'No conectado' }}
              </span>
              <button
                v-if="isConnected('google_calendar')"
                class="text-green-500"
              >
                <CheckCircle class="h-5 w-5" />
              </button>
              <button
                v-else
                @click="connectIntegration('google_calendar')"
                class="text-sm px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all shadow-md"
              >
                Conectar
              </button>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center mb-4">
              <div class="p-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl mr-3">
                <MessageSquare class="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">Slack</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Notificaciones en tiempo real</p>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Recibe notificaciones en Slack cuando completes tareas, se venzan o necesites recordatorios.
            </p>
            <div class="flex items-center justify-between">
              <span class="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                {{ isConnected('slack') ? '✓ Conectado' : 'No conectado' }}
              </span>
              <button
                v-if="isConnected('slack')"
                class="text-green-500"
              >
                <CheckCircle class="h-5 w-5" />
              </button>
              <button
                v-else
                @click="connectIntegration('slack')"
                class="text-sm px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all shadow-md"
              >
                Conectar
              </button>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center mb-4">
              <div class="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl mr-3">
                <MessageSquare class="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">Discord</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Notificaciones a tu servidor</p>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Mantén a tu equipo informado enviando actualizaciones de tareas a tu servidor de Discord.
            </p>
            <div class="flex items-center justify-between">
              <span class="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                {{ isConnected('discord') ? '✓ Conectado' : 'No conectado' }}
              </span>
              <button
                v-if="isConnected('discord')"
                class="text-green-500"
              >
                <CheckCircle class="h-5 w-5" />
              </button>
              <button
                v-else
                @click="connectIntegration('discord')"
                class="text-sm px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg transition-all shadow-md"
              >
                Conectar
              </button>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center mb-4">
              <div class="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl mr-3">
                <Mail class="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">Email</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Resúmenes por email</p>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Recibe resúmenes diarios, recordatorios y notificaciones importantes directamente en tu email.
            </p>
            <div class="flex items-center justify-between">
              <span class="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                {{ isConnected('email') ? '✓ Configurado' : 'No conectado' }}
              </span>
              <button
                v-if="isConnected('email')"
                class="text-green-500"
              >
                <CheckCircle class="h-5 w-5" />
              </button>
              <button
                v-else
                @click="connectIntegration('email')"
                class="text-sm px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all shadow-md"
              >
                Conectar
              </button>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center mb-4">
              <div class="p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl mr-3">
                <Webhook class="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">Webhook</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Integración personalizada</p>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Conecta TaskFlow con cualquier servicio usando webhooks. Ideal para automatizaciones personalizadas.
            </p>
            <div class="flex items-center justify-between">
              <span class="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">Personalizable</span>
              <button
                @click="connectIntegration('webhook')"
                class="text-sm px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg transition-all shadow-md"
              >
                Configurar
              </button>
            </div>
          </div>

          <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl border border-purple-200 dark:border-purple-700 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center mb-4">
              <div class="p-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800/30 dark:to-purple-700/30 rounded-xl mr-3">
                <Bot class="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">IA Assistant</h3>
                <p class="text-sm text-purple-600 dark:text-purple-400">Siempre activo</p>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Sugerencias inteligentes de categorías, fechas y prioridades. Análisis de productividad automático.
            </p>
            <div class="flex items-center justify-between">
              <span class="text-xs px-3 py-1 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-full">Incluido</span>
              <CheckCircle class="h-5 w-5 text-purple-500" />
            </div>
          </div>
        </div>

        <div v-if="integrations.length > 0" class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Integraciones Configuradas
            </h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div
                v-for="integration in integrations"
                :key="integration.id"
                class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div class="flex items-center">
                  <div class="p-2 rounded-lg mr-3 bg-gray-100 dark:bg-gray-700">
                    <component :is="getIntegrationIcon(integration.type)" class="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900 dark:text-white">
                      {{ integration.name }}
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ integration.type.replace('_', ' ') }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                      integration.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    ]"
                  >
                    {{ integration.is_active ? 'Activo' : 'Inactivo' }}
                  </button>
                  <button
                    @click="deleteIntegration(integration.id)"
                    class="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                    title="Eliminar integración"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <div
      v-if="showNewModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Nueva Integración
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <X class="h-6 w-6" />
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de la integración
            </label>
            <input
              v-model="integrationName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ej: Mi Slack del trabajo"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de integración
            </label>
            <select
              v-model="selectedType"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Selecciona un tipo</option>
              <option value="google_calendar">Google Calendar</option>
              <option value="slack">Slack</option>
              <option value="discord">Discord</option>
              <option value="email">Email</option>
              <option value="webhook">Webhook</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click="closeModal"
            class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="createIntegration"
            :disabled="loading || !integrationName.trim() || !selectedType"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {{ loading ? 'Creando...' : 'Crear Integración' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>