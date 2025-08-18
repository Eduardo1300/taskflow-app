import React from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import { Task } from '../../types';

interface CalendarAgendaProps {
  selectedDate: Date | null;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onCreateTask: (date: Date) => void;
}

export const CalendarAgenda: React.FC<CalendarAgendaProps> = ({
  selectedDate,
  tasks,
  onTaskClick,
  onCreateTask
}) => {
  if (!selectedDate) {
    return (
      <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Selecciona una fecha
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Haz clic en un día del calendario para ver las tareas
          </p>
        </div>
      </div>
    );
  }

  // Filtrar tareas para la fecha seleccionada
  const dayTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    return new Date(task.due_date).toDateString() === selectedDate.toDateString();
  });

  // Separar tareas por estado
  const completedTasks = dayTasks.filter(task => task.completed);
  const incompleteTasks = dayTasks.filter(task => !task.completed);
  const overdueTasks = incompleteTasks.filter(task => 
    task.due_date && new Date(task.due_date) < new Date()
  );

  // Formatear fecha
  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === tomorrow.toDateString()) return 'Mañana';
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';

    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
            {formatDate(selectedDate)}
          </h3>
          <button
            onClick={() => onCreateTask(selectedDate)}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Nueva tarea
          </button>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {dayTasks.length === 0 
            ? 'No hay tareas programadas'
            : `${dayTasks.length} tarea${dayTasks.length !== 1 ? 's' : ''} programada${dayTasks.length !== 1 ? 's' : ''}`
          }
        </p>
      </div>

      {/* Estadísticas del día */}
      {dayTasks.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {dayTasks.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total
            </div>
          </div>
          
          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-lg font-bold text-green-700 dark:text-green-400">
              {completedTasks.length}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              Hechas
            </div>
          </div>
          
          {overdueTasks.length > 0 && (
            <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-lg font-bold text-red-700 dark:text-red-400">
                {overdueTasks.length}
              </div>
              <div className="text-xs text-red-600 dark:text-red-400">
                Vencidas
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lista de tareas */}
      <div className="space-y-3">
        {/* Tareas vencidas */}
        {overdueTasks.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <h4 className="text-sm font-medium text-red-700 dark:text-red-400">
                Vencidas ({overdueTasks.length})
              </h4>
            </div>
            <div className="space-y-2 ml-6">
              {overdueTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onTaskClick={onTaskClick}
                  isOverdue={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tareas pendientes */}
        {incompleteTasks.filter(task => !overdueTasks.includes(task)).length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Pendientes ({incompleteTasks.filter(task => !overdueTasks.includes(task)).length})
              </h4>
            </div>
            <div className="space-y-2 ml-6">
              {incompleteTasks.filter(task => !overdueTasks.includes(task)).map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onTaskClick={onTaskClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tareas completadas */}
        {completedTasks.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <h4 className="text-sm font-medium text-green-700 dark:text-green-400">
                Completadas ({completedTasks.length})
              </h4>
            </div>
            <div className="space-y-2 ml-6">
              {completedTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onTaskClick={onTaskClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mensaje si no hay tareas */}
      {dayTasks.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No tienes tareas para este día
          </p>
          <button
            onClick={() => onCreateTask(selectedDate)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            Crear primera tarea
          </button>
        </div>
      )}
    </div>
  );
};

// Componente auxiliar para cada tarea
interface TaskItemProps {
  task: Task;
  onTaskClick: (task: Task) => void;
  isOverdue?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onTaskClick, isOverdue = false }) => {
  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPriorityBg = (priority: string | null) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600';
    }
  };

  return (
    <div
      onClick={() => onTaskClick(task)}
      className={`
        p-3 border rounded-lg cursor-pointer hover:shadow-sm transition-all duration-200
        ${getPriorityBg(task.priority)}
        ${task.completed ? 'opacity-75' : ''}
        ${isOverdue ? 'ring-1 ring-red-400 dark:ring-red-600' : ''}
      `}
    >
      <div className="flex items-start space-x-2">
        <div className="flex-shrink-0 mt-0.5">
          {task.completed ? (
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <Circle className="h-4 w-4 text-gray-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h5 className={`
            text-sm font-medium truncate
            ${task.completed 
              ? 'text-gray-500 dark:text-gray-400 line-through' 
              : 'text-gray-900 dark:text-white'
            }
          `}>
            {task.title}
          </h5>
          
          {task.description && (
            <p className={`
              text-xs mt-1 truncate
              ${task.completed 
                ? 'text-gray-400 dark:text-gray-500 line-through' 
                : 'text-gray-600 dark:text-gray-400'
              }
            `}>
              {task.description}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-2">
            {task.priority && (
              <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority === 'high' ? 'Alta' : 
                 task.priority === 'medium' ? 'Media' : 'Baja'} prioridad
              </span>
            )}
            
            {task.category && (
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                {task.category}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
