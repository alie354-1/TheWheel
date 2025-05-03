import { JourneyChallenge, challenge_status, CompanyChallengeProgress } from '../types/journey-challenges.types';
import { supabase } from '../supabase';

/**
 * JourneyChallengesService
 * 
 * Service for managing journey challenges, progress tracking, and related functionality.
 */
export class JourneyChallengesService {
  /**
   * Fetches all journey phases
   */
  static async getPhases() {
    try {
      const { data, error } = await supabase
        .from('journey_phases')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching journey phases:', error);
      throw error;
    }
  }

  /**
   * Fetches challenges, optionally filtered by phase
   */
  static async getChallenges(phaseId?: string) {
    try {
      let query = supabase
        .from('journey_challenges')
        .select('*')
        .order('order_index');
      
      if (phaseId) {
        query = query.eq('phase_id', phaseId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  }

  /**
   * Fetches a single challenge by ID
   */
  static async getChallenge(challengeId: string): Promise<JourneyChallenge> {
    try {
      const { data, error } = await supabase
        .from('journey_challenges')
        .select('*')
        .eq('id', challengeId)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Challenge not found');
      
      return data as JourneyChallenge;
    } catch (error) {
      console.error(`Error fetching challenge ${challengeId}:`, error);
      throw error;
    }
  }

  /**
   * Fetches a company's progress on all challenges
   */
  static async getCompanyProgress(companyId: string): Promise<Record<string, CompanyChallengeProgress>> {
    try {
      const { data, error } = await supabase
        .from('company_challenge_progress')
        .select('*')
        .eq('company_id', companyId);
      
      if (error) throw error;
      
      // Convert array to map with challenge_id as key
      const progressMap: Record<string, CompanyChallengeProgress> = {};
      (data || []).forEach(progress => {
        progressMap[progress.challenge_id] = progress;
      });
      
      return progressMap;
    } catch (error) {
      console.error(`Error fetching progress for company ${companyId}:`, error);
      throw error;
    }
  }

  /**
   * Updates a challenge's status for a company
   */
  static async updateChallengeStatus(
    companyId: string, 
    challengeId: string, 
    status: challenge_status,
    notes?: string
  ) {
    try {
      // Check if a progress record already exists
      const { data: existingData } = await supabase
        .from('company_challenge_progress')
        .select('*')
        .eq('company_id', companyId)
        .eq('challenge_id', challengeId)
        .maybeSingle();
      
      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('company_challenge_progress')
          .update({
            status,
            notes: notes !== undefined ? notes : existingData.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id);
        
        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('company_challenge_progress')
          .insert({
            company_id: companyId,
            challenge_id: challengeId,
            status,
            notes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error(`Error updating challenge status:`, error);
      throw error;
    }
  }
  
  /**
   * Fetches tool recommendations for a challenge
   */
  static async getChallengeTools(challengeId: string) {
    try {
      const { data, error } = await supabase
        .from('challenge_tool_recommendations')
        .select(`
          *,
          tool:tool_id (*)
        `)
        .eq('challenge_id', challengeId)
        .order('relevance_score', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching tools for challenge ${challengeId}:`, error);
      throw error;
    }
  }
  
  /**
   * Creates a new challenge
   */
  static async createChallenge(challenge: Partial<JourneyChallenge>): Promise<JourneyChallenge> {
    try {
      const { data, error } = await supabase
        .from('journey_challenges')
        .insert({
          ...challenge,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as JourneyChallenge;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  }
  
  /**
   * Updates an existing challenge
   */
  static async updateChallenge(challengeId: string, updates: Partial<JourneyChallenge>): Promise<JourneyChallenge> {
    try {
      const { data, error } = await supabase
        .from('journey_challenges')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', challengeId)
        .select()
        .single();
      
      if (error) throw error;
      return data as JourneyChallenge;
    } catch (error) {
      console.error(`Error updating challenge ${challengeId}:`, error);
      throw error;
    }
  }

  /**
   * Fetches summary metrics for a company's journey progress
   */
  static async getCompanyProgressSummary(companyId: string) {
    try {
      // Get all challenges
      const { data: challenges, error: challengesError } = await supabase
        .from('journey_challenges')
        .select('id, phase_id');
      
      if (challengesError) throw challengesError;
      
      // Get company progress
      const progressMap = await this.getCompanyProgress(companyId);
      
      // Get all phases
      const phases = await this.getPhases();
      
      // Calculate metrics
      const result = {
        total_challenges: challenges?.length || 0,
        completed_challenges: 0,
        in_progress_challenges: 0,
        skipped_challenges: 0,
        not_started_challenges: 0,
        phases: {} as Record<string, {
          total: number;
          completed: number;
          in_progress: number;
          skipped: number;
          not_started: number;
        }>
      };
      
      // Initialize phase metrics
      phases.forEach(phase => {
        result.phases[phase.id] = {
          total: 0,
          completed: 0,
          in_progress: 0,
          skipped: 0,
          not_started: 0
        };
      });
      
      // Count challenges by status
      challenges?.forEach(challenge => {
        const phaseId = challenge.phase_id;
        const progress = progressMap[challenge.id];
        const status = progress?.status || 'not_started';
        
        // Increment total for phase
        result.phases[phaseId].total++;
        
        // Increment status counts
        switch (status) {
          case 'completed':
            result.completed_challenges++;
            result.phases[phaseId].completed++;
            break;
          case 'in_progress':
            result.in_progress_challenges++;
            result.phases[phaseId].in_progress++;
            break;
          case 'skipped':
            result.skipped_challenges++;
            result.phases[phaseId].skipped++;
            break;
          case 'not_started':
          default:
            result.not_started_challenges++;
            result.phases[phaseId].not_started++;
            break;
        }
      });
      
      return result;
    } catch (error) {
      console.error(`Error calculating progress summary for company ${companyId}:`, error);
      throw error;
    }
  }
}
