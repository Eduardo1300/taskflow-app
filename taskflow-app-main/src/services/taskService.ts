import api from '../lib/api';
import { Task, TaskInsert, TaskUpdate } from '../types/database';

export class TaskService {
  static async getTasks(): Promise<{ data: Task[] | null; error: string | null }> {
    try {
      const tasks = await api.getTasks();
      return { data: tasks, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Error al obtener tareas' };
    }
  }

  static async createTask(taskData: Omit<TaskInsert, 'user_id'>): Promise<{ data: Task | null; error: string | null }> {
    try {
      const task = await api.createTask(taskData);
      return { data: task, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Error al crear tarea' };
    }
  }

  static async updateTask(id: number, updates: TaskUpdate): Promise<{ data: Task | null; error: string | null }> {
    try {
      const task = await api.updateTask(id, updates);
      return { data: task, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Error al actualizar tarea' };
    }
  }

  static async toggleTaskCompletion(id: number, completed: boolean): Promise<{ data: Task | null; error: string | null }> {
    try {
      const task = await api.toggleTask(id);
      return { data: task, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Error al cambiar estado de tarea' };
    }
  }

  static async toggleFavorite(id: number): Promise<{ data: Task | null; error: string | null }> {
    try {
      const task = await api.toggleFavorite(id);
      return { data: task, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Error al cambiar favorite' };
    }
  }

  static async deleteTask(id: number): Promise<{ error: string | null }> {
    try {
      await api.deleteTask(id);
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Error al eliminar tarea' };
    }
  }

  static async getTaskStats(): Promise<{ 
    data: { total: number; completed: number; pending: number } | null; 
    error: string | null 
  }> {
    try {
      const stats = await api.getTaskStats();
      return { data: stats, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Error al obtener estadísticas' };
    }
  }

  static async searchTasks(query: string): Promise<{ data: Task[] | null; error: string | null }> {
    try {
      const tasks = await api.searchTasks(query);
      return { data: tasks, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Error al buscar tareas' };
    }
  }

  static async getTasksByStatus(completed: boolean): Promise<{ data: Task[] | null; error: string | null }> {
    try {
      const tasks = await api.getTasks();
      const filtered = tasks.filter((t: Task) => t.completed === completed);
      return { data: filtered, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Error al filtrar tareas' };
    }
  }
}
