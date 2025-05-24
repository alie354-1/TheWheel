/**
 * Journey Analytics Service
 * 
 * This service provides analytics functionality specific to the journey system.
 * It tracks, analyzes, and retrieves analytics data related to journey steps, phases,
 * and overall journey progress.
 */

import { supabase } from '@/lib/supabase';
import { loggingService } from '../logging.service';
import {
  JourneyAnalytics,
  AnalyticsFilter,
  AnalyticsMetric,
  EntityType,
  MetricType,
  AggregationOptions,
  ProgressStats,
  TeamAssignmentStats
} from './types';

/**
 * Track an analytics metric for a journey entity
 * 
 * @param analytics The analytics data to track
 */
export async function trackMetric(analytics: JourneyAnalytics): Promise<void> {
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
      if (typeof loggingService?.logError === 'function') {
        loggingService.logError(new Error(error.message), {
          context: 'trackMetric',
          analytics,
          dbError: error,
          source: 'analytics/journeyAnalytics.service.ts'
        });
      }
      console.error('Error tracking journey analytics metric:', error);
    }
  } catch (error) {
    if (typeof loggingService?.logError === 'function') {
      loggingService.logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'trackMetric',
        analytics,
        source: 'analytics/journeyAnalytics.service.ts'
      });
    }
    console.error('Failed to track journey analytics:', error);
  }
}

/**
 * Track time spent on a journey entity
 * 
 * @param companyId The company ID
 * @param entityType The type of entity (journey, phase, step, challenge)
 * @param entityId The ID of the entity
 * @param timeInSeconds The time spent in seconds
 * @param userId Optional user ID
 */
