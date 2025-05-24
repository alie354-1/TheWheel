/**
 * Dashboard Analytics Service
 * 
 * This service is responsible for providing analytics data for dashboard displays,
 * managing dashboard configurations, and handling report generation.
 */

import { supabase } from '@/lib/supabase';
import { loggingService } from '../logging.service';
import { trackEvent } from './events.service';
import { getAggregatedMetric, getTimeSeriesData } from './reporting.service';
import {
  DashboardConfig,
  DashboardData,
  SavedReport,
  ExportFormat,
  PredictiveInsight,
  AggregationParams,
  AggregationResult,
  TimeSeriesParams,
  TimeSeriesDataPoint
} from './types';

// Import third-party libraries for data export
import Papa from 'papaparse'; // For CSV export
import * as XLSX from 'xlsx'; // For Excel export
import jsPDF from 'jspdf'; // For PDF export
import autoTable from 'jspdf-autotable'; // For PDF tables
import { saveAs } from 'file-saver'; // For triggering downloads

/**
 * Fetches data required for the main analytics dashboard based on config
 * 
 * @param config The dashboard configuration defining widgets and settings
 * @param companyId Optional company ID context
 * @param dateRange Optional date range filter
 * @returns Dashboard data for display
 */
export async function getDashboardAnalytics(
  config: DashboardConfig,
  companyId?: string,
  dateRange?: { start: Date; end: Date }
): Promise<DashboardData> {
  // Log analytics request if logging is available
  if (typeof loggingService?.logInfo === 'function') {
    loggingService.logInfo('Fetching dashboard analytics', { 
      companyId, 
      dateRange, 
      configId: config.id, 
      source: 'analytics/dashboardAnalytics.service.ts' 
    });
  }

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
          return null;

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
          return { type: 'reportTable', data: tableData, columns: widget.settings.groupBy || [] };

        case 'scorecard':
           // Example: Fetch a single aggregated metric for a scorecard
           const scorecardParams: AggregationParams = {
             metric: widget.settings.metric || 'count',
             event_name: widget.settings.eventName,
             filters: widgetFilters,
             start_date: startDateString,
             end_date: endDateString,
             target_field: widget.settings.targetField,
           };
           const scorecardResult: AggregationResult[] | null = await getAggregatedMetric(scorecardParams);
           // Expecting a single result or sum/avg of results if no grouping
           const value = scorecardResult && scorecardResult.length > 0 ? scorecardResult[0].value : 0; 
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
    results.forEach((result: any) => { // Use 'any' for intermediate processing
      if (!result || !result.data) return; // Skip if result or data is null/undefined

      try {
        if (result.type === 'predictiveInsight') {
          aggregatedData.predictiveInsights.push(result.data as PredictiveInsight);
        } else if (result.type === 'timeSeriesChart') {
          const tsData = result.data as TimeSeriesDataPoint[];
          if (tsData.length > 0) {
            if (!aggregatedData.reportingData.timeSeries) {
              aggregatedData.reportingData.timeSeries = { labels: tsData.map(dp => dp.time_bucket), datasets: [] };
            }
            aggregatedData.reportingData.timeSeries.datasets.push({
              label: result.label || 'Dataset',
              data: tsData.map(dp => dp.value),
            });
          }
        } else if (result.type === 'reportTable') {
          const tableData = result.data as AggregationResult[];
          if (tableData.length > 0) {
             if (!aggregatedData.reportingData.tableData) {
                const columns = result.columns || [];
                const rows = tableData.map(item => {
                   const rowData: any[] = [];
                   columns.forEach((col: string) => rowData.push(item.groups ? item.groups[col] : undefined)); 
                   rowData.push(item.value);
                   return rowData;
                });
                aggregatedData.reportingData.tableData = { columns: [...columns, 'Value'], rows };
             }
          }
        } else if (result.type === 'scorecard') {
          aggregatedData.reportingData.scorecard = result.data as { metric: string; value: number | string; change?: number };
        }
      } catch (e) {
         console.error("Error processing widget result:", e, result);
         // Log this error if logging service is available
         if (typeof loggingService?.logError === 'function') {
           loggingService.logError(e instanceof Error ? e : new Error(String(e)), { 
             context: 'getDashboardAnalytics.processResult', 
             resultType: result.type,
             source: 'analytics/dashboardAnalytics.service.ts' 
           });
         }
      }
    });

    // Basic check if any data was actually fetched
    if (aggregatedData.predictiveInsights.length === 0 && Object.keys(aggregatedData.reportingData).length === 0) {
       console.warn("No data fetched for dashboard widgets.");
    }

    return aggregatedData;
  } catch (error) {
    if (typeof loggingService?.logError === 'function') {
      loggingService.logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'getDashboardAnalytics',
        companyId,
        dateRange,
        configId: config.id,
        source: 'analytics/dashboardAnalytics.service.ts'
      });
    }
    console.error('Error fetching dashboard analytics:', error);
    return {
      predictiveInsights: [],
      reportingData: {},
    };
  }
}

