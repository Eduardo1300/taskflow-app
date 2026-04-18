<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  CheckSquare, LayoutDashboard, Trello, Calendar, BarChart3, Zap,
  Globe, Shield, CheckCircle, Star, Clock, AlertTriangle, Mail,
  ArrowRight, Play, Sparkles, Target, TrendingUp,
  Users, Lock, Cloud, Award, ChevronDown, Menu, X,
  ArrowUpRight
} from 'lucide-vue-next';

const router = useRouter();

const expandedFAQ = ref<number | null>(0);
const mobileMenuOpen = ref(false);

const features = [
  { icon: Target, title: 'Gestión Inteligente', desc: 'Organiza tus tareas con IA y automatización avanzada', color: 'from-blue-500 to-cyan-500' },
  { icon: Users, title: 'Colaboración Real', desc: 'Trabaja en equipo con sincronización en tiempo real', color: 'from-purple-500 to-pink-500' },
  { icon: BarChart3, title: 'Analytics Potentes', desc: 'Analiza tu productividad con métricas detalladas', color: 'from-orange-500 to-red-500' },
  { icon: Globe, title: 'Integraciones', desc: 'Conecta con tus herramientas favoritas', color: 'from-green-500 to-emerald-500' },
  { icon: Shield, title: 'Seguridad Total', desc: 'Tus datos están protegidos con encriptación', color: 'from-indigo-500 to-purple-500' },
  { icon: Zap, title: 'Súper Rápido', desc: 'Rendimiento optimizado para máxima velocidad', color: 'from-yellow-500 to-orange-500' }
];

const testimonials = [
  { name: 'Ana Martínez', role: 'CEO, TechStart', text: 'TaskFlow ha transformado completamente cómo gestionamos nuestros proyectos. La interfaz es intuitiva y las funciones son exactamente lo que necesitábamos.', avatar: 'A', rating: 5 },
  { name: 'Carlos Rodríguez', role: 'Freelancer', text: 'Como freelancer, necesitaba algo simple pero poderoso. TaskFlow me permite mantener organizados múltiples clientes sin complicaciones.', avatar: 'C', rating: 5 },
  { name: 'María González', role: 'Product Manager', text: 'Las funciones de colaboración son increíbles. Ahora mi equipo está más sincronizado que nunca.', avatar: 'M', rating: 5 }
];

const stats = [
  { value: '10,000+', label: 'Usuarios activos', icon: Users },
  { value: '50,000+', label: 'Tareas completadas', icon: Target },
  { value: '99.9%', label: 'Tiempo activo', icon: Clock },
  { value: '4.9', label: 'Calificación', icon: Star }
];

const faqItems = [
  { question: '¿Cuál es el período de prueba gratuita?', answer: 'Todos los planes nuevos incluyen 14 días de prueba completamente gratis. No necesitas tarjeta de crédito para comenzar.' },
  { question: '¿Puedo cambiar de plan en cualquier momento?', answer: 'Sí, puedes actualizar o cambiar tu plan en cualquier momento. Los cambios se reflejan inmediatamente.' },
  { question: '¿TaskFlow es compatible con mi software actual?', answer: 'Tenemos integraciones con 100+ herramientas populares. Si no ves la tuya, contáctanos y la agregamos.' },
  { question: '¿Qué sucede con mis datos si cancelo?', answer: 'Tus datos están seguros. Puedes descargarlos en cualquier momento. Mantenemos un backup durante 30 días.' }
];

const plans = [
  { name: 'Starter', price: '9', period: '/mes', description: 'Perfecto para empezar', features: ['Hasta 100 tareas', '1 usuario', 'Soporte por email', 'Almacenamiento 2GB'] },
  { name: 'Professional', price: '29', period: '/mes', description: 'La opción más popular', highlighted: true, features: ['Tareas ilimitadas', 'Hasta 5 usuarios', 'Soporte prioritario', 'Almacenamiento 50GB', 'Integraciones', 'Análisis avanzado'] },
  { name: 'Enterprise', price: 'Personalizado', period: '', description: 'Para grandes equipos', features: ['Todo de Professional', 'Usuarios ilimitados', 'SSO y seguridad avanzada', 'Almacenamiento ilimitado', 'API custom', 'Soporte 24/7'] }
];

