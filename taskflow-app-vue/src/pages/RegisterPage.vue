<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle, Loader2, Shield, AlertCircle } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const acceptTerms = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const getPasswordStrength = (pass: string) => {
  let strength = 0;
  if (pass.length >= 8) strength++;
  if (/[a-z]/.test(pass)) strength++;
  if (/[A-Z]/.test(pass)) strength++;
  if (/[0-9]/.test(pass)) strength++;
  if (/[^A-Za-z0-9]/.test(pass)) strength++;
  return strength;
};

const passwordStrength = computed(() => getPasswordStrength(password.value));

async function handleSubmit() {
  if (loading.value) return;

  error.value = null;
  successMessage.value = null;

  if (!name.value.trim()) {
    error.value = 'El nombre es requerido';
    return;
  }

  if (password.value.length < 8) {
    error.value = 'La contraseña debe tener al menos 8 caracteres';
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden';
    return;
  }

  if (!acceptTerms.value) {
    error.value = 'Debes aceptar los términos y condiciones';
    return;
  }

  loading.value = true;

  try {
    await authStore.register(email.value, password.value, name.value);
    successMessage.value = '¡Registro exitoso! Redirigiendo...';
    setTimeout(() => router.push('/dashboard'), 1500);
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Error al registrar la cuenta';
  } finally {
    loading.value = false;
  }
}

const benefits = [
  'Gestión avanzada de tareas',
  'Colaboración en tiempo real',
  'Análisis de productividad',
  'Integraciones potentes',
  'Soporte técnico 24/7',
  'Sincronización en la nube'
];
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
    <div class="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-full">
        <div class="absolute top-32 right-20 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
        <div class="absolute bottom-20 left-16 w-28 h-28 bg-blue-300/20 rounded-full blur-lg"></div>
        <div class="absolute top-1/3 right-1/4 w-20 h-20 bg-purple-300/20 rounded-full blur-md"></div>
      </div>

      <div class="relative z-10 text-center text-white p-12 max-w-lg">
        <div class="mb-8">
          <div class="w-20 h-20 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
            <Shield class="h-10 w-10 text-white" />
          </div>
          <h3 class="text-3xl font-bold mb-4">
            Únete a miles de usuarios
          </h3>
          <p class="text-lg text-purple-100 mb-8">
            Descubre una nueva forma de ser productivo con TaskFlow
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-8">
          <div v-for="(benefit, index) in benefits" :key="index" class="flex items-center text-left">
            <div class="flex-shrink-0 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center mr-2">
              <CheckCircle class="w-3 h-3 text-green-800" />
            </div>
            <span class="text-purple-100 text-sm">{{ benefit }}</span>
          </div>
        </div>

        <div class="p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
          <div class="flex items-center justify-center mb-4">
            <div class="flex -space-x-2">
              <div v-for="i in 4" :key="i" class="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white">
                {{ String.fromCharCode(64 + i) }}
              </div>
            </div>
          </div>
          <p class="text-sm text-purple-100 mb-2">
            <span class="font-bold text-white">+10,000</span> usuarios activos
          </p>
          <p class="text-xs text-purple-200">
            Se han unido este mes
          </p>
        </div>
      </div>
    </div>

    <div class="flex-1 flex items-center justify-center px-6 py-12 lg:px-8">
      <div class="w-full max-w-md space-y-8">
        <div class="text-center">
          <div class="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Sparkles class="h-8 w-8 text-white" />
          </div>
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
            Crear cuenta
          </h2>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Únete a TaskFlow y potencia tu productividad
          </p>
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
              Nombre completo
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User class="h-5 w-5 text-gray-400" />
              </div>
              <input
                v-model="name"
                type="text"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                placeholder="Tu nombre completo"
              />
            </div>
          </div>

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
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
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
                class="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                placeholder="Crea una contraseña segura"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button type="button" @click="showPassword = !showPassword" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <EyeOff v-if="showPassword" class="h-5 w-5" />
                  <Eye v-else class="h-5 w-5" />
                </button>
              </div>
            </div>
            <div v-if="password" class="mt-2">
              <div class="flex space-x-1">
                <div v-for="i in 5" :key="i" class="flex-1 h-2 rounded-full" :class="i <= passwordStrength ? (passwordStrength <= 2 ? 'bg-red-400' : passwordStrength <= 3 ? 'bg-yellow-400' : 'bg-green-400') : 'bg-gray-200 dark:bg-gray-700'"></div>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ passwordStrength <= 2 ? 'Débil' : passwordStrength <= 3 ? 'Media' : 'Fuerte' }}
              </p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirmar contraseña
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="h-5 w-5 text-gray-400" />
              </div>
              <input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                placeholder="Confirma tu contraseña"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <EyeOff v-if="showConfirmPassword" class="h-5 w-5" />
                  <Eye v-else class="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input
                id="accept-terms"
                v-model="acceptTerms"
                type="checkbox"
                class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="accept-terms" class="text-gray-700 dark:text-gray-300">
                Acepto los
                <a href="#" class="text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors">
                  términos y condiciones
                </a>
                y la
                <a href="#" class="text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors">
                  política de privacidad
                </a>
              </label>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span v-if="loading" class="flex items-center">
              <Loader2 class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Creando cuenta...
            </span>
            <span v-else class="flex items-center">
              Crear cuenta
              <ArrowRight class="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </form>

        <div class="text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            ¿Ya tienes una cuenta?
            <router-link to="/login" class="text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors">
              Inicia sesión
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>