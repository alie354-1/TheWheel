/**
 * Company Journey Service
 * 
 * Manages company-specific journey customization including:
 * - Company step CRUD operations
 * - Step progress tracking
 * - Custom step creation
 * - Journey path management
 * - Step customization and overrides
 */

import { supabase } from '../supabase';
import {
  CompanyJourneyStep,
  CompanyStepProgress,
  CompanyJourneyPath,
  CompanyStepArrangement,
  CompanyCustomTool,
  step_status,
  JourneyStep,
  JourneyPhase,
  JourneyDomain
} from '../types/journey-unified.types';

export interface CompanyStepFilters {
  phaseId?: string;
  domainId?: string;
  status?: step_status;
  search?: string;
  includeCustom?: boolean;
}

export interface CreateCustomStepData {
  companyId: string;
  name: string;
  description?: string;
  phaseId: string;
  domainId: string;
  orderIndex?: number;
  difficulty?: string;
  timeEstimate?: number;
  contentMarkdown?: string;
  checklist?: any[];
  resources?: any[];
}

export const companyJourneyService = {
  /**
   * Mark a journey step as complete for a company
   * @param companyId The ID of the company
   * @param stepId The ID of the journey step to mark as complete
   * @returns The updated company progress record
   */
  async markStepComplete(companyId: string, stepId: string) {
    try {
      // Check if a progress record already exists for this company and step
      const { data: existingProgress, error: checkError } = await supabase
        .from('company_progress')
        .select('id, status')
        .eq('company_id', companyId)
        .eq('step_id', stepId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is expected if no progress exists yet
        console.error('Error checking step progress:', checkError);
        throw new Error(`Failed to check step progress: ${checkError.message}`);
      }

      const now = new Date().toISOString();

      if (existingProgress) {
        // Update existing progress record
        const { data, error } = await supabase
          .from('company_progress')
          .update({
            status: 'completed' as step_status,
            completed_at: now,
            updated_at: now
          })
          .eq('id', existingProgress.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating step progress:', error);
          throw new Error(`Failed to update step progress: ${error.message}`);
        }

        return data;
      } else {
        // Create new progress record
        const { data, error } = await supabase
          .from('company_progress')
          .insert({
            company_id: companyId,
            step_id: stepId,
            status: 'completed' as step_status,
            completed_at: now
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating step progress:', error);
          throw new Error(`Failed to create step progress: ${error.message}`);
        }

        return data;
      }
    } catch (error) {
      console.error('Error in markStepComplete:', error);
      throw error;
    }
  },

  /**
   * Check if a step is the company formation step and update company status if needed
   * Note: This is a backup for the database trigger that should handle this automatically
   * @param companyId The ID of the company
   * @param stepId The ID of the journey step to check
   */
  async checkAndUpdateCompanyFormationStatus(companyId: string, stepId: string) {
    try {
      // Check if this is the company formation step
      const { data: step, error: stepError } = await supabase
        .from('journey_canonical_steps')
        .select('is_company_formation_step')
        .eq('id', stepId)
        .single();

      if (stepError) {
        console.error('Error checking if step is formation step:', stepError);
        return;
      }

      // If this is the formation step, update the company's is_formed status
      if (step && step.is_company_formation_step) {
        const { error: updateError } = await supabase
          .from('companies')
          .update({ is_formed: true, updated_at: new Date().toISOString() })
          .eq('id', companyId);

        if (updateError) {
          console.error('Error updating company formation status:', updateError);
        }
      }
    } catch (error) {
      console.error('Error in checkAndUpdateCompanyFormationStatus:', error);
    }
  },

  /**
   * Set a journey step as a focus area for a company
   * @param companyId The ID of the company
   * @param stepId The ID of the journey step to set as a focus area
   * @returns The created company focus area record
   */
  async addFocusArea(companyId: string, stepId: string) {
    try {
      // Check if this step is already a focus area
      const { data: existingFocus, error: checkError } = await supabase
        .from('company_focus_areas')
        .select('id')
        .eq('company_id', companyId)
        .eq('step_id', stepId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is expected if no focus exists yet
        console.error('Error checking focus area:', checkError);
        throw new Error(`Failed to check focus area: ${checkError.message}`);
      }

      // If it's already a focus area, just return it
      if (existingFocus) {
        return existingFocus;
      }

      // Create a new focus area record
      const { data, error } = await supabase
        .from('company_focus_areas')
        .insert({
          company_id: companyId,
          step_id: stepId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating focus area:', error);
        throw new Error(`Failed to create focus area: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in addFocusArea:', error);
      throw error;
    }
  },

  /**
   * Remove a journey step from a company's focus areas
   * @param companyId The ID of the company
   * @param stepId The ID of the journey step to remove from focus areas
   * @returns True if the focus area was removed, false otherwise
   */
  async removeFocusArea(companyId: string, stepId: string) {
    try {
      const { error } = await supabase
        .from('company_focus_areas')
        .delete()
        .eq('company_id', companyId)
        .eq('step_id', stepId);

      if (error) {
        console.error('Error removing focus area:', error);
        throw new Error(`Failed to remove focus area: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error in removeFocusArea:', error);
      throw error;
    }
  },

  /**
   * Get all focus areas for a company
   * @param companyId The ID of the company
   * @returns An array of focus area records
   */
  async getFocusAreas(companyId: string) {
    try {
      const { data, error } = await supabase
        .from('company_focus_areas')
        .select(`
          id,
          step_id,
          created_at,
          journey_steps (
            id,
            name,
            description,
            phase_id,
            order_index
          )
        `)
        .eq('company_id', companyId);

      if (error) {
        console.error('Error fetching focus areas:', error);
        throw new Error(`Failed to fetch focus areas: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFocusAreas:', error);
      throw error;
    }
  },

  /**
   * Submit feedback for a journey step
   * @param stepId The ID of the journey step
   * @param userId The ID of the user submitting feedback
   * @param rating Optional rating (1-5)
   * @param comment Optional comment
   * @returns The created feedback record
   */
  async submitStepFeedback(stepId: string, userId: string, rating?: number, comment?: string) {
    try {
      // Validate rating if provided
      if (rating !== undefined && (rating < 1 || rating > 5)) {
        throw new Error('Rating must be between 1 and 5');
      }

      // Create feedback record
      const { data, error } = await supabase
        .from('journey_step_feedback')
        .insert({
          step_id: stepId,
          user_id: userId,
          rating,
          comment
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting step feedback:', error);
        throw new Error(`Failed to submit step feedback: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in submitStepFeedback:', error);
      throw error;
    }
  },

  /**
   * Get feedback for a journey step
   * @param stepId The ID of the journey step
   * @returns An array of feedback records for the step
   */
  async getStepFeedback(stepId: string) {
    try {
      const { data, error } = await supabase
        .from('journey_step_feedback')
        .select(`
          id,
          user_id,
          rating,
          comment,
          created_at,
          users (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('step_id', stepId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching step feedback:', error);
        throw new Error(`Failed to fetch step feedback: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getStepFeedback:', error);
      throw error;
    }
  },

  /**
   * Get notes for a journey step
   * @param companyId The ID of the company
   * @param stepId The ID of the journey step
   * @returns The notes for the step, or null if no notes exist
   */
  async getStepNotes(companyId: string, stepId: string) {
    try {
      const { data, error } = await supabase
        .from('company_progress')
        .select('notes')
        .eq('company_id', companyId)
        .eq('step_id', stepId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No notes exist yet
          return null;
        }
        console.error('Error fetching step notes:', error);
        throw new Error(`Failed to fetch step notes: ${error.message}`);
      }

      return data?.notes || null;
    } catch (error) {
      console.error('Error in getStepNotes:', error);
      throw error;
    }
  },

  /**
   * Save notes for a journey step
   * @param companyId The ID of the company
   * @param stepId The ID of the journey step
   * @param notes The notes to save
   * @returns The updated company progress record
   */
  async saveStepNotes(companyId: string, stepId: string, notes: string) {
    try {
      // Check if a progress record already exists for this company and step
      const { data: existingProgress, error: checkError } = await supabase
        .from('company_progress')
        .select('id')
        .eq('company_id', companyId)
        .eq('step_id', stepId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is expected if no progress exists yet
        console.error('Error checking step progress:', checkError);
        throw new Error(`Failed to check step progress: ${checkError.message}`);
      }

      const now = new Date().toISOString();

      if (existingProgress) {
        // Update existing progress record
        const { data, error } = await supabase
          .from('company_progress')
          .update({
            notes,
            updated_at: now
          })
          .eq('id', existingProgress.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating step notes:', error);
          throw new Error(`Failed to update step notes: ${error.message}`);
        }

        return data;
      } else {
        // Create new progress record
        const { data, error } = await supabase
          .from('company_progress')
          .insert({
            company_id: companyId,
            step_id: stepId,
            notes,
            status: 'not_started' as step_status
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating step notes:', error);
          throw new Error(`Failed to create step notes: ${error.message}`);
        }

        return data;
      }
    } catch (error) {
      console.error('Error in saveStepNotes:', error);
      throw error;
    }
  },


  /**
   * Skip a journey step for a company
   * @param companyId The ID of the company
   * @param stepId The ID of the journey step to skip
   * @returns The updated company progress record
   */
  async skipStep(companyId: string, stepId: string) {
    try {
      // Check if a progress record already exists for this company and step
      const { data: existingProgress, error: checkError } = await supabase
        .from('company_progress')
        .select('id, status')
        .eq('company_id', companyId)
        .eq('step_id', stepId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is expected if no progress exists yet
        console.error('Error checking step progress:', checkError);
        throw new Error(`Failed to check step progress: ${checkError.message}`);
      }

      const now = new Date().toISOString();

      if (existingProgress) {
        // Update existing progress record
        const { data, error } = await supabase
          .from('company_progress')
          .update({
            status: 'skipped' as step_status,
            updated_at: now
          })
          .eq('id', existingProgress.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating step progress:', error);
          throw new Error(`Failed to update step progress: ${error.message}`);
        }

        return data;
      } else {
        // Create new progress record
        const { data, error } = await supabase
          .from('company_progress')
          .insert({
            company_id: companyId,
            step_id: stepId,
            status: 'skipped' as step_status
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating step progress:', error);
          throw new Error(`Failed to create step progress: ${error.message}`);
        }

        return data;
      }
    } catch (error) {
      console.error('Error in skipStep:', error);
      throw error;
    }
  },

  /**
   * Get personalized tool recommendations for a step
   * @param companyId The ID of the company
   * @param stepId The ID of the journey step
   * @param limit The maximum number of tools to return (default: 3)
   * @returns An array of recommended tools
   */
  async getPersonalizedToolRecommendations(companyId: string, stepId: string, limit: number = 3) {
    try {
      // Call the database function to get personalized tool rankings
      const { data, error } = await supabase
        .rpc('get_personalized_tool_rankings', {
          p_company_id: companyId,
          p_step_id: stepId,
          p_limit: limit
        });

      if (error) {
        console.error('Error getting personalized tool recommendations:', error);
        throw new Error(`Failed to get personalized tool recommendations: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPersonalizedToolRecommendations:', error);
      throw error;
    }
  },

  /**
   * Check if a company has sufficient profile data for personalized recommendations
   * @param companyId The ID of the company
   * @returns True if the company has sufficient profile data, false otherwise
   */
  async hasSufficientProfileData(companyId: string) {
    try {
      const { data, error } = await supabase
        .rpc('has_sufficient_profile_data', {
          p_company_id: companyId
        });

      if (error) {
        console.error('Error checking profile data:', error);
        throw new Error(`Failed to check profile data: ${error.message}`);
      }

      return data || false;
    } catch (error) {
      console.error('Error in hasSufficientProfileData:', error);
      return false;
    }
  },

  /**
   * Get all tools for a journey step
   * @param stepId The ID of the journey step
   * @returns An array of tools for the step
   */
  async getStepTools(stepId: string) {
    try {
      const { data, error } = await supabase
        .from('journey_step_tools')
        .select('*')
        .eq('step_id', stepId)
        .eq('status', 'approved')
        .order('default_ranking', { ascending: false });

      if (error) {
        console.error('Error fetching step tools:', error);
        throw new Error(`Failed to fetch step tools: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getStepTools:', error);
      throw error;
    }
  },

  /**
   * Submit a custom tool for a journey step
   * @param companyId The ID of the company
   * @param stepId The ID of the journey step
   * @param userId The ID of the user submitting the tool
   * @param name The name of the tool
   * @param url The URL of the tool
   * @param functionality A description of the tool's functionality
   * @returns The created tool submission record
   */
  async submitCustomTool(companyId: string, stepId: string, userId: string, name: string, url: string, functionality: string) {
    try {
      // Create a tool submission
      const { data, error } = await supabase
        .from('tool_submissions')
        .insert({
          submitted_by: userId,
          company_id: companyId,
          name,
          url,
          description: functionality, // Initial description is the functionality
          journey_step_id: stepId,
          status: 'pending',
          ai_review_status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting custom tool:', error);
        throw new Error(`Failed to submit custom tool: ${error.message}`);
      }

      // TODO: Trigger AI enrichment (this would be handled by a separate service or edge function)

      return data;
    } catch (error) {
      console.error('Error in submitCustomTool:', error);
      throw error;
    }
  },

  /**
   * Update the AI-generated description for a custom tool
   * @param submissionId The ID of the tool submission
   * @param aiReviewStatus The status of the AI review (accepted, edited, rejected)
   * @param userEditedDescription The user-edited description (if applicable)
   * @returns The updated tool submission record
   */
  async updateCustomToolDescription(submissionId: string, aiReviewStatus: string, userEditedDescription?: string) {
    try {
      const updates: any = {
        ai_review_status: aiReviewStatus
      };

      if (userEditedDescription) {
        updates.user_edited_description = userEditedDescription;
      }

      const { data, error } = await supabase
        .from('tool_submissions')
        .update(updates)
        .eq('id', submissionId)
        .select()
        .single();

      if (error) {
        console.error('Error updating custom tool description:', error);
        throw new Error(`Failed to update custom tool description: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateCustomToolDescription:', error);
      throw error;
    }
  },

  /**
   * Add a custom tool to the company's tools
   * @param companyId The ID of the company
   * @param submissionId The ID of the tool submission
   * @param userId The ID of the user adding the tool
   * @returns The created company tool record
   */
  async addCustomToolToCompany(companyId: string, submissionId: string, userId: string) {
    try {
      // Get the tool submission
      const { data: submission, error: submissionError } = await supabase
        .from('tool_submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (submissionError) {
        console.error('Error fetching tool submission:', submissionError);
        throw new Error(`Failed to fetch tool submission: ${submissionError.message}`);
      }

      // Create a company journey step tool
      const { data: stepTool, error: stepToolError } = await supabase
        .from('company_journey_step_tools')
        .insert({
          company_journey_step_id: null, // This will be updated if the company has a custom journey
          name: submission.name,
          url: submission.url,
          description: submission.user_edited_description || submission.ai_enriched_fields?.description || submission.description,
          is_custom: true
        })
        .select()
        .single();

      if (stepToolError) {
        console.error('Error creating company journey step tool:', stepToolError);
        throw new Error(`Failed to create company journey step tool: ${stepToolError.message}`);
      }

      // Add the tool to the company's tools
      const { data: companyTool, error: companyToolError } = await supabase
        .from('company_tools')
        .insert({
          company_id: companyId,
          tool_id: stepTool.id,
          source: 'custom',
          added_by: userId
        })
        .select()
        .single();

      if (companyToolError) {
        console.error('Error adding tool to company:', companyToolError);
        throw new Error(`Failed to add tool to company: ${companyToolError.message}`);
      }

      return companyTool;
    } catch (error) {
      console.error('Error in addCustomToolToCompany:', error);
      throw error;
    }
  },
  // Clone the global journey map for a company
  async cloneGlobalJourneyForCompany(companyId: string) {
    // 1. Create company_journey_map for the company
    // 2. For each global journey step, create a company_journey_step (preserving order)
    // 3. Optionally, clone tools/resources as needed
    // TODO: Implement backend API or DB logic
  },

  // Get a company's journey map (custom if exists, else global)
  async getCompanyJourney(companyId: string): Promise<{ steps: any[]; isCustom: boolean }> {
    // 1. Check for company_journey_map
    // 2. If exists, return company_journey_steps (ordered)
    // 3. Else, return global journey_steps
    // TODO: Implement backend API or DB logic
    return { steps: [], isCustom: false }; // Placeholder
  },

  // Add a custom step to a company's journey, or activate a consideration as a company-specific step
  async addCustomStep(companyJourneyMapId: string, stepData: Record<string, any>) {
    // Insert into company_journey_steps with is_custom = true
    const { data, error } = await supabase
      .from('company_journey_steps_new')
      .insert({
        company_journey_map_id: companyJourneyMapId,
        ...stepData,
        is_custom: true,
        is_activated: true,
        is_dismissed: false
      })
      .select()
      .single();
    if (error) {
      console.error('Error adding custom step:', error);
      throw new Error(`Failed to add custom step: ${error.message}`);
    }
    return data;
  },

  /**
   * Activate a consideration as a company-specific step
   * @param companyJourneyMapId The company journey map id
   * @param stepId The id of the step to activate
   * @param domainId The domain to activate the step in
   * @param companyId The company id
   * @returns The created company_journey_step record
   */
  async activateConsideration(companyJourneyMapId: string, stepId: string, domainId: string, companyId: string) {
    // Insert a new company_journey_step for the consideration
    const { data, error } = await supabase
      .from('company_journey_steps_new')
      .insert({
        company_journey_map_id: companyJourneyMapId,
        step_id: stepId,
        domain_id: domainId,
        company_id: companyId,
        is_custom: false,
        is_activated: true,
        is_dismissed: false
      })
      .select()
      .single();
    if (error) {
      console.error('Error activating consideration:', error);
      throw new Error(`Failed to activate consideration: ${error.message}`);
    }
    return data;
  },

  // Remove (dismiss) a step from a company's journey
  async dismissStep(companyJourneyStepId: string) {
    // Set is_dismissed = true for the company_journey_step
    const { data, error } = await supabase
      .from('company_journey_steps_new')
      .update({ is_dismissed: true })
      .eq('id', companyJourneyStepId)
      .select()
      .single();
    if (error) {
      console.error('Error dismissing step:', error);
      throw new Error(`Failed to dismiss step: ${error.message}`);
    }
    return data;
  },

  // Reorder steps in a company's journey
  async reorderSteps(companyJourneyMapId: string, orderedStepIds: string[]) {
    // TODO: Update order_index for each company_journey_step
  },

  // Add a custom tool to a company journey step
  async addCustomTool(companyJourneyStepId: string, toolData: Record<string, any>) {
    // TODO: Insert into company_journey_step_tools
  },

  // Remove a custom tool from a company journey step
  async removeCustomTool(companyJourneyStepToolId: string) {
    // TODO: Delete from company_journey_step_tools
  }
};
