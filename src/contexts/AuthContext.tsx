import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, handleSupabaseError } from '../lib/supabase';
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

  // Convertir usuario de Supabase a nuestro formato
  const mapSupabaseUser = (supabaseUser: SupabaseUser): User => ({
    id: supabaseUser.id,
    name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Usuario',
    email: supabaseUser.email || '',
  });

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }

      if (data.user) {
        setUser(mapSupabaseUser(data.user));
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error) };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    try {
      // Validaciones previas del lado del cliente
      if (!email || !email.includes('@')) {
        return { success: false, error: 'Email inválido' };
      }
      
      if (!password || password.length < 6) {
        return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
      }
      
      if (!name || name.trim().length < 2) {
        return { success: false, error: 'El nombre debe tener al menos 2 caracteres' };
      }

      // Verificar si el email ya existe antes de intentar registrar
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.toLowerCase())
        .single();

      if (existingUser) {
        return { success: false, error: 'Este email ya está registrado. Intenta iniciar sesión.' };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }

      if (data.user) {
        // Si el usuario necesita verificar el email, mostrar mensaje
        if (!data.session) {
          return { 
            success: true, 
            requiresEmailVerification: true,
            error: 'Te hemos enviado un email de confirmación. Por favor, verifica tu correo antes de continuar.' 
          };
        }
        
        setUser(mapSupabaseUser(data.user));
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error) };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      // Silently handle logout errors
    }
  };

  // Verificar sesión al cargar y escuchar cambios de autenticación
  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      }
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
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