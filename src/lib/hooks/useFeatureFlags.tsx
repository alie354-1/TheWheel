import { useState, useEffect } from 'react';
import { getFeatureFlagsService } from '../services/registry';
import { useAuthStore } from '../store';
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
  // Use Zustand store for feature flags (global, reactive)
  const flags = useAuthStore(state => state.featureFlags);
  const setFeatureFlags = useAuthStore(state => state.setFeatureFlags);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Get feature flags service from registry
  const featureFlagsService = getFeatureFlagsService();

  // Initialize on first mount
  useEffect(() => {
    const initializeFlags = async () => {
      if (initialized) return;
      try {
        setLoading(true);
        const loadedFlags = await featureFlagsService.loadFeatureFlags();
        setFeatureFlags(loadedFlags);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureFlagsService, initialized]);

  // Reload function
  const reload = async () => {
    try {
      setLoading(true);
      const loadedFlags = await featureFlagsService.loadFeatureFlags();
      setFeatureFlags(loadedFlags);
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
      await featureFlagsService.setFeatureFlag(key, updates);
      // After updating, reload from service to ensure consistency
      const updatedFlags = featureFlagsService.getFeatureFlags();
      setFeatureFlags(updatedFlags);
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
      setFeatureFlags(featureFlagsService.getFeatureFlags());
    } catch (err: any) {
      setError(err.message || 'Failed to reset feature flags');
      console.error('Feature flags reset error:', err);
      throw err;
    }
  };

  // Clear overrides
  const clearOverrides = () => {
    featureFlagsService.clearOverrides();
    setFeatureFlags(featureFlagsService.getFeatureFlags());
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
