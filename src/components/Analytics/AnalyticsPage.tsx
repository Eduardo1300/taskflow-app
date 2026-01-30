import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Target,
  Calendar,
  Clock,
  Award,
  Activity,
  Lightbulb,
  Download,
  FileText,
  Users,
  Brain,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Task } from '../../types';
import { analyticsService, AnalyticsData } from '../../services/analyticsService';
import { exportService } from '../../services/exportService';
import { 
  calendarAnalyticsService,
  CalendarMetrics,
  TimeAnalysis,
  ProductivityInsights,
  CalendarHealthScore,
  BurnoutRisk
} from '../../services/calendarAnalyticsService';
import AnalyticsCharts from './AnalyticsCharts';
import CalendarForecast from './CalendarForecast';
import ExportPDF from './ExportPDF';
import SmartRecommendations from './SmartRecommendations';

const emptyCalendarMetrics: CalendarMetrics = {
  totalEvents: 0,
  completedEvents: 0,
  upcomingEvents: 0,
  overdueEvents: 0,
  completionRate: 0,
  averageEventsPerDay: 0,
  mostProductiveDay: '',
  mostProductiveHour: 0,
  categoryDistribution: {},
  priorityDistribution: {},
  collaborativeEvents: 0,
  recurringEvents: 0,
};

const emptyTimeAnalysis: TimeAnalysis = {
  hourlyDistribution: {},
  dailyDistribution: {},
  weeklyTrends: {},
  monthlyTrends: {},
  seasonalPatterns: {},
};

const emptyProductivityInsights: ProductivityInsights = {
  peakProductivityHours: [],
  optimalMeetingTimes: [],
  busyDays: [],
  freeDays: [],
  workLifeBalance: {
    workEvents: 0,
    personalEvents: 0,
    ratio: 0,
  },
  focusTimeBlocks: [],
};

const emptyCalendarHealthScore: CalendarHealthScore = {
  score: 0,
  factors: {
    eventDistribution: 0,
    completionRate: 0,
    timeManagement: 0,
    collaboration: 0,
    planning: 0,
  },
  recommendations: [],
};

const emptyBurnoutRisk: BurnoutRisk = {
  level: 'low',
  score: 0,
  indicators: {
    overBooking: 0,
    longDays: 0,
    noBreaks: 0,
    weekendWork: 0,
    lateNightEvents: 0,
  },
  suggestions: [],
};

