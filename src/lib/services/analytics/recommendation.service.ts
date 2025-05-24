/**
 * Recommendation Analytics Service
 * 
 * This service provides analytics data specifically for recommendation systems.
 */

import { supabase } from '@/lib/supabase';
import { loggingService } from '../logging.service';
import { JourneyAnalyticsData } from './types';

/**
 * Get analytics data about company journey progress for recommendations
 * 
 * @param companyId The company ID to analyze
 * @returns Partial analytics data for recommendations
 */
export async function getJourneyAnalytics(companyId: string): Promise<Partial<JourneyAnalyticsData>> {
  try {
    // Log analytics query if logging is available
    if (typeof loggingService?.logInfo === 'function') {
      loggingService.logInfo('Retrieving journey analytics for recommendations', {
        companyId,
        source: 'analytics/recommendation.service.ts'
      });
    }

    // Get phase completion statistics
    const { data: phaseStats, error: phaseError } = await supabase
      .rpc('get_phase_completion_stats', { p_company_id: companyId });

    if (phaseError) {
      if (typeof loggingService?.logError === 'function') {
        loggingService.logError(new Error(phaseError.message), {
          context: 'getJourneyAnalytics.getPhaseStats',
          companyId,
          dbError: phaseError,
          source: 'analytics/recommendation.service.ts'
        });
      }
      console.error("Error fetching phase completion stats:", phaseError);
    }

    // Get step completion time data
    const { data: timeStats, error: timeError } = await supabase
      .rpc('get_step_completion_time_stats', { p_company_id: companyId });

    if (timeError) {
      if (typeof loggingService?.logError === 'function') {
        loggingService.logError(new Error(timeError.message), {
          context: 'getJourneyAnalytics.getTimeStats',
          companyId,
          dbError: timeError,
          source: 'analytics/recommendation.service.ts'
        });
      }
      console.error("Error fetching step completion time stats:", timeError);
    }

    // Get comparison with similar companies
    const { data: comparisonData, error: comparisonError } = await supabase
      .rpc('get_company_progress_comparison', { p_company_id: companyId });

    if (comparisonError) {
      if (typeof loggingService?.logError === 'function') {
        loggingService.logError(new Error(comparisonError.message), {
          context: 'getJourneyAnalytics.getComparisonData',
          companyId,
          dbError: comparisonError,
          source: 'analytics/recommendation.service.ts'
        });
      }
      console.error("Error fetching company progress comparison:", comparisonError);
    }

    // Return potentially partial data if some RPC calls failed but others succeeded
    return {
      phaseStatistics: phaseStats || null,
      completionTimeStatistics: timeStats || null,
      industryComparison: comparisonData || null
    };
  } catch (error) {
    // Log unexpected errors
    if (typeof loggingService?.logError === 'function') {
      loggingService.logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'getJourneyAnalytics',
        companyId,
        source: 'analytics/recommendation.service.ts'
      });
    }
    console.error('Unexpected error getting journey analytics for recommendations:', error);
    return {};
  }
}