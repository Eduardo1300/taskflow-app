import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, X, Eye, AlertTriangle, Clock, Zap } from 'lucide-react';

interface LocalNotification {
  id: string;
  type: 'task_due' | 'task_overdue' | 'collaboration' | 'system' | 'achievement';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose
}) => {
  const [notifications, setNotifications] = useState<LocalNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Generar notificaciones de ejemplo
  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      generateMockNotifications();
    }
  }, [isOpen, notifications.length]);

  const generateMockNotifications = () => {
    const mockNotifications: LocalNotification[] = [
      {
        id: '1',
        type: 'task_overdue',
        title: 'Tarea Vencida',
        message: 'Revisar propuesta de proyecto venció hace 2 días',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        read: false,
        priority: 'high'
      },
      {
        id: '2',
        type: 'task_due',
        title: 'Tarea Vence Hoy',
        message: 'Completar informe mensual - vence hoy a las 18:00',
        timestamp: new Date(),
        read: false,
        priority: 'high'
      },
      {
        id: '3',
        type: 'achievement',
        title: '🎉 ¡Logro Desbloqueado!',
        message: 'Has completado 10 tareas esta semana. ¡Excelente trabajo!',
        timestamp: new Date(),
        read: false,
        priority: 'low'
      },
      {
        id: '4',
        type: 'system',
        title: 'Atención Requerida',
        message: 'Tienes 3 tareas de alta prioridad pendientes',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: true,
        priority: 'medium'
      }
    ];

    setNotifications(mockNotifications);
    const unread = mockNotifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  };

  const handleMarkAsRead = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleDeleteNotification = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const wasUnread = notifications.find(n => n.id === notificationId)?.read === false;
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type: LocalNotification['type']) => {
    switch (type) {
      case 'task_overdue':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'task_due':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'achievement':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'system':
        return <Bell className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Hace unos segundos';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return date.toLocaleDateString('es-ES');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-16 right-4 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 z-50 max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notificaciones
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Marcar todas como leídas"
              >
                <CheckCheck className="h-4 w-4" />
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No hay notificaciones</p>
              <p className="text-sm">Te notificaremos sobre actividades importantes</p>
            </div>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`
                    p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer group transition-colors
                    ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-blue-500' : ''}
                  `}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icono de tipo */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex-shrink-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                          title="Marcar como leída"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        title="Eliminar"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {!notification.read && (
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
