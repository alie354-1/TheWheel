import { SupabaseClient } from '@supabase/supabase-js';
import { GeneralLLMService, getGeneralLLMService, QueryContext } from '../general-llm.service';

export interface Recommendation {
  id: number;
  title: string;
  description: string;
  type: 'step' | 'expert' | 'template';
}

export interface AiRecommendationService {
  getStepRecommendations(userId: string): Promise<Recommendation[]>;
  getExpertRecommendations(userId: string, stepId: number): Promise<Recommendation[]>;
  getTemplateRecommendations(userId: string, stepId: number): Promise<Recommendation[]>;
  recordFeedback(userId: string, recommendationId: number, isHelpful: boolean, feedback?: string): Promise<void>;
}

export class RealAiRecommendationService implements AiRecommendationService {
  private supabase: SupabaseClient;
  private llmService: GeneralLLMService;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.llmService = getGeneralLLMService();
  }

  private async getRecommendations(prompt: string, context: QueryContext): Promise<Recommendation[]> {
    const completion = await this.llmService.query(prompt, context);
    if (completion) {
      try {
        // The completion is expected to be a JSON string array of objects
        return JSON.parse(completion);
      } catch (error) {
        console.error('Error parsing recommendations:', error);
        return [];
      }
    }
    return [];
  }

  async getStepRecommendations(userId: string): Promise<Recommendation[]> {
    const userProfile = await this.supabase.from('users').select('*').eq('id', userId).single();
    if (!userProfile.data) return [];

    const company = await this.supabase.from('companies').select('*').eq('id', userProfile.data.company_id).single();
    if (!company.data) return [];

    const lastCompletedStep = await this.supabase.from('step_progress').select('step_id').eq('company_id', company.data.id).order('completed_at', { ascending: false }).limit(1).single();

    const prompt = `
      Given the following user and company information, recommend the next 3 journey steps.
      User Profile: ${JSON.stringify(userProfile.data)}
      Company Profile: ${JSON.stringify(company.data)}
      Last Completed Step ID: ${lastCompletedStep.data?.step_id || 'None'}

      Return the recommendations as a JSON array of objects with the following format:
      [
        {"id": <step_id>, "title": "<step_title>", "description": "<step_description>", "type": "step"},
        ...
      ]
    `;

    return this.getRecommendations(prompt, {
      userId,
      companyId: company.data.id,
      feature: 'journey-step-recommendation',
    });
  }

  async getExpertRecommendations(userId: string, stepId: number): Promise<Recommendation[]> {
    const step = await this.supabase.from('journey_steps').select('*').eq('id', stepId).single();
    const userProfile = await this.supabase.from('users').select('*').eq('id', userId).single();
    if (!userProfile.data) return [];

    const company = await this.supabase.from('companies').select('*').eq('id', userProfile.data.company_id).single();
    if (!company.data) return [];

    const prompt = `
      Given the following user, company, and journey step information, recommend 3 relevant experts.
      User Profile: ${JSON.stringify(userProfile.data)}
      Company Profile: ${JSON.stringify(company.data)}
      Journey Step: ${JSON.stringify(step.data)}

      Return the recommendations as a JSON array of objects with the following format:
      [
        {"id": <expert_id>, "title": "<expert_name>", "description": "<expert_bio>", "type": "expert"},
        ...
      ]
    `;

    return this.getRecommendations(prompt, {
      userId,
      companyId: company.data.id,
      feature: 'expert-recommendation',
    });
  }

  async getTemplateRecommendations(userId: string, stepId: number): Promise<Recommendation[]> {
    const step = await this.supabase.from('journey_steps').select('*').eq('id', stepId).single();
    const userProfile = await this.supabase.from('users').select('*').eq('id', userId).single();
    if (!userProfile.data) return [];

    const company = await this.supabase.from('companies').select('*').eq('id', userProfile.data.company_id).single();
    if (!company.data) return [];

    const prompt = `
      Given the following user, company, and journey step information, recommend 3 relevant templates.
      User Profile: ${JSON.stringify(userProfile.data)}
      Company Profile: ${JSON.stringify(company.data)}
      Journey Step: ${JSON.stringify(step.data)}

      Return the recommendations as a JSON array of objects with the following format:
      [
        {"id": <template_id>, "title": "<template_name>", "description": "<template_description>", "type": "template"},
        ...
      ]
    `;

    return this.getRecommendations(prompt, {
      userId,
      companyId: company.data.id,
      feature: 'template-recommendation',
    });
  }

  async recordFeedback(userId: string, recommendationId: number, isHelpful: boolean, feedback?: string): Promise<void> {
    const { error } = await this.supabase.from('recommendation_feedback').insert([
      {
        user_id: userId,
        recommendation_id: recommendationId,
        is_helpful: isHelpful,
        feedback: feedback,
        recommendation_type: 'unknown', // TODO: Determine how to get the type
      },
    ]);

    if (error) {
      console.error('Error recording feedback:', error);
      throw error;
    }
  }
}
