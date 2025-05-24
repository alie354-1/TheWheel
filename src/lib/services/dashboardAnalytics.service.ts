import { supabase } from '../supabase'; // Re-add supabase import
import { loggingService } from './logging.service'; // Import the singleton instance
import { 
  trackEvent, 
  getAggregatedMetric, 
  getTimeSeriesData, 
  // Removed unused imports: getJourneyCompletionRate, getToolAdoptionRate 
  // Import necessary types from analytics.service
  type AggregationParams, 
  type AggregationResult, 
  type TimeSeriesParams, 
  type TimeSeriesDataPoint 
} from './analytics.service'; 
import Papa from 'papaparse'; // For CSV export
import * as XLSX from 'xlsx'; // For Excel export
import jsPDF from 'jspdf'; // For PDF export
import autoTable from 'jspdf-autotable'; // For PDF tables
import { saveAs } from 'file-saver'; // For triggering downloads

// --- Type Definitions ---

export interface PredictiveInsight {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  description: string;
  type: 'forecast' | 'bottleneck' | 'projection' | 'optimization';
}

export interface ReportingData {
  // Structure depends heavily on the visualization/report type
  timeSeries?: { // Example
    labels: string[];
    datasets: { label: string; data: number[] }[];
  };
  // Add other potential report data structures like tables, scorecards, etc.
  tableData?: { columns: string[]; rows: any[][] };
  scorecard?: { metric: string; value: number | string; change?: number };
}

export interface DashboardWidgetConfig {
  id: string;
  type: 'predictiveInsight' | 'timeSeriesChart' | 'reportTable' | 'scorecard';
  settings: Record<string, any>; // Widget-specific settings (e.g., metric, filters)
  position: { x: number; y: number; w: number; h: number }; // Grid position
}

export interface DashboardConfig {
  id: string; // Usually user_id or company_id
  name: string;
  widgets: DashboardWidgetConfig[];
  created_at?: string;
  updated_at?: string;
}

export interface SavedReport {
  id: string;
  name: string;
  description?: string;
  configuration: Record<string, any>; // Parameters for generating the report
  owner_id: string; // user_id
  company_id?: string;
  created_at?: string;
  updated_at?: string;
}

export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface DashboardData {
  predictiveInsights: PredictiveInsight[];
  reportingData: ReportingData;
  // Potentially add dashboard config here if fetched together
}


// --- Existing getDashboardAnalytics Function ---

/**
 * Fetches data required for the main analytics dashboard based on config.
 * Currently returns mock data and ignores config.
 *
 * @param config - The dashboard configuration defining widgets and settings.
 * @param companyId - The ID of the company context.
 * @param dateRange - Optional date range filter.
 * @returns A promise resolving to the dashboard data.
 */
