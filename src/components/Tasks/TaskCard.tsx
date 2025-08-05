import { CheckCircle, Circle, Calendar, Trash2, Edit } from 'lucide-react';
import { Task } from '../../types/database';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleStatus, onDelete, onEdit }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
      task.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
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
                  ? 'line-through text-gray-500' 
                  : 'text-gray-900'
              } break-words truncate`}>
                {task.title}
              </h3>
              
              <p className={`mt-1 text-sm ${
                task.completed 
                  ? 'text-gray-400' 
                  : 'text-gray-600'
              } break-words truncate`}>
                {task.description || 'Sin descripción'}
              </p>
              
              <div className="flex items-center mt-3 text-xs text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(task.created_at)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => onEdit(task)}
              className="text-gray-400 hover:text-blue-600 transition-colors"
              title="Editar tarea"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="text-gray-400 hover:text-red-600 transition-colors"
              title="Eliminar tarea"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;