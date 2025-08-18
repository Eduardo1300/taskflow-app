import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, List, Grid3x3 } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { CalendarView } from '../components/Calendar/CalendarView';
import { Task } from '../types';
import { useAuth } from '../contexts/AuthContext';
import TaskModal from '../components/Tasks/TaskModal';

type ViewMode = 'calendar' | 'list' | 'agenda';

const CalendarPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createTaskDate, setCreateTaskDate] = useState<Date | null>(null);
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
            title: "Reunión de equipo",
            description: "Revisar progreso del proyecto",
            completed: false,
            created_at: new Date().toISOString(),
            user_id: user?.id || '',
            category: "Trabajo",
            tags: ["importante", "reunión"],
            due_date: new Date().toISOString(),
            priority: "high"
          },
          {
            id: 2,
            title: "Comprar groceries",
            description: "Leche, pan, huevos",
            completed: false,
            created_at: new Date().toISOString(),
            user_id: user?.id || '',
            category: "Personal",
            tags: ["casa"],
            due_date: new Date(Date.now() + 86400000).toISOString(),
            priority: "medium"
          },
          {
            id: 3,
            title: "Ejercicio matutino",
            description: "30 minutos de cardio",
            completed: true,
            created_at: new Date().toISOString(),
            user_id: user?.id || '',
            category: "Salud",
            tags: ["rutina"],
            due_date: new Date().toISOString(),
            priority: "low"
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

  // Manejar clic en tarea
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Manejar creación de tarea
  const handleCreateTask = (date: Date) => {
    setCreateTaskDate(date);
    setSelectedTask(null);
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

  // Manejar eliminación de tarea (función para futuro uso)
  // const handleTaskDelete = (taskId: number) => {
  //   setTasks(prevTasks =>
  //     prevTasks.filter(task => task.id !== taskId)
  //   );
  //   setIsModalOpen(false);
  //   setSelectedTask(null);
  // };

  // Manejar nueva tarea
  const handleTaskCreate = (newTask: Omit<Task, 'id'>) => {
    const task: Task = {
      ...newTask,
      id: Math.max(...tasks.map(t => t.id), 0) + 1,
      due_date: createTaskDate?.toISOString() || newTask.due_date
    };
    
    setTasks(prevTasks => [...prevTasks, task]);
    setIsModalOpen(false);
    setCreateTaskDate(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Layout activeSection="calendar">
      <div className="h-full flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Calendario
            </h1>
          </div>

          {/* Controles de vista */}
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('calendar')}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${viewMode === 'calendar'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }
              `}
            >
              <Grid3x3 className="h-4 w-4" />
              <span>Calendario</span>
            </button>
            
            <button
              onClick={() => setViewMode('list')}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }
              `}
            >
              <List className="h-4 w-4" />
              <span>Lista</span>
            </button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {tasks.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total de tareas
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {tasks.filter(task => task.completed).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Completadas
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {tasks.filter(task => !task.completed && task.due_date && new Date(task.due_date).toDateString() === new Date().toDateString()).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Hoy
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {tasks.filter(task => !task.completed && task.due_date && new Date(task.due_date) < new Date()).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Vencidas
            </div>
          </div>
        </div>

        {/* Vista principal */}
        <div className="flex-1 min-h-0">
          {viewMode === 'calendar' && (
            <CalendarView
              tasks={tasks}
              onTaskClick={handleTaskClick}
              onCreateTask={handleCreateTask}
            />
          )}
          
          {viewMode === 'list' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Vista de Lista
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Vista de lista próximamente...
              </p>
            </div>
          )}
        </div>

        {/* Modal de tarea */}
        {isModalOpen && (
          <TaskModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedTask(null);
              setCreateTaskDate(null);
            }}
            onSave={(taskData) => {
              if (selectedTask) {
                // Actualizar tarea existente
                handleTaskUpdate({ ...selectedTask, ...taskData });
              } else {
                // Crear nueva tarea
                handleTaskCreate({
                  ...taskData,
                  description: taskData.description || null,
                  category: taskData.category || null,
                  tags: taskData.tags || null,
                  due_date: createTaskDate?.toISOString() || taskData.due_date || null,
                  priority: taskData.priority || null,
                  created_at: new Date().toISOString(),
                  user_id: user?.id || '',
                  completed: false
                });
              }
            }}
            editingTask={selectedTask}
          />
        )}
      </div>
    </Layout>
  );
};

export default CalendarPage;
