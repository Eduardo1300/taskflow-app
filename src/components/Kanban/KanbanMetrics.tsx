import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Target,
  Activity,
  Users,
  Zap
} from 'lucide-react';
import { BoardMetrics, BoardService } from '../../services/boardService';

interface KanbanMetricsProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
}

const KanbanMetrics: React.FC<KanbanMetricsProps> = ({ boardId, isOpen, onClose }) => {
  const [metrics, setMetrics] = useState<BoardMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && boardId) {
      loadMetrics();
    }
  }, [isOpen, boardId]);

  const loadMetrics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await BoardService.getBoardMetrics(boardId);
      if (result.error) {
        setError('Error al cargar métricas');
      } else {
        setMetrics(result.data);
      }
    } catch (err) {
      setError('Error al cargar métricas');
      console.error('Error loading metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Métricas del Board
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Análisis de rendimiento y productividad
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span className="sr-only">Cerrar</span>
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando métricas...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
              <button
                onClick={loadMetrics}
                className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded text-sm transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {metrics && (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                        Total de Tareas
                      </p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {metrics.total_tasks}
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200/50 dark:border-green-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                        Completadas
                      </p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {metrics.completed_tasks}
                      </p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-6 rounded-xl border border-yellow-200/50 dark:border-yellow-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                        En Progreso
                      </p>
                      <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                        {metrics.in_progress_tasks}
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 rounded-xl border border-red-200/50 dark:border-red-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                        Vencidas
                      </p>
                      <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                        {metrics.overdue_tasks}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
                    Tasa de Finalización
                  </h3>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Progreso</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {metrics.completion_rate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(metrics.completion_rate, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {metrics.completed_tasks} de {metrics.total_tasks} tareas completadas
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-orange-500" />
                    Tiempo Promedio
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Cycle Time</span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {metrics.avg_cycle_time.toFixed(1)} días
                      </span>
                    </div>
                    <div className="h-px bg-gray-200 dark:bg-gray-600"></div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Tiempo promedio desde creación hasta finalización
                    </p>
                  </div>
                </div>
              </div>

              {/* Throughput and Velocity */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-purple-500" />
                  Velocidad del Equipo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Throughput Semanal</span>
                      <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {metrics.throughput_week}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Tareas completadas en los últimos 7 días
                    </p>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Eficiencia</span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {metrics.completion_rate > 80 ? '🔥 Alta' : 
                         metrics.completion_rate > 60 ? '👍 Buena' : 
                         metrics.completion_rate > 40 ? '⚠️ Media' : '🐌 Baja'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Basado en tasa de finalización
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Recomendaciones
                </h3>
                <div className="space-y-3 text-sm">
                  {metrics.overdue_tasks > 0 && (
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                      <p className="text-blue-800 dark:text-blue-200">
                        Tienes {metrics.overdue_tasks} tarea{metrics.overdue_tasks > 1 ? 's' : ''} vencida{metrics.overdue_tasks > 1 ? 's' : ''}. 
                        Considera revisar las fechas límite o reasignar prioridades.
                      </p>
                    </div>
                  )}
                  {metrics.completion_rate < 60 && (
                    <div className="flex items-start space-x-2">
                      <TrendingUp className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <p className="text-blue-800 dark:text-blue-200">
                        La tasa de finalización es baja ({metrics.completion_rate}%). 
                        Considera dividir tareas grandes en subtareas más manejables.
                      </p>
                    </div>
                  )}
                  {metrics.avg_cycle_time > 7 && (
                    <div className="flex items-start space-x-2">
                      <Clock className="h-4 w-4 text-purple-500 mt-0.5" />
                      <p className="text-blue-800 dark:text-blue-200">
                        El tiempo promedio de finalización es alto ({metrics.avg_cycle_time.toFixed(1)} días). 
                        Revisa si hay cuellos de botella en el proceso.
                      </p>
                    </div>
                  )}
                  {metrics.completion_rate > 80 && metrics.overdue_tasks === 0 && (
                    <div className="flex items-start space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <p className="text-blue-800 dark:text-blue-200">
                        ¡Excelente trabajo! El board tiene un rendimiento muy bueno. 
                        Mantén este ritmo y considera aumentar la carga de trabajo si es posible.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KanbanMetrics;
