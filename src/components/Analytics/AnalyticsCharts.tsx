import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
  ComposedChart,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { TrendData, PredictionData, AdvancedInsights } from '../../services/analyticsService';

interface AnalyticsChartsProps {
  hourlyDistribution: Record<number, number>;
  dailyDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  weeklyTrends: Record<string, number>;
  monthlyTrends: Record<string, number>;
  completionTrends: Array<{ date: string; completed: number; total: number; rate: number }>;
  trends?: TrendData[];
  predictions?: PredictionData;
  advancedInsights?: AdvancedInsights;
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  hourlyDistribution,
  dailyDistribution,
  categoryDistribution,
  priorityDistribution,
  weeklyTrends,
  monthlyTrends,
  completionTrends,
  trends = [],
  predictions,
  advancedInsights
}) => {
  // Prepare data for charts
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    hourNumber: i,
    events: hourlyDistribution[i] || 0
  }));

  const dailyData = Object.entries(dailyDistribution).map(([day, events]) => ({
    day,
    events,
    fullDay: day
  }));

  const categoryData = Object.entries(categoryDistribution).map(([category, count]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: count,
    percentage: Math.round((count / Object.values(categoryDistribution).reduce((a, b) => a + b, 0)) * 100)
  }));

  const priorityData = Object.entries(priorityDistribution).map(([priority, count]) => ({
    name: priority.charAt(0).toUpperCase() + priority.slice(1),
    value: count,
    percentage: Math.round((count / Object.values(priorityDistribution).reduce((a, b) => a + b, 0)) * 100)
  }));

  const weeklyData = Object.entries(weeklyTrends).map(([week, events]) => ({
    week: week.replace('Week ', 'S'),
    events,
    fullWeek: week
  }));

  const monthlyData = Object.entries(monthlyTrends).map(([month, events]) => ({
    month: month.slice(0, 3),
    events,
    fullMonth: month
  }));

  // Color palettes
  const categoryColors = [
    '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', 
    '#EF4444', '#EC4899', '#6366F1', '#84CC16'
  ];

  const priorityColors = {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#10B981'
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Hourly Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Distribución por Horas
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 12 }}
                interval={1}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="events" 
                fill="#8B5CF6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribución Semanal
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="events" 
                  fill="#06B6D4"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Por Categorías
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  labelLine={false}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Distribución por Prioridad
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[0, 4, 4, 0]}
              >
                {priorityData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={priorityColors[entry.name.toLowerCase() as keyof typeof priorityColors] || '#6B7280'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Completion Trends */}
      {completionTrends.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tendencia de Finalización
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={completionTrends}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total"
                  stackId="1"
                  stroke="#E5E7EB"
                  fill="#E5E7EB"
                  name="Total"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  name="Completados"
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6' }}
                  name="Tasa de Finalización (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Monthly Trends */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tendencias Mensuales
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="events"
                stroke="#F59E0B"
                strokeWidth={3}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#F59E0B', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Trends */}
      {Object.keys(weeklyTrends).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tendencias Semanales
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="week" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="events"
                  stroke="#EC4899"
                  fill="url(#weeklyGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Advanced Analytics Charts */}
      {trends.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Análisis de Tendencias (12 Semanas)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => [
                    typeof value === 'number' ? value : 0,
                    name === 'created' ? 'Creadas' : 
                    name === 'completed' ? 'Completadas' : 
                    name === 'completionRate' ? 'Tasa de Finalización (%)' : name
                  ]}
                />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="created" 
                  fill="#3B82F6" 
                  name="Tareas Creadas"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="completed" 
                  fill="#10B981" 
                  name="Tareas Completadas"
                  radius={[2, 2, 0, 0]}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="completionRate" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  name="Tasa de Finalización (%)"
                  dot={{ r: 4, fill: '#F59E0B' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Predictions Chart */}
      {predictions && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Predicción para la Próxima Semana
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-blue-800 dark:text-blue-200 font-medium">
                  Tareas Estimadas a Completar
                </span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {predictions.nextWeekPrediction.estimatedTasksToComplete}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-green-800 dark:text-green-200 font-medium">
                  Tasa de Finalización Estimada
                </span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {predictions.nextWeekPrediction.estimatedCompletionRate}%
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span className="text-purple-800 dark:text-purple-200 font-medium">
                  Confianza de la Predicción
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${predictions.nextWeekPrediction.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-purple-600 dark:text-purple-400 font-bold">
                    {Math.round(predictions.nextWeekPrediction.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Riesgo de Burnout
            </h3>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    cx="50%" 
                    cy="50%" 
                    innerRadius="60%" 
                    outerRadius="90%" 
                    data={[{ 
                      name: 'Risk', 
                      value: predictions.burnoutRisk.score,
                      fill: predictions.burnoutRisk.level === 'high' ? '#EF4444' :
                            predictions.burnoutRisk.level === 'medium' ? '#F59E0B' : '#10B981'
                    }]}
                  >
                    <RadialBar dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      predictions.burnoutRisk.level === 'high' ? 'text-red-600' :
                      predictions.burnoutRisk.level === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {predictions.burnoutRisk.score}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      {predictions.burnoutRisk.level}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {predictions.burnoutRisk.factors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Factores de Riesgo:
                </h4>
                {predictions.burnoutRisk.factors.map((factor, index) => (
                  <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                    • {factor}
                  </div>
                ))}
              </div>
            )}

            {predictions.burnoutRisk.suggestions.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Sugerencias:
                </h4>
                {predictions.burnoutRisk.suggestions.slice(0, 2).map((suggestion, index) => (
                  <div key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                    • {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Advanced Insights */}
      {advancedInsights && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Balance de Carga de Trabajo
            </h3>
            <div className="text-center mb-4">
              <div className={`text-3xl font-bold mb-2 ${
                advancedInsights.workloadBalance.status === 'optimal' ? 'text-green-600' :
                advancedInsights.workloadBalance.status === 'overloaded' ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {isNaN(advancedInsights.workloadBalance.score) ? '0' : advancedInsights.workloadBalance.score}/100
              </div>
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                advancedInsights.workloadBalance.status === 'optimal' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' :
                advancedInsights.workloadBalance.status === 'overloaded' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
              }`}>
                {advancedInsights.workloadBalance.status === 'optimal' ? 'Óptimo' :
                 advancedInsights.workloadBalance.status === 'overloaded' ? 'Sobrecargado' :
                 'Subutilizado'}
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {advancedInsights.workloadBalance.recommendation}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Eficiencia de Tiempo
            </h3>
              <div className="text-center mb-4">
                <div className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-3">
                  {advancedInsights.categoryBalance.mostNegglected || 'Ninguna'}
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Eficiencia en Horas Pico
              </div>
              <div className="flex justify-center space-x-2">
                {advancedInsights.timeManagement.peakHours.map((hour, index) => (
                  <span key={index} className="inline-flex px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded text-xs">
                    {hour}:00
                  </span>
                ))}
              </div>
            </div>
            {advancedInsights.timeManagement.suggestions.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {advancedInsights.timeManagement.suggestions[0]}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Balance de Categorías
            </h3>
            <div className="text-center mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Categoría que necesita atención:
              </div>
              <div className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-3">
                {advancedInsights.categoryBalance.mostNegglected}
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {advancedInsights.categoryBalance.recommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsCharts;
