import { supabase, handleSupabaseError } from '../lib/supabase';
import { 
  TaskCollaborator, 
  CollaborationInvitation, 
  TaskActivity,
  Task
} from '../types/database';

export class CollaborationService {
  /**
   * Invitar a un colaborador a una tarea
   */
  static async inviteCollaborator(
    taskId: number, 
    email: string, 
    permission: 'view' | 'edit' | 'admin' = 'view'
  ): Promise<{ data: CollaborationInvitation | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      // Verificar que el usuario es el propietario de la tarea
      const { data: task } = await supabase
        .from('tasks')
        .select('user_id')
        .eq('id', taskId)
        .single();

      if (!task || task.user_id !== user.id) {
        return { data: null, error: 'No tienes permisos para compartir esta tarea' };
      }

      // Verificar que el email no sea del propietario
      if (email === user.email) {
        return { data: null, error: 'No puedes invitarte a ti mismo' };
      }

      // Crear la invitación
      const { data, error } = await supabase
        .from('collaboration_invitations')
        .insert({
          task_id: taskId,
          invited_email: email,
          invited_by: user.id,
          permission: permission
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      // Registrar actividad
      await this.logActivity(taskId, user.id, 'invitation_sent', {
        invited_email: email,
        permission: permission
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  /**
   * Obtener invitaciones pendientes para el usuario actual
   */
  static async getPendingInvitations(): Promise<{ 
    data: Array<CollaborationInvitation & { task: Task; inviter: any }> | null; 
    error: string | null 
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      const { data, error } = await supabase
        .from('collaboration_invitations')
        .select(`
          *,
          task:tasks(*),
          inviter:profiles!collaboration_invitations_invited_by_fkey(*)
        `)
        .eq('invited_email', user.email!)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  /**
   * Aceptar una invitación de colaboración
   */
  static async acceptInvitation(invitationId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('accept_collaboration_invitation', {
        invitation_id: invitationId
      });

      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }

      return { success: data };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error) };
    }
  }

  /**
   * Rechazar una invitación de colaboración
   */
  static async declineInvitation(invitationId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { error } = await supabase
        .from('collaboration_invitations')
        .update({ status: 'declined' })
        .eq('id', invitationId)
        .eq('invited_email', user.email!);

      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error) };
    }
  }

  /**
   * Obtener colaboradores de una tarea
   */
  static async getTaskCollaborators(taskId: number): Promise<{ 
    data: Array<TaskCollaborator & { user: any }> | null; 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('task_collaborators')
        .select(`
          *,
          user:profiles!task_collaborators_user_id_fkey(*)
        `)
        .eq('task_id', taskId);

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  /**
   * Eliminar un colaborador de una tarea
   */
  static async removeCollaborator(taskId: number, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { error } = await supabase
        .from('task_collaborators')
        .delete()
        .eq('task_id', taskId)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }

      // Registrar actividad
      await this.logActivity(taskId, user.id, 'collaborator_removed', {
        removed_user_id: userId
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error) };
    }
  }

  /**
   * Obtener actividad de una tarea
   */
  static async getTaskActivity(taskId: number): Promise<{ 
    data: Array<TaskActivity & { user: any }> | null; 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('task_activity')
        .select(`
          *,
          user:profiles!task_activity_user_id_fkey(*)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  /**
   * Registrar actividad en una tarea
   */
  static async logActivity(
    taskId: number, 
    userId: string, 
    action: string, 
    details?: any
  ): Promise<void> {
    try {
      await supabase
        .from('task_activity')
        .insert({
          task_id: taskId,
          user_id: userId,
          action: action,
          details: details
        });
    } catch (error) {
      // Log pero no fallar por errores de actividad
      console.error('Error logging activity:', error);
    }
  }

  /**
   * Verificar permisos del usuario en una tarea
   */
  static async getUserTaskPermission(taskId: number): Promise<{ 
    permission: 'owner' | 'view' | 'edit' | 'admin' | null; 
    error?: string 
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { permission: null, error: 'Usuario no autenticado' };
      }

      // Verificar si es el propietario
      const { data: task } = await supabase
        .from('tasks')
        .select('user_id')
        .eq('id', taskId)
        .single();

      if (task && task.user_id === user.id) {
        return { permission: 'owner' };
      }

      // Verificar colaboración
      const { data: collaboration } = await supabase
        .from('task_collaborators')
        .select('permission')
        .eq('task_id', taskId)
        .eq('user_id', user.id)
        .single();

      if (collaboration) {
        return { permission: collaboration.permission };
      }

      return { permission: null };
    } catch (error) {
      return { permission: null, error: handleSupabaseError(error) };
    }
  }
}
