import axios, { AxiosInstance, AxiosError } from 'axios';
import type { User, Task, Category, Goal, Notification, TaskStats } from '@/types';

const API_URL = 'https://taskflow-app-e1rm.onrender.com/api';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Auth
  async register(email: string, password: string, fullName?: string) {
    const { data } = await this.client.post('/auth/register', { email, password, fullName });
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async login(email: string, password: string) {
    const { data } = await this.client.post('/auth/login', { email, password });
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async getProfile(): Promise<User> {
    const { data } = await this.client.get('/auth/me');
    return data;
  }

  async updateProfile(profile: Partial<User>) {
    const { data } = await this.client.put('/profiles/me', profile);
    return data.data;
  }

  async logout() {
    this.clearToken();
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    const { data } = await this.client.get('/tasks');
    return data.data;
  }

  async getTask(id: number): Promise<Task> {
    const { data } = await this.client.get(`/tasks/${id}`);
    return data.data;
  }

  async createTask(task: Partial<Task>): Promise<Task> {
    const { data } = await this.client.post('/tasks', task);
    return data.data;
  }

  async updateTask(id: number, task: Partial<Task>): Promise<Task> {
    const { data } = await this.client.put(`/tasks/${id}`, task);
    return data.data;
  }

  async toggleTask(id: number): Promise<Task> {
    const { data } = await this.client.put(`/tasks/${id}/toggle`);
    return data.data;
  }

  async toggleFavorite(id: number): Promise<Task> {
    const { data } = await this.client.put(`/tasks/${id}/favorite`);
    return data.data;
  }

  async deleteTask(id: number): Promise<boolean> {
    const { data } = await this.client.delete(`/tasks/${id}`);
    return data.success;
  }

  async getTaskStats(): Promise<TaskStats> {
    const { data } = await this.client.get('/tasks/stats');
    return data.data;
  }

  async searchTasks(query: string): Promise<Task[]> {
    const { data } = await this.client.get(`/tasks/search?q=${encodeURIComponent(query)}`);
    return data.data;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const { data } = await this.client.get('/categories');
    return data.data;
  }

  async createCategory(category: Partial<Category>): Promise<Category> {
    const { data } = await this.client.post('/categories', category);
    return data.data;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const { data } = await this.client.delete(`/categories/${id}`);
    return data.success;
  }

  // Goals
  async getGoals(): Promise<Goal[]> {
    const { data } = await this.client.get('/goals');
    return data.data;
  }

  async createGoal(goal: Partial<Goal>): Promise<Goal> {
    const { data } = await this.client.post('/goals', goal);
    return data.data;
  }

  async updateGoal(id: string, goal: Partial<Goal>): Promise<Goal> {
    const { data } = await this.client.put(`/goals/${id}`, goal);
    return data.data;
  }

  async deleteGoal(id: string): Promise<boolean> {
    const { data } = await this.client.delete(`/goals/${id}`);
    return data.success;
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    const { data } = await this.client.get('/notifications');
    return data.data;
  }

  async markNotificationRead(id: string): Promise<boolean> {
    const { data } = await this.client.put(`/notifications/${id}/read`);
    return data.success;
  }
}

export const api = new ApiClient();
export default api;