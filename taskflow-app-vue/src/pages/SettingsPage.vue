<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import { 
  Bell, Shield, Palette, Download, Trash2, Moon, Sun, Save, 
  AlertCircle, CheckCircle, Mail, Smartphone, Volume2, Users, 
  Database, Globe, Clock, Eye
} from 'lucide-vue-next';

const authStore = useAuthStore();
const themeStore = useThemeStore();

const activeTab = ref('notifications');
const loading = ref(false);
const saveSuccess = ref(false);
const showDeleteConfirm = ref(false);

const notifications = ref({
  email: true,
  push: true,
  taskReminders: true,
  weeklyDigest: false,
  collaborationUpdates: true,
  soundEnabled: true,
  desktopNotifications: true
});

const privacy = ref({
  profileVisibility: 'private',
  showEmail: false,
  allowCollaboration: true,
  dataAnalytics: true
});

const appearance = ref({
  theme: themeStore.isDark ? 'dark' : 'light',
  language: 'es',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormat: 'dd/mm/yyyy',
  timeFormat: '24h'
});

const tabs = [
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'appearance', label: 'Apariencia', icon: Palette },
  { id: 'privacy', label: 'Privacidad', icon: Shield },
  { id: 'data', label: 'Datos', icon: Database }
];

function handleSave() {
  loading.value = true;
  setTimeout(() => {
    if (appearance.value.theme !== themeStore.isDark) {
      appearance.value.theme === 'dark' ? themeStore.enableDark() : themeStore.disableDark();
    }
    loading.value = false;
    saveSuccess.value = true;
    setTimeout(() => saveSuccess.value = false, 3000);
  }, 1000);
}

function handleExportData() {
  alert('Exportando datos...');
}

function handleDeleteAccount() {
  showDeleteConfirm.value = true;
}

