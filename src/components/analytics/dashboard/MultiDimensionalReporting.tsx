import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { 
  getAggregatedMetric, 
  getTimeSeriesData, 
  AggregationParams, 
  TimeSeriesParams, 
  AggregationResult, 
  TimeSeriesDataPoint 
} from '../../../lib/services/analytics.service'; // Import necessary functions and types
import { exportData, ExportFormat } from '../../../lib/services/dashboardAnalytics.service'; // Corrected import path
import { toast } from 'sonner'; // For feedback

interface MultiDimensionalReportingProps {
  companyId?: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  className?: string;
}

type ReportDimension = 'user' | 'step' | 'tool' | 'phase' | 'time';
type ReportMetric = 'count' | 'completion_rate' | 'time_spent' | 'tool_adoption';

interface ReportConfig {
  dimensions: ReportDimension[];
  metrics: ReportMetric[];
  filters: Record<string, any>;
  dateRange: {
    start: string;
    end: string;
  };
  // Add more configuration options as needed
}

// Define a type for the report data structure
type ReportData = AggregationResult[] | TimeSeriesDataPoint[] | null;

/**
 * MultiDimensionalReporting component enables building custom analytics reports
 * with flexible dimensions and metrics.
 */
const MultiDimensionalReporting: React.FC<MultiDimensionalReportingProps> = ({
  companyId,
  timeRange = 'month',
  className = '',
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportConfig, setReportConfig] = useState<ReportConfig>(() => {
    // Set initial report configuration
    const end = new Date();
    let start = new Date();
    start.setMonth(end.getMonth() - 1); // Default to last month
    
    return {
      dimensions: ['step'],
      metrics: ['count'],
      filters: companyId ? { company_id: companyId } : {},
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    };
  });
  const [reportData, setReportData] = useState<ReportData>(null); // Initialize with null, use ReportData type
  const [isConfiguring, setIsConfiguring] = useState(false);
  
  // Update date range when timeRange prop changes
  useEffect(() => {
    const end = new Date();
    let start = new Date();
    
    switch (timeRange) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
    }
    
    setReportConfig(prev => ({
      ...prev,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    }));
  }, [timeRange]);

  // Update filters when companyId changes
  useEffect(() => {
    // Only update if companyId is actually provided
    if (companyId) {
      setReportConfig(prev => ({
        ...prev,
        filters: {
          ...prev.filters,
          company_id: companyId // Ensure this matches the expected filter key in the service/DB function
        }
      }));
    } else {
       // Optionally clear company_id filter if companyId prop becomes undefined
       setReportConfig(prev => {
          const { company_id, ...restFilters } = prev.filters;
          return { ...prev, filters: restFilters };
       });
    }
  }, [companyId]);

  // Map ReportDimension to actual DB fields/paths
  const mapDimensionToField = (dimension: ReportDimension): string => {
     switch (dimension) {
       case 'user': return 'user_id';
       case 'step': return 'payload->>stepId'; // Assuming stepId is in payload
       case 'tool': return 'payload->>toolId'; // Assuming toolId is in payload
       case 'phase': return 'payload->>phaseId'; // Assuming phaseId is in payload
       case 'time': return 'created_at'; // Use created_at for time dimension grouping (handled by RPC)
       default: return dimension; // Fallback
     }
  };

  // Fetch report data when config changes or exiting config mode
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setReportData(null); // Clear previous data

    try {
      // Determine if it's a time series query
      const isTimeSeries = reportConfig.dimensions.includes('time');
      const primaryMetric = reportConfig.metrics[0] || 'count'; // Use first metric for now

      if (isTimeSeries) {
        // Time series query
        const timeSeriesParams: TimeSeriesParams = {
          metric: primaryMetric === 'completion_rate' || primaryMetric === 'tool_adoption' ? 'count' : primaryMetric, // Use count for rate calculations later
          event_name: reportConfig.filters.eventName || 'step_viewed', // Example default event
          interval: 'day', // Make interval configurable later
          filters: reportConfig.filters,
          start_date: reportConfig.dateRange.start,
          end_date: reportConfig.dateRange.end,
        };
        const result = await getTimeSeriesData(timeSeriesParams);
        setReportData(result); // result is TimeSeriesDataPoint[] | null
        // TODO: Handle rate calculations client-side if needed based on fetched counts
      } else {
        // Aggregation query
        const aggregationParams: AggregationParams = {
          metric: primaryMetric === 'completion_rate' || primaryMetric === 'tool_adoption' ? 'count' : primaryMetric,
          event_name: reportConfig.filters.eventName || 'step_completed', // Example default event
          group_by: reportConfig.dimensions.map(mapDimensionToField),
          filters: reportConfig.filters,
          start_date: reportConfig.dateRange.start,
          end_date: reportConfig.dateRange.end,
          target_field: primaryMetric === 'time_spent' ? 'payload->>duration' : undefined, // Example target field
        };
        const result = await getAggregatedMetric(aggregationParams);
        setReportData(result); // result is AggregationResult[] | null
         // TODO: Handle rate calculations client-side if needed
      }

    } catch (err: any) {
      console.error('Error fetching report data:', err);
      setError(`Failed to load report data: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [reportConfig]); // Depend on the entire config object

  // Fetch data initially and when exiting configuration mode
  useEffect(() => {
    if (!isConfiguring) {
      fetchReportData();
    }
  }, [isConfiguring, fetchReportData]);

  // Handle dimension toggle
  const toggleDimension = (dimension: ReportDimension) => {
    setReportConfig(prev => {
      const exists = prev.dimensions.includes(dimension);
      let newDimensions: ReportDimension[];

      if (exists) {
        newDimensions = prev.dimensions.filter(d => d !== dimension);
        // Ensure at least one dimension remains if not time
        if (newDimensions.length === 0 && dimension !== 'time') {
           toast.warning("At least one dimension (other than time) must be selected for aggregation.");
           return prev; // Keep previous state
        }
      } else {
        newDimensions = [...prev.dimensions, dimension];
      }
      // If 'time' is added, remove other dimensions for time series view
      if (dimension === 'time' && newDimensions.includes('time')) {
         newDimensions = ['time'];
         toast.info("Switched to Time Series view. Other dimensions removed.");
      } 
      // If 'time' is removed or another dimension is added while 'time' exists, ensure 'time' is removed
      else if (newDimensions.includes('time') && newDimensions.length > 1) {
         newDimensions = newDimensions.filter(d => d !== 'time');
         toast.info("Switched to Aggregation view. Time dimension removed.");
      }
      // Ensure at least one dimension if time was removed and nothing else is left
      if (newDimensions.length === 0) {
         newDimensions = ['step']; // Default back to 'step'
      }

      return { ...prev, dimensions: newDimensions };
    });
  };

  // Handle metric toggle (allow only one metric for now)
  const toggleMetric = (metric: ReportMetric) => {
    setReportConfig(prev => ({
      ...prev,
      metrics: [metric] // Replace metrics array with the selected one
    }));
  };

  // Handle data export
  const handleExport = (format: ExportFormat) => {
    // Check if reportData is null or empty array before exporting
    if (!reportData || !Array.isArray(reportData) || reportData.length === 0) { 
      toast.warning("No data available to export.");
      return;
    }

    try {
      let exportableData: Record<string, any>[] = [];
      let filename = `report_${new Date().toISOString().split('T')[0]}`;

      // Type guard to check the structure of reportData
      if (Array.isArray(reportData) && reportData.length > 0) {
        const firstItem = reportData[0];
        if ('groups' in firstItem && typeof firstItem.groups === 'object') {
          // Aggregation Result
          exportableData = (reportData as AggregationResult[]).map(row => ({
            ...row.groups,
            value: row.value
          }));
          filename = `aggregated_${filename}`;
        } else if ('time_bucket' in firstItem) {
          // Time Series Result
          exportableData = (reportData as TimeSeriesDataPoint[]).map(row => ({
            time_bucket: row.time_bucket,
            value: row.value
          }));
          filename = `timeseries_${filename}`;
        } else {
           toast.error("Data format not recognized for export.");
           return;
        }
      } else {
         toast.error("Cannot export empty or invalid data.");
         return;
      }
      
      exportData(exportableData, format, filename); // Use imported exportData function
      toast.success(`Report exported as ${format.toUpperCase()}.`);

    } catch (err: any) {
       console.error(`Error exporting as ${format}:`, err);
       toast.error(`Failed to export as ${format}: ${err.message || 'Unknown error'}`);
    }
  };

  // Get dimension display name
  const getDimensionDisplayName = (dimension: ReportDimension | string): string => {
    // Handle potential JSON path keys from grouping
    const cleanDimension = dimension.includes('->>') ? dimension.split('->>')[1] : dimension;
    switch (cleanDimension) {
      case 'user_id': return 'Team Member ID';
      case 'stepId': return 'Journey Step';
      case 'toolId': return 'Tool Used';
      case 'phaseId': return 'Journey Phase';
      case 'created_at': return 'Time Period';
      // Add more specific mappings if needed
      default: return cleanDimension.charAt(0).toUpperCase() + cleanDimension.slice(1); // Capitalize fallback
    }
  };

  // Get metric display name
  const getMetricDisplayName = (metric: ReportMetric): string => {
    switch (metric) {
      case 'count': return 'Count';
      case 'completion_rate': return 'Completion Rate';
      case 'time_spent': return 'Time Spent (Avg)'; // Assuming RPC/aggregation returns average
      case 'tool_adoption': return 'Tool Adoption Rate';
      default: return metric;
    }
  };

  // Render loading state
  if (loading && !isConfiguring) { // Show loading only when fetching, not during config
    return (
      <div className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
        <h2 className="text-lg font-medium mb-2">Multi-Dimensional Reporting</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
        <h2 className="text-lg font-medium mb-2">Multi-Dimensional Reporting</h2>
        <div className="text-red-500 dark:text-red-400">{error}</div>
      </div>
    );
  }

  // Determine headers dynamically based on reportData structure
  const renderTableHeaders = () => {
    if (!reportData || reportData.length === 0) return null;
    const firstRow = reportData[0];
    let headers: string[] = [];

    if ('groups' in firstRow && typeof firstRow.groups === 'object' && firstRow.groups !== null) {
       headers = Object.keys(firstRow.groups).map(key => getDimensionDisplayName(key));
    } else if ('time_bucket' in firstRow) {
       headers = ['Time Bucket'];
    }
    
    // Add the metric header
    headers.push(getMetricDisplayName(reportConfig.metrics[0] || 'Value'));

    return headers.map(header => (
      <th key={header} className="border p-2 text-left dark:text-gray-300">
        {header}
      </th>
    ));
  };

  // Render table rows dynamically
  const renderTableRows = () => {
    if (!reportData || reportData.length === 0) return null;

    // Use type guard to ensure reportData is an array before mapping
    if (!Array.isArray(reportData)) return null; 

    return reportData.map((row: AggregationResult | TimeSeriesDataPoint, index: number) => ( 
      <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
        {/* Render group values or time bucket */}
        {'groups' in row && typeof row.groups === 'object' && row.groups !== null ? (
          Object.values(row.groups).map((value: any, i: number) => ( // Add types
            <td key={i} className="border p-2 dark:text-gray-300">
              {String(value ?? 'N/A')}
            </td>
          ))
        ) : 'time_bucket' in row ? (
           <td className="border p-2 dark:text-gray-300">
             {new Date(row.time_bucket).toLocaleString()} {/* Format time */}
           </td>
        ) : null}
        {/* Render metric value */}
        <td className="border p-2 dark:text-gray-300">{row.value ?? 'N/A'}</td>
      </tr>
    ));
  };


  return (
    <div className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Multi-Dimensional Reporting</h2>
        
        <div className="space-x-2">
          <button
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            onClick={() => setIsConfiguring(!isConfiguring)}
          >
            {isConfiguring ? 'Run Report' : 'Configure'}
          </button>
           
           {/* Check if reportData is an array and has length */}
           {Array.isArray(reportData) && reportData.length > 0 && !isConfiguring && ( 
            <>
              <button
                className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                onClick={() => handleExport('csv')}
              >
                Export CSV
              </button>
               <button
                className="px-3 py-1 bg-teal-100 text-teal-700 rounded hover:bg-teal-200 transition-colors"
                onClick={() => handleExport('excel')}
              >
                Export Excel
              </button>
               <button
                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                onClick={() => handleExport('pdf')}
              >
                Export PDF
              </button>
            </>
          )}
        </div>
      </div>
      
      {isConfiguring ? (
        <div className="mb-6">
          <div className="mb-4">
            <h3 className="font-medium mb-2 dark:text-gray-200">Dimensions</h3>
            <div className="flex flex-wrap gap-2">
              {(['user', 'step', 'tool', 'phase', 'time'] as ReportDimension[]).map(dimension => (
                <button
                  key={dimension}
                  className={`px-3 py-1 rounded border ${
                    reportConfig.dimensions.includes(dimension)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-500'
                  }`}
                  onClick={() => toggleDimension(dimension)}
                >
                  {getDimensionDisplayName(dimension)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2 dark:text-gray-200">Metric (Select One)</h3>
            <div className="flex flex-wrap gap-2">
              {(['count', 'completion_rate', 'time_spent', 'tool_adoption'] as ReportMetric[]).map(metric => (
                <button
                  key={metric}
                  className={`px-3 py-1 rounded border ${
                    reportConfig.metrics.includes(metric) // Check if it's the selected one
                      ? 'bg-purple-500 text-white border-purple-500'
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-500'
                  }`}
                  onClick={() => toggleMetric(metric)}
                  // Disable unimplemented metrics
                  disabled={metric === 'completion_rate' || metric === 'time_spent' || metric === 'tool_adoption'} 
                >
                  {getMetricDisplayName(metric)}
                  {(metric === 'completion_rate' || metric === 'time_spent' || metric === 'tool_adoption') && <span className="ml-1 text-xs">(Coming Soon)</span>}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2 dark:text-gray-200">Date Range</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Start Date</label>
                <input
                  type="date"
                  className="w-full border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={reportConfig.dateRange.start.split('T')[0]}
                  onChange={e => {
                    setReportConfig(prev => ({
                      ...prev,
                      dateRange: {
                        ...prev.dateRange,
                        start: new Date(e.target.value).toISOString()
                      }
                    }));
                  }}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">End Date</label>
                <input
                  type="date"
                  className="w-full border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={reportConfig.dateRange.end.split('T')[0]}
                  onChange={e => {
                    setReportConfig(prev => ({
                      ...prev,
                      dateRange: {
                        ...prev.dateRange,
                        end: new Date(e.target.value).toISOString()
                      }
                    }));
                  }}
                />
              </div>
            </div>
          </div>
          {/* TODO: Add Filter options UI */}
        </div>
      ) : (
        <div>
          {/* Check if reportData is an array and has length */}
          {Array.isArray(reportData) && reportData.length > 0 ? ( 
            <div>
              <div className="mb-4">
                <h3 className="font-medium mb-2 dark:text-gray-200">Report Results</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse dark:border-gray-600">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        {renderTableHeaders()}
                      </tr>
                    </thead>
                    <tbody className="dark:bg-gray-800 dark:divide-gray-700">
                      {renderTableRows()}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {/* Check if reportData is an array before accessing length */}
                {Array.isArray(reportData) ? `${reportData.length} results found for your query.` : '0 results found.'} 
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No data available for the selected configuration.</p>
              <p className="text-sm mt-2">Try adjusting your dimensions, metrics, or date range, or run the report again.</p>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>This is a beta feature. Additional metrics and visualization options coming soon.</p>
      </div>
    </div>
  );
};

export default MultiDimensionalReporting;
