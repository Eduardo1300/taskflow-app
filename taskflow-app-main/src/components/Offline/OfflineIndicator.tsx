import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle, 
  Clock 
} from 'lucide-react';
import { useOffline } from '../../hooks/useOffline';

const OfflineIndicator: React.FC = () => {
  const { 
    isOnline, 
    pendingActions, 
    lastSync, 
    isConnecting, 
    syncError,
    manualSync,
    clearSyncError
  } = useOffline();

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Hace unos segundos';
    if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    
    const days = Math.floor(hours / 24);
    return `Hace ${days} día${days > 1 ? 's' : ''}`;
  };

  const getStatusIcon = () => {
    if (isConnecting) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    if (!isOnline) {
      return <WifiOff className="h-4 w-4" />;
    }
    if (syncError) {
      return <AlertCircle className="h-4 w-4" />;
    }
    if (pendingActions > 0) {
      return <Clock className="h-4 w-4" />;
    }
    return <Wifi className="h-4 w-4" />;
  };

  const getStatusColor = () => {
    if (isConnecting) return 'text-blue-600 dark:text-blue-400';
    if (!isOnline) return 'text-red-600 dark:text-red-400';
    if (syncError) return 'text-yellow-600 dark:text-yellow-400';
    if (pendingActions > 0) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getStatusText = () => {
    if (isConnecting) return 'Sincronizando...';
    if (!isOnline) return 'Sin conexión';
    if (syncError) return 'Error de sincronización';
    if (pendingActions > 0) return `${pendingActions} cambio${pendingActions > 1 ? 's' : ''} pendiente${pendingActions > 1 ? 's' : ''}`;
    return 'Sincronizado';
  };

  const getBgColor = () => {
    if (!isOnline) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (syncError) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    if (pendingActions > 0) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  };

  return (
    <div className={`rounded-lg border p-3 ${getBgColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={getStatusColor()}>
            {getStatusIcon()}
          </div>
          <div>
            <p className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Última sincronización: {formatLastSync(lastSync)}
            </p>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          {syncError && (
            <button
              onClick={clearSyncError}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
            >
              Cerrar
            </button>
          )}
          
          {isOnline && (pendingActions > 0 || syncError) && !isConnecting && (
            <button
              onClick={manualSync}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Sincronizar</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Error details */}
      {syncError && (
        <div className="mt-2 pt-2 border-t border-current border-opacity-20">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            {syncError}
          </p>
        </div>
      )}
      
      {/* Offline mode info */}
      {!isOnline && (
        <div className="mt-2 pt-2 border-t border-current border-opacity-20">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Trabajando en modo offline. Los cambios se sincronizarán automáticamente cuando se restaure la conexión.
          </p>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;
