import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useCompany } from './useCompany';

/**
 * Hook for tracking recommendation analytics
 * Added in Sprint 3 to gather usage data for improving recommendations
 */
export const useRecommendationAnalytics = () => {
  const { currentCompany } = useCompany();

  /**
   * Track when recommendations are viewed
   * @param recommendationIds Array of recommendation IDs that were shown to the user
   */
  const trackRecommendationView = useCallback(
    async (recommendationIds: string[]) => {
      if (!currentCompany?.id || recommendationIds.length === 0) return;

      try {
        await supabase.from('recommendation_events').insert({
          company_id: currentCompany.id,
          event_type: 'view',
          event_data: {
            recommendation_ids: recommendationIds,
            count: recommendationIds.length,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('Failed to track recommendation view:', error);
        // Fail silently - tracking shouldn't affect main functionality
      }
    },
    [currentCompany?.id]
  );

  /**
   * Track when a recommendation is selected/followed
   * @param recommendationId ID of the recommendation that was selected
   */
  const trackRecommendationSelect = useCallback(
    async (recommendationId: string) => {
      if (!currentCompany?.id || !recommendationId) return;

      try {
        await supabase.from('recommendation_events').insert({
          company_id: currentCompany.id,
          event_type: 'select',
          event_data: {
            recommendation_id: recommendationId,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('Failed to track recommendation selection:', error);
        // Fail silently - tracking shouldn't affect main functionality
      }
    },
    [currentCompany?.id]
  );

  /**
   * Track when recommendations are filtered
   * @param filters Applied filters
   * @param resultCount Number of results after filtering
   */
  const trackRecommendationFilter = useCallback(
    async (filters: string[], resultCount: number) => {
      if (!currentCompany?.id) return;

      try {
        await supabase.from('recommendation_events').insert({
          company_id: currentCompany.id,
          event_type: 'filter',
          event_data: {
            filters,
            result_count: resultCount,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('Failed to track recommendation filtering:', error);
        // Fail silently - tracking shouldn't affect main functionality
      }
    },
    [currentCompany?.id]
  );

  /**
   * Track when relationship visualization is interacted with
   * @param action The action taken (e.g., 'view', 'expand', 'navigate')
   * @param stepId The step ID
   * @param details Additional details about the interaction
   */
  const trackRelationshipInteraction = useCallback(
    async (action: string, stepId: string, details?: Record<string, any>) => {
      if (!currentCompany?.id || !stepId) return;

      try {
        await supabase.from('relationship_events').insert({
          company_id: currentCompany.id,
          step_id: stepId,
          event_type: action,
          event_data: {
            ...details,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('Failed to track relationship interaction:', error);
        // Fail silently - tracking shouldn't affect main functionality
      }
    },
    [currentCompany?.id]
  );

  /**
   * Track when a step card is clicked (aliased method for backwards compatibility)
   * @param stepId ID of the step that was clicked
   */
  const trackRecommendationClick = useCallback(
    async (stepId: string) => {
      if (!currentCompany?.id || !stepId) return;

      try {
        await supabase.from('recommendation_events').insert({
          company_id: currentCompany.id,
          event_type: 'click',
          event_data: {
            step_id: stepId,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('Failed to track step click:', error);
        // Fail silently - tracking shouldn't affect main functionality
      }
    },
    [currentCompany?.id]
  );

  /**
   * Track feature usage throughout the journey system
   * Added in Sprint 3 for advanced UI analytics
   * @param featureName Name of the feature being used
   * @param details Additional details about the usage
   */
  const trackFeatureUsage = useCallback(
    async (featureName: string, details?: Record<string, any>) => {
      if (!currentCompany?.id) return;

      try {
        await supabase.from('journey_feature_events').insert({
          company_id: currentCompany.id,
          feature_name: featureName,
          event_data: {
            ...details,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error(`Failed to track ${featureName} usage:`, error);
        // Fail silently - tracking shouldn't affect main functionality
      }
    },
    [currentCompany?.id]
  );

  return {
    trackRecommendationView,
    trackRecommendationSelect,
    trackRecommendationFilter,
    trackRelationshipInteraction,
    trackRecommendationClick, // Add for backwards compatibility
    trackFeatureUsage, // Added for Sprint 3
  };
};

export default useRecommendationAnalytics;
