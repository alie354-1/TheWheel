import { LLMOrchestrator } from './llm/orchestrator';
import { AbstractionLevel } from './llm/context/abstraction-context.provider';
import { CompanyInfo } from './llm/context/company-context.provider';

/**
 * Result of an idea generation process
 */
export interface IdeaGenerationResult {
  /** Title of the idea */
  title: string;
  
  /** Description of the idea */
  description: string;
  
  /** Problem statement */
  problem_statement: string;
  
  /** Solution concept */
  solution_concept: string;
  
  /** Target audience (can be string or string[]) */
  target_audience: string[] | string;
  
  /** Unique value proposition */
  unique_value: string;
  
  /** Business model */
  business_model: string;
  
  /** Optional tags */
  tags?: string[];
  
  /** Optional version number */
  version?: number;
  
  /** Any additional fields */
  [key: string]: any;
}

/**
 * Parameters for idea generation
 */
export interface IdeaGenerationParams {
  /** Specific industry or domain */
  industry?: string;
  
  /** Target audience */
  targetAudience?: string;
  
  /** Problem area to focus on */
  problemArea?: string;
  
  /** Technology trends to leverage */
  techTrends?: string[];
  
  /** Abstract level for the response */
  abstractionLevel?: AbstractionLevel;
  
  /** Company context information */
  companyInfo?: CompanyInfo;
  
  /** Maximum number of results to generate */
  maxResults?: number;
  
  /** Any additional parameters */
  [key: string]: any;
}

/**
 * Service for generating business ideas
 */
export class IdeaGenerationService {
  constructor(private llmOrchestrator: LLMOrchestrator) {}
  
  /**
   * Generate a single business idea
   */
  async generateIdea(params: IdeaGenerationParams = {}): Promise<IdeaGenerationResult> {
    try {
      const prompt = this.buildIdeaGenerationPrompt(params);
      
      // Set context based on parameters
      const context: any = {};
      
      // Set abstraction level if provided
      if (params.abstractionLevel) {
        const abstractionProvider = this.llmOrchestrator.getContextManager()
          .getProvider('abstraction-context');
        if (abstractionProvider) {
          (abstractionProvider as any).setAbstractionLevel(params.abstractionLevel);
        }
      }
      
      // Set company information if provided
      if (params.companyInfo) {
        const companyProvider = this.llmOrchestrator.getContextManager()
          .getProvider('company-context');
        if (companyProvider) {
          (companyProvider as any).updateCompanyInfo(params.companyInfo);
        }
      }
      
      // Set output format for structured response
      context.outputFormat = this.getOutputFormat();
      
      // Generate the idea using the LLM
      const response = await this.llmOrchestrator.complete(prompt, context);
      
      // Parse the response into structured data
      return this.parseIdeaGenerationResponse(response);
    } catch (error) {
      console.error('Error in IdeaGenerationService.generateIdea:', error);
      // Return a fallback idea
      return this.getFallbackIdea();
    }
  }
  
  /**
   * Generate multiple business ideas
   */
  async generateMultipleIdeas(params: IdeaGenerationParams = {}): Promise<IdeaGenerationResult[]> {
    try {
      const count = params.maxResults || 3;
      const ideas: IdeaGenerationResult[] = [];
      
      // Generate the specified number of ideas
      for (let i = 0; i < count; i++) {
        const idea = await this.generateIdea(params);
        ideas.push(idea);
      }
      
      return ideas;
    } catch (error) {
      console.error('Error in IdeaGenerationService.generateMultipleIdeas:', error);
      // Return a single fallback idea
      return [this.getFallbackIdea()];
    }
  }
  