export const getDashboardAnalytics = async (
  config: DashboardConfig, // Use config to determine what data to fetch
  companyId?: string,
  dateRange?: { start: Date; end: Date }
): Promise<DashboardData> => {
  // Conditionally log info
  if ('logInfo' in loggingService && typeof loggingService.logInfo === 'function') {
    loggingService.logInfo('Fetching dashboard analytics', { companyId, dateRange, configId: config.id, source: 'dashboardAnalytics.service.ts' });
  }

  // TODO: Replace with actual API calls or Supabase queries based on config.widgets
  // - Iterate through config.widgets
  // - For each widget, call appropriate functions from analytics.service.ts or other services
  // - Aggregate results into the DashboardData structure

  const aggregatedData: DashboardData = {
    predictiveInsights: [],
    reportingData: {},
  };

  // Define date range strings if provided
  const startDateString = dateRange?.start.toISOString();
  const endDateString = dateRange?.end.toISOString();

  try {
    // Process widgets defined in the config
    const widgetPromises = config.widgets.map(async (widget) => {
      const widgetFilters = { ...widget.settings.filters, company_id: companyId }; // Combine widget filters with companyId

      switch (widget.type) {
        case 'predictiveInsight':
          // TODO: Implement actual predictive insight fetching
          // For now, keep using placeholder mock data as predictive logic is not implemented
          if (widget.settings.insightId === 'forecast-1') {
             return { 
               type: 'predictiveInsight', 
               data: {
                 id: 'forecast-1', title: 'Journey Completion Forecast', value: '~ 8', unit: 'weeks',
                 description: 'Based on current team velocity and historical data.', type: 'forecast'
               } as PredictiveInsight 
             };
          } else if (widget.settings.insightId === 'bottleneck-1') {
             return { 
               type: 'predictiveInsight', 
               data: {
                 id: 'bottleneck-1', title: 'Potential Bottleneck', value: 'Market Validation Step',
                 description: 'Teams historically spend 30% more time on this step.', type: 'bottleneck'
               } as PredictiveInsight 
             };
          }
          return null; // No data for other insight IDs yet

        case 'timeSeriesChart':
          if (!startDateString || !endDateString) {
             console.warn('TimeSeriesChart widget requires a date range.');
             return null;
          }
          const tsParams: TimeSeriesParams = {
            metric: widget.settings.metric || 'count',
            event_name: widget.settings.eventName,
            interval: widget.settings.interval || 'day',
            filters: widgetFilters,
            start_date: startDateString,
            end_date: endDateString,
          };
          const tsData: TimeSeriesDataPoint[] | null = await getTimeSeriesData(tsParams);
          // Ensure data is correctly typed before returning
          return { type: 'timeSeriesChart', data: tsData, label: widget.settings.metric || widget.settings.eventName || 'Data' };

        case 'reportTable':
          // Example: Fetch aggregated data for a table
          const aggParams: AggregationParams = {
            metric: widget.settings.metric || 'count',
            event_name: widget.settings.eventName,
            group_by: widget.settings.groupBy,
            filters: widgetFilters,
            start_date: startDateString,
            end_date: endDateString,
            target_field: widget.settings.targetField,
          };
          const tableData: AggregationResult[] | null = await getAggregatedMetric(aggParams);
           // Ensure data is correctly typed before returning
          return { type: 'reportTable', data: tableData, columns: widget.settings.groupBy || [] }; // Ensure columns is an array

        case 'scorecard':
           // Example: Fetch a single aggregated metric for a scorecard
           const scorecardParams: AggregationParams = {
             metric: widget.settings.metric || 'count', // e.g., 'count', 'unique_users'
             event_name: widget.settings.eventName,
             filters: widgetFilters,
             start_date: startDateString,
             end_date: endDateString,
             target_field: widget.settings.targetField,
           };
           const scorecardResult: AggregationResult[] | null = await getAggregatedMetric(scorecardParams);
           // Expecting a single result or sum/avg of results if no grouping
           const value = scorecardResult && scorecardResult.length > 0 ? scorecardResult[0].value : 0; 
           // Ensure data is correctly typed before returning
           return { 
             type: 'scorecard', 
             data: { metric: widget.settings.metricLabel || widget.settings.metric, value } 
           };

        default:
          console.warn(`Unsupported widget type: ${widget.type}`);
          return null;
      }
    });

    const results = await Promise.all(widgetPromises);

    // Aggregate results into the DashboardData structure with improved type safety
    results.forEach((result: any) => { // Use 'any' temporarily for broader compatibility during aggregation
      if (!result || !result.data) return; // Skip if result or data is null/undefined

      try {
        if (result.type === 'predictiveInsight') {
          // Type assertion after check
          aggregatedData.predictiveInsights.push(result.data as PredictiveInsight);
        } else if (result.type === 'timeSeriesChart') {
          const tsData = result.data as TimeSeriesDataPoint[]; // Assert type
          if (tsData.length > 0) {
            if (!aggregatedData.reportingData.timeSeries) {
              aggregatedData.reportingData.timeSeries = { labels: tsData.map(dp => dp.time_bucket), datasets: [] };
            }
            aggregatedData.reportingData.timeSeries.datasets.push({
              label: result.label || 'Dataset', // Provide default label
              data: tsData.map(dp => dp.value),
            });
          }
        } else if (result.type === 'reportTable') {
          const tableData = result.data as AggregationResult[]; // Assert type
          if (tableData.length > 0) {
             if (!aggregatedData.reportingData.tableData) {
                const columns = result.columns || []; // Ensure columns is an array
                const rows = tableData.map(item => {
                   const rowData: any[] = [];
                   // Ensure item.groups exists before accessing properties
                   columns.forEach((col: string) => rowData.push(item.groups ? item.groups[col] : undefined)); 
                   rowData.push(item.value);
                   return rowData;
                });
                aggregatedData.reportingData.tableData = { columns: [...columns, 'Value'], rows };
             }
          }
        } else if (result.type === 'scorecard') {
          // Type assertion after check
          aggregatedData.reportingData.scorecard = result.data as { metric: string; value: number | string; change?: number };
        }
      } catch (e) {
         console.error("Error processing widget result:", e, result);
         // Optionally log this error with loggingService
      }
    });

    // Basic check if any data was actually fetched
    if (aggregatedData.predictiveInsights.length === 0 && Object.keys(aggregatedData.reportingData).length === 0) {
       console.warn("No data fetched for dashboard widgets.");
       // Optionally return mock data here if needed for UI development
    }

    return aggregatedData;
  } catch (error: any) {
    loggingService.logError(error instanceof Error ? error : new Error(String(error)), {
      context: 'getDashboardAnalytics',
      companyId,
      dateRange,
      configId: config.id,
      source: 'dashboardAnalytics.service.ts'
    });
    console.error('Error fetching dashboard analytics:', error);
    // Return empty state or rethrow
    return {
      predictiveInsights: [],
      reportingData: {}, // Ensure reportingData is initialized
    };
  }
};


