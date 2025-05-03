/**
 * Ask The Wheel Service
 * - Handles submission and management of user questions to The Wheel experts
 * - Provides methods for submitting questions, retrieving responses, and managing requests
 * - Used by the Journey Map module for the "Ask The Wheel" feature
 */

import { supabase } from '../supabase';

export interface AskWheelRequest {
  id?: string;
  company_id: string;
  user_id: string;
  step_id: string;
  question_text: string;
  status?: string;
  response_text?: string;
  responded_by?: string;
  responded_at?: string;
  created_at?: string;
  updated_at?: string;
}

export const askWheelService = {
  /**
   * Submit a question to The Wheel experts
   * @param companyId The ID of the company
   * @param stepId The ID of the journey step
   * @param userId The ID of the user submitting the question
   * @param questionText The text of the question
   * @returns The created request record
   */
  async submitQuestion(companyId: string, stepId: string, userId: string, questionText: string) {
    try {
      // Create a record in the ask_wheel_requests table
      const { data, error } = await supabase
        .from('ask_wheel_requests')
        .insert({
          company_id: companyId,
          user_id: userId,
          step_id: stepId,
          question_text: questionText,
          status: 'submitted'
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting question:', error);
        throw new Error(`Failed to submit question: ${error.message}`);
      }

      // In a real implementation, this would also trigger a notification to the internal team
      // For MVP, we'll just return the created record
      return data;
    } catch (error) {
      console.error('Error in submitQuestion:', error);
      throw error;
    }
  },

  /**
   * Get all questions submitted by a user
   * @param userId The ID of the user
   * @returns An array of request records
   */
  async getUserQuestions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('ask_wheel_requests')
        .select(`
          *,
          journey_steps (
            id,
            name,
            phase_id
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user questions:', error);
        throw new Error(`Failed to fetch user questions: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserQuestions:', error);
      throw error;
    }
  },

  /**
   * Get all questions for a company
   * @param companyId The ID of the company
   * @returns An array of request records
   */
  async getCompanyQuestions(companyId: string) {
    try {
      const { data, error } = await supabase
        .from('ask_wheel_requests')
        .select(`
          *,
          journey_steps (
            id,
            name,
            phase_id
          ),
          users (
            id,
            email,
            full_name
          )
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching company questions:', error);
        throw new Error(`Failed to fetch company questions: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCompanyQuestions:', error);
      throw error;
    }
  },

  /**
   * Get all questions for a specific journey step
   * @param stepId The ID of the journey step
   * @returns An array of request records
   */
  async getStepQuestions(stepId: string) {
    try {
      const { data, error } = await supabase
        .from('ask_wheel_requests')
        .select(`
          *,
          users (
            id,
            email,
            full_name
          )
        `)
        .eq('step_id', stepId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching step questions:', error);
        throw new Error(`Failed to fetch step questions: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getStepQuestions:', error);
      throw error;
    }
  },

  /**
   * Get a specific question by ID
   * @param requestId The ID of the request
   * @returns The request record
   */
  async getQuestion(requestId: string) {
    try {
      const { data, error } = await supabase
        .from('ask_wheel_requests')
        .select(`
          *,
          journey_steps (
            id,
            name,
            phase_id
          ),
          users (
            id,
            email,
            full_name
          )
        `)
        .eq('id', requestId)
        .single();

      if (error) {
        console.error('Error fetching question:', error);
        throw new Error(`Failed to fetch question: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getQuestion:', error);
      throw error;
    }
  },

  /**
   * Update the status of a question
   * @param requestId The ID of the request
   * @param status The new status
   * @returns The updated request record
   */
  async updateStatus(requestId: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('ask_wheel_requests')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        console.error('Error updating question status:', error);
        throw new Error(`Failed to update question status: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateStatus:', error);
      throw error;
    }
  },

  /**
   * Respond to a question
   * @param requestId The ID of the request
   * @param responseText The response text
   * @param respondedBy The ID of the user responding
   * @returns The updated request record
   */
  async respondToQuestion(requestId: string, responseText: string, respondedBy: string) {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('ask_wheel_requests')
        .update({
          response_text: responseText,
          responded_by: respondedBy,
          responded_at: now,
          status: 'resolved',
          updated_at: now
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        console.error('Error responding to question:', error);
        throw new Error(`Failed to respond to question: ${error.message}`);
      }

      // In a real implementation, this would also trigger a notification to the user
      // For MVP, we'll just return the updated record
      return data;
    } catch (error) {
      console.error('Error in respondToQuestion:', error);
      throw error;
    }
  }
};
