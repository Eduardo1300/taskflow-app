import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Target,
  Calendar,
  Clock,
  Award,
  PieChart,
  Activity,
  Lightbulb,
  Download
} from 'lucide-react';
import { Task } from '../../types';
import { analyticsService, AnalyticsData } from '../../services/analyticsService';

interface AnalyticsPageProps {
  tasks: Task[];
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ tasks }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const data = analyticsService.generateAnalytics(tasks);
    setAnalyticsData(data);
    setLoading(false);
  }, [tasks]);

  const exportAnalytics = () => {
    if (!analyticsData) return;
    
    const dataStr = analyticsService.exportAnalyticsData(analyticsData);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
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

  const { taskStats, categoryStats, priorityStats, productivityStats, timeStats } = analyticsData;
  const insights = analyticsService.generateInsights(analyticsData);

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Insights sobre tu productividad y uso de la app
          </p>
        </div>
        <button
          onClick={exportAnalytics}
          className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar datos
        </button>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
          <div className="flex items-center mb-3">
            <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Insights Personalizados
            </h3>
          </div>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <p key={index} className="text-blue-800 dark:text-blue-200 text-sm">
                {insight}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Tareas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasa de Finalización</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.completionRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tareas Vencidas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.overdue}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Racha Actual</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{productivityStats.currentStreak} días</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <PieChart className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Distribución por Categorías
            </h3>
          </div>
          
          {categoryStats.length > 0 ? (
            <div className="space-y-3">
              {categoryStats.slice(0, 5).map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {category.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {category.total}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      ({category.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No hay categorías disponibles
            </p>
          )}
        </div>

        {/* Priority Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Distribución por Prioridad
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-3" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Alta</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {priorityStats.high}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Media</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {priorityStats.medium}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Baja</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {priorityStats.low}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Productivity Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <Activity className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Estadísticas de Productividad
          </h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {productivityStats.tasksCompletedToday}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Hoy</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {productivityStats.tasksCompletedThisWeek}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Esta semana</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {productivityStats.tasksCompletedThisMonth}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Este mes</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {productivityStats.averageCompletionTime.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Días promedio</p>
          </div>
        </div>
        
        {productivityStats.mostProductiveDay !== 'Sin datos' && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
              <Clock className="h-4 w-4 inline mr-1" />
              Tu día más productivo: <span className="font-medium">{productivityStats.mostProductiveDay}</span>
            </p>
          </div>
        )}
      </div>

      {/* Daily Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <BarChart3 className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Actividad de los Últimos 7 Días
          </h3>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {timeStats.dailyDistribution.map((day, index) => (
            <div key={index} className="text-center">
              <div 
                className="bg-blue-500 rounded mb-2"
                style={{ 
                  height: `${Math.max(day.count * 10, 4)}px`,
                  opacity: day.count > 0 ? 1 : 0.3
                }}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">{day.day}</p>
              <p className="text-xs font-medium text-gray-900 dark:text-white">{day.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Última actualización: {analyticsData.lastUpdated.toLocaleString('es-ES')}
        </p>
      </div>
    </div>
  );
};

export default AnalyticsPage;
