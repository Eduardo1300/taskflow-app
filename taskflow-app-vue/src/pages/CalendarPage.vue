<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useTaskStore } from '@/stores/tasks';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import TaskModal from '@/components/TaskModal.vue';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, TrendingUp, Users, Repeat, List, Grid3X3 } from 'lucide-vue-next';

const taskStore = useTaskStore();

const currentDate = ref(new Date());
const selectedDate = ref<Date | null>(null);
const viewMode = ref<'month' | 'week' | 'day'>('month');
const activeTab = ref<'calendar' | 'collaboration'>('calendar');
const isLoading = ref(true);
const isModalOpen = ref(false);
const isSaving = ref(false);
const editingTask = ref<any>(null);

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const hourNames = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

const monthDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
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

const weekDays = computed(() => {
  const startOfWeek = new Date(currentDate.value);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(day.getDate() + i);
    days.push({
      date: day,
      isToday: day.toDateString() === new Date().toDateString()
    });
  }
  return days;
});

function eventsForDate(date: Date) {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return taskStore.tasks.filter(task => {
    const taskDueDate = task.due_date || task.dueDate;
    if (!taskDueDate) return false;
    const taskDate = taskDueDate.split('T')[0];
    return taskDate === dateStr;
  });
}

const todayEvents = computed(() => eventsForDate(new Date()));
const upcomingEvents = computed(() => {
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);
  
  return taskStore.tasks
    .filter(task => {
      const taskDueDate = task.due_date || task.dueDate;
      if (!taskDueDate) return false;
      const dateStr = taskDueDate.split('T')[0];
      const eventDate = new Date(dateStr + 'T12:00:00');
      const nowDate = new Date(now.toISOString().split('T')[0] + 'T12:00:00');
      const nextWeekDate = new Date(nextWeek.toISOString().split('T')[0] + 'T12:00:00');
      return eventDate > nowDate && eventDate <= nextWeekDate;
    })
    .slice(0, 5);
});

function navigate(direction: 'prev' | 'next') {
  const newDate = new Date(currentDate.value);
  if (viewMode.value === 'month') {
    direction === 'prev' ? newDate.setMonth(newDate.getMonth() - 1) : newDate.setMonth(newDate.getMonth() + 1);
  } else if (viewMode.value === 'week') {
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
  } else {
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -1 : 1));
  }
  currentDate.value = newDate;
}

function selectDate(day: { date: Date; isCurrentMonth: boolean }) {
  selectedDate.value = day.date;
}

function openEditFromCalendar(event: any) {
  editingTask.value = event;
  isModalOpen.value = true;
}

function getMonthName() {
  return currentDate.value.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
}

function openNewEvent() {
  editingTask.value = null;
  isModalOpen.value = true;
}

