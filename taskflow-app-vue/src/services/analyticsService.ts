import type { Task } from '@/types';

export interface AnalyticsData {
  taskStats: TaskStats;
  priorityStats: PriorityStats;
  timeStats: TimeStats;
  completionTrends: CompletionTrend[];
  trends: Trend[];
  predictions: Prediction[];
  advancedInsights: AdvancedInsight[];
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
  overdue: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  withDueDate: number;
  tasksToday: number;
  tasksThisWeek: number;
  tasksNextMonth: number;
}

export interface PriorityStats {
  high: number;
  medium: number;
  low: number;
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  tasksCompletedThisMonth: number;
  averageCompletionTime: number;
  mostProductiveDay: string;
  mostProductiveHour: number;
}

export interface TimeStats {
  dailyDistribution: DailyDistribution[];
  hourlyDistribution: Record<number, number>;
  weeklyTrends: WeeklyTrend[];
  monthlyTrends: MonthlyTrend[];
  seasonalPatterns: SeasonalPattern[];
}

export interface DailyDistribution {
  day: string;
  count: number;
  completed: number;
  created: number;
}

export interface WeeklyTrend {
  week: string;
  completed: number;
  created: number;
}

export interface MonthlyTrend {
  month: string;
  completed: number;
  created: number;
}

export interface SeasonalPattern {
  season: string;
  tasks: number;
}

export interface CompletionTrend {
  date: string;
  completed: number;
  created: number;
}

export interface Trend {
  type: string;
  value: number;
  change: number;
  period: string;
}

export interface Prediction {
  type: string;
  value: number;
  confidence: number;
  period: string;
}

export interface AdvancedInsight {
  id: string;
  type: 'positive' | 'warning' | 'info' | 'achievement';
  title: string;
  description: string;
  action?: string;
}

export interface CalendarMetrics {
  totalEvents: number;
  completedEvents: number;
  upcomingEvents: number;
  overdueEvents: number;
  completionRate: number;
  averageEventsPerDay: number;
  mostProductiveDay: string;
  mostProductiveHour: number;
  categoryDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  collaborativeEvents: number;
  recurringEvents: number;
}

export interface TimeAnalysis {
  hourlyDistribution: Record<number, number>;
  dailyDistribution: Record<string, number>;
  weeklyTrends: Record<string, number>;
  monthlyTrends: Record<string, number>;
  seasonalPatterns: Record<string, number>;
}

export interface ProductivityInsights {
  peakProductivityHours: number[];
  optimalMeetingTimes: number[];
  busyDays: string[];
  freeDays: string[];
  workLifeBalance: {
    workEvents: number;
    personalEvents: number;
    ratio: number;
  };
  focusTimeBlocks: FocusTimeBlock[];
}

export interface FocusTimeBlock {
  start: number;
  end: number;
  day: string;
  available: boolean;
}

export interface CalendarHealthScore {
  score: number;
  factors: {
    eventDistribution: number;
    completionRate: number;
    timeManagement: number;
    collaboration: number;
    planning: number;
  };
  recommendations: string[];
}

export interface BurnoutRisk {
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  indicators: {
    overBooking: number;
    longDays: number;
    noBreaks: number;
    weekendWork: number;
    lateNightEvents: number;
  };
  suggestions: string[];
}

// Helper functions
function getDateRange(range: 'week' | 'month' | 'quarter'): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (range) {
    case 'week':
      start.setDate(end.getDate() - 7);
      break;
    case 'month':
      start.setMonth(end.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(end.getMonth() - 3);
      break;
  }

  return { start, end };
}

function getDayName(date: Date): string {
  return date.toLocaleDateString('es-ES', { weekday: 'short' });
}

function getMonthName(date: Date): string {
  return date.toLocaleDateString('es-ES', { month: 'short' });
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

// Main analytics service
export const analyticsService = {
  // Generate complete analytics from tasks
  generateAnalytics(tasks: Task[]): AnalyticsData {
    const processedTasks = this.processTasks(tasks);
    const taskStats = this.calculateTaskStats(processedTasks);
    const priorityStats = this.calculatePriorityStats(processedTasks);
    const timeStats = this.calculateTimeStats(processedTasks);
    const completionTrends = this.calculateCompletionTrends(processedTasks);
    const trends = this.calculateTrends(processedTasks);
    const predictions = this.generatePredictions(processedTasks);
    const advancedInsights = this.generateAdvancedInsights(processedTasks, taskStats, priorityStats);

    return {
      taskStats,
      priorityStats,
      timeStats,
      completionTrends,
      trends,
      predictions,
      advancedInsights
    };
  },

  // Process tasks to ensure proper date handling
  processTasks(tasks: Task[]): Task[] {
    return tasks.map(task => ({
      ...task,
      createdAt: task.created_at ? new Date(task.created_at) : new Date(),
      dueDate: task.due_date ? new Date(task.due_date) : null,
      updatedAt: task.updated_at ? new Date(task.updated_at) : new Date()
    }));
  },

  // Calculate basic task statistics
  calculateTaskStats(tasks: Task[]): TaskStats {
    const now = new Date();
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const highPriority = tasks.filter(t => t.priority === 'high' && !t.completed).length;
    const mediumPriority = tasks.filter(t => t.priority === 'medium' && !t.completed).length;
    const lowPriority = tasks.filter(t => t.priority === 'low' && !t.completed).length;

    const overdue = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < now && !t.completed
    ).length;

    const withDueDate = tasks.filter(t => t.dueDate).length;

    const today = new Date().toDateString();
    const tasksToday = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate).toDateString() === today
    ).length;

    const weekEnd = new Date();
    weekEnd.setDate(now.getDate() + 7);
    const tasksThisWeek = tasks.filter(t => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      return dueDate >= now && dueDate <= weekEnd;
    }).length;

    const monthEnd = new Date();
    monthEnd.setMonth(now.getMonth() + 1);
    const tasksNextMonth = tasks.filter(t => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      return dueDate >= now && dueDate <= monthEnd;
    }).length;

    return {
      total,
      completed,
      pending,
      completionRate,
      overdue,
      highPriority,
      mediumPriority,
      lowPriority,
      withDueDate,
      tasksToday,
      tasksThisWeek,
      tasksNextMonth
    };
  },

  // Calculate priority statistics
  calculatePriorityStats(tasks: Task[]): PriorityStats {
    const completedTasks = tasks.filter(t => t.completed);
    
    // Calculate average completion time in days
    let totalCompletionTime = 0;
    let completedWithDates = 0;
    completedTasks.forEach(t => {
      if (t.createdAt && t.updatedAt) {
        const diff = new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime();
        totalCompletionTime += diff / (1000 * 60 * 60 * 24);
        completedWithDates++;
      }
    });
    const averageCompletionTime = completedWithDates > 0 ? totalCompletionTime / completedWithDates : 0;

    // Most productive day
    const dayCounts: Record<string, number> = {};
    completedTasks.forEach(t => {
      if (t.updatedAt) {
        const day = new Date(t.updatedAt).toLocaleDateString('es-ES', { weekday: 'long' });
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      }
    });
    const mostProductiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Sin datos';

    // Most productive hour
    const hourCounts: Record<number, number> = {};
    completedTasks.forEach(t => {
      if (t.createdAt) {
        const hour = new Date(t.createdAt).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });
    const mostProductiveHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 0;

    return {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
      tasksCompletedToday: completedTasks.filter(t => 
        t.updatedAt && isSameDay(new Date(t.updatedAt), new Date())
      ).length,
      tasksCompletedThisWeek: completedTasks.filter(t => {
        if (!t.updatedAt) return false;
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return new Date(t.updatedAt) >= weekStart;
      }).length,
      tasksCompletedThisMonth: completedTasks.filter(t => {
        if (!t.updatedAt) return false;
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return new Date(t.updatedAt) >= monthStart;
      }).length,
      averageCompletionTime,
      mostProductiveDay,
      mostProductiveHour
    };
  },

  // Calculate time-based statistics
  calculateTimeStats(tasks: Task[]): TimeStats {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());

    // Daily distribution (last 7 days)
    const dailyDistribution: DailyDistribution[] = [];
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(weekStart);
      dayStart.setDate(weekStart.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      const completed = tasks.filter(t => 
        t.completed && t.updatedAt && new Date(t.updatedAt) >= dayStart && new Date(t.updatedAt) < dayEnd
      ).length;

      const created = tasks.filter(t => 
        t.createdAt && new Date(t.createdAt) >= dayStart && new Date(t.createdAt) < dayEnd
      ).length;

      dailyDistribution.push({
        day: getDayName(dayStart),
        completed,
        created,
        count: completed + created
      });
    }

    // Hourly distribution
    const hourlyDistribution: Record<number, number> = {};
    tasks.forEach(t => {
      if (t.createdAt) {
        const hour = new Date(t.createdAt).getHours();
        hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
      }
    });

    // Weekly trends (last 4 weeks)
    const weeklyTrends: WeeklyTrend[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekStartDate = new Date(now);
      weekStartDate.setDate(now.getDate() - now.getDay() - (i * 7));
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 7);

      const completed = tasks.filter(t => 
        t.completed && t.updatedAt && new Date(t.updatedAt) >= weekStartDate && new Date(t.updatedAt) < weekEndDate
      ).length;

      const created = tasks.filter(t => 
        t.createdAt && new Date(t.createdAt) >= weekStartDate && new Date(t.createdAt) < weekEndDate
      ).length;

      weeklyTrends.push({
        week: `Sem ${weekStartDate.getDate()}/${weekStartDate.getMonth() + 1}`,
        completed,
        created
      });
    }

    // Monthly trends
    const monthlyTrends: MonthlyTrend[] = [];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    for (let i = 0; i <= now.getMonth(); i++) {
      const monthStart = new Date(now.getFullYear(), i, 1);
      const monthEnd = new Date(now.getFullYear(), i + 1, 0);

      const completed = tasks.filter(t => 
        t.completed && t.updatedAt && new Date(t.updatedAt) >= monthStart && new Date(t.updatedAt) <= monthEnd
      ).length;

      monthlyTrends.push({
        month: months[i],
        completed,
        created: 0
      });
    }

    // Seasonal patterns
    const seasonalPatterns: SeasonalPattern[] = [
      { season: 'Invierno', tasks: 0 },
      { season: 'Primavera', tasks: 0 },
      { season: 'Verano', tasks: 0 },
      { season: 'Otoño', tasks: 0 }
    ];

    return {
      dailyDistribution,
      hourlyDistribution,
      weeklyTrends,
      monthlyTrends,
      seasonalPatterns
    };
  },

  // Calculate completion trends
  calculateCompletionTrends(tasks: Task[]): CompletionTrend[] {
    const trends: CompletionTrend[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const completed = tasks.filter(t => 
        t.completed && t.updatedAt && new Date(t.updatedAt) >= date && new Date(t.updatedAt) < nextDate
      ).length;

      const created = tasks.filter(t => 
        t.createdAt && new Date(t.createdAt) >= date && new Date(t.createdAt) < nextDate
      ).length;

      trends.push({
        date: date.toISOString().split('T')[0],
        completed,
        created
      });
    }

    return trends;
  },

  // Calculate trends
  calculateTrends(tasks: Task[]): Trend[] {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(weekStart.getDate() - 7);
    const prevWeekEnd = new Date(weekStart);

    const thisWeekCompleted = tasks.filter(t => 
      t.completed && t.updatedAt && new Date(t.updatedAt) >= weekStart && new Date(t.updatedAt) < now
    ).length;

    const prevWeekCompleted = tasks.filter(t => 
      t.completed && t.updatedAt && new Date(t.updatedAt) >= prevWeekStart && new Date(t.updatedAt) < prevWeekEnd
    ).length;

    const completionChange = prevWeekCompleted > 0 
      ? Math.round(((thisWeekCompleted - prevWeekCompleted) / prevWeekCompleted) * 100)
      : (thisWeekCompleted > 0 ? 100 : 0);

    return [
      { type: 'completion', value: thisWeekCompleted, change: completionChange, period: 'week' },
      { type: 'created', value: tasks.filter(t => t.createdAt && new Date(t.createdAt) >= weekStart).length, change: 0, period: 'week' }
    ];
  },

  // Generate predictions
  generatePredictions(tasks: Task[]): Prediction[] {
    const completionRate = tasks.length > 0 
      ? tasks.filter(t => t.completed).length / tasks.length 
      : 0;

    const avgCompletionTime = this.calculateAvgCompletionTime(tasks);

    return [
      { 
        type: 'nextWeekCompletions', 
        value: Math.round(tasks.filter(t => !t.completed).length * completionRate), 
        confidence: Math.round(completionRate * 80), 
        period: 'week' 
      },
      { 
        type: 'avgCompletionTime', 
        value: Math.round(avgCompletionTime * 10) / 10, 
        confidence: 70, 
        period: 'task' 
      }
    ];
  },

  calculateAvgCompletionTime(tasks: Task[]): number {
    const completedTasks = tasks.filter(t => t.completed && t.createdAt && t.updatedAt);
    if (completedTasks.length === 0) return 0;

    let totalTime = 0;
    completedTasks.forEach(t => {
      const diff = new Date(t.updatedAt!).getTime() - new Date(t.createdAt!).getTime();
      totalTime += diff / (1000 * 60 * 60 * 24);
    });
    return totalTime / completedTasks.length;
  },

  // Generate advanced insights
  generateAdvancedInsights(tasks: Task[], taskStats: TaskStats, priorityStats: PriorityStats): AdvancedInsight[] {
    const insights: AdvancedInsight[] = [];

    if (taskStats.completionRate > 70) {
      insights.push({
        id: 'high-completion',
        type: 'positive',
        title: '¡Excelente rendimiento!',
        description: `Tu tasa de completación del ${taskStats.completionRate}% supera el 70%. Mantén el ritmo.`,
        action: 'Ver detalles'
      });
    } else if (taskStats.completionRate > 50) {
      insights.push({
        id: 'good-progress',
        type: 'positive',
        title: 'Buen progreso',
        description: `Tu tasa de completación es del ${taskStats.completionRate}%. ¡Sigue así!`,
        action: 'Ver metas'
      });
    }

    if (priorityStats.high > 5) {
      insights.push({
        id: 'high-priority-warning',
        type: 'warning',
        title: 'Muchas tareas de alta prioridad',
        description: `Tienes ${priorityStats.high} tareas de alta prioridad pendientes. Considera priorizarlas.`,
        action: 'Ver tareas urgentes'
      });
    }

    if (taskStats.overdue > 0) {
      insights.push({
        id: 'overdue-tasks',
        type: 'warning',
        title: 'Tareas vencidas',
        description: `Tienes ${taskStats.overdue} tareas vencidas. Complétalas pronto para evitar acumulación.`,
        action: 'Ver vencidas'
      });
    }

    const streakDays = this.calculateStreak(tasks);
    if (streakDays > 3) {
      insights.push({
        id: 'streak',
        type: 'achievement',
        title: '¡Racha impresionante!',
        description: `Llevas ${streakDays} días completando tareas. ¡No rompas la cadena!`,
        action: 'Ver racha'
      });
    }

    if (taskStats.tasksToday > 0) {
      insights.push({
        id: 'tasks-today',
        type: 'info',
        title: 'Tareas para hoy',
        description: `Tienes ${taskStats.tasksToday} tareas programadas para hoy.`,
        action: 'Ver hoy'
      });
    }

    if (insights.length === 0) {
      insights.push({
        id: 'no-data',
        type: 'info',
        title: 'Empieza a crear tareas',
        description: 'Completa más tareas para ver análisis personalizados y insights útiles.',
        action: 'Crear tarea'
      });
    }

    return insights;
  },

  calculateStreak(tasks: Task[]): number {
    const completedTasks = tasks.filter(t => t.completed && t.updatedAt);
    if (completedTasks.length === 0) return 0;

    const dates = new Set(completedTasks.map(t => 
      new Date(t.updatedAt!).toDateString()
    ));

    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      if (dates.has(checkDate.toDateString())) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  },

  // Generate insights text for overview
  generateInsights(data: AnalyticsData, tasks: Task[] = []): string[] {
    const insights: string[] = [];
    const { taskStats, priorityStats } = data;

    if (taskStats.completionRate > 70) {
      insights.push('¡Excelente! Tu tasa de completación supera el 70%');
    } else if (taskStats.completionRate > 50) {
      insights.push('Tu progreso es bueno. ¡Sigue así!');
    }

    if (priorityStats.high > 5) {
      insights.push(`Tienes ${priorityStats.high} tareas de alta prioridad pendientes`);
    }

    if (taskStats.overdue > 0) {
      insights.push(`${taskStats.overdue} tareas vencidas. Complétalas pronto!`);
    }

    const streakDays = this.calculateStreak(tasks);
    if (streakDays > 3) {
      insights.push(`¡Increíble! ${streakDays} días de racha completando tareas`);
    }

    if (taskStats.tasksToday > 0) {
      insights.push(`Tienes ${taskStats.tasksToday} tareas para hoy`);
    }

    return insights.length > 0 ? insights : ['Completa más tareas para ver análisis personalizados'];
  }
};

// Calendar Analytics Service
export const calendarAnalyticsService = {
  eventsData: [] as Task[],

  setEventsData(events: Task[]) {
    this.eventsData = events.map(e => ({
      ...e,
      createdAt: e.created_at ? new Date(e.created_at) : new Date(),
      dueDate: e.due_date ? new Date(e.due_date) : null,
      updatedAt: e.updated_at ? new Date(e.updated_at) : new Date()
    }));
  },

  getCalendarMetrics(dateRange: { start: Date; end: Date }): CalendarMetrics {
    const events = this.eventsData.filter(e => 
      e.dueDate && new Date(e.dueDate) >= dateRange.start && new Date(e.dueDate) <= dateRange.end
    );

    const totalEvents = events.length;
    const completedEvents = events.filter(e => e.completed).length;
    const upcomingEvents = events.filter(e => e.dueDate && new Date(e.dueDate) >= new Date() && !e.completed).length;
    const overdueEvents = events.filter(e => e.dueDate && new Date(e.dueDate) < new Date() && !e.completed).length;
    const completionRate = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

    const daysDiff = Math.max(1, Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)));
    const averageEventsPerDay = totalEvents / daysDiff;

    const dayCounts: Record<string, number> = {};
    events.filter(e => e.completed && e.updatedAt).forEach(e => {
      const day = new Date(e.updatedAt!).toLocaleDateString('es-ES', { weekday: 'long' });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const mostProductiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    const hourCounts: Record<number, number> = {};
    events.filter(e => e.completed && e.updatedAt).forEach(e => {
      const hour = new Date(e.updatedAt!).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const mostProductiveHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 0;

    const categoryDistribution: Record<string, number> = {};
    events.forEach(e => {
      if (e.category) {
        categoryDistribution[e.category] = (categoryDistribution[e.category] || 0) + 1;
      }
    });

    const priorityDistribution: Record<string, number> = {};
    events.forEach(e => {
      if (e.priority) {
        priorityDistribution[e.priority] = (priorityDistribution[e.priority] || 0) + 1;
      }
    });

    return {
      totalEvents,
      completedEvents,
      upcomingEvents,
      overdueEvents,
      completionRate,
      averageEventsPerDay: Math.round(averageEventsPerDay * 10) / 10,
      mostProductiveDay,
      mostProductiveHour,
      categoryDistribution,
      priorityDistribution,
      collaborativeEvents: 0,
      recurringEvents: 0
    };
  },

  getProductivityInsights(dateRange: { start: Date; end: Date }): ProductivityInsights {
    const events = this.eventsData.filter(e => 
      e.dueDate && new Date(e.dueDate) >= dateRange.start && new Date(e.dueDate) <= dateRange.end
    );

    const hourCounts: Record<number, number> = {};
    events.filter(e => e.completed && e.updatedAt).forEach(e => {
      const hour = new Date(e.updatedAt!).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakProductivityHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([hour]) => parseInt(hour));

    const dayCounts: Record<string, number> = {};
    events.forEach(e => {
      if (e.dueDate) {
        const day = new Date(e.dueDate).toLocaleDateString('es-ES', { weekday: 'long' });
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      }
    });
    const busyDays = Object.entries(dayCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day]) => day);

    const allDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const freeDays = allDays.filter(d => !dayCounts[d] || dayCounts[d] === 0);

    const workEvents = events.filter(e => e.category === 'trabajo' || e.category === 'Trabajo').length;
    const personalEvents = events.filter(e => e.category === 'personal' || e.category === 'Personal').length;

    return {
      peakProductivityHours,
      optimalMeetingTimes: [9, 10, 11, 14, 15, 16],
      busyDays,
      freeDays,
      workLifeBalance: {
        workEvents,
        personalEvents,
        ratio: personalEvents > 0 ? workEvents / personalEvents : workEvents > 0 ? workEvents : 0
      },
      focusTimeBlocks: []
    };
  },

  getCalendarHealthScore(dateRange: { start: Date; end: Date }): CalendarHealthScore {
    const metrics = this.getCalendarMetrics(dateRange);
    const insights = this.getProductivityInsights(dateRange);

    let score = 50;

    // Event distribution
    if (metrics.averageEventsPerDay <= 5) score += 20;
    else if (metrics.averageEventsPerDay <= 10) score += 10;

    // Completion rate
    if (metrics.completionRate >= 80) score += 20;
    else if (metrics.completionRate >= 60) score += 10;
    else if (metrics.completionRate >= 40) score += 5;

    // Time management
    if (metrics.overdueEvents === 0) score += 20;
    else if (metrics.overdueEvents <= 3) score += 10;
    else if (metrics.overdueEvents <= 5) score += 5;

    // Collaboration
    if (metrics.collaborativeEvents > 0) score += 10;

    // Planning
    if (metrics.upcomingEvents > 0) score += 10;

    const finalScore = Math.min(score, 100);

    const recommendations = [
      'Distribuye tus eventos de manera más uniforme a lo largo de la semana',
      'Intenta completar al menos el 80% de tus tareas programadas',
      'Evita dejar tareas vencidas; reprograma con anticipación',
      'Bloquea tiempo para trabajo profundo sin interrupciones',
      'Revisa tu calendario cada domingo para planificar la semana'
    ];

    return {
      score: finalScore,
      factors: {
        eventDistribution: Math.min(100, metrics.averageEventsPerDay <= 5 ? 100 : 50),
        completionRate: metrics.completionRate,
        timeManagement: metrics.overdueEvents === 0 ? 100 : 50,
        collaboration: metrics.collaborativeEvents > 0 ? 80 : 30,
        planning: metrics.upcomingEvents > 0 ? 90 : 40
      },
      recommendations
    };
  },

  getBurnoutRisk(dateRange: { start: Date; end: Date }): BurnoutRisk {
    const events = this.eventsData.filter(e => 
      e.dueDate && new Date(e.dueDate) >= dateRange.start && new Date(e.dueDate) <= dateRange.end
    );

    let score = 0;
    const indicators = {
      overBooking: 0,
      longDays: 0,
      noBreaks: 0,
      weekendWork: 0,
      lateNightEvents: 0
    };

    // Overbooking check
    const dayCounts: Record<string, number> = {};
    events.forEach(e => {
      if (e.dueDate) {
        const day = new Date(e.dueDate).toDateString();
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      }
    });
    const maxEventsInDay = Math.max(...Object.values(dayCounts), 0);
    if (maxEventsInDay > 8) {
      indicators.overBooking = Math.min(100, (maxEventsInDay / 12) * 100);
      score += 20;
    }

    // Long days
    const longDays = Object.values(dayCounts).filter(c => c > 6).length;
    indicators.longDays = Math.min(100, (longDays / 7) * 100);
    if (longDays > 3) score += 15;

    // No breaks (consecutive busy days)
    let consecutiveDays = 0;
    let maxConsecutive = 0;
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      if (dayCounts[checkDate.toDateString()] && dayCounts[checkDate.toDateString()] > 0) {
        consecutiveDays++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
      } else {
        consecutiveDays = 0;
      }
    }
    indicators.noBreaks = Math.min(100, (maxConsecutive / 7) * 100);
    if (maxConsecutive > 5) score += 15;

    // Weekend work
    const weekendEvents = events.filter(e => {
      if (!e.dueDate) return false;
      const day = new Date(e.dueDate).getDay();
      return day === 0 || day === 6;
    }).length;
    indicators.weekendWork = Math.min(100, (weekendEvents / 4) * 100);
    if (weekendEvents > 2) score += 10;

    // Late night events
    const lateEvents = events.filter(e => {
      if (!e.dueDate) return false;
      const hour = new Date(e.dueDate).getHours();
      return hour >= 22 || hour <= 5;
    }).length;
    indicators.lateNightEvents = Math.min(100, (lateEvents / 4) * 100);
    if (lateEvents > 2) score += 10;

    const finalScore = Math.min(score, 100);

    let level: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (finalScore >= 70) level = 'critical';
    else if (finalScore >= 50) level = 'high';
    else if (finalScore >= 30) level = 'medium';

    const suggestions = [
      'Reduce el número de eventos por día a máximo 6',
      'Asegura al menos 1 día libre por semana',
      'Evita programar eventos después de las 22:00',
      'Limita el trabajo en fines de semana',
      'Toma descansos de 15 minutos cada 2 horas de trabajo'
    ].slice(0, 3);

    return {
      level,
      score: finalScore,
      indicators,
      suggestions
    };
  },

  getTimeAnalysis(dateRange: { start: Date; end: Date }): TimeAnalysis {
    const events = this.eventsData.filter(e => 
      e.dueDate && new Date(e.dueDate) >= dateRange.start && new Date(e.dueDate) <= dateRange.end
    );

    const hourlyDistribution: Record<number, number> = {};
    const dailyDistribution: Record<string, number> = {};
    const weeklyTrends: Record<string, number> = {};
    const monthlyTrends: Record<string, number> = {};
    const seasonalPatterns: Record<string, number> = {};

    events.forEach(e => {
      if (e.createdAt) {
        const hour = new Date(e.createdAt).getHours();
        hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
      }
      if (e.dueDate) {
        const day = new Date(e.dueDate).toLocaleDateString('es-ES', { weekday: 'long' });
        dailyDistribution[day] = (dailyDistribution[day] || 0) + 1;
        const week = `Sem ${new Date(e.dueDate).getDate()}/${new Date(e.dueDate).getMonth() + 1}`;
        weeklyTrends[week] = (weeklyTrends[week] || 0) + 1;
        const month = getMonthName(new Date(e.dueDate));
        monthlyTrends[month] = (monthlyTrends[month] || 0) + 1;
      }
    });

    return {
      hourlyDistribution,
      dailyDistribution,
      weeklyTrends,
      monthlyTrends,
      seasonalPatterns
    };
  }
};