import { useState, useEffect } from 'react';
import { offlineService } from '../services/offlineService';

interface UseOfflineState {
  isOnline: boolean;
  pendingActions: number;
  lastSync: Date | null;
  isConnecting: boolean;
  syncError: string | null;
}

export const useOffline = () => {
  const [state, setState] = useState<UseOfflineState>({
    isOnline: navigator.onLine,
    pendingActions: 0,
    lastSync: null,
    isConnecting: false,
    syncError: null
  });

  useEffect(() => {
    const updateOfflineState = () => {
      const pendingActions = offlineService.getPendingActionsCount();
      const lastSyncTime = offlineService.getLastSyncTime();
      
      setState(prev => ({
        ...prev,
        isOnline: navigator.onLine,
        pendingActions,
        lastSync: lastSyncTime > 0 ? new Date(lastSyncTime) : null
      }));
    };

    const handleOnline = async () => {
      setState(prev => ({ ...prev, isOnline: true, isConnecting: true, syncError: null }));
      
      try {
        const result = await offlineService.syncWithServer();
        
        setState(prev => ({
          ...prev,
          isConnecting: false,
          pendingActions: offlineService.getPendingActionsCount(),
          lastSync: new Date(),
          syncError: result.errors.length > 0 ? result.errors[0] : null
        }));

        // Notificar éxito si se sincronizaron elementos
        if (result.syncedCount > 0) {
          console.log(`✅ Sincronizadas ${result.syncedCount} acciones pendientes`);
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          isConnecting: false,
          syncError: 'Error durante la sincronización'
        }));
      }
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false, isConnecting: false }));
    };

    // Initial state
    updateOfflineState();

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic update of pending actions
    const interval = setInterval(updateOfflineState, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const manualSync = async () => {
    if (!state.isOnline) {
      return { success: false, error: 'No hay conexión a internet' };
    }

    setState(prev => ({ ...prev, isConnecting: true, syncError: null }));

    try {
      const result = await offlineService.syncWithServer();
      
      setState(prev => ({
        ...prev,
        isConnecting: false,
        pendingActions: offlineService.getPendingActionsCount(),
        lastSync: new Date(),
        syncError: result.errors.length > 0 ? result.errors[0] : null
      }));

      return {
        success: result.success,
        syncedCount: result.syncedCount,
        error: result.errors.length > 0 ? result.errors[0] : null
      };
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        syncError: 'Error durante la sincronización manual'
      }));

      return {
        success: false,
        error: 'Error durante la sincronización manual'
      };
    }
  };

  const clearSyncError = () => {
    setState(prev => ({ ...prev, syncError: null }));
  };

  return {
    ...state,
    manualSync,
    clearSyncError
  };
};
