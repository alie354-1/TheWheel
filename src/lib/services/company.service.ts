import { supabase } from '../supabase';
import { Company } from '../types/idea-playground.types';

/**
 * Service for company-related operations
 */
export class CompanyService {
  /**
   * Get all companies the user is a member of
   * @param userId The ID of the user
   * @returns A list of companies the user is a member of
   */
  async getUserCompanies(userId: string): Promise<Company[]> {
    try {
      // Get all company_ids where the user is a member
      const { data: memberships, error: membershipsError } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', userId);

      if (membershipsError) throw membershipsError;

      const companyIds = memberships?.map(m => m.company_id) || [];

      if (companyIds.length === 0) return [];

      // Fetch all companies by those IDs
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*', { head: false })
        .in('id', companyIds);

      if (companiesError) throw companiesError;

      return companies || [];
    } catch (error) {
      console.error('Error fetching user companies:', error);
      return [];
    }
  }

  /**
   * Get a company by ID
   * @param companyId The ID of the company
   * @returns The company with the given ID
   */
  async getCompany(companyId: string): Promise<Company | null> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*', { head: false })
        .eq('id', companyId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching company:', error);
      return null;
    }
  }


  /**
   * Check if a user is a member of a company
   * @param userId The ID of the user
   * @param companyId The ID of the company
   * @returns True if the user is a member of the company, false otherwise
   */
  async isUserCompanyMember(userId: string, companyId: string): Promise<boolean> {
    try {
      // Check if user is a member of the company
      const { data: membership, error: membershipError } = await supabase
        .from('company_members')
        .select('id')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .single();

      if (membershipError && membershipError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is expected if not a member
        throw membershipError;
      }

      return !!membership;
    } catch (error) {
      console.error('Error checking company membership:', error);
      return false;
    }
  }

  /**
   * Update a company by ID
   * @param companyId The ID of the company
   * @param updates The fields to update (including metadata)
   * @returns The updated company object
   */
  async updateCompany(companyId: string, updates: Partial<Company> & { metadata?: Record<string, any> }): Promise<Company | null> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', companyId)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  }

  /**
   * Get the role of a user in a company
   * @param userId The ID of the user
   * @param companyId The ID of the company
   * @returns The role string (e.g., "owner", "admin", "member") or null if not a member
   */
  async getUserRole(userId: string, companyId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('company_members')
        .select('role', { head: false })
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data?.role ?? null;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  }

  /**
   * Delete a company by ID (and cascade delete related data)
   * @param companyId The ID of the company to delete
   */
  async deleteCompany(companyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  }

  /**
   * Get all members of a company (for ownership transfer)
   * @param companyId The ID of the company
   * @returns Array of members with user_id, role, user_email
   */
  async getCompanyMembers(companyId: string): Promise<{ data: any[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('company_members')
        .select('user_id, role, user_email', { head: false })
        .eq('company_id', companyId);
      return { data: data || [], error };
    } catch (error) {
      console.error('Error fetching company members:', error);
      return { data: [], error };
    }
  }

  /**
   * Transfer company ownership to another member
   * @param companyId The company ID
   * @param newOwnerUserId The user_id of the new owner
   * @param currentOwnerUserId The user_id of the current owner
   */
  async transferOwnership(companyId: string, newOwnerUserId: string, currentOwnerUserId: string): Promise<void> {
    try {
      // Start by updating the new owner's role to "owner"
      const { error: promoteError } = await supabase
        .from('company_members')
        .update({ role: "owner" })
        .eq('company_id', companyId)
        .eq('user_id', newOwnerUserId);

      if (promoteError) throw promoteError;

      // Demote the current owner to "admin"
      const { error: demoteError } = await supabase
        .from('company_members')
        .update({ role: "admin" })
        .eq('company_id', companyId)
        .eq('user_id', currentOwnerUserId);

      if (demoteError) throw demoteError;
    } catch (error) {
      console.error('Error transferring ownership:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const companyService = new CompanyService();
