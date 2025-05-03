import * as JSON5 from 'json5';
import { generalLLMService } from './general-llm.service';
import { IdeaPlaygroundIdea } from '../types/idea-playground.types';
import { Suggestion } from '../../components/idea-playground/pathway1/SuggestionCard';
import { featureFlagsService } from './feature-flags.service';
import { useAuthStore } from '../store';

/**
 * Service to handle AI operations specifically for Pathway 1 of the Idea Playground
 */
export class IdeaPathway1AIService {
  /**
   * Helper method to check feature flags and reset LLM service if needed
   */
  private checkAndResetLLMService(): void {
    try {
      // Wrap feature flag service in a try-catch to prevent startup crashes
      let flags = { useRealAI: true, useMockAI: true, useMultiTieredAI: false };
      
      try {
        // Load feature flags but don't let errors crash the app
        const { featureFlags } = useAuthStore.getState();
        if (featureFlags) {
          flags = {
            useRealAI: featureFlags.useRealAI?.enabled ?? true,
            useMockAI: featureFlags.useMockAI?.enabled ?? true,
            useMultiTieredAI: featureFlags.useMultiTieredAI?.enabled ?? false
          };
        }
        
        // Only try to reset LLM service if feature flags were loaded successfully
        try {
          featureFlagsService.resetLLMService();
          console.log('IdeaPathway1AI: LLM service reset successful');
        } catch (resetError) {
          console.error('IdeaPathway1AI: Error resetting LLM service:', resetError);
          // Continue despite errors - the app should still work
        }
        
        console.log('IdeaPathway1AI: Current feature flags state:', flags);
      } catch (flagsError) {
        console.error('IdeaPathway1AI: Error getting feature flags:', flagsError);
        // Continue with default values
      }
    } catch (error) {
      console.error('IdeaPathway1AI: Critical error in checkAndResetLLMService:', error);
      // Ensure we don't crash dashboard loading even if this fails completely
    }
  }

  /**
   * Generate a single company suggestion based on an initial idea
   */
  /**
   * Maximum number of retries for generating a suggestion
   */
  private MAX_RETRIES = 2;

  /**
   * Timeout duration in milliseconds for single suggestion generation
   */
  private SUGGESTION_TIMEOUT_MS = 90000; // 90 seconds (increased from 20 seconds)

  /**
   * Attempts to recover a JSON object from malformed or incomplete JSON
   * This is used as a last resort when standard parsing methods fail
   */
  private tryRecoverBrokenJson(content: string, originalIdea: IdeaPlaygroundIdea | null): Suggestion | null {
    console.log('Attempting to recover JSON from malformed response');
    
    try {
      // Try to extract JSON-like content from the response
      let jsonContent = content;
      
      // Clean up the content - remove markdown, extra text, etc.
      const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        jsonContent = codeBlockMatch[1];
      }
      
      // Try to find JSON object boundaries
      const objectMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        jsonContent = objectMatch[0];
      }
      
      // Step 1: Try strict JSON parsing first on the extracted content
      try {
        const parsed = JSON.parse(jsonContent);
        return this.validateAndCleanSuggestion(parsed, originalIdea);
      } catch (e) {
        // Continue to more aggressive recovery
      }
      
