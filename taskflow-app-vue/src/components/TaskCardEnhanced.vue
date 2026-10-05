<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { 
  CheckCircle2, Circle, Calendar, Trash2, Edit, Tag, AlertTriangle, 
  Clock, Star, MoreHorizontal
} from 'lucide-vue-next';
import type { Task } from '@/types';

const props = withDefaults(defineProps<{
  task: Task;
  isShared?: boolean;
  userPermission?: 'owner' | 'view' | 'edit' | 'admin';
}>(), {
  isShared: false,
  userPermission: 'owner'
});

const emit = defineEmits(['toggle', 'edit', 'delete', 'favorite']);

const isHovered = ref(false);
const isMenuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);
const menuButtonRef = ref<HTMLElement | null>(null);

const canEdit = computed(() => props.userPermission === 'owner' || props.userPermission === 'edit' || props.userPermission === 'admin');
const canDelete = computed(() => props.userPermission === 'owner' || props.userPermission === 'admin');

const priorityColors = computed(() => ({
  high: 'from-red-500 to-red-600',
  medium: 'from-yellow-500 to-orange-500',
  low: 'from-green-500 to-green-600'
}));

const isOverdue = computed(() => 
  props.task.due_date && new Date(props.task.due_date) < new Date() && !props.task.completed
);

const isDueSoon = computed(() => 
  props.task.due_date && !props.task.completed && 
  new Date(props.task.due_date).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000
);

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Hoy';
  if (days === 1) return 'Mañana';
  if (days === -1) return 'Ayer';
  if (days < 0) return `Vencida ${Math.abs(days)}d`;
  if (days <= 7) return `En ${days}d`;
  
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function getTagsArray(tags: string | string[] | undefined): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  return tags.split(',').filter(t => t.trim());
}

const tagsArray = computed(() => getTagsArray(props.task.tags));

// Close all other menus when this one opens
function openMenu() {
  // Dispatch event to close other menus
  window.dispatchEvent(new CustomEvent('close-task-menus', { detail: { excludeId: props.task.id } }));
  isMenuOpen.value = true;
  
  // Add click outside listener
  nextTick(() => {
    document.addEventListener('click', handleClickOutside as EventListener);
  });
}

function closeMenu() {
  isMenuOpen.value = false;
  document.removeEventListener('click', handleClickOutside as EventListener);
}

function handleClickOutside(event: MouseEvent) {
  const menu = menuRef.value;
  const button = menuButtonRef.value;
  
  if (menu && !menu.contains(event.target as Node) && 
      button && !button.contains(event.target as Node)) {
    closeMenu();
  }
}

function handleToggle() {
  emit('toggle', props.task.id);
}

function handleEdit() {
  emit('edit', props.task);
  closeMenu();
}

function handleFavorite() {
  emit('favorite', props.task.id);
  closeMenu();
}

function handleDelete() {
  emit('delete', props.task);
  closeMenu();
}
</script>

