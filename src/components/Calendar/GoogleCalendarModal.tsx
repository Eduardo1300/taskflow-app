import React, { useState, useEffect } from 'react';
import { X, Calendar, Settings, RotateCcw, AlertTriangle, CheckCircle, Clock, Globe } from 'lucide-react';
import { googleCalendarService, SyncSettings, GoogleCalendarListEntry } from '../../services/googleCalendarService';

interface GoogleCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: (result: any) => void;
}

const GoogleCalendarModal: React.FC<GoogleCalendarModalProps> = ({
  isOpen,
  onClose,
  onSync
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [syncSettings, setSyncSettings] = useState<SyncSettings>({
    enabled: false,
    calendars: [],
    syncDirection: 'bidirectional',
    syncFrequency: 15,
    conflictResolution: 'manual'
  });
  const [availableCalendars, setAvailableCalendars] = useState<GoogleCalendarListEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Initialize Google Calendar service
      googleCalendarService.init();
      
      // Check connection status
      const connected = googleCalendarService.isConnected();
      setIsConnected(connected);
      
      // Load sync settings
      const settings = googleCalendarService.getSyncSettings();
      setSyncSettings(settings);
      
      // Load last sync time
      const lastSync = googleCalendarService.getLastSyncTime();
      setLastSyncTime(lastSync);
      
      // If connected, load available calendars
      if (connected) {
        const calendars = await googleCalendarService.getCalendarList();
        setAvailableCalendars(calendars);
      }
    } catch (err) {
      setError('Failed to load Google Calendar data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await googleCalendarService.authenticate();
      if (success) {
        setIsConnected(true);
        const calendars = await googleCalendarService.getCalendarList();
        setAvailableCalendars(calendars);
      } else {
        setError('Failed to connect to Google Calendar. Please try again.');
      }
    } catch (err) {
      setError('Authentication failed. Please check your credentials.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    googleCalendarService.disconnect();
    setIsConnected(false);
    setAvailableCalendars([]);
    setSyncSettings(prev => ({ ...prev, enabled: false, calendars: [] }));
  };

  const handleSyncSettingsChange = (updates: Partial<SyncSettings>) => {
    const newSettings = { ...syncSettings, ...updates };
    setSyncSettings(newSettings);
    googleCalendarService.saveSyncSettings(newSettings);
  };

  const handleCalendarToggle = (calendarId: string) => {
    const newCalendars = syncSettings.calendars.includes(calendarId)
      ? syncSettings.calendars.filter(id => id !== calendarId)
      : [...syncSettings.calendars, calendarId];
    
    handleSyncSettingsChange({ calendars: newCalendars });
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setError(null);
    
    try {
      const result = await googleCalendarService.performSync();
      setLastSyncTime(new Date());
      onSync(result);
      
      if (!result.success) {
        setError(`Sync completed with errors: ${result.errors.join(', ')}`);
      }
    } catch (err) {
      setError('Sync failed. Please try again.');
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Google Calendar Integration
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Sync your events with Google Calendar
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Connection Status */}
          <div className="mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  isConnected 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-gray-100 dark:bg-gray-600'
                }`}>
                  {isConnected ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Globe className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {isConnected ? 'Connected to Google Calendar' : 'Not Connected'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isConnected 
                      ? 'Your TaskFlow calendar can sync with Google Calendar'
                      : 'Connect to enable synchronization'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                {isConnected ? (
                  <>
                    <button
                      onClick={handleManualSync}
                      disabled={isSyncing || isLoading}
                      className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RotateCcw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                    <button
                      onClick={handleDisconnect}
                      className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleConnect}
                    disabled={isLoading}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {isLoading ? 'Connecting...' : 'Connect Google Calendar'}
                  </button>
                )}
              </div>
            </div>

            {/* Last Sync Time */}
            {lastSyncTime && (
              <div className="mt-3 flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4 mr-2" />
                Last synced: {lastSyncTime.toLocaleString()}
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Sync Settings */}
          {isConnected && (
            <div className="space-y-6">
              {/* Enable Sync */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Enable Automatic Sync
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Automatically sync events between TaskFlow and Google Calendar
                    </p>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncSettings.enabled}
                    onChange={(e) => handleSyncSettingsChange({ enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Sync Direction */}
              {syncSettings.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Sync Direction
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { 
                          value: 'import', 
                          label: 'Import Only', 
                          description: 'Bring Google Calendar events to TaskFlow',
                          icon: '⬇️' 
                        },
                        { 
                          value: 'export', 
                          label: 'Export Only', 
                          description: 'Send TaskFlow events to Google Calendar',
                          icon: '⬆️' 
                        },
                        { 
                          value: 'bidirectional', 
                          label: 'Both Ways', 
                          description: 'Sync events in both directions',
                          icon: '↕️' 
                        }
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => handleSyncSettingsChange({ syncDirection: option.value as any })}
                          className={`p-4 text-left border rounded-xl transition-all ${
                            syncSettings.syncDirection === option.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-xl">{option.icon}</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {option.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {option.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sync Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Sync Frequency
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[5, 15, 30, 60].map(minutes => (
                        <button
                          key={minutes}
                          onClick={() => handleSyncSettingsChange({ syncFrequency: minutes })}
                          className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                            syncSettings.syncFrequency === minutes
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          {minutes}m
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calendar Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Select Calendars to Sync
                    </label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {availableCalendars.map(calendar => (
                        <div
                          key={calendar.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: calendar.backgroundColor }}
                            ></div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {calendar.summary}
                              </p>
                              {calendar.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {calendar.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  calendar.accessRole === 'owner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                  calendar.accessRole === 'writer' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {calendar.accessRole}
                                </span>
                                {calendar.primary && (
                                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
                                    Primary
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={syncSettings.calendars.includes(calendar.id)}
                              onChange={() => handleCalendarToggle(calendar.id)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Conflict Resolution */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Conflict Resolution
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { 
                          value: 'local', 
                          label: 'TaskFlow Wins', 
                          description: 'Keep TaskFlow version when conflicts occur',
                          icon: '🏠' 
                        },
                        { 
                          value: 'remote', 
                          label: 'Google Wins', 
                          description: 'Keep Google Calendar version when conflicts occur',
                          icon: '☁️' 
                        },
                        { 
                          value: 'manual', 
                          label: 'Ask Me', 
                          description: 'Prompt for decision on each conflict',
                          icon: '❓' 
                        }
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => handleSyncSettingsChange({ conflictResolution: option.value as any })}
                          className={`p-3 text-left border rounded-lg transition-all ${
                            syncSettings.conflictResolution === option.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <span>{option.icon}</span>
                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                              {option.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {option.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Close
            </button>
            {isConnected && syncSettings.enabled && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleCalendarModal;
