import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  useTasksRealtime, 
  useCollaborationsRealtime, 
  useInvitationsRealtime,
  RealtimeEvent 
} from './useRealtime';

export interface RealtimeNotification {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_shared' | 'invitation_received' | 'collaboration_added';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback((notification: Omit<RealtimeNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: RealtimeNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Mantener solo las últimas 50
    setUnreadCount(prev => prev + 1);

    // Mostrar notificación del navegador si está permitido
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/vite.svg'
      });
    }
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Manejar eventos de tareas
  const handleTaskEvent = useCallback((event: RealtimeEvent) => {
    if (!user) return;

    const { eventType, new: newData, old: oldData } = event;

    switch (eventType) {
      case 'INSERT':
        // Solo notificar si la tarea no fue creada por el usuario actual
        if (newData.user_id !== user.id) {
          addNotification({
            type: 'task_shared',
            title: 'Nueva tarea compartida',
            message: `Se compartió contigo la tarea: ${newData.title}`,
            data: newData
          });
        }
        break;
      case 'UPDATE':
        // Solo notificar si la tarea no fue actualizada por el usuario actual
        if (newData.user_id !== user.id && oldData.title !== newData.title) {
          addNotification({
            type: 'task_updated',
            title: 'Tarea actualizada',
            message: `La tarea "${newData.title}" fue actualizada`,
            data: newData
          });
        }
        break;
    }
  }, [user, addNotification]);

  // Manejar eventos de colaboraciones
  const handleCollaborationEvent = useCallback((event: RealtimeEvent) => {
    if (!user) return;

    const { eventType, new: newData } = event;

    if (eventType === 'INSERT' && newData.user_id === user.id) {
      addNotification({
        type: 'collaboration_added',
        title: 'Colaboración aceptada',
        message: 'Te han agregado como colaborador a una tarea',
        data: newData
      });
    }
  }, [user, addNotification]);

  // Manejar eventos de invitaciones
  const handleInvitationEvent = useCallback((event: RealtimeEvent) => {
    if (!user) return;

    const { eventType, new: newData } = event;

    if (eventType === 'INSERT' && newData.invited_email === user.email) {
      addNotification({
        type: 'invitation_received',
        title: 'Nueva invitación de colaboración',
        message: 'Te han invitado a colaborar en una tarea',
        data: newData
      });
    }
  }, [user, addNotification]);

  // Configurar listeners de tiempo real
  useTasksRealtime(user?.id || '', handleTaskEvent);
  useCollaborationsRealtime(user?.id || '', handleCollaborationEvent);
  useInvitationsRealtime(user?.email || '', handleInvitationEvent);

  // Solicitar permisos de notificación al cargar
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };
};
