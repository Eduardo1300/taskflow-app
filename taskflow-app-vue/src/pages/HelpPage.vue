<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import { HelpCircle, Mail, MessageSquare, FileText, User, Settings, LogOut, ChevronRight, BookOpen, LifeBuoy, MessageCircle } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const activeTab = ref<'help' | 'faq' | 'contact'>('help');

const faqs = ref([
  { q: '¿Cómo creo una tarea?', a: 'Haz clic en el botón "Nueva Tarea" en el Dashboard.' },
  { q: '¿Cómo cambio el idioma?', a: 'Ve a Configuración > Apariencia > Idioma.' },
  { q: '¿Puedo integrar con otras apps?', a: 'Sí, ve a la página de Integraciones.' }
]);

function logout() {
  authStore.logout();
  router.push('/login');
}
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900">
    <Sidebar />

    <div class="flex-1 flex flex-col">
      <Header />

      <main class="flex-1 p-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Ayuda</h1>

        <div class="flex space-x-2 mb-6">
          <button @click="activeTab = 'help'" :class="['px-4 py-2 rounded-xl font-medium', activeTab === 'help' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600']">
            <HelpCircle class="h-5 w-5 inline mr-2" />Ayuda
          </button>
          <button @click="activeTab = 'faq'" :class="['px-4 py-2 rounded-xl font-medium', activeTab === 'faq' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600']">
            <BookOpen class="h-5 w-5 inline mr-2" />FAQ
          </button>
          <button @click="activeTab = 'contact'" :class="['px-4 py-2 rounded-xl font-medium', activeTab === 'contact' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600']">
            <MessageCircle class="h-5 w-5 inline mr-2" />Contacto
          </button>
        </div>

        <div v-if="activeTab === 'help'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="link in [{ icon: BookOpen, label: 'Documentación', desc: 'Aprende a usar TaskFlow' }, { icon: LifeBuoy, label: 'Guía de Inicio', desc: 'Primeros pasos' }, { icon: MessageCircle, label: 'Comunidad', desc: 'Pregunta a otros usuarios' }]" :key="link.label" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md transition-all">
            <component :is="link.icon" class="h-8 w-8 text-blue-500 mb-4" />
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">{{ link.label }}</h3>
            <p class="text-sm text-gray-500">{{ link.desc }}</p>
            <ChevronRight class="h-5 w-5 text-gray-400 mt-4" />
          </div>
        </div>

        <div v-else-if="activeTab === 'faq'" class="space-y-4">
          <div v-for="faq in faqs" :key="faq.q" class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h3 class="font-medium text-gray-900 dark:text-white">{{ faq.q }}</h3>
            <p class="text-sm text-gray-500 mt-2">{{ faq.a }}</p>
          </div>
        </div>

        <div v-else-if="activeTab === 'contact'" class="max-w-xl">
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Contacto</h3>
            <p class="text-gray-500 mb-4">¿Tienes preguntas? Contáctanos.</p>
            <a href="mailto:soporte@taskflow.com" class="flex items-center space-x-2 text-blue-600"><Mail class="h-5 w-5" /><span>soporte@taskflow.com</span></a>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>