import { CheckSquare, LogOut, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  showUserMenu?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showUserMenu = false }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center h-12 md:h-16 gap-2 md:gap-0">
          <div className="flex items-center">
            <CheckSquare className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            <span className="ml-2 text-lg md:text-xl font-bold text-gray-900">TaskFlow</span>
          </div>
          {showUserMenu && user && (
            <div className="flex justify-end w-full md:w-auto">
              <div className="relative">
                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-700">
                    <User className="h-4 w-4 mr-2" />
                    <span className="truncate max-w-[120px] lg:max-w-[150px]">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Cerrar sesión
                  </button>
                </div>

                {/* Mobile Menu */}
                <div className="md:hidden">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors min-w-[140px]"
                  >
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[80px]">
                        {user.name}
                      </span>
                    </div>
                    {isMenuOpen ? (
                      <ChevronUp className="h-4 w-4 text-gray-500 ml-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500 ml-1" />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;