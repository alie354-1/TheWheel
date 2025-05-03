import { ContextProvider, LLMRequestContext } from './interface';
import { AbstractionContextProvider } from './abstraction-context.provider';
import { CompanyContextProvider } from './company-context.provider';

/**
 * Manager for context providers that enriches LLM prompts
 * with relevant context from various sources
 */
export class ContextManager {
  private providers: ContextProvider[] = [];
  
  constructor(initialProviders: ContextProvider[] = []) {
    // Initialize with provided context providers
    initialProviders.forEach(provider => this.addProvider(provider));
  }
  
  /**
   * Create a default context manager with standard providers
   */
  static createDefault(): ContextManager {
    return new ContextManager([
      new AbstractionContextProvider(),
      new CompanyContextProvider()
    ]);
  }
  
  /**
   * Process context through all relevant providers
   */
  processContext(context: LLMRequestContext): LLMRequestContext {
    // Get active providers that can handle this context
    const activeProviders = this.providers
      .filter(provider => provider.isEnabled() && provider.canHandle(context))
      // Sort by priority (highest first)
      .sort((a, b) => b.getPriority() - a.getPriority());
    
    // Process context through each provider
    let processedContext = { ...context };
    for (const provider of activeProviders) {
      processedContext = provider.processContext(processedContext);
    }
    
    // Format the processed context
    const formattedContext = this.formatContext(processedContext);
    
    return {
      ...processedContext,
      formattedContext
    };
  }
  
  /**
   * Format the final context for the LLM prompt
   */
  private formatContext(context: LLMRequestContext): string {
    const parts: string[] = [];
    
    // Add system context
    if (context.systemContext) {
      parts.push(context.systemContext);
    }
    
    // Add domain context
    if (context.domainContext) {
      parts.push(context.domainContext);
    }
    
    // Add examples
    if (context.examples && context.examples.length > 0) {
      parts.push('# Examples');
      context.examples.forEach((example, index) => {
        parts.push(`Example ${index + 1}:\n${example}`);
      });
    }
    
    // Add constraints
    if (context.constraints && context.constraints.length > 0) {
      parts.push('# Constraints');
      context.constraints.forEach(constraint => {
        parts.push(`- ${constraint}`);
      });
    }
    
    // Add output format
    if (context.outputFormat) {
      parts.push('# Output Format');
      parts.push(context.outputFormat);
    }
    
    return parts.join('\n\n');
  }
  
  /**
   * Add a new context provider
   */
  addProvider(provider: ContextProvider): void {
    // Check if a provider with the same name already exists
    const existingIndex = this.providers.findIndex(p => p.getName() === provider.getName());
    
    if (existingIndex >= 0) {
      // Replace the existing provider
      this.providers[existingIndex] = provider;
    } else {
      // Add the new provider
      this.providers.push(provider);
    }
  }
  
  /**
   * Get a provider by name
   */
  getProvider(name: string): ContextProvider | undefined {
    return this.providers.find(provider => provider.getName() === name);
  }
  
  /**
   * Remove a provider by name
   */
  removeProvider(name: string): boolean {
    const initialLength = this.providers.length;
    this.providers = this.providers.filter(provider => provider.getName() !== name);
    return this.providers.length < initialLength;
  }
  
  /**
   * Enable a provider by name
   */
  enableProvider(name: string): boolean {
    const provider = this.getProvider(name);
    if (provider) {
      provider.setEnabled(true);
      return true;
    }
    return false;
  }
  
  /**
   * Disable a provider by name
   */
  disableProvider(name: string): boolean {
    const provider = this.getProvider(name);
    if (provider) {
      provider.setEnabled(false);
      return true;
    }
    return false;
  }
  
  /**
   * Get all providers
   */
  getAllProviders(): ContextProvider[] {
    return [...this.providers];
  }
}
