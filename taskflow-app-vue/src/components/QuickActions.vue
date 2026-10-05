<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTaskStore } from '@/stores/tasks';
import { useAuthStore } from '@/stores/auth';
import { 
  Plus, Zap, Filter, Search, Download, Star, Clock, AlertTriangle, 
  CheckCircle, Keyboard, X, History, Save
} from 'lucide-vue-next';

const router = useRouter();
const taskStore = useTaskStore();
const authStore = useAuthStore();

const props = defineProps<{
  onCreateTask: () => void;
  onCreateHighPriorityTask: () => void;
  onFilterPending: () => void;
  onFilterCompleted: () => void;
  onFilterHighPriority: () => void;
  onSearchFocus: () => void;
  onExportTasks: () => void;
  className?: string;
}>();

const isExpanded = ref(false);
const showShortcuts = ref(false);
const recentActions = ref<string[]>([]);

const quickActions = [
  {
    id: 'create-task',
    title: 'Nueva Tarea',
    description: 'Crear una nueva tarea rápidamente',
    icon: Plus,
    shortcut: 'Ctrl+N',
    action: props.onCreateTask,
    category: 'create'
  },
  {
    id: 'create-urgent',
    title: 'Tarea Urgente',
    description: 'Crear tarea de alta prioridad',
    icon: AlertTriangle,
    shortcut: 'Ctrl+Shift+N',
    action: props.onCreateHighPriorityTask,
    category: 'create'
  },
  {
    id: 'search-tasks',
    title: 'Buscar',
    description: 'Buscar en todas las tareas',
    icon: Search,
    shortcut: 'Ctrl+K',
    action: props.onSearchFocus,
    category: 'view'
  },
  {
    id: 'filter-pending',
    title: 'Ver Pendientes',
    description: 'Mostrar solo tareas pendientes',
    icon: Clock,
    shortcut: 'Ctrl+1',
    action: props.onFilterPending,
    category: 'filter'
  },
  {
    id: 'filter-completed',
    title: 'Ver Completadas',
    description: 'Mostrar solo tareas completadas',
    icon: CheckCircle,
    shortcut: 'Ctrl+2',
    action: props.onFilterCompleted,
    category: 'filter'
  },
  {
    id: 'filter-priority',
    title: 'Alta Prioridad',
    description: 'Mostrar tareas de alta prioridad',
    icon: Star,
    shortcut: 'Ctrl+3',
    action: props.onFilterHighPriority,
    category: 'filter'
  },
  {
    id: 'export-tasks',
    title: 'Exportar',
    description: 'Exportar tareas a PDF o CSV',
    icon: Download,
    shortcut: 'Ctrl+E',
    action: props.onExportTasks,
    category: 'export'
  }
];

const categories = [
  { id: 'create', title: 'Crear', icon: Plus },
  { id: 'filter', title: 'Filtrar', icon: Filter },
  { id: 'view', title: 'Ver', icon: Search },
  { id: 'export', title: 'Exportar', icon: Download }
];

function addToRecentActions(actionId: string) {
  recentActions.value = [actionId, ...recentActions.value.filter(id => id !== actionId)].slice(0, 3);
}

function removeRecentAction(actionId: string, e: Event) {
  e.stopPropagation();
  recentActions.value = recentActions.value.filter(id => id !== actionId);
}

function executeAction(action: any) {
  action.action();
  addToRecentActions(action.id);
}

function getRecentActions() {
  return recentActions.value
    .map(id => quickActions.find(a => a.id === id))
    .filter(Boolean);
}

function getCategoryActions(category: string) {
  return quickActions.filter(a => a.category === category);
}

