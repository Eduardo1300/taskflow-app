import api from '../lib/api';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  name?: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  created_at?: string;
  joined_date?: string;
  timezone?: string;
  language?: string;
  updated_at?: string;
}

export class ProfileService {
  static async getProfile(): Promise<{ data: UserProfile | null; error: string | null }> {
    try {
      const profile = await api.getProfile();
      const user = profile?.user || profile;
      return { 
        data: user ? {
          ...user,
          name: user.full_name || user.name,
          joined_date: user.created_at || user.joined_date
        } : null, 
        error: null 
      };
    } catch (error: any) {
      console.error('Error getting profile:', error);
      return { data: null, error: error.message || 'Error al cargar el perfil' };
    }
  }

  static async createProfile(profile: Partial<UserProfile>): Promise<{ data: UserProfile | null; error: string | null }> {
    return { data: profile as UserProfile, error: null };
  }

  static async updateProfile(profile: Partial<UserProfile>): Promise<{ data: UserProfile | null; error: string | null }> {
    try {
      const updatedProfile = await api.updateProfile(profile);
      return { 
        data: updatedProfile ? {
          ...updatedProfile,
          name: updatedProfile.full_name || updatedProfile.name,
          joined_date: updatedProfile.created_at || updatedProfile.joined_date
        } : null, 
        error: null 
      };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return { data: null, error: error.message || 'Error al actualizar el perfil' };
    }
  }

  static async uploadAvatar(): Promise<{ data: string | null; error: string | null }> {
    console.log('[ProfileService] Uploading avatar');
    return { data: null, error: 'Not implemented' };
  }

  static async deleteAvatar(): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }
}