interface AnalyticsPageProps {
  tasks: Task[];
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ tasks }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [calendarMetrics, setCalendarMetrics] = useState<CalendarMetrics | null>(null);
  const [calendarInsights, setCalendarInsights] = useState<ProductivityInsights | null>(null);
  const [calendarHealth, setCalendarHealth] = useState<CalendarHealthScore | null>(null);
  const [burnoutRisk, setBurnoutRisk] = useState<BurnoutRisk | null>(null);
  const [timeAnalysis, setTimeAnalysis] = useState<TimeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'productivity' | 'calendar' | 'charts' | 'forecast' | 'recommendations' | 'export'>('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    const loadAllAnalytics = async () => {
      setLoading(true);
      try {
        // Load general analytics
        const generalData = analyticsService.generateAnalytics(tasks);
        setAnalyticsData(generalData);

        // Load calendar analytics
        const calendarEvents = tasks.filter(task => task.due_date);
        if (calendarEvents.length > 0) {
          calendarAnalyticsService.setEventsData(calendarEvents);

          const dateRange = getDateRange(selectedTimeRange);
          const [metrics, insights, health, burnout, timeData] = await Promise.all([
            calendarAnalyticsService.getCalendarMetrics(dateRange),
            calendarAnalyticsService.getProductivityInsights(dateRange),
            calendarAnalyticsService.getCalendarHealthScore(dateRange),
            calendarAnalyticsService.getBurnoutRisk(dateRange),
            calendarAnalyticsService.getTimeAnalysis(dateRange)
          ]);

          setCalendarMetrics(metrics);
          setCalendarInsights(insights);
          setCalendarHealth(health);
          setBurnoutRisk(burnout);
          setTimeAnalysis(timeData);
        } else {
          // If no calendar events, set to empty default objects
          setCalendarMetrics(emptyCalendarMetrics);
          setCalendarInsights(emptyProductivityInsights);
          setCalendarHealth(emptyCalendarHealthScore);
          setBurnoutRisk(emptyBurnoutRisk);
          setTimeAnalysis(emptyTimeAnalysis);
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllAnalytics();
  }, [tasks, selectedTimeRange]);

  const getDateRange = (range: 'week' | 'month' | 'quarter') => {
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
  };

  const exportAnalyticsToPDF = async () => {
    if (!analyticsData) return;
    
    try {
      await exportService.exportAnalyticsToPDF(analyticsData);
      alert('Analytics exportado a PDF correctamente.');
    } catch (error) {
      console.error('Error exportando analytics a PDF:', error);
      alert('Error al exportar analytics a PDF. Por favor, inténtalo de nuevo.');
    }
  };

  if (loading || !analyticsData) {
    return (
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Generando análisis...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <div className="w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 sm:p-3 rounded-2xl shadow-lg flex-shrink-0">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                Analytics de Productividad y Gestión de Tareas para Desarrolladores y Equipos
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                Análisis completo de productividad, gestión de tareas y rendimiento de calendario, diseñado para potenciar a desarrolladores, freelancers y startups.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 text-sm overflow-x-auto">
              {(['week', 'month', 'quarter'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    selectedTimeRange === range
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-purple-500'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>

            <button
              onClick={exportAnalyticsToPDF}
              className="flex items-center justify-center sm:justify-start px-3 sm:px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-sm rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex-shrink-0"
            >
              <FileText className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Exportar PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex justify-start mb-6 sm:mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg overflow-x-auto">
          {[
            { key: 'overview', label: 'Resumen', icon: Target },
            { key: 'productivity', label: 'Productividad', icon: TrendingUp },
            { key: 'calendar', label: 'Calendario', icon: Calendar },
            { key: 'charts', label: 'Gráficos', icon: BarChart3 },
            { key: 'forecast', label: 'Pronósticos', icon: Activity },
            { key: 'recommendations', label: 'Recomendaciones', icon: Lightbulb },
            { key: 'export', label: 'Exportar', icon: Download }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap text-sm sm:text-base ${
                activeTab === key 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <main>
          {activeTab === 'overview' && (
            <OverviewContent 
              analyticsData={analyticsData} 
              calendarMetrics={calendarMetrics}
              calendarHealth={calendarHealth}
              burnoutRisk={burnoutRisk}
            />
          )}

          {activeTab === 'productivity' && (
            <ProductivityContent 
              analyticsData={analyticsData}
              calendarInsights={calendarInsights}
            />
          )}

          {activeTab === 'calendar' && calendarMetrics && (
            <CalendarContent 
              metrics={calendarMetrics}
              insights={calendarInsights}
              health={calendarHealth}
              burnout={burnoutRisk}
            />
          )}

          {activeTab === 'charts' && timeAnalysis && calendarMetrics && (
            <div data-export-chart="main-charts">
              <AnalyticsCharts
                hourlyDistribution={timeAnalysis.hourlyDistribution}
                dailyDistribution={timeAnalysis.dailyDistribution}
                categoryDistribution={calendarMetrics.categoryDistribution}
                priorityDistribution={calendarMetrics.priorityDistribution}
                weeklyTrends={timeAnalysis.weeklyTrends}
                monthlyTrends={timeAnalysis.monthlyTrends}
                completionTrends={analyticsData?.completionTrends || []}
                trends={analyticsData?.trends}
                predictions={analyticsData?.predictions}
                advancedInsights={analyticsData?.advancedInsights}
              />
            </div>
          )}

          {activeTab === 'forecast' && (
            <CalendarForecast
              events={tasks.filter(task => task.due_date)}
              dateRange={getDateRange(selectedTimeRange)}
            />
          )}

          {activeTab === 'recommendations' && analyticsData && (
            <SmartRecommendations
              analyticsData={analyticsData}
              onImplementRecommendation={(recommendationId) => {
                console.log('Implementing recommendation:', recommendationId);
                // Here you could implement specific actions for each recommendation
              }}
            />
          )}

          {activeTab === 'export' && analyticsData && calendarMetrics && (
            <ExportPDF
              events={tasks}
              metrics={calendarMetrics}
              insights={calendarInsights}
              healthScore={calendarHealth}
              burnoutRisk={burnoutRisk}
              dateRange={getDateRange(selectedTimeRange)}
              analyticsData={analyticsData}
            />
          )}
        </main>
      </div>
    </div>
  );
};

// Overview Content Component
const OverviewContent: React.FC<{
  analyticsData: AnalyticsData | null;
  calendarMetrics: any;
  calendarHealth: any;
  burnoutRisk: any;
}> = ({ analyticsData, calendarMetrics, calendarHealth, burnoutRisk }) => {
  if (!analyticsData) return null;
  const { taskStats, productivityStats } = analyticsData;
  const insights = analyticsService.generateInsights(analyticsData);

  return (
    <div className="space-y-6">
      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center mb-4">
            <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
              Insights de Productividad Personalizados
            </h3>
          </div>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <p key={index} className="text-purple-800 dark:text-purple-200 text-sm">
                • {insight}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tareas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.total}</p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 dark:text-green-400">
              {taskStats.completionRate}% completadas
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Racha Actual</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{productivityStats.currentStreak}</p>
            </div>
            <Award className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">días consecutivos</span>
          </div>
        </div>

        {calendarHealth && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Salud Calendario</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{calendarHealth.score}/100</p>
              </div>
              <Activity className={`h-8 w-8 ${
                calendarHealth.score >= 80 ? 'text-green-500' :
                calendarHealth.score >= 60 ? 'text-yellow-500' : 'text-red-500'
              }`} />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`${
                calendarHealth.score >= 80 ? 'text-green-600 dark:text-green-400' :
                calendarHealth.score >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {calendarHealth.score >= 80 ? 'Excelente' : calendarHealth.score >= 60 ? 'Bueno' : 'Necesita mejora'}
              </span>
            </div>
          </div>
        )}

        {burnoutRisk && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Riesgo Burnout</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{burnoutRisk.level}</p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${
                burnoutRisk.level === 'low' ? 'text-green-500' :
                burnoutRisk.level === 'medium' ? 'text-yellow-500' : 'text-red-500'
              }`} />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`${
                burnoutRisk.level === 'low' ? 'text-green-600 dark:text-green-400' :
                burnoutRisk.level === 'medium' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
              }`}>
                Puntuación: {burnoutRisk.score}
              </span>
            </div>
          </div>
        )}
      </div>

      {calendarMetrics && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center mb-6">
            <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Resumen de tu Calendario y Eventos
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{calendarMetrics.totalEvents}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total eventos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{calendarMetrics.completedEvents}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Completados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{calendarMetrics.upcomingEvents}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Próximos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{calendarMetrics.overdueEvents}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Vencidos</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Productivity Content Component
const ProductivityContent: React.FC<{
  analyticsData: AnalyticsData | null;
  calendarInsights: any;
}> = ({ analyticsData, calendarInsights }) => {
  if (!analyticsData) return <div>No data available</div>;

  const { productivityStats, timeStats } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Productivity Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center mb-6">
          <Activity className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Estadísticas Detalladas de Productividad y Rendimiento
          </h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {productivityStats.tasksCompletedToday}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tareas hoy</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {productivityStats.tasksCompletedThisWeek}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Esta semana</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">
              {productivityStats.tasksCompletedThisMonth}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Este mes</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">
              {productivityStats.averageCompletionTime.toFixed(1)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Días promedio</p>
          </div>
        </div>

        {productivityStats.mostProductiveDay !== 'Sin datos' && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
              <Clock className="h-4 w-4 inline mr-1" />
              Tu día más productivo: <span className="font-medium text-purple-600">{productivityStats.mostProductiveDay}</span>
            </p>
          </div>
        )}
      </div>

      {/* Daily Activity Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center mb-6">
          <BarChart3 className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Actividad de Tareas: Últimos 7 Días
          </h3>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {timeStats.dailyDistribution.map((day, index) => (
            <div key={index} className="text-center">
              <div 
                className="bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-lg mb-2 mx-auto transition-all duration-300 hover:scale-110"
                style={{ 
                  height: `${Math.max(day.count * 15, 8)}px`,
                  width: '40px',
                  opacity: day.count > 0 ? 1 : 0.3
                }}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{day.day}</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{day.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Insights */}
      {calendarInsights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-5 w-5 text-orange-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">              Horas Pico de Productividad</h3>
            </div>
            
            <div className="space-y-3">
              {calendarInsights.peakProductivityHours.map((hour: number, index: number) => (
                <div key={hour} className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    {hour === 0 ? '12 AM' : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((3 - index) / 3) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">              Análisis del Balance Vida-Trabajo</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Eventos de trabajo</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {calendarInsights.workLifeBalance.workEvents}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Eventos personales</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {calendarInsights.workLifeBalance.personalEvents}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Ratio Trabajo/Vida</span>
                  <span className={`font-semibold ${
                    calendarInsights.workLifeBalance.ratio <= 2 ? 'text-green-600 dark:text-green-400' :
                    calendarInsights.workLifeBalance.ratio <= 4 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {calendarInsights.workLifeBalance.ratio.toFixed(1)}:1
                  </span>
                </div>
                
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      calendarInsights.workLifeBalance.ratio <= 2 ? 'bg-green-500' :
                      calendarInsights.workLifeBalance.ratio <= 4 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, (calendarInsights.workLifeBalance.ratio / 6) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Calendar Content Component
const CalendarContent: React.FC<{
  metrics: any;
  insights: any;
  health: any;
  burnout: any;
}> = ({ metrics, insights, health, burnout }) => {
  if (!metrics) return <div>No calendar data available</div>;

  return (
    <div className="space-y-6">
      {/* Calendar Health Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center mb-6">
          <Brain className="h-5 w-5 text-purple-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Desglose de la Salud de tu Calendario</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(health.factors).map(([factor, score]) => (
            <div key={factor} className="text-center">
              <div className="relative inline-flex items-center justify-center w-16 h-16 mb-2">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 32 32">
                  <circle
                    className="text-gray-200 dark:text-gray-700"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="transparent"
                    r="14"
                    cx="16"
                    cy="16"
                  />
                  <circle
                    className={`${
                      (score as number) >= 80 ? 'text-green-500' :
                      (score as number) >= 60 ? 'text-yellow-500' : 'text-red-500'
                    }`}
                    strokeWidth="3"
                    strokeDasharray={`${((score as number) / 100) * 87.96} 87.96`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="14"
                    cx="16"
                    cy="16"
                  />
                </svg>
                <span className="absolute text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {score as number}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {factor.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
        <div className="flex items-center mb-4">
          <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recomendaciones Personalizadas para tu Calendario</h3>
        </div>

        <div className="space-y-3">
          {health.recommendations.slice(0, 5).map((recommendation: string, index: number) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                  {index + 1}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">{recommendation}</p>
            </div>
          ))}
        </div>

        {burnout && burnout.level !== 'low' && (
          <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200 text-sm">
                  Riesgo de Burnout: {burnout.level.charAt(0).toUpperCase() + burnout.level.slice(1)}
                </p>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  {burnout.suggestions[0]}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Focus Time Blocks */}
      {insights && insights.focusTimeBlocks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 text-indigo-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bloques de Tiempo de Enfoque Disponibles</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.focusTimeBlocks.slice(0, 6).map((block: any, index: number) => (
              <div key={index} className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-indigo-900 dark:text-indigo-100">
                    {block.day}
                  </span>
                  <span className="text-sm text-indigo-600 dark:text-indigo-400">
                    {block.duration}h
                  </span>
                </div>
                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                  {block.startTime} - {block.endTime}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
