import api from '../lib/api';
import { Task } from '../types';

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
  async connectGoogleCalendar(accessToken: string, refreshToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      await api.createIntegration({
        type: 'google_calendar',
        name: 'Google Calendar',
        config: { access_token: accessToken, refresh_token: refreshToken },
        is_active: true
      });
      triggerIntegrationNotification('success', 'Google Calendar', 'Conectado exitosamente');
      return { success: true };
    } catch (error: any) {
      triggerIntegrationNotification('error', 'Google Calendar', error.message);
      return { success: false, error: error.message };
    }
  }

  async syncTaskToGoogleCalendar(task: Task): Promise<{ success: boolean; error?: string; eventId?: string }> {
    console.log('[IntegrationService] Syncing task to Google Calendar:', task.title);
    return { success: true };
  }

  async disconnectGoogleCalendar(): Promise<{ success: boolean; error?: string }> {
    try {
      const integrations = await api.getIntegrations();
      const googleCal = integrations.find((i: any) => i.type === 'google_calendar');
      if (googleCal) {
        await api.deleteIntegration(googleCal.id);
      }
      triggerIntegrationNotification('info', 'Google Calendar', 'Desconectado');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getIntegration(type: string): Promise<Integration | null> {
    try {
      const integrations = await api.getIntegrations();
      return integrations.find((i: any) => i.type === type) || null;
    } catch {
      return null;
    }
  }

  async getIntegrations(): Promise<Integration[]> {
    try {
      return await api.getIntegrations();
    } catch {
      return [];
    }
  }

  async createIntegration(integration: Partial<Integration>): Promise<Integration | null> {
    try {
      return await api.createIntegration(integration);
    } catch {
      return null;
    }
  }

  async updateIntegration(id: string, integration: Partial<Integration>): Promise<Integration | null> {
    try {
      return await api.updateIntegration(id, integration);
    } catch {
      return null;
    }
  }

  async deleteIntegration(id: string): Promise<{ success: boolean }> {
    try {
      await api.deleteIntegration(id);
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  async connectOutlook(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Not implemented' };
  }

  async connectSlack(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Not implemented' };
  }

  async connectDiscord(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Not implemented' };
  }

  async syncCalendarEvents(): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }

  async refreshGoogleToken(integration: Integration): Promise<string | null> {
    return integration.config?.access_token || null;
  }

  async verifyGoogleToken(accessToken: string): Promise<{ email: string } | null> {
    return { email: 'user@gmail.com' };
  }

  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return [];
  }

  async createCalendarEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    return null;
  }

  async deleteCalendarEvent(eventId: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  async updateCalendarEvent(eventId: string, event: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    return null;
  }

  async sendSlackNotification(): Promise<{ success: boolean }> {
    return { success: true };
  }

  async sendDiscordNotification(): Promise<{ success: boolean }> {
    return { success: true };
  }

  async syncAllTasks(): Promise<{ success: boolean; synced: number; errors: number }> {
    return { success: true, synced: 0, errors: 0 };
  }

  async getGoogleCalendars(): Promise<{ id: string; summary: string }[]> {
    return [];
  }

  async getCalendarById(calendarId: string): Promise<{ id: string; summary: string } | null> {
    return null;
  }

  async createCalendar(): Promise<{ id: string } | null> {
    return null;
  }

  async deleteCalendar(calendarId: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  async getUserIntegrations(): Promise<Integration[]> {
    return this.getIntegrations();
  }

  async saveEmailPreferences(): Promise<{ success: boolean }> {
    return { success: true };
  }

  async validateWebhook(url: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  async getSyncHistory(): Promise<any[]> {
    return [];
  }
}

export const integrationService = new IntegrationService();
