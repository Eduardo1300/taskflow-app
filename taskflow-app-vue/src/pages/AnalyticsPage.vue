<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useTaskStore } from '@/stores/tasks';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import {
  TrendingUp, CheckCircle, Clock, Target, AlertTriangle, Calendar,
  BarChart3, Activity, Lightbulb, FileText, Users, Brain,
  CalendarDays, Home, BarChart2, CalendarCheck
} from 'lucide-vue-next';
import {
  analyticsService,
  calendarAnalyticsService,
  isOverdue,
  type AnalyticsData,
  type CalendarMetrics,
  type ProductivityInsights,
  type CalendarHealthScore,
  type BurnoutRisk,
  type TimeAnalysis
} from '@/services/analyticsService';
import { exportService } from '@/services/exportService';

type Tone = 'good' | 'warn' | 'bad';

const taskStore = useTaskStore();

const activeTab = ref<'overview' | 'productivity' | 'calendar' | 'charts' | 'forecast'>('overview');
const loading = ref(true);

const analyticsData = ref<AnalyticsData | null>(null);
const calendarMetrics = ref<CalendarMetrics | null>(null);
const calendarInsights = ref<ProductivityInsights | null>(null);
const calendarHealth = ref<CalendarHealthScore | null>(null);
const burnoutRisk = ref<BurnoutRisk | null>(null);
const timeAnalysis = ref<TimeAnalysis | null>(null);

const tabs = [
  { key: 'overview', label: 'Resumen', icon: Home },
  { key: 'productivity', label: 'Productividad', icon: TrendingUp },
  { key: 'calendar', label: 'Calendario', icon: CalendarCheck },
  { key: 'charts', label: 'Gráficos', icon: BarChart2 },
  { key: 'forecast', label: 'Pronósticos', icon: CalendarDays }
] as const;


const factorLabels: Record<string, string> = {
  eventDistribution: 'Distribución',
  completionRate: 'Completación',
  timeManagement: 'Gestión del tiempo',
  planning: 'Planificación'
};

const burnoutLabels: Record<string, string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
  critical: 'Crítico'
};

// Clases por nivel (bueno / aviso / malo)
const toneBg: Record<Tone, string> = {
  good: 'bg-green-100 dark:bg-green-900/30',
  warn: 'bg-yellow-100 dark:bg-yellow-900/30',
  bad: 'bg-red-100 dark:bg-red-900/30'
};
const toneIcon: Record<Tone, string> = {
  good: 'text-green-600 dark:text-green-400',
  warn: 'text-yellow-600 dark:text-yellow-400',
  bad: 'text-red-600 dark:text-red-400'
};
const toneBadge: Record<Tone, string> = {
  good: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  warn: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  bad: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
};

function scoreTone(score: number): Tone {
  return score >= 80 ? 'good' : score >= 60 ? 'warn' : 'bad';
}

function burnoutTone(level: BurnoutRisk['level']): Tone {
  return level === 'low' ? 'good' : level === 'medium' ? 'warn' : 'bad';
}

function barPercent(value: number, values: number[]): number {
  const max = Math.max(...values, 1);
  return (value / max) * 100;
}

