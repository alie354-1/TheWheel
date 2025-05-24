/**
 * React hook for accessing the analytics service
 */

import { useContext, useCallback } from 'react';
import { analyticsService } from '../services/analytics';
import { AnalyticsFilter, EntityType, MetricType, AggregationOptions } from '../services/analytics/types';
import { useAuth } from './useAuth';
import { useCompany } from './useCompany';

/**
 * Hook for accessing analytics functionality in React components
 */
export const useAnalytics = () => {
  const { user } = useAuth();
  const { currentCompany } = useCompany();

  /**
   * Track an event with the current user and company context
   */
  const trackEvent = useCallback((eventName: string, payload: any = {}) => {
    analyticsService.trackEvent(
      eventName, 
      user?.id || null, 
      currentCompany?.id || null, 
      payload
    );
  }, [user, currentCompany]);

  /**
   * Track a view of a journey entity
   */
  const trackView = useCallback((entityType: EntityType, entityId: string) => {
    if (!currentCompany?.id) return;
    
    analyticsService.trackView(
      currentCompany.id,
      entityType,
      entityId,
      user?.id
    );
  }, [user, currentCompany]);

  /**
   * Track time spent on a journey entity
   */
  const trackTimeSpent = useCallback((entityType: EntityType, entityId: string, timeInSeconds: number) => {
    if (!currentCompany?.id) return;
    
    analyticsService.trackTimeSpent(
      currentCompany.id,
      entityType,
      entityId,
      timeInSeconds,
      user?.id
    );
  }, [user, currentCompany]);

  /**
   * Track a rating for a journey entity
   */
  const trackRating = useCallback((entityType: EntityType, entityId: string, rating: number) => {
    if (!currentCompany?.id) return;
    
    analyticsService.trackRating(
      currentCompany.id,
      entityType,
      entityId,
      rating,
      user?.id
    );
  }, [user, currentCompany]);

  /**
   * Get journey analytics data with current company context
   */
  const getJourneyAnalytics = useCallback((filter: AnalyticsFilter = {}) => {
    if (!currentCompany?.id) return Promise.resolve([]);
    return analyticsService.getAnalytics(currentCompany.id, filter);
  }, [currentCompany]);

  /**
   * Get aggregated journey analytics with current company context
   */
  const getAggregation = useCallback((options: AggregationOptions = {}, filter: AnalyticsFilter = {}) => {
    if (!currentCompany?.id) return Promise.resolve({});
    return analyticsService.getAggregation(currentCompany.id, options, filter);
  }, [currentCompany]);

  /**
   * Get journey progress statistics with current company context
   */
  const getProgressStats = useCallback((journeyId?: string, startDate?: Date, endDate?: Date) => {
    if (!currentCompany?.id) return Promise.resolve(null);
    return analyticsService.getProgressStats(currentCompany.id, journeyId, startDate, endDate);
  }, [currentCompany]);

  /**
   * Get team assignment statistics with current company context
   */
  const getTeamAssignmentStats = useCallback((userId?: string) => {
    if (!currentCompany?.id) return Promise.resolve(null);
    return analyticsService.getTeamAssignmentStats(currentCompany.id, userId);
  }, [currentCompany]);

  /**
   * Get comparison analytics with current company context
   */
  const getComparisonAnalytics = useCallback(() => {
    if (!currentCompany?.id) return Promise.resolve(null);
    return analyticsService.getComparisonAnalytics(currentCompany.id);
  }, [currentCompany]);

  return {
    // Direct access to the service
    analyticsService,
    
    // Event tracking functions with user/company context
    trackEvent,
    trackView,
    trackTimeSpent,
    trackRating,
    
    // Analytics retrieval with company context
    getJourneyAnalytics,
    getAggregation,
    getProgressStats,
    getTeamAssignmentStats,
    getComparisonAnalytics,
  };
};