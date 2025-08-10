import { supabase } from '../lib/supabase';

// Función para disparar notificaciones de integración
const triggerIntegrationNotification = (
  type: 'success' | 'error' | 'info',
  title: string,
  message: string,
  integration?: string
) => {
  const event = new CustomEvent('integrationEvent', {
    detail: { type, title, message, integration }
  });
  window.dispatchEvent(event);
};
import { Task } from '../types';

export interface Integration {
  id: string;
  user_id: string;
  type: 'google_calendar' | 'outlook' | 'slack' | 'discord' | 'email' | 'webhook';
  name: string;
  config: Record<string, any>;
  is_active: boolean;
  created_at: string;
  last_sync_at?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
  calendar_id?: string;
}

export interface NotificationConfig {
  id: string;
  user_id: string;
  type: 'email' | 'slack' | 'discord' | 'webhook';
  events: ('task_created' | 'task_completed' | 'task_overdue' | 'task_reminder')[];
  config: Record<string, any>;
  is_active: boolean;
}

class IntegrationService {
  // ==================== Google Calendar Integration ====================
  
  async connectGoogleCalendar(accessToken: string, refreshToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Usuario no autenticado' };

      // Verificar el token con Google
      const userInfo = await this.verifyGoogleToken(accessToken);
      if (!userInfo) {
        return { success: false, error: 'Token de Google inválido' };
      }

      const { error } = await supabase
        .from('integrations')
        .upsert({
          user_id: user.id,
          type: 'google_calendar',
          name: 'Google Calendar',
          config: {
            access_token: accessToken,
            refresh_token: refreshToken,
            email: userInfo.email,
            scope: 'calendar'
          },
          is_active: true
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error conectando con Google Calendar' };
    }
  }

  async syncTaskToGoogleCalendar(task: Task): Promise<{ success: boolean; error?: string; eventId?: string }> {
    try {
      const integration = await this.getIntegration('google_calendar');
      if (!integration || !integration.is_active) {
        return { success: false, error: 'Google Calendar no conectado' };
      }

      const accessToken = await this.refreshGoogleToken(integration);
      if (!accessToken) {
        return { success: false, error: 'No se pudo obtener token de acceso' };
      }

      const event = {
        summary: task.title,
        description: task.description || '',
        start: {
          dateTime: task.due_date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          timeZone: 'America/Mexico_City'
        },
        end: {
          dateTime: task.due_date ? 
            new Date(new Date(task.due_date).getTime() + 60 * 60 * 1000).toISOString() :
            new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
          timeZone: 'America/Mexico_City'
        },
        colorId: this.getPriorityColor(task.priority || 'medium')
      };

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error?.message || 'Error creando evento' };
      }

      const createdEvent = await response.json();
      return { success: true, eventId: createdEvent.id };
    } catch (error) {
      return { success: false, error: 'Error sincronizando con Google Calendar' };
    }
  }

  async deleteGoogleCalendarEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const integration = await this.getIntegration('google_calendar');
      if (!integration || !integration.is_active) {
        return { success: false, error: 'Google Calendar no conectado' };
      }

      const accessToken = await this.refreshGoogleToken(integration);
      if (!accessToken) {
        return { success: false, error: 'No se pudo obtener token de acceso' };
      }

      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok && response.status !== 410) { // 410 = Already deleted
        return { success: false, error: 'Error eliminando evento de calendario' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error eliminando evento de Google Calendar' };
    }
  }

  private async verifyGoogleToken(accessToken: string): Promise<any> {
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  private async refreshGoogleToken(integration: Integration): Promise<string | null> {
    try {
      const { refresh_token } = integration.config;
      if (!refresh_token) return integration.config.access_token;

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
          client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
          refresh_token,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) return null;

      const data = await response.json();
      
      // Actualizar token en la base de datos
      await supabase
        .from('integrations')
        .update({
          config: {
            ...integration.config,
            access_token: data.access_token
          }
        })
        .eq('id', integration.id);

      return data.access_token;
    } catch {
      return null;
    }
  }

  private getPriorityColor(priority?: string): string {
    switch (priority) {
      case 'high': return '11'; // Rojo
      case 'medium': return '5'; // Amarillo
      case 'low': return '2'; // Verde
      default: return '1'; // Azul
    }
  }

  // ==================== Email Integration ====================

  async sendTaskEmail(task: Task, recipientEmail: string, type: 'created' | 'completed' | 'reminder' | 'overdue'): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Usuario no autenticado' };

      const emailConfig = await this.getEmailConfig();
      if (!emailConfig) {
        return { success: false, error: 'Configuración de email no encontrada' };
      }

      const emailContent = this.generateEmailContent(task, type, user.email || '');
      
      // Usar servicio de email (ejemplo con EmailJS o API propia)
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          subject: emailContent.subject,
          html: emailContent.html,
          from: emailConfig.from_email
        })
      });

      if (!response.ok) {
        return { success: false, error: 'Error enviando email' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error en servicio de email' };
    }
  }

  private generateEmailContent(task: Task, type: string, userEmail: string) {
    const baseUrl = window.location.origin;
    
    const templates = {
      created: {
        subject: `📝 Nueva tarea creada: ${task.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Nueva Tarea Creada</h2>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #1e293b;">${task.title}</h3>
              ${task.description ? `<p style="color: #64748b; margin: 10px 0;">${task.description}</p>` : ''}
              ${task.due_date ? `<p><strong>Fecha límite:</strong> ${new Date(task.due_date).toLocaleDateString('es-ES')}</p>` : ''}
              ${task.priority ? `<p><strong>Prioridad:</strong> <span style="color: ${this.getPriorityEmailColor(task.priority)}">${task.priority.toUpperCase()}</span></p>` : ''}
              ${task.category ? `<p><strong>Categoría:</strong> ${task.category}</p>` : ''}
            </div>
            <p style="color: #64748b;">Creada por: ${userEmail}</p>
            <a href="${baseUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Ver en TaskFlow</a>
          </div>
        `
      },
      completed: {
        subject: `✅ Tarea completada: ${task.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">¡Tarea Completada!</h2>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="margin: 0 0 10px 0; color: #1e293b;">${task.title}</h3>
              ${task.description ? `<p style="color: #64748b; margin: 10px 0;">${task.description}</p>` : ''}
              <p style="color: #059669; font-weight: bold;">Estado: COMPLETADA ✅</p>
            </div>
            <p style="color: #64748b;">Completada por: ${userEmail}</p>
            <a href="${baseUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Ver en TaskFlow</a>
          </div>
        `
      },
      reminder: {
        subject: `⏰ Recordatorio: ${task.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Recordatorio de Tarea</h2>
            <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="margin: 0 0 10px 0; color: #1e293b;">${task.title}</h3>
              ${task.description ? `<p style="color: #64748b; margin: 10px 0;">${task.description}</p>` : ''}
              ${task.due_date ? `<p><strong>Fecha límite:</strong> <span style="color: #dc2626;">${new Date(task.due_date).toLocaleDateString('es-ES')}</span></p>` : ''}
              <p style="color: #d97706; font-weight: bold;">¡No olvides completar esta tarea!</p>
            </div>
            <a href="${baseUrl}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Completar Tarea</a>
          </div>
        `
      },
      overdue: {
        subject: `🚨 Tarea vencida: ${task.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">¡Tarea Vencida!</h2>
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="margin: 0 0 10px 0; color: #1e293b;">${task.title}</h3>
              ${task.description ? `<p style="color: #64748b; margin: 10px 0;">${task.description}</p>` : ''}
              ${task.due_date ? `<p><strong>Fecha límite:</strong> <span style="color: #dc2626; font-weight: bold;">${new Date(task.due_date).toLocaleDateString('es-ES')} (VENCIDA)</span></p>` : ''}
              <p style="color: #dc2626; font-weight: bold;">Esta tarea requiere atención inmediata.</p>
            </div>
            <a href="${baseUrl}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Revisar Tarea</a>
          </div>
        `
      }
    };

    return templates[type as keyof typeof templates];
  }

  private getPriorityEmailColor(priority: string): string {
    switch (priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  }

  // ==================== Slack Integration ====================

  async sendSlackNotification(task: Task, type: 'created' | 'completed' | 'reminder' | 'overdue'): Promise<{ success: boolean; error?: string }> {
    try {
      const integration = await this.getIntegration('slack');
      if (!integration || !integration.is_active) {
        return { success: false, error: 'Slack no conectado' };
      }

      const { webhook_url } = integration.config;
      if (!webhook_url) {
        return { success: false, error: 'URL de webhook de Slack no configurada' };
      }

      const slackMessage = this.generateSlackMessage(task, type);

      const response = await fetch(webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackMessage)
      });

      if (!response.ok) {
        return { success: false, error: 'Error enviando mensaje a Slack' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error en integración con Slack' };
    }
  }

  private generateSlackMessage(task: Task, type: string) {
    const colors = {
      created: '#3b82f6',
      completed: '#10b981',
      reminder: '#f59e0b',
      overdue: '#dc2626'
    };

    const emojis = {
      created: '📝',
      completed: '✅',
      reminder: '⏰',
      overdue: '🚨'
    };

    const titles = {
      created: 'Nueva Tarea Creada',
      completed: 'Tarea Completada',
      reminder: 'Recordatorio de Tarea',
      overdue: 'Tarea Vencida'
    };

    return {
      text: `${emojis[type as keyof typeof emojis]} ${titles[type as keyof typeof titles]}: ${task.title}`,
      attachments: [{
        color: colors[type as keyof typeof colors],
        fields: [
          {
            title: 'Título',
            value: task.title,
            short: false
          },
          ...(task.description ? [{
            title: 'Descripción',
            value: task.description,
            short: false
          }] : []),
          ...(task.due_date ? [{
            title: 'Fecha límite',
            value: new Date(task.due_date).toLocaleDateString('es-ES'),
            short: true
          }] : []),
          ...(task.priority ? [{
            title: 'Prioridad',
            value: task.priority.toUpperCase(),
            short: true
          }] : []),
          ...(task.category ? [{
            title: 'Categoría',
            value: task.category,
            short: true
          }] : [])
        ],
        footer: 'TaskFlow',
        ts: Math.floor(Date.now() / 1000)
      }]
    };
  }

  // ==================== Discord Integration ====================

  async sendDiscordNotification(task: Task, type: 'created' | 'completed' | 'reminder' | 'overdue'): Promise<{ success: boolean; error?: string }> {
    try {
      const integration = await this.getIntegration('discord');
      if (!integration || !integration.is_active) {
        return { success: false, error: 'Discord no conectado' };
      }

      const { webhook_url } = integration.config;
      if (!webhook_url) {
        return { success: false, error: 'URL de webhook de Discord no configurada' };
      }

      const discordMessage = this.generateDiscordMessage(task, type);

      const response = await fetch(webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordMessage)
      });

      if (!response.ok) {
        return { success: false, error: 'Error enviando mensaje a Discord' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error en integración con Discord' };
    }
  }

  private generateDiscordMessage(task: Task, type: string) {
    const colors = {
      created: 0x3b82f6,
      completed: 0x10b981,
      reminder: 0xf59e0b,
      overdue: 0xdc2626
    };

    const emojis = {
      created: '📝',
      completed: '✅',
      reminder: '⏰',
      overdue: '🚨'
    };

    const titles = {
      created: 'Nueva Tarea Creada',
      completed: 'Tarea Completada',
      reminder: 'Recordatorio de Tarea',
      overdue: 'Tarea Vencida'
    };

    return {
      embeds: [{
        title: `${emojis[type as keyof typeof emojis]} ${titles[type as keyof typeof titles]}`,
        description: task.title,
        color: colors[type as keyof typeof colors],
        fields: [
          ...(task.description ? [{
            name: 'Descripción',
            value: task.description.length > 1024 ? task.description.substring(0, 1021) + '...' : task.description,
            inline: false
          }] : []),
          ...(task.due_date ? [{
            name: 'Fecha límite',
            value: new Date(task.due_date).toLocaleDateString('es-ES'),
            inline: true
          }] : []),
          ...(task.priority ? [{
            name: 'Prioridad',
            value: task.priority.toUpperCase(),
            inline: true
          }] : []),
          ...(task.category ? [{
            name: 'Categoría',
            value: task.category,
            inline: true
          }] : [])
        ],
        footer: {
          text: 'TaskFlow',
          icon_url: 'https://your-domain.com/icon.png'
        },
        timestamp: new Date().toISOString()
      }]
    };
  }

  // ==================== Helper Methods ====================

  private async getIntegration(type: string): Promise<Integration | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', type)
        .eq('is_active', true)
        .single();

      if (error || !data) return null;
      return data;
    } catch {
      return null;
    }
  }

  private async getEmailConfig() {
    // Esto podría venir de configuración del usuario o variables de entorno
    return {
      from_email: 'noreply@taskflow.com',
      service: 'emailjs' // o 'sendgrid', 'mailgun', etc.
    };
  }

  // ==================== Public API Methods ====================

  async getUserIntegrations(): Promise<Integration[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  }

  async createIntegration(type: string, name: string, config: Record<string, any>): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Usuario no autenticado' };

      const { error } = await supabase
        .from('integrations')
        .insert({
          user_id: user.id,
          type,
          name,
          config,
          is_active: true
        });

      if (error) {
        return { success: false, error: error.message };
      }

      // Disparar notificación de éxito
      triggerIntegrationNotification(
        'success',
        'Integración creada',
        `${name} se ha configurado correctamente`,
        type
      );

      return { success: true };
    } catch (error) {
      // Disparar notificación de error
      triggerIntegrationNotification(
        'error',
        'Error en integración',
        'No se pudo crear la integración',
        type
      );
      return { success: false, error: 'Error creando integración' };
    }
  }

  async updateIntegration(id: string, updates: Partial<Integration>): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Usuario no autenticado' };

      const { error } = await supabase
        .from('integrations')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error actualizando integración' };
    }
  }

  async deleteIntegration(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Usuario no autenticado' };

      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error eliminando integración' };
    }
  }

  // ==================== Notification Triggers ====================

  async triggerNotifications(task: Task, event: 'created' | 'completed' | 'reminder' | 'overdue'): Promise<void> {
    try {
      const integrations = await this.getUserIntegrations();
      
      // Ejecutar notificaciones en paralelo
      const promises = integrations
        .filter(integration => integration.is_active)
        .map(async (integration) => {
          try {
            switch (integration.type) {
              case 'slack':
                await this.sendSlackNotification(task, event);
                break;
              case 'discord':
                await this.sendDiscordNotification(task, event);
                break;
              case 'email':
                if (integration.config.recipient_email) {
                  await this.sendTaskEmail(task, integration.config.recipient_email, event);
                }
                break;
            }
          } catch (error) {
            console.error(`Error en notificación ${integration.type}:`, error);
          }
        });

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error triggering notifications:', error);
    }
  }

  // Método para sincronizar tareas automáticamente
  async autoSyncTask(task: Task, action: 'create' | 'update' | 'delete'): Promise<void> {
    try {
      const integrations = await this.getUserIntegrations();
      
      for (const integration of integrations) {
        if (!integration.is_active) continue;

        if (integration.type === 'google_calendar') {
          switch (action) {
            case 'create':
              if (task.due_date) {
                await this.syncTaskToGoogleCalendar(task);
              }
              break;
            case 'delete':
              // Aquí necesitarías el eventId del calendario, que podrías guardar en la tarea
              break;
          }
        }
      }
    } catch (error) {
      console.error('Error in auto sync:', error);
    }
  }
}

export const integrationService = new IntegrationService();
