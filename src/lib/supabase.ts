import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Helper mejorado para manejar errores de Supabase
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error details:', {
    message: error?.message,
    status: error?.status,
    statusCode: error?.statusCode,
    details: error?.details,
    hint: error?.hint,
    code: error?.code,
    fullError: error
  });

  // Mapear errores específicos de autenticación
  if (error?.message) {
    const message = error.message.toLowerCase();
    
    // Errores comunes de signUp
    if (message.includes('user already registered')) {
      return 'Este email ya está registrado. Intenta iniciar sesión.';
    }
    
    if (message.includes('email already registered')) {
      return 'Este email ya está en uso. ¿Quieres iniciar sesión?';
    }
    
    if (message.includes('signup is disabled')) {
      return 'El registro de nuevos usuarios está deshabilitado temporalmente.';
    }
    
    if (message.includes('invalid email')) {
      return 'El formato del email no es válido.';
    }
    
    if (message.includes('password')) {
      return 'La contraseña no cumple con los requisitos mínimos.';
    }
    
    if (message.includes('rate limit')) {
      return 'Demasiados intentos. Espera un momento antes de intentar nuevamente.';
    }
    
    if (message.includes('email not confirmed')) {
      return 'Debes confirmar tu email antes de continuar.';
    }
    
    // Errores de configuración
    if (message.includes('invalid jwt')) {
      return 'Sesión inválida. Por favor, inicia sesión nuevamente.';
    }
    
    if (message.includes('missing authorization header')) {
      return 'Error de autorización. Verifica la configuración.';
    }
  }
  
  // Error genérico con el mensaje original si no coincide con ningún patrón
  return error?.message || 'Ha ocurrido un error inesperado. Inténtalo nuevamente.';
};