/**
 * Journey Integration Service - Real Implementation
 * 
 * Connects journey steps with experts, resources, and community features.
 * This service acts as the integration layer between the journey system and other modules.
 */

import { supabase } from '../../supabase';
import { recommendationService } from '../recommendation';

// Step types
export interface JourneyStep {
  id: string;
  title: string;
  description: string;
  phase: string;
  order: number;
  estimatedTime: string;
  status: 'not_started' | 'in_progress' | 'completed';
  resources?: {
    articles?: { id: string; title: string; url: string }[];
    videos?: { id: string; title: string; url: string }[];
    tools?: { id: string; name: string; url: string }[];
  };
}

// Journey types
export interface Journey {
  id: string;
  companyId: string;
  title: string;
  description: string;
  phases: JourneyPhase[];
}

export interface JourneyPhase {
  id: string;
  title: string;
  description: string;
  order: number;
  steps: JourneyStep[];
}

// Progress tracking types
export interface StepProgress {
  stepId: string;
  companyId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  timeSpent?: number; // in minutes
  notes?: string;
}

class JourneyIntegrationService {
  /**
   * Get a journey step by ID
   */
  async getStep(stepId: string): Promise<JourneyStep> {
    try {
      // Get step data
      const { data: stepData, error: stepError } = await supabase
        .from('journey_steps')
        .select(`
          id,
          title,
          description,
          order_number,
          estimated_time,
          journey_phases:phase_id (
            id,
            title
          )
        `)
        .eq('id', stepId)
        .single();

      if (stepError) throw stepError;
      
      // Extract phase data safely - use type assertion to handle the nested object
      const phaseData = (stepData.journey_phases as any) || { id: null, title: 'Unknown' };

      // Get step progress
      const { data: progressData, error: progressError } = await supabase
        .from('step_progress')
        .select('*')
        .eq('step_id', stepId)
        .maybeSingle();

      if (progressError && progressError.code !== 'PGRST116') throw progressError;

      // Get step resources
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('step_resources')
        .select('*')
        .eq('step_id', stepId)
        .order('order_number', { ascending: true });

      if (resourcesError) throw resourcesError;

      // Format resources
      const resources = {
        articles: resourcesData
          .filter(r => r.resource_type === 'article')
          .map(r => ({
            id: r.id,
            title: r.title,
            url: r.url
          })),
        videos: resourcesData
          .filter(r => r.resource_type === 'video')
          .map(r => ({
            id: r.id,
            title: r.title,
            url: r.url
          })),
        tools: resourcesData
          .filter(r => r.resource_type === 'tool')
          .map(r => ({
            id: r.id,
            name: r.title,
            url: r.url
          }))
      };

      // Determine status
      let status: 'not_started' | 'in_progress' | 'completed' = 'not_started';
      if (progressData) {
        status = progressData.status as 'not_started' | 'in_progress' | 'completed';
      }

      return {
        id: stepData.id,
        title: stepData.title,
        description: stepData.description,
        phase: phaseData.title || 'Unknown',
        order: stepData.order_number,
        estimatedTime: stepData.estimated_time || '1-2 weeks',
        status,
        resources: resources.articles.length > 0 || resources.videos.length > 0 || resources.tools.length > 0 
          ? resources 
          : undefined
      };
    } catch (error) {
      console.error('Error fetching step:', error);
      throw error;
    }
  }

