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
        .select('*')
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
        .select('*')
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
}

// Export a singleton instance
export const companyService = new CompanyService();
