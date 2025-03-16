import { AIServiceInterface } from './ai-service.interface';
import { MockAIService } from './mock-ai.service';
import { MultiTieredAIService } from './multi-tiered-ai.service';
import { useAuthStore } from '../../../../lib/store';

/**
 * AI Service Factory
 * This factory creates and returns the appropriate AI service based on the environment and configuration.
 */
export class AIServiceFactory {
  // Store a singleton instance of each service type
  private static mockService: MockAIService | null = null;
  private static multiTieredService: MultiTieredAIService | null = null;
  
  /**
   * Create an AI service
   * @param config The configuration for the AI service
   * @returns An instance of the AI service
   */
  static createService(config?: {
    useMock?: boolean;
    apiKey?: string;
    endpoint?: string;
    tier?: 'free' | 'standard' | 'premium';
  }): AIServiceInterface {
    // Get feature flags from the store
    const { featureFlags } = useAuthStore.getState();
    
    // Log the current feature flags state
    console.log('AI Service Factory - Feature flags state:', {
      useRealAI: featureFlags.useRealAI?.enabled,
      useMockAI: featureFlags.useMockAI?.enabled,
      useMultiTieredAI: featureFlags.multiTieredAI?.enabled
    });
    
    // Check if we should use real AI
    const useRealAI = featureFlags.useRealAI?.enabled;
    
    // If we're not using real AI, return the mock service
    if (!useRealAI || config?.useMock) {
      console.log('Using Mock AI Service');
      
      // Create a new instance if one doesn't exist
      if (!this.mockService) {
        this.mockService = new MockAIService();
      }
      
      return this.mockService;
    }
    
    // Check if we should use multi-tiered AI
    const useMultiTiered = featureFlags.multiTieredAI?.enabled;
    
    // Create a new multi-tiered service instance or use the existing one
    if (!this.multiTieredService) {
      this.multiTieredService = new MultiTieredAIService({
        apiKey: config?.apiKey,
        endpoint: config?.endpoint,
        tier: config?.tier || 'standard'
      });
    }
    
    // If we're using multi-tiered AI, return the multi-tiered service
    if (useMultiTiered) {
      console.log('Using Multi-Tiered AI Service');
      return this.multiTieredService;
    }
    
    // If we're using real AI but not multi-tiered, return the multi-tiered service with a default tier
    // This ensures we're using real AI when the feature flag is enabled
    if (useRealAI) {
      console.log('Using Real AI Service (Single Tier)');
      return this.multiTieredService;
    }
    
    // Fallback to mock service
    console.log('Using Mock AI Service (Fallback)');
    
    // Create a new instance if one doesn't exist
    if (!this.mockService) {
      this.mockService = new MockAIService();
    }
    
    return this.mockService;
  }
  
  /**
   * Reset the AI service instances
   * This is useful when feature flags change and we need to recreate the services
   */
  static resetServices(): void {
    this.mockService = null;
    this.multiTieredService = null;
    console.log('AI services reset');
  }
}
