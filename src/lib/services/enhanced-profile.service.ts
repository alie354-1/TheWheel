import { supabase } from '../supabase';
import { UserRoleType, CompanyStageType, EnhancedProfileType } from '../types/enhanced-profile.types';

class EnhancedProfileService {
  /**
   * Get a user's enhanced profile
   */
  async getProfile(userId: string): Promise<EnhancedProfileType | null> {
    try {
      const { data, error } = await supabase
        .from('enhanced_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Not found error
          return null;
        }
        console.error('Error fetching profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  }

  /**
   * Update a user's enhanced profile
   */
  async updateProfile(userId: string, profileData: Partial<EnhancedProfileType>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('enhanced_profiles')
        .update(profileData)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return false;
    }
  }

  /**
   * Create a new enhanced profile
   */
  async createProfile(profileData: EnhancedProfileType): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('enhanced_profiles')
        .insert([profileData]);

      if (error) {
        console.error('Error creating profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in createProfile:', error);
      return false;
    }
  }

  /**
   * Get a company invitation by its code
   */
  async getCompanyInvitation(inviteCode: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('company_invitations')
        .select('*')
        .eq('code', inviteCode)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Not found error
          return null;
        }
        console.error('Error fetching invitation:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getCompanyInvitation:', error);
      return null;
    }
  }

  /**
   * Get company membership details
   */
  async getCompanyMembership(userId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('company_members')
        .select(`
          *,
          companies:company_id (
            id,
            name,
            logo_url,
            industry,
            size,
            stage
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching company membership:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getCompanyMembership:', error);
      return null;
    }
  }

  /**
   * Check if a user is a member of a company
   */
  async isCompanyMember(userId: string): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('company_members')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        console.error('Error checking company membership:', error);
        return false;
      }

      return count !== null && count > 0;
    } catch (error) {
      console.error('Error in isCompanyMember:', error);
      return false;
    }
  }

  /**
   * Get service categories for a service provider
   */
  async getServiceCategories(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('enhanced_profiles')
        .select('service_categories')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching service categories:', error);
        return [];
      }

      return data?.service_categories || [];
    } catch (error) {
      console.error('Error in getServiceCategories:', error);
      return [];
    }
  }

  /**
   * Get expertise for a service provider
   */
  async getExpertise(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('enhanced_profiles')
        .select('expertise')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching expertise:', error);
        return [];
      }

      return data?.expertise || [];
    } catch (error) {
      console.error('Error in getExpertise:', error);
      return [];
    }
  }
}

export const enhancedProfileService = new EnhancedProfileService();
