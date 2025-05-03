import { IdeaPlaygroundIdea } from '../../../types/idea-playground.types';
import { Suggestion } from '../../../../components/idea-playground/pathway1/SuggestionCard';
import { ideaPathway1AIService } from '../../idea-pathway1-ai.service';

/**
 * Service responsible for merging multiple idea suggestions
 * into a single cohesive concept
 */
export class IdeaMergerService {
  /**
   * Merge multiple suggestions into a single cohesive idea
   * Delegates to the AI service for the actual merging
   */
  async mergeSuggestions(
    suggestions: Suggestion[],
    userId: string
  ): Promise<Suggestion> {
    if (suggestions.length < 2) {
      throw new Error('Need at least 2 suggestions to merge');
    }

    console.log(`IdeaMergerService: Merging ${suggestions.length} suggestions`);
    
    try {
      // Use the existing service to perform the merge
      return await ideaPathway1AIService.mergeSuggestions(suggestions, userId);
    } catch (error) {
      console.error('Error in IdeaMergerService:', error);
      
      // Fall back to basic merged suggestion
      return this.createBasicMergedSuggestion(suggestions);
    }
  }

  /**
   * Create a basic merged suggestion from multiple suggestions
   * This is a fallback method in case the AI-powered merging fails
   */
  private createBasicMergedSuggestion(suggestions: Suggestion[]): Suggestion {
    if (suggestions.length === 0) {
      throw new Error('No suggestions to merge');
    }

    const baseSuggestion = suggestions[0];
    const allTitles = suggestions.map(s => s.title.replace(/ \(Merged Concept\)$/, ''));

    const mergedTitle = allTitles.length <= 2
      ? `${allTitles.join(' + ')} (Merged Concept)`
      : `${allTitles[0]} + ${allTitles.length - 1} More (Merged Concept)`;

    const combineUnique = (field: keyof Suggestion): string[] => {
      const allItems: string[] = [];
      suggestions.forEach(s => {
        const value = s[field];
        if (Array.isArray(value)) {
          allItems.push(...value);
        }
      });
      return [...new Set(allItems)].slice(0, 5);
    };

    return {
      title: mergedTitle,
      description: `A merged concept combining the best elements of ${allTitles.join(', ')}.`,
      problem_statement: baseSuggestion.problem_statement,
      solution_concept: `Combined approach that integrates: ${suggestions.map(s => s.solution_concept.split('.')[0]).join('; ')}`,
      target_audience: suggestions.map(s => s.target_audience.split(',')[0]).join(', '),
      unique_value: `Multi-faceted value proposition: ${suggestions.map(s => s.unique_value.split('.')[0]).join('; ')}`,
      business_model: `Hybrid model combining: ${suggestions.map(s => s.business_model.split('.')[0]).join('; ')}`,
      marketing_strategy: baseSuggestion.marketing_strategy,
      revenue_model: baseSuggestion.revenue_model,
      go_to_market: baseSuggestion.go_to_market,
      market_size: baseSuggestion.market_size,
      competition: combineUnique('competition'),
      revenue_streams: combineUnique('revenue_streams'),
      cost_structure: combineUnique('cost_structure'),
      key_metrics: combineUnique('key_metrics'),
      // SWOT fields kept but minimized - will be implemented later
      strengths: [''],
      weaknesses: [''],
      opportunities: [''],
      threats: ['']
    };
  }
}

// Export a singleton instance
export const ideaMergerService = new IdeaMergerService();
