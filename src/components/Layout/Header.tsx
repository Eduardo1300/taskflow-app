import { CheckSquare, LogOut, User, ChevronDown, Bell, Search, Settings, Sun, Moon, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { NotificationPanel } from '../Notifications/NotificationPanel';

interface HeaderProps {
  showUserMenu?: boolean;
  onMobileMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ showUserMenu = false, onMobileMenuToggle }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      setIsMenuOpen(false);
      setIsSearchOpen(false);
    };

    if (isMenuOpen || isSearchOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMenuOpen, isSearchOpen]);

    const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo y Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            {onMobileMenuToggle && (
              <button
                onClick={onMobileMenuToggle}
                className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="relative">
                <CheckSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TaskFlow
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  Productividad inteligente
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar tareas, proyectos..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </form>
            </div>
          </div>

          {/* Right Side Actions */}
          {showUserMenu && user && (
            <div className="flex items-center space-x-2">
              
              {/* Mobile Search Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
                title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 group-hover:rotate-12 transition-transform duration-200" />
                ) : (
                  <Moon className="h-5 w-5 group-hover:-rotate-12 transition-transform duration-200" />
                )}
              </button>

              {/* Notification Button */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(true)}
                  className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
                >
                  <Bell className="h-5 w-5 group-hover:animate-bounce" />
                  {/* Notification Badge */}
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">3</span>
                  </span>
                </button>
              </div>

              {/* Settings Button */}
              <button
                onClick={() => navigate('/settings')}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
              >
                <Settings className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(!isMenuOpen);
                  }}
                  className="flex items-center space-x-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                        {user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">En línea</p>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                    isMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Cuenta personal</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <User className="h-4 w-4 mr-3" />
                      Mi Perfil
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Configuración
                    </button>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden py-3 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tareas, proyectos..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
          </div>
        )}
      </div>

      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </header>
  );
};

export default Header;
