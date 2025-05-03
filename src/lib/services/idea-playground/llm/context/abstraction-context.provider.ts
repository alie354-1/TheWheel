import { BaseContextProvider } from './base-context.provider';
import { LLMRequestContext } from './interface';

/**
 * Abstraction level settings for prompting
 */
export enum AbstractionLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  EXPERT = 'expert',
  TECHNICAL = 'technical',
  BUSINESS = 'business',
  CREATIVE = 'creative'
}

/**
 * Context provider that adjusts the language and concepts used in prompts 
 * based on the user's preferred abstraction level
 */
export class AbstractionContextProvider extends BaseContextProvider {
  private level: AbstractionLevel;
  
  constructor(level: AbstractionLevel = AbstractionLevel.INTERMEDIATE) {
    super('abstraction-context', 50); // Medium priority
    this.level = level;
  }
  
  /**
   * Update the abstraction level
   */
  setAbstractionLevel(level: AbstractionLevel): void {
    this.level = level;
  }
  
  /**
   * Get the current abstraction level
   */
  getAbstractionLevel(): AbstractionLevel {
    return this.level;
  }
  
  /**
   * Process and enrich context with abstraction level guidance
   */
  processContext(context: LLMRequestContext): LLMRequestContext {
    if (!this.isEnabled()) {
      return context;
    }
    
    let abstractionGuidance = '';
    
    switch (this.level) {
      case AbstractionLevel.BEGINNER:
        abstractionGuidance = this.getBeginnerGuidance();
        break;
      case AbstractionLevel.INTERMEDIATE:
        abstractionGuidance = this.getIntermediateGuidance();
        break;
      case AbstractionLevel.EXPERT:
        abstractionGuidance = this.getExpertGuidance();
        break;
      case AbstractionLevel.TECHNICAL:
        abstractionGuidance = this.getTechnicalGuidance();
        break;
      case AbstractionLevel.BUSINESS:
        abstractionGuidance = this.getBusinessGuidance();
        break;
      case AbstractionLevel.CREATIVE:
        abstractionGuidance = this.getCreativeGuidance();
        break;
      default:
        abstractionGuidance = this.getIntermediateGuidance();
    }
    
    // Add abstraction guidance to system context
    return {
      ...context,
      systemContext: this.combineContextValues(context.systemContext, abstractionGuidance)
    };
  }
  
  /**
   * Get guidance for beginner level
   */
  private getBeginnerGuidance(): string {
    return `# Communication Style Guidance

Please use simple, straightforward language suitable for someone new to business and technology concepts. 
Avoid jargon, and when technical terms must be used, provide brief explanations.

- Use everyday examples and analogies to explain complex ideas
- Break down multi-step processes into clearly numbered steps
- Provide context for concepts that might be unfamiliar
- Focus on fundamental concepts rather than edge cases or exceptions
- Use encouraging, supportive language that builds confidence`;
  }
  
  /**
   * Get guidance for intermediate level
   */
  private getIntermediateGuidance(): string {
    return `# Communication Style Guidance

Please use moderately sophisticated language suitable for someone with basic familiarity with business and technology concepts.
Technical terms can be used, but provide context when using specialized vocabulary.

- Balance depth with accessibility
- Use examples that demonstrate practical applications
- Provide some background information where helpful
- Include more nuance than beginner-level explanations
- Connect concepts to broader themes and patterns`;
  }
  
  /**
   * Get guidance for expert level
   */
  private getExpertGuidance(): string {
    return `# Communication Style Guidance

Please use sophisticated, precise language suitable for someone with extensive experience in business and technology.
Feel free to use domain-specific terminology and discuss advanced concepts without simplification.

- Assume familiarity with industry best practices and standards
- Include discussions of edge cases and exceptions where relevant
- Refer to established frameworks, methodologies, and theories
- Provide insightful analysis rather than just descriptions
- Challenge conventional thinking when appropriate`;
  }
  
  /**
   * Get guidance for technical focus
   */
  private getTechnicalGuidance(): string {
    return `# Communication Style Guidance

Please focus on technical aspects, implementation details, and engineering considerations.
Use precise technical language and emphasize practical, actionable insights.

- Highlight technical challenges and how to overcome them
- Discuss architectural considerations and trade-offs
- Provide specific technical recommendations when relevant
- Consider scalability, performance, and maintenance implications
- Reference relevant technical standards or patterns where applicable`;
  }
  
  /**
   * Get guidance for business focus
   */
  private getBusinessGuidance(): string {
    return `# Communication Style Guidance

Please focus on business strategy, market considerations, and commercial aspects.
Emphasize business value, competitive advantages, and strategic positioning.

- Highlight market opportunities and potential competitive challenges
- Consider financial aspects, including revenue models and cost implications
- Discuss scaling strategies and growth opportunities
- Address customer acquisition and retention considerations
- Reference business models and success factors from related industries`;
  }
  
  /**
   * Get guidance for creative focus
   */
  private getCreativeGuidance(): string {
    return `# Communication Style Guidance

Please focus on innovative, creative aspects and possibilities for differentiation.
Emphasize unique approaches, novel solutions, and opportunities for innovation.

- Encourage thinking outside conventional boundaries
- Suggest unexpected combinations of ideas or technologies
- Highlight opportunities for creative problem-solving
- Consider user experience and emotional aspects
- Provide examples of creative solutions from diverse industries`;
  }
}
