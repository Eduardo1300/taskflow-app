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

export interface TrendData {
  period: string;
  completed: number;
  created: number;
  completionRate: number;
}

export interface PredictionData {
  nextWeekPrediction: {
    estimatedTasksToComplete: number;
    estimatedCompletionRate: number;
    confidence: number;
  };
  burnoutRisk: {
    level: 'low' | 'medium' | 'high';
    score: number;
    factors: string[];
    suggestions: string[];
  };
  goalRecommendations: {
    dailyTarget: number;
    weeklyTarget: number;
    focusAreas: string[];
  };
}

export interface AdvancedInsights {
  workloadBalance: {
    score: number;
    status: 'optimal' | 'overloaded' | 'underutilized';
    recommendation: string;
  };
  timeManagement: {
    peakHours: number[];
    efficiency: number;
    suggestions: string[];
  };
  categoryBalance: {
    mostNegglected: string;
    recommendation: string;
  };
}

export interface AnalyticsData {
  taskStats: TaskStats;
  categoryStats: CategoryStats[];
  priorityStats: PriorityStats;
  productivityStats: ProductivityStats;
  timeStats: TimeStats;
  trends: TrendData[];
  completionTrends: Array<{ date: string; completed: number; total: number; rate: number }>; // Added completionTrends
  predictions: PredictionData;
  advancedInsights: AdvancedInsights;
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

  calculateTrends(tasks: Task[]): TrendData[] {
    const trends: TrendData[] = [];
    const now = new Date();
    
    // Calculate trends for the last 12 weeks
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
      const weekEnd = new Date(weekStart.getTime() + (7 * 24 * 60 * 60 * 1000));
      
      const weekTasks = tasks.filter(task => {
        const taskDate = new Date(task.created_at);
        return taskDate >= weekStart && taskDate < weekEnd;
      });
      
      const completed = weekTasks.filter(task => task.completed).length;
      const created = weekTasks.length;
      const completionRate = created > 0 ? (completed / created) * 100 : 0;
      
      trends.push({
        period: weekStart.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        completed,
        created,
        completionRate: Math.round(completionRate)
      });
    }
    
