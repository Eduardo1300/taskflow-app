import api from '../lib/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  joined_date: string;
  timezone: string;
  language: string;
  updated_at?: string;
}

export class ProfileService {
  static async getProfile(...args: any[]): Promise<{ data: UserProfile | null; error: string | null }> {
    try {
      const profile = await api.getProfile();
      return { data: profile?.user || null, error: null };
    } catch (error: any) {
      console.error('Error getting profile:', error);
      return { data: null, error: error.message || 'Error al cargar el perfil' };
    }
  }

  static async createProfile(...args: any[]): Promise<{ data: UserProfile | null; error: string | null }> {
    const profile = args[0] as Partial<UserProfile>;
    return { data: profile as UserProfile, error: null };
  }

  static async updateProfile(...args: any[]): Promise<{ data: UserProfile | null; error: string | null }> {
    const profile = args[0] as Partial<UserProfile>;
    const userId = args[1];
    try {
      const updatedProfile = await api.updateProfile(profile);
      return { data: updatedProfile, error: null };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return { data: null, error: error.message || 'Error al actualizar el perfil' };
    }
  }

  static async uploadAvatar(...args: any[]): Promise<{ data: string | null; error: string | null }> {
    console.log('[ProfileService] Uploading avatar');
    return { data: null, error: 'Not implemented' };
  }

  static async deleteAvatar(...args: any[]): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }
}
