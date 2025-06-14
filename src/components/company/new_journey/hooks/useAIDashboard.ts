import { useState, useEffect, useCallback } from 'react';
import { 
  aiDashboardService, 
  AIRecommendation,
  AIPeerInsight,
  AIBusinessHealth
} from '../../../../lib/services/ai/aiDashboard.service';

/**
 * Hook for accessing AI-powered dashboard features
 * Consolidated to reduce API calls and prevent re-render loops
 */
export function useAIDashboard(companyJourneyId: string) {
  // State for all AI data
  const [recommendedSteps, setRecommendedSteps] = useState<AIRecommendation[]>([]);
  const [peerInsights, setPeerInsights] = useState<AIPeerInsight[]>([]);
  const [businessHealth, setBusinessHealth] = useState<AIBusinessHealth | null>(null);
  
  // Single loading state
  const [isLoading, setIsLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [loadingHealth, setLoadingHealth] = useState(true);
  
  // Consolidated data loading function
  const loadAllData = useCallback(async (forceRefresh = false) => {
    if (!companyJourneyId) {
      console.log('Empty companyJourneyId provided to useAIDashboard, skipping data load');
      setIsLoading(false);
      setLoadingRecommendations(false);
      setLoadingInsights(false);
      setLoadingHealth(false);
      return;
    }
    
    console.log('Loading AI dashboard data for company journey:', companyJourneyId);
    
    // Only set loading to true if we don't have data yet or if this is a forced refresh
    const shouldShowLoading = forceRefresh || 
                             recommendedSteps.length === 0 || 
                             peerInsights.length === 0 || 
                             !businessHealth;
    
    if (shouldShowLoading) {
      setIsLoading(true);
      setLoadingRecommendations(true);
      setLoadingInsights(true);
      setLoadingHealth(true);
    }
    
    try {
      // Load all data in parallel
      const [recommendations, insights, health] = await Promise.all([
        aiDashboardService.getRecommendedSteps(companyJourneyId, 4, forceRefresh),
        aiDashboardService.getPeerInsights(companyJourneyId, 3, forceRefresh),
        aiDashboardService.getBusinessHealth(companyJourneyId, forceRefresh)
      ]);
      
      // Update state with results
      setRecommendedSteps(recommendations);
      setPeerInsights(insights);
      setBusinessHealth(health);
    } catch (error) {
      console.error('Error loading AI dashboard data:', error);
    } finally {
      setLoadingRecommendations(false);
      setLoadingInsights(false);
      setLoadingHealth(false);
      setIsLoading(false);
    }
  }, [companyJourneyId]);
  
  // Load data on initial mount and when companyJourneyId changes
  useEffect(() => {
    // Skip if companyJourneyId is empty
    if (!companyJourneyId) {
      setIsLoading(false);
      setLoadingRecommendations(false);
      setLoadingInsights(false);
      setLoadingHealth(false);
      return;
    }
    
    // Initial load - always force refresh to get latest data
    loadAllData(true);
    
    // Set up polling interval (every 60 seconds)
    // AI recommendations don't need to be refreshed as frequently as other data
    const pollingInterval = setInterval(() => {
      loadAllData(false); // Use false to avoid showing loading indicators on every poll
    }, 60000);
    
    // Cleanup interval on unmount
    return () => {
      clearInterval(pollingInterval);
    };
  }, [loadAllData, companyJourneyId]);
  
  // Function to refresh all data - reuse the loadAllData function with forceRefresh=true
  const refreshAllData = useCallback(() => {
    return loadAllData(true);
  }, [loadAllData]);
  
  return {
    recommendedSteps,
    peerInsights,
    businessHealth,
    isLoading,
    loadingRecommendations,
    loadingInsights,
    loadingHealth,
    refreshAllData
  };
}
