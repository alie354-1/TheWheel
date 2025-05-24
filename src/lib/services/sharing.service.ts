import { supabase } from '../supabase';
import { 
  SharedJourneyReport,
  StepRecommendation,
  JourneyStep 
} from '../types/journey-unified.types';

/**
 * Sharing Service
 * 
 * Provides methods for sharing journey progress, reports, and recommendations
 * between users and companies.
 */
export class SharingService {
  
  /**
   * Create a shareable journey report
   */
  async createSharedReport(
    companyId: string,
    creatorId: string,
    title: string,
    description?: string,
    includedPhases?: string[],
    includedSteps?: string[],
    accessType: 'public' | 'company' | 'private' | 'specific_users' = 'private',
    allowedUsers?: string[],
    displayOptions?: Record<string, any>,
    expirationDate?: string
  ): Promise<SharedJourneyReport | null> {
    try {
      const { data, error } = await supabase
        .from('shared_journey_reports')
        .insert({
          company_id: companyId,
          creator_id: creatorId,
          title,
          description,
          included_phases: includedPhases || [],
          included_steps: includedSteps || [],
          access_type: accessType,
          allowed_users: allowedUsers || [],
          display_options: displayOptions || {},
          expiration_date: expirationDate
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      // Generate a public token for the report if it's public
      if (accessType === 'public') {
        await this.generateReportPublicToken(data.id);
      }
      
      return data as SharedJourneyReport;
    } catch (error) {
      console.error('Error creating shared report:', error);
      return null;
    }
  }

  /**
   * Get a shared report by ID
   */
  async getSharedReport(reportId: string): Promise<SharedJourneyReport | null> {
    try {
      const { data, error } = await supabase
        .from('shared_journey_reports')
        .select('*')
        .eq('id', reportId)
        .single();
        
      if (error) throw error;
      
      return data as SharedJourneyReport;
    } catch (error) {
      console.error('Error getting shared report:', error);
      return null;
    }
  }

  /**
   * Get a shared report by public token
   */
  async getSharedReportByToken(token: string): Promise<SharedJourneyReport | null> {
    try {
      const { data, error } = await supabase
        .from('shared_journey_reports')
        .select('*')
        .eq('public_token', token)
        .single();
        
      if (error) throw error;
      
      // Check if report has expired
      if (data.expiration_date && new Date(data.expiration_date) < new Date()) {
        throw new Error('Report has expired');
      }
      
      return data as SharedJourneyReport;
    } catch (error) {
      console.error('Error getting shared report by token:', error);
      return null;
    }
  }

  /**
   * Update a shared report
   */
  async updateSharedReport(
    reportId: string,
    updates: Partial<SharedJourneyReport>
  ): Promise<SharedJourneyReport | null> {
    try {
      const { data, error } = await supabase
        .from('shared_journey_reports')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)
        .select('*')
        .single();
        
      if (error) throw error;
      
      return data as SharedJourneyReport;
    } catch (error) {
      console.error('Error updating shared report:', error);
      return null;
    }
  }

  /**
   * Delete a shared report
   */
  async deleteSharedReport(reportId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('shared_journey_reports')
        .delete()
        .eq('id', reportId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting shared report:', error);
      return false;
    }
  }

  /**
   * Generate a public token for a report
   */
  async generateReportPublicToken(reportId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .rpc('generate_journey_report_link', { p_report_id: reportId });
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error generating report public token:', error);
      return null;
    }
  }

