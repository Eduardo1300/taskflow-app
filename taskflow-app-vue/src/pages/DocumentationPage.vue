<script setup lang="ts">
import { ref } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import { FileText, Search, Copy, Check, ExternalLink, BookOpen, Code, Zap, Shield } from 'lucide-vue-next';

const activeSection = ref('overview');
const copied = ref(false);

const apiEndpoints = ref([
  { method: 'GET', path: '/api/tasks', desc: 'Obtener todas las tareas', status: 'Activo' },
  { method: 'POST', path: '/api/tasks', desc: 'Crear una tarea', status: 'Activo' },
  { method: 'PUT', path: '/api/tasks/:id', desc: 'Actualizar tarea', status: 'Activo' },
  { method: 'DELETE', path: '/api/tasks/:id', desc: 'Eliminar tarea', status: 'Activo' }
]);

function copyApiKey() {
  copied.value = true;
  setTimeout(() => copied.value = false, 2000);
}
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900">
    <Sidebar />

    <div class="flex-1 flex flex-col">
      <Header />

      <main class="flex-1 p-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Documentación API</h1>

        <div class="flex space-x-2 mb-6">
          <button @click="activeSection = 'overview'" :class="['px-4 py-2 rounded-xl font-medium', activeSection === 'overview' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600']">Resumen</button>
          <button @click="activeSection = 'endpoints'" :class="['px-4 py-2 rounded-xl font-medium', activeSection === 'endpoints' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600']">Endpoints</button>
          <button @click="activeSection = 'auth'" :class="['px-4 py-2 rounded-xl font-medium', activeSection === 'auth' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600']">Autenticación</button>
        </div>

        <div v-if="activeSection === 'overview'" class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">API de TaskFlow</h2>
            <p class="text-gray-500">TaskFlow ofrece una API REST para integrar con tus aplicaciones.</p>
          </div>
        </div>

        <div v-else-if="activeSection === 'endpoints'" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="grid grid-cols-4 border-b border-gray-200 dark:border-gray-700 p-4 font-medium text-gray-500">
            <span>Método</span><span>Ruta</span><span>Descripción</span><span>Estado</span>
          </div>
          <div v-for="ep in apiEndpoints" :key="ep.path" class="grid grid-cols-4 border-b border-gray-100 dark:border-gray-700 p-4">
            <span :class="['px-2 py-1 rounded text-xs font-medium', ep.method === 'GET' ? 'bg-green-100 text-green-700' : ep.method === 'POST' ? 'bg-blue-100 text-blue-700' : ep.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700']">{{ ep.method }}</span>
            <code class="text-sm text-gray-900 dark:text-white font-mono">{{ ep.path }}</code>
            <span class="text-sm text-gray-500">{{ ep.desc }}</span>
            <span class="text-green-500 text-sm">{{ ep.status }}</span>
          </div>
        </div>

        <div v-else-if="activeSection === 'auth'" class="space-y-4 max-w-xl">
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">API Key</h3>
            <div class="flex items-center space-x-2">
              <code class="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded font-mono text-sm">sk_live_xxxxxxxxxxxx</code>
              <button @click="copyApiKey" class="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200">
                <Copy v-if="!copied" class="h-5 w-5" /><Check v-else class="h-5 w-5 text-green-500" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>