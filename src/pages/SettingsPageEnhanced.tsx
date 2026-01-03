import React, { useState } from 'react';
import { 
  Bell, 
  Shield, 
  Palette, 
  Download, 
  Trash2, 
  Moon, 
  Sun, 
  Save,
  AlertTriangle,
  Eye,
  Users,
  Database,
  Volume2,
  Smartphone,
  Mail,
  CheckCircle
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import MainLayout from '../components/Layout/MainLayout';

interface NotificationSettings {
  email: boolean;
  push: boolean;
  taskReminders: boolean;
  weeklyDigest: boolean;
  collaborationUpdates: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
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

const SettingsPageEnhanced: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    taskReminders: true,
    weeklyDigest: false,
    collaborationUpdates: true,
    soundEnabled: true,
    desktopNotifications: true
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (appearance.theme !== theme) {
        setTheme(appearance.theme);
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    console.log('Exporting user data...');
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    console.log('Deleting account...');
    setShowDeleteConfirm(false);
  };

  const tabs = [
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'appearance', label: 'Apariencia', icon: Palette },
    { id: 'privacy', label: 'Privacidad', icon: Shield },
    { id: 'data', label: 'Datos', icon: Database }
  ];

  return (
    <MainLayout currentPage="settings">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Configuración</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Personaliza tu experiencia y administra tu cuenta
            </p>
          </div>
          
          {saveSuccess && (
            <div className="flex items-center space-x-2 px-4 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span>Cambios guardados exitosamente</span>
            </div>
          )}
          
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sticky top-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Notificaciones</h2>
                
                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Notificaciones por Email</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Recibe resúmenes y alertas en tu correo</p>
                          </div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-6 w-6 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Notificaciones Push</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Alertas en tiempo real en tu dispositivo</p>
                          </div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={(e) => setNotifications(prev => ({ ...prev, push: e.target.checked }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-6 w-6 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Task Reminders */}
                  <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Recordatorios de Tareas</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Recordatorios antes de fechas límite</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.taskReminders}
                        onChange={(e) => setNotifications(prev => ({ ...prev, taskReminders: e.target.checked }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-6 w-6 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Weekly Digest */}
                  <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Resumen Semanal</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Resumen de productividad cada lunes</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.weeklyDigest}
                        onChange={(e) => setNotifications(prev => ({ ...prev, weeklyDigest: e.target.checked }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-6 w-6 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Collaboration Updates */}
                  <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Actualizaciones de Colaboración</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Cuando alguien colabora en tus tareas</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.collaborationUpdates}
                        onChange={(e) => setNotifications(prev => ({ ...prev, collaborationUpdates: e.target.checked }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-6 w-6 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Sound */}
                  <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Volume2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Sonidos de Notificación</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sonido al recibir notificaciones</p>
                          </div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.soundEnabled}
                        onChange={(e) => setNotifications(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-6 w-6 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Desktop Notifications */}
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Notificaciones de Escritorio</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Notificaciones del navegador</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.desktopNotifications}
                        onChange={(e) => setNotifications(prev => ({ ...prev, desktopNotifications: e.target.checked }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-6 w-6 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeTab === 'appearance' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Apariencia</h2>
                
                <div className="space-y-8">
                  {/* Theme Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tema</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setAppearance(prev => ({ ...prev, theme: 'light' }))}
                        className={`p-6 border-2 rounded-xl flex flex-col items-center space-y-3 transition-all duration-200 ${
                          appearance.theme === 'light'
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <Sun className="h-8 w-8 text-yellow-500" />
                        <span className="font-semibold text-gray-900 dark:text-white">Claro</span>
                      </button>

                      <button
                        onClick={() => setAppearance(prev => ({ ...prev, theme: 'dark' }))}
                        className={`p-6 border-2 rounded-xl flex flex-col items-center space-y-3 transition-all duration-200 ${
                          appearance.theme === 'dark'
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <Moon className="h-8 w-8 text-indigo-500" />
                        <span className="font-semibold text-gray-900 dark:text-white">Oscuro</span>
                      </button>
                    </div>
                  </div>

                  {/* Regional Settings */}
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuración Regional</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Idioma
                        </label>
                        <select
                          value={appearance.language}
                          onChange={(e) => setAppearance(prev => ({ ...prev, language: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          >
                            <option value="24h">24 horas</option>
                            <option value="12h">12 horas (AM/PM)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy */}
            {activeTab === 'privacy' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Privacidad y Seguridad</h2>
                
                <div className="space-y-6">
                  {/* Profile Visibility */}
                  <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Visibilidad del Perfil</h3>
                    </div>
                    <div className="space-y-3 ml-11">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value="public"
                          checked={privacy.profileVisibility === 'public'}
                          onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value as 'public' | 'private' }))}
                          className="text-purple-600 focus:ring-purple-500 h-4 w-4"
                        />
                        <span className="ml-3 text-gray-700 dark:text-gray-300 font-medium">Público - Tu perfil es visible para todos</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value="private"
                          checked={privacy.profileVisibility === 'private'}
                          onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value as 'public' | 'private' }))}
                          className="text-purple-600 focus:ring-purple-500 h-4 w-4"
                        />
                        <span className="ml-3 text-gray-700 dark:text-gray-300 font-medium">Privado - Solo colaboradores pueden ver tu perfil</span>
                      </label>
                    </div>
                  </div>

                  {/* Show Email */}
                  <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Mostrar Email</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Permite que otros vean tu dirección de email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacy.showEmail}
                        onChange={(e) => setPrivacy(prev => ({ ...prev, showEmail: e.target.checked }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-6 w-6 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Allow Collaboration */}
                  <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <h3 className="font-semibold text-gray-900 dark:text-white">Permitir Colaboración</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Otros usuarios pueden invitarte a colaborar</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacy.allowCollaboration}
                        onChange={(e) => setPrivacy(prev => ({ ...prev, allowCollaboration: e.target.checked }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-6 w-6 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Data Analytics */}
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Análisis de Datos</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Comparte datos anónimos para ayudarnos a mejorar</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacy.dataAnalytics}
                        onChange={(e) => setPrivacy(prev => ({ ...prev, dataAnalytics: e.target.checked }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-6 w-6 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Management */}
            {activeTab === 'data' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Gestión de Datos</h2>
                
                <div className="space-y-4">
                  {/* Export Data */}
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-blue-600 rounded-lg">
                        <Download className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-lg">Exportar Tus Datos</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                          Descarga una copia completa de tus datos en formato JSON. Incluye todas tus tareas, 
                          proyectos, colaboraciones y configuraciones.
                        </p>
                        <button
                          onClick={handleExportData}
                          className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                          Descargar Datos
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete Account */}
                  <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-red-600 rounded-lg">
                        <Trash2 className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-900 dark:text-red-100 text-lg">Eliminar Cuenta</h3>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                          Elimina permanentemente tu cuenta y todos los datos asociados. Esta acción no se puede deshacer.
                        </p>
                        <button
                          onClick={handleDeleteAccount}
                          className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
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

        {/* Delete Account Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 w-full max-w-md shadow-xl">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg mr-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  ¿Eliminar tu cuenta?
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Esta acción no se puede deshacer. Se eliminarán permanentemente:
              </p>
              
              <ul className="space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <span className="h-2 w-2 bg-red-600 rounded-full mr-3"></span>
                  Todos tus datos y tareas
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 bg-red-600 rounded-full mr-3"></span>
                  Configuraciones y preferencias
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 bg-red-600 rounded-full mr-3"></span>
                  Historial de colaboraciones
                </li>
              </ul>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteAccount}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Eliminar Cuenta
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SettingsPageEnhanced;
