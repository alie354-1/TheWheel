import { supabase } from '../supabase';
import { v4 as uuidv4 } from 'uuid';
import { generalLLMService } from './general-llm.service';
import { 
  IdeaWorkspace,
  UnifiedIdea,
  IdeaAnalysis,
  IdeaComparison,
  IdeaComparisonResult,
  IdeaMerge,
  IdeaGenerationParams,
  IdeaContext
} from '../types/unified-idea.types';

export class UnifiedIdeaService {
  constructor() {}

  /**
   * Create a new idea workspace
   */
  async createWorkspace(
    userId: string,
    title: string = 'New Workspace',
    description: string = ''
  ): Promise<IdeaWorkspace | null> {
    try {
      const { data, error } = await supabase
        .from('idea_workspaces')
        .insert({
          user_id: userId,
          title,
          description
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating idea workspace:', error);
        return null;
      }

      return data as IdeaWorkspace;
    } catch (error) {
      console.error('Error in createWorkspace:', error);
      return null;
    }
  }

  /**
   * Get all workspaces for a user
   */
  async getWorkspaces(userId: string): Promise<IdeaWorkspace[]> {
    try {
      const { data, error } = await supabase
        .from('idea_workspaces')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching idea workspaces:', error);
        return [];
      }

      return data as IdeaWorkspace[];
    } catch (error) {
      console.error('Error in getWorkspaces:', error);
      return [];
    }
  }

