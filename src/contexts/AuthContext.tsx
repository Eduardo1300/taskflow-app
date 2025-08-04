import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthContextType, User } from '../types';
import { mockUsers } from '../data/mockData';

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

  const login = (email: string, password: string): boolean => {
    // Simulación simple de login
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'password123') {
      setUser(foundUser);
      localStorage.setItem('taskflow_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = (name: string, email: string, password: string): boolean => {
    // Simulación simple de registro
    const existingUser = mockUsers.find(u => u.email === email);
    if (!existingUser && password.length >= 6) {
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
      };
      mockUsers.push(newUser);
      setUser(newUser);
      localStorage.setItem('taskflow_user', JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('taskflow_user');
  };

  // Verificar si hay un usuario guardado en localStorage al cargar
  React.useEffect(() => {
    const savedUser = localStorage.getItem('taskflow_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};