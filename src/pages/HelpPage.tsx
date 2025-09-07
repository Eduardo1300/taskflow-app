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
  User,
  Calendar,
  BarChart3,
  Users
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface Guide {
  id: string;
  title: string;
  description: string;
  icon: any;
  steps: string[];
}

const HelpPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: '¿Cómo creo una nueva tarea?',
      answer: 'Puedes crear una nueva tarea haciendo clic en el botón "+" en cualquier vista (Dashboard, Kanban o Calendario). También puedes usar el atajo de teclado Ctrl+N.',
      category: 'tasks'
    },
    {
      id: '2',
      question: '¿Cómo colaboro con otros usuarios?',
      answer: 'Ve a una tarea, haz clic en "Compartir" y escribe el email de la persona con quien quieres colaborar. Puedes asignar permisos de visualización o edición.',
      category: 'collaboration'
    },
    {
      id: '3',
      question: '¿Cómo configuro las notificaciones?',
      answer: 'Ve a Configuración > Notificaciones donde puedes personalizar qué notificaciones quieres recibir por email, push o dentro de la aplicación.',
      category: 'settings'
    },
    {
      id: '4',
      question: '¿Puedo usar TaskFlow sin conexión?',
      answer: 'Sí, TaskFlow funciona como PWA (Aplicación Web Progresiva). Puedes ver y editar tus tareas sin conexión, y los cambios se sincronizarán cuando vuelvas a conectarte.',
      category: 'general'
    },
    {
      id: '5',
      question: '¿Cómo exporto mis datos?',
      answer: 'Ve a Configuración > Datos y haz clic en "Exportar Datos". Recibirás un archivo JSON con todas tus tareas, proyectos y configuraciones.',
      category: 'data'
    },
    {
      id: '6',
      question: '¿Cómo integro TaskFlow con otras aplicaciones?',
      answer: 'Ve a la sección Integraciones donde puedes conectar TaskFlow con Google Calendar, Slack, Discord y más. También puedes usar nuestra API REST.',
      category: 'integrations'
    },
    {
      id: '7',
      question: '¿TaskFlow es gratuito?',
      answer: 'TaskFlow ofrece un plan gratuito con funcionalidades básicas. Los planes premium incluyen colaboración ilimitada, integraciones avanzadas y análisis detallados.',
      category: 'billing'
    },
    {
      id: '8',
      question: '¿Cómo veo mis estadísticas de productividad?',
      answer: 'Ve a la sección Analytics donde encontrarás gráficos detallados de tu productividad, tiempo dedicado a tareas, y recomendaciones personalizadas.',
      category: 'analytics'
    }
  ];

  const guides: Guide[] = [
    {
      id: 'getting-started',
      title: 'Primeros Pasos',
      description: 'Aprende lo básico para empezar a usar TaskFlow eficientemente',
      icon: User,
      steps: [
        'Crea tu primera tarea',
        'Organiza tus tareas por categorías',
        'Establece fechas de vencimiento',
        'Marca tareas como completadas'
      ]
    },
    {
      id: 'calendar-setup',
      title: 'Configurar Calendario',
      description: 'Sincroniza tus tareas con tu calendario favorito',
      icon: Calendar,
      steps: [
        'Ve a la sección Integraciones',
        'Selecciona Google Calendar',
        'Autoriza la conexión',
        'Configura la sincronización automática'
      ]
    },
    {
      id: 'team-collaboration',
      title: 'Colaboración en Equipo',
      description: 'Invita a tu equipo y trabajen juntos en proyectos',
      icon: Users,
      steps: [
        'Crea un proyecto o tarea',
        'Haz clic en "Compartir"',
        'Invita miembros por email',
        'Asigna roles y permisos'
      ]
    },
    {
      id: 'analytics-insights',
      title: 'Análisis y Métricas',
      description: 'Comprende tu productividad con análisis detallados',
      icon: BarChart3,
      steps: [
        'Ve a la sección Analytics',
        'Revisa tus métricas de productividad',
        'Analiza tendencias temporales',
        'Aplica recomendaciones de IA'
      ]
    }
  ];

  const categories = [
    { id: 'all', label: 'Todas' },
    { id: 'tasks', label: 'Tareas' },
    { id: 'collaboration', label: 'Colaboración' },
    { id: 'integrations', label: 'Integraciones' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'settings', label: 'Configuración' },
    { id: 'general', label: 'General' }
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl ml-16 w-full space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Centro de Ayuda</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Encuentra respuestas, guías y aprende a usar TaskFlow al máximo
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar en la ayuda..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Chat en Vivo</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Habla con nuestro equipo</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Email Soporte</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">support@taskflow.com</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Book className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Documentación</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Guías completas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Guides */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Guías Paso a Paso
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guides.map((guide) => {
            const Icon = guide.icon;
            return (
              <div
                key={guide.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg">
                    <Icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {guide.description}
                    </p>
                    <div className="space-y-1">
                      {guide.steps.map((step, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <span className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs flex items-center justify-center mr-2">
                            {index + 1}
                          </span>
                          {step}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium">
                      Ver guía completa
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Preguntas Frecuentes
        </h2>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                activeCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFAQs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  {faq.question}
                </span>
                {expandedFAQ === faq.id ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {expandedFAQ === faq.id && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="text-center py-8">
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No se encontraron preguntas que coincidan con tu búsqueda
            </p>
          </div>
        )}
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            ¿No encontraste lo que buscabas?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Nuestro equipo de soporte está aquí para ayudarte
          </p>
          <div className="flex justify-center space-x-4">
            <button className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              <MessageCircle className="h-4 w-4 mr-2" />
              Iniciar Chat
            </button>
            <button className="flex items-center px-4 py-2 bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 border border-purple-600 dark:border-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-600 transition-colors">
              <Mail className="h-4 w-4 mr-2" />
              Enviar Email
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default HelpPage;