<template>
  <div
    class="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.01]"
    :class="[
      task.completed ? 'opacity-75' : '',
      isOverdue ? 'ring-2 ring-red-500/30 border-red-200 dark:border-red-800' : ''
    ]"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Priority Indicator -->
    <div 
      class="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl" 
      :style="{ backgroundImage: 'linear-gradient(to right, ' + priorityColors[task.priority || 'medium'] + ')' }"
    />

    <!-- Badges -->
    <div class="absolute top-3 right-3 flex items-center space-x-1">
      <div 
        v-if="isOverdue" 
        class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow-md flex items-center"
      >
        <Clock class="h-3 w-3 mr-1" />
        Vencida
      </div>
      <div 
        v-else-if="isDueSoon" 
        class="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full shadow-md flex items-center"
      >
        <AlertTriangle class="h-3 w-3 mr-1" />
        Urgente
      </div>
      <div 
        v-if="isShared" 
        class="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full shadow-md flex items-center"
      >
        <Users class="h-3 w-3 mr-1" />
        Compartida
      </div>
    </div>

    <div class="p-5 pt-7">
      <!-- Header -->
      <div class="flex items-start gap-4 mb-4">
        <!-- Checkbox -->
        <button
          @click="handleToggle"
          :class="[
            'flex-shrink-0 mt-0.5 transition-all duration-300 hover:scale-110',
            task.completed ? 'text-green-500' : 'text-gray-300 hover:text-green-500 dark:text-gray-600'
          ]"
        >
          <CheckCircle2 v-if="task.completed" class="h-6 w-6 drop-shadow-sm" />
          <Circle v-else class="h-6 w-6" />
        </button>

        <!-- Title and Description -->
        <div class="flex-1 min-w-0">
          <h3 
            class="text-lg font-bold text-gray-900 dark:text-white transition-all duration-200"
            :class="[
              task.completed ? 'line-through text-gray-400 dark:text-gray-500' : '',
              isHovered ? 'text-blue-600 dark:text-blue-400' : ''
            ]"
          >
            {{ task.title }}
          </h3>
          <p v-if="task.description" class="text-sm text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
            {{ task.description }}
          </p>
        </div>

        <!-- Actions Menu -->
        <div class="relative flex-shrink-0">
          <button
            ref="menuButtonRef"
            @click="openMenu"
            :class="[
              'p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200',
              isHovered || isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            ]"
            aria-label="Open menu"
          >
            <MoreHorizontal class="h-5 w-5" />
          </button>

          <div 
            ref="menuRef"
            v-if="isMenuOpen" 
            class="absolute right-0 top-10 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-[9999] animate-fade-in"
          >
            <button
              v-if="canEdit"
              @click="handleEdit"
              class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Edit class="h-4 w-4 mr-3 text-blue-500" />
              Editar
            </button>
            
            <button
              v-if="!canEdit"
              class="w-full flex items-center px-4 py-2.5 text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed"
            >
              <Edit class="h-4 w-4 mr-3" />
              Editar (solo lectura)
            </button>

            <button
              @click="handleFavorite"
              class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Star 
                class="h-4 w-4 mr-3" 
                :class="task.favorite ? 'text-yellow-500 fill-yellow-500' : 'text-yellow-500'" 
              />
              {{ task.favorite ? 'Quitar de favoritas' : 'Favorita' }}
            </button>

            <div v-if="canDelete" class="border-t border-gray-100 dark:border-gray-700 my-1" />
            <button
              v-if="canDelete"
              @click="handleDelete"
              class="w-full flex items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 class="h-4 w-4 mr-3" />
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Tags & Category -->
      <div v-if="tagsArray.length > 0 || task.category" class="flex flex-wrap gap-2 mb-4">
        <span 
          v-if="task.category" 
          class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700"
        >
          <div class="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
          {{ task.category }}
        </span>
        <span 
          v-for="(tag, index) in tagsArray.slice(0, 3)" 
          :key="index"
          class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
        >
          <Tag class="h-3 w-3 mr-1 text-gray-400" />
          {{ tag }}
        </span>
        <span v-if="tagsArray.length > 3" class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
          +{{ tagsArray.length - 3 }}
        </span>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
        <!-- Due Date & Priority -->
        <div class="flex items-center gap-3">
          <!-- Priority -->
          <div 
            class="flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold text-white shadow-sm"
            :class="[
              task.priority === 'high' ? 'bg-gradient-to-r from-red-500 to-red-600' :
              task.priority === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              'bg-gradient-to-r from-green-500 to-green-600'
            ]"
          >
            <AlertTriangle v-if="task.priority === 'high'" class="h-3 w-3 mr-1" />
            <Clock v-else-if="task.priority === 'medium'" class="h-3 w-3 mr-1" />
            <CheckCircle2 v-else class="h-3 w-3 mr-1" />
            <span class="capitalize">{{ task.priority || 'media' }}</span>
          </div>

          <!-- Due Date -->
          <div 
            v-if="task.due_date" 
            :class="[
              'flex items-center text-xs font-medium px-2 py-1 rounded-lg',
              isOverdue ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' : 
              isDueSoon ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 
              'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50'
            ]"
          >
            <Calendar class="h-3.5 w-3.5 mr-1.5" />
            {{ formatDate(task.due_date) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>