  /**
   * Build a prompt for generating business ideas
   */
  private buildIdeaGenerationPrompt(params: IdeaGenerationParams): string {
    // Start with a description of the task
    let prompt = 'Generate an innovative business idea with the following parameters:\n\n';
    
    // Add specific industry if provided
    if (params.industry) {
      prompt += `INDUSTRY: ${params.industry}\n`;
    }
    
    // Add target audience if provided
    if (params.targetAudience) {
      prompt += `TARGET AUDIENCE: ${params.targetAudience}\n`;
    }
    
    // Add problem area if provided
    if (params.problemArea) {
      prompt += `PROBLEM AREA: ${params.problemArea}\n`;
    }
    
    // Add tech trends if provided
    if (params.techTrends && params.techTrends.length > 0) {
      prompt += `TECHNOLOGY TRENDS: ${params.techTrends.join(', ')}\n`;
    }
    
    // Add additional custom parameters
    Object.entries(params).forEach(([key, value]) => {
      if (
        !['industry', 'targetAudience', 'problemArea', 'techTrends', 'abstractionLevel', 'companyInfo', 'maxResults'].includes(key) &&
        value !== undefined
      ) {
        prompt += `${key.toUpperCase()}: ${Array.isArray(value) ? value.join(', ') : value}\n`;
      }
    });
    
    // General instruction
    prompt += '\nThe idea should be innovative, practical, and market-viable. It should address a real problem and provide a unique solution.';
    
    return prompt;
  }
  
  /**
   * Get the expected output format for the LLM
   */
  private getOutputFormat(): string {
    return `Provide your response in a structured format with the following fields:

{
  "title": "Title for the business idea",
  "description": "Description of the business idea in 2-3 sentences",
  "problem_statement": "Clear articulation of the problem being solved",
  "solution_concept": "Explanation of the proposed solution",
  "target_audience": "Target customer segments separated by commas",
  "unique_value": "Differentiator or unique value proposition",
  "business_model": "Description of how the business will make money",
  "tags": ["tag1", "tag2", "tag3"]
}

Ensure your response can be parsed as valid JSON.`;
  }
  
  /**
   * Parse the LLM response into a structured IdeaGenerationResult
   */
  private parseIdeaGenerationResponse(response: string): IdeaGenerationResult {
    try {
      // Find JSON in the response (may be surrounded by markdown or text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const result = JSON.parse(jsonStr) as IdeaGenerationResult;
        
        // Ensure target_audience is always an array
        if (typeof result.target_audience === 'string') {
          const audienceStr: string = result.target_audience as string;
          result.target_audience = audienceStr
            .split(',')
            .map((audience: string): string => audience.trim())
            .filter((audience: string): boolean => audience.length > 0);
        }
        
        // Ensure tags is an array if present
        if (!result.tags) {
          result.tags = [];
        } else if (!Array.isArray(result.tags)) {
          // Handle the case where tags is a string
          if (typeof result.tags === 'string') {
            const tagsStr: string = result.tags as string;
            result.tags = tagsStr
              .split(',')
              .map((tag: string): string => tag.trim())
              .filter((tag: string): boolean => tag.length > 0);
          } else {
            // If it's neither an array nor a string, set to empty array
            result.tags = [];
          }
        }
        
        // Add version
        result.version = 1;
        
        return result;
      }
      
      // If no JSON found, create a structured result from the text
      return this.createStructuredIdeaFromText(response);
    } catch (error) {
      console.error('Error parsing idea generation response:', error);
      return this.getFallbackIdea();
    }
  }
  
  /**
   * Create a structured idea from unstructured text
   */
  private createStructuredIdeaFromText(text: string): IdeaGenerationResult {
    // Create a very basic idea based on the text
    return {
      title: 'New Business Idea',
      description: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      problem_statement: 'Generated from unstructured response',
      solution_concept: 'Generated from unstructured response',
      target_audience: ['General audience'],
      unique_value: 'Generated from unstructured response',
      business_model: 'Subscription model',
      tags: ['generated', 'unstructured'],
      version: 1
    };
  }
  
  /**
   * Get a fallback idea in case of errors
   */
  private getFallbackIdea(): IdeaGenerationResult {
    // Create a generic fallback idea
    return {
      title: 'AI-Powered Task Management Platform',
      description: 'A smart task management platform that uses AI to prioritize tasks, suggest optimal scheduling, and automate routine work.',
      problem_statement: 'People struggle with prioritizing tasks effectively and often waste time on low-value activities.',
      solution_concept: 'An AI system that analyzes work patterns, priorities, and deadlines to suggest the most efficient task schedule and automate routine tasks.',
      target_audience: ['Professionals', 'Teams', 'Project managers'],
      unique_value: 'Uses AI to optimize productivity based on individual work patterns and cognitive science.',
      business_model: 'Freemium with premium features for advanced AI capabilities and team collaboration.',
      tags: ['productivity', 'ai', 'task-management'],
      version: 1
    };
  }
}
