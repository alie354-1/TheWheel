import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export type MetricType = 
  | 'time_spent' 
  | 'view_count' 
  | 'completion_rate' 
  | 'difficulty_rating'
  | 'user_rating'
  | 'feedback_count';

export type EntityType = 'challenge' | 'phase' | 'journey';

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
  key?: string;
  type?: string;
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

/**
 * JourneyAnalyticsService
 * 
 * Service for tracking, analyzing, and retrieving analytics data related
 * to journey steps, phases, and overall journey progress.
 * Part of the Sprint 5 Advanced Journey Analytics feature.
 */
export class JourneyAnalyticsService {
  /**
   * Track an analytics metric for a journey entity.
   */
  static async trackMetric(analytics: JourneyAnalytics): Promise<void> {
    try {
      const { error } = await supabase
        .from('journey_analytics')
        .insert({
          company_id: analytics.companyId,
          user_id: analytics.userId,
          entity_type: analytics.entityType,
          entity_id: analytics.entityId,
          metric_type: analytics.metricType,
          metric_value: analytics.metricValue,
        });

      if (error) {
        console.error('Error tracking journey analytics metric:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to track journey analytics:', error);
      throw error;
    }
  }

  /**
   * Track time spent on a journey entity.
   */
  static async trackTimeSpent(
    companyId: string,
    entityType: EntityType,
    entityId: string,
    timeInSeconds: number,
    userId?: string
  ): Promise<void> {
    await this.trackMetric({
      companyId,
      userId,
      entityType,
      entityId,
      metricType: 'time_spent',
      metricValue: {
        value: timeInSeconds,
        unit: 'seconds',
      },
    });
  }

  /**
   * Track a view of a journey entity.
   */
  static async trackView(
    companyId: string,
    entityType: EntityType,
    entityId: string,
    userId?: string
  ): Promise<void> {
    await this.trackMetric({
      companyId,
      userId,
      entityType,
      entityId,
      metricType: 'view_count',
      metricValue: {
        value: 1,
      },
    });
  }

  /**
   * Track a user rating for a journey entity.
   */
  static async trackRating(
    companyId: string,
    entityType: EntityType,
    entityId: string,
    rating: number,
    userId?: string
  ): Promise<void> {
    await this.trackMetric({
      companyId,
      userId,
      entityType,
      entityId,
      metricType: 'user_rating',
      metricValue: {
        value: rating,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  /**
   * Get analytics data with optional filtering.
   */
  static async getAnalytics(
    companyId: string,
    filter: AnalyticsFilter = {}
  ): Promise<JourneyAnalytics[]> {
    try {
      let query = supabase
        .from('journey_analytics')
        .select('*')
        .eq('company_id', companyId);

      if (filter.entityType) {
        query = query.eq('entity_type', filter.entityType);
      }

      if (filter.entityId) {
        query = query.eq('entity_id', filter.entityId);
      }

      if (filter.metricTypes && filter.metricTypes.length > 0) {
        query = query.in('metric_type', filter.metricTypes);
      }

      if (filter.userId) {
        query = query.eq('user_id', filter.userId);
      }

      if (filter.startDate) {
        query = query.gte('created_at', filter.startDate.toISOString());
      }

      if (filter.endDate) {
        query = query.lte('created_at', filter.endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching journey analytics:', error);
        throw error;
      }

      return data.map((item) => ({
        companyId: item.company_id,
        userId: item.user_id,
        entityType: item.entity_type as EntityType,
        entityId: item.entity_id,
        metricType: item.metric_type as MetricType,
        metricValue: item.metric_value as AnalyticsMetric,
      }));
    } catch (error) {
      console.error('Failed to get journey analytics:', error);
      throw error;
    }
  }

  /**
   * Get aggregated analytics data.
   */
  static async getAggregation(
    companyId: string,
    options: AggregationOptions = {},
    filter: AnalyticsFilter = {}
  ): Promise<any> {
    try {
      // First check if we have a cached aggregation
      const aggregationKey = options.key || `${filter.entityType || 'all'}_${filter.entityId || 'all'}`;
      const aggregationType = options.type || 'standard';
      
      const { data: existingAggregation, error: aggregationError } = await supabase
        .from('journey_analytics_aggregations')
        .select('*')
        .eq('company_id', companyId)
        .eq('aggregation_key', aggregationKey)
        .eq('aggregation_type', aggregationType)
        .eq('aggregation_period', options.period || 'all')
        .maybeSingle();

      if (aggregationError) {
        console.error('Error fetching aggregation:', aggregationError);
      } else if (existingAggregation && 
                !filter.startDate && 
                !filter.endDate && 
                new Date(existingAggregation.updated_at).getTime() > Date.now() - 24 * 60 * 60 * 1000) {
        // Use cached aggregation if it's less than 24 hours old and no date filters
        return existingAggregation.aggregation_data;
      }
      
      // If no valid cached aggregation, fetch raw data and aggregate it
      const analyticsData = await this.getAnalytics(companyId, filter);
      
      // Perform aggregation based on metric type
      const result: Record<string, any> = {};
      
      // Group by metric type
      const groupedByMetric: Record<string, JourneyAnalytics[]> = {};
      analyticsData.forEach(item => {
        if (!groupedByMetric[item.metricType]) {
          groupedByMetric[item.metricType] = [];
        }
        groupedByMetric[item.metricType].push(item);
      });
      
      // Calculate aggregations for each metric type
      Object.entries(groupedByMetric).forEach(([metricType, items]) => {
        switch (metricType) {
          case 'view_count':
            result.totalViews = items.reduce((sum, item) => sum + item.metricValue.value, 0);
            break;
          case 'time_spent':
            result.totalTimeSpent = items.reduce((sum, item) => sum + item.metricValue.value, 0);
            result.averageTimeSpent = result.totalTimeSpent / items.length;
            break;
          case 'user_rating':
            result.averageRating = items.reduce((sum, item) => sum + item.metricValue.value, 0) / items.length;
            result.ratingCount = items.length;
            break;
          default:
            result[`${metricType}Count`] = items.length;
            if (items.length > 0 && typeof items[0].metricValue.value === 'number') {
              result[`${metricType}Average`] = items.reduce((sum, item) => sum + item.metricValue.value, 0) / items.length;
            }
        }
      });

      // Store aggregation for future use
      if (!filter.startDate && !filter.endDate) {
        const { error: insertError } = await supabase
          .from('journey_analytics_aggregations')
          .upsert({
            company_id: companyId,
            aggregation_key: aggregationKey,
            aggregation_type: aggregationType,
            aggregation_period: options.period || 'all',
            aggregation_data: result,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'company_id,aggregation_key,aggregation_type,aggregation_period,start_date,end_date'
          });

        if (insertError) {
          console.error('Error storing aggregation:', insertError);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Failed to get aggregated analytics:', error);
      throw error;
    }
  }

  /**
   * Get journey progress statistics.
   */
  static async getProgressStats(
    companyId: string,
    journeyId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ProgressStats> {
    try {
      const { data, error } = await supabase.rpc(
        'get_journey_progress_stats',
        {
          p_company_id: companyId,
          p_journey_id: journeyId,
          p_start_date: startDate?.toISOString(),
          p_end_date: endDate?.toISOString(),
        }
      );

      if (error) {
        console.error('Error fetching journey progress stats:', error);
        throw error;
      }

      return data as ProgressStats;
    } catch (error) {
      console.error('Failed to get journey progress stats:', error);
      throw error;
    }
  }

  /**
   * Get team assignments statistics.
   */
  static async getTeamAssignmentStats(
    companyId: string,
    userId?: string
  ): Promise<TeamAssignmentStats> {
    try {
      const { data, error } = await supabase.rpc(
        'get_team_assignments_stats',
        {
          p_company_id: companyId,
          p_user_id: userId,
        }
      );

      if (error) {
        console.error('Error fetching team assignment stats:', error);
        throw error;
      }

      return data as TeamAssignmentStats;
    } catch (error) {
      console.error('Failed to get team assignment stats:', error);
      throw error;
    }
  }

  /**
   * Get analytics for comparing journey progress with industry benchmarks or similar companies.
   * This is a simplified version that could be expanded with actual benchmark data.
   */
  static async getComparisonAnalytics(companyId: string): Promise<any> {
    // This would typically fetch benchmark data from an external source or internal database
    // For now, we'll return a placeholder with some realistic looking data
    const progressStats = await this.getProgressStats(companyId);
    
    return {
      current: {
        completionPercentage: progressStats.completionPercentage,
        stepsCompleted: progressStats.completedSteps,
        totalSteps: progressStats.totalSteps,
      },
      industry: {
        completionPercentage: 68.5, // Example industry average
        averageTimeToCompletion: 45, // days
        averageStepsCompleted: 24,
      },
      similarCompanies: {
        completionPercentage: 72.3,
        averageTimeToCompletion: 42, // days
        averageStepsCompleted: 26,
      },
      comparisonResults: {
        completionPercentageDiff: progressStats.completionPercentage - 68.5,
        isAheadOfIndustry: progressStats.completionPercentage > 68.5,
        isAheadOfSimilarCompanies: progressStats.completionPercentage > 72.3,
        recommendation: progressStats.completionPercentage < 68.5 
          ? 'Your journey completion is below industry average. Consider focusing on completing key steps to improve progress.'
          : 'Your journey completion is on track with industry standards. Keep up the good work!'
      }
    };
  }
}

export default JourneyAnalyticsService;
