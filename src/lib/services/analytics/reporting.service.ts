/**
 * Reporting Service - Handles data aggregation and metrics reporting
 * 
 * This service is responsible for retrieving and aggregating analytics data 
 * for reporting purposes.
 */

import { supabase } from '@/lib/supabase';
import { loggingService } from '../logging.service';
import { AggregationParams, AggregationResult, TimeSeriesParams, TimeSeriesDataPoint } from './types';

/**
 * Get aggregated metric data based on specified parameters
 * 
 * @param params Aggregation parameters including metric, filters, and grouping
 * @returns Aggregated results or null on error
 */
export async function getAggregatedMetric(params: AggregationParams): Promise<AggregationResult[] | null> {
  try {
    // Log analytics query if logging is available
    if (typeof loggingService?.logInfo === 'function') {
      loggingService.logInfo('Retrieving aggregated metrics', {
        metric: params.metric,
        event_name: params.event_name,
        group_by: params.group_by,
        source: 'analytics/reporting.service.ts'
      });
    }

    // RPC call to database function for complex aggregation
    const { data, error } = await supabase.rpc('get_aggregated_metrics', {
      p_metric: params.metric,
      p_event_name: params.event_name,
      p_group_by: params.group_by,
      p_filters: params.filters,
      p_start_date: params.start_date,
      p_end_date: params.end_date,
      p_target_field: params.target_field
    });

    if (error) {
      if (typeof loggingService?.logError === 'function') {
        loggingService.logError(new Error(error.message), {
          context: 'getAggregatedMetric',
          params,
          dbError: error,
          source: 'analytics/reporting.service.ts'
        });
      }
      console.error('Error retrieving aggregated metrics:', error);
      return null;
    }

    // Transform the data to match the expected return type
    // This assumes the database function returns data in a compatible format
    return data as AggregationResult[];
  } catch (error) {
    if (typeof loggingService?.logError === 'function') {
      loggingService.logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'getAggregatedMetric',
        params,
        source: 'analytics/reporting.service.ts'
      });
    }
    console.error('Failed to retrieve aggregated metrics:', error);
    return null;
  }
}

/**
 * Get time series data for a metric over a specified time range
 * 
 * @param params Time series parameters including metric, interval, and date range
 * @returns Time series data points or null on error
 */
export async function getTimeSeriesData(params: TimeSeriesParams): Promise<TimeSeriesDataPoint[] | null> {
  try {
    // Log analytics query if logging is available
    if (typeof loggingService?.logInfo === 'function') {
      loggingService.logInfo('Retrieving time series data', {
        metric: params.metric,
        event_name: params.event_name,
        interval: params.interval,
        source: 'analytics/reporting.service.ts'
      });
    }

    // RPC call to database function for time series data
    const { data, error } = await supabase.rpc('get_time_series_data', {
      p_metric: params.metric,
      p_event_name: params.event_name,
      p_interval: params.interval,
      p_filters: params.filters,
      p_start_date: params.start_date,
      p_end_date: params.end_date
    });

    if (error) {
      if (typeof loggingService?.logError === 'function') {
        loggingService.logError(new Error(error.message), {
          context: 'getTimeSeriesData',
          params,
          dbError: error,
          source: 'analytics/reporting.service.ts'
        });
      }
      console.error('Error retrieving time series data:', error);
      return null;
    }

    // Transform the data to match the expected return type
    return data as TimeSeriesDataPoint[];
  } catch (error) {
    if (typeof loggingService?.logError === 'function') {
      loggingService.logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'getTimeSeriesData',
        params,
        source: 'analytics/reporting.service.ts'
      });
    }
    console.error('Failed to retrieve time series data:', error);
    return null;
  }
}