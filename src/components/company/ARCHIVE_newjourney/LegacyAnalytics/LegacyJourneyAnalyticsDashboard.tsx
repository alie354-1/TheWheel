import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchAnalyticsAggregates,
  fetchAnalyticsEvents
} from '../../../../lib/services/analytics.service';
import { useCompany } from '../../../../lib/hooks/useCompany';
import { useJourneyPreferences } from '../../../../lib/hooks/useJourneyPreferences';
import { companyService } from '../../../../lib/services/company.service';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// Chart components would be imported from a charting library like recharts
// For this implementation, we'll structure it to be ready for such integration

interface JourneyAnalyticsDashboardProps {
  companyId?: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  showPredictions?: boolean;
  className?: string;
}

const JourneyAnalyticsDashboard: React.FC<JourneyAnalyticsDashboardProps> = ({
  companyId: propCompanyId,
  timeRange = 'month',
  showPredictions = true,
}) => {
  // Get company ID from URL params if not provided as prop
  const { companyId: urlCompanyId } = useParams<{ companyId: string }>();
  const companyId = propCompanyId || urlCompanyId;
  
  // Get company data and journey preferences
  const companyContext = useCompany();
  const companyLoading = companyContext.loading;
  
  const preferencesContext = useJourneyPreferences();
  const preferencesLoading = preferencesContext.isLoading;
  
  // State for analytics data
  const [completionRate, setCompletionRate] = useState<number | null>(null);
  const [toolAdoptionRate, setToolAdoptionRate] = useState<number | null>(null);
  const [progressTrend, setProgressTrend] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for company profile
  const [companyProfile, setCompanyProfile] = useState<any>(null);

  // State for cohort benchmarking
  const [cohortAverages, setCohortAverages] = useState<{ completionRate: number | null; toolAdoptionRate: number | null } | null>(null);
  const [cohortEnabled, setCohortEnabled] = useState(true);

  // Export CSV
  const exportCSV = () => {
    // Export progress trend as CSV
    const headers = ["Date", "Steps Completed"];
    const rows = progressTrend.map((row: any) => [row.date, row.value]);
    const csvContent =
      [headers, ...rows]
        .map((e) => e.map((v) => `"${v}"`).join(","))
        .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics_progress_trend.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>(timeRange);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>(() => {
    // Calculate date range based on timeRange prop
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

    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  });

  // Update dateRange when selectedTimeRange changes
  useEffect(() => {
    const end = new Date();
    let start = new Date();

    switch (selectedTimeRange) {
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

    setDateRange({
      start: start.toISOString(),
      end: end.toISOString()
    });
  }, [selectedTimeRange]);
  
  // Fetch analytics data and company profile
  useEffect(() => {
    if (!companyId) return;

    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        // Fetch company profile
        const profile = await companyService.getCompany(companyId);
        setCompanyProfile(profile);

        // Fetch aggregates for metrics
        const aggregates = await fetchAnalyticsAggregates(companyId);

        // Find completion rate and tool adoption rate from aggregates
        const completionAgg = aggregates.find(
          (agg) => agg.metric_name === "completion_rate"
        );
        setCompletionRate(
          completionAgg && typeof completionAgg.value === "number"
            ? completionAgg.value
            : null
        );

        const adoptionAgg = aggregates.find(
          (agg) => agg.metric_name === "tool_adoption_rate"
        );
        setToolAdoptionRate(
          adoptionAgg && typeof adoptionAgg.value === "number"
            ? adoptionAgg.value
            : null
        );

        // Build progress trend from step_completed events
        const events = await fetchAnalyticsEvents(companyId);
        // Filter for step_completed events in date range
        const stepEvents = events.filter(
          (e) =>
            e.event_name === "step_completed" &&
            e.created_at >= dateRange.start &&
            e.created_at <= dateRange.end
        );
        // Group by date
        const trendMap: { [date: string]: number } = {};
        stepEvents.forEach((e) => {
          const date = e.created_at.slice(0, 10);
          trendMap[date] = (trendMap[date] || 0) + 1;
        });
        const trendArr = Object.entries(trendMap)
          .map(([date, value]) => ({ date, value }))
          .sort((a, b) => a.date.localeCompare(b.date));
        setProgressTrend(trendArr);

        // Recent activity: show last 3 events (any type)
        setRecentActivity(events.slice(0, 3));

        // --- Cohort Benchmarking ---
        // Only run if enabled and profile is available and has cohort fields
        if (cohortEnabled && profile && (profile.industry || profile.size || profile.stage)) {
          // Query companies in the same cohort (excluding current company)
          const { data: cohortCompanies, error: cohortError } = await (window as any).supabase
            .from('companies')
            .select('id')
            .neq('id', companyId)
            .eq('industry', profile.industry || null)
            .eq('size', profile.size || null)
            .eq('stage', profile.stage || null);

          if (cohortError) {
            setCohortAverages(null);
          } else if (cohortCompanies && cohortCompanies.length > 0) {
            // Fetch aggregates for each cohort company
            const cohortIds = cohortCompanies.map((c: any) => c.id);
            let completionRates: number[] = [];
            let adoptionRates: number[] = [];
            for (const cohortId of cohortIds) {
              try {
                const cohortAggs = await fetchAnalyticsAggregates(cohortId);
                const cAgg = cohortAggs.find((agg) => agg.metric_name === "completion_rate");
                const aAgg = cohortAggs.find((agg) => agg.metric_name === "tool_adoption_rate");
                if (cAgg && typeof cAgg.value === "number") completionRates.push(cAgg.value);
                if (aAgg && typeof aAgg.value === "number") adoptionRates.push(aAgg.value);
              } catch (e) {
                // Ignore errors for individual companies
              }
            }
            // Compute averages
            const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
            setCohortAverages({
              completionRate: avg(completionRates),
              toolAdoptionRate: avg(adoptionRates)
            });
          } else {
            setCohortAverages(null);
          }
        } else {
          setCohortAverages(null);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to load analytics data. Please try again later.");
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [companyId, dateRange]);

  // Calculate predicted completion date
  const getPredictedCompletionDate = (): string => {
    if (!progressTrend || progressTrend.length === 0 || !showPredictions) {
      return 'Not available';
    }
    
    // Simple linear prediction based on completion rate and trend
    // This would be replaced by a more sophisticated algorithm in production
    const completionPerDay = progressTrend.reduce((sum, point) => sum + point.value, 0) / progressTrend.length;
    
    if (completionPerDay <= 0) {
      return 'Not available';
    }
    
    // Assuming completionRate is a percentage (0-1) and we know the total number of steps
    const totalSteps = 100; // This would come from actual data in production
    const completedSteps = Math.round((completionRate || 0) * totalSteps);
    const remainingSteps = totalSteps - completedSteps;
    
    const daysToCompletion = Math.ceil(remainingSteps / completionPerDay);
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysToCompletion);
    
    return completionDate.toLocaleDateString();
  };

  // Identify bottlenecks
  const getBottlenecks = (): string[] => {
    // This would use actual data in production
    // For now, return placeholder bottlenecks
    return [
      'Team onboarding (3 weeks behind)',
      'Market research phase (2 steps stuck)',
      'Financial planning (completion rate 25%)'
    ];
  };

  // Loading and error states
  if (companyLoading || preferencesLoading || loading) {
    return <div className="p-4 text-center">Loading analytics data...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Journey Analytics Dashboard</h2>
      
      {/* Cohort Profile Debug */}
      {companyProfile && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="font-semibold mb-1 flex items-center gap-4">
            Cohort Profile
            <label className="flex items-center gap-2 text-xs font-normal">
              <input
                type="checkbox"
                checked={cohortEnabled}
                onChange={e => setCohortEnabled(e.target.checked)}
              />
              Enable Cohort Benchmarking
            </label>
          </div>
          <div>
            <span className="mr-4">Industry: <span className="font-mono">{companyProfile.industry || "N/A"}</span></span>
            <span className="mr-4">Size: <span className="font-mono">{companyProfile.size || "N/A"}</span></span>
            <span className="mr-4">Stage: <span className="font-mono">{companyProfile.stage || "N/A"}</span></span>
          </div>
        </div>
      )}

      {/* Export Buttons */}
      <div className="mb-4 flex gap-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={exportCSV}
        >
          Export CSV
        </button>
        {/* PDF export can be added here */}
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
        <select 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={selectedTimeRange}
          onChange={(e) => {
            setSelectedTimeRange(e.target.value as 'week' | 'month' | 'quarter' | 'year');
          }}
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="quarter">Last 90 Days</option>
          <option value="year">Last 365 Days</option>
        </select>
      </div>
      
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-700">Completion Rate</h3>
          <p className="text-3xl font-bold mt-2">
            {completionRate !== null ? `${Math.round((completionRate || 0) * 100)}%` : 'N/A'}
          </p>
          {cohortAverages && (
            <div className="text-xs text-blue-700 mt-1">
              Cohort Avg: {cohortAverages.completionRate !== null ? `${Math.round(cohortAverages.completionRate * 100)}%` : 'N/A'}
            </div>
          )}
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-green-700">Tool Adoption Rate</h3>
          <p className="text-3xl font-bold mt-2">
            {toolAdoptionRate !== null ? `${Math.round((toolAdoptionRate || 0) * 100)}%` : 'N/A'}
          </p>
          {cohortAverages && (
            <div className="text-xs text-green-700 mt-1">
              Cohort Avg: {cohortAverages.toolAdoptionRate !== null ? `${Math.round(cohortAverages.toolAdoptionRate * 100)}%` : 'N/A'}
            </div>
          )}
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-purple-700">Active Steps</h3>
          <p className="text-3xl font-bold mt-2">
            {/* This would be calculated from actual data */}
            5
          </p>
        </div>
      </div>
      
      {/* Progress Trend Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Progress Trend</h3>
        <div className="bg-gray-100 p-4 rounded-lg h-64 flex items-center justify-center">
          {progressTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={progressTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" name="Steps Completed" stroke="#8884d8" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">
              No progress data available for the selected time period
            </p>
          )}
        </div>
      </div>
      
      {/* Predictive Insights */}
      {showPredictions && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Predictive Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-700">Estimated Completion Date</h4>
              <p className="text-xl font-bold mt-2">{getPredictedCompletionDate()}</p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium text-red-700">Identified Bottlenecks</h4>
              <ul className="mt-2 space-y-1">
                {getBottlenecks().map((bottleneck, index) => (
                  <li key={index} className="text-sm">{bottleneck}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">Recent Activity</h3>
        <ul className="space-y-2">
          {recentActivity.length > 0 ? (
            recentActivity.map((event, idx) => (
              <li key={event.id || idx} className="p-3 bg-gray-50 rounded-md">
                <span className="font-medium">{event.event_name}</span>
                {event.user_id && (
                  <>
                    {" "}
                    by <span className="text-blue-600">{event.user_id}</span>
                  </>
                )}
                <span className="block text-xs text-gray-500 mt-1">
                  {new Date(event.created_at).toLocaleString()}
                </span>
              </li>
            ))
          ) : (
            <li className="p-3 bg-gray-50 rounded-md text-gray-500">
              No recent activity found.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default JourneyAnalyticsDashboard;
