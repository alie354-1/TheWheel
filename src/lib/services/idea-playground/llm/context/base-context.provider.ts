import { ContextProvider, LLMRequestContext } from './interface';

/**
 * Base implementation of the context provider
 * Provides foundational functionality that other providers can extend
 */
export abstract class BaseContextProvider implements ContextProvider {
  private name: string;
  private priority: number;
  private enabled: boolean;
  
  constructor(name: string, priority: number = 0) {
    this.name = name;
    this.priority = priority;
    this.enabled = true;
  }
  
  /**
   * Get the name of this provider
   */
  getName(): string {
    return this.name;
  }
  
  /**
   * Get the priority of this provider (higher numbers run first)
   */
  getPriority(): number {
    return this.priority;
  }
  
  /**
   * Check if this provider is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
  
  /**
   * Enable or disable this provider
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  /**
   * Check if this provider can handle the given context
   * By default, returns true if the provider is enabled
   */
  canHandle(context: LLMRequestContext): boolean {
    return this.isEnabled();
  }
  
  /**
   * Process and enrich context with additional information
   * This is implemented by specific providers
   */
  abstract processContext(context: LLMRequestContext): LLMRequestContext;
  
  /**
   * Helper method to combine context values with a delimiter
   */
  protected combineContextValues(existing: string | undefined, additional: string): string {
    if (!existing) {
      return additional;
    }
    return `${existing}\n\n${additional}`;
  }
  
  /**
   * Helper method to add an example to the context
   */
  protected addExample(context: LLMRequestContext, example: string): LLMRequestContext {
    const examples = context.examples || [];
    return {
      ...context,
      examples: [...examples, example]
    };
  }
  
  /**
   * Helper method to add a constraint to the context
   */
  protected addConstraint(context: LLMRequestContext, constraint: string): LLMRequestContext {
    const constraints = context.constraints || [];
    return {
      ...context,
      constraints: [...constraints, constraint]
    };
  }
}
