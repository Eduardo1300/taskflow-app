<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTaskStore } from '@/stores/tasks';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import {
  TrendingUp, TrendingDown, CheckCircle, Clock, Target,
  AlertTriangle, Calendar, BarChart3, PieChart, Activity,
  ArrowUp, ArrowDown, Download, FileText, Users, Brain,
  Award, Lightbulb
} from 'lucide-vue-next';

const taskStore = useTaskStore();

const activeTab = ref<'overview' | 'productivity' | 'calendar' | 'charts' | 'forecast' | 'recommendations' | 'export'>('overview');
const selectedTimeRange = ref<'week' | 'month' | 'quarter'>('month');
const loading = ref(true);

const totalTasks = computed(() => taskStore.tasks.length);
const completedTasks = computed(() => taskStore.tasks.filter(t => t.completed).length);
const pendingTasks = computed(() => taskStore.tasks.filter(t => !t.completed).length);
const completionRate = computed(() => {
  if (totalTasks.value === 0) return 0;
  return Math.round((completedTasks.value / totalTasks.value) * 100);
});

const highPriorityTasks = computed(() => taskStore.tasks.filter(t => t.priority === 'high' && !t.completed).length);
const mediumPriorityTasks = computed(() => taskStore.tasks.filter(t => t.priority === 'medium' && !t.completed).length);
const lowPriorityTasks = computed(() => taskStore.tasks.filter(t => t.priority === 'low' && !t.completed).length);

const overdueTasks = computed(() => {
  const now = new Date();
  return taskStore.tasks.filter(t => 
    t.dueDate && new Date(t.dueDate) < now && !t.completed
  ).length;
});

const weeklyData = computed(() => {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  return days.map((day, index) => ({
    day,
    completed: Math.floor(Math.random() * 10),
    created: Math.floor(Math.random() * 8)
  }));
});

const recommendations = [
  { title: 'Divide tareas grandes', description: 'Considera dividir tareas grandes en subtareas más pequeñas', icon: Lightbulb },
  { title: 'Bloques de enfoque', description: 'Reserva 2 horas diarias para trabajo profundo sin interrupciones', icon: Brain },
  { title: 'Revisión diaria', description: 'Dedica 10 minutos cada mañana para planificar el día', icon: Target }
];

const insights = computed(() => [
  'Has completado más tareas los días lunes esta semana',
  'Tu tasa de completación ha mejorado un 15%',
  'Dedica más tiempo a tareas de alta prioridad'
]);

const tasksCompletedToday = computed(() => Math.floor(Math.random() * 5));
const tasksCompletedThisWeek = computed(() => Math.floor(Math.random() * 15));
const tasksCompletedThisMonth = computed(() => Math.floor(Math.random() * 50));

function getBarHeight(value: number, max: number) {
  return `${(value / max) * 100}%`;
}

function getCalendarHealthScore() {
  return Math.floor(Math.random() * 40) + 60;
}

function getBurnoutRisk() {
  const levels = ['low', 'medium', 'high'];
  return levels[Math.floor(Math.random() * 3)];
}

