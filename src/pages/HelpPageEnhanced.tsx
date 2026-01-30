import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  Book, 
  MessageCircle, 
  Mail, 
  ExternalLink,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import { guidesData } from '../data/guidesData'; // Import from shared data

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// Removed redundant Guide interface as it's now imported
/*
interface Guide {
  id: string;
  title: string;
  description: string;
  icon: any;
  steps: string[];
}
*/

const HelpPageEnhanced: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: '¿Cómo creo una nueva tarea?',
      answer: 'Puedes crear una nueva tarea haciendo clic en el botón "Nueva tarea" en cualquier vista (Dashboard, Kanban o Calendario). También puedes usar el atajo de teclado Ctrl+N. Completa los detalles como título, descripción, fecha de vencimiento y categoría.',
      category: 'tasks'
    },
    {
      id: '11',
      question: '¿Cómo asigno una tarea a otro usuario?',
      answer: 'Dentro de los detalles de una tarea (o al crearla), verás un campo "Asignar a". Puedes seleccionar a cualquier miembro de tu equipo que ya esté añadido al proyecto. Si el usuario no está en el proyecto, primero deberás invitarlo.',
      category: 'tasks'
    },
    {
      id: '12',
      question: '¿Puedo adjuntar archivos a mis tareas?',
      answer: 'Sí, en la sección de detalles de la tarea, hay una opción para "Adjuntar archivos". Puedes subir documentos, imágenes o cualquier otro archivo relevante directamente desde tu dispositivo o desde servicios en la nube integrados.',
      category: 'tasks'
    },
    {
      id: '2',
      question: '¿Cómo colaboro con otros usuarios?',
      answer: 'Ve a una tarea, haz clic en "Compartir" y escribe el email de la persona con quien quieres colaborar. Puedes asignar permisos de visualización o edición. Los colaboradores recibirán una invitación y podrán trabajar contigo en tiempo real.',
      category: 'collaboration'
    },
    {
      id: '13',
      question: '¿Cómo inicio un chat sobre una tarea específica?',
      answer: 'En los detalles de cualquier tarea, encontrarás una sección de "Comentarios". Puedes usarla para iniciar conversaciones con los colaboradores de la tarea, compartir actualizaciones y resolver dudas en tiempo real. Todos los comentarios quedan registrados.',
      category: 'collaboration'
    },
    {
      id: '14',
      question: '¿Hay un historial de cambios en las tareas colaborativas?',
      answer: 'Absolutamente. Cada tarea incluye un "Historial de Actividad" que registra todos los cambios realizados, incluyendo asignaciones, cambios de estado, fechas de vencimiento y comentarios. Esto asegura transparencia y trazabilidad en el trabajo en equipo.',
      category: 'collaboration'
    },
    {
      id: '3',
      question: '¿Cómo configuro las notificaciones?',
      answer: 'Ve a Configuración > Notificaciones donde puedes personalizar qué notificaciones quieres recibir por email, push o en la aplicación. Puedes habilitar/deshabilitar recordatorios de tareas, resúmenes semanales y actualizaciones de colaboración.',
      category: 'settings'
    },
    {
      id: '19',
      question: '¿Cómo cambio mi zona horaria?',
      answer: 'Ve a "Configuración" > "Perfil". Allí podrás seleccionar tu zona horaria preferida de una lista. Asegúrate de guardar los cambios para que todas tus fechas y horas se ajusten correctamente.',
      category: 'settings'
    },
    {
      id: '20',
      question: '¿Puedo personalizar las notificaciones que recibo?',
      answer: 'Sí, en "Configuración" > "Notificaciones", puedes configurar qué tipo de alertas deseas recibir (ej. recordatorios de tareas, asignaciones nuevas, comentarios), y por qué medio (aplicación, correo electrónico).',
      category: 'settings'
    },
    {
      id: '4',
      question: '¿Puedo usar TaskFlow sin conexión?',
      answer: 'Sí, TaskFlow funciona como PWA (Aplicación Web Progresiva). Puedes ver y editar tus tareas sin conexión, y los cambios se sincronizarán automáticamente cuando vuelvas a conectarte. Descarga la aplicación desde el menú.',
      category: 'general'
    },
    {
      id: '5',
      question: '¿Cómo exporto mis datos?',
      answer: 'Ve a Configuración > Datos y haz clic en "Exportar Datos". Recibirás un archivo JSON con todas tus tareas, proyectos, colaboraciones y configuraciones. Puedes usarlo para respaldar o migrar tus datos.',
      category: 'data'
    },
    {
      id: '6',
      question: '¿Cómo integro TaskFlow con otras aplicaciones?',
      answer: 'Ve a la sección Integraciones donde puedes conectar TaskFlow con Google Calendar, Slack, Discord y más. También puedes usar nuestra API REST con documentación completa.',
      category: 'integrations'
    },
    {
      id: '15',
      question: '¿Qué integraciones están disponibles actualmente?',
      answer: 'TaskFlow se integra con plataformas populares como Google Calendar, Outlook Calendar, Slack, y Zoom para reuniones. Estamos trabajando constantemente para añadir más integraciones. Visita la sección "Integraciones" para ver la lista completa.',
      category: 'integrations'
    },
    {
      id: '16',
      question: '¿Cómo conecto mi calendario externo (ej. Google Calendar)?',
      answer: 'Dirígete a "Configuración" > "Integraciones". Selecciona tu calendario preferido (ej. Google Calendar) y sigue los pasos de autenticación. Una vez conectado, tus tareas con fechas de vencimiento en TaskFlow se sincronizarán automáticamente.',
      category: 'integrations'
    },
    {
      id: '7',
      question: '¿TaskFlow es gratuito?',
      answer: 'TaskFlow ofrece un plan gratuito con funcionalidades básicas de gestión de tareas. Los planes premium incluyen colaboración ilimitada, integraciones avanzadas, análisis detallados y soporte prioritario.',
      category: 'billing'
    },
    {
      id: '8',
      question: '¿Cómo veo mis estadísticas de productividad?',
      answer: 'Ve a la sección Analytics donde encontrarás gráficos detallados de tu productividad, tiempo dedicado a tareas, tendencias, y recomendaciones personalizadas basadas en IA.',
      category: 'analytics'
    },
    {
      id: '17',
      question: '¿Qué métricas puedo ver en la sección de Analytics?',
      answer: 'En Analytics, puedes visualizar métricas clave como tu tasa de finalización de tareas, distribución de tareas por categoría y prioridad, productividad semanal y mensual, días más productivos, riesgo de burnout, y tendencias de rendimiento. También puedes ver previsiones y análisis avanzados.',
      category: 'analytics'
    },
    {
      id: '18',
      question: '¿Cómo exporto mis reportes de Analytics?',
      answer: 'En la parte superior de la página de Analytics, encontrarás un botón "Exportar PDF". Al hacer clic, se generará un documento PDF con todos tus gráficos y métricas de rendimiento actuales, que podrás descargar y compartir. También puedes exportar datos en CSV.',
      category: 'analytics'
    },
    {
      id: '9',
      question: '¿Cómo cambio mi contraseña?',
      answer: 'Ve a Configuración > Privacidad y Seguridad, luego haz clic en "Cambiar Contraseña". Se te pedirá tu contraseña actual y luego podrás establecer una nueva.',
      category: 'security'
    },
    {
      id: '10',
      question: '¿Puedo recuperar una tarea eliminada?',
      answer: 'Las tareas eliminadas van a una papelera durante 30 días. Ve a Más > Papelera para recuperar tareas eliminadas. Después de 30 días, se eliminan permanentemente.',
      category: 'tasks'
    }
  ];

  // Use the imported guidesData
  const guides = guidesData;

  const categories = [
    { id: 'all', label: 'Todas' },
    { id: 'tasks', label: 'Tareas' },
    { id: 'collaboration', label: 'Colaboración' },
    { id: 'integrations', label: 'Integraciones' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'settings', label: 'Configuración' },
    { id: 'security', label: 'Seguridad' }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <MainLayout currentPage="help">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 mb-4">
            <HelpCircle className="h-10 w-10 sm:h-10 sm:w-10 text-purple-600 dark:text-purple-400 mx-auto sm:mx-0" />
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">Soporte y Ayuda de TaskFlow: Guías y FAQ para Productividad</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mt-2">
            Encuentra respuestas rápidas, guías paso a paso y consejos para desarrolladores, freelancers y startups. Aprende a usar TaskFlow al máximo y optimiza tu productividad.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto px-4 sm:px-0">
          <Search className="absolute left-6 sm:left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Busca en la ayuda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 sm:py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm sm:text-base shadow-sm"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/50 rounded-xl p-6 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Chat en Vivo</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Habla con nuestro equipo en tiempo real</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/50 rounded-xl p-6 border border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-green-600 rounded-lg">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Email Soporte</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">support@taskflow.com</p>
              </div>
            </div>
          </div>

          <a href="/guides" className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/50 rounded-xl p-6 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-purple-600 rounded-lg">
                <Book className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Guías paso a paso</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Explora todas las guías</p>
              </div>
            </div>
          </a>
        </div>

        {/* Guides Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Guías Paso a Paso</h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">{guides.length} guías disponibles</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {guides.map((guide) => {
              const Icon = guide.icon;
              return (
                <div
                  key={guide.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-600"
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg flex-shrink-0">
                      <Icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {guide.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {guide.steps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 h-6 w-6 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                  
                  <a href="/guides" className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200">
                    <span>Ver guía completa</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Preguntas Frecuentes</h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">{filteredFAQs.length} de {faqs.length}</span>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-3">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-lg"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {faq.question}
                    </h3>
                    <div className="flex-shrink-0 ml-4">
                      {expandedFAQ === faq.id ? (
                        <ChevronDown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                  </button>
                  
                  {expandedFAQ === faq.id && (
                    <div className="px-6 pb-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No se encontraron preguntas que coincidan con tu búsqueda
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  Intenta con otros términos o contacta a nuestro soporte
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Still Need Help Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 sm:p-12 text-center text-white shadow-xl">
          <Lightbulb className="h-10 sm:h-12 w-10 sm:w-12 mx-auto mb-4 opacity-90" />
          <h3 className="text-xl sm:text-2xl font-bold mb-3">
            ¿Aún necesitas ayuda?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto text-sm sm:text-lg">
            Nuestro equipo de soporte está disponible 24/7 para ayudarte. No dudes en contactarnos con cualquier pregunta o problema.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button className="flex items-center justify-center px-6 sm:px-8 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-sm sm:text-base">
              <MessageCircle className="h-5 w-5 mr-2" />
              Chat en Vivo
            </button>
            <button className="flex items-center justify-center px-6 sm:px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors font-semibold border border-blue-500 text-sm sm:text-base">
              <Mail className="h-5 w-5 mr-2" />
              Enviar Email
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HelpPageEnhanced;
