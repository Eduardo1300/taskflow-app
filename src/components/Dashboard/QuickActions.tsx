import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Zap, 
  Filter,
  Search,
  Download,
  Star,
  Clock,
  AlertTriangle,
  CheckCircle,
  Keyboard,
  X
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category: 'create' | 'filter' | 'export' | 'view' | 'system';
}

interface QuickActionsProps {
  onCreateTask: () => void;
  onCreateHighPriorityTask: () => void;
  onFilterPending: () => void;
  onFilterCompleted: () => void;
  onFilterHighPriority: () => void;
  onSearchFocus: () => void;
  onExportTasks: () => void;
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onCreateTask,
  onCreateHighPriorityTask,
  onFilterPending,
  onFilterCompleted,
  onFilterHighPriority,
  onSearchFocus,
  onExportTasks,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [recentActions, setRecentActions] = useState<string[]>([]);

  const quickActions: QuickAction[] = [
    {
      id: 'create-task',
      title: 'Nueva Tarea',
      description: 'Crear una nueva tarea rápidamente',
      icon: <Plus className="h-4 w-4" />,
      shortcut: 'Ctrl+N',
      action: onCreateTask,
      category: 'create'
    },
    {
      id: 'create-urgent',
      title: 'Tarea Urgente',
      description: 'Crear tarea de alta prioridad',
      icon: <AlertTriangle className="h-4 w-4" />,
      shortcut: 'Ctrl+Shift+N',
      action: onCreateHighPriorityTask,
      category: 'create'
    },
    {
      id: 'search-tasks',
      title: 'Buscar',
      description: 'Buscar en todas las tareas',
      icon: <Search className="h-4 w-4" />,
      shortcut: 'Ctrl+K',
      action: onSearchFocus,
      category: 'view'
    },
    {
      id: 'filter-pending',
      title: 'Ver Pendientes',
      description: 'Mostrar solo tareas pendientes',
      icon: <Clock className="h-4 w-4" />,
      shortcut: 'Ctrl+1',
      action: onFilterPending,
      category: 'filter'
    },
    {
      id: 'filter-completed',
      title: 'Ver Completadas',
      description: 'Mostrar solo tareas completadas',
      icon: <CheckCircle className="h-4 w-4" />,
      shortcut: 'Ctrl+2',
      action: onFilterCompleted,
      category: 'filter'
    },
    {
      id: 'filter-priority',
      title: 'Alta Prioridad',
      description: 'Mostrar tareas de alta prioridad',
      icon: <Star className="h-4 w-4" />,
      shortcut: 'Ctrl+3',
      action: onFilterHighPriority,
      category: 'filter'
    },
    {
      id: 'export-tasks',
      title: 'Exportar',
      description: 'Exportar tareas a PDF o CSV',
      icon: <Download className="h-4 w-4" />,
      shortcut: 'Ctrl+E',
      action: onExportTasks,
      category: 'export'
    }
  ];

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'n':
            if (event.shiftKey) {
              event.preventDefault();
              onCreateHighPriorityTask();
              addToRecentActions('create-urgent');
            } else {
              event.preventDefault();
              onCreateTask();
              addToRecentActions('create-task');
            }
            break;
          case 'k':
            event.preventDefault();
            onSearchFocus();
            addToRecentActions('search-tasks');
            break;
          case '1':
            event.preventDefault();
            onFilterPending();
            addToRecentActions('filter-pending');
            break;
          case '2':
            event.preventDefault();
            onFilterCompleted();
            addToRecentActions('filter-completed');
            break;
          case '3':
            event.preventDefault();
            onFilterHighPriority();
            addToRecentActions('filter-priority');
            break;
          case 'e':
            event.preventDefault();
            onExportTasks();
            addToRecentActions('export-tasks');
            break;
          case '?':
            event.preventDefault();
            setShowShortcuts(true);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCreateTask, onCreateHighPriorityTask, onFilterPending, onFilterCompleted, onFilterHighPriority, onSearchFocus, onExportTasks]);

  const addToRecentActions = (actionId: string) => {
    setRecentActions(prev => {
      const filtered = prev.filter(id => id !== actionId);
      return [actionId, ...filtered].slice(0, 3);
    });
  };

  const executeAction = (action: QuickAction) => {
    action.action();
    addToRecentActions(action.id);
  };

  const getRecentActions = () => {
    return recentActions
      .map(id => quickActions.find(action => action.id === id))
      .filter(Boolean) as QuickAction[];
  };

  const getCategoryActions = (category: QuickAction['category']) => {
    return quickActions.filter(action => action.category === category);
  };

  const categories = [
    { id: 'create', title: 'Crear', icon: <Plus className="h-4 w-4" /> },
    { id: 'filter', title: 'Filtrar', icon: <Filter className="h-4 w-4" /> },
    { id: 'view', title: 'Ver', icon: <Search className="h-4 w-4" /> },
    { id: 'export', title: 'Exportar', icon: <Download className="h-4 w-4" /> }
  ];

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Quick Actions Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Zap className="h-4 w-4 mr-2" />
          Acciones Rápidas
          <span className="ml-2 px-2 py-1 bg-white/20 rounded text-xs">
            Ctrl+?
          </span>
        </button>

        {/* Expanded Actions Panel */}
        {isExpanded && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsExpanded(false)}
            />
            <div className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Acciones Rápidas
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowShortcuts(true)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                    title="Ver atajos de teclado"
                  >
                    <Keyboard className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                {/* Recent Actions */}
                {recentActions.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Acciones Recientes
                    </h4>
                    <div className="space-y-2">
                      {getRecentActions().map(action => (
                        <button
                          key={`recent-${action.id}`}
                          onClick={() => {
                            executeAction(action);
                            setIsExpanded(false);
                          }}
                          className="w-full flex items-center justify-between p-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-1 bg-indigo-100 dark:bg-indigo-900/50 rounded">
                              {action.icon}
                            </div>
                            <div className="text-left">
                              <div className="font-medium">{action.title}</div>
                              <div className="text-xs text-indigo-600/70 dark:text-indigo-400/70">
                                {action.description}
                              </div>
                            </div>
                          </div>
                          {action.shortcut && (
                            <span className="text-xs bg-indigo-200 dark:bg-indigo-800 px-2 py-1 rounded">
                              {action.shortcut}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions by Category */}
                {categories.map(category => (
                  <div key={category.id} className="mb-6 last:mb-0">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                      {category.icon}
                      <span className="ml-2">{category.title}</span>
                    </h4>
                    <div className="space-y-2">
                      {getCategoryActions(category.id as QuickAction['category']).map(action => (
                        <button
                          key={action.id}
                          onClick={() => {
                            executeAction(action);
                            setIsExpanded(false);
                          }}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                              {action.icon}
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {action.title}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {action.description}
                              </div>
                            </div>
                          </div>
                          {action.shortcut && (
                            <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                              {action.shortcut}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Atajos de Teclado
              </h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map(category => (
                  <div key={category.id}>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      {category.icon}
                      <span className="ml-2">{category.title}</span>
                    </h4>
                    <div className="space-y-2">
                      {getCategoryActions(category.id as QuickAction['category'])
                        .filter(action => action.shortcut)
                        .map(action => (
                          <div key={action.id} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {action.title}
                            </span>
                            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded border">
                              {action.shortcut}
                            </kbd>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Atajos Generales
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Mostrar atajos
                    </span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded border">
                      Ctrl+?
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Cerrar modal
                    </span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded border">
                      Esc
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActions;
