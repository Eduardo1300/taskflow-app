import { supabase, handleSupabaseError } from '../lib/supabase';
import { Task, TaskInsert, TaskUpdate } from '../types/database';
import { EmailService } from './emailService';
import { EmailPreferencesService } from './emailPreferencesService';

export class TaskService {
  /**
   * Obtener todas las tareas del usuario autenticado
   */
  static async getTasks(): Promise<{ data: Task[] | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  /**
   * Crear una nueva tarea
   */
  static async createTask(taskData: Omit<TaskInsert, 'user_id'>): Promise<{ data: Task | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      // Enviar email si el usuario tiene activada la notificación de tarea creada
      try {
        console.log('[TaskService] Verificando si enviar email...');
        const { should, email } = await EmailPreferencesService.shouldSendEmailForEvent('task_created');
        console.log('[TaskService] ¿Enviar email?:', should);
        console.log('[TaskService] Email destino:', email);
        
        if (should && email) {
          console.log('[TaskService] Enviando email de tarea creada...');
          await EmailService.sendTaskCreatedEmail(
            email,
            data.title,
            data.id.toString(),
            data
          );
          console.log('✉️ Task created email sent successfully');
        } else {
          console.log('[TaskService] No se enviará email (should=', should, ', email=', email, ')');
        }
      } catch (emailError) {
        console.error('[TaskService] Error sending task created email:', emailError);
        // No fallar la creación de la tarea si falla el email
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  /**
   * Actualizar una tarea existente
   */
  static async updateTask(id: number, updates: TaskUpdate): Promise<{ data: Task | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id) // Asegurarse de que solo actualice tareas del usuario
        .select()
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  /**
   * Alternar el estado completado de una tarea
   */
  static async toggleTaskCompletion(id: number, completed: boolean): Promise<{ data: Task | null; error: string | null }> {
    const result = await this.updateTask(id, { completed });
    
    // Si la tarea se completó, enviar email de notificación
    if (completed && result.data) {
      try {
        const { should, email } = await EmailPreferencesService.shouldSendEmailForEvent('task_completed');
        
        if (should && email) {
          await EmailService.sendTaskCompletedEmail(
            email,
            result.data.title
          );
          console.log('✉️ Task completed email sent successfully');
        }
      } catch (emailError) {
        console.error('[TaskService] Error sending task completed email:', emailError);
      }
    }
    
    return result;
  }

  /**
   * Eliminar una tarea
   */
  static async deleteTask(id: number): Promise<{ error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: 'Usuario no autenticado' };
      }

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Asegurarse de que solo elimine tareas del usuario

      if (error) {
        return { error: handleSupabaseError(error) };
      }

      return { error: null };
    } catch (error) {
      return { error: handleSupabaseError(error) };
    }
  }

  /**
   * Obtener estadísticas de tareas del usuario
   */
  static async getTaskStats(): Promise<{ 
    data: { total: number; completed: number; pending: number } | null; 
    error: string | null 
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('completed')
        .eq('user_id', user.id);

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      const total = data.length;
      const completed = data.filter(task => task.completed).length;
      const pending = total - completed;

      return { 
        data: { total, completed, pending }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  /**
   * Buscar tareas por título o descripción
   */
  static async searchTasks(query: string): Promise<{ data: Task[] | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  /**
   * Filtrar tareas por estado
   */
  static async getTasksByStatus(completed: boolean): Promise<{ data: Task[] | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', completed)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }
}