function toggleFAQ(index: number) {
  expandedFAQ.value = expandedFAQ.value === index ? null : index;
}

onMounted(() => {
  // Backend check
  fetch('https://taskflow-app-e1rm.onrender.com/api/health')
    .then(() => console.log('Backend activated'))
    .catch(() => console.log('Backend waking up...'));
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center space-x-2 cursor-pointer" @click="router.push('/')">
            <div class="relative">
              <CheckSquare class="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div class="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
            <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TaskFlow</span>
          </div>

          <!-- Desktop Nav -->
          <nav class="hidden md:flex items-center space-x-8">
            <a href="#features" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 font-medium transition-colors">Características</a>
            <a href="#testimonials" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 font-medium transition-colors">Testimonios</a>
            <a href="#pricing" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 font-medium transition-colors">Precios</a>
            <a href="#faq" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 font-medium transition-colors">FAQ</a>
          </nav>

          <!-- Actions -->
          <div class="hidden md:flex items-center space-x-4">
            <router-link to="/login" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 font-medium">
              Iniciar Sesión
            </router-link>
            <router-link to="/register" class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all">
              Regístrate Gratis
            </router-link>
          </div>

          <!-- Mobile Menu Button -->
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden p-2">
            <Menu v-if="!mobileMenuOpen" class="h-6 w-6" />
            <X v-else class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
        <a href="#features" @click="mobileMenuOpen = false" class="block text-gray-600 dark:text-gray-300 hover:text-blue-600">Características</a>
        <a href="#testimonials" @click="mobileMenuOpen = false" class="block text-gray-600 dark:text-gray-300 hover:text-blue-600">Testimonios</a>
        <a href="#pricing" @click="mobileMenuOpen = false" class="block text-gray-600 dark:text-gray-300 hover:text-blue-600">Precios</a>
        <a href="#faq" @click="mobileMenuOpen = false" class="block text-gray-600 dark:text-gray-300 hover:text-blue-600">FAQ</a>
        <router-link to="/login" class="block text-gray-600 dark:text-gray-300 hover:text-blue-600">Iniciar Sesión</router-link>
        <router-link to="/register" class="block px-4 py-2 bg-blue-600 text-white rounded-lg text-center">Regístrate Gratis</router-link>
      </div>
    </header>

    <!-- Hero -->
    <main class="pt-24 pb-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-4xl mx-auto">
          <!-- Badge -->
          <div class="inline-flex items-center px-4 py-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium mb-6 animate-fade-in">
            <Zap class="h-4 w-4 mr-2" />
            La herramienta de productividad #1
          </div>

          <!-- Title -->
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 animate-slide-up">
            Gestiona tus tareas
            <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> fácilmente</span>
          </h1>

          <!-- Subtitle -->
          <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto animate-slide-up" style="animation-delay: 0.1s">
            TaskFlow te ayuda a organizar tus tareas, establecer metas y aumentar tu productividad diaria.
            Con vistas Kanban, Calendario, Analytics y más.
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style="animation-delay: 0.2s">
            <router-link to="/register" class="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
              <Sparkles class="h-5 w-5" />
              <span>Empezar Gratis</span>
            </router-link>
            <router-link to="/docs" class="flex items-center space-x-2 px-8 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl font-medium text-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700">
              <Play class="h-5 w-5" />
              <span>Ver Demo</span>
            </router-link>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
            <div v-for="(stat, index) in stats" :key="stat.label" class="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm">
              <component :is="stat.icon" class="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ stat.value }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Features -->
    <section id="features" class="py-20 bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Todo lo que necesitas</h2>
          <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            TaskFlow tiene todas las herramientas que necesitas para organizar tu vida y aumentar tu productividad.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="feature in features" :key="feature.title" class="p-6 bg-gray-50 dark:bg-gray-700 rounded-2xl hover:shadow-lg transition-shadow group">
            <div :class="['inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 bg-gradient-to-br', feature.color]">
              <component :is="feature.icon" class="h-7 w-7 text-white" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
              {{ feature.title }}
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              {{ feature.desc }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section id="testimonials" class="py-20 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Lo que dicen nuestros usuarios
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="t in testimonials" :key="t.name" class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div class="flex items-center space-x-1 mb-4">
              <Star v-for="i in t.rating" :key="i" class="h-5 w-5 text-yellow-500" />
            </div>
            <p class="text-gray-600 dark:text-gray-300 mb-6">"{{ t.text }}"</p>
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                {{ t.avatar }}
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">{{ t.name }}</p>
                <p class="text-sm text-gray-500">{{ t.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section id="pricing" class="py-20 bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">Planes para todos</h2>
        <p class="text-gray-600 dark:text-gray-400 text-center mb-12">Elige el plan que mejor se adapte a tus necesidades</p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div v-for="plan in plans" :key="plan.name" :class="['p-6 rounded-2xl relative', plan.highlighted ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-xl' : 'bg-gray-50 dark:bg-gray-700']">
            <div v-if="plan.highlighted" class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-blue-600 text-sm font-medium rounded-full">Popular</div>
            <h3 class="text-lg font-semibold mb-2">{{ plan.name }}</h3>
            <div class="flex items-baseline mb-2">
              <span class="text-4xl font-bold">{{ plan.price }}</span>
              <span class="text-sm opacity-80">{{ plan.period }}</span>
            </div>
            <p class="text-sm opacity-80 mb-4">{{ plan.description }}</p>
            <ul class="space-y-2 mb-6">
              <li v-for="f in plan.features" :key="f" class="flex items-center text-sm">
                <CheckCircle class="h-4 w-4 mr-2 flex-shrink-0" :class="plan.highlighted ? 'text-white' : 'text-green-500'" />
                {{ f }}
              </li>
            </ul>
            <router-link to="/register" :class="['w-full py-3 rounded-xl font-medium text-center block transition-all', plan.highlighted ? 'bg-white text-blue-600 hover:bg-gray-100' : 'bg-blue-600 text-white hover:bg-blue-700']">
              {{ plan.name === 'Enterprise' ? 'Solicitar demo' : 'Comenzar ahora' }}
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="py-20 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Preguntas Frecuentes</h2>

        <div class="space-y-4">
          <div v-for="(faq, index) in faqItems" :key="index" class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            <button @click="toggleFAQ(index)" class="w-full flex items-center justify-between p-4 text-left">
              <span class="font-medium text-gray-900 dark:text-white">{{ faq.question }}</span>
              <ChevronDown :class="['h-5 w-5 text-gray-400 transition-transform', expandedFAQ === index && 'rotate-180']" />
            </button>
            <div v-if="expandedFAQ === index" class="px-4 pb-4">
              <p class="text-gray-600 dark:text-gray-400">{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">¿Listo para empezar?</h2>
        <p class="text-blue-100 mb-8 max-w-xl mx-auto">Únete a miles de usuarios que ya están usando TaskFlow para organizar su vida.</p>
        <router-link to="/register" class="inline-block px-8 py-3 bg-white text-blue-600 rounded-xl font-medium text-lg hover:bg-gray-100 transition-all">
          Crear Cuenta Gratis
        </router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
        <div class="flex items-center space-x-2 mb-4 md:mb-0">
          <CheckSquare class="h-6 w-6 text-blue-600" />
          <span class="font-bold text-gray-900 dark:text-white">TaskFlow</span>
        </div>
        <div class="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
          <router-link to="/docs" class="hover:text-blue-600">Documentación</router-link>
          <router-link to="/help" class="hover:text-blue-600">Ayuda</router-link>
          <a href="#" class="hover:text-blue-600">Términos</a>
          <a href="#" class="hover:text-blue-600">Privacidad</a>
        </div>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-4 md:mt-0">© 2024 TaskFlow. Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
</template>