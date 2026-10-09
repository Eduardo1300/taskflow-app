<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useTaskStore } from '@/stores/tasks';
import { api } from '@/services/api';
import { 
  Target, TrendingUp, Calendar, Plus, Edit, Trash2, Award, Zap, 
  ChevronDown, ChevronUp, X, AlertTriangle
} from 'lucide-vue-next';

const authStore = useAuthStore();
const taskStore = useTaskStore();

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

const props = defineProps<{
  tasks: any[];
  className?: string;
}>();

const goals = ref<Goal[]>([]);
const isModalOpen = ref(false);
const editingGoal = ref<Goal | null>(null);
const isCollapsed = ref(false);
const goalToDelete = ref<Goal | null>(null);

const newGoal = ref<Partial<Goal>>({
  title: '',
  description: '',
  target: 0,
  type: 'daily',
  category: 'tasks'
});

async function loadGoals() {
  if (!authStore.user?.id) return;
  
  try {
    const data = await api.getGoals();
    console.log('Goals loaded from API:', data);
    
    if (data && data.length > 0) {
      const seen = new Set<string>();
      const uniqueGoals = data.filter((g: any) => {
        const key = `${g.title}-${g.type}-${g.category}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      
      goals.value = uniqueGoals.map((g: any) => ({
        ...g,
        startDate: g.start_date ? new Date(g.start_date) : new Date(),
        endDate: g.end_date ? new Date(g.end_date) : new Date()
      })) as Goal[];
    } else {
      await createDefaultGoals();
    }
  } catch (error) {
    console.error('Error loading goals:', error);
  }
}

async function createDefaultGoals() {
  if (!authStore.user?.id) return;
  
  const defaultGoals = [
    {
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
      await api.createGoal(goal);
    }
    await loadGoals();
  } catch (error) {
    console.error('Error creating default goals:', error);
  }
}

function updateGoalProgress() {
  goals.value = goals.value.map(goal => {
    let current = 0;
    const now = new Date();

    if (goal.category === 'tasks') {
      current = props.tasks.filter((task: any) => task.completed).length;
    } else if (goal.category === 'productivity') {
      if (goal.type === 'weekly') {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const weekTasks = props.tasks.filter((task: any) => {
          const createdDate = new Date(task.created_at);
          return createdDate >= weekStart;
        });
        
        const completedWeekTasks = weekTasks.filter((task: any) => task.completed);
        current = weekTasks.length > 0 ? Math.round((completedWeekTasks.length / weekTasks.length) * 100) : 0;
      } else if (goal.type === 'daily') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todayTasks = props.tasks.filter((task: any) => {
          const createdDate = new Date(task.created_at);
          return createdDate >= today && createdDate < tomorrow;
        });
        
        const completedTodayTasks = todayTasks.filter((task: any) => task.completed);
        current = todayTasks.length > 0 ? Math.round((completedTodayTasks.length / todayTasks.length) * 100) : 0;
      } else if (goal.type === 'monthly') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const monthTasks = props.tasks.filter((task: any) => {
          const createdDate = new Date(task.created_at);
          return createdDate >= monthStart;
        });
        
        const completedMonthTasks = monthTasks.filter((task: any) => task.completed);
        current = monthTasks.length > 0 ? Math.round((completedMonthTasks.length / monthTasks.length) * 100) : 0;
      }
    } else if (goal.category === 'custom') {
      if (goal.type === 'daily') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        current = props.tasks.filter((task: any) => {
          if (!task.completed) return false;
          const createdDate = new Date(task.created_at);
          return createdDate >= today && createdDate < tomorrow;
        }).length;
      } else if (goal.type === 'weekly') {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        current = props.tasks.filter((task: any) => {
          if (!task.completed) return false;
          const createdDate = new Date(task.created_at);
          return createdDate >= weekStart;
        }).length;
      } else if (goal.type === 'monthly') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        current = props.tasks.filter((task: any) => {
          if (!task.completed) return false;
          const createdDate = new Date(task.created_at);
          return createdDate >= monthStart;
        }).length;
      }
    }

    const completed = current >= goal.target;
    
    // Update in background
    api.updateGoal(goal.id, { current, completed } as any).catch(err => 
      console.error('Error updating goal progress:', err)
    );
    
    return { ...goal, current, completed };
  });
}

watch(() => [props.tasks, goals.value.length], () => {
  if (goals.value.length > 0) {
    updateGoalProgress();
  }
}, { deep: true });

watch(() => editingGoal.value, () => {
  if (editingGoal.value) {
    newGoal.value = {
      id: editingGoal.value.id,
      title: editingGoal.value.title,
      description: editingGoal.value.description,
      target: editingGoal.value.target,
      type: editingGoal.value.type,
      category: editingGoal.value.category
    };
  } else {
    newGoal.value = { title: '', description: '', target: 0, type: 'daily', category: 'tasks' };
  }
}, { immediate: true });

onMounted(() => {
  if (authStore.user?.id) {
    loadGoals();
  }
});

async function addGoal() {
  console.log('addGoal called', { title: newGoal.value.title, target: newGoal.value.target });
  
  if (!newGoal.value.title || newGoal.value.target === undefined || newGoal.value.target === null || newGoal.value.target <= 0) {
    alert('Por favor completa el título y una meta mayor a 0');
    return;
  }

  if (editingGoal.value) {
    const updatedGoals = goals.value.map(g => 
      g.id === editingGoal.value!.id 
        ? { ...g, title: newGoal.value.title!, description: newGoal.value.description!, target: newGoal.value.target!, type: (newGoal.value.type || 'daily') as any, category: (newGoal.value.category || 'tasks') as any }
        : g
    ) as Goal[];
    
    goals.value = updatedGoals;
    
    if (editingGoal.value?.id) {
      try {
        await api.updateGoal(editingGoal.value.id, newGoal.value as any);
      } catch (error) {
        console.error('Error updating goal:', error);
      }
    }
    
    isModalOpen.value = false;
    editingGoal.value = null;
    newGoal.value = { title: '', description: '', target: 0, type: 'daily', category: 'tasks' };
  } else {
    const newGoalObj: Goal = {
      id: Date.now().toString(),
      title: newGoal.value.title || '',
      description: newGoal.value.description || '',
      target: Number(newGoal.value.target) || 0,
      type: (newGoal.value.type || 'daily') as 'daily' | 'weekly' | 'monthly',
      category: (newGoal.value.category || 'tasks') as 'tasks' | 'productivity' | 'custom',
      current: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + (newGoal.value.type === 'daily' ? 24 * 60 * 60 * 1000 : 
                                     newGoal.value.type === 'weekly' ? 7 * 24 * 60 * 60 * 1000 :
                                     30 * 24 * 60 * 60 * 1000)),
      completed: false
    };

    try {
      const { startDate, endDate, id, ...goalData } = newGoalObj;
      const payload = {
        title: goalData.title,
        description: goalData.description,
        target: goalData.target,
        current: 0,
        type: goalData.type,
        category: goalData.category,
        completed: false,
        start_date: startDate instanceof Date ? startDate.toISOString() : startDate,
        end_date: endDate instanceof Date ? endDate.toISOString() : endDate
      };
      console.log('Creating goal with payload:', payload);
      const response = await api.createGoal(payload);
      console.log('Goal created response:', response);
      await loadGoals();
      isModalOpen.value = false;
      editingGoal.value = null;
      newGoal.value = { title: '', description: '', target: 0, type: 'daily', category: 'tasks' };
    } catch (error: any) {
      console.error('Error creating goal:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      alert('Error al crear el objetivo: ' + (error.response?.data?.message || error.message || 'Error desconocido'));
    }
  }
}

function deleteGoal(goalId: string) {
  const goal = goals.value.find(g => g.id === goalId);
  if (goal) goalToDelete.value = goal;
}

async function confirmDeleteGoal() {
  if (!goalToDelete.value) return;
  
  goals.value = goals.value.filter(g => g.id !== goalToDelete.value!.id);
  
  try {
    await api.deleteGoal(goalToDelete.value.id);
  } catch (error) {
    console.error('Error deleting goal:', error);
  }
  goalToDelete.value = null;
}

const completedGoals = computed(() => goals.value.filter(g => g.completed));

function getProgressColor(percentage: number, completed: boolean) {
  if (completed) return 'from-green-500 to-green-600';
  if (percentage >= 80) return 'from-blue-500 to-blue-600';
  if (percentage >= 50) return 'from-yellow-500 to-yellow-600';
  return 'from-gray-400 to-gray-500';
}

function getTypeIcon(type: Goal['type']) {
  switch (type) {
    case 'daily': return Calendar;
    case 'weekly': return TrendingUp;
    case 'monthly': return Target;
  }
}

function getTypeLabel(type: Goal['type']) {
  switch (type) {
    case 'daily': return 'Diario';
    case 'weekly': return 'Semanal';
    case 'monthly': return 'Mensual';
  }
}
</script>

<template>
  <div :class="['bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg', props.className]">
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <button 
          @click="isCollapsed = !isCollapsed"
          class="flex items-center space-x-4 hover:bg-gray-100 dark:hover:bg-gray-700/50 p-3 rounded-xl transition-all flex-1 group"
        >
          <div class="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform">
            <Target class="h-6 w-6" />
          </div>
          <div class="text-left flex-1">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Objetivos y Metas</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ completedGoals.length }} de {{ goals.length }} objetivos completados</p>
          </div>
          <div :class="['p-2 rounded-xl transition-all', isCollapsed ? 'bg-gray-100 dark:bg-gray-700' : 'bg-purple-100 dark:bg-purple-900/30']">
            <ChevronDown v-if="isCollapsed" class="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <ChevronUp v-else class="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
        </button>
        
        <button
          @click="isModalOpen = true"
          class="flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ml-4"
        >
          <Plus class="h-5 w-5 mr-2" />
          Nuevo objetivo
        </button>
      </div>

      <!-- Goals List -->
      <div v-if="!isCollapsed" class="space-y-4">
        <div v-if="goals.length === 0" class="relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 text-center border border-purple-200 dark:border-purple-800">
          <div class="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-pink-200/30 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div class="relative">
            <div class="w-20 h-20 mx-auto bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-xl mb-4">
              <Target class="h-10 w-10 text-purple-500" />
            </div>
            <p class="text-gray-600 dark:text-gray-300 mb-4 font-medium">No tienes objetivos aún</p>
            <button
              @click="isModalOpen = true"
              class="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Plus class="h-5 w-5 mr-2" />
              Crear tu primer objetivo
            </button>
          </div>
        </div>

        <template v-else>
          <div v-for="goal in goals" :key="goal.id">
            <div 
              :class="[
                'relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-lg',
                goal.completed 
                  ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20' 
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-600'
              ]"
            >
              <div class="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500" :style="{ width: Math.min((goal.current / goal.target) * 100, 100) + '%' }" />
              
              <div class="p-5">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-start space-x-4 flex-1">
                    <div :class="[
                      'p-3 rounded-xl shadow-md',
                      goal.completed ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' : 'bg-gradient-to-br from-purple-500 to-pink-600 text-white'
                    ]">
                      <component :is="goal.completed ? Award : getTypeIcon(goal.type)" class="h-5 w-5" />
                    </div>
                    
                    <div class="flex-1">
                      <div class="flex items-center flex-wrap gap-2">
                        <h4 class="text-lg font-bold text-gray-900 dark:text-white">{{ goal.title }}</h4>
                        <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full">{{ getTypeLabel(goal.type) }}</span>
                        <span v-if="goal.completed" class="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full flex items-center shadow-sm">
                          <Zap class="h-3 w-3 mr-1" /> ¡Completado!
                        </span>
                      </div>
                      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1.5">{{ goal.description }}</p>
                      
                      <!-- Progress -->
                      <div class="mt-4">
                        <div class="flex items-center justify-between text-sm mb-2">
                          <span class="text-gray-500 dark:text-gray-400 font-medium">Progreso: <span class="text-gray-900 dark:text-white">{{ goal.current }}</span> / <span class="text-gray-900 dark:text-white">{{ goal.target }}</span></span>
                          <span class="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">{{ Math.round(Math.min((goal.current / goal.target) * 100, 100)) }}%</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
                          <div :class="['h-3 rounded-full bg-gradient-to-r transition-all duration-500 shadow-sm', getProgressColor(Math.min((goal.current / goal.target) * 100, 100), goal.completed)]" :style="{ width: Math.min((goal.current / goal.target) * 100, 100) + '%' }" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-2 ml-4">
                    <button
                      @click="() => { editingGoal = goal; isModalOpen = true; }"
                      class="p-2.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all"
                    >
                      <Edit class="h-5 w-5" />
                    </button>
                    <button
                      @click="() => deleteGoal(goal.id)"
                      class="p-2.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                    >
                      <Trash2 class="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
        <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white">
              <Target class="h-5 w-5" />
            </div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ editingGoal ? 'Editar Objetivo' : 'Nuevo Objetivo' }}</h3>
          </div>
          <button
            @click="() => { isModalOpen = false; editingGoal = null; }"
            class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        
        <div class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Título</label>
            <input
              type="text"
              v-model="newGoal.title"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              placeholder="Ej: Completar 10 tareas esta semana"
            />
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
            <textarea
              v-model="newGoal.description"
              rows="3"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all resize-none"
              placeholder="Describe tu objetivo..."
            />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Meta</label>
              <input
                type="number"
                v-model.number="newGoal.target"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo</label>
              <select
                v-model="newGoal.type"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categoría</label>
            <select
              v-model="newGoal.category"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="tasks">Tareas</option>
              <option value="productivity">Productividad</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click="() => { isModalOpen = false; editingGoal = null; newGoal = { title: '', description: '', target: 0, type: 'daily', category: 'tasks' }; }"
            class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="addGoal"
            :disabled="!newGoal.title || !newGoal.target || newGoal.target <= 0"
            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {{ editingGoal ? 'Guardar cambios' : 'Crear objetivo' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="goalToDelete" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div class="text-center">
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle class="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Eliminar Objetivo</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">¿Estás seguro de eliminar "{{ goalToDelete.title }}"? Esta acción no se puede deshacer.</p>
          <div class="flex gap-3">
            <button
              @click="goalToDelete = null"
              class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="confirmDeleteGoal"
              class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>