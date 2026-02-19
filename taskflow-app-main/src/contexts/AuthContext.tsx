import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';
import { AuthContextType, AuthResult, User } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const mapApiUser = (apiUser: any): User => ({
    id: apiUser.id,
    name: apiUser.full_name || apiUser.email?.split('@')[0] || 'Usuario',
    email: apiUser.email || '',
  });

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const data = await api.login(email, password);
      if (data.user) {
        setUser(mapApiUser(data.user));
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al iniciar sesión' };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    try {
      if (!email || !email.includes('@')) {
        return { success: false, error: 'Email inválido' };
      }
      
      if (!password || password.length < 6) {
        return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
      }
      
      if (!name || name.trim().length < 2) {
        return { success: false, error: 'El nombre debe tener al menos 2 caracteres' };
      }

      const data = await api.register(email, password, name);
      if (data.user) {
        setUser(mapApiUser(data.user));
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al registrar usuario' };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
    } catch (error) {
      setUser(null);
    }
  };

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      api.getProfile()
        .then((data) => {
          if (data?.user) {
            setUser(mapApiUser(data.user));
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
