/**
 * New Journey System: Admin Service
 * 
 * This service provides all the necessary methods for administrators to manage
 * the new journey system's content, including phases, domains, and step templates.
 * All methods interact exclusively with the `_new` database tables.
 */

import { supabase } from '../../supabase';
import {
  NewJourneyPhase,
  NewJourneyDomain,
  NewJourneyStep
} from '../../types/new_journey.types';

export const newJourneyAdminService = {
  // =============================
  // PHASE MANAGEMENT
  // =============================

  async getPhases(): Promise<NewJourneyPhase[]> {
    const { data, error } = await supabase.from('journey_phases_new').select('*').order('order_index');
    if (error) throw error;
    return data;
  },

  async upsertPhase(phase: Partial<NewJourneyPhase>): Promise<NewJourneyPhase[]> {
    const { data, error } = await supabase.from('journey_phases_new').upsert(phase).select();
    if (error) throw error;
    return data;
  },

  async deletePhase(id: string): Promise<void> {
    const { error } = await supabase.from('journey_phases_new').delete().eq('id', id);
    if (error) throw error;
  },

  // =============================
  // DOMAIN MANAGEMENT
  // =============================

  async getDomains(): Promise<NewJourneyDomain[]> {
    const { data, error } = await supabase.from('journey_domains_new').select('*').order('name');
    if (error) throw error;
    return data;
  },

  async upsertDomain(domain: Partial<NewJourneyDomain>): Promise<NewJourneyDomain[]> {
    const { data, error } = await supabase.from('journey_domains_new').upsert(domain).select();
    if (error) throw error;
    return data;
  },

  async deleteDomain(id: string): Promise<void> {
    const { error } = await supabase.from('journey_domains_new').delete().eq('id', id);
    if (error) throw error;
  },

  // =============================
  // STEP TEMPLATE MANAGEMENT
  // =============================

  async getStepTemplates(): Promise<NewJourneyStep[]> {
    const { data, error } = await supabase.from('journey_canonical_steps').select('*').order('name');
    if (error) throw error;
    return data;
  },

  async upsertStepTemplate(step: Partial<NewJourneyStep>): Promise<NewJourneyStep[]> {
    const { data, error } = await supabase.from('journey_canonical_steps').upsert(step).select();
    if (error) throw error;
    return data;
  },

  async deleteStepTemplate(id: string): Promise<void> {
    const { error } = await supabase.from('journey_canonical_steps').delete().eq('id', id);
    if (error) throw error;
  }
};
