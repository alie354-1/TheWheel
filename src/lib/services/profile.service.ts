import { supabase } from '../supabase';
import { ExtendedUserProfile } from '../types/extended-profile.types';

export class ProfileService {
  constructor() {}

  async getProfile(userId: string): Promise<ExtendedUserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as ExtendedUserProfile;
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  }

  async updateProfile(userId: string, updates: Partial<ExtendedUserProfile>): Promise<ExtendedUserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return null;
      }

      return data as ExtendedUserProfile;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return null;
    }
  }

  async getCompanyProfiles(companyId: string): Promise<ExtendedUserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_public', true);

      if (error) {
        console.error('Error fetching company profiles:', error);
        return [];
      }

      return data as ExtendedUserProfile[];
    } catch (error) {
      console.error('Error in getCompanyProfiles:', error);
      return [];
    }
  }
}

export const profileService = new ProfileService();
