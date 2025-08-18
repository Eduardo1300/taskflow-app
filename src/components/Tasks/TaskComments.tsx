import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, User, Clock, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { commentService, Comment } from '../../services/commentService';

interface TaskCommentsProps {
  taskId: number;
  onCommentsCountChange?: (count: number) => void;
}

export const TaskComments: React.FC<TaskCommentsProps> = ({ 
  taskId, 
  onCommentsCountChange 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const { user } = useAuth();

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} d`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Cargar comentarios
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const fetchedComments = await commentService.getCommentsByTask(taskId);
        setComments(fetchedComments);
        onCommentsCountChange?.(fetchedComments.length);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    if (taskId) {
      fetchComments();
      
      // Suscribirse a cambios en tiempo real
      const subscription = commentService.subscribeToTaskComments(taskId, (updatedComments) => {
        setComments(updatedComments);
        onCommentsCountChange?.(updatedComments.length);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [taskId, onCommentsCountChange]);

  // Agregar comentario
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !user) return;

    setIsLoading(true);
    
    try {
      const comment = await commentService.createComment({
        task_id: taskId,
        content: newComment.trim()
      });
      
      setComments(prev => [comment, ...prev]);
      onCommentsCountChange?.(comments.length + 1);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Editar comentario
  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const updatedComment = await commentService.updateComment(commentId, editContent.trim());
      setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
      setEditingCommentId(null);
      setEditContent('');
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  // Eliminar comentario
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) return;

    try {
      await commentService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      onCommentsCountChange?.(comments.length - 1);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Iniciar edición
  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Comentarios ({comments.length})
        </h3>
      </div>

      {/* Formulario para nuevo comentario */}
      <form onSubmit={handleAddComment} className="space-y-3">
        <div className="relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Añade un comentario..."
            rows={3}
            className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     placeholder-gray-500 dark:placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     resize-none"
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newComment.trim() || isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 
                     disabled:bg-blue-400 text-white text-sm font-medium rounded-lg 
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Send className="h-4 w-4" />
            <span>{isLoading ? 'Enviando...' : 'Comentar'}</span>
          </button>
        </div>
      </form>

      {/* Lista de comentarios */}
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay comentarios aún</p>
            <p className="text-sm">Sé el primero en comentar</p>
          </div>
        ) : (
          comments.map(comment => (
            <div
              key={comment.id}
              className="flex space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group"
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {comment.author?.avatar_url ? (
                  <img 
                    src={comment.author.avatar_url} 
                    alt={comment.author.name || 'Usuario'}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {comment.author?.name || 'Usuario'}
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(comment.created_at)}</span>
                      {comment.updated_at !== comment.created_at && (
                        <span className="text-gray-400">(editado)</span>
                      )}
                    </div>
                  </div>

                  {/* Opciones de comentario (solo para el autor) */}
                  {user?.id === comment.user_id && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => startEditing(comment)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Editar comentario"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar comentario"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {editingCommentId === comment.id ? (
                  /* Formulario de edición */
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={2}
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditContent('');
                        }}
                        className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleEditComment(comment.id)}
                        className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Contenido del comentario */
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
