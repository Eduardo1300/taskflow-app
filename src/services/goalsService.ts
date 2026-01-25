import { supabase } from '../lib/supabase';

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
  static async getGoals(userId: string) {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error getting goals:', error);
      return { data: [], error: 'Error al cargar objetivos' };
    }
  }

  static async createGoal(userId: string, goal: Goal) {
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([
          {
            user_id: userId,
            title: goal.title,
            description: goal.description,
            target: goal.target,
            type: goal.type,
            category: goal.category,
            current: 0,
            completed: false
          }
        ])
        .select();

      if (error) throw error;
      return { data: data?.[0], error: null };
    } catch (error) {
      console.error('Error creating goal:', error);
      return { data: null, error: 'Error al crear objetivo' };
    }
  }

  static async updateGoal(goalId: string, updates: Partial<Goal>) {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update({
          title: updates.title,
          description: updates.description,
          target: updates.target,
          type: updates.type,
          category: updates.category,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .select();

      if (error) throw error;
      return { data: data?.[0], error: null };
    } catch (error) {
      console.error('Error updating goal:', error);
      return { data: null, error: 'Error al actualizar objetivo' };
    }
  }

  static async updateGoalProgress(goalId: string, current: number, completed: boolean) {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update({
          current,
          completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .select();

      if (error) throw error;
      return { data: data?.[0], error: null };
    } catch (error) {
      console.error('Error updating goal progress:', error);
      return { data: null, error: 'Error al actualizar progreso' };
    }
  }

  static async deleteGoal(goalId: string) {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting goal:', error);
      return { success: false, error: 'Error al eliminar objetivo' };
    }
  }
}