// --- New Dashboard Configuration Functions ---

/**
 * Fetches the dashboard configuration for a user or company.
 *
 * @param ownerId - The user ID or potentially a shared dashboard ID.
 * @returns The dashboard configuration or null if not found or error.
 */
export const getDashboardConfig = async (ownerId: string): Promise<DashboardConfig | null> => {
  try {
    // Conditionally log info
    if ('logInfo' in loggingService && typeof loggingService.logInfo === 'function') {
      loggingService.logInfo('Fetching dashboard config', { ownerId, source: 'dashboardAnalytics.service.ts' });
    }

    const { data, error } = await supabase
      .from('analytics_dashboards')
      .select('*')
      // Assuming the primary key 'id' of analytics_dashboards stores the ownerId (user_id)
      // Adjust if the schema uses a different column like 'user_id' or 'owner_id'
      .eq('id', ownerId)
      .maybeSingle(); // Use maybeSingle to return null if not found

    if (error) {
      loggingService.logError(new Error(error.message), { context: 'getDashboardConfig', ownerId, dbError: error });
      console.error('Error fetching dashboard config:', error.message);
      return null; // Return null on error as per function signature
    }

    // If data is null (not found), return null
    if (!data) {
       if ('logInfo' in loggingService && typeof loggingService.logInfo === 'function') {
         loggingService.logInfo('No dashboard config found for owner', { ownerId, source: 'dashboardAnalytics.service.ts' });
       }
      return null;
    }

    // Ensure the fetched data conforms to the DashboardConfig type, especially the widgets array
    // Supabase might return JSONB as strings if not properly typed
    const configData = data as any; // Cast to any for intermediate processing
    return {
      ...configData,
      widgets: Array.isArray(configData.widgets) ? configData.widgets : [], // Ensure widgets is an array
    } as DashboardConfig;
  } catch (error: any) {
    loggingService.logError(error instanceof Error ? error : new Error(String(error)), { ownerId, source: 'dashboardAnalytics.service.ts', function: 'getDashboardConfig' });
    console.error('Error fetching dashboard config:', error);
    return null;
  }
};

/**
 * Saves or updates the dashboard configuration.
 *
 * @param config - The dashboard configuration to save.
 * @returns The saved configuration or null if an error occurs.
 */
