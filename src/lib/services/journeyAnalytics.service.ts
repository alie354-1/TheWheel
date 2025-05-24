import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { loggingService } from './logging.service'; // Import the singleton instance

export type MetricType = 
  | 'time_spent' 
  | 'view_count' 
  | 'completion_rate' 
  | 'difficulty_rating'
  | 'user_rating'
  | 'feedback_count';

export type EntityType = 'challenge' | 'phase' | 'journey' | 'step'; // Added 'step' for consistency

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
  blockedSteps: number; // Assuming 'blocked' might be a status
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
        .from('journey_analytics') // Ensure this table exists via migrations
        .insert({
          company_id: analytics.companyId,
          user_id: analytics.userId,
          entity_type: analytics.entityType,
          entity_id: analytics.entityId,
          metric_type: analytics.metricType,
          metric_value: analytics.metricValue,
          // created_at is handled by the database default
        });

      if (error) {
        console.error('Error tracking journey analytics metric:', error);
        // Use loggingService if available and configured
        if (typeof (loggingService as any)?.logError === 'function') {
           (loggingService as any).logError(new Error(error.message), { context: 'trackMetric', analytics });
        }
        // Optionally re-throw or handle differently
        // throw error; 
      }
    } catch (error) {
      console.error('Failed to track journey analytics:', error);
       if (typeof (loggingService as any)?.logError === 'function') {
           (loggingService as any).logError(error instanceof Error ? error : new Error(String(error)), { context: 'trackMetric', analytics });
        }
      // Optionally re-throw
      // throw error;
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

      // Ensure data mapping handles potential nulls and correct types
      return (data || []).map((item: any) => ({
        companyId: item.company_id,
        userId: item.user_id,
        entityType: item.entity_type as EntityType,
        entityId: item.entity_id,
        metricType: item.metric_type as MetricType,
        // Ensure metricValue is parsed correctly if stored as JSONB
        metricValue: (typeof item.metric_value === 'string' ? JSON.parse(item.metric_value) : item.metric_value) as AnalyticsMetric,
        // Include created_at if needed
        // created_at: item.created_at 
      }));
    } catch (error) {
      console.error('Failed to get journey analytics:', error);
      if (typeof (loggingService as any)?.logError === 'function') {
           (loggingService as any).logError(error instanceof Error ? error : new Error(String(error)), { context: 'getAnalytics', companyId, filter });
      }
      throw error; // Re-throw after logging
    }
  }

  /**
   * Get aggregated analytics data. (Client-side aggregation)
   */
  static async getAggregation(
    companyId: string,
    options: AggregationOptions = {},
    filter: AnalyticsFilter = {}
  ): Promise<any> { // Return type 'any' for now, should be more specific
    try {
      // Caching logic (optional, consider if aggregations are expensive and frequently requested)
      // ... (cache check logic as before, potentially using a more robust key)

      // Fetch raw data
      const analyticsData = await this.getAnalytics(companyId, filter);
      if (!analyticsData) return {}; // Return empty object if fetch failed

      // TODO: Consider moving this aggregation logic to a database function (e.g., RPC) for better performance.
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
          .filter((value): value is number => typeof value === 'number'); // Filter out non-numeric values

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
          case 'feedback_count': // Example specific handling
             result.feedbackCount = count;
             break;
          // Add cases for other MetricTypes like completion_rate, difficulty_rating if needed
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

      // Caching logic (optional)
      // ... (cache store logic as before)
      
      return result;
    } catch (error) {
      console.error('Failed to get aggregated analytics:', error);
       if (typeof (loggingService as any)?.logError === 'function') {
           (loggingService as any).logError(error instanceof Error ? error : new Error(String(error)), { context: 'getAggregation', companyId, options, filter });
      }
      throw error; // Re-throw after logging
    }
  }

  /**
   * Get journey progress statistics using RPC.
   */
  static async getProgressStats(
    companyId: string,
    journeyId?: string, // Optional journey filter
    startDate?: Date,
    endDate?: Date
  ): Promise<ProgressStats | null> { // Return null on error
    try {
      const { data, error } = await supabase.rpc(
        'get_journey_progress_stats', // Ensure this function exists in DB
        {
          p_company_id: companyId,
          p_journey_id: journeyId, // Pass journeyId if provided
          p_start_date: startDate?.toISOString(),
          p_end_date: endDate?.toISOString(),
        }
      );

      if (error) {
        console.error('Error fetching journey progress stats via RPC:', error);
         if (typeof (loggingService as any)?.logError === 'function') {
           (loggingService as any).logError(new Error(error.message), { context: 'getProgressStats', companyId, journeyId, dbError: error });
         }
        return null; // Return null on error
      }

      // Assuming the RPC function returns data matching the ProgressStats interface
      return data as ProgressStats; 
    } catch (error) {
      console.error('Failed to get journey progress stats:', error);
       if (typeof (loggingService as any)?.logError === 'function') {
           (loggingService as any).logError(error instanceof Error ? error : new Error(String(error)), { context: 'getProgressStats', companyId, journeyId });
        }
      return null; // Return null on exception
    }
  }

  /**
   * Get team assignments statistics using RPC.
   */
  static async getTeamAssignmentStats(
    companyId: string,
    userId?: string // Optional user filter
  ): Promise<TeamAssignmentStats | null> { // Return null on error
    try {
      const { data, error } = await supabase.rpc(
        'get_team_assignments_stats', // Ensure this function exists in DB
        {
          p_company_id: companyId,
          p_user_id: userId, // Pass userId if provided
        }
      );

      if (error) {
        console.error('Error fetching team assignment stats via RPC:', error);
         if (typeof (loggingService as any)?.logError === 'function') {
           (loggingService as any).logError(new Error(error.message), { context: 'getTeamAssignmentStats', companyId, userId, dbError: error });
         }
        return null; // Return null on error
      }

      // Assuming the RPC function returns data matching the TeamAssignmentStats interface
      return data as TeamAssignmentStats;
    } catch (error) {
      console.error('Failed to get team assignment stats:', error);
       if (typeof (loggingService as any)?.logError === 'function') {
           (loggingService as any).logError(error instanceof Error ? error : new Error(String(error)), { context: 'getTeamAssignmentStats', companyId, userId });
        }
      return null; // Return null on exception
    }
  }

  /**
   * Get analytics for comparing journey progress with industry benchmarks or similar companies.
   */
  static async getComparisonAnalytics(companyId: string): Promise<any | null> { // Return null on error
    try {
      const progressStats = await this.getProgressStats(companyId);
      if (!progressStats) {
         console.warn('Could not fetch progress stats for comparison analytics.');
         return null; // Cannot compare without current progress
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
       console.error('Failed to get comparison analytics:', error);
        if (typeof (loggingService as any)?.logError === 'function') {
           (loggingService as any).logError(error instanceof Error ? error : new Error(String(error)), { context: 'getComparisonAnalytics', companyId });
        }
       return null; // Return null on exception
    }
  }

  // --- Placeholder Predictive Functions (Sprint 5) ---

  /**
   * Placeholder for fetching journey completion forecast.
   */
  static async getJourneyCompletionForecast(companyId: string): Promise<{ estimatedWeeks: number; confidence: number } | null> {
    console.warn('getJourneyCompletionForecast: Placeholder implementation. Returning mock data.');
    // TODO: Implement call to actual prediction model/service based on historical data, velocity, etc.
    try {
      const progress = await this.getProgressStats(companyId);
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
   * Placeholder for predicting potential journey bottlenecks.
   */
  static async predictBottlenecks(companyId: string): Promise<{ stepId: string; stepName: string; predictedDelayFactor: number }[] | null> {
    console.warn('predictBottlenecks: Placeholder implementation. Returning mock data.');
    // TODO: Implement call to actual prediction model/service based on historical data across companies.
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
   * Placeholder for projecting tool adoption rates.
   */
  static async getToolAdoptionProjections(companyId: string, toolId?: string): Promise<{ toolId: string; toolName: string; projectedAdoptionRate: number }[] | null> {
    console.warn('getToolAdoptionProjections: Placeholder implementation. Returning mock data.');
     // TODO: Implement call to actual prediction model/service based on tool features, user roles, current adoption.
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
   * Placeholder for suggesting optimized resource allocation.
   */
  static async getOptimizedResourceAllocation(companyId: string): Promise<{ recommendation: string; details?: any } | null> {
    console.warn('getOptimizedResourceAllocation: Placeholder implementation. Returning mock data.');
    // TODO: Implement call to actual optimization model/service considering current progress, bottlenecks, team skills.
    try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        // Simulate a simple recommendation based on a random bottleneck
        const bottlenecks = await this.predictBottlenecks(companyId);
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
   * Placeholder for predicting team velocity.
   */
  static async getTeamVelocityPrediction(companyId: string, teamId?: string): Promise<{ predictedStepsPerWeek: number; trend: 'increasing' | 'decreasing' | 'stable' } | null> {
     console.warn('getTeamVelocityPrediction: Placeholder implementation. Returning mock data.');
     // TODO: Implement call to actual prediction model/service based on recent team activity.
     try {
        await new Promise(resolve => setTimeout(resolve, 350)); // Simulate delay
        // Simulate based on recent activity (e.g., count completed steps in last week)
        // This requires fetching recent completion events, which is omitted for placeholder simplicity
        const randomTrend = ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as 'increasing' | 'decreasing' | 'stable';
        return { predictedStepsPerWeek: parseFloat((1.5 + Math.random() * 2).toFixed(1)), trend: randomTrend };
     } catch (error) {
        console.error("Error in placeholder getTeamVelocityPrediction:", error);
        return null;
     }
  }

}

export default JourneyAnalyticsService;

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.<environment_details>
# VSCode Visible Files
src/lib/services/journeyAnalytics.service.ts

# VSCode Open Tabs
src/lib/types/logging.types.ts
src/lib/hooks/useCentralizedLogging.ts
src/lib/hooks/useEnhancedLogging.ts
src/pages/OnboardingWizardPage.tsx
src/pages/OnboardingPage.tsx
src/components/onboarding/OnboardingController.tsx
src/pages/EnhancedIdeaHubPage.tsx
src/enhanced-idea-hub/store/idea-hub-store.ts
src/lib/services/idea-playground/ai/sequential-generation.service.ts
src/components/idea-playground/pathway1/IdeaCaptureScreen.tsx
supabase/migrations/20250427_idea_hub_enhancements.sql
src/components/idea-playground/SaveIdeaModal.tsx
src/pages/idea-hub/QuickGeneration.tsx
src/pages/idea-hub/Refinement.tsx
src/lib/contexts/IdeaContext.tsx
src/pages/idea-hub/SavedIdeasPage.tsx
src/pages/IdeaHub.tsx
mvp-feature-review.md
the_wheel_full_schema.sql
the_wheel_mvp_implementation_plan.md
supabase/migrations/20250427_mvp_enhancements.sql
the_wheel_mvp_implementation_summary.md
the_wheel_adaptation_plan.md
the_wheel_implementation_master_plan.md
the_wheel_data_migration_plan.md
the_wheel_design_system_guidelines.md
src/lib/types/idea-playground.types.ts
src/lib/services/company.service.ts
src/lib/services/profile.service.ts
src/lib/store.ts
supabase/migrations/20250427_add_user_profile_fields.sql
supabase/migrations/20250427_add_profile_fields_to_users.sql
supabase/migrations/20250427_add_system_logs_and_consent_settings.sql
supabase/migrations/20250427_add_action_and_policy_tables.sql
supabase/migrations/20250427_add_client_info_to_system_logs.sql
supabase/migrations/20250427_update_policy_and_classification_tables.sql
src/pages/ProfileSetup.tsx
supabase/migrations/20250427_fix_policy_and_classification_types.sql
supabase/migrations/20250427_enable_rls_and_policies_for_rules.sql
supabase/migrations/20250427_fix_system_logs_and_retention_policies.sql
supabase/migrations/20250427_fix_classification_rules_columns.sql
supabase/migrations/20250427_make_name_nullable_in_rules.sql
supabase/migrations/20250427_add_user_sync_trigger.sql
supabase/migrations/20250427_create_app_settings_table.sql
supabase/migrations/20250427_insert_default_app_settings.sql
supabase/migrations/20250427_create_generic_rpc_functions.sql
supabase/migrations/20250427_fix_system_logs_and_consent_settings.sql
supabase/migrations/20250427_fix_consent_settings_columns.sql
scripts/analyze-excel.js
supabase/migrations/20250427_add_journey_excel_fields.sql
journey_map_task_integration_plan.md
supabase/migrations/20250427_add_company_journey_customization.sql
supabase/migrations/20250427_add_tool_submission_and_promotion.sql
src/lib/services/toolSubmission.service.ts
src/pages/AdminToolModerationPage.tsx
supabase/migrations/20250427_add_company_tools_and_documents.sql
src/lib/services/companyTools.service.ts
supabase/migrations/20250427_add_company_tool_evaluations.sql
src/lib/services/companyToolEvaluation.service.ts
supabase/migrations/20250427_add_company_budget.sql
supabase/migrations/20250427_add_budget_templates.sql
src/pages/company/CompanyBudgetPage.tsx
src/lib/services/financialAnalytics.service.ts
supabase/migrations/20250427_add_app_settings.sql
supabase/migrations/20250427_add_description_to_app_settings.sql
src/pages/FinancialHubPage.tsx
src/lib/supabase.ts
scripts/force-logout-all-users.js
public/force-logout.html
src/lib/services/logging.service.enhanced.ts
src/components/LoggingProvider.tsx
scripts/test-disabled-logging.js
src/lib/services/feature-flags.service.ts
src/components/ErrorBoundary.tsx
src/lib/services/privacy.service.ts
src/lib/services/model-training.service.ts
scripts/test-dashboard-load.js
docs/DISABLED_LOGGING_DOCUMENTATION.md
public/test-disabled-services.html
src/pages/SimplifiedDashboard.tsx
scripts/diagnose-dashboard-issues.js
src/main.tsx
src/pages/InitialOnboardingPage.tsx
src/components/onboarding/InitialOnboardingWizard.tsx
scripts/import-journey-excel.cjs
scripts/make-user-admin.ts
supabase/migrations/20250427_add_order_to_phases.sql
tsconfig.app.json
tsconfig.json
vite.config.ts
create_import_tables.sql
update_journey_tables.sql
src/lib/services/journeyContent.service.ts
src/pages/AdminJourneyContentPage.tsx
src/pages/ToolsMarketplacePage.tsx
src/pages/company/CompanyToolEvaluationPage.tsx
src/components/admin/ExcelImportMapper.tsx
supabase/migrations/20250428062800_update_companies_table.sql
src/pages/company/CompanySetup.tsx
src/lib/services/company-access.service.ts
supabase/migrations/20250428070800_add_financial_snapshot_function.sql
supabase/migrations/20250428072000_add_import_budget_template_function.sql
src/lib/services/financialHub.service.ts
src/components/company/dashboard/MyTasksWidget.tsx
src/components/company/dashboard/FinancialSnapshotWidget.tsx
index.html
src/pages/company/CompanyDashboard.tsx
src/components/OnboardingProgressCard.tsx
src/components/onboarding/SimpleProgressBar.tsx
src/components/StandupHistory.tsx
src/components/tasks/TaskManager.tsx
src/components/tasks/TaskList.tsx
src/index.css
src/components/tasks/TaskItem.tsx
src/pages/Dashboard.tsx
src/components/company/dashboard/JourneyMapView.tsx
src/components/company/dashboard/JourneyProgressWidget.tsx
supabase/migrations/20250428123000_enhance_journey_map_and_tools.sql
journey_map_implementation_plan.md
journey_map_mvp_status.md
supabase/migrations/20250428140500_add_ask_wheel_requests_table.sql
src/lib/services/askWheel.service.ts
src/pages/admin/AskWheelRequestsPage.tsx
src/lib/types/journey.types.ts
src/lib/services/companyJourney.service.ts
supabase/migrations/20250428155000_remove_diy_status.sql
journey_map_track_manually_implementation.md
pull_request_template_track_manually.md
docs/TOOL_SELECTION_AND_EVALUATION_FLOW.md
src/components/company/journey/StepDetails/DescriptionSection.tsx
src/components/company/journey/StepDetails/GuidanceSection.tsx
src/components/company/journey/StepDetails/OptionsSection.tsx
src/components/company/journey/StepDetails/ChecklistSection.tsx
src/components/company/journey/StepDetails/TipsSection.tsx
src/components/company/journey/StepDetails/NotesSection.tsx
src/components/company/journey/StepDetails/FeedbackSection.tsx
src/components/company/journey/StepDetails/ActionSection.tsx
docs/TOOL_SELECTION_EVALUATION_ADVANCED.md
supabase/migrations/20250428_add_tool_scorecards_and_documents.sql
src/components/company/journey/ToolSelector/CustomToolForm.tsx
src/components/company/journey/ToolSelector/ScorecardBuilder.tsx
src/components/company/journey/ToolSelector/ToolEvaluationForm.tsx
src/components/company/journey/ToolSelector/DocumentUploader.tsx
src/components/company/journey/ToolSelector/EvaluationHistory.tsx
src/pages/company/CompanyToolsPage.tsx
supabase/migrations/20250428_journey_page_interactive_enhancements.sql
docs/COMPANY_JOURNEY_PAGE_INTERACTIVE_AI.md
src/pages/company/JourneyBoard/AIRecommendationPanel.tsx
src/lib/services/journeyBoard.service.ts
src/pages/company/JourneyBoard/PhaseColumn.tsx
src/pages/company/JourneyBoard/FilterBar.tsx
src/pages/company/JourneyBoard/StepCard.tsx
src/pages/company/JourneyBoard/ListView.tsx
docs/JOURNEY_STEP_PAGE_IMPLEMENTATION.md
src/components/company/journey/StepDetails/AdviceCard.tsx
tailwind.config.js
supabase/migrations/20250428_add_theme_preference_to_users.sql
supabase/migrations/20250428_add_dismissed_advice_cards.sql
supabase/migrations/20250428_create_get_personalized_tool_recommendations.sql
src/components/ToolRedirect.tsx
src/components/company/journey/StepDetails/ResourcesSection.tsx
src/components/company/journey/ToolSelector/ToolDetailsModal.tsx
src/components/company/journey/ToolSelector/ToolSelector.tsx
src/components/company/journey/ToolSelector/ToolList.tsx
supabase/migrations/20250429_add_multi_tenant_terminology_system.sql
src/lib/utils/terminology-utils.ts
src/lib/types/terminology.types.ts
src/lib/hooks/useCompany.ts
src/components/terminology/TerminologyProvider.tsx
src/components/terminology/Term.tsx
scripts/seed-terminology-defaults.js
scripts/seed-alternative-terminology-sets.js
scripts/generate-hierarchical-test-data.js
supabase/migrations/20250430_create_test_hierarchy.sql
supabase/migrations/20250430_seed_terminology_templates.sql
supabase/migrations/20250430_seed_terminology_defaults.sql
src/api/utils/response.ts
src/lib/services/terminology.service.ts
src/components/terminology/TerminologyEditor.tsx
scripts/test-terminology-service.js
docs/TERMINOLOGY_SERVICE_DIRECT_APPROACH.md
docs/MULTI_TENANT_TERMINOLOGY_SYSTEM.md
src/components/terminology/DynamicText.tsx
src/components/terminology/TerminologyShowcase.tsx
src/pages/TerminologyDemoPage.tsx
docs/TERMINOLOGY_SPRINT3_SUMMARY.md
src/components/terminology/SimpleTerminologyEditor.tsx
src/components/terminology/index.ts
src/components/admin/TerminologyManagement.tsx
src/pages/AdminPanel.tsx
scripts/enhance-tool-data.js
scripts/generate-tool-relationships.js
scripts/generate-tool-pathways.js
src/components/common/Toast.tsx
docs/JOURNEY_EXPERIENCE_REDESIGN.md
docs/JOURNEY_REDESIGN_IMPLEMENTATION_PLAN.md
scripts/run-journey-transformation.js
docs/THE_WHEEL_JOURNEY_USER_GUIDE.md
docs/JOURNEY_REDESIGN_COMPONENTS_SUMMARY.md
docs/JOURNEY_REDESIGN_SPRINT_PLAN.md
supabase/migrations/20250501000000_transform_journey_steps_to_challenges.sql
src/pages/company/JourneyChallengesPage.tsx
src/components/company/journey/ChallengeList/ChallengeList.tsx
src/components/company/journey/ChallengeList/index.ts
src/lib/services/journeyChallenges.service.ts
src/components/company/journey/ChallengeEditor/ChallengeEditor.tsx
src/components/company/journey/ChallengeEditor/index.ts
src/pages/company/JourneyStepPage.tsx
src/lib/types/journey-challenges.types.ts
src/components/company/journey/ChallengeCard/StatusBadge.tsx
src/components/company/journey/ChallengeCard/DifficultyIndicator.tsx
src/components/company/journey/ChallengeCard/EstimatedTime.tsx
src/components/company/journey/ChallengeCard/index.ts
src/pages/company/JourneyChallengeDetailPage.tsx
src/components/company/journey/ChallengeCard/ChallengeCard.tsx
docs/JOURNEY_STEPS_UX_SPRINT_PLAN.md
scripts/test-journey-steps-service.js
docs/JOURNEY_STEPS_IMPLEMENTATION_STATUS.md
src/components/company/journey/StepCard/StatusBadge.tsx
src/components/company/journey/StepCard/DifficultyIndicator.tsx
src/components/company/journey/StepCard/EstimatedTime.tsx
scripts/test-step-card-components.js
src/components/company/journey/StepList/StepList.tsx
src/components/company/journey/PhaseProgress/PhaseProgress.tsx
src/components/company/journey/PhaseProgress/index.ts
src/pages/company/JourneyStepsRedirect.tsx
docs/JOURNEY_STEPS_UX_IMPROVEMENTS.md
supabase/migrations/20250501000000_create_step_enhanced_views.sql
scripts/run-journey-step-migration.js
docs/JOURNEY_UI_SPRINT3_PLAN.md
docs/JOURNEY_UI_SPRINT3_MOCKUPS.md
src/lib/types/journey-steps.types.ts
src/lib/utils/time-utils.ts
scripts/run-recommendation-system-migration.js
docs/JOURNEY_UI_SPRINT3_IMPLEMENTATION.md
scripts/seed-tool-recommendations.js
docs/recommendation-system-guide.md
supabase/sql/20250430_complete_recommendation_system_migration.sql
supabase/sql/20250430_query_recommendation_functions.sql
supabase/migrations/20250502000000_add_recommendation_functions.sql
supabase/sql/20250430_seed_tool_recommendations.sql
src/components/company/journey/StepRecommendations/index.ts
src/components/company/journey/JourneyStepDetails.tsx
src/components/DragDropProvider.tsx
src/components/company/journey/StepList/index.ts
src/lib/services/journeySteps.service.ts
src/pages/company/JourneyStepsPage.tsx
docs/JOURNEY_UX_REDESIGN_CONCEPTS.md
src/lib/services/toolSelection.service.ts
src/components/company/journey/ToolSelector/ToolRecommendationList.tsx
src/components/company/journey/ToolSelector/ToolComparisonTable.tsx
scripts/test-tool-selection-service.js
docs/TOOL_SELECTION_API_DOCUMENTATION.md
src/components/company/journey/StepCard/DraggableStepCard.tsx
src/components/company/journey/Analytics/index.ts
docs/JOURNEY_UI_SPRINT3_IMPLEMENTATION_PREVIEW.md
docs/JOURNEY_UI_UX_REFRESH_SUMMARY.md
docs/examples/StepAssistantIntegration.tsx
docs/JOURNEY_UI_SPRINT3_IMPLEMENTATION_STATUS.md
docs/JOURNEY_UI_SPRINT4_PLAN.md
supabase/migrations/20250503000000_add_feedback_system_tables.sql
docs/examples/FeedbackSystemIntegration.tsx
src/components/visualization/InteractiveJourneyMap.tsx
src/components/common/Tooltip.tsx
docs/examples/AdvancedVisualizationExample.tsx
docs/JOURNEY_UX_REFRESH_IMPLEMENTATION.md
docs/JOURNEY_UI_SPRINT4_COMPLETION.md
docs/JOURNEY_UI_SPRINT5_PLAN.md
supabase/migrations/20250504000000_sprint5_journey_analytics_foundation.sql
supabase/migrations/20250504000001_fix_sprint5_analytics_foundation.sql
docs/JOURNEY_SYSTEM_UNIFIED_REDESIGN.md
docs/JOURNEY_SYSTEM_SPRINT1_DATA_FOUNDATION.md
scripts/migrate-journey-data.ts
src/tests/journey-unified.service.test.ts
scripts/supabase-client.cjs
scripts/migrate-journey-data.cjs
supabase/migrations/20250505000000_journey_system_unification.sql
scripts/migrate-journey-tools.cjs
scripts/check-migration.cjs
scripts/migrate-tools-direct.cjs
scripts/migrate-tools-one-by-one.cjs
scripts/migrate-tools-correctly.cjs
scripts/migrate-tools-final.cjs
supabase/migrations/20250505010000_fix_tool_migration.sql
supabase/migrations/20250505020000_fix_tool_migration_schema.sql
supabase/migrations/20250505030000_expand_tools_table.sql
supabase/migrations/20250505040000_add_compatibility_layer.sql
docs/JOURNEY_SYSTEM_SPRINT1_SUMMARY.md
docs/JOURNEY_SYSTEM_MIGRATION_GUIDE.md
scripts/test-journey-migration.js
docs/JOURNEY_SYSTEM_REDESIGN_STATUS.md
src/lib/hooks/useJourneySteps.ts
src/lib/hooks/useJourneyTools.ts
src/lib/errors/journey-errors.ts
src/lib/hooks/useCompanyJourney.ts
src/lib/hooks/useStepProgress.ts
src/lib/utils/journey-validators.ts
src/lib/hooks/index.ts
docs/JOURNEY_SYSTEM_SPRINT1_WEEK2_PLAN.md
docs/JOURNEY_SYSTEM_SPRINT1_IMPLEMENTATION_SUMMARY.md
docs/JOURNEY_SYSTEM_SPRINT2_PLAN.md
src/components/company/journey/PhaseProgress/SimplePhaseProgress.tsx
src/components/company/journey/PhaseProgress/SimplePhaseProgress/index.ts
src/components/company/journey/JourneyOverview.tsx
src/pages/company/JourneyOverviewPage.tsx
docs/JOURNEY_SYSTEM_SPRINT3_PLAN.md
src/components/company/journey/TimelineView/TimelineView.tsx
src/components/company/journey/StepCard/StepCard.tsx
src/components/company/journey/StepCard/index.ts
src/components/company/journey/StepCard/StepCardProps.ts
src/components/company/journey/TimelineView/index.ts
src/components/company/journey/ListView/ListView.tsx
src/components/company/journey/ListView/index.ts
src/components/company/journey/ViewToggle/ViewToggle.tsx
src/components/company/journey/ViewToggle/index.ts
src/lib/hooks/useJourneyPageData.ts
src/components/company/journey/PhaseProgress/SimplePhaseProgressList.tsx
src/components/company/journey/PhaseProgress/SimplePhaseProgressList/index.ts
src/components/company/journey/StepAssistant/StepAssistant.tsx
src/components/company/journey/StepAssistant/index.ts
src/components/visualization/MilestoneCelebrationAnimation.tsx
src/components/visualization/index.ts
docs/JOURNEY_SYSTEM_SPRINT3_REVISED_PLAN.md
src/lib/hooks/useRecommendationAnalytics.ts
src/components/company/journey/ActionPanel/index.ts
src/pages/company/JourneyPage.tsx
src/lib/hooks/useJourneyPreferences.ts
supabase/migrations/20250503000001_add_user_journey_preferences.sql
supabase/migrations/20250503000002_add_journey_feature_events.sql
supabase/migrations/20250503000000_add_set_updated_at_function.sql
scripts/run-journey-migration.sh
docs/JOURNEY_SYSTEM_SPRINT4_PLAN.md
docs/JOURNEY_SYSTEM_SPRINTS1-3_IMPLEMENTATION_SUMMARY.md
scripts/start-journey-ui.sh
src/pages/company/JourneyBoard/JourneyBoard.tsx
src/pages/company/JourneyMapPage.tsx
src/lib/services/customArrangement.service.ts
src/lib/types/journey-unified.types.ts
src/lib/services/sharing.service.ts
src/lib/services/notification.service.ts
src/lib/services/feedback.service.ts
src/components/feedback/StepImprovementSuggestionForm.tsx
src/components/feedback/index.ts
docs/SPRINT4_IMPLEMENTATION_GUIDE.md
src/components/feedback/InlineRatingComponent.tsx
supabase/migrations/20250504000002_sprint4_collaboration_features.sql
scripts/run-sprint4-migrations.sh
supabase/migrations/20250504000003_sprint4_feedback_system.sql
supabase/migrations/20250504000004_sprint4_enhanced_tool_selection.sql
supabase/migrations/20250504000005_sprint4_drag_drop_sharing_notifications.sql
docs/JOURNEY_SYSTEM_SPRINT5_PLAN.md
src/pages/AnalyticsPage.tsx
src/App.tsx
src/components/Layout.tsx
src/lib/types/profile.types.ts
src/components/profile/LearningProfileDisplay.tsx
supabase/migrations/20250506030000_sprint5_integration_tables.sql
src/lib/services/auditLog.service.ts
src/lib/services/auth.service.ts
src/lib/services/journey-unified.service.ts
src/tests/journey-unified-tools.test.ts
src/components/profile/LearningProfileEditor.tsx
supabase/migrations/20250506005000_sprint5_add_is_claims_admin_function.sql
supabase/migrations/20250506000000_sprint5_analytics_data_warehouse.sql
supabase/migrations/20250506010000_sprint5_ai_infra_tables.sql
supabase/migrations/20250506020000_sprint5_personalization_tables.sql
supabase/migrations/20250506040000_sprint5_audit_log_table.sql
src/lib/services/recommendation/content-improvement.service.ts
src/lib/services/recommendation/relationships.service.ts
src/lib/services/recommendation/optimization.service.ts
src/lib/services/recommendation/analytics.service.ts
src/lib/services/recommendation/assistant.service.ts
src/lib/services/recommendation/index.ts
src/lib/services/recommendation.service.ts
src/components/tasks/TaskForm.tsx
src/tests/journey-unified-service-extended.test.ts
src/tests/hook-testing-utils.ts
src/tests/useJourneySteps.test.ts
src/tests/journey-compatibility.test.ts
docs/examples/JourneyHooksExample.tsx
package.json
src/lib/services/logging.service.ts
src/components/company/journey/Analytics/JourneyAnalyticsDashboard.tsx
src/components/analytics/dashboard/PredictiveInsightsPanel.tsx
src/components/analytics/dashboard/MultiDimensionalReporting.tsx
src/components/analytics/AnalyticsDashboard.tsx
src/pages/Profile.tsx
src/lib/services/externalIntegration.service.ts
src/lib/services/accessControl.service.ts
src/lib/services/appSettings.service.ts
src/lib/utils/cache.ts
docs/JOURNEY_SYSTEM_SPRINT5_COMPLETION.md
src/components/company/journey/StepRecommendations/StepRelationshipMap.tsx
src/components/company/journey/StepRecommendations/RecommendationsPanel.tsx
src/components/company/journey/ActionPanel/ActionPanel.tsx
src/lib/services/recommendation/core.service.ts
src/lib/services/dashboardAnalytics.service.ts
src/lib/services/analytics.service.ts
src/lib/services/journeyAnalytics.service.ts
src/lib/services/learningProfile.service.ts
src/pages/AdminAppSettingsPage.tsx
src/components/company/journey/StepRecommendations/NextBestSteps.tsx

# Current Time
5/5/2025, 9:22:07 AM (America/New_York, UTC-4:00)

# Context Window Usage
750,512 / 1,048.576K tokens used (72%)

# Current Mode
ACT MODE
</environment_details>
