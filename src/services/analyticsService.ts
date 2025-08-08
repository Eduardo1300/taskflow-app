import { Task } from '../types';

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
}

export interface CategoryStats {
  name: string;
  total: number;
  completed: number;
  percentage: number;
}

export interface PriorityStats {
  high: number;
  medium: number;
  low: number;
}

export interface ProductivityStats {
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  tasksCompletedThisMonth: number;
  averageCompletionTime: number; // in days
  mostProductiveDay: string;
  currentStreak: number; // days with completed tasks
}

export interface TimeStats {
  hourlyDistribution: { hour: number; count: number }[];
  dailyDistribution: { day: string; count: number }[];
  monthlyDistribution: { month: string; count: number }[];
}

export interface AnalyticsData {
  taskStats: TaskStats;
  categoryStats: CategoryStats[];
  priorityStats: PriorityStats;
  productivityStats: ProductivityStats;
  timeStats: TimeStats;
  lastUpdated: Date;
}

class AnalyticsService {
  calculateTaskStats(tasks: Task[]): TaskStats {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    
    // Calculate overdue tasks
    const now = new Date();
    const overdue = tasks.filter(task => 
      !task.completed && 
      task.due_date && 
      new Date(task.due_date) < now
    ).length;
    
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    return {
      total,
      completed,
      pending,
      overdue,
      completionRate: Math.round(completionRate * 100) / 100
    };
  }

  calculateCategoryStats(tasks: Task[]): CategoryStats[] {
    const categoryMap = new Map<string, { total: number; completed: number }>();
    
    tasks.forEach(task => {
      const category = task.category || 'Sin categoría';
      const current = categoryMap.get(category) || { total: 0, completed: 0 };
      
      categoryMap.set(category, {
        total: current.total + 1,
        completed: current.completed + (task.completed ? 1 : 0)
      });
    });
    
    return Array.from(categoryMap.entries()).map(([name, stats]) => ({
      name,
      total: stats.total,
      completed: stats.completed,
      percentage: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    })).sort((a, b) => b.total - a.total);
  }

  calculatePriorityStats(tasks: Task[]): PriorityStats {
    return {
      high: tasks.filter(task => task.priority === 'high').length,
      medium: tasks.filter(task => task.priority === 'medium').length,
      low: tasks.filter(task => task.priority === 'low').length
    };
  }

  calculateProductivityStats(tasks: Task[]): ProductivityStats {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const completedTasks = tasks.filter(task => task.completed);
    
    // Tasks completed today
    const tasksCompletedToday = completedTasks.filter(task => {
      const createdDate = new Date(task.created_at);
      return createdDate >= today;
    }).length;
    
    // Tasks completed this week
    const tasksCompletedThisWeek = completedTasks.filter(task => {
      const createdDate = new Date(task.created_at);
      return createdDate >= thisWeekStart;
    }).length;
    
    // Tasks completed this month
    const tasksCompletedThisMonth = completedTasks.filter(task => {
      const createdDate = new Date(task.created_at);
      return createdDate >= thisMonthStart;
    }).length;
    
    // Average completion time (simplified calculation)
    const averageCompletionTime = this.calculateAverageCompletionTime(completedTasks);
    
    // Most productive day of the week
    const mostProductiveDay = this.calculateMostProductiveDay(completedTasks);
    
    // Current streak
    const currentStreak = this.calculateCurrentStreak(completedTasks);
    
    return {
      tasksCompletedToday,
      tasksCompletedThisWeek,
      tasksCompletedThisMonth,
      averageCompletionTime,
      mostProductiveDay,
      currentStreak
    };
  }

  private calculateAverageCompletionTime(completedTasks: Task[]): number {
    if (completedTasks.length === 0) return 0;
    
    const times = completedTasks.map(task => {
      const created = new Date(task.created_at);
      const now = new Date(); // Assuming completion time is now (could be improved with actual completion timestamp)
      return (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // days
    });
    
    return Math.round((times.reduce((sum, time) => sum + time, 0) / times.length) * 100) / 100;
  }

  private calculateMostProductiveDay(completedTasks: Task[]): string {
    const dayStats = new Map<string, number>();
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    completedTasks.forEach(task => {
      const day = new Date(task.created_at).getDay();
      const dayName = dayNames[day];
      dayStats.set(dayName, (dayStats.get(dayName) || 0) + 1);
    });
    
    if (dayStats.size === 0) return 'Sin datos';
    
    return Array.from(dayStats.entries())
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  private calculateCurrentStreak(completedTasks: Task[]): number {
    if (completedTasks.length === 0) return 0;
    
    // Group tasks by date
    const tasksByDate = new Map<string, number>();
    completedTasks.forEach(task => {
      const date = new Date(task.created_at).toDateString();
      tasksByDate.set(date, (tasksByDate.get(date) || 0) + 1);
    });
    
    // Calculate streak from today backwards
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) { // Check up to 1 year back
      const checkDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
      const dateString = checkDate.toDateString();
      
      if (tasksByDate.has(dateString)) {
        streak++;
      } else if (i > 0) { // Allow for today to not have tasks yet
        break;
      }
    }
    
    return streak;
  }

  calculateTimeStats(tasks: Task[]): TimeStats {
    // Hourly distribution (when tasks were created)
    const hourlyDistribution = new Array(24).fill(0).map((_, hour) => ({ hour, count: 0 }));
    
    // Daily distribution (last 7 days)
    const dailyDistribution: { day: string; count: number }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
      dailyDistribution.push({
        day: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        count: 0
      });
    }
    
    // Monthly distribution (last 6 months)
    const monthlyDistribution: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      monthlyDistribution.push({
        month: date.toLocaleDateString('es-ES', { month: 'short' }),
        count: 0
      });
    }
    
