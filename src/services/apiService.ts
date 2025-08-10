import { supabase } from '../lib/supabase';
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
  rate_limit: number; // requests per minute
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
  // ==================== API Keys Management ====================
  
  async createApiKey(name: string, permissions: ('read' | 'write' | 'delete')[], rateLimitPerMinute: number = 60): Promise<ApiResponse<ApiKey>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Generar API key segura
      const apiKey = this.generateApiKey();
      
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          name,
          key: apiKey,
          user_id: user.id,
          permissions,
          rate_limit: rateLimitPerMinute,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Error creando API key' };
    }
  }

  async getUserApiKeys(): Promise<ApiResponse<ApiKey[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Error obteniendo API keys' };
    }
  }

  async revokeApiKey(keyId: string): Promise<ApiResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', keyId)
        .eq('user_id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error revocando API key' };
    }
  }

  // ==================== Public API Endpoints ====================

  async validateApiKey(apiKey: string): Promise<ApiResponse<ApiKey>> {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('key', apiKey)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { success: false, error: 'API key inválida' };
      }

      // Actualizar last_used_at
      await supabase
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', data.id);

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Error validando API key' };
    }
  }

  async getTasksViaApi(apiKey: string, page: number = 1, limit: number = 20, filters?: {
    status?: 'completed' | 'pending';
    category?: string;
    priority?: 'low' | 'medium' | 'high';
  }): Promise<ApiResponse<Task[]>> {
    try {
      // Validar API key
      const keyValidation = await this.validateApiKey(apiKey);
      if (!keyValidation.success || !keyValidation.data) {
        return { success: false, error: 'API key inválida' };
      }

      if (!keyValidation.data.permissions.includes('read')) {
        return { success: false, error: 'Sin permisos de lectura' };
      }

      // Construir query
      let query = supabase
        .from('tasks')
        .select('*', { count: 'exact' })
        .eq('user_id', keyValidation.data.user_id)
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters?.status) {
        query = query.eq('completed', filters.status === 'completed');
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }

      const { data, error, count } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: data || [],
        meta: {
          total: count || 0,
          page,
          limit
        }
      };
    } catch (error) {
      return { success: false, error: 'Error obteniendo tareas' };
    }
  }

  async createTaskViaApi(apiKey: string, taskData: Partial<Task>): Promise<ApiResponse<Task>> {
    try {
      // Validar API key
      const keyValidation = await this.validateApiKey(apiKey);
      if (!keyValidation.success || !keyValidation.data) {
        return { success: false, error: 'API key inválida' };
      }

      if (!keyValidation.data.permissions.includes('write')) {
        return { success: false, error: 'Sin permisos de escritura' };
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: keyValidation.data.user_id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Trigger webhook si está configurado
      await this.triggerWebhook(keyValidation.data.user_id, 'task.created', data);

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Error creando tarea' };
    }
  }

  async updateTaskViaApi(apiKey: string, taskId: number, taskData: Partial<Task>): Promise<ApiResponse<Task>> {
    try {
      // Validar API key
      const keyValidation = await this.validateApiKey(apiKey);
      if (!keyValidation.success || !keyValidation.data) {
        return { success: false, error: 'API key inválida' };
      }

      if (!keyValidation.data.permissions.includes('write')) {
        return { success: false, error: 'Sin permisos de escritura' };
      }

      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...taskData,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('user_id', keyValidation.data.user_id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Trigger webhook
      const eventType = taskData.completed !== undefined ? 
        (taskData.completed ? 'task.completed' : 'task.updated') : 
        'task.updated';
      
      await this.triggerWebhook(keyValidation.data.user_id, eventType, data);

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Error actualizando tarea' };
    }
  }

  async deleteTaskViaApi(apiKey: string, taskId: number): Promise<ApiResponse> {
    try {
      // Validar API key
      const keyValidation = await this.validateApiKey(apiKey);
      if (!keyValidation.success || !keyValidation.data) {
        return { success: false, error: 'API key inválida' };
      }

      if (!keyValidation.data.permissions.includes('delete')) {
        return { success: false, error: 'Sin permisos de eliminación' };
      }

      // Obtener tarea antes de eliminar para webhook
      const { data: task } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .eq('user_id', keyValidation.data.user_id)
        .single();

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', keyValidation.data.user_id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Trigger webhook
      if (task) {
        await this.triggerWebhook(keyValidation.data.user_id, 'task.deleted', task);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error eliminando tarea' };
    }
  }

  // ==================== Webhooks ====================

  async createWebhook(url: string, events: WebhookConfig['events']): Promise<ApiResponse<WebhookConfig>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const secret = this.generateWebhookSecret();

      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          user_id: user.id,
          url,
          events,
          secret,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Error creando webhook' };
    }
  }

  async getUserWebhooks(): Promise<ApiResponse<WebhookConfig[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Error obteniendo webhooks' };
    }
  }

  private async triggerWebhook(userId: string, event: WebhookConfig['events'][0], data: any): Promise<void> {
    try {
      const { data: webhooks } = await supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (!webhooks) return;

      for (const webhook of webhooks) {
        if (webhook.events.includes(event)) {
          // Enviar webhook en background
          fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-TaskFlow-Event': event,
              'X-TaskFlow-Signature': this.generateWebhookSignature(JSON.stringify(data), webhook.secret)
            },
            body: JSON.stringify({
              event,
              data,
              timestamp: new Date().toISOString()
            })
          }).catch(console.error);
        }
      }
    } catch (error) {
      console.error('Error triggering webhook:', error);
    }
  }

  // ==================== Utility Methods ====================

  private generateApiKey(): string {
    const prefix = 'tf_';
    const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return prefix + randomPart;
  }

  private generateWebhookSecret(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private generateWebhookSignature(payload: string, secret: string): string {
    // En un entorno real, usarías HMAC-SHA256
    return btoa(payload + secret);
  }

  // ==================== API Documentation ====================

  getApiDocumentation() {
    return {
      openapi: '3.0.0',
      info: {
        title: 'TaskFlow API',
        version: '1.0.0',
        description: 'API REST para gestión de tareas en TaskFlow',
        contact: {
          name: 'TaskFlow Support',
          email: 'support@taskflow.com'
        }
      },
      servers: [
        {
          url: '/api/v1',
          description: 'Servidor de producción'
        }
      ],
      security: [
        {
          ApiKeyAuth: []
        }
      ],
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key'
          }
        },
        schemas: {
          Task: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              title: { type: 'string' },
              description: { type: 'string' },
              completed: { type: 'boolean' },
              priority: { type: 'string', enum: ['low', 'medium', 'high'] },
              due_date: { type: 'string', format: 'date-time' },
              category: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' }
            }
          },
          ApiResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
              error: { type: 'string' },
              meta: { type: 'object' }
            }
          }
        }
      },
      paths: {
        '/tasks': {
          get: {
            summary: 'Obtener todas las tareas',
            parameters: [
              { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
              { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
              { name: 'status', in: 'query', schema: { type: 'string', enum: ['completed', 'pending'] } },
              { name: 'category', in: 'query', schema: { type: 'string' } },
              { name: 'priority', in: 'query', schema: { type: 'string', enum: ['low', 'medium', 'high'] } }
            ],
            responses: {
              200: { description: 'Lista de tareas', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
            }
          },
          post: {
            summary: 'Crear nueva tarea',
            requestBody: {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Task' }
                }
              }
            },
            responses: {
              201: { description: 'Tarea creada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
            }
          }
        },
        '/tasks/{id}': {
          put: {
            summary: 'Actualizar tarea',
            parameters: [
              { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
            ],
            requestBody: {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Task' }
                }
              }
            },
            responses: {
              200: { description: 'Tarea actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
            }
          },
          delete: {
            summary: 'Eliminar tarea',
            parameters: [
              { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
            ],
            responses: {
              200: { description: 'Tarea eliminada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
            }
          }
        }
      }
    };
  }
}

export const apiService = new ApiService();
