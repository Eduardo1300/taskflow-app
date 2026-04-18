<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTaskStore } from '@/stores/tasks';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import { Plus, CheckCircle, Target, TrendingUp, Zap, Sparkles, Star, AlertTriangle, FilterIcon, Search, Clock, Trash2, Eye, X } from 'lucide-vue-next';

const taskStore = useTaskStore();

const searchQuery = ref('');
const statusFilter = ref<'all' | 'pending' | 'completed'>('all');
const priorityFilter = ref<'all' | 'high' | 'medium' | 'low'>('all');
const favoriteFilter = ref<boolean | null>(null);
const showFilters = ref(false);
const isModalOpen = ref(false);
const editingTask = ref<any>(null);
const deleteConfirmTask = ref<any>(null);

const filteredTasks = computed(() => {
  let tasks = [...taskStore.tasks];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    tasks = tasks.filter(t => t.title?.toLowerCase().includes(query) || t.description?.toLowerCase().includes(query));
  }

  if (statusFilter.value !== 'all') {
    tasks = tasks.filter(t => statusFilter.value === 'completed' ? t.completed : !t.completed);
  }

  if (priorityFilter.value !== 'all') {
    tasks = tasks.filter(t => t.priority === priorityFilter.value);
  }

  if (favoriteFilter.value !== null) {
    tasks = tasks.filter(t => t.favorite === favoriteFilter.value);
  }

  return tasks;
});

const stats = computed(() => {
  const total = taskStore.tasks.length;
  const completed = taskStore.tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const highPriority = taskStore.tasks.filter(t => t.priority === 'high' && !t.completed).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, pending, highPriority, progress };
});

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

function clearFilters() {
  statusFilter.value = 'all';
  priorityFilter.value = 'all';
  favoriteFilter.value = null;
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high': return 'text-red-500 bg-red-100 dark:bg-red-900';
    case 'medium': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900';
    case 'low': return 'text-green-500 bg-green-100 dark:bg-green-900';
    default: return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
  }
}

