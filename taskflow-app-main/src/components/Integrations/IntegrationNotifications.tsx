import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Zap } from 'lucide-react';

interface IntegrationNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  integration?: string;
}

const IntegrationNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<IntegrationNotification[]>([]);

  useEffect(() => {
    // Escuchar eventos de integraciones
    const handleIntegrationEvent = (event: CustomEvent) => {
      const { type, title, message, integration } = event.detail;
      
      const newNotification: IntegrationNotification = {
        id: Date.now().toString(),
        type,
        title,
        message,
        integration
      };

      setNotifications(prev => [...prev, newNotification]);

      // Auto-remover después de 5 segundos
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    };

    window.addEventListener('integrationEvent', handleIntegrationEvent as EventListener);

    return () => {
      window.removeEventListener('integrationEvent', handleIntegrationEvent as EventListener);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'error': return AlertCircle;
      default: return Zap;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'success': 
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'error': 
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      default: 
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => {
        const Icon = getIcon(notification.type);
        return (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border shadow-lg transform transition-all duration-300 animate-slide-in ${getColors(notification.type)}`}
          >
            <div className="flex items-start">
              <Icon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">
                    {notification.title}
                  </p>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="ml-2 p-1 hover:bg-black hover:bg-opacity-10 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm opacity-90">
                  {notification.message}
                </p>
                {notification.integration && (
                  <p className="text-xs opacity-75 mt-1">
                    {notification.integration}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Función helper para disparar notificaciones
export const triggerIntegrationNotification = (
  type: 'success' | 'error' | 'info',
  title: string,
  message: string,
  integration?: string
) => {
  const event = new CustomEvent('integrationEvent', {
    detail: { type, title, message, integration }
  });
  window.dispatchEvent(event);
};

export default IntegrationNotifications;
