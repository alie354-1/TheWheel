import { useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { serviceRegistry } from '../services/registry';
import { PreferenceMap, PreferenceValue } from '../services/preferences';

export interface UsePreferencesReturn {
  // User preferences
  getUserPreference: <T extends PreferenceValue>(key: string, defaultValue?: T) => T | null;
  setUserPreference: <T extends PreferenceValue>(key: string, value: T) => Promise<void>;
  getAllUserPreferences: () => PreferenceMap;
  removeUserPreference: (key: string) => Promise<void>;
  
  // Company preferences (if in company context)
  getCompanyPreference: <T extends PreferenceValue>(key: string, defaultValue?: T) => T | null;
  setCompanyPreference: <T extends PreferenceValue>(key: string, value: T) => Promise<void>;
  getAllCompanyPreferences: () => PreferenceMap;
  removeCompanyPreference: (key: string) => Promise<void>;
  
  // Application preferences
  getAppPreference: <T extends PreferenceValue>(key: string, defaultValue?: T) => T | null;
  setAppPreference: <T extends PreferenceValue>(key: string, value: T) => Promise<void>;
  
  // State
  loading: boolean;
  error: string | null;
}

export const usePreferences = (): UsePreferencesReturn => {
  // Get user and company context
  const { user, profile } = useAuth();
  const userId = user?.id;
  const companyId = profile?.company_id;
  
  // Service access
  const preferencesService = serviceRegistry.get('preferences');
  
  // State
  const [userPreferences, setUserPreferences] = useState<PreferenceMap>({});
  const [companyPreferences, setCompanyPreferences] = useState<PreferenceMap>({});
  const [appPreferences, setAppPreferences] = useState<PreferenceMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load preferences
  useEffect(() => {
    const loadPreferences = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Load application preferences
        const appPrefs = await preferencesService.getAllApplicationPreferences();
        setAppPreferences(appPrefs);
        
        // Load user preferences if logged in
        if (userId) {
          const userPrefs = await preferencesService.getAllUserPreferences(userId);
          setUserPreferences(userPrefs);
        }
        
        // Load company preferences if in a company
        if (companyId) {
          const companyPrefs = await preferencesService.getAllCompanyPreferences(companyId);
          setCompanyPreferences(companyPrefs);
        }
      } catch (err: any) {
        console.error('Error loading preferences:', err);
        setError(err.message || 'Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };
    
    loadPreferences();
  }, [userId, companyId, preferencesService]);
  
  // User preferences
  const getUserPreference = useCallback(<T extends PreferenceValue>(key: string, defaultValue?: T): T | null => {
    if (!userId) return defaultValue ?? null;
    
    const value = userPreferences[key];
    return (value !== undefined ? value : defaultValue ?? null) as T;
  }, [userId, userPreferences]);
  
  const setUserPreference = useCallback(async <T extends PreferenceValue>(key: string, value: T): Promise<void> => {
    if (!userId) {
      throw new Error('Cannot set user preference: User not logged in');
    }
    
    try {
      await preferencesService.setUserPreference(key, value, userId);
      
      // Update local state
      setUserPreferences(prev => ({
        ...prev,
        [key]: value
      }));
    } catch (err: any) {
      console.error(`Error setting user preference ${key}:`, err);
      throw err;
    }
  }, [userId, preferencesService]);
  
  const getAllUserPreferences = useCallback((): PreferenceMap => {
    if (!userId) return {};
    return { ...userPreferences };
  }, [userId, userPreferences]);
  
  const removeUserPreference = useCallback(async (key: string): Promise<void> => {
    if (!userId) {
      throw new Error('Cannot remove user preference: User not logged in');
    }
    
    try {
      await preferencesService.remove(key, 'user', userId);
      
      // Update local state
      setUserPreferences(prev => {
        const newPrefs = { ...prev };
        delete newPrefs[key];
        return newPrefs;
      });
    } catch (err: any) {
      console.error(`Error removing user preference ${key}:`, err);
      throw err;
    }
  }, [userId, preferencesService]);
  
  // Company preferences
  const getCompanyPreference = useCallback(<T extends PreferenceValue>(key: string, defaultValue?: T): T | null => {
    if (!companyId) return defaultValue ?? null;
    
    const value = companyPreferences[key];
    return (value !== undefined ? value : defaultValue ?? null) as T;
  }, [companyId, companyPreferences]);
  
  const setCompanyPreference = useCallback(async <T extends PreferenceValue>(key: string, value: T): Promise<void> => {
    if (!companyId) {
      throw new Error('Cannot set company preference: No company context');
    }
    
    try {
      await preferencesService.setCompanyPreference(key, value, companyId);
      
      // Update local state
      setCompanyPreferences(prev => ({
        ...prev,
        [key]: value
      }));
    } catch (err: any) {
      console.error(`Error setting company preference ${key}:`, err);
      throw err;
    }
  }, [companyId, preferencesService]);
  
  const getAllCompanyPreferences = useCallback((): PreferenceMap => {
    if (!companyId) return {};
    return { ...companyPreferences };
  }, [companyId, companyPreferences]);
  
  const removeCompanyPreference = useCallback(async (key: string): Promise<void> => {
    if (!companyId) {
      throw new Error('Cannot remove company preference: No company context');
    }
    
    try {
      await preferencesService.remove(key, 'company', companyId);
      
      // Update local state
      setCompanyPreferences(prev => {
        const newPrefs = { ...prev };
        delete newPrefs[key];
        return newPrefs;
      });
    } catch (err: any) {
      console.error(`Error removing company preference ${key}:`, err);
      throw err;
    }
  }, [companyId, preferencesService]);
  
  // Application preferences
  const getAppPreference = useCallback(<T extends PreferenceValue>(key: string, defaultValue?: T): T | null => {
    const value = appPreferences[key];
    return (value !== undefined ? value : defaultValue ?? null) as T;
  }, [appPreferences]);
  
  const setAppPreference = useCallback(async <T extends PreferenceValue>(key: string, value: T): Promise<void> => {
    try {
      await preferencesService.setApplicationPreference(key, value);
      
      // Update local state
      setAppPreferences(prev => ({
        ...prev,
        [key]: value
      }));
    } catch (err: any) {
      console.error(`Error setting application preference ${key}:`, err);
      throw err;
    }
  }, [preferencesService]);
  
  return {
    // User preferences
    getUserPreference,
    setUserPreference,
    getAllUserPreferences,
    removeUserPreference,
    
    // Company preferences
    getCompanyPreference,
    setCompanyPreference,
    getAllCompanyPreferences,
    removeCompanyPreference,
    
    // Application preferences
    getAppPreference,
    setAppPreference,
    
    // State
    loading,
    error
  };
};