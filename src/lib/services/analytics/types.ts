/**
 * Analytics Types - Shared type definitions for the analytics system
 */

import { User } from '@supabase/supabase-js';

// Common analytics event types
export interface AnalyticsEvent {
  id: string;
  event_name: string;
  user_id: string | null;
  company_id: string | null;
  payload: any;
  created_at: string;
}

export interface AnalyticsAggregate {
  id: string;
  metric_name: string;
  dimensions: any;
  value: any;
  calculated_at: string;
  time_period_start: string | null;
  time_period_end: string | null;
}

export interface AnalyticsReport {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  company_id: string | null;
  configuration: any;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  company_id: string | null;
  layout: any;
  created_at: string;
  updated_at: string;
}

// Journey analytics specific types
export type MetricType = 
  | 'time_spent' 
  | 'view_count' 
  | 'completion_rate' 
  | 'difficulty_rating'
  | 'user_rating'
  | 'feedback_count';

export type EntityType = 'challenge' | 'phase' | 'journey' | 'step';

export interface AnalyticsMetric {
  value: number;
  unit?: string;
  metadata?: Record<string, any>;
}

export interface JourneyAnalytics {
  companyId: string;
  userId?: string;
  entityType: EntityType;
  entityId: string;
  metricType: MetricType;
  metricValue: AnalyticsMetric;
}

export interface AnalyticsFilter {
  startDate?: Date;
  endDate?: Date;
  entityType?: EntityType;
  entityId?: string;
  metricTypes?: MetricType[];
  userId?: string;
}

export interface AggregationOptions {
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all';
  key?: string; // Unique key for caching/identifying the aggregation
  type?: string; // Type of aggregation (e.g., 'standard', 'comparison')
}

export interface ProgressStats {
  totalSteps: number;
  completedSteps: number;
  inProgressSteps: number;
  notStartedSteps: number;
  blockedSteps: number;
  completionPercentage: number;
  phases: Array<{
    phaseId: string;
    phaseName: string;
    totalSteps: number;
    completedSteps: number;
    completionPercentage: number;
  }>;
}

export interface TeamAssignmentStats {
  totalAssignments: number;
  pendingAssignments: number;
  inProgressAssignments: number;
  completedAssignments: number;
  blockedAssignments: number;
  users: Array<{
    userId: string;
    userName: string;
    totalAssignments: number;
    completedAssignments: number;
    completionPercentage: number;
  }>;
}

// Dashboard analytics types
export interface PredictiveInsight {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  description: string;
  type: 'forecast' | 'bottleneck' | 'projection' | 'optimization';
}

export interface ReportingData {
  timeSeries?: {
    labels: string[];
    datasets: { label: string; data: number[] }[];
  };
  tableData?: { columns: string[]; rows: any[][] };
  scorecard?: { metric: string; value: number | string; change?: number };
}

export interface DashboardWidgetConfig {
  id: string;
  type: 'predictiveInsight' | 'timeSeriesChart' | 'reportTable' | 'scorecard';
  settings: Record<string, any>;
  position: { x: number; y: number; w: number; h: number };
}

export interface DashboardConfig {
  id: string;
  name: string;
  widgets: DashboardWidgetConfig[];
  created_at?: string;
  updated_at?: string;
}

export interface SavedReport {
  id: string;
  name: string;
  description?: string;
  configuration: Record<string, any>;
  owner_id: string;
  company_id?: string;
  created_at?: string;
  updated_at?: string;
}

export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface DashboardData {
  predictiveInsights: PredictiveInsight[];
  reportingData: ReportingData;
}

// Data aggregation parameters
export interface AggregationParams {
  metric: string;
  event_name?: string;
  group_by?: string[];
  filters?: Record<string, any>;
  start_date?: string;
  end_date?: string;
  target_field?: string;
}

export interface AggregationResult {
  groups?: Record<string, any>;
  value: number;
}

export interface TimeSeriesParams {
  metric: string;
  event_name?: string;
  interval: 'minute' | 'hour' | 'day' | 'week' | 'month';
  filters?: Record<string, any>;
  start_date: string;
  end_date: string;
}

export interface TimeSeriesDataPoint {
  time_bucket: string;
  value: number;
};

// Recommendation analytics types
export interface JourneyAnalyticsData {
  phaseStatistics: any[] | null;
  completionTimeStatistics: any[] | null;
  industryComparison: any[] | null;
}

// Analytics service interface
export interface IAnalyticsService {
  // Core event tracking
  trackEvent(event_name: string, userId: string | null, companyId: string | null, payload: any): Promise<void>;
  
  // Journey-specific tracking
  trackMetric(analytics: JourneyAnalytics): Promise<void>;
  trackTimeSpent(companyId: string, entityType: EntityType, entityId: string, timeInSeconds: number, userId?: string): Promise<void>;
  trackView(companyId: string, entityType: EntityType, entityId: string, userId?: string): Promise<void>;
  trackRating(companyId: string, entityType: EntityType, entityId: string, rating: number, userId?: string): Promise<void>;
  
  // Analytics retrieval
  getAnalytics(companyId: string, filter?: AnalyticsFilter): Promise<JourneyAnalytics[]>;
  getAggregation(companyId: string, options?: AggregationOptions, filter?: AnalyticsFilter): Promise<any>;
  getProgressStats(companyId: string, journeyId?: string, startDate?: Date, endDate?: Date): Promise<ProgressStats | null>;
  getTeamAssignmentStats(companyId: string, userId?: string): Promise<TeamAssignmentStats | null>;
  getComparisonAnalytics(companyId: string): Promise<any | null>;
  
  // Predictive analytics
  getJourneyCompletionForecast(companyId: string): Promise<{ estimatedWeeks: number; confidence: number } | null>;
  predictBottlenecks(companyId: string): Promise<{ stepId: string; stepName: string; predictedDelayFactor: number }[] | null>;
  getToolAdoptionProjections(companyId: string, toolId?: string): Promise<{ toolId: string; toolName: string; projectedAdoptionRate: number }[] | null>;
  getOptimizedResourceAllocation(companyId: string): Promise<{ recommendation: string; details?: any } | null>;
  getTeamVelocityPrediction(companyId: string, teamId?: string): Promise<{ predictedStepsPerWeek: number; trend: 'increasing' | 'decreasing' | 'stable' } | null>;
  
  // Dashboard analytics
  getDashboardAnalytics(config: DashboardConfig, companyId?: string, dateRange?: { start: Date; end: Date }): Promise<DashboardData>;
  getDashboardConfig(ownerId: string): Promise<DashboardConfig | null>;
  saveDashboardConfig(config: DashboardConfig): Promise<DashboardConfig | null>;
  
  // Report management
  getSavedReports(ownerId: string, companyId?: string): Promise<SavedReport[] | null>;
  saveReport(report: Omit<SavedReport, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<SavedReport | null>;
  deleteReport(reportId: string, ownerId: string): Promise<boolean>;
  
  // Data export
  exportData(data: any[], format: ExportFormat, filename: string): Promise<void>;
  
  // Recommendation analytics
  getJourneyAnalyticsData(companyId: string): Promise<Partial<JourneyAnalyticsData>>;
  
  // Data aggregation
  getAggregatedMetric(params: AggregationParams): Promise<AggregationResult[] | null>;
  getTimeSeriesData(params: TimeSeriesParams): Promise<TimeSeriesDataPoint[] | null>;
}