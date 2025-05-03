/**
 * Context data for LLM requests
 */
export interface LLMRequestContext {
  /**
   * System-level instructions or context for the model
   */
  systemContext?: string;
  
  /**
   * User-provided context or additional information
   */
  userContext?: string;
  
  /**
   * Domain-specific context (e.g., company info, project details)
   */
  domainContext?: string;
  
  /**
   * Examples to help guide the model's output format
   */
  examples?: string[];
  
  /**
   * Constraints or rules for the model to follow
   */
  constraints?: string[];
  
  /**
   * Output format specifications (e.g., JSON schema)
   */
  outputFormat?: string;
  
  /**
   * Maximum tokens to generate in the response
   */
  maxTokens?: number;
  
  /**
   * Model temperature setting (0-1)
   */
  temperature?: number;
  
  /**
   * Additional arbitrary context data
   */
  [key: string]: any;
}

/**
 * Interface for context providers that enrich LLM prompts
 */
export interface ContextProvider {
  /**
   * Get the name of this provider
   */
  getName(): string;
  
  /**
   * Get the priority of this provider (higher numbers run first)
   */
  getPriority(): number;
  
  /**
   * Check if this provider is enabled
   */
  isEnabled(): boolean;
  
  /**
   * Enable or disable this provider
   */
  setEnabled(enabled: boolean): void;
  
  /**
   * Check if this provider can handle the given context
   * @param context The context to check
   * @returns True if this provider can handle the context
   */
  canHandle(context: LLMRequestContext): boolean;
  
  /**
   * Process and enrich context with additional information
   * @param context The existing context object
   * @returns The enriched context object
   */
  processContext(context: LLMRequestContext): LLMRequestContext;
}
