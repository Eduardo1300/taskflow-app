import { CheckSquare, ArrowRight, CheckCircle, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 md:h-16">
            <div className="flex items-center">
              <CheckSquare className="h-7 w-7 md:h-8 md:w-8 text-blue-600" />
              <span className="ml-2 text-lg md:text-xl font-bold text-gray-900">TaskFlow</span>
            </div>
            <div className="flex space-x-2 sm:space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-10 md:pb-16">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
            Organiza tus tareas con{' '}
            <span className="text-blue-600">TaskFlow</span>
          </h1>
          <p className="text-base md:text-xl lg:text-2xl text-gray-600 mb-8 md:mb-12 max-w-3xl mx-auto">
            La forma más rápida de gestionar tus pendientes y aumentar tu productividad
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 md:mb-16">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg text-base md:text-lg font-semibold transition-colors flex items-center justify-center"
            >
              Comenzar gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 md:px-8 py-3 md:py-4 rounded-lg text-base md:text-lg font-semibold transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>

          {/* Hero Image/Illustration */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-8 border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <CheckCircle className="h-7 w-7 md:h-8 md:w-8 text-blue-600" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">Organiza</h3>
                  <p className="text-gray-600 text-sm md:text-base">Mantén todas tus tareas organizadas en un solo lugar</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Clock className="h-7 w-7 md:h-8 md:w-8 text-green-600" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">Prioriza</h3>
                  <p className="text-gray-600 text-sm md:text-base">Enfócate en lo que realmente importa</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Users className="h-7 w-7 md:h-8 md:w-8 text-purple-600" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">Colabora</h3>
                  <p className="text-gray-600 text-sm md:text-base">Trabaja en equipo de manera eficiente</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-white py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
              ¿Por qué elegir TaskFlow?
            </h2>
            <p className="text-base md:text-xl text-gray-600">
              Diseñado para mejorar tu productividad
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            <div className="text-center p-4 md:p-6">
              <div className="bg-blue-100 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <CheckSquare className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">Interfaz intuitiva</h3>
              <p className="text-gray-600 text-sm md:text-base">Diseño limpio y fácil de usar para una experiencia sin fricciones</p>
            </div>
            <div className="text-center p-4 md:p-6">
              <div className="bg-green-100 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Clock className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">Gestión de tiempo</h3>
              <p className="text-gray-600 text-sm md:text-base">Organiza tus tareas por prioridad y fecha de vencimiento</p>
            </div>
            <div className="text-center p-4 md:p-6">
              <div className="bg-purple-100 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">Sincronización</h3>
              <p className="text-gray-600 text-sm md:text-base">Accede a tus tareas desde cualquier dispositivo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-2 md:mb-4">
            <CheckSquare className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />
            <span className="ml-2 text-base md:text-lg font-bold">TaskFlow</span>
          </div>
          <p className="text-gray-400 text-xs md:text-base">
            © 2024 TaskFlow. Organiza tu vida, aumenta tu productividad.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;