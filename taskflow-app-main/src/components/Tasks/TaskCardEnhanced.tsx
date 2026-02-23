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
import { useState, useRef, useEffect } from 'react';
import { Task } from '../../types/database';

const getTagsArray = (tags: string | string[] | undefined): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  return tags.split(',').filter(t => t.trim());
};

interface TaskCardProps {
  task: Task;
  onToggleStatus: (id: number) => void;
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onToggleFavorite?: (id: number) => void;
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
  onToggleFavorite,
  onShare,
  isShared = false,
  userPermission = 'owner',
  commentsCount = 0,
  attachmentsCount = 0,
  assignedUsers = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);

  // Close all other menus when one opens
  useEffect(() => {
    if (isMenuOpen) {
      const closeOtherMenus = () => {
        setIsMenuOpen(false);
      };
      // Dispatch event to close other menus
      window.dispatchEvent(new CustomEvent('closeTaskMenus', { detail: { excludeId: task.id } }));
    }
  }, [isMenuOpen, task.id]);

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

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;
  const isDueSoon = task.due_date && !task.completed && 
    new Date(task.due_date).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoy';
    if (days === 1) return 'Mañana';
    if (days === -1) return 'Ayer';
    if (days < 0) return `Vencida ${Math.abs(days)}d`;
    if (days <= 7) return `En ${days}d`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const tagsArray = getTagsArray(task.tags);

  return (
    <div
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.01] ${
        task.completed ? 'opacity-75' : ''
      } ${isOverdue ? 'ring-2 ring-red-500/30 border-red-200 dark:border-red-800' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Priority Indicator */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${getPriorityColor(task.priority)} rounded-t-2xl`} />
      
      {/* Badges */}
      <div className="absolute top-3 right-3 flex items-center space-x-1">
        {isOverdue && (
          <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow-md flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Vencida
          </div>
        )}
        {isDueSoon && !isOverdue && (
          <div className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full shadow-md flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Urgente
          </div>
        )}
        {isShared && (
          <div className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full shadow-md flex items-center">
            <Users className="h-3 w-3 mr-1" />
            Compartida
          </div>
        )}
      </div>

      <div className="p-5 pt-7">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Checkbox */}
          <button
            onClick={() => onToggleStatus(task.id)}
            className={`flex-shrink-0 mt-0.5 transition-all duration-300 hover:scale-110 ${
              task.completed ? 'text-green-500' : 'text-gray-300 hover:text-green-500 dark:text-gray-600'
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
            <h3 className={`text-lg font-bold text-gray-900 dark:text-white transition-all duration-200 ${
              task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''
            } ${isHovered ? 'text-blue-600 dark:text-blue-400' : ''}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          {/* Actions Menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${
                isHovered || isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {isMenuOpen && (
              <div ref={menuRef} className="absolute right-0 top-10 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-[9999] animate-fade-in">{canEdit && (
                  <button
                    onClick={() => { onEdit(task); setIsMenuOpen(false); }}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-3 text-blue-500" />
                    Editar
                  </button>
                )}
                
                {onShare && (
                  <button
                    onClick={() => { onShare(task); setIsMenuOpen(false); }}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Share2 className="h-4 w-4 mr-3 text-purple-500" />
                    Compartir
                  </button>
                )}

                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (onToggleFavorite) onToggleFavorite(task.id);
                    setIsMenuOpen(false); 
                  }}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Star className={`h-4 w-4 mr-3 ${task.favorite ? 'text-yellow-500 fill-yellow-500' : 'text-yellow-500'}`} />
                  {task.favorite ? 'Quitar de favoritas' : 'Favorita'}
                </button>

                {canDelete && (
                  <>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        console.log('Delete clicked, passing full task:', task);
                        onDelete(task); 
                        setIsMenuOpen(false); 
                      }}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-3" />
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {(tagsArray.length > 0) || task.category ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {task.category && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
                {task.category}
              </span>
            )}
            {tagsArray.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
              >
                <Tag className="h-3 w-3 mr-1 text-gray-400" />
                {tag}
              </span>
            ))}
            {tagsArray.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                +{tagsArray.length - 3}
              </span>
            )}
          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
          {/* Stats */}
          <div className="flex items-center gap-3">
            {/* Comments */}
            {commentsCount > 0 && (
              <div className="flex items-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
                <MessageCircle className="h-4 w-4 mr-1.5" />
                <span className="text-xs font-medium">{commentsCount}</span>
              </div>
            )}

            {/* Attachments */}
            {attachmentsCount > 0 && (
              <div className="flex items-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
                <Paperclip className="h-4 w-4 mr-1.5" />
                <span className="text-xs font-medium">{attachmentsCount}</span>
              </div>
            )}

            {/* Assigned Users */}
            {assignedUsers > 0 && (
              <div className="flex items-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
                <Users className="h-4 w-4 mr-1.5" />
                <span className="text-xs font-medium">{assignedUsers}</span>
              </div>
            )}
          </div>

          {/* Due Date & Priority */}
          <div className="flex items-center gap-3">
            {/* Priority */}
            <div className={`flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold text-white shadow-sm ${
              task.priority === 'high' ? 'bg-gradient-to-r from-red-500 to-red-600' :
              task.priority === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              'bg-gradient-to-r from-green-500 to-green-600'
            }`}>
              {task.priority === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
              {task.priority === 'medium' && <Clock className="h-3 w-3 mr-1" />}
              {task.priority === 'low' && <CheckCircle2 className="h-3 w-3 mr-1" />}
              <span className="capitalize">{task.priority || 'media'}</span>
            </div>

            {/* Due Date */}
            {task.due_date && (
              <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-lg ${
                isOverdue ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' : 
                isDueSoon ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 
                'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50'
              }`}>
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                {formatDate(task.due_date)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
