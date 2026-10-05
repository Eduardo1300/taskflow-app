<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Search, X, Filter, Save, History, ChevronDown, ChevronUp } from 'lucide-vue-next';

interface Task {
  id: number;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  completed: boolean;
  priority?: string;
  due_date?: string;
  is_shared?: boolean;
  collaborators?: any[];
  created_at?: string;
}

interface SearchFilters {
  status: 'all' | 'pending' | 'completed';
  priority: 'all' | 'high' | 'medium' | 'low';
  category: string;
  tags: string[];
  dateRange: { start?: Date; end?: Date };
  hasDescription: boolean;
  isShared: boolean;
}

interface SavedFilter {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  createdAt: Date;
}

const props = defineProps<{
  tasks: Task[];
  onFilteredResults: (results: Task[]) => void;
  className?: string;
  initialQuery?: string;
}>();

const emit = defineEmits(['filtered-results']);

const query = ref(props.initialQuery || '');
const isExpanded = ref(!!props.initialQuery);
const suggestions = ref<string[]>([]);
const searchHistory = ref<string[]>([]);
const savedFilters = ref<SavedFilter[]>([]);
const showSaveDialog = ref(false);
const saveFilterName = ref('');
const filters = ref<SearchFilters>({
  status: 'all',
  priority: 'all',
  category: '',
  tags: [],
  dateRange: {},
  hasDescription: false,
  isShared: false
});

const searchInputRef = ref<HTMLInputElement | null>(null);

function getTagsArray(tags: string | string[] | undefined): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  return tags.split(',').filter(t => t.trim());
}

onMounted(() => {
  const savedHistory = localStorage.getItem('taskflow-search-history');
  if (savedHistory) {
    searchHistory.value = JSON.parse(savedHistory);
  }

  const savedFiltersList = localStorage.getItem('taskflow-saved-filters');
  if (savedFiltersList) {
    savedFilters.value = JSON.parse(savedFiltersList).map((f: any) => ({
      ...f,
      createdAt: new Date(f.createdAt),
      filters: {
        ...f.filters,
        dateRange: {
          start: f.filters.dateRange.start ? new Date(f.filters.dateRange.start) : undefined,
          end: f.filters.dateRange.end ? new Date(f.filters.dateRange.end) : undefined
        }
      }
    }));
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      searchInputRef.value?.focus();
      isExpanded.value = true;
    }
  };
  document.addEventListener('keydown', handleKeyDown);
  
  // Cleanup
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });
});

const performSearch = () => {
  let filtered = [...props.tasks];

  if (query.value.trim()) {
    const searchTerms = query.value.toLowerCase().trim().split(/\s+/);
    filtered = filtered.filter(task => {
      const searchableText = [
        task.title,
        task.description || '',
        task.category || '',
        ...getTagsArray(task.tags)
      ].join(' ').toLowerCase();

      return searchTerms.every(term => {
        if (term.startsWith('#')) {
          const tagName = term.slice(1);
          return getTagsArray(task.tags).some((tag: string) => tag.toLowerCase().includes(tagName));
        } else if (term.includes(':')) {
          const [field, value] = term.split(':');
          switch (field) {
            case 'categoria':
            case 'category':
              return task.category?.toLowerCase().includes(value.toLowerCase());
            case 'prioridad':
            case 'priority':
              return task.priority?.toLowerCase() === value.toLowerCase();
            case 'estado':
            case 'status':
              return value === 'completada' ? task.completed : !task.completed;
            default:
              return searchableText.includes(term);
          }
        } else {
          return searchableText.includes(term);
        }
      });
    });
  }

  if (filters.value.status !== 'all') {
    const isCompleted = filters.value.status === 'completed';
    filtered = filtered.filter(task => task.completed === isCompleted);
  }

  if (filters.value.priority !== 'all') {
    filtered = filtered.filter(task => task.priority === filters.value.priority);
  }

  if (filters.value.category) {
    filtered = filtered.filter(task => 
      task.category?.toLowerCase().includes(filters.value.category.toLowerCase())
    );
  }

  if (filters.value.tags.length > 0) {
    filtered = filtered.filter(task => 
      filters.value.tags.every(tag => 
        getTagsArray(task.tags).some((taskTag: string) => taskTag.toLowerCase().includes(tag.toLowerCase()))
      )
    );
  }

  if (filters.value.hasDescription) {
    filtered = filtered.filter(task => task.description && task.description.trim());
  }

  if (filters.value.isShared) {
    filtered = filtered.filter(task => task.is_shared || (task.collaborators && task.collaborators.length > 0));
  }

  if (filters.value.dateRange.start) {
    filtered = filtered.filter(task => 
      task.due_date && new Date(task.due_date) >= filters.value.dateRange.start!
    );
  }

  if (filters.value.dateRange.end) {
    filtered = filtered.filter(task => 
      task.due_date && new Date(task.due_date) <= filters.value.dateRange.end!
    );
  }

  emit('filtered-results', filtered);
  props.onFilteredResults(filtered);
};

