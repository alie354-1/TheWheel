import { supabase } from '../supabase';
import { v4 as uuidv4 } from 'uuid';
import { generalLLMService } from './general-llm.service';
import { ideaGenerationService, QueryContext, BusinessIdea, IdeaFeedback } from './idea-generation.service';
import { 
  IdeaExplorationSession, 
  ExplorationIdea, 
  IdeaAnalysis, 
  IdeaMerge, 
  IdeaComparison, 
  IdeaComparisonResult,
  IdeaGenerationParams
} from '../types/idea-exploration.types';

export class IdeaExplorationService {
  constructor() {}

  /**
   * Create a new idea exploration session
   */
  async createSession(
    userId: string,
    title: string = 'New Exploration',
    description: string = '',
    inputParameters: IdeaGenerationParams = {}
  ): Promise<IdeaExplorationSession | null> {
    try {
      const { data, error } = await supabase
        .from('idea_exploration_sessions')
        .insert({
          user_id: userId,
          title,
          description,
          input_parameters: inputParameters
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating idea exploration session:', error);
        return null;
      }

      return data as IdeaExplorationSession;
    } catch (error) {
      console.error('Error in createSession:', error);
      return null;
    }
  }

  /**
   * Get all exploration sessions for a user
   */
  async getSessions(userId: string): Promise<IdeaExplorationSession[]> {
    try {
      const { data, error } = await supabase
        .from('idea_exploration_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching idea exploration sessions:', error);
        return [];
      }

      return data as IdeaExplorationSession[];
    } catch (error) {
      console.error('Error in getSessions:', error);
      return [];
    }
  }

  /**
   * Get a specific exploration session
   */
  async getSession(sessionId: string): Promise<IdeaExplorationSession | null> {
    try {
      const { data, error } = await supabase
        .from('idea_exploration_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        console.error('Error fetching idea exploration session:', error);
        return null;
      }

      return data as IdeaExplorationSession;
    } catch (error) {
      console.error('Error in getSession:', error);
      return null;
    }
  }

