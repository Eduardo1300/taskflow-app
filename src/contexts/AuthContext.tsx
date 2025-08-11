import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { AuthContextType, User } from '../types';

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

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
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

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🚀 Intentando registrar usuario:', { email, name });
      
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
      console.log('🔍 Verificando si el email existe...');
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.toLowerCase())
        .single();

      if (existingUser) {
        console.log('❌ Email ya existe en profiles');
        return { success: false, error: 'Este email ya está registrado. Intenta iniciar sesión.' };
      }

      console.log('✅ Email no existe en profiles, procediendo con signUp...');

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      console.log('📊 Resultado de signUp:', {
        user: data.user ? 'Usuario creado' : 'No user',
        session: data.session ? 'Sesión creada' : 'No session',
        error: error ? error.message : 'Sin error'
      });

      if (error) {
        console.error('❌ Error en signUp:', error);
        return { success: false, error: handleSupabaseError(error) };
      }

      if (data.user) {
        // Si el usuario necesita verificar el email, mostrar mensaje
        if (!data.session) {
          console.log('📧 Usuario creado pero necesita verificar email');
          return { 
            success: true, 
            error: 'Te hemos enviado un email de confirmación. Por favor, verifica tu correo antes de continuar.' 
          };
        }
        
        console.log('✅ Usuario registrado y sesión iniciada');
        setUser(mapSupabaseUser(data.user));
      }

      return { success: true };
    } catch (error) {
      console.error('💥 Error inesperado en register:', error);
      return { success: false, error: handleSupabaseError(error) };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
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
      async (event, session) => {
        console.log('Auth state changed:', event);
        
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
    login: async (email: string, password: string) => {
      const result = await login(email, password);
      return result.success;
    },
    register: async (name: string, email: string, password: string) => {
      const result = await register(name, email, password);
      return result.success;
    },
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};