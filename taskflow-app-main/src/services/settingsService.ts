import api from '../lib/api';

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  taskReminders: boolean;
  weeklyDigest: boolean;
  collaborationUpdates: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  showEmail: boolean;
  allowCollaboration: boolean;
  dataAnalytics: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface UserSettings {
  id: string;
  user_id: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  appearance: AppearanceSettings;
  updated_at?: string;
}

const defaultSettings: UserSettings = {
  id: '',
  user_id: '',
  notifications: {
    email: true,
    push: true,
    taskReminders: true,
    weeklyDigest: false,
    collaborationUpdates: true,
    soundEnabled: true,
    desktopNotifications: true
  },
  privacy: {
    profileVisibility: 'private',
    showEmail: false,
    allowCollaboration: true,
    dataAnalytics: true
  },
  appearance: {
    theme: 'light',
    language: 'es',
    timezone: 'America/Lima',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  }
};

export class SettingsService {
  static async getSettings(...args: any[]): Promise<{ data: UserSettings | null; error: string | null }> {
    try {
      const stored = localStorage.getItem('userSettings');
      if (stored) {
        return { data: JSON.parse(stored), error: null };
      }
      return { data: defaultSettings, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Error al obtener configuración' };
    }
  }

  static async updateSettings(...args: any[]): Promise<{ data: UserSettings | null; error: string | null }> {
    const settings = args[0] as Partial<UserSettings>;
    try {
      const current = await this.getSettings();
      const updated = { ...current.data, ...settings } as UserSettings;
      localStorage.setItem('userSettings', JSON.stringify(updated));
      return { data: updated, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Error al actualizar configuración' };
    }
  }

  static async createSettings(...args: any[]): Promise<{ data: UserSettings | null; error: string | null }> {
    return this.updateSettings(args[0]);
  }
}