export async function trackTimeSpent(
  companyId: string,
  entityType: EntityType,
  entityId: string,
  timeInSeconds: number,
  userId?: string
): Promise<void> {
  await trackMetric({
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
 * Track a view of a journey entity
 * 
 * @param companyId The company ID
 * @param entityType The type of entity (journey, phase, step, challenge)
 * @param entityId The ID of the entity
 * @param userId Optional user ID
 */
export async function trackView(
  companyId: string,
  entityType: EntityType,
  entityId: string,
  userId?: string
): Promise<void> {
  await trackMetric({
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
 * Track a user rating for a journey entity
 * 
 * @param companyId The company ID
 * @param entityType The type of entity (journey, phase, step, challenge)
 * @param entityId The ID of the entity
 * @param rating The rating value
 * @param userId Optional user ID
 */
export async function trackRating(
  companyId: string,
  entityType: EntityType,
  entityId: string,
  rating: number,
  userId?: string
): Promise<void> {
  await trackMetric({
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
 * Get analytics data with optional filtering
 * 
 * @param companyId The company ID
 * @param filter Optional filter parameters
 * @returns Array of journey analytics data
 */
export async function getAnalytics(
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
      if (typeof loggingService?.logError === 'function') {
        loggingService.logError(new Error(error.message), {
          context: 'getAnalytics',
          companyId,
          filter,
          dbError: error,
          source: 'analytics/journeyAnalytics.service.ts'
        });
      }
      console.error('Error fetching journey analytics:', error);
      throw error;
    }

    // Ensure data mapping handles potential nulls and correct types
    return (data || []).map((item: any) => ({
      companyId: item.company_id,
      userId: item.user_id,
      entityType: item.entity_type as EntityType,
      entityId: item.entity_id,
      metricType: item.metric_type as MetricType,
      // Ensure metricValue is parsed correctly if stored as JSONB
      metricValue: (typeof item.metric_value === 'string' ? JSON.parse(item.metric_value) : item.metric_value) as AnalyticsMetric,
    }));
  } catch (error) {
    if (typeof loggingService?.logError === 'function') {
      loggingService.logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'getAnalytics',
        companyId,
        filter,
        source: 'analytics/journeyAnalytics.service.ts'
      });
    }
    console.error('Failed to get journey analytics:', error);
    throw error;
  }
}

/**
 * Get aggregated analytics data (client-side aggregation)
 * 
 * @param companyId The company ID
 * @param options Aggregation options (period, etc.)
 * @param filter Optional filter parameters
 * @returns Aggregated analytics data
 */
export async function getAggregation(
  companyId: string,
  options: AggregationOptions = {},
  filter: AnalyticsFilter = {}
): Promise<any> {
  try {
    // Fetch raw data
    const analyticsData = await getAnalytics(companyId, filter);
    if (!analyticsData) return {};

    const result: Record<string, any> = {};
    const groupedByMetric: Record<string, JourneyAnalytics[]> = {};

    analyticsData.forEach(item => {
      if (!groupedByMetric[item.metricType]) {
        groupedByMetric[item.metricType] = [];
      }
      groupedByMetric[item.metricType].push(item);
    });
    
    Object.entries(groupedByMetric).forEach(([metricType, items]) => {
      const count = items.length;
      if (count === 0) return;

      const numericValues = items
        .map(item => item.metricValue?.value)
        .filter((value): value is number => typeof value === 'number');

      switch (metricType) {
        case 'view_count':
          result.totalViews = numericValues.reduce((sum, value) => sum + value, 0);
          break;
        case 'time_spent':
          const totalTime = numericValues.reduce((sum, value) => sum + value, 0);
          result.totalTimeSpent = totalTime;
          result.averageTimeSpent = numericValues.length > 0 ? totalTime / numericValues.length : 0;
          break;
        case 'user_rating':
          const totalRating = numericValues.reduce((sum, value) => sum + value, 0);
          result.averageRating = numericValues.length > 0 ? totalRating / numericValues.length : 0;
          result.ratingCount = numericValues.length;
          break;
        case 'feedback_count':
           result.feedbackCount = count;
           break;
        default:
          // Generic handling for other potential numeric metrics
          result[`${metricType}_count`] = count;
          if (numericValues.length > 0) {
            const sum = numericValues.reduce((s, v) => s + v, 0);
            result[`${metricType}_sum`] = sum;
            result[`${metricType}_average`] = sum / numericValues.length;
          }
      }
    });
    
    return result;
  } catch (error) {
    if (typeof loggingService?.logError === 'function') {
      loggingService.logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'getAggregation',
        companyId,
        options,
        filter,
        source: 'analytics/journeyAnalytics.service.ts'
      });
    }
    console.error('Failed to get aggregated analytics:', error);
    throw error;
  }
}

/**
 * Get journey progress statistics using RPC
 * 
 * @param companyId The company ID
 * @param journeyId Optional journey ID filter
 * @param startDate Optional start date filter
 * @param endDate Optional end date filter
 * @returns Journey progress statistics or null
 */
export async function getProgressStats(
  companyId: string,
  journeyId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<ProgressStats | null> {
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
      if (typeof loggingService?.logError === 'function') {
        loggingService.logError(new Error(error.message), {
          context: 'getProgressStats',
          companyId,
          journeyId,
          dbError: error,
          source: 'analytics/journeyAnalytics.service.ts'
        });
      }
      console.error('Error fetching journey progress stats via RPC:', error);
      return null;
    }

    return data as ProgressStats;
  } catch (error) {
    if (typeof loggingService?.logError === 'function') {
      loggingService.logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'getProgressStats',
        companyId,
        journeyId,
        source: 'analytics/journeyAnalytics.service.ts'
      });
    }
    console.error('Failed to get journey progress stats:', error);
    return null;
  }
}

/**
 * Get team assignments statistics using RPC
 * 
 * @param companyId The company ID
 * @param userId Optional user ID filter
 * @returns Team assignment statistics or null
 */
export async function getTeamAssignmentStats(
  companyId: string,
  userId?: string
): Promise<TeamAssignmentStats | null> {
  try {
    const { data, error } = await supabase.rpc(
      'get_team_assignments_stats',
      {
        p_company_id: companyId,
        p_user_id: userId,
      }
    );

    if (error) {
      if (typeof loggingService?.logError === 'function') {
        loggingService.logError(new Error(error.message), {
          context: 'getTeamAssignmentStats',
          companyId,
          userId,
          dbError: error,
          source: 'analytics/journeyAnalytics.service.ts'
        });
      }
      console.error('Error fetching team assignment stats via RPC:', error);
      return null;
    }

    return data as TeamAssignmentStats;
  } catch (error) {
    if (typeof loggingService?.logError === 'function') {
      loggingService.logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'getTeamAssignmentStats',
        companyId,
        userId,
        source: 'analytics/journeyAnalytics.service.ts'
      });
    }
    console.error('Failed to get team assignment stats:', error);
    return null;
  }
}