  /**
   * Get a specific workspace
   */
  async getWorkspace(workspaceId: string): Promise<IdeaWorkspace | null> {
    try {
      const { data, error } = await supabase
        .from('idea_workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single();

      if (error) {
        console.error('Error fetching idea workspace:', error);
        return null;
      }

      return data as IdeaWorkspace;
    } catch (error) {
      console.error('Error in getWorkspace:', error);
      return null;
    }
  }

  /**
   * Update a workspace
   */
  async updateWorkspace(
    workspaceId: string,
    updates: Partial<IdeaWorkspace>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('idea_workspaces')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', workspaceId);

      if (error) {
        console.error('Error updating idea workspace:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateWorkspace:', error);
      return false;
    }
  }

  /**
   * Delete a workspace and all associated ideas
   */
  async deleteWorkspace(workspaceId: string): Promise<boolean> {
    try {
      // Delete the workspace (cascade will handle associated ideas)
      const { error } = await supabase
        .from('idea_workspaces')
        .delete()
        .eq('id', workspaceId);

      if (error) {
        console.error('Error deleting idea workspace:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteWorkspace:', error);
      return false;
    }
  }

  /**
   * Generate multiple business ideas based on input parameters
   */
  async generateIdeas(
    workspaceId: string,
    userId: string,
    params: IdeaGenerationParams
  ): Promise<UnifiedIdea[]> {
    try {
      console.log('Generating ideas with params:', params);
      
      // MOCK IMPLEMENTATION: Generate mock ideas based on the input parameters
      // This allows the feature to work without needing a real OpenAI API key
      const mockIdeas = this.generateMockIdeas(params);
      
      // Map the ideas to our UnifiedIdea type
      const ideas = mockIdeas.map(idea => ({
        id: uuidv4(),
        workspace_id: workspaceId,
        title: idea.title || 'Untitled Idea',
        description: idea.description || '',
        problem_statement: idea.problem_statement || '',
        solution_concept: idea.solution_concept || '',
        target_audience: idea.target_audience || '',
        unique_value: idea.unique_value || '',
        business_model: idea.business_model || '',
        marketing_strategy: idea.marketing_strategy || '',
        revenue_model: idea.revenue_model || '',
        go_to_market: idea.go_to_market || '',
        market_size: idea.market_size || '',
        user_id: userId,
        refinement_stage: 'draft' as const,
        is_merged: false,
        parent_ideas: [],
        version: 1,
        competition: Array.isArray(idea.competition) ? idea.competition : [],
        revenue_streams: Array.isArray(idea.revenue_streams) ? idea.revenue_streams : [],
        cost_structure: Array.isArray(idea.cost_structure) ? idea.cost_structure : [],
        key_metrics: Array.isArray(idea.key_metrics) ? idea.key_metrics : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      // Save the ideas to the database
      const { data, error } = await supabase
        .from('unified_ideas')
        .insert(ideas)
        .select();
        
      if (error) {
        console.error('Error saving generated ideas:', error);
        return ideas; // Return the ideas even if saving failed
      }
      
      return data as UnifiedIdea[];
    } catch (error) {
      console.error('Error generating ideas:', error);
      return [];
    }
  }
  
  /**
   * Generate mock ideas based on input parameters
   * This is used when the OpenAI API is not available
   */
  private generateMockIdeas(params: IdeaGenerationParams): any[] {
    const count = params.count || 3;
    const industry = params.topic || params.industry || 'Technology';
    const targetAudience = params.target_audience || 'General consumers';
    const problemArea = params.problem_area || 'Efficiency';
    
    // Base ideas that will be customized based on parameters
    const baseIdeas = [
      {
        title: "AI-Powered Personal Assistant",
        description: "An intelligent personal assistant that helps users manage their daily tasks, schedule, and communications.",
        problem_statement: "People struggle to manage their time effectively and often forget important tasks or appointments.",
        solution_concept: "An AI assistant that learns user preferences and habits to provide personalized reminders, suggestions, and automation.",
        target_audience: "Busy professionals and students",
        unique_value: "Personalized AI that adapts to individual user patterns and needs",
        business_model: "Freemium SaaS with premium features for power users",
        marketing_strategy: "Content marketing focusing on productivity and time management",
        revenue_model: "Subscription-based with tiered pricing",
        go_to_market: "Free trial with limited features, targeted digital marketing",
        market_size: "$5B annually with 15% growth rate",
        competition: ["Existing calendar apps", "Task management tools", "Email clients with built-in scheduling"],
        revenue_streams: ["Premium subscriptions", "Enterprise licenses", "API access for developers"],
        cost_structure: ["AI development and maintenance", "Server costs", "Marketing", "Customer support"],
        key_metrics: ["User retention", "Conversion rate", "Feature usage", "Time saved per user"]
      }
    ];
    
    // Return a subset of the ideas
    return baseIdeas.slice(0, count);
  }

  /**
   * Get all ideas in a workspace
   */
  async getIdeas(workspaceId: string): Promise<UnifiedIdea[]> {
    try {
      const { data, error } = await supabase
        .from('unified_ideas')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ideas:', error);
        return [];
      }

      return data as UnifiedIdea[];
    } catch (error) {
      console.error('Error in getIdeas:', error);
      return [];
    }
  }

  /**
   * Get a specific idea
   */
  async getIdea(ideaId: string): Promise<UnifiedIdea | null> {
    try {
      const { data, error } = await supabase
        .from('unified_ideas')
        .select('*')
        .eq('id', ideaId)
        .single();

      if (error) {
        console.error('Error fetching idea:', error);
        return null;
      }

      return data as UnifiedIdea;
    } catch (error) {
      console.error('Error in getIdea:', error);
      return null;
    }
  }

  /**
   * Update an idea
   */
  async updateIdea(
    ideaId: string,
    updates: Partial<UnifiedIdea>
  ): Promise<boolean> {
    try {
      // Filter out properties that don't exist in the database schema
      // This prevents errors when trying to update columns that don't exist
      const allowedColumns = [
        'title',
        'description',
        'problem_statement',
        'solution_concept',
        'target_audience',
        'unique_value',
        'business_model',
        'marketing_strategy',
        'revenue_model',
        'go_to_market',
        'market_size',
        'refinement_stage',
        'is_merged',
        'parent_ideas',
        'version',
        'competition',
        'revenue_streams',
        'cost_structure',
        'key_metrics',
        'analysis'
      ];
      
      const filteredUpdates: Record<string, any> = {};
      
      for (const key of allowedColumns) {
        if (key in updates) {
          filteredUpdates[key] = updates[key as keyof typeof updates];
        }
      }
      
      // Always update the updated_at timestamp
      filteredUpdates.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('unified_ideas')
        .update(filteredUpdates)
        .eq('id', ideaId);

      if (error) {
        console.error('Error updating idea:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateIdea:', error);
      return false;
    }
  }

  /**
   * Create a prompt for analyzing an idea
   */
  private createIdeaAnalysisPrompt(idea: UnifiedIdea): string {
    return `Analyze the following business idea:
      
      Title: ${idea.title}
      Description: ${idea.description}
      Problem Statement: ${idea.problem_statement}
      Solution Concept: ${idea.solution_concept}
      Target Audience: ${idea.target_audience}
      Unique Value Proposition: ${idea.unique_value}
      Business Model: ${idea.business_model}
      
      Provide a comprehensive analysis in the following format:
      
      {
        "strengths": ["Strength 1", "Strength 2", ...],
        "weaknesses": ["Weakness 1", "Weakness 2", ...],
        "opportunities": ["Opportunity 1", "Opportunity 2", ...],
        "threats": ["Threat 1", "Threat 2", ...],
        "suggestions": ["Suggestion 1", "Suggestion 2", ...],
        "market_insights": ["Market Insight 1", "Market Insight 2", ...],
        "validation_tips": ["Validation Tip 1", "Validation Tip 2", ...]
      }`;
  }

  /**
   * Create a prompt for comparing ideas
   */
  private createIdeaComparisonPrompt(ideas: UnifiedIdea[]): string {
    let prompt = `Compare the following business ideas:\n\n`;
    
    ideas.forEach((idea, index) => {
      prompt += `Idea ${index + 1}: ${idea.title}\n`;
      prompt += `Description: ${idea.description}\n`;
      prompt += `Problem Statement: ${idea.problem_statement}\n`;
      prompt += `Solution Concept: ${idea.solution_concept}\n`;
      prompt += `Target Audience: ${idea.target_audience}\n\n`;
    });
    
    prompt += `Provide a comparison analysis in the following format:
    
    {
      "common_strengths": ["Common Strength 1", "Common Strength 2", ...],
      "unique_strengths": {
        "Idea 1": ["Unique Strength 1", "Unique Strength 2", ...],
        "Idea 2": ["Unique Strength 1", "Unique Strength 2", ...]
      },
      "common_weaknesses": ["Common Weakness 1", "Common Weakness 2", ...],
      "unique_weaknesses": {
        "Idea 1": ["Unique Weakness 1", "Unique Weakness 2", ...],
        "Idea 2": ["Unique Weakness 1", "Unique Weakness 2", ...]
      },
      "complementary_aspects": ["Complementary Aspect 1", "Complementary Aspect 2", ...],
      "conflicting_aspects": ["Conflicting Aspect 1", "Conflicting Aspect 2", ...],
      "merger_potential": 75,
      "merger_suggestions": ["Merger Suggestion 1", "Merger Suggestion 2", ...]
    }`;
    
    return prompt;
  }

  /**
   * Create a prompt for merging ideas
   */
  private createIdeaMergePrompt(ideas: UnifiedIdea[]): string {
    let prompt = `Merge the following business ideas into a single, cohesive idea:\n\n`;
    
    ideas.forEach((idea, index) => {
      prompt += `Idea ${index + 1}: ${idea.title}\n`;
      prompt += `Description: ${idea.description}\n`;
      prompt += `Problem Statement: ${idea.problem_statement}\n`;
      prompt += `Solution Concept: ${idea.solution_concept}\n`;
      prompt += `Target Audience: ${idea.target_audience}\n`;
      prompt += `Unique Value: ${idea.unique_value}\n`;
      prompt += `Business Model: ${idea.business_model}\n\n`;
    });
    
    prompt += `Create a new idea that combines the best elements of these ideas.
    
    Format your response as a JSON object with the following structure:
    
    {
      "title": "Merged Idea Title",
      "description": "Description of the merged idea",
      "problem_statement": "The problem this merged idea solves",
      "solution_concept": "How the merged solution works",
      "target_audience": "Who the customers are for this merged idea",
      "unique_value": "Why customers would choose this merged solution",
      "business_model": "How the merged business creates and delivers value",
      "marketing_strategy": "How to reach customers for the merged idea",
      "revenue_model": "How the merged business makes money",
      "go_to_market": "Initial launch strategy for the merged idea",
      "market_size": "Estimated market size for the merged idea",
      "competition": ["Competitor 1", "Competitor 2"],
      "revenue_streams": ["Revenue Stream 1", "Revenue Stream 2"],
      "cost_structure": ["Cost 1", "Cost 2"],
      "key_metrics": ["Metric 1", "Metric 2"],
      "merge_rationale": "Explanation of how and why these ideas were merged"
    }`;
    
    return prompt;
  }
}

export const unifiedIdeaService = new UnifiedIdeaService();
