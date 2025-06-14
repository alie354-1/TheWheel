/**
 * Journey Framework Service
 * 
 * Manages the canonical journey framework (150+ steps) including:
 * - Framework step management and versioning
 * - Template updates and notifications
 * - Step import/export for companies
 * - Community contributions and approval workflows
 */

import { supabase } from '../supabase';
import {
  JourneyPhase,
  JourneyDomain,
  JourneyStepTemplate,
  JourneyStep,
  CompanyJourneyStep,
  step_status,
  difficulty_level,
  Tool,
  StepTool
} from '../types/journey-unified.types';

export interface FrameworkStepImportOptions {
  companyId: string;
  stepIds: string[];
  targetPhaseId?: string;
  customizeOnImport?: boolean;
  preserveOrder?: boolean;
}

export interface TemplateUpdateNotification {
  id: string;
  templateId: string;
  companyId: string;
  updateType: 'new_version' | 'content_change' | 'deprecation';
  title: string;
  description: string;
  actionRequired: boolean;
  isRead: boolean;
  createdAt: string;
}

export const journeyFrameworkService = {
  /**
   * Get all canonical phases
   */
  async getPhases(): Promise<JourneyPhase[]> {
    const { data, error } = await supabase
      .from('journey_phases_new')
      .select('*')
      .eq('is_active', true)
      .order('order_index');

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all canonical domains
   */
  async getDomains(): Promise<JourneyDomain[]> {
    const { data, error } = await supabase
      .from('journey_domains_new')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  /**
   * Get canonical framework steps with filtering
   */
  async getFrameworkSteps(filters: {
    phaseId?: string;
    domainId?: string;
    difficulty?: difficulty_level;
    search?: string;
    limit?: number;
  } = {}): Promise<JourneyStep[]> {
    let query = supabase
      .from('journey_canonical_steps')
      .select(`
        *,
        journey_phases_new!phase_id(name, color),
        journey_domains_new!domain_id(name, color)
      `)
      .eq('is_active', true);

    if (filters.phaseId) {
      query = query.eq('phase_id', filters.phaseId);
    }

    if (filters.domainId) {
      query = query.eq('domain_id', filters.domainId);
    }

    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    query = query.order('phase_id').order('order_index');

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Import framework steps into a company's journey
   */
  async importStepsToCompany(options: FrameworkStepImportOptions): Promise<CompanyJourneyStep[]> {
    const { companyId, stepIds, targetPhaseId, customizeOnImport, preserveOrder } = options;

    // Get the canonical steps
    const { data: canonicalSteps, error: fetchError } = await supabase
      .from('journey_canonical_steps')
      .select('*')
      .in('id', stepIds);

    if (fetchError) throw fetchError;
    if (!canonicalSteps?.length) throw new Error('No steps found to import');

    // Prepare company steps for insertion
    const companySteps = canonicalSteps.map((step, index) => ({
      company_id: companyId,
      canonical_step_id: step.id,
      name: step.name,
      description: step.description,
      phase_id: targetPhaseId || step.phase_id,
      domain_id: step.domain_id,
      order_index: preserveOrder ? step.order_index : index + 1,
      status: 'not_started' as step_status,
      custom_difficulty: customizeOnImport ? undefined : step.difficulty,
      custom_time_estimate: customizeOnImport ? undefined : step.estimated_time_days,
      is_custom: false,
      is_active: true
    }));

    const { data, error } = await supabase
      .from('company_journey_steps_new')
      .insert(companySteps)
      .select();

    if (error) throw error;
    return data || [];
  },

  /**
   * Get template update notifications for a company
   */
  async getTemplateUpdateNotifications(companyId: string): Promise<TemplateUpdateNotification[]> {
    const { data, error } = await supabase
      .from('template_update_notifications')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Mark template update notification as read
   */
  async markNotificationRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('template_update_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  /**
   * Get step templates (for browsing and customization)
   */
  async getStepTemplates(filters: {
    category?: string;
    difficulty?: difficulty_level;
    search?: string;
    includeDeprecated?: boolean;
  } = {}): Promise<JourneyStepTemplate[]> {
    let query = supabase
      .from('journey_step_templates')
      .select('*');

    if (!filters.includeDeprecated) {
      query = query.eq('is_active', true);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    query = query.order('name');

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new step template (community contribution)
   */
  async createStepTemplate(template: Omit<JourneyStepTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<JourneyStepTemplate> {
    const { data, error } = await supabase
      .from('journey_step_templates')
      .insert({
        ...template,
        is_community_created: true,
        approval_status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update step template version
   */
  async updateStepTemplate(templateId: string, updates: Partial<JourneyStepTemplate>): Promise<JourneyStepTemplate> {
    // Create new version
    const { data: currentTemplate, error: fetchError } = await supabase
      .from('journey_step_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (fetchError) throw fetchError;

    // Mark current version as not latest
    await supabase
      .from('journey_step_templates')
      .update({ is_latest: false })
      .eq('id', templateId);

    // Create new version
    const { data, error } = await supabase
      .from('journey_step_templates')
      .insert({
        ...currentTemplate,
        ...updates,
        version: currentTemplate.version + 1,
        is_latest: true,
        previous_version_id: templateId
      })
      .select()
      .single();

    if (error) throw error;

    // Notify companies using this template
    await this.notifyTemplateUpdate(templateId, 'new_version');

    return data;
  },

  /**
   * Get tools for a specific step
   */
  async getStepTools(stepId: string): Promise<Tool[]> {
    const { data, error } = await supabase
      .from('step_tools')
      .select(`
        tools:tool_id(*)
      `)
      .eq('step_id', stepId)
      .order('relevance_score', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => item.tools as unknown as Tool);
  },

  /**
   * Notify companies about template updates
   */
  async notifyTemplateUpdate(templateId: string, updateType: 'new_version' | 'content_change' | 'deprecation'): Promise<void> {
    // Get companies using this template
    const { data: companySteps, error } = await supabase
      .from('company_journey_steps_new')
      .select('company_id')
      .eq('framework_step_id', templateId);

    if (error) throw error;

    const uniqueCompanyIds = [...new Set(companySteps?.map(s => s.company_id) || [])];

    if (uniqueCompanyIds.length === 0) return;

    // Create notifications
    const notifications = uniqueCompanyIds.map(companyId => ({
      template_id: templateId,
      company_id: companyId,
      update_type: updateType,
      title: this.getNotificationTitle(updateType),
      description: this.getNotificationDescription(updateType),
      action_required: updateType === 'deprecation',
      is_read: false
    }));

    await supabase
      .from('template_update_notifications')
      .insert(notifications);
  },

  /**
   * Helper methods for notifications
   */
  getNotificationTitle(updateType: string): string {
    switch (updateType) {
      case 'new_version':
        return 'Step Template Updated';
      case 'content_change':
        return 'Step Content Changed';
      case 'deprecation':
        return 'Step Template Deprecated';
      default:
        return 'Template Update';
    }
  },

  getNotificationDescription(updateType: string): string {
    switch (updateType) {
      case 'new_version':
        return 'A step template you\'re using has been updated with new content and improvements.';
      case 'content_change':
        return 'The content of a step template you\'re using has been modified.';
      case 'deprecation':
        return 'A step template you\'re using has been deprecated. Please review and update your journey.';
      default:
        return 'A step template you\'re using has been updated.';
    }
  }
};
