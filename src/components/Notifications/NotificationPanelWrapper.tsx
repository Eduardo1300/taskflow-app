import React, { useState } from 'react';
import { NotificationPanel } from './NotificationPanel';

export const NotificationPanelWrapper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <NotificationPanel 
        isOpen={isOpen}
        onClose={handleClose}
      />
    </div>
  );
};
