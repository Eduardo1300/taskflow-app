import React from 'react';
import { Bell, Moon, Shield, Database } from 'lucide-react';

const SettingsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Configuración</h2>
        
        <div className="space-y-6">
          {/* Notificaciones */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <div className="flex items-center mb-4">
              <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notificaciones</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-3 rounded" />
                <span className="text-gray-700 dark:text-gray-300">Notificaciones por email</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-3 rounded" />
                <span className="text-gray-700 dark:text-gray-300">Notificaciones push</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3 rounded" />
                <span className="text-gray-700 dark:text-gray-300">Recordatorios de tareas</span>
              </label>
            </div>
          </div>

          {/* Apariencia */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <div className="flex items-center mb-4">
              <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Apariencia</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tema
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>Claro</option>
                  <option>Oscuro</option>
                  <option>Automático</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Idioma
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>Español</option>
                  <option>English</option>
                  <option>Français</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacidad */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Privacidad y Seguridad</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-3 rounded" />
                <span className="text-gray-700 dark:text-gray-300">Autenticación de dos factores</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3 rounded" />
                <span className="text-gray-700 dark:text-gray-300">Compartir datos analíticos</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-3 rounded" />
                <span className="text-gray-700 dark:text-gray-300">Sesiones seguras</span>
              </label>
            </div>
          </div>

          {/* Datos */}
          <div>
            <div className="flex items-center mb-4">
              <Database className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gestión de Datos</h3>
            </div>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                Exportar datos
              </button>
              <button className="w-full px-4 py-2 text-left border border-red-300 dark:border-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400">
                Eliminar cuenta
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;
