<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTaskStore } from '@/stores/tasks';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import {
  TrendingUp, CheckCircle, Clock, Target,
  AlertTriangle, Calendar, BarChart3, Activity,
  ArrowUp, Download, Award, Lightbulb,
  FileText, Users, Brain, Zap,
  CalendarDays, Flame, Trophy, TargetArrow,
  TrendingDown, Minus, Plus, Filter
} from 'lucide-vue-next';

const taskStore = useTaskStore();

const activeTab = ref<'overview' | 'productivity' | 'calendar' | 'charts' | 'forecast' | 'recommendations'>('overview');
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
  return taskStore.tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && !t.completed).length;
});

const tasksWithDueDate = computed(() => taskStore.tasks.filter(t => t.dueDate).length);
const tasksToday = computed(() => {
  const today = new Date().toDateString();
  return taskStore.tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === today).length;
});
const tasksThisWeek = computed(() => {
  const now = new Date();
  const weekEnd = new Date();
  weekEnd.setDate(now.getDate() + 7);
  return taskStore.tasks.filter(t => {
    if (!t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    return dueDate >= now && dueDate <= weekEnd;
  }).length;
});

const tasksDueNextMonth = computed(() => {
  const now = new Date();
  const monthEnd = new Date();
  monthEnd.setMonth(now.getMonth() + 1);
  return taskStore.tasks.filter(t => {
    if (!t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    return dueDate >= now && dueDate <= monthEnd;
  }).length;
});

const dailyGoal = 5;
const weeklyGoal = 25;
const monthlyGoal = 100;

const dailyProgress = computed(() => Math.min((completedTasks.value / dailyGoal) * 100, 100));
const weeklyProgress = computed(() => Math.min((completedTasks.value * 7 / weeklyGoal) * 100, 100));
const monthlyProgress = computed(() => Math.min((completedTasks.value * 30 / monthlyGoal) * 100, 100));

const streakDays = computed(() => Math.max(1, Math.floor(completedTasks.value / 3)));
const longestStreak = computed(() => Math.max(streakDays.value, Math.floor(completedTasks.value / 2)));

const weeklyData = computed(() => {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const now = new Date();
  return days.map((day, index) => {
    const dayStart = new Date(now);
    dayStart.setDate(now.getDate() - now.getDay() + index);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);
    const completed = taskStore.tasks.filter(t => t.completed && t.updatedAt && new Date(t.updatedAt) >= dayStart && new Date(t.updatedAt) < dayEnd).length;
    const created = taskStore.tasks.filter(t => t.createdAt && new Date(t.createdAt) >= dayStart && new Date(t.createdAt) < dayEnd).length;
    return { day, completed, created };
  });
});

const monthlyTrends = computed(() => {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const now = new Date();
  return months.slice(0, now.getMonth() + 1).map((month, index) => {
    const monthStart = new Date(now.getFullYear(), index, 1);
    const monthEnd = new Date(now.getFullYear(), index + 1, 0);
    const completed = taskStore.tasks.filter(t => t.completed && t.updatedAt && new Date(t.updatedAt) >= monthStart && new Date(t.updatedAt) <= monthEnd).length;
    return { month, completed };
  });
});

const insights = computed(() => {
  const insightsList = [];
  if (completionRate.value > 70) insightsList.push({ text: '¡Excelente! Tu tasa de completación supera el 70%', icon: Trophy, color: 'text-yellow-500' });
  else if (completionRate.value > 50) insightsList.push({ text: 'Tu progreso es bueno. ¡Sigue así!', icon: Target, color: 'text-green-500' });
  if (highPriorityTasks.value > 5) insightsList.push({ text: `Tienes ${highPriorityTasks.value} tareas de alta prioridad`, icon: AlertTriangle, color: 'text-red-500' });
  if (overdueTasks.value > 0) insightsList.push({ text: `${overdueTasks.value} tareas vencidas. Complétalas pronto!`, icon: Flame, color: 'text-orange-500' });
  if (streakDays.value > 3) insightsList.push({ text: `¡Increíble! ${streakDays.value} días de racha`, icon: Flame, color: 'text-orange-500' });
  if (tasksToday.value > 0) insightsList.push({ text: `Tienes ${tasksToday.value} tareas para hoy`, icon: Calendar, color: 'text-blue-500' });
  return insightsList.length > 0 ? insightsList : [{ text: 'Completa más tareas para ver análisis personalizados', icon: Brain, color: 'text-gray-500' }];
});

const productivityScore = computed(() => {
  let score = 50;
  if (completionRate.value > 50) score += 20;
  if (overdueTasks.value === 0) score += 15;
  if (highPriorityTasks.value < 3) score += 15;
  return Math.min(score, 100);
});

const calendarHealthScore = computed(() => {
  let score = 60;
  if (tasksThisWeek.value < 10) score += 20;
  if (overdueTasks.value === 0) score += 20;
  return Math.min(score, 100);
});

const peakHours = computed(() => {
  const hours: Record<number, number> = {};
  taskStore.tasks.forEach(t => {
    if (t.createdAt) {
      const hour = new Date(t.createdAt).getHours();
      hours[hour] = (hours[hour] || 0) + 1;
    }
  });
  return Object.entries(hours).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([hour]) => `${hour}:00`);
});

