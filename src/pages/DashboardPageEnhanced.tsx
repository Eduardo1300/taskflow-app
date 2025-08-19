import { useState, useEffect } from 'react';
import { Plus, CheckCircle, Target, TrendingUp, Zap, Sparkles } from 'lucide-react';
import Header from '../components/Layout/Header';
import SidebarEnhanced from '../components/Layout/SidebarEnhanced';
import TaskCardEnhanced from '../components/Tasks/TaskCardEnhanced';
import TaskModalEnhanced from '../components/Tasks/TaskModalEnhanced';
import ShareTaskModal from '../components/Collaboration/ShareTaskModal';
import InvitationNotifications from '../components/Collaboration/InvitationNotifications';
import PWAUpdate from '../components/PWA/PWAUpdate';
import OfflineIndicator from '../components/Offline/OfflineIndicator';
import AnalyticsPage from '../components/Analytics/AnalyticsPage';
import ApiManagementPage from '../components/Api/ApiManagementPage';
import IntegrationsPage from '../components/Integrations/IntegrationsPage';
import IntegrationNotifications from '../components/Integrations/IntegrationNotifications';
import NotificationCenter from '../components/Dashboard/NotificationCenter';
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
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      console.error('Error loading tasks:', err);
      setError('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user]);

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
      console.error('Error toggling task:', error);
      setError('Error al actualizar la tarea');
    }
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleTaskDelete = async (taskId: number) => {
    try {
      await TaskService.deleteTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Error al eliminar la tarea');
    }
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
    // TODO: Implement high priority task creation with pre-filled priority
    setEditingTask(null);
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
    console.log('Search focus requested');
  };

  const handleExportTasks = () => {
    // Implement export functionality
    console.log('Exporting tasks...', filteredTasks);
  };

  const handleSmartSearchResults = (results: TaskWithCollaboration[]) => {
    setFilteredTasks(results);
  };

  if (activeSection === 'analytics') {
    return <AnalyticsPage tasks={tasks} />;
  }

  if (activeSection === 'api') {
    return <ApiManagementPage />;
  }

  if (activeSection === 'integrations') {
    return <IntegrationsPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      <SidebarEnhanced
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isCollapsed={false}
      />
      
      <div className="flex-1 flex flex-col lg:ml-72">
        <Header showUserMenu={true} />
        
        <main className="flex-1 p-6">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white shadow-lg">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Dashboard
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Bienvenido de vuelta, {user?.email?.split('@')[0]}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Notification Center */}
                <NotificationCenter tasks={tasks} />
                
                {/* Quick Actions */}
                <QuickActions
                  onCreateTask={handleCreateTask}
                  onCreateHighPriorityTask={handleCreateHighPriorityTask}
                  onFilterPending={handleFilterPending}
                  onFilterCompleted={handleFilterCompleted}
                  onFilterHighPriority={handleFilterHighPriority}
                  onSearchFocus={handleSearchFocus}
                  onExportTasks={handleExportTasks}
                />
                
                {/* New Task Button */}
                <button
                  onClick={handleCreateTask}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva tarea
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-200 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Tareas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stats.pending} pendientes
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-200 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completadas</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% progreso
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-200 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Alta Prioridad</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.highPriority}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Requieren atención
                  </p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <Zap className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-200 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Productividad</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Esta semana
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Smart Search */}
          <div className="mb-8">
            <SmartSearch
              tasks={tasks}
              onFilteredResults={handleSmartSearchResults}
              className="w-full"
            />
          </div>

          {/* Goals System */}
          <div className="mb-8">
            <GoalsSystem tasks={tasks} />
          </div>

          {/* Tasks Grid */}
          <div className="mb-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mr-3"></div>
                <p className="text-gray-600 dark:text-gray-400">Cargando tareas...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {tasks.length === 0 ? '¡Comienza a ser más productivo!' : 'No se encontraron tareas'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {tasks.length === 0 
                    ? 'Crea tu primera tarea y organiza tu trabajo de manera efectiva.'
                    : 'Intenta ajustar los filtros para encontrar lo que buscas.'
                  }
                </p>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primera tarea
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
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
        </main>
      </div>

      {/* Modals */}
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
            // Actualizar la tarea con información de colaboración
            loadTasks();
            setShareModalTask(null);
          }}
        />
      )}

      {/* Additional Components */}
      <InvitationNotifications />
      <IntegrationNotifications />
      <PWAUpdate />
      <OfflineIndicator />

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-200 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardPageEnhanced;
