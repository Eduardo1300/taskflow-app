import axios, { AxiosInstance, AxiosError } from 'axios';

// Determine API URL based on environment
const getApiUrl = (): string => {
  // Use environment variable if explicitly set
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }

  // Fallback for development
  return 'http://localhost:3000/api';
};

const API_URL = getApiUrl();

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

  async getProfile() {
    const { data } = await this.client.get('/auth/me');
    return data;
  }

  async logout() {
    this.clearToken();
  }

  // Tasks
  async getTasks() {
    const { data } = await this.client.get('/tasks');
    return data.data;
  }

  async getTask(id: number) {
    const { data } = await this.client.get(`/tasks/${id}`);
    return data.data;
  }

  async createTask(task: any) {
    const { data } = await this.client.post('/tasks', task);
    return data.data;
  }

  async updateTask(id: number, task: any) {
    const { data } = await this.client.put(`/tasks/${id}`, task);
    return data.data;
  }

  async toggleTask(id: number) {
    const { data } = await this.client.put(`/tasks/${id}/toggle`);
    return data.data;
  }

  async toggleFavorite(id: number) {
    const { data } = await this.client.put(`/tasks/${id}/favorite`);
    return data.data;
  }

  async deleteTask(id: number) {
    const { data } = await this.client.delete(`/tasks/${id}`);
    return data.success;
  }

  async getTaskStats() {
    const { data } = await this.client.get('/tasks/stats');
    return data.data;
  }

  async searchTasks(query: string) {
    const { data } = await this.client.get(`/tasks/search?q=${encodeURIComponent(query)}`);
    return data.data;
  }

  // Categories
  async getCategories() {
    const { data } = await this.client.get('/categories');
    return data.data;
  }

  async createCategory(category: any) {
    const { data } = await this.client.post('/categories', category);
    return data.data;
  }

  async deleteCategory(id: number) {
    const { data } = await this.client.delete(`/categories/${id}`);
    return data.success;
  }

  async updateCategory(id: number, category: any) {
    const { data } = await this.client.put(`/categories/${id}`, category);
    return data.data;
  }

  // Goals
  async getGoals() {
    const { data } = await this.client.get('/goals');
    return data.data;
  }

  async createGoal(goal: any) {
    const { data } = await this.client.post('/goals', goal);
    return data.data;
  }

  async updateGoal(id: string, goal: any) {
    const { data } = await this.client.put(`/goals/${id}`, goal);
    return data.data;
  }

  async deleteGoal(id: string) {
    const { data } = await this.client.delete(`/goals/${id}`);
    return data.success;
  }

  // Collaborations
  async inviteCollaborator(taskId: number, email: string, permission: string) {
    const { data } = await this.client.post('/collaborations/invite', { taskId, email, permission });
    return data.data;
  }

  async getCollaborators(taskId: number) {
    const { data } = await this.client.get(`/collaborations/task/${taskId}/collaborators`);
    return data.data;
  }

  async removeCollaborator(taskId: number, userId: string) {
    const { data } = await this.client.delete(`/collaborations/task/${taskId}/collaborator/${userId}`);
    return data.success;
  }

  async getTaskActivity(taskId: number) {
    const { data } = await this.client.get(`/collaborations/task/${taskId}/activity`);
    return data.data;
  }

  // Notifications
  async getNotifications() {
    const { data } = await this.client.get('/notifications');
    return data.data;
  }

  async markNotificationRead(id: string) {
    const { data } = await this.client.put(`/notifications/${id}/read`);
    return data.success;
  }

  async deleteNotification(id: string) {
    const { data } = await this.client.delete(`/notifications/${id}`);
    return data.success;
  }

  // Integrations
  async getIntegrations() {
    const { data } = await this.client.get('/integrations');
    return data.data;
  }

  async createIntegration(integration: any) {
    const { data } = await this.client.post('/integrations', integration);
    return data.data;
  }

  async updateIntegration(id: string, integration: any) {
    const { data } = await this.client.put(`/integrations/${id}`, integration);
    return data.data;
  }

  async deleteIntegration(id: string) {
    const { data } = await this.client.delete(`/integrations/${id}`);
    return data.success;
  }

  // Webhooks
  async getWebhooks() {
    const { data } = await this.client.get('/webhooks');
    return data.data;
  }

  async createWebhook(webhook: any) {
    const { data } = await this.client.post('/webhooks', webhook);
    return data.data;
  }

  async deleteWebhook(id: string) {
    const { data } = await this.client.delete(`/webhooks/${id}`);
    return data.success;
  }
}

export const api = new ApiClient();
export default api;