// Ventana de análisis: período pasado + mismo período hacia adelante
// (así "Próximos" no queda siempre en 0)
function getDateRange(range: TimeRange) {
  const days = range === 'week' ? 7 : range === 'month' ? 30 : 90;
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setDate(end.getDate() + days);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

const processedTasks = computed(() => analyticsService.processTasks(taskStore.tasks));

const insights = computed(() =>
  analyticsData.value ? analyticsService.generateInsights(analyticsData.value, taskStore.tasks) : []
);

const streak = computed(() => analyticsService.calculateStreak(taskStore.tasks));

async function loadAllAnalytics() {
  if (!analyticsData.value) loading.value = true;
  try {
    analyticsData.value = analyticsService.generateAnalytics(taskStore.tasks);

    const eventsWithDate = taskStore.tasks.filter(t => t.due_date);
    if (eventsWithDate.length > 0) {
      calendarAnalyticsService.setEventsData(eventsWithDate);
      const dateRange = getDateRange(selectedTimeRange.value);

      const [metrics, productivity, health, burnout, timeData] = await Promise.all([
        calendarAnalyticsService.getCalendarMetrics(dateRange),
        calendarAnalyticsService.getProductivityInsights(dateRange),
        calendarAnalyticsService.getCalendarHealthScore(dateRange),
        calendarAnalyticsService.getBurnoutRisk(dateRange),
        calendarAnalyticsService.getTimeAnalysis(dateRange)
      ]);

      calendarMetrics.value = metrics;
      calendarInsights.value = productivity;
      calendarHealth.value = health;
      burnoutRisk.value = burnout;
      timeAnalysis.value = timeData;
    } else {
      calendarMetrics.value = null;
      calendarInsights.value = null;
      calendarHealth.value = null;
      burnoutRisk.value = null;
      timeAnalysis.value = null;
    }
  } catch (error) {
    console.error('Error loading analytics:', error);
  } finally {
    loading.value = false;
  }
}

const forecastData = computed(() => {
  const today = new Date();
  const forecast = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayTasks = processedTasks.value.filter(
      t => !t.completed && t.dueDate && t.dueDate.toDateString() === date.toDateString()
    ).length;
    forecast.push({
      day: date.toLocaleDateString('es-ES', { weekday: 'short' }),
      date: date.getDate(),
      tasks: dayTasks,
      isToday: i === 0
    });
  }
  return forecast;
});

const overdueList = computed(() =>
  processedTasks.value.filter(t => isOverdue(t)).slice(0, 5)
);

async function exportAnalyticsToPDF() {
  if (!analyticsData.value || !analyticsData.value.taskStats || analyticsData.value.taskStats.total === 0) {
    alert('No hay suficientes datos para exportar. Crea algunas tareas primero.');
    return;
  }

  try {
    await exportService.exportAnalyticsToPDF(analyticsData.value, taskStore.tasks);
  } catch (error) {
    console.error('Error exportando analytics:', error);
    alert('Error al exportar. Por favor, inténtalo de nuevo.');
  }
}

onMounted(async () => {
  await taskStore.fetchTasks();
  await loadAllAnalytics();
});