  /**
   * Get a company's journey
   */
  async getJourney(companyId: string): Promise<Journey> {
    try {
      // Get company journey
      const { data: journeyData, error: journeyError } = await supabase
        .from('company_journeys')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (journeyError && journeyError.code !== 'PGRST116') throw journeyError;

      // If no journey exists for this company, create one
      let journeyId = journeyData?.id;
      if (!journeyId) {
        const { data: newJourney, error: createError } = await supabase
          .from('company_journeys')
          .insert({
            company_id: companyId,
            title: 'Startup Journey',
            description: 'A step-by-step guide to building your startup from idea to scale.'
          })
          .select('id')
          .single();

        if (createError) throw createError;
        journeyId = newJourney.id;
      }

      // Get all phases
      const { data: phasesData, error: phasesError } = await supabase
        .from('journey_phases')
        .select('*')
        .order('order_number', { ascending: true });

      if (phasesError) throw phasesError;

      // Get all steps
      const { data: stepsData, error: stepsError } = await supabase
        .from('journey_steps')
        .select('*')
        .order('order_number', { ascending: true });

      if (stepsError) throw stepsError;

      // Get step progress for this company
      const { data: progressData, error: progressError } = await supabase
        .from('step_progress')
        .select('*')
        .eq('company_id', companyId);

      if (progressError) throw progressError;

      // Create a map of step progress by step ID
      const progressMap = new Map();
      progressData.forEach(progress => {
        progressMap.set(progress.step_id, progress);
      });

      // Organize steps by phase
      const phases: JourneyPhase[] = phasesData.map(phase => {
        const phaseSteps = stepsData
          .filter(step => step.phase_id === phase.id)
          .map(step => {
            const progress = progressMap.get(step.id);
            const status = progress ? progress.status : 'not_started';
            
            return {
              id: step.id,
              title: step.title,
              description: step.description,
              phase: phase.title,
              order: step.order_number,
              estimatedTime: step.estimated_time || '1-2 weeks',
              status: status as 'not_started' | 'in_progress' | 'completed'
            };
          });

        return {
          id: phase.id,
          title: phase.title,
          description: phase.description,
          order: phase.order_number,
          steps: phaseSteps
        };
      });

      return {
        id: journeyId,
        companyId,
        title: journeyData?.title || 'Startup Journey',
        description: journeyData?.description || 'A step-by-step guide to building your startup from idea to scale.',
        phases
      };
    } catch (error) {
      console.error('Error fetching journey:', error);
      throw error;
    }
  }

  /**
   * Update a step's status
   */
  async updateStepStatus(
    stepId: string, 
    companyId: string, 
    status: 'not_started' | 'in_progress' | 'completed',
    notes?: string
  ): Promise<StepProgress> {
    try {
      const now = new Date();
      
      // Check if a progress record already exists
      const { data: existingProgress, error: checkError } = await supabase
        .from('step_progress')
        .select('*')
        .eq('step_id', stepId)
        .eq('company_id', companyId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      // Prepare the progress data
      const progressData: any = {
        step_id: stepId,
        company_id: companyId,
        status,
        notes,
        updated_at: now.toISOString()
      };

      // Set started_at if status is changing to in_progress
      if (status === 'in_progress' && (!existingProgress || existingProgress.status === 'not_started')) {
        progressData.started_at = now.toISOString();
      }

      // Set completed_at if status is changing to completed
      if (status === 'completed' && (!existingProgress || existingProgress.status !== 'completed')) {
        progressData.completed_at = now.toISOString();
        
        // Calculate time spent if we have a started_at date
        if (existingProgress?.started_at) {
          const startedAt = new Date(existingProgress.started_at);
          const timeSpentMs = now.getTime() - startedAt.getTime();
          progressData.time_spent = Math.round(timeSpentMs / (1000 * 60)); // Convert to minutes
        }
      }

      let result;
      if (existingProgress) {
        // Update existing record
        const { data, error } = await supabase
          .from('step_progress')
          .update(progressData)
          .eq('id', existingProgress.id)
          .select('*')
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('step_progress')
          .insert(progressData)
          .select('*')
          .single();

        if (error) throw error;
        result = data;
      }

      // If completed, log completion for analytics
      if (status === 'completed') {
        await this.logStepCompletion(
          stepId, 
          companyId, 
          result.time_spent || 0, 
          { notes }
        );
      }

      return {
        stepId: result.step_id,
        companyId: result.company_id,
        status: result.status,
        startedAt: result.started_at ? new Date(result.started_at) : undefined,
        completedAt: result.completed_at ? new Date(result.completed_at) : undefined,
        timeSpent: result.time_spent,
        notes: result.notes
      };
    } catch (error) {
      console.error('Error updating step status:', error);
      throw error;
    }
  }

  /**
   * Get step progress for a company
   */
  async getStepProgress(stepId: string, companyId: string): Promise<StepProgress> {
    try {
      const { data, error } = await supabase
        .from('step_progress')
        .select('*')
        .eq('step_id', stepId)
        .eq('company_id', companyId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        return {
          stepId,
          companyId,
          status: 'not_started'
        };
      }

      return {
        stepId: data.step_id,
        companyId: data.company_id,
        status: data.status,
        startedAt: data.started_at ? new Date(data.started_at) : undefined,
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        timeSpent: data.time_spent,
        notes: data.notes
      };
    } catch (error) {
      console.error('Error fetching step progress:', error);
      throw error;
    }
  }

  /**
   * Get overall journey progress for a company
   */
  async getJourneyProgress(companyId: string): Promise<{
    totalSteps: number;
    completedSteps: number;
    currentPhase: string;
    phaseProgress: { phase: string; completed: number; total: number }[];
  }> {
    try {
      // Get all steps
      const { data: stepsData, error: stepsError } = await supabase
        .from('journey_steps')
        .select(`
          id,
          journey_phases:phase_id (
            id,
            title
          )
        `);

      if (stepsError) throw stepsError;

      // Get step progress for this company
      const { data: progressData, error: progressError } = await supabase
        .from('step_progress')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'completed');

      if (progressError) throw progressError;

      // Create a set of completed step IDs
      const completedStepIds = new Set(progressData.map(p => p.step_id));

      // Count steps by phase
      const phaseMap = new Map<string, { title: string; total: number; completed: number }>();
      
      stepsData.forEach(step => {
        // Use type assertion to handle the nested object
        const phaseData = (step.journey_phases as any) || { id: null, title: 'Unknown' };
        const phaseId = phaseData.id;
        const phaseTitle = phaseData.title || 'Unknown';
        
        if (!phaseMap.has(phaseId)) {
          phaseMap.set(phaseId, { title: phaseTitle, total: 0, completed: 0 });
        }
        
        const phaseStats = phaseMap.get(phaseId)!;
        phaseStats.total++;
        
        if (completedStepIds.has(step.id)) {
          phaseStats.completed++;
        }
      });

      // Convert to array and sort by phase order
      const phaseProgress = Array.from(phaseMap.values()).map(phase => ({
        phase: phase.title,
        completed: phase.completed,
        total: phase.total
      }));

      // Determine current phase
      let currentPhase = 'Unknown';
      if (phaseProgress.length > 0) {
        // Find the first phase that's not fully completed
        const inProgressPhase = phaseProgress.find(p => p.completed < p.total);
        if (inProgressPhase) {
          currentPhase = inProgressPhase.phase;
        } else {
          // All phases completed, use the last one
          currentPhase = phaseProgress[phaseProgress.length - 1].phase;
        }
      }

      return {
        totalSteps: stepsData.length,
        completedSteps: progressData.length,
        currentPhase,
        phaseProgress
      };
    } catch (error) {
      console.error('Error fetching journey progress:', error);
      throw error;
    }
  }

