import { supabase } from '../lib/supabase';

export interface KanbanBoard {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  is_public: boolean;
  settings: {
    columns: Array<{
      id: string;
      title: string;
      color: string;
      wipLimit?: number;
      order: number;
    }>;
    theme?: string;
    auto_archive_completed?: boolean;
  };
}

export interface BoardMember {
  board_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at: string;
}

export interface BoardMetrics {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  avg_cycle_time: number; // days
  throughput_week: number;
  bottleneck_column?: string;
}

export class BoardService {
  static async getBoards(userId: string) {
    try {
      const { data, error } = await supabase
        .from('kanban_boards')
        .select(`
          *,
          board_members!inner(user_id, role),
          tasks(count)
        `)
        .or(`owner_id.eq.${userId},board_members.user_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching boards:', error);
      return { data: null, error: error as Error };
    }
  }

  static async createBoard(board: Omit<KanbanBoard, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('kanban_boards')
        .insert([{
          ...board,
          settings: {
            columns: [
              { id: 'pending', title: 'Por hacer', color: 'bg-blue-500', order: 0 },
              { id: 'in-progress', title: 'En progreso', color: 'bg-yellow-500', wipLimit: 3, order: 1 },
              { id: 'review', title: 'En revisión', color: 'bg-purple-500', wipLimit: 2, order: 2 },
              { id: 'completed', title: 'Completado', color: 'bg-green-500', order: 3 }
            ],
            theme: 'default',
            auto_archive_completed: true
          }
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating board:', error);
      return { data: null, error: error as Error };
    }
  }

  static async updateBoard(boardId: string, updates: Partial<KanbanBoard>) {
    try {
      const { data, error } = await supabase
        .from('kanban_boards')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', boardId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating board:', error);
      return { data: null, error: error as Error };
    }
  }

  static async deleteBoard(boardId: string) {
    try {
      const { error } = await supabase
        .from('kanban_boards')
        .delete()
        .eq('id', boardId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting board:', error);
      return { error: error as Error };
    }
  }

  static async getBoardMetrics(boardId: string): Promise<{ data: BoardMetrics | null; error: Error | null }> {
    try {
      // Get all tasks for the board
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('board_id', boardId);

      if (tasksError) throw tasksError;

      if (!tasks) {
        return { data: null, error: null };
      }

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Calculate metrics
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.completed).length;
      const inProgressTasks = tasks.filter(t => !t.completed).length;
      const overdueTasks = tasks.filter(t => 
        t.due_date && new Date(t.due_date) < now && !t.completed
      ).length;

      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // Calculate average cycle time (simplified)
      const completedTasksWithDates = tasks.filter(t => 
        t.completed && t.created_at && t.updated_at
      );
      
      const avgCycleTime = completedTasksWithDates.length > 0 
        ? completedTasksWithDates.reduce((acc, task) => {
            const created = new Date(task.created_at);
            const completed = new Date(task.updated_at);
            return acc + (completed.getTime() - created.getTime());
          }, 0) / completedTasksWithDates.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0;

      // Calculate throughput (tasks completed in last week)
      const throughputWeek = tasks.filter(t => 
        t.completed && t.updated_at && new Date(t.updated_at) >= weekAgo
      ).length;

      const metrics: BoardMetrics = {
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        in_progress_tasks: inProgressTasks,
        overdue_tasks: overdueTasks,
        completion_rate: Math.round(completionRate * 100) / 100,
        avg_cycle_time: Math.round(avgCycleTime * 100) / 100,
        throughput_week: throughputWeek,
      };

      return { data: metrics, error: null };
    } catch (error) {
      console.error('Error calculating board metrics:', error);
      return { data: null, error: error as Error };
    }
  }

  static async addBoardMember(boardId: string, userId: string, role: BoardMember['role'] = 'member') {
    try {
      const { data, error } = await supabase
        .from('board_members')
        .insert([{
          board_id: boardId,
          user_id: userId,
          role: role,
          joined_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error adding board member:', error);
      return { data: null, error: error as Error };
    }
  }

  static async updateBoardMemberRole(boardId: string, userId: string, role: BoardMember['role']) {
    try {
      const { data, error } = await supabase
        .from('board_members')
        .update({ role })
        .eq('board_id', boardId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating board member role:', error);
      return { data: null, error: error as Error };
    }
  }

  static async removeBoardMember(boardId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('board_members')
        .delete()
        .eq('board_id', boardId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error removing board member:', error);
      return { error: error as Error };
    }
  }
}
