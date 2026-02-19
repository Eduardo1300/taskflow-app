import { CheckCircle, Circle, Calendar, Trash2, Edit, Users, Share2, Tag, AlertTriangle, Clock } from 'lucide-react';
import { Task } from '../../types/database';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
  onShare?: (task: Task) => void;
  isShared?: boolean;
  userPermission?: 'owner' | 'view' | 'edit' | 'admin';
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onToggleStatus, 
  onDelete, 
  onEdit, 
  onShare,
  isShared = false,
  userPermission = 'owner'
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-3 w-3" />;
      case 'medium': return <Clock className="h-3 w-3" />;
      case 'low': return <Circle className="h-3 w-3" />;
      default: return null;
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;
  
  const canEdit = userPermission === 'owner' || userPermission === 'edit' || userPermission === 'admin';
  const canDelete = userPermission === 'owner';
  const canShare = userPermission === 'owner';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
      task.completed ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'
    }`}>
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <button
              onClick={() => onToggleStatus(task.id)}
              className={`mt-1 transition-colors ${
                task.completed 
                  ? 'text-green-600 hover:text-green-700' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {task.completed ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <h3 className={`text-base md:text-lg font-semibold ${
                task.completed 
                  ? 'line-through text-gray-500 dark:text-gray-400' 
                  : 'text-gray-900 dark:text-white'
              } break-words truncate`}>
                {task.title}
              </h3>
              
              <p className={`mt-1 text-sm ${
                task.completed 
                  ? 'text-gray-400 dark:text-gray-500' 
                  : 'text-gray-600 dark:text-gray-300'
              } break-words truncate`}>
                {task.description || 'Sin descripción'}
              </p>

              {/* Category */}
              {task.category && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {task.category}
                  </span>
                </div>
              )}

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {task.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Priority and Due Date */}
              <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(task.created_at)}
                  </div>
                  
                  {task.priority && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {getPriorityIcon(task.priority)}
                      <span className="ml-1 capitalize">{task.priority}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {task.due_date && (
                    <div className={`flex items-center text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(task.due_date)}
                      {isOverdue && ' (Vencida)'}
                    </div>
                  )}
                  
                  {isShared && (
                    <div className="flex items-center text-xs text-blue-600">
                      <Users className="h-3 w-3 mr-1" />
                      Compartida
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            {canShare && onShare && (
              <button
                onClick={() => onShare(task)}
                className="text-gray-400 hover:text-green-600 transition-colors"
                title="Compartir tarea"
              >
                <Share2 className="h-4 w-4" />
              </button>
            )}
            
            {canEdit && (
              <button
                onClick={() => onEdit(task)}
                className="text-gray-400 hover:text-blue-600 transition-colors"
                title="Editar tarea"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            
            {canDelete && (
              <button
                onClick={() => onDelete(task.id)}
                className="text-gray-400 hover:text-red-600 transition-colors"
                title="Eliminar tarea"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;