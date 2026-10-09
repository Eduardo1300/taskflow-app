<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useTaskStore } from '@/stores/tasks';
import type { Task, Category } from '@/types';
import {
  X, Flag, FileText, Target, AlertTriangle, CheckCircle,
  Plus, Hash, Clock, Trash2, Calendar,
  Sparkles
} from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  isOpen: boolean;
  task: Task | null;
  categories?: Category[];
  loading?: boolean;
}>(), {
  categories: () => [],
  loading: false
});

const emit = defineEmits(['close', 'saved']);

const taskStore = useTaskStore();

const taskCategories = computed(() => {
  if (taskStore.categories.length > 0) {
    return taskStore.categories.map((cat: any) => ({ name: cat.name, icon: '📁' }));
  }
  return [
    { name: 'Trabajo', icon: '💼' },
    { name: 'Personal', icon: '🏠' },
    { name: 'Estudio', icon: '📚' },
    { name: 'Salud', icon: '⚕️' },
    { name: 'Compras', icon: '🛒' },
    { name: 'Viajes', icon: '✈️' },
  ];
});

function parseTagsArray(tags: string | string[] | undefined): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  const cleaned = String(tags).replace(/^\{|\}$/g, '');
  return cleaned.split(',').map(t => t.trim()).filter(t => t);
}

const form = ref({
  title: '',
  description: '',
  priority: 'medium' as 'low' | 'medium' | 'high',
  dueDate: '',
  category: '',
  tags: [] as string[]
});

const newTag = ref('');
const validationError = ref('');

watch(() => props.task, (newTask) => {
  if (newTask && newTask.title) {
    const taskDueDate = newTask.due_date || newTask.dueDate;
    const dueDateStr = taskDueDate ? (typeof taskDueDate === 'string' ? taskDueDate.split('T')[0] : '') : '';
    
    const taskCategory = (newTask as any).category || (newTask as any).categoryId?.toString() || '';
    
    form.value = {
      title: newTask.title,
      description: newTask.description || '',
      priority: newTask.priority || 'medium',
      dueDate: dueDateStr,
      category: taskCategory,
      tags: parseTagsArray(newTask.tags)
    };
  } else {
    resetForm();
  }
}, { immediate: true });

// Reset form when modal closes
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    resetForm();
  }
});

function resetForm() {
  form.value = {
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    category: '',
    tags: []
  };
  validationError.value = '';
}

function addTag() {
  if (newTag.value.trim() && !form.value.tags.includes(newTag.value.trim())) {
    form.value.tags = [...form.value.tags, newTag.value.trim()];
    newTag.value = '';
  }
}

function removeTag(tagToRemove: string) {
  form.value.tags = form.value.tags.filter(tag => tag !== tagToRemove);
}

function handleSubmit() {
  if (!form.value.title.trim()) {
    validationError.value = 'El título es obligatorio';
    return;
  }
  validationError.value = '';

  const taskData = {
    title: form.value.title,
    description: form.value.description,
    priority: form.value.priority,
    due_date: form.value.dueDate || undefined,
    category: form.value.category || undefined,
    tags: form.value.tags
  };

  emit('saved', taskData);
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
    <div class="absolute inset-0 bg-black/50" @click="emit('close')"></div>

    <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Target class="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ task ? 'Editar Tarea' : 'Nueva Tarea' }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ task ? 'Actualiza los detalles de la tarea' : 'Crea una nueva tarea' }}
            </p>
          </div>
        </div>
        <button @click="$emit('close')" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all">
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Content -->
      <form @submit.prevent="handleSubmit" id="task-form" class="p-4 sm:p-6 flex-1 overflow-y-auto space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Título *
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:bg-white dark:focus:bg-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            placeholder="Título de la tarea"
          />
        </div>
        <div v-if="validationError" class="mt-1 text-sm text-red-500 dark:text-red-400">
          {{ validationError }}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción
          </label>
          <textarea
            v-model="form.description"
            rows="4"
            class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:bg-white dark:focus:bg-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            placeholder="Descripción opcional de la tarea"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Flag class="h-4 w-4 inline mr-1" />
              Prioridad
            </label>
            <select
              v-model="form.priority"
              class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-xl text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar class="h-4 w-4 inline mr-1" />
              Fecha Límite
            </label>
            <input
              v-model="form.dueDate"
              type="date"
              class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-xl text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Categoría
          </label>
          <select
            v-model="form.category"
            class="w-full px-4 py-3 pr-10 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-xl text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 appearance-none bg-no-repeat bg-[length:16px_16px] bg-[right_12px_center]"
            style="background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E&quot;);"
          >
            <option value="">Sin categoría</option>
            <option v-for="cat in taskCategories" :key="cat.name" :value="cat.name">
              {{ cat.icon }} {{ cat.name }}
            </option>
            <option v-if="form.category && !taskCategories.some(c => c.name === form.category)" :value="form.category">
              📁 {{ form.category }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Hash class="h-4 w-4 inline mr-1" />
            Etiquetas
          </label>
          <div class="flex flex-wrap gap-2 mb-2">
            <span
              v-for="tag in form.tags"
              :key="tag"
              class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm"
            >
              {{ tag }}
              <button @click="removeTag(tag)" class="ml-1 hover:text-blue-800">
                <Trash2 class="h-3 w-3 inline" />
              </button>
            </span>
          </div>
          <div class="flex space-x-2">
            <input
              v-model="newTag"
              type="text"
              @keyup.enter="addTag"
              class="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:bg-white dark:focus:bg-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              placeholder="Agregar etiqueta..."
            />
            <button
              @click="addTag"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 transition-all"
            >
              <Plus class="h-5 w-5" />
            </button>
          </div>
        </div>
      </form>

      <!-- Footer -->
      <div class="flex items-center justify-end space-x-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
        <button
          type="button"
          @click="$emit('close')"
          class="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
        >
          Cancelar
        </button>
        <button
          form="task-form"
          @click="handleSubmit"
          :disabled="loading"
          class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles v-if="!loading" class="h-5 w-5" />
          <svg v-else class="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span>{{ loading ? 'Guardando...' : (task ? 'Guardar Cambios' : 'Crear Tarea') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>