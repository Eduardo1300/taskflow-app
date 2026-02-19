import api from '../lib/api';

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
  data?: any;
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
  async getUserNotifications(limit: number = 20): Promise<Notification[]> {
    try {
      const notifications = await api.getNotifications();
      return notifications || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    try {
      const notifications = await api.getNotifications();
      return (notifications || []).filter(n => !n.read);
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const notifications = await api.getNotifications();
      return (notifications || []).filter(n => !n.read).length;
    } catch (error) {
      console.error('Error counting unread notifications:', error);
      return 0;
    }
  }

  async createNotification(notificationData: CreateNotificationData): Promise<Notification> {
    console.log('[NotificationService] Notification created:', notificationData);
    return {} as Notification;
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await api.markNotificationRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      const notifications = await api.getNotifications();
      for (const n of notifications || []) {
        if (!n.read) {
          await api.markNotificationRead(n.id);
        }
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await api.deleteNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  async createTaskAssignedNotification(
    assignedUserId: string, 
    taskTitle: string, 
    taskId: number, 
    assignedByUserId: string
  ): Promise<void> {
    console.log('[NotificationService] Task assigned notification:', { assignedUserId, taskTitle, taskId });
  }

  async createTaskCompletedNotification(
    userId: string, 
    taskTitle: string, 
    taskId: number, 
    completedByUserId: string
  ): Promise<void> {
    console.log('[NotificationService] Task completed notification:', { userId, taskTitle, taskId });
  }

  async createCommentNotification(
    userId: string, 
    taskTitle: string, 
    taskId: number, 
    commentAuthorId: string,
    commentPreview: string
  ): Promise<void> {
    console.log('[NotificationService] Comment notification:', { userId, taskTitle, taskId });
  }

  async createTaskDueSoonNotification(
    userId: string, 
    taskTitle: string, 
    taskId: number, 
    dueDate: string
  ): Promise<void> {
    console.log('[NotificationService] Task due soon notification:', { userId, taskTitle, taskId, dueDate });
  }

  getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'task_assigned': return '👤';
      case 'task_completed': return '✅';
      case 'task_due_soon': return '⏰';
      case 'comment_added': return '💬';
      case 'task_updated': return '📝';
      default: return '🔔';
    }
  }

  getNotificationColor(type: Notification['type']): string {
    switch (type) {
      case 'task_assigned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'task_completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'task_due_soon': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200';
      case 'comment_added': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200';
      case 'task_updated': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
    }
  }

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

  subscribeToUserNotifications(callback: (notifications: Notification[]) => void) {
    console.log('[NotificationService] Subscribed to notifications');
    return { unsubscribe: () => {} };
  }

  async checkDueTasks(): Promise<void> {
    console.log('[NotificationService] Checking due tasks');
  }
}

export const notificationService = new NotificationService();