function confirmDeleteAccount() {
  showDeleteConfirm.value = false;
  alert('Cuenta eliminada');
}
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900">
    <Sidebar />

    <div class="flex-1 flex flex-col">
      <Header />
      
      <main class="flex-1 p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-4">
            <div class="bg-gradient-to-br from-purple-500 to-blue-600 p-3 sm:p-4 rounded-2xl shadow-xl">
              <Bell class="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Configuración</h1>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Personaliza tu experiencia</p>
            </div>
          </div>
          
          <button
            @click="handleSave"
            :disabled="loading"
            class="flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Save class="h-5 w-5 mr-2" />
            {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Sidebar Tabs -->
          <div class="lg:col-span-1">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 sticky top-4">
              <nav class="space-y-2">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  @click="activeTab = tab.id"
                  :class="['w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300', 
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-purple-600'
                  ]"
                >
                  <component :is="tab.icon" class="h-5 w-5 mr-3" />
                  {{ tab.label }}
                </button>
              </nav>
            </div>
          </div>

          <!-- Content -->
          <div class="lg:col-span-3">
            <!-- Notifications Tab -->
            <div v-if="activeTab === 'notifications'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notificaciones</h2>
              
              <div class="space-y-4">
                <label class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div class="flex items-center space-x-3">
                    <Mail class="h-5 w-5 text-gray-400" />
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">Notificaciones por Email</p>
                      <p class="text-sm text-gray-500">Recibe actualizaciones en tu correo</p>
                    </div>
                  </div>
                  <input type="checkbox" v-model="notifications.email" class="w-5 h-5 rounded" />
                </label>
                
                <label class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div class="flex items-center space-x-3">
                    <Smartphone class="h-5 w-5 text-gray-400" />
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">Notificaciones Push</p>
                      <p class="text-sm text-gray-500">Notificaciones en tu dispositivo</p>
                    </div>
                  </div>
                  <input type="checkbox" v-model="notifications.push" class="w-5 h-5 rounded" />
                </label>
                
                <label class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div class="flex items-center space-x-3">
                    <Bell class="h-5 w-5 text-gray-400" />
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">Recordatorios de Tareas</p>
                      <p class="text-sm text-gray-500">Avisa cuando una tarea está por vencer</p>
                    </div>
                  </div>
                  <input type="checkbox" v-model="notifications.taskReminders" class="w-5 h-5 rounded" />
                </label>
                
                <label class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div class="flex items-center space-x-3">
                    <Volume2 class="h-5 w-5 text-gray-400" />
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">Sonido</p>
                      <p class="text-sm text-gray-500">Reproducir sonido en notificaciones</p>
                    </div>
                  </div>
                  <input type="checkbox" v-model="notifications.soundEnabled" class="w-5 h-5 rounded" />
                </label>
              </div>
            </div>

            <!-- Appearance Tab -->
            <div v-else-if="activeTab === 'appearance'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Apariencia</h2>
              
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tema</label>
                  <div class="flex gap-4">
                    <button
                      @click="appearance.theme = 'light'"
                      :class="['flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2', appearance.theme === 'light' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-700']"
                    >
                      <Sun class="h-5 w-5" />
                      <span>Claro</span>
                    </button>
                    <button
                      @click="appearance.theme = 'dark'"
                      :class="['flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2', appearance.theme === 'dark' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-700']"
                    >
                      <Moon class="h-5 w-5" />
                      <span>Oscuro</span>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Idioma</label>
                  <select v-model="appearance.language" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zona Horaria</label>
                  <select v-model="appearance.timezone" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <option value="America/New_York">New York (UTC-5)</option>
                    <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
                    <option value="Europe/Madrid">Madrid (UTC+1)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Privacy Tab -->
            <div v-else-if="activeTab === 'privacy'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privacidad</h2>
              
              <div class="space-y-4">
                <label class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div class="flex items-center space-x-3">
                    <Eye class="h-5 w-5 text-gray-400" />
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">Visibilidad del Perfil</p>
                      <p class="text-sm text-gray-500">Quién puede ver tu perfil</p>
                    </div>
                  </div>
                  <select v-model="privacy.profileVisibility" class="px-3 py-2 rounded-lg bg-white dark:bg-gray-600">
                    <option value="private">Privado</option>
                    <option value="public">Público</option>
                    <option value="friends">Solo amigos</option>
                  </select>
                </label>
                
                <label class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div class="flex items-center space-x-3">
                    <Users class="h-5 w-5 text-gray-400" />
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">Colaboración</p>
                      <p class="text-sm text-gray-500">Permitir colaborar en tareas</p>
                    </div>
                  </div>
                  <input type="checkbox" v-model="privacy.allowCollaboration" class="w-5 h-5 rounded" />
                </label>
                
                <label class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div class="flex items-center space-x-3">
                    <Shield class="h-5 w-5 text-gray-400" />
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">Análisis de Datos</p>
                      <p class="text-sm text-gray-500">Ayuda a mejorar la app</p>
                    </div>
                  </div>
                  <input type="checkbox" v-model="privacy.dataAnalytics" class="w-5 h-5 rounded" />
                </label>
              </div>
            </div>

            <!-- Data Tab -->
            <div v-else-if="activeTab === 'data'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Datos</h2>
              
              <div class="space-y-4">
                <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-gray-900 dark:text-white">Exportar Datos</span>
                    <Download class="h-5 w-5 text-gray-400" />
                  </div>
                  <p class="text-sm text-gray-500 mb-3">Descarga todas tus tareas y configuración</p>
                  <button @click="handleExportData" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Exportar
                  </button>
                </div>
                
                <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-red-600 dark:text-red-400">Danger Zone</span>
                    <Trash2 class="h-5 w-5 text-red-500" />
                  </div>
                  <p class="text-sm text-gray-500 mb-3">Elimina tu cuenta permanentemente</p>
                  <button @click="handleDeleteAccount" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Eliminar Cuenta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Delete Confirmation -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div class="flex items-center mb-4">
          <AlertCircle class="h-6 w-6 text-red-500 mr-2" />
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Confirmar eliminación</h3>
        </div>
        <p class="text-gray-600 dark:text-gray-300 mb-6">
          ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.
        </p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteConfirm = false" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            Cancelar
          </button>
          <button @click="confirmDeleteAccount" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="saveSuccess" class="fixed bottom-4 right-4 flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-lg z-50">
      <CheckCircle class="h-5 w-5" />
      <span class="font-medium">¡Guardado!</span>
    </div>
  </div>
</template>