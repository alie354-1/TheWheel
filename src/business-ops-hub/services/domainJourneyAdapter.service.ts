import { supabase } from "@/lib/supabase";

/**
 * Adapter layer for journey-to-domain translation.
 * Provides functions to map journey steps to business domains and vice versa.
 */

export const domainJourneyAdapter = {
  /**
   * Get all domains for a given journey step, with relevance scores and primary/secondary info.
   * @param stepId The journey step id.
   * @returns Array of { domain, relevance_score, primary_domain }
   */
  async getDomainsForStep(stepId: string) {
    const { data, error } = await supabase
      .from("domain_journey_mapping")
      .select(
        `
        *,
        business_domains (
          id, name, description, icon, color, order_index
        )
        `
      )
      .eq("journey_id", stepId)
      .order("relevance_score", { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      domain: row.business_domains,
      relevance_score: row.relevance_score,
      primary_domain: row.primary_domain,
    }));
  },

  /**
   * Get all journey steps for a given domain, with relevance scores and primary/secondary info.
   * @param domainId The business domain id.
   * @returns Array of { step, relevance_score, primary_domain }
   */
  async getStepsForDomain(domainId: string) {
    const { data, error } = await supabase
      .from("domain_journey_mapping")
      .select(
        `
        *,
        journey_steps (
          id, name, description, phase_id, order_index
        )
        `
      )
      .eq("domain_id", domainId)
      .order("relevance_score", { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      step: row.journey_steps,
      relevance_score: row.relevance_score,
      primary_domain: row.primary_domain,
    }));
  },

  /**
   * Map a journey step to a business domain.
   * @param stepId The journey step id.
   * @param domainId The business domain id.
   * @param relevance_score The relevance score (float).
   * @param primary_domain Boolean indicating if this is the primary domain.
   */
  async mapStepToDomain(stepId: string, domainId: string, relevance_score: number = 1.0, primary_domain: boolean = false) {
    const { data, error } = await supabase
      .from("domain_journey_mapping")
      .insert({
        journey_id: stepId,
        domain_id: domainId,
        relevance_score,
        primary_domain,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Remove a mapping between a journey step and a business domain.
   * @param stepId The journey step id.
   * @param domainId The business domain id.
   */
  async unmapStepFromDomain(stepId: string, domainId: string) {
    const { data, error } = await supabase
      .from("domain_journey_mapping")
      .delete()
      .eq("journey_id", stepId)
      .eq("domain_id", domainId);

    if (error) throw error;
    return data;
  },
};
