import api from '../lib/api';

export interface UserStats {
  tasksCompleted: number;
  activeProjects: number;
  streakDays: number;
  collaborators: number;
  totalHours: number;
  averageCompletionRate: number;
  totalTasks: number;
}

export class StatsService {
  static async getUserStats(): Promise<{ data: UserStats | null; error: string | null }> {
    try {
      const tasks = await api.getTasks();
      const taskList = tasks || [];

      const tasksCompleted = taskList.filter((t: any) => t.completed).length;
      const totalTasks = taskList.length;
      const averageCompletionRate = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

      const activeCategories = new Set<string>();
      taskList.forEach((task: any) => {
        if (!task.completed && task.category) {
          activeCategories.add(task.category);
        }
      });
      const activeProjects = activeCategories.size;

      const completedTasks = taskList.filter((t: any) => t.completed);
      const sortedCompleted = completedTasks.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      let streakDays = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < sortedCompleted.length; i++) {
        const taskDate = new Date(sortedCompleted[i].created_at);
        taskDate.setHours(0, 0, 0, 0);
        
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (taskDate.getTime() === expectedDate.getTime()) {
          streakDays++;
        } else {
          break;
        }
      }

      return {
        data: {
          tasksCompleted,
          activeProjects,
          streakDays,
          collaborators: 0,
          totalHours: 0,
          averageCompletionRate,
          totalTasks
        },
        error: null
      };
    } catch (error: any) {
      console.error('Error getting stats:', error);
      return { data: null, error: error.message || 'Error al obtener estadísticas' };
    }
  }
}
