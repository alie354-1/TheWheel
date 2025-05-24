import { useState, useEffect } from 'react';
import { serviceRegistry } from '../services/registry';

export interface UseFeatureFlagsReturn {
  isEnabled: (featureKey: string) => boolean;
  isVisible: (featureKey: string) => boolean;
  getFlag: (featureKey: string) => { enabled: boolean; visible: boolean } | undefined;
  getAllFlags: () => Record<string, { enabled: boolean; visible: boolean }>;
  reload: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useFeatureFlags = (): UseFeatureFlagsReturn => {
  // Direct service access implementation
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  
  // Get feature flags service from registry
  const featureFlagsService = serviceRegistry.get('featureFlags');
  
  // Initialize on first mount
  useEffect(() => {
    const initializeFlags = async () => {
      if (initialized) return;
      
      try {
        setLoading(true);
        await featureFlagsService.initialize();
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
      await featureFlagsService.reload();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to reload feature flags');
      console.error('Feature flags reload error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Proxy the service methods
  const isEnabled = (featureKey: string): boolean => {
    return featureFlagsService.isEnabled(featureKey);
  };
  
  const isVisible = (featureKey: string): boolean => {
    return featureFlagsService.isVisible(featureKey);
  };
  
  const getFlag = (featureKey: string) => {
    return featureFlagsService.getFlag(featureKey);
  };
  
  const getAllFlags = () => {
    return featureFlagsService.getAllFlags();
  };
  
  return {
    isEnabled,
    isVisible,
    getFlag,
    getAllFlags,
    reload,
    loading,
    error
  };
};