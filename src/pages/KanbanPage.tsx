import React, { useState, useEffect } from 'react';
import { Trello } from 'lucide-react';
import { KanbanBoard } from '../components/Views/KanbanBoard';
import TaskModal from '../components/Tasks/TaskModal';
import { Task } from '../types';
import { useAuth } from '../contexts/AuthContext';

const KanbanPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createTaskStatus, setCreateTaskStatus] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();

  // Cargar tareas (aquí implementarías la carga real desde Supabase)
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        // Simular carga de tareas - reemplazar con llamada real a API
        const mockTasks: Task[] = [
          {
            id: 1,
            title: "Diseñar mockups de la aplicación",
            description: "Crear wireframes y mockups para la nueva función",
            completed: false,
            created_at: new Date().toISOString(),
            user_id: user?.id || '',
            category: "Diseño",
            tags: ["ui/ux", "mockups"],
            due_date: new Date(Date.now() + 2 * 86400000).toISOString(),
            priority: "high"
          },
          {
            id: 2,
            title: "Implementar autenticación",
            description: "Configurar sistema de login y registro",
            completed: false,
            created_at: new Date().toISOString(),
            user_id: user?.id || '',
            category: "Desarrollo",
            tags: ["backend", "auth", "en-progreso"],
            due_date: new Date(Date.now() + 5 * 86400000).toISOString(),
            priority: "high"
          },
          {
            id: 3,
            title: "Escribir documentación de API",
            description: "Documentar endpoints y ejemplos de uso",
            completed: false,
            created_at: new Date().toISOString(),
            user_id: user?.id || '',
            category: "Documentación",
            tags: ["api", "docs", "revision"],
            due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
            priority: "medium"
          },
          {
            id: 4,
            title: "Configurar CI/CD pipeline",
            description: "Setup automatizado de deploy",
            completed: false,
            created_at: new Date().toISOString(),
            user_id: user?.id || '',
            category: "DevOps",
            tags: ["deployment", "automation"],
            due_date: new Date(Date.now() + 10 * 86400000).toISOString(),
            priority: "medium"
          },
          {
            id: 5,
            title: "Reunión de planning sprint",
            description: "Revisar backlog y planificar próximo sprint",
            completed: true,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            user_id: user?.id || '',
            category: "Meetings",
            tags: ["planning", "sprint"],
            due_date: new Date(Date.now() - 86400000).toISOString(),
            priority: "low"
          },
          {
            id: 6,
            title: "Code review del módulo de pagos",
            description: "Revisar implementación del sistema de pagos",
            completed: true,
            created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
            user_id: user?.id || '',
            category: "Desarrollo",
            tags: ["code-review", "payments"],
            due_date: new Date(Date.now() - 86400000).toISOString(),
            priority: "high"
          }
        ];
        
        setTasks(mockTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTasks();
    }
  }, [user]);

  // Manejar creación de tarea
  const handleCreateTask = (status?: string) => {
    setCreateTaskStatus(status);
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  // Manejar edición de tarea
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setCreateTaskStatus(undefined);
    setIsModalOpen(true);
  };

  // Manejar actualización de tarea
  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  // Manejar eliminación de tarea
  const handleTaskDelete = (taskId: number) => {
    setTasks(prevTasks =>
      prevTasks.filter(task => task.id !== taskId)
    );
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  // Manejar nueva tarea
  const handleTaskCreate = (taskData: any) => {
    const newTask: Task = {
      id: Math.max(...tasks.map(t => t.id), 0) + 1,
      title: taskData.title,
      description: taskData.description || null,
      completed: createTaskStatus === 'completed',
      created_at: new Date().toISOString(),
      user_id: user?.id || '',
      category: taskData.category || null,
      tags: taskData.tags || null,
      due_date: taskData.due_date || null,
      priority: taskData.priority || null
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
    setIsModalOpen(false);
    setCreateTaskStatus(undefined);
  };

  // Calcular estadísticas
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => 
      !t.completed && t.due_date && new Date(t.due_date) < new Date()
    ).length,
    highPriority: tasks.filter(t => t.priority === 'high' && !t.completed).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Trello className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tablero Kanban
          </h1>
        </div>
      </div>

      {/* Estadísticas del proyecto */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.pending}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Pendientes
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.completed}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Completadas
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.overdue}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Vencidas
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.highPriority}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Alta prioridad
          </div>
        </div>
      </div>

      {/* Vista principal - Kanban Board */}
      <div className="flex-1 min-h-0">
        <KanbanBoard
          tasks={tasks}
          onTaskUpdate={handleTaskUpdate}
          onTaskCreate={handleCreateTask}
          onTaskDelete={handleTaskDelete}
          onTaskEdit={handleEditTask}
        />
      </div>

      {/* Modal de tarea */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
            setCreateTaskStatus(undefined);
          }}
          onSave={(taskData: any) => {
            if (selectedTask) {
              // Actualizar tarea existente
              handleTaskUpdate({ ...selectedTask, ...taskData });
            } else {
              // Crear nueva tarea
              handleTaskCreate(taskData);
            }
          }}
          editingTask={selectedTask}
        />
      )}
    </div>
  );
};

export default KanbanPage;
