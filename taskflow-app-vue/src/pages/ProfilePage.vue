<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useTaskStore } from '@/stores/tasks';
import api from '@/services/api';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import { analyticsService } from '@/services/analyticsService';
import {
  User, Mail, Camera, Save, Edit2, X, Calendar, Phone, MapPin, Globe,
  Clock, Target, TrendingUp, Award, Badge
} from 'lucide-vue-next';

interface ProfileForm {
  fullName: string;
  email: string;
  bio: string;
  phone: string;
  location: string;
  timezone: string;
  language: string;
}

const authStore = useAuthStore();
const taskStore = useTaskStore();

const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Lima';

const emptyProfile = (): ProfileForm => ({
  fullName: '',
  email: '',
  bio: '',
  phone: '',
  location: '',
  timezone: defaultTimezone,
  language: 'es'
});

const profile = ref<ProfileForm>(emptyProfile());
const editedProfile = ref<ProfileForm>(emptyProfile());
const memberSince = ref('');
const isEditing = ref(false);
const loading = ref(false);
const saveSuccess = ref(false);
const saveError = ref<string | null>(null);

let closeTimer: ReturnType<typeof setTimeout> | undefined;

const languages = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' }
];

const baseTimezones = [
  { value: 'America/Lima', label: 'Lima' },
  { value: 'America/Bogota', label: 'Bogotá' },
  { value: 'America/Mexico_City', label: 'Ciudad de México' },
  { value: 'America/Santiago', label: 'Santiago' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires' },
  { value: 'America/Sao_Paulo', label: 'São Paulo' },
  { value: 'America/New_York', label: 'Nueva York' },
  { value: 'Europe/Madrid', label: 'Madrid' },
  { value: 'Europe/London', label: 'Londres' },
  { value: 'Asia/Tokyo', label: 'Tokio' }
];

// Si la zona guardada no está en la lista, la añadimos para que el select no quede en blanco
const timezones = computed(() => {
  const current = [profile.value.timezone, editedProfile.value.timezone];
  const extras = current
    .filter((tz, i) => tz && current.indexOf(tz) === i && !baseTimezones.some(b => b.value === tz))
    .map(tz => ({ value: tz, label: tz }));
  return [...extras, ...baseTimezones];
});

const timezoneLabel = computed(
  () => timezones.value.find(t => t.value === profile.value.timezone)?.label ?? profile.value.timezone
);

const languageLabel = computed(
  () => languages.find(l => l.value === profile.value.language)?.label ?? 'Español'
);

const stats = computed(() => {
  const tasks = taskStore.tasks;
  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Proyectos activos = categorías distintas con tareas pendientes
  const categories = new Set(
    tasks
      .filter(t => !t.completed)
      .map(t => (t as any).category ?? (t as any).categoryId)
      .filter(Boolean)
  );

  return {
    tasksCompleted: completed,
    totalTasks: total,
    activeProjects: categories.size,
    streakDays: analyticsService.calculateStreak(tasks),
    successRate
  };
});

const initials = computed(() => {
  const { fullName, email } = profile.value;
  if (fullName) return fullName.charAt(0).toUpperCase();
  if (email) return email.split('@')[0].charAt(0).toUpperCase();
  return 'U';
});

function syncFromAuthStore() {
  const user = authStore.user as any;
  if (!user) return;

  profile.value = {
    fullName: user.fullName || '',
    email: user.email || '',
    bio: user.bio || '',
    phone: user.phone || '',
    location: user.location || '',
    timezone: user.timezone || defaultTimezone,
    language: user.language || 'es'
  };

  memberSince.value = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  // No pisamos lo que el usuario está escribiendo
  if (!isEditing.value) {
    editedProfile.value = { ...profile.value };
  }
}

function startEdit() {
  editedProfile.value = { ...profile.value };
  saveError.value = null;
  isEditing.value = true;
}

function cancelEdit() {
  clearTimeout(closeTimer);
  saveSuccess.value = false;
  saveError.value = null;
  isEditing.value = false;
}

async function handleSave() {
  loading.value = true;
  saveError.value = null;
  try {
    const payload = { ...editedProfile.value, email: profile.value.email };
    await api.updateProfile(payload);

    profile.value = { ...payload };

    if (authStore.user) {
      Object.assign(authStore.user, payload);
    }

    saveSuccess.value = true;
    closeTimer = setTimeout(() => {
      saveSuccess.value = false;
      isEditing.value = false;
    }, 1500);
  } catch (error) {
    console.error('Error guardando perfil:', error);
    saveError.value = 'No se pudo guardar el perfil. Inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
}

// El watch va en el setup (no dentro de onMounted tras un await) para que se limpie con el componente
watch(() => authStore.user, syncFromAuthStore, { deep: true, immediate: true });

onMounted(async () => {
  try {
    await taskStore.fetchTasks();
  } catch (e) {
    console.error('Error cargando tareas:', e);
  }
  try {
    await (taskStore as any).fetchStats?.();
  } catch (e) {
    console.error('Error cargando estadísticas:', e);
  }
});

onUnmounted(() => clearTimeout(closeTimer));
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900">
    <Sidebar />

    <div class="flex-1 flex flex-col">
      <Header />

      <main class="flex-1 p-6 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            <button @click="handleSave" :disabled="loading || saveSuccess" class="flex items-center px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 text-white rounded-xl font-medium shadow-lg">
              <Save class="h-5 w-5 mr-2" />
              {{ saveSuccess ? '¡Guardado!' : (loading ? 'Guardando...' : 'Guardar') }}
            </button>
          </div>
        </div>

        <div v-if="saveError" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
          {{ saveError }}
        </div>

        <!-- Banner -->
        <div class="bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 rounded-2xl shadow-2xl p-6 sm:p-8">
          <div class="flex flex-col sm:flex-row sm:items-center gap-6">
            <div class="relative mx-auto sm:mx-0">
              <div class="w-24 h-24 sm:w-28 sm:h-28 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl ring-4 ring-white/20">
                <span class="text-4xl sm:text-5xl font-bold text-white">{{ initials }}</span>
              </div>
              <button v-if="isEditing" disabled title="Próximamente" class="absolute bottom-0 right-0 p-3 bg-white text-purple-600 rounded-full shadow-lg opacity-60 cursor-not-allowed">
                <Camera class="h-5 w-5" />
              </button>
            </div>

            <div class="text-white text-center sm:text-left flex-1">
              <h2 class="text-2xl sm:text-3xl font-bold">{{ profile.fullName || 'Usuario' }}</h2>
              <p class="text-blue-100 mt-1 text-sm sm:text-base">{{ profile.email }}</p>
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-blue-100">
                <div v-if="memberSince" class="flex items-center">
                  <Calendar class="h-4 w-4 mr-1.5" />
                  <span>Miembro desde {{ memberSince }}</span>
                </div>
                <div v-if="stats.streakDays > 0" class="flex items-center px-3 py-1 bg-white/20 rounded-full">
                  <Award class="h-4 w-4 mr-1.5" />
                  <span>{{ stats.streakDays }} días de racha</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats -->
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
          <!-- Información personal -->
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
                <p v-else class="text-gray-900 dark:text-white font-medium">{{ profile.fullName || 'No especificado' }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <div class="flex items-center">
                  <Mail class="h-5 w-5 text-gray-400 mr-2" />
                  <p class="text-gray-900 dark:text-white font-medium">{{ profile.email }}</p>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono</label>
                <div v-if="isEditing">
                  <input v-model="editedProfile.phone" type="tel" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white" placeholder="Número de teléfono" />
                </div>
                <div v-else class="flex items-center">
                  <Phone class="h-5 w-5 text-gray-400 mr-2" />
                  <p class="text-gray-900 dark:text-white font-medium">{{ profile.phone || 'No especificado' }}</p>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ubicación</label>
                <div v-if="isEditing">
                  <input v-model="editedProfile.location" type="text" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white" placeholder="Tu ubicación" />
                </div>
                <div v-else class="flex items-center">
                  <MapPin class="h-5 w-5 text-gray-400 mr-2" />
                  <p class="text-gray-900 dark:text-white font-medium">{{ profile.location || 'No especificada' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Configuración adicional -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Clock class="h-5 w-5 mr-2 text-blue-600" />
              Configuración Adicional
            </h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Biografía</label>
                <div v-if="isEditing">
                  <textarea v-model="editedProfile.bio" rows="3" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none" placeholder="Cuéntanos sobre ti..."></textarea>
                </div>
                <p v-else class="text-gray-900 dark:text-white">{{ profile.bio || 'No hay biografía disponible' }}</p>
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
                  <p class="text-gray-900 dark:text-white">{{ timezoneLabel }}</p>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Idioma</label>
                <div v-if="isEditing">
                  <select v-model="editedProfile.language" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white">
                    <option v-for="lang in languages" :key="lang.value" :value="lang.value">{{ lang.label }}</option>
                  </select>
                </div>
                <p v-else class="text-gray-900 dark:text-white">{{ languageLabel }}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>