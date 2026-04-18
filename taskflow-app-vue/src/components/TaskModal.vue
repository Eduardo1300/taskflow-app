<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { Task, Category } from '@/types';
import {
  X, Flag, FileText, Target, AlertTriangle, CheckCircle,
  Plus, Hash, Paperclip, MessageSquare, Clock, Trash2, Calendar,
  Sparkles, Send
} from 'lucide-vue-next';

const props = defineProps<{
  task: Task | null;
  categories: Category[];
}>();

const emit = defineEmits(['close', 'save']);

const taskCategories = [
  { name: 'Trabajo', icon: '💼' },
  { name: 'Personal', icon: '🏠' },
  { name: 'Estudio', icon: '📚' },
  { name: 'Salud', icon: '⚕️' },
  { name: 'Compras', icon: '🛒' },
  { name: 'Viajes', icon: '✈️' },
];

const activeTab = ref<'details' | 'attachments' | 'activity'>('details');

const form = ref({
  title: '',
  description: '',
  priority: 'medium' as 'low' | 'medium' | 'high',
  dueDate: '',
  category: '',
  tags: [] as string[]
});

const newTag = ref('');

const activity = ref<{ id: string; action: string; details: string; created_at: string; user_name: string }[]>([]);

watch(() => props.task, (newTask) => {
  if (newTask) {
    let taskTags: string[] = [];
    if (newTask.tags) {
      if (Array.isArray(newTask.tags)) {
        taskTags = newTask.tags;
      } else if (typeof newTask.tags === 'string') {
        taskTags = newTask.tags.split(',').filter((t: string) => t.trim());
      }
    }

    form.value = {
      title: newTask.title,
      description: newTask.description || '',
      priority: newTask.priority || 'medium',
      dueDate: newTask.dueDate || '',
      category: newTask.categoryId?.toString() || '',
      tags: taskTags
    };
    addActivity('Tarea abierta', `Se abrió la tarea "${newTask.title}"`);
  } else {
    resetForm();
  }
}, { immediate: true });

function resetForm() {
  form.value = {
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    category: '',
    tags: []
  };
  activity.value = [];
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

function addActivity(action: string, details: string) {
  activity.value.unshift({
    id: Date.now().toString(),
    action,
    details,
    created_at: new Date().toISOString(),
    user_name: 'Tú'
  });
}

function handleSubmit() {
  if (!form.value.title.trim()) return;

  const taskData = {
    title: form.value.title,
    description: form.value.description,
    priority: form.value.priority,
    dueDate: form.value.dueDate,
    categoryId: form.value.category ? parseInt(form.value.category) : undefined,
    tags: form.value.tags
  };

  addActivity(props.task ? 'Tarea actualizada' : 'Tarea creada',
    props.task ? `Se actualizó la tarea "${form.value.title}"` : `Se creó la tarea "${form.value.title}"`);

  emit('save', taskData);
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
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/50" @click="emit('close')"></div>

    <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
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
        <button @click="emit('close')" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all">
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex space-x-1 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
        <button
          @click="activeTab = 'details'"
          :class="[
            'px-4 py-2 rounded-xl font-medium text-sm transition-all',
            activeTab === 'details'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
        >
          <FileText class="h-4 w-4 inline mr-2" />
          Detalles
        </button>
        <button
          @click="activeTab = 'attachments'"
          :class="[
            'px-4 py-2 rounded-xl font-medium text-sm transition-all',
            activeTab === 'attachments'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
        >
          <Paperclip class="h-4 w-4 inline mr-2" />
          Adjuntos
        </button>
        <button
          @click="activeTab = 'activity'"
          :class="[
            'px-4 py-2 rounded-xl font-medium text-sm transition-all',
            activeTab === 'activity'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
        >
          <MessageSquare class="h-4 w-4 inline mr-2" />
          Actividad
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 max-h-[60vh] overflow-y-auto">
        <!-- Details Tab -->
        <div v-if="activeTab === 'details'" class="space-y-6">
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
              class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-xl text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            >
              <option value="">Sin categoría</option>
              <option v-for="cat in taskCategories" :key="cat.name" :value="cat.name">
                {{ cat.icon }} {{ cat.name }}
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
        </div>

        <!-- Attachments Tab -->
        <div v-else-if="activeTab === 'attachments'" class="space-y-4">
          <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
            <Paperclip class="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 dark:text-gray-400 mb-2">
              Arrastra archivos aquí o haz clic para subir
            </p>
            <p class="text-sm text-gray-400 dark:text-gray-500">
              Soporta: PDF, imágenes, documentos (max 10MB)
            </p>
          </div>
        </div>

        <!-- Activity Tab -->
        <div v-else class="space-y-4 max-h-64 overflow-y-auto">
          <div
            v-for="item in activity"
            :key="item.id"
            class="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
          >
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              {{ item.user_name.charAt(0) }}
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ item.action }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ item.details }}
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {{ formatDate(item.created_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <button
          type="button"
          @click="emit('close')"
          class="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
        >
          Cancelar
        </button>
        <button
          @click="handleSubmit"
          class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2"
        >
          <Sparkles class="h-5 w-5" />
          <span>{{ task ? 'Guardar Cambios' : 'Crear Tarea' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>