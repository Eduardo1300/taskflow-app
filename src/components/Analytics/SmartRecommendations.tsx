import React from 'react';
import {
  Lightbulb,
  Target,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Zap,
  Star,
  Brain
} from 'lucide-react';
import { AnalyticsData } from '../../services/analyticsService';

interface SmartRecommendationsProps {
  analyticsData: AnalyticsData;
  onImplementRecommendation?: (recommendationId: string) => void;
}

interface Recommendation {
  id: string;
  type: 'productivity' | 'time-management' | 'balance' | 'goal-setting';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  actionSteps: string[];
  icon: React.ComponentType<any>;
  color: string;
  estimatedTime: string;
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  analyticsData,
  onImplementRecommendation
}) => {
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    const { taskStats, productivityStats, predictions, advancedInsights } = analyticsData;

    // Low completion rate recommendation
    if (taskStats.completionRate < 60) {
      recommendations.push({
        id: 'improve-completion-rate',
        type: 'productivity',
        priority: 'high',
        title: 'Mejora tu Tasa de Finalización',
        description: `Tu tasa de finalización actual es del ${taskStats.completionRate}%. Esto puede indicar que estás tomando demasiadas tareas o necesitas mejor planificación.`,
        impact: `Potencial aumento del ${Math.round((75 - taskStats.completionRate))}% en productividad`,
        actionSteps: [
          'Reduce el número de tareas activas a máximo 5',
          'Prioriza tareas basándose en urgencia e importancia',
          'Establece plazos más realistas',
          'Usa técnicas de time-blocking para concentrarte'
        ],
        icon: Target,
        color: 'text-red-600',
        estimatedTime: '2-3 semanas'
      });
    }

    // High overdue tasks recommendation
    if (taskStats.overdue > 3) {
      recommendations.push({
        id: 'handle-overdue-tasks',
        type: 'time-management',
        priority: 'high',
        title: 'Gestiona las Tareas Vencidas',
        description: `Tienes ${taskStats.overdue} tareas vencidas. Esto puede generar estrés y afectar tu productividad general.`,
        impact: 'Reducción del estrés y mejora del 30% en la gestión del tiempo',
        actionSteps: [
          'Dedica 30 minutos diarios solo para tareas vencidas',
          'Reevalúa la importancia de cada tarea vencida',
          'Considera delegar o eliminar tareas obsoletas',
          'Implementa recordatorios automáticos'
        ],
        icon: AlertTriangle,
        color: 'text-orange-600',
        estimatedTime: '1 semana'
      });
    }

    // Low streak recommendation
    if (productivityStats.currentStreak < 3) {
      recommendations.push({
        id: 'build-consistency',
        type: 'goal-setting',
        priority: 'medium',
        title: 'Construye Consistencia Diaria',
        description: 'Tu racha actual es baja. La consistencia es clave para el éxito a largo plazo.',
        impact: 'Aumento del 40% en la productividad sostenida',
        actionSteps: [
          'Establece una meta diaria mínima (1-2 tareas)',
          'Crea un ritual matutino para planificar el día',
          'Celebra pequeñas victorias diarias',
          'Usa gamificación para mantener la motivación'
        ],
        icon: Zap,
        color: 'text-purple-600',
        estimatedTime: '3-4 semanas'
      });
    }

    // Burnout risk recommendation
    if (predictions.burnoutRisk.level === 'high' || predictions.burnoutRisk.level === 'medium') {
      recommendations.push({
        id: 'prevent-burnout',
        type: 'balance',
        priority: 'high',
        title: 'Prevenir el Burnout',
        description: `Tu riesgo de burnout es ${predictions.burnoutRisk.level}. Es importante tomar medidas preventivas ahora.`,
        impact: 'Prevención del agotamiento y mejora del bienestar del 50%',
        actionSteps: [
          'Programa descansos regulares de 15 minutos cada 2 horas',
          'Establece límites claros entre trabajo y vida personal',
          'Practica técnicas de relajación o meditación',
          'Revisa y ajusta tu carga de trabajo semanal'
        ],
        icon: Brain,
        color: 'text-red-600',
        estimatedTime: 'Inmediato'
      });
    }

    // Time management efficiency
    if (advancedInsights.timeManagement.efficiency < 60) {
      recommendations.push({
        id: 'optimize-time-management',
        type: 'time-management',
        priority: 'medium',
        title: 'Optimiza tu Gestión del Tiempo',
        description: `Tu eficiencia en horas pico es del ${advancedInsights.timeManagement.efficiency}%. Puedes mejorar significativamente.`,
        impact: `Posible ahorro de ${Math.round((100 - advancedInsights.timeManagement.efficiency) / 10)} horas por semana`,
        actionSteps: [
          `Concentra tareas importantes en las ${advancedInsights.timeManagement.peakHours.join(', ')}:00`,
          'Elimina distracciones durante tus horas pico',
          'Usa técnicas Pomodoro para mantener el enfoque',
          'Programa tareas rutinarias fuera de horas pico'
        ],
        icon: Clock,
        color: 'text-blue-600',
        estimatedTime: '2 semanas'
      });
    }

    // Workload balance recommendation
    if (advancedInsights.workloadBalance.status === 'overloaded') {
      recommendations.push({
        id: 'balance-workload',
        type: 'balance',
        priority: 'high',
        title: 'Equilibra tu Carga de Trabajo',
        description: 'Estás sobrecargado. Es importante redistribuir tus responsabilidades.',
        impact: 'Mejora del 35% en la calidad del trabajo y reducción del estrés',
        actionSteps: [
          'Identifica tareas que pueden ser delegadas',
          'Aprende a decir "no" a nuevas solicitudes',
          'Renegocia plazos poco realistas',
          'Implementa sistemas de automatización donde sea posible'
        ],
        icon: TrendingUp,
        color: 'text-orange-600',
        estimatedTime: '1-2 semanas'
      });
    }

    // Goal setting recommendation based on predictions
    const { goalRecommendations } = predictions;
    if (goalRecommendations.dailyTarget > productivityStats.tasksCompletedToday) {
      recommendations.push({
        id: 'set-daily-goals',
        type: 'goal-setting',
        priority: 'low',
        title: 'Establece Metas Diarias Realistas',
        description: `Se recomienda completar ${goalRecommendations.dailyTarget} tareas diarias basado en tu patrón actual.`,
        impact: `Aumento proyectado del 20% en la productividad diaria`,
        actionSteps: [
          `Establece una meta diaria de ${goalRecommendations.dailyTarget} tareas`,
          'Planifica tu día la noche anterior',
          'Prioriza las 3 tareas más importantes',
          'Revisa tu progreso al final del día'
        ],
        icon: Star,
        color: 'text-green-600',
        estimatedTime: '1 semana'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const recommendations = generateRecommendations();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'productivity': return Target;
      case 'time-management': return Clock;
      case 'balance': return TrendingUp;
      case 'goal-setting': return Star;
      default: return Lightbulb;
    }
  };

  if (recommendations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          ¡Excelente trabajo!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Tu productividad está en un nivel óptimo. Mantén este gran trabajo y continúa con tus hábitos actuales.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Brain className="h-6 w-6 text-purple-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Recomendaciones Inteligentes
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendations.map((rec) => {
          const IconComponent = rec.icon;
          const TypeIcon = getTypeIcon(rec.type);
          
          return (
            <div key={rec.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${rec.color.replace('text-', 'bg-').replace('-600', '-100')} dark:${rec.color.replace('text-', 'bg-').replace('-600', '-900/20')}`}>
                    <IconComponent className={`h-5 w-5 ${rec.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {rec.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                        {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Media' : 'Baja'} Prioridad
                      </span>
                      <TypeIcon className="h-3 w-3 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Tiempo estimado</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{rec.estimatedTime}</div>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">
                {rec.description}
              </p>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 rounded-lg p-3 mb-4">
                <div className="flex items-center text-sm font-medium text-green-800 dark:text-green-200">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Impacto Esperado
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  {rec.impact}
                </p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pasos de acción:
                </div>
                <div className="space-y-1">
                  {rec.actionSteps.slice(0, 3).map((step, index) => (
                    <div key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium mr-2 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      {step}
                    </div>
                  ))}
                  {rec.actionSteps.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 ml-7">
                      +{rec.actionSteps.length - 3} pasos adicionales
                    </div>
                  )}
                </div>
              </div>

              {onImplementRecommendation && (
                <button
                  onClick={() => onImplementRecommendation(rec.id)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Implementar Recomendación
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
        <div className="flex items-center mb-4">
          <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
            Consejo Pro
          </h3>
        </div>
        <p className="text-purple-800 dark:text-purple-200 text-sm">
          Para obtener mejores resultados, implementa máximo 2-3 recomendaciones a la vez. 
          Enfócate en las de alta prioridad primero y dale tiempo a cada cambio para que se convierta en hábito.
        </p>
      </div>
    </div>
  );
};

export default SmartRecommendations;
