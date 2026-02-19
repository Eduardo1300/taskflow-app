import React, { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Calendar, Tag, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Task } from '../../types';

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  count: number;
}

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskCreate: (status?: string) => void;
  onTaskDelete: (taskId: number) => void;
  onTaskEdit: (task: Task) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskUpdate,
  onTaskCreate,
  onTaskEdit
}) => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Definir columnas con sus reglas de filtrado
  const columnDefinitions = [
    {
      id: 'todo',
      title: 'Por hacer',
      color: 'bg-gray-50 dark:bg-gray-800',
      status: 'todo' as const,
      filter: (task: Task) => !task.completed && !isInProgress(task) && !isInReview(task)
    },
    {
      id: 'in-progress',
      title: 'En progreso',
      color: 'bg-blue-50 dark:bg-blue-900/10',
      status: 'in-progress' as const,
      filter: (task: Task) => !task.completed && isInProgress(task)
    },
    {
      id: 'review',
      title: 'En revisión',
      color: 'bg-yellow-50 dark:bg-yellow-900/10',
      status: 'review' as const,
      filter: (task: Task) => !task.completed && isInReview(task)
    },
    {
      id: 'completed',
      title: 'Completadas',
      color: 'bg-green-50 dark:bg-green-900/10',
      status: 'completed' as const,
      filter: (task: Task) => task.completed
    }
  ];

  // Función para determinar si una tarea está en progreso
  const isInProgress = (task: Task): boolean => {
    return task.tags?.includes('en-progreso') || task.tags?.includes('progress') || false;
  };

  // Función para determinar si una tarea está en revisión
  const isInReview = (task: Task): boolean => {
    return task.tags?.includes('revision') || task.tags?.includes('review') || false;
  };

  // Distribuir tareas en columnas
  useEffect(() => {
    const newColumns = columnDefinitions.map(colDef => {
      const filteredTasks = tasks.filter(colDef.filter);
      return {
        id: colDef.id,
        title: colDef.title,
        tasks: filteredTasks,
        color: colDef.color,
        status: colDef.status,
        count: filteredTasks.length
      };
    });
    
    setColumns(newColumns);
  }, [tasks]);

  // Manejo de drag & drop
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    
    if (!draggedTask) return;

    // Actualizar la tarea basado en la columna destino
    let updatedTask = { ...draggedTask };
    
    switch (columnId) {
      case 'todo':
        updatedTask.completed = false;
        updatedTask.tags = updatedTask.tags?.filter(tag => 
          tag !== 'en-progreso' && tag !== 'progress' && tag !== 'revision' && tag !== 'review'
        ) || [];
        break;
      case 'in-progress':
        updatedTask.completed = false;
        const filteredTags = updatedTask.tags?.filter(tag => 
          tag !== 'revision' && tag !== 'review'
        ) || [];
        updatedTask.tags = [...filteredTags, 'en-progreso'];
        break;
      case 'review':
        updatedTask.completed = false;
        const reviewFilteredTags = updatedTask.tags?.filter(tag => 
          tag !== 'en-progreso' && tag !== 'progress'
        ) || [];
        updatedTask.tags = [...reviewFilteredTags, 'revision'];
        break;
      case 'completed':
        updatedTask.completed = true;
        updatedTask.tags = updatedTask.tags?.filter(tag => 
          tag !== 'en-progreso' && tag !== 'progress' && tag !== 'revision' && tag !== 'review'
        ) || [];
        break;
    }
    
    onTaskUpdate(updatedTask);
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  // Obtener color de prioridad
  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  // Obtener texto de prioridad
  const getPriorityText = (priority: string | null) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return '';
    }
  };

  // Verificar si la tarea está vencida
  const isOverdue = (task: Task) => {
    if (!task.due_date || task.completed) return false;
    return new Date(task.due_date) < new Date();
  };

  // Alternar estado de tarea
  const handleToggleTaskStatus = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      onTaskUpdate({ ...task, completed: !task.completed });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tablero Kanban
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {tasks.length} tareas totales • {tasks.filter(t => t.completed).length} completadas
          </div>
        </div>
        
        <button
          onClick={() => onTaskCreate('todo')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva tarea</span>
        </button>
      </div>

      {/* Tablero de columnas */}
      <div className="flex-1 flex space-x-6 overflow-x-auto pb-4">
        {columns.map(column => (
          <div
            key={column.id}
            className="flex-shrink-0 w-80"
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Header de columna */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {column.title}
                </h3>
                <span className="px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                  {column.count}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onTaskCreate(column.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Agregar tarea"
                >
                  <Plus className="h-4 w-4" />
                </button>
                
                <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Lista de tareas */}
            <div
              className={`
                min-h-[600px] p-4 rounded-lg transition-all duration-200
                ${column.color}
                ${dragOverColumn === column.id ? 'ring-2 ring-blue-500 ring-inset bg-blue-50 dark:bg-blue-900/20' : ''}
              `}
            >
              <div className="space-y-3">
                {column.tasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onClick={() => onTaskEdit(task)}
                    className={`
                      bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
                      p-4 cursor-pointer hover:shadow-md transition-all duration-200
                      ${draggedTask?.id === task.id ? 'opacity-50 rotate-2 scale-105' : ''}
                      ${isOverdue(task) ? 'ring-2 ring-red-200 dark:ring-red-800' : ''}
                    `}
                  >
                    {/* Checkbox y título */}
                    <div className="flex items-start space-x-3 mb-3">
                      <div 
                        className={`
                          w-4 h-4 rounded border-2 flex items-center justify-center mt-1 cursor-pointer
                          ${task.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                          }
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleTaskStatus(task.id);
                        }}
                      >
                        {task.completed && (
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className={`
                          font-medium text-sm leading-tight
                          ${task.completed 
                            ? 'text-gray-500 dark:text-gray-400 line-through' 
                            : 'text-gray-900 dark:text-white'
                          }
                        `}>
                          {task.title}
                        </h4>
                        
                        {task.description && (
                          <p className={`
                            text-xs mt-1 leading-relaxed
                            ${task.completed 
                              ? 'text-gray-400 dark:text-gray-500 line-through' 
                              : 'text-gray-600 dark:text-gray-400'
                            }
                          `}>
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {task.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                          >
                            <Tag className="w-2.5 h-2.5 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {task.tags.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                            +{task.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer con fecha y prioridad */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {task.due_date && (
                          <div className={`
                            flex items-center space-x-1 text-xs
                            ${isOverdue(task) 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-gray-500 dark:text-gray-400'
                            }
                          `}>
                            {isOverdue(task) && <AlertCircle className="w-3 h-3" />}
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(task.due_date)}</span>
                          </div>
                        )}
                      </div>

                      {task.priority && (
                        <span className={`
                          text-xs px-2 py-1 rounded font-medium
                          ${getPriorityColor(task.priority)}
                        `}>
                          {getPriorityText(task.priority)}
                        </span>
                      )}
                    </div>

                    {/* Categoría */}
                    {task.category && (
                      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                          {task.category}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Estado vacío */}
                {column.tasks.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      No hay tareas
                    </p>
                    <button
                      onClick={() => onTaskCreate(column.id)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      Crear primera tarea
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