onMounted(async () => {
  await taskStore.fetchTasks();
});
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900">
    <Sidebar />

    <div class="flex-1 flex flex-col">
      <Header @new-task="openNewTask" />

      <main class="flex-1 p-6">
        <!-- Welcome Section -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Bienvenido de nuevo 👋
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              Aquí está tu resumen de tareas
            </p>
          </div>

          <div class="flex items-center space-x-2">
            <button @click="showFilters = !showFilters" :class="['flex items-center space-x-2 px-4 py-2 rounded-xl', showFilters ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700']">
              <FilterIcon class="h-5 w-5" />
              <span>Filtros</span>
            </button>
            <button @click="openNewTask" class="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700">
              <Plus class="h-5 w-5" />
              <span>Nueva Tarea</span>
            </button>
          </div>
        </div>

        <!-- Filters Panel -->
        <div v-if="showFilters" class="mb-6 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900 dark:text-white">Filtros</h3>
            <button @click="clearFilters" class="text-sm text-blue-600 hover:underline">Limpiar filtros</button>
          </div>

          <div class="flex flex-wrap gap-4">
            <div>
              <label class="block text-sm text-gray-500 mb-2">Estado</label>
              <div class="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                <button v-for="f in ['all', 'pending', 'completed']" :key="f" @click="statusFilter = f as any" :class="['px-4 py-2 rounded-lg capitalize', statusFilter === f ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-500']">
                  {{ f === 'all' ? 'Todas' : f }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm text-gray-500 mb-2">Prioridad</label>
              <select v-model="priorityFilter" class="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white">
                <option value="all">Todas</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>

            <div>
              <label class="block text-sm text-gray-500 mb-2">Favoritos</label>
              <button @click="favoriteFilter = favoriteFilter === true ? null : true" :class="['px-4 py-2 rounded-xl', favoriteFilter === true ? 'bg-yellow-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white']">
                <Star class="h-4 w-4 inline" />
              </button>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-100 text-sm">Total de Tareas</p>
                <p class="text-3xl font-bold mt-1">{{ stats.total }}</p>
              </div>
              <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Target class="h-8 w-8" />
              </div>
            </div>
          </div>

          <div class="p-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-yellow-100 text-sm">Pendientes</p>
                <p class="text-3xl font-bold mt-1">{{ stats.pending }}</p>
              </div>
              <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock class="h-8 w-8" />
              </div>
            </div>
          </div>

          <div class="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-100 text-sm">Completadas</p>
                <p class="text-3xl font-bold mt-1">{{ stats.completed }}</p>
              </div>
              <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <CheckCircle class="h-8 w-8" />
              </div>
            </div>
          </div>

          <div class="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-purple-100 text-sm">Progreso</p>
                <p class="text-3xl font-bold mt-1">{{ stats.progress }}%</p>
              </div>
              <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp class="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mb-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-3">
            <span class="font-medium text-gray-900 dark:text-white">Tu progreso diario</span>
            <span class="text-sm text-gray-500">{{ stats.completed }} de {{ stats.total }} tareas</span>
          </div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" :style="{ width: `${stats.progress}%` }" />
          </div>
        </div>

        <!-- Filters -->
        <div class="flex items-center space-x-2 mb-6">
          <button v-for="filter in ['all', 'pending', 'completed']" :key="filter" @click="statusFilter = filter as any" :class="['px-4 py-2 rounded-xl font-medium text-sm transition-all', statusFilter === filter ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700']">
            {{ filter === 'all' ? 'Todas' : filter === 'pending' ? 'Pendientes' : 'Completadas' }}
          </button>
        </div>

        <!-- Loading -->
        <div v-if="taskStore.loading" class="text-center py-12">
          <div class="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p class="text-gray-500 mt-4">Cargando tareas...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredTasks.length === 0" class="text-center py-12">
          <div class="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles class="h-10 w-10 text-gray-400" />
          </div>
          <p class="text-gray-500 dark:text-gray-400 mb-4">No hay tareas</p>
          <button @click="openNewTask" class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700">
            <Plus class="h-5 w-5 inline mr-2" />
            Crear Tarea
          </button>
        </div>

        <!-- Tasks List -->
        <div v-else class="space-y-3">
          <div v-for="task in filteredTasks" :key="task.id" class="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <button @click="toggleTask(task.id)" :class="['w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0', task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-500']">
              <CheckCircle v-if="task.completed" class="h-4 w-4 text-white" />
            </button>

            <div class="flex-1 min-w-0">
              <h3 :class="['font-medium text-gray-900 dark:text-white', task.completed && 'line-through text-gray-400']">
                {{ task.title }}
              </h3>
              <p v-if="task.description" class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ task.description }}</p>
            </div>

            <span :class="['px-2 py-1 text-xs font-medium rounded-full', getPriorityColor(task.priority || 'low')]">
              {{ task.priority || 'baja' }}
            </span>

            <button @click="toggleFavorite(task.id)" :class="['p-2', task.favorite ? 'text-yellow-500' : 'text-gray-300']">
              <Star class="h-5 w-5" :fill="task.favorite ? 'currentColor' : 'none'" />
            </button>

            <button @click="openEditTask(task)" class="p-2 text-gray-400 hover:text-blue-500">
              <Eye class="h-5 w-5" />
            </button>

            <button @click="confirmDelete(task)" class="p-2 text-gray-400 hover:text-red-500">
              <Trash2 class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="deleteConfirmTask" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" @click="deleteConfirmTask = null"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-md">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Eliminar Tarea</h3>
            <p class="text-gray-500 mb-4">¿Estás seguro de que quieres eliminar "{{ deleteConfirmTask.title }}"?</p>
            <div class="flex justify-end space-x-3">
              <button @click="deleteConfirmTask = null" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-xl">Cancelar</button>
              <button @click="handleDelete" class="px-4 py-2 bg-red-600 text-white rounded-xl">Eliminar</button>
            </div>
          </div>
        </div>

        <!-- Task Modal -->
        <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" @click="isModalOpen = false"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ editingTask ? 'Editar Tarea' : 'Nueva Tarea' }}
              </h3>
              <button @click="isModalOpen = false" class="text-gray-400 hover:text-gray-600">
                <X class="h-6 w-6" />
              </button>
            </div>

            <form @submit.prevent="isModalOpen = false" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Título</label>
                <input v-model="editingTask.title" type="text" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Título de la tarea" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
                <textarea v-model="editingTask.description" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Descripción"></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prioridad</label>
                <select v-model="editingTask.priority" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              <div class="flex justify-end space-x-3 pt-4">
                <button type="button" @click="isModalOpen = false" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">Cancelar</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>