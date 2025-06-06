import React, { useState, useEffect } from 'react';
import { DeckService, DeckAnalytics } from '../services/deckService';
import { 
  BarChart3, 
  Eye, 
  Users, 
  Clock, 
  Calendar,
  TrendingUp,
  Globe,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface AnalyticsDashboardProps {
  deckId: string;
  deckTitle: string;
}

export function AnalyticsDashboard({ deckId, deckTitle }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<DeckAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [deckId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DeckService.getAnalytics(deckId);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-6">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-6">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const hasData = analytics.totalViews > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
              <p className="text-sm text-gray-500">{deckTitle}</p>
            </div>
          </div>
          <button
            onClick={loadAnalytics}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="p-6">
        {!hasData ? (
          /* No Data State */
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Views Yet</h3>
            <p className="text-gray-500 mb-6">
              Share your presentation to start collecting analytics data
            </p>
          </div>
        ) : (
          /* Analytics Content */
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                icon={<Eye className="h-5 w-5" />}
                title="Total Views"
                value={analytics.totalViews.toString()}
                color="blue"
              />
              
              <MetricCard
                icon={<Users className="h-5 w-5" />}
                title="Unique Viewers"
                value={analytics.uniqueViewers.toString()}
                color="green"
              />
              
              <MetricCard
                icon={<Clock className="h-5 w-5" />}
                title="Avg. Session"
                value={formatDuration(analytics.avgSessionDuration)}
                color="purple"
              />
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Engagement Rate</h4>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalViews > 0 
                    ? Math.round((analytics.uniqueViewers / analytics.totalViews) * 100)
                    : 0}%
                </p>
                <p className="text-sm text-gray-500">
                  Unique viewers per total views
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Total Sections</h4>
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalSections}
                </p>
                <p className="text-sm text-gray-500">
                  Slides in presentation
                </p>
              </div>
            </div>

            {/* View History Chart */}
            {analytics.viewHistory && analytics.viewHistory.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">View History</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-end space-x-2 h-32">
                    {analytics.viewHistory.slice(-14).map((day, index) => {
                      const maxViews = Math.max(...analytics.viewHistory.map(d => d.views));
                      const height = maxViews > 0 ? (day.views / maxViews) * 100 : 0;
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-blue-500 rounded-t-sm min-h-[4px] transition-all duration-300"
                            style={{ height: `${Math.max(height, 4)}%` }}
                            title={`${day.views} views on ${formatDate(day.date)}`}
                          />
                          <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left">
                            {formatDate(day.date)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: 'blue' | 'green' | 'purple' | 'red';
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
}

function MetricCard({ icon, title, value, color, trend }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    red: 'text-red-600 bg-red-50',
  };

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${
            trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.direction === 'up' ? (
              <ArrowUp className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDown className="h-3 w-3 mr-1" />
            )}
            {trend.value}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
    </div>
  );
}
