import { supabase } from '../supabase.ts';
import { User } from '../types/profile.types.ts';

export class ProfileService {
  constructor() {}

  /**
   * Fetch a user profile from the users table
   */
  async getProfile(userId: string): Promise<User | null> {
    try {
      console.log('ProfileService: Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('ProfileService: Error fetching user profile:', error.message, error.details);
        return null;
      }

      console.log('ProfileService: Successfully fetched profile for user:', userId);
      return data as User;
    } catch (error) {
      console.error('ProfileService: Unexpected error in getProfile:', error);
      return null;
    }
  }

  /**
   * Create a new user profile in the users table
   */
  async createProfile(profileData: Partial<User>): Promise<User | null> {
    try {
      console.log('ProfileService: Creating profile for user:', profileData.id);
      
      const { data, error } = await supabase
        .from('users')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('ProfileService: Error creating user profile:', error.message, error.details);
        return null;
      }

      console.log('ProfileService: Successfully created profile for user:', profileData.id);
      return data as User;
    } catch (error) {
      console.error('ProfileService: Unexpected error in createProfile:', error);
      return null;
    }
  }

  /**
   * Get or create a user profile - first tries to get, then creates if not found
   */
  async getOrCreateProfile(userId: string, authUserData?: any): Promise<User | null> {
    try {
      console.log('ProfileService: Getting or creating profile for user:', userId);
      
      // First try to get existing profile
      let userProfile = await this.getProfile(userId);
      
      if (userProfile) {
        console.log('ProfileService: Found existing profile for user:', userId);
        return userProfile;
      }

      // If no profile exists and we have auth data, create one
      if (authUserData) {
        console.log('ProfileService: No profile found, creating new profile for user:', userId);
        
        const profileData: Partial<User> = {
          id: userId,
          email: authUserData.email,
          full_name: authUserData.user_metadata?.full_name || 
                    authUserData.user_metadata?.name || 
                    `${authUserData.user_metadata?.first_name || ''} ${authUserData.user_metadata?.last_name || ''}`.trim() || 
                    null,
          display_name: authUserData.user_metadata?.display_name || null,
          avatar_url: authUserData.user_metadata?.avatar_url || null,
          status: 'active' as const,
          email_verified: authUserData.email_confirmed_at ? true : false,
          created_at: authUserData.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          role: 'admin', // Making all new users admins for now
          is_public: false,
          allows_messages: true
        };
        
        userProfile = await this.createProfile(profileData);
        
        if (userProfile) {
          console.log('ProfileService: Successfully created profile for user:', userId);
          return userProfile;
        } else {
          console.warn('ProfileService: Failed to create profile, falling back to auth user data');
          // Fall back to using auth user data as profile
          return profileData as User;
        }
      }

      console.error('ProfileService: No profile found and no auth data provided for user:', userId);
      return null;
    } catch (error) {
      console.error('ProfileService: Unexpected error in getOrCreateProfile:', error);
      return null;
    }
  }

  /**
   * Update a user profile in the users table
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      console.log('ProfileService: Updating profile for user:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('ProfileService: Error updating user profile:', error.message, error.details);
        return null;
      }

      console.log('ProfileService: Successfully updated profile for user:', userId);
      return data as User;
    } catch (error) {
      console.error('ProfileService: Unexpected error in updateProfile:', error);
      return null;
    }
  }

  /**
   * Get all user profiles for members of a company
   */
  async getCompanyProfiles(companyId: string): Promise<User[]> {
    try {
      // Get all user_ids for the company
      const { data: members, error: membersError } = await supabase
        .from('company_members')
        .select('user_id')
        .eq('company_id', companyId);

      if (membersError) {
        console.error('Error fetching company members:', membersError);
        return [];
      }

      const userIds = members?.map((m: any) => m.user_id) || [];
      if (userIds.length === 0) return [];

      // Fetch all users by those IDs
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds);

      if (usersError) {
        console.error('Error fetching user profiles:', usersError);
        return [];
      }

      return users as User[];
    } catch (error) {
      console.error('Error in getCompanyProfiles:', error);
      return [];
    }
  }
}

export const profileService = new ProfileService();
