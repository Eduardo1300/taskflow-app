<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTaskStore } from '@/stores/tasks';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import TaskModal from '@/components/TaskModal.vue';
import { 
  Plus, MoreHorizontal, CheckCircle2, Clock, AlertTriangle, Star, Trash2, Edit, 
  GripVertical, BarChart3, Settings, Filter, Search, X, ChevronDown,
  Tag, Users
} from 'lucide-vue-next';

const taskStore = useTaskStore();

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  wipLimit?: number;
}

const columns = ref<KanbanColumn[]>([
  { id: 'pending', title: 'Por hacer', color: 'bg-blue-500', wipLimit: 10 },
  { id: 'in_progress', title: 'En progreso', color: 'bg-yellow-500', wipLimit: 3 },
  { id: 'completed', title: 'Completado', color: 'bg-green-500' }
]);

const searchTerm = ref('');
const isFilterOpen = ref(false);
const isModalOpen = ref(false);
const editingTask = ref<any>(null);
const draggedTask = ref<any>(null);
const draggedOverColumn = ref<string | null>(null);

const filters = ref({
  priority: [] as string[],
  dueDate: 'all'
});

const priorityOptions = [
  { value: 'high', label: 'Alta', color: 'text-red-600' },
  { value: 'medium', label: 'Media', color: 'text-yellow-600' },
  { value: 'low', label: 'Baja', color: 'text-green-600' }
];

function getTasksByStatus(status: string) {
  return taskStore.tasks.filter(task => {
    let taskStatus = 'pending';
    if (task.completed) {
      taskStatus = 'completed';
    } else if (task.priority === 'medium') {
      taskStatus = 'in_progress';
    }
    
    if (taskStatus !== status) return false;

    if (searchTerm.value) {
      const searchLower = searchTerm.value.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(searchLower);
      const matchesDescription = task.description?.toLowerCase().includes(searchLower);
      if (!matchesTitle && !matchesDescription) return false;
    }

    if (filters.value.priority.length > 0 && !filters.value.priority.includes(task.priority || '')) {
      return false;
    }

    if (filters.value.dueDate && filters.value.dueDate !== 'all') {
      const today = new Date();
      const taskDueDate = task.dueDate ? new Date(task.dueDate) : null;
      
      switch (filters.value.dueDate) {
        case 'overdue':
          return taskDueDate && taskDueDate < today && !task.completed;
        case 'today':
          return taskDueDate && taskDueDate.toDateString() === today.toDateString();
        case 'week':
          const weekFromNow = new Date(today);
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          return taskDueDate && taskDueDate <= weekFromNow && taskDueDate >= today;
        case 'no_date':
          return !taskDueDate;
      }
    }
    
    return true;
  });
}

const getActiveFiltersCount = computed(() => {
  return filters.value.priority.length + (filters.value.dueDate !== 'all' ? 1 : 0);
});

function clearFilters() {
  filters.value = { priority: [], dueDate: 'all' };
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
}

function onDragStart(e: DragEvent, task: any) {
  e.dataTransfer!.setData('taskId', task.id.toString());
  draggedTask.value = task;
}

function onDragOver(e: DragEvent, columnId: string) {
  e.preventDefault();
  draggedOverColumn.value = columnId;
}

function onDragEnd() {
  draggedTask.value = null;
  draggedOverColumn.value = null;
}