watch(selectedTimeRange, loadAllAnalytics);
watch(() => taskStore.tasks, loadAllAnalytics, { deep: true });
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900">
    <Sidebar />
    <div class="flex-1 flex flex-col">
      <Header />
      <main class="flex-1 p-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h1>
            <p class="text-gray-600 dark:text-gray-400">Análisis completo de tu rendimiento y gestión de tareas</p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div class="flex bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
              <button
                v-for="range in ranges"
                :key="range.key"
                @click="selectedTimeRange = range.key"
                :class="['px-4 py-2 rounded-lg text-sm font-medium transition-all', selectedTimeRange === range.key ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400']"
              >{{ range.label }}</button>
            </div>
            <button @click="exportAnalyticsToPDF" class="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl transition-all">
              <FileText class="h-4 w-4" /><span>Exportar PDF</span>
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex justify-center mb-6 bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg border border-gray-100 dark:border-gray-700 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="['flex items-center px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap', activeTab === tab.key ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700']"
          >
            <component :is="tab.icon" class="h-4 w-4 mr-2" />{{ tab.label }}
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="animate-pulse">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="i in 4" :key="i" class="h-32 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
          </div>
        </div>

        <!-- OVERVIEW -->
        <div v-else-if="activeTab === 'overview' && analyticsData" class="space-y-6">
          <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
            <div class="flex items-center mb-4">
              <Lightbulb class="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Insights de Productividad</h3>
            </div>
            <div class="space-y-2">
              <div v-for="insight in insights" :key="insight" class="text-blue-800 dark:text-blue-200 text-sm flex items-start">
                <span class="mr-2">•</span> {{ insight }}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl"><Target class="h-6 w-6 text-blue-600 dark:text-blue-400" /></div>
                <span class="text-xs px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">{{ analyticsData.taskStats.completionRate }}%</span>
              </div>
              <p class="text-3xl font-bold text-gray-900 dark:text-white mb-1">{{ analyticsData.taskStats.total }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Total Tareas</p>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl"><CheckCircle class="h-6 w-6 text-green-600 dark:text-green-400" /></div>
                <span class="text-xs px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">Racha</span>
              </div>
              <p class="text-3xl font-bold text-gray-900 dark:text-white mb-1">{{ streak }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Días consecutivos</p>
            </div>

            <div v-if="calendarHealth" class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div class="flex items-center justify-between mb-4">
                <div :class="['p-3 rounded-xl', toneBg[scoreTone(calendarHealth.score)]]">
                  <Activity :class="['h-6 w-6', toneIcon[scoreTone(calendarHealth.score)]]" />
                </div>
                <span :class="['text-xs px-3 py-1 rounded-full font-medium', toneBadge[scoreTone(calendarHealth.score)]]">
                  {{ calendarHealth.score >= 80 ? 'Excelente' : calendarHealth.score >= 60 ? 'Bueno' : 'Mejorar' }}
                </span>
              </div>
              <p class="text-3xl font-bold text-gray-900 dark:text-white mb-1">{{ calendarHealth.score }}/100</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Salud Calendario</p>
            </div>

            <div v-if="burnoutRisk" class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div class="flex items-center justify-between mb-4">
                <div :class="['p-3 rounded-xl', toneBg[burnoutTone(burnoutRisk.level)]]">
                  <AlertTriangle :class="['h-6 w-6', toneIcon[burnoutTone(burnoutRisk.level)]]" />
                </div>
                <span :class="['text-xs px-3 py-1 rounded-full font-medium', toneBadge[burnoutTone(burnoutRisk.level)]]">
                  {{ burnoutLabels[burnoutRisk.level] }}
                </span>
              </div>
              <p class="text-3xl font-bold text-gray-900 dark:text-white mb-1">{{ burnoutRisk.score }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Riesgo Burnout</p>
            </div>
          </div>

          <div v-if="calendarMetrics" class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div class="flex items-center mb-6">
              <Calendar class="h-5 w-5 text-indigo-600 mr-2" />
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Resumen de Calendario</h3>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center"><p class="text-2xl font-bold text-indigo-600">{{ calendarMetrics.totalEvents }}</p><p class="text-xs text-gray-500 dark:text-gray-400">Total eventos</p></div>
              <div class="text-center"><p class="text-2xl font-bold text-green-600">{{ calendarMetrics.completedEvents }}</p><p class="text-xs text-gray-500 dark:text-gray-400">Completados</p></div>
              <div class="text-center"><p class="text-2xl font-bold text-orange-600">{{ calendarMetrics.upcomingEvents }}</p><p class="text-xs text-gray-500 dark:text-gray-400">Próximos</p></div>
              <div class="text-center"><p class="text-2xl font-bold text-red-600">{{ calendarMetrics.overdueEvents }}</p><p class="text-xs text-gray-500 dark:text-gray-400">Vencidos</p></div>
            </div>
          </div>
        </div>

        <!-- PRODUCTIVITY -->
        <div v-else-if="activeTab === 'productivity' && analyticsData" class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div class="flex items-center mb-6">
              <Activity class="h-5 w-5 text-green-600 mr-2" />
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Estadísticas Detalladas</h3>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div class="text-center"><p class="text-3xl font-bold text-green-600">{{ analyticsData.priorityStats.tasksCompletedToday }}</p><p class="text-sm text-gray-500 dark:text-gray-400">Hoy</p></div>
              <div class="text-center"><p class="text-3xl font-bold text-blue-600">{{ analyticsData.priorityStats.tasksCompletedThisWeek }}</p><p class="text-sm text-gray-500 dark:text-gray-400">Esta semana</p></div>
              <div class="text-center"><p class="text-3xl font-bold text-purple-600">{{ analyticsData.priorityStats.tasksCompletedThisMonth }}</p><p class="text-sm text-gray-500 dark:text-gray-400">Este mes</p></div>
              <div class="text-center"><p class="text-3xl font-bold text-orange-600">{{ analyticsData.priorityStats.averageCompletionTime.toFixed(1) }}</p><p class="text-sm text-gray-500 dark:text-gray-400">Días promedio</p></div>
            </div>

            <div v-if="analyticsData.priorityStats.mostProductiveDay !== 'Sin datos'" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p class="text-sm text-gray-600 dark:text-gray-300 text-center">
                <Clock class="h-4 w-4 inline mr-1" /> Día más productivo:
                <span class="font-medium text-purple-600 capitalize">{{ analyticsData.priorityStats.mostProductiveDay }}</span>
              </p>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div class="flex items-center mb-6">
              <BarChart3 class="h-5 w-5 text-indigo-600 mr-2" />
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Actividad: Últimos 7 Días</h3>
            </div>
            <div class="grid grid-cols-7 gap-2">
              <div v-for="(day, index) in analyticsData.timeStats.dailyDistribution" :key="index" class="text-center">
                <div class="w-full flex space-x-1 items-end h-32">
                  <div class="flex-1 bg-blue-500 rounded-t" :style="{ height: `${Math.max(day.completed * 15, 4)}px` }"></div>
                  <div class="flex-1 bg-green-500 rounded-t" :style="{ height: `${Math.max(day.created * 15, 4)}px` }"></div>
                </div>
                <span class="block text-xs text-gray-500 mt-1">{{ day.day }}</span>
                <span class="block text-sm font-bold text-gray-900 dark:text-white">{{ day.count }}</span>
              </div>
            </div>
            <div class="flex justify-center space-x-6 mt-3">
              <div class="flex items-center space-x-2"><div class="w-3 h-3 bg-blue-500 rounded-full"></div><span class="text-xs text-gray-500">Completadas</span></div>
              <div class="flex items-center space-x-2"><div class="w-3 h-3 bg-green-500 rounded-full"></div><span class="text-xs text-gray-500">Creadas</span></div>
            </div>
          </div>

          <div v-if="calendarInsights" class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div class="flex items-center mb-4">
              <Users class="h-5 w-5 text-blue-500 mr-2" />
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Balance Vida-Trabajo</h3>
            </div>
            <div class="space-y-4">
              <div class="flex items-center justify-between"><span class="text-gray-700 dark:text-gray-300">Trabajo</span><span class="font-semibold text-gray-900 dark:text-white">{{ calendarInsights.workLifeBalance.workEvents }}</span></div>
              <div class="flex items-center justify-between"><span class="text-gray-700 dark:text-gray-300">Personal</span><span class="font-semibold text-gray-900 dark:text-white">{{ calendarInsights.workLifeBalance.personalEvents }}</span></div>
              <div class="pt-2 border-t border-gray-200 dark:border-gray-600">
                <div class="flex items-center justify-between">
                  <span class="text-gray-700 dark:text-gray-300">Ratio Trabajo/Vida</span>
                  <span :class="['font-semibold', calendarInsights.workLifeBalance.ratio <= 2 ? 'text-green-600 dark:text-green-400' : calendarInsights.workLifeBalance.ratio <= 4 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400']">{{ calendarInsights.workLifeBalance.ratio.toFixed(1) }}:1</span>
                </div>
                <div class="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div :class="['h-2 rounded-full transition-all duration-300', calendarInsights.workLifeBalance.ratio <= 2 ? 'bg-green-500' : calendarInsights.workLifeBalance.ratio <= 4 ? 'bg-yellow-500' : 'bg-red-500']" :style="{ width: `${Math.min(100, (calendarInsights.workLifeBalance.ratio / 6) * 100)}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CALENDAR -->
        <div v-else-if="activeTab === 'calendar' && calendarMetrics && calendarHealth" class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div class="flex items-center mb-6">
              <Brain class="h-5 w-5 text-purple-500 mr-2" />
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Salud del Calendario</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div v-for="(factor, key) in calendarHealth.factors" :key="key" class="text-center">
                <div class="relative inline-flex items-center justify-center w-16 h-16 mb-2">
                  <svg class="w-16 h-16 -rotate-90" viewBox="0 0 32 32">
                    <circle class="text-gray-200 dark:text-gray-700" stroke-width="3" stroke="currentColor" fill="transparent" r="14" cx="16" cy="16" />
                    <circle :class="[factor >= 80 ? 'text-green-500' : factor >= 60 ? 'text-yellow-500' : 'text-red-500']" stroke-width="3" :stroke-dasharray="`${(factor / 100) * 87.96} 87.96`" stroke-linecap="round" stroke="currentColor" fill="transparent" r="14" cx="16" cy="16" />
                  </svg>
                  <span class="absolute text-xs font-semibold text-gray-700 dark:text-gray-300">{{ factor }}</span>
                </div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ factorLabels[key] || key }}</p>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
            <div class="flex items-center mb-4">
              <CheckCircle class="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Recomendaciones</h3>
            </div>
            <div class="space-y-3">
              <div v-for="(rec, index) in calendarHealth.recommendations.slice(0, 5)" :key="index" class="flex items-start space-x-3">
                <div class="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mt-0.5"><span class="text-sm font-semibold text-purple-600 dark:text-purple-400">{{ index + 1 }}</span></div>
                <p class="text-gray-700 dark:text-gray-300 text-sm">{{ rec }}</p>
              </div>
            </div>
            <div v-if="burnoutRisk && burnoutRisk.level !== 'low'" class="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div class="flex items-start space-x-2">
                <AlertTriangle class="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p class="font-medium text-yellow-800 dark:text-yellow-200 text-sm">Riesgo de burnout: {{ burnoutLabels[burnoutRisk.level] }}</p>
                  <p class="text-yellow-700 dark:text-yellow-300 text-sm">{{ burnoutRisk.suggestions[0] }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="Object.keys(calendarMetrics.categoryDistribution).length > 0" class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribución por Categoría</h3>
            <div class="space-y-3">
              <div v-for="(count, cat) in calendarMetrics.categoryDistribution" :key="cat" class="flex items-center justify-between">
                <span class="text-gray-700 dark:text-gray-300 capitalize">{{ cat }}</span>
                <div class="flex items-center gap-2">
                  <div class="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div class="h-2 bg-purple-500 rounded-full" :style="{ width: `${(count / Math.max(calendarMetrics.totalEvents, 1)) * 100}%` }"></div>
                  </div>
                  <span class="font-semibold text-gray-900 dark:text-white w-6 text-right">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CHARTS -->
        <div v-else-if="activeTab === 'charts' && analyticsData" class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribución por Prioridad</h3>
            <div class="h-48 flex items-center justify-center space-x-4">
              <div class="text-center"><div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-2"><span class="text-white font-bold">{{ analyticsData.priorityStats.high }}</span></div><span class="text-xs text-gray-500">Alta</span></div>
              <div class="text-center"><div class="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-2"><span class="text-white font-bold">{{ analyticsData.priorityStats.medium }}</span></div><span class="text-xs text-gray-500">Media</span></div>
              <div class="text-center"><div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-2"><span class="text-white font-bold">{{ analyticsData.priorityStats.low }}</span></div><span class="text-xs text-gray-500">Baja</span></div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tendencia de Finalización (7 días)</h3>
            <div class="h-48 flex space-x-2">
              <div v-for="(trend, index) in analyticsData.completionTrends" :key="index" class="flex-1 h-full flex flex-col items-center">
                <span class="text-sm font-bold text-gray-900 dark:text-white">{{ trend.completed }}</span>
                <div class="flex-1 w-full flex items-end">
                  <div class="w-full bg-green-500 rounded-t" :style="{ height: `${barPercent(trend.completed, analyticsData.completionTrends.map(t => t.completed))}%`, minHeight: '4px' }"></div>
                </div>
                <span class="text-xs text-gray-500 mt-1">{{ trend.label }}</span>
              </div>
            </div>
          </div>

          <div v-if="timeAnalysis" class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribución por Horas (creación de tareas)</h3>
            <div class="h-64 flex space-x-1">
              <div v-for="i in 24" :key="i" class="flex-1 h-full flex flex-col items-center">
                <div class="flex-1 w-full flex items-end">
                  <div class="w-full bg-purple-500 rounded-t" :style="{ height: `${barPercent(timeAnalysis.hourlyDistribution[i - 1] || 0, Object.values(timeAnalysis.hourlyDistribution))}%`, minHeight: '2px' }"></div>
                </div>
                <span class="text-xs text-gray-500 mt-1 h-4">{{ (i - 1) % 3 === 0 ? `${i - 1}h` : '' }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tendencias Semanales (4 semanas)</h3>
            <div class="h-48 flex space-x-2">
              <div v-for="(week, index) in analyticsData.timeStats.weeklyTrends" :key="index" class="flex-1 h-full flex flex-col items-center">
                <span class="text-sm font-bold text-gray-900 dark:text-white">{{ week.completed }}</span>
                <div class="flex-1 w-full flex items-end">
                  <div class="w-full bg-purple-500 rounded-t" :style="{ height: `${barPercent(week.completed, analyticsData.timeStats.weeklyTrends.map(w => w.completed))}%`, minHeight: '4px' }"></div>
                </div>
                <span class="text-xs text-gray-500 mt-1">{{ week.week }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tendencias Mensuales</h3>
            <div class="h-48 flex space-x-2">
              <div v-for="(month, index) in analyticsData.timeStats.monthlyTrends" :key="index" class="flex-1 h-full flex flex-col items-center">
                <span class="text-sm font-bold text-gray-900 dark:text-white">{{ month.completed }}</span>
                <div class="flex-1 w-full flex items-end">
                  <div class="w-full bg-yellow-500 rounded-t" :style="{ height: `${barPercent(month.completed, analyticsData.timeStats.monthlyTrends.map(m => m.completed))}%`, minHeight: '4px' }"></div>
                </div>
                <span class="text-xs text-gray-500 mt-1">{{ month.month }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- FORECAST -->
        <div v-else-if="activeTab === 'forecast' && analyticsData" class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Próximos 7 días</h3>
            <div class="flex items-end justify-between space-x-2">
              <div v-for="day in forecastData" :key="day.date" class="flex-1 text-center">
                <div class="h-40 flex flex-col justify-end">
                  <div :class="['w-full rounded-t transition-all', day.tasks > 3 ? 'bg-red-500' : day.tasks > 0 ? 'bg-yellow-500' : 'bg-green-500']" :style="{ height: day.tasks > 0 ? `${Math.min(day.tasks * 20, 160)}px` : '8px' }"></div>
                </div>
                <p class="text-xs text-gray-500 mt-2">{{ day.day }}</p>
                <p class="text-sm font-medium" :class="day.isToday ? 'text-blue-600' : 'text-gray-900 dark:text-white'">{{ day.date }}</p>
                <p class="text-xs" :class="day.tasks > 3 ? 'text-red-500' : 'text-gray-500'">{{ day.tasks }} tareas</p>
              </div>
            </div>
          </div>

          <div v-if="overdueList.length > 0" class="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
            <h3 class="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center"><AlertTriangle class="h-5 w-5 mr-2" />Tareas Vencidas</h3>
            <div class="space-y-2">
              <div v-for="task in overdueList" :key="task.id" class="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ task.title }}</span>
                <span class="text-xs text-red-500">{{ task.dueDate?.toLocaleDateString('es-ES') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sin datos para la pestaña activa -->
        <div v-else class="text-center py-16 text-gray-500 dark:text-gray-400">
          <Calendar class="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p class="text-sm">No hay datos suficientes para esta sección. Crea tareas con fecha límite para ver el análisis.</p>
        </div>
      </main>
    </div>
  </div>
</template>