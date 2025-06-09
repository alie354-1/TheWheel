/**
 * Recommendation Service - Real Implementation
 * 
 * Provides personalized recommendations for journey steps, including:
 * - Expert recommendations
 * - Template recommendations
 * - Peer insights
 */

import { supabase } from '../../supabase';

// Define types for Supabase responses
interface ExpertProfile {
  id: string;
  user_id: string;
  name: string;
  specialization: string[];
  hourly_rate: number;
  success_rate: number;
}

interface ExpertRecommendationData {
  id: string;
  step_id: string;
  expert_id: string;
  relevance_score: number;
  expert_profiles: ExpertProfile;
}

// Expert recommendation types
export interface ExpertRecommendation {
  expertId: string;
  name?: string;
  specialization?: string[];
  successRate: number; // 0-1 scale
  relevanceScore: number; // 0-1 scale
  avgCompletionTime?: string; // e.g. "3 days"
  pricePoint?: number; // hourly rate
  availability?: string; // e.g. "Next available: June 15"
}

// Template recommendation types
export interface TemplateRecommendation {
  templateId: string;
  name?: string;
  description?: string;
  type: 'deck' | 'document' | 'tool';
  relevanceScore: number; // 0-1 scale
  usageRate: number; // number of times used
  previewUrl?: string;
}

// Peer insight types
export interface PeerInsight {
  relevanceScore: number; // 0-1 scale
  avgTimeToComplete?: string; // e.g. "14 days"
  commonBlockers?: string[];
  successStrategies?: string[];
  outcomeMetrics?: any[]; // e.g. [{metric: "Conversion Rate", value: "3.2%"}]
}

// Combined recommendations for a step
export interface StepRecommendations {
  stepId: string;
  companyId: string;
  expertRecommendations: ExpertRecommendation[];
  templateRecommendations: TemplateRecommendation[];
  peerInsights: PeerInsight;
}

class RecommendationService {
  /**
   * Get personalized recommendations for a specific journey step
   */
  async getStepRecommendations(companyId: string, stepId: string): Promise<StepRecommendations> {
    try {
      // Get expert recommendations
      const { data: expertData, error: expertError } = await supabase
        .from('step_expert_recommendations')
        .select(`
          id,
          step_id,
          expert_id,
          relevance_score,
          expert_profiles:expert_id (
            id,
            user_id,
            name,
            specialization,
            hourly_rate,
            success_rate
          )
        `)
        .eq('step_id', stepId)
        .order('relevance_score', { ascending: false });

      if (expertError) throw expertError;

      // Get template recommendations
      const { data: templateData, error: templateError } = await supabase
        .from('step_template_recommendations')
        .select('*')
        .eq('step_id', stepId)
        .order('relevance_score', { ascending: false });

      if (templateError) throw templateError;

      // Get peer insights
      const { data: insightData, error: insightError } = await supabase
        .from('peer_insights')
        .select('*')
        .eq('step_id', stepId)
        .single();

      if (insightError && insightError.code !== 'PGRST116') throw insightError;

      // Format expert recommendations
      const expertRecommendations = expertData.map((item: any) => {
        const expert = item.expert_profiles || {};
        return {
          expertId: item.expert_id,
          name: expert.name,
          specialization: expert.specialization,
          successRate: expert.success_rate || 0.8,
          relevanceScore: item.relevance_score,
          pricePoint: expert.hourly_rate,
          // We would need to fetch availability from the availability service
          // This is a placeholder
          availability: 'Available next week'
        };
      });

      // Format template recommendations
      const templateRecommendations = templateData.map(item => {
        return {
          templateId: item.template_id,
          name: item.title || `Template ${item.id}`,
          description: item.description,
          type: item.template_type as 'deck' | 'document' | 'tool',
          relevanceScore: item.relevance_score,
          usageRate: 100, // Placeholder, would need to fetch actual usage data
          previewUrl: item.preview_url
        };
      });

      // Format peer insights
      const peerInsights: PeerInsight = insightData ? {
        relevanceScore: 0.8, // Placeholder, would need to calculate based on data quality
        avgTimeToComplete: insightData.avg_time_to_complete ? `${insightData.avg_time_to_complete} days` : undefined,
        commonBlockers: insightData.common_blockers,
        successStrategies: insightData.success_strategies,
        outcomeMetrics: insightData.outcome_metrics ? 
          Object.entries(insightData.outcome_metrics).map(([metric, value]) => ({ metric, value })) : 
          []
      } : {
        relevanceScore: 0,
      };

      return {
        stepId,
        companyId,
        expertRecommendations,
        templateRecommendations,
        peerInsights
      };
    } catch (error) {
      console.error('Error fetching step recommendations:', error);
      // Return empty recommendations on error
      return {
        stepId,
        companyId,
        expertRecommendations: [],
        templateRecommendations: [],
        peerInsights: { relevanceScore: 0 }
      };
    }
  }

