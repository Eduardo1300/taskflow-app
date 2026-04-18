<script setup lang="ts">
import { Clock, Star, Trash2, Edit, Check } from 'lucide-vue-next';
import type { Task } from '@/types';

const props = defineProps<{
  task: Task;
}>();

const emit = defineEmits(['toggle', 'edit', 'delete', 'favorite']);

const priorityColors = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  medium: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
};

const priorityLabels = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta'
};
</script>

<template>
  <div
    :class="[
      'p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer',
      task.completed && 'opacity-60'
    ]"
    @click="emit('edit', task)"
  >
    <div class="flex items-start space-x-4">
      <!-- Checkbox -->
      <button
        @click.stop="emit('toggle')"
        :class="[
          'mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0',
          task.completed
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
        ]"
      >
        <Check v-if="task.completed" class="h-4 w-4" />
      </button>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-2 mb-1 flex-wrap">
          <h3
            :class="[
              'font-medium text-gray-900 dark:text-white',
              task.completed && 'line-through text-gray-500'
            ]"
          >
            {{ task.title }}
          </h3>
          <span
            v-if="task.priority"
            :class="['px-2 py-0.5 rounded-full text-xs font-medium', priorityColors[task.priority]]"
          >
            {{ priorityLabels[task.priority] }}
          </span>
        </div>
        <p v-if="task.description" class="text-sm text-gray-500 dark:text-gray-400 truncate">
          {{ task.description }}
        </p>
        <div class="flex items-center space-x-4 mt-2 text-sm text-gray-400">
          <span v-if="task.dueDate" class="flex items-center space-x-1">
            <Clock class="h-4 w-4" />
            <span>{{ task.dueDate }}</span>
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center space-x-1 flex-shrink-0">
        <button
          @click.stop="emit('favorite')"
          :class="['p-2 rounded-lg transition-all', task.favorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500']"
        >
          <Star class="h-5 w-5" :fill="task.favorite ? 'currentColor' : 'none'" />
        </button>
        <button
          @click.stop="emit('edit', task)"
          class="p-2 text-gray-400 hover:text-blue-500 rounded-lg transition-all"
        >
          <Edit class="h-5 w-5" />
        </button>
        <button
          @click.stop="emit('delete')"
          class="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-all"
        >
          <Trash2 class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>