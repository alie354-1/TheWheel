import { supabase } from '../../supabase';
import { CompanyAccessResult, CompanyData } from './types';

export class CompanyAccessService {
  /**
   * Check if a user has access to any companies
   */
  async checkUserCompanyAccess(userId: string): Promise<CompanyAccessResult> {
    if (!userId) {
      return {
        hasCompany: false,
        companyData: [],
        error: 'No user ID provided'
      };
    }

    try {
      // First, check if the user is a member of any companies
      const { data: memberData, error: memberError } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', userId);

      if (memberError) {
        console.error('Error checking company membership:', memberError);
        return {
          hasCompany: false,
          companyData: [],
          error: `Membership check error: ${memberError.message}`
        };
      }

      // If no membership records, the user doesn't have a company
      if (!memberData || memberData.length === 0) {
        return {
          hasCompany: false,
          companyData: [],
        };
      }

      // Get company IDs from membership records
      const companyIds = memberData.map(record => record.company_id);

      // Fetch company data for all companies the user is a member of
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .in('id', companyIds);

      if (companyError) {
        console.error('Error fetching company data:', companyError);
        return {
          hasCompany: true, // We know they have companies, even if we couldn't fetch them
          companyData: [],
          error: `Company data fetch error: ${companyError.message}`
        };
      }

      return {
        hasCompany: companyData && companyData.length > 0,
        companyData: companyData || [],
      };
    } catch (error: any) {
      console.error('Unexpected error in checkUserCompanyAccess:', error);
      return {
        hasCompany: false,
        companyData: [],
        error: `Unexpected error: ${error.message || error}`
      };
    }
  }

  /**
   * Get all companies a user is a member of
   */
  async getUserCompanies(userId: string): Promise<CompanyData[]> {
    if (!userId) {
      return [];
    }

    try {
      const { data: memberData, error: memberError } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', userId);

      if (memberError || !memberData || memberData.length === 0) {
        return [];
      }

      const companyIds = memberData.map(record => record.company_id);

      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .in('id', companyIds);

      if (companyError || !companyData) {
        return [];
      }

      return companyData;
    } catch (error) {
      console.error('Error getting user companies:', error);
      return [];
    }
  }
}