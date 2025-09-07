import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  Plus,
  Edit,
  Trash2,
  Award,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  type: 'daily' | 'weekly' | 'monthly';
  category: 'tasks' | 'productivity' | 'custom';
  startDate: Date;
  endDate: Date;
  completed: boolean;
}

interface GoalsSystemProps {
  tasks: any[];
  className?: string;
}

const GoalsSystem: React.FC<GoalsSystemProps> = ({ tasks, className }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: 0,
    type: 'daily' as const,
    category: 'tasks' as const
  });

  useEffect(() => {
    initializeDefaultGoals();
    updateGoalProgress();
  }, [tasks]);

  const initializeDefaultGoals = () => {
    const defaultGoals: Goal[] = [
      {
        id: 'daily-tasks',
        title: 'Tareas Diarias',
        description: 'Completar tareas cada día',
        target: 5,
        current: 0,
        type: 'daily',
        category: 'tasks',
        startDate: new Date(),
        endDate: new Date(),
        completed: false
      },
      {
        id: 'weekly-productivity',
        title: 'Productividad Semanal',
        description: 'Mantener alta productividad durante la semana',
        target: 85,
        current: 0,
        type: 'weekly',
        category: 'productivity',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        completed: false
      },
      {
        id: 'monthly-goals',
        title: 'Objetivos Mensuales',
        description: 'Completar objetivos importantes del mes',
        target: 50,
        current: 0,
        type: 'monthly',
        category: 'tasks',
        startDate: new Date(),
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        completed: false
      }
    ];

    const existingGoals = localStorage.getItem('taskflow-goals');
    if (existingGoals) {
      setGoals(JSON.parse(existingGoals).map((g: any) => ({
        ...g,
        startDate: new Date(g.startDate),
        endDate: new Date(g.endDate)
      })));
    } else {
      setGoals(defaultGoals);
      localStorage.setItem('taskflow-goals', JSON.stringify(defaultGoals));
    }
  };

  const updateGoalProgress = () => {
    setGoals(prevGoals => {
      const updatedGoals = prevGoals.map(goal => {
        let current = 0;
        const now = new Date();

        switch (goal.category) {
          case 'tasks':
            if (goal.type === 'daily') {
              // Tareas completadas hoy - usar una aproximación más inteligente
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              
              current = tasks.filter(task => {
                if (!task.completed) return false;
                
                // Si la tarea fue creada y completada hoy, contarla
                const createdDate = new Date(task.created_at);
                const updatedDate = new Date(task.updated_at);
                
                // Si se creó hoy y está completada, o si se actualizó hoy y está completada
                return (createdDate >= today && createdDate < tomorrow && task.completed) ||
                       (updatedDate >= today && updatedDate < tomorrow && task.completed);
              }).length;
            } else if (goal.type === 'weekly') {
              // Tareas completadas esta semana
              const weekStart = new Date(now);
              weekStart.setDate(now.getDate() - now.getDay());
              weekStart.setHours(0, 0, 0, 0);
              
              current = tasks.filter(task => {
                if (!task.completed) return false;
                
                const createdDate = new Date(task.created_at);
                const updatedDate = new Date(task.updated_at);
                
                // Contar tareas creadas o completadas esta semana
                return (createdDate >= weekStart && task.completed) ||
                       (updatedDate >= weekStart && task.completed);
              }).length;
            } else if (goal.type === 'monthly') {
              // Tareas completadas este mes
              const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
              
              current = tasks.filter(task => {
                if (!task.completed) return false;
                
                const createdDate = new Date(task.created_at);
                const updatedDate = new Date(task.updated_at);
                
                // Contar tareas creadas o completadas este mes
                return (createdDate >= monthStart && task.completed) ||
                       (updatedDate >= monthStart && task.completed);
              }).length;
            }
            break;

          case 'productivity':
            if (goal.type === 'weekly') {
              // Calcular productividad de la semana (mejorado)
              const weekStart = new Date(now);
              weekStart.setDate(now.getDate() - now.getDay());
              weekStart.setHours(0, 0, 0, 0);
              
              // Incluir todas las tareas que están en el rango de la semana
              const weekTasks = tasks.filter(task => {
                const createdDate = new Date(task.created_at);
                const updatedDate = new Date(task.updated_at);
                
                // Incluir tareas creadas esta semana o actualizadas esta semana
                return createdDate >= weekStart || updatedDate >= weekStart;
              });
              
              const completedWeekTasks = weekTasks.filter(task => task.completed);
              current = weekTasks.length > 0 ? Math.round((completedWeekTasks.length / weekTasks.length) * 100) : 0;
            } else if (goal.type === 'daily') {
              // Productividad diaria
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              
              const todayTasks = tasks.filter(task => {
                const createdDate = new Date(task.created_at);
                const updatedDate = new Date(task.updated_at);
                
                return (createdDate >= today && createdDate < tomorrow) ||
                       (updatedDate >= today && updatedDate < tomorrow);
              });
              
              const completedTodayTasks = todayTasks.filter(task => task.completed);
              current = todayTasks.length > 0 ? Math.round((completedTodayTasks.length / todayTasks.length) * 100) : 0;
            } else if (goal.type === 'monthly') {
              // Productividad mensual
              const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
              
              const monthTasks = tasks.filter(task => {
                const createdDate = new Date(task.created_at);
                const updatedDate = new Date(task.updated_at);
                
                return createdDate >= monthStart || updatedDate >= monthStart;
              });
              
              const completedMonthTasks = monthTasks.filter(task => task.completed);
              current = monthTasks.length > 0 ? Math.round((completedMonthTasks.length / monthTasks.length) * 100) : 0;
            }
            break;

          case 'custom':
            // Para objetivos personalizados, usar la lógica de tareas por defecto
            if (goal.type === 'daily') {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              
              current = tasks.filter(task => {
                if (!task.completed) return false;
                const createdDate = new Date(task.created_at);
                const updatedDate = new Date(task.updated_at);
                
                return (createdDate >= today && createdDate < tomorrow && task.completed) ||
                       (updatedDate >= today && updatedDate < tomorrow && task.completed);
              }).length;
            } else if (goal.type === 'weekly') {
              const weekStart = new Date(now);
              weekStart.setDate(now.getDate() - now.getDay());
              weekStart.setHours(0, 0, 0, 0);
              
              current = tasks.filter(task => {
                if (!task.completed) return false;
                const createdDate = new Date(task.created_at);
                const updatedDate = new Date(task.updated_at);
                
                return (createdDate >= weekStart && task.completed) ||
                       (updatedDate >= weekStart && task.completed);
              }).length;
            } else if (goal.type === 'monthly') {
              const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
              
              current = tasks.filter(task => {
                if (!task.completed) return false;
                const createdDate = new Date(task.created_at);
                const updatedDate = new Date(task.updated_at);
                
                return (createdDate >= monthStart && task.completed) ||
                       (updatedDate >= monthStart && task.completed);
              }).length;
            }
            break;
        }

        const completed = current >= goal.target;
        
        return {
          ...goal,
          current,
          completed
        };
      });

      // Guardar en localStorage
      localStorage.setItem('taskflow-goals', JSON.stringify(updatedGoals));
      
      return updatedGoals;
    });
  };

  const addGoal = () => {
    const goal: Goal = {
      id: Date.now().toString(),
      ...newGoal,
      current: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + (newGoal.type === 'daily' ? 24 * 60 * 60 * 1000 : 
                                     newGoal.type === 'weekly' ? 7 * 24 * 60 * 60 * 1000 :
                                     30 * 24 * 60 * 60 * 1000)),
      completed: false
    };

    setGoals(prev => [...prev, goal]);
    setIsModalOpen(false);
    setNewGoal({ title: '', description: '', target: 0, type: 'daily', category: 'tasks' });
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  const getProgressColor = (percentage: number, completed: boolean) => {
    if (completed) return 'from-green-500 to-green-600';
    if (percentage >= 80) return 'from-blue-500 to-blue-600';
    if (percentage >= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-gray-400 to-gray-500';
  };

  const getTypeIcon = (type: Goal['type']) => {
    switch (type) {
      case 'daily': return <Calendar className="h-4 w-4" />;
      case 'weekly': return <TrendingUp className="h-4 w-4" />;
      case 'monthly': return <Target className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: Goal['type']) => {
    switch (type) {
      case 'daily': return 'Diario';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensual';
    }
  };

  const completedGoals = goals.filter(g => g.completed);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors flex-1"
          >
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg text-white">
              <Target className="h-5 w-5" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Objetivos y Metas
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {completedGoals.length} de {goals.length} objetivos completados
              </p>
            </div>
            {isCollapsed ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            )}
          </button>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm ml-4"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nuevo objetivo
          </button>
        </div>

        {/* Goals List */}
        {!isCollapsed && (
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No tienes objetivos aún</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-2 text-purple-600 hover:text-purple-700 text-sm"
              >
                Crear tu primer objetivo
              </button>
            </div>
          ) : (
            goals.map(goal => {
              const percentage = Math.min((goal.current / goal.target) * 100, 100);
              
              return (
                <div
                  key={goal.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    goal.completed 
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        goal.completed 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}>
                        {goal.completed ? <Award className="h-4 w-4" /> : getTypeIcon(goal.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {goal.title}
                          </h4>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                            {getTypeLabel(goal.type)}
                          </span>
                          {goal.completed && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs rounded-full flex items-center">
                              <Zap className="h-3 w-3 mr-1" />
                              ¡Completado!
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {goal.description}
                        </p>
                        
                        {/* Progress */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">
                              Progreso: {goal.current} / {goal.target}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {Math.round(percentage)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(percentage, goal.completed)} transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-4">
                      <button
                        onClick={() => {
                          setEditingGoal(goal);
                          setIsModalOpen(true);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingGoal ? 'Editar Objetivo' : 'Nuevo Objetivo'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta
                  </label>
                  <input
                    type="number"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, target: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo
                  </label>
                  <select
                    value={newGoal.type}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría
                </label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="tasks">Tareas</option>
                  <option value="productivity">Productividad</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingGoal(null);
                  setNewGoal({ title: '', description: '', target: 0, type: 'daily', category: 'tasks' });
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={addGoal}
                disabled={!newGoal.title || !newGoal.target}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {editingGoal ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsSystem;
