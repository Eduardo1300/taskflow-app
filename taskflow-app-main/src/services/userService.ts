import api from '../lib/api';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskAssignment {
  id: string;
  task_id: number;
  user_id: string;
  assigned_by: string;
  assigned_at: string;
  user?: User;
}

class UserService {
  async getWorkspaceUsers(): Promise<User[]> {
    try {
      const profile = await api.getProfile();
      return profile?.user ? [profile.user] : [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    console.log('[UserService] Searching users:', query);
    return [];
  }

  async getUserById(userId: string): Promise<User | null> {
    console.log('[UserService] Getting user by id:', userId);
    return null;
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const profile = await api.getProfile();
      return profile?.user || null;
    } catch {
      return null;
    }
  }

  async getTaskAssignments(taskId: number): Promise<TaskAssignment[]> {
    return [];
  }

  subscribeToTaskAssignments(callback: (assignments: TaskAssignment[]) => void) {
    return { unsubscribe: () => {} };
  }

  async assignUserToTask(taskId: number, userId: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  async unassignUserFromTask(taskId: number, userId: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  generateAvatarUrl(userId: string): string {
    return '';
  }
}

export const userService = new UserService();
