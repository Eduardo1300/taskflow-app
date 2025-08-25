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
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex">
          <SidebarEnhanced
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            isCollapsed={false}
          />
          
          <div className="flex-1 flex flex-col min-w-0 -ml-8">
            <Header showUserMenu={true} />
            
            <main className="flex-1 py-6 pl-8 pr-6">
              <div className="max-w-6xl mx-auto w-full">
                <AnalyticsPage tasks={tasks} />
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'api') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex">
          <SidebarEnhanced
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            isCollapsed={false}
          />
          
          <div className="flex-1 flex flex-col min-w-0 -ml-8">
            <Header showUserMenu={true} />
            
            <main className="flex-1 py-6 pl-8 pr-6">
              <div className="max-w-6xl mx-auto w-full">
                <ApiManagementPage />
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'integrations') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex">
          <SidebarEnhanced
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            isCollapsed={false}
          />
          
          <div className="flex-1 flex flex-col min-w-0 -ml-8">
            <Header showUserMenu={true} />
            
            <main className="flex-1 py-6 pl-8 pr-6">
              <div className="max-w-6xl mx-auto w-full">
                <IntegrationsPage />
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex">
          <SidebarEnhanced
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            isCollapsed={false}
          />
          
          <div className="flex-1 flex flex-col min-w-0 -ml-8">
            <Header showUserMenu={true} />
            
            <main className="flex-1 py-6 pl-8 pr-6">
              <div className="max-w-4xl mx-auto w-full">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Perfil de Usuario</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Información Personal */}
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información Personal</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre Completo</label>
                        <input
                          type="text"
                          value={user?.email?.split('@')[0] || ''}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Tu nombre completo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono</label>
                        <input
                          type="tel"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Tu número de teléfono"
                        />
                      </div>
                      <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg transition-all duration-200">
                        Actualizar Información
                      </button>
                    </div>
                  </div>

                  {/* Preferencias */}
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferencias</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Idioma</label>
                        <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="es">Español</option>
                          <option value="en">English</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zona Horaria</label>
                        <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="America/Mexico_City">México (GMT-6)</option>
                          <option value="America/New_York">Nueva York (GMT-5)</option>
                          <option value="Europe/Madrid">Madrid (GMT+1)</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notificaciones por Email</span>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Recordatorios Push</span>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-gray-600 transition-colors">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                        </button>
                      </div>
                      <button className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-2 px-4 rounded-lg transition-all duration-200">
                        Guardar Preferencias
                      </button>
                    </div>
                  </div>

                  {/* Estadísticas de Usuario */}
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Estadísticas</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Tareas completadas</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{stats.completed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Tareas creadas</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{stats.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Productividad promedio</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Días activo</span>
                        <span className="font-semibold text-gray-900 dark:text-white">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Racha actual</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">5 días</span>
                      </div>
                    </div>
                  </div>

                  {/* Configuración de Seguridad */}
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Seguridad</h3>
                    <div className="space-y-4">
                      <button className="w-full text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 p-3 rounded-lg transition-colors">
                        <div className="font-medium text-gray-900 dark:text-white">Cambiar Contraseña</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Actualiza tu contraseña</div>
                      </button>
                      <button className="w-full text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 p-3 rounded-lg transition-colors">
                        <div className="font-medium text-gray-900 dark:text-white">Autenticación en dos pasos</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Aumenta la seguridad de tu cuenta</div>
                      </button>
                      <button className="w-full text-left bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 p-3 rounded-lg transition-colors">
                        <div className="font-medium text-red-900 dark:text-red-400">Eliminar Cuenta</div>
                        <div className="text-sm text-red-600 dark:text-red-500">Esta acción no se puede deshacer</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex">
        <SidebarEnhanced
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isCollapsed={false}
        />
        
        <div className="flex-1 flex flex-col min-w-0 -ml-8">
          <Header showUserMenu={true} />
          
          <main className="flex-1 py-6 pl-8 pr-6">
            <div className="max-w-6xl mx-auto w-full">
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
    </div>
  );
};

export default DashboardPageEnhanced;
