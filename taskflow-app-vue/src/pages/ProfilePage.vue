<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useTaskStore } from '@/stores/tasks';
import api from '@/services/api';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import { User, Mail, Camera, Save, Edit2, X, Calendar, Phone, MapPin, Globe, Clock, Target, TrendingUp, Award, Badge } from 'lucide-vue-next';

const authStore = useAuthStore();
const taskStore = useTaskStore();

const fullName = ref('');
const email = ref('');
const bio = ref('');
const phone = ref('');
const location = ref('');
const timezone = ref('America/Mexico_City');
const language = ref('es');
const loading = ref(false);
const saveSuccess = ref(false);
const memberSince = ref('');
const isEditing = ref(false);

const editedProfile = ref({
  fullName: '',
  email: '',
  bio: '',
  phone: '',
  location: '',
  timezone: 'America/Mexico_City',
  language: 'es'
});

const stats = computed(() => {
  const tasks = taskStore.tasks;
  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const categories = new Set(tasks.filter(t => t.categoryId).map(t => t.categoryId));
  const activeProjects = categories.size;
  
  return {
    tasksCompleted: completed,
    totalTasks: total,
    activeProjects,
    streakDays: 0,
    successRate: rate
  };
});

const initials = computed(() => fullName.value ? fullName.value.charAt(0).toUpperCase() : (email.value ? email.value.split('@')[0].charAt(0).toUpperCase() : 'U'));

onMounted(async () => {
  await taskStore.fetchTasks();
  await taskStore.fetchStats();
  
  if (authStore.user) {
    fullName.value = authStore.user.fullName || '';
    email.value = authStore.user.email || '';
    if (authStore.user.createdAt) {
      memberSince.value = new Date(authStore.user.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  }
  
  editedProfile.value = {
    fullName: fullName.value,
    email: email.value,
    bio: bio.value,
    phone: phone.value,
    location: location.value,
    timezone: timezone.value,
    language: language.value
  };
});

function startEdit() {
  editedProfile.value = {
    fullName: fullName.value,
    email: email.value,
    bio: bio.value,
    phone: phone.value,
    location: location.value,
    timezone: timezone.value,
    language: language.value
  };
  isEditing.value = true;
}

function cancelEdit() {
  isEditing.value = false;
}

async function handleSave() {
  loading.value = true;
  try {
    await api.updateProfile({ 
      fullName: editedProfile.value.fullName,
      email: editedProfile.value.email
    });
    
    fullName.value = editedProfile.value.fullName;
    email.value = editedProfile.value.email;
    bio.value = editedProfile.value.bio;
    phone.value = editedProfile.value.phone;
    location.value = editedProfile.value.location;
    timezone.value = editedProfile.value.timezone;
    language.value = editedProfile.value.language;
    
    if (authStore.user) {
      authStore.user.fullName = editedProfile.value.fullName;
      authStore.user.email = editedProfile.value.email;
    }
    
    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
      isEditing.value = false;
    }, 2000);
  } catch (error) {
    console.error('Error guardando perfil:', error);
  } finally {
    loading.value = false;
  }
}

const languages = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' }
];

