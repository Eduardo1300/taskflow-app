<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import { Bell, Shield, Palette, Download, Trash2, Moon, Sun, Save, Globe, Clock, AlertCircle, CheckCircle, Mail, Smartphone, Volume2, Users, Settings as SettingsIcon } from 'lucide-vue-next';

const authStore = useAuthStore();
const themeStore = useThemeStore();

const activeTab = ref('notifications');
const loading = ref(false);
const saveSuccess = ref(false);

const notifications = ref({
  email: true,
  push: true,
  taskReminders: true,
  soundEnabled: true
});

const privacy = ref({
  profileVisibility: 'private',
  allowCollaboration: true
});

const appearance = ref({
  theme: themeStore.isDark ? 'dark' : 'light',
  language: 'es',
  timeFormat: '24h'
});

const tabs = [
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'privacy', label: 'Privacidad', icon: Shield },
  { id: 'appearance', label: 'Apariencia', icon: Palette },
  { id: 'data', label: 'Datos', icon: Download }
];

function handleSave() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    saveSuccess.value = true;
    setTimeout(() => saveSuccess.value = false, 3000);
  }, 1000);
}

function exportData() {
  alert('Exportando datos...');
}

function deleteAccount() {
  if (confirm('¿Estás seguro de que quieres eliminar tu cuenta?')) {
    alert('Contacta al soporte.');
  }
}
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900">
    <Sidebar />

    <div class="flex-1 flex flex-col">
      <Header />

      <main class="flex-1 p-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Configuración</h1>

        <div class="flex flex-col lg:flex-row gap-6">
          <div class="lg:w-64 space-y-2">
            <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id" :class="['w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all', activeTab === tab.id ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700']">
              <component :is="tab.icon" class="h-5 w-5" /><span>{{ tab.label }}</span>
            </button>
          </div>

          <div class="flex-1">
            <div v-if="activeTab === 'notifications'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notificaciones</h2>
              <div class="space-y-4">
                <label class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div class="flex items-center space-x-3"><Mail class="h-5 w-5 text-gray-400" /><div><p class="font-medium text-gray-900 dark:text-white">Notificaciones por Email</p><p class="text-sm text-gray-500">Recibe actualizaciones en tu correo</p></div></div>
                  <input type="checkbox" v-model="notifications.email" class="w-5 h-5 rounded" />
                </label>
                <label class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div class="flex items-center space-x-3"><Smartphone class="h-5 w-5 text-gray-400" /><div><p class="font-medium text-gray-900 dark:text-white">Notificaciones Push</p><p class="text-sm text-gray-500">Notificaciones en tu dispositivo</p></div></div>
                  <input type="checkbox" v-model="notifications.push" class="w-5 h-5 rounded" />
                </label>
                <label class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div class="flex items-center space-x-3"><Bell class="h-5 w-5 text-gray-400" /><div><p class="font-medium text-gray-900 dark:text-white">Recordatorios de Tareas</p><p class="text-sm text-gray-500">Avisa cuando una tarea está por vencer</p></div></div>
                  <input type="checkbox" v-model="notifications.taskReminders" class="w-5 h-5 rounded" />
                </label>
              </div>
            </div>

            <div v-else-if="activeTab === 'privacy'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privacidad</h2>
              <div class="space-y-4">
                <label class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div class="flex items-center space-x-3"><Users class="h-5 w-5 text-gray-400" /><div><p class="font-medium text-gray-900 dark:text-white">Colaboración</p><p class="text-sm text-gray-500">Permitir que otros colaboren en tus tareas</p></div></div>
                  <input type="checkbox" v-model="privacy.allowCollaboration" class="w-5 h-5 rounded" />
                </label>
              </div>
            </div>

            <div v-else-if="activeTab === 'appearance'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Apariencia</h2>
              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div class="flex items-center space-x-3"><Moon v-if="themeStore.isDark" class="h-5 w-5 text-gray-400" /><Sun v-else class="h-5 w-5 text-gray-400" /><div><p class="font-medium text-gray-900 dark:text-white">Modo Oscuro</p></div></div>
                  <button @click="themeStore.toggle()" :class="['px-4 py-2 rounded-lg font-medium', themeStore.isDark ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800']">{{ themeStore.isDark ? 'Oscuro' : 'Claro' }}</button>
                </div>
                <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div class="flex items-center space-x-3"><Globe class="h-5 w-5 text-gray-400" /><div><p class="font-medium text-gray-900 dark:text-white">Idioma</p></div></div>
                  <select v-model="appearance.language" class="px-3 py-2 bg-white dark:bg-gray-600 rounded-lg">
                    <option value="es">Español</option><option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>

            <div v-else-if="activeTab === 'data'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gestión de Datos</h2>
              <div class="space-y-4">
                <button @click="exportData" class="w-full flex items-center space-x-3 px-4 py-4 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600">
                  <Download class="h-5 w-5" /><div class="text-left"><p class="font-medium">Exportar Datos</p><p class="text-sm text-gray-500">Descarga todas tus tareas</p></div>
                </button>
                <button @click="deleteAccount" class="w-full flex items-center space-x-3 px-4 py-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400">
                  <Trash2 class="h-5 w-5" /><div class="text-left"><p class="font-medium">Eliminar Cuenta</p><p class="text-sm text-red-500">Irreversible</p></div>
                </button>
              </div>
            </div>

            <div class="mt-6 flex justify-end">
              <button @click="handleSave" :disabled="loading" class="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50">
                <CheckCircle v-if="saveSuccess" class="h-5 w-5" /><Save v-else class="h-5 w-5" /><span>{{ saveSuccess ? 'Guardado!' : loading ? 'Guardando...' : 'Guardar Cambios' }}</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>