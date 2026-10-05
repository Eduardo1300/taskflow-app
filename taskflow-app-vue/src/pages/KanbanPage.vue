<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue';
import { useTaskStore } from '@/stores/tasks';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import TaskModal from '@/components/TaskModal.vue';
import draggable from 'vuedraggable';
import {
  Plus, CheckCircle2, Clock, Star, Settings, Filter, Search, X,
  ChevronDown, Tag as TagIcon, AlertCircle
} from 'lucide-vue-next';

const taskStore = useTaskStore();

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  wipLimit?: number;
  order: number;
}

interface FilterState {
  priority: string[];
  category: string[];
  assignee: string[];
  dueDate: string;
  tags: string[];
}

const columns = ref<KanbanColumn[]>([
  { id: 'pending', title: 'Por hacer', color: 'bg-blue-500', wipLimit: 10, order: 0 },
  { id: 'in_progress', title: 'En progreso', color: 'bg-yellow-500', wipLimit: 3, order: 1 },
  { id: 'review', title: 'En revisión', color: 'bg-purple-500', wipLimit: 2, order: 2 },
  { id: 'completed', title: 'Completado', color: 'bg-green-500', order: 3 }
]);

// Un array reactivo por columna (para vuedraggable)
const columnTasks = reactive<Record<string, any[]>>({
  pending: [],
  in_progress: [],
  review: [],
  completed: []
});

const searchTerm = ref('');
const isFilterOpen = ref(false);
const isConfigOpen = ref(false);
const isModalOpen = ref(false);
const isSaving = ref(false);
const editingTask = ref<any>(null);

const filters = ref<FilterState>({
  priority: [],
  category: [],
  assignee: [],
  dueDate: 'all',
  tags: []
});

const priorityOptions = [
  { value: 'high', label: 'Alta', color: 'text-red-600' },
  { value: 'medium', label: 'Media', color: 'text-yellow-600' },
  { value: 'low', label: 'Baja', color: 'text-green-600' }
];

// Qué cambios se aplican a una tarea al llegar a cada columna
const columnStatus: Record<string, { priority?: string; completed: boolean }> = {
  pending: { priority: 'low', completed: false },
  in_progress: { priority: 'medium', completed: false },
  review: { priority: 'high', completed: false },
  completed: { completed: true } // no tocamos la prioridad
};

function getTaskStatus(task: any): string {
  if (task.completed) return 'completed';
  if (task.priority === 'high') return 'review';
  if (task.priority === 'medium') return 'in_progress';
  return 'pending';
}

function matchesFilters(task: any): boolean {
  if (searchTerm.value) {
    const searchLower = searchTerm.value.toLowerCase();
    const matchesTitle = task.title?.toLowerCase().includes(searchLower);
    const matchesDescription = task.description?.toLowerCase().includes(searchLower);
    if (!matchesTitle && !matchesDescription) return false;
  }

  if (filters.value.priority.length > 0 && !filters.value.priority.includes(task.priority || '')) {
    return false;
  }

  if (filters.value.dueDate && filters.value.dueDate !== 'all') {
    const today = new Date();
    const taskDueDate = task.due_date ? new Date(task.due_date) : null;

    switch (filters.value.dueDate) {
      case 'overdue':
        return !!taskDueDate && taskDueDate < today && !task.completed;
      case 'today':
        return !!taskDueDate && taskDueDate.toDateString() === today.toDateString();
      case 'week': {
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return !!taskDueDate && taskDueDate <= weekFromNow && taskDueDate >= today;
      }
      case 'no_date':
        return !taskDueDate;
    }
  }

  return true;
}

function syncColumnTasks() {
  const allTasks = taskStore.tasks;

  columns.value.forEach(column => {
    columnTasks[column.id] = allTasks.filter(
      task => getTaskStatus(task) === column.id && matchesFilters(task)
    );
  });
}

function getTasksByStatus(status: string) {
  return columnTasks[status] || [];
}

const getActiveFiltersCount = computed(() => {
  return filters.value.priority.length + (filters.value.dueDate !== 'all' ? 1 : 0);
});

function clearFilters() {
  filters.value = { priority: [], category: [], assignee: [], dueDate: 'all', tags: [] };
}

