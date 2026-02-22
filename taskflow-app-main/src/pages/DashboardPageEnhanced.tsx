import { useState, useEffect } from 'react';
import { Plus, CheckCircle, Target, TrendingUp, Zap, Sparkles } from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import TaskCardEnhanced from '../components/Tasks/TaskCardEnhanced';
import TaskModalEnhanced from '../components/Tasks/TaskModalEnhanced';
import ShareTaskModal from '../components/Collaboration/ShareTaskModal';

import PWAUpdate from '../components/PWA/PWAUpdate';


import GoalsSystem from '../components/Dashboard/GoalsSystem';
import QuickActions from '../components/Dashboard/QuickActions';
import SmartSearch from '../components/Dashboard/SmartSearch';
import { useAuth } from '../contexts/AuthContext';
import { Task, TaskWithCollaboration } from '../types';
import { TaskService } from '../services/taskService';
import { useRealtime } from '../hooks/useRealtime';
import { useOffline } from '../hooks/useOffline';

const DashboardPageEnhanced: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskWithCollaboration[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskWithCollaboration[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
const [shareModalTask, setShareModalTask] = useState<Task | null>(null);
  const [deleteConfirmTask, setDeleteConfirmTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection] = useState('dashboard');

  // Offline functionality
  useOffline();

  useRealtime({
    table: 'tasks',
    onInsert: () => {
      loadTasks();
    },
    onUpdate: () => {
      loadTasks();
    },
    onDelete: (payload: any) => {
      setTasks(prev => prev.filter(task => task.id !== payload.old.id));
      setFilteredTasks(prev => prev.filter(task => task.id !== payload.old.id));
    }
  });

  const loadTasks = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userTasks = await TaskService.getTasks();
      if (userTasks.data) {
        setTasks(userTasks.data);
      }
      setError(null);
    } catch (err) {
      setError('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user]);

  const [initialSearchQuery, setInitialSearchQuery] = useState('');

  useEffect(() => {
    const savedQuery = localStorage.getItem('taskflow_search_query');
    if (savedQuery) {
      setInitialSearchQuery(savedQuery);
      localStorage.removeItem('taskflow_search_query');
    }
  }, []);

  useEffect(() => {
    let filtered = [...tasks];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task =>
        statusFilter === 'completed' ? task.completed : !task.completed
      );
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Sort by priority and due date
    filtered.sort((a, b) => {
      const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority || 'low'] || 0;
      const bPriority = priorityOrder[b.priority || 'low'] || 0;

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }

      return 0;
    });

    setFilteredTasks(filtered);
  }, [tasks, statusFilter, priorityFilter]);

  const handleTaskSaved = async () => {
    await loadTasks();
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleTaskToggle = async (taskId: number) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const updatedTask = { ...task, completed: !task.completed };
      await TaskService.updateTask(taskId, updatedTask);
      await loadTasks();
    } catch (error) {
      setError('Error al actualizar la tarea');
    }
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

