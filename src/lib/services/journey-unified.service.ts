import { supabase } from '../supabase';
import {
  JourneyPhase,
  JourneyStep,
  CompanyJourneyStep,
  Tool,
  CompanyStepTool,
  CompanyStepProgressUpdate,
  JourneyStepComplete,
  PhaseWithProgress
} from '../types/journey-unified.types';
import { trackEvent } from './analytics.service'; // Import analytics tracking

// Define types used by the service but not exported from types file
interface ToolComparisonResult {
  tool_id: string;
  name: string;
  description?: string;
  pros: string[];
  cons: string[];
  rating_avg?: number;
  usage_count?: number;
  comparison_data: {
    [key: string]: any;
  };
}

interface PhaseCompletionStats {
  phase_id: string;
  phase_name: string;
  total_steps: number;
  completed_steps: number;
  in_progress_steps: number;
  not_started_steps: number;
  skipped_steps: number;
  completion_percentage: number;
}

interface JourneyTimelineEvent {
  id: string;
  company_id: string;
  step_id: string;
  step_name: string;
  phase_id: string;
  phase_name: string;
  event_type: 'status_change' | 'tool_selection' | 'note_added';
  event_data: any;
  created_at: string;
  user_id?: string;
  user_name?: string;
}

/**
 * Service for interacting with the unified journey system
 * Replaces the previously separate JourneyChallengesService and CompanyJourneyService
 */
export class JourneyUnifiedService {

  // PHASES