    // Count tasks for each distribution
    tasks.forEach(task => {
      const createdDate = new Date(task.created_at);
      
      // Hourly
      const hour = createdDate.getHours();
      hourlyDistribution[hour].count++;
      
      // Daily (last 7 days)
      const daysDiff = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0 && daysDiff < 7) {
        dailyDistribution[6 - daysDiff].count++;
      }
      
      // Monthly (last 6 months)
      const monthsDiff = (today.getFullYear() - createdDate.getFullYear()) * 12 + (today.getMonth() - createdDate.getMonth());
      if (monthsDiff >= 0 && monthsDiff < 6) {
        monthlyDistribution[5 - monthsDiff].count++;
      }
    });
    
    return {
      hourlyDistribution,
      dailyDistribution,
      monthlyDistribution
    };
  }

  generateAnalytics(tasks: Task[]): AnalyticsData {
    return {
      taskStats: this.calculateTaskStats(tasks),
      categoryStats: this.calculateCategoryStats(tasks),
      priorityStats: this.calculatePriorityStats(tasks),
      productivityStats: this.calculateProductivityStats(tasks),
      timeStats: this.calculateTimeStats(tasks),
      lastUpdated: new Date()
    };
  }

  // Export data for analytics
  exportAnalyticsData(analyticsData: AnalyticsData): string {
    return JSON.stringify(analyticsData, null, 2);
  }

  // Generate insights based on analytics
  generateInsights(analyticsData: AnalyticsData): string[] {
    const insights: string[] = [];
    const { taskStats, categoryStats, productivityStats, priorityStats } = analyticsData;
    
    // Completion rate insights
    if (taskStats.completionRate > 80) {
      insights.push('🎉 ¡Excelente! Tienes una tasa de finalización muy alta.');
    } else if (taskStats.completionRate > 60) {
      insights.push('👍 Buen trabajo, aunque puedes mejorar tu tasa de finalización.');
    } else if (taskStats.completionRate < 40) {
      insights.push('⚠️ Tu tasa de finalización es baja. Considera revisar tus objetivos.');
    }
    
    // Overdue tasks
    if (taskStats.overdue > 0) {
      insights.push(`⏰ Tienes ${taskStats.overdue} tarea${taskStats.overdue > 1 ? 's' : ''} vencida${taskStats.overdue > 1 ? 's' : ''}. Considera priorizarlas.`);
    }
    
    // Category insights
    const mostUsedCategory = categoryStats[0];
    if (mostUsedCategory && mostUsedCategory.total > taskStats.total * 0.4) {
      insights.push(`📊 La categoría "${mostUsedCategory.name}" representa el ${Math.round((mostUsedCategory.total / taskStats.total) * 100)}% de tus tareas.`);
    }
    
    // Priority insights
    if (priorityStats.high > priorityStats.medium + priorityStats.low) {
      insights.push('🔥 Tienes muchas tareas de alta prioridad. Considera si todas son realmente urgentes.');
    }
    
    // Productivity insights
    if (productivityStats.currentStreak > 7) {
      insights.push(`🔥 ¡Increíble! Llevas ${productivityStats.currentStreak} días consecutivos completando tareas.`);
    } else if (productivityStats.currentStreak > 3) {
      insights.push(`💪 Llevas ${productivityStats.currentStreak} días completando tareas. ¡Sigue así!`);
    }
    
    if (productivityStats.mostProductiveDay !== 'Sin datos') {
      insights.push(`📈 Tu día más productivo es ${productivityStats.mostProductiveDay}.`);
    }
    
    return insights;
  }
}

export const analyticsService = new AnalyticsService();
