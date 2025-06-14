/**
 * Company Journey Service (Enhanced)
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

export const companyJourneyServiceEnhanced = {
  /**
   * Get all company journey steps with filtering
   */
  async getCompanySteps(companyId: string, filters: CompanyStepFilters = {}): Promise<CompanyJourneyStep[]> {
    let query = supabase
      .from('company_journey_steps_new')
      .select(`
        *,
        journey_phases_new!phase_id(name, color),
        journey_domains_new!domain_id(name, color)
      `)
      .eq('company_id', companyId)
      .eq('is_active', true);

    if (filters.phaseId) {
      query = query.eq('phase_id', filters.phaseId);
    }

    if (filters.domainId) {
      query = query.eq('domain_id', filters.domainId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.includeCustom === false) {
      query = query.eq('is_custom', false);
    }

    query = query.order('phase_id').order('order_index');

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a specific company step
   */
  async getCompanyStep(companyId: string, stepId: string): Promise<CompanyJourneyStep | null> {
    const { data, error } = await supabase
      .from('company_journey_steps_new')
      .select(`
        *,
        journey_phases_new!phase_id(*),
        journey_domains_new!domain_id(*)
      `)
      .eq('company_id', companyId)
      .eq('id', stepId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  },

  /**
   * Create a custom step for a company
   */
  async createCustomStep(stepData: CreateCustomStepData): Promise<CompanyJourneyStep> {
    const { data, error } = await supabase
      .from('company_journey_steps_new')
      .insert({
        company_id: stepData.companyId,
        canonical_step_id: null, // Custom step
        name: stepData.name,
        description: stepData.description,
        phase_id: stepData.phaseId,
        domain_id: stepData.domainId,
        order_index: stepData.orderIndex || 1,
        status: 'not_started',
        custom_difficulty: stepData.difficulty,
        custom_time_estimate: stepData.timeEstimate,
        is_custom: true,
        is_active: true,
        content_override_markdown: stepData.contentMarkdown,
        checklist_override: stepData.checklist,
        resources_override: stepData.resources
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a company step
   */
  async updateCompanyStep(companyId: string, stepId: string, updates: Partial<CompanyJourneyStep>): Promise<CompanyJourneyStep> {
    const { data, error } = await supabase
      .from('company_journey_steps_new')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('company_id', companyId)
      .eq('id', stepId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update step progress
   */
  async updateStepProgress(companyId: string, stepId: string, progressUpdate: {
    status?: step_status;
    notes?: string;
    completionPercentage?: number;
  }): Promise<CompanyJourneyStep> {
    const updateData: any = {
      ...progressUpdate,
      updated_at: new Date().toISOString()
    };

    if (progressUpdate.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      updateData.completion_percentage = 100;
    }

    const { data, error } = await supabase
      .from('company_journey_steps_new')
      .update(updateData)
      .eq('company_id', companyId)
      .eq('id', stepId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Reorder company steps
   */
  async reorderSteps(companyId: string, stepOrderUpdates: Array<{ stepId: string; orderIndex: number }>): Promise<void> {
    const updates = stepOrderUpdates.map(({ stepId, orderIndex }) => 
      supabase
        .from('company_journey_steps_new')
        .update({ order_index: orderIndex })
        .eq('company_id', companyId)
        .eq('id', stepId)
    );

    const results = await Promise.all(updates);
    
    for (const { error } of results) {
      if (error) throw error;
    }
  },

  /**
   * Delete/deactivate a company step
   */
  async deleteCompanyStep(companyId: string, stepId: string): Promise<void> {
    const { error } = await supabase
      .from('company_journey_steps_new')
      .update({ is_active: false })
      .eq('company_id', companyId)
      .eq('id', stepId);

    if (error) throw error;
  },

  /**
   * Get company journey paths
   */
  async getCompanyPaths(companyId: string): Promise<CompanyJourneyPath[]> {
    const { data, error } = await supabase
      .from('company_journey_paths')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new journey path
   */
  async createJourneyPath(companyId: string, pathData: {
    name: string;
    description?: string;
    isDefault?: boolean;
  }): Promise<CompanyJourneyPath> {
    // If this is set as default, unset other defaults
    if (pathData.isDefault) {
      await supabase
        .from('company_journey_paths')
        .update({ is_default: false })
        .eq('company_id', companyId);
    }

    const { data, error } = await supabase
      .from('company_journey_paths')
      .insert({
        company_id: companyId,
        name: pathData.name,
        description: pathData.description,
        is_default: pathData.isDefault || false,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get step arrangements for a path
   */
  async getPathStepArrangements(companyId: string, pathId: string): Promise<CompanyStepArrangement[]> {
    const { data, error } = await supabase
      .from('company_step_arrangements')
      .select(`
        *,
        company_journey_steps!step_id(*)
      `)
      .eq('company_id', companyId)
      .eq('path_id', pathId)
      .order('order_index');

    if (error) throw error;
    return data || [];
  },

  /**
   * Add custom tool to a step
   */
  async addCustomTool(companyId: string, stepId: string, toolData: {
    name: string;
    url: string;
    description?: string;
    functionality?: string;
  }): Promise<CompanyCustomTool> {
    const { data, error } = await supabase
      .from('company_custom_tools')
      .insert({
        company_id: companyId,
        step_id: stepId,
        name: toolData.name,
        url: toolData.url,
        description: toolData.description,
        functionality: toolData.functionality
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get custom tools for a step
   */
  async getCustomTools(companyId: string, stepId: string): Promise<CompanyCustomTool[]> {
    const { data, error } = await supabase
      .from('company_custom_tools')
      .select('*')
      .eq('company_id', companyId)
      .eq('step_id', stepId)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  /**
   * Get company journey analytics
   */
  async getJourneyAnalytics(companyId: string): Promise<{
    totalSteps: number;
    completedSteps: number;
    inProgressSteps: number;
    completionRate: number;
    avgTimePerStep: number;
    stepsByPhase: Array<{ phase: string; total: number; completed: number }>;
    recentActivity: Array<{ stepName: string; action: string; date: string }>;
  }> {
    // Get step counts
    const { data: allSteps } = await supabase
      .from('company_journey_steps_new')
      .select('status, journey_phases_new!phase_id(name)')
      .eq('company_id', companyId)
      .eq('is_active', true);

    const totalSteps = allSteps?.length || 0;
    const completedSteps = allSteps?.filter(s => s.status === 'completed').length || 0;
    const inProgressSteps = allSteps?.filter(s => s.status === 'in_progress').length || 0;
    const completionRate = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    // Group by phase
    const stepsByPhase = (allSteps || []).reduce((acc: any[], step) => {
      const phaseName = (step.journey_phases_new as any)?.name || 'Unknown';
      const existing = acc.find(p => p.phase === phaseName);
      if (existing) {
        existing.total++;
        if (step.status === 'completed') existing.completed++;
      } else {
        acc.push({
          phase: phaseName,
          total: 1,
          completed: step.status === 'completed' ? 1 : 0
        });
      }
      return acc;
    }, []);

    // Get recent activity (last 10 updates)
    const { data: recentActivity } = await supabase
      .from('company_journey_steps_new')
      .select('name, status, updated_at')
      .eq('company_id', companyId)
      .order('updated_at', { ascending: false })
      .limit(10);

    const formattedActivity = (recentActivity || []).map(step => ({
      stepName: step.name,
      action: step.status === 'completed' ? 'Completed' : 'Updated',
      date: step.updated_at
    }));

    return {
      totalSteps,
      completedSteps,
      inProgressSteps,
      completionRate,
      avgTimePerStep: 0, // Would need time tracking data
      stepsByPhase,
      recentActivity: formattedActivity
    };
  }
};
