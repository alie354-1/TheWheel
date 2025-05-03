/**
 * Service for refining ideas based on AI feedback
 */
import { supabase } from '../../supabase';
import { IdeaPlaygroundIdea } from '../../types/idea-playground.types';
import { IdeaGenerationResult, RefinementResult } from '../../types/idea-generation.types';
import { LLMOrchestrator } from './llm/orchestrator';
import { IdeaManagementService } from './idea-management.service';

/**
 * Params for idea refinement
 */
export interface RefinementParams {
  ideaId: string;
  feedback: string;
  userId: string;
}

export class RefinementService {
  private orchestrator: LLMOrchestrator;
  private ideaManagementService: IdeaManagementService;
  
  constructor(orchestrator: LLMOrchestrator) {
    this.orchestrator = orchestrator;
    this.ideaManagementService = new IdeaManagementService();
  }
  
  /**
   * Refine an idea based on feedback
   */
  async refineIdea(
    idea: IdeaPlaygroundIdea,
    feedback: string,
    userId: string
  ): Promise<IdeaPlaygroundIdea> {
    try {
      // Construct the refining prompt
      const refinePrompt = `
        Refine the following business idea based on this feedback:
        
        ORIGINAL IDEA:
        Title: ${idea.title}
        Description: ${idea.description}
        Problem Statement: ${idea.problem_statement}
        Solution Concept: ${idea.solution_concept}
        Target Audience: ${typeof idea.target_audience === 'string' ? idea.target_audience : idea.target_audience.join(', ')}
        Unique Value: ${idea.unique_value}
        Business Model: ${idea.business_model || 'Not specified'}
        
        FEEDBACK:
        ${feedback}
        
        Provide the refined idea as a JSON object with these properties:
        - title
        - description
        - problem_statement
        - solution_concept
        - target_audience (as an array of strings)
        - unique_value
        - business_model
        
        Make sure to address all the feedback points in your refinement.
      `;
      
      // Generate refined idea using LLM
      const refinedIdeaJson = await this.orchestrator.complete(refinePrompt);
      
      // Parse the response as JSON
      let refinedIdeaData: Partial<IdeaPlaygroundIdea>;
      try {
        refinedIdeaData = JSON.parse(refinedIdeaJson);
      } catch (parseError) {
        console.error('Error parsing LLM response as JSON:', parseError);
        // Fall back to a minimal structure if parsing fails
        refinedIdeaData = {
          title: idea.title + ' (Refined)',
          description: refinedIdeaJson.substring(0, 1000), // Truncate to avoid extremely long descriptions
          problem_statement: idea.problem_statement,
          solution_concept: idea.solution_concept,
          target_audience: idea.target_audience,
          unique_value: idea.unique_value,
          business_model: idea.business_model
        };
      }
      
      // Ensure target_audience is an array
      if (typeof refinedIdeaData.target_audience === 'string') {
        refinedIdeaData.target_audience = [refinedIdeaData.target_audience];
      } else if (!Array.isArray(refinedIdeaData.target_audience)) {
        refinedIdeaData.target_audience = idea.target_audience || [];
      }
      
      // Create a new idea based on the original and the refinements
      const refinedIdea: Partial<IdeaPlaygroundIdea> = {
        ...idea,
        ...refinedIdeaData,
        id: undefined, // Remove ID to create a new record
        user_id: userId,
        parent_idea_id: idea.id, // Reference the original idea
        refinement_feedback: feedback,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        protection_level: idea.protection_level || 'public',
        status: 'refined'
      };
      
      // Save the refined idea to the database
      return this.ideaManagementService.createIdea(refinedIdea);
    } catch (error) {
      console.error('Error refining idea:', error);
      throw error;
    }
  }
  
  /**
   * Save feedback for an idea without creating a new one
   */
  async saveFeedback(
    ideaId: string,
    feedback: string,
    userId: string
  ): Promise<void> {
    try {
      // Save feedback to the database
      const { error } = await supabase
        .from('idea_feedback')
        .insert([
          {
            idea_id: ideaId,
            user_id: userId,
            feedback,
            created_at: new Date().toISOString()
          }
        ]);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error saving feedback:', error);
      throw error;
    }
  }
  
  /**
   * Get feedback history for an idea
   */
  async getFeedbackHistory(ideaId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('idea_feedback')
        .select('*')
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error getting feedback history:', error);
      return [];
    }
  }
  
  /**
   * Get refinement history for an idea (all derived ideas)
   */
  async getRefinementHistory(originalIdeaId: string): Promise<IdeaPlaygroundIdea[]> {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('parent_idea_id', originalIdeaId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data as IdeaPlaygroundIdea[];
    } catch (error) {
      console.error('Error getting refinement history:', error);
      return [];
    }
  }
}
