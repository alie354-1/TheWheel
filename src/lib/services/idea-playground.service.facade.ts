/**
 * Facade service for the Idea Playground
 * 
 * This service integrates all the specialized services for idea management,
 * generation, refinement, etc. It provides a unified API for components
 * to interact with the idea playground functionality.
 */

import { 
  IdeaPlaygroundIdea, 
  CanvasType,
  IdeaStatus,
  BusinessModelCanvas,
  ValuePropositionCanvas
} from '../types/idea-playground.types';
import { IdeaGenerationResult, RefinementResult } from '../types/idea-generation.types';
import { IdeaManagementService } from './idea-playground/idea-management.service';
import { RefinementService } from './idea-playground/refinement.service';
import { LLMOrchestrator } from './idea-playground/llm/orchestrator';

/**
 * Params for generating a new idea
 */
export interface IdeaGenerationParams {
  theme?: string;
  industry?: string;
  userContext?: string;
  constraints?: string[];
  userId: string;
}

/**
 * Facade service that coordinates all idea playground functionality
 */
export class IdeaPlaygroundFacade {
  // Specialized sub-services
  private ideaManagementService: IdeaManagementService;
  private refinementService: RefinementService;
  private llmOrchestrator: LLMOrchestrator;
  
  constructor() {
    // Create the LLM orchestrator which will be used by other services
    this.llmOrchestrator = new LLMOrchestrator();
    
    // Create specialized services
    this.ideaManagementService = new IdeaManagementService();
    this.refinementService = new RefinementService(this.llmOrchestrator);
  }
  
  //
  // Ideas Management
  //
  
  /**
   * Get an idea by its ID
   */
  async getIdea(ideaId: string): Promise<IdeaPlaygroundIdea> {
    return this.ideaManagementService.getIdea(ideaId);
  }
  
  /**
   * Get all ideas for a user
   */
  async getUserIdeas(userId: string): Promise<IdeaPlaygroundIdea[]> {
    return this.ideaManagementService.getIdeasForUser(userId);
  }
  
  /**
   * Update an existing idea
   */
  async updateIdea(idea: IdeaPlaygroundIdea): Promise<IdeaPlaygroundIdea> {
    return this.ideaManagementService.updateIdea(idea);
  }
  
  /**
   * Delete an idea
   */
  async deleteIdea(ideaId: string): Promise<void> {
    return this.ideaManagementService.deleteIdea(ideaId);
  }
  
  /**
   * Set the protection level for an idea
   */
  async setProtectionLevel(ideaId: string, level: string, userId: string): Promise<void> {
    return this.ideaManagementService.setProtectionLevel(ideaId, level, userId);
  }
  
  //
  // Idea Generation
  //
  
  /**
   * Generate a new idea based on the provided parameters
   */
  async generateIdea(params: IdeaGenerationParams): Promise<IdeaPlaygroundIdea> {
    try {
      // Construct the idea generation prompt
      const prompt = `
        Generate a creative business idea based on the following parameters:
        
        ${params.theme ? `THEME: ${params.theme}` : ''}
        ${params.industry ? `INDUSTRY: ${params.industry}` : ''}
        ${params.userContext ? `CONTEXT: ${params.userContext}` : ''}
        ${params.constraints && params.constraints.length > 0 
          ? `CONSTRAINTS: ${params.constraints.join(', ')}` 
          : ''}
        
        Provide a JSON object with the following properties:
        - title: A catchy title for the idea
        - description: A comprehensive description of the idea
        - problem_statement: The problem this idea aims to solve
        - solution_concept: How the idea solves the problem
        - target_audience: Array of target customer segments
        - unique_value: What makes this idea unique
        - business_model: How this idea could generate revenue
      `;
      
      // Generate the idea using the LLM
      const generatedIdeaJson = await this.llmOrchestrator.complete(prompt);
      
      // Parse the response
      let ideaData: Partial<IdeaPlaygroundIdea>;
      try {
        ideaData = JSON.parse(generatedIdeaJson);
      } catch (error) {
        console.error('Error parsing LLM response:', error);
        // Fallback to a basic structure
        ideaData = {
          title: 'Generated Idea',
          description: generatedIdeaJson.substring(0, 500), // Truncate long responses
          problem_statement: 'To be defined',
          solution_concept: 'To be explored',
          target_audience: ['General users'],
          unique_value: 'To be determined',
          business_model: 'To be developed'
        };
      }
      
      // Ensure target_audience is always an array
      if (typeof ideaData.target_audience === 'string') {
        ideaData.target_audience = [ideaData.target_audience];
      } else if (!Array.isArray(ideaData.target_audience)) {
        ideaData.target_audience = ['General users'];
      }
      
      // Create the complete idea object
      const completeIdea: Partial<IdeaPlaygroundIdea> = {
        ...ideaData,
        user_id: params.userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: IdeaStatus.DRAFT,
        protection_level: 'public'
      };
      
      // Save to database
      return this.ideaManagementService.createIdea(completeIdea);
    } catch (error) {
      console.error('Error generating idea:', error);
      throw new Error('Failed to generate idea');
    }
  }
  
  //
  // Idea Refinement
  //
  
  /**
   * Refine an idea based on feedback
   */
  async refineIdea(
    idea: IdeaPlaygroundIdea,
    feedback: string,
    userId: string
  ): Promise<IdeaPlaygroundIdea> {
    return this.refinementService.refineIdea(idea, feedback, userId);
  }
  
  /**
   * Save feedback without creating a refined idea
   */
  async saveFeedback(ideaId: string, feedback: string, userId: string): Promise<void> {
    return this.refinementService.saveFeedback(ideaId, feedback, userId);
  }
  
  /**
   * Get history of feedback for an idea
   */
  async getFeedbackHistory(ideaId: string): Promise<any[]> {
    return this.refinementService.getFeedbackHistory(ideaId);
  }
  
  /**
   * Get refinement history (derived ideas) for an idea
   */
  async getRefinementHistory(ideaId: string): Promise<IdeaPlaygroundIdea[]> {
    return this.refinementService.getRefinementHistory(ideaId);
  }
  
  //
  // System Operations
  //
  
  /**
   * Initialize the idea playground services
   */
  async initialize(): Promise<void> {
    console.log('Idea Playground Facade initialized');
  }
  
  /**
   * Get the underlying LLM orchestrator for direct access if needed
   */
  getLLMOrchestrator(): LLMOrchestrator {
    return this.llmOrchestrator;
  }
}

// Export singleton instance for use throughout the application
export const ideaPlaygroundService = new IdeaPlaygroundFacade();