  /**
   * Get all journey phases
   */
  static async getPhases(): Promise<JourneyPhase[]> {
    const { data, error } = await supabase
      .from('journey_phases')
      .select('*')
      .order('order_index');

    if (error) {
      console.error('Error fetching phases:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get a specific phase by ID
   */
  static async getPhaseById(phaseId: string): Promise<JourneyPhase | null> {
    const { data, error } = await supabase
      .from('journey_phases')
      .select('*')
      .eq('id', phaseId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching phase:', error);
      throw error;
    }

    return data;
  }

  // STEPS

  /**
   * Get all journey steps or filter by phase
   */
  static async getSteps(options?: { phaseId?: string }): Promise<JourneyStep[]> {
    let query = supabase
      .from('journey_steps')
      .select('*')
      .order('order_index');

    if (options?.phaseId) {
      query = query.eq('phase_id', options.phaseId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching steps:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get a specific step by ID
   */
  static async getStepById(stepId: string): Promise<JourneyStep | null> {
    const { data, error } = await supabase
      .from('journey_steps')
      .select('*')
      .eq('id', stepId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching step:', error);
      throw error;
    }

    return data;
  }

  // COMPANY PROGRESS

  /**
   * Get progress for all steps for a company
   */
  static async getCompanyProgress(companyId: string): Promise<CompanyJourneyStep[]> {
    const { data, error } = await supabase
      .from('company_journey_steps')
      .select('*')
      .eq('company_id', companyId)
      .order('order_index');

    if (error) {
      console.error('Error fetching company progress:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get progress for a specific step for a company
   */
  static async getStepProgress(companyId: string, stepId: string): Promise<CompanyJourneyStep | null> {
    const { data, error } = await supabase
      .from('company_journey_steps')
      .select('*')
      .eq('company_id', companyId)
      .eq('step_id', stepId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching step progress:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update progress for a specific step for a company
   */
  static async updateStepProgress(
    companyId: string,
    stepId: string,
    updates: CompanyStepProgressUpdate
  ): Promise<CompanyJourneyStep> {
    // Check if a record already exists
    const existing = await this.getStepProgress(companyId, stepId);

    if (!existing) {
      // Create a new record
      const newData = {
        company_id: companyId,
        step_id: stepId,
        status: updates.status || 'not_started',
        notes: updates.notes,
        custom_difficulty: updates.custom_difficulty,
        custom_time_estimate: updates.custom_time_estimate,
        completion_percentage: updates.completion_percentage || 0,
        order_index: 0, // Default to end of list
        completed_at: updates.status === 'completed' ? new Date().toISOString() : null
      };

      const { data, error } = await supabase
        .from('company_journey_steps')
        .insert(newData)
        .select()
        .single();

      if (error) {
        console.error('Error creating step progress:', error);
        throw error;
      }

      // Track event on successful creation
      trackEvent('journey_step_progress_created', {
        companyId: companyId,
        stepId: stepId,
        status: data.status,
        completion_percentage: data.completion_percentage
      });

      return data;
    } else {
      // Update existing record
      const updateData: any = { ...updates };
      const previousStatus = existing.status; // Store previous status for tracking

      // Auto-set completed_at if status changes to completed
      if (updates.status === 'completed' && existing.status !== 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      // Clear completed_at if status changes from completed
      if (updates.status && updates.status !== 'completed' && existing.status === 'completed') {
        updateData.completed_at = null;
      }

      const { data, error } = await supabase
        .from('company_journey_steps')
        .update(updateData)
        .eq('company_id', companyId)
        .eq('step_id', stepId)
        .select()
        .single();

      if (error) {
        console.error('Error updating step progress:', error);
        throw error;
      }

      // Track event on successful update
      trackEvent('journey_step_progress_updated', {
        companyId: companyId,
        stepId: stepId,
        status: data.status,
        previousStatus: previousStatus, // Include previous status
        completion_percentage: data.completion_percentage
      });

      return data;
    }
  }

  // TOOLS

  /**
   * Get all tools for a specific step
   */
  static async getToolsForStep(stepId: string): Promise<Tool[]> {
    const { data, error } = await supabase
      .from('step_tools')
      .select('tools:tool_id(*)') // Join to get tool details
      .eq('step_id', stepId);

    if (error) {
      console.error('Error fetching tools for step:', error);
      throw error;
    }

    // Extract tools from the joined data
    return data.map((item: any) => item.tools) || [];
  }

  /**
   * Get company tool evaluations for a specific step
   */
  static async getCompanyToolEvaluations(companyId: string, stepId: string): Promise<CompanyStepTool[]> {
    const { data, error } = await supabase
      .from('company_step_tools')
      .select('*')
      .eq('company_id', companyId)
      .eq('step_id', stepId);

    if (error) {
      console.error('Error fetching company tool evaluations:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Update a tool evaluation for a company
   */
  static async updateToolEvaluation(
    companyId: string,
    stepId: string,
    toolId: string,
    updates: {
      rating?: number;
      notes?: string;
      is_selected?: boolean;
      is_custom?: boolean;
    }
  ): Promise<CompanyStepTool> {
    // Check if a record already exists
    const { data: existing, error: getError } = await supabase
      .from('company_step_tools')
      .select('*')
      .eq('company_id', companyId)
      .eq('step_id', stepId)
      .eq('tool_id', toolId)
      .maybeSingle();

    if (getError) {
      console.error('Error checking for existing tool evaluation:', getError);
      throw getError;
    }

    if (!existing) {
      // Create a new record
      const newData = {
        company_id: companyId,
        step_id: stepId,
        tool_id: toolId,
        rating: updates.rating,
        notes: updates.notes,
        is_selected: updates.is_selected || false,
        is_custom: false,
        selected_at: updates.is_selected ? new Date().toISOString() : null
      };

      const { data, error } = await supabase
        .from('company_step_tools')
        .insert(newData)
        .select()
        .single();

      if (error) {
        console.error('Error creating tool evaluation:', error);
        throw error;
      }

      return data;
    } else {
      // Update existing record
      const updateData: any = { ...updates };

      // Auto-set selected_at if is_selected changes to true
      if (updates.is_selected === true && !existing.is_selected) {
        updateData.selected_at = new Date().toISOString();
      }

      // Clear selected_at if is_selected changes to false
      if (updates.is_selected === false && existing.is_selected) {
        updateData.selected_at = null;
      }

      const { data, error } = await supabase
        .from('company_step_tools')
        .update(updateData)
        .eq('company_id', companyId)
        .eq('step_id', stepId)
        .eq('tool_id', toolId)
        .select()
        .single();

      if (error) {
        console.error('Error updating tool evaluation:', error);
        throw error;
      }

      return data;
    }
  }

  // RECOMMENDATIONS

  /**
   * Get recommended tools for a step
   */
  static async getRecommendedTools(stepId: string, limit: number = 5): Promise<Tool[]> {
    const { data, error } = await supabase
      .from('step_tools')
      .select('tools:tool_id(*), relevance_score')
      .eq('step_id', stepId)
      .order('relevance_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recommended tools:', error);
      throw error;
    }

    // Extract tools from the joined data
    return data.map((item: any) => item.tools) || [];
  }

  /**
   * Get personalized tool recommendations for a company and step
   */
  static async getPersonalizedRecommendedTools(
    companyId: string,
    stepId: string,
    limit: number = 5
  ): Promise<Tool[]> {
    // Call RPC function for personalized recommendations
    const { data, error } = await supabase
      .rpc('get_personalized_tool_recommendations', {
        p_company_id: companyId,
        p_step_id: stepId,
        p_limit: limit
      });

    if (error) {
      console.error('Error fetching personalized tool recommendations:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Compare multiple tools to help with decision-making
   */
  static async compareTool(toolIds: string[]): Promise<ToolComparisonResult[]> {
    if (!toolIds.length) {
      return [];
    }

    const { data, error } = await supabase
      .rpc('get_tool_comparison_data', { p_tool_ids: toolIds });

    if (error) {
      console.error('Error comparing tools:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Alias for compareTool for backward compatibility
   */
  static async compareTools(toolIds: string[]): Promise<ToolComparisonResult[]> {
    return this.compareTool(toolIds);
  }

  /**
   * Get a complete step with all associated data
   */
  static async getStepComplete(stepId: string, companyId?: string): Promise<JourneyStepComplete> {
    const step = await this.getStepById(stepId);
    if (!step) {
      throw new Error(`Step with ID ${stepId} not found`);
    }

    // Get phase info
    const phase = await this.getPhaseById(step.phase_id);

    // Get tools
    const tools = await this.getToolsForStep(stepId);

    // Get prerequisite steps
    let prerequisites: JourneyStep[] = [];
    if (step.prerequisite_steps && step.prerequisite_steps.length > 0) {
      prerequisites = await Promise.all(
        step.prerequisite_steps.map(id => this.getStepById(id))
      ).then(results => results.filter(Boolean) as JourneyStep[]);
    }

    // Get company progress if company ID provided
    let companyProgress = null;
    let selectedTool = null;
    if (companyId) {
      companyProgress = await this.getStepProgress(companyId, stepId);

      // Get selected tool if any
      if (companyProgress) {
        const evaluations = await this.getCompanyToolEvaluations(companyId, stepId);
        const selectedToolEval = evaluations.find(e => e.is_selected);

        if (selectedToolEval) {
          selectedTool = tools.find(t => t.id === selectedToolEval.tool_id) || null;
        }
      }
    }

    // Build the complete step object
    return {
      ...step,
      phase_name: phase?.name || '',
      phase_color: phase?.color || '',
      phase: phase || undefined,
      tools: tools || [],
      prerequisites: prerequisites || [],
      prerequisite_step_details: prerequisites || [],
      company_progress: companyProgress || undefined,
      progress: companyProgress || undefined,
      selected_tool: selectedTool || undefined
    };
  }

  /**
   * Add a custom tool for a specific company
   * Optionally associate with a step and set as selected
   */
  static async addCustomTool(
    companyId: string,
    toolData: {
      name: string;
      description?: string;
      url?: string;
      type?: string;
      category?: string;
      is_premium?: boolean;
    },
    stepId?: string,
    isSelected?: boolean
  ): Promise<string> {
    // First create the tool
    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .insert({
        name: toolData.name,
        description: toolData.description || '',
        url: toolData.url || '',
        type: toolData.type || 'custom',
        category: toolData.category,
        is_premium: toolData.is_premium !== undefined ? toolData.is_premium : false
      })
      .select()
      .single();

    if (toolError) {
      console.error('Error creating custom tool:', toolError);
      throw toolError;
    }

    // If step ID is provided, associate the tool with the step
    if (stepId) {
      await supabase
        .from('step_tools')
        .insert({
          step_id: stepId,
          tool_id: tool.id,
          relevance_score: 1.0 // Custom tools are always highly relevant
        });

      // Create company tool evaluation
      await this.updateToolEvaluation(
        companyId,
        stepId,
        tool.id,
        {
          notes: '',
          is_selected: isSelected || false,
          is_custom: true
        }
      );
    }

    return tool.id;
  }

  // ANALYTICS

  /**
   * Get phase completion statistics for a company
   */
  static async getPhaseCompletionStats(companyId: string): Promise<PhaseCompletionStats[]> {
    const { data, error } = await supabase
      .rpc('get_phase_completion_stats', { p_company_id: companyId });

    if (error) {
      console.error('Error fetching phase completion stats:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get journey timeline events for a company
   */
  static async getJourneyTimelineEvents(
    companyId: string,
    limit: number = 20
  ): Promise<JourneyTimelineEvent[]> {
    const { data, error } = await supabase
      .from('journey_timeline_events')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching journey timeline events:', error);
      throw error;
    }

    return data || [];
  }
}

export default JourneyUnifiedService;