/**
 * Fetches the dashboard configuration for a user or company
 * 
 * @param ownerId The user ID or potentially a shared dashboard ID
 * @returns The dashboard configuration or null if not found or error
 */
export async function getDashboardConfig(ownerId: string): Promise<DashboardConfig | null> {
  try {
    // Log request if logging is available
    if (typeof loggingService?.logInfo === 'function') {
      loggingService.logInfo('Fetching dashboard config', { 
        ownerId, 
        source: 'analytics/dashboardAnalytics.service.ts' 
      });
    }

    const { data, error } = await supabase
      .from('analytics_dashboards')
      .select('*')
      .eq('id', ownerId)
      .maybeSingle();

    if (error) {
      if (typeof loggingService?.logError === 'function') {
        loggingService.logError(new Error(error.message), {
          context: 'getDashboardConfig',
          ownerId,
          dbError: error,
          source: 'analytics/dashboardAnalytics.service.ts'
        });
      }
      console.error('Error fetching dashboard config:', error.message);
      return null;
    }

    // If data is null (not found), return null
    if (!data) {
       if (typeof loggingService?.logInfo === 'function') {
         loggingService.logInfo('No dashboard config found for owner', { 
           ownerId, 
           source: 'analytics/dashboardAnalytics.service.ts' 
         });
       }
      return null;
    }

    // Ensure the fetched data conforms to the DashboardConfig type
    const configData = data as any; // Cast for intermediate processing
    return {
      ...configData,
      widgets: Array.isArray(configData.widgets) ? configData.widgets : [],
    } as DashboardConfig;
  } catch (error) {
    if (typeof loggingService?.logError === 'function') {
      loggingService.logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'getDashboardConfig',
        ownerId,
        source: 'analytics/dashboardAnalytics.service.ts'
      });
    }
    console.error('Error fetching dashboard config:', error);
    return null;
  }
}

/**
 * Saves or updates the dashboard configuration
 * 
 * @param config The dashboard configuration to save
 * @returns The saved configuration or null on error
 */
export async function saveDashboardConfig(config: DashboardConfig): Promise<DashboardConfig | null> {
  try {
    // Log request if logging is available
    if (typeof loggingService?.logInfo === 'function') {
      loggingService.logInfo('Saving dashboard config', { 
        configId: config.id, 
        source: 'analytics/dashboardAnalytics.service.ts' 
      });
    }
    
    // Track event for analytics
    trackEvent('dashboard_config_saved', null, null, { dashboardId: config.id, widgetCount: config.widgets.length });

    const { data, error } = await supabase
      .from('analytics_dashboards')
      .upsert({
        id: config.id,
        name: config.name,
        widgets: config.widgets,
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      if (typeof loggingService?.logError === 'function') {
        loggingService.logError(new Error(error.message), {
          context: 'saveDashboardConfig',
          configId: config.id,
          dbError: error,
          source: 'analytics/dashboardAnalytics.service.ts'
        });
      }
      console.error('Error saving dashboard config:', error.message);
      return null;
    }

    // Ensure the returned data conforms to the DashboardConfig type
    const savedData = data as any;
    return {
      ...savedData,
      widgets: Array.isArray(savedData.widgets) ? savedData.widgets : [],
    } as DashboardConfig;
  } catch (error) {
    if (typeof loggingService?.logError === 'function') {
      loggingService.logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'saveDashboardConfig',
        configId: config.id,
        source: 'analytics/dashboardAnalytics.service.ts'
      });
    }
    console.error('Error saving dashboard config:', error);
    return null;
  }
}

/**
 * Fetches all saved reports for a user/company
 * 
 * @param ownerId The user ID owning the reports
 * @param companyId Optional company ID context
 * @returns An array of saved reports or null on error
 */
export async function getSavedReports(ownerId: string, companyId?: string): Promise<SavedReport[] | null> {
  try {
    // Log request if logging is available
    if (typeof loggingService?.logInfo === 'function') {
      loggingService.logInfo('Fetching saved reports', { 
        ownerId, 
        companyId, 
        source: 'analytics/dashboardAnalytics.service.ts' 
      });
    }

    let query = supabase
      .from('analytics_reports')
      .select('*')
      .eq('owner_id', ownerId);

    // If companyId is provided, add it as a filter
    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query;

    if (error) {
      if (typeof loggingService?.logError === 'function') {
        loggingService.logError(new Error(error.message), {
          context: 'getSavedReports',
          ownerId,
          companyId,
          dbError: error,
          source: 'analytics/dashboardAnalytics.service.ts'
        });
      }
      console.error('Error fetching saved reports:', error.message);
      return null;
    }

    // Ensure configuration is parsed if stored as JSON string
    const reports = (data || []).map(report => ({
      ...report,
      configuration: typeof report.configuration === 'string'
        ? JSON.parse(report.configuration)
        : report.configuration,
    }));

    return reports as SavedReport[];
  } catch (error) {
    if (typeof loggingService?.logError === 'function') {
      loggingService.logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'getSavedReports',
        ownerId,
        companyId,
        source: 'analytics/dashboardAnalytics.service.ts'
      });
    }
    console.error('Error fetching saved reports:', error);
    return null;
  }
}

