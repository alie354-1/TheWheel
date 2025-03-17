import { generalLLMService } from './general-llm.service';
import { IdeaPlaygroundIdea } from '../types/idea-playground.types';
import { Suggestion } from '../../components/idea-playground/pathway1/SuggestionCard';

/**
 * Service to handle AI operations specifically for Pathway 1 of the Idea Playground
 */
export class IdeaPathway1AIService {
  /**
   * Generate multiple company suggestions based on an initial idea
   * @param idea The original idea from IdeaCaptureScreen
   * @param userId The user ID for logging and context
   * @param count Number of suggestions to generate (default 5)
   * @returns Array of suggestion objects
   */
  async generateCompanySuggestions(
    idea: IdeaPlaygroundIdea,
    userId: string,
    count: number = 5
  ): Promise<Suggestion[]> {
    try {
      // Create a detailed prompt for the AI
      const prompt = this.createSuggestionPrompt(idea, count);
      
      // Call the general LLM service with the prompt
      const response = await generalLLMService.query(prompt, {
        userId: userId || 'anonymous',
        useCompanyModel: !!idea.used_company_context,
        useExistingModels: true,
        context: 'idea_generation'
      });
      
      // Parse the AI response into suggestion objects
      return this.parseSuggestionsResponse(response.content, idea);
    } catch (error) {
      console.error('Error generating company suggestions:', error);
      // Return mock suggestions as fallback
      return this.generateMockSuggestions(idea, count);
    }
  }
  
  /**
   * Generate a merged suggestion from multiple selected suggestions
   * @param suggestions Array of selected suggestions to merge
   * @param userId The user ID for logging and context
   * @returns A new merged suggestion
   */
  async mergeSuggestions(
    suggestions: Suggestion[],
    userId: string
  ): Promise<Suggestion> {
    try {
      if (suggestions.length < 2) {
        throw new Error('Need at least 2 suggestions to merge');
      }
      
      // Create a prompt for merging suggestions
      const prompt = this.createMergePrompt(suggestions);
      
      // Call the general LLM service with the prompt
      const response = await generalLLMService.query(prompt, {
        userId: userId || 'anonymous',
        useCompanyModel: false,
        useExistingModels: true,
        context: 'idea_merging'
      });
      
      // Parse the AI response into a merged suggestion
      return this.parseMergedSuggestion(response.content, suggestions);
    } catch (error) {
      console.error('Error merging suggestions:', error);
      // Return a basic merged suggestion as fallback
      return this.createBasicMergedSuggestion(suggestions);
    }
  }
  
  /**
   * Regenerate a specific suggestion
   * @param originalSuggestion The suggestion to regenerate
   * @param userId The user ID for logging and context
   * @returns A new regenerated suggestion
   */
  async regenerateSuggestion(
    originalSuggestion: Suggestion,
    idea: IdeaPlaygroundIdea,
    userId: string
  ): Promise<Suggestion> {
    try {
      // Create a prompt for regenerating the suggestion
      const prompt = this.createRegenerationPrompt(originalSuggestion, idea);
      
      // Call the general LLM service with the prompt
      const response = await generalLLMService.query(prompt, {
        userId: userId || 'anonymous',
        useCompanyModel: !!idea.used_company_context,
        useExistingModels: true,
        context: 'idea_regeneration'
      });
      
      // Parse the AI response into a suggestion
      return this.parseRegeneratedSuggestion(response.content, originalSuggestion);
    } catch (error) {
      console.error('Error regenerating suggestion:', error);
      // Return a modified version of the original as fallback
      return {
        ...originalSuggestion,
        title: `${originalSuggestion.title} (Regenerated)`,
        description: `Improved version of: ${originalSuggestion.description}`
      };
    }
  }
  
