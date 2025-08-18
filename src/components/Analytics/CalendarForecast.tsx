import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  AlertTriangle, 
  Target,
  Clock,
  Activity,
  BarChart3
} from 'lucide-react';
import { format, isWeekend } from 'date-fns';
import { es } from 'date-fns/locale';
import { calendarAnalyticsService } from '../../services/calendarAnalyticsService';

interface ForecastData {
  nextWeekLoad: number;
  nextMonthLoad: number;
  predictedBusyDays: Date[];
  recommendedBreaks: Date[];
  conflictRisks: Array<{
    date: Date;
    conflictCount: number;
    events: string[];
  }>;
  productivityForecast: {
    expectedCompletionRate: number;
    peakProductivityDays: string[];
    recommendedFocusHours: number[];
  };
  burnoutRiskTrend: {
    currentRisk: 'low' | 'medium' | 'high';
    projectedRisk: 'low' | 'medium' | 'high';
    riskFactors: string[];
  };
  smartRecommendations: Array<{
    type: 'productivity' | 'health' | 'planning' | 'balance';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionable: boolean;
  }>;
}

interface CalendarForecastProps {
  events: any[];
  dateRange: { start: Date; end: Date };
}

const CalendarForecast: React.FC<CalendarForecastProps> = ({ events, dateRange }) => {
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'productivity' | 'risks' | 'recommendations'>('overview');

  useEffect(() => {
    generateForecast();
  }, [events, dateRange]);

  const generateForecast = async () => {
    setIsLoading(true);
    try {
      // Set events data
      calendarAnalyticsService.setEventsData(events);
      
      // Get basic forecast data
      const basicForecast = await calendarAnalyticsService.getCalendarForecast();
      const burnoutRisk = await calendarAnalyticsService.getBurnoutRisk(dateRange);
      const metrics = await calendarAnalyticsService.getCalendarMetrics(dateRange);
      const insights = await calendarAnalyticsService.getProductivityInsights(dateRange);

      // Generate advanced predictions
      const productivityForecast = generateProductivityForecast(events, insights);
      const burnoutTrend = generateBurnoutTrend(events, burnoutRisk);
      const smartRecommendations = generateSmartRecommendations(metrics, insights, burnoutRisk);

      setForecastData({
        ...basicForecast,
        productivityForecast,
        burnoutRiskTrend: burnoutTrend,
        smartRecommendations
      });
    } catch (error) {
      console.error('Error generating forecast:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateProductivityForecast = (events: any[], insights: any) => {
    const completedEvents = events.filter(e => e.completed).length;
    const totalEvents = events.length;
    const currentCompletionRate = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;

    // Predict completion rate based on historical data and current trends
    const trendFactor = insights.peakProductivityHours.length > 0 ? 1.1 : 0.9;
    const expectedCompletionRate = Math.min(100, Math.max(0, currentCompletionRate * trendFactor));

    return {
      expectedCompletionRate: Math.round(expectedCompletionRate),
      peakProductivityDays: ['Martes', 'Miércoles', 'Jueves'],
      recommendedFocusHours: insights.peakProductivityHours.length > 0 ? insights.peakProductivityHours : [9, 10, 14]
    };
  };

  const generateBurnoutTrend = (events: any[], currentBurnout: any) => {
    // Analyze trend over time
    const recentEvents = events.filter(e => {
      const eventDate = new Date(e.start_date || e.due_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return eventDate >= weekAgo;
    });

    const upcomingEvents = events.filter(e => {
      const eventDate = new Date(e.start_date || e.due_date);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return eventDate >= new Date() && eventDate <= nextWeek;
    });

    // Simple trend analysis
    const isIncreasing = upcomingEvents.length > recentEvents.length;
    let projectedRisk = currentBurnout.level;

    if (isIncreasing && currentBurnout.level === 'medium') {
      projectedRisk = 'high';
    } else if (!isIncreasing && currentBurnout.level === 'high') {
      projectedRisk = 'medium';
    }

    const riskFactors = [];
    if (upcomingEvents.length > 8) riskFactors.push('Alta carga de eventos próximos');
    if (upcomingEvents.filter(e => isWeekend(new Date(e.start_date || e.due_date))).length > 2) {
      riskFactors.push('Eventos en fin de semana');
    }
    if (currentBurnout.score > 70) riskFactors.push('Puntuación de burnout elevada');

    return {
      currentRisk: currentBurnout.level,
      projectedRisk,
      riskFactors: riskFactors.length > 0 ? riskFactors : ['Sin factores de riesgo identificados']
    };
  };

  const generateSmartRecommendations = (metrics: any, insights: any, burnoutRisk: any) => {
    const recommendations = [];

    // Productivity recommendations
    if (metrics.completionRate < 80) {
      recommendations.push({
        type: 'productivity' as const,
        priority: 'high' as const,
        title: 'Mejora tu tasa de finalización',
        description: `Con ${metrics.completionRate}% de finalización, podrías beneficiarte de eventos más cortos y mejor planificación.`,
        actionable: true
      });
    }

    if (insights.peakProductivityHours.length > 0) {
      recommendations.push({
        type: 'productivity' as const,
        priority: 'medium' as const,
        title: 'Optimiza tus horas productivas',
        description: `Tus mejores horas son ${insights.peakProductivityHours.join(', ')}:00. Programa tareas importantes en estos horarios.`,
        actionable: true
      });
    }

    // Health recommendations
    if (burnoutRisk.level !== 'low') {
      recommendations.push({
        type: 'health' as const,
        priority: 'high' as const,
        title: 'Reduce el riesgo de burnout',
        description: `Tu nivel de burnout es ${burnoutRisk.level}. Considera reducir eventos y añadir descansos.`,
        actionable: true
      });
    }

    // Planning recommendations
    if (metrics.averageEventsPerDay > 8) {
      recommendations.push({
        type: 'planning' as const,
        priority: 'medium' as const,
        title: 'Optimiza la distribución de eventos',
        description: `Con ${metrics.averageEventsPerDay} eventos/día en promedio, considera redistribuir la carga.`,
        actionable: true
      });
    }

    // Work-life balance
    if (insights.workLifeBalance.ratio > 4) {
      recommendations.push({
        type: 'balance' as const,
        priority: 'high' as const,
        title: 'Mejora el balance vida-trabajo',
        description: `Ratio trabajo/personal de ${insights.workLifeBalance.ratio}:1 indica desbalance. Añade más tiempo personal.`,
        actionable: true
      });
    }

    return recommendations.length > 0 ? recommendations : [{
      type: 'productivity' as const,
      priority: 'low' as const,
      title: 'Calendario bien optimizado',
      description: 'Tu calendario muestra un buen balance y productividad. ¡Sigue así!',
      actionable: false
    }];
  };

  const getLoadColor = (load: number) => {
    if (load < 30) return 'text-green-600 dark:text-green-400';
    if (load < 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Target className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!forecastData) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600 dark:text-gray-400">No forecast data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pronósticos y Predicciones
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Análisis predictivo de tu calendario
            </p>
          </div>
        </div>

        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
          {(['overview', 'productivity', 'risks', 'recommendations'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedTab === tab
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-purple-500'
              }`}
            >
              {tab === 'overview' ? 'Resumen' : 
               tab === 'productivity' ? 'Productividad' :
               tab === 'risks' ? 'Riesgos' : 'Recomendaciones'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Carga Próxima Semana</p>
                <p className={`text-2xl font-bold ${getLoadColor(forecastData.nextWeekLoad)}`}>
                  {forecastData.nextWeekLoad}%
                </p>
              </div>
              <Calendar className={`h-8 w-8 ${getLoadColor(forecastData.nextWeekLoad)}`} />
            </div>
            <div className="mt-4 flex items-center text-sm">
              {forecastData.nextWeekLoad > 70 ? (
                <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              )}
              <span className="text-gray-600 dark:text-gray-400">
                {forecastData.nextWeekLoad > 70 ? 'Semana intensa' : 'Carga moderada'}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Carga Próximo Mes</p>
                <p className={`text-2xl font-bold ${getLoadColor(forecastData.nextMonthLoad)}`}>
                  {forecastData.nextMonthLoad}%
                </p>
              </div>
              <BarChart3 className={`h-8 w-8 ${getLoadColor(forecastData.nextMonthLoad)}`} />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Tendencia mensual
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Riesgo Burnout</p>
                <p className={`text-2xl font-bold capitalize ${getRiskColor(forecastData.burnoutRiskTrend.projectedRisk)}`}>
                  {forecastData.burnoutRiskTrend.projectedRisk}
                </p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${getRiskColor(forecastData.burnoutRiskTrend.projectedRisk)}`} />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {forecastData.burnoutRiskTrend.projectedRisk !== forecastData.burnoutRiskTrend.currentRisk 
                  ? `Cambio desde ${forecastData.burnoutRiskTrend.currentRisk}` 
                  : 'Estable'}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Finalización Esperada</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {forecastData.productivityForecast.expectedCompletionRate}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Predicción basada en tendencias
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Productivity Tab */}
      {selectedTab === 'productivity' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Predicciones de Productividad
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {forecastData.productivityForecast.expectedCompletionRate}%
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tasa de finalización esperada
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {forecastData.productivityForecast.peakProductivityDays.join(', ')}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Días de mayor productividad
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {forecastData.productivityForecast.recommendedFocusHours.map(h => `${h}:00`).join(', ')}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Horas recomendadas para concentración
                </p>
              </div>
            </div>
          </div>

          {forecastData.recommendedBreaks.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Descansos Recomendados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {forecastData.recommendedBreaks.slice(0, 6).map((date, index) => (
                  <div key={index} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <p className="font-medium text-green-900 dark:text-green-100">
                      {format(date, 'EEEE, d MMM', { locale: es })}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Día libre recomendado
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Risks Tab */}
      {selectedTab === 'risks' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Análisis de Riesgos
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Riesgo de Burnout Actual
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Estado basado en patrones recientes
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getRiskColor(forecastData.burnoutRiskTrend.currentRisk)}`}>
                  {forecastData.burnoutRiskTrend.currentRisk}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Riesgo Proyectado (Próxima Semana)
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Predicción basada en eventos programados
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getRiskColor(forecastData.burnoutRiskTrend.projectedRisk)}`}>
                  {forecastData.burnoutRiskTrend.projectedRisk}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Factores de Riesgo Identificados</h4>
              <div className="space-y-2">
                {forecastData.burnoutRiskTrend.riskFactors.map((factor, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {forecastData.conflictRisks.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Riesgos de Conflictos
              </h3>
              <div className="space-y-3">
                {forecastData.conflictRisks.map((risk, index) => (
                  <div key={index} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-red-900 dark:text-red-100">
                        {format(risk.date, 'EEEE, d MMMM', { locale: es })}
                      </p>
                      <span className="text-sm text-red-600 dark:text-red-400">
                        {risk.conflictCount} conflictos
                      </span>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Eventos: {risk.events.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations Tab */}
      {selectedTab === 'recommendations' && (
        <div className="space-y-4">
          {forecastData.smartRecommendations.map((recommendation, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getPriorityIcon(recommendation.priority)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {recommendation.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        recommendation.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {recommendation.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        recommendation.type === 'productivity' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                        recommendation.type === 'health' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        recommendation.type === 'planning' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {recommendation.type}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {recommendation.description}
                  </p>
                  {recommendation.actionable && (
                    <button className="mt-3 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                      Ver acciones sugeridas →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarForecast;
