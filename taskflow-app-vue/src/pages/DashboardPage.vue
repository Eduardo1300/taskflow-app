<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTaskStore } from '@/stores/tasks';
import { useAuthStore } from '@/stores/auth';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import TaskModal from '@/components/TaskModal.vue';
import { 
  Plus, CheckCircle, Target, TrendingUp, Zap, Sparkles, Star, 
  AlertTriangle, FilterIcon, Search, Clock, Trash2, Edit, GripVertical,
  X, Share2, Calendar, Loader2
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const taskStore = useTaskStore();
const authStore = useAuthStore();

const searchQuery = ref('');
const statusFilter = ref<'all' | 'pending' | 'completed'>('all');
const priorityFilter = ref<'all' | 'high' | 'medium' | 'low'>('all');
const favoriteFilter = ref<boolean | null>(null);
const showFilters = ref(false);
const isModalOpen = ref(false);
const isSaving = ref(false);
const editingTask = ref<any>(null);
const deleteConfirmTask = ref<any>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const filteredTasks = computed(() => {
  let tasks = [...taskStore.tasks];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    tasks = tasks.filter(t => 
      t.title?.toLowerCase().includes(query) || 
      t.description?.toLowerCase().includes(query)
    );
  }

  if (statusFilter.value !== 'all') {
    tasks = tasks.filter(t => 
      statusFilter.value === 'completed' ? t.completed : !t.completed
    );
  }

  if (priorityFilter.value !== 'all') {
    tasks = tasks.filter(t => t.priority === priorityFilter.value);
  }

  if (favoriteFilter.value !== null) {
    tasks = tasks.filter(t => t.favorite === favoriteFilter.value);
  }

  tasks.sort((a, b) => {
    const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority || 'low'] || 0;
    const bPriority = priorityOrder[b.priority || 'low'] || 0;

    if (aPriority !== bPriority) return bPriority - aPriority;
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return 0;
  });

  return tasks;
});

const stats = computed(() => {
  const total = taskStore.tasks.length;
  const completed = taskStore.tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const highPriority = taskStore.tasks.filter(t => t.priority === 'high' && !t.completed).length;
  const overdue = taskStore.tasks.filter(t => 
    t.dueDate && new Date(t.dueDate) < new Date() && !t.completed
  ).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, pending, highPriority, overdue, progress };
});

const userName = computed(() => authStore.user?.email?.split('@')[0] || 'Usuario');

function openNewTask() {
  editingTask.value = null;
  isModalOpen.value = true;
}

function openEditTask(task: any) {
  editingTask.value = task;
  isModalOpen.value = true;
}

function confirmDelete(task: any) {
  deleteConfirmTask.value = task;
}

function handleDelete() {
  if (deleteConfirmTask.value) {
    taskStore.deleteTask(deleteConfirmTask.value.id);
    deleteConfirmTask.value = null;
  }
}

function toggleTask(taskId: number) {
  taskStore.toggleTask(taskId);
}

