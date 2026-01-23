import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
//prueba
export interface TaskAssignment {
  id: string;
  task_id: number;
  user_id: string;
  assigned_by: string;
  assigned_at: string;
  user?: User;
}

class UserService {
  // Obtener todos los usuarios del workspace/organización
  async getWorkspaceUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getWorkspaceUsers:', error);
      throw error;
    }
  }

  // Buscar usuarios por nombre o email
  async searchUsers(query: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('full_name')
        .limit(10);

      if (error) {
        console.error('Error searching users:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchUsers:', error);
      throw error;
    }
  }

  // Obtener asignaciones de una tarea
  async getTaskAssignments(taskId: number): Promise<TaskAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('task_assignments')
        .select(`
          *,
          user:profiles!user_id (*)
        `)
        .eq('task_id', taskId)
        .order('assigned_at');

      if (error) {
        console.error('Error fetching task assignments:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTaskAssignments:', error);
      throw error;
    }
  }

  // Asignar usuario a tarea
  async assignUserToTask(taskId: number, userId: string): Promise<TaskAssignment> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Verificar si ya está asignado
      const existingAssignment = await this.getTaskAssignments(taskId);
      const alreadyAssigned = existingAssignment.some(assignment => assignment.user_id === userId);
      
      if (alreadyAssigned) {
        throw new Error('El usuario ya está asignado a esta tarea');
      }

      const { data, error } = await supabase
        .from('task_assignments')
        .insert({
          task_id: taskId,
          user_id: userId,
          assigned_by: user.id,
        })
        .select(`
          *,
          user:profiles!user_id (*)
        `)
        .single();

      if (error) {
        console.error('Error assigning user to task:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in assignUserToTask:', error);
      throw error;
    }
  }

  // Quitar asignación de usuario de tarea
  async unassignUserFromTask(taskId: number, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('task_assignments')
        .delete()
        .eq('task_id', taskId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error unassigning user from task:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in unassignUserFromTask:', error);
      throw error;
    }
  }

  // Obtener tareas asignadas a un usuario
  async getUserTasks(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('task_assignments')
        .select(`
          *,
          task:tasks (*)
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user tasks:', error);
        throw error;
      }

      return data?.map(assignment => assignment.task) || [];
    } catch (error) {
      console.error('Error in getUserTasks:', error);
      throw error;
    }
  }

  // Obtener perfil de usuario por ID
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No encontrado
          return null;
        }
        console.error('Error fetching user profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      throw error;
    }
  }

  // Actualizar perfil de usuario
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      throw error;
    }
  }

  // Generar avatar con iniciales
  generateAvatarUrl(name: string): string {
    const initials = name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=3B82F6&color=ffffff&size=128`;
  }

  // Suscribirse a cambios en asignaciones de tarea
  subscribeToTaskAssignments(taskId: number, callback: (assignments: TaskAssignment[]) => void) {
    const subscription = supabase
      .channel(`task_assignments_${taskId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_assignments',
          filter: `task_id=eq.${taskId}`,
        },
        () => {
          // Recargar asignaciones cuando hay cambios
          this.getTaskAssignments(taskId).then(callback);
        }
      )
      .subscribe();

    return subscription;
  }
}

export const userService = new UserService();
