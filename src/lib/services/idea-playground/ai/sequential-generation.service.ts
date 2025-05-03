import { IdeaPlaygroundIdea } from '../../../types/idea-playground.types';
import { Suggestion } from '../../../../components/idea-playground/pathway1/SuggestionCard';
import { ideaPathway1AIService } from '../../idea-pathway1-ai.service';

/**
 * This service manages sequential generation of idea suggestions,
 * allowing for better performance, improved error handling, and
 * a more responsive user experience.
 */
export class SequentialGenerationService {
  /**
   * Generate a set of suggestions one by one.
   * Shows suggestions in real-time as they are generated.
   * Provides fallback to mock suggestions if AI generation fails.
   * Enforces a maximum of 6 suggestions and minimum of 3 when possible.
   */
  async generateSuggestionsSequentially(
    idea: IdeaPlaygroundIdea,
    userId: string,
    count: number = 3,
    progressCallback: (
      suggestion: Suggestion, 
      isMock: boolean, 
      index: number, 
      totalCount: number
    ) => void
  ): Promise<Suggestion[]> {
    const allSuggestions: Suggestion[] = [];
    let successCount = 0;
    let failureCount = 0;
    let mockCount = 0;
    
    // Enforce bounds: minimum 3, maximum 6 suggestions
    const boundedCount = Math.max(3, Math.min(6, count));
    
    // Track which positions have received suggestions
    const filledPositions = new Set<number>();
    
    // Try to generate each suggestion individually
    for (let i = 0; i < boundedCount; i++) {
      console.log(`Sequential generation: Starting suggestion ${i + 1}/${boundedCount}`);
      
      try {
        // Individual timeout for each suggestion (increased to 60 seconds)
        const timeoutPromise = new Promise<Suggestion>((_, reject) => {
          setTimeout(() => {
            console.log(`Suggestion ${i + 1} generation timed out`);
            reject(new Error('Individual suggestion timeout'));
          }, 60000); // Significantly increased timeout to give more time for AI generation
        });
        
        // Try to generate a real AI suggestion
        const suggestion = await Promise.race([
          ideaPathway1AIService.generateSingleSuggestion(idea, userId, i),
          timeoutPromise
        ]);
        
        // Add the AI-generated suggestion to results
        allSuggestions.push(suggestion);
        successCount++;
        filledPositions.add(i);
        
        // Notify progress with real AI suggestion
        progressCallback(suggestion, false, i, boundedCount);
        
        console.log(`Successfully generated AI suggestion ${successCount} at position ${i+1}`);
      } catch (error) {
        // Log error and provide a mock suggestion as fallback for this position
        console.error(`Error generating AI suggestion ${i + 1}:`, error);
        failureCount++;
        
        // Generate a mock suggestion if AI generation failed
        const mockSuggestion = ideaPathway1AIService.generateMockSuggestionsPublic(idea, 1)[0];
        
        // Only use mock suggestions to fill gaps when actual AI generations fail
        if (!filledPositions.has(i)) {
          allSuggestions.push(mockSuggestion);
          mockCount++;
          filledPositions.add(i);
          
          // Notify progress with the mock suggestion
          progressCallback(mockSuggestion, true, i, boundedCount);
          
          console.log(`Added mock suggestion at position ${i+1} due to generation failure`);
        }
      }
      
      // Short pause between generations to prevent API rate limiting
      if (i < boundedCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // If we still have no suggestions at all (very unlikely with the mock fallbacks)
    if (allSuggestions.length === 0) {
      console.log('No suggestions generated at all. Generating mock suggestions...');
      
      // Generate enough mock suggestions to reach minimum count
      const mockSuggestions = ideaPathway1AIService.generateMockSuggestionsPublic(idea, 3);
      
      for (let i = 0; i < mockSuggestions.length; i++) {
        allSuggestions.push(mockSuggestions[i]);
        mockCount++;
        
        // Notify progress with mock suggestion
        progressCallback(mockSuggestions[i], true, i, mockSuggestions.length);
      }
    }
    
    console.log(`Sequential generation complete: ${boundedCount} requested, ${successCount} AI-generated, ${mockCount} mock suggestions`);
    
    return allSuggestions;
  }
}

// Export a singleton instance
export const sequentialGenerationService = new SequentialGenerationService();
