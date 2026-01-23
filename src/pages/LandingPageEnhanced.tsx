import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, Zap, Shield, BarChart3, Globe, Sparkles, Play, Target, Check, ChevronDown } from 'lucide-react';
import ThemeToggle from '../components/Theme/ThemeToggle';
import { useState } from 'react';

const LandingPageEnhanced: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(0);
  const features = [
    {
      icon: Target,
      title: 'Gestión Inteligente',
      description: 'Organiza tus tareas con IA y automatización avanzada'
    },
    {
      icon: Users,
      title: 'Colaboración Real',
      description: 'Trabaja en equipo con sincronización en tiempo real'
    },
    {
      icon: BarChart3,
      title: 'Analytics Potentes',
      description: 'Analiza tu productividad con métricas detalladas'
    },
    {
      icon: Globe,
      title: 'Integraciones',
      description: 'Conecta con tus herramientas favoritas'
    },
    {
      icon: Shield,
      title: 'Seguridad Total',
      description: 'Tus datos están protegidos con encriptación de grado militar'
    },
    {
      icon: Zap,
      title: 'Súper Rápido',
      description: 'Rendimiento optimizado para máxima velocidad'
    }
  ];

  const testimonials = [
    {
      name: 'Ana Martínez',
      role: 'CEO, TechStart',
      content: 'TaskFlow ha transformado completamente cómo gestionamos nuestros proyectos. La interfaz es intuitiva y las funciones son exactamente lo que necesitábamos.',
      rating: 5
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Freelancer',
      content: 'Como freelancer, necesitaba algo simple pero poderoso. TaskFlow me permite mantener organizados múltiples clientes sin complicaciones.',
      rating: 5
    },
    {
      name: 'María González',
      role: 'Product Manager',
      content: 'Las funciones de colaboración son increíbles. Nuestro equipo ahora está más sincronizado que nunca.',
      rating: 5
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Usuarios activos' },
    { number: '50,000+', label: 'Tareas completadas' },
    { number: '99.9%', label: 'Tiempo activo' },
    { number: '4.9/5', label: 'Calificación' }
  ];

  const faqItems = [
    {
      question: '¿Cuál es el período de prueba gratuita?',
      answer: 'Todos los planes nuevos incluyen 14 días de prueba completamente gratis. No necesitas tarjeta de crédito para comenzar.'
    },
    {
      question: '¿Puedo cambiar de plan en cualquier momento?',
      answer: 'Sí, puedes actualizar o cambiar tu plan en cualquier momento. Los cambios se reflejan inmediatamente.'
    },
    {
      question: '¿TaskFlow es compatible con mi software actual?',
      answer: 'Tenemos integraciones con 100+ herramientas populares. Si no ves la tuya, contáctanos y la agregamos.'
    },
    {
      question: '¿Qué sucede con mis datos si cancelo?',
      answer: 'Tus datos están seguros. Puedes descargarlos en cualquier momento. Mantenemos un backup durante 30 días.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$9',
      period: '/mes',
      description: 'Perfecto para empezar',
      cta: 'Comenzar ahora',
      features: ['Hasta 100 tareas', '1 usuario', 'Soporte por email', 'Almacenamiento 2GB']
    },
    {
      name: 'Professional',
      price: '$29',
      period: '/mes',
      description: 'La opción más popular',
      cta: 'Comenzar ahora',
      highlighted: true,
      features: ['Tareas ilimitadas', 'Hasta 5 usuarios', 'Soporte prioritario', 'Almacenamiento 50GB', 'Integraciones', 'Análisis avanzado']
    },
    {
      name: 'Enterprise',
      price: 'Personalizado',
      period: '',
      description: 'Para grandes equipos',
      cta: 'Solicitar demo',
      features: ['Todo de Professional', 'Usuarios ilimitados', 'SSO y seguridad avanzada', 'Almacenamiento ilimitado', 'API custom', 'Soporte 24/7']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="relative z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">TaskFlow</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Características
              </a>
              <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Testimonios
              </a>
              <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Precios
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                to="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-pink-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 mr-2" />
              Nueva actualización disponible
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8 animate-slide-up">
              Productividad
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                Sin Límites
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Organiza, colabora y alcanza tus objetivos con TaskFlow. La plataforma de gestión de tareas más avanzada y elegante del mercado.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <Link
                to="/login"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center"
              >
                Comenzar gratis
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="group flex items-center px-8 py-4 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center mr-3 group-hover:shadow-xl transition-shadow">
                  <Play className="h-5 w-5 ml-0.5" />
                </div>
                Ver demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.6s' }}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.number}</div>
                  <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Características que
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                marcan la diferencia
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Descubre las herramientas que convertirán tu forma de trabajar en una experiencia excepcional.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover-lift animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Lo que dicen nuestros
              <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                usuarios
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Miles de usuarios ya han transformado su productividad con TaskFlow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover-lift animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Planes simples y transparentes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Elige el plan perfecto para tu necesidad. Siempre puedes cambiar después.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl transform scale-105'
                    : 'bg-white dark:bg-gray-800 shadow-lg'
                }`}
              >
                {plan.highlighted && (
                  <div className="inline-block bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                    Más popular
                  </div>
                )}
                
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{plan.name}</h3>
                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                  {plan.description}
                </p>
                
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{plan.price}</span>
                  <span className={plan.highlighted ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}>
                    {plan.period}
                  </span>
                </div>

                <button className={`w-full py-3 rounded-lg font-semibold mb-8 transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500'
                }`}>
                  {plan.cta}
                </button>

                <ul className="space-y-4">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center">
                      <Check className={`h-5 w-5 mr-3 flex-shrink-0 ${
                        plan.highlighted ? 'text-white' : 'text-green-500'
                      }`} />
                      <span className={plan.highlighted ? 'text-white' : 'text-gray-700 dark:text-gray-300'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-600 dark:text-gray-400 mt-12">
            ¿Preguntas sobre los planes? <a href="#faq" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">Consulta nuestro FAQ</a>
          </p>
        </div>
      </section>
      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Preguntas Frecuentes
          </h2>

          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden shadow-md transition-all duration-300"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-semibold text-gray-900 dark:text-white text-left">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-600 dark:text-gray-400 transition-transform duration-300 ${
                      expandedFAQ === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {expandedFAQ === idx && (
                  <div className="px-6 py-4 bg-gray-100 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-300">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              ¿No encontraste lo que buscas?
            </p>
            <a href="mailto:soporte@taskflow.com" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              Contáctanos
            </a>
          </div>
        </div>
      </section>
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para ser más productivo?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a miles de usuarios que ya han transformado su forma de trabajar con TaskFlow.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/register"
              className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center"
            >
              Comenzar ahora
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              to="/login"
              className="text-white border-2 border-white/50 hover:border-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              Ya tengo cuenta
            </Link>
          </div>

          <p className="text-blue-200 text-sm mt-6">
            Prueba gratuita de 14 días • No requiere tarjeta de crédito • Cancela cuando quieras
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo y descripción */}
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">TaskFlow</span>
              </div>
              <p className="text-gray-400 max-w-md mb-6">
                La plataforma de gestión de tareas más avanzada para equipos modernos. 
                Simplifica tu trabajo, amplifica tus resultados.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-sm">T</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-sm">L</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-sm">G</span>
                </div>
              </div>
            </div>

            {/* Enlaces */}
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Seguridad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integraciones</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Centro de ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Estado del servicio</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 TaskFlow. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Términos de servicio
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacidad
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageEnhanced;
