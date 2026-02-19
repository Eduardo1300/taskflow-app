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
                  ¿Cómo asigno una tarea a otro usuario?
                </summary>
                <div className="p-4 pt-0 text-gray-600 dark:text-gray-400">
                  Dentro de los detalles de una tarea (o al crearla), verás un campo "Asignar a". Puedes seleccionar a cualquier miembro de tu equipo que ya esté añadido al proyecto. Si el usuario no está en el proyecto, primero deberás invitarlo.
                </div>
              </details>

              <details className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
                  ¿Puedo adjuntar archivos a mis tareas?
                </summary>
                <div className="p-4 pt-0 text-gray-600 dark:text-gray-400">
                  Sí, en la sección de detalles de la tarea, hay una opción para "Adjuntar archivos". Puedes subir documentos, imágenes o cualquier otro archivo relevante directamente desde tu dispositivo o desde servicios en la nube integrados.
                </div>
              </details>
              
              <details className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
                  ¿Cómo inicio un chat sobre una tarea específica?
                </summary>
                <div className="p-4 pt-0 text-gray-600 dark:text-gray-400">
                  En los detalles de cualquier tarea, encontrarás una sección de "Comentarios". Puedes usarla para iniciar conversaciones con los colaboradores de la tarea, compartir actualizaciones y resolver dudas en tiempo real. Todos los comentarios quedan registrados.
                </div>
              </details>

              <details className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
                  ¿Hay un historial de cambios en las tareas colaborativas?
                </summary>
                <div className="p-4 pt-0 text-gray-600 dark:text-gray-400">
                  Absolutamente. Cada tarea incluye un "Historial de Actividad" que registra todos los cambios realizados, incluyendo asignaciones, cambios de estado, fechas de vencimiento y comentarios. Esto asegura transparencia y trazabilidad en el trabajo en equipo.
                </div>
              </details>

              <details className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
                  ¿Qué integraciones están disponibles actualmente?
                </summary>
                <div className="p-4 pt-0 text-gray-600 dark:text-gray-400">
                  TaskFlow se integra con plataformas populares como Google Calendar, Outlook Calendar, Slack, y Zoom para reuniones. Estamos trabajando constantemente para añadir más integraciones. Visita la sección "Integraciones" para ver la lista completa.
                </div>
              </details>

              <details className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
                  ¿Cómo conecto mi calendario externo (ej. Google Calendar)?
                </summary>
                <div className="p-4 pt-0 text-gray-600 dark:text-gray-400">
                  Dirígete a "Configuración" {'>'} "Integraciones". Selecciona tu calendario preferido (ej. Google Calendar) y sigue los pasos de autenticación. Una vez conectado, tus tareas con fechas de vencimiento en TaskFlow se sincronizarán automáticamente.
                </div>
              </details>

              <details className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
                  ¿Qué métricas puedo ver en la sección de Analytics?
                </summary>
                <div className="p-4 pt-0 text-gray-600 dark:text-gray-400">
                  En Analytics, puedes visualizar métricas clave como tu tasa de finalización de tareas, distribución de tareas por categoría y prioridad, productividad semanal y mensual, días más productivos, riesgo de burnout, y tendencias de rendimiento.
                </div>
              </details>

              <details className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
                  ¿Cómo exporto mis reportes de Analytics?
                </summary>
                <div className="p-4 pt-0 text-gray-600 dark:text-gray-400">
                  En la parte superior de la página de Analytics, encontrarás un botón "Exportar PDF". Al hacer clic, se generará un documento PDF con todos tus gráficos y métricas de rendimiento actuales, que podrás descargar y compartir.
                </div>
              </details>

              <details className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
                  ¿Cómo cambio mi zona horaria?
                </summary>
                <div className="p-4 pt-0 text-gray-600 dark:text-gray-400">
                  Ve a "Configuración" {'>'} "Perfil". Allí podrás seleccionar tu zona horaria preferida de una lista. Asegúrate de guardar los cambios para que todas tus fechas y horas se ajusten correctamente.
                </div>
              </details>

              <details className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
                  ¿Puedo personalizar las notificaciones que recibo?
                </summary>
                <div className="p-4 pt-0 text-gray-600 dark:text-gray-400">
                  Sí, en "Configuración" {'>'} "Notificaciones", puedes configurar qué tipo de alertas deseas recibir (ej. recordatorios de tareas, asignaciones nuevas, comentarios), y por qué medio (aplicación, correo electrónico).
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
                href="/guides"
                className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <FileText className="w-5 h-5 text-purple-500 mr-3" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Guías paso a paso</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Tutoriales completos de uso</div>
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