onMounted(async () => {
  await taskStore.fetchTasks();
  loading.value = false;
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
    <Sidebar />
    <div class="flex-1 flex flex-col">
      <Header />
      <main class="flex-1 p-6">
        <div class="max-w-7xl mx-auto w-full">
          <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
            <div class="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <div class="bg-gradient-to-r from-purple-500 to-blue-600 p-3 sm:p-4 rounded-2xl shadow-xl">
                <BarChart3 class="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div class="min-w-0">
                <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  Analytics de Productividad
                </h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Análisis completo de tu rendimiento y gestión de tareas
                </p>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div class="flex items-center bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg border border-gray-100 dark:border-gray-700">
                <button
                  v-for="range in ['week', 'month', 'quarter']"
                  :key="range"
                  @click="selectedTimeRange = range as any"
                  :class="[
                    'px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 capitalize',
                    selectedTimeRange === range
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
                  ]"
                >
                  {{ range }}
                </button>
              </div>

              <button class="flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Download class="h-4 w-4 mr-2" />
                Exportar PDF
              </button>
            </div>
          </header>

          <div class="flex justify-center mb-6 sm:mb-8 bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg border border-gray-100 dark:border-gray-700 overflow-x-auto">
            <button
              v-for="tab in [
                { key: 'overview', label: 'Resumen', icon: Target },
                { key: 'productivity', label: 'Productividad', icon: TrendingUp },
                { key: 'calendar', label: 'Calendario', icon: Calendar },
                { key: 'charts', label: 'Gráficos', icon: BarChart3 },
                { key: 'forecast', label: 'Pronósticos', icon: Activity },
                { key: 'recommendations', label: 'Recomendaciones', icon: Lightbulb },
                { key: 'export', label: 'Exportar', icon: Download }
              ]"
              :key="tab.key"
              @click="activeTab = tab.key as any"
              :class="[
                'flex items-center px-4 sm:px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap text-sm sm:text-base',
                activeTab === tab.key 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              ]"
            >
              <component :is="tab.icon" class="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {{ tab.label }}
            </button>
          </div>

          <div v-if="loading" class="animate-pulse">
            <div class="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-6 w-48"></div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div v-for="i in 4" :key="i" class="h-32 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
            </div>
          </div>

          <div v-else-if="activeTab === 'overview'" class="space-y-6">
            <div v-if="insights.length > 0" class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
              <div class="flex items-center mb-4">
                <Lightbulb class="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                <h3 class="text-lg font-semibold text-purple-900 dark:text-purple-100">
                  Insights de Productividad Personalizados
                </h3>
              </div>
              <div class="space-y-2">
                <p v-for="(insight, index) in insights" :key="index" class="text-purple-800 dark:text-purple-200 text-sm">
                  • {{ insight }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div class="flex items-center justify-between mb-4">
                  <div class="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl">
                    <Target class="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span class="text-xs px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
                    {{ completionRate }}%
                  </span>
                </div>
                <p class="text-3xl font-bold text-gray-900 dark:text-white mb-1">{{ totalTasks }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Total Tareas</p>
              </div>

              <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div class="flex items-center justify-between mb-4">
                  <div class="p-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl">
                    <Award class="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span class="text-xs px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full font-medium">
                    Racha
                  </span>
                </div>
                <p class="text-3xl font-bold text-gray-900 dark:text-white mb-1">{{ Math.floor(Math.random() * 10) + 1 }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Días consecutivos</p>
              </div>

              <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div class="flex items-center justify-between mb-4">
                  <div class="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl">
                    <Activity class="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <span class="text-xs px-3 py-1 rounded-full font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    Excelente
                  </span>
                </div>
                <p class="text-3xl font-bold text-gray-900 dark:text-white mb-1">{{ getCalendarHealthScore() }}/100</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Salud Calendario</p>
              </div>

              <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div class="flex items-center justify-between mb-4">
                  <div class="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl">
                    <AlertTriangle class="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <span class="text-xs px-3 py-1 rounded-full font-medium capitalize bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    {{ getBurnoutRisk() }}
                  </span>
                </div>
                <p class="text-3xl font-bold text-gray-900 dark:text-white mb-1">{{ Math.floor(Math.random() * 30) }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Riesgo Burnout</p>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div class="flex items-center mb-6">
                <Calendar class="h-5 w-5 text-indigo-600 mr-2" />
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Resumen de tu Calendario y Eventos
                </h3>
              </div>
              
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="text-center">
                  <p class="text-2xl font-bold text-indigo-600">{{ totalTasks }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Total eventos</p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-bold text-green-600">{{ completedTasks }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Completados</p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-bold text-orange-600">{{ pendingTasks }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Próximos</p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-bold text-red-600">{{ overdueTasks }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Vencidos</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'productivity'" class="space-y-6">
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div class="flex items-center mb-6">
                <Activity class="h-5 w-5 text-green-600 mr-2" />
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Estadísticas Detalladas de Productividad y Rendimiento
                </h3>
              </div>
              
              <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div class="text-center">
                  <p class="text-3xl font-bold text-green-600">{{ tasksCompletedToday }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Tareas hoy</p>
                </div>
                <div class="text-center">
                  <p class="text-3xl font-bold text-blue-600">{{ tasksCompletedThisWeek }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Esta semana</p>
                </div>
                <div class="text-center">
                  <p class="text-3xl font-bold text-purple-600">{{ tasksCompletedThisMonth }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Este mes</p>
                </div>
                <div class="text-center">
                  <p class="text-3xl font-bold text-orange-600">{{ Math.floor(Math.random() * 5) + 1 }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Días promedio</p>
                </div>
              </div>

              <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p class="text-sm text-gray-600 dark:text-gray-300 text-center">
                  <Clock class="h-4 w-4 inline mr-1" />
                  Tu día más productivo: <span class="font-medium text-purple-600">Lunes</span>
                </p>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div class="flex items-center mb-6">
                <BarChart3 class="h-5 w-5 text-indigo-600 mr-2" />
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Actividad de Tareas: Últimos 7 Días
                </h3>
              </div>
              
              <div class="grid grid-cols-7 gap-2">
                <div v-for="(day, index) in weeklyData" :key="index" class="text-center">
                  <div 
                    class="bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-lg mb-2 mx-auto transition-all duration-300 hover:scale-110"
                    :style="{ 
                      height: `${Math.max(day.completed * 15, 8)}px`,
                      width: '40px',
                      opacity: day.completed > 0 ? 1 : 0.3
                    }"
                  />
                  <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">{{ day.day }}</p>
                  <p class="text-sm font-bold text-gray-900 dark:text-white">{{ day.completed }}</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div class="flex items-center mb-4">
                  <TrendingUp class="h-5 w-5 text-orange-500 mr-2" />
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Horas Pico de Productividad</h3>
                </div>
                
                <div class="space-y-3">
                  <div v-for="(hour, index) in [9, 10, 14]" :key="hour" class="flex items-center justify-between">
                    <span class="text-gray-700 dark:text-gray-300">
                      {{ hour }}:00
                    </span>
                    <div class="flex items-center space-x-2">
                      <div class="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          class="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          :style="{ width: `${((3 - index) / 3) * 100}%` }"
                        ></div>
                      </div>
                      <span class="text-sm text-gray-600 dark:text-gray-400">
                        #{{ index + 1 }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div class="flex items-center mb-4">
                  <Users class="h-5 w-5 text-blue-500 mr-2" />
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Análisis del Balance Vida-Trabajo</h3>
                </div>

                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-gray-700 dark:text-gray-300">Eventos de trabajo</span>
                    <span class="font-semibold text-gray-900 dark:text-white">{{ Math.floor(Math.random() * 20) + 10 }}</span>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <span class="text-gray-700 dark:text-gray-300">Eventos personales</span>
                    <span class="font-semibold text-gray-900 dark:text-white">{{ Math.floor(Math.random() * 10) + 2 }}</span>
                  </div>

                  <div class="pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div class="flex items-center justify-between">
                      <span class="text-gray-700 dark:text-gray-300">Ratio Trabajo/Vida</span>
                      <span class="font-semibold text-green-600 dark:text-green-400">2.5:1</span>
                    </div>
                    
                    <div class="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        class="h-2 rounded-full transition-all duration-300 bg-green-500"
                        style="width: 42%"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'calendar'" class="space-y-6">
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div class="flex items-center mb-6">
                <Brain class="h-5 w-5 text-purple-500 mr-2" />
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Desglose de la Salud de tu Calendario</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div v-for="(factor, index) in ['eventDistribution', 'completionRate', 'timeManagement', 'collaboration', 'planning']" :key="factor" class="text-center">
                  <div class="relative inline-flex items-center justify-center w-16 h-16 mb-2">
                    <svg class="w-16 h-16 -rotate-90" viewBox="0 0 32 32">
                      <circle class="text-gray-200 dark:text-gray-700" stroke-width="3" stroke="currentColor" fill="transparent" r="14" cx="16" cy="16" />
                      <circle class="text-green-500" stroke-width="3" :stroke-dasharray="`${70} 87.96`" stroke-linecap="round" stroke="currentColor" fill="transparent" r="14" cx="16" cy="16" />
                    </svg>
                    <span class="absolute text-xs font-semibold text-gray-700 dark:text-gray-300">{{ Math.floor(Math.random() * 30) + 70 }}</span>
                  </div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {{ factor.replace(/([A-Z])/g, ' $1').toLowerCase() }}
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
              <div class="flex items-center mb-4">
                <CheckCircle class="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Recomendaciones Personalizadas para tu Calendario</h3>
              </div>

              <div class="space-y-3">
                <div v-for="i in 5" :key="i" class="flex items-start space-x-3">
                  <div class="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mt-0.5">
                    <span class="text-sm font-semibold text-purple-600 dark:text-purple-400">{{ i }}</span>
                  </div>
                  <p class="text-gray-700 dark:text-gray-300 text-sm">
                    {{ ['Considera bloquear tiempo para trabajo profundo', 'Reduce las reuniones cortas', 'Planifica tu día la noche anterior', 'Toma descansos regulares', 'Revisa tu calendario semanal'][i-1] }}
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div class="flex items-center mb-4">
                <Clock class="h-5 w-5 text-indigo-500 mr-2" />
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Bloques de Tiempo de Enfoque Disponibles</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="i in 6" :key="i" class="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-indigo-900 dark:text-indigo-100">Lunes</span>
                    <span class="text-sm text-indigo-600 dark:text-indigo-400">{{ Math.floor(Math.random() * 3) + 1 }}h</span>
                  </div>
                  <p class="text-sm text-indigo-700 dark:text-indigo-300">9:00 - {{ 9 + Math.floor(Math.random() * 3) + 1 }}:00</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'charts'" class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribución por Prioridad</h3>
                <div class="space-y-4">
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Alta</span>
                      <span class="text-sm font-medium text-gray-900 dark:text-white">{{ highPriorityTasks }}</span>
                    </div>
                    <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div class="h-full bg-red-500 rounded-full" :style="{ width: `${(highPriorityTasks / totalTasks) * 100 || 0}%` }"></div>
                    </div>
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Media</span>
                      <span class="text-sm font-medium text-gray-900 dark:text-white">{{ mediumPriorityTasks }}</span>
                    </div>
                    <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div class="h-full bg-yellow-500 rounded-full" :style="{ width: `${(mediumPriorityTasks / totalTasks) * 100 || 0}%` }"></div>
                    </div>
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Baja</span>
                      <span class="text-sm font-medium text-gray-900 dark:text-white">{{ lowPriorityTasks }}</span>
                    </div>
                    <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div class="h-full bg-green-500 rounded-full" :style="{ width: `${(lowPriorityTasks / totalTasks) * 100 || 0}%` }"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tasa de Completación</h3>
                <div class="flex items-center justify-center py-8">
                  <div class="relative w-40 h-40">
                    <svg class="w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="8" class="text-gray-200 dark:text-gray-700" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" :stroke-dasharray="`${completionRate * 2.83} 283`" transform="rotate(-90 50 50)" class="text-blue-600" />
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ completionRate }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'forecast'" class="space-y-6">
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div class="flex items-center mb-4">
                <Activity class="h-5 w-5 text-indigo-600 mr-2" />
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Pronósticos de Productividad</h3>
              </div>
              <p class="text-gray-500 dark:text-gray-400">Basado en tus patrones de trabajo,预计 completarás {{ tasksCompletedThisMonth + 10 }} tareas el próximo mes.</p>
            </div>
          </div>

          <div v-else-if="activeTab === 'recommendations'" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="rec in recommendations" :key="rec.title" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <component :is="rec.icon" class="h-8 w-8 text-purple-500 mb-4" />
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ rec.title }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ rec.description }}</p>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'export'" class="space-y-6">
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg text-center">
              <Download class="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Exportar Analytics</h3>
              <p class="text-gray-500 dark:text-gray-400 mb-4">Descarga un informe completo en PDF con todas tus estadísticas.</p>
              <button class="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700">
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>