const productiveDays = computed(() => {
  const days: Record<string, number> = {};
  taskStore.tasks.filter(t => t.completed).forEach(t => {
    if (t.updatedAt) {
      const day = new Date(t.updatedAt).toLocaleDateString('es-ES', { weekday: 'long' });
      days[day] = (days[day] || 0) + 1;
    }
  });
  return Object.entries(days).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([day]) => day);
});

const recommendations = [
  { title: 'Divide tareas grandes', desc: 'Considera dividir tareas grandes en subtareas más pequeñas', icon: Brain },
  { title: 'Bloques de enfoque', desc: 'Reserva 2 horas diarias para trabajo profundo sin interrupciones', icon: Zap },
  { title: 'Revisión diaria', desc: 'Dedica 10 minutos cada mañana para planificar el día', icon: Calendar },
  { title: 'Prioriza tareas altas', desc: 'Completa las tareas de alta prioridad primero cada mañana', icon: TrendingUp },
  { title: 'Establece metas', desc: 'Define metas diarias de 5 tareas para mantener el impulso', icon: Target },
  { title: 'Toma descansos', desc: 'Usa la técnica Pomodoro: 25 min trabajo, 5 min descanso', icon: Activity }
];

const forecastData = computed(() => {
  const today = new Date();
  const forecast = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayTasks = taskStore.tasks.filter(t => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      return dueDate.toDateString() === date.toDateString();
    }).length;
    forecast.push({ day: date.toLocaleDateString('es-ES', { weekday: 'short' }), date: date.getDate(), tasks: dayTasks, isToday: i === 0 });
  }
  return forecast;
});

const overdueList = computed(() => {
  const now = new Date();
  return taskStore.tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && !t.completed).slice(0, 5);
});

const upcomingList = computed(() => {
  const now = new Date();
  const weekEnd = new Date();
  weekEnd.setDate(now.getDate() + 7);
  return taskStore.tasks.filter(t => {
    if (!t.dueDate || t.completed) return false;
    const dueDate = new Date(t.dueDate);
    return dueDate >= now && dueDate <= weekEnd;
  }).slice(0, 5);
});

const hourlyBarData = computed(() => {
  const hours: Record<number, number> = {};
  taskStore.tasks.forEach(t => {
    if (t.createdAt) {
      const hour = new Date(t.createdAt).getHours();
      hours[hour] = (hours[hour] || 0) + 1;
    }
  });
  const maxVal = Math.max(...Object.values(hours), 1);
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    height: hours[i] ? (hours[i] / maxVal) * 100 : 0
  }));
});

