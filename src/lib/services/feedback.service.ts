import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface FeedbackItem {
  id?: string;
  userId: string;
  companyId?: string;
  entityType: 'step' | 'tool' | 'resource';
  entityId: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeedbackStats {
  entityId: string;
  averageRating: number;
  ratingCount: number;
  ratings: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
}

export interface ImprovementSuggestion {
  id?: string;
  userId: string;
  companyId?: string;
  entityType: 'step' | 'tool' | 'resource';
  entityId: string;
  category: string;
  title: string;
  description: string;
  impactDescription?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'implemented';
  votes?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SuggestionVote {
  id?: string;
  suggestionId: string;
  userId: string;
  voteType: 'up' | 'down';
  createdAt?: string;
}

/**
 * FeedbackService
 * 
 * This service handles the storage, retrieval, and analysis of user feedback
 * including ratings, comments, and improvement suggestions.
 * 
 * Part of the Sprint 4 User Feedback Collection System.
 */
export class FeedbackService {
  /**
   * Submit a new feedback rating and optional comment
   * 
   * @param feedback The feedback item to submit
   * @returns The created feedback item
   */
  public static async submitFeedback(feedback: FeedbackItem): Promise<FeedbackItem> {
    try {
      // Check if user has already submitted feedback for this entity
      const { data: existingFeedback } = await supabase
        .from('feedback')
        .select('id')
        .eq('user_id', feedback.userId)
        .eq('entity_id', feedback.entityId)
        .eq('entity_type', feedback.entityType)
        .single();
      
      if (existingFeedback) {
        // Update existing feedback
        const { data, error } = await supabase
          .from('feedback')
          .update({
            rating: feedback.rating,
            comment: feedback.comment || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingFeedback.id)
          .select('*')
          .single();
          
        if (error) throw error;
        
        return this.mapFeedbackFromDB(data);
      } else {
        // Insert new feedback
        const { data, error } = await supabase
          .from('feedback')
          .insert({
            user_id: feedback.userId,
            company_id: feedback.companyId || null,
            entity_type: feedback.entityType,
            entity_id: feedback.entityId,
            rating: feedback.rating,
            comment: feedback.comment || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('*')
          .single();
          
        if (error) throw error;
        
        return this.mapFeedbackFromDB(data);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }
  
  /**
   * Get feedback for a specific entity
   * 
   * @param entityId The entity ID
   * @param entityType The entity type
   * @returns Array of feedback items
   */
  public static async getFeedbackForEntity(
    entityId: string,
    entityType: 'step' | 'tool' | 'resource'
  ): Promise<FeedbackItem[]> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('entity_id', entityId)
        .eq('entity_type', entityType)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return (data || []).map(this.mapFeedbackFromDB);
    } catch (error) {
      console.error('Error getting feedback for entity:', error);
      return [];
    }
  }
  
  /**
   * Get feedback statistics for an entity
   * 
   * @param entityId The entity ID
   * @param entityType The entity type
   * @returns Feedback statistics
   */
  public static async getFeedbackStats(
    entityId: string,
    entityType: 'step' | 'tool' | 'resource'
  ): Promise<FeedbackStats> {
    try {
      const { data, error } = await supabase
        .rpc('get_feedback_stats', { 
          p_entity_id: entityId,
          p_entity_type: entityType
        });
        
      if (error) throw error;
      
      if (!data || !data[0]) {
        // Return default stats if no data
        return {
          entityId,
          averageRating: 0,
          ratingCount: 0,
          ratings: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
        };
      }
      
      return {
        entityId,
        averageRating: data[0].average_rating || 0,
        ratingCount: data[0].rating_count || 0,
        ratings: {
          '1': data[0].rating_1_count || 0,
          '2': data[0].rating_2_count || 0,
          '3': data[0].rating_3_count || 0,
          '4': data[0].rating_4_count || 0,
          '5': data[0].rating_5_count || 0
        }
      };
    } catch (error) {
      console.error('Error getting feedback stats:', error);
      
      // Return default stats on error
      return {
        entityId,
        averageRating: 0,
        ratingCount: 0,
        ratings: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
      };
    }
  }
  
  /**
   * Get feedback submitted by the current user for an entity
   * 
   * @param entityId The entity ID
   * @param entityType The entity type
   * @param user The current user
   * @returns The user's feedback item or null if not found
   */
  public static async getUserFeedbackForEntity(
    entityId: string,
    entityType: 'step' | 'tool' | 'resource',
    user: User
  ): Promise<FeedbackItem | null> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('entity_id', entityId)
        .eq('entity_type', entityType)
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned, which is fine
          return null;
        }
        throw error;
      }
      
      return data ? this.mapFeedbackFromDB(data) : null;
    } catch (error) {
      console.error('Error getting user feedback for entity:', error);
      return null;
    }
  }
  
  /**
   * Submit an improvement suggestion
   * 
   * @param suggestion The improvement suggestion to submit
   * @returns The created suggestion
   */
  public static async submitImprovementSuggestion(
    suggestion: ImprovementSuggestion
  ): Promise<ImprovementSuggestion> {
    try {
      const { data, error } = await supabase
        .from('improvement_suggestions')
        .insert({
          user_id: suggestion.userId,
          company_id: suggestion.companyId || null,
          entity_type: suggestion.entityType,
          entity_id: suggestion.entityId,
          category: suggestion.category,
          title: suggestion.title,
          description: suggestion.description,
          impact_description: suggestion.impactDescription || null,
          status: 'pending',
          votes: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      return this.mapSuggestionFromDB(data);
    } catch (error) {
      console.error('Error submitting improvement suggestion:', error);
      throw error;
    }
  }
  
  /**
   * Get improvement suggestions for an entity
   * 
   * @param entityId The entity ID
   * @param entityType The entity type
   * @param status Optional status filter
   * @returns Array of improvement suggestions
   */
  public static async getImprovementSuggestions(
    entityId: string,
    entityType: 'step' | 'tool' | 'resource',
    status?: 'pending' | 'approved' | 'rejected' | 'implemented'
  ): Promise<ImprovementSuggestion[]> {
    try {
      let query = supabase
        .from('improvement_suggestions')
        .select('*')
        .eq('entity_id', entityId)
        .eq('entity_type', entityType);
        
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query.order('votes', { ascending: false });
        
      if (error) throw error;
      
      return (data || []).map(this.mapSuggestionFromDB);
    } catch (error) {
      console.error('Error getting improvement suggestions:', error);
      return [];
    }
  }
  
  /**
   * Vote on an improvement suggestion
   * 
   * @param suggestionId The suggestion ID
   * @param userId The user ID
   * @param voteType The vote type ('up' or 'down')
   * @returns Boolean indicating success
   */
  public static async voteOnSuggestion(
    suggestionId: string,
    userId: string,
    voteType: 'up' | 'down'
  ): Promise<boolean> {
    try {
      // Check for existing vote
      const { data: existingVote } = await supabase
        .from('suggestion_votes')
        .select('id, vote_type')
        .eq('suggestion_id', suggestionId)
        .eq('user_id', userId)
        .single();
      
      // Start a transaction
      const { error: txError } = await supabase.rpc('vote_on_suggestion', {
        p_suggestion_id: suggestionId,
        p_user_id: userId,
        p_vote_type: voteType,
        p_previous_vote_type: existingVote?.vote_type || null
      });
      
      if (txError) throw txError;
      
      return true;
    } catch (error) {
      console.error('Error voting on suggestion:', error);
      return false;
    }
  }
  
  /**
   * Check if a user has voted on a suggestion
   * 
   * @param suggestionId The suggestion ID
   * @param userId The user ID
   * @returns The vote type or null if no vote
   */
  public static async getUserVoteOnSuggestion(
    suggestionId: string,
    userId: string
  ): Promise<'up' | 'down' | null> {
    try {
      const { data, error } = await supabase
        .from('suggestion_votes')
        .select('vote_type')
        .eq('suggestion_id', suggestionId)
        .eq('user_id', userId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned, which is fine
          return null;
        }
        throw error;
      }
      
      return data?.vote_type as 'up' | 'down' | null;
    } catch (error) {
      console.error('Error getting user vote on suggestion:', error);
      return null;
    }
  }
  
  // Private helper methods
  
  /**
   * Map a feedback DB row to a FeedbackItem
   * @private
   */
  private static mapFeedbackFromDB(dbRow: any): FeedbackItem {
    return {
      id: dbRow.id,
      userId: dbRow.user_id,
      companyId: dbRow.company_id,
      entityType: dbRow.entity_type,
      entityId: dbRow.entity_id,
      rating: dbRow.rating,
      comment: dbRow.comment,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at
    };
  }
  
  /**
   * Map a suggestion DB row to an ImprovementSuggestion
   * @private
   */
  private static mapSuggestionFromDB(dbRow: any): ImprovementSuggestion {
    return {
      id: dbRow.id,
      userId: dbRow.user_id,
      companyId: dbRow.company_id,
      entityType: dbRow.entity_type,
      entityId: dbRow.entity_id,
      category: dbRow.category,
      title: dbRow.title,
      description: dbRow.description,
      impactDescription: dbRow.impact_description,
      status: dbRow.status,
      votes: dbRow.votes,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at
    };
  }
}
