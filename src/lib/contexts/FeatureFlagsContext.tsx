/**
 * Feature Flags Context
 * 
 * This context provides feature flag access to components without needing to use hooks directly.
 * It's useful for components that can't use hooks (class components) or deep in the component tree.
 */

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
// import { FeatureFlags, FeatureFlag } from '../services/feature-flags'; // This import might need to be from '../services/feature-flags.service' if types are there
import { FeatureFlags } from '../store'; // Import FeatureFlags from store
import { getFeatureFlagsService, serviceRegistry } from '../services/registry'; // Import getFeatureFlagsService

// Define a basic FeatureFlag type, align with what FeatureFlagsService.getFlag might return
export interface FeatureFlag {
  enabled: boolean;
  visible?: boolean;
  value?: any;
  [key: string]: any; // Allow other properties
}


// Define the context interface
interface FeatureFlagsContextValue {
  flags: FeatureFlags;
  initialized: boolean;
  isEnabled: (key: string) => boolean;
  isVisible: (key: string) => boolean;
  getFlag: (key: string) => FeatureFlag | undefined;
  getAllFlags: () => Record<string, { enabled: boolean; visible: boolean }>;
  reload: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Create the context with a default value
const FeatureFlagsContext = createContext<FeatureFlagsContextValue>({
  flags: {},
  initialized: false,
  isEnabled: () => false,
  isVisible: () => false,
  getFlag: () => undefined,
  getAllFlags: () => ({}),
  reload: async () => {},
  loading: false,
  error: null
});

// Props interface for the provider component
interface FeatureFlagsProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the app to provide feature flags
 */
export const FeatureFlagsProvider: React.FC<FeatureFlagsProviderProps> = ({ children }) => {
  // State for feature flags
  const [flags, setFlags] = useState<FeatureFlags>({});
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get feature flags service from registry
  const featureFlagsService = getFeatureFlagsService(); // Use typed getter
  
  // Initialize on first mount
  useEffect(() => {
    const initializeFlags = async () => {
      try {
        setLoading(true);
        await featureFlagsService.loadFeatureFlags(); // Changed from initialize
        setFlags(featureFlagsService.getAllFlags());
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
  }, [featureFlagsService]);
  
  // Feature flag methods
  const isEnabled = (key: string): boolean => {
    return featureFlagsService.isEnabled(key);
  };
  
  const isVisible = (key: string): boolean => {
    return featureFlagsService.isVisible(key);
  };
  
  const getFlag = (key: string): FeatureFlag | undefined => {
    return featureFlagsService.getFlag(key);
  };
  
  const getAllFlags = (): Record<string, { enabled: boolean; visible: boolean }> => {
    return featureFlagsService.getAllFlags();
  };
  
  const reload = async (): Promise<void> => {
    try {
      setLoading(true);
      await featureFlagsService.reload();
      setFlags(featureFlagsService.getAllFlags());
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to reload feature flags');
      console.error('Feature flags reload error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    flags,
    initialized,
    isEnabled,
    isVisible,
    getFlag,
    getAllFlags,
    reload,
    loading,
    error
  }), [flags, initialized, loading, error]);
  
  return (
    <FeatureFlagsContext.Provider value={contextValue}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

/**
 * Hook to use the feature flags context
 */
export const useFeatureFlagsContext = () => useContext(FeatureFlagsContext);

/**
 * Main hook for using feature flags throughout the app.
 * Always use this instead of direct context access.
 */
export const useFeatureFlags = useFeatureFlagsContext;