export const saveDashboardConfig = async (config: DashboardConfig): Promise<DashboardConfig | null> => {
  try {
    // Conditionally log info
    if ('logInfo' in loggingService && typeof loggingService.logInfo === 'function') {
      loggingService.logInfo('Saving dashboard config', { configId: config.id, source: 'dashboardAnalytics.service.ts' });
    }
    trackEvent('dashboard_config_saved', { dashboardId: config.id, widgetCount: config.widgets.length });

    // The 'updated_at' field should be automatically handled by the database trigger
    // defined in the migration '20250506000000_sprint5_analytics_data_warehouse.sql'.
    // We only need to provide the core config data.
    const { data, error } = await supabase
      .from('analytics_dashboards')
      .upsert({
        id: config.id, // The primary key, used for matching in upsert
        name: config.name,
        widgets: config.widgets,
        // Assuming 'user_id' or 'owner_id' is part of the config object if needed for RLS checks,
        // or derived from the authenticated user context if not passed explicitly.
        // The RLS policy 'Allow users to manage their own dashboards' uses auth.uid() = user_id.
        // Ensure the 'id' column correctly maps to the user/owner ID for this policy.
        // If 'id' is not the user_id, adjust the upsert data and RLS policy accordingly.
        // For now, assuming 'id' is the ownerId (user_id).
      }, {
        // If the table uses 'user_id' instead of 'id' as the foreign key to auth.users
        // and 'id' is just a UUID primary key, the upsert might need adjustment,
        // e.g., using onConflict: 'id' or ensuring user_id is set.
        // Let's assume 'id' is the primary key and also the user_id for simplicity based on getDashboardConfig.
        onConflict: 'id' // Specify the conflict target column (the primary key)
      })
      .select()
      .single();

    if (error) {
      loggingService.logError(new Error(error.message), { context: 'saveDashboardConfig', configId: config.id, dbError: error });
      console.error('Error saving dashboard config:', error.message);
      return null;
    }

    // Ensure the returned data conforms to the DashboardConfig type
    const savedData = data as any;
    return {
      ...savedData,
      widgets: Array.isArray(savedData.widgets) ? savedData.widgets : [],
    } as DashboardConfig;
  } catch (error: any) {
    loggingService.logError(error instanceof Error ? error : new Error(String(error)), { configId: config.id, source: 'dashboardAnalytics.service.ts', function: 'saveDashboardConfig' });
    console.error('Error saving dashboard config:', error);
    return null;
  }
};


// --- New Saved Report Functions ---

/**
 * Fetches all saved reports for a user/company.
 *
 * @param ownerId - The user ID owning the reports.
 * @param companyId - Optional company ID context.
 * @returns An array of saved reports or null on error.
 */
export const getSavedReports = async (ownerId: string, companyId?: string): Promise<SavedReport[] | null> => {
  try {
    // Conditionally log info
    if ('logInfo' in loggingService && typeof loggingService.logInfo === 'function') {
      loggingService.logInfo('Fetching saved reports', { ownerId, companyId, source: 'dashboardAnalytics.service.ts' });
    }

    let query = supabase
      .from('analytics_reports')
      .select('*')
      .eq('owner_id', ownerId); // RLS policy ensures user can only fetch their own reports

    // If companyId is provided, add it as a filter
    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query;

    if (error) {
      loggingService.logError(new Error(error.message), { context: 'getSavedReports', ownerId, companyId, dbError: error });
      console.error('Error fetching saved reports:', error.message);
      return null;
    }

    // Ensure configuration is parsed if stored as JSON string (though JSONB should handle it)
    const reports = (data || []).map(report => ({
      ...report,
      configuration: typeof report.configuration === 'string'
        ? JSON.parse(report.configuration)
        : report.configuration,
    }));

    return reports as SavedReport[];
  } catch (error: any) {
    loggingService.logError(error instanceof Error ? error : new Error(String(error)), { ownerId, companyId, source: 'dashboardAnalytics.service.ts', function: 'getSavedReports' });
    console.error('Error fetching saved reports:', error);
    return null;
  }
};

/**
 * Saves or updates a custom report configuration.
 *
 * @param report - The report configuration to save.
 * @returns The saved report configuration or null on error.
 */