  /**
   * Update an exploration session
   */
  async updateSession(
    sessionId: string,
    updates: Partial<IdeaExplorationSession>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('idea_exploration_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating idea exploration session:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateSession:', error);
      return false;
    }
  }

  /**
   * Delete an exploration session and all associated ideas
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      // Delete all ideas in the session first (cascade should handle this, but just to be safe)
      const { error: ideasError } = await supabase
        .from('exploration_ideas')
        .delete()
        .eq('session_id', sessionId);

      if (ideasError) {
        console.error('Error deleting ideas in session:', ideasError);
      }

      // Delete the session
      const { error } = await supabase
        .from('idea_exploration_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        console.error('Error deleting idea exploration session:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteSession:', error);
      return false;
    }
  }

  /**
   * Generate multiple business ideas based on input parameters
   */
  async generateIdeas(
    sessionId: string,
    userId: string,
    params: IdeaGenerationParams,
    context: QueryContext
  ): Promise<ExplorationIdea[]> {
    try {
      // Set the context to idea_exploration to avoid conflicts with standup
      const enhancedContext: QueryContext = {
        ...context,
        userId,
        context: 'idea_exploration'
      };

      // Create a prompt that incorporates the input parameters
      const prompt = this.createMultipleIdeasPrompt(params);
      
      // Query the LLM
      const response = await generalLLMService.query(prompt, enhancedContext);
      
      // Parse the response
      const content = response.content || '';
      
      // Try to extract JSON
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/\[\s*{[\s\S]*}\s*\]/);
                        
      if (!jsonMatch) {
        console.error('Failed to extract JSON from LLM response');
        return [];
      }
      
      try {
        const parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        
        // Ensure the response is an array
        const ideasArray = Array.isArray(parsedData) ? parsedData : [parsedData];
        
        // Map the ideas to our ExplorationIdea type
        const ideas = ideasArray.map(idea => ({
          id: uuidv4(),
          session_id: sessionId,
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
          competition: Array.isArray(idea.competition) ? idea.competition : [],
          revenue_streams: Array.isArray(idea.revenue_streams) ? idea.revenue_streams : [],
          cost_structure: Array.isArray(idea.cost_structure) ? idea.cost_structure : [],
          key_metrics: Array.isArray(idea.key_metrics) ? idea.key_metrics : [],
          analysis: null,
          is_merged: false,
          parent_ideas: [],
          version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        // Save the ideas to the database
        const { data, error } = await supabase
          .from('exploration_ideas')
          .insert(ideas)
          .select();
          
        if (error) {
          console.error('Error saving generated ideas:', error);
          return ideas; // Return the ideas even if saving failed
        }
        
        return data as ExplorationIdea[];
      } catch (parseError) {
        console.error('Error parsing JSON from ideas:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
      return [];
    }
  }

  /**
   * Get all ideas in a session
   */
  async getIdeas(sessionId: string): Promise<ExplorationIdea[]> {
    try {
      const { data, error } = await supabase
        .from('exploration_ideas')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ideas:', error);
        return [];
      }

      return data as ExplorationIdea[];
    } catch (error) {
      console.error('Error in getIdeas:', error);
      return [];
    }
  }

  /**
   * Get a specific idea
   */
  async getIdea(ideaId: string): Promise<ExplorationIdea | null> {
    try {
      const { data, error } = await supabase
        .from('exploration_ideas')
        .select('*')
        .eq('id', ideaId)
        .single();

      if (error) {
        console.error('Error fetching idea:', error);
        return null;
      }

      return data as ExplorationIdea;
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
    updates: Partial<ExplorationIdea>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('exploration_ideas')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
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
   * Delete an idea
   */
  async deleteIdea(ideaId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('exploration_ideas')
        .delete()
        .eq('id', ideaId);

      if (error) {
        console.error('Error deleting idea:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteIdea:', error);
      return false;
    }
  }

  /**
   * Analyze an idea to get feedback
   */
  async analyzeIdea(
    idea: ExplorationIdea,
    userId: string,
    context: QueryContext
  ): Promise<IdeaAnalysis | null> {
    try {
      // Convert to BusinessIdea format for the existing service
      const businessIdea: BusinessIdea = {
        id: idea.id,
        version: idea.version,
        title: idea.title,
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
        competition: idea.competition || [],
        revenue_streams: idea.revenue_streams || [],
        cost_structure: idea.cost_structure || [],
        key_metrics: idea.key_metrics || []
      };

      // Set the context to idea_exploration to avoid conflicts with standup
      const enhancedContext: QueryContext = {
        ...context,
        userId,
        context: 'idea_exploration'
      };

      // Use the existing service to get feedback
      const feedback = await ideaGenerationService.refineIdea(businessIdea, enhancedContext);

      // Convert to IdeaAnalysis format
      const analysis: IdeaAnalysis = {
        strengths: feedback.strengths,
        weaknesses: feedback.weaknesses,
        opportunities: feedback.opportunities,
        threats: feedback.threats,
        suggestions: feedback.suggestions,
        market_insights: feedback.market_insights,
        validation_tips: feedback.validation_tips
      };

      // Update the idea with the analysis
      const { error } = await supabase
        .from('exploration_ideas')
        .update({
          analysis,
          updated_at: new Date().toISOString()
        })
        .eq('id', idea.id);

      if (error) {
        console.error('Error updating idea with analysis:', error);
      }

      return analysis;
    } catch (error) {
      console.error('Error analyzing idea:', error);
      return null;
    }
  }

  /**
   * Compare multiple ideas to find similarities, differences, and merger potential
   */
  async compareIdeas(
    ideas: ExplorationIdea[],
    userId: string,
    sessionId: string,
    context: QueryContext
  ): Promise<IdeaComparisonResult | null> {
    try {
      if (ideas.length < 2) {
        console.error('Need at least 2 ideas to compare');
        return null;
      }

      // Set the context to idea_exploration to avoid conflicts with standup
      const enhancedContext: QueryContext = {
        ...context,
        userId,
        context: 'idea_exploration'
      };

      // Create a prompt for comparing the ideas
      const prompt = this.createIdeaComparisonPrompt(ideas);
      
      // Query the LLM
      const response = await generalLLMService.query(prompt, enhancedContext);
      
      // Parse the response
      const content = response.content || '';
      
      // Try to extract JSON
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/{[\s\S]*}/);
                        
      if (!jsonMatch) {
        console.error('Failed to extract JSON from LLM response');
        return null;
      }
      
      try {
        const parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        
        // Convert to IdeaComparisonResult format
        const comparisonResult: IdeaComparisonResult = {
          common_strengths: Array.isArray(parsedData.common_strengths) ? parsedData.common_strengths : [],
          unique_strengths: parsedData.unique_strengths || {},
          common_weaknesses: Array.isArray(parsedData.common_weaknesses) ? parsedData.common_weaknesses : [],
          unique_weaknesses: parsedData.unique_weaknesses || {},
          complementary_aspects: Array.isArray(parsedData.complementary_aspects) ? parsedData.complementary_aspects : [],
          conflicting_aspects: Array.isArray(parsedData.conflicting_aspects) ? parsedData.conflicting_aspects : [],
          merger_potential: typeof parsedData.merger_potential === 'number' ? parsedData.merger_potential : 50,
          merger_suggestions: Array.isArray(parsedData.merger_suggestions) ? parsedData.merger_suggestions : []
        };
        
        // Save the comparison to the database
        const { error } = await supabase
          .from('idea_comparisons')
          .insert({
            user_id: userId,
            session_id: sessionId,
            ideas: ideas.map(idea => idea.id),
            comparison_result: comparisonResult
          });
          
        if (error) {
          console.error('Error saving idea comparison:', error);
        }
        
        return comparisonResult;
      } catch (parseError) {
        console.error('Error parsing JSON from comparison:', parseError);
        return null;
      }
    } catch (error) {
      console.error('Error comparing ideas:', error);
      return null;
    }
  }

  /**
   * Merge multiple ideas into a new idea
   */
  async mergeIdeas(
    ideas: ExplorationIdea[],
    userId: string,
    sessionId: string,
    context: QueryContext
  ): Promise<ExplorationIdea | null> {
    try {
      if (ideas.length < 2) {
        console.error('Need at least 2 ideas to merge');
        return null;
      }

      // Set the context to idea_exploration to avoid conflicts with standup
      const enhancedContext: QueryContext = {
        ...context,
        userId,
        context: 'idea_exploration'
      };

      // Create a prompt for merging the ideas
      const prompt = this.createIdeaMergePrompt(ideas);
      
      // Query the LLM
      const response = await generalLLMService.query(prompt, enhancedContext);
      
      // Parse the response
      const content = response.content || '';
      
      // Try to extract JSON
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/{[\s\S]*}/);
                        
      if (!jsonMatch) {
        console.error('Failed to extract JSON from LLM response');
        return null;
      }
      
      try {
        const parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        
        // Create the merged idea
        const mergedIdea: Omit<ExplorationIdea, 'id' | 'created_at' | 'updated_at'> = {
          session_id: sessionId,
          title: parsedData.title || 'Merged Idea',
          description: parsedData.description || '',
          problem_statement: parsedData.problem_statement || '',
          solution_concept: parsedData.solution_concept || '',
          target_audience: parsedData.target_audience || '',
          unique_value: parsedData.unique_value || '',
          business_model: parsedData.business_model || '',
          marketing_strategy: parsedData.marketing_strategy || '',
          revenue_model: parsedData.revenue_model || '',
          go_to_market: parsedData.go_to_market || '',
          market_size: parsedData.market_size || '',
          competition: Array.isArray(parsedData.competition) ? parsedData.competition : [],
          revenue_streams: Array.isArray(parsedData.revenue_streams) ? parsedData.revenue_streams : [],
          cost_structure: Array.isArray(parsedData.cost_structure) ? parsedData.cost_structure : [],
          key_metrics: Array.isArray(parsedData.key_metrics) ? parsedData.key_metrics : [],
          analysis: null,
          is_merged: true,
          parent_ideas: ideas.map(idea => idea.id),
          version: 1
        };
        
        // Save the merged idea to the database
        const { data: savedIdea, error: ideaError } = await supabase
          .from('exploration_ideas')
          .insert({
            ...mergedIdea,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (ideaError) {
          console.error('Error saving merged idea:', ideaError);
          return null;
        }
        
        // Save the merge record
        const { error: mergeError } = await supabase
          .from('idea_merges')
          .insert({
            user_id: userId,
            session_id: sessionId,
            source_ideas: ideas.map(idea => idea.id),
            result_idea: savedIdea.id,
            merge_rationale: parsedData.merge_rationale || ''
          });
          
        if (mergeError) {
          console.error('Error saving idea merge record:', mergeError);
        }
        
        return savedIdea as ExplorationIdea;
      } catch (parseError) {
        console.error('Error parsing JSON from merge:', parseError);
        return null;
      }
    } catch (error) {
      console.error('Error merging ideas:', error);
      return null;
    }
  }

  /**
   * Get the merge history for an idea
   */
  async getMergeHistory(ideaId: string): Promise<IdeaMerge[]> {
    try {
      // First check if this idea is a result of a merge
      const { data: resultMerges, error: resultError } = await supabase
        .from('idea_merges')
        .select('*')
        .eq('result_idea', ideaId);

      if (resultError) {
        console.error('Error fetching result merges:', resultError);
        return [];
      }

      // Then check if this idea was used as a source in any merges
      const { data: sourceMerges, error: sourceError } = await supabase
        .from('idea_merges')
        .select('*')
        .contains('source_ideas', [ideaId]);

      if (sourceError) {
        console.error('Error fetching source merges:', sourceError);
        return [];
      }

      // Combine and return all merges
      return [...(resultMerges || []), ...(sourceMerges || [])] as IdeaMerge[];
    } catch (error) {
      console.error('Error in getMergeHistory:', error);
      return [];
    }
  }

  // Private helper methods for creating prompts

  private createMultipleIdeasPrompt(params: IdeaGenerationParams): string {
    const count = params.count || 3;
    
    let contextualInfo = '';
    if (params.industry) contextualInfo += `Industry: ${params.industry}\n`;
    if (params.target_audience) contextualInfo += `Target Audience: ${params.target_audience}\n`;
    if (params.problem_area) contextualInfo += `Problem Area: ${params.problem_area}\n`;
    if (params.technology) contextualInfo += `Technology: ${params.technology}\n`;
    if (params.business_model_preference) contextualInfo += `Business Model Preference: ${params.business_model_preference}\n`;
    if (params.market_size_preference) contextualInfo += `Market Size Preference: ${params.market_size_preference}\n`;
    if (params.innovation_level) contextualInfo += `Innovation Level: ${params.innovation_level}\n`;
    if (params.resource_constraints && params.resource_constraints.length > 0) {
      contextualInfo += `Resource Constraints: ${params.resource_constraints.join(', ')}\n`;
    }
    
    return `You are an experienced startup advisor and idea generator. Generate ${count} innovative business ideas${contextualInfo ? ' based on the following parameters:\n\n' + contextualInfo : '.'} Make sure the ideas are diverse and cover different approaches.

Each idea should include:
- A compelling title
- A concise description
- A clear problem statement
- A solution concept
- Target audience
- Unique value proposition
- Business model
- Marketing strategy
- Revenue model
- Go-to-market strategy
- Estimated market size
- Potential competitors
- Possible revenue streams
- Basic cost structure
- Key metrics for success

Format your response as a JSON array of business ideas.

\`\`\`json
[
  {
    "title": "Idea Title",
    "description": "Brief description of the idea",
    "problem_statement": "The problem this solves",
    "solution_concept": "How the solution works",
    "target_audience": "Who the customers are",
    "unique_value": "Why customers would choose this",
    "business_model": "How the business creates and delivers value",
    "marketing_strategy": "How to reach customers",
    "revenue_model": "How the business makes money",
    "go_to_market": "Initial launch strategy",
    "market_size": "Estimated market size",
    "competition": ["Competitor 1", "Competitor 2"],
    "revenue_streams": ["Revenue Stream 1", "Revenue Stream 2"],
    "cost_structure": ["Cost 1", "Cost 2"],
    "key_metrics": ["Metric 1", "Metric 2"]
  }
]
\`\`\`

Be creative, specific, and realistic. Each idea should be viable and distinct.`;
  }

  private createIdeaComparisonPrompt(ideas: ExplorationIdea[]): string {
    // Format the ideas for the prompt
    const formattedIdeas = ideas.map((idea, index) => {
      return `IDEA ${index + 1}: ${idea.title}
Description: ${idea.description || 'N/A'}
Problem Statement: ${idea.problem_statement || 'N/A'}
Solution Concept: ${idea.solution_concept || 'N/A'}
Target Audience: ${idea.target_audience || 'N/A'}
Unique Value: ${idea.unique_value || 'N/A'}
Business Model: ${idea.business_model || 'N/A'}`;
    }).join('\n\n');
    
    return `You are a business strategy expert. Compare the following business ideas and identify their similarities, differences, and potential for merger:

${formattedIdeas}

Analyze these ideas and provide a structured comparison using the following format:

\`\`\`json
{
  "common_strengths": [
    "Common strength 1",
    "Common strength 2"
  ],
  "unique_strengths": {
    "Idea 1": [
      "Unique strength 1",
      "Unique strength 2"
    ],
    "Idea 2": [
      "Unique strength 1",
      "Unique strength 2"
    ]
  },
  "common_weaknesses": [
    "Common weakness 1",
    "Common weakness 2"
  ],
  "unique_weaknesses": {
    "Idea 1": [
      "Unique weakness 1",
      "Unique weakness 2"
    ],
    "Idea 2": [
      "Unique weakness 1",
      "Unique weakness 2"
    ]
  },
  "complementary_aspects": [
    "Complementary aspect 1",
    "Complementary aspect 2"
  ],
  "conflicting_aspects": [
    "Conflicting aspect 1",
    "Conflicting aspect 2"
  ],
  "merger_potential": 75,
  "merger_suggestions": [
    "Merger suggestion 1",
    "Merger suggestion 2"
  ]
}
\`\`\`

The merger_potential should be a number from 0 to 100, where 0 means the ideas are completely incompatible and 100 means they are perfectly complementary.

Be thorough, specific, and objective in your analysis.`;
  }

  private createIdeaMergePrompt(ideas: ExplorationIdea[]): string {
    // Format the ideas for the prompt
    const formattedIdeas = ideas.map((idea, index) => {
      return `IDEA ${index + 1}: ${idea.title}
Description: ${idea.description || 'N/A'}
Problem Statement: ${idea.problem_statement || 'N/A'}
Solution Concept: ${idea.solution_concept || 'N/A'}
Target Audience: ${idea.target_audience || 'N/A'}
Unique Value: ${idea.unique_value || 'N/A'}
Business Model: ${idea.business_model || 'N/A'}
Marketing Strategy: ${idea.marketing_strategy || 'N/A'}
Revenue Model: ${idea.revenue_model || 'N/A'}
Go-to-Market: ${idea.go_to_market || 'N/A'}`;
    }).join('\n\n');
    
    return `You are a business innovation expert. Create a new business idea by merging the following ideas, taking the best elements from each:

${formattedIdeas}

Create a merged idea that combines the strengths of these ideas while addressing their weaknesses. The merged idea should be coherent, viable, and potentially more valuable than any of the individual ideas.

Format your response as a JSON object:

\`\`\`json
{
  "title": "Merged Idea Title",
  "description": "Description of the merged idea",
  "problem_statement": "The problem this merged idea solves",
  "solution_concept": "How the merged solution works",
  "target_audience": "Who the customers are for the merged idea",
  "unique_value": "The unique value proposition of the merged idea",
  "business_model": "The business model for the merged idea",
  "marketing_strategy": "The marketing strategy for the merged idea",
  "revenue_model": "The revenue model for the merged idea",
  "go_to_market": "The go-to-market strategy for the merged idea",
  "market_size": "Estimated market size for the merged idea",
  "competition": ["Competitor 1", "Competitor 2"],
  "revenue_streams": ["Revenue Stream 1", "Revenue Stream 2"],
  "cost_structure": ["Cost 1", "Cost 2"],
  "key_metrics": ["Metric 1", "Metric 2"],
  "merge_rationale": "Explanation of how and why these ideas were merged"
}
\`\`\`

Be creative but realistic. The merged idea should be coherent and viable.`;
  }
}

export const ideaExplorationService = new IdeaExplorationService();
