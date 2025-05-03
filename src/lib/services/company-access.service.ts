/**
 * Company Access Service
 * 
 * This service provides access to company data with enhanced error handling.
 */

import { supabase } from '../supabase';

class CompanyAccessService {
  /**
   * Check if a user has access to a company and return company data
   * @param userId User ID to check
   * @returns Object with company access information
   */
  async checkUserCompanyAccess(userId: string) {
    console.log('[CompanyAccessService] Checking company access for user:', userId);
    const startTime = performance.now();
    
    if (!userId) {
      console.error('[CompanyAccessService] No user ID provided');
      throw new Error('User ID is required to check company access');
    }

    try {
      // Query company_members table to check if user is a member of any company
      const { data: memberData, error: memberError } = await supabase
        .from('company_members')
        .select('company_id') // Only select company_id as access_type doesn't exist
        .eq('user_id', userId);
      
      if (memberError) {
        console.error('[CompanyAccessService] Error querying company_members:', memberError);
        // Return default values with error information
        return {
          hasCompany: false,
          companyData: [],
          // accessType: null, // Removed accessType
          error: memberError.message
        };
      }
      
      // If no company memberships found
      if (!memberData || memberData.length === 0) {
        console.log('[CompanyAccessService] No company memberships found for user');
        return {
          hasCompany: false,
          companyData: [],
          // accessType: null, // Removed accessType
          error: null
        };
      }
      
      // User has at least one company
      console.log(`[CompanyAccessService] Found ${memberData.length} company memberships`);
      
      // Get the first company's ID (we'll support multiple companies later)
      // const accessType = memberData[0]?.access_type || null; // Removed accessType
      const companyId = memberData[0]?.company_id;

      if (!companyId) {
        console.log('[CompanyAccessService] Membership found but companyId is missing');
         return {
          hasCompany: false, // Treat as no company if ID is missing
          companyData: [],
          error: 'Company ID missing from membership record'
        };
      }
      
      // Get company details
      const companyData = await this.getCompanyDetails(companyId);
      
      const endTime = performance.now();
      console.log(`[CompanyAccessService] Company access check completed in ${(endTime - startTime).toFixed(2)}ms`);
      
      return {
        hasCompany: true,
        companyData: [companyData], // Assuming getCompanyDetails returns the details or an error object
        // accessType, // Removed accessType
        error: null
      };
    } catch (error: any) {
      console.error('[CompanyAccessService] Unexpected error checking company access:', error);
      
      // Return default values with error information
      return {
        hasCompany: false,
        companyData: [],
        // accessType: null, // Removed accessType
        error: error.message || 'Unknown error checking company access'
      };
    }
  }

  /**
   * Get company details
   * @param companyId Company ID
   * @returns Company details
   */
  async getCompanyDetails(companyId: string) {
    console.log('[CompanyAccessService] Getting company details for:', companyId);
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
      
      if (error) {
        console.error('[CompanyAccessService] Error fetching company details:', error);
        return {
          id: companyId,
          name: "Error loading company details",
          error: error.message
        };
      }
      
      return data;
    } catch (error: any) {
      console.error('[CompanyAccessService] Unexpected error fetching company details:', error);
      return {
        id: companyId,
        name: "Error loading company details",
        error: error.message || 'Unknown error fetching company details'
      };
    }
  }
}

export const companyAccessService = new CompanyAccessService();
