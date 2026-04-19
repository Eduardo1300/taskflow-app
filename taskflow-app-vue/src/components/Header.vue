<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTaskStore } from '@/stores/tasks';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import {
  CheckSquare, Search, Plus, Bell, Settings, Sun, Moon,
  ChevronDown, LogOut, User, Menu, X, Sparkles
} from 'lucide-vue-next';

const emit = defineEmits(['new-task']);

const router = useRouter();
const route = useRoute();
const taskStore = useTaskStore();
const authStore = useAuthStore();
const themeStore = useThemeStore();

const searchInput = ref('');
const isSearchOpen = ref(false);
const isMenuOpen = ref(false);
const isNotificationsOpen = ref(false);
const userMenuRef = ref<HTMLElement | null>(null);

watch(searchInput, (value) => {
  taskStore.setSearchQuery(value);
  if (value && route.path !== '/search') {
    router.push('/search');
  }
});

function handleSearch(e: Event) {
  e.preventDefault();
  if (searchInput.value.trim()) {
    taskStore.setSearchQuery(searchInput.value.trim());
    if (route.path !== '/search') {
      router.push('/search');
    }
  }
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function openNewTask() {
  emit('new-task');
}

function navigateTo(path: string) {
  router.push(path);
  isMenuOpen.value = false;
}

async function logout() {
  await authStore.logout();
  router.push('/');
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
    <div class="w-full px-3 sm:px-4 lg:px-8">
      <div class="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
        <!-- Logo -->
        <div class="flex items-center cursor-pointer min-w-0" @click="navigateTo('/dashboard')">
          <div class="relative flex-shrink-0">
            <CheckSquare class="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
            <div class="absolute -top-1 -right-1 w-2 sm:w-3 h-2 sm:h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
          <div class="ml-2 sm:ml-3 hidden sm:block">
            <h1 class="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TaskFlow
            </h1>
            <p class="text-xs text-gray-500 dark:text-gray-400 hidden lg:block">
              Productividad inteligente
            </p>
          </div>
        </div>

        <!-- Search Bar - Desktop -->
        <div class="hidden lg:flex flex-1 max-w-md mx-4">
          <div class="relative w-full">
            <form @submit="handleSearch" class="relative">
              <input
                type="text"
                v-model="searchInput"
                placeholder="Buscar tareas..."
                class="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
          </div>
        </div>

        <!-- Right Side Actions -->
        <div v-if="authStore.isAuthenticated" class="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <!-- Mobile Search Button -->
          <button
            @click="isSearchOpen = !isSearchOpen"
            class="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Search class="h-5 w-5" />
          </button>

          <!-- Quick Actions Button -->
          <button
            @click="openNewTask"
            class="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            <Plus class="h-5 w-5" />
            <span class="hidden md:inline">Nueva Tarea</span>
          </button>

          <!-- Theme Toggle -->
          <button
            @click="themeStore.toggle()"
            class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
            :title="themeStore.isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
          >
            <Sun v-if="themeStore.isDark" class="h-5 w-5 group-hover:rotate-12 transition-transform duration-200" />
            <Moon v-else class="h-5 w-5 group-hover:-rotate-12 transition-transform duration-200" />
          </button>

          <!-- Notification Button -->
          <button
            @click="isNotificationsOpen = !isNotificationsOpen"
            class="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
          >
            <Bell class="h-5 w-5 group-hover:animate-bounce" />
          </button>

          <!-- Settings Button -->
          <button
            @click="navigateTo('/settings')"
            class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
          >
            <Settings class="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
          </button>

          <!-- User Menu -->
          <div class="relative" ref="userMenuRef">
            <button
              @click="toggleMenu"
              class="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group flex-shrink-0"
            >
              <div class="flex items-center space-x-1 sm:space-x-2">
                <div class="relative">
                  <div class="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm flex-shrink-0">
                    {{ authStore.user?.email?.charAt(0).toUpperCase() || 'U' }}
                  </div>
                  <div class="absolute -bottom-0.5 -right-0.5 w-2 sm:w-3 h-2 sm:h-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>
                <div class="hidden sm:block text-left">
                  <p class="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate max-w-[100px]">
                    {{ authStore.user?.email?.split('@')[0] || 'Usuario' }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">En línea</p>
                </div>
              </div>
              <ChevronDown :class="['h-4 w-4 text-gray-400 transition-transform duration-200 hidden sm:block', isMenuOpen && 'rotate-180']" />
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="isMenuOpen"
              class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50"
            >
              <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ authStore.user?.email }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Cuenta personal</p>
              </div>

              <button
                @click="navigateTo('/profile')"
                class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <User class="h-4 w-4 mr-3 text-blue-500" />
                Mi Perfil
              </button>

              <button
                @click="navigateTo('/settings')"
                class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings class="h-4 w-4 mr-3" />
                Configuración
              </button>

              <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>

              <button
                @click="logout"
                class="w-full flex items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut class="h-4 w-4 mr-3" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Search Bar -->
      <div v-if="isSearchOpen" class="md:hidden py-3 border-t border-gray-200 dark:border-gray-700">
        <form @submit="handleSearch" class="relative">
          <input
            type="text"
            v-model="searchInput"
            placeholder="Buscar tareas, proyectos..."
            class="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            autofocus
          />
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </form>
      </div>
    </div>
  </header>
</template>