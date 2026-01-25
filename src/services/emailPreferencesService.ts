import { supabase } from '../lib/supabase';

export interface EmailPreferences {
  id?: string;
  user_id: string;
  email: string;
  task_created: boolean;
  task_completed: boolean;
  task_overdue: boolean;
  task_reminder: boolean;
  created_at?: string;
  updated_at?: string;
}

export class EmailPreferencesService {
  /**
   * Obtener las preferencias de email del usuario
   */
  static async getEmailPreferences(): Promise<EmailPreferences | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('email_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching email preferences:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error in getEmailPreferences:', error);
      return null;
    }
  }

  /**
   * Guardar o actualizar las preferencias de email
   */
  static async saveEmailPreferences(preferences: Omit<EmailPreferences, 'user_id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Primero intentar obtener los datos existentes
      const existing = await this.getEmailPreferences();

      if (existing) {
        // Actualizar
        const { error } = await supabase
          .from('email_preferences')
          .update({
            email: preferences.email,
            task_created: preferences.task_created,
            task_completed: preferences.task_completed,
            task_overdue: preferences.task_overdue,
            task_reminder: preferences.task_reminder,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (error) {
          return { success: false, error: error.message };
        }
      } else {
        // Crear nuevo
        const { error } = await supabase
          .from('email_preferences')
          .insert({
            user_id: user.id,
            email: preferences.email,
            task_created: preferences.task_created,
            task_completed: preferences.task_completed,
            task_overdue: preferences.task_overdue,
            task_reminder: preferences.task_reminder,
          });

        if (error) {
          return { success: false, error: error.message };
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error in saveEmailPreferences:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Verificar si se debe enviar email para un tipo de evento
   */
  static async shouldSendEmailForEvent(eventType: 'task_created' | 'task_completed' | 'task_overdue' | 'task_reminder'): Promise<{ should: boolean; email?: string }> {
    try {
      const preferences = await this.getEmailPreferences();
      
      if (!preferences || !preferences.email) {
        return { should: false };
      }

      const shouldSend = (
        (eventType === 'task_created' && preferences.task_created) ||
        (eventType === 'task_completed' && preferences.task_completed) ||
        (eventType === 'task_overdue' && preferences.task_overdue) ||
        (eventType === 'task_reminder' && preferences.task_reminder)
      );

      return { should: shouldSend, email: preferences.email };
    } catch (error) {
      console.error('Error in shouldSendEmailForEvent:', error);
      return { should: false };
    }
  }
}
