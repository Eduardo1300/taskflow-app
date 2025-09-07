import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Download, 
  Trash2, 
  Moon, 
  Sun, 
  Save,
  AlertTriangle
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface NotificationSettings {
  email: boolean;
  push: boolean;
  taskReminders: boolean;
  weeklyDigest: boolean;
  collaborationUpdates: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  showEmail: boolean;
  allowCollaboration: boolean;
  dataAnalytics: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    taskReminders: true,
    weeklyDigest: false,
    collaborationUpdates: true
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'private',
    showEmail: false,
    allowCollaboration: true,
    dataAnalytics: true
  });

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: theme as 'light' | 'dark',
    language: 'es',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'dd/mm/yyyy',
    timeFormat: '24h'
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Aquí iría la lógica para guardar configuraciones
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aplicar configuraciones de apariencia
      if (appearance.theme !== theme) {
        setTheme(appearance.theme);
      }
      
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    // Lógica para exportar datos
    console.log('Exporting user data...');
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    // Lógica para eliminar cuenta
    console.log('Deleting account...');
    setShowDeleteConfirm(false);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'privacy', label: 'Privacidad', icon: Shield },
    { id: 'appearance', label: 'Apariencia', icon: Palette },
    { id: 'data', label: 'Datos', icon: Download }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl ml-16 w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuración</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Personaliza tu experiencia en TaskFlow
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="flex space-x-6">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <nav className="p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors mb-1 ${
                    activeTab === tab.id
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Configuración General
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Idioma
                    </label>
                    <select
                      value={appearance.language}
                      onChange={(e) => setAppearance(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Zona Horaria
                    </label>
                    <select
                      value={appearance.timezone}
                      onChange={(e) => setAppearance(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                      <option value="America/New_York">Nueva York (GMT-5)</option>
                      <option value="Europe/Madrid">Madrid (GMT+1)</option>
                      <option value="Europe/London">Londres (GMT+0)</option>
                      <option value="Asia/Tokyo">Tokio (GMT+9)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Formato de Fecha
                      </label>
                      <select
                        value={appearance.dateFormat}
                        onChange={(e) => setAppearance(prev => ({ ...prev, dateFormat: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                        <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                        <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Formato de Hora
                      </label>
                      <select
                        value={appearance.timeFormat}
                        onChange={(e) => setAppearance(prev => ({ ...prev, timeFormat: e.target.value as '12h' | '24h' }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="24h">24 horas</option>
                        <option value="12h">12 horas (AM/PM)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Notificaciones
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Notificaciones por Email</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Recibe notificaciones en tu correo</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Notificaciones Push</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Notificaciones en tiempo real</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.push}
                      onChange={(e) => setNotifications(prev => ({ ...prev, push: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Recordatorios de Tareas</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Recordatorios antes de fechas límite</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.taskReminders}
                      onChange={(e) => setNotifications(prev => ({ ...prev, taskReminders: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Resumen Semanal</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Resumen de productividad semanal</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.weeklyDigest}
                      onChange={(e) => setNotifications(prev => ({ ...prev, weeklyDigest: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Actualizaciones de Colaboración</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Cuando alguien colabora en tus tareas</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.collaborationUpdates}
                      onChange={(e) => setNotifications(prev => ({ ...prev, collaborationUpdates: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Privacy */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Privacidad y Seguridad
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Visibilidad del Perfil</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value="public"
                          checked={privacy.profileVisibility === 'public'}
                          onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value as 'public' | 'private' }))}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">Público</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value="private"
                          checked={privacy.profileVisibility === 'private'}
                          onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value as 'public' | 'private' }))}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">Privado</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Mostrar Email</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Permitir que otros vean tu email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.showEmail}
                      onChange={(e) => setPrivacy(prev => ({ ...prev, showEmail: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Permitir Colaboración</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Otros pueden invitarte a colaborar</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.allowCollaboration}
                      onChange={(e) => setPrivacy(prev => ({ ...prev, allowCollaboration: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Análisis de Datos</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Ayúdanos a mejorar con datos anónimos</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.dataAnalytics}
                      onChange={(e) => setPrivacy(prev => ({ ...prev, dataAnalytics: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Apariencia
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Tema</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setAppearance(prev => ({ ...prev, theme: 'light' }))}
                        className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                          appearance.theme === 'light'
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Sun className="h-6 w-6 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Claro</span>
                      </button>

                      <button
                        onClick={() => setAppearance(prev => ({ ...prev, theme: 'dark' }))}
                        className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                          appearance.theme === 'dark'
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Moon className="h-6 w-6 text-indigo-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Oscuro</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Management */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Gestión de Datos
                </h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Download className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-medium text-blue-900 dark:text-blue-100">Exportar Datos</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Descarga una copia de todos tus datos en formato JSON
                        </p>
                        <button
                          onClick={handleExportData}
                          className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                        >
                          Exportar Datos
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-medium text-red-900 dark:text-red-100">Eliminar Cuenta</h3>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          Elimina permanentemente tu cuenta y todos los datos asociados
                        </p>
                        <button
                          onClick={handleDeleteAccount}
                          className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                        >
                          Eliminar Cuenta
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                ¿Eliminar cuenta?
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Esta acción no se puede deshacer. Se eliminarán permanentemente todos tus datos, 
              tareas, y configuraciones.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteAccount}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Eliminar Cuenta
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default SettingsPage;
