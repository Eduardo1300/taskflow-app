<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  ArrowRight, Star, Users, Zap, Shield, BarChart3, Globe, Sparkles,
  Play, Target, Check, ChevronDown, Award, Menu, X
} from 'lucide-vue-next';

const router = useRouter();

const expandedFAQ = ref<number | null>(0);
const isHovered = ref<string | null>(null);
const mobileMenuOpen = ref(false);

onMounted(() => {
  fetch('https://taskflow-app-e1rm.onrender.com/api/health')
    .then(() => console.log('Backend activated'))
    .catch(() => console.log('Backend waking up...'));
});

const features = [
  { icon: Target, title: 'Gestión Inteligente', desc: 'Organiza tus tareas con IA y automatización avanzada', color: 'from-blue-500 to-cyan-500' },
  { icon: Users, title: 'Colaboración Real', desc: 'Trabaja en equipo con sincronización en tiempo real', color: 'from-purple-500 to-pink-500' },
  { icon: BarChart3, title: 'Analytics Potentes', desc: 'Analiza tu productividad con métricas detalladas', color: 'from-orange-500 to-red-500' },
  { icon: Globe, title: 'Integraciones', desc: 'Conecta con tus herramientas favoritas', color: 'from-green-500 to-emerald-500' },
  { icon: Shield, title: 'Seguridad Total', desc: 'Tus datos están protegidos con encriptación de grado militar', color: 'from-indigo-500 to-purple-500' },
  { icon: Zap, title: 'Súper Rápido', desc: 'Rendimiento optimizado para máxima velocidad', color: 'from-yellow-500 to-orange-500' }
];

const testimonials = [
  { name: 'Ana Martínez', role: 'CEO, TechStart', content: 'TaskFlow ha transformado completamente cómo gestionamos nuestros proyectos. La interfaz es intuitiva y las funciones son exactamente lo que necesitábamos.', rating: 5 },
  { name: 'Carlos Rodríguez', role: 'Freelancer', content: 'Como freelancer, necesitaba algo simple pero poderoso. TaskFlow me permite mantener organizados múltiples clientes sin complicaciones.', rating: 5 },
  { name: 'María González', role: 'Product Manager', content: 'Las funciones de colaboración son increíbles. Nuestro equipo ahora está más sincronizado que nunca.', rating: 5 }
];

const stats = [
  { number: '10,000+', label: 'Usuarios activos' },
  { number: '50,000+', label: 'Tareas completadas' },
  { number: '99.9%', label: 'Tiempo activo' },
  { number: '4.9/5', label: 'Calificación' }
];

const faqItems = [
  { question: '¿Cuál es el período de prueba gratuita?', answer: 'Todos los planes nuevos incluyen 14 días de prueba completamente gratis. No necesitas tarjeta de crédito para comenzar.' },
  { question: '¿Puedo cambiar de plan en cualquier momento?', answer: 'Sí, puedes actualizar o cambiar tu plan en cualquier momento. Los cambios se reflejan inmediatamente.' },
  { question: '¿TaskFlow es compatible con mi software actual?', answer: 'Tenemos integraciones con 100+ herramientas populares. Si no ves la tuya, contáctanos y la agregamos.' },
  { question: '¿Qué sucede con mis datos si cancelo?', answer: 'Tus datos están seguros. Puedes descargarlos en cualquier momento. Mantenemos un backup durante 30 días.' }
];

const pricingPlans = [
  { name: 'Starter', price: '$9', period: '/mes', description: 'Perfecto para empezar', cta: 'Comenzar ahora', features: ['Hasta 100 tareas', '1 usuario', 'Soporte por email', 'Almacenamiento 2GB'] },
  { name: 'Professional', price: '$29', period: '/mes', description: 'La opción más popular', cta: 'Comenzar ahora', highlighted: true, features: ['Tareas ilimitadas', 'Hasta 5 usuarios', 'Soporte prioritario', 'Almacenamiento 50GB', 'Integraciones', 'Análisis avanzado'] },
  { name: 'Enterprise', price: 'Personalizado', period: '', description: 'Para grandes equipos', cta: 'Solicitar demo', features: ['Todo de Professional', 'Usuarios ilimitados', 'SSO y seguridad avanzada', 'Almacenamiento ilimitado', 'API custom', 'Soporte 24/7'] }
];

