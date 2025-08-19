import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Trash2
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'task_due' | 'task_overdue' | 'collaboration' | 'system' | 'achievement';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationCenterProps {
  tasks: any[];
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ tasks, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    generateNotifications();
  }, [tasks]);

  const generateNotifications = () => {
    const newNotifications: Notification[] = [];
    const now = new Date();
    const today = new Date(now.setHours(23, 59, 59, 999));
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Tareas vencidas
    tasks.forEach(task => {
      if (task.due_date && new Date(task.due_date) < now && !task.completed) {
        const daysOverdue = Math.floor((now.getTime() - new Date(task.due_date).getTime()) / (1000 * 60 * 60 * 24));
        newNotifications.push({
          id: `overdue-${task.id}`,
          type: 'task_overdue',
          title: 'Tarea Vencida',
          message: `"${task.title}" venció hace ${daysOverdue} día${daysOverdue > 1 ? 's' : ''}`,
          timestamp: new Date(task.due_date),
          read: false,
          priority: 'high'
        });
      }
    });

    // Tareas que vencen hoy
    tasks.forEach(task => {
      if (task.due_date && !task.completed) {
        const dueDate = new Date(task.due_date);
        if (dueDate >= now && dueDate <= today) {
          newNotifications.push({
            id: `due-today-${task.id}`,
            type: 'task_due',
            title: 'Tarea Vence Hoy',
            message: `"${task.title}" vence hoy`,
            timestamp: new Date(),
            read: false,
            priority: 'high'
          });
        }
      }
    });

    // Tareas que vencen mañana
    tasks.forEach(task => {
      if (task.due_date && !task.completed) {
        const dueDate = new Date(task.due_date);
        if (dueDate >= today && dueDate <= tomorrow) {
          newNotifications.push({
            id: `due-tomorrow-${task.id}`,
            type: 'task_due',
            title: 'Tarea Vence Mañana',
            message: `"${task.title}" vence mañana`,
            timestamp: new Date(),
            read: false,
            priority: 'medium'
          });
        }
      }
    });

    // Logros y objetivos
    const completedToday = tasks.filter(task => {
      if (!task.completed || !task.updated_at) return false;
      const completedDate = new Date(task.updated_at);
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      return completedDate >= startOfDay;
    });

    if (completedToday.length >= 5) {
      newNotifications.push({
        id: `achievement-daily-${now.getDate()}`,
        type: 'achievement',
        title: '🎉 ¡Logro Desbloqueado!',
        message: `Has completado ${completedToday.length} tareas hoy. ¡Excelente trabajo!`,
        timestamp: new Date(),
        read: false,
        priority: 'low'
      });
    }

    // Tareas de alta prioridad sin completar
    const highPriorityPending = tasks.filter(task => 
      task.priority === 'high' && !task.completed
    ).length;

    if (highPriorityPending >= 3) {
      newNotifications.push({
        id: `high-priority-alert`,
        type: 'system',
        title: 'Atención Requerida',
        message: `Tienes ${highPriorityPending} tareas de alta prioridad pendientes`,
        timestamp: new Date(),
        read: false,
        priority: 'medium'
      });
    }

    // Ordenar por prioridad y fecha
    newNotifications.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    setNotifications(newNotifications);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(n => n.id !== notificationId)
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task_due':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'task_overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'collaboration':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'achievement':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'system':
        return <Bell className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `hace ${minutes} min`;
    if (hours < 24) return `hace ${hours}h`;
    if (days < 7) return `hace ${days}d`;
    return timestamp.toLocaleDateString();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notificaciones
              </h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Marcar todo como leído
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No tienes notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium ${
                              notification.read 
                                ? 'text-gray-900 dark:text-white' 
                                : 'text-blue-900 dark:text-blue-100'
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-1">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                  title="Marcar como leído"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </button>
                              )}
                              <button
                                onClick={() => removeNotification(notification.id)}
                                className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <p className={`text-sm mt-1 ${
                            notification.read 
                              ? 'text-gray-600 dark:text-gray-400' 
                              : 'text-blue-700 dark:text-blue-300'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
