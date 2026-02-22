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
  ChevronUp,
  X,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { GoalsService } from '../../services/goalsService';

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
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    description: '',
    target: 0,
    type: 'daily',
    category: 'tasks'
  });

  useEffect(() => {
    if (user?.id) {
      // Limpiar localStorage al cargar para evitar duplicados
      localStorage.removeItem('taskflow-goals');
      loadGoals();
    }
  }, [user?.id]);

  useEffect(() => {
    if (goals.length > 0) {
      updateGoalProgress();
    }
  }, [tasks, goals.length]);

  // Cargar datos del objetivo cuando se abre para editar
  useEffect(() => {
    if (editingGoal) {
      setNewGoal({
        id: editingGoal.id,
        title: editingGoal.title,
        description: editingGoal.description,
        target: editingGoal.target,
        type: editingGoal.type,
        category: editingGoal.category
      });
    } else {
      setNewGoal({
        title: '',
        description: '',
        target: 0,
        type: 'daily',
        category: 'tasks'
      });
    }
  }, [editingGoal]);

  const loadGoals = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await GoalsService.getGoals(user.id);
      if (error) {
        console.error('Error loading goals:', error);
        return;
      }
      
      if (data && data.length > 0) {
        // Eliminar duplicados basados en el título
        const seen = new Set<string>();
        const uniqueGoals = data.filter(g => {
          const key = `${g.title}-${g.type}-${g.category}`;
          if (seen.has(key)) {
            // Es un duplicado, eliminar de Supabase
            if (g.id) {
              GoalsService.deleteGoal(g.id).catch(err => 
                console.error('Error deleting duplicate goal:', err)
              );
            }
            return false;
          }
          seen.add(key);
          return true;
        });
        
        const formattedGoals = uniqueGoals.map(g => ({
          ...g,
          startDate: g.start_date ? new Date(g.start_date) : new Date(),
          endDate: g.end_date ? new Date(g.end_date) : new Date()
        })) as Goal[];
        
        console.log(`📊 Loaded ${formattedGoals.length} unique goals (removed ${data.length - formattedGoals.length} duplicates)`);
        setGoals(formattedGoals);
      } else {
        // Si no hay objetivos, crear los predeterminados
        await createDefaultGoals();
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const createDefaultGoals = async () => {
    if (!user?.id) return;
    
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
    
    try {
      for (const goal of defaultGoals) {
        await GoalsService.createGoal(goal);
      }
      await loadGoals();
    } catch (error) {
      console.error('Error creating default goals:', error);
    }
  };

  const updateGoalProgress = () => {
    console.log('📊 GoalsSystem - updateGoalProgress called with tasks:', tasks.length);
    console.log('📊 GoalsSystem - Completed tasks:', tasks.filter(t => t.completed).length);
    
    setGoals(prevGoals => {
      const updatedGoals = prevGoals.map(goal => {
        let current = 0;
        const now = new Date();

        switch (goal.category) {
          case 'tasks':
            if (goal.type === 'daily') {
              // Tareas completadas (sin importar cuándo se crearon)
              // Contar todas las tareas completadas
              current = tasks.filter(task => task.completed).length;
              console.log('📊 Daily tasks goal - Completed tasks:', current, '/', goal.target);
            } else if (goal.type === 'weekly') {
              // Tareas completadas (sin importar cuándo se crearon)
              current = tasks.filter(task => task.completed).length;
              console.log('📊 Weekly tasks goal - Completed tasks:', current, '/', goal.target);
            } else if (goal.type === 'monthly') {
              // Tareas completadas (sin importar cuándo se crearon)
              current = tasks.filter(task => task.completed).length;
              console.log('📊 Monthly tasks goal - Completed tasks:', current, '/', goal.target);
            }
            break;

          case 'productivity':
            if (goal.type === 'weekly') {
              // Calcular productividad de la semana
              const weekStart = new Date(now);
              weekStart.setDate(now.getDate() - now.getDay());
              weekStart.setHours(0, 0, 0, 0);
              
              const weekTasks = tasks.filter(task => {
                const createdDate = new Date(task.created_at);
                return createdDate >= weekStart;
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
                return createdDate >= today && createdDate < tomorrow;
              });
              
              const completedTodayTasks = todayTasks.filter(task => task.completed);
              current = todayTasks.length > 0 ? Math.round((completedTodayTasks.length / todayTasks.length) * 100) : 0;
            } else if (goal.type === 'monthly') {
              // Productividad mensual
              const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
              
              const monthTasks = tasks.filter(task => {
                const createdDate = new Date(task.created_at);
                return createdDate >= monthStart;
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
                return createdDate >= today && createdDate < tomorrow;
              }).length;
            } else if (goal.type === 'weekly') {
              const weekStart = new Date(now);
              weekStart.setDate(now.getDate() - now.getDay());
              weekStart.setHours(0, 0, 0, 0);
              
              current = tasks.filter(task => {
                if (!task.completed) return false;
                const createdDate = new Date(task.created_at);
                return createdDate >= weekStart;
              }).length;
            } else if (goal.type === 'monthly') {
              const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
              
              current = tasks.filter(task => {
                if (!task.completed) return false;
                const createdDate = new Date(task.created_at);
                return createdDate >= monthStart;
              }).length;
            }
            break;
        }

        const completed = current >= goal.target;
        
        console.log(`📊 Goal: ${goal.title}, Current: ${current}, Target: ${goal.target}, Completed: ${completed}`);
        
        return {
          ...goal,
          current,
          completed
        };
      });

      // Retornar los objetivos actualizados
      return updatedGoals;
    });

    // Actualizar en Supabase de forma asincrónica (sin bloquear setState)
    if (user?.id) {
      setGoals(prevGoals => {
        // Enviar actualizaciones a Supabase en segundo plano
        prevGoals.forEach(goal => {
          GoalsService.updateGoal(goal.id!, {
            current: goal.current,
            completed: goal.completed
          } as any).catch(error => {
            console.error('Error updating goal progress:', error);
          });
        });
        
        return prevGoals;
      });
    }
  };

  const addGoal = async () => {
    if (!newGoal.title || !newGoal.target) {
      alert('Por favor completa el título y la meta');
      return;
    }

    if (editingGoal) {
      // Actualizar objetivo existente
      const updatedGoals = goals.map(g => 
        g.id === editingGoal.id 
          ? {
              ...g,
              title: newGoal.title!,
              description: newGoal.description!,
              target: newGoal.target!,
              type: (newGoal.type || 'daily') as 'daily' | 'weekly' | 'monthly',
              category: (newGoal.category || 'tasks') as 'tasks' | 'productivity' | 'custom'
            }
          : g
      ) as Goal[];
      
      setGoals(updatedGoals);
      
      // Actualizar en Supabase
      if (editingGoal?.id && user?.id) {
        try {
          await GoalsService.updateGoal(editingGoal.id, newGoal as any);
        } catch (error) {
          console.error('Error updating goal:', error);
        }
      }
      console.log('✏️ Objetivo actualizado:', newGoal.title);
    } else {
      // Crear nuevo objetivo
      const newGoalObj: Goal = {
        id: Date.now().toString(),
        title: newGoal.title || '',
        description: newGoal.description || '',
        target: newGoal.target || 0,
        type: (newGoal.type || 'daily') as 'daily' | 'weekly' | 'monthly',
        category: (newGoal.category || 'tasks') as 'tasks' | 'productivity' | 'custom',
        current: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + (newGoal.type === 'daily' ? 24 * 60 * 60 * 1000 : 
                                       newGoal.type === 'weekly' ? 7 * 24 * 60 * 60 * 1000 :
                                       30 * 24 * 60 * 60 * 1000)),
        completed: false
      };

      setGoals(prev => [...prev, newGoalObj]);
      
      // Guardar en Supabase
      if (user?.id) {
        try {
          await GoalsService.createGoal(newGoalObj);
        } catch (error) {
          console.error('Error creating goal:', error);
        }
      }
      console.log('➕ Nuevo objetivo creado:', newGoal.title);
    }

    setIsModalOpen(false);
    setEditingGoal(null);
    setNewGoal({ title: '', description: '', target: 0, type: 'daily', category: 'tasks' });
  };

  const deleteGoal = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      setGoalToDelete(goal);
    }
  };

  const confirmDeleteGoal = async () => {
    if (!goalToDelete) return;
    
    setGoals(prev => prev.filter(g => g.id !== goalToDelete.id));
    
    try {
      await GoalsService.deleteGoal(goalToDelete.id);
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
    setGoalToDelete(null);
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
    <div className={`bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center space-x-4 hover:bg-gray-100 dark:hover:bg-gray-700/50 p-3 rounded-xl transition-all flex-1 group"
          >
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform">
              <Target className="h-6 w-6" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Objetivos y Metas
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {completedGoals.length} de {goals.length} objetivos completados
              </p>
            </div>
            <div className={`p-2 rounded-xl transition-all ${isCollapsed ? 'bg-gray-100 dark:bg-gray-700' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
              {isCollapsed ? (
                <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              )}
            </div>
          </button>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ml-4"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo objetivo
          </button>
        </div>

        {/* Goals List */}
        {!isCollapsed && (
          <div className="space-y-4">
            {goals.length === 0 ? (
              <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 text-center border border-purple-200 dark:border-purple-800">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-200/30 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative">
                  <div className="w-20 h-20 mx-auto bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-xl mb-4">
                    <Target className="h-10 w-10 text-purple-500" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 font-medium">No tienes objetivos aún</p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Crear tu primer objetivo
                  </button>
                </div>
              </div>
            ) : (
              goals.map(goal => {
                const percentage = Math.min((goal.current / goal.target) * 100, 100);
                
                return (
                  <div
                    key={goal.id}
                    className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                      goal.completed 
                        ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20' 
                        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-600'
                    }`}
                  >
                    {/* Progress bar background */}
                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500" style={{ width: `${percentage}%` }} />
                    
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`p-3 rounded-xl shadow-md ${
                            goal.completed 
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' 
                              : 'bg-gradient-to-br from-purple-500 to-pink-600 text-white'
                          }`}>
                            {goal.completed ? <Award className="h-5 w-5" /> : getTypeIcon(goal.type)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center flex-wrap gap-2">
                              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                {goal.title}
                              </h4>
                              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full">
                                {getTypeLabel(goal.type)}
                              </span>
                              {goal.completed && (
                                <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full flex items-center shadow-sm">
                                  <Zap className="h-3 w-3 mr-1" />
                                  ¡Completado!
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                              {goal.description}
                            </p>
                            
                            {/* Progress */}
                            <div className="mt-4">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">
                                  Progreso: <span className="text-gray-900 dark:text-white">{goal.current}</span> / <span className="text-gray-900 dark:text-white">{goal.target}</span>
                                </span>
                                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                                  {Math.round(percentage)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
                                <div
                                  className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(percentage, goal.completed)} transition-all duration-500 shadow-sm`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => { setEditingGoal(goal); setIsModalOpen(true); }}
                            className="p-2.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="p-2.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingGoal ? 'Editar Objetivo' : 'Nuevo Objetivo'}
                </h3>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); setEditingGoal(null); }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                  placeholder="Ej: Completar 10 tareas esta semana"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all resize-none"
                  placeholder="Describe tu objetivo..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                disabled={!newGoal.title || !newGoal.target || newGoal.target <= 0}
              >
                {editingGoal ? 'Guardar cambios' : 'Crear objetivo'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {goalToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Eliminar Objetivo
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                ¿Estás seguro de eliminar "{goalToDelete.title}"? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setGoalToDelete(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteGoal}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsSystem;
