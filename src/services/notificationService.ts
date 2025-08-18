import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: 'task_assigned' | 'task_completed' | 'task_due_soon' | 'comment_added' | 'task_updated';
  title: string;
  message: string;
  task_id?: number;
  related_user_id?: string;
  read: boolean;
  created_at: string;
  data?: any; // Datos adicionales específicos del tipo de notificación
}

export interface CreateNotificationData {
  user_id: string;
  type: Notification['type'];
  title: string;
  message: string;
  task_id?: number;
  related_user_id?: string;
  data?: any;
}

class NotificationService {
  // Obtener notificaciones de un usuario
  async getUserNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserNotifications:', error);
      throw error;
    }
  }

  // Obtener notificaciones no leídas
  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching unread notifications:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUnreadNotifications:', error);
      throw error;
    }
  }

  // Contar notificaciones no leídas
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error counting unread notifications:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      throw error;
    }
  }

  // Crear notificación
  async createNotification(notificationData: CreateNotificationData): Promise<Notification> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notificationData,
          read: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createNotification:', error);
      throw error;
    }
  }

  // Marcar notificación como leída
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in markAsRead:', error);
      throw error;
    }
  }

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      throw error;
    }
  }

  // Eliminar notificación
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      throw error;
    }
  }

  // Crear notificación de tarea asignada
  async createTaskAssignedNotification(
    assignedUserId: string, 
    taskTitle: string, 
    taskId: number, 
    assignedByUserId: string
  ): Promise<void> {
    try {
      await this.createNotification({
        user_id: assignedUserId,
        type: 'task_assigned',
        title: 'Tarea asignada',
        message: `Se te ha asignado la tarea: ${taskTitle}`,
        task_id: taskId,
        related_user_id: assignedByUserId,
      });
    } catch (error) {
      console.error('Error creating task assigned notification:', error);
    }
  }

  // Crear notificación de tarea completada
  async createTaskCompletedNotification(
    userId: string, 
    taskTitle: string, 
    taskId: number, 
    completedByUserId: string
  ): Promise<void> {
    try {
      await this.createNotification({
        user_id: userId,
        type: 'task_completed',
        title: 'Tarea completada',
        message: `La tarea "${taskTitle}" ha sido completada`,
        task_id: taskId,
        related_user_id: completedByUserId,
      });
    } catch (error) {
      console.error('Error creating task completed notification:', error);
    }
  }

  // Crear notificación de comentario agregado
  async createCommentNotification(
    userId: string, 
    taskTitle: string, 
    taskId: number, 
    commentAuthorId: string,
    commentPreview: string
  ): Promise<void> {
    try {
      await this.createNotification({
        user_id: userId,
        type: 'comment_added',
        title: 'Nuevo comentario',
        message: `Nuevo comentario en "${taskTitle}": ${commentPreview.substring(0, 50)}${commentPreview.length > 50 ? '...' : ''}`,
        task_id: taskId,
        related_user_id: commentAuthorId,
        data: { comment_preview: commentPreview }
      });
    } catch (error) {
      console.error('Error creating comment notification:', error);
    }
  }

  // Crear notificación de tarea próxima a vencer
  async createTaskDueSoonNotification(
    userId: string, 
    taskTitle: string, 
    taskId: number, 
    dueDate: string
  ): Promise<void> {
    try {
      const dueDateObj = new Date(dueDate);
      const hoursUntilDue = Math.ceil((dueDateObj.getTime() - Date.now()) / (1000 * 60 * 60));
      
      await this.createNotification({
        user_id: userId,
        type: 'task_due_soon',
        title: 'Tarea próxima a vencer',
        message: `La tarea "${taskTitle}" vence en ${hoursUntilDue} horas`,
        task_id: taskId,
        data: { hours_until_due: hoursUntilDue, due_date: dueDate }
      });
    } catch (error) {
      console.error('Error creating task due soon notification:', error);
    }
  }

  // Obtener icono para tipo de notificación
  getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'task_assigned':
        return '👤';
      case 'task_completed':
        return '✅';
      case 'task_due_soon':
        return '⏰';
      case 'comment_added':
        return '💬';
      case 'task_updated':
        return '📝';
      default:
        return '🔔';
    }
  }

  // Obtener color para tipo de notificación
  getNotificationColor(type: Notification['type']): string {
    switch (type) {
      case 'task_assigned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'task_completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'task_due_soon':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200';
      case 'comment_added':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200';
      case 'task_updated':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
    }
  }

  // Formatear tiempo relativo
  formatTimeAgo(dateString: string): string {
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
  }

  // Suscribirse a notificaciones de un usuario
  subscribeToUserNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const subscription = supabase
      .channel(`user_notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Recargar notificaciones cuando hay nuevas
          this.getUserNotifications(userId).then(callback);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Recargar notificaciones cuando se actualizan
          this.getUserNotifications(userId).then(callback);
        }
      )
      .subscribe();

    return subscription;
  }

  // Verificar y crear notificaciones para tareas próximas a vencer
  async checkDueTasks(): Promise<void> {
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignments:task_assignments (
            user_id
          )
        `)
        .eq('completed', false)
        .not('due_date', 'is', null);

      if (error) {
        console.error('Error checking due tasks:', error);
        return;
      }

      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      for (const task of tasks || []) {
        const dueDate = new Date(task.due_date);
        
        // Si la tarea vence en las próximas 24 horas
        if (dueDate <= tomorrow && dueDate > now) {
          // Notificar a todos los usuarios asignados
          const assignments = task.assignments || [];
          for (const assignment of assignments) {
            await this.createTaskDueSoonNotification(
              assignment.user_id,
              task.title,
              task.id,
              task.due_date
            );
          }
        }
      }
    } catch (error) {
      console.error('Error in checkDueTasks:', error);
    }
  }
}

export const notificationService = new NotificationService();
