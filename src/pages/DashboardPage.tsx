import { useState, useEffect } from 'react';
import { Plus, Search, Filter, CheckCircle, Clock, BarChart3, FileText, FileSpreadsheet } from 'lucide-react';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import TaskCard from '../components/Tasks/TaskCard';
import TaskModal from '../components/Tasks/TaskModal';
import ShareTaskModal from '../components/Collaboration/ShareTaskModal';
import InvitationNotifications from '../components/Collaboration/InvitationNotifications';
import PWAUpdate from '../components/PWA/PWAUpdate';
import OfflineIndicator from '../components/Offline/OfflineIndicator';
import AnalyticsPage from '../components/Analytics/AnalyticsPage';
import ApiManagementPage from '../components/Api/ApiManagementPage';
import IntegrationsPage from '../components/Integrations/IntegrationsPage';
import IntegrationNotifications from '../components/Integrations/IntegrationNotifications';
import { useAuth } from '../contexts/AuthContext';
import { Task, TaskWithCollaboration } from '../types';
import { TaskService } from '../services/taskService';
import { CollaborationService } from '../services/collaborationService';
import { CategoryService, Category } from '../services/categoryService';
import { offlineService } from '../services/offlineService';
import { exportService } from '../services/exportService';
import { useRealtime } from '../hooks/useRealtime';
import { useOffline } from '../hooks/useOffline';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskWithCollaboration[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskWithCollaboration[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
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
      loadTasks(); // Recargar tareas para obtener información de colaboración
    },
    onUpdate: () => {
      loadTasks(); // Recargar tareas para mantener sincronización
    },
    onDelete: (payload: any) => {
      setTasks(prev => prev.filter(task => task.id !== payload.old.id));
    }
  });



  // Cargar tareas e invitaciones al inicializar
  useEffect(() => {
    if (user) {
      loadTasks();
      loadPendingInvitations();
      loadCategories();
      
      // Setup auto-sync for offline mode
      offlineService.setupAutoSync(() => {
        loadTasks(); // Reload tasks after successful sync
      });
    }
  }, [user]);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    
    if (!navigator.onLine) {
      // Load from cache when offline
      const cachedTasks = offlineService.getCachedTasks();
      const tasksWithCollaboration = cachedTasks.map(task => ({
        ...task,
        collaborators: [],
        isShared: false
      }));
      setTasks(tasksWithCollaboration);
      setLoading(false);
      return;
    }

    const { data, error } = await TaskService.getTasks();
    
    if (error) {
      setError(error);
      // Fallback to cache if online request fails
      const cachedTasks = offlineService.getCachedTasks();
      if (cachedTasks.length > 0) {
        const tasksWithCollaboration = cachedTasks.map(task => ({
          ...task,
          collaborators: [],
          isShared: false
        }));
        setTasks(tasksWithCollaboration);
      }
    } else if (data) {
      // Cache the fresh data
      offlineService.setCachedTasks(data);
      
      // Cargar información de colaboración para cada tarea
      const tasksWithCollaboration = await Promise.all(
        data.map(async (task) => {
          const { data: collaborators } = await CollaborationService.getTaskCollaborators(task.id);
          return {
            ...task,
            collaborators: collaborators || [],
            isShared: (collaborators && collaborators.length > 0) || false
          };
        })
      );
      setTasks(tasksWithCollaboration);
    }
    
    setLoading(false);
  };

  const loadPendingInvitations = async () => {
    // Esta función se mantiene para futuras implementaciones
  };

  const loadCategories = async () => {
    const { data, error } = await CategoryService.getCategories();
    if (error) {
      console.error('Error loading categories:', error);
      // Fallback: categorías por defecto
      setCategories([
        { id: -1, name: 'Trabajo', color: '#3B82F6', user_id: '', created_at: '' },
        { id: -2, name: 'Personal', color: '#10B981', user_id: '', created_at: '' },
        { id: -3, name: 'Urgente', color: '#EF4444', user_id: '', created_at: '' },
        { id: -4, name: 'Ideas', color: '#8B5CF6', user_id: '', created_at: '' }
      ]);
    } else if (data) {
      if (data.length === 0) {
        // Si no hay categorías, usar las por defecto
        setCategories([
          { id: -1, name: 'Trabajo', color: '#3B82F6', user_id: '', created_at: '' },
          { id: -2, name: 'Personal', color: '#10B981', user_id: '', created_at: '' },
          { id: -3, name: 'Urgente', color: '#EF4444', user_id: '', created_at: '' },
          { id: -4, name: 'Ideas', color: '#8B5CF6', user_id: '', created_at: '' }
        ]);
      } else {
        setCategories(data);
      }
    }
  };

  // Filtrar tareas según búsqueda y estado
  useEffect(() => {
    let filtered = tasks;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      const isCompleted = statusFilter === 'completed';
      filtered = filtered.filter(task => task.completed === isCompleted);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, statusFilter]);

  const handleCreateTask = async (taskData: { 
    title: string; 
    description?: string; 
    completed?: boolean;
    category?: string;
    tags?: string[];
    due_date?: string;
    priority?: 'low' | 'medium' | 'high';
  }) => {
    setError(null);
    
    if (!navigator.onLine) {
      // Create task offline
      const newTask = offlineService.createTaskOffline(taskData);
      const taskWithCollaboration = {
        ...newTask,
        collaborators: [],
        isShared: false
      };
      setTasks(prev => [taskWithCollaboration, ...prev]);
      setIsModalOpen(false);
      return;
    }
    
    const { data, error } = await TaskService.createTask(taskData);
    
    if (error) {
      setError(error);
    } else if (data) {
      setTasks(prev => [data, ...prev]);
      setIsModalOpen(false);
    }
  };

  const handleEditTask = async (taskData: { 
    title: string; 
    description?: string; 
    completed?: boolean;
    category?: string;
    tags?: string[];
    due_date?: string;
    priority?: 'low' | 'medium' | 'high';
  }) => {
    if (!editingTask) return;
    
    setError(null);
    
    if (!navigator.onLine) {
      // Update task offline
      offlineService.updateTaskOffline(editingTask.id, taskData);
      setTasks(prev => prev.map(task =>
        task.id === editingTask.id ? { ...task, ...taskData } : task
      ));
      setEditingTask(null);
      setIsModalOpen(false);
      return;
    }
    
    const { data, error } = await TaskService.updateTask(editingTask.id, taskData);
    
    if (error) {
      setError(error);
    } else if (data) {
      setTasks(prev => prev.map(task =>
        task.id === editingTask.id ? data : task
      ));
      setEditingTask(null);
      setIsModalOpen(false);
    }
  };

  const handleToggleStatus = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    setError(null);
    
    if (!navigator.onLine) {
      // Toggle task offline
      offlineService.toggleTaskOffline(taskId, !task.completed);
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ));
      return;
    }
    
    const { data, error } = await TaskService.toggleTaskCompletion(taskId, !task.completed);
    
    if (error) {
      setError(error);
    } else if (data) {
      setTasks(prev => prev.map(t =>
        t.id === taskId ? data : t
      ));
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return;
    }
    
    setError(null);
    
    if (!navigator.onLine) {
      // Delete task offline
      offlineService.deleteTaskOffline(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      return;
    }
    
    const { error } = await TaskService.deleteTask(taskId);
    
    if (error) {
      setError(error);
    } else {
      setTasks(prev => prev.filter(task => task.id !== taskId));
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleShareTask = (task: Task) => {
    setShareModalTask(task);
  };

  const getUserPermission = (task: TaskWithCollaboration): 'owner' | 'view' | 'edit' | 'admin' => {
    if (task.user_id === user?.id) return 'owner';
    
    const collaborator = task.collaborators?.find(c => c.user_id === user?.id);
    return collaborator?.permission || 'view';
  };

  // Estadísticas
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = tasks.filter(task => !task.completed).length;

  // Funciones de exportación
  const handleExportToPDF = async () => {
    try {
      await exportService.exportTasksToPDF(filteredTasks);
    } catch (error) {
      console.error('Error exportando a PDF:', error);
      setError('Error al exportar a PDF');
    }
  };

  const handleExportToCSV = async () => {
    try {
      await exportService.exportTasksToCSV(filteredTasks);
    } catch (error) {
      console.error('Error exportando a CSV:', error);
      setError('Error al exportar a CSV');
    }
  };

  const renderContent = () => {
    if (activeSection === 'analytics') {
      return <AnalyticsPage tasks={tasks} />;
    }

    if (activeSection === 'api') {
      return <ApiManagementPage />;
    }

    if (activeSection === 'integrations') {
      return <IntegrationsPage />;
    }

    if (activeSection === 'profile') {
      return (
        <div className="max-w-2xl mx-auto w-full">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">Perfil</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 md:p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre</label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Indicador de estado offline */}
        <div className="mb-6">
          <OfflineIndicator />
        </div>

        {/* Notificaciones de invitaciones */}
        <div className="mb-6">
          <InvitationNotifications
            onInvitationUpdate={loadTasks}
          />
        </div>

        {/* Header del Dashboard */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">
            ¡Hola, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Aquí tienes un resumen de tus tareas</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 md:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-7 w-7 md:h-8 md:w-8 text-blue-600" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{totalTasks}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 md:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-7 w-7 md:h-8 md:w-8 text-orange-600" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{pendingTasks}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 md:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-7 w-7 md:h-8 md:w-8 text-green-600" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Completadas</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{completedTasks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
            <p className="text-red-800 text-xs md:text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 text-xs md:text-sm underline hover:no-underline mt-2"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Controles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 md:gap-4">
            <div className="flex flex-col sm:flex-row gap-2 md:gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar tareas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                >
                  <option value="all">Todas</option>
                  <option value="pending">Pendientes</option>
                  <option value="completed">Completadas</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Botones de exportación */}
              <div className="flex gap-2">
                <button
                  onClick={handleExportToPDF}
                  title="Exportar a PDF"
                  className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">PDF</span>
                </button>
                <button
                  onClick={handleExportToCSV}
                  title="Exportar a CSV"
                  className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">CSV</span>
                </button>
              </div>
              
              {/* Botón Nueva tarea */}
              <button
                onClick={() => {
                  setEditingTask(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm md:text-base"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva tarea
              </button>
            </div>
          </div>
        </div>

        {/* Lista de tareas */}
        <div className="space-y-3 md:space-y-4">
          {loading ? (
            <div className="text-center py-8 md:py-12">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 md:p-8">
                <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg">Cargando tareas...</p>
              </div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 md:p-8">
                <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg mb-3 md:mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No se encontraron tareas con los filtros aplicados'
                    : 'No tienes tareas aún'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <button
                    onClick={() => {
                      setEditingTask(null);
                      setIsModalOpen(true);
                    }}
                    className="inline-flex items-center px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm md:text-base"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear tu primera tarea
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredTasks.map(task => {
              const userPermission = getUserPermission(task);
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDeleteTask}
                  onEdit={handleEditClick}
                  onShare={handleShareTask}
                  isShared={task.collaborators && task.collaborators.length > 0}
                  userPermission={userPermission}
                />
              );
            })
          )}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header showUserMenu />
      
      <div className="flex">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {renderContent()}
        </main>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={editingTask ? handleEditTask : handleCreateTask}
        editingTask={editingTask}
        categories={categories}
      />

      {shareModalTask && (
        <ShareTaskModal
          task={shareModalTask}
          isOpen={!!shareModalTask}
          onClose={() => setShareModalTask(null)}
          onTaskShared={loadTasks}
        />
      )}

      <PWAUpdate />
      <IntegrationNotifications />
    </div>
  );
};

export default DashboardPage;