/**
 * Get analytics for comparing journey progress with industry benchmarks
 * 
 * @param companyId The company ID
 * @returns Comparison analytics data or null
 */
export async function getComparisonAnalytics(companyId: string): Promise<any | null> {
  try {
    const progressStats = await getProgressStats(companyId);
    if (!progressStats) {
       console.warn('Could not fetch progress stats for comparison analytics.');
       return null;
    }
    
    // TODO: Fetch actual benchmark data instead of using hardcoded values.
    // This might involve another RPC call or querying a dedicated benchmarks table.
    const benchmarkData = {
      industry: {
        completionPercentage: 68.5, 
        averageTimeToCompletion: 45, 
        averageStepsCompleted: 24,
      },
      similarCompanies: {
        completionPercentage: 72.3,
        averageTimeToCompletion: 42, 
        averageStepsCompleted: 26,
      },
    };

    const completionDiffIndustry = progressStats.completionPercentage - benchmarkData.industry.completionPercentage;
    const completionDiffSimilar = progressStats.completionPercentage - benchmarkData.similarCompanies.completionPercentage;

    let recommendation = 'Your journey completion is on track with industry standards. Keep up the good work!';
    if (completionDiffIndustry < -10) { // Significantly below industry
       recommendation = 'Your journey completion is significantly below the industry average. Consider focusing on key steps or seeking guidance.';
    } else if (completionDiffIndustry < 0) { // Slightly below industry
       recommendation = 'Your journey completion is slightly below the industry average. Focus on completing upcoming steps to catch up.';
    } else if (completionDiffSimilar > 10) { // Significantly ahead of similar companies
       recommendation = 'You are progressing significantly faster than similar companies. Excellent work!';
    }
    
    return {
      current: {
        completionPercentage: progressStats.completionPercentage,
        stepsCompleted: progressStats.completedSteps,
        totalSteps: progressStats.totalSteps,
      },
      industry: benchmarkData.industry,
      similarCompanies: benchmarkData.similarCompanies,
      comparisonResults: {
        completionPercentageDiffIndustry: parseFloat(completionDiffIndustry.toFixed(1)),
        completionPercentageDiffSimilar: parseFloat(completionDiffSimilar.toFixed(1)),
        isAheadOfIndustry: completionDiffIndustry > 0,
        isAheadOfSimilarCompanies: completionDiffSimilar > 0,
        recommendation: recommendation
      }
    };
  } catch (error) {
    if (typeof loggingService?.logError === 'function') {
      loggingService.logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'getComparisonAnalytics',
        companyId,
        source: 'analytics/journeyAnalytics.service.ts'
      });
    }
    console.error('Failed to get comparison analytics:', error);
    return null;
  }
}

// --- Placeholder Predictive Functions ---

/**
 * Placeholder for fetching journey completion forecast
 * 
 * @param companyId The company ID
 * @returns Forecast data or null
 */
export async function getJourneyCompletionForecast(companyId: string): Promise<{ estimatedWeeks: number; confidence: number } | null> {
  console.warn('getJourneyCompletionForecast: Placeholder implementation. Returning mock data.');
  try {
    const progress = await getProgressStats(companyId);
    if (!progress) return null;
    
    // Simple placeholder: Fewer weeks if already further along. Randomness added.
    const baseWeeks = 12; // Base estimate for a full journey
    const progressFactor = 1 - (progress.completionPercentage / 100); // Factor remaining progress
    const estimatedWeeks = Math.max(1, Math.round(baseWeeks * progressFactor + (Math.random() - 0.5) * 4)); // Add some variance
    const confidence = 0.5 + Math.random() * 0.3; // Placeholder confidence

    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    return { estimatedWeeks, confidence: parseFloat(confidence.toFixed(2)) };
  } catch (error) {
    console.error("Error in placeholder getJourneyCompletionForecast:", error);
    return null;
  }
}

/**
 * Placeholder for predicting potential journey bottlenecks
 * 
 * @param companyId The company ID
 * @returns Bottleneck predictions or null
 */
