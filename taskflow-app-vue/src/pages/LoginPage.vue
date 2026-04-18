<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Loader2, AlertCircle, CheckCircle } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref('admin@taskflow.com');
const password = ref('admin123');
const showPassword = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const rememberMe = ref(false);

async function handleSubmit() {
  if (loading.value) return;

  loading.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    await authStore.login(email.value, password.value);
    successMessage.value = '¡Inicio de sesión exitoso! Redirigiendo...';
    setTimeout(() => {
      const redirect = route.query.redirect as string || '/dashboard';
      router.push(redirect);
    }, 1500);
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Error al iniciar sesión';
  } finally {
    loading.value = false;
  }
}

const features = [
  'Gestión inteligente de tareas',
  'Colaboración en tiempo real',
  'Analytics avanzados',
  'Integración con APIs'
];
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
    <div class="flex-1 flex items-center justify-center px-6 py-12 lg:px-8">
      <div class="w-full max-w-md space-y-8">
        <div class="text-center">
          <div class="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Sparkles class="h-8 w-8 text-white" />
          </div>
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
            Bienvenido de vuelta
          </h2>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Inicia sesión en tu cuenta de TaskFlow
          </p>
          <div class="mt-4 mb-2 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg text-blue-900 dark:text-blue-100 text-base text-center shadow">
            <span class="font-bold text-blue-700 dark:text-blue-200 flex items-center justify-center gap-2">
              Acceso de prueba rápido
            </span>
            <div class="mt-2 flex flex-col items-center gap-1">
              <span>
                <span class="font-semibold">Correo:</span>
                <span class="font-mono bg-white/60 dark:bg-gray-800/60 px-2 py-1 rounded ml-2">admin@taskflow.com</span>
              </span>
              <span>
                <span class="font-semibold">Contraseña:</span>
                <span class="font-mono bg-white/60 dark:bg-gray-800/60 px-2 py-1 rounded ml-2">admin123</span>
              </span>
            </div>
          </div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div class="flex items-center">
            <AlertCircle class="w-5 h-5 text-red-600 dark:text-red-400" />
            <p class="ml-3 text-sm text-red-600 dark:text-red-400">{{ error }}</p>
          </div>
        </div>

        <div v-if="successMessage" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div class="flex items-center">
            <CheckCircle class="w-5 h-5 text-green-600 dark:text-green-400" />
            <p class="ml-3 text-sm text-green-600 dark:text-green-400">{{ successMessage }}</p>
          </div>
        </div>

        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Correo electrónico
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail class="h-5 w-5 text-gray-400" />
              </div>
              <input
                v-model="email"
                type="email"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contraseña
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="h-5 w-5 text-gray-400" />
              </div>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                placeholder="Tu contraseña"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button type="button" @click="showPassword = !showPassword" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <EyeOff v-if="showPassword" class="h-5 w-5" />
                  <Eye v-else class="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input v-model="rememberMe" id="remember-me" type="checkbox" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded" />
              <label for="remember-me" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Recordarme
              </label>
            </div>
            <div class="text-sm">
              <a href="#" class="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span v-if="loading" class="flex items-center">
              <Loader2 class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Iniciando sesión...
            </span>
            <span v-else class="flex items-center">
              Iniciar sesión
              <ArrowRight class="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </form>

        <div class="text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            ¿No tienes una cuenta?
            <router-link to="/register" class="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors">
              Regístrate aquí
            </router-link>
          </p>
        </div>
      </div>
    </div>

    <div class="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-full">
        <div class="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div class="absolute bottom-32 right-16 w-24 h-24 bg-purple-300/20 rounded-full blur-lg"></div>
        <div class="absolute top-1/2 left-1/3 w-16 h-16 bg-blue-300/20 rounded-full blur-md"></div>
      </div>

      <div class="relative z-10 text-center text-white p-12 max-w-lg">
        <div class="mb-8">
          <div class="w-20 h-20 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
            <Sparkles class="h-10 w-10 text-white" />
          </div>
          <h3 class="text-3xl font-bold mb-4">
            Productividad sin límites
          </h3>
          <p class="text-lg text-blue-100 mb-8">
            Organiza, colabora y alcanza tus objetivos con TaskFlow
          </p>
        </div>

        <div class="space-y-4">
          <div v-for="(feature, index) in features" :key="index" class="flex items-center text-left">
            <div class="flex-shrink-0 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center mr-3">
              <CheckCircle class="w-4 h-4 text-green-800" />
            </div>
            <span class="text-blue-100">{{ feature }}</span>
          </div>
        </div>

        <div class="mt-12 p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
          <p class="text-sm text-blue-100 italic">
            "TaskFlow ha revolucionado la forma en que gestionamos nuestros proyectos. La interfaz es intuitiva y las funciones de colaboración son increíbles."
          </p>
          <div class="mt-4 flex items-center justify-center">
            <div class="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
              M
            </div>
            <div class="text-left">
              <p class="text-white font-medium text-sm">María González</p>
              <p class="text-blue-200 text-xs">Product Manager</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>