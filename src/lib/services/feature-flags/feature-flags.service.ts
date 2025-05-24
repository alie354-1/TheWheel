/**
 * Feature Flags Service
 * 
 * This service is responsible for managing feature flags across the application.
 * It provides methods for loading, saving, and checking feature flags, including
 * support for user and company-specific overrides.
 */

import { supabase } from '@/lib/supabase';
import { loggingService } from '../logging.service';
import { FeatureFlag, FeatureFlags, FeatureFlagDefinition, FeatureFlagGroup, IFeatureFlagsService } from './types';
import { defaultFeatureFlags, featureFlagDefinitions, featureFlagGroups } from './defaults';

/**
 * Feature Flags Service Implementation
 */
export class FeatureFlagsService implements IFeatureFlagsService {
  private static instance: FeatureFlagsService;
  private flags: FeatureFlags = { ...defaultFeatureFlags };
  private userOverrideId: string | null = null;
  private companyOverrideId: string | null = null;
  private initialized: boolean = false;
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Log initialization if logging is available
    if (typeof loggingService?.logInfo === 'function') {
      loggingService.logInfo('Feature flags service initialized', {
        timestamp: new Date().toISOString(),
        source: 'feature-flags.service.ts'
      });
    }
  }
  
  /**
   * Get singleton instance of FeatureFlagsService
   */
  public static getInstance(): FeatureFlagsService {
    if (!FeatureFlagsService.instance) {
      FeatureFlagsService.instance = new FeatureFlagsService();
    }
    return FeatureFlagsService.instance;
  }
  
  /**
   * Load feature flags from database
   * Falls back to defaults if database access fails
   */
  public async loadFeatureFlags(): Promise<FeatureFlags> {
    if (this.initialized) {
      return this.flags;
    }
    
    // Log loading attempt
    if (typeof loggingService?.logInfo === 'function') {
      loggingService.logInfo('Loading feature flags from database', {
        timestamp: new Date().toISOString(),
        source: 'feature-flags.service.ts'
      });
    }
    
    const startTime = performance.now();
    
    try {
      // Attempt to load from database
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', 'feature_flags')
        .maybeSingle();
      
      if (error) {
        if (typeof loggingService?.logWarn === 'function') {
          loggingService.logWarn('Error loading feature flags from database', {
            error: error.message,
            source: 'feature-flags.service.ts'
          });
        }
        console.warn('[FeatureFlagsService] Error loading feature flags from database:', error.message);
        console.log('[FeatureFlagsService] Using default feature flags');
        this.initialized = true;
        return this.flags;
      }
      
      if (data && data.value) {
        try {
          // Parse the JSON value
          const flagsData = typeof data.value === 'string' 
            ? JSON.parse(data.value) 
            : data.value;
          
          // Merge with defaults to ensure all expected flags are present
          this.flags = this.mergeWithDefaults(flagsData);
          
          if (typeof loggingService?.logInfo === 'function') {
            loggingService.logInfo('Feature flags loaded from database', {
              flagCount: Object.keys(this.flags).length,
              source: 'feature-flags.service.ts'
            });
          }
          console.log('[FeatureFlagsService] Feature flags loaded from database:', this.flags);
        } catch (parseError) {
          if (typeof loggingService?.logError === 'function') {
            loggingService.logError(parseError instanceof Error ? parseError : new Error(String(parseError)), {
              context: 'loadFeatureFlags.parseJSON',
              source: 'feature-flags.service.ts'
            });
          }
          console.error('[FeatureFlagsService] Error parsing feature flags JSON:', parseError);
          console.log('[FeatureFlagsService] Using default feature flags');
        }
      } else {
        if (typeof loggingService?.logInfo === 'function') {
          loggingService.logInfo('No feature flags found in database, using defaults', {
            source: 'feature-flags.service.ts'
          });
        }
        console.log('[FeatureFlagsService] No feature flags found in database, using defaults');
      }
    } catch (err) {
      if (typeof loggingService?.logError === 'function') {
        loggingService.logError(err instanceof Error ? err : new Error(String(err)), {
          context: 'loadFeatureFlags',
          source: 'feature-flags.service.ts'
        });
      }
      console.error('[FeatureFlagsService] Unexpected error loading feature flags:', err);
      console.log('[FeatureFlagsService] Using default feature flags');
    } finally {
      const endTime = performance.now();
      console.log(`[FeatureFlagsService] Feature flags loading completed in ${(endTime - startTime).toFixed(2)}ms`);
      this.initialized = true;
    }
    
    return this.flags;
  }
  
  /**
   * Save feature flags to database
   */
  public async saveFeatureFlags(flags: Partial<FeatureFlags>): Promise<void> {
    // Log saving attempt
    if (typeof loggingService?.logInfo === 'function') {
      loggingService.logInfo('Saving feature flags to database', {
        flagCount: Object.keys(flags).length,
        timestamp: new Date().toISOString(),
        source: 'feature-flags.service.ts'
      });
    }
    
    // Update in-memory flags
    this.flags = this.mergeFlags(flags);
    
    try {
      // Save to database
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          key: 'feature_flags',
          value: this.flags,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });
      
      if (error) {
        if (typeof loggingService?.logError === 'function') {
          loggingService.logError(new Error(error.message), {
            context: 'saveFeatureFlags',
            flagCount: Object.keys(flags).length,
            dbError: error,
            source: 'feature-flags.service.ts'
          });
        }
        console.error('[FeatureFlagsService] Error saving feature flags to database:', error.message);
        throw new Error(`Failed to save feature flags: ${error.message}`);
      }
      
      if (typeof loggingService?.logInfo === 'function') {
        loggingService.logInfo('Feature flags saved to database', {
          flagCount: Object.keys(flags).length,
          source: 'feature-flags.service.ts'
        });
      }
      console.log('[FeatureFlagsService] Feature flags saved to database');
    } catch (err) {
      if (typeof loggingService?.logError === 'function') {
        loggingService.logError(err instanceof Error ? err : new Error(String(err)), {
          context: 'saveFeatureFlags',
          source: 'feature-flags.service.ts'
        });
      }
      console.error('[FeatureFlagsService] Unexpected error saving feature flags:', err);
      throw err;
    }
  }
  
  /**
   * Get all feature flags
   */
  public getFeatureFlags(): FeatureFlags {
    return this.flags;
  }
  
  /**
   * Get a specific feature flag
   */
  public getFeatureFlag(key: string): FeatureFlag | undefined {
    return this.flags[key];
  }
  
  /**
   * Set a specific feature flag
   */
  public setFeatureFlag(key: string, value: Partial<FeatureFlag>): void {
    if (this.flags[key]) {
      this.flags[key] = { ...this.flags[key], ...value };
    } else {
      this.flags[key] = { enabled: false, visible: false, ...value };
    }
  }
  
  /**
   * Reset feature flags to defaults
   */
  public async resetToDefaults(): Promise<void> {
    this.flags = { ...defaultFeatureFlags };
    await this.saveFeatureFlags(this.flags);
  }
  
  /**
   * Load user-specific overrides
   */
  public async loadUserOverrides(userId: string): Promise<void> {
    if (!userId) return;
    
    // Log loading attempt
    if (typeof loggingService?.logInfo === 'function') {
      loggingService.logInfo('Loading user feature flag overrides', {
        userId,
        source: 'feature-flags.service.ts'
      });
    }
    
    try {
      const { data, error } = await supabase
        .from('feature_flag_overrides')
        .select('*')
        .eq('id', userId)
        .eq('type', 'user')
        .maybeSingle();
      
      if (error) {
        if (typeof loggingService?.logWarn === 'function') {
          loggingService.logWarn('Error loading user feature flag overrides', {
            userId,
            error: error.message,
            source: 'feature-flags.service.ts'
          });
        }
        console.warn('[FeatureFlagsService] Error loading user overrides:', error.message);
        return;
      }
      
      if (data && data.flags) {
        const overrides = typeof data.flags === 'string' 
          ? JSON.parse(data.flags) 
          : data.flags;
        
        // Apply overrides and mark them as overridden
        Object.entries(overrides).forEach(([key, value]) => {
          if (this.flags[key]) {
            const typedValue = value as Partial<FeatureFlag>;
            this.flags[key] = { 
              ...this.flags[key], 
              ...typedValue,
              override: true
            };
          }
        });
        
        this.userOverrideId = userId;
        
        if (typeof loggingService?.logInfo === 'function') {
          loggingService.logInfo('User feature flag overrides applied', {
            userId,
            overrideCount: Object.keys(overrides).length,
            source: 'feature-flags.service.ts'
          });
        }
        console.log('[FeatureFlagsService] User feature flag overrides applied:', overrides);
      } else {
        console.log('[FeatureFlagsService] No user feature flag overrides found');
      }
    } catch (err) {
      if (typeof loggingService?.logError === 'function') {
        loggingService.logError(err instanceof Error ? err : new Error(String(err)), {
          context: 'loadUserOverrides',
          userId,
          source: 'feature-flags.service.ts'
        });
      }
      console.error('[FeatureFlagsService] Unexpected error loading user overrides:', err);
    }
  }
  
  /**
   * Load company-specific overrides
   */
  public async loadCompanyOverrides(companyId: string): Promise<void> {
    if (!companyId) return;
    
    // Skip if user overrides are already applied (user overrides take precedence)
    if (this.userOverrideId) return;
    
    // Log loading attempt
    if (typeof loggingService?.logInfo === 'function') {
      loggingService.logInfo('Loading company feature flag overrides', {
        companyId,
        source: 'feature-flags.service.ts'
      });
    }
    
    try {
      const { data, error } = await supabase
        .from('feature_flag_overrides')
        .select('*')
        .eq('id', companyId)
        .eq('type', 'company')
        .maybeSingle();
      
      if (error) {
        if (typeof loggingService?.logWarn === 'function') {
          loggingService.logWarn('Error loading company feature flag overrides', {
            companyId,
            error: error.message,
            source: 'feature-flags.service.ts'
          });
        }
        console.warn('[FeatureFlagsService] Error loading company overrides:', error.message);
        return;
      }
      
      if (data && data.flags) {
        const overrides = typeof data.flags === 'string' 
          ? JSON.parse(data.flags) 
          : data.flags;
        
        // Apply overrides and mark them as overridden
        Object.entries(overrides).forEach(([key, value]) => {
          if (this.flags[key]) {
            const typedValue = value as Partial<FeatureFlag>;
            this.flags[key] = { 
              ...this.flags[key], 
              ...typedValue,
              override: true
            };
          }
        });
        
        this.companyOverrideId = companyId;
        
        if (typeof loggingService?.logInfo === 'function') {
          loggingService.logInfo('Company feature flag overrides applied', {
            companyId,
            overrideCount: Object.keys(overrides).length,
            source: 'feature-flags.service.ts'
          });
        }
        console.log('[FeatureFlagsService] Company feature flag overrides applied:', overrides);
      } else {
        console.log('[FeatureFlagsService] No company feature flag overrides found');
      }
    } catch (err) {
      if (typeof loggingService?.logError === 'function') {
        loggingService.logError(err instanceof Error ? err : new Error(String(err)), {
          context: 'loadCompanyOverrides',
          companyId,
          source: 'feature-flags.service.ts'
        });
      }
      console.error('[FeatureFlagsService] Unexpected error loading company overrides:', err);
    }
  }
  
  /**
   * Save user-specific overrides
   */
  public async saveUserOverride(userId: string, flags: Partial<FeatureFlags>): Promise<void> {
    if (!userId) return;
    
    // Log saving attempt
    if (typeof loggingService?.logInfo === 'function') {
      loggingService.logInfo('Saving user feature flag overrides', {
        userId,
        flagCount: Object.keys(flags).length,
        source: 'feature-flags.service.ts'
      });
    }
    
    try {
      const { error } = await supabase
        .from('feature_flag_overrides')
        .upsert({
          id: userId,
          type: 'user',
          flags,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id,type'
        });
      
      if (error) {
        if (typeof loggingService?.logError === 'function') {
          loggingService.logError(new Error(error.message), {
            context: 'saveUserOverride',
            userId,
            dbError: error,
            source: 'feature-flags.service.ts'
          });
        }
        console.error('[FeatureFlagsService] Error saving user overrides:', error.message);
        throw new Error(`Failed to save user feature flag overrides: ${error.message}`);
      }
      
      // Apply overrides locally
      Object.entries(flags).forEach(([key, value]) => {
        if (this.flags[key]) {
          const typedValue = value as Partial<FeatureFlag>;
          this.flags[key] = { 
            ...this.flags[key], 
            ...typedValue,
            override: true
          };
        }
      });
      
      this.userOverrideId = userId;
      
      if (typeof loggingService?.logInfo === 'function') {
        loggingService.logInfo('User feature flag overrides saved', {
          userId,
          flagCount: Object.keys(flags).length,
          source: 'feature-flags.service.ts'
        });
      }
      console.log('[FeatureFlagsService] User feature flag overrides saved');
    } catch (err) {
      if (typeof loggingService?.logError === 'function') {
        loggingService.logError(err instanceof Error ? err : new Error(String(err)), {
          context: 'saveUserOverride',
          userId,
          source: 'feature-flags.service.ts'
        });
      }
      console.error('[FeatureFlagsService] Unexpected error saving user overrides:', err);
      throw err;
    }
  }
  
  /**
   * Save company-specific overrides
   */
  public async saveCompanyOverride(companyId: string, flags: Partial<FeatureFlags>): Promise<void> {
    if (!companyId) return;
    
    // Log saving attempt
    if (typeof loggingService?.logInfo === 'function') {
      loggingService.logInfo('Saving company feature flag overrides', {
        companyId,
        flagCount: Object.keys(flags).length,
        source: 'feature-flags.service.ts'
      });
    }
    
    try {
      const { error } = await supabase
        .from('feature_flag_overrides')
        .upsert({
          id: companyId,
          type: 'company',
          flags,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id,type'
        });
      
      if (error) {
        if (typeof loggingService?.logError === 'function') {
          loggingService.logError(new Error(error.message), {
            context: 'saveCompanyOverride',
            companyId,
            dbError: error,
            source: 'feature-flags.service.ts'
          });
        }
        console.error('[FeatureFlagsService] Error saving company overrides:', error.message);
        throw new Error(`Failed to save company feature flag overrides: ${error.message}`);
      }
      
      // Only apply if no user overrides are in effect
      if (!this.userOverrideId) {
        Object.entries(flags).forEach(([key, value]) => {
          if (this.flags[key]) {
            const typedValue = value as Partial<FeatureFlag>;
            this.flags[key] = { 
              ...this.flags[key], 
              ...typedValue,
              override: true
            };
          }
        });
        
        this.companyOverrideId = companyId;
      }
      
      if (typeof loggingService?.logInfo === 'function') {
        loggingService.logInfo('Company feature flag overrides saved', {
          companyId,
          flagCount: Object.keys(flags).length,
          applied: !this.userOverrideId,
          source: 'feature-flags.service.ts'
        });
      }
      console.log('[FeatureFlagsService] Company feature flag overrides saved');
    } catch (err) {
      if (typeof loggingService?.logError === 'function') {
        loggingService.logError(err instanceof Error ? err : new Error(String(err)), {
          context: 'saveCompanyOverride',
          companyId,
          source: 'feature-flags.service.ts'
        });
      }
      console.error('[FeatureFlagsService] Unexpected error saving company overrides:', err);
      throw err;
    }
  }
  
  /**
   * Clear all overrides and return to global settings
   */
  public clearOverrides(): void {
    if (!this.userOverrideId && !this.companyOverrideId) return;
    
    // Remove override markers and reset to base values
    Object.keys(this.flags).forEach(key => {
      if (this.flags[key].override) {
        const definition = featureFlagDefinitions.find(def => def.key === key);
        if (definition) {
          this.flags[key] = { ...definition.defaultValue };
        } else {
          delete this.flags[key].override;
        }
      }
    });
    
    this.userOverrideId = null;
    this.companyOverrideId = null;
    
    if (typeof loggingService?.logInfo === 'function') {
      loggingService.logInfo('Feature flag overrides cleared', {
        source: 'feature-flags.service.ts'
      });
    }
    console.log('[FeatureFlagsService] Feature flag overrides cleared');
  }
  
  /**
   * Check if a feature is enabled
   */
  public isEnabled(key: string): boolean {
    return this.flags[key]?.enabled || false;
  }
  
  /**
   * Check if a feature is visible
   */
  public isVisible(key: string): boolean {
    return this.flags[key]?.visible || false;
  }
  
  /**
   * Get all feature flag definitions
   */
  public getAllDefinitions(): FeatureFlagDefinition[] {
    return featureFlagDefinitions;
  }
  
  /**
   * Get grouped feature flag definitions for UI display
   */
  public getGroupedDefinitions(): FeatureFlagGroup[] {
    return featureFlagGroups;
  }
  
  /**
   * Merge provided flags with current flags
   * Private helper method
   */
  private mergeFlags(flags: Partial<FeatureFlags>): FeatureFlags {
    const updatedFlags = { ...this.flags };
    
    // Update only the specified flags
    Object.entries(flags).forEach(([key, value]) => {
      if (updatedFlags[key]) {
        updatedFlags[key] = { ...updatedFlags[key], ...value };
      } else {
        updatedFlags[key] = value as FeatureFlag;
      }
    });
    
    return updatedFlags;
  }
  
  /**
   * Merge with defaults to ensure all expected flags are present
   * Private helper method
   */
  private mergeWithDefaults(flags: Partial<FeatureFlags>): FeatureFlags {
    const result = { ...defaultFeatureFlags };
    
    // Only override flags that exist in the flags parameter
    Object.entries(flags).forEach(([key, value]) => {
      if (result[key]) {
        result[key] = { ...result[key], ...value };
      } else {
        result[key] = value as FeatureFlag;
      }
    });
    
    return result;
  }
}

// Export singleton instance
export const featureFlagsService = FeatureFlagsService.getInstance();