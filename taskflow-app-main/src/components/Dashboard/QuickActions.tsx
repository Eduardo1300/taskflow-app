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

  const removeRecentAction = (actionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentActions(prev => prev.filter(id => id !== actionId));
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
          className="flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <Zap className="h-5 w-5 mr-2" />
          Acciones Rápidas
          <span className="ml-2 px-2.5 py-0.5 bg-white/20 rounded-lg text-xs font-medium">
            ?
          </span>
        </button>

        {/* Expanded Actions Panel */}
        {isExpanded && (
          <>
            <div 
              className="fixed inset-0 z-[95]"
              onClick={() => setIsExpanded(false)}
            />
            <div className="absolute top-full right-0 mt-3 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-[100] overflow-hidden animate-fade-in-up">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-xl">
                    <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Acciones Rápidas
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Accede rápidamente a las funciones más usadas
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowShortcuts(true)}
                    className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
                    title="Ver atajos de teclado"
                  >
                    <Keyboard className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 max-h-96 overflow-y-auto">
                {/* Recent Actions */}
                {recentActions.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                      Recientes
                    </h4>
                    <div className="space-y-2">
                      {getRecentActions().map(action => (
                        <button
                          key={`recent-${action.id}`}
                          onClick={() => {
                            executeAction(action);
                            setIsExpanded(false);
                          }}
                          className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 text-indigo-700 dark:text-indigo-300 transition-all duration-200 group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-800/60 rounded-lg group-hover:scale-110 transition-transform">
                              {action.icon}
                            </div>
                            <div className="text-left">
                              <div className="font-semibold">{action.title}</div>
                              <div className="text-xs text-indigo-600/70 dark:text-indigo-400/70">
                                {action.description}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {action.shortcut && (
                              <span className="text-xs bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-lg shadow-sm border border-indigo-200 dark:border-indigo-700">
                                {action.shortcut}
                              </span>
                            )}
                            <button
                              onClick={(e) => removeRecentAction(action.id, e)}
                              className="p-1.5 hover:bg-indigo-200 dark:hover:bg-indigo-700 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              title="Quitar de recientes"
                            >
                              <X className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                            </button>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions by Category */}
                {categories.map(category => (
                  <div key={category.id} className="mb-5 last:mb-0">
                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center">
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
                          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 group-hover:scale-110 transition-all">
                              {action.icon}
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {action.title}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {action.description}
                              </div>
                            </div>
                          </div>
                          {action.shortcut && (
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-lg">
                              {action.shortcut}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Presiona <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-gray-700 dark:text-gray-300 font-mono text-xs">?</kbd> para ver todos los atajos
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Atajos de Teclado
              </h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {quickActions.filter(a => a.shortcut).map(action => (
                <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-white dark:bg-gray-600 rounded-lg shadow-sm">
                      {action.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {action.title}
                    </span>
                  </div>
                  <kbd className="px-2.5 py-1 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-mono rounded-lg shadow-sm border border-gray-200 dark:border-gray-500">
                    {action.shortcut}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActions;
