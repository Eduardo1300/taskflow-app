import type { Task } from '@/types';

/* ============================== Tipos ============================== */

export type ProcessedTask = Omit<Task, 'createdAt' | 'dueDate' | 'updatedAt'> & {
  createdAt: Date;
  dueDate: Date | null;
  updatedAt: Date;
  /** true si la fecha límite trae hora; false si es solo fecha (YYYY-MM-DD) */
  dueHasTime: boolean;
};

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
  /** Fecha local en formato YYYY-MM-DD */
  date: string;
  /** Etiqueta corta del día (lun, mar...) ya calculada en hora local */
  label: string;
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

/* ============================== Helpers ============================== */

// Coincide con "2026-10-05" y con "2026-10-05T00:00:00(.000)(Z)" (fecha sin hora real)
const DATE_ONLY_RE = /^(\d{4}-\d{2}-\d{2})(?:T00:00:00(?:\.0+)?(?:Z|[+-]00:?00)?)?$/;

/**
 * Convierte un string a Date. Las fechas sin hora se interpretan en hora LOCAL
 * (new Date('2026-10-05') se interpreta en UTC y en Perú daría el día anterior).
 */
export function parseDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const match = value.match(DATE_ONLY_RE);
  const date = match ? new Date(`${match[1]}T00:00:00`) : new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

function toLocalISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDayName(date: Date): string {
  return date.toLocaleDateString('es-ES', { weekday: 'short' });
}

function getMonthName(date: Date): string {
  return date.toLocaleDateString('es-ES', { month: 'short' });
}

function topKey(counts: Record<string | number, number>): string | undefined {
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
}

const completedIn = (tasks: ProcessedTask[], start: Date, end: Date) =>
  tasks.filter(t => t.completed && t.updatedAt >= start && t.updatedAt < end).length;

const createdIn = (tasks: ProcessedTask[], start: Date, end: Date) =>
  tasks.filter(t => t.createdAt >= start && t.createdAt < end).length;

/**
 * Una tarea está vencida si tiene fecha, no está completada y:
 * - con hora: la hora ya pasó
 * - solo fecha: el día ya terminó (una tarea para hoy NO está vencida)
 */
export function isOverdue(task: ProcessedTask, now: Date = new Date()): boolean {
  if (!task.dueDate || task.completed) return false;
  return task.dueHasTime ? task.dueDate < now : task.dueDate < startOfDay(now);
}

/* ============================== Servicio principal ============================== */

