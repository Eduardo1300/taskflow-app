import api from '../lib/api';

export interface Goal {
  id?: string;
  user_id?: string;
  title: string;
  description: string;
  target: number;
  current?: number;
  type: 'daily' | 'weekly' | 'monthly';
  category: 'tasks' | 'productivity' | 'custom';
  completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export class GoalsService {
  static async getGoals() {
    try {
      const goals = await api.getGoals();
      return { data: goals || [], error: null };
    } catch (error: any) {
      console.error('Error getting goals:', error);
      return { data: [], error: error.message || 'Error al cargar objetivos' };
    }
  }

  static async createGoal(goal: Goal) {
    try {
      const data = await api.createGoal(goal);
      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating goal:', error);
      return { data: null, error: error.message || 'Error al crear objetivo' };
    }
  }

  static async updateGoal(goalId: string, updates: Partial<Goal>) {
    try {
      const data = await api.updateGoal(goalId, updates);
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating goal:', error);
      return { data: null, error: error.message || 'Error al actualizar objetivo' };
    }
  }

  static async updateGoalProgress(goalId: string, current: number, completed: boolean) {
    try {
      const data = await api.updateGoal(goalId, { current, completed });
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating goal progress:', error);
      return { data: null, error: error.message || 'Error al actualizar progreso' };
    }
  }

  static async deleteGoal(goalId: string) {
    try {
      await api.deleteGoal(goalId);
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error deleting goal:', error);
      return { success: false, error: error.message || 'Error al eliminar objetivo' };
    }
  }
}
