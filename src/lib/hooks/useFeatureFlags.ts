/**
 * React hook for accessing feature flags
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { featureFlagsService, FeatureFlags, FeatureFlag } from '../services/feature-flags';
import { useAuth } from './useAuth';
import { useCompany } from './useCompany';

/**
 * Hook for accessing feature flags in React components
 */
export const useFeatureFlags = () => {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const [initialized, setInitialized] = useState(false);
  const [flags, setFlags] = useState<FeatureFlags>({});
  
  /**
   * Load all feature flags and any applicable overrides
   */
  const loadFeatureFlags = useCallback(async () => {
    try {
      // Load base feature flags
      await featureFlagsService.loadFeatureFlags();
      
      // Load user and company overrides if available
      if (user?.id) {
        await featureFlagsService.loadUserOverrides(user.id);
      }
      
      if (currentCompany?.id && !user?.id) {
        await featureFlagsService.loadCompanyOverrides(currentCompany.id);
      }
      
      // Get the latest flags
      const currentFlags = featureFlagsService.getFeatureFlags();
      setFlags(currentFlags);
      setInitialized(true);
    } catch (error) {
      console.error('Error loading feature flags:', error);
    }
  }, [user, currentCompany]);
  
  /**
   * Initialize feature flags on component mount and when user/company changes
   */
  useEffect(() => {
    loadFeatureFlags();
  }, [loadFeatureFlags]);
  
  /**
   * Check if a feature is enabled
   */
  const isEnabled = useCallback((key: string): boolean => {
    return featureFlagsService.isEnabled(key);
  }, []);
  
  /**
   * Check if a feature is visible
   */
  const isVisible = useCallback((key: string): boolean => {
    return featureFlagsService.isVisible(key);
  }, []);
  
  /**
   * Get a specific feature flag
   */
  const getFeatureFlag = useCallback((key: string): FeatureFlag | undefined => {
    return featureFlagsService.getFeatureFlag(key);
  }, []);
  
  /**
   * Update a specific feature flag
   * For admins only
   */
  const updateFeatureFlag = useCallback(async (key: string, value: Partial<FeatureFlag>): Promise<void> => {
    featureFlagsService.setFeatureFlag(key, value);
    await featureFlagsService.saveFeatureFlags({ [key]: featureFlagsService.getFeatureFlag(key) as FeatureFlag });
    setFlags(featureFlagsService.getFeatureFlags());
  }, []);
  
  /**
   * Set user-specific overrides
   * For user preferences or per-user feature rollouts
   */
  const setUserOverrides = useCallback(async (flags: Partial<FeatureFlags>): Promise<void> => {
    if (!user?.id) return;
    await featureFlagsService.saveUserOverride(user.id, flags);
    setFlags(featureFlagsService.getFeatureFlags());
  }, [user]);
  
  /**
   * Set company-specific overrides
   * For company-wide settings
   */
  const setCompanyOverrides = useCallback(async (flags: Partial<FeatureFlags>): Promise<void> => {
    if (!currentCompany?.id) return;
    await featureFlagsService.saveCompanyOverride(currentCompany.id, flags);
    setFlags(featureFlagsService.getFeatureFlags());
  }, [currentCompany]);
  
  /**
   * Reset all feature flags to defaults
   * For admins only
   */
  const resetToDefaults = useCallback(async (): Promise<void> => {
    await featureFlagsService.resetToDefaults();
    setFlags(featureFlagsService.getFeatureFlags());
  }, []);
  
  /**
   * Clear all overrides and return to global settings
   */
  const clearOverrides = useCallback((): void => {
    featureFlagsService.clearOverrides();
    setFlags(featureFlagsService.getFeatureFlags());
  }, []);
  
  /**
   * Get all feature flag definitions with metadata
   * For admin UI
   */
  const getAllDefinitions = useCallback(() => {
    return featureFlagsService.getAllDefinitions();
  }, []);
  
  /**
   * Get grouped feature flag definitions for UI display
   * For admin UI
   */
  const getGroupedDefinitions = useCallback(() => {
    return featureFlagsService.getGroupedDefinitions();
  }, []);
  
  // Return the hook API
  return {
    // State
    flags,
    initialized,
    
    // Core methods
    isEnabled,
    isVisible,
    getFeatureFlag,
    loadFeatureFlags,
    
    // Admin methods
    updateFeatureFlag,
    resetToDefaults,
    getAllDefinitions,
    getGroupedDefinitions,
    
    // Override methods
    setUserOverrides,
    setCompanyOverrides,
    clearOverrides,
    
    // Direct service access (use with caution)
    featureFlagsService
  };
};