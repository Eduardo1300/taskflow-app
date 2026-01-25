import { supabase } from '../lib/supabase';

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
  static async getUserStats(userId: string): Promise<{ data: UserStats | null; error: string | null }> {
    try {
      // Obtener todas las tareas del usuario
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId);

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        throw tasksError;
      }

      const taskList = tasks || [];
      console.log('📊 Tasks fetched:', taskList.length);

      // Calcular estadísticas
      const tasksCompleted = taskList.filter(t => t.completed).length;
      const totalTasks = taskList.length;
      const averageCompletionRate = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

      console.log('📊 Tasks completed:', tasksCompleted, 'Total:', totalTasks, 'Rate:', averageCompletionRate);

      // Contar proyectos únicos (categorías con tareas activas)
      const activeCategories = new Set<string>();
      taskList.forEach(task => {
        if (!task.completed && task.category) {
          activeCategories.add(task.category);
        }
      });
      const activeProjects = activeCategories.size;

      // Calcular racha de días (días consecutivos con tareas completadas)
      const streakDays = this.calculateStreak(taskList);

      // Contar colaboradores únicos
      let collaborators = 0;
      
      if (taskList.length > 0) {
        const taskIds = taskList.map(t => t.id);
        const { data: collaborations, error: collabError } = await supabase
          .from('task_collaborators')
          .select('user_id')
          .in('task_id', taskIds)
          .neq('user_id', userId);

        if (!collabError && collaborations) {
          const uniqueCollaborators = new Set<string>();
          collaborations.forEach(c => uniqueCollaborators.add(c.user_id));
          collaborators = uniqueCollaborators.size;
        }
      }

      console.log('📊 Active projects:', activeProjects, 'Streak:', streakDays, 'Collaborators:', collaborators);

      // Estimar horas (asumiendo 30 minutos por tarea completada)
      const totalHours = Math.round(tasksCompleted * 0.5);

      return {
        data: {
          tasksCompleted,
          activeProjects,
          streakDays,
          collaborators,
          totalHours,
          averageCompletionRate,
          totalTasks
        },
        error: null
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        data: null,
        error: 'Error al cargar estadísticas'
      };
    }
  }

  private static calculateStreak(tasks: any[]): number {
    if (tasks.length === 0) return 0;

    // Obtener fechas únicas donde se completaron tareas
    const completedDates = new Set<string>();
    tasks.forEach(task => {
      if (task.completed && task.created_at) {
        const date = new Date(task.created_at).toLocaleDateString();
        completedDates.add(date);
      }
    });

    if (completedDates.size === 0) return 0;

    // Convertir a array y ordenar por fecha (descendente)
    const sortedDates = Array.from(completedDates)
      .map(date => new Date(date))
      .sort((a, b) => b.getTime() - a.getTime());

    // Contar días consecutivos desde hoy hacia atrás
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);

      const hasTaskOnDate = sortedDates.some(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === checkDate.getTime();
      });

      if (hasTaskOnDate) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}