// Keyboard shortcuts
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 'n':
        if (event.shiftKey) {
          event.preventDefault();
          props.onCreateHighPriorityTask();
          addToRecentActions('create-urgent');
        } else {
          event.preventDefault();
          props.onCreateTask();
          addToRecentActions('create-task');
        }
        break;
      case 'k':
        event.preventDefault();
        props.onSearchFocus();
        addToRecentActions('search-tasks');
        break;
      case '1':
        event.preventDefault();
        props.onFilterPending();
        addToRecentActions('filter-pending');
        break;
      case '2':
        event.preventDefault();
        props.onFilterCompleted();
        addToRecentActions('filter-completed');
        break;
      case '3':
        event.preventDefault();
        props.onFilterHighPriority();
        addToRecentActions('filter-priority');
        break;
      case 'e':
        event.preventDefault();
        props.onExportTasks();
        addToRecentActions('export-tasks');
        break;
      case '?':
        event.preventDefault();
        showShortcuts.value = true;
        break;
    }
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="relative">
    <!-- Quick Actions Button -->
    <button
      @click="isExpanded = !isExpanded"
      class="flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
    >
      <Zap class="h-5 w-5 mr-2" />
      Acciones Rápidas
      <span class="ml-2 px-2.5 py-0.5 bg-white/20 rounded-lg text-xs font-medium">?</span>
    </button>

    <!-- Expanded Actions Panel -->
    <div v-if="isExpanded" class="fixed inset-0 z-[9999]" @click="isExpanded = false">
      <div 
        class="absolute top-full right-0 mt-3 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-[10000] overflow-hidden animate-fade-in-up"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-xl">
              <Zap class="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Acciones Rápidas</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">Accede rápidamente a las funciones más usadas</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="showShortcuts = true"
              class="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
              title="Ver atajos de teclado"
            >
              <Keyboard class="h-5 w-5" />
            </button>
            <button
              @click="isExpanded = false"
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
            >
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>

        <div class="p-4 max-h-96 overflow-y-auto">
          <!-- Recent Actions -->
          <div v-if="recentActions.length > 0" class="mb-5">
            <h4 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Recientes</h4>
            <div class="space-y-2">
              <button
                v-for="action in getRecentActions()"
                :key="'recent-' + action.id"
                @click="() => { executeAction(action); isExpanded = false; }"
                class="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 text-indigo-700 dark:text-indigo-300 transition-all duration-200 group"
              >
                <div class="flex items-center space-x-3">
                  <div class="p-2 bg-indigo-100 dark:bg-indigo-800/60 rounded-lg group-hover:scale-110 transition-transform">
                    <component :is="action.icon" class="h-4 w-4" />
                  </div>
                  <div class="text-left">
                    <div class="font-semibold">{{ action.title }}</div>
                    <div class="text-xs text-indigo-600/70 dark:text-indigo-400/70">{{ action.description }}</div>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span v-if="action.shortcut" class="text-xs bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-lg shadow-sm border border-indigo-200 dark:border-indigo-700">{{ action.shortcut }}</span>
                  <button
                    @click="(e) => removeRecentAction(action.id, e)"
                    class="p-1.5 hover:bg-indigo-200 dark:hover:bg-indigo-700 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Quitar de recientes"
                  >
                    <X class="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                  </button>
                </div>
              </button>
            </div>
          </div>

          <!-- Actions by Category -->
          <div v-for="category in categories" :key="category.id" class="mb-5 last:mb-0">
            <h4 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center">
              <component :is="category.icon" class="h-4 w-4" />
              <span class="ml-2">{{ category.title }}</span>
            </h4>
            <div class="space-y-2">
              <button
                v-for="action in getCategoryActions(category.id)"
                :key="action.id"
                @click="() => { executeAction(action); isExpanded = false; }"
                class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
              >
                <div class="flex items-center space-x-3">
                  <div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 group-hover:scale-110 transition-all">
                    <component :is="action.icon" class="h-4 w-4" />
                  </div>
                  <div class="text-left">
                    <div class="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ action.title }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">{{ action.description }}</div>
                  </div>
                </div>
                <span v-if="action.shortcut" class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-lg">{{ action.shortcut }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <p class="text-xs text-center text-gray-500 dark:text-gray-400">
            Presiona <kbd class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-gray-700 dark:text-gray-300 font-mono text-xs">?</kbd> para ver todos los atajos
          </p>
        </div>
      </div>
    </div>

    <!-- Shortcuts Modal -->
    <div v-if="showShortcuts" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div class="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Atajos de Teclado</h3>
          <button
            @click="showShortcuts = false"
            class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        <div class="p-5 space-y-3">
          <div 
            v-for="action in quickActions.filter(a => a.shortcut)" 
            :key="action.id" 
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
          >
            <div class="flex items-center space-x-3">
              <div class="p-1.5 bg-white dark:bg-gray-600 rounded-lg shadow-sm">
                <component :is="action.icon" class="h-4 w-4" />
              </div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ action.title }}</span>
            </div>
            <kbd class="px-2.5 py-1 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-mono rounded-lg shadow-sm border border-gray-200 dark:border-gray-500">{{ action.shortcut }}</kbd>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>