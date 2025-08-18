import React from 'react';
import { Plus, Circle, CheckCircle2 } from 'lucide-react';
import { Task } from '../../types';

interface CalendarDayProps {
  date: Date;
  tasks: Task[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  onTaskClick: (task: Task) => void;
  onCreateTask: (date: Date) => void;
  onDateClick: (date: Date) => void;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  tasks,
  isCurrentMonth,
  isToday,
  isSelected,
  onTaskClick,
  onCreateTask,
  onDateClick
}) => {
  const completedTasks = tasks.filter(task => task.completed);
  const incompleteTasks = tasks.filter(task => !task.completed);
  const overdueTasks = incompleteTasks.filter(task => 
    task.due_date && new Date(task.due_date) < new Date() && !task.completed
  );

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
    }
  };

  return (
    <div
      className={`
        group min-h-[100px] p-2 cursor-pointer transition-all duration-200
        ${isCurrentMonth 
          ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700' 
          : 'bg-gray-50 dark:bg-gray-900 opacity-40 hover:opacity-60'
        }
        ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}
        ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
        ${overdueTasks.length > 0 ? 'ring-1 ring-red-300 dark:ring-red-700' : ''}
      `}
      onClick={() => onDateClick(date)}
    >
      {/* Header del día */}
      <div className="flex items-center justify-between mb-1">
        <span className={`
          text-sm font-medium
          ${isToday 
            ? 'text-blue-600 dark:text-blue-400 font-bold' 
            : isCurrentMonth 
              ? 'text-gray-900 dark:text-gray-100' 
              : 'text-gray-400 dark:text-gray-600'
          }
        `}>
          {date.getDate()}
        </span>
        
        {/* Indicadores de estado */}
        <div className="flex items-center space-x-1">
          {overdueTasks.length > 0 && (
            <div className="w-2 h-2 bg-red-500 rounded-full" title={`${overdueTasks.length} tareas vencidas`} />
          )}
          
          {tasks.length === 0 && isCurrentMonth && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateTask(date);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-all duration-200"
              title="Crear tarea"
            >
              <Plus className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Tareas del día */}
      <div className="space-y-1">
        {tasks.slice(0, 3).map(task => (
          <div
            key={task.id}
            onClick={(e) => {
              e.stopPropagation();
              onTaskClick(task);
            }}
            className={`
              text-xs p-1.5 rounded border cursor-pointer hover:scale-105 transition-all duration-200
              ${getPriorityColor(task.priority)}
              ${task.completed ? 'opacity-75' : ''}
            `}
            title={`${task.title} - ${task.priority || 'sin prioridad'}`}
          >
            <div className="flex items-center space-x-1">
              {task.completed ? (
                <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
              ) : (
                <Circle className="h-3 w-3 flex-shrink-0" />
              )}
              <span className={`truncate ${task.completed ? 'line-through' : ''}`}>
                {task.title}
              </span>
            </div>
          </div>
        ))}
        
        {tasks.length > 3 && (
          <div 
            className="text-xs text-center py-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDateClick(date);
            }}
          >
            +{tasks.length - 3} más
          </div>
        )}
      </div>

      {/* Resumen del día (visible en hover) */}
      {tasks.length > 0 && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute z-10 mt-1 p-2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs rounded shadow-lg pointer-events-none">
          <div className="whitespace-nowrap">
            {completedTasks.length > 0 && (
              <div className="text-green-400 dark:text-green-600">
                ✓ {completedTasks.length} completadas
              </div>
            )}
            {incompleteTasks.length > 0 && (
              <div className="text-blue-400 dark:text-blue-600">
                ○ {incompleteTasks.length} pendientes
              </div>
            )}
            {overdueTasks.length > 0 && (
              <div className="text-red-400 dark:text-red-600">
                ! {overdueTasks.length} vencidas
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
