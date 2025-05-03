import React, { useState, useEffect } from 'react';
import { useCompany } from '@/lib/hooks/useCompany';
import { RecommendationService } from '@/lib/services/recommendation.service';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement
);

interface JourneyAnalyticsDashboardProps {
  className?: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year' | 'all';
}

/**
 * JourneyAnalyticsDashboard Component
 * 
 * A comprehensive analytics dashboard for company journey progress visualization
 * Part of Sprint 3 Journey UI enhancements
 */
export const JourneyAnalyticsDashboard: React.FC<JourneyAnalyticsDashboardProps> = ({
  className = '',
  timeRange = 'month'
}) => {
  const { currentCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'phases' | 'comparison'>('overview');

  // Load analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!currentCompany?.id) return;
      
      setLoading(true);
      try {
        const data = await RecommendationService.getJourneyAnalytics(currentCompany.id);
        setAnalytics(data);
      } catch (error) {
        console.error('Error loading journey analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [currentCompany?.id, timeRange]);

  // Prepare chart data
  const getPhaseCompletionData = () => {
    if (!analytics?.phaseStatistics) return null;
    
    return {
      labels: analytics.phaseStatistics.map((stat: any) => stat.phase_name),
      datasets: [
        {
          label: 'Completed Steps',
          data: analytics.phaseStatistics.map((stat: any) => stat.completed_count),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
        {
          label: 'Total Steps',
          data: analytics.phaseStatistics.map((stat: any) => stat.total_count),
          backgroundColor: 'rgba(201, 203, 207, 0.6)',
        }
      ]
    };
  };

  const getCompletionTimeData = () => {
    if (!analytics?.completionTimeStatistics) return null;
    
    return {
      labels: analytics.completionTimeStatistics.map((stat: any) => stat.step_name),
      datasets: [
        {
          label: 'Actual Time (days)',
          data: analytics.completionTimeStatistics.map((stat: any) => stat.actual_days),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Estimated Time (days)',
          data: analytics.completionTimeStatistics.map((stat: any) => stat.estimated_days),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        }
      ]
    };
  };

  const getIndustryComparisonData = () => {
    if (!analytics?.industryComparison) return null;
    
    return {
      labels: ['Your Company', 'Industry Average', 'Top Performers'],
      datasets: [
        {
          label: 'Completion Rate (%)',
          data: [
            analytics.industryComparison.your_completion_rate,
            analytics.industryComparison.industry_average,
            analytics.industryComparison.top_performers_average
          ],
          backgroundColor: [
            'rgba(255, 206, 86, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(75, 192, 192, 0.6)'
          ],
          borderColor: [
            'rgba(255, 206, 86, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1,
        }
      ]
    };
  };

  // Render loading state
  if (loading) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Render error state if data couldn't be loaded
  if (!analytics) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-16 h-16 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="mt-4 text-gray-600">Failed to load analytics data</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-blue-700 px-6 py-4">
        <h2 className="text-xl font-bold text-white">Journey Analytics Dashboard</h2>
        <p className="text-blue-100 text-sm">Track your progress and compare with similar companies</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            className={`px-6 py-3 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-6 py-3 border-b-2 font-medium text-sm ${
              activeTab === 'phases'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('phases')}
          >
            Phase Progress
          </button>
          <button
            className={`px-6 py-3 border-b-2 font-medium text-sm ${
              activeTab === 'comparison'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('comparison')}
          >
            Industry Comparison
          </button>
        </nav>
      </div>

      {/* Time Range Selector */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Time Range:</span>
          <div className="flex space-x-2">
            {(['week', 'month', 'quarter', 'year', 'all'] as const).map((range) => (
              <button
                key={range}
                className={`px-3 py-1 text-xs rounded-full ${
                  timeRange === range
                    ? 'bg-blue-100 text-blue-800 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => {/* setTimeRange(range) */}}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Completion Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.industryComparison?.your_completion_rate || 0}%
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  <span className={analytics.industryComparison?.comparison_to_average > 0 ? 'text-green-500' : 'text-red-500'}>
                    {analytics.industryComparison?.comparison_to_average > 0 ? '↑' : '↓'} 
                    {Math.abs(analytics.industryComparison?.comparison_to_average || 0)}%
                  </span>
                  {' from industry average'}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Steps Completed</p>
                <p className="text-2xl font-bold text-teal-600">
                  {analytics.phaseStatistics?.reduce((acc: number, stat: any) => acc + stat.completed_count, 0) || 0}/
                  {analytics.phaseStatistics?.reduce((acc: number, stat: any) => acc + stat.total_count, 0) || 0}
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  {analytics.completionTimeStatistics?.length > 0 ? `Last completed: ${analytics.completionTimeStatistics[0].step_name}` : 'No steps completed yet'}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Avg. Completion Time</p>
                <p className="text-2xl font-bold text-purple-600">
                  {analytics.completionTimeStatistics?.length > 0 
                    ? (analytics.completionTimeStatistics.reduce((acc: number, stat: any) => acc + stat.actual_days, 0) / analytics.completionTimeStatistics.length).toFixed(1) 
                    : 0} days
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  Per step (estimated: {analytics.completionTimeStatistics?.length > 0 
                    ? (analytics.completionTimeStatistics.reduce((acc: number, stat: any) => acc + stat.estimated_days, 0) / analytics.completionTimeStatistics.length).toFixed(1) 
                    : 0} days)
                </div>
              </div>
            </div>

            {/* Main Chart - Completion Over Time */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Completion Progress Over Time</h3>
              <div className="h-64">
                <Line 
                  data={{
                    labels: Array.from({ length: 12 }, (_, i) => {
                      const date = new Date();
                      date.setMonth(date.getMonth() - 11 + i);
                      return date.toLocaleDateString('en-US', { month: 'short' });
                    }),
                    datasets: [
                      {
                        label: 'Completed Steps',
                        data: [2, 5, 8, 12, 15, 18, 22, 25, 28, 30, 32, 35],
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.4,
                        fill: true
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'phases' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Phase Completion Chart */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Phase Completion Progress</h3>
              <div className="h-64">
                <Bar 
                  data={getPhaseCompletionData() || {
                    labels: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5'],
                    datasets: [
                      {
                        label: 'Completed Steps',
                        data: [5, 3, 2, 1, 0],
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                      },
                      {
                        label: 'Total Steps',
                        data: [5, 8, 6, 4, 3],
                        backgroundColor: 'rgba(201, 203, 207, 0.6)',
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        stacked: true,
                      },
                      y: {
                        stacked: false
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Time Estimation Accuracy */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Time Estimation Accuracy</h3>
              <div className="h-64">
                <Bar 
                  data={getCompletionTimeData() || {
                    labels: ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'],
                    datasets: [
                      {
                        label: 'Actual Time (days)',
                        data: [3, 5, 2, 7, 4],
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                      },
                      {
                        label: 'Estimated Time (days)',
                        data: [2, 4, 3, 5, 3],
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'comparison' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Industry Comparison */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Industry Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64">
                  <Pie 
                    data={getIndustryComparisonData() || {
                      labels: ['Your Company', 'Industry Average', 'Top Performers'],
                      datasets: [
                        {
                          label: 'Completion Rate (%)',
                          data: [65, 60, 85],
                          backgroundColor: [
                            'rgba(255, 206, 86, 0.6)',
                            'rgba(153, 102, 255, 0.6)',
                            'rgba(75, 192, 192, 0.6)'
                          ],
                          borderColor: [
                            'rgba(255, 206, 86, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(75, 192, 192, 1)'
                          ],
                          borderWidth: 1,
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-medium text-gray-700 mb-4">How You Compare</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Your Completion</span>
                        <span className="text-sm font-medium text-gray-700">
                          {analytics.industryComparison?.your_completion_rate || 65}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${analytics.industryComparison?.your_completion_rate || 65}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Industry Average</span>
                        <span className="text-sm font-medium text-gray-700">
                          {analytics.industryComparison?.industry_average || 60}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-400 h-2 rounded-full" 
                          style={{ width: `${analytics.industryComparison?.industry_average || 60}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Top Performers</span>
                        <span className="text-sm font-medium text-gray-700">
                          {analytics.industryComparison?.top_performers_average || 85}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-teal-400 h-2 rounded-full" 
                          style={{ width: `${analytics.industryComparison?.top_performers_average || 85}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step Comparison Table */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Popular Steps in Your Industry</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Step Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Industry Adoption
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg. Completion Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Your Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Placeholder rows - would be populated from analytics data */}
                    {[1, 2, 3, 4, 5].map((_, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Top Industry Step {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {90 - index * 10}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 2} days
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            index < 2 ? 'bg-green-100 text-green-800' : index < 4 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {index < 2 ? 'Completed' : index < 4 ? 'In Progress' : 'Not Started'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default JourneyAnalyticsDashboard;
