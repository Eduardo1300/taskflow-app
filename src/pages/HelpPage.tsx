import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import SidebarEnhanced from '../components/Layout/SidebarEnhanced';
import { 
  HelpCircle, 
  Search, 
  Book, 
  MessageCircle, 
  Video,
  FileText,
  Mail,
  Phone,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Star,
  Clock,
  Users
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const HelpPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('help');
  const [searchTerm, setSearchTerm] = useState('');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const faqData: FAQItem[] = [
    {
      id: '1',
      question: '¿Cómo creo una nueva tarea?',
      answer: 'Para crear una nueva tarea, haz clic en el botón "+" en la esquina superior derecha del dashboard o ve a la sección de Kanban y haz clic en "Agregar tarea" en cualquier columna.',
      category: 'Básico'
    },
    {
      id: '2',
      question: '¿Cómo cambio el tema de la aplicación?',
      answer: 'Ve a Configuración > Apariencia y selecciona entre tema claro, oscuro o automático según tus preferencias.',
      category: 'Personalización'
    },
    {
      id: '3',
      question: '¿Puedo colaborar con mi equipo?',
      answer: 'Sí, TaskFlow incluye funciones de colaboración. Puedes invitar miembros del equipo, compartir tareas y recibir notificaciones en tiempo real.',
      category: 'Colaboración'
    },
    {
      id: '4',
      question: '¿Cómo funciona la API REST?',
      answer: 'La API REST te permite integrar TaskFlow con otras aplicaciones. Ve a la sección API para generar tokens y consultar la documentación completa.',
      category: 'API'
    },
    {
      id: '5',
      question: '¿Mis datos están seguros?',
      answer: 'Sí, utilizamos cifrado de extremo a extremo y almacenamos todos los datos en servidores seguros con certificación SOC 2.',
      category: 'Seguridad'
    }
  ];

  const filteredFAQs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      <SidebarEnhanced activeSection={activeSection} onSectionChange={handleSectionChange} isCollapsed={false} />
      <div className="flex-1 flex flex-col lg:ml-72">
        <Header showUserMenu={true} />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Centro de Ayuda
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Encuentra respuestas a tus preguntas y aprende a sacar el máximo provecho de TaskFlow
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="max-w-2xl mx-auto relative">
                <input
                  type="text"
                  placeholder="Buscar en la ayuda..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Help Categories */}
              <div className="lg:col-span-1">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Categorías
                  </h3>
                  
                  <nav className="space-y-2">
                    <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Book className="h-4 w-4 mr-3" />
                      Guía de inicio
                    </button>
                    <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                      <FileText className="h-4 w-4 mr-3" />
                      Funcionalidades
                    </button>
                    <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                      <Users className="h-4 w-4 mr-3" />
                      Colaboración
                    </button>
                    <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                      <Video className="h-4 w-4 mr-3" />
                      Tutoriales
                    </button>
                  </nav>

                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      ¿Necesitas más ayuda?
                    </h4>
                    <div className="space-y-2">
                      <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                        <MessageCircle className="h-4 w-4 mr-3" />
                        Chat en vivo
                      </button>
                      <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                        <Mail className="h-4 w-4 mr-3" />
                        Enviar ticket
                      </button>
                      <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                        <Phone className="h-4 w-4 mr-3" />
                        Llamar soporte
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer group">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                          <Book className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Guía de inicio rápido
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Aprende lo básico de TaskFlow en 5 minutos
                      </p>
                      <div className="flex items-center mt-3 text-blue-600 dark:text-blue-400 text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        5 min de lectura
                      </div>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer group">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                          <Video className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Video tutoriales
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Aprende viendo nuestros tutoriales paso a paso
                      </p>
                      <div className="flex items-center mt-3 text-green-600 dark:text-green-400 text-sm">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Ver videos
                      </div>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer group">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                          <MessageCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Comunidad
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Conecta con otros usuarios y comparte tips
                      </p>
                      <div className="flex items-center mt-3 text-purple-600 dark:text-purple-400 text-sm">
                        <Users className="h-4 w-4 mr-1" />
                        Unirse
                      </div>
                    </div>
                  </div>

                  {/* FAQ Section */}
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Preguntas Frecuentes
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Star className="h-4 w-4 mr-1 text-yellow-400" />
                        Las más populares
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {filteredFAQs.map((faq) => (
                        <div key={faq.id} className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
                          <button
                            onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <span className="font-medium text-gray-900 dark:text-white pr-4">
                              {faq.question}
                            </span>
                            {openFAQ === faq.id ? (
                              <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            )}
                          </button>
                          {openFAQ === faq.id && (
                            <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/20">
                              <div className="pt-4">
                                <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full mb-3">
                                  {faq.category}
                                </span>
                                <p>{faq.answer}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {filteredFAQs.length === 0 && searchTerm && (
                      <div className="text-center py-8">
                        <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No se encontraron resultados
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          Intenta con otros términos de búsqueda o contacta con soporte
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Contact Support */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/5 dark:to-purple-500/5 rounded-2xl p-6 border border-blue-500/20">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        ¿Aún tienes preguntas?
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Nuestro equipo de soporte está aquí para ayudarte 24/7
                      </p>
                      <button className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Contactar Soporte
                      </button>
                    </div>
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

export default HelpPage;
