import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Target,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Zap,
  Star,
  Brain,
  Sparkles,
  ChevronDown,
  ChevronUp
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
  bgColor: string;
  estimatedTime: string;
  completed?: boolean;
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  analyticsData,
  onImplementRecommendation
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const recs = generateRecommendations();
    setRecommendations(recs);
    setIsAnimating(false);
  }, [analyticsData]);

  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    const { taskStats, productivityStats, predictions, advancedInsights } = analyticsData;

    if (taskStats.completionRate < 60) {
      recommendations.push({
        id: 'improve-completion-rate',
        type: 'productivity',
        priority: 'high',
        title: '🚀 Optimiza tu Tasa de Finalización',
        description: `Tu tasa de completitud actual es del ${taskStats.completionRate}%. Las tareas pequeñas y enfocadas aumentan el momentum.`,
        impact: `+${Math.round((75 - taskStats.completionRate))}% de productividad potencial`,
        actionSteps: [
          'Limita tus tareas activas a máximo 5 por día',
          'Aplica la regla 2 del día: solo 2 tareas principales',
          'Usa la técnica Pomodoro: 25 min trabajo, 5 min pausa',
          'Celebra cada pequeña victoria para mantener momentum'
        ],
        icon: Target,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        estimatedTime: '2-3 semanas'
      });
    }

    if (taskStats.overdue > 3) {
      recommendations.push({
        id: 'handle-overdue-tasks',
        type: 'time-management',
        priority: 'high',
        title: '⚡ Resuelve tus Tareas Vencidas',
        description: `Tienes ${taskStats.overdue} tareas pendientes. Abordarlas ahora liberará energía mental y reducirá el estrés.`,
        impact: '30% menos estrés, mejor claridad mental',
        actionSteps: [
          'Bloquea 30 min hoy solo para tareas vencidas',
          'Revisa cada una: ¿aún es relevante? Si no, elimínala',
          'Agrupa similares para completarlas más rápido',
          'Establece un "no más vencidas" como meta personal'
        ],
        icon: AlertTriangle,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        estimatedTime: '1 semana'
      });
    }

    if (productivityStats.currentStreak < 3) {
      recommendations.push({
        id: 'build-consistency',
        type: 'goal-setting',
        priority: 'medium',
        title: '🔥 Construye tu Racha de Éxito',
        description: 'La consistencia diaria supera la intensidad esporádica. Un pequeño hábito daily crea resultados extraordinarios.',
        impact: '+40% en productividad sostenida a largo plazo',
        actionSteps: [
          'Inicia con algo pequeño: 1 tarea mínima diaria',
          'Crea un "ritual de inicio" cada mañana',
          'Usa el calendario como tu aliado visual',
          'Recompénsate cada 7 días de racha'
        ],
        icon: Zap,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        estimatedTime: '3-4 semanas'
      });
    }

    if (predictions.burnoutRisk.level === 'high' || predictions.burnoutRisk.level === 'medium') {
      recommendations.push({
        id: 'prevent-burnout',
        type: 'balance',
        priority: 'high',
        title: '💪 Prevén el Burnout Ahora',
        description: `Tu nivel de riesgo es ${predictions.burnoutRisk.level}. El descanso no es lujo, es estrategia para mayor productividad.`,
        impact: '50% más bienestar y rendimiento sostenible',
        actionSteps: [
          'Instalaapps derecordatorio: cada 2h, 15 min pausa',
          'Define un "hora de cierre" y respétala',
          'Practica 5 min de respiración antes de dormir',
          'Revisa tu weekly: elimina 1 tarea no esencial'
        ],
        icon: Brain,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        estimatedTime: 'Inmediato'
      });
    }

    if (advancedInsights.timeManagement.efficiency < 60) {
      recommendations.push({
        id: 'optimize-time-management',
        type: 'time-management',
        priority: 'medium',
        title: '⏰ Potencia tus Horas Pico',
        description: `Tu eficiencia en horas pico es ${advancedInsights.timeManagement.efficiency}%. Concentrar tu energía produce 3x más resultados.`,
        impact: `~${Math.round((100 - advancedInsights.timeManagement.efficiency) / 10)} horas ahorradas semanalmente`,
        actionSteps: [
          `Protege tus horas pico (${advancedInsights.timeManagement.peakHours.join(', ')}h) para trabajo profundo`,
          'Desactiva notificaciones durante blocks de foco',
          'Agrupa tareas similares en un mismo block',
          'Reserva mornings para lo más importante'
        ],
        icon: Clock,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        estimatedTime: '2 semanas'
      });
    }

    if (advancedInsights.workloadBalance.status === 'overloaded') {
      recommendations.push({
        id: 'balance-workload',
        type: 'balance',
        priority: 'high',
        title: '⚖️ Equilibra tu Carga de Trabajo',
        description: 'Tu sistema está en sobrecarga. Redistribuir = calidad + bienestar.',
        impact: '35% mejor calidad, 50% menos estrés',
        actionSteps: [
          'Lista todo y marca lo que realmente importa',
          'Aprende la palabra "depende" para nuevos compromisos',
          'Negocia deadlines con evidencia de tu carga',
          'Automatiza o delega al menos 1 tarea esta semana'
        ],
        icon: TrendingUp,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        estimatedTime: '1-2 semanas'
      });
    }

    const { goalRecommendations } = predictions;
    if (goalRecommendations.dailyTarget > productivityStats.tasksCompletedToday) {
      recommendations.push({
        id: 'set-daily-goals',
        type: 'goal-setting',
        priority: 'low',
        title: '🎯 Metas Diarias Realistas',
        description: `Tu capacidad óptima: ${goalRecommendations.dailyTarget} tareas/día. Metas claras = ejecución sin fricción.`,
        impact: '+20% productividad diaria asegurada',
        actionSteps: [
          `Fija tu meta en ${goalRecommendations.dailyTarget} tareas importantes`,
          'Planifica tomorrow night: las 3 top tasks',
          'Usa el método MIT: 1-3 tareas Maximum Impact',
          'Revisa y ajusta cada noche'
        ],
        icon: Star,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        estimatedTime: '1 semana'
      });
    }

    if (taskStats.completionRate >= 80 && productivityStats.currentStreak >= 7) {
      recommendations.push({
        id: 'maintain-excellence',
        type: 'productivity',
        priority: 'low',
        title: '⭐ Mantén tu Excelencia',
        description: '¡Estás en zona! Tu disciplina está dando resultados. Ahora el reto es mantener y escalar.',
        impact: 'Consolidar hábitos para resultados compuestos',
        actionSteps: [
          'Documenta tu proceso en un "playbook personal"',
          'Desafíate con 1 meta más ambiciosa mensual',
          'Mentorea a alguien para reforzar tu aprendizaje',
          'Celebra trimestralmente tus avances'
        ],
        icon: CheckCircle,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        estimatedTime: 'Ongoing'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-gradient-to-r from-red-500 to-orange-500 text-white';
      case 'medium': return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white';
      case 'low': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
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

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredRecommendations = recommendations.filter(rec => 
    filterPriority === 'all' || rec.priority === filterPriority
  );

  if (recommendations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          ¡Excelente trabajo! 🌟
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Tu productividad está en niveles óptimos. Mantén estos hábitos y considera desafiarte con nuevas metas.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">✓ Tasa de completitud alta</span>
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm">✓ Racha activa</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recomendaciones IA
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {recommendations.length} sugerencias personalizadas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">Todas las prioridades</option>
            <option value="high">Alta prioridad</option>
            <option value="medium">Media prioridad</option>
            <option value="low">Baja prioridad</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredRecommendations.map((rec, index) => {
          const IconComponent = rec.icon;
          const TypeIcon = getTypeIcon(rec.type);
          const isExpanded = expandedId === rec.id;

          return (
            <div
              key={rec.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-xl ${rec.bgColor}`}>
                      <IconComponent className={`h-5 w-5 ${rec.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {rec.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                          {rec.priority === 'high' ? '🔴 Alta' : rec.priority === 'medium' ? '🟡 Media' : '🟢 Baja'}
                        </span>
                        <TypeIcon className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3" />
                      {rec.estimatedTime}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                  {rec.description}
                </p>

                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-3 mb-4">
                  <div className="flex items-center text-sm font-medium text-purple-800 dark:text-purple-200">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Impacto esperado
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                    {rec.impact}
                  </p>
                </div>

                <button
                  onClick={() => toggleExpand(rec.id)}
                  className="flex items-center justify-center w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Menos detalles
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Ver pasos de acción
                    </>
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Pasos de acción:
                    </div>
                    <div className="space-y-2">
                      {rec.actionSteps.map((step, idx) => (
                        <div key={idx} className="flex items-start">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs font-bold mr-2 mt-0.5 flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>

                    {onImplementRecommendation && (
                      <button
                        onClick={() => onImplementRecommendation(rec.id)}
                        className="w-full mt-4 flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Implementar Recomendación
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 rounded-2xl border border-purple-200 dark:border-purple-700 p-5">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
              💡 Consejo del Experto
            </h4>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              Para resultados óptimos, implementa <strong>máximo 2-3 recomendaciones</strong> a la vez. 
              Enfócate en las de alta prioridad primero y permite que cada cambio se consolidate como hábito 
              (típicamente 21-30 días). La consistencia supera a la intensidad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartRecommendations;
