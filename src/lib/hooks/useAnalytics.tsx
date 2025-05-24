import { serviceRegistry } from '../services/registry';

export interface UseAnalyticsReturn {
  // Basic analytics tracking
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  trackView: (viewName: string, properties?: Record<string, any>) => void;
  
  // Journey specific analytics
  getProgressStats: () => Promise<any>;
  getCompletionRate: (journeyId?: string) => Promise<number>;
  getTimeEstimates: () => Promise<any>;
  
  // User specific analytics
  getUserEngagement: (userId?: string) => Promise<any>;
  
  // Other functionality
  setUserProperties: (properties: Record<string, any>) => void;
  getRecommendations: (userId?: string, limit?: number) => Promise<any[]>;
}

export const useAnalytics = (): UseAnalyticsReturn => {
  // Direct service access implementation
  const analyticsService = serviceRegistry.get('analytics');
  
  // Basic tracking methods
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    analyticsService.trackEvent(eventName, properties);
  };
  
  const trackView = (viewName: string, properties?: Record<string, any>) => {
    analyticsService.trackView(viewName, properties);
  };
  
  // Journey specific methods
  const getProgressStats = async () => {
    return analyticsService.getProgressStats();
  };
  
  const getCompletionRate = async (journeyId?: string) => {
    return analyticsService.getCompletionRate(journeyId);
  };
  
  const getTimeEstimates = async () => {
    return analyticsService.getTimeEstimates();
  };
  
  // User specific methods
  const getUserEngagement = async (userId?: string) => {
    return analyticsService.getUserEngagement(userId);
  };
  
  // Other functionality
  const setUserProperties = (properties: Record<string, any>) => {
    analyticsService.setUserProperties(properties);
  };
  
  const getRecommendations = async (userId?: string, limit?: number) => {
    return analyticsService.getRecommendations(userId, limit);
  };
  
  return {
    trackEvent,
    trackView,
    getProgressStats,
    getCompletionRate,
    getTimeEstimates,
    getUserEngagement,
    setUserProperties,
    getRecommendations
  };
};