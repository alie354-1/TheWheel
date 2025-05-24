import { useState, useEffect } from 'react';
import { getFeatureFlagsService } from '../services/registry';
import type { FeatureFlags, FeatureFlagDefinition, FeatureFlagGroup } from '../services/feature-flags';

export interface UseFeatureFlagsReturn {
  flags: FeatureFlags;
  initialized: boolean;
  isEnabled: (featureKey: string) => boolean;
  isVisible: (featureKey: string) => boolean;
  getFlag: (featureKey: string) => { enabled: boolean; visible: boolean } | undefined;
  getAllFlags: () => FeatureFlags;
  getGroupedDefinitions: () => FeatureFlagGroup[];
  updateFeatureFlag: (key: string, updates: Partial<{ enabled: boolean; visible: boolean }>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  clearOverrides: () => void;
  reload: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useFeatureFlags = (): UseFeatureFlagsReturn => {
  // Direct service access implementation
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [flags, setFlags] = useState<FeatureFlags>({});
  
  // Get feature flags service from registry
  const featureFlagsService = getFeatureFlagsService();
  
  // Initialize on first mount
  useEffect(() => {
    const initializeFlags = async () => {
      if (initialized) return;
      
      try {
        setLoading(true);
        const loadedFlags = await featureFlagsService.loadFeatureFlags();
        setFlags(loadedFlags);
        setInitialized(true);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to initialize feature flags');
        console.error('Feature flags initialization error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    initializeFlags();
  }, [featureFlagsService, initialized]);
  
  // Reload function
  const reload = async () => {
    try {
      setLoading(true);
      const loadedFlags = await featureFlagsService.loadFeatureFlags();
      setFlags(loadedFlags);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to reload feature flags');
      console.error('Feature flags reload error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Update a feature flag
  const updateFeatureFlag = async (key: string, updates: Partial<{ enabled: boolean; visible: boolean }>) => {
    try {
      featureFlagsService.setFeatureFlag(key, updates);
      await featureFlagsService.saveFeatureFlags({ [key]: featureFlagsService.getFeatureFlag(key)! });
      setFlags(featureFlagsService.getFeatureFlags());
    } catch (err: any) {
      setError(err.message || 'Failed to update feature flag');
      console.error('Feature flag update error:', err);
      throw err;
    }
  };
  
  // Reset to defaults
  const resetToDefaults = async () => {
    try {
      await featureFlagsService.resetToDefaults();
      setFlags(featureFlagsService.getFeatureFlags());
    } catch (err: any) {
      setError(err.message || 'Failed to reset feature flags');
      console.error('Feature flags reset error:', err);
      throw err;
    }
  };
  
  // Clear overrides
  const clearOverrides = () => {
    featureFlagsService.clearOverrides();
    setFlags(featureFlagsService.getFeatureFlags());
  };
  
  // Proxy the service methods
  const isEnabled = (featureKey: string): boolean => {
    return featureFlagsService.isEnabled(featureKey);
  };
  
  const isVisible = (featureKey: string): boolean => {
    return featureFlagsService.isVisible(featureKey);
  };
  
  const getFlag = (featureKey: string) => {
    return featureFlagsService.getFeatureFlag(featureKey);
  };
  
  const getAllFlags = () => {
    return featureFlagsService.getFeatureFlags();
  };
  
  const getGroupedDefinitions = () => {
    return featureFlagsService.getGroupedDefinitions();
  };
  
  return {
    flags,
    initialized,
    isEnabled,
    isVisible,
    getFlag,
    getAllFlags,
    getGroupedDefinitions,
    updateFeatureFlag,
    resetToDefaults,
    clearOverrides,
    reload,
    loading,
    error
  };
};
