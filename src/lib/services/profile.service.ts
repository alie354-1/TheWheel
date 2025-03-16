import { supabase } from '../supabase';
import { ExtendedUserProfile } from '../types/extended-profile.types';

export class ProfileService {
  constructor() {}

  async getProfile(userId: string): Promise<ExtendedUserProfile | null> {
    try {
      // First try to get the existing profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // If we get the profile, return it
      if (data) {
        return data as ExtendedUserProfile;
      }

      // If profile wasn't found, create one
      if (error && error.code === 'PGRST116') {
        console.log('Profile not found, creating new profile for user:', userId);
        
        // Create a new profile with minimal data
        const newProfile: Partial<ExtendedUserProfile> = {
          id: userId,
          email: '', // Will be populated by Supabase
          full_name: null,
          avatar_url: null,
          role: 'user',
          is_public: false,
          allows_messages: true,
          setup_progress: {
            current_step: 'welcome',
            form_data: {},
            completed_steps: [],
            last_updated: new Date().toISOString()
          }
        };
        
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();
          
        if (createError) {
          console.error('Error creating profile:', createError);
          return null;
        }
        
        return createdProfile as ExtendedUserProfile;
      }

      // If there was a different error, log it
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return null;
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