/**
 * Saves or updates a custom report configuration
 * 
 * @param report The report configuration to save
 * @returns The saved report configuration or null on error
 */
export async function saveReport(report: Omit<SavedReport, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<SavedReport | null> {
  try {
    // Log request if logging is available
    if (typeof loggingService?.logInfo === 'function') {
      loggingService.logInfo('Saving report', { 
        reportName: report.name, 
        source: 'analytics/dashboardAnalytics.service.ts' 
      });
    }
    
    // Track event for analytics
    trackEvent('report_saved', null, null, { reportName: report.name, ownerId: report.owner_id });

    // Prepare data for upsert
    const reportData = { ...report };

    // Remove id explicitly if it's undefined to rely on default generation
    if (reportData.id === undefined) {
      delete reportData.id;
    }

    const { data, error } = await supabase
      .from('analytics_reports')
      .upsert(reportData, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (error) {
      if (typeof loggingService?.logError === 'function') {
        loggingService.logError(new Error(error.message), {
          context: 'saveReport',
          reportName: report.name,
          dbError: error,
          source: 'analytics/dashboardAnalytics.service.ts'
        });
      }
      console.error('Error saving report:', error.message);
      return null;
    }

    // Ensure configuration is parsed if needed
    const savedData = data as any;
    return {
      ...savedData,
      configuration: typeof savedData.configuration === 'string'
        ? JSON.parse(savedData.configuration)
        : savedData.configuration,
    } as SavedReport;
  } catch (error) {
    if (typeof loggingService?.logError === 'function') {
      loggingService.logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'saveReport',
        reportName: report.name,
        source: 'analytics/dashboardAnalytics.service.ts'
      });
    }
    console.error('Error saving report:', error);
    return null;
  }
}

/**
 * Deletes a saved report
 * 
 * @param reportId The ID of the report to delete
 * @param ownerId The user ID owning the report (for verification)
 * @returns True if successful, false otherwise
 */
export async function deleteReport(reportId: string, ownerId: string): Promise<boolean> {
  try {
    // Log request if logging is available
    if (typeof loggingService?.logInfo === 'function') {
      loggingService.logInfo('Deleting report', { 
        reportId, 
        ownerId, 
        source: 'analytics/dashboardAnalytics.service.ts' 
      });
    }
    
    // Track event for analytics
    trackEvent('report_deleted', null, null, { reportId, ownerId });

    const { error } = await supabase
      .from('analytics_reports')
      .delete()
      .eq('id', reportId)
      .eq('owner_id', ownerId);

    if (error) {
      if (typeof loggingService?.logError === 'function') {
        loggingService.logError(new Error(error.message), {
          context: 'deleteReport',
          reportId,
          ownerId,
          dbError: error,
          source: 'analytics/dashboardAnalytics.service.ts'
        });
      }
      console.error('Error deleting report:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    if (typeof loggingService?.logError === 'function') {
      loggingService.logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'deleteReport',
        reportId,
        ownerId,
        source: 'analytics/dashboardAnalytics.service.ts'
      });
    }
    console.error('Error deleting report:', error);
    return false;
  }
}

/**
 * Generates and triggers a download for data in the specified format
 * 
 * @param data The data array to export
 * @param format The desired export format ('csv', 'excel', 'pdf')
 * @param filename The base filename for the downloaded file
 */
export async function exportData(
  data: any[],
  format: ExportFormat,
  filename: string
): Promise<void> {
  try {
    // Log request if logging is available
    if (typeof loggingService?.logInfo === 'function') {
      loggingService.logInfo('Exporting data', { 
        format, 
        filename, 
        recordCount: data.length, 
        source: 'analytics/dashboardAnalytics.service.ts' 
      });
    }
    
    // Track event for analytics
    trackEvent('data_exported', null, null, { format, recordCount: data.length });

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
  } catch (error) {
    if (typeof loggingService?.logError === 'function') {
      loggingService.logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'exportData',
        format,
        filename,
        source: 'analytics/dashboardAnalytics.service.ts'
      });
    }
    console.error(`Error exporting data as ${format}:`, error);
    alert(`Error exporting data as ${format}. See console for details.`);
  }
}