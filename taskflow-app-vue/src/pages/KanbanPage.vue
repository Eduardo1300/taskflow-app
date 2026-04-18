<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTaskStore } from '@/stores/tasks';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import { Plus, MoreHorizontal, CheckCircle2, Clock, AlertTriangle, Star, Trash2, Edit, GripVertical, BarChart3, Settings, Filter, Search } from 'lucide-vue-next';

const taskStore = useTaskStore();

const columns = [
  { id: 'pending', title: 'Pendientes', color: 'bg-yellow-500' },
  { id: 'in_progress', title: 'En Progreso', color: 'bg-blue-500' },
  { id: 'completed', title: 'Completadas', color: 'bg-green-500' }
];

const searchQuery = ref('');

const tasksByColumn = computed(() => {
  const filtered = searchQuery.value
    ? taskStore.tasks.filter(t => t.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
    : taskStore.tasks;

  return {
    pending: filtered.filter(t => !t.completed),
    in_progress: filtered.filter(t => !t.completed),
    completed: filtered.filter(t => t.completed)
  };
});

const draggedTask = ref<any>(null);

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
}

function onDragStart(task: any) {
  draggedTask.value = task;
}

function onDragOver(e: DragEvent) {
  e.preventDefault();
}

function onDrop(columnId: string) {
  if (draggedTask.value) {
    if (columnId === 'completed') {
      taskStore.toggleTask(draggedTask.value.id);
    }
    draggedTask.value = null;
  }
}

function toggleTask(taskId: number) {
  taskStore.toggleTask(taskId);
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
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              Vista Kanban
            </h1>
            <p class="text-gray-500 dark:text-gray-400">
              Organiza tus tareas en columnas
            </p>
          </div>

          <div class="flex items-center space-x-4">
            <input v-model="searchQuery" type="text" placeholder="Buscar tareas..." class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" />
            <button class="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium">
              <Plus class="h-5 w-5" />
              <span>Nueva Tarea</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="column in columns" :key="column.id" class="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4" @dragover="onDragOver" @drop="onDrop(column.id)">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-2">
                <div :class="['w-3 h-3 rounded-full', column.color]"></div>
                <h3 class="font-semibold text-gray-900 dark:text-white">{{ column.title }}</h3>
                <span class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
                  {{ tasksByColumn[column.id as 'pending' | 'in_progress' | 'completed']?.length || 0 }}
                </span>
              </div>
              <button class="p-1 text-gray-400 hover:text-gray-600"><MoreHorizontal class="h-5 w-5" /></button>
            </div>

            <div class="space-y-3">
              <div v-for="task in tasksByColumn[column.id as 'pending' | 'in_progress' | 'completed']" :key="task.id" draggable="true" @dragstart="onDragStart(task)" class="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm cursor-move hover:shadow-md transition-all">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <button @click="toggleTask(task.id)" :class="['flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center', task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300']">
                      <CheckCircle2 v-if="task.completed" class="h-3 w-3 text-white" />
                    </button>
                    <GripVertical class="h-4 w-4 text-gray-300" />
                  </div>
                  <button class="p-1 text-gray-400 hover:text-gray-600"><MoreHorizontal class="h-4 w-4" /></button>
                </div>

                <h4 :class="['font-medium text-gray-900 dark:text-white mb-2', task.completed && 'line-through text-gray-400']">{{ task.title }}</h4>
                <p v-if="task.description" class="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{{ task.description }}</p>

                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span :class="['px-2 py-1 rounded-full text-white', getPriorityColor(task.priority)]">{{ task.priority || 'baja' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>