function getBarHeight(value: number, max: number) {
  return `${Math.max((value / max) * 100, 5)}%`;
}

function exportToPDF() {
  if (totalTasks.value === 0) {
    alert('No hay datos suficientes para exportar. Crea algunas tareas primero.');
    return;
  }
  const content = `TaskFlow - Analytics Export
=======================
Total de Tareas: ${totalTasks.value}
Completadas: ${completedTasks.value}
Pendientes: ${pendingTasks.value}
Tasa de Completación: ${completionRate.value}%
Generado el: ${new Date().toLocaleDateString('es-ES')}`;
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `taskflow-analytics-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  alert('Analytics exportado correctamente!');
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
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h1>
            <p class="text-gray-600 dark:text-gray-400">Análisis completo de tu rendimiento</p>
          </div>
          <div class="flex items-center space-x-2">
            <div class="flex bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
              <button v-for="range in ['week', 'month', 'quarter']" :key="range" @click="selectedTimeRange = range as any" :class="['px-4 py-2 rounded-lg text-sm font-medium capitalize', selectedTimeRange === range ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300']">{{ range }}</button>
            </div>
            <button @click="exportToPDF" class="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700">
              <Download class="h-5 w-5" /><span>Exportar</span>
            </button>
          </div>
        </div>

        <div class="flex space-x-2 mb-6 overflow-x-auto">
          <button v-for="tab in [{ key: 'overview', label: 'Resumen', icon: Target }, { key: 'productivity', label: 'Productividad', icon: TrendingUp }, { key: 'calendar', label: 'Calendario', icon: Calendar }, { key: 'charts', label: 'Gráficos', icon: BarChart3 }, { key: 'forecast', label: 'Pronósticos', icon: CalendarDays }, { key: 'recommendations', label: 'Recomendaciones', icon: Lightbulb }]" :key="tab.key" @click="activeTab = tab.key as any" :class="['flex items-center px-4 py-2 rounded-xl font-medium whitespace-nowrap', activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700']">
            <component :is="tab.icon" class="h-5 w-5 mr-2" />{{ tab.label }}
          </button>
        </div>

        <div v-if="loading" class="animate-pulse">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><div v-for="i in 4" :key="i" class="h-32 bg-gray-300 dark:bg-gray-600 rounded-lg"></div></div>
        </div>

        <div v-else-if="activeTab === 'overview'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="insight in insights" :key="insight.text" class="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center space-x-3">
              <component :is="insight.icon" :class="['h-6 w-6', insight.color]" /><span class="text-gray-700 dark:text-gray-300 text-sm">{{ insight.text }}</span>
            </div>
          </div>

          <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tus Metas</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div class="flex items-center justify-between mb-2"><span class="text-sm text-gray-500">Diaria</span><Target class="h-4 w-4 text-blue-500" /></div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ completedTasks }}/{{ dailyGoal }}</p>
                <div class="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full"><div class="h-full bg-blue-500 rounded-full" :style="{ width: dailyProgress + '%' }"></div></div>
              </div>
              <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div class="flex items-center justify-between mb-2"><span class="text-sm text-gray-500">Semanal</span><Calendar class="h-4 w-4 text-green-500" /></div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ Math.min(completedTasks * 7, weeklyGoal) }}/{{ weeklyGoal }}</p>
                <div class="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full"><div class="h-full bg-green-500 rounded-full" :style="{ width: Math.min(weeklyProgress, 100) + '%' }"></div></div>
              </div>
              <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div class="flex items-center justify-between mb-2"><span class="text-sm text-gray-500">Mensual</span><Trophy class="h-4 w-4 text-purple-500" /></div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ Math.min(completedTasks * 30, monthlyGoal) }}/{{ monthlyGoal }}</p>
                <div class="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full"><div class="h-full bg-purple-500 rounded-full" :style="{ width: Math.min(monthlyProgress, 100) + '%' }"></div></div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg text-white">
              <div class="flex items-center justify-between">
                <div><p class="text-blue-100 text-sm">Total Tareas</p><p class="text-3xl font-bold mt-1">{{ totalTasks }}</p><p class="text-blue-100 text-xs">{{ pendingTasks }} pendientes</p></div>
                <Target class="h-10 w-10 text-blue-200" />
              </div>
            </div>
            <div class="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg text-white">
              <div class="flex items-center justify-between">
                <div><p class="text-green-100 text-sm">Completadas</p><p class="text-3xl font-bold mt-1">{{ completedTasks }}</p><p class="text-green-100 text-xs">{{ completionRate }}% éxito</p></div>
                <CheckCircle class="h-10 w-10 text-green-200" />
              </div>
            </div>
            <div class="p-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg text-white">
              <div class="flex items-center justify-between">
                <div><p class="text-yellow-100 text-sm">Esta semana</p><p class="text-3xl font-bold mt-1">{{ tasksThisWeek }}</p><p class="text-yellow-100 text-xs">por completar</p></div>
                <Clock class="h-10 w-10 text-yellow-200" />
              </div>
            </div>
            <div class="p-6 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg text-white">
              <div class="flex items-center justify-between">
                <div><p class="text-red-100 text-sm">Vencidas</p><p class="text-3xl font-bold mt-1">{{ overdueTasks }}</p><p class="text-red-100 text-xs">requieren atención</p></div>
                <AlertTriangle class="h-10 w-10 text-red-200" />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribución por Prioridad</h3>
              <div class="space-y-4">
                <div>
                  <div class="flex items-center justify-between mb-1"><span class="text-sm text-gray-600 dark:text-gray-400">Alta</span><span class="text-sm font-medium text-gray-900 dark:text-white">{{ highPriorityTasks }}</span></div>
                  <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full"><div class="h-full bg-red-500 rounded-full" :style="{ width: `${(highPriorityTasks / totalTasks) * 100 || 0}%` }"></div></div>
                </div>
                <div>
                  <div class="flex items-center justify-between mb-1"><span class="text-sm text-gray-600 dark:text-gray-400">Media</span><span class="text-sm font-medium text-gray-900 dark:text-white">{{ mediumPriorityTasks }}</span></div>
                  <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full"><div class="h-full bg-yellow-500 rounded-full" :style="{ width: `${(mediumPriorityTasks / totalTasks) * 100 || 0}%` }"></div></div>
                </div>
                <div>
                  <div class="flex items-center justify-between mb-1"><span class="text-sm text-gray-600 dark:text-gray-400">Baja</span><span class="text-sm font-medium text-gray-900 dark:text-white">{{ lowPriorityTasks }}</span></div>
                  <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full"><div class="h-full bg-green-500 rounded-full" :style="{ width: `${(lowPriorityTasks / totalTasks) * 100 || 0}%` }"></div></div>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actividad Semanal</h3>
              <div class="flex items-end justify-between h-40 space-x-2">
                <div v-for="(day, index) in weeklyData" :key="index" class="flex-1 flex flex-col items-center">
                  <div class="w-full flex space-x-1 items-end h-32">
                    <div class="flex-1 bg-blue-500 rounded-t" :style="{ height: getBarHeight(day.completed, 10) }"></div>
                    <div class="flex-1 bg-green-500 rounded-t" :style="{ height: getBarHeight(day.created, 10) }"></div>
                  </div>
                  <span class="text-xs text-gray-500 mt-1">{{ day.day }}</span>
                </div>
              </div>
              <div class="flex justify-center space-x-6 mt-3">
                <div class="flex items-center space-x-2"><div class="w-3 h-3 bg-blue-500 rounded-full"></div><span class="text-xs text-gray-500">Completadas</span></div>
                <div class="flex items-center space-x-2"><div class="w-3 h-3 bg-green-500 rounded-full"></div><span class="text-xs text-gray-500">Creadas</span></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'productivity'" class="space-y-6">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
              <Activity class="h-8 w-8 text-blue-500 mx-auto mb-2" /><p class="text-3xl font-bold text-blue-600">{{ productivityScore }}</p><p class="text-sm text-gray-500">Productividad</p>
            </div>
            <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
              <CheckCircle class="h-8 w-8 text-green-500 mx-auto mb-2" /><p class="text-3xl font-bold text-green-600">{{ completionRate }}%</p><p class="text-sm text-gray-500">Tasa de éxito</p>
            </div>
            <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
              <Flame class="h-8 w-8 text-orange-500 mx-auto mb-2" /><p class="text-3xl font-bold text-orange-600">{{ streakDays }}</p><p class="text-sm text-gray-500">Días de racha</p>
            </div>
            <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
              <Trophy class="h-8 w-8 text-purple-500 mx-auto mb-2" /><p class="text-3xl font-bold text-purple-600">{{ longestStreak }}</p><p class="text-sm text-gray-500">Mejor racha</p>
            </div>
          </div>

          <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tendencias Mensuales</h3>
            <div class="flex items-end justify-between h-40 space-x-2">
              <div v-for="(month, index) in monthlyTrends" :key="index" class="flex-1 flex flex-col items-center">
                <div class="w-full flex space-x-1 items-end h-32">
                  <div class="flex-1 bg-purple-500 rounded-t" :style="{ height: getBarHeight(month.completed, 20) }"></div>
                </div>
                <span class="text-xs text-gray-500 mt-1">{{ month.month }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'calendar'" class="space-y-6">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
              <Clock class="h-8 w-8 text-purple-500 mx-auto mb-2" /><p class="text-2xl font-bold text-gray-900 dark:text-white">{{ tasksWithDueDate }}</p><p class="text-sm text-gray-500">Total eventos</p>
            </div>
            <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
              <CheckCircle class="h-8 w-8 text-green-500 mx-auto mb-2" /><p class="text-2xl font-bold text-gray-900 dark:text-white">{{ completedTasks }}</p><p class="text-sm text-gray-500">Completados</p>
            </div>
            <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
              <Calendar class="h-8 w-8 text-blue-500 mx-auto mb-2" /><p class="text-2xl font-bold text-gray-900 dark:text-white">{{ tasksThisWeek }}</p><p class="text-sm text-gray-500">Esta semana</p>
            </div>
            <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
              <CalendarDays class="h-8 w-8 text-orange-500 mx-auto mb-2" /><p class="text-2xl font-bold text-gray-900 dark:text-white">{{ tasksDueNextMonth }}</p><p class="text-sm text-gray-500">Próximo mes</p>
            </div>
          </div>

          <div v-if="overdueTasks > 0" class="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
            <h3 class="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center"><AlertTriangle class="h-5 w-5 mr-2" />Tareas Vencidas</h3>
            <div class="space-y-2">
              <div v-for="task in overdueList" :key="task.id" class="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ task.title }}</span>
                <span class="text-xs text-red-500">{{ new Date(task.dueDate).toLocaleDateString('es-ES') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'charts'" class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribución por Horas</h3>
            <div class="h-64 flex items-end space-x-1">
              <div v-for="bar in hourlyBarData" :key="bar.hour" class="flex-1 flex flex-col items-center">
                <div class="w-full bg-purple-500 rounded-t" :style="{ height: `${bar.height}%`, minHeight: bar.height > 0 ? '4px' : '0' }"></div>
                <span class="text-xs text-gray-500 mt-1 rotate-0">{{ bar.hour }}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribución por Prioridad</h3>
              <div class="h-48 flex items-center justify-center space-x-4">
                <div class="text-center">
                  <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-2">
                    <span class="text-white font-bold">{{ highPriorityTasks }}</span>
                  </div>
                  <span class="text-xs text-gray-500">Alta</span>
                </div>
                <div class="text-center">
                  <div class="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-2">
                    <span class="text-white font-bold">{{ mediumPriorityTasks }}</span>
                  </div>
                  <span class="text-xs text-gray-500">Media</span>
                </div>
                <div class="text-center">
                  <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-2">
                    <span class="text-white font-bold">{{ lowPriorityTasks }}</span>
                  </div>
                  <span class="text-xs text-gray-500">Baja</span>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tendencia de Finalización</h3>
              <div class="h-48 flex items-end space-x-2">
                <div v-for="(month, index) in monthlyTrends" :key="index" class="flex-1 flex flex-col items-center">
                  <div class="w-full bg-green-500 rounded-t" :style="{ height: getBarHeight(month.completed, 20) }"></div>
                  <span class="text-xs text-gray-500 mt-1">{{ month.month }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 text-center">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Balance de Carga</h3>
              <div :class="['text-3xl font-bold mb-2', productivityScore > 70 ? 'text-green-600' : productivityScore > 40 ? 'text-yellow-600' : 'text-red-600']">{{ productivityScore }}</div>
              <div :class="['inline-flex px-3 py-1 rounded-full text-sm font-medium', productivityScore > 70 ? 'bg-green-100 text-green-800' : productivityScore > 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800']">
                {{ productivityScore > 70 ? 'Óptimo' : productivityScore > 40 ? 'Normal' : 'Sobrecargado' }}
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 text-center">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tasa de Finalización</h3>
              <div class="text-3xl font-bold text-blue-600 mb-2">{{ completionRate }}%</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Tareas completadas vs creadas</div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 text-center">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Riesgo de Burnout</h3>
              <div class="relative w-32 h-32 mx-auto">
                <svg class="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="8" class="text-gray-200 dark:text-gray-700" />
                  <circle cx="50" cy="50" r="45" fill="none" :stroke="overdueTasks > 5 ? '#EF4444' : overdueTasks > 2 ? '#F59E0B' : '#10B981'" stroke-width="8" stroke-linecap="round" :stroke-dasharray="`${Math.min(completedTasks * 5, 100) * 2.83} 283`" transform="rotate(-90 50 50)" />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="text-center">
                    <div class="text-2xl font-bold" :class="overdueTasks > 5 ? 'text-red-600' : overdueTasks > 2 ? 'text-yellow-600' : 'text-green-600'">{{ Math.min(completedTasks * 5, 100) }}</div>
                    <div class="text-xs text-gray-500 uppercase">{{ overdueTasks > 5 ? 'Alto' : overdueTasks > 2 ? 'Medio' : 'Bajo' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'forecast'" class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Próximos 7 días</h3>
            <div class="flex items-end justify-between space-x-2">
              <div v-for="day in forecastData" :key="day.day" class="flex-1 text-center">
                <div class="h-40 flex flex-col justify-end">
                  <div :class="['w-full rounded-t transition-all', day.tasks > 3 ? 'bg-red-500' : day.tasks > 0 ? 'bg-yellow-500' : 'bg-green-500']" :style="{ height: day.tasks > 0 ? `${day.tasks * 20}px` : '8px' }"></div>
                </div>
                <p class="text-xs text-gray-500 mt-2">{{ day.day }}</p>
                <p class="text-sm font-medium" :class="day.isToday ? 'text-blue-600' : 'text-gray-900 dark:text-white'">{{ day.date }}</p>
                <p class="text-xs" :class="day.tasks > 3 ? 'text-red-500' : 'text-gray-500'">{{ day.tasks }} tareas</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'recommendations'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="rec in recommendations" :key="rec.title" class="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <component :is="rec.icon" class="h-8 w-8 text-purple-500 mb-4" />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ rec.title }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ rec.desc }}</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>