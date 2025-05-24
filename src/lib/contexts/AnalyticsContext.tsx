/**
 * Analytics Context
 * 
 * Provides analytics tracking methods to the entire application.
 */

import React, { createContext, useContext, ReactNode, useMemo, useEffect, useState } from 'react';
import { serviceRegistry } from '../services/registry';
import { authService } from '../services/auth.service'; 
import { useAuthStore } from '../store'; 
import * as AnalyticsServiceType from '../services/analytics.service'; // Import types for analyticsService

// Define the context interface
export interface AnalyticsContextValue {
  trackEvent: (eventName: string, payload?: any) => void;
  trackView: (entityType: string, entityId: string) => void;
  trackTimeSpent: (entityType: string, entityId: string, timeInSeconds: number) => void;
  trackRating: (entityType: string, entityId: string, rating: number) => void;
  getProgressStats: (journeyId?: string, startDate?: Date, endDate?: Date) => Promise<any>;
  getTeamAssignmentStats: (userId?: string) => Promise<any>;
  getComparisonAnalytics: () => Promise<any>;
}

// Create the context with a default value
const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(undefined);

// Props interface for the provider component
export interface AnalyticsProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the app to provide analytics tracking
 */
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  // Get analytics service directly and type it
  const analyticsService = serviceRegistry.get('analytics') as typeof AnalyticsServiceType;
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  // company_id is not directly on the profile. For now, pass null.
  // This can be updated later if company context becomes available here.
  const companyId = null; 


  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await authService.getUser();
      setCurrentUserId(user?.id || null);
    };
    fetchUser();
  }, []);
  
  // Track initial page view on mount
  useEffect(() => {
    if (currentUserId !== undefined) { // Ensure we have attempted to fetch user ID
      const path = window.location.pathname;
      // Pass null for company_id if not available or not relevant for this event
      analyticsService.trackEvent('page_view', currentUserId, companyId, { path });
    }
  }, [analyticsService, currentUserId, companyId]);
  
  // Define tracking methods
  const trackEvent = (eventName: string, payload?: any) => {
    // Pass null for company_id if not available or not relevant for this event
    analyticsService.trackEvent(eventName, currentUserId, companyId, payload);
  };
  
  const trackView = (entityType: string, entityId: string) => {
    // Assuming trackView in analyticsService also needs user_id and company_id
    // If analyticsService.trackView has a different signature, this needs adjustment
    // For now, let's assume it's a specialized form of trackEvent
    analyticsService.trackEvent('entity_view', currentUserId, companyId, { entityType, entityId });
  };
  
  const trackTimeSpent = (entityType: string, entityId: string, timeInSeconds: number) => {
    analyticsService.trackEvent('time_spent', currentUserId, companyId, { entityType, entityId, timeInSeconds });
  };
  
  const trackRating = (entityType: string, entityId: string, rating: number) => {
    analyticsService.trackEvent('rating', currentUserId, companyId, { entityType, entityId, rating });
  };
  
  const getProgressStats = async (journeyId?: string, startDate?: Date, endDate?: Date) => {
    // return analyticsService.getProgressStats(journeyId, startDate, endDate); // Commented out: function not in analytics.service.ts
    console.warn('getProgressStats is not fully implemented in AnalyticsContext');
    return Promise.resolve({});
  };
  
  const getTeamAssignmentStats = async (userId?: string) => {
    // return analyticsService.getTeamAssignmentStats(userId); // Commented out: function not in analytics.service.ts
    console.warn('getTeamAssignmentStats is not fully implemented in AnalyticsContext');
    return Promise.resolve({});
  };
  
  const getComparisonAnalytics = async () => {
    // return analyticsService.getComparisonAnalytics(); // Commented out: function not in analytics.service.ts
    console.warn('getComparisonAnalytics is not fully implemented in AnalyticsContext');
    return Promise.resolve({});
  };
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    trackEvent,
    trackView,
    trackTimeSpent,
    trackRating,
    getProgressStats,
    getTeamAssignmentStats,
    getComparisonAnalytics
  }), []);
  
  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

/**
 * Hook to use the analytics context
 */
export const useAnalyticsContext = (): AnalyticsContextValue => {
  const context = useContext(AnalyticsContext);
  
  if (context === undefined) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  
  return context;
};

/**
 * Main hook for using analytics throughout the app.
 * Always use this instead of direct context access.
 */
export const useAnalytics = useAnalyticsContext;

/**
 * Higher-order component that tracks component views
 */
export const withAnalytics = <P extends object>(
  Component: React.ComponentType<P>,
  options: { entityType: string; getEntityId: (props: P) => string }
) => {
  const WithAnalytics: React.FC<P> = (props) => {
    const { trackView } = useAnalyticsContext();
    
    React.useEffect(() => {
      const entityId = options.getEntityId(props);
      trackView(options.entityType, entityId);
    }, [props]);
    
    return <Component {...props} />;
  };
  
  WithAnalytics.displayName = `WithAnalytics(${Component.displayName || Component.name || 'Component'})`;
  
  return WithAnalytics;
};