function togglePriorityFilter(value: string) {
  if (filters.value.priority.includes(value)) {
    filters.value.priority = filters.value.priority.filter(x => x !== value);
  } else {
    filters.value.priority.push(value);
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
}

// vuedraggable emite @change con { added | removed | moved }.
// Solo actuamos cuando una tarea LLEGA a esta columna.
async function handleColumnChange(columnId: string, evt: any) {
  if (!evt.added) return;

  const task = evt.added.element;
  const payload = columnStatus[columnId];
  if (!task?.id || !payload) return;

  try {
    await taskStore.updateTask(task.id, payload);
    // Si tu store no actualiza su array local en updateTask, descomenta:
    // await taskStore.fetchTasks();
  } catch (error) {
    console.error('Error updating task:', error);
    await taskStore.fetchTasks(); // revierte el cambio visual
    syncColumnTasks();
  }
}

function toggleTask(taskId: number) {
  taskStore.toggleTask(taskId);
}

function toggleFavorite(taskId: number) {
  taskStore.toggleFavorite(taskId);
}

function openEditTask(task: any) {
  editingTask.value = task;
  isModalOpen.value = true;
}

function deleteTask(task: any) {
  if (confirm(`¿Eliminar tarea "${task.title}"?`)) {
    taskStore.deleteTask(task.id);
  }
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

onMounted(async () => {
  await taskStore.fetchTasks();
  syncColumnTasks();
});

watch(() => taskStore.tasks, syncColumnTasks, { deep: true });
watch(searchTerm, syncColumnTasks);
watch(filters, syncColumnTasks, { deep: true });
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900">
    <Sidebar />

    <div class="flex-1 flex flex-col">
      <Header />

      <main class="flex-1 p-6">
        <!-- Header del Kanban -->
        <div class="mb-6 sm:mb-8">
          <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-6">
            <div class="flex items-start space-x-3 sm:space-x-4">
              <div class="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl text-white shadow-lg flex-shrink-0">
                <TagIcon class="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Vista Kanban
                </h1>
                <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  Organiza tus tareas visualmente • {{ taskStore.tasks.length }} tareas totales
                </p>
              </div>
            </div>
          </div>

          <!-- Búsqueda y filtros -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
            <!-- Búsqueda -->
            <div class="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Buscar tareas..."
                v-model="searchTerm"
                class="w-full sm:w-64 pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
              />
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <button v-if="searchTerm" @click="searchTerm = ''" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X class="h-4 w-4" />
              </button>
            </div>

            <!-- Botón de filtros -->
            <div class="relative flex-1 sm:flex-none">
              <button
                @click="isFilterOpen = !isFilterOpen"
                :class="[
                  'w-full sm:w-auto flex items-center justify-center sm:justify-start px-3 py-2 border rounded-lg transition-colors text-sm sm:text-base',
                  getActiveFiltersCount > 0
                    ? 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-500 dark:bg-purple-900/30 dark:text-purple-300'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
              >
                <Filter class="h-4 w-4 mr-2" />
                <span>Filtros</span>
                <span v-if="getActiveFiltersCount > 0" class="ml-2 px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                  {{ getActiveFiltersCount }}
                </span>
                <ChevronDown :class="['ml-1 h-4 w-4 transition-transform', isFilterOpen ? 'rotate-180' : '']" />
              </button>

              <!-- Panel de filtros -->
              <div v-if="isFilterOpen" class="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 z-50">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-semibold text-gray-900 dark:text-white">Filtros</h3>
                  <button @click="clearFilters" class="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400">Limpiar todo</button>
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prioridad</label>
                  <div class="space-y-2">
                    <label v-for="p in priorityOptions" :key="p.value" class="flex items-center">
                      <input
                        type="checkbox"
                        :checked="filters.priority.includes(p.value)"
                        @change="togglePriorityFilter(p.value)"
                        class="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span class="ml-2 text-sm" :class="p.color">{{ p.label }}</span>
                    </label>
                  </div>
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha límite</label>
                  <select v-model="filters.dueDate" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="all">Todas</option>
                    <option value="overdue">Vencidas</option>
                    <option value="today">Hoy</option>
                    <option value="week">Esta semana</option>
                    <option value="no_date">Sin fecha</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Botón de columnas -->
            <button
              @click="isConfigOpen = !isConfigOpen"
              class="w-full sm:w-auto flex items-center justify-center sm:justify-start px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              <Settings class="h-4 w-4 mr-2" />
              <span>Columnas</span>
            </button>

            <!-- Panel de configuración de columnas -->
            <div v-if="isConfigOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-semibold text-gray-900 dark:text-white">Configurar Columnas</h3>
                  <button @click="isConfigOpen = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <X class="h-4 w-4" />
                  </button>
                </div>

                <div class="space-y-4">
                  <div v-for="column in columns" :key="column.id" class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div class="flex items-center space-x-3">
                      <div :class="['w-3 h-3 rounded-full', column.color]" />
                      <span class="font-medium text-gray-900 dark:text-white">{{ column.title }}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span v-if="column.wipLimit" class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">WIP: {{ column.wipLimit }}</span>
                      <span class="text-xs text-gray-500 dark:text-gray-400">{{ getTasksByStatus(column.id).length }} tareas</span>
                    </div>
                  </div>
                </div>

                <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div class="flex items-start space-x-2">
                    <div class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span class="text-white text-xs">i</span>
                    </div>
                    <div>
                      <p class="text-sm text-blue-800 dark:text-blue-300 font-medium">Límites WIP (Work In Progress)</p>
                      <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">Los límites WIP ayudan a mantener el flujo de trabajo eficiente limitando el número de tareas en progreso.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Botón nueva tarea -->
            <button
              @click="isModalOpen = true; editingTask = null"
              class="w-full sm:w-auto flex items-center justify-center sm:justify-start px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <Plus class="h-4 w-4 mr-2" />
              Nueva tarea
            </button>
          </div>
        </div>

        <!-- Tablero Kanban -->
        <div class="flex-1 overflow-visible">
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 h-full">
            <div
              v-for="column in columns"
              :key="column.id"
              class="flex flex-col h-full"
            >
              <!-- Cabecera de columna -->
              <div
                class="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-t-2xl border border-gray-200/50 dark:border-gray-700/50 flex-shrink-0"
                :class="columnTasks[column.id].length > (column.wipLimit || 999) ? 'border-red-300 dark:border-red-600' : ''"
              >
                <div class="flex items-center space-x-3">
                  <div :class="['w-3 h-3 rounded-full', column.color]" />
                  <h3 class="font-semibold text-gray-900 dark:text-white">{{ column.title }}</h3>
                  <span :class="[
                    'px-2 py-1 text-xs rounded-full',
                    columnTasks[column.id].length > (column.wipLimit || 999)
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  ]">
                    {{ columnTasks[column.id].length }}{{ column.wipLimit ? ` / ${column.wipLimit}` : '' }}
                  </span>
                </div>

                <div v-if="columnTasks[column.id].length > (column.wipLimit || 999)" class="flex items-center text-red-500" title="Límite WIP excedido">
                  <AlertCircle class="h-4 w-4" />
                </div>
              </div>

              <!-- Contenedor de tareas -->
              <div class="flex-1 p-4 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-b-2xl border-x border-b border-gray-200/50 dark:border-gray-700/50 overflow-y-auto custom-scrollbar transition-colors">
                <draggable
                  v-model="columnTasks[column.id]"
                  group="tasks"
                  item-key="id"
                  :animation="150"
                  ghost-class="ghost"
                  chosen-class="chosen"
                  drag-class="drag"
                  class="min-h-[120px] space-y-3"
                  @change="handleColumnChange(column.id, $event)"
                >
                  <template #item="{ element }">
                    <div
                      class="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 cursor-move hover:shadow-md transition-all space-y-3"
                    >
                      <div class="flex items-start justify-between mb-2">
                        <button
                          @click="toggleTask(element.id)"
                          :class="['w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center', element.completed ? 'bg-green-500 border-green-500' : 'border-gray-300']"
                        >
                          <CheckCircle2 v-if="element.completed" class="w-3 h-3 text-white" />
                        </button>
                        <button @click="toggleFavorite(element.id)">
                          <Star :class="['w-4 h-4', element.favorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300']" />
                        </button>
                      </div>

                      <h4 :class="['font-medium text-gray-900 dark:text-white text-sm mb-1', element.completed && 'line-through text-gray-500']">
                        {{ element.title }}
                      </h4>

                      <p v-if="element.description" class="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                        {{ element.description }}
                      </p>

                      <div class="flex items-center justify-between">
                        <span :class="['w-2 h-2 rounded-full', getPriorityColor(element.priority)]"></span>
                        <div v-if="element.due_date" class="flex items-center text-xs text-gray-500">
                          <Clock class="w-3 h-3 mr-1" />
                          {{ new Date(element.due_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) }}
                        </div>
                      </div>
                    </div>
                  </template>
                </draggable>

                <!-- Estado vacío (fuera del draggable) -->
                <div
                  v-if="columnTasks[column.id].length === 0"
                  class="pointer-events-none flex items-center justify-center py-6 text-gray-400 dark:text-gray-600"
                >
                  <div class="text-center">
                    <Clock class="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p class="text-sm">No hay tareas aquí</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal de tarea -->
        <TaskModal
          :is-open="isModalOpen"
          :task="editingTask"
          :loading="isSaving"
          @close="isModalOpen = false; editingTask = null"
          @saved="handleTaskSaved"
        />
      </main>
    </div>
  </div>
</template>

<style scoped>
.ghost {
  opacity: 0.4;
}
.chosen {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}
.drag {
  transform: rotate(2deg);
}
</style>