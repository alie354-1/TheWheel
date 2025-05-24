/**
 * Core Analytics Service
 * 
 * This service provides a unified API for all analytics operations.
 * It acts as a facade for various specialized analytics services.
 */

import { supabase } from '@/lib/supabase';
import { loggingService } from '../logging.service';
import { IAnalyticsService, AnalyticsEvent, AnalyticsAggregate, AnalyticsReport, AnalyticsDashboard, JourneyAnalytics, AnalyticsFilter, AnalyticsMetric, EntityType, MetricType, AggregationOptions, ProgressStats, TeamAssignmentStats, AggregationParams, AggregationResult, TimeSeriesParams, TimeSeriesDataPoint, DashboardConfig, DashboardData, SavedReport, ExportFormat, PredictiveInsight, ReportingData, JourneyAnalyticsData } from './types';

import * as journeyAnalyticsService from './journeyAnalytics.service';
import * as dashboardAnalyticsService from './dashboardAnalytics.service';
import * as eventsService from './events.service';
import * as reportingService from './reporting.service';
import * as recommendationAnalyticsService from './recommendation.service';

/**
 * AnalyticsService
 * 
 * A consolidated service that provides access to all analytics functionality.
 * It delegates to specialized services for specific operations.
 */
export class AnalyticsService implements IAnalyticsService {
  private static instance: AnalyticsService;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Log initialization if logging is available
    if (typeof loggingService?.logInfo === 'function') {
      loggingService.logInfo('Analytics service initialized', { timestamp: new Date().toISOString() });
    }
  }

  /**
   * Get singleton instance of AnalyticsService
   */
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // ==================== Core Event Tracking ====================

  /**
   * Track an analytics event
   */
  public async trackEvent(event_name: string, userId: string | null, companyId: string | null, payload: any): Promise<void> {
    return eventsService.trackEvent(event_name, userId, companyId, payload);
  }

  // ==================== Journey-specific Tracking ====================

  /**
   * Track an analytics metric for a journey entity
   */
  public async trackMetric(analytics: JourneyAnalytics): Promise<void> {
    return journeyAnalyticsService.trackMetric(analytics);
  }

  /**
   * Track time spent on a journey entity
   */
  public async trackTimeSpent(companyId: string, entityType: EntityType, entityId: string, timeInSeconds: number, userId?: string): Promise<void> {
    return journeyAnalyticsService.trackTimeSpent(companyId, entityType, entityId, timeInSeconds, userId);
  }

  /**
   * Track a view of a journey entity
   */
  public async trackView(companyId: string, entityType: EntityType, entityId: string, userId?: string): Promise<void> {
    return journeyAnalyticsService.trackView(companyId, entityType, entityId, userId);
  }

  /**
   * Track a user rating for a journey entity
   */
  public async trackRating(companyId: string, entityType: EntityType, entityId: string, rating: number, userId?: string): Promise<void> {
    return journeyAnalyticsService.trackRating(companyId, entityType, entityId, rating, userId);
  }

  // ==================== Analytics Retrieval ====================

  /**
   * Get analytics data with optional filtering
   */
  public async getAnalytics(companyId: string, filter: AnalyticsFilter = {}): Promise<JourneyAnalytics[]> {
    return journeyAnalyticsService.getAnalytics(companyId, filter);
  }

  /**
   * Get aggregated analytics data
   */
  public async getAggregation(companyId: string, options: AggregationOptions = {}, filter: AnalyticsFilter = {}): Promise<any> {
    return journeyAnalyticsService.getAggregation(companyId, options, filter);
  }

  /**
   * Get journey progress statistics
   */
  public async getProgressStats(companyId: string, journeyId?: string, startDate?: Date, endDate?: Date): Promise<ProgressStats | null> {
    return journeyAnalyticsService.getProgressStats(companyId, journeyId, startDate, endDate);
  }

  /**
   * Get team assignments statistics
   */
  public async getTeamAssignmentStats(companyId: string, userId?: string): Promise<TeamAssignmentStats | null> {
    return journeyAnalyticsService.getTeamAssignmentStats(companyId, userId);
  }

  /**
   * Get analytics for comparing journey progress with industry benchmarks
   */
  public async getComparisonAnalytics(companyId: string): Promise<any | null> {
    return journeyAnalyticsService.getComparisonAnalytics(companyId);
  }

  // ==================== Predictive Analytics ====================

  /**
   * Get journey completion forecast
   */
  public async getJourneyCompletionForecast(companyId: string): Promise<{ estimatedWeeks: number; confidence: number } | null> {
    return journeyAnalyticsService.getJourneyCompletionForecast(companyId);
  }

  /**
   * Predict potential journey bottlenecks
   */
  public async predictBottlenecks(companyId: string): Promise<{ stepId: string; stepName: string; predictedDelayFactor: number }[] | null> {
    return journeyAnalyticsService.predictBottlenecks(companyId);
  }

  /**
   * Get tool adoption projections
   */
  public async getToolAdoptionProjections(companyId: string, toolId?: string): Promise<{ toolId: string; toolName: string; projectedAdoptionRate: number }[] | null> {
    return journeyAnalyticsService.getToolAdoptionProjections(companyId, toolId);
  }

  /**
   * Get optimized resource allocation recommendations
   */
  public async getOptimizedResourceAllocation(companyId: string): Promise<{ recommendation: string; details?: any } | null> {
    return journeyAnalyticsService.getOptimizedResourceAllocation(companyId);
  }

  /**
   * Get team velocity prediction
   */
  public async getTeamVelocityPrediction(companyId: string, teamId?: string): Promise<{ predictedStepsPerWeek: number; trend: 'increasing' | 'decreasing' | 'stable' } | null> {
    return journeyAnalyticsService.getTeamVelocityPrediction(companyId, teamId);
  }

  // ==================== Dashboard Analytics ====================

  /**
   * Get dashboard analytics data based on configuration
   */
  public async getDashboardAnalytics(config: DashboardConfig, companyId?: string, dateRange?: { start: Date; end: Date }): Promise<DashboardData> {
    return dashboardAnalyticsService.getDashboardAnalytics(config, companyId, dateRange);
  }

  /**
   * Get dashboard configuration for a user
   */
  public async getDashboardConfig(ownerId: string): Promise<DashboardConfig | null> {
    return dashboardAnalyticsService.getDashboardConfig(ownerId);
  }

  /**
   * Save dashboard configuration
   */
  public async saveDashboardConfig(config: DashboardConfig): Promise<DashboardConfig | null> {
    return dashboardAnalyticsService.saveDashboardConfig(config);
  }

  // ==================== Report Management ====================

  /**
   * Get saved reports for a user/company
   */
  public async getSavedReports(ownerId: string, companyId?: string): Promise<SavedReport[] | null> {
    return dashboardAnalyticsService.getSavedReports(ownerId, companyId);
  }

  /**
   * Save or update a report
   */
  public async saveReport(report: Omit<SavedReport, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<SavedReport | null> {
    return dashboardAnalyticsService.saveReport(report);
  }

  /**
   * Delete a saved report
   */
  public async deleteReport(reportId: string, ownerId: string): Promise<boolean> {
    return dashboardAnalyticsService.deleteReport(reportId, ownerId);
  }

  // ==================== Data Export ====================

  /**
   * Export data in specified format
   */
  public async exportData(data: any[], format: ExportFormat, filename: string): Promise<void> {
    return dashboardAnalyticsService.exportData(data, format, filename);
  }

  // ==================== Recommendation Analytics ====================

  /**
   * Get journey analytics data for recommendations
   */
  public async getJourneyAnalyticsData(companyId: string): Promise<Partial<JourneyAnalyticsData>> {
    return recommendationAnalyticsService.getJourneyAnalytics(companyId);
  }

  // ==================== Data Aggregation ====================

  /**
   * Get aggregated metric data
   */
  public async getAggregatedMetric(params: AggregationParams): Promise<AggregationResult[] | null> {
    return reportingService.getAggregatedMetric(params);
  }

  /**
   * Get time series data
   */
  public async getTimeSeriesData(params: TimeSeriesParams): Promise<TimeSeriesDataPoint[] | null> {
    return reportingService.getTimeSeriesData(params);
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();