  /**
   * Create a prompt for generating company suggestions
   */
  private createSuggestionPrompt(idea: IdeaPlaygroundIdea, count: number): string {
    const userContext = idea.used_company_context 
      ? `This idea is part of an existing business. Consider how it might fit within 
         an established company's operations and strategy.` 
      : '';
      
    return `
      You are a creative business strategist and startup advisor with extensive knowledge of 
      markets, business models, and innovation strategies.
      
      ORIGINAL IDEA:
      Title: ${idea.title}
      Description: ${idea.description}
      Solution Concept: ${idea.solution_concept || 'Not specified'}
      ${userContext}
      
      TASK:
      Generate ${count} distinct and innovative variations of the original idea. Each variation should 
      have a unique angle or approach while still solving the core problem or addressing the core opportunity.
      
      For each variation, please provide:
      1. Title: A catchy, clear title
      2. Description: A concise description of the idea variation (1-2 sentences)
      3. Problem Statement: What problem does this solve?
      4. Solution Concept: How does this solution work?
      5. Target Audience: Who would use/buy this?
      6. Unique Value: What makes this variation special?
      7. Business Model: How would this make money?
      8. Marketing Strategy: How would you promote this?
      9. Revenue Model: Specific revenue streams
      10. Go-to-Market Strategy: Initial launch approach
      11. Market Size: Rough estimate of the addressable market
      12. Competition: List of 2-4 potential competitors
      13. Revenue Streams: 3-5 potential revenue sources
      14. Cost Structure: 3-5 major cost categories
      15. Key Metrics: 3-5 important KPIs to track
      
      SWOT ANALYSIS FOR EACH:
      - Strengths: 2-3 key strengths
      - Weaknesses: 2-3 key weaknesses
      - Opportunities: 2-3 market opportunities
      - Threats: 2-3 potential risks or threats
      
      FORMAT:
      Return the results in a valid JSON array format that I can parse directly. Each object should have all the above fields.
      
      IMPORTANT GUIDELINES:
      - Make each variation truly distinct, not just minor tweaks
      - Be realistic but creative
      - Consider different business models for each
      - Target different audience segments where appropriate
      - Each variation should have a clear revenue model
    `;
  }
  
  /**
   * Create a prompt for merging multiple suggestions
   */
  private createMergePrompt(suggestions: Suggestion[]): string {
    // Extract titles for a more concise prompt summary
    const suggestionTitles = suggestions.map((s, i) => `${i+1}. ${s.title}`).join('\n');
    
    // Create detailed JSON for each suggestion
    const suggestionsJson = JSON.stringify(suggestions, null, 2);
    
    return `
      You are a creative business strategist and startup advisor tasked with merging multiple business ideas.
      
      TASK:
      Create a single, cohesive business idea that combines the best elements from these suggestions:
      ${suggestionTitles}
      
      Detailed information about each suggestion:
      ${suggestionsJson}
      
      Create a new merged business idea that:
      1. Takes the best elements from each suggestion
      2. Resolves any contradictions between the suggestions
      3. Creates something that's more than the sum of its parts
      4. Is coherent and practical
      
      FORMAT:
      Return a single merged suggestion in valid JSON format with the same fields as the input suggestions.
      
      Title the merged suggestion with "(Merged Concept)" at the end, e.g. "AI-Powered Health Platform (Merged Concept)".
      
      IMPORTANT:
      - The merged concept should be innovative yet realistic
      - Ensure all fields are filled out completely
      - Maintain the most compelling value propositions from the original concepts
      - Address the strongest target audience identified across concepts
    `;
  }
  
  /**
   * Create a prompt for regenerating a specific suggestion
   */
  private createRegenerationPrompt(suggestion: Suggestion, idea: IdeaPlaygroundIdea): string {
    const suggestionJson = JSON.stringify(suggestion, null, 2);
    
    return `
      You are a creative business strategist and startup advisor with extensive knowledge of 
      markets, business models, and innovation strategies.
      
      ORIGINAL IDEA INPUT:
      Title: ${idea.title}
      Description: ${idea.description}
      Solution Concept: ${idea.solution_concept || 'Not specified'}
      
      CURRENT SUGGESTION TO IMPROVE:
      ${suggestionJson}
      
      TASK:
      Generate an improved version of this business idea. Keep the core concept but make it more:
      - Innovative
      - Marketable
      - Financially viable
      - Competitive
      
      Enhance all aspects of the idea, especially:
      - Value proposition
      - Business model
      - Target audience
      - Go-to-market strategy
      
      FORMAT:
      Return the improved suggestion in a valid JSON format with all the same fields as the input suggestion.
      
      IMPORTANT:
      - Make meaningful improvements, not superficial changes
      - Keep the fundamental concept intact while enhancing it
      - Ensure all fields are filled out completely
      - Be realistic but ambitious
    `;
  }
  