export async function predictBottlenecks(companyId: string): Promise<{ stepId: string; stepName: string; predictedDelayFactor: number }[] | null> {
  console.warn('predictBottlenecks: Placeholder implementation. Returning mock data.');
  try {
    // Simulate fetching common bottlenecks - In reality, query analytics or a precomputed table
    await new Promise(resolve => setTimeout(resolve, 400)); // Simulate delay
    const commonBottlenecks = [
      { stepId: 'step-market-validation', stepName: 'Market Validation', predictedDelayFactor: 1.3 + (Math.random() * 0.4 - 0.2) }, // Add variance
      { stepId: 'step-initial-funding', stepName: 'Initial Funding Round', predictedDelayFactor: 1.2 + (Math.random() * 0.4 - 0.2) },
      // Add more potential bottlenecks based on analysis
    ];
    // Return top 2 predicted bottlenecks
    return commonBottlenecks.sort((a,b) => b.predictedDelayFactor - a.predictedDelayFactor).slice(0, 2);
  } catch (error) {
    console.error("Error in placeholder predictBottlenecks:", error);
    return null;
  }
}

/**
 * Placeholder for projecting tool adoption rates
 * 
 * @param companyId The company ID
 * @param toolId Optional tool ID filter
 * @returns Tool adoption projections or null
 */
export async function getToolAdoptionProjections(companyId: string, toolId?: string): Promise<{ toolId: string; toolName: string; projectedAdoptionRate: number }[] | null> {
  console.warn('getToolAdoptionProjections: Placeholder implementation. Returning mock data.');
  try {
    await new Promise(resolve => setTimeout(resolve, 250)); // Simulate delay
    // Simulate fetching projections for a couple of tools
    const projections = [
      { toolId: 'tool-xyz', toolName: 'Tool XYZ', projectedAdoptionRate: 0.55 + (Math.random() * 0.2 - 0.1) },
      { toolId: 'tool-abc', toolName: 'Tool ABC', projectedAdoptionRate: 0.30 + (Math.random() * 0.2 - 0.1) },
    ];
    // Filter by toolId if provided
    const result = toolId ? projections.filter(p => p.toolId === toolId) : projections;
    return result.map(p => ({ ...p, projectedAdoptionRate: parseFloat(p.projectedAdoptionRate.toFixed(2)) }));
  } catch (error) {
    console.error("Error in placeholder getToolAdoptionProjections:", error);
    return null;
  }
}

/**
 * Placeholder for suggesting optimized resource allocation
 * 
 * @param companyId The company ID
 * @returns Resource allocation recommendations or null
 */
export async function getOptimizedResourceAllocation(companyId: string): Promise<{ recommendation: string; details?: any } | null> {
  console.warn('getOptimizedResourceAllocation: Placeholder implementation. Returning mock data.');
  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    // Simulate a simple recommendation based on a random bottleneck
    const bottlenecks = await predictBottlenecks(companyId);
    const bottleneckFocus = bottlenecks && bottlenecks.length > 0 ? bottlenecks[0].stepName : 'MVP Development';
    
    return {
      recommendation: `Consider allocating more resources (e.g., engineering, marketing) towards the '${bottleneckFocus}' step to accelerate progress.`,
      details: { focusStep: bottleneckFocus, suggestion: 'Increase resource allocation' }
    };
  } catch (error) {
    console.error("Error in placeholder getOptimizedResourceAllocation:", error);
    return null;
  }
}

/**
 * Placeholder for predicting team velocity
 * 
 * @param companyId The company ID
 * @param teamId Optional team ID filter
 * @returns Team velocity prediction or null
 */
export async function getTeamVelocityPrediction(companyId: string, teamId?: string): Promise<{ predictedStepsPerWeek: number; trend: 'increasing' | 'decreasing' | 'stable' } | null> {
  console.warn('getTeamVelocityPrediction: Placeholder implementation. Returning mock data.');
  try {
    await new Promise(resolve => setTimeout(resolve, 350)); // Simulate delay
    // Simulate based on recent activity (e.g., count completed steps in last week)
    const randomTrend = ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as 'increasing' | 'decreasing' | 'stable';
    return { predictedStepsPerWeek: parseFloat((1.5 + Math.random() * 2).toFixed(1)), trend: randomTrend };
  } catch (error) {
    console.error("Error in placeholder getTeamVelocityPrediction:", error);
    return null;
  }
}