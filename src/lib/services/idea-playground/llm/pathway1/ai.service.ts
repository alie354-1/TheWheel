import { ideaPathway1AIService } from '../../../../services/idea-pathway1-ai.service';
import { IdeaPlaygroundIdea } from '../../../../types/idea-playground.types';
import { loggingService } from '../../../../services/logging.service';

/**
 * Service to handle AI operations specifically for Pathway 1 of the Idea Playground
 * This is a wrapper around the existing ideaPathway1AIService that follows the modular architecture
 */
export class Pathway1AIService {
  /**
   * Generate multiple company suggestions based on an initial idea
   */
  async generateCompanySuggestions(
    idea: IdeaPlaygroundIdea,
    userId: string,
    count: number = 5
  ): Promise<any[]> {
    try {
      // Log the action with safe error handling
      try {
        loggingService.logUserAction('generate_suggestions', 'Pathway1AIService', {
          ideaId: idea?.id,
          userId,
          count,
          timestamp: new Date().toISOString()
        }).catch(() => {
          console.warn('Failed to log suggestion generation - continuing anyway');
        });
      } catch (e) {
        // Silently ignore all logging errors
      }
      
      // Use the actual AI service implementation
      return ideaPathway1AIService.generateCompanySuggestions(idea, userId, count);
    } catch (error) {
      console.error('Error in Pathway1AIService.generateCompanySuggestions:', error);
      return ideaPathway1AIService.generateMockSuggestionsPublic(idea, count);
    }
  }

  /**
   * Merge multiple suggestions into a coherent idea
   */
  async mergeSuggestions(
    suggestions: any[],
    userId: string
  ): Promise<any> {
    try {
      // Log the action with safe error handling
      try {
        loggingService.logUserAction('merge_suggestions', 'Pathway1AIService', {
          suggestionCount: suggestions.length,
          userId,
          timestamp: new Date().toISOString()
        }).catch(() => {
          console.warn('Failed to log suggestion merging - continuing anyway');
        });
      } catch (e) {
        // Silently ignore all logging errors
      }
      
      if (!suggestions || suggestions.length === 0) {
        throw new Error('No suggestions provided for merging');
      }
      
      // Use the actual AI service implementation
      return ideaPathway1AIService.mergeSuggestions(suggestions, userId);
    } catch (error) {
      console.error('Error in Pathway1AIService.mergeSuggestions:', error);
      throw error;
    }
  }
  
  /**
   * Regenerate a specific suggestion
   */
  async regenerateSuggestion(
    originalSuggestion: any,
    idea: IdeaPlaygroundIdea,
    userId: string
  ): Promise<any> {
    try {
      // Log the action
      try {
        loggingService.logUserAction('regenerate_suggestion', 'Pathway1AIService', {
          suggestionId: originalSuggestion?.id,
          ideaId: idea?.id,
          userId,
          timestamp: new Date().toISOString()
        }).catch(() => {
          console.warn('Failed to log suggestion regeneration - continuing anyway');
        });
      } catch (e) {
        // Silently ignore all logging errors
      }
      
      // Use the actual AI service implementation
      return ideaPathway1AIService.regenerateSuggestion(originalSuggestion, idea, userId);
    } catch (error) {
      console.error('Error in Pathway1AIService.regenerateSuggestion:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const pathway1AIService = new Pathway1AIService();