const timezones = [
  { value: 'America/Mexico_City', label: 'Ciudad de México' },
  { value: 'America/New_York', label: 'Nueva York' },
  { value: 'Europe/Madrid', label: 'Madrid' },
  { value: 'Europe/London', label: 'Londres' },
  { value: 'Asia/Tokyo', label: 'Tokio' }
];
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900">
    <Sidebar />

    <div class="flex-1 flex flex-col">
      <Header />

      <main class="flex-1 p-6 space-y-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="bg-gradient-to-br from-purple-500 to-blue-600 p-4 rounded-2xl shadow-xl">
              <User class="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestiona tu información y estadísticas</p>
            </div>
          </div>

          <div v-if="!isEditing">
            <button @click="startEdit" class="flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg">
              <Edit2 class="h-5 w-5 mr-2" />
              Editar Perfil
            </button>
          </div>
          <div v-else class="flex gap-3">
            <button @click="cancelEdit" class="flex items-center px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium">
              <X class="h-5 w-5 mr-2" />
              Cancelar
            </button>
            <button @click="handleSave" :disabled="loading" class="flex items-center px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 text-white rounded-xl font-medium shadow-lg">
              <Save class="h-5 w-5 mr-2" />
              {{ saveSuccess ? 'Guardado!' : (loading ? 'Guardando...' : 'Guardar') }}
            </button>
          </div>
        </div>

        <div class="bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 rounded-2xl shadow-2xl p-6 sm:p-8">
          <div class="flex flex-col sm:flex-row sm:items-center gap-6">
            <div class="relative">
              <div class="w-24 h-24 sm:w-28 sm:h-28 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl ring-4 ring-white/20">
                <span class="text-4xl sm:text-5xl font-bold text-white">{{ initials }}</span>
              </div>
              <button v-if="isEditing" class="absolute bottom-0 right-0 p-3 bg-white text-purple-600 rounded-full hover:bg-gray-100 shadow-lg">
                <Camera class="h-5 w-5" />
              </button>
            </div>

            <div class="text-white text-center sm:text-left flex-1">
              <h2 class="text-2xl sm:text-3xl font-bold">{{ fullName || 'Usuario' }}</h2>
              <p class="text-blue-100 mt-1 text-sm sm:text-base">{{ email }}</p>
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-blue-100">
                <div class="flex items-center">
                  <Calendar class="h-4 w-4 mr-1.5" />
                  <span>Miembro desde {{ memberSince || '2024' }}</span>
                </div>
                <div v-if="stats.streakDays > 0" class="flex items-center px-3 py-1 bg-white/20 rounded-full">
                  <Award class="h-4 w-4 mr-1.5" />
                  <span>{{ stats.streakDays }} días de racha</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-2xl hover:-translate-y-1 transition-all">
            <div class="flex items-center justify-between mb-3">
              <div class="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <Target class="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{{ stats.tasksCompleted }}</p>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Tareas Completadas</p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-2xl hover:-translate-y-1 transition-all">
            <div class="flex items-center justify-between mb-3">
              <div class="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <TrendingUp class="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{{ stats.activeProjects }}</p>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Proyectos Activos</p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-2xl hover:-translate-y-1 transition-all">
            <div class="flex items-center justify-between mb-3">
              <div class="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                <Award class="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{{ stats.streakDays }}d</p>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Racha Actual</p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-2xl hover:-translate-y-1 transition-all">
            <div class="flex items-center justify-between mb-3">
              <div class="p-2.5 rounded-xl bg-green-100 dark:bg-green-900/30">
                <Badge class="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{{ stats.successRate }}%</p>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Tasa Éxito</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <User class="h-5 w-5 mr-2 text-purple-600" />
              Información Personal
            </h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre completo</label>
                <div v-if="isEditing">
                  <input v-model="editedProfile.fullName" type="text" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white" placeholder="Tu nombre" />
                </div>
                <p v-else class="text-gray-900 dark:text-white font-medium">{{ fullName || 'No especificado' }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <div class="flex items-center">
                  <Mail class="h-5 w-5 text-gray-400 mr-2" />
                  <p class="text-gray-900 dark:text-white font-medium">{{ email }}</p>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono</label>
                <div v-if="isEditing">
                  <input v-model="editedProfile.phone" type="tel" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white" placeholder="Número de teléfono" />
                </div>
                <div v-else class="flex items-center">
                  <Phone class="h-5 w-5 text-gray-400 mr-2" />
                  <p class="text-gray-900 dark:text-white font-medium">{{ phone || 'No especificado' }}</p>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ubicación</label>
                <div v-if="isEditing">
                  <input v-model="editedProfile.location" type="text" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white" placeholder="Tu ubicación" />
                </div>
                <div v-else class="flex items-center">
                  <MapPin class="h-5 w-5 text-gray-400 mr-2" />
                  <p class="text-gray-900 dark:text-white font-medium">{{ location || 'No especificada' }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Clock class="h-5 w-5 mr-2 text-blue-600" />
              Configuración Adicional
            </h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Biografía</label>
                <div v-if="isEditing">
                  <textarea v-model="editedProfile.bio" rows="3" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none" placeholder="Cuéntanos sobre ti..." />
                </div>
                <p v-else class="text-gray-900 dark:text-white">{{ bio || 'No hay biografía disponible' }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zona horaria</label>
                <div v-if="isEditing">
                  <select v-model="editedProfile.timezone" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white">
                    <option v-for="tz in timezones" :key="tz.value" :value="tz.value">{{ tz.label }}</option>
                  </select>
                </div>
                <div v-else class="flex items-center">
                  <Globe class="h-5 w-5 text-gray-400 mr-2" />
                  <p class="text-gray-900 dark:text-white">{{ timezone }}</p>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Idioma</label>
                <div v-if="isEditing">
                  <select v-model="editedProfile.language" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white">
                    <option v-for="lang in languages" :key="lang.value" :value="lang.value">{{ lang.label }}</option>
                  </select>
                </div>
                <p v-else class="text-gray-900 dark:text-white">
                  {{ languages.find(l => l.value === language)?.label || 'Español' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>