export const saveReport = async (report: Omit<SavedReport, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<SavedReport | null> => {
  try {
    // Conditionally log info
    if ('logInfo' in loggingService && typeof loggingService.logInfo === 'function') {
      loggingService.logInfo('Saving report', { reportName: report.name, source: 'dashboardAnalytics.service.ts' });
    }
    trackEvent('report_saved', { reportName: report.name, ownerId: report.owner_id });

    // Prepare data for upsert. Ensure owner_id is included.
    // The updated_at trigger handles the timestamp.
    const reportData = {
      ...report, // Includes name, description, configuration, owner_id, company_id (optional)
      // If report.id exists, it will be used for matching in upsert.
      // If report.id is undefined, Supabase will generate a new UUID if the column default is set.
      // The table schema uses `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`, so it should generate one.
    };

    // Remove id explicitly if it's undefined to rely on default generation
    if (reportData.id === undefined) {
      delete reportData.id;
    }

    const { data, error } = await supabase
      .from('analytics_reports')
      .upsert(reportData, {
        // If an existing report (matched by primary key 'id') should be updated
        onConflict: 'id',
      })
      .select()
      .single(); // Return the inserted or updated row

    if (error) {
      loggingService.logError(new Error(error.message), { context: 'saveReport', reportName: report.name, dbError: error });
      console.error('Error saving report:', error.message);
      return null;
    }

    // Ensure configuration is parsed if needed (though JSONB should handle it)
    const savedData = data as any;
    return {
      ...savedData,
      configuration: typeof savedData.configuration === 'string'
        ? JSON.parse(savedData.configuration)
        : savedData.configuration,
    } as SavedReport;
  } catch (error: any) {
    loggingService.logError(error instanceof Error ? error : new Error(String(error)), { reportName: report.name, source: 'dashboardAnalytics.service.ts', function: 'saveReport' });
    console.error('Error saving report:', error);
    return null;
  }
};

/**
 * Deletes a saved report.
 *
 * @param reportId - The ID of the report to delete.
 * @param ownerId - The user ID owning the report (for verification).
 * @returns True if successful, false otherwise.
 */
export const deleteReport = async (reportId: string, ownerId: string): Promise<boolean> => {
  try {
    // Conditionally log info
    if ('logInfo' in loggingService && typeof loggingService.logInfo === 'function') {
      loggingService.logInfo('Deleting report', { reportId, ownerId, source: 'dashboardAnalytics.service.ts' });
    }
    trackEvent('report_deleted', { reportId, ownerId });

    const { error } = await supabase
      .from('analytics_reports')
      .delete()
      .eq('id', reportId)
      .eq('owner_id', ownerId); // RLS policy also enforces this, but explicit check is good practice

    if (error) {
      loggingService.logError(new Error(error.message), { context: 'deleteReport', reportId, ownerId, dbError: error });
      console.error('Error deleting report:', error.message);
      return false; // Indicate failure
    }

    // If no error, the deletion was successful (or the report didn't exist/belong to user, which is fine)
    return true;
  } catch (error: any) {
    loggingService.logError(error instanceof Error ? error : new Error(String(error)), { reportId, ownerId, source: 'dashboardAnalytics.service.ts', function: 'deleteReport' });
    console.error('Error deleting report:', error);
    return false;
  }
};


// --- New Data Export Functions ---

/**
 * Generates and triggers a download for data in the specified format.
 *
 * @param data - The data array to export.
 * @param format - The desired export format ('csv', 'excel', 'pdf').
 * @param filename - The base filename for the downloaded file.
 */
export const exportData = async (
  data: any[], // Should ideally be more specific, e.g., Record<string, any>[]
  format: ExportFormat,
  filename: string
): Promise<void> => {
  try {
    // Conditionally log info
    if ('logInfo' in loggingService && typeof loggingService.logInfo === 'function') {
      loggingService.logInfo('Exporting data', { format, filename, recordCount: data.length, source: 'dashboardAnalytics.service.ts' });
    }
    trackEvent('data_exported', { format, recordCount: data.length });

    // Helper function to trigger download
    const triggerDownload = (blob: Blob, filenameWithExt: string) => {
      saveAs(blob, filenameWithExt);
    };

    // Ensure data is an array of objects for consistency
    if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== 'object' || data[0] === null) {
      console.warn('exportData: Invalid or empty data provided for export.');
      alert('No data available to export.');
      return;
    }

    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(header => row[header]));

    if (format === 'csv') {
      const csv = Papa.unparse({ fields: headers, data: rows });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      triggerDownload(blob, `${filename}.csv`);
    } else if (format === 'excel') {
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      triggerDownload(blob, `${filename}.xlsx`);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 10, // Add some margin from the top
        didDrawPage: (dataArg) => {
          // Optional: Add header/footer to each page
          doc.setFontSize(10);
          doc.text(`Page ${dataArg.pageNumber}`, dataArg.settings.margin.left, doc.internal.pageSize.height - 10);
        }
      });
      const blob = doc.output('blob');
      triggerDownload(blob, `${filename}.pdf`);
    } else {
      console.warn(`exportData: Unsupported format requested: ${format}`);
      alert(`Unsupported export format: ${format}`);
    }
  } catch (error: any) {
    loggingService.logError(error instanceof Error ? error : new Error(String(error)), { format, filename, source: 'dashboardAnalytics.service.ts', function: 'exportData' });
    console.error(`Error exporting data as ${format}:`, error);
    alert(`Error exporting data as ${format}. See console for details.`);
  }
};

// --- Custom Metrics (Placeholder) ---
// TODO: Define functions or configuration for managing custom metrics if needed.
// This might involve storing metric definitions in the database or config files.
