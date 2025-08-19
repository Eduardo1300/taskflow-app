import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Filter,
  Save,
  History
} from 'lucide-react';

interface SmartSearchProps {
  tasks: any[];
  onFilteredResults: (results: any[]) => void;
  className?: string;
}

interface SavedFilter {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  createdAt: Date;
}

interface SearchFilters {
  status: 'all' | 'pending' | 'completed';
  priority: 'all' | 'high' | 'medium' | 'low';
  category: string;
  tags: string[];
  dateRange: {
    start?: Date;
    end?: Date;
  };
  hasDescription: boolean;
  isShared: boolean;
}

const SmartSearch: React.FC<SmartSearchProps> = ({ 
  tasks, 
  onFilteredResults, 
  className 
}) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    status: 'all',
    priority: 'all',
    category: '',
    tags: [],
    dateRange: {},
    hasDescription: false,
    isShared: false
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load saved data from localStorage
    const savedHistory = localStorage.getItem('taskflow-search-history');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }

    const savedFiltersList = localStorage.getItem('taskflow-saved-filters');
    if (savedFiltersList) {
      setSavedFilters(JSON.parse(savedFiltersList).map((f: any) => ({
        ...f,
        createdAt: new Date(f.createdAt),
        filters: {
          ...f.filters,
          dateRange: {
            start: f.filters.dateRange.start ? new Date(f.filters.dateRange.start) : undefined,
            end: f.filters.dateRange.end ? new Date(f.filters.dateRange.end) : undefined
          }
        }
      })));
    }
  }, []);

  useEffect(() => {
    performSearch();
  }, [query, filters, tasks]);

  useEffect(() => {
    if (query.length > 0) {
      generateSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [query, tasks]);

  const generateSuggestions = () => {
    const searchTerms = new Set<string>();
    
    // Extract keywords from tasks
    tasks.forEach(task => {
      // Title words
      task.title.toLowerCase().split(/\s+/).forEach((word: string) => {
        if (word.length > 2 && word.includes(query.toLowerCase())) {
          searchTerms.add(task.title);
        }
      });
      
      // Description words
      if (task.description) {
        task.description.toLowerCase().split(/\s+/).forEach((word: string) => {
          if (word.length > 2 && word.includes(query.toLowerCase())) {
            searchTerms.add(task.description);
          }
        });
      }
      
      // Tags
      if (task.tags) {
        task.tags.forEach((tag: string) => {
          if (tag.toLowerCase().includes(query.toLowerCase())) {
            searchTerms.add(`#${tag}`);
          }
        });
      }
      
      // Categories
      if (task.category && task.category.toLowerCase().includes(query.toLowerCase())) {
        searchTerms.add(`categoria:${task.category}`);
      }
    });

    // Add search history suggestions
    searchHistory.forEach(historyItem => {
      if (historyItem.toLowerCase().includes(query.toLowerCase())) {
        searchTerms.add(historyItem);
      }
    });

    setSuggestions(Array.from(searchTerms).slice(0, 8));
  };

  const performSearch = () => {
    let filtered = [...tasks];

    // Text search
    if (query.trim()) {
      const searchTerms = query.toLowerCase().trim().split(/\s+/);
      filtered = filtered.filter(task => {
        const searchableText = [
          task.title,
          task.description || '',
          task.category || '',
          ...(task.tags || [])
        ].join(' ').toLowerCase();

        return searchTerms.every(term => {
          if (term.startsWith('#')) {
            // Tag search
            const tagName = term.slice(1);
            return (task.tags || []).some((tag: string) => 
              tag.toLowerCase().includes(tagName)
            );
          } else if (term.includes(':')) {
            // Advanced search syntax
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

    // Apply filters
    if (filters.status !== 'all') {
      const isCompleted = filters.status === 'completed';
      filtered = filtered.filter(task => task.completed === isCompleted);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.category) {
      filtered = filtered.filter(task => 
        task.category?.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter(task => 
        filters.tags.every(tag => 
          (task.tags || []).some((taskTag: string) => 
            taskTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    if (filters.hasDescription) {
      filtered = filtered.filter(task => task.description && task.description.trim());
    }

    if (filters.isShared) {
      filtered = filtered.filter(task => task.is_shared || (task.collaborators && task.collaborators.length > 0));
    }

    if (filters.dateRange.start) {
      filtered = filtered.filter(task => 
        task.due_date && new Date(task.due_date) >= filters.dateRange.start!
      );
    }

    if (filters.dateRange.end) {
      filtered = filtered.filter(task => 
        task.due_date && new Date(task.due_date) <= filters.dateRange.end!
      );
    }

    onFilteredResults(filtered);
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    
    // Add to history
    if (searchQuery.trim() && !searchHistory.includes(searchQuery)) {
      const newHistory = [searchQuery, ...searchHistory.slice(0, 9)];
      setSearchHistory(newHistory);
      localStorage.setItem('taskflow-search-history', JSON.stringify(newHistory));
    }
    
    setSuggestions([]);
  };

  const clearSearch = () => {
    setQuery('');
    setFilters({
      status: 'all',
      priority: 'all',
      category: '',
      tags: [],
      dateRange: {},
      hasDescription: false,
      isShared: false
    });
  };

  const saveCurrentFilter = () => {
    if (!saveFilterName.trim()) return;

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: saveFilterName,
      query,
      filters: { ...filters },
      createdAt: new Date()
    };

    const updatedFilters = [newFilter, ...savedFilters.slice(0, 9)];
    setSavedFilters(updatedFilters);
    localStorage.setItem('taskflow-saved-filters', JSON.stringify(updatedFilters));
    
    setSaveFilterName('');
    setShowSaveDialog(false);
  };

  const loadSavedFilter = (savedFilter: SavedFilter) => {
    setQuery(savedFilter.query);
    setFilters(savedFilter.filters);
    setIsExpanded(false);
  };

  const deleteSavedFilter = (filterId: string) => {
    const updatedFilters = savedFilters.filter(f => f.id !== filterId);
    setSavedFilters(updatedFilters);
    localStorage.setItem('taskflow-saved-filters', JSON.stringify(updatedFilters));
  };

  // Focus search input when Ctrl+K is pressed
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
        setIsExpanded(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getUniqueCategories = () => {
    return Array.from(new Set(tasks.map(task => task.category).filter(Boolean)));
  };

  const getUniqueTags = () => {
    const allTags = tasks.flatMap(task => task.tags || []);
    return Array.from(new Set(allTags));
  };

  const hasActiveFilters = () => {
    return filters.status !== 'all' ||
           filters.priority !== 'all' ||
           filters.category ||
           filters.tags.length > 0 ||
           filters.dateRange.start ||
           filters.dateRange.end ||
           filters.hasDescription ||
           filters.isShared;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Buscar tareas... (Ctrl+K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          className="w-full pl-10 pr-20 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
        />
        
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1 rounded transition-colors ${
              hasActiveFilters() 
                ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            title="Filtros avanzados"
          >
            <Filter className="h-4 w-4" />
          </button>
          
          {(query || hasActiveFilters()) && (
            <button
              onClick={clearSearch}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-60 overflow-y-auto">
          <div className="p-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sugerencias
            </h4>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  handleSearch(suggestion);
                  setIsExpanded(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-sm"
              >
                <Search className="h-3 w-3 inline mr-2 text-gray-400" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {isExpanded && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsExpanded(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Búsqueda Avanzada
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Guardar filtro"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Search History */}
              {searchHistory.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <History className="h-4 w-4 mr-1" />
                    Búsquedas Recientes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.slice(0, 5).map((historyItem, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          handleSearch(historyItem);
                          setIsExpanded(false);
                        }}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {historyItem}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Saved Filters */}
              {savedFilters.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filtros Guardados
                  </h4>
                  <div className="space-y-2">
                    {savedFilters.slice(0, 3).map(savedFilter => (
                      <div
                        key={savedFilter.id}
                        className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                      >
                        <button
                          onClick={() => loadSavedFilter(savedFilter)}
                          className="flex-1 text-left text-sm text-blue-700 dark:text-blue-300 hover:underline"
                        >
                          {savedFilter.name}
                        </button>
                        <button
                          onClick={() => deleteSavedFilter(savedFilter.id)}
                          className="p-1 text-blue-400 hover:text-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">Todas</option>
                    <option value="pending">Pendientes</option>
                    <option value="completed">Completadas</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prioridad
                  </label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">Todas</option>
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoría
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Todas las categorías</option>
                    {getUniqueCategories().map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Etiquetas
                  </label>
                  <div className="max-h-20 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                    {getUniqueTags().map(tag => (
                      <label key={tag} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={filters.tags.includes(tag)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                            } else {
                              setFilters(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">#{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Options */}
              <div className="mt-4 space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.hasDescription}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasDescription: e.target.checked }))}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Solo tareas con descripción
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.isShared}
                    onChange={(e) => setFilters(prev => ({ ...prev, isShared: e.target.checked }))}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Solo tareas compartidas
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={clearSearch}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Limpiar todo
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Aplicar filtros
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Guardar Filtro
            </h3>
            
            <input
              type="text"
              placeholder="Nombre del filtro..."
              value={saveFilterName}
              onChange={(e) => setSaveFilterName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
            />
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveFilterName('');
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveCurrentFilter}
                disabled={!saveFilterName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
