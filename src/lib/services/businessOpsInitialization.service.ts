import { supabase } from "../supabase";

export interface BusinessOpsInitOptions {
  companyId: string;
  userId: string;
  industries: string[];
  businessModel?: string;
}

/**
 * Service to initialize the Business Operations Hub for a newly created company.
 * This should be called after company and company_members records are created.
 */
export class BusinessOpsInitializationService {
  /**
   * Initialize the Business Operations Hub for a newly created company.
   * Calls the Supabase RPC function to set up domains, mappings, and workspaces.
   */
  public static async initializeForCompany(options: BusinessOpsInitOptions): Promise<void> {
    const { companyId, userId, industries } = options;

    // Call the backend function to initialize the hub
    const { error } = await supabase.rpc('initialize_business_ops_hub', {
      p_company_id: companyId,
      p_user_id: userId,
      p_industries: industries
    });

    if (error) throw error;

    // Log initialization event
    await this.logInitializationEvent(companyId, userId);
  }

  /**
   * Log the initialization event for auditing.
   */
  private static async logInitializationEvent(companyId: string, userId: string): Promise<void> {
    await supabase.from('decision_events').insert({
      company_id: companyId,
      user_id: userId,
      event_type: 'business_ops_hub_initialized',
      context: {
        timestamp: new Date().toISOString()
      }
    });
  }
}