const handleTaskDelete = (task: Task) => {
    setDeleteConfirmTask(task);
  };

  const confirmDeleteTask = async () => {
    console.log('confirmDeleteTask called, task:', deleteConfirmTask);
    if (!deleteConfirmTask) {
      console.log('Early return - no task');
      return;
    }
    const taskId = Number(deleteConfirmTask.id);
    console.log('Task ID:', taskId, 'isNaN:', isNaN(taskId));
    if (!taskId || isNaN(taskId)) {
      console.log('Early return - no valid id');
      return;
    }
    try {
      console.log('Deleting task with id:', taskId);
      await TaskService.deleteTask(taskId);
      await loadTasks();
      setDeleteConfirmTask(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Error al eliminar la tarea');
    }
  };

  const cancelDeleteTask = () => {
    setDeleteConfirmTask(null);
  };

  const handleShareTask = (task: Task) => {
    setShareModalTask(task);
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const highPriority = tasks.filter(t => t.priority === 'high' && !t.completed).length;
    const overdue = tasks.filter(t => 
      t.due_date && new Date(t.due_date) < new Date() && !t.completed
    ).length;

    return { total, completed, pending, highPriority, overdue };
  };

  const stats = getTaskStats();

  // Quick Actions handlers
  const handleCreateTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleCreateHighPriorityTask = () => {
    // Crear tarea con prioridad alta pre-seleccionada
    setEditingTask({
      id: 0, // Temporal ID para nueva tarea
      title: '',
      description: '',
      completed: false,
      priority: 'high',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: user?.id || ''
    } as any);
    setIsModalOpen(true);
  };

  const handleFilterPending = () => {
    setStatusFilter('pending');
    setPriorityFilter('all');
  };

  const handleFilterCompleted = () => {
    setStatusFilter('completed');
    setPriorityFilter('all');
  };

  const handleFilterHighPriority = () => {
    setPriorityFilter('high');
    setStatusFilter('all');
  };

  const handleSearchFocus = () => {
    // The SmartSearch component will handle focus internally
  };

  const handleExportTasks = () => {
    // Implement export functionality
  };

  const handleSmartSearchResults = (results: TaskWithCollaboration[]) => {
    setFilteredTasks(results);
  };

  if (activeSection === 'analytics') {
    return (
      <MainLayout currentPage="dashboard">
        <div className="w-full">
          Analytics page goes here
        </div>
      </MainLayout>
    );
  }

  if (activeSection === 'api') {
    return (
      <MainLayout currentPage="dashboard">
        <div className="w-full">
          API Management page goes here
        </div>
      </MainLayout>
    );
  }

  if (activeSection === 'integrations') {
    return (
      <MainLayout currentPage="dashboard">
        <div className="w-full">
          Integrations page goes here
        </div>
      </MainLayout>
    );
  }

  if (activeSection === 'settings') {
    return (
      <MainLayout currentPage="settings">
        <div className="w-full" />
      </MainLayout>
    );
  }

  if (activeSection === 'help') {
    return (
      <MainLayout currentPage="help">
        <div className="w-full" />
      </MainLayout>
    );
  }

  if (activeSection === 'profile') {
    return (
      <MainLayout currentPage="profile">
        <div className="w-full" />
      </MainLayout>
    );
  }

  return (
    <>
      <MainLayout currentPage="dashboard">
          {/* Hero Banner with Image */}
          <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-2xl">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/4"></div>
            
            <div className="relative px-6 py-8 sm:px-8 sm:py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Target className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Dashboard
                  </h1>
                  <p className="text-blue-100 text-sm sm:text-base mt-1">
                    Bienvenido de vuelta, {user?.email?.split('@')[0]}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <QuickActions
                  onCreateTask={handleCreateTask}
                  onCreateHighPriorityTask={handleCreateHighPriorityTask}
                  onFilterPending={handleFilterPending}
                  onFilterCompleted={handleFilterCompleted}
                  onFilterHighPriority={handleFilterHighPriority}
                  onSearchFocus={handleSearchFocus}
                  onExportTasks={handleExportTasks}
                />
                
                <button
                  onClick={handleCreateTask}
                  className="flex items-center justify-center px-5 py-2.5 bg-white text-purple-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Nueva tarea
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="group bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Tareas</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {stats.pending} pendientes
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            
            <div className="group bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Completadas</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% progreso
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-4 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-500" 
                     style={{ width: stats.total > 0 ? `${(stats.completed / stats.total) * 100}%` : '0%' }}></div>
              </div>
            </div>
            
            <div className="group bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Alta Prioridad</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">{stats.highPriority}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Requieren atención
                  </p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="mt-4 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: stats.highPriority > 0 ? '60%' : '20%' }}></div>
              </div>
            </div>
            
            <div className="group bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Productividad</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Esta semana
                  </p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-4 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full transition-all duration-500"
                     style={{ width: stats.total > 0 ? `${(stats.completed / stats.total) * 100}%` : '0%' }}></div>
              </div>
            </div>
          </div>

          {/* Smart Search */}
          <div className="mb-8">
            <SmartSearch
              tasks={tasks}
              onFilteredResults={handleSmartSearchResults}
              className="w-full"
              initialQuery={initialSearchQuery}
            />
          </div>

          {/* Goals System */}
          <div className="mb-8">
            <GoalsSystem tasks={tasks} />
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Tus Tareas
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filteredTasks.length} tarea{filteredTasks.length !== 1 ? 's' : ''} encontrada{filteredTasks.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {/* Filter Pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  statusFilter === 'all' && priorityFilter === 'all'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Todas
              </button>
              <button
                onClick={handleFilterPending}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  statusFilter === 'pending'
                    ? 'bg-yellow-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={handleFilterCompleted}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  statusFilter === 'completed'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Completadas
              </button>
            </div>
          </div>

          {/* Tasks Grid */}
          <div className="mb-12">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-4 font-medium">Cargando tareas...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-3xl p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-700">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-xl">
                  <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {tasks.length === 0 ? '¡Comienza tu productividad!' : 'No se encontraron tareas'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  {tasks.length === 0 
                    ? 'Crea tu primera tarea y organiza tu trabajo de manera efectiva. Tu futuro yo te lo agradecerá.'
                    : 'Intenta ajustar los filtros para encontrar lo que buscas.'
                  }
                </p>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {tasks.length === 0 ? 'Crear primera tarea' : 'Crear nueva tarea'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
                  >
                    <TaskCardEnhanced
                      task={task}
                      onToggleStatus={handleTaskToggle}
                      onEdit={handleTaskEdit}
                      onDelete={handleTaskDelete}
                      onShare={handleShareTask}
                      isShared={!!task.is_shared}
                      commentsCount={0}
                      attachmentsCount={0}
                      assignedUsers={task.collaborators?.length || 0}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
    </MainLayout>

      {/* Modals - Outside MainLayout for z-index */}
      <TaskModalEnhanced
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onTaskSaved={handleTaskSaved}
      />

{shareModalTask && (
        <ShareTaskModal
          isOpen={true}
          task={shareModalTask}
          onClose={() => setShareModalTask(null)}
          onTaskShared={() => {
            loadTasks();
            setShareModalTask(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Confirmar eliminación
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              ¿Estás seguro de que deseas eliminar la tarea <strong>"{deleteConfirmTask?.title || 'esta tarea'}"</strong>? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDeleteTask}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteTask}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Additional Components */}
      <PWAUpdate />

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-200 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};

export default DashboardPageEnhanced;
