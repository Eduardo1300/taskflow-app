<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTaskStore } from '@/stores/tasks';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import TaskModal from '@/components/TaskModal.vue';
import { analyticsService, type ProcessedTask } from '@/services/analyticsService';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock,
  TrendingUp, List, Grid3X3
} from 'lucide-vue-next';

type ViewMode = 'month' | 'week' | 'day';

const taskStore = useTaskStore();

const currentDate = ref(new Date());
const viewMode = ref<ViewMode>('month');
const isLoading = ref(true);
const isModalOpen = ref(false);
const isSaving = ref(false);
const editingTask = ref<any>(null);
// Fecha (YYYY-MM-DD) con la que se precarga una tarea nueva
const newTaskDate = ref<string | null>(null);

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const hourNames = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
const viewModes: { key: ViewMode; label: string }[] = [
  { key: 'month', label: 'Mes' },
  { key: 'week', label: 'Semana' },
  { key: 'day', label: 'Día' }
];

/* ---------- Eventos ---------- */

function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Se calcula una sola vez por cambio de tareas (antes se filtraba en cada celda y en cada render)
const eventsByDay = computed(() => {
  const map = new Map<string, ProcessedTask[]>();
  for (const task of analyticsService.processTasks(taskStore.tasks)) {
    if (!task.dueDate) continue;
    const key = dateKey(task.dueDate);
    const list = map.get(key);
    if (list) list.push(task);
    else map.set(key, [task]);
  }
  map.forEach(list => list.sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime()));
  return map;
});

function eventsForDate(date: Date): ProcessedTask[] {
  return eventsByDay.value.get(dateKey(date)) ?? [];
}

const scheduledCount = computed(() => taskStore.tasks.filter(t => t.due_date).length);

const todayCount = computed(() => eventsForDate(new Date()).filter(e => !e.completed).length);

const nextDaysCount = computed(() => {
  let count = 0;
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    count += eventsForDate(date).filter(e => !e.completed).length;
  }
  return count;
});

/* ---------- Calendario ---------- */

const monthDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  const firstDay = new Date(year, month, 1);
  const current = new Date(firstDay);
  current.setDate(current.getDate() - firstDay.getDay());

  const todayStr = new Date().toDateString();
  const days = [];

  for (let i = 0; i < 42; i++) {
    days.push({
      date: new Date(current),
      isCurrentMonth: current.getMonth() === month,
      isToday: current.toDateString() === todayStr
    });
    current.setDate(current.getDate() + 1);
  }

  return days;
});

const weekDays = computed(() => {
  const startOfWeek = new Date(currentDate.value);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const todayStr = new Date().toDateString();
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(day.getDate() + i);
    days.push({ date: day, isToday: day.toDateString() === todayStr });
  }
  return days;
});

// Vista de día: eventos con hora van en su franja; los que solo tienen fecha, arriba
const dayEvents = computed(() => eventsForDate(currentDate.value));
const allDayEvents = computed(() => dayEvents.value.filter(e => !e.dueHasTime));

function timedEventsAt(hour: number): ProcessedTask[] {
  return dayEvents.value.filter(e => e.dueHasTime && e.dueDate!.getHours() === hour);
}