    return trends;
  }

  calculatePredictions(tasks: Task[], trends: TrendData[]): PredictionData {
    // Next week prediction based on trends
    const recentTrends = trends.slice(-4); // Last 4 weeks
    const avgCompleted = recentTrends.reduce((sum, trend) => sum + trend.completed, 0) / recentTrends.length;
    const avgCompletionRate = recentTrends.reduce((sum, trend) => sum + trend.completionRate, 0) / recentTrends.length;
    
    // Calculate confidence based on trend consistency
    const completionRateVariance = recentTrends.reduce((sum, trend) => sum + Math.pow(trend.completionRate - avgCompletionRate, 2), 0) / recentTrends.length;
    const confidence = Math.max(0.3, Math.min(0.95, 1 - (completionRateVariance / 1000)));
    
    // Burnout risk analysis
    const burnoutRisk = this.calculateBurnoutRisk(tasks, trends);
    
    // Goal recommendations
    const goalRecommendations = this.calculateGoalRecommendations(tasks, trends);
    
    return {
      nextWeekPrediction: {
        estimatedTasksToComplete: Math.round(avgCompleted),
        estimatedCompletionRate: Math.round(avgCompletionRate),
        confidence: Math.round(confidence * 100) / 100
      },
      burnoutRisk,
      goalRecommendations
    };
  }

  private calculateBurnoutRisk(tasks: Task[], trends: TrendData[]): PredictionData['burnoutRisk'] {
    let riskScore = 0;
    const factors: string[] = [];
    const suggestions: string[] = [];
    
    // Check overdue tasks
    const overdueTasks = tasks.filter(task => 
      !task.completed && 
      task.due_date && 
      new Date(task.due_date) < new Date()
    ).length;
    
    if (overdueTasks > 5) {
      riskScore += 30;
      factors.push('Alto número de tareas vencidas');
      suggestions.push('Reorganiza tu agenda y prioriza las tareas vencidas');
    }
    
    // Check high priority tasks ratio
    const highPriorityTasks = tasks.filter(task => task.priority === 'high' && !task.completed).length;
    const totalPendingTasks = tasks.filter(task => !task.completed).length;
    
    if (totalPendingTasks > 0 && (highPriorityTasks / totalPendingTasks) > 0.5) {
      riskScore += 25;
      factors.push('Demasiadas tareas de alta prioridad');
      suggestions.push('Reevalúa las prioridades, no todo puede ser urgente');
    }
    
    // Check declining completion rate
    const recentTrends = trends.slice(-3);
    const isDecreasing = recentTrends.every((trend, index) => 
      index === 0 || trend.completionRate < recentTrends[index - 1].completionRate
    );
    
    if (isDecreasing) {
      riskScore += 20;
      factors.push('Tasa de finalización en declive');
      suggestions.push('Toma descansos regulares y revisa tu carga de trabajo');
    }
    
    // Check workload balance
    const avgTasksPerWeek = trends.reduce((sum, trend) => sum + trend.created, 0) / trends.length;
    const lastWeekTasks = trends[trends.length - 1]?.created || 0;
    
    if (lastWeekTasks > avgTasksPerWeek * 1.5) {
      riskScore += 15;
      factors.push('Carga de trabajo por encima del promedio');
      suggestions.push('Considera delegar o posponer tareas no esenciales');
    }
    
    // Determine level
    let level: 'low' | 'medium' | 'high';
    if (riskScore >= 60) level = 'high';
    else if (riskScore >= 30) level = 'medium';
    else level = 'low';
    
    // Add general suggestions if no specific ones
    if (suggestions.length === 0) {
      suggestions.push('Mantén un buen equilibrio entre trabajo y descanso');
    }
    
    return { level, score: riskScore, factors, suggestions };
  }

  private calculateGoalRecommendations(tasks: Task[], trends: TrendData[]): PredictionData['goalRecommendations'] {
    const recentTrends = trends.slice(-4);
    const avgCompletedPerWeek = recentTrends.reduce((sum, trend) => sum + trend.completed, 0) / recentTrends.length;
    
    // Calculate realistic daily target
    const dailyTarget = Math.max(1, Math.round(avgCompletedPerWeek / 7));
    const weeklyTarget = Math.round(avgCompletedPerWeek * 1.1); // 10% improvement
    
    // Identify focus areas based on category performance
    const focusAreas: string[] = [];
    const categoryStats = this.calculateCategoryStats(tasks);
    
    // Find categories with low completion rates
    categoryStats.forEach(category => {
      if (category.percentage < 60 && category.total >= 3) { // Ensure enough tasks for meaningful insight
        focusAreas.push(category.name);
      }
    });
    
    if (focusAreas.length === 0) {
      focusAreas.push('Mantener consistencia en todas las categorías');
    }
    
    return {
      dailyTarget,
      weeklyTarget,
      focusAreas: focusAreas.slice(0, 3) // Max 3 focus areas
    };
  }

  calculateCompletionTrends(tasks: Task[]): Array<{ date: string; completed: number; total: number; rate: number }> {
    const dailyStats = new Map<string, { completed: number; total: number }>();
  
    tasks.forEach(task => {
      const date = new Date(task.created_at);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
  
      if (!dailyStats.has(dateKey)) {
        dailyStats.set(dateKey, { completed: 0, total: 0 });
      }
  
      const stats = dailyStats.get(dateKey)!;
      stats.total++;
      if (task.completed) {
        stats.completed++;
      }
    });
  
    const trends: Array<{ date: string; completed: number; total: number; rate: number }> = [];
    Array.from(dailyStats.keys()).sort().forEach(dateKey => {
      const stats = dailyStats.get(dateKey)!;
      trends.push({
        date: dateKey,
        completed: stats.completed,
        total: stats.total,
        rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      });
    });
  
    return trends;
  }
  
  calculateAdvancedInsights(tasks: Task[]): AdvancedInsights {
    // Workload balance analysis
    const pendingTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);
    const workloadScore = this.calculateWorkloadScore(pendingTasks, completedTasks);
    
    // Time management analysis
    const timeAnalysis = this.calculateTimeEfficiency(tasks);
    
    // Category balance analysis
    const categoryAnalysis = this.analyzeCategoryBalance(tasks);
    
    return {
      workloadBalance: workloadScore,
      timeManagement: timeAnalysis,
      categoryBalance: categoryAnalysis
    };
  }

  private calculateWorkloadScore(pendingTasks: Task[], completedTasks: Task[]): AdvancedInsights['workloadBalance'] {
    const totalTasks = pendingTasks.length + completedTasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
    
    let score = 50; // Base score
    let status: 'optimal' | 'overloaded' | 'underutilized';
    let recommendation: string;
    
    // Adjust score based on completion rate
    if (completionRate > 80) score += 25;
    else if (completionRate > 60) score += 10;
    else if (completionRate < 40) score -= 20;
    
    // Adjust score based on pending tasks ratio
    const pendingRatio = totalTasks > 0 ? (pendingTasks.length / totalTasks) * 100 : 0;
    if (pendingRatio > 70) score -= 15;
    else if (pendingRatio < 30) score += 15;
    
    // Determine status and recommendation
    if (score >= 70) {
      status = 'optimal';
      recommendation = 'Excelente balance de trabajo. Mantén este ritmo.';
    } else if (score >= 50) {
      status = 'overloaded';
      recommendation = 'Considera reducir la carga de trabajo o mejorar la eficiencia.';
    } else {
      status = 'underutilized';
      recommendation = 'Puedes tomar más responsabilidades o establecer metas más ambiciosas.';
    }
    
    return { score: Math.max(0, Math.min(100, score)), status, recommendation };
  }

  private calculateTimeEfficiency(tasks: Task[]): AdvancedInsights['timeManagement'] {
    const timeStats = this.calculateTimeStats(tasks);
    const hourlyData = timeStats.hourlyDistribution;
    
    // Find peak productivity hours (top 3)
    const sortedHours = [...hourlyData]
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(h => h.hour);
    
    // Calculate efficiency based on task distribution
    const totalTasks = hourlyData.reduce((sum, h) => sum + h.count, 0);
    const peakHourTasks = sortedHours.reduce((sum, hour) => {
      const hourData = hourlyData.find(h => h.hour === hour);
      return sum + (hourData?.count || 0);
    }, 0);
    
    const efficiency = totalTasks > 0 ? (peakHourTasks / totalTasks) * 100 : 0;
    
    const suggestions: string[] = [];
    if (efficiency < 50) {
      suggestions.push('Intenta concentrar las tareas importantes en tus horas más productivas');
    }
    if (sortedHours.some(hour => hour < 6 || hour > 22)) {
      suggestions.push('Considera trabajar en horarios más regulares para mejor productividad');
    }
    if (suggestions.length === 0) {
      suggestions.push('Tu distribución de tiempo es eficiente, mantén este patrón');
    }
    
    return {
      peakHours: sortedHours,
      efficiency: Math.round(efficiency),
      suggestions
    };
  }

  private analyzeCategoryBalance(tasks: Task[]): AdvancedInsights['categoryBalance'] {
    const categoryStats = this.calculateCategoryStats(tasks);
    
    // Find most neglected category (lowest completion rate with significant tasks)
    const significantCategories = categoryStats.filter(cat => cat.total >= 3);
    const mostNegglected = significantCategories.reduce((worst, category) => 
      category.percentage < worst.percentage ? category : worst
    , significantCategories[0] || { name: 'Ninguna', percentage: 100 });
    
    const recommendation = mostNegglected.percentage < 50
      ? `Dedica más tiempo a "${mostNegglected.name}" para mejorar el balance`
      : 'Buen equilibrio entre categorías, mantén la distribución actual';
    
    return {
      mostNegglected: mostNegglected.name,
      recommendation
    };
  }

  generateAnalytics(tasks: Task[]): AnalyticsData {
    const trends = this.calculateTrends(tasks);
    const predictions = this.calculatePredictions(tasks, trends);
    const advancedInsights = this.calculateAdvancedInsights(tasks);
    const completionTrends = this.calculateCompletionTrends(tasks);
    
    return {
      taskStats: this.calculateTaskStats(tasks),
      categoryStats: this.calculateCategoryStats(tasks),
      priorityStats: this.calculatePriorityStats(tasks),
      productivityStats: this.calculateProductivityStats(tasks),
      timeStats: this.calculateTimeStats(tasks),
      trends,
      completionTrends,
      predictions,
      advancedInsights,
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
