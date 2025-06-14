/**
 * New Journey System: Company Journey Service
 * 
 * Manages a company's specific journey, including:
 * - Creating and managing a company's journey instance.
 * - Adding steps from the framework to a company's journey.
 * - Updating the status of a company's steps and tasks.
 * - Fetching company-specific journey data.
 */

import { supabase } from '../../supabase';
import {
  NewCompanyJourney,
  NewCompanyJourneyStep,
  NewStepTask,
  NewStepStatus
} from '../../types/new_journey.types';

export const newCompanyJourneyService = {
  /**
   * Fetches or creates a journey for a given company.
   * Every company has at least one default journey.
   */
  async getOrCreateCompanyJourney(companyId: string): Promise<NewCompanyJourney> {
    // First, try to fetch the default journey for the company.
    let { data: journeys, error: fetchError } = await supabase
      .from('company_journeys_new')
      .select('*')
      .eq('company_id', companyId);

    let journey = journeys?.[0];

    if (fetchError && fetchError.code !== 'PGRST116') { // 'PGRST116' is "No rows found"
      console.error('Error fetching company journey:', fetchError);
      throw fetchError;
    }

    // If no journey exists, create one.
    if (!journey) {
      const { data: newJourney, error: createError } = await supabase
        .from('company_journeys_new')
        .insert({ company_id: companyId, name: 'Default Journey' })
        .select()
        .single();

      if (createError) {
        console.error('Error creating company journey:', createError);
        throw createError;
      }
      journey = newJourney;
    }

    return journey;
  },

  /**
   * Adds a step from the canonical framework to a company's journey.
   */
  async addStepToJourney(journeyId: string, frameworkStepId: string): Promise<NewCompanyJourneyStep> {
    // First, get the framework step details
    const { data: frameworkStep, error: fetchError } = await supabase
      .from('journey_canonical_steps')
      .select('*')
      .eq('id', frameworkStepId)
      .single();

    if (fetchError || !frameworkStep) {
      console.error('Error fetching framework step to import:', fetchError);
      throw new Error('Framework step not found.');
    }

    // Now, create the company-specific version of the step
    const { data: newCompanyStep, error: insertError } = await supabase
      .from('company_journey_steps_new')
      .insert({
        journey_id: journeyId,
        canonical_step_id: frameworkStep.id,
        name: frameworkStep.name,
        description: frameworkStep.description,
        phase_id: frameworkStep.primary_phase_id,
        domain_id: frameworkStep.primary_domain_id,
        status: 'not_started',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error adding step to company journey:', insertError);
      throw insertError;
    }

    return newCompanyStep;
  },

  /**
   * Updates the status of a company's journey step.
   */
  async updateStepStatus(companyStepId: string, status: NewStepStatus): Promise<NewCompanyJourneyStep> {
    const updatePayload: Partial<NewCompanyJourneyStep> = { status };
    if (status === 'active' && !updatePayload.started_at) {
      updatePayload.started_at = new Date().toISOString();
    } else if (status === 'complete' && !updatePayload.completed_at) {
      updatePayload.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('company_journey_steps_new')
      .update(updatePayload)
      .eq('id', companyStepId)
      .select()
      .single();

    if (error) {
      console.error('Error updating step status:', error);
      throw error;
    }
    return data;
  },

  /**
   * Gets all steps for a given company journey.
   */
  async getCompanySteps(journeyId: string): Promise<NewCompanyJourneyStep[]> {
    // Don't attempt to fetch if journeyId is empty
    if (!journeyId) {
      console.error('Error fetching company steps: Empty journey ID');
      return [];
    }
    
    const { data, error } = await supabase
      .from('company_journey_steps_new')
      .select('*')
      .eq('journey_id', journeyId)
      .order('order_index');

    if (error) {
      console.error('Error fetching company steps:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * Gets all tasks for a specific company journey step.
   */
  async getStepTasks(companyStepId: string): Promise<NewStepTask[]> {
    const { data, error } = await supabase
      .from('standup_tasks')
      .select('*')
      .eq('step_id', companyStepId)
      .order('created_at');

    if (error) {
      console.error('Error fetching step tasks:', error);
      throw error;
    }
    return data || [];
  },
  
  /**
   * Deletes a company journey step.
   */
  async deleteCompanyStep(stepId: string): Promise<void> {
    // First delete any tasks associated with this step
    const { error: tasksError } = await supabase
      .from('standup_tasks')
      .delete()
      .eq('step_id', stepId);
    
    if (tasksError) {
      console.error('Error deleting step tasks:', tasksError);
      throw tasksError;
    }
    
    // Then delete the step itself
    const { error } = await supabase
      .from('company_journey_steps_new')
      .delete()
      .eq('id', stepId);
    
    if (error) {
      console.error('Error deleting company step:', error);
      throw error;
    }
  },

  /**
   * Updates the completion status of a single task.
   */
  async updateTaskStatus(taskId: string, isCompleted: boolean): Promise<NewStepTask> {
    const { data, error } = await supabase
      .from('standup_tasks')
      .update({ 
        status: isCompleted ? 'completed' : 'active',
        completed_at: isCompleted ? new Date().toISOString() : null 
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
    return data;
  },
};
