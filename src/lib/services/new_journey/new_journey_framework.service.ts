/**
 * New Journey System: Framework Service
 * 
 * Manages the canonical journey framework for the new system, including:
 * - Fetching canonical phases, domains, and steps.
 */

import { supabase } from '../../supabase';
import {
  NewJourneyPhase,
  NewJourneyDomain,
  NewJourneyStep,
  NewDifficulty
} from '../../types/new_journey.types';

export const newJourneyFrameworkService = {
  /**
   * Get all canonical phases for the new journey system.
   */
  async getPhases(): Promise<NewJourneyPhase[]> {
    console.log('DEBUG: getPhases called');
    
    try {
      const { data, error } = await supabase
        .from('journey_phases_new')
        .select('*')
        .order('order_index');

      console.log('DEBUG: Phases query response received');
      console.log('DEBUG: Phases data length:', data ? data.length : 0);
      console.log('DEBUG: Phases error:', error ? JSON.stringify(error) : 'None');
      
      if (error) {
        console.error('DEBUG: Phases error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      return data || [];
    } catch (e) {
      console.error('DEBUG: Exception during phases query:', e);
      throw e;
    }
  },

  /**
   * Get all canonical domains for the new journey system.
   */
  async getDomains(): Promise<NewJourneyDomain[]> {
    console.log('DEBUG: getDomains called');
    
    try {
      const { data, error } = await supabase
        .from('journey_domains_new')
        .select('*')
        .order('name');

      console.log('DEBUG: Domains query response received');
      console.log('DEBUG: Domains data length:', data ? data.length : 0);
      console.log('DEBUG: Domains error:', error ? JSON.stringify(error) : 'None');
      
      if (error) {
        console.error('DEBUG: Domains error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      return data || [];
    } catch (e) {
      console.error('DEBUG: Exception during domains query:', e);
      throw e;
    }
  },

  /**
   * Get all canonical framework steps for the new journey system.
   * Simplified to just fetch all steps without filtering for now.
   */
  async getFrameworkSteps(): Promise<NewJourneyStep[]> {
    console.log('DEBUG: getFrameworkSteps called - fetching all canonical steps');
    
    try {
      console.log('DEBUG: Executing query for all canonical steps...');
      const { data, error } = await supabase
        .from('journey_canonical_steps')
        .select(`
          *,
          journey_phases_new(id, name, color),
          journey_domains_new(id, name, color)
        `)
        .eq('is_active', true)
        .order('order_index');
      
      console.log('DEBUG: Query response received');
      console.log('DEBUG: Response data length:', data ? data.length : 0);
      console.log('DEBUG: Response error:', error ? JSON.stringify(error) : 'None');
      
      if (error) {
        console.error('DEBUG: Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log('DEBUG: First few results:', data ? data.slice(0, 3) : []);
      return data || [];
    } catch (e) {
      console.error('DEBUG: Exception during query execution:', e);
      throw e;
    }
  },
};