  /**
   * Get recommendations for experts across all journey steps
   */
  async getExpertRecommendations(companyId: string): Promise<ExpertRecommendation[]> {
    try {
      // Get all expert recommendations for this company's journey steps
      const { data: companySteps, error: stepsError } = await supabase
        .from('step_progress')
        .select('step_id')
        .eq('company_id', companyId);

      if (stepsError) throw stepsError;

      if (!companySteps || companySteps.length === 0) {
        return [];
      }

      const stepIds = companySteps.map(step => step.step_id);

      const { data: expertData, error: expertError } = await supabase
        .from('step_expert_recommendations')
        .select(`
          id,
          step_id,
          expert_id,
          relevance_score,
          expert_profiles:expert_id (
            id,
            user_id,
            name,
            specialization,
            hourly_rate,
            success_rate
          )
        `)
        .in('step_id', stepIds)
        .order('relevance_score', { ascending: false });

      if (expertError) throw expertError;

      // Format and deduplicate experts
      const expertsMap = new Map<string, ExpertRecommendation>();
      
      expertData.forEach((item: any) => {
        const expert = item.expert_profiles || {};
        if (!expert) return;
        
        // If we already have this expert with a higher relevance score, skip
        if (expertsMap.has(item.expert_id) && 
            expertsMap.get(item.expert_id)!.relevanceScore > item.relevance_score) {
          return;
        }
        
        expertsMap.set(item.expert_id, {
          expertId: item.expert_id,
          name: expert.name,
          specialization: expert.specialization,
          successRate: expert.success_rate || 0.8,
          relevanceScore: item.relevance_score,
          pricePoint: expert.hourly_rate
        });
      });

      return Array.from(expertsMap.values());
    } catch (error) {
      console.error('Error fetching expert recommendations:', error);
      return [];
    }
  }

  /**
   * Get recommendations for templates across all journey steps
   */
  async getTemplateRecommendations(companyId: string): Promise<TemplateRecommendation[]> {
    try {
      // Get all template recommendations for this company's journey steps
      const { data: companySteps, error: stepsError } = await supabase
        .from('step_progress')
        .select('step_id')
        .eq('company_id', companyId);

      if (stepsError) throw stepsError;

      if (!companySteps || companySteps.length === 0) {
        return [];
      }

      const stepIds = companySteps.map(step => step.step_id);

      const { data: templateData, error: templateError } = await supabase
        .from('step_template_recommendations')
        .select('*')
        .in('step_id', stepIds)
        .order('relevance_score', { ascending: false });

      if (templateError) throw templateError;

      // Format and deduplicate templates
      const templatesMap = new Map<string, TemplateRecommendation>();
      
      templateData.forEach(item => {
        // If we already have this template with a higher relevance score, skip
        if (templatesMap.has(item.template_id) && 
            templatesMap.get(item.template_id)!.relevanceScore > item.relevance_score) {
          return;
        }
        
        templatesMap.set(item.template_id, {
          templateId: item.template_id,
          name: item.title || `Template ${item.id}`,
          description: item.description,
          type: item.template_type as 'deck' | 'document' | 'tool',
          relevanceScore: item.relevance_score,
          usageRate: 100, // Placeholder, would need to fetch actual usage data
          previewUrl: item.preview_url
        });
      });

      return Array.from(templatesMap.values());
    } catch (error) {
      console.error('Error fetching template recommendations:', error);
      return [];
    }
  }
}

export const recommendationService = new RecommendationService();
