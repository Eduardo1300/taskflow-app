import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Clock, Users, Target, Brain, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { calendarAnalyticsService, CalendarMetrics, ProductivityInsights, CalendarHealthScore, BurnoutRisk } from '../../services/calendarAnalyticsService';
import AnalyticsCharts from '../Analytics/AnalyticsCharts';
import CalendarForecast from '../Analytics/CalendarForecast';
import ExportPDF from '../Analytics/ExportPDF';

interface CalendarAnalyticsProps {
  events: any[];
  onInsightClick?: (insight: string) => void;
}

const CalendarAnalytics: React.FC<CalendarAnalyticsProps> = ({ events, onInsightClick }) => {
  const [metrics, setMetrics] = useState<CalendarMetrics | null>(null);
  const [insights, setInsights] = useState<ProductivityInsights | null>(null);
  const [healthScore, setHealthScore] = useState<CalendarHealthScore | null>(null);
  const [burnoutRisk, setBurnoutRisk] = useState<BurnoutRisk | null>(null);
  const [timeAnalysis, setTimeAnalysis] = useState<any>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [activeView, setActiveView] = useState<'overview' | 'charts' | 'forecast' | 'export'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (events.length > 0) {
      loadAnalytics();
    }
  }, [events, selectedTimeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // Set events data in analytics service
      calendarAnalyticsService.setEventsData(events);

      // Get date range based on selection
      const dateRange = getDateRange(selectedTimeRange);

      // Load all analytics data
      const [metricsData, insightsData, healthData, burnoutData, timeData] = await Promise.all([
        calendarAnalyticsService.getCalendarMetrics(dateRange),
        calendarAnalyticsService.getProductivityInsights(dateRange),
        calendarAnalyticsService.getCalendarHealthScore(dateRange),
        calendarAnalyticsService.getBurnoutRisk(dateRange),
        calendarAnalyticsService.getTimeAnalysis(dateRange)
      ]);

      setMetrics(metricsData);
      setInsights(insightsData);
      setHealthScore(healthData);
      setBurnoutRisk(burnoutData);
      setTimeAnalysis(timeData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleInsightClick = (insight: string) => {
    if (onInsightClick) {
      onInsightClick(insight);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!metrics || !insights || !healthScore || !burnoutRisk || !timeAnalysis) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600 dark:text-gray-400">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Calendar Analytics
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Insights and productivity metrics for your calendar
            </p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
          {(['week', 'month', 'quarter'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedTimeRange === range
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-purple-500'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex justify-center mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg overflow-x-auto min-w-full">
        <div className="flex items-center space-x-2 min-w-max">
        <button
          onClick={() => setActiveView('overview')}
          className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
            activeView === 'overview' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
              : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
          }`}
        >
          <BarChart3 className="h-5 w-5 mr-2" />
          Resumen
        </button>
        <button
          onClick={() => setActiveView('charts')}
          className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
            activeView === 'charts' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
              : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
          }`}
        >
          <Activity className="h-5 w-5 mr-2" />
          Productividad
        </button>
        <button
          onClick={() => setActiveView('forecast')}
          className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
            activeView === 'forecast' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
              : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
          }`}
        >
          <TrendingUp className="h-5 w-5 mr-2" />
          Calendario
        </button>
        <button
          onClick={() => setActiveView('charts')}
          className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
            activeView === 'charts' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
              : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
          }`}
        >
          <Activity className="h-5 w-5 mr-2" />
          Gráficos
        </button>
        <button
          onClick={() => setActiveView('forecast')}
          className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
            activeView === 'forecast' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
              : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
          }`}
        >
          <TrendingUp className="h-5 w-5 mr-2" />
          Pronósticos
        </button>
        <button
          onClick={() => setActiveView('export')}
          className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
            activeView === 'export' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
              : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
          }`}
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          Recomendaciones
        </button>
        </div>
      </div>

      {/* Content based on active view */}
      {activeView === 'overview' && (
        <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalEvents}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 dark:text-green-400">
              {metrics.averageEventsPerDay.toFixed(1)} avg/day
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.completionRate}%</p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {metrics.completedEvents}/{metrics.totalEvents} completed
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Health Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{healthScore.score}</p>
            </div>
            <Activity className={`h-8 w-8 ${
              healthScore.score >= 80 ? 'text-green-500' :
              healthScore.score >= 60 ? 'text-yellow-500' : 'text-red-500'
            }`} />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className={`${
              healthScore.score >= 80 ? 'text-green-600 dark:text-green-400' :
              healthScore.score >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {healthScore.score >= 80 ? 'Excellent' :
               healthScore.score >= 60 ? 'Good' : 'Needs attention'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Burnout Risk</p>
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
              Score: {burnoutRisk.score}
            </span>
          </div>
        </div>
      </div>

      {/* Productivity Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Peak Productivity Hours</h3>
          </div>
          
          <div className="space-y-3">
            {insights.peakProductivityHours.map((hour, index) => (
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

          <button
            onClick={() => handleInsightClick('peak-hours')}
            className="mt-4 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
          >
            View detailed time analysis →
          </button>
        </div>

        {/* Work-Life Balance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Work-Life Balance</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Work Events</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {insights.workLifeBalance.workEvents}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Personal Events</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {insights.workLifeBalance.personalEvents}
              </span>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Work/Life Ratio</span>
                <span className={`font-semibold ${
                  insights.workLifeBalance.ratio <= 2 ? 'text-green-600 dark:text-green-400' :
                  insights.workLifeBalance.ratio <= 4 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {insights.workLifeBalance.ratio.toFixed(1)}:1
                </span>
              </div>
              
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    insights.workLifeBalance.ratio <= 2 ? 'bg-green-500' :
                    insights.workLifeBalance.ratio <= 4 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, (insights.workLifeBalance.ratio / 6) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleInsightClick('work-life-balance')}
            className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Get balance recommendations →
          </button>
        </div>
      </div>

      {/* Calendar Health Factors */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-6">
          <Brain className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Calendar Health Breakdown</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(healthScore.factors).map(([factor, score]) => (
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
                      score >= 80 ? 'text-green-500' :
                      score >= 60 ? 'text-yellow-500' : 'text-red-500'
                    }`}
                    strokeWidth="3"
                    strokeDasharray={`${(score / 100) * 87.96} 87.96`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="14"
                    cx="16"
                    cy="16"
                  />
                </svg>
                <span className="absolute text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {score}
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
        <div className="flex items-center space-x-2 mb-4">
          <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recommendations</h3>
        </div>

        <div className="space-y-3">
          {healthScore.recommendations.slice(0, 3).map((recommendation, index) => (
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

        {burnoutRisk.level !== 'low' && (
          <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200 text-sm">
                  Burnout Risk: {burnoutRisk.level.charAt(0).toUpperCase() + burnoutRisk.level.slice(1)}
                </p>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  {burnoutRisk.suggestions[0]}
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => handleInsightClick('all-recommendations')}
          className="mt-4 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
        >
          View all recommendations →
        </button>
      </div>

      {/* Focus Time Blocks */}
      {insights.focusTimeBlocks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Focus Time</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.focusTimeBlocks.slice(0, 6).map((block, index) => (
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
      )}

      {/* Charts View */}
      {activeView === 'charts' && timeAnalysis && (
        <div data-export-chart="charts-section">
          <AnalyticsCharts
            hourlyDistribution={timeAnalysis.hourlyDistribution}
            dailyDistribution={timeAnalysis.dailyDistribution}
            categoryDistribution={metrics.categoryDistribution}
            priorityDistribution={metrics.priorityDistribution}
            weeklyTrends={timeAnalysis.weeklyTrends}
            monthlyTrends={timeAnalysis.monthlyTrends}
            completionTrends={[]}
          />
        </div>
      )}

      {/* Forecast View */}
      {activeView === 'forecast' && (
        <CalendarForecast
          events={events}
          dateRange={getDateRange(selectedTimeRange)}
        />
      )}

      {/* Export View */}
      {activeView === 'export' && (
        <ExportPDF
          events={events}
          metrics={metrics}
          insights={insights}
          healthScore={healthScore}
          burnoutRisk={burnoutRisk}
          dateRange={getDateRange(selectedTimeRange)}
        />
      )}
    </div>
  );
};

export default CalendarAnalytics;
