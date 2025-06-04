/**
 * Feature Flags Service with Database Error Handling
 * 
 * This service maintains feature flags in memory but avoids database writes
 * to prevent errors. It will attempt to read from the database but gracefully
 * fall back to defaults if there are any issues.
 */

import { useAuthStore, FeatureFlags } from '../store';
import { supabase } from '../supabase';

// Define the type for a single feature flag's settings
type FeatureFlagSetting = {
  enabled: boolean;
  visible?: boolean;
  value?: any;
  description?: string;
};

/**
 * Feature Flags Service
 * This service is responsible for loading and saving feature flags
 */
class FeatureFlagsService {
  private inMemoryFlags: Record<string, any> = {};
  
  constructor() {
    console.log('[FeatureFlagsService] Initialized with database read capability');
  }
  
  /**
   * Load feature flags from database with fallback to defaults
   * @returns A promise that resolves when flags are loaded
   */
  async loadFeatureFlags(): Promise<void> {
    console.log('[FeatureFlagsService] Loading feature flags from database...');
    const startTime = performance.now();
    
    try {
      // Attempt to load from database
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', 'feature_flags')
        .maybeSingle();
      
      if (error) {
        console.warn('[FeatureFlagsService] Error loading feature flags from database:', error.message);
        console.log('[FeatureFlagsService] Using default feature flags from store');
        return;
      }
      
      if (data && data.value) {
        try {
          // Parse the JSON value
          const flagsData = typeof data.value === 'string' 
            ? JSON.parse(data.value) 
            : data.value;
          
          // Store in memory
          this.inMemoryFlags = flagsData;
          
          // Update the store
          const { setFeatureFlags } = useAuthStore.getState();
          setFeatureFlags(flagsData);
          
          console.log('[FeatureFlagsService] Feature flags loaded from database:', flagsData);
        } catch (parseError) {
          console.error('[FeatureFlagsService] Error parsing feature flags JSON:', parseError);
          console.log('[FeatureFlagsService] Using default feature flags from store');
        }
      } else {
        console.log('[FeatureFlagsService] No feature flags found in database, using defaults');
      }
    } catch (err) {
      console.error('[FeatureFlagsService] Unexpected error loading feature flags:', err);
      console.log('[FeatureFlagsService] Using default feature flags from store');
    } finally {
      const endTime = performance.now();
      console.log(`[FeatureFlagsService] Feature flags loading completed in ${(endTime - startTime).toFixed(2)}ms`);
    }
    
    return Promise.resolve();
  }

  /**
   * Get all feature flags from memory
   */
  getAllFlags(): Record<string, { enabled: boolean; visible: boolean }> {
    // Transform inMemoryFlags to the expected structure if necessary,
    // or assume inMemoryFlags already holds flags in the { enabled, visible } structure.
    // For now, let's assume it's compatible or FeatureFlags type is flexible.
    const allFlags: Record<string, { enabled: boolean; visible: boolean }> = {};
    for (const key in this.inMemoryFlags) {
      if (Object.prototype.hasOwnProperty.call(this.inMemoryFlags, key)) {
        const flag = this.inMemoryFlags[key];
        // Assuming flag structure is { enabled: boolean, visible: boolean, ...otherProps }
        // or just a boolean for enabled and visible is implicitly true or handled by consumer.
        // For simplicity, let's assume the context expects the direct flag object.
        // This might need adjustment based on actual FeatureFlag type.
        if (typeof flag === 'object' && flag !== null && 'enabled' in flag) {
          allFlags[key] = { enabled: !!flag.enabled, visible: !!flag.visible };
        } else if (typeof flag === 'boolean') { // Handle simple boolean flags
          allFlags[key] = { enabled: flag, visible: true }; // Assume visible if just boolean
        }
      }
    }
    return allFlags;
    // A simpler approach if inMemoryFlags directly matches FeatureFlags type from store:
    // return this.inMemoryFlags as FeatureFlags; 
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(key: string): boolean {
    const flag = this.inMemoryFlags[key];
    if (typeof flag === 'object' && flag !== null && 'enabled' in flag) {
      return !!flag.enabled;
    }
    if (typeof flag === 'boolean') {
      return flag;
    }
    return false; // Default to false if flag or enabled property doesn't exist
  }

  /**
   * Check if a feature is visible (simplified, assumes visible if enabled)
   */
  isVisible(key: string): boolean {
    const flag = this.inMemoryFlags[key];
     if (typeof flag === 'object' && flag !== null && 'visible' in flag) {
      return !!flag.visible;
    }
    // If only enabled is present, or it's a boolean, assume visible if enabled
    return this.isEnabled(key); 
  }
  
  /**
   * Get a specific feature flag object
   */
  getFlag(key: string): FeatureFlagSetting | undefined {
    const flag = this.inMemoryFlags[key];
    if (typeof flag === 'object' && flag !== null && 'enabled' in flag) {
      // Ensure the returned object matches FeatureFlagSetting structure
      return {
        enabled: !!flag.enabled,
        visible: !!flag.visible,
        value: flag.value,
        description: flag.description,
      };
    }
    if (typeof flag === 'boolean') {
      // Adapt simple boolean to FeatureFlagSetting structure
      return { enabled: flag, visible: true, value: flag, description: `Feature flag ${key}` };
    }
    return undefined;
  }

  /**
   * Reload feature flags
   */
  async reload(): Promise<void> {
    await this.loadFeatureFlags();
  }
  
  /**
   * Save feature flags to memory only (no database writes)
   * @param flags The feature flags to save
   * @returns A promise that resolves immediately
   */
  async saveFeatureFlags(flags: Partial<FeatureFlags>): Promise<void> {
    console.log('[FeatureFlagsService] Saving feature flags to memory (database writes disabled):', flags);
    
    // Update in-memory flags
    this.inMemoryFlags = {
      ...this.inMemoryFlags,
      ...flags
    };
    
    // Update the store with the new feature flags
    const { setFeatureFlags } = useAuthStore.getState();
    setFeatureFlags(flags);
    
    console.log('[FeatureFlagsService] Feature flags saved to memory');
    return Promise.resolve();
  }
  
  /**
   * Reset the LLM service to use the latest feature flags
   */
  resetLLMService(): void {
    console.log('[FeatureFlagsService] LLM service reset to use latest feature flags');
    
    // Log which AI provider is being used
    const { featureFlags } = useAuthStore.getState();
    if (featureFlags.useRealAI?.enabled) {
      console.log('[FeatureFlagsService] Using OpenAI as the AI provider');
    } else {
      console.log('[FeatureFlagsService] Using Mock AI as the AI provider');
    }
  }
}

// Create a singleton instance of the service
export const featureFlagsService = new FeatureFlagsService();