      // Step 2: Try to fix common JSON syntax errors
      let fixedJson = jsonContent
        // Fix missing quotes around property names
        .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
        // Fix single quotes to double quotes
        .replace(/'/g, '"')
        // Fix trailing commas in arrays/objects
        .replace(/,(\s*[\]}])/g, '$1');
      
      try {
        const parsed = JSON.parse(fixedJson);
        return this.validateAndCleanSuggestion(parsed, originalIdea);
      } catch (e) {
        // Continue to even more aggressive recovery
      }
      
      // Step 3: Try JSON5 as a last resort
      try {
        const parsed = JSON5.parse(jsonContent);
        return this.validateAndCleanSuggestion(parsed, originalIdea);
      } catch (e) {
        // Failed all recovery attempts
      }
      
      // If we reach here, we couldn't recover a valid JSON object
      console.error('Failed to recover JSON from malformed response');
      return null;
      
    } catch (error) {
      console.error('Error in tryRecoverBrokenJson:', error);
      return null;
    }
  }

  /**
   * Generate a single company suggestion based on an initial idea
   * With improved timeout handling, retry logic and error recovery
   */
  async generateSingleSuggestion(
    idea: IdeaPlaygroundIdea,
    userId: string,
    variationIndex: number = 0,
    retryCount: number = 0
  ): Promise<Suggestion> {
    this.checkAndResetLLMService();
    
    // Progressively longer timeouts for retries
    const currentTimeout = this.SUGGESTION_TIMEOUT_MS * (1 + (retryCount * 0.5));
    
    const timeoutPromise = new Promise<Suggestion>((_, reject) => {
      setTimeout(() => {
        console.log(`IdeaPathway1AI: Single suggestion timeout reached after ${currentTimeout/1000}s, ${retryCount < this.MAX_RETRIES ? 'will retry' : 'fallback to mock data'}`);
        reject(new Error(`AI service timeout after ${currentTimeout/1000}s`));
      }, currentTimeout);
    });
    
    try {
      console.log(`IdeaPathway1AI: Generating single suggestion #${variationIndex + 1} for idea: ${idea?.title || 'Untitled'} (retry: ${retryCount})`);
      
      if (!idea) {
        console.error('IdeaPathway1AI: Cannot generate suggestion: idea is undefined or null');
        return this.generateMockSuggestions({
          title: 'Default Idea',
          description: 'A placeholder for the missing idea',
          problem_statement: 'No problem statement available',
          solution_concept: 'No solution concept available',
        } as IdeaPlaygroundIdea, 1)[0];
      }

      const prompt = this.createSingleSuggestionPrompt(idea, variationIndex);
      
      const aiPromise = (async (): Promise<Suggestion> => {
        try {
          console.log(`IdeaPathway1AI: Calling LLM service for single suggestion #${variationIndex + 1}`);
          
          const response = await generalLLMService.query(prompt, {
            userId: userId || 'anonymous',
            useCompanyModel: !!(idea as any).used_company_context,
            useExistingModels: true,
            context: 'idea_generation',
            temperature: 0.7 + (variationIndex * 0.05) // Slightly increase creativity for later variations
          });
          
          if (!response || !response.content) {
            console.warn('IdeaPathway1AI: Empty response from AI service');
            throw new Error('Empty response from AI service');
          }
          
          console.log('IdeaPathway1AI: AI service returned response, parsing single suggestion');
          
          // Try to parse with improved error recovery
          try {
            const suggestions = this.parseSuggestionsResponse(response.content, idea);
            
            if (suggestions.length > 0) {
              console.log(`IdeaPathway1AI: Successfully parsed single suggestion`);
              return suggestions[0];
            }
            
            // If we get here, try more aggressive parsing
            console.warn('IdeaPathway1AI: Standard parsing failed, attempting robust parsing');
            const recoveredSuggestion = this.tryRecoverBrokenJson(response.content, idea);
            if (recoveredSuggestion) {
              console.log('IdeaPathway1AI: Successfully recovered suggestion from malformed JSON');
              return recoveredSuggestion;
            }
            
            console.warn('IdeaPathway1AI: No valid suggestion parsed from AI response');
            throw new Error('No valid suggestion parsed');
          } catch (parseError) {
            console.error('IdeaPathway1AI: Error parsing AI response:', parseError);
            
            // Try more aggressive recovery as a last resort
            const recoveredSuggestion = this.tryRecoverBrokenJson(response.content, idea);
            if (recoveredSuggestion) {
              console.log('IdeaPathway1AI: Successfully recovered suggestion after parse error');
              return recoveredSuggestion;
            }
            
            throw parseError; // Re-throw if recovery failed
          }
        } catch (err) {
          console.error('IdeaPathway1AI: Error in single AI generation process:', err);
          throw err;
        }
      })();
      
      return await Promise.race([aiPromise, timeoutPromise])
        .catch(error => {
          console.warn(`IdeaPathway1AI: Failed to generate single suggestion: ${error.message}`);
          
          // Try retrying if we haven't exceeded maximum retries
          if (retryCount < this.MAX_RETRIES) {
            console.log(`IdeaPathway1AI: Retrying suggestion generation (attempt ${retryCount + 1} of ${this.MAX_RETRIES})`);
            return this.generateSingleSuggestion(idea, userId, variationIndex, retryCount + 1);
          }
          
          console.log('IdeaPathway1AI: Max retries exceeded, falling back to mock suggestion');
          return this.generateMockSuggestions(idea, 1)[0];
        });
    } catch (error) {
      console.error('IdeaPathway1AI: Error in generateSingleSuggestion:', error);
      
      // Try retrying if we haven't exceeded maximum retries
      if (retryCount < this.MAX_RETRIES) {
        console.log(`IdeaPathway1AI: Retrying suggestion generation (attempt ${retryCount + 1} of ${this.MAX_RETRIES})`);
        return this.generateSingleSuggestion(idea, userId, variationIndex, retryCount + 1);
      }
      
      return this.generateMockSuggestions(idea, 1)[0];
    }
  }

  /**
   * Generate multiple company suggestions based on an initial idea
   * Can now be implemented as a series of individual suggestion calls
   * or left as-is for backward compatibility
   */
  async generateCompanySuggestions(
    idea: IdeaPlaygroundIdea,
    userId: string,
    count: number = 5
  ): Promise<Suggestion[]> {
    this.checkAndResetLLMService();
    
    const timeoutPromise = new Promise<Suggestion[]>((_, reject) => {
      setTimeout(() => {
        console.log('IdeaPathway1AI: AI service timeout reached, fallback to mock data');
        reject(new Error('AI service timeout'));
      }, 45000); // Extended timeout to 45 seconds
    });
    
    try {
      console.log(`IdeaPathway1AI: Starting suggestions generation for idea: ${idea?.title || 'Untitled'}`);
      
      if (!idea) {
        console.error('IdeaPathway1AI: Cannot generate suggestions: idea is undefined or null');
        return this.generateMockSuggestions({
          title: 'Default Idea',
          description: 'A placeholder for the missing idea',
          problem_statement: 'No problem statement available',
          solution_concept: 'No solution concept available',
        } as IdeaPlaygroundIdea, count);
      }

      const prompt = this.createSuggestionPrompt(idea, count);
      
      const aiPromise = (async (): Promise<Suggestion[]> => {
        try {
          console.log(`IdeaPathway1AI: Calling LLM service for idea: ${idea.title || 'Untitled'}`);
          
          const response = await generalLLMService.query(prompt, {
            userId: userId || 'anonymous',
            useCompanyModel: !!(idea as any).used_company_context,
            useExistingModels: true,
            context: 'idea_generation',
            temperature: 0.7
          });
          
          if (!response || !response.content) {
            console.warn('IdeaPathway1AI: Empty response from AI service');
            throw new Error('Empty response from AI service');
          }
          
          console.log('IdeaPathway1AI: AI service returned response, parsing suggestions');
          const suggestions = this.parseSuggestionsResponse(response.content, idea);
          
          if (suggestions.length > 0) {
            console.log(`IdeaPathway1AI: Successfully parsed ${suggestions.length} suggestions`);
            return suggestions;
          }
          
          console.warn('IdeaPathway1AI: No valid suggestions parsed from AI response');
          throw new Error('No valid suggestions parsed');
        } catch (err) {
          console.error('IdeaPathway1AI: Error in AI generation process:', err);
          throw err;
        }
      })();
      
      return await Promise.race([aiPromise, timeoutPromise])
        .catch(error => {
          console.warn(`IdeaPathway1AI: Failed to generate suggestions: ${error.message}`);
          console.log('IdeaPathway1AI: Falling back to mock suggestions');
          return this.generateMockSuggestions(idea, count);
        });
    } catch (error) {
      console.error('IdeaPathway1AI: Error in generateCompanySuggestions:', error);
      return this.generateMockSuggestions(idea, count);
    }
  }
  
  /**
   * Public access to mock suggestions for components
   */
  generateMockSuggestionsPublic(idea: IdeaPlaygroundIdea, count: number): Suggestion[] {
    return this.generateMockSuggestions(idea, count);
  }

  /**
   * Generate mock suggestions based on an original idea (fallback method)
   */
  private generateMockSuggestions(idea: IdeaPlaygroundIdea, count: number): Suggestion[] {
    const mockSuggestions: Suggestion[] = [];
    const defaultTitle = 'Business Idea';
    const defaultDescription = 'A new business concept';
    const defaultProblemStatement = 'Problem statement not available';
    const defaultSolutionConcept = 'Solution concept not available';

    const ideaTitle = idea?.title || defaultTitle;
    const ideaDescription = idea?.description || defaultDescription;
    const ideaProblemStatement = idea?.problem_statement || defaultProblemStatement;
    const ideaSolutionConcept = idea?.solution_concept || defaultSolutionConcept;

    const variants = [
      { suffix: 'Premium Edition', audience: 'Enterprise customers', model: 'Subscription' },
      { suffix: 'Lite Version', audience: 'Individual users', model: 'Freemium' },
      { suffix: 'Pro Edition', audience: 'Professional users', model: 'One-time purchase' },
      { suffix: 'Community Edition', audience: 'Communities and non-profits', model: 'Open source with paid support' },
      { suffix: 'Enterprise Solution', audience: 'Large corporations', model: 'Annual licensing' }
    ];

    for (let i = 0; i < Math.min(count, variants.length); i++) {
      const variant = variants[i];
      mockSuggestions.push({
        title: `${ideaTitle} - ${variant.suffix}`,
        description: `A ${variant.suffix.toLowerCase()} of ${ideaTitle} targeting ${variant.audience.toLowerCase()}.`,
        problem_statement: ideaProblemStatement,
        solution_concept: ideaSolutionConcept,
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

  /**
   * Create a basic merged suggestion from multiple suggestions
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
      strengths: combineUnique('strengths'),
      weaknesses: combineUnique('weaknesses'),
      opportunities: combineUnique('opportunities'),
      threats: combineUnique('threats')
    };
  }

  /**
   * Generate a merged suggestion from multiple selected suggestions
   */
  async mergeSuggestions(
    suggestions: Suggestion[],
    userId: string
  ): Promise<Suggestion> {
    this.checkAndResetLLMService();
    
    try {
      if (suggestions.length < 2) {
        throw new Error('Need at least 2 suggestions to merge');
      }

      const prompt = this.createMergePrompt(suggestions);

      const response = await generalLLMService.query(prompt, {
        userId: userId || 'anonymous',
        useCompanyModel: false, 
        useExistingModels: true,
        context: 'idea_merging',
        temperature: 0.7
      });

      if (!response || !response.content) {
        throw new Error('Empty response from AI service');
      }

      const mergedSuggestion = this.parseMergedSuggestion(response.content, suggestions);
      
      if (mergedSuggestion) {
        return mergedSuggestion;
      }

      return this.createBasicMergedSuggestion(suggestions);
    } catch (error) {
      console.error('Error merging suggestions:', error);
      return this.createBasicMergedSuggestion(suggestions);
    }
  }

  /**
   * Regenerate a specific suggestion
   */
  async regenerateSuggestion(
    originalSuggestion: Suggestion,
    idea: IdeaPlaygroundIdea,
    userId: string
  ): Promise<Suggestion> {
    this.checkAndResetLLMService();
    
    try {
      const prompt = this.createRegenerationPrompt(originalSuggestion, idea);

      const response = await generalLLMService.query(prompt, {
        userId: userId || 'anonymous',
        useCompanyModel: !!(idea as any).used_company_context,
        useExistingModels: true,
        context: 'idea_regeneration',
        temperature: 0.7
      });

      if (!response || !response.content) {
        throw new Error('Empty response from AI service');
      }

      const regeneratedSuggestion = this.parseRegeneratedSuggestion(response.content, originalSuggestion);
      
      if (regeneratedSuggestion) {
        return regeneratedSuggestion;
      }

      return {
        ...originalSuggestion,
        title: `${originalSuggestion.title} (Enhanced)`,
        description: `Improved version of: ${originalSuggestion.description}`
      };
    } catch (error) {
      console.error('Error regenerating suggestion:', error);
      return {
        ...originalSuggestion,
        title: `${originalSuggestion.title} (Enhanced)`,
        description: `Improved version of: ${originalSuggestion.description}`
      };
    }
  }

  /**
   * Create a prompt for generating a single company suggestion
   */
  private createSingleSuggestionPrompt(idea: IdeaPlaygroundIdea, variationIndex: number): string {
    const userContext = (idea as any).used_company_context
      ? `This idea is part of an existing business. Consider how it might fit within an established company's operations and strategy.`
      : '';

    // Create variation guidance based on the index
    let variationGuidance = '';
    if (variationIndex === 0) {
      variationGuidance = 'Focus on creating a premium, high-end version of this idea.';
    } else if (variationIndex === 1) {
      variationGuidance = 'Focus on creating a budget-friendly or freemium version of this idea.';
    } else if (variationIndex === 2) {
      variationGuidance = 'Focus on creating a subscription or service-based version of this idea.';
    } else if (variationIndex === 3) {
      variationGuidance = 'Focus on creating a community or open-source version of this idea.';
    } else if (variationIndex === 4) {
      variationGuidance = 'Focus on creating an enterprise or B2B version of this idea.';
    } else {
      variationGuidance = 'Be highly creative and think of a unique angle for this idea.';
    }

    return `
      You are a creative business strategist and startup advisor with extensive knowledge of
      markets, business models, and innovation strategies.

      ORIGINAL IDEA:
      Title: ${idea.title || 'No title provided'};
      Description: ${idea.description || 'No description provided'};
      Problem Statement: ${idea.problem_statement || 'Not specified'};
      Solution Concept: ${idea.solution_concept || 'Not specified'};
      ${userContext}

      TASK:
      Generate a single distinct and innovative variation of the original idea.
      ${variationGuidance}
      The variation should have a unique angle or approach while still solving the core problem.

      IMPORTANT GUIDELINES:
      - Make your variation truly distinct, not just a minor tweak
      - Be realistic but creative
      - Consider a specific business model
      - Target a specific audience segment
      - Include a clear revenue model
      - Provide thorough analysis for strengths, weaknesses, opportunities, and threats
      - The variation MUST include ALL fields listed in the FORMAT section

      FORMAT:
      Return ONLY a JSON object with no additional text. The object MUST include:
      - title: A catchy, descriptive title for this variation
      - description: A brief overview of the business idea (2-3 sentences)
      - problem_statement: The specific problem this variation addresses
      - solution_concept: How this idea solves the problem in detail
      - target_audience: Specific demographic or user segment this targets
      - unique_value: What makes this solution special compared to alternatives
      - business_model: How the business will operate and generate value
      - marketing_strategy: Specific channels and approaches to reach customers
      - revenue_model: Detailed explanation of how the business will make money
      - go_to_market: Initial strategy to enter the market and gain traction
      - market_size: Estimation of the addressable market (can be qualitative)
      - competition: Array of 3-5 potential competitors
      - revenue_streams: Array of 3-5 specific revenue sources
      - cost_structure: Array of 3-5 major cost categories
      - key_metrics: Array of 3-5 important KPIs to track
      - strengths: Array of 2-3 key strengths of this business idea
      - weaknesses: Array of 2-3 potential weaknesses or challenges
      - opportunities: Array of 2-3 market opportunities to leverage
      - threats: Array of 2-3 external threats to be aware of
    `;
  }

  /**
   * Create a prompt for generating multiple company suggestions
   */
  private createSuggestionPrompt(idea: IdeaPlaygroundIdea, count: number): string {
    const userContext = (idea as any).used_company_context
      ? `This idea is part of an existing business. Consider how it might fit within an established company's operations and strategy.`
      : '';

    return `
      You are a creative business strategist and startup advisor with extensive knowledge of
      markets, business models, and innovation strategies.

      ORIGINAL IDEA:
      Title: ${idea.title || 'No title provided'};
      Description: ${idea.description || 'No description provided'};
      Problem Statement: ${idea.problem_statement || 'Not specified'};
      Solution Concept: ${idea.solution_concept || 'Not specified'};
      ${userContext}

      TASK:
      Generate ${count} distinct and innovative variations of the original idea. Each variation should
      have a unique angle or approach while still solving the core problem or addressing the core opportunity.

      IMPORTANT GUIDELINES:
      - Make each variation truly distinct, not just minor tweaks
      - Be realistic but creative
      - Consider different business models for each
      - Target different audience segments where appropriate
      - Each variation should have a clear revenue model
      - Provide thorough analysis for strengths, weaknesses, opportunities, and threats
      - Each variation MUST include ALL fields listed in the FORMAT section

      FORMAT:
      Return ONLY a JSON array with no additional text. Each object MUST include:
      - title: A catchy, descriptive title for this variation
      - description: A brief overview of the business idea (2-3 sentences)
      - problem_statement: The specific problem this variation addresses
      - solution_concept: How this idea solves the problem in detail
      - target_audience: Specific demographic or user segment this targets
      - unique_value: What makes this solution special compared to alternatives
      - business_model: How the business will operate and generate value
      - marketing_strategy: Specific channels and approaches to reach customers
      - revenue_model: Detailed explanation of how the business will make money
      - go_to_market: Initial strategy to enter the market and gain traction
      - market_size: Estimation of the addressable market (can be qualitative)
      - competition: Array of 3-5 potential competitors
      - revenue_streams: Array of 3-5 specific revenue sources
      - cost_structure: Array of 3-5 major cost categories
      - key_metrics: Array of 3-5 important KPIs to track
      - strengths: Array of 2-3 key strengths of this business idea
      - weaknesses: Array of 2-3 potential weaknesses or challenges
      - opportunities: Array of 2-3 market opportunities to leverage
      - threats: Array of 2-3 external threats to be aware of
    `;
  }

  /**
   * Create a prompt for merging multiple suggestions
   */
  private createMergePrompt(suggestions: Suggestion[]): string {
    const suggestionTitles = suggestions.map((s, i) => `${i+1}. ${s.title}`).join('\n');
    const suggestionsJson = JSON.stringify(suggestions.map(s => ({
      title: s.title,
      description: s.description,
      problem_statement: s.problem_statement
    })), null, 2);

    return `
      You are a creative business strategist and startup advisor tasked with merging multiple business ideas.

      TASK:
      Create a single, cohesive business idea that combines the best elements from these suggestions:
      ${suggestionTitles}

      Detailed information about each suggestion:
      ${suggestionsJson}

      FORMAT:
      Return ONLY a single JSON object with no additional text.
    `;
  }

  /**
   * Create a prompt for regenerating a specific suggestion
   */
  private createRegenerationPrompt(suggestion: Suggestion, idea: IdeaPlaygroundIdea): string {
    const simplifiedSuggestion = {
      title: suggestion.title,
      description: suggestion.description,
      problem_statement: suggestion.problem_statement
    };

    const suggestionJson = JSON.stringify(simplifiedSuggestion, null, 2);

    return `
      You are a creative business strategist and startup advisor with extensive knowledge of
      markets, business models, and innovation strategies.

      ORIGINAL IDEA INPUT:
      Title: ${idea.title || 'No title provided'};
      Description: ${idea.description || 'No description provided'};
      Solution Concept: ${idea.solution_concept || 'Not specified'};

      CURRENT SUGGESTION TO IMPROVE:
      ${suggestionJson}

      TASK:
      Generate an improved version of this business idea. 

      FORMAT:
      Return ONLY the raw JSON with no markdown or explanatory text.
    `;
  }

  /**
   * Parse the AI response to extract suggestion objects
   */
  private parseSuggestionsResponse(response: string, originalIdea: IdeaPlaygroundIdea): Suggestion[] {
    try {
      console.log('Parsing AI response:', response.substring(0, 200) + '...');
      
      // First check if we have any content to work with
      if (!response || response.trim() === '') {
        console.warn('IdeaPathway1AI: Empty response received from AI service');
        return this.generateMockSuggestions(originalIdea, 1);
      }
      
      let processedResponse = response;
      
      // Extract content from code blocks if present
      const codeBlockMatch = processedResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        console.log('IdeaPathway1AI: Found JSON code block in response');
        processedResponse = codeBlockMatch[1];
      }
      
      // Try standard JSON parsing first
      try {
        const parsedData = JSON.parse(processedResponse);
        
        // Check if we got an array or a single object
        if (Array.isArray(parsedData)) {
          console.log(`IdeaPathway1AI: Successfully parsed ${parsedData.length} suggestions with standard JSON parser`);
          if (parsedData.length > 0) {
            // Map each item through validation and return
            return parsedData.map(item => this.validateAndCleanSuggestion(item, originalIdea));
          }
        } else {
          // Single object
          console.log('IdeaPathway1AI: Successfully parsed single suggestion with standard JSON parser');
          return [this.validateAndCleanSuggestion(parsedData, originalIdea)];
        }
      } catch (jsonError) {
        console.warn('IdeaPathway1AI: Standard JSON parsing failed, trying JSON5', jsonError);
        
        // Try JSON5 parsing as a fallback
        try {
          const parsedData = JSON5.parse(processedResponse);
          
          if (Array.isArray(parsedData)) {
            console.log(`IdeaPathway1AI: Successfully parsed ${parsedData.length} suggestions with JSON5 parser`);
            if (parsedData.length > 0) {
              return parsedData.map(item => this.validateAndCleanSuggestion(item, originalIdea));
            }
          } else {
            console.log('IdeaPathway1AI: Successfully parsed single suggestion with JSON5 parser');
            return [this.validateAndCleanSuggestion(parsedData, originalIdea)];
          }
        } catch (json5Error) {
          console.warn('IdeaPathway1AI: JSON5 parsing also failed', json5Error);
          
          // Try to recover JSON from response as a last resort
          const recoveredSuggestion = this.tryRecoverBrokenJson(processedResponse, originalIdea);
          if (recoveredSuggestion) {
            console.log('IdeaPathway1AI: Successfully recovered suggestion from malformed JSON');
            return [recoveredSuggestion];
          }
          
          console.warn('IdeaPathway1AI: All parsing methods failed, falling back to mock data');
          // If we've tried everything and failed, fall back to mock data
          return this.generateMockSuggestions(originalIdea, 1); // Only generate a single mock suggestion
        }
      }
    } catch (error) {
      console.error('Error in parseSuggestionsResponse:', error);
      return this.generateMockSuggestions(originalIdea, 1); // Only generate a single mock suggestion
    }
    
    // If we somehow get here without returning, ensure we still return something
    console.warn('IdeaPathway1AI: Reached end of parseSuggestionsResponse without valid result');
    return this.generateMockSuggestions(originalIdea, 1);
  }

  /**
   * Parse the AI response into a merged suggestion
   */
  private parseMergedSuggestion(responseContent: string, originalSuggestions: Suggestion[]): Suggestion | null {
    try {
      // Try standard JSON parsing
      try {
        const result = JSON.parse(responseContent);
        if (result && typeof result === 'object' && !Array.isArray(result)) {
          const validatedSuggestion = this.validateAndCleanSuggestion(result, null);
          if (!validatedSuggestion.title.includes('(Merged Concept)')) {
            validatedSuggestion.title += ' (Merged Concept)';
          }
          return validatedSuggestion;
        }
      } catch (error) {
        // Fallback to JSON5
        try {
          const result = JSON5.parse(responseContent);
          if (result && typeof result === 'object' && !Array.isArray(result)) {
            const validatedSuggestion = this.validateAndCleanSuggestion(result, null);
            if (!validatedSuggestion.title.includes('(Merged Concept)')) {
              validatedSuggestion.title += ' (Merged Concept)';
            }
            return validatedSuggestion;
          }
        } catch (error) {
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error parsing merged suggestion:', error);
      return null;
    }
  }

  /**
   * Parse the AI response into a regenerated suggestion
   */
  private parseRegeneratedSuggestion(responseContent: string, originalSuggestion: Suggestion): Suggestion | null {
    try {
      try {
        const result = JSON.parse(responseContent);
        if (result && typeof result === 'object' && !Array.isArray(result)) {
          return this.validateAndCleanSuggestion(result, null);
        }
      } catch (error) {
        try {
          const result = JSON5.parse(responseContent);
          if (result && typeof result === 'object') {
            return this.validateAndCleanSuggestion(result, null);
          }
        } catch (error) {
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error parsing regenerated suggestion:', error);
      return null;
    }
  }

  /**
   * Validate and ensure all required fields are present in a suggestion
   */
  private validateAndCleanSuggestion(suggestion: any, originalIdea: IdeaPlaygroundIdea | null): Suggestion {
    const defaultTitle = originalIdea ? `Variation of ${originalIdea.title}` : 'New Business Idea';
    const defaultDescription = originalIdea?.description || 'No description provided';
    const defaultProblemStatement = originalIdea?.problem_statement || 'Problem statement not specified';
    const defaultSolutionConcept = originalIdea?.solution_concept || 'Solution not specified';

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
}

// Create and export a singleton instance
export const ideaPathway1AIService = new IdeaPathway1AIService();
