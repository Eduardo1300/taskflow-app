<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import { Key, Copy, Check, RefreshCw, Trash2, Plus, Shield, Clock, AlertTriangle, Eye, EyeOff, Globe, Settings, ExternalLink, Code, Book } from 'lucide-vue-next';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  is_active: boolean;
  permissions: string[];
  rate_limit: number;
  created_at: string;
  last_used_at: string | null;
}

interface Webhook {
  id: string;
  url: string;
  is_active: boolean;
  events: string[];
  created_at: string;
}

const apiKeys = ref<ApiKey[]>([]);
const webhooks = ref<Webhook[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showNewModal = ref(false);
const showNewWebhookModal = ref(false);
const showDocumentation = ref(false);
const visibleKeys = ref<Set<string>>(new Set());

const newApiKeyName = ref('');
const newApiKeyPermissions = ref<string[]>(['read']);
const newApiKeyRateLimit = ref(60);

const newWebhookUrl = ref('');
const newWebhookEvents = ref<string[]>(['task.created']);

onMounted(() => {
  loadData();
});

async function loadData() {
  loading.value = true;
  error.value = null;
  try {
    apiKeys.value = [];
    webhooks.value = [];
  } catch (err) {
    error.value = 'Error cargando datos';
  } finally {
    loading.value = false;
  }
}

function copyKey(key: string) {
  navigator.clipboard.writeText(key);
}

function toggleKeyVisibility(id: string) {
  if (visibleKeys.value.has(id)) {
    visibleKeys.value.delete(id);
  } else {
    visibleKeys.value.add(id);
  }
}

function maskApiKey(key: string) {
  return key.substring(0, 8) + '••••••••••••••••••••••••••••••••••••••••••••••••••••••••';
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getPermissionColor(permission: string) {
  switch (permission) {
    case 'read': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'write': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'delete': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}

function generateNewKey() {
  showNewModal.value = false;
  apiKeys.value.push({
    id: Date.now().toString(),
    name: newApiKeyName.value || 'Nueva Key',
    key: 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    is_active: true,
    permissions: newApiKeyPermissions.value,
    rate_limit: newApiKeyRateLimit.value,
    created_at: new Date().toISOString(),
    last_used_at: null
  });
  newApiKeyName.value = '';
  newApiKeyPermissions.value = ['read'];
  newApiKeyRateLimit.value = 60;
}

function generateNewWebhook() {
  showNewWebhookModal.value = false;
  webhooks.value.push({
    id: Date.now().toString(),
    url: newWebhookUrl.value,
    is_active: true,
    events: newWebhookEvents.value,
    created_at: new Date().toISOString()
  });
  newWebhookUrl.value = '';
  newWebhookEvents.value = ['task.created'];
}

function deleteKey(id: number) {
  apiKeys.value = apiKeys.value.filter(k => k.id !== id.toString());
}

function deleteWebhook(id: number) {
  webhooks.value = webhooks.value.filter(w => w.id !== id.toString());
}

function toggleApiKeyPermission(permission: string) {
  if (newApiKeyPermissions.value.includes(permission)) {
    newApiKeyPermissions.value = newApiKeyPermissions.value.filter(p => p !== permission);
  } else {
    newApiKeyPermissions.value.push(permission);
  }
}

function toggleWebhookEvent(event: string) {
  if (newWebhookEvents.value.includes(event)) {
    newWebhookEvents.value = newWebhookEvents.value.filter(e => e !== event);
  } else {
    newWebhookEvents.value.push(event);
  }
}
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900">
    <Sidebar />

    <div class="flex-1 flex flex-col">
      <Header />

      <main class="flex-1 p-6 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center space-x-4">
            <div class="bg-gradient-to-br from-purple-500 to-blue-600 p-4 rounded-2xl shadow-xl">
              <Globe class="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">API REST</h1>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestiona el acceso programático a tus tareas</p>
            </div>
          </div>
          <button @click="showDocumentation = true" class="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium">
            <Book class="h-5 w-5 mr-2" />
            Documentación
          </button>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div class="flex items-center gap-2">
            <AlertTriangle class="h-5 w-5 text-red-500" />
            <span class="text-sm text-red-700 dark:text-red-400">{{ error }}</span>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Key class="h-5 w-5 text-gray-500" />
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">API Keys</h3>
              </div>
              <button @click="showNewModal = true" class="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
                <Plus class="h-4 w-4 mr-1" />
                Nueva API Key
              </button>
            </div>
          </div>

          <div class="p-6">
            <div v-if="apiKeys.length === 0" class="text-center py-8">
              <Key class="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-500 dark:text-gray-400 mb-4">No tienes API keys creadas</p>
              <button @click="showNewModal = true" class="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg mx-auto">
                <Plus class="h-4 w-4 mr-2" />
                Crear primera API Key
              </button>
            </div>

            <div v-else class="space-y-4">
              <div v-for="apiKey in apiKeys" :key="apiKey.id" class="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <h4 class="font-medium text-gray-900 dark:text-white">{{ apiKey.name }}</h4>
                      <span :class="['px-2 py-1 rounded-full text-xs font-medium', apiKey.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200']">
                        {{ apiKey.is_active ? 'Activa' : 'Revocada' }}
                      </span>
                    </div>

                    <div class="flex items-center mb-2">
                      <code class="bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg text-sm font-mono">
                        {{ visibleKeys.has(apiKey.id) ? apiKey.key : maskApiKey(apiKey.key) }}
                      </code>
                      <button @click="toggleKeyVisibility(apiKey.id)" class="ml-2 p-1.5 text-gray-400 hover:text-gray-600">
                        <EyeOff v-if="visibleKeys.has(apiKey.id)" class="h-4 w-4" />
                        <Eye v-else class="h-4 w-4" />
                      </button>
                      <button @click="copyKey(apiKey.key)" class="ml-1 p-1.5 text-gray-400 hover:text-gray-600">
                        <Copy class="h-4 w-4" />
                      </button>
                    </div>

                    <div class="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <div class="flex items-center">
                        <Shield class="h-4 w-4 mr-1" />
                        <span>{{ apiKey.rate_limit }} req/min</span>
                      </div>
                      <div class="flex items-center">
                        <Clock class="h-4 w-4 mr-1" />
                        <span>Creada: {{ formatDate(apiKey.created_at) }}</span>
                      </div>
                    </div>

                    <div class="flex flex-wrap gap-1">
                      <span v-for="permission in apiKey.permissions" :key="permission" :class="['px-2 py-1 rounded-full text-xs font-medium', getPermissionColor(permission)]">
                        {{ permission }}
                      </span>
                    </div>
                  </div>

                  <button v-if="apiKey.is_active" @click="deleteKey(parseInt(apiKey.id))" class="ml-4 p-2 text-red-400 hover:text-red-600">
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Settings class="h-5 w-5 text-gray-500" />
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Webhooks</h3>
              </div>
              <button @click="showNewWebhookModal = true" class="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">
                <Plus class="h-4 w-4 mr-1" />
                Nuevo Webhook
              </button>
            </div>
          </div>

          <div class="p-6">
            <div v-if="webhooks.length === 0" class="text-center py-8">
              <Settings class="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-500 dark:text-gray-400 mb-4">No tienes webhooks configurados</p>
              <button @click="showNewWebhookModal = true" class="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg mx-auto">
                <Plus class="h-4 w-4 mr-2" />
                Crear primer Webhook
              </button>
            </div>

            <div v-else class="space-y-4">
              <div v-for="webhook in webhooks" :key="webhook.id" class="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center">
                    <ExternalLink class="h-4 w-4 text-gray-400 mr-2" />
                    <code class="text-sm font-mono text-gray-600 dark:text-gray-300">{{ webhook.url }}</code>
                  </div>
                  <span :class="['px-2 py-1 rounded-full text-xs font-medium', webhook.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800']">
                    {{ webhook.is_active ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>

                <div class="flex flex-wrap gap-1 mb-2">
                  <span v-for="event in webhook.events" :key="event" class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {{ event }}
                  </span>
                </div>

                <p class="text-sm text-gray-500">Creado: {{ formatDate(webhook.created_at) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
          <div class="flex items-center space-x-3 mb-2">
            <Shield class="h-6 w-6 text-blue-500" />
            <h3 class="font-semibold text-gray-900 dark:text-white">Seguridad</h3>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">Nunca compartas tus API keys. Márcalas como secretas y rótalas periódicamente.</p>
        </div>
      </main>
    </div>

    <div v-if="showNewModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nueva API Key</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre</label>
            <input v-model="newApiKeyName" type="text" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Ej: Mi aplicación móvil" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permisos</label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input type="checkbox" :checked="newApiKeyPermissions.includes('read')" @change="toggleApiKeyPermission('read')" class="rounded border-gray-300 text-blue-600" />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Read</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" :checked="newApiKeyPermissions.includes('write')" @change="toggleApiKeyPermission('write')" class="rounded border-gray-300 text-blue-600" />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Write</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" :checked="newApiKeyPermissions.includes('delete')" @change="toggleApiKeyPermission('delete')" class="rounded border-gray-300 text-blue-600" />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Delete</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Límite de velocidad (requests/minuto)</label>
            <input v-model.number="newApiKeyRateLimit" type="number" min="1" max="1000" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
        </div>
        <div class="flex justify-end space-x-3 mt-6">
          <button @click="showNewModal = false" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancelar</button>
          <button @click="generateNewKey" class="px-4 py-2 bg-blue-600 text-white rounded-lg">Crear API Key</button>
        </div>
      </div>
    </div>

    <div v-if="showNewWebhookModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nuevo Webhook</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL del Webhook</label>
            <input v-model="newWebhookUrl" type="url" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="https://tu-servidor.com/webhook" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Eventos</label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input type="checkbox" :checked="newWebhookEvents.includes('task.created')" @change="toggleWebhookEvent('task.created')" class="rounded border-gray-300 text-blue-600" />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">task.created</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" :checked="newWebhookEvents.includes('task.updated')" @change="toggleWebhookEvent('task.updated')" class="rounded border-gray-300 text-blue-600" />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">task.updated</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" :checked="newWebhookEvents.includes('task.completed')" @change="toggleWebhookEvent('task.completed')" class="rounded border-gray-300 text-blue-600" />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">task.completed</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" :checked="newWebhookEvents.includes('task.deleted')" @change="toggleWebhookEvent('task.deleted')" class="rounded border-gray-300 text-blue-600" />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">task.deleted</span>
              </label>
            </div>
          </div>
        </div>
        <div class="flex justify-end space-x-3 mt-6">
          <button @click="showNewWebhookModal = false" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancelar</button>
          <button @click="generateNewWebhook" class="px-4 py-2 bg-green-600 text-white rounded-lg">Crear Webhook</button>
        </div>
      </div>
    </div>

    <div v-if="showDocumentation" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Code class="h-6 w-6 mr-2" />
            Documentación de la API
          </h3>
          <button @click="showDocumentation = false" class="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div class="space-y-6 text-gray-900 dark:text-gray-100">
          <div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Autenticación</h4>
            <p class="text-gray-700 dark:text-gray-300 mb-3">Incluye tu API key en el header de cada request:</p>
            <pre class="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm border dark:border-gray-600">X-API-Key: tu_api_key_aqui</pre>
          </div>

          <div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Endpoints Disponibles</h4>
            
            <h5 class="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">GET /api/tasks</h5>
            <p class="text-gray-700 dark:text-gray-300 mb-2">Obtiene todas las tareas.</p>
            
            <h5 class="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">POST /api/tasks</h5>
            <p class="text-gray-700 dark:text-gray-300 mb-3">Crea una nueva tarea.</p>
            <pre class="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm border dark:border-gray-600 mb-4">{ "title": "Título", "priority": "medium", "due_date": "2025-01-15" }</pre>
            
            <h5 class="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">PUT /api/tasks/:id</h5>
            <p class="text-gray-700 dark:text-gray-300 mb-4">Actualiza una tarea.</p>
            
            <h5 class="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">DELETE /api/tasks/:id</h5>
            <p class="text-gray-700 dark:text-gray-300 mb-4">Elimina una tarea.</p>
          </div>

          <div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Códigos de Respuesta</h4>
            <ul class="space-y-1">
              <li><code class="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">200</code> - Éxito</li>
              <li><code class="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">201</code> - Recurso creado</li>
              <li><code class="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">400</code> - Petición inválida</li>
              <li><code class="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">401</code> - Sin autorización</li>
              <li><code class="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">429</code> - Límite excedido</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>