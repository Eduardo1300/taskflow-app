import api from '../lib/api';
import { TaskCollaborator, CollaborationInvitation, TaskActivity, Task } from '../types/database';

export class CollaborationService {
  static async inviteCollaborator(
    taskId: number, 
    email: string, 
    permission: 'view' | 'edit' | 'admin' = 'view'
  ): Promise<{ data: CollaborationInvitation | null; error: string | null }> {
    try {
      const data = await api.inviteCollaborator(taskId, email, permission);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Error al invitar colaborador' };
    }
  }

  static async getPendingInvitations(): Promise<{ 
    data: Array<CollaborationInvitation & { task: Task; inviter: any }> | null; 
    error: string | null 
  }> {
    try {
      const { data } = await api.getCollaborators(0);
      return { data: data || [], error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Error al obtener invitaciones' };
    }
  }

  static async acceptInvitation(invitationId: number): Promise<{ success: boolean; error?: string }> {
    try {
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al aceptar invitación' };
    }
  }

  static async declineInvitation(invitationId: number): Promise<{ success: boolean; error?: string }> {
    try {
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al rechazar invitación' };
    }
  }

  static async getTaskCollaborators(taskId: number): Promise<{ 
    data: Array<TaskCollaborator & { user: any }> | null; 
    error: string | null 
  }> {
    try {
      const data = await api.getCollaborators(taskId);
      return { data: data || [], error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Error al obtener colaboradores' };
    }
  }

  static async removeCollaborator(taskId: number, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await api.removeCollaborator(taskId, userId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al eliminar colaborador' };
    }
  }

  static async getTaskActivity(taskId: number): Promise<{ 
    data: Array<TaskActivity & { user: any }> | null; 
    error: string | null 
  }> {
    try {
      const data = await api.getTaskActivity(taskId);
      return { data: data || [], error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Error al obtener actividad' };
    }
  }

  static async logActivity(
    taskId: number, 
    userId: string, 
    action: string, 
    details?: any
  ): Promise<void> {
    try {
      console.log('[CollaborationService] Activity logged:', { taskId, userId, action, details });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  static async getUserTaskPermission(taskId: number): Promise<{ 
    permission: 'owner' | 'view' | 'edit' | 'admin' | null; 
    error?: string 
  }> {
    return { permission: 'owner' };
  }
}
