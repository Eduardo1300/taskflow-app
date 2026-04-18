<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTaskStore } from '@/stores/tasks';
import { useThemeStore } from '@/stores/theme';
import {
  LayoutDashboard,
  Calendar,
  User,
  LogOut,
  BarChart3,
  Globe,
  Zap,
  Trello,
  Settings,
  Search,
  Target,
  HelpCircle,
  Book,
  Moon,
  Sun,
  Menu,
  X,
  TrendingUp,
  Sparkles
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const taskStore = useTaskStore();
const themeStore = useThemeStore();

const isOpen = ref(false);
const sidebarSearch = ref('');
const hoveredItem = ref<string | null>(null);

const completedCount = computed(() => taskStore.completedTasks.length);
const totalCount = computed(() => taskStore.tasks.length);
const progress = computed(() => totalCount.value > 0 ? Math.round((completedCount.value / totalCount.value) * 100) : 0);

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard', color: 'text-blue-500', description: 'Vista general de tus tareas' },
  { id: 'kanban', label: 'Kanban', icon: Trello, route: '/kanban', color: 'text-purple-500', description: 'Organiza tus tareas visualmente' },
  { id: 'calendar', label: 'Calendario', icon: Calendar, route: '/calendar', color: 'text-green-500', description: 'Planifica tu tiempo' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, route: '/analytics', color: 'text-orange-500', description: 'Métricas de productividad' },
  { id: 'api', label: 'API REST', icon: Globe, route: '/api', color: 'text-cyan-500', description: 'Gestiona tu API', premium: true },
  { id: 'integrations', label: 'Integraciones', icon: Zap, route: '/integrations', color: 'text-yellow-500', description: 'Conecta con otras apps', premium: true },
  { id: 'profile', label: 'Perfil', icon: User, route: '/profile', color: 'text-gray-500', description: 'Configuración personal' }
];

const secondaryItems = [
  { id: 'settings', label: 'Configuración', icon: Settings, route: '/settings', color: 'text-gray-500', description: 'Ajustes de la aplicación' },
  { id: 'help', label: 'Ayuda', icon: HelpCircle, route: '/help', color: 'text-gray-500', description: 'Soporte y documentación' },
  { id: 'docs', label: 'Documentación', icon: Book, route: '/docs', color: 'text-indigo-500', description: 'API y guías técnicas' }
];

function navigate(path: string) {
  router.push(path);
  isOpen.value = false;
}

function toggleMobile() {
  isOpen.value = !isOpen.value;
}

function handleSearch(e: Event) {
  e.preventDefault();
  if (sidebarSearch.value.trim()) {
    localStorage.setItem('taskflow_search_query', sidebarSearch.value.trim());
    router.push('/dashboard');
    sidebarSearch.value = '';
  }
}

function isActive(path: string) {
  return route.path === path;
}

async function logout() {
  await authStore.logout();
  router.push('/');
}
</script>

<template>
  <div>
    <!-- Mobile Menu Button -->
    <button
      @click="toggleMobile"
      class="lg:hidden fixed top-4 left-4 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-2 rounded-full shadow border dark:border-gray-600"
    >
      <Menu class="h-6 w-6 text-gray-700 dark:text-gray-300" />
    </button>

    <!-- Sidebar Backdrop (mobile) -->
    <div
      v-if="isOpen"
      @click="isOpen = false"
      class="fixed inset-0 bg-black bg-opacity-30 z-20 lg:hidden"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 shadow-xl transform transition-all duration-300 ease-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:static lg:translate-x-0 w-64 lg:w-64'
      ]"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div class="flex items-center space-x-3">
          <div class="relative">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Target class="h-6 w-6 text-white" />
            </div>
            <div class="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
          </div>
          <div>
            <h2 class="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TaskFlow
            </h2>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Productividad Premium
            </p>
          </div>
        </div>

        <button
          @click="isOpen = false"
          class="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X class="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <!-- Search -->
      <div class="p-4">
        <form @submit="handleSearch" class="relative">
          <input
            type="text"
            v-model="sidebarSearch"
            placeholder="Buscar..."
            class="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </form>
      </div>

      <!-- Progress -->
      <div class="px-4 pb-4">
        <div class="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-900 dark:text-white">Progreso</span>
            <span class="text-sm font-bold text-blue-600 dark:text-blue-400">{{ progress }}%</span>
          </div>
          <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              :style="{ width: `${progress}%` }"
            />
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {{ completedCount }} de {{ totalCount }} tareas completadas
          </p>
        </div>
      </div>

      <!-- Menu -->
      <nav class="flex-1 p-4 space-y-2">
        <div class="space-y-1">
          <button
            v-for="item in menuItems"
            :key="item.id"
            @click="navigate(item.route)"
            @mouseenter="hoveredItem = item.id"
            @mouseleave="hoveredItem = null"
            :class="[
              'w-full flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-all duration-200 group relative',
              isActive(item.route || '')
                ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 shadow-lg'
                : hoveredItem === item.id
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            ]"
          >
            <div class="relative">
              <component
                :is="item.icon"
                :class="['h-6 w-6 transition-all duration-200', hoveredItem === item.id ? item.color + ' scale-110' : item.color]"
              />
              <div v-if="isActive(item.route || '')" class="absolute inset-0 rounded-lg bg-current opacity-20 animate-pulse" />
            </div>

            <span class="flex-1 text-left ml-4">{{ item.label }}</span>

            <div class="flex items-center space-x-2">
              <span v-if="item.premium" class="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full">
                Pro
              </span>
            </div>

            <!-- Active indicator -->
            <div
              v-if="isActive(item.route || '')"
              class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full"
            />
          </button>
        </div>

        <div class="my-6 border-t border-gray-200 dark:border-gray-700" />

        <div class="space-y-1">
          <button
            v-for="item in secondaryItems"
            :key="item.id"
            @click="navigate(item.route)"
            @mouseenter="hoveredItem = item.id"
            @mouseleave="hoveredItem = null"
            :class="[
              'w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
              isActive(item.route || '')
                ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 shadow-lg'
                : hoveredItem === item.id
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            ]"
          >
            <component :is="item.icon" :class="['h-5 w-5 mr-4 transition-transform duration-200', hoveredItem === item.id ? 'scale-110' : '']" />
            {{ item.label }}
          </button>
        </div>
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          @click="themeStore.toggle()"
          class="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <Moon v-if="!themeStore.isDark" class="h-5 w-5 mr-4" />
          <Sun v-else class="h-5 w-5 mr-4" />
          {{ themeStore.isDark ? 'Modo Claro' : 'Modo Oscuro' }}
        </button>

        <button
          @click="logout"
          class="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all mt-2"
        >
          <LogOut class="h-5 w-5 mr-4" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  </div>
</template>