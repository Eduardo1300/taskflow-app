import { 
  LayoutDashboard, 
  Calendar, 
  User, 
  LogOut, 
  BarChart3, 
  Globe, 
  Zap, 
  Trello,
  Settings,
  Search,
  Target,
  Sparkles,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isCollapsed?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route?: string;
  badge?: string | number;
  color?: string;
  description?: string;
  premium?: boolean;
}

const SidebarEnhanced: React.FC<SidebarProps> = ({ 
  activeSection, 
  onSectionChange, 
  isCollapsed = false,
  isOpen = false,
  onClose
}) => {
  const { logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      route: '/dashboard',
      color: 'text-blue-500',
      description: 'Vista general de tus tareas'
    },
    { 
      id: 'kanban', 
      label: 'Kanban', 
      icon: Trello, 
      route: '/kanban',
      color: 'text-purple-500',
      description: 'Organiza tus tareas visualmente',
      badge: '3'
    },
    { 
      id: 'calendar', 
      label: 'Calendario', 
      icon: Calendar, 
      route: '/calendar',
      color: 'text-green-500',
      description: 'Planifica tu tiempo'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3, 
      route: '/analytics',
      color: 'text-orange-500',
      description: 'Métricas de productividad'
    },
    { 
      id: 'api', 
      label: 'API REST', 
      icon: Globe, 
      route: '/api',
      color: 'text-cyan-500',
      description: 'Gestiona tu API',
      premium: true
    },
    { 
      id: 'integrations', 
      label: 'Integraciones', 
      icon: Zap, 
      route: '/integrations',
      color: 'text-yellow-500',
      description: 'Conecta con otras apps',
      premium: true
    },
    { 
      id: 'profile', 
      label: 'Perfil', 
      icon: User,
      route: '/profile',
      color: 'text-gray-500',
      description: 'Configuración personal'
    },
  ];

  const secondaryItems: MenuItem[] = [
    { 
      id: 'settings', 
      label: 'Configuración', 
      icon: Settings,
      route: '/settings',
      color: 'text-gray-500',
      description: 'Ajustes de la aplicación'
    },
    { 
      id: 'help', 
      label: 'Ayuda', 
      icon: HelpCircle,
      route: '/help',
      color: 'text-gray-500',
      description: 'Soporte y documentación'
    }
  ];

  // Cerrar sidebar en móvil al navegar
  useEffect(() => {
    if (onClose) {
      onClose();
    }
  }, [location.pathname, onClose]);

  const handleItemClick = (item: MenuItem) => {
    if (item.route) {
      navigate(item.route);
    } else {
      onSectionChange(item.id);
    }
    if (onClose) {
      onClose();
    }
  };

  const isActive = (item: MenuItem) => {
    if (item.route) {
      return location.pathname === item.route;
    }
    return activeSection === item.id;
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 shadow-xl transform transition-all duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 
          ${isCollapsed ? 'w-20' : 'w-64 lg:w-64'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TaskFlow
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Productividad Premium
                </p>
              </div>
            )}
          </div>
          
          {/* Close button - mobile only */}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        {!isCollapsed && (
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              const hovered = hoveredItem === item.id;
              
              return (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`w-full flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-all duration-200 group ${
                      active
                        ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 shadow-lg'
                        : hovered
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white scale-105'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <div className={`relative ${isCollapsed ? '' : 'mr-4'}`}>
                      <Icon className={`h-6 w-6 transition-all duration-200 ${
                        active ? item.color : hovered ? item.color : ''
                      } ${hovered ? 'scale-110' : ''}`} />
                      {active && (
                        <div className="absolute inset-0 rounded-lg bg-current opacity-20 animate-pulse" />
                      )}
                    </div>
                    
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        
                        {/* Badges */}
                        <div className="flex items-center space-x-2">
                          {item.premium && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full">
                              Pro
                            </span>
                          )}
                          {item.badge && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full min-w-[20px] text-center">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </button>

                  {/* Tooltip for collapsed sidebar */}
                  {isCollapsed && hovered && (
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white text-sm px-3 py-2 rounded-lg shadow-lg z-50 whitespace-nowrap">
                      <div>{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-gray-300 mt-1">{item.description}</div>
                      )}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
                    </div>
                  )}

                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-gray-200 dark:border-gray-700" />

          {/* Secondary Items */}
          <div className="space-y-1">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              const hovered = hoveredItem === item.id;
              
              return (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 shadow-lg'
                        : hovered
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-4'} transition-transform duration-200 ${
                      hovered ? 'scale-110' : ''
                    } ${active ? item.color : ''}`} />
                    {!isCollapsed && item.label}
                  </button>

                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full" />
                  )}

                  {/* Tooltip for collapsed sidebar */}
                  {isCollapsed && hovered && (
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white text-sm px-3 py-2 rounded-lg shadow-lg z-50 whitespace-nowrap">
                      <div>{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-gray-300 mt-1">{item.description}</div>
                      )}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={logout}
            className={`w-full flex items-center px-4 py-4 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 group ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className={`h-5 w-5 ${isCollapsed ? '' : 'mr-4'} group-hover:scale-110 transition-transform duration-200`} />
            {!isCollapsed && 'Cerrar sesión'}
          </button>
        </div>

        {/* Productivity Stats */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl p-4 border border-blue-500/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Productividad Hoy
                </span>
                <Sparkles className="h-4 w-4 text-blue-500" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Tareas completadas</span>
                  <span className="font-medium text-green-600 dark:text-green-400">5/8</span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500" style={{ width: '62%' }} />
                </div>
                
                <div className="flex items-center justify-center pt-1">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    +2 vs ayer
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default SidebarEnhanced;
