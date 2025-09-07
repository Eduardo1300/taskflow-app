import React from 'react';
import { HelpCircle, MessageCircle, FileText, ExternalLink } from 'lucide-react';

const HelpSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Centro de Ayuda</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preguntas Frecuentes */}
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <HelpCircle className="w-5 h-5 text-blue-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Preguntas Frecuentes</h3>
            </div>
            
            <div className="space-y-3">
              <details className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
                  ¿Cómo creo una nueva tarea?
                </summary>
                <div className="p-4 pt-0 text-gray-600 dark:text-gray-400">
                  Para crear una nueva tarea, haz clic en el botón "+" en la parte superior derecha o ve a la sección Dashboard y selecciona "Nueva tarea".
                </div>
              </details>
              
              <details className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
                  ¿Cómo colaboro con mi equipo?
                </summary>
                <div className="p-4 pt-0 text-gray-600 dark:text-gray-400">
                  Puedes invitar a miembros del equipo desde la configuración del proyecto y asignar tareas específicas a cada persona.
                </div>
              </details>
              
              <details className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
                  ¿Cómo exporto mis datos?
                </summary>
                <div className="p-4 pt-0 text-gray-600 dark:text-gray-400">
                  Ve a Configuración {'>'}  Gestión de Datos {'>'}  Exportar datos para descargar toda tu información en formato JSON o CSV.
                </div>
              </details>
            </div>
          </div>

          {/* Contacto y Recursos */}
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <MessageCircle className="w-5 h-5 text-green-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contacto y Recursos</h3>
            </div>
            
            <div className="space-y-3">
              <a
                href="#"
                className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-blue-500 mr-3" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Chat en vivo</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Habla con nuestro equipo</div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
              </a>
              
              <a
                href="#"
                className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <FileText className="w-5 h-5 text-purple-500 mr-3" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Documentación</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Guías completas de uso</div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
              </a>
              
              <a
                href="#"
                className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <HelpCircle className="w-5 h-5 text-orange-500 mr-3" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Tutoriales en video</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Aprende paso a paso</div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
              </a>
            </div>
          </div>
        </div>

        {/* Información de versión */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>TaskFlow App v1.0.0</p>
            <p>¿Necesitas más ayuda? Contáctanos en <a href="mailto:soporte@taskflow.com" className="text-blue-600 dark:text-blue-400 hover:underline">soporte@taskflow.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSection;
