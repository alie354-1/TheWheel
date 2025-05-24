import { supabase } from '@/lib/supabase';

// Define types for the RPC responses if they are not already defined globally
// Placeholder types:
interface PhaseCompletionStats { /* ... properties ... */ }
interface StepCompletionTimeStats { /* ... properties ... */ }
interface CompanyProgressComparison { /* ... properties ... */ }

interface JourneyAnalyticsData {
  phaseStatistics: PhaseCompletionStats[] | null;
  completionTimeStatistics: StepCompletionTimeStats[] | null;
  industryComparison: CompanyProgressComparison[] | null;
}

export class AnalyticsRecommendationService {
  /**
   * Get analytics data about company journey progress
   */
  public static async getJourneyAnalytics(companyId: string): Promise<Partial<JourneyAnalyticsData>> {
    try {
      // Get phase completion statistics
      const { data: phaseStats, error: phaseError } = await supabase
        .rpc('get_phase_completion_stats', { p_company_id: companyId });

      if (phaseError) {
         console.error("Error fetching phase completion stats:", phaseError);
         // Decide if this error should halt execution or just return partial data
         // throw phaseError; // Option 1: Halt
      }

      // Get step completion time data
      const { data: timeStats, error: timeError } = await supabase
        .rpc('get_step_completion_time_stats', { p_company_id: companyId });

       if (timeError) {
         console.error("Error fetching step completion time stats:", timeError);
         // Decide if this error should halt execution or just return partial data
         // throw timeError; // Option 1: Halt
      }

      // Get comparison with similar companies
      const { data: comparisonData, error: comparisonError } = await supabase
        .rpc('get_company_progress_comparison', { p_company_id: companyId });

       if (comparisonError) {
         console.error("Error fetching company progress comparison:", comparisonError);
         // Decide if this error should halt execution or just return partial data
         // throw comparisonError; // Option 1: Halt
      }

      // Return potentially partial data if some RPC calls failed but others succeeded
      return {
        phaseStatistics: phaseStats || null,
        completionTimeStatistics: timeStats || null,
        industryComparison: comparisonData || null
      };
    } catch (error) {
      // Catch any unexpected errors during the process
      console.error('Unexpected error getting journey analytics:', error);
      return {}; // Return empty object on major failure
    }
  }
}
