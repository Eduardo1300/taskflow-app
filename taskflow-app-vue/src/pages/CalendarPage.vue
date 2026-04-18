<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTaskStore } from '@/stores/tasks';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, X, Check } from 'lucide-vue-next';

const taskStore = useTaskStore();

const currentDate = ref(new Date());
const selectedDate = ref<Date | null>(null);
const view = ref<'month' | 'week' | 'day'>('month');

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const currentMonth = ref(currentDate.value.getMonth());
const currentYear = ref(currentDate.value.getFullYear());

const daysInMonth = ref<{ date: Date; isCurrentMonth: boolean }[]>([]);

function generateDays() {
  const year = currentYear.value;
  const month = currentMonth.value;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  const days = [];

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDay - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month - 1, prevMonthLastDay - i), isCurrentMonth: false });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }

  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
  }

  daysInMonth.value = days;
}

const tasksForDate = (date: Date) => {
  return taskStore.tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return taskDate.getDate() === date.getDate() &&
           taskDate.getMonth() === date.getMonth() &&
           taskDate.getFullYear() === date.getFullYear();
  });
};

const selectedDateTasks = ref<any[]>([]);

function selectDate(day: { date: Date; isCurrentMonth: boolean }) {
  selectedDate.value = day.date;
  selectedDateTasks.value = tasksForDate(day.date);
}

function isToday(date: Date) {
  return date.toDateString() === new Date().toDateString();
}

function isSelected(date: Date) {
  if (!selectedDate.value) return false;
  return date.toDateString() === selectedDate.value.toDateString();
}

function prevMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
  currentMonth.value = currentDate.value.getMonth();
  currentYear.value = currentDate.value.getFullYear();
  generateDays();
}

function nextMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
  currentMonth.value = currentDate.value.getMonth();
  currentYear.value = currentDate.value.getFullYear();
  generateDays();
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high': return 'border-l-red-500';
    case 'medium': return 'border-l-yellow-500';
    case 'low': return 'border-l-green-500';
    default: return 'border-l-gray-500';
  }
}

onMounted(async () => {
  await taskStore.fetchTasks();
  generateDays();
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
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              Calendario
            </h1>
            <p class="text-gray-500 dark:text-gray-400">
              Visualiza tus tareas por fecha
            </p>
          </div>

          <div class="flex items-center space-x-4">
            <div class="flex bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <button v-for="v in ['month', 'week', 'day']" :key="v" @click="view = v as any" :class="['px-4 py-2 rounded-l-xl font-medium', view === v ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300']">
                {{ v }}
              </button>
            </div>

            <button @click="prevMonth" class="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300">
              <ChevronLeft class="h-5 w-5" />
            </button>

            <span class="text-lg font-semibold text-gray-900 dark:text-white min-w-[180px] text-center">
              {{ monthNames[currentMonth] }} {{ currentYear }}
            </span>

            <button @click="nextMonth" class="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300">
              <ChevronRight class="h-5 w-5" />
            </button>
          </div>
        </div>

        <div class="flex gap-6">
          <!-- Calendar Grid -->
          <div class="flex-1">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div class="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
                <div v-for="day in dayNames" :key="day" class="py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  {{ day }}
                </div>
              </div>

              <div class="grid grid-cols-7">
                <div v-for="(day, index) in daysInMonth" :key="index" @click="selectDate(day)" :class="['min-h-[100px] p-2 border-b border-r border-gray-100 dark:border-gray-700 cursor-pointer transition-all', !day.isCurrentMonth && 'bg-gray-50 dark:bg-gray-900/50', isToday(day.date) && 'bg-blue-50 dark:bg-blue-900/20']">
                    <span :class="['text-sm font-medium', day.isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400', isToday(day.date) && 'text-blue-600 dark:text-blue-400']">
                      {{ day.date.getDate() }}
                    </span>
                    <div class="mt-1 space-y-1">
                      <div v-for="task in tasksForDate(day.date).slice(0, 2)" :key="task.id" :class="['text-xs p-1 rounded truncate border-l-2', getPriorityColor(task.priority), task.completed && 'line-through text-gray-400']">
                        {{ task.title }}
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>

          <!-- Selected Date Tasks -->
          <div v-if="selectedDate" class="w-80">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">
                {{ selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) }}
              </h3>

              <div v-if="selectedDateTasks.length === 0" class="text-center py-8">
                <Calendar class="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p class="text-gray-500 dark:text-gray-400">No hay tareas para este día</p>
              </div>

              <div v-else class="space-y-3">
                <div v-for="task in selectedDateTasks" :key="task.id" class="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <button @click="taskStore.toggleTask(task.id)" :class="['w-5 h-5 rounded-full border-2 flex-shrink-0', task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300']">
                    <Check v-if="task.completed" class="h-3 w-3 text-white" />
                  </button>
                  <div class="flex-1 min-w-0">
                    <h4 :class="['font-medium text-gray-900 dark:text-white', task.completed && 'line-through']">{{ task.title }}</h4>
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