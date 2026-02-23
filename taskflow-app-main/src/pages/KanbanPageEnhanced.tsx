import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Tag, 
  Settings, 
  AlertTriangle,
  X,
  ChevronDown,
  BarChart3,
  Users
} from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import TaskCardEnhanced from '../components/Tasks/TaskCardEnhanced';
import TaskModalEnhanced from '../components/Tasks/TaskModalEnhanced';
import KanbanMetrics from '../components/Kanban/KanbanMetrics';
import { Task, TaskWithCollaboration } from '../types';
import { TaskService } from '../services/taskService';
import { useKanbanRealtime } from '../hooks/useKanbanRealtime';

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  wipLimit?: number;
  order: number;
}

interface FilterState {
  priority: string[];
  category: string[];
  assignee: string[];
  dueDate: string;
  tags: string[];
}

const KanbanPageEnhanced: React.FC = () => {
  const [tasks, setTasks] = useState<TaskWithCollaboration[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);
  
  // Real-time collaboration
  const { connectedUsers, broadcastUserActivity } = useKanbanRealtime();
  
  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    priority: [],
    category: [],
    assignee: [],
    dueDate: 'all',
    tags: []
  });

  // Column configuration with WIP limits
  const [columns] = useState<KanbanColumn[]>([
    { id: 'pending', title: 'Por hacer', color: 'bg-blue-500', wipLimit: 10, order: 0 },
    { id: 'in-progress', title: 'En progreso', color: 'bg-yellow-500', wipLimit: 3, order: 1 },
    { id: 'review', title: 'En revisión', color: 'bg-purple-500', wipLimit: 2, order: 2 },
    { id: 'completed', title: 'Completado', color: 'bg-green-500', order: 3 }
  ]);

  const availablePriorities = [
    { value: 'high', label: 'Alta', color: 'text-red-600' },
    { value: 'medium', label: 'Media', color: 'text-yellow-600' },
    { value: 'low', label: 'Baja', color: 'text-green-600' }
  ];

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const userTasks = await TaskService.getTasks();
      if (userTasks.data) {
        setTasks(userTasks.data);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Error al cargar las tareas');
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => {
      let taskStatus = 'pending';
      if (task.completed) {
        taskStatus = 'completed';
      } else if (task.priority === 'high') {
        taskStatus = 'review';
      } else if (task.priority === 'medium') {
        taskStatus = 'in-progress';
      }
      
      return taskStatus === status;
    }).filter(task => {
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(searchLower);
        const matchesDescription = task.description?.toLowerCase().includes(searchLower);
        return matchesTitle || matchesDescription;
      }
      return true;
    }).filter(task => {
      // Apply filters
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority || '')) {
        return false;
      }
      
      if (filters.dueDate && filters.dueDate !== 'all') {
        const today = new Date();
        const taskDueDate = task.due_date ? new Date(task.due_date) : null;
        
        switch (filters.dueDate) {
          case 'overdue':
            return taskDueDate && taskDueDate < today && !task.completed;
          case 'today':
            return taskDueDate && 
                   taskDueDate.toDateString() === today.toDateString();
          case 'week':
            const weekFromNow = new Date(today);
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return taskDueDate && taskDueDate <= weekFromNow && taskDueDate >= today;
          case 'no_date':
            return !taskDueDate;
        }
      }
      
      return true;
    });
  };

  const getActiveFiltersCount = () => {
    return filters.priority.length + 
           (filters.dueDate !== 'all' ? 1 : 0);
  };

  const clearFilters = () => {
    setFilters({
      priority: [],
      category: [],
      assignee: [],
      dueDate: 'all',
      tags: []
    });
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, source, destination } = result;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const task = tasks.find(t => t.id === parseInt(draggableId));
    if (!task) return;

    // Broadcast activity
    if (broadcastUserActivity) {
      await broadcastUserActivity({
        user_id: 'current-user',
        user_name: 'Current User',
        action: 'moved_task',
        task_id: task.id,
        timestamp: new Date().toISOString()
      });
    }

    // Update task status based on destination
    let priority = task.priority;
    let completed = false;

    switch (destination.droppableId) {
      case 'pending':
        priority = 'low';
        break;
      case 'in-progress':
        priority = 'medium';
        break;
      case 'review':
        priority = 'high';
        break;
      case 'completed':
        completed = true;
        break;
    }

    // Update local state immediately for better UX
    setTasks(prev => prev.map(t => 
      t.id === task.id 
        ? { ...t, priority, completed }
        : t
    ));

    // Update in backend
    try {
      await TaskService.updateTask(task.id, { priority, completed });
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert local state on error
      loadTasks();
    }
  };

  const handleTaskSaved = async () => {
    await loadTasks();
    setIsModalOpen(false);
    setEditingTask(null);
  };

  return (
    <MainLayout currentPage="kanban">
      <div className="h-full px-4 sm:px-6 lg:px-6 flex flex-col">
        {/* Header del Kanban */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-6">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl text-white shadow-lg flex-shrink-0">
                <Tag className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Vista Kanban
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  Organiza tus tareas visualmente • {tasks.length} tareas totales
                </p>
              </div>
            </div>
              
              {/* Herramientas */}
              <div className="flex items-center space-x-4">
                {/* Connected Users */}
                {connectedUsers.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <div className="flex -space-x-2">
                      {connectedUsers.slice(0, 3).map((user, index) => (
                        <div
                          key={user.user_id || index}
                          className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800"
                          title={user.user_name || 'Usuario'}
                        >
                          {(user.user_name || 'U')[0].toUpperCase()}
                        </div>
                      ))}
                      {connectedUsers.length > 3 && (
                        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800">
                          +{connectedUsers.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Metrics Button */}
                <button
                  onClick={() => setIsMetricsOpen(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                  title="Ver métricas del board"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Métricas</span>
                </button>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="text"
                  placeholder="Buscar tareas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* Filter Button with counter */}
              <div className="relative flex-1 sm:flex-none">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`w-full sm:w-auto flex items-center justify-center sm:justify-start px-3 py-2 border rounded-lg transition-colors text-sm sm:text-base ${
                    getActiveFiltersCount() > 0 
                      ? 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-500 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  <span>Filtros</span>
                  {getActiveFiltersCount() > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Filter Panel */}
                {isFilterOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 z-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Filtros</h3>
                      <button
                        onClick={clearFilters}
                        className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
                      >
                        Limpiar todo
                      </button>
                    </div>

                    {/* Priority Filter */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Prioridad
                      </label>
                      <div className="space-y-2">
                        {availablePriorities.map((priority) => (
                          <label key={priority.value} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.priority.includes(priority.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilters(prev => ({
                                    ...prev,
                                    priority: [...prev.priority, priority.value]
                                  }));
                                } else {
                                  setFilters(prev => ({
                                    ...prev,
                                    priority: prev.priority.filter(p => p !== priority.value)
                                  }));
                                }
                              }}
                              className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <span className={`ml-2 text-sm ${priority.color}`}>
                              {priority.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Due Date Filter */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fecha límite
                      </label>
                      <select
                        value={filters.dueDate}
                        onChange={(e) => setFilters(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="all">Todas</option>
                        <option value="overdue">Vencidas</option>
                        <option value="today">Hoy</option>
                        <option value="week">Esta semana</option>
                        <option value="no_date">Sin fecha</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Config Button */}
              <button 
                onClick={() => setIsConfigOpen(!isConfigOpen)}
                className="w-full sm:w-auto flex items-center justify-center sm:justify-start px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                <Settings className="h-4 w-4 mr-2" />
                <span>Columnas</span>
              </button>
              
              {/* Column Configuration Panel */}
              {isConfigOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Configurar Columnas</h3>
                      <button
                        onClick={() => setIsConfigOpen(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {columns.map((column) => (
                        <div key={column.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${column.color}`} />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {column.title}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {column.wipLimit && (
                              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                WIP: {column.wipLimit}
                              </span>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {getTasksByStatus(column.id).length} tareas
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">i</span>
                        </div>
                        <div>
                          <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                            Límites WIP (Work In Progress)
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Los límites WIP ayudan a mantener el flujo de trabajo eficiente limitando el número de tareas en progreso.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* New Task Button */}
              <button
                onClick={() => {
                  setEditingTask(null);
                  setIsModalOpen(true);
                }}
                className="w-full sm:w-auto flex items-center justify-center sm:justify-start px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva tarea
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
            </div>
          )}

          {/* Kanban Board */}
          <div className="flex-1 overflow-hidden">
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 min-h-[calc(100vh-400px)]">
              {columns.map((column) => {
                const columnTasks = getTasksByStatus(column.id);
                const isOverWipLimit = column.wipLimit && columnTasks.length > column.wipLimit;
                
                return (
                  <div key={column.id} className="flex flex-col h-full">
                    {/* Column Header */}
                    <div className={`flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-t-2xl border border-gray-200/50 dark:border-gray-700/50 flex-shrink-0 ${
                      isOverWipLimit ? 'border-red-300 dark:border-red-600' : ''
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${column.color}`} />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {column.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          isOverWipLimit 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {columnTasks.length}
                          {column.wipLimit && ` / ${column.wipLimit}`}
                        </span>
                      </div>
                      
                      {isOverWipLimit && (
                        <div className="flex items-center text-red-500" title="Límite WIP excedido">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    {/* Tasks Container */}
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 p-4 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-b-2xl border-x border-b border-gray-200/50 dark:border-gray-700/50 overflow-y-auto custom-scrollbar transition-colors ${
                            snapshot.isDraggingOver ? 'bg-blue-50/80 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <div className="space-y-3">
                            {columnTasks.map((task, index) => (
                              <Draggable
                                key={task.id}
                                draggableId={task.id.toString()}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className="transition-all duration-200"
                                  >
                                    <div
                                      {...provided.dragHandleProps}
                                      className={`cursor-grab active:cursor-grabbing ${
                                        snapshot.isDragging 
                                          ? 'opacity-90' 
                                          : 'hover:shadow-lg'
                                      }`}
                                    >
                                      <TaskCardEnhanced
                                        task={task}
                                        onToggleStatus={() => {}}
                                        onDelete={() => {}}
                                        onEdit={() => {
                                          setEditingTask(task);
                                          setIsModalOpen(true);
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            
                            {columnTasks.length === 0 && (
                              <div className="flex items-center justify-center py-12 text-gray-400 dark:text-gray-600">
                                <div className="text-center">
                                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">No hay tareas aquí</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
            </DragDropContext>
          </div>
        </div>

        {/* Task Modal */}
        <TaskModalEnhanced
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          task={editingTask}
          onTaskSaved={handleTaskSaved}
        />

        {/* Kanban Metrics Modal */}
        <KanbanMetrics
          boardId="default-board"
          isOpen={isMetricsOpen}
          onClose={() => setIsMetricsOpen(false)}
          tasks={tasks}
        />
    </MainLayout>
  );
};

export default KanbanPageEnhanced;
