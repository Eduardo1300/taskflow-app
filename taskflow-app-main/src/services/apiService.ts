import api from '../lib/api';
import { Task } from '../types';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  user_id: string;
  permissions: ('read' | 'write' | 'delete')[];
  created_at: string;
  last_used_at?: string;
  is_active: boolean;
  rate_limit: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    rate_limit?: {
      remaining: number;
      reset_time: string;
    };
  };
}

export interface WebhookConfig {
  id: string;
  user_id: string;
  url: string;
  events: ('task.created' | 'task.updated' | 'task.deleted' | 'task.completed')[];
  secret: string;
  is_active: boolean;
  created_at: string;
}

class ApiService {
  private apiKeys: Map<string, ApiKey[]> = new Map();

  generateApiKey(): string {
    return 'tf_' + crypto.randomUUID().replace(/-/g, '');
  }

  async createApiKey(name: string, permissions: ('read' | 'write' | 'delete')[], rateLimitPerMinute: number = 60): Promise<ApiResponse<ApiKey>> {
    try {
      const newKey: ApiKey = {
        id: crypto.randomUUID(),
        name,
        key: this.generateApiKey(),
        user_id: '',
        permissions,
        created_at: new Date().toISOString(),
        is_active: true,
        rate_limit: rateLimitPerMinute
      };
      return { success: true, data: newKey };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getApiKeys(): Promise<ApiResponse<ApiKey[]>> {
    try {
      return { success: true, data: [] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteApiKey(keyId: string): Promise<ApiResponse<void>> {
    try {
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async toggleApiKey(keyId: string): Promise<ApiResponse<ApiKey>> {
    try {
      return { success: true, data: {} as ApiKey };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async createWebhook(url: string, events: string[]): Promise<ApiResponse<WebhookConfig>> {
    try {
      const webhook = await api.createWebhook({ url, events, is_active: true });
      return { success: true, data: webhook };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getWebhooks(): Promise<ApiResponse<WebhookConfig[]>> {
    try {
      const webhooks = await api.getWebhooks();
      return { success: true, data: webhooks };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteWebhook(webhookId: string): Promise<ApiResponse<void>> {
    try {
      await api.deleteWebhook(webhookId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async testWebhook(webhookId: string): Promise<ApiResponse<void>> {
    return { success: true };
  }

  async getApiUsage(): Promise<ApiResponse<any>> {
    return { success: true, data: { requests: 0, limit: 1000 } };
  }

  async getUserApiKeys(): Promise<ApiResponse<ApiKey[]>> {
    return this.getApiKeys();
  }

  async getUserWebhooks(): Promise<ApiResponse<WebhookConfig[]>> {
    return this.getWebhooks();
  }

  async revokeApiKey(keyId: string): Promise<ApiResponse<void>> {
    return this.deleteApiKey(keyId);
  }
}

export const apiService = new ApiService();
