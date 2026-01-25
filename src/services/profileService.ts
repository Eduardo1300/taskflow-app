import { supabase } from '../lib/supabase';

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
  static async getProfile(userId: string): Promise<{ data: UserProfile | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found, que es ok
        throw error;
      }

      return { data: data || null, error: null };
    } catch (error) {
      console.error('Error getting profile:', error);
      return { data: null, error: 'Error al cargar el perfil' };
    }
  }

  static async updateProfile(userId: string, profile: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...profile,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error: 'Error al actualizar el perfil' };
    }
  }

  static async createProfile(userId: string, profile: UserProfile) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: userId,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            location: profile.location,
            bio: profile.bio,
            avatar: profile.avatar,
            joined_date: profile.joined_date,
            timezone: profile.timezone,
            language: profile.language,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error creating profile:', error);
      return { data: null, error: 'Error al crear el perfil' };
    }
  }
}