function onDrop(e: DragEvent, columnId: string) {
  e.preventDefault();
  const taskId = e.dataTransfer?.getData('taskId');
  if (taskId) {
    const task = taskStore.tasks.find(t => t.id === parseInt(taskId));
    if (task) {
      if (columnId === 'completed') {
        taskStore.toggleTask(task.id);
      } else if (columnId === 'in_progress') {
        taskStore.updateTask(task.id, { priority: 'medium' });
      } else if (columnId === 'pending') {
        taskStore.updateTask(task.id, { priority: 'low' });
      }
    }
  }
  draggedTask.value = null;
  draggedOverColumn.value = null;
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

function handleTaskSaved() {
  isModalOpen.value = false;
  editingTask.value = null;
}

onMounted(async () => {
  await taskStore.fetchTasks();
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
              <BarChart3 class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                Kanban
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ taskStore.tasks.length }} tareas
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <!-- Search -->
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                v-model="searchTerm"
                type="text"
                placeholder="Buscar..."
                class="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
              />
            </div>

            <!-- Filters -->
            <button 
              @click="isFilterOpen = !isFilterOpen"
              :class="['flex items-center px-4 py-2 rounded-xl border transition-all', isFilterOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300']"
            >
              <Filter class="h-4 w-4 mr-2" />
              Filtros
              <span v-if="getActiveFiltersCount > 0" class="ml-2 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                {{ getActiveFiltersCount }}
              </span>
            </button>

            <button @click="isModalOpen = true" class="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium">
              <Plus class="h-4 w-4 mr-2" />
              Nueva tarea
            </button>
          </div>
        </div>

        <!-- Filters Panel -->
        <div v-if="isFilterOpen" class="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900 dark:text-white">Filtros</h3>
            <button @click="clearFilters" class="text-sm text-blue-600 hover:underline">Limpiar</button>
          </div>
          <div class="flex flex-wrap gap-4">
            <div>
              <label class="block text-sm text-gray-500 mb-2">Prioridad</label>
              <div class="flex gap-2">
                <button
                  v-for="p in priorityOptions"
                  :key="p.value"
                  @click="filters.priority.includes(p.value) ? filters.priority = filters.priority.filter(x => x !== p.value) : filters.priority.push(p.value)"
                  :class="['px-3 py-1.5 rounded-lg text-sm', filters.priority.includes(p.value) ? p.color + ' bg-opacity-20' : 'bg-gray-100 dark:bg-gray-700']"
                >
                  {{ p.label }}
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm text-gray-500 mb-2">Fecha</label>
              <select v-model="filters.dueDate" class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
                <option value="all">Todas</option>
                <option value="overdue">Vencidas</option>
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
                <option value="no_date">Sin fecha</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Kanban Board -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="column in columns"
            :key="column.id"
          >
            <div class="bg-gray-100 dark:bg-gray-800 rounded-xl p-3">
              <!-- Column Header -->
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <div :class="['w-3 h-3 rounded-full', column.color]"></div>
                  <h3 class="font-semibold text-gray-900 dark:text-white">{{ column.title }}</h3>
                  <span class="text-sm text-gray-500">({{ getTasksByStatus(column.id).length }})</span>
                </div>
                <button v-if="column.wipLimit" class="text-xs px-2 py-0.5 rounded-full"
                  :class="getTasksByStatus(column.id).length > column.wipLimit ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'"
                >
                  {{ getTasksByStatus(column.id).length }}/{{ column.wipLimit }}
                </button>
              </div>

              <!-- Tasks -->
              <div
                @dragover="(e) => onDragOver(e, column.id)"
                @dragenter="(e) => onDragOver(e, column.id)"
                @dragleave="draggedOverColumn = null"
                @drop="(e) => onDrop(e, column.id)"
                :class="['min-h-[200px] space-y-3 p-2 rounded-lg transition-all', draggedOverColumn === column.id ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500' : 'bg-gray-50 dark:bg-gray-700']"
              >
                <div
                  v-for="task in getTasksByStatus(column.id)"
                  :key="task.id"
                  draggable="true"
                  @dragstart="(e) => onDragStart(e, task)"
                  @dragend="onDragEnd"
                  class="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 cursor-move hover:shadow-md transition-all"
                >
                  <div class="flex items-start justify-between mb-2">
                    <button
                      @click="toggleTask(task.id)"
                      :class="['w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center', task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300']"
                    >
                      <CheckCircle2 v-if="task.completed" class="w-3 h-3 text-white" />
                    </button>
                    <button @click="toggleFavorite(task.id)">
                      <Star :class="['w-4 h-4', task.favorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300']" />
                    </button>
                  </div>
                  
                  <h4 :class="['font-medium text-gray-900 dark:text-white text-sm mb-1', task.completed && 'line-through text-gray-500']">
                    {{ task.title }}
                  </h4>
                  
                  <p v-if="task.description" class="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                    {{ task.description }}
                  </p>
                  
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                      <span :class="['px-1.5 py-0.5 rounded text-xs', getPriorityColor(task.priority)]"></span>
                    </div>
                    <div v-if="task.dueDate" class="flex items-center text-xs text-gray-500">
                      <Clock class="w-3 h-3 mr-1" />
                      {{ new Date(task.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) }}
                    </div>
                  </div>
                </div>

                <div v-if="getTasksByStatus(column.id).length === 0" class="text-center py-8 text-gray-400 text-sm">
                  Sin tareas
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
      @close="isModalOpen = false; editingTask = null"
      @saved="handleTaskSaved"
    />
  </div>
</template>