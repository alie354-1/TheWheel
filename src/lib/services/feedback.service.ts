import { supabase } from '../supabase';

/**
 * Feedback Service
 * 
 * Provides methods for managing user feedback for journey steps and tools.
 */
export class FeedbackService {
  
  /**
   * Submit feedback for a journey step
   */
  async submitStepFeedback(
    stepId: string,
    companyId: string,
    userId: string,
    feedback: {
      ratingClarity?: number;
      ratingDifficulty?: number;
      ratingUsefulness?: number;
      ratingOverall?: number;
      feedbackText?: string;
      improvementSuggestion?: string;
      reportedIssues?: string;
      screenshotUrls?: string[];
    }
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('step_feedback')
        .insert({
          step_id: stepId,
          company_id: companyId,
          user_id: userId,
          rating_clarity: feedback.ratingClarity,
          rating_difficulty: feedback.ratingDifficulty,
          rating_usefulness: feedback.ratingUsefulness,
          rating_overall: feedback.ratingOverall,
          feedback_text: feedback.feedbackText,
          improvement_suggestion: feedback.improvementSuggestion,
          reported_issues: feedback.reportedIssues,
          screenshot_urls: feedback.screenshotUrls,
        })
        .select('id')
        .single();
        
      if (error) throw error;
      
      return data.id;
    } catch (error) {
      console.error('Error submitting step feedback:', error);
      return null;
    }
  }

  /**
   * Get feedback for a step
   */
  async getStepFeedback(
    stepId: string,
    companyId: string,
    options: {
      limit?: number;
      offset?: number;
      includeResolutions?: boolean;
      includeCategories?: boolean;
    } = {}
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('step_feedback')
        .select(`
          *,
          user:user_id(id, email, display_name),
          ${options.includeResolutions ? 'resolution:feedback_resolutions(*),' : ''}
          ${options.includeCategories ? 'categories:feedback_category_assignments(*, category:feedback_categories(*))' : ''}
        `)
        .eq('step_id', stepId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
        
      if (options.limit) {
        const offset = options.offset || 0;
        query = query.range(offset, offset + options.limit - 1);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting step feedback:', error);
      return [];
    }
  }

  /**
   * Get average ratings for a step
   */
  async getStepAverageRatings(stepId: string): Promise<{
    avgClarity: number;
    avgDifficulty: number;
    avgUsefulness: number;
    avgOverall: number;
    totalRatings: number;
  } | null> {
    try {
      const { data, error } = await supabase
        .rpc('calculate_step_average_ratings', {
          p_step_id: stepId
        });
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting step average ratings:', error);
      return null;
    }
  }

  /**
   * Submit tool feedback
   */
  async submitToolFeedback(
    toolId: string,
    companyId: string,
    userId: string,
    feedback: {
      stepId?: string;
      ratingEaseOfUse?: number;
      ratingFunctionality?: number;
      ratingValue?: number;
      ratingOverall?: number;
      pros?: string;
      cons?: string;
      reviewText?: string;
      wouldRecommend?: boolean;
    }
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('tool_feedback')
        .insert({
          tool_id: toolId,
          company_id: companyId,
          user_id: userId,
          step_id: feedback.stepId,
          rating_ease_of_use: feedback.ratingEaseOfUse,
          rating_functionality: feedback.ratingFunctionality,
          rating_value: feedback.ratingValue,
          rating_overall: feedback.ratingOverall,
          pros: feedback.pros,
          cons: feedback.cons,
          review_text: feedback.reviewText,
          would_recommend: feedback.wouldRecommend
        })
        .select('id')
        .single();
        
      if (error) throw error;
      
      return data.id;
    } catch (error) {
      console.error('Error submitting tool feedback:', error);
      return null;
    }
  }

  /**
   * Get tool feedback
   */
  async getToolFeedback(
    toolId: string,
    options: {
      companyId?: string;
      stepId?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('tool_feedback')
        .select(`
          *,
          user:user_id(id, email, display_name)
        `)
        .eq('tool_id', toolId)
        .order('created_at', { ascending: false });
        
      if (options.companyId) {
        query = query.eq('company_id', options.companyId);
      }
      
      if (options.stepId) {
        query = query.eq('step_id', options.stepId);
      }
      
      if (options.limit) {
        const offset = options.offset || 0;
        query = query.range(offset, offset + options.limit - 1);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting tool feedback:', error);
      return [];
    }
  }

  /**
   * Get average ratings for a tool
   */
  async getToolAverageRatings(toolId: string): Promise<{
    avgEaseOfUse: number;
    avgFunctionality: number;
    avgValue: number;
    avgOverall: number;
    recommendationPercentage: number;
    totalRatings: number;
  } | null> {
    try {
      const { data, error } = await supabase
        .rpc('calculate_tool_average_ratings', {
          p_tool_id: toolId
        });
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting tool average ratings:', error);
      return null;
    }
  }

  /**
   * Add category to feedback
   */
  async addFeedbackCategory(
    feedbackId: string,
    categoryId: string,
    assignedBy?: string,
    confidenceScore?: number,
    isAutoAssigned = false
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('feedback_category_assignments')
        .insert({
          feedback_id: feedbackId,
          category_id: categoryId,
          assigned_by: assignedBy,
          confidence_score: confidenceScore,
          is_auto_assigned: isAutoAssigned
        });
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error adding feedback category:', error);
      return false;
    }
  }

  /**
   * Remove category from feedback
   */
  async removeFeedbackCategory(
    feedbackId: string,
    categoryId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('feedback_category_assignments')
        .delete()
        .eq('feedback_id', feedbackId)
        .eq('category_id', categoryId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error removing feedback category:', error);
      return false;
    }
  }

  /**
   * Update feedback resolution status
   */
  async updateFeedbackResolution(
    feedbackId: string,
    status: 'open' | 'in_progress' | 'resolved' | 'wont_fix' | 'duplicate',
    resolvedBy?: string,
    resolutionNote?: string
  ): Promise<boolean> {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      };
      
      if (resolvedBy) {
        updates.resolved_by = resolvedBy;
      }
      
      if (resolutionNote) {
        updates.resolution_note = resolutionNote;
      }
      
      if (status === 'resolved') {
        updates.resolution_date = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('feedback_resolutions')
        .update(updates)
        .eq('feedback_id', feedbackId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating feedback resolution:', error);
      return false;
    }
  }

  /**
   * Get feedback categories
   */
  async getFeedbackCategories(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('feedback_categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting feedback categories:', error);
      return [];
    }
  }

  /**
   * Get feedback summary for steps in a company
   */
  async getFeedbackSummaryByStep(companyId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('feedback_summary_by_step')
        .select('*')
        .order('total_feedback', { ascending: false });
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting feedback summary by step:', error);
      return [];
    }
  }

  /**
   * Get trending feedback issues
   */
  async getTrendingFeedbackIssues(companyId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('trending_feedback_issues')
        .select('*')
        .limit(10);
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting trending feedback issues:', error);
      return [];
    }
  }

  /**
   * Create a feedback notification
   */
  async createFeedbackNotification(
    feedbackId: string,
    feedbackType: 'step' | 'tool',
    userId: string,
    eventType: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('feedback_notifications')
        .insert({
          feedback_id: feedbackId,
          feedback_type: feedbackType,
          user_id: userId,
          event_type: eventType,
          is_read: false
        });
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error creating feedback notification:', error);
      return false;
    }
  }

  /**
   * Mark feedback notification as read
   */
  async markFeedbackNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('feedback_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error marking feedback notification as read:', error);
      return false;
    }
  }
}

// Create an instance to export
export const feedbackService = new FeedbackService();
