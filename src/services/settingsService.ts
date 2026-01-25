import { supabase } from '../lib/supabase';

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

export class SettingsService {
  static async getSettings(userId: string): Promise<{ data: UserSettings | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { data: data || null, error: null };
    } catch (error) {
      console.error('Error getting settings:', error);
      return { data: null, error: 'Error al cargar configuración' };
    }
  }

  static async updateSettings(userId: string, settings: Partial<UserSettings>) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating settings:', error);
      return { data: null, error: 'Error al actualizar configuración' };
    }
  }

  static async createSettings(userId: string, settings: Partial<UserSettings>) {
    try {
      const defaultSettings: UserSettings = {
        id: '',
        user_id: userId,
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
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          dateFormat: 'dd/mm/yyyy',
          timeFormat: '24h'
        },
        ...settings
      };

      const { data, error } = await supabase
        .from('user_settings')
        .insert([
          {
            user_id: userId,
            notifications: defaultSettings.notifications,
            privacy: defaultSettings.privacy,
            appearance: defaultSettings.appearance,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error creating settings:', error);
      return { data: null, error: 'Error al crear configuración' };
    }
  }
}