  /**
   * Parse the AI response into suggestion objects
   */
  private parseSuggestionsResponse(responseContent: string, originalIdea: IdeaPlaygroundIdea): Suggestion[] {
    try {
      // Find the JSON array in the response
      const jsonMatch = responseContent.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        
        // Validate and clean up suggestions
        return suggestions.map((s: any) => this.validateAndCleanSuggestion(s, originalIdea));
      }
      
      // If no JSON array found, fall back to mock suggestions
      console.warn('Failed to parse AI response as JSON array');
      return this.generateMockSuggestions(originalIdea, 5);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.generateMockSuggestions(originalIdea, 5);
    }
  }
  
  /**
   * Parse the AI response into a merged suggestion
   */
  private parseMergedSuggestion(responseContent: string, originalSuggestions: Suggestion[]): Suggestion {
    try {
      // Find the JSON object in the response
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const suggestion = JSON.parse(jsonMatch[0]);
        
        // Validate and ensure the title indicates it's a merged concept
        const mergedSuggestion = this.validateAndCleanSuggestion(suggestion, null);
        
        // Make sure the title indicates it's a merged concept
        if (!mergedSuggestion.title.includes('(Merged Concept)')) {
          mergedSuggestion.title += ' (Merged Concept)';
        }
        
        return mergedSuggestion;
      }
      
      // If no JSON object found, fall back to basic merge
      console.warn('Failed to parse AI response as JSON object');
      return this.createBasicMergedSuggestion(originalSuggestions);
    } catch (error) {
      console.error('Error parsing AI merge response:', error);
      return this.createBasicMergedSuggestion(originalSuggestions);
    }
  }
  
  /**
   * Parse the AI response into a regenerated suggestion
   */
  private parseRegeneratedSuggestion(responseContent: string, originalSuggestion: Suggestion): Suggestion {
    try {
      // Find the JSON object in the response
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const suggestion = JSON.parse(jsonMatch[0]);
        
        // Validate and clean up the suggestion
        return this.validateAndCleanSuggestion(suggestion, null);
      }
      
      // If no JSON object found, return a modified version of the original
      console.warn('Failed to parse AI regeneration response as JSON object');
      return {
        ...originalSuggestion,
        title: `${originalSuggestion.title} (Regenerated)`,
        description: `Improved version of: ${originalSuggestion.description}`
      };
    } catch (error) {
      console.error('Error parsing AI regeneration response:', error);
      return {
        ...originalSuggestion,
        title: `${originalSuggestion.title} (Regenerated)`,
        description: `Improved version of: ${originalSuggestion.description}`
      };
    }
  }
  
  /**
   * Validate and ensure all required fields are present in a suggestion
   */
  private validateAndCleanSuggestion(suggestion: any, originalIdea: IdeaPlaygroundIdea | null): Suggestion {
    // Default values from original idea if available
    const defaultTitle = originalIdea ? `Variation of ${originalIdea.title}` : 'New Business Idea';
    const defaultDescription = originalIdea?.description || 'No description provided';
    const defaultProblemStatement = originalIdea?.problem_statement || 'Problem statement not specified';
    const defaultSolutionConcept = originalIdea?.solution_concept || 'Solution not specified';
    
    // Ensure all required fields exist
    return {
      title: suggestion.title || defaultTitle,
      description: suggestion.description || defaultDescription,
      problem_statement: suggestion.problem_statement || defaultProblemStatement,
      solution_concept: suggestion.solution_concept || defaultSolutionConcept,
      target_audience: suggestion.target_audience || 'General market',
      unique_value: suggestion.unique_value || 'Unique value proposition not specified',
      business_model: suggestion.business_model || 'Business model not specified',
      marketing_strategy: suggestion.marketing_strategy || 'Marketing strategy not specified',
      revenue_model: suggestion.revenue_model || 'Revenue model not specified',
      go_to_market: suggestion.go_to_market || 'Go-to-market strategy not specified',
      market_size: suggestion.market_size || 'Market size not estimated',
      competition: Array.isArray(suggestion.competition) ? suggestion.competition : ['Not specified'],
      revenue_streams: Array.isArray(suggestion.revenue_streams) ? suggestion.revenue_streams : ['Not specified'],
      cost_structure: Array.isArray(suggestion.cost_structure) ? suggestion.cost_structure : ['Not specified'],
      key_metrics: Array.isArray(suggestion.key_metrics) ? suggestion.key_metrics : ['Not specified'],
      strengths: Array.isArray(suggestion.strengths) ? suggestion.strengths : ['Not specified'],
      weaknesses: Array.isArray(suggestion.weaknesses) ? suggestion.weaknesses : ['Not specified'],
      opportunities: Array.isArray(suggestion.opportunities) ? suggestion.opportunities : ['Not specified'],
      threats: Array.isArray(suggestion.threats) ? suggestion.threats : ['Not specified']
    };
  }
  
  /**
   * Create a basic merged suggestion from multiple suggestions
   */
  private createBasicMergedSuggestion(suggestions: Suggestion[]): Suggestion {
    if (suggestions.length === 0) {
      throw new Error('No suggestions to merge');
    }
    
    const baseSuggestion = suggestions[0];
    const allTitles = suggestions.map(s => s.title.replace(/ \(Merged Concept\)$/, ''));
    
    // Create a title that references the merged concepts
    const mergedTitle = allTitles.length <= 2 
      ? `${allTitles.join(' + ')} (Merged Concept)`
      : `${allTitles[0]} + ${allTitles.length - 1} More (Merged Concept)`;
    
    // Combine all unique elements from arrays
    const combineUnique = (field: keyof Suggestion) => {
      const allItems = suggestions.flatMap(s => {
        const value = s[field];
        return Array.isArray(value) ? value : [];
      });
      return [...new Set(allItems)].slice(0, 5); // Limit to 5 items
    };
    
    return {
      title: mergedTitle,
      description: `A merged concept combining the best elements of ${allTitles.join(', ')}.`,
      problem_statement: baseSuggestion.problem_statement,
      solution_concept: `Combined approach that integrates: ${suggestions.map(s => s.solution_concept).join('; ')}`,
      target_audience: baseSuggestion.target_audience,
      unique_value: `Multi-faceted value proposition: ${suggestions.map(s => s.unique_value).join('; ')}`,
      business_model: baseSuggestion.business_model,
      marketing_strategy: baseSuggestion.marketing_strategy,
      revenue_model: baseSuggestion.revenue_model,
      go_to_market: baseSuggestion.go_to_market,
      market_size: baseSuggestion.market_size,
      competition: combineUnique('competition'),
      revenue_streams: combineUnique('revenue_streams'),
      cost_structure: combineUnique('cost_structure'),
      key_metrics: combineUnique('key_metrics'),
      strengths: combineUnique('strengths'),
      weaknesses: combineUnique('weaknesses'),
      opportunities: combineUnique('opportunities'),
      threats: combineUnique('threats')
    };
  }
  
  /**
   * Generate mock suggestions based on an original idea (fallback method)
   */
  private generateMockSuggestions(idea: IdeaPlaygroundIdea, count: number): Suggestion[] {
    const mockSuggestions: Suggestion[] = [];
    
    const variants = [
      { suffix: 'Premium Edition', audience: 'Enterprise customers', model: 'Subscription' },
      { suffix: 'Lite Version', audience: 'Individual users', model: 'Freemium' },
      { suffix: 'Pro Edition', audience: 'Professional users', model: 'One-time purchase' },
      { suffix: 'Community Edition', audience: 'Communities and non-profits', model: 'Open source with paid support' },
      { suffix: 'Enterprise Solution', audience: 'Large corporations', model: 'Annual licensing' }
    ];
    
    // Generate the requested number of suggestions
    for (let i = 0; i < Math.min(count, variants.length); i++) {
      const variant = variants[i];
      
      mockSuggestions.push({
        title: `${idea.title} - ${variant.suffix}`,
        description: `A ${variant.suffix.toLowerCase()} of ${idea.title} targeting ${variant.audience.toLowerCase()}.`,
        problem_statement: idea.problem_statement || 'Problem statement not provided',
        solution_concept: idea.solution_concept || 'Solution concept not provided',
        target_audience: variant.audience,
        unique_value: `Specialized features for ${variant.audience.toLowerCase()}`,
        business_model: `${variant.model} model`,
        marketing_strategy: 'Digital marketing and industry partnerships',
        revenue_model: variant.model,
        go_to_market: 'Targeted launch to early adopters',
        market_size: 'Market size will depend on specific segment targeting',
        competition: ['Competitor A', 'Competitor B', 'Competitor C'],
        revenue_streams: ['Primary Revenue', 'Secondary Revenue', 'Tertiary Revenue'],
        cost_structure: ['Development', 'Marketing', 'Operations', 'Customer Support'],
        key_metrics: ['User Acquisition', 'Retention Rate', 'Revenue Per User', 'Customer Lifetime Value'],
        strengths: ['Market fit', 'Unique positioning'],
        weaknesses: ['Resource requirements', 'Market education needs'],
        opportunities: ['Growing market', 'Underserved segment'],
        threats: ['Established competitors', 'Regulatory changes']
      });
    }
    
    return mockSuggestions;
  }
}

// Export a singleton instance
export const ideaPathway1AIService = new IdeaPathway1AIService();