  /**
   * Connect a journey step with experts
   */
  async connectStepWithExperts(stepId: string, expertIds: string[]): Promise<void> {
    try {
      // Delete existing connections
      await supabase
        .from('step_expert_recommendations')
        .delete()
        .eq('step_id', stepId);

      // Create new connections
      const recommendations = expertIds.map((expertId, index) => ({
        step_id: stepId,
        expert_id: expertId,
        relevance_score: 1 - (index * 0.1) // Decreasing relevance score
      }));

      const { error } = await supabase
        .from('step_expert_recommendations')
        .insert(recommendations);

      if (error) throw error;
    } catch (error) {
      console.error('Error connecting step with experts:', error);
      throw error;
    }
  }

  /**
   * Connect a journey step with templates
   */
  async connectStepWithTemplates(stepId: string, templateIds: string[]): Promise<void> {
    try {
      // Delete existing connections
      await supabase
        .from('step_template_recommendations')
        .delete()
        .eq('step_id', stepId);

      // Create new connections
      const recommendations = templateIds.map((templateId, index) => ({
        step_id: stepId,
        template_id: templateId,
        template_type: 'document', // Default type, would need to be determined based on template
        relevance_score: 1 - (index * 0.1) // Decreasing relevance score
      }));

      const { error } = await supabase
        .from('step_template_recommendations')
        .insert(recommendations);

      if (error) throw error;
    } catch (error) {
      console.error('Error connecting step with templates:', error);
      throw error;
    }
  }

  /**
   * Log step completion for analytics
   */
  async logStepCompletion(
    stepId: string, 
    companyId: string, 
    timeSpent: number, 
    outcome?: { [key: string]: any }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('step_completion_analytics')
        .upsert({
          step_id: stepId,
          company_id: companyId,
          time_spent: timeSpent,
          outcome: outcome ? JSON.stringify(outcome) : null,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging step completion:', error);
      // Don't throw here, just log the error
    }
  }
}

export const journeyIntegrationService = new JourneyIntegrationService();