function toggleFAQ(index: number) {
  expandedFAQ.value = expandedFAQ.value === index ? null : index;
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

    <header class="relative z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-3 group cursor-pointer" @click="router.push('/')">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Sparkles class="h-6 w-6 text-white animate-pulse" />
            </div>
            <span class="text-xl font-bold text-gray-900 dark:text-white group-hover:gradient-text transition-all duration-300">TaskFlow</span>
          </div>
          
          <nav class="hidden md:flex items-center space-x-8">
            <a href="#features" class="relative text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium group">
              Características
              <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#testimonials" class="relative text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium group">
              Testimonios
              <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#pricing" class="relative text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium group">
              Precios
              <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </a>
          </nav>

          <div class="flex items-center space-x-4">
            <router-link to="/login" class="hidden sm:flex text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              Iniciar sesión
            </router-link>
            <router-link to="/register" class="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden group">
              <span class="relative z-10">Registrarse</span>
              <span class="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <section class="relative py-20 lg:py-32 overflow-hidden">
      <div class="absolute top-20 left-10 w-32 h-32 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-20 right-10 w-40 h-40 bg-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute top-1/3 right-1/4 w-24 h-24 bg-pink-400/20 rounded-full blur-2xl animate-pulse"></div>
      <div class="absolute bottom-1/3 left-1/4 w-16 h-16 bg-cyan-400/20 rounded-full blur-xl"></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <div class="inline-flex items-center px-6 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-8 shadow-lg hover:shadow-xl transition-shadow cursor-default">
            <Sparkles class="h-5 w-5 mr-2" />
            <span class="animate-pulse-glow px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded-full">✨ Nueva versión 2.0</span>
          </div>
          
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8">
            Productividad
            <span class="block gradient-text mt-2 relative">
              Sin Límites
              <span class="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-20 blur-xl rounded-full animate-pulse"></span>
            </span>
          </h1>
          
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12">
            Organiza, colabora y alcanza tus objetivos con TaskFlow. La plataforma más avanzada para gestión de tareas con 
            <span class="font-semibold text-blue-600 dark:text-blue-400"> IA integrada</span>.
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16">
            <router-link to="/login" class="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover-lift flex items-center overflow-hidden">
              <span class="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span class="relative z-10 flex items-center">
                Comenzar gratis
                <ArrowRight class="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </router-link>
            
            <button class="group flex items-center px-8 py-4 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <div class="relative w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center mr-3 group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <Play class="h-5 w-5 ml-0.5 group-hover:animate-pulse" />
                <span class="absolute inset-0 rounded-full border-2 border-blue-500 group-hover:animate-ping opacity-75"></span>
              </div>
              <span class="group-hover:translate-x-1 transition-transform">Ver demo</span>
            </button>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div v-for="(stat, index) in stats" :key="index" class="text-center group cursor-default">
              <div class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-all duration-300">
                {{ stat.number }}
              </div>
              <div class="text-gray-600 dark:text-gray-400 mt-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{{ stat.label }}</div>
            </div>
          </div>

          <div class="mt-12 flex justify-center">
            <div class="animate-bounce">
              <ChevronDown class="h-8 w-8 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="features" class="py-20 bg-gray-50 dark:bg-gray-800/50 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Características que
            <span class="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">marcan la diferencia</span>
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Descubre herramientas que transformarán tu forma de trabajar.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="(feature, index) in features" :key="index" class="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover-lift overflow-hidden">
            <div :class="['absolute inset-0 bg-gradient-to-br ' + feature.color + ' opacity-0 group-hover:opacity-10 transition-opacity duration-500']"></div>
            <div :class="['relative w-16 h-16 bg-gradient-to-br ' + feature.color + ' rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300']">
              <component :is="feature.icon" class="h-8 w-8 text-white" />
            </div>
            <div class="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {{ feature.title }}
            </h3>
            <p class="text-gray-600 dark:text-gray-300">{{ feature.desc }}</p>
            <div class="mt-4 flex items-center text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              Saber más <ArrowRight class="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="testimonials" class="py-20 relative overflow-hidden">
      <div class="absolute top-20 left-10 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Lo que dicen nuestros
            <span class="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">usuarios</span>
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-300">
            Miles ya transformaron su productividad.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <div v-for="(testimonial, index) in testimonials" :key="index" class="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div class="flex items-center mb-4 space-x-1">
              <Star v-for="i in testimonial.rating" :key="i" class="h-5 w-5 text-yellow-400 fill-current" />
            </div>
            <p class="text-gray-600 dark:text-gray-300 mb-6 italic relative">
              <span class="text-6xl absolute -top-2 -left-2 text-blue-200 dark:text-blue-900 opacity-50 font-serif">"</span>
              {{ testimonial.content }}
            </p>
            <div class="flex items-center">
              <div class="relative w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                {{ testimonial.name.charAt(0) }}
                <span class="absolute inset-0 rounded-full border-2 border-purple-500 opacity-0 group-hover:opacity-100 group-hover:animate-ping"></span>
              </div>
              <div>
                <div class="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{{ testimonial.name }}</div>
                <div class="text-gray-600 dark:text-gray-400 text-sm">{{ testimonial.role }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="pricing" class="py-20 bg-gray-50 dark:bg-gray-800/50 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-blue-900/10 dark:to-purple-900/10"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Planes simples
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-300">
            Elige el plan perfecto. Siempre puedes cambiar.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div v-for="(plan, idx) in pricingPlans" :key="idx" :class="['relative rounded-2xl p-8 transition-all duration-500', plan.highlighted ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white shadow-2xl hover:shadow-3xl hover:-translate-y-2 scale-105 z-10' : 'bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl hover:-translate-y-2']">
            <div v-if="plan.highlighted" class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center">
              <Award class="h-4 w-4 mr-1" /> Más popular
            </div>
            
            <h3 :class="['text-2xl font-bold mb-2', plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white']">{{ plan.name }}</h3>
            <p :class="['text-sm mb-6', plan.highlighted ? 'text-white/90' : 'text-gray-600 dark:text-gray-400']">{{ plan.description }}</p>
            
            <div class="mb-6">
              <span :class="['text-5xl font-bold', plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white']">{{ plan.price }}</span>
              <span :class="plan.highlighted ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'">{{ plan.period }}</span>
            </div>

            <button :class="['w-full py-4 rounded-xl font-semibold mb-8 transition-all duration-300', plan.highlighted ? 'bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 shadow-lg' : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105']">
              {{ plan.cta }}
            </button>

            <ul class="space-y-4">
              <li v-for="(feature, fidx) in plan.features" :key="fidx" class="flex items-center group">
                <span :class="['h-6 w-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0', plan.highlighted ? 'bg-white/20' : 'bg-green-100 dark:bg-green-900/30']">
                  <Check :class="['h-3.5 w-3.5', plan.highlighted ? 'text-white' : 'text-green-600 dark:text-green-400']" />
                </span>
                <span :class="plan.highlighted ? 'text-white' : 'text-gray-700 dark:text-gray-300'"><span class="group-hover:translate-x-1 transition-transform">{{ feature }}</span></span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section id="faq" class="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
      <div class="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Preguntas Frecuentes
        </h2>

        <div class="space-y-4">
          <div v-for="(item, idx) in faqItems" :key="idx" class="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
            <button @click="toggleFAQ(idx)" class="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <span class="font-semibold text-gray-900 dark:text-white text-left pr-4">{{ item.question }}</span>
              <span :class="['flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300', expandedFAQ === idx ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rotate-180' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400']">
                <ChevronDown class="h-5 w-5" />
              </span>
            </button>
            
            <div :class="['overflow-hidden transition-all duration-500 ease-in-out', expandedFAQ === idx ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0']">
              <div class="px-6 pb-5 pt-2 bg-gray-100/50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
                <p class="text-gray-600 dark:text-gray-300 leading-relaxed">{{ item.answer }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-12 text-center">
          <p class="text-gray-600 dark:text-gray-400 mb-4">¿No encontraste lo que buscas?</p>
          <a href="mailto:soporte@taskflow.com" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105">
            Contáctanos
          </a>
        </div>
      </div>
    </section>

    <section class="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
      <div class="absolute inset-0">
        <div class="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjMC0yIDItNCAyLTRzMiAyIDQgMmMwIDItNCAyLTRzMi0yIDQtMmMwIDItMiA0LTJjMC0yIDItNCAyLTR6Ii8+PC9nPjwvZz48L2c+')] opacity-30"></div>
        <div class="absolute top-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div class="absolute bottom-10 left-20 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        <div class="absolute top-1/2 left-1/2 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      </div>

      <div class="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl md:text-5xl font-bold text-white mb-6">
          ¿Listo para ser más productivo?
        </h2>
        <p class="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          Únete a miles de usuarios que ya transformaron su forma de trabajar con TaskFlow.
        </p>
        
        <div class="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-10">
          <router-link to="/register" class="group bg-white text-blue-600 px-10 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover-lift flex items-center">
            <span class="group-hover:translate-x-1 transition-transform">Comenzar ahora</span>
            <ArrowRight class="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
          </router-link>
          
          <router-link to="/login" class="text-white border-2 border-white/60 hover:border-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-white/10">
            Ya tengo cuenta
          </router-link>
        </div>

        <div class="flex flex-wrap justify-center gap-6 text-blue-200 text-sm">
          <span class="flex items-center hover:text-white transition-colors cursor-default">
            <Check class="h-4 w-4 mr-2" /> Prueba gratuita 14 días
          </span>
          <span class="flex items-center hover:text-white transition-colors cursor-default">
            <Check class="h-4 w-4 mr-2" /> Sin tarjeta de crédito
          </span>
          <span class="flex items-center hover:text-white transition-colors cursor-default">
            <Check class="h-4 w-4 mr-2" /> Cancela cuando quieras
          </span>
        </div>
      </div>
    </section>

    <footer class="bg-gray-900 dark:bg-gray-950 text-white py-16 relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-4 gap-8">
          <div class="col-span-2">
            <div class="flex items-center space-x-3 mb-6 group cursor-pointer">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Sparkles class="h-6 w-6 text-white" />
              </div>
              <span class="text-xl font-bold group-hover:gradient-text transition-all duration-300">TaskFlow</span>
            </div>
            <p class="text-gray-400 max-w-md mb-6">
              La plataforma de gestión de tareas más avanzada para equipos modernos. 
              Simplifica tu trabajo, amplifica tus resultados.
            </p>
            <div class="flex space-x-4">
              <div v-for="(social, idx) in ['T', 'L', 'G', 'I']" :key="idx" class="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-110 cursor-pointer group">
                <span class="text-sm group-hover:text-white transition-colors">{{ social }}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 class="font-semibold mb-4 text-white">Producto</h3>
            <ul class="space-y-3 text-gray-400">
              <li><a href="#" class="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Características</a></li>
              <li><a href="#" class="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Precios</a></li>
              <li><a href="#" class="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Seguridad</a></li>
              <li><a href="#" class="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Integraciones</a></li>
              <li><a href="#" class="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">API</a></li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold mb-4 text-white">Soporte</h3>
            <ul class="space-y-3 text-gray-400">
              <li><a href="#" class="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Centro de ayuda</a></li>
              <li><a href="#" class="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Contacto</a></li>
              <li><a href="#" class="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Estado del servicio</a></li>
              <li><a href="#" class="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Documentación</a></li>
            </ul>
          </div>
        </div>

        <div class="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p class="text-gray-400 text-sm">
            © 2025 TaskFlow. Todos los derechos reservados.
          </p>
          <div class="flex space-x-6 mt-4 md:mt-0">
            <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors hover:underline">Términos</a>
            <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors hover:underline">Privacidad</a>
            <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors hover:underline">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>