<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import { User, Mail, Camera, Save, UserPlus } from 'lucide-vue-next';

const authStore = useAuthStore();

const name = ref(authStore.user?.name || '');
const email = ref(authStore.user?.email || '');
const bio = ref('');
const loading = ref(false);
const saveSuccess = ref(false);

const initials = computed(() => email.value ? email.value.split('@')[0].charAt(0).toUpperCase() : 'U');

function handleSave() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    saveSuccess.value = true;
    setTimeout(() => saveSuccess.value = false, 3000);
  }, 1000);
}
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900">
    <Sidebar />

    <div class="flex-1 flex flex-col">
      <Header />

      <main class="flex-1 p-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Perfil</h1>

        <div class="max-w-2xl">
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-6 mb-6">
              <div class="relative">
                <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {{ initials }}
                </div>
                <button class="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-700 rounded-full shadow">
                  <Camera class="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ email }}</h2>
                <p class="text-gray-500">Miembro desde 2024</p>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User class="h-5 w-5 text-gray-400" />
                  </div>
                  <input v-model="name" type="text" class="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Tu nombre" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail class="h-5 w-5 text-gray-400" />
                  </div>
                  <input v-model="email" type="email" class="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                <textarea v-model="bio" rows="3" class="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Cuéntanos sobre ti..."></textarea>
              </div>
            </div>

            <div class="mt-6 flex justify-end">
              <button @click="handleSave" :disabled="loading" class="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50">
                <Save class="h-5 w-5" /><span>{{ saveSuccess ? 'Guardado!' : loading ? 'Guardando...' : 'Guardar Cambios' }}</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>