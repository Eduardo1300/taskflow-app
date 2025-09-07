import React, { useState } from 'react';
import { NotificationPanel } from './NotificationPanel';
import { Notification } from '../../services/notificationService';

export const NotificationPanelWrapper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleNotificationClick = (_: Notification) => {
    // Aquí puedes agregar lógica para manejar el click en notificaciones
  };

  return (
    <div>
      <NotificationPanel 
        isOpen={isOpen}
        onClose={handleClose}
        onNotificationClick={handleNotificationClick}
      />
    </div>
  );
};