function toggleFavorite(taskId: number) {
  taskStore.toggleFavorite(taskId);
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

function clearFilters() {
  statusFilter.value = 'all';
  priorityFilter.value = 'all';
  favoriteFilter.value = null;
  searchQuery.value = '';
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
      <Header @new-task="openNewTask" />

      <main class="flex-1 p-6">
        <!-- Hero Banner -->
        <div class="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-2xl">
          <div class="absolute inset-0 bg-black/20"></div>
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/4"></div>
          
          <div class="relative px-6 py-8 sm:px-8 sm:py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div class="flex items-center space-x-4">
              <div class="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Target class="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 class="text-2xl sm:text-3xl font-bold text-white">
                  Dashboard
                </h1>
                <p class="text-blue-100 text-sm sm:text-base mt-1">
                  Bienvenido de vuelta, {{ userName }}
                </p>
              </div>
            </div>
            
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button @click="openNewTask" class="flex items-center justify-center px-5 py-2.5 bg-white text-purple-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <Plus class="h-5 w-5 mr-2" />
                Nueva tarea
              </button>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div class="group bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Tareas</p>
                <p class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {{ stats.pending }} pendientes
                </p>
              </div>
              <div class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <Target class="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div class="mt-4 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full" style="width: 100%"></div>
            </div>
          </div>
          
          <div class="group bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Completadas</p>
                <p class="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{{ stats.completed }}</p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {{ stats.progress }}% progreso
                </p>
              </div>
              <div class="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <CheckCircle class="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div class="mt-4 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full bg-green-500 rounded-full transition-all duration-500" :style="{ width: stats.progress + '%' }"></div>
            </div>
          </div>
          
          <div class="group bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Alta Prioridad</p>
                <p class="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">{{ stats.highPriority }}</p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Requieren atención
                </p>
              </div>
              <div class="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <Zap class="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div class="mt-4 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full bg-red-500 rounded-full" :style="{ width: stats.highPriority > 0 ? '60%' : '20%' }"></div>
            </div>
          </div>
          
          <div class="group bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Productividad</p>
                <p class="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {{ stats.progress }}%
                </p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Esta semana
                </p>
              </div>
              <div class="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <TrendingUp class="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div class="mt-4 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full bg-purple-500 rounded-full transition-all duration-500" :style="{ width: stats.progress + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- Search -->
        <div class="mb-8">
          <div class="relative">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar tareas..."
              class="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Goals Placeholder -->
        <div class="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900 dark:text-white">Tus Metas</h3>
            <button class="text-sm text-blue-600 hover:underline">Configurar metas</button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p class="text-sm text-gray-500 dark:text-gray-400">Diarias</p>
              <p class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.completed }}/{{ Math.max(stats.total, 5) }}</p>
              <div class="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div class="h-full bg-green-500 rounded-full" :style="{ width: (stats.completed / Math.max(stats.total, 5) * 100) + '%' }"></div>
              </div>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p class="text-sm text-gray-500 dark:text-gray-400">Semanales</p>
              <p class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.completed * 7 }}/50</p>
              <div class="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div class="h-full bg-blue-500 rounded-full" :style="{ width: (stats.completed * 7 / 50 * 100) + '%' }"></div>
              </div>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p class="text-sm text-gray-500 dark:text-gray-400">Mensuales</p>
              <p class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.completed * 30 }}/200</p>
              <div class="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div class="h-full bg-purple-500 rounded-full" :style="{ width: (stats.completed * 30 / 200 * 100) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Tus Tareas
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {{ filteredTasks.length }} tarea{{ filteredTasks.length !== 1 ? 's' : '' }} encontrada{{ filteredTasks.length !== 1 ? 's' : '' }}
            </p>
          </div>
          
          <!-- Filter Pills -->
          <div class="flex items-center gap-2">
            <button
              @click="{ statusFilter = 'all'; priorityFilter = 'all'; }"
              :class="['px-3 py-1.5 rounded-full text-sm font-medium transition-all', statusFilter === 'all' && priorityFilter === 'all' ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600']"
            >
              Todas
            </button>
            <button
              @click="statusFilter = 'pending'"
              :class="['px-3 py-1.5 rounded-full text-sm font-medium transition-all', statusFilter === 'pending' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600']"
            >
              Pendientes
            </button>
            <button
              @click="statusFilter = 'completed'"
              :class="['px-3 py-1.5 rounded-full text-sm font-medium transition-all', statusFilter === 'completed' ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600']"
            >
              Completadas
            </button>
            <button
              @click="favoriteFilter = favoriteFilter === true ? null : true"
              :class="['px-3 py-1.5 rounded-full text-sm font-medium transition-all', favoriteFilter === true ? 'bg-yellow-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600']"
            >
              <Star class="h-3.5 w-3.5 mr-1 inline" />
              Favoritas
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-16">
          <div class="relative">
            <div class="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div class="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-4 font-medium">Cargando tareas...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredTasks.length === 0" class="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-3xl p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-700">
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div class="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-xl">
            <Sparkles class="h-10 w-10 sm:h-12 sm:w-12 text-blue-500" />
          </div>
          <h3 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {{ taskStore.tasks.length === 0 ? '¡Comienza tu productividad!' : 'No se encontraron tareas' }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {{ taskStore.tasks.length === 0 ? 'Crea tu primera tarea y organiza tu trabajo de manera efectiva.' : 'Intenta ajustar los filtros para encontrar lo que buscas.' }}
          </p>
          <button
            @click="openNewTask"
            class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Plus class="h-5 w-5 mr-2" />
            {{ taskStore.tasks.length === 0 ? 'Crear primera tarea' : 'Crear nueva tarea' }}
          </button>
        </div>

        <!-- Tasks Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div
            v-for="task in filteredTasks"
            :key="task.id"
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center space-x-3">
                <button
                  @click="toggleTask(task.id)"
                  :class="['w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all', task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400']"
                >
                  <CheckCircle v-if="task.completed" class="w-4 h-4 text-white" />
                </button>
                <button @click="toggleFavorite(task.id)">
                  <Star :class="['w-5 h-5', task.favorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300']" />
                </button>
              </div>
              <div class="flex items-center space-x-1">
                <button @click="openEditTask(task)" class="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg">
                  <Edit class="w-4 h-4" />
                </button>
                <button @click="confirmDelete(task)" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 :class="['font-semibold text-gray-900 dark:text-white mb-2', task.completed && 'line-through text-gray-500']">
              {{ task.title }}
            </h3>
            
            <p v-if="task.description" class="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
              {{ task.description }}
            </p>
            
            <div class="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
              <div class="flex items-center space-x-2">
                <span :class="['px-2 py-0.5 rounded-full text-xs font-medium', 
                  task.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                  task.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                  'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                ]">
                  {{ task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja' }}
                </span>
              </div>
              <div v-if="task.dueDate" class="flex items-center text-xs text-gray-500">
                <Clock class="w-3 h-3 mr-1" />
                {{ new Date(task.dueDate).toLocaleDateString('es-ES') }}
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

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteConfirmTask" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Confirmar eliminación
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-6">
          ¿Estás seguro de que deseas eliminar la tarea <strong>"{{ deleteConfirmTask?.title }}"</strong>? 
          Esta acción no se puede deshacer.
        </p>
        <div class="flex justify-end gap-3">
          <button
            @click="deleteConfirmTask = null"
            class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleDelete"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>