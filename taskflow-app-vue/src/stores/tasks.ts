import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import type { Task, Category, TaskStats } from '@/types';

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([]);
  const categories = ref<Category[]>([]);
  const stats = ref<TaskStats>({ total: 0, completed: 0, pending: 0, highPriority: 0 });
  const loading = ref(false);
  const error = ref<string | null>(null);
  const searchQuery = ref('');

  const pendingTasks = computed(() => tasks.value.filter(t => !t.completed));
  const completedTasks = computed(() => tasks.value.filter(t => t.completed));
  const highPriorityTasks = computed(() => tasks.value.filter(t => t.priority === 'high' && !t.completed));

  const filteredTasks = computed(() => {
    if (!searchQuery.value) return tasks.value;
    const q = searchQuery.value.toLowerCase();
    return tasks.value.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
    );
  });

  async function fetchTasks() {
    loading.value = true;
    error.value = null;
    try {
      tasks.value = await api.getTasks();
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Error al cargar tareas';
    } finally {
      loading.value = false;
    }
  }

  async function fetchStats() {
    try {
      stats.value = await api.getTaskStats();
    } catch {
      // ignore
    }
  }

  async function fetchCategories() {
    try {
      categories.value = await api.getCategories();
    } catch {
      // ignore
    }
  }

  async function createTask(task: Partial<Task>) {
    loading.value = true;
    try {
      const newTask = await api.createTask(task);
      tasks.value.unshift(newTask);
      await fetchStats();
      return newTask;
    } finally {
      loading.value = false;
    }
  }

  async function updateTask(id: number, task: Partial<Task>) {
    loading.value = true;
    try {
      const updated = await api.updateTask(id, task);
      const index = tasks.value.findIndex(t => t.id === id);
      if (index !== -1) {
        tasks.value[index] = updated;
      }
      await fetchStats();
      return updated;
    } finally {
      loading.value = false;
    }
  }

  async function toggleTask(id: number) {
    const task = tasks.value.find(t => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    try {
      const updated = await api.toggleTask(id);
      const index = tasks.value.findIndex(t => t.id === id);
      if (index !== -1) {
        tasks.value[index] = updated;
      }
      await fetchStats();
    } catch {
      task.completed = !task.completed;
    }
  }

  async function toggleFavorite(id: number) {
    const task = tasks.value.find(t => t.id === id);
    if (!task) return;
    task.favorite = !task.favorite;
    try {
      await api.toggleFavorite(id);
    } catch {
      task.favorite = !task.favorite;
    }
  }

  async function deleteTask(id: number) {
    const index = tasks.value.findIndex(t => t.id === id);
    if (index === -1) return;
    const removed = tasks.value[index];
    tasks.value.splice(index, 1);
    try {
      await api.deleteTask(id);
      await fetchStats();
    } catch {
      tasks.value.splice(index, 0, removed);
    }
  }

  async function createCategory(category: Partial<Category>) {
    const newCategory = await api.createCategory(category);
    categories.value.push(newCategory);
    return newCategory;
  }

  async function deleteCategory(id: number) {
    await api.deleteCategory(id);
    categories.value = categories.value.filter(c => c.id !== id);
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query;
  }

  return {
    tasks,
    categories,
    stats,
    loading,
    error,
    searchQuery,
    pendingTasks,
    completedTasks,
    highPriorityTasks,
    filteredTasks,
    fetchTasks,
    fetchStats,
    fetchCategories,
    createTask,
    updateTask,
    toggleTask,
    toggleFavorite,
    deleteTask,
    createCategory,
    deleteCategory,
    setSearchQuery
  };
});