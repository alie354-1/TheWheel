import { supabase } from '../supabase';
import { User } from '../types/profile.types';

export class ProfileService {
  constructor() {}

  /**
   * Fetch a user profile from the users table
   */
  async getProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  }

  /**
   * Update a user profile in the users table
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Error in updateProfile:', error);
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

      const userIds = members?.map(m => m.user_id) || [];
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