const headerTitle = computed(() => {
  const d = currentDate.value;
  if (viewMode.value === 'month') {
    return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }
  if (viewMode.value === 'week') {
    const start = weekDays.value[0].date;
    const end = weekDays.value[6].date;
    const startLabel = start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const endLabel = end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${startLabel} – ${endLabel}`;
  }
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
});

function navigate(direction: 'prev' | 'next') {
  const step = direction === 'prev' ? -1 : 1;
  const newDate = new Date(currentDate.value);

  if (viewMode.value === 'month') {
    newDate.setDate(1); // evita saltos como 31 ene -> 3 mar
    newDate.setMonth(newDate.getMonth() + step);
  } else if (viewMode.value === 'week') {
    newDate.setDate(newDate.getDate() + step * 7);
  } else {
    newDate.setDate(newDate.getDate() + step);
  }

  currentDate.value = newDate;
}

function goToDay(date: Date) {
  currentDate.value = new Date(date);
  viewMode.value = 'day';
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
}

/* ---------- Modal ---------- */

// Si es una tarea nueva con fecha elegida, se la pasamos al modal como valor inicial
const modalTask = computed(() => {
  if (editingTask.value) return editingTask.value;
  return newTaskDate.value ? { due_date: newTaskDate.value } : null;
});

function openNewTask(date?: Date | null) {
  editingTask.value = null;
  newTaskDate.value = date ? dateKey(date) : null;
  isModalOpen.value = true;
}

function openEditFromCalendar(event: { id: number }) {
  // Pasamos la tarea original del store, no la versión procesada
  editingTask.value = taskStore.tasks.find(t => t.id === event.id) ?? null;
  newTaskDate.value = null;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  editingTask.value = null;
  newTaskDate.value = null;
}

async function handleTaskSaved(taskData: any) {
  isSaving.value = true;
  try {
    const taskPayload = {
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      due_date: taskData.due_date || taskData.dueDate,
      category: taskData.category || undefined,
      tags: Array.isArray(taskData.tags) ? taskData.tags : []
    };
    if (editingTask.value?.id) {
      await taskStore.updateTask(editingTask.value.id, taskPayload);
    } else {
      await taskStore.createTask(taskPayload);
    }
    await taskStore.fetchTasks();
    closeModal();
  } finally {
    isSaving.value = false;
  }
}

onMounted(async () => {
  try {
    await taskStore.fetchTasks();
  } catch (e) {
    console.error('Error cargando tareas:', e);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900">
    <Sidebar />

    <div class="flex-1 flex flex-col">
      <Header />

      <main class="flex-1 p-6">
        <!-- Header -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <CalendarIcon class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Calendario</h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ scheduledCount }} eventos programados</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <Clock class="h-4 w-4 text-green-600 dark:text-green-400" />
              <span class="text-sm font-medium text-green-700 dark:text-green-300">{{ todayCount }} hoy</span>
            </div>
            <div class="flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <TrendingUp class="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span class="text-sm font-medium text-blue-700 dark:text-blue-300">{{ nextDaysCount }} próximos 7 días</span>
            </div>
            <button
              @click="openNewTask(viewMode === 'day' ? currentDate : null)"
              class="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-sm font-medium shadow-lg"
            >
              <Plus class="h-4 w-4 mr-2" />
              Nueva tarea
            </button>
          </div>
        </div>

        <!-- Calendar -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <!-- Calendar Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-4">
              <button @click="navigate('prev')" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
                <ChevronLeft class="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white capitalize">{{ headerTitle }}</h2>
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
                  v-for="mode in viewModes"
                  :key="mode.key"
                  @click="viewMode = mode.key"
                  :class="['px-3 py-1.5 rounded-lg text-sm font-medium flex items-center', viewMode === mode.key ? 'bg-white dark:bg-gray-600 text-blue-600' : 'text-gray-600 dark:text-gray-300']"
                >
                  <Grid3X3 v-if="mode.key === 'month'" class="h-4 w-4 mr-1" />
                  <List v-else-if="mode.key === 'week'" class="h-4 w-4 mr-1" />
                  {{ mode.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="isLoading" class="flex items-center justify-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>

          <!-- Month View -->
          <div v-else-if="viewMode === 'month'" class="p-4 overflow-x-auto">
            <div class="min-w-[640px]">
              <div class="grid grid-cols-7 gap-2 mb-4">
                <div v-for="day in dayNames" :key="day" class="p-2 text-center">
                  <div class="text-sm font-semibold text-gray-500 dark:text-gray-400">{{ day }}</div>
                </div>
              </div>

              <div class="grid grid-cols-7 gap-2">
                <div
                  v-for="(day, index) in monthDays"
                  :key="index"
                  @click="openNewTask(day.date)"
                  :class="['min-h-[96px] p-2 rounded-xl border transition-all cursor-pointer hover:shadow-lg',
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
                      :class="['text-xs px-1 py-0.5 rounded truncate font-medium text-white cursor-pointer hover:opacity-80', getPriorityColor(event.priority), event.completed ? 'opacity-60 line-through' : '']"
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
          </div>

          <!-- Week View -->
          <div v-else-if="viewMode === 'week'" class="p-4 overflow-x-auto">
            <div class="grid grid-cols-7 gap-2 min-w-[640px]">
              <div v-for="day in weekDays" :key="day.date.toISOString()">
                <button
                  @click="goToDay(day.date)"
                  :class="['w-full text-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700', day.isToday ? 'bg-blue-50 dark:bg-blue-900/30' : '']"
                >
                  <div class="text-xs text-gray-500">{{ dayNames[day.date.getDay()] }}</div>
                  <div :class="['text-lg font-bold', day.isToday ? 'text-blue-600' : 'text-gray-900 dark:text-white']">
                    {{ day.date.getDate() }}
                  </div>
                </button>
                <div class="mt-2 space-y-1 min-h-[200px]">
                  <div
                    v-for="event in eventsForDate(day.date)"
                    :key="event.id"
                    @click="openEditFromCalendar(event)"
                    :class="['text-xs p-1 rounded truncate text-white cursor-pointer hover:opacity-80', getPriorityColor(event.priority), event.completed ? 'opacity-60 line-through' : '']"
                  >
                    {{ event.title }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Day View -->
          <div v-else class="p-4">
            <!-- Eventos sin hora -->
            <div v-if="allDayEvents.length > 0" class="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <p class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">Todo el día</p>
              <div class="space-y-1">
                <div
                  v-for="event in allDayEvents"
                  :key="event.id"
                  @click="openEditFromCalendar(event)"
                  :class="['text-sm p-2 rounded text-white cursor-pointer hover:opacity-80', getPriorityColor(event.priority), event.completed ? 'opacity-60 line-through' : '']"
                >
                  {{ event.title }}
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <div v-for="(hour, h) in hourNames" :key="hour" class="flex border-b border-gray-100 dark:border-gray-700 pb-2">
                <div class="w-16 text-sm text-gray-500">{{ hour }}</div>
                <div class="flex-1 min-h-[40px] space-y-1">
                  <div
                    v-for="event in timedEventsAt(h)"
                    :key="event.id"
                    @click="openEditFromCalendar(event)"
                    :class="['text-sm p-2 rounded text-white cursor-pointer hover:opacity-80', getPriorityColor(event.priority), event.completed ? 'opacity-60 line-through' : '']"
                  >
                    {{ event.title }}
                  </div>
                </div>
              </div>
            </div>

            <p v-if="dayEvents.length === 0" class="text-center text-sm text-gray-400 dark:text-gray-500 mt-6">
              No hay eventos este día
            </p>
          </div>
        </div>
      </main>
    </div>

    <!-- Task Modal -->
    <TaskModal
      :is-open="isModalOpen"
      :task="modalTask"
      :loading="isSaving"
      @close="closeModal"
      @saved="handleTaskSaved"
    />
  </div>
</template>