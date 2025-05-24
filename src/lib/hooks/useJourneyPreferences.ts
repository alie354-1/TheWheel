import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { useCompany } from './useCompany';
import { useAuth } from './useAuth';

/**
 * User preferences for Journey system
 * Part of Sprint 3 implementation
 */
export interface JourneyPreferences {
  viewMode: 'timeline' | 'list';
  expandedPhases: string[];
  lastVisitedSteps: string[];
  favoriteSteps: string[];
  dismissedTips: string[];
  savedFilters: SavedFilter[];
}

interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, any>;
}

const defaultPreferences: JourneyPreferences = {
  viewMode: 'timeline',
  expandedPhases: [],
  lastVisitedSteps: [],
  favoriteSteps: [],
  dismissedTips: [],
  savedFilters: [],
};

/**
 * Hook for managing user journey preferences with persistence
 * Added in Sprint 3 to support user preference persistence
 */
export const useJourneyPreferences = () => {
  const { currentCompany } = useCompany();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<JourneyPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from DB on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id || !currentCompany?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_journey_preferences')
          .select('preferences')
          .eq('user_id', user.id)
          .eq('company_id', currentCompany.id)
          .single();

        if (error) {
          console.error('Error loading preferences:', error);
          setIsLoading(false);
          return;
        }

        if (data?.preferences) {
          setPreferences({
            ...defaultPreferences,
            ...data.preferences
          });
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user?.id, currentCompany?.id]);

  // Save preferences to DB whenever they change
  const savePreferences = useCallback(async (newPrefs: Partial<JourneyPreferences>) => {
    if (!user?.id || !currentCompany?.id) return;

    const updatedPreferences = {
      ...preferences,
      ...newPrefs
    };

    setPreferences(updatedPreferences);

    try {
      const { error } = await supabase
        .from('user_journey_preferences')
        .upsert({
          user_id: user.id,
          company_id: currentCompany.id,
          preferences: updatedPreferences,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, company_id' });

      if (error) {
        console.error('Error saving preferences:', error);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      // Silently fail - preferences are still updated in state
    }
  }, [user?.id, currentCompany?.id, preferences]);

  // Update view mode preference
  const setViewMode = useCallback((viewMode: 'timeline' | 'list') => {
    savePreferences({ viewMode });
  }, [savePreferences]);

  // Add a step to favorites
  const addToFavorites = useCallback((stepId: string) => {
    if (preferences.favoriteSteps.includes(stepId)) return;
    
    savePreferences({
      favoriteSteps: [...preferences.favoriteSteps, stepId]
    });
  }, [preferences.favoriteSteps, savePreferences]);

  // Remove a step from favorites
  const removeFromFavorites = useCallback((stepId: string) => {
    savePreferences({
      favoriteSteps: preferences.favoriteSteps.filter(id => id !== stepId)
    });
  }, [preferences.favoriteSteps, savePreferences]);

  // Record visited step
  const recordVisitedStep = useCallback((stepId: string) => {
    // Keep only the last 10 visited steps
    const updatedVisits = [
      stepId, 
      ...preferences.lastVisitedSteps.filter(id => id !== stepId)
    ].slice(0, 10);
    
    savePreferences({ lastVisitedSteps: updatedVisits });
  }, [preferences.lastVisitedSteps, savePreferences]);

  // Toggle phase expansion state
  const togglePhaseExpansion = useCallback((phaseId: string) => {
    const isExpanded = preferences.expandedPhases.includes(phaseId);
    
    if (isExpanded) {
      savePreferences({
        expandedPhases: preferences.expandedPhases.filter(id => id !== phaseId)
      });
    } else {
      savePreferences({
        expandedPhases: [...preferences.expandedPhases, phaseId]
      });
    }
  }, [preferences.expandedPhases, savePreferences]);

  // Save a filter configuration
  const saveFilter = useCallback((name: string, filterConfig: Record<string, any>) => {
    const newFilter = {
      id: `filter_${Date.now()}`,
      name,
      filters: filterConfig
    };

    savePreferences({
      savedFilters: [...preferences.savedFilters, newFilter]
    });

    return newFilter.id;
  }, [preferences.savedFilters, savePreferences]);

  // Delete a saved filter
  const deleteFilter = useCallback((filterId: string) => {
    savePreferences({
      savedFilters: preferences.savedFilters.filter(f => f.id !== filterId)
    });
  }, [preferences.savedFilters, savePreferences]);

  // Dismiss a tip
  const dismissTip = useCallback((tipId: string) => {
    if (preferences.dismissedTips.includes(tipId)) return;
    
    savePreferences({
      dismissedTips: [...preferences.dismissedTips, tipId]
    });
  }, [preferences.dismissedTips, savePreferences]);

  return {
    preferences,
    isLoading,
    setViewMode,
    addToFavorites,
    removeFromFavorites,
    recordVisitedStep,
    togglePhaseExpansion,
    saveFilter,
    deleteFilter,
    dismissTip
  };
};

export default useJourneyPreferences;
