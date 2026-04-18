<script setup lang="ts">
import { ref } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import { Key, Copy, Check, RefreshCw, Trash2, Plus, Shield, Clock } from 'lucide-vue-next';

const apiKeys = ref([
  { id: 1, name: 'Mi API Key', key: 'sk_live_xxxxx...yyyy', created: '2024-01-15', lastUsed: '2024-01-20' }
]);
const copied = ref(false);
const showNewModal = ref(false);

function copyKey(key: string) {
  copied.value = true;
  setTimeout(() => copied.value = false, 2000);
}

function generateNewKey() {
  showNewModal.value = false;
  apiKeys.value.push({
    id: Date.now(),
    name: 'Nueva Key',
    key: 'sk_live_' + Math.random().toString(36).substring(2),
    created: new Date().toISOString().split('T')[0],
    lastUsed: 'Nunca'
  });
}

function deleteKey(id: number) {
  apiKeys.value = apiKeys.value.filter(k => k.id !== id);
}
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900">
    <Sidebar />

    <div class="flex-1 flex flex-col">
      <Header />

      <main class="flex-1 p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Gestión de API</h1>
            <p class="text-gray-500 dark:text-gray-400"> Administra tus claves API</p>
          </div>
          <button @click="showNewModal = true" class="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium">
            <Plus class="h-5 w-5" /><span>Nueva Key</span>
          </button>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="grid grid-cols-5 border-b border-gray-200 dark:border-gray-700 p-4 font-medium text-gray-500">
            <span>Nombre</span><span>API Key</span><span>Creada</span><span>Último uso</span><span>Acciones</span>
          </div>
          <div v-for="apiKey in apiKeys" :key="apiKey.id" class="grid grid-cols-5 border-b border-gray-100 dark:border-gray-700 p-4 items-center">
            <span class="font-medium text-gray-900 dark:text-white">{{ apiKey.name }}</span>
            <div class="flex items-center space-x-2">
              <code class="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{{ apiKey.key }}</code>
              <button @click="copyKey(apiKey.key)" class="p-1 text-gray-400 hover:text-gray-600">
                <Copy v-if="!copied" class="h-4 w-4" /><Check v-else class="h-4 w-4 text-green-500" />
              </button>
            </div>
            <span class="text-sm text-gray-500">{{ apiKey.created }}</span>
            <span class="text-sm text-gray-500">{{ apiKey.lastUsed }}</span>
            <div class="flex items-center space-x-2">
              <button class="p-2 text-gray-400 hover:text-red-500"><Trash2 class="h-4 w-4" @click="deleteKey(apiKey.id)" /></button>
            </div>
          </div>
        </div>

        <div class="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
          <div class="flex items-center space-x-3 mb-2">
            <Shield class="h-6 w-6 text-blue-500" />
            <h3 class="font-semibold text-gray-900 dark:text-white">Seguridad</h3>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">Nunca compartas tus API keys. Márcalas como secretas yrotaciónalas periódicamente.</p>
        </div>
      </main>
    </div>

    <div v-if="showNewModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nueva API Key</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre</label>
            <input type="text" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Mi nueva key" />
          </div>
        </div>
        <div class="flex justify-end space-x-3 mt-6">
          <button @click="showNewModal = false" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">Cancelar</button>
          <button @click="generateNewKey" class="px-4 py-2 bg-blue-600 text-white rounded-lg">Crear</button>
        </div>
      </div>
    </div>
  </div>
</template>