import { IdeaPlaygroundIdea } from '../../types/idea-playground.types';
import { ideaPlaygroundService, IdeaStatus } from '../idea-playground.service';
import { loggingService } from '../logging.service';
import { pathway1AIService } from './llm/pathway1/ai.service';

/**
 * Adapter for handling Pathway 1 specific operations and AI interactions
 * This provides specialized methods for the idea generation pathway
 */
export const pathway1Adapter = {
  /**
   * Helper method to save a merged idea
   */
  async saveAsMergedIdea(
    userId: string,
    canvasId: string,
    mergedData: any
  ): Promise<IdeaPlaygroundIdea> {
    try {
      // Use the service to create a new idea based on the merged content
      const savedVariation = await ideaPlaygroundService.saveVariationAsIdea(
        userId,
        canvasId,
        {
          title: mergedData.title || 'Merged Idea',
          description: mergedData.description || 'Combined from multiple suggestions',
          problem_statement: mergedData.problem_statement || '',
          solution_concept: mergedData.solution_concept || '',
          target_audience: mergedData.target_audience || '',
          unique_value: mergedData.unique_value || '',
          business_model: mergedData.business_model || ''
        }
      );
      
      if (!savedVariation) {
        throw new Error('Failed to save merged idea');
      }
      
      // Convert to our idea format
      return {
        id: savedVariation.id,
        title: savedVariation.title,
        description: savedVariation.description,
        problem_statement: savedVariation.problem_statement,
        solution_concept: savedVariation.solution_concept,
        target_audience: savedVariation.target_audience,
        unique_value: savedVariation.unique_value,
        business_model: savedVariation.business_model || '',
        status: savedVariation.status as any, // Cast to bypass type issues
        createdAt: savedVariation.createdAt,
        updatedAt: savedVariation.updatedAt,
        userId: userId,
        tags: savedVariation.tags || [],
        isFavorite: false
      };
    } catch (error) {
      console.error('Error in saveAsMergedIdea:', error);
      throw error;
    }
  },
  /**
   * Generate company and product suggestions based on an idea
   */
  async generateCompanySuggestions(
    idea: IdeaPlaygroundIdea,
    userId: string,
    count: number = 5
  ): Promise<any[]> {
    try {
      // Use the specialized AI service in the modular structure
      return pathway1AIService.generateCompanySuggestions(idea, userId, count);
    } catch (error) {
      console.error('Error in pathway1Adapter.generateCompanySuggestions:', error);
      
      // Return a minimal set of suggestions as fallback
      return [
        {
          id: `fallback-suggestion-${Date.now()}-1`,
          title: `${idea?.title || 'New Idea'} - Improved Version`,
          description: idea?.description || "Description unavailable",
          problem_statement: "Problem identified from your idea",
          solution_concept: "Solution concept derived from your idea",
          target_audience: "Likely customers for your idea",
          unique_value: "What makes your idea special",
          business_model: "Potential revenue approach",
          type: 'product',
          confidence: 70,
          created_at: new Date().toISOString(),
          parent_id: idea?.id || 'unknown'
        }
      ];
    }
  },
  
  /**
   * Merge multiple suggestions into a new idea
   */
  async mergeSuggestions(
    suggestions: any[],
    userId: string
  ): Promise<IdeaPlaygroundIdea> {
    try {
      if (!suggestions || suggestions.length === 0) {
        throw new Error('No suggestions provided for merging');
      }
      
      // First, try to use the AI service for intelligent merging
      try {
        const aiMerged = await pathway1AIService.mergeSuggestions(suggestions, userId);
        
        // If we got a valid result from the AI service, format it as needed for persistence
        if (aiMerged) {
          const canvases = await ideaPlaygroundService.getCanvases(userId);
          const canvasId = canvases && canvases.length > 0 ? canvases[0].id : 'default-canvas';
          
          // Use the service to save the AI generated merged idea
          return this.saveAsMergedIdea(userId, canvasId, aiMerged);
        }
      } catch (aiError) {
        console.warn('Error using AI for merging, falling back to basic merging:', aiError);
        // Continue with manual merging below
      }
      
      // Fallback to manual merging if AI merging fails
      const mergedTitle = suggestions.length > 1
        ? `Combined Idea: ${suggestions[0].title.split('-')[0]}`
        : suggestions[0].title;
      
      // Create merged description by combining the first lines of each suggestion
      const mergedDescription = suggestions
        .map(s => s.description.split('.')[0])
        .join('. ') + '.';
      
      const canvases = await ideaPlaygroundService.getCanvases(userId);
      const canvasId = canvases && canvases.length > 0 ? canvases[0].id : 'default-canvas';
      
      try {
        // Use the service to create a new idea based on the merged content
        const savedVariation = await ideaPlaygroundService.saveVariationAsIdea(
          userId,
          canvasId,
          {
            title: mergedTitle,
            description: mergedDescription,
            problem_statement: suggestions[0].problem_statement,
            solution_concept: suggestions[0].solution_concept,
            target_audience: suggestions[0].target_audience,
            unique_value: suggestions[0].unique_value,
            business_model: suggestions[0].business_model || ''
          }
        );
        
        // Make sure we have a valid result
        if (savedVariation) {
          // Convert to our idea format
          return {
            id: savedVariation.id,
            title: savedVariation.title,
            description: savedVariation.description,
            problem_statement: savedVariation.problem_statement,
            solution_concept: savedVariation.solution_concept,
            target_audience: savedVariation.target_audience,
            unique_value: savedVariation.unique_value,
            business_model: savedVariation.business_model || '',
            status: savedVariation.status as any, // Cast to bypass type issues
            createdAt: savedVariation.createdAt,
            updatedAt: savedVariation.updatedAt,
            userId: userId,
            tags: savedVariation.tags || [],
            isFavorite: false
          };
        } else {
          throw new Error('Failed to save merged idea variation');
        }
      } catch (err) {
        console.error('Error saving variation:', err);
        throw err; // Re-throw to be caught by outer error handler
      }
    } catch (error: any) {
      console.error('Error in pathway1Adapter.mergeSuggestions:', error);
      
      // Return a fallback merged idea
      return {
        id: `local-merged-${Date.now()}`,
        title: suggestions?.[0]?.title || "Merged Idea",
        description: suggestions?.[0]?.description || "Combined description from selected suggestions",
        problem_statement: suggestions?.[0]?.problem_statement || "",
        solution_concept: suggestions?.[0]?.solution_concept || "",
        target_audience: suggestions?.[0]?.target_audience || "",
        unique_value: suggestions?.[0]?.unique_value || "",
        business_model: suggestions?.[0]?.business_model || "",
        status: IdeaStatus.DRAFT as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: userId,
        tags: [],
        isFavorite: false
      };
    }
  }
};
