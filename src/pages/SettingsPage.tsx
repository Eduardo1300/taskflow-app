import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import SidebarEnhanced from '../components/Layout/SidebarEnhanced';
import { 
  Settings, 
  Monitor, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Database
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('settings');
  const [settings, setSettings] = useState({
    theme: 'system',
    notifications: {
      email: true,
      push: true,
      desktop: false,
      sounds: true
    },
    privacy: {
      profileVisible: true,
      activityVisible: false,
      analyticsEnabled: true
    },
    language: 'es',
    timezone: 'Europe/Madrid',
    autoSave: true
  });

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const handleSettingChange = (category: string, key: string, value: any) => {
    if (category === '') {
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...(prev[category as keyof typeof prev] as object),
          [key]: value
        }
      }));
    }
  };

  const handleSave = () => {
    // Aquí iría la lógica para guardar las configuraciones
    console.log('Saving settings:', settings);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      <SidebarEnhanced activeSection={activeSection} onSectionChange={handleSectionChange} isCollapsed={false} />
      <div className="flex-1 flex flex-col lg:ml-72">
        <Header showUserMenu={true} />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Configuración
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Personaliza tu experiencia en TaskFlow
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Settings Menu */}
              <div className="lg:col-span-1">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-xl">
                  <nav className="space-y-2">
                    <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Settings className="h-4 w-4 mr-3" />
                      General
                    </button>
                    <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                      <Bell className="h-4 w-4 mr-3" />
                      Notificaciones
                    </button>
                    <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                      <Shield className="h-4 w-4 mr-3" />
                      Privacidad
                    </button>
                    <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                      <Palette className="h-4 w-4 mr-3" />
                      Apariencia
                    </button>
                    <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                      <Database className="h-4 w-4 mr-3" />
                      Datos
                    </button>
                  </nav>
                </div>
              </div>

              {/* Main Settings */}
              <div className="lg:col-span-3">
                <div className="space-y-6">
                  {/* General Settings */}
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Configuración General
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Theme */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Tema
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          <button 
                            onClick={() => handleSettingChange('', 'theme', 'light')}
                            className={`flex items-center justify-center p-3 rounded-lg border ${
                              settings.theme === 'light' 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            <Sun className="h-5 w-5 mr-2" />
                            Claro
                          </button>
                          <button 
                            onClick={() => handleSettingChange('', 'theme', 'dark')}
                            className={`flex items-center justify-center p-3 rounded-lg border ${
                              settings.theme === 'dark' 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            <Moon className="h-5 w-5 mr-2" />
                            Oscuro
                          </button>
                          <button 
                            onClick={() => handleSettingChange('', 'theme', 'system')}
                            className={`flex items-center justify-center p-3 rounded-lg border ${
                              settings.theme === 'system' 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            <Monitor className="h-5 w-5 mr-2" />
                            Sistema
                          </button>
                        </div>
                      </div>

                      {/* Language */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Idioma
                        </label>
                        <select
                          value={settings.language}
                          onChange={(e) => handleSettingChange('', 'language', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="es">Español</option>
                          <option value="en">English</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                        </select>
                      </div>

                      {/* Timezone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Zona Horaria
                        </label>
                        <select
                          value={settings.timezone}
                          onChange={(e) => handleSettingChange('', 'timezone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Europe/Madrid">Europa/Madrid</option>
                          <option value="America/New_York">América/Nueva York</option>
                          <option value="America/Los_Angeles">América/Los Ángeles</option>
                          <option value="Asia/Tokyo">Asia/Tokio</option>
                        </select>
                      </div>

                      {/* Auto Save */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Guardado automático
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Guarda automáticamente los cambios mientras trabajas
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.autoSave}
                            onChange={(e) => handleSettingChange('', 'autoSave', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Notificaciones
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Notificaciones por email
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Recibe actualizaciones importantes por correo
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.email}
                            onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Notificaciones push
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Recibe notificaciones instantáneas en el navegador
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.push}
                            onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Sonidos
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Reproduce sonidos para las notificaciones
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.sounds}
                            onChange={(e) => handleSettingChange('notifications', 'sounds', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      Guardar configuración
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
