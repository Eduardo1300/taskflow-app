import { supabase } from '../lib/supabase';

export interface Comment {
  id: string;
  task_id: number;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: {
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface CreateCommentData {
  task_id: number;
  content: string;
}

class CommentService {
  // Obtener comentarios de una tarea
  async getCommentsByTask(taskId: number): Promise<Comment[]> {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select(`
          *,
          author:profiles!user_id (
            name:full_name,
            email,
            avatar_url
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCommentsByTask:', error);
      throw error;
    }
  }

  // Crear un nuevo comentario
  async createComment(commentData: CreateCommentData): Promise<Comment> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('task_comments')
        .insert({
          ...commentData,
          user_id: user.id,
        })
        .select(`
          *,
          author:profiles!user_id (
            name:full_name,
            email,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error creating comment:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createComment:', error);
      throw error;
    }
  }

  // Actualizar comentario
  async updateComment(commentId: string, content: string): Promise<Comment> {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .update({ 
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select(`
          *,
          author:profiles!user_id (
            name:full_name,
            email,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error updating comment:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateComment:', error);
      throw error;
    }
  }

  // Eliminar comentario
  async deleteComment(commentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('task_comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Error deleting comment:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteComment:', error);
      throw error;
    }
  }

  // Suscribirse a cambios en comentarios de una tarea
  subscribeToTaskComments(taskId: number, callback: (comments: Comment[]) => void) {
    const subscription = supabase
      .channel(`task_comments_${taskId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_comments',
          filter: `task_id=eq.${taskId}`,
        },
        () => {
          // Recargar comentarios cuando hay cambios
          this.getCommentsByTask(taskId).then(callback);
        }
      )
      .subscribe();

    return subscription;
  }
}

export const commentService = new CommentService();