watch(() => [query.value, filters.value, props.tasks], performSearch, { deep: true });

const generateSuggestions = () => {
  if (!query.value.trim()) {
    suggestions.value = [];
    return;
  }

  const searchTerms = new Set<string>();
  
  props.tasks.forEach(task => {
    task.title.toLowerCase().split(/\s+/).forEach((word: string) => {
      if (word.length > 2 && word.includes(query.value.toLowerCase())) {
        searchTerms.add(task.title);
      }
    });
    
    if (task.description) {
      task.description.toLowerCase().split(/\s+/).forEach((word: string) => {
        if (word.length > 2 && word.includes(query.value.toLowerCase())) {
          searchTerms.add(task.description);
        }
      });
    }
    
    getTagsArray(task.tags).forEach((tag: string) => {
      if (tag.toLowerCase().includes(query.value.toLowerCase())) {
        searchTerms.add(`#${tag}`);
      }
    });
    
    if (task.category && task.category.toLowerCase().includes(query.value.toLowerCase())) {
      searchTerms.add(`categoria:${task.category}`);
    }
  });

  searchHistory.value.forEach(historyItem => {
    if (historyItem.toLowerCase().includes(query.value.toLowerCase())) {
      searchTerms.add(historyItem);
    }
  });

  suggestions.value = Array.from(searchTerms).slice(0, 8);
};

watch(() => query.value, () => {
  if (query.value.length > 0) generateSuggestions();
  else suggestions.value = [];
});

const handleSearch = (searchQuery: string) => {
  query.value = searchQuery;
  
  if (searchQuery.trim() && !searchHistory.value.includes(searchQuery)) {
    const newHistory = [searchQuery, ...searchHistory.value.slice(0, 9)];
    searchHistory.value = newHistory;
    localStorage.setItem('taskflow-search-history', JSON.stringify(newHistory));
  }
  
  suggestions.value = [];
};

const clearSearch = () => {
  query.value = '';
  filters.value = {
    status: 'all',
    priority: 'all',
    category: '',
    tags: [],
    dateRange: {},
    hasDescription: false,
    isShared: false
  };
};

const saveCurrentFilter = () => {
  if (!saveFilterName.value.trim()) return;

  const newFilter: SavedFilter = {
    id: Date.now().toString(),
    name: saveFilterName.value,
    query: query.value,
    filters: { ...filters.value },
    createdAt: new Date()
  };

  const updatedFilters = [newFilter, ...savedFilters.value.slice(0, 9)];
  savedFilters.value = updatedFilters;
  localStorage.setItem('taskflow-saved-filters', JSON.stringify(updatedFilters));
  
  saveFilterName.value = '';
  showSaveDialog.value = false;
};

const loadSavedFilter = (savedFilter: SavedFilter) => {
  query.value = savedFilter.query;
  filters.value = savedFilter.filters;
  isExpanded.value = false;
};

const deleteSavedFilter = (filterId: string) => {
  const updatedFilters = savedFilters.value.filter(f => f.id !== filterId);
  savedFilters.value = updatedFilters;
  localStorage.setItem('taskflow-saved-filters', JSON.stringify(updatedFilters));
};

const uniqueCategories = computed(() => {
  return Array.from(new Set(props.tasks.map(task => task.category).filter(Boolean)));
});

const uniqueTags = computed(() => {
  const allTags = props.tasks.flatMap(task => getTagsArray(task.tags));
  return Array.from(new Set(allTags));
});

const hasActiveFilters = computed(() => {
  return filters.value.status !== 'all' ||
         filters.value.priority !== 'all' ||
         filters.value.category ||
         filters.value.tags.length > 0 ||
         filters.value.dateRange.start ||
         filters.value.dateRange.end ||
         filters.value.hasDescription ||
         filters.value.isShared;
});
</script>

