import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, Zap, Shield, BarChart3, Globe, Sparkles, Play, Target, Check, ChevronDown, Award } from 'lucide-react';
import ThemeToggle from '../components/Theme/ThemeToggle';
import { useState, useEffect, useRef } from 'react';

const AnimatedCounter: React.FC<{ value: string; delay: number }> = ({ value, delay }) => {
  const [displayValue, setDisplayValue] = useState('0');
  const elementRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            animateValue();
          }
        },
        { threshold: 0.5 }
      );

      if (elementRef.current) {
        observer.observe(elementRef.current);
      }

      return () => observer.disconnect();
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [delay]);

  const animateValue = () => {
    const numValue = parseInt(value.replace(/[^0-9]/g, ''));
    const suffix = value.replace(/[0-9]/g, '');
    let current = 0;
    const increment = numValue / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numValue) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current) + suffix);
      }
    }, 30);
  };

  return (
    <span ref={elementRef} className="tabular-nums">
      {displayValue}
    </span>
  );
};

const FloatingElement: React.FC<{ 
  children: React.ReactNode; 
  delay?: number;
  duration?: number;
  className?: string;
}> = ({ children, delay = 0, duration = 3, className = '' }) => {
  return (
    <div
      className={`animate-float ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
      }}
    >
      {children}
    </div>
  );
};

const LandingPageEnhanced: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(0);
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const features = [
    {
      icon: Target,
      title: 'Gestión Inteligente',
      description: 'Organiza tus tareas con IA y automatización avanzada',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Colaboración Real',
      description: 'Trabaja en equipo con sincronización en tiempo real',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: BarChart3,
      title: 'Analytics Potentes',
      description: 'Analiza tu productividad con métricas detalladas',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Globe,
      title: 'Integraciones',
      description: 'Conecta con tus herramientas favoritas',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Seguridad Total',
      description: 'Tus datos están protegidos con encriptación de grado militar',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Zap,
      title: 'Súper Rápido',
      description: 'Rendimiento optimizado para máxima velocidad',
      color: 'from-yellow-500 to-orange-500'
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
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes scale-in {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-up-delayed {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 4s ease-in-out infinite; animation-delay: 1s; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        .animate-scale-in { animation: scale-in 0.5s ease-out forwards; }
        .animate-slide-up-delayed { animation: slide-up-delayed 0.8s ease-out forwards; }
        .hover-lift:hover { transform: translateY(-10px) scale(1.02); }
        .hover-glow:hover { box-shadow: 0 0 30px rgba(139, 92, 246, 0.4); }
        .gradient-text { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%); background-clip: text; -webkit-background-clip: text; }
        .gradient-border { position: relative; background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 2px; border-radius: 1rem; }
        .gradient-border-inner { background: white dark:bg-gray-900; border-radius: calc(1rem - 2px); }
      `}</style>

      <header className="relative z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-6 w-6 text-white animate-pulse" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:gradient-text transition-all duration-300">TaskFlow</span>
            </div>
            
              <nav className="hidden md:flex items-center space-x-8">
                {['Características', 'Testimonios', 'Precios'].map((item, _idx) => (
                  <a 
                    key={item} 
                    href={`#${item.toLowerCase().includes('caracter') ? 'features' : item.toLowerCase().includes('testim') ? 'testimonials' : 'pricing'}`}
                    className="relative text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium group"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                ))}
              </nav>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link to="/login" className="hidden sm:flex text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium hover:animate-bounce-subtle">
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden group"
              >
                <span className="relative z-10">Registrarse</span>
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="relative py-20 lg:py-32 overflow-hidden">
        <FloatingElement delay={0} duration={5}>
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
        </FloatingElement>
        <FloatingElement delay={1.5} duration={4}>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
        </FloatingElement>
        <FloatingElement delay={0.5} duration={6}>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-pink-400/20 rounded-full blur-2xl animate-pulse"></div>
        </FloatingElement>
        <FloatingElement delay={2} duration={5}>
          <div className="absolute bottom-1/3 left-1/4 w-16 h-16 bg-cyan-400/20 rounded-full blur-xl"></div>
        </FloatingElement>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-8 animate-scale-in shadow-lg hover:shadow-xl transition-shadow cursor-default">
              <Sparkles className="h-5 w-5 mr-2 animate-spin-slow" />
              <span className="animate-pulse-glow px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded-full">✨ Nueva versión 2.0</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8 animate-slide-up-delayed" style={{ animationDelay: '0.1s' }}>
              Productividad
              <span className="block gradient-text animate-gradient mt-2 relative">
                Sin Límites
                <span className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-20 blur-xl rounded-full animate-pulse"></span>
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 animate-slide-up-delayed" style={{ animationDelay: '0.2s' }}>
              Organiza, colabora y alcanza tus objetivos con TaskFlow. La plataforma más avanzada para gestión de tareas con 
              <span className="font-semibold text-blue-600 dark:text-blue-400"> IA integrada</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16 animate-slide-up-delayed" style={{ animationDelay: '0.3s' }}>
              <Link
                to="/login"
                className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover-lift flex items-center overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center">
                  Comenzar gratis
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:animate-bounce-subtle transition-transform" />
                </span>
              </Link>
              
              <button className="group flex items-center px-8 py-4 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <div className="relative w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center mr-3 group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Play className="h-5 w-5 ml-0.5 group-hover:animate-pulse" />
                  <span className="absolute inset-0 rounded-full border-2 border-blue-500 group-hover:animate-ping opacity-75"></span>
                </div>
                <span className="group-hover:animate-bounce-subtle">Ver demo</span>
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto animate-slide-up-delayed" style={{ animationDelay: '0.4s' }}>
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center group cursor-default"
                  onMouseEnter={() => setIsHovered(`stat-${index}`)}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300 ${isHovered === `stat-${index}` ? 'scale-110' : ''}`}>
                    <AnimatedCounter value={stat.number} delay={index * 0.1} />
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 mt-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex justify-center animate-slide-up-delayed" style={{ animationDelay: '0.5s' }}>
              <div className="animate-bounce-subtle">
                <ChevronDown className="h-8 w-8 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 animate-scale-in">
              Características que
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">marcan la diferencia</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto animate-slide-up-delayed">
              Descubre herramientas que transformarán tu forma de trabajar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover-lift overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                <div className={`relative w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  Saber más <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 relative overflow-hidden">
        <FloatingElement delay={0} duration={6}>
          <div className="absolute top-20 left-10 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl"></div>
        </FloatingElement>
        <FloatingElement delay={2} duration={5}>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
        </FloatingElement>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 animate-scale-in">
              Lo que dicen nuestros
              <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">usuarios</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 animate-slide-up-delayed">
              Miles ya transformaron su productividad.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="flex items-center mb-4 space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic relative">
                  <span className="text-6xl absolute -top-2 -left-2 text-blue-200 dark:text-blue-900 opacity-50 font-serif">"</span>
                  {testimonial.content}
                </p>
                <div className="flex items-center">
                  <div className="relative w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    {testimonial.name.charAt(0)}
                    <span className="absolute inset-0 rounded-full border-2 border-purple-500 opacity-0 group-hover:opacity-100 group-hover:animate-ping"></span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{testimonial.name}</div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-800/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-blue-900/10 dark:to-purple-900/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 animate-scale-in">
              Planes simples
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 animate-slide-up-delayed">
              Elige el plan perfecto. Siempre puedes cambiar.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl p-8 transition-all duration-500 ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white shadow-2xl hover:shadow-3xl hover:-translate-y-2 scale-105 z-10'
                    : 'bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl hover:-translate-y-2'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce-subtle flex items-center">
                    <Award className="h-4 w-4 mr-1" /> Más popular
                  </div>
                )}
                
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{plan.name}</h3>
                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>{plan.description}</p>
                
                <div className="mb-6">
                  <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{plan.price}</span>
                  <span className={plan.highlighted ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}>{plan.period}</span>
                </div>

                <button className={`w-full py-4 rounded-xl font-semibold mb-8 transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 shadow-lg'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                }`}>
                  {plan.cta}
                </button>

                <ul className="space-y-4">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center group">
                      <span className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                        plan.highlighted ? 'bg-white/20' : 'bg-green-100 dark:bg-green-900/30'
                      }`}>
                        <Check className={`h-3.5 w-3.5 ${plan.highlighted ? 'text-white' : 'text-green-600 dark:text-green-400'}`} />
                      </span>
                      <span className={plan.highlighted ? 'text-white/90' : 'text-gray-700 dark:text-gray-300 group-hover:translate-x-1 transition-transform'}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-12 animate-scale-in">
            Preguntas Frecuentes
          </h2>

          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-semibold text-gray-900 dark:text-white text-left pr-4">{item.question}</span>
                  <span className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    expandedFAQ === idx 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rotate-180' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    <ChevronDown className="h-5 w-5" />
                  </span>
                </button>
                
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  expandedFAQ === idx ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-6 pb-5 pt-2 bg-gray-100/50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">¿No encontraste lo que buscas?</p>
            <a href="mailto:soporte@taskflow.com" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105">
              Contáctanos
            </a>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjMC0yIDItNCAyLTRzMiAyIDQgMmMwIDItNCAyLTRzMi0yIDQtMmMwIDItMiA0LTJjMC0yIDItNCAyLTR6Ii8+PC9nPjwvZz48L2c+')] opacity-30"></div>
          <FloatingElement delay={0} duration={4}>
            <div className="absolute top-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </FloatingElement>
          <FloatingElement delay={1} duration={5}>
            <div className="absolute bottom-10 left-20 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          </FloatingElement>
          <FloatingElement delay={2} duration={6}>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          </FloatingElement>
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 animate-scale-in">
            ¿Listo para ser más productivo?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto animate-slide-up-delayed">
            Únete a miles de usuarios que ya transformaron su forma de trabajar con TaskFlow.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-10 animate-slide-up-delayed" style={{ animationDelay: '0.2s' }}>
            <Link
              to="/register"
              className="group bg-white text-blue-600 px-10 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover-lift flex items-center"
            >
              <span className="group-hover:animate-bounce-subtle">Comenzar ahora</span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </Link>
            
            <Link
              to="/login"
              className="text-white border-2 border-white/60 hover:border-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-white/10"
            >
              Ya tengo cuenta
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-blue-200 text-sm animate-slide-up-delayed" style={{ animationDelay: '0.3s' }}>
            <span className="flex items-center hover:text-white transition-colors cursor-default">
              <Check className="h-4 w-4 mr-2" /> Prueba gratuita 14 días
            </span>
            <span className="flex items-center hover:text-white transition-colors cursor-default">
              <Check className="h-4 w-4 mr-2" /> Sin tarjeta de crédito
            </span>
            <span className="flex items-center hover:text-white transition-colors cursor-default">
              <Check className="h-4 w-4 mr-2" /> Cancela cuando quieras
            </span>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-6 group cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold group-hover:gradient-text transition-all duration-300">TaskFlow</span>
              </div>
              <p className="text-gray-400 max-w-md mb-6">
                La plataforma de gestión de tareas más avanzada para equipos modernos. 
                Simplifica tu trabajo, amplifica tus resultados.
              </p>
              <div className="flex space-x-4">
                {['T', 'L', 'G', 'I'].map((social, idx) => (
                  <div key={idx} className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-110 cursor-pointer group">
                    <span className="text-sm group-hover:text-white transition-colors">{social}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Producto</h3>
              <ul className="space-y-3 text-gray-400">
                {['Características', 'Precios', 'Seguridad', 'Integraciones', 'API'].map((item, idx) => (
                  <li key={idx}>
                    <a href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Soporte</h3>
              <ul className="space-y-3 text-gray-400">
                {['Centro de ayuda', 'Contacto', 'Estado del servicio', 'Documentación'].map((item, idx) => (
                  <li key={idx}>
                    <a href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 TaskFlow. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {['Términos', 'Privacidad', 'Cookies'].map((item, idx) => (
                <a key={idx} href="#" className="text-gray-400 hover:text-white text-sm transition-colors hover:underline">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageEnhanced;
