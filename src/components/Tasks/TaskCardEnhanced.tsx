import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Trash2, 
  Edit, 
  Share2, 
  Tag, 
  AlertTriangle, 
  Clock, 
  Star,
  MessageCircle,
  Paperclip,
  Users,
  MoreHorizontal
} from 'lucide-react';
import { useState } from 'react';
import { Task } from '../../types/database';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
  onShare?: (task: Task) => void;
  isShared?: boolean;
  userPermission?: 'owner' | 'view' | 'edit' | 'admin';
  commentsCount?: number;
  attachmentsCount?: number;
  assignedUsers?: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onToggleStatus, 
  onDelete, 
  onEdit, 
  onShare,
  isShared = false,
  userPermission = 'owner',
  commentsCount = 0,
  attachmentsCount = 0,
  assignedUsers = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const canEdit = userPermission === 'owner' || userPermission === 'edit' || userPermission === 'admin';
  const canDelete = userPermission === 'owner' || userPermission === 'admin';

  const getPriorityColor = (priority: string | null = 'medium') => {
    const colors = {
      high: 'from-red-500 to-red-600',
      medium: 'from-yellow-500 to-orange-500', 
      low: 'from-green-500 to-green-600'
    };
    return colors[(priority as keyof typeof colors) || 'medium'] || colors.medium;
  };

  const getPriorityIcon = (priority: string | null = 'medium') => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-3 w-3" />;
      case 'medium':
        return <Clock className="h-3 w-3" />;
      case 'low':
        return <CheckCircle2 className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoy';
    if (days === 1) return 'Mañana';
    if (days === -1) return 'Ayer';
    if (days < 0) return `Vencida hace ${Math.abs(days)} días`;
    if (days <= 7) return `En ${days} días`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;
  const isDueSoon = task.due_date && !task.completed && 
    new Date(task.due_date).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000;

  return (
    <div
      className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 transform hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-600 ${
        task.completed ? 'opacity-75' : ''
      } ${isOverdue ? 'ring-2 ring-red-500/20 border-red-200 dark:border-red-800' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Priority Indicator */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getPriorityColor(task.priority)} rounded-t-xl`} />
      
      {/* Overdue Badge */}
      {isOverdue && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-pulse">
          Vencida
        </div>
      )}

      {/* Due Soon Badge */}
      {isDueSoon && !isOverdue && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
          Urgente
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            {/* Checkbox */}
            <button
              onClick={() => onToggleStatus(task.id)}
              className={`flex-shrink-0 transition-all duration-200 hover:scale-110 ${
                task.completed ? 'text-green-500' : 'text-gray-400 hover:text-green-500'
              }`}
            >
              {task.completed ? (
                <CheckCircle2 className="h-6 w-6 drop-shadow-sm" />
              ) : (
                <Circle className="h-6 w-6" />
              )}
            </button>

            {/* Title and Description */}
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-gray-900 dark:text-white transition-all duration-200 ${
                task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
              } ${isHovered ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${
                isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                {canEdit && (
                  <button
                    onClick={() => {
                      onEdit(task);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </button>
                )}
                
                {onShare && (
                  <button
                    onClick={() => {
                      onShare(task);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </button>
                )}

                <button
                  onClick={() => {
                    // Toggle star/favorite
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Favorita
                </button>

                {canDelete && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                    <button
                      onClick={() => {
                        onDelete(task.id);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Category */}
        {task.category && (
          <div className="mb-3">
            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-1" />
              {task.category}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          {/* Left side - Stats */}
          <div className="flex items-center space-x-3">
            {/* Comments */}
            {commentsCount > 0 && (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <MessageCircle className="h-4 w-4 mr-1" />
                <span className="text-xs">{commentsCount}</span>
              </div>
            )}

            {/* Attachments */}
            {attachmentsCount > 0 && (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Paperclip className="h-4 w-4 mr-1" />
                <span className="text-xs">{attachmentsCount}</span>
              </div>
            )}

            {/* Assigned Users */}
            {assignedUsers > 0 && (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Users className="h-4 w-4 mr-1" />
                <span className="text-xs">{assignedUsers}</span>
              </div>
            )}

            {/* Priority Badge */}
            <div className={`flex items-center px-2 py-1 rounded-lg text-xs font-medium text-white bg-gradient-to-r ${getPriorityColor(task.priority)}`}>
              {getPriorityIcon(task.priority)}
              <span className="ml-1 capitalize">{task.priority || 'media'}</span>
            </div>
          </div>

          {/* Right side - Due Date */}
          {task.due_date && (
            <div className={`flex items-center text-xs font-medium ${
              isOverdue ? 'text-red-600 dark:text-red-400' : 
              isDueSoon ? 'text-yellow-600 dark:text-yellow-400' : 
              'text-gray-500 dark:text-gray-400'
            }`}>
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(task.due_date)}
            </div>
          )}
        </div>

        {/* Shared Indicator */}
        {isShared && (
          <div className="absolute top-3 right-3">
            <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
          </div>
        )}

        {/* Progress Bar for Subtasks (placeholder) */}
        {task.completed && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Completada</span>
              <div className="flex items-center space-x-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span>100%</span>
              </div>
            </div>
            <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full w-full transition-all duration-500" />
            </div>
          </div>
        )}
      </div>

      {/* Hover Effect Glow */}
      {isHovered && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
      )}
    </div>
  );
};

export default TaskCard;
