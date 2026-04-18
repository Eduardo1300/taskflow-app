<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import { HelpCircle, Mail, MessageSquare, FileText, User, LogOut, ChevronRight, BookOpen, LifeBuoy, MessageCircle, ExternalLink, Send } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const activeTab = ref<'help' | 'faq' | 'contact'>('help');
const showContactForm = ref(false);
const contactName = ref('');
const contactEmail = ref('');
const contactMessage = ref('');
const contactSent = ref(false);

const faqs = ref([
  { q: '¿Cómo creo una tarea?', a: 'Haz clic en el botón "Nueva Tarea" en el Dashboard y completa el formulario.' },
  { q: '¿Cómo cambio el idioma?', a: 'Ve a Configuración > Apariencia > Idioma y selecciona tu idioma preferido.' },
  { q: '¿Puedo integrar con otras apps?', a: 'Sí, visita la página de Integraciones para conectar con Google Calendar, Slack, Discord y más.' },
  { q: '¿Cómo funcionaan las prioridades?', a: 'Las tareas pueden ser de prioridad Alta, Media o Baja. Las de alta prioridad aparecen primero.' },
  { q: '¿Puedo compartir tareas con otros?', a: 'Sí, en el modo Kanban puedes hacer clic en el botón de compartir en cada tarea.' },
  { q: '¿Los datos están seguros?', a: 'Sí, usamos encriptación de extremo a extremo y tus datos se almacenan de forma segura.' }
]);

const helpTopics = [
  { id: 'getting-started', title: 'Comenzar', icon: BookOpen, articles: 5 },
  { id: 'tasks', title: 'Gestión de Tareas', icon: FileText, articles: 12 },
  { id: 'collaboration', title: 'Colaboración', icon: Users, articles: 8 },
  { id: 'integrations', title: 'Integraciones', icon: MessageSquare, articles: 6 },
  { id: 'account', title: 'Cuenta', icon: User, articles: 4 }
];

function logout() {
  authStore.logout();
  router.push('/login');
}

function sendContact() {
  if (contactName.value && contactEmail.value && contactMessage.value) {
    contactSent.value = true;
    setTimeout(() => {
      contactSent.value = false;
      showContactForm.value = false;
      contactName.value = '';
      contactEmail.value = '';
      contactMessage.value = '';
    }, 2000);
  }
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
            <div class="bg-gradient-to-br from-blue-500 to-purple-600 p-3 sm:p-4 rounded-2xl shadow-xl">
              <LifeBuoy class="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Ayuda</h1>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Encuentra respuesta a tus preguntas</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Sidebar -->
          <div class="lg:w-64 space-y-2">
            <button 
              v-for="tab in [
                { id: 'help', label: 'Ayuda', icon: LifeBuoy },
                { id: 'faq', label: 'FAQ', icon: MessageCircle },
                { id: 'contact', label: 'Contacto', icon: Mail }
              ]"
              :key="tab.id"
              @click="activeTab = tab.id as any"
              :class="['w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all', activeTab === tab.id ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700']"
            >
              <component :is="tab.icon" class="h-5 w-5" />
              <span>{{ tab.label }}</span>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1">
            <!-- Help Tab -->
            <div v-if="activeTab === 'help'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                v-for="topic in helpTopics" 
                :key="topic.id"
                class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all cursor-pointer"
              >
                <component :is="topic.icon" class="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3" />
                <h3 class="font-semibold text-gray-900 dark:text-white mb-1">{{ topic.title }}</h3>
                <p class="text-sm text-gray-500">{{ topic.articles }} artículos</p>
                <ChevronRight class="h-5 w-5 text-gray-400 mt-3" />
              </div>
            </div>

            <!-- FAQ Tab -->
            <div v-else-if="activeTab === 'faq'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preguntas Frecuentes</h2>
              
              <div class="space-y-4">
                <div 
                  v-for="(faq, index) in faqs" 
                  :key="index"
                  class="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                >
                  <h3 class="font-medium text-gray-900 dark:text-white mb-2">• {{ faq.q }}</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ faq.a }}</p>
                </div>
              </div>
            </div>

            <!-- Contact Tab -->
            <div v-else-if="activeTab === 'contact'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contacto</h2>
              
              <div v-if="!showContactForm">
                <p class="text-gray-500 mb-6">¿No encontraste lo que buscabas? Envíanos un mensaje.</p>
                <button 
                  @click="showContactForm = true" 
                  class="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700"
                >
                  <Mail class="h-5 w-5 mr-2" />
                  Enviar mensaje
                </button>
              </div>

              <div v-else class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                  <input 
                    v-model="contactName" 
                    type="text" 
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input 
                    v-model="contactEmail" 
                    type="email" 
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mensaje</label>
                  <textarea 
                    v-model="contactMessage" 
                    rows="4"
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
                    placeholder="¿En qué podemos ayudarte?"
                  ></textarea>
                </div>
                <div class="flex gap-3">
                  <button 
                    @click="showContactForm = false" 
                    class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button 
                    @click="sendContact" 
                    :disabled="!contactName || !contactEmail || !contactMessage || contactSent"
                    class="flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50"
                  >
                    <Send class="h-4 w-4 mr-2" />
                    {{ contactSent ? 'Enviado!' : 'Enviar' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Logout Button -->
        <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button 
            @click="logout"
            class="flex items-center text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            <LogOut class="h-5 w-5 mr-2" />
            Cerrar sesión
          </button>
        </div>
      </main>
    </div>
  </div>
</template>