  /**
   * Get all reports shared with a specific user
   */
  async getReportsSharedWithUser(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<SharedJourneyReport[]> {
    try {
      const { data, error } = await supabase
        .from('shared_journey_reports')
        .select('*')
        .or(`access_type.eq.public,allowed_users.cs.{${userId}}`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
        
      if (error) throw error;
      
      return data as SharedJourneyReport[];
    } catch (error) {
      console.error('Error getting reports shared with user:', error);
      return [];
    }
  }

  /**
   * Get all reports created by a specific user
   */
  async getReportsCreatedByUser(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<SharedJourneyReport[]> {
    try {
      const { data, error } = await supabase
        .from('shared_journey_reports')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
        
      if (error) throw error;
      
      return data as SharedJourneyReport[];
    } catch (error) {
      console.error('Error getting reports created by user:', error);
      return [];
    }
  }

  /**
   * Export a journey report to PDF, CSV, etc.
   * This method prepares the export by creating a record in the shared_journey_exports table.
   * Actual file generation would be handled by a server-side function or service.
   */
  async exportJourneyReport(
    reportId: string,
    creatorId: string,
    format: 'pdf' | 'csv' | 'json' | 'pptx' | 'xlsx'
  ): Promise<{ id: string; fileUrl: string } | null> {
    try {
      // In a real implementation, this would trigger a server function to 
      // generate the file and return a download URL.
      // For now, we'll just create a record and return a placeholder URL.
      
      const fileUrl = `https://storage.thewheel.com/exports/${reportId}_${format}_${Date.now()}`;
      
      const { data, error } = await supabase
        .from('shared_journey_exports')
        .insert({
          report_id: reportId,
          creator_id: creatorId,
          format,
          file_url: fileUrl,
          size_bytes: 0, // Would be updated when the file is actually generated
          download_count: 0
        })
        .select('id, file_url')
        .single();
        
      if (error) throw error;
      
      return { 
        id: data.id as string, 
        fileUrl: data.file_url as string 
      };
    } catch (error) {
      console.error('Error exporting journey report:', error);
      return null;
    }
  }

  /**
   * Increment the download count for an export
   */
  async recordExportDownload(exportId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('shared_journey_exports')
        .update({ download_count: supabase.rpc('increment', { inc: 1 }) })
        .eq('id', exportId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error recording export download:', error);
      return false;
    }
  }

  /**
   * Recommend a step to another user
   */
  async recommendStep(
    companyId: string,
    senderId: string,
    recipientId: string,
    stepId: string,
    contextNote?: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<StepRecommendation | null> {
    try {
      // First, verify that the step exists
      const { data: step, error: stepError } = await supabase
        .from('journey_steps')
        .select('name')
        .eq('id', stepId)
        .single();
        
      if (stepError) throw stepError;
      
      // Then, create the recommendation
      const { data, error } = await supabase
        .rpc('recommend_step', {
          p_company_id: companyId,
          p_sender_id: senderId,
          p_recipient_id: recipientId,
          p_step_id: stepId,
          p_context_note: contextNote,
          p_priority: priority
        });
        
      if (error) throw error;
      
      // Get the created recommendation
      const { data: recommendation, error: recError } = await supabase
        .from('step_recommendations')
        .select('*')
        .eq('id', data)
        .single();
        
      if (recError) throw recError;
      
      return recommendation as StepRecommendation;
    } catch (error) {
      console.error('Error recommending step:', error);
      return null;
    }
  }

  /**
   * Get recommendations for a user
   */
  async getUserRecommendations(
    userId: string,
    status?: 'pending' | 'accepted' | 'declined' | 'completed',
    limit = 50,
    offset = 0
  ): Promise<Array<StepRecommendation & { step?: JourneyStep; sender_name?: string }>> {
    try {
      // Build the query with proper select statement
      let query = supabase
        .from('step_recommendations')
        .select('*, journey_steps:step_id(*)')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
        
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;
      
      // Get user names in a separate query
      const userIds = data.map(rec => rec.sender_id).filter(Boolean);
      let senderInfo: Record<string, string> = {};
      
      if (userIds.length > 0) {
        const { data: users, error: userError } = await supabase
          .from('users')
          .select('id, email, display_name')
          .in('id', userIds);
          
        if (!userError && users) {
          senderInfo = users.reduce((acc, user) => {
            acc[user.id] = user.display_name || user.email;
            return acc;
          }, {} as Record<string, string>);
        }
      }
      
      // Format the response
      return data.map(rec => ({
        ...rec as unknown as StepRecommendation,
        step: rec.journey_steps as JourneyStep,
        sender_name: senderInfo[rec.sender_id] || 'Unknown'
      }));
    } catch (error) {
      console.error('Error getting user recommendations:', error);
      return [];
    }
  }

  /**
   * Update recommendation status
   */
  async updateRecommendationStatus(
    recommendationId: string,
    status: 'accepted' | 'declined' | 'completed',
    responseNote?: string
  ): Promise<StepRecommendation | null> {
    try {
      const { data, error } = await supabase
        .from('step_recommendations')
        .update({
          status,
          response_note: responseNote,
          responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', recommendationId)
        .select('*')
        .single();
        
      if (error) throw error;
      
      return data as StepRecommendation;
    } catch (error) {
      console.error('Error updating recommendation status:', error);
      return null;
    }
  }

  /**
   * Mark a recommendation as viewed
   */
  async markRecommendationViewed(recommendationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('step_recommendations')
        .update({
          viewed_at: new Date().toISOString()
        })
        .eq('id', recommendationId)
        .is('viewed_at', null);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error marking recommendation viewed:', error);
      return false;
    }
  }

  /**
   * Create a recommendation group
   */
  async createRecommendationGroup(
    companyId: string,
    senderId: string,
    title: string,
    description?: string,
    recommendations: Array<{
      recipientId: string;
      stepId: string;
      contextNote?: string;
      priority?: 'low' | 'medium' | 'high';
    }> = []
  ): Promise<{ groupId: string; recommendationIds: string[] } | null> {
    try {
      // Create the group first
      const { data: group, error: groupError } = await supabase
        .from('step_recommendation_groups')
        .insert({
          company_id: companyId,
          sender_id: senderId,
          title,
          description
        })
        .select('id')
        .single();
        
      if (groupError) throw groupError;
      
      // Now create all the individual recommendations
      const recommendationIds: string[] = [];
      
      for (let i = 0; i < recommendations.length; i++) {
        const rec = recommendations[i];
        const result = await this.recommendStep(
          companyId,
          senderId,
          rec.recipientId,
          rec.stepId,
          rec.contextNote,
          rec.priority || 'medium'
        );
        
        if (result) {
          // Add to group
          await supabase
            .from('step_recommendation_group_items')
            .insert({
              group_id: group.id,
              recommendation_id: result.id,
              order_index: i
            });
            
          recommendationIds.push(result.id);
        }
      }
      
      return {
        groupId: group.id,
        recommendationIds
      };
    } catch (error) {
      console.error('Error creating recommendation group:', error);
      return null;
    }
  }

  /**
   * Get recommendation groups created by a user
   */
  async getRecommendationGroupsCreatedByUser(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('step_recommendation_groups')
        .select('*')
        .eq('sender_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting recommendation groups:', error);
      return [];
    }
  }
}

// Create an instance to export
export const sharingService = new SharingService();
