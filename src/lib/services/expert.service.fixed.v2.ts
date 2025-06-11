import { supabase } from '../supabase';
import { ExpertProfile, ExpertEndorsement, ExpertResponse } from '../types/community.types';

/**
 * Expert Service
 * 
 * Provides methods for managing expert profiles, endorsements, and expert responses.
 */
class ExpertService {
  /**
   * Get an expert profile by user ID
   * 
   * @param userId The ID of the user
   * @returns The expert profile or null if not found
   */
  async getExpertProfile(userId: string): Promise<ExpertProfile | null> {
    try {
      const { data, error } = await supabase
        .from('expert_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        // If the error is "No rows found", return null
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting expert profile:', error);
      throw error;
    }
  }
  
  /**
   * Create or update an expert profile
   * 
   * @param profile The expert profile data
   * @returns The created or updated expert profile
   */
  async upsertExpertProfile(profile: Partial<ExpertProfile>): Promise<ExpertProfile> {
    try {
      // Check if profile exists
      const existingProfile = profile.user_id 
        ? await this.getExpertProfile(profile.user_id)
        : null;
      
      if (existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('expert_profiles')
          .update({
            ...profile,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProfile.id)
          .select('*')
          .single();
          
        if (error) throw error;
        return data;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('expert_profiles')
          .insert({
            ...profile,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('*')
          .single();
          
        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error upserting expert profile:', error);
      throw error;
    }
  }
  
  /**
   * Delete an expert profile
   * 
   * @param userId The ID of the user
   * @returns True if successful, false otherwise
   */
  async deleteExpertProfile(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('expert_profiles')
        .delete()
        .eq('user_id', userId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting expert profile:', error);
      throw error;
    }
  }
  
  /**
   * Get endorsements for an expert
   * 
   * @param expertId The ID of the expert
   * @returns Array of endorsements
   */
  async getExpertEndorsements(expertId: string): Promise<ExpertEndorsement[]> {
    try {
      const { data, error } = await supabase
        .from('expert_endorsements')
        .select(`
          *,
          endorser:endorser_id (
            id,
            email
          )
        `)
        .eq('expert_id', expertId);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting expert endorsements:', error);
      throw error;
    }
  }
  
  /**
   * Add an endorsement for an expert
   * 
   * @param endorsement The endorsement data
   * @returns The created endorsement
   */
  async addEndorsement(endorsement: Partial<ExpertEndorsement>): Promise<ExpertEndorsement> {
    try {
      const { data, error } = await supabase
        .from('expert_endorsements')
        .insert({
          ...endorsement,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding endorsement:', error);
      throw error;
    }
  }
  
  /**
   * Update an endorsement
   * 
   * @param endorsementId The ID of the endorsement
   * @param updates The updates to apply
   * @returns The updated endorsement
   */
  async updateEndorsement(
    endorsementId: string, 
    updates: Partial<ExpertEndorsement>
  ): Promise<ExpertEndorsement> {
    try {
      const { data, error } = await supabase
        .from('expert_endorsements')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', endorsementId)
        .select('*')
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating endorsement:', error);
      throw error;
    }
  }
  
  /**
   * Delete an endorsement
   * 
   * @param endorsementId The ID of the endorsement
   * @returns True if successful, false otherwise
   */
  async deleteEndorsement(endorsementId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('expert_endorsements')
        .delete()
        .eq('id', endorsementId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting endorsement:', error);
      throw error;
    }
  }
  
  /**
   * Get expert responses for a thread
   * 
   * @param threadId The ID of the thread
   * @returns Array of expert responses
   */
  async getExpertResponsesForThread(threadId: string): Promise<ExpertResponse[]> {
    try {
      const { data, error } = await supabase
        .from('expert_responses')
        .select(`
          *,
          expert:expert_id (
            id,
            email
          ),
          verifier:verified_by (
            id,
            email
          )
        `)
        .eq('thread_id', threadId);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting expert responses for thread:', error);
      throw error;
    }
  }
  
  /**
   * Get expert response for a reply
   * 
   * @param replyId The ID of the reply
   * @returns The expert response or null if not found
   */
  async getExpertResponseForReply(replyId: string): Promise<ExpertResponse | null> {
    try {
      const { data, error } = await supabase
        .from('expert_responses')
        .select(`
          *,
          expert:expert_id (
            id,
            email
          ),
          verifier:verified_by (
            id,
            email
          )
        `)
        .eq('reply_id', replyId)
        .single();
        
      if (error) {
        // If the error is "No rows found", return null
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting expert response for reply:', error);
      throw error;
    }
  }
  
  /**
   * Mark a reply as an expert response
   * 
   * @param expertResponse The expert response data
   * @returns The created expert response
   */
  async markAsExpertResponse(expertResponse: Partial<ExpertResponse>): Promise<ExpertResponse> {
    try {
      // First, update the thread_replies table
      const { error: replyError } = await supabase
        .from('thread_replies')
        .update({
          is_expert_response: true,
          expert_confidence_score: expertResponse.confidence_score
        })
        .eq('id', expertResponse.reply_id);
        
      if (replyError) throw replyError;
      
      // Then, create the expert response
      const { data, error } = await supabase
        .from('expert_responses')
        .insert({
          ...expertResponse,
          created_at: new Date().toISOString()
        })
        .select('*')
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error marking as expert response:', error);
      throw error;
    }
  }
  
  /**
   * Remove expert response status from a reply
   * 
   * @param replyId The ID of the reply
   * @returns True if successful, false otherwise
   */
  async removeExpertResponse(replyId: string): Promise<boolean> {
    try {
      // First, delete the expert response
      const { error: responseError } = await supabase
        .from('expert_responses')
        .delete()
        .eq('reply_id', replyId);
        
      if (responseError) throw responseError;
      
      // Then, update the thread_replies table
      const { error: replyError } = await supabase
        .from('thread_replies')
        .update({
          is_expert_response: false,
          expert_confidence_score: null
        })
        .eq('id', replyId);
        
      if (replyError) throw replyError;
      
      return true;
    } catch (error) {
      console.error('Error removing expert response:', error);
      throw error;
    }
  }
  
  /**
   * Verify an expert response
   * 
   * @param responseId The ID of the expert response
   * @param verifierId The ID of the verifier
   * @returns The updated expert response
   */
  async verifyExpertResponse(
    responseId: string, 
    verifierId: string
  ): Promise<ExpertResponse> {
    try {
      const { data, error } = await supabase
        .from('expert_responses')
        .update({
          verification_status: 'verified',
          verified_by: verifierId,
          verified_at: new Date().toISOString()
        })
        .eq('id', responseId)
        .select('*')
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error verifying expert response:', error);
      throw error;
    }
  }
  
  /**
   * Dispute an expert response
   * 
   * @param responseId The ID of the expert response
   * @param verifierId The ID of the verifier
   * @returns The updated expert response
   */
  async disputeExpertResponse(
    responseId: string, 
    verifierId: string
  ): Promise<ExpertResponse> {
    try {
      const { data, error } = await supabase
        .from('expert_responses')
        .update({
          verification_status: 'disputed',
          verified_by: verifierId,
          verified_at: new Date().toISOString()
        })
        .eq('id', responseId)
        .select('*')
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error disputing expert response:', error);
      throw error;
    }
  }
  
  /**
   * Get top experts by endorsement count
   * 
   * @param limit The maximum number of experts to return
   * @returns Array of expert profiles with endorsement counts
   */
  async getTopExperts(limit: number = 10): Promise<any[]> {
    try {
      console.log('Getting top experts, limit:', limit);
      
      // MODIFIED: Instead of using RPC, directly query the expert_profiles table
      // FIXED: Removed user_metadata from the query since it doesn't exist
      const { data: expertProfiles, error: profilesError } = await supabase
        .from('expert_profiles')
        .select(`
          *,
          user:user_id (
            id,
            email
          )
        `)
        .limit(limit);
        
      if (profilesError) {
        console.error('Error fetching expert profiles:', profilesError);
        throw profilesError;
      }
      
      console.log('Expert profiles found:', expertProfiles?.length || 0);
      
      // If no expert profiles found, return empty array
      if (!expertProfiles || expertProfiles.length === 0) {
        return [];
      }
      
      // Get endorsement counts for each expert
      const expertIds = expertProfiles.map(profile => profile.user_id);
      
      // Try to get endorsement counts, but don't fail if it doesn't work
      let endorsementCounts: Record<string, number> = {};
      try {
        const { data: endorsements, error: endorsementsError } = await supabase
          .from('expert_endorsements')
          .select('expert_id')
          .in('expert_id', expertIds);
          
        if (!endorsementsError && endorsements) {
          // Count endorsements for each expert
          endorsementCounts = endorsements.reduce((counts: Record<string, number>, endorsement) => {
            const expertId = endorsement.expert_id;
            counts[expertId] = (counts[expertId] || 0) + 1;
            return counts;
          }, {});
        }
      } catch (error) {
        console.error('Error getting endorsement counts, continuing anyway:', error);
      }
      
      // Combine the expert profiles with endorsement counts
      const expertsWithCounts = expertProfiles.map(profile => {
        return {
          ...profile,
          endorsement_count: endorsementCounts[profile.user_id] || 0,
          // Add user_name for convenience - using email as fallback
          user_name: profile.user?.email ? profile.user.email.split('@')[0] : 'Expert',
          // Add placeholder avatar URL
          user_avatar_url: null
        };
      });
      
      // Sort by endorsement count (descending)
      return expertsWithCounts.sort((a, b) => b.endorsement_count - a.endorsement_count);
    } catch (error) {
      console.error('Error getting top experts:', error);
      throw error;
    }
  }
  
  /**
   * Get expertise areas with counts
   * 
   * @param limit The maximum number of areas to return
   * @returns Array of expertise areas with counts
   */
  async getExpertiseAreas(limit: number = 20): Promise<any[]> {
    try {
      // MODIFIED: Instead of using RPC, directly query the expert_profiles table
      const { data: expertProfiles, error: profilesError } = await supabase
        .from('expert_profiles')
        .select('primary_expertise_areas, secondary_expertise_areas');
        
      if (profilesError) throw profilesError;
      
      if (!expertProfiles || expertProfiles.length === 0) {
        return [];
      }
      
      // Extract all expertise areas
      const allAreas: string[] = [];
      
      expertProfiles.forEach(profile => {
        if (profile.primary_expertise_areas) {
          allAreas.push(...profile.primary_expertise_areas);
        }
        if (profile.secondary_expertise_areas) {
          allAreas.push(...profile.secondary_expertise_areas);
        }
      });
      
      // Count occurrences of each area
      const areaCounts: Record<string, number> = {};
      allAreas.forEach(area => {
        if (area) {
          areaCounts[area] = (areaCounts[area] || 0) + 1;
        }
      });
      
      // Convert to array and sort
      const result = Object.entries(areaCounts)
        .map(([area, count]) => ({ area, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
        
      return result;
    } catch (error) {
      console.error('Error getting expertise areas:', error);
      throw error;
    }
  }
}

export const expertService = new ExpertService();
