<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useTaskStore } from '@/stores/tasks';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, TrendingUp, Users, Repeat } from 'lucide-vue-next';

const taskStore = useTaskStore();

const currentDate = ref(new Date());
const selectedDate = ref<Date | null>(null);
const viewMode = ref<'month' | 'week' | 'day'>('month');
const activeTab = ref<'calendar' | 'collaboration'>('calendar');
const isLoading = ref(true);

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const currentMonth = computed(() => currentDate.value.getMonth());
const currentYear = computed(() => currentDate.value.getFullYear());

const monthDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days = [];
  const current = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    days.push({
      date: new Date(current),
      isCurrentMonth: current.getMonth() === month,
      isToday: current.toDateString() === new Date().toDateString()
    });
    current.setDate(current.getDate() + 1);
  }
  
  return days;
});

const eventsForDate = (date: Date) => {
  return taskStore.tasks.filter(task => {
    if (!task.dueDate) return false;
    const dateStr = task.dueDate.split('T')[0];
    const eventDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return dateStr === eventDateStr;
  });
};

const todayEvents = computed(() => {
  const today = new Date();
  return eventsForDate(today);
});

const upcomingEvents = computed(() => {
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);
  
  return taskStore.tasks
    .filter(task => {
      if (!task.dueDate) return false;
      const dateStr = task.dueDate.split('T')[0];
      const eventDate = new Date(dateStr + 'T12:00:00');
      const nowDate = new Date(now.toISOString().split('T')[0] + 'T12:00:00');
      const nextWeekDate = new Date(nextWeek.toISOString().split('T')[0] + 'T12:00:00');
      return eventDate > nowDate && eventDate <= nextWeekDate;
    })
    .slice(0, 5);
});

const getMonthName = (date: Date) => {
  return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
};

function navigateMonth(direction: 'prev' | 'next') {
  const newDate = new Date(currentDate.value);
  if (direction === 'prev') {
    newDate.setMonth(newDate.getMonth() - 1);
  } else {
    newDate.setMonth(newDate.getMonth() + 1);
  }
  currentDate.value = newDate;
}

function selectDate(day: { date: Date; isCurrentMonth: boolean }) {
  selectedDate.value = day.date;
}

onMounted(async () => {
  await taskStore.fetchTasks();
  isLoading.value = false;
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
              Calendario
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              {{ taskStore.tasks.filter(t => t.dueDate).length }} eventos programados
            </p>
          </div>

          <div class="flex items-center space-x-2">
            <div class="flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <Clock class="h-4 w-4 text-green-600 dark:text-green-400" />
              <span class="text-sm font-medium text-green-700 dark:text-green-300">{{ todayEvents.length }} hoy</span>
            </div>
            <div class="flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <TrendingUp class="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span class="text-sm font-medium text-blue-700 dark:text-blue-300">{{ upcomingEvents.length }} esta semana</span>
            </div>
            <button class="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700">
              <Plus class="h-5 w-5" />
              <span>Nuevo evento</span>
            </button>
            <button class="flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">
              <Repeat class="h-5 w-5" />
            </button>
          </div>
        </div>

        <div class="flex space-x-2 mb-6 overflow-x-auto">
          <button
            @click="activeTab = 'calendar'"
            :class="['flex items-center px-4 py-2 rounded-xl font-medium', activeTab === 'calendar' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700']"
          >
            <CalendarIcon class="h-5 w-5 mr-2" />
            Calendario
          </button>
          <button
            @click="activeTab = 'collaboration'"
            :class="['flex items-center px-4 py-2 rounded-xl font-medium', activeTab === 'collaboration' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700']"
          >
            <Users class="h-5 w-5 mr-2" />
            Colaboración
          </button>
        </div>

        <div v-if="isLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
        
        <div v-else class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-4">
              <button @click="navigateMonth('prev')" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
                <ChevronLeft class="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white capitalize">
                {{ getMonthName(currentDate) }}
              </h2>
              <button @click="navigateMonth('next')" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
                <ChevronRight class="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div class="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <button
                v-for="mode in ['month', 'week', 'day']"
                :key="mode"
                @click="viewMode = mode as any"
                :class="['px-4 py-2 rounded-lg text-sm font-medium', viewMode === mode ? 'bg-white dark:bg-gray-600 text-blue-600' : 'text-gray-600 dark:text-gray-300']"
              >
                {{ mode === 'month' ? 'Mes' : mode === 'week' ? 'Semana' : 'Día' }}
              </button>
            </div>
          </div>

          <div class="p-4">
            <div class="grid grid-cols-7 gap-2 mb-4">
              <div v-for="day in dayNames" :key="day" class="p-2 text-center">
                <div class="text-sm font-semibold text-gray-500 dark:text-gray-400">{{ day }}</div>
              </div>
            </div>

            <div class="grid grid-cols-7 gap-2">
              <div
                v-for="(day, index) in monthDays"
                :key="index"
                @click="selectDate(day)"
                :class="['min-h-24 p-2 rounded-xl border transition-all cursor-pointer hover:shadow-lg', day.isCurrentMonth ? 'bg-white dark:bg-gray-700 border-gray-100 dark:border-gray-600' : 'bg-gray-50 dark:bg-gray-800 border-transparent', day.isToday ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : '']"
              >
                <div :class="['text-sm font-medium mb-1', day.isToday ? 'text-blue-600 dark:text-blue-400 font-bold' : day.isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500']">
                  {{ day.date.getDate() }}
                </div>
                <div class="space-y-1">
                  <div v-for="event in eventsForDate(day.date).slice(0, 2)" :key="event.id" class="text-xs px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 truncate">
                    {{ event.title }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>