<template>
  <div class="relative">
    <!-- Search Input -->
    <div class="relative">
      <input
        ref="searchInputRef"
        type="text"
        placeholder="Buscar tareas... (Ctrl+K)"
        v-model="query"
        @focus="isExpanded = true"
        class="w-full pl-10 pr-20 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
      />
      
      <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      
      <div class="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
        <button
          @click="isExpanded = !isExpanded"
          :class="[
            'p-1 rounded transition-colors',
            hasActiveFilters 
              ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' 
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          ]"
          title="Filtros avanzados"
        >
          <Filter class="h-4 w-4" />
        </button>
        
        <button
          v-if="query || hasActiveFilters"
          @click="clearSearch"
          class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Limpiar búsqueda"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Suggestions Dropdown -->
    <div v-if="suggestions.length > 0 && isExpanded" class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-60 overflow-y-auto">
      <div class="p-2">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sugerencias</h4>
        <button
          v-for="(suggestion, index) in suggestions"
          :key="index"
          @click="() => { handleSearch(suggestion); isExpanded = false; }"
          class="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-sm"
        >
          <Search class="h-3 w-3 inline mr-2 text-gray-400" />
          {{ suggestion }}
        </button>
      </div>
    </div>

    <!-- Advanced Filters Panel -->
    <div v-if="isExpanded">
      <div class="fixed inset-0 z-40" @click="isExpanded = false" />
      <div class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
        <div class="p-6">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Búsqueda Avanzada</h3>
            <div class="flex items-center space-x-2">
              <button
                @click="showSaveDialog = true"
                class="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Guardar filtro"
              >
                <Save class="h-4 w-4" />
              </button>
              <button
                @click="isExpanded = false"
                class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Search History -->
          <div v-if="searchHistory.length > 0" class="mb-6">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <History class="h-4 w-4 mr-1" />
              Búsquedas Recientes
            </h4>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="(historyItem, index) in searchHistory.slice(0, 5)"
                :key="index"
                @click="() => { handleSearch(historyItem); isExpanded = false; }"
                class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {{ historyItem }}
              </button>
            </div>
          </div>

          <!-- Saved Filters -->
          <div v-if="savedFilters.length > 0" class="mb-6">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filtros Guardados</h4>
            <div class="space-y-2">
              <div
                v-for="savedFilter in savedFilters.slice(0, 3)"
                :key="savedFilter.id"
                class="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
              >
                <button
                  @click="() => loadSavedFilter(savedFilter)"
                  class="flex-1 text-left text-sm text-blue-700 dark:text-blue-300 hover:underline"
                >
                  {{ savedFilter.name }}
                </button>
                <button
                  @click="() => deleteSavedFilter(savedFilter.id)"
                  class="p-1 text-blue-400 hover:text-red-600 transition-colors"
                >
                  <X class="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          <!-- Filters -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado</label>
              <select
                v-model="filters.status"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todas</option>
                <option value="pending">Pendientes</option>
                <option value="completed">Completadas</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prioridad</label>
              <select
                v-model="filters.priority"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todas</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categoría</label>
              <select
                v-model="filters.category"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todas las categorías</option>
                <option v-for="cat in uniqueCategories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Etiquetas</label>
              <div class="max-h-20 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                <label v-for="tag in uniqueTags" :key="tag" class="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    :checked="filters.tags.includes(tag)"
                    @change="() => { if ($event.target.checked) filters.tags.push(tag); else filters.tags = filters.tags.filter(t => t !== tag); }"
                    class="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span class="text-gray-700 dark:text-gray-300">#{{ tag }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Additional Options -->
          <div class="mt-4 space-y-2">
            <label class="flex items-center space-x-2">
              <input
                type="checkbox"
                v-model="filters.hasDescription"
                class="rounded text-blue-600 focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">Solo tareas con descripción</span>
            </label>

            <label class="flex items-center space-x-2">
              <input
                type="checkbox"
                v-model="filters.isShared"
                class="rounded text-blue-600 focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">Solo tareas compartidas</span>
            </label>
          </div>

          <!-- Actions -->
          <div class="flex justify-between mt-6">
            <button
              @click="clearSearch"
              class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Limpiar todo
            </button>
            <button
              @click="isExpanded = false"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Filter Dialog -->
    <div v-if="showSaveDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Guardar Filtro</h3>
        
        <input
          type="text"
          placeholder="Nombre del filtro..."
          v-model="saveFilterName"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
        />
        
        <div class="flex justify-end space-x-3">
          <button
            @click="() => { showSaveDialog = false; saveFilterName = ''; }"
            class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="saveCurrentFilter"
            :disabled="!saveFilterName.trim()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>