async function handleTaskSaved(taskData: any) {
  isSaving.value = true;
  try {
    const taskPayload = {
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      dueDate: taskData.due_date,
      categoryId: taskData.category ? parseInt(taskData.category) : undefined,
      tags: taskData.tags
    };
    if (editingTask.value) {
      await taskStore.updateTask(editingTask.value.id, taskPayload);
    } else {
      await taskStore.createTask(taskPayload);
    }
    await taskStore.fetchTasks();
    isModalOpen.value = false;
    editingTask.value = null;
  } finally {
    isSaving.value = false;
  }
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
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <CalendarIcon class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                Calendario
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ taskStore.tasks.filter(t => t.due_date || t.dueDate).length }} eventos programados
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <div class="flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <Clock class="h-4 w-4 text-green-600 dark:text-green-400" />
              <span class="text-sm font-medium text-green-700 dark:text-green-300">{{ todayEvents.length }} hoy</span>
            </div>
            <div class="flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <TrendingUp class="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span class="text-sm font-medium text-blue-700 dark:text-blue-300">{{ upcomingEvents.length }} esta semana</span>
            </div>
            <button @click="openNewEvent" class="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700">
              <Plus class="h-5 w-5 mr-2" />
              Nuevo evento
            </button>
            <button class="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">
              <Repeat class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex space-x-2 mb-6">
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

        <!-- Calendar View -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <!-- Calendar Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-4">
              <button @click="navigate('prev')" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
                <ChevronLeft class="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white capitalize">
                {{ getMonthName() }}
              </h2>
              <button @click="navigate('next')" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
                <ChevronRight class="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div class="flex items-center space-x-2">
              <button @click="currentDate = new Date()" class="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
                Hoy
              </button>
              <div class="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                <button
                  v-for="mode in ['month', 'week', 'day']"
                  :key="mode"
                  @click="viewMode = mode as any"
                  :class="['px-3 py-1.5 rounded-lg text-sm font-medium flex items-center', viewMode === mode ? 'bg-white dark:bg-gray-600 text-blue-600' : 'text-gray-600 dark:text-gray-300']"
                >
                  <Grid3X3 v-if="mode === 'month'" class="h-4 w-4 mr-1" />
                  <List v-else-if="mode === 'week'" class="h-4 w-4 mr-1" />
                  {{ mode === 'month' ? 'Mes' : mode === 'week' ? 'Semana' : 'Día' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="isLoading" class="flex items-center justify-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>

          <!-- Month View -->
          <div v-else-if="viewMode === 'month'" class="p-4">
            <!-- Day Names -->
            <div class="grid grid-cols-7 gap-2 mb-4">
              <div v-for="day in dayNames" :key="day" class="p-2 text-center">
                <div class="text-sm font-semibold text-gray-500 dark:text-gray-400">{{ day }}</div>
              </div>
            </div>

            <!-- Days Grid -->
            <div class="grid grid-cols-7 gap-2">
              <div
                v-for="(day, index) in monthDays"
                :key="index"
                @click="selectDate(day); isModalOpen = true"
                :class="['min-h-24 p-2 rounded-xl border transition-all cursor-pointer hover:shadow-lg', 
                  day.isCurrentMonth ? 'bg-white dark:bg-gray-700 border-gray-100 dark:border-gray-600' : 'bg-gray-50 dark:bg-gray-800 border-transparent',
                  day.isToday ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                ]"
              >
                <div :class="['text-sm font-medium mb-1', 
                  day.isToday ? 'text-blue-600 dark:text-blue-400 font-bold' : 
                  day.isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                ]">
                  {{ day.date.getDate() }}
                </div>
                <div class="space-y-1">
                  <div 
                    v-for="event in eventsForDate(day.date).slice(0, 2)" 
                    :key="event.id" 
                    @click.stop="openEditFromCalendar(event)"
                    :class="['text-xs px-1 py-0.5 rounded truncate font-medium cursor-pointer hover:opacity-80', getPriorityColor(event.priority)]"
                  >
                    {{ event.title }}
                  </div>
                  <div v-if="eventsForDate(day.date).length > 2" class="text-xs text-gray-500">
                    +{{ eventsForDate(day.date).length - 2 }} más
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Week View -->
          <div v-else-if="viewMode === 'week'" class="p-4">
            <div class="grid grid-cols-7 gap-2">
              <div v-for="day in weekDays" :key="day.date.toISOString()">
                <div :class="['text-center p-2 rounded-lg', day.isToday ? 'bg-blue-50 dark:bg-blue-900/30' : '']">
                  <div class="text-xs text-gray-500">{{ dayNames[day.date.getDay()] }}</div>
                  <div :class="['text-lg font-bold', day.isToday ? 'text-blue-600' : 'text-gray-900 dark:text-white']">
                    {{ day.date.getDate() }}
                  </div>
                </div>
                <div class="mt-2 space-y-1 min-h-[200px]">
                  <div 
                    v-for="event in eventsForDate(day.date)"
                    :key="event.id"
                    :class="['text-xs p-1 rounded truncate', getPriorityColor(event.priority)]"
                  >
                    {{ event.title }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Day View -->
          <div v-else class="p-4">
            <div class="space-y-4">
              <div v-for="hour in hourNames" :key="hour" class="flex border-b border-gray-100 dark:border-gray-700 pb-2">
                <div class="w-16 text-sm text-gray-500">{{ hour }}</div>
                <div class="flex-1 min-h-[40px]">
                  <div 
                    v-for="event in eventsForDate(currentDate.value).filter(e => {
                      if (!e.dueDate) return false;
                      const eventHour = new Date(e.dueDate).getHours().toString().padStart(2, '0') + ':00';
                      return eventHour === hour;
                    })"
                    :key="event.id"
                    :class="['text-xs p-1 rounded', getPriorityColor(event.priority)]"
                  >
                    {{ event.title }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Task Modal -->
    <TaskModal
      :is-open="isModalOpen"
      :task="editingTask"
      :loading="isSaving"
      @close="isModalOpen = false; editingTask = null"
      @saved="handleTaskSaved"
    />
  </div>
</template>