export const analyticsService = {
  generateAnalytics(tasks: Task[]): AnalyticsData {
    const processedTasks = this.processTasks(tasks);
    const taskStats = this.calculateTaskStats(processedTasks);
    const priorityStats = this.calculatePriorityStats(processedTasks);
    const timeStats = this.calculateTimeStats(processedTasks);
    const completionTrends = this.calculateCompletionTrends(processedTasks);
    const trends = this.calculateTrends(processedTasks);
    const predictions = this.generatePredictions(processedTasks);
    const advancedInsights = this.generateAdvancedInsights(processedTasks, taskStats);

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

  processTasks(tasks: Task[]): ProcessedTask[] {
    return tasks.map(task => {
      const rawDue = task.due_date as string | null | undefined;
      return {
        ...task,
        createdAt: parseDate(task.created_at) ?? new Date(),
        dueDate: parseDate(rawDue),
        dueHasTime: !!rawDue && !DATE_ONLY_RE.test(rawDue),
        updatedAt: parseDate(task.updated_at) ?? new Date()
      };
    });
  },

  isOverdue,

  calculateTaskStats(tasks: ProcessedTask[]): TaskStats {
    const now = new Date();
    const today = startOfDay(now);
    const weekEnd = addDays(today, 8); // exclusivo: hoy + 7 días completos
    const monthEnd = new Date(today);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(monthEnd.getDate() + 1);

    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      completionRate,
      overdue: tasks.filter(t => isOverdue(t, now)).length,
      highPriority: tasks.filter(t => t.priority === 'high' && !t.completed).length,
      mediumPriority: tasks.filter(t => t.priority === 'medium' && !t.completed).length,
      lowPriority: tasks.filter(t => t.priority === 'low' && !t.completed).length,
      withDueDate: tasks.filter(t => t.dueDate).length,
      tasksToday: tasks.filter(t => t.dueDate && isSameDay(t.dueDate, now)).length,
      tasksThisWeek: tasks.filter(t => t.dueDate && t.dueDate >= today && t.dueDate < weekEnd).length,
      tasksNextMonth: tasks.filter(t => t.dueDate && t.dueDate >= today && t.dueDate < monthEnd).length
    };
  },

  calculatePriorityStats(tasks: ProcessedTask[]): PriorityStats {
    const now = new Date();
    const completedTasks = tasks.filter(t => t.completed);

    // Tiempo promedio de completación (días)
    let totalDays = 0;
    completedTasks.forEach(t => {
      totalDays += (t.updatedAt.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    });
    const averageCompletionTime = completedTasks.length > 0 ? totalDays / completedTasks.length : 0;

    // Día y hora más productivos (según cuándo se completaron)
    const dayCounts: Record<string, number> = {};
    const hourCounts: Record<number, number> = {};
    completedTasks.forEach(t => {
      const day = t.updatedAt.toLocaleDateString('es-ES', { weekday: 'long' });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
      const hour = t.updatedAt.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const weekStart = addDays(startOfDay(now), -now.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
      tasksCompletedToday: completedTasks.filter(t => isSameDay(t.updatedAt, now)).length,
      tasksCompletedThisWeek: completedTasks.filter(t => t.updatedAt >= weekStart).length,
      tasksCompletedThisMonth: completedTasks.filter(t => t.updatedAt >= monthStart).length,
      averageCompletionTime,
      mostProductiveDay: topKey(dayCounts) || 'Sin datos',
      mostProductiveHour: Number(topKey(hourCounts) ?? 0)
    };
  },

  calculateTimeStats(tasks: ProcessedTask[]): TimeStats {
    const now = new Date();
    const today = startOfDay(now);

    // Últimos 7 días (terminando hoy)
    const dailyDistribution: DailyDistribution[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = addDays(today, -i);
      const dayEnd = addDays(dayStart, 1);
      const completed = completedIn(tasks, dayStart, dayEnd);
      const created = createdIn(tasks, dayStart, dayEnd);
      dailyDistribution.push({
        day: getDayName(dayStart),
        completed,
        created,
        count: completed + created
      });
    }

    // Distribución por hora de creación
    const hourlyDistribution: Record<number, number> = {};
    tasks.forEach(t => {
      const hour = t.createdAt.getHours();
      hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
    });

    // Últimas 4 semanas (semanas que empiezan en domingo)
    const weeklyTrends: WeeklyTrend[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = addDays(today, -today.getDay() - i * 7);
      const weekEnd = addDays(weekStart, 7);
      weeklyTrends.push({
        week: `Sem ${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
        completed: completedIn(tasks, weekStart, weekEnd),
        created: createdIn(tasks, weekStart, weekEnd)
      });
    }

    // Meses del año en curso
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthlyTrends: MonthlyTrend[] = [];
    for (let i = 0; i <= now.getMonth(); i++) {
      const monthStart = new Date(now.getFullYear(), i, 1);
      const monthEnd = new Date(now.getFullYear(), i + 1, 1);
      monthlyTrends.push({
        month: months[i],
        completed: completedIn(tasks, monthStart, monthEnd),
        created: createdIn(tasks, monthStart, monthEnd)
      });
    }

    // Estaciones (hemisferio sur) según fecha de creación
    const seasonalPatterns: SeasonalPattern[] = [
      { season: 'Invierno', tasks: 0 },
      { season: 'Primavera', tasks: 0 },
      { season: 'Verano', tasks: 0 },
      { season: 'Otoño', tasks: 0 }
    ];
    tasks.forEach(t => {
      const m = t.createdAt.getMonth();
      const idx = m >= 5 && m <= 7 ? 0 : m >= 8 && m <= 10 ? 1 : m === 11 || m <= 1 ? 2 : 3;
      seasonalPatterns[idx].tasks++;
    });

    return { dailyDistribution, hourlyDistribution, weeklyTrends, monthlyTrends, seasonalPatterns };
  },

  calculateCompletionTrends(tasks: ProcessedTask[]): CompletionTrend[] {
    const today = startOfDay(new Date());
    const trends: CompletionTrend[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = addDays(today, -i);
      const next = addDays(date, 1);
      trends.push({
        date: toLocalISODate(date),
        label: getDayName(date),
        completed: completedIn(tasks, date, next),
        created: createdIn(tasks, date, next)
      });
    }

    return trends;
  },

  calculateTrends(tasks: ProcessedTask[]): Trend[] {
    const now = new Date();
    const weekStart = addDays(startOfDay(now), -now.getDay());
    const prevWeekStart = addDays(weekStart, -7);

    const thisWeekCompleted = completedIn(tasks, weekStart, now);
    const prevWeekCompleted = completedIn(tasks, prevWeekStart, weekStart);

    const completionChange = prevWeekCompleted > 0
      ? Math.round(((thisWeekCompleted - prevWeekCompleted) / prevWeekCompleted) * 100)
      : (thisWeekCompleted > 0 ? 100 : 0);

    return [
      { type: 'completion', value: thisWeekCompleted, change: completionChange, period: 'week' },
      { type: 'created', value: tasks.filter(t => t.createdAt >= weekStart).length, change: 0, period: 'week' }
    ];
  },

  generatePredictions(tasks: ProcessedTask[]): Prediction[] {
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

  calculateAvgCompletionTime(tasks: ProcessedTask[]): number {
    const completedTasks = tasks.filter(t => t.completed);
    if (completedTasks.length === 0) return 0;

    const totalDays = completedTasks.reduce(
      (sum, t) => sum + (t.updatedAt.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60 * 24),
      0
    );
    return totalDays / completedTasks.length;
  },

  generateAdvancedInsights(tasks: ProcessedTask[], taskStats: TaskStats): AdvancedInsight[] {
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

    if (taskStats.highPriority > 5) {
      insights.push({
        id: 'high-priority-warning',
        type: 'warning',
        title: 'Muchas tareas de alta prioridad',
        description: `Tienes ${taskStats.highPriority} tareas de alta prioridad pendientes. Considera priorizarlas.`,
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

    const streakDays = this.computeStreak(tasks);
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

  /** Racha a partir de tareas ya procesadas */
  computeStreak(tasks: ProcessedTask[]): number {
    const days = new Set(tasks.filter(t => t.completed).map(t => t.updatedAt.toDateString()));
    if (days.size === 0) return 0;

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      if (days.has(addDays(today, -i).toDateString())) {
        streak++;
      } else if (i > 0) {
        break; // si hoy aún no hay nada completado, la racha de ayer sigue viva
      }
    }

    return streak;
  },

  /** Acepta tareas crudas del store (con created_at / updated_at) */
  calculateStreak(tasks: Task[]): number {
    return this.computeStreak(this.processTasks(tasks));
  },

  generateInsights(data: AnalyticsData, tasks: Task[] = []): string[] {
    const insights: string[] = [];
    const { taskStats } = data;

    if (taskStats.completionRate > 70) {
      insights.push('¡Excelente! Tu tasa de completación supera el 70%');
    } else if (taskStats.completionRate > 50) {
      insights.push('Tu progreso es bueno. ¡Sigue así!');
    }

    if (taskStats.highPriority > 5) {
      insights.push(`Tienes ${taskStats.highPriority} tareas de alta prioridad pendientes`);
    }

    if (taskStats.overdue > 0) {
      insights.push(`${taskStats.overdue} tareas vencidas. ¡Complétalas pronto!`);
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

/* ============================== Servicio de calendario ============================== */

export const calendarAnalyticsService = {
  eventsData: [] as ProcessedTask[],

  setEventsData(events: Task[]) {
    this.eventsData = analyticsService.processTasks(events);
  },

  eventsInRange(dateRange: { start: Date; end: Date }): ProcessedTask[] {
    return this.eventsData.filter(
      e => e.dueDate && e.dueDate >= dateRange.start && e.dueDate <= dateRange.end
    );
  },

  getCalendarMetrics(dateRange: { start: Date; end: Date }): CalendarMetrics {
    const now = new Date();
    const events = this.eventsInRange(dateRange);

    const totalEvents = events.length;
    const completedEvents = events.filter(e => e.completed).length;
    const overdueEvents = events.filter(e => isOverdue(e, now)).length;
    const upcomingEvents = events.filter(e => !e.completed && !isOverdue(e, now)).length;
    const completionRate = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

    const daysDiff = Math.max(
      1,
      Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
    );
    const averageEventsPerDay = totalEvents / daysDiff;

    const dayCounts: Record<string, number> = {};
    const hourCounts: Record<number, number> = {};
    events.filter(e => e.completed).forEach(e => {
      const day = e.updatedAt.toLocaleDateString('es-ES', { weekday: 'long' });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
      const hour = e.updatedAt.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const categoryDistribution: Record<string, number> = {};
    const priorityDistribution: Record<string, number> = {};
    events.forEach(e => {
      if (e.category) categoryDistribution[e.category] = (categoryDistribution[e.category] || 0) + 1;
      if (e.priority) priorityDistribution[e.priority] = (priorityDistribution[e.priority] || 0) + 1;
    });

    return {
      totalEvents,
      completedEvents,
      upcomingEvents,
      overdueEvents,
      completionRate,
      averageEventsPerDay: Math.round(averageEventsPerDay * 10) / 10,
      mostProductiveDay: topKey(dayCounts) || '',
      mostProductiveHour: Number(topKey(hourCounts) ?? 0),
      categoryDistribution,
      priorityDistribution,
      recurringEvents: 0
    };
  },

  getProductivityInsights(dateRange: { start: Date; end: Date }): ProductivityInsights {
    const events = this.eventsInRange(dateRange);

    const hourCounts: Record<number, number> = {};
    events.filter(e => e.completed).forEach(e => {
      const hour = e.updatedAt.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakProductivityHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([hour]) => parseInt(hour));

    // es-ES devuelve los días en minúscula; comparamos en minúscula
    const dayCounts: Record<string, number> = {};
    events.forEach(e => {
      if (e.dueDate) {
        const day = e.dueDate.toLocaleDateString('es-ES', { weekday: 'long' });
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      }
    });
    const busyDays = Object.entries(dayCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day]) => day);

    const allDays = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    const freeDays = allDays.filter(d => !dayCounts[d]);

    const countCategory = (name: string) =>
      events.filter(e => e.category?.toLowerCase() === name).length;
    const workEvents = countCategory('trabajo');
    const personalEvents = countCategory('personal');

    return {
      peakProductivityHours,
      optimalMeetingTimes: [9, 10, 11, 14, 15, 16],
      busyDays,
      freeDays,
      workLifeBalance: {
        workEvents,
        personalEvents,
        ratio: personalEvents > 0 ? workEvents / personalEvents : workEvents
      },
      focusTimeBlocks: []
    };
  },

  getCalendarHealthScore(dateRange: { start: Date; end: Date }): CalendarHealthScore {
    const metrics = this.getCalendarMetrics(dateRange);

    let score = 50;

    // Distribución de eventos
    if (metrics.averageEventsPerDay <= 5) score += 20;
    else if (metrics.averageEventsPerDay <= 10) score += 10;

    // Tasa de completación
    if (metrics.completionRate >= 80) score += 20;
    else if (metrics.completionRate >= 60) score += 10;
    else if (metrics.completionRate >= 40) score += 5;

    // Gestión del tiempo
    if (metrics.overdueEvents === 0) score += 20;
    else if (metrics.overdueEvents <= 3) score += 10;
    else if (metrics.overdueEvents <= 5) score += 5;

    // Colaboración y planificación
    if (metrics.overdueEvents > 0) score += 10;
    if (metrics.upcomingEvents > 0) score += 10;

    const recommendations = [
      'Distribuye tus eventos de manera más uniforme a lo largo de la semana',
      'Intenta completar al menos el 80% de tus tareas programadas',
      'Evita dejar tareas vencidas; reprograma con anticipación',
      'Bloquea tiempo para trabajo profundo sin interrupciones',
      'Revisa tu calendario cada domingo para planificar la semana'
    ];

    return {
      score: Math.min(score, 100),
      factors: {
        eventDistribution: metrics.averageEventsPerDay <= 5 ? 100 : 50,
        completionRate: metrics.completionRate,
        timeManagement: metrics.overdueEvents === 0 ? 100 : 50,
        collaboration: 80,
        planning: metrics.upcomingEvents > 0 ? 90 : 40
      },
      recommendations
    };
  },

  getBurnoutRisk(dateRange: { start: Date; end: Date }): BurnoutRisk {
    const events = this.eventsInRange(dateRange);

    let score = 0;
    const indicators = {
      overBooking: 0,
      longDays: 0,
      noBreaks: 0,
      weekendWork: 0,
      lateNightEvents: 0
    };

    // Eventos por día
    const dayCounts: Record<string, number> = {};
    events.forEach(e => {
      if (e.dueDate) {
        const key = e.dueDate.toDateString();
        dayCounts[key] = (dayCounts[key] || 0) + 1;
      }
    });

    // Sobrecarga
    const maxEventsInDay = Math.max(...Object.values(dayCounts), 0);
    if (maxEventsInDay > 8) {
      indicators.overBooking = Math.min(100, (maxEventsInDay / 12) * 100);
      score += 20;
    }

    // Días largos
    const longDays = Object.values(dayCounts).filter(c => c > 6).length;
    indicators.longDays = Math.min(100, (longDays / 7) * 100);
    if (longDays > 3) score += 15;

    // Sin descansos (días consecutivos con eventos, últimos 14 días)
    let consecutive = 0;
    let maxConsecutive = 0;
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      if (dayCounts[addDays(today, -i).toDateString()]) {
        consecutive++;
        maxConsecutive = Math.max(maxConsecutive, consecutive);
      } else {
        consecutive = 0;
      }
    }
    indicators.noBreaks = Math.min(100, (maxConsecutive / 7) * 100);
    if (maxConsecutive > 5) score += 15;

    // Fines de semana
    const weekendEvents = events.filter(e => e.dueDate && [0, 6].includes(e.dueDate.getDay())).length;
    indicators.weekendWork = Math.min(100, (weekendEvents / 4) * 100);
    if (weekendEvents > 2) score += 10;

    // Eventos nocturnos: solo cuentan si la fecha límite trae hora real
    const lateEvents = events.filter(e => {
      if (!e.dueDate || !e.dueHasTime) return false;
      const hour = e.dueDate.getHours();
      return hour >= 22 || hour <= 5;
    }).length;
    indicators.lateNightEvents = Math.min(100, (lateEvents / 4) * 100);
    if (lateEvents > 2) score += 10;

    const finalScore = Math.min(score, 100);

    let level: BurnoutRisk['level'] = 'low';
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

    return { level, score: finalScore, indicators, suggestions };
  },

  getTimeAnalysis(dateRange: { start: Date; end: Date }): TimeAnalysis {
    const events = this.eventsInRange(dateRange);

    const hourlyDistribution: Record<number, number> = {};
    const dailyDistribution: Record<string, number> = {};
    const weeklyTrends: Record<string, number> = {};
    const monthlyTrends: Record<string, number> = {};
    const seasonalPatterns: Record<string, number> = {};

    events.forEach(e => {
      const hour = e.createdAt.getHours();
      hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;

      if (e.dueDate) {
        const day = e.dueDate.toLocaleDateString('es-ES', { weekday: 'long' });
        dailyDistribution[day] = (dailyDistribution[day] || 0) + 1;
        const week = `Sem ${e.dueDate.getDate()}/${e.dueDate.getMonth() + 1}`;
        weeklyTrends[week] = (weeklyTrends[week] || 0) + 1;
        const month = getMonthName(e.dueDate);
        monthlyTrends[month] = (monthlyTrends[month] || 0) + 1;
      }
    });

    return { hourlyDistribution, dailyDistribution, weeklyTrends, monthlyTrends, seasonalPatterns };
  }
};