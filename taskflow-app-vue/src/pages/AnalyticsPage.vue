<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTaskStore } from '@/stores/tasks';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import {
  TrendingUp, CheckCircle, Clock, Target,
  AlertTriangle, Calendar, BarChart3, Activity,
  ArrowUp, Download, Award, Lightbulb
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
  return days.map((day) => ({
    day,
    completed: Math.floor(Math.random() * 10),
    created: Math.floor(Math.random() * 8)
  }));
});

const recommendations = [
  { title: 'Divide tareas grandes', description: 'Considera dividir tareas grandes en subtareas más pequeñas', icon: Lightbulb },
  { title: 'Bloques de enfoque', description: 'Reserva 2 horas diarias para trabajo profundo sin interrupciones', icon: Activity },
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

onMounted(async () => {
  await taskStore.fetchTasks();
  loading.value = false;
});
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900">
    <Sidebar />
    <div class="flex-1 flex flex-col">
      <Header />
      <main class="flex-1 p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Analytics
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              Análisis completo de tu rendimiento
            </p>
          </div>

          <div class="flex items-center space-x-2">
            <div class="flex bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
              <button
                v-for="range in ['week', 'month', 'quarter']"
                :key="range"
                @click="selectedTimeRange = range as any"
                :class="['px-4 py-2 rounded-lg text-sm font-medium capitalize', selectedTimeRange === range ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300']"
              >
                {{ range }}
              </button>
            </div>
            <button class="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700">
              <Download class="h-5 w-5" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        <div class="flex space-x-2 mb-6 overflow-x-auto">
          <button
            v-for="tab in [
              { key: 'overview', label: 'Resumen', icon: Target },
              { key: 'productivity', label: 'Productividad', icon: TrendingUp },
              { key: 'calendar', label: 'Calendario', icon: Calendar },
              { key: 'charts', label: 'Gráficos', icon: BarChart3 },
              { key: 'recommendations', label: 'Recomendaciones', icon: Lightbulb }
            ]"
            :key="tab.key"
            @click="activeTab = tab.key as any"
            :class="['flex items-center px-4 py-2 rounded-xl font-medium whitespace-nowrap', activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700']"
          >
            <component :is="tab.icon" class="h-5 w-5 mr-2" />
            {{ tab.label }}
          </button>
        </div>

        <div v-if="loading" class="animate-pulse">
          <div class="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-6 w-48"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="i in 4" :key="i" class="h-32 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
          </div>
        </div>

        <div v-else-if="activeTab === 'overview'" class="space-y-6">
          <div v-if="insights.length > 0" class="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-700">
            <div class="flex items-center mb-2">
              <Lightbulb class="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h3 class="font-semibold text-blue-900 dark:text-blue-100">Insights</h3>
            </div>
            <div class="space-y-1">
              <p v-for="(insight, index) in insights" :key="index" class="text-blue-800 dark:text-blue-200 text-sm">
                • {{ insight }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg text-white">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-blue-100 text-sm">Total Tareas</p>
                  <p class="text-3xl font-bold mt-1">{{ totalTasks }}</p>
                </div>
                <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <Target class="h-8 w-8" />
                </div>
              </div>
            </div>

            <div class="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg text-white">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-green-100 text-sm">Completadas</p>
                  <p class="text-3xl font-bold mt-1">{{ completedTasks }}</p>
                </div>
                <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle class="h-8 w-8" />
                </div>
              </div>
            </div>

            <div class="p-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg text-white">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-yellow-100 text-sm">Pendientes</p>
                  <p class="text-3xl font-bold mt-1">{{ pendingTasks }}</p>
                </div>
                <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <Clock class="h-8 w-8" />
                </div>
              </div>
            </div>

            <div class="p-6 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg text-white">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-red-100 text-sm">Vencidas</p>
                  <p class="text-3xl font-bold mt-1">{{ overdueTasks }}</p>
                </div>
                <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle class="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actividad Semanal</h3>
              <div class="flex items-end justify-between h-48 space-x-2">
                <div v-for="(day, index) in weeklyData" :key="index" class="flex-1 flex flex-col items-center">
                  <div class="w-full flex space-x-1 items-end h-40">
                    <div class="flex-1 bg-blue-500 rounded-t-lg" :style="{ height: getBarHeight(day.completed, 10) }"></div>
                    <div class="flex-1 bg-green-500 rounded-t-lg" :style="{ height: getBarHeight(day.created, 10) }"></div>
                  </div>
                  <span class="text-xs text-gray-500 mt-2">{{ day.day }}</span>
                </div>
              </div>
              <div class="flex items-center justify-center space-x-6 mt-4">
                <div class="flex items-center space-x-2"><div class="w-3 h-3 bg-blue-500 rounded-full"></div><span class="text-sm text-gray-500">Completadas</span></div>
                <div class="flex items-center space-x-2"><div class="w-3 h-3 bg-green-500 rounded-full"></div><span class="text-sm text-gray-500">Creadas</span></div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
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
          </div>
        </div>

        <div v-else-if="activeTab === 'productivity'" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg text-white">
              <p class="text-blue-100 text-sm">Tareas hoy</p>
              <p class="text-3xl font-bold mt-1">{{ tasksCompletedToday }}</p>
            </div>
            <div class="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg text-white">
              <p class="text-purple-100 text-sm">Esta semana</p>
              <p class="text-3xl font-bold mt-1">{{ tasksCompletedThisWeek }}</p>
            </div>
            <div class="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg text-white">
              <p class="text-green-100 text-sm">Este mes</p>
              <p class="text-3xl font-bold mt-1">{{ tasksCompletedThisMonth }}</p>
            </div>
            <div class="p-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg text-white">
              <p class="text-yellow-100 text-sm">Tasa de éxito</p>
              <p class="text-3xl font-bold mt-1">{{ completionRate }}%</p>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'calendar'" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <Clock class="h-8 w-8 text-purple-500 mb-2" />
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalTasks }}</p>
              <p class="text-sm text-gray-500">Total eventos</p>
            </div>
            <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <CheckCircle class="h-8 w-8 text-green-500 mb-2" />
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ completedTasks }}</p>
              <p class="text-sm text-gray-500">Completados</p>
            </div>
            <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <Calendar class="h-8 w-8 text-blue-500 mb-2" />
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ pendingTasks }}</p>
              <p class="text-sm text-gray-500">Próximos</p>
            </div>
            <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <AlertTriangle class="h-8 w-8 text-red-500 mb-2" />
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ overdueTasks }}</p>
              <p class="text-sm text-gray-500">Vencidos</p>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'charts'" class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
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

        <div v-else-if="activeTab === 'recommendations'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="rec in recommendations" :key="rec.title" class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <component :is="rec.icon" class="h-8 w-8 text-purple-500 mb-4" />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ rec.title }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ rec.description }}</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>