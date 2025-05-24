import React, { useState, useEffect } from 'react';
import { getTimeSeriesData } from '../../../lib/services/analytics.service';

interface PredictiveInsightsPanelProps {
  companyId?: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  className?: string;
}

/**
 * PredictiveInsightsPanel displays AI-generated predictions and insights
 * based on analytics data.
 */
const PredictiveInsightsPanel: React.FC<PredictiveInsightsPanelProps> = ({
  companyId,
  timeRange = 'month',
  className = '',
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<Array<{
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    type: 'prediction' | 'recommendation' | 'alert';
  }>>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  
  // Calculate date range based on timeRange
  const getDateRange = () => {
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
  };

  // Fetch data and generate insights
  useEffect(() => {
    const fetchDataAndGenerateInsights = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const dateRange = getDateRange();
        
        // Fetch time series data for various metrics
        const stepCompletionData = await getTimeSeriesData({
          metric: 'count',
          event_name: 'step_completed',
          interval: 'day',
          filters: companyId ? { company_id: companyId } : undefined,
          start_date: dateRange.start,
          end_date: dateRange.end
        });
        
        const toolSelectionData = await getTimeSeriesData({
          metric: 'count',
          event_name: 'tool_selected',
          interval: 'day',
          filters: companyId ? { company_id: companyId } : undefined,
          start_date: dateRange.start,
          end_date: dateRange.end
        });
        
        // Store the time series data for analysis (handle null cases)
        setTimeSeriesData([
          ...(stepCompletionData || []),
          ...(toolSelectionData || [])
        ]);
        
        // Generate insights based on the data
        // In a real implementation, this would use more sophisticated
        // analysis and possibly call an AI model
        const generatedInsights = generateInsights(
          stepCompletionData || [],
          toolSelectionData || []
        );
        setInsights(generatedInsights);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data for insights:', err);
        setError('Failed to load predictive insights. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDataAndGenerateInsights();
  }, [companyId, timeRange]);

  // Type definition for an insight
  type Insight = {
    title: string;
    description: string; 
    severity: 'low' | 'medium' | 'high';
    type: 'prediction' | 'recommendation' | 'alert';
  };

  /**
   * Generate insights from the time series data
   * This is a simplified version - in production, more sophisticated 
   * algorithms or AI models would be used
   */
  const generateInsights = (stepData: any[] = [], toolData: any[] = []): Insight[] => {
    const insights: Insight[] = [];
    
    // Detect trend in step completion
    if (stepData && stepData.length >= 7) {
      const recentValues = stepData.slice(-7).map(point => point.value);
      const averageRecent = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
      const earlierValues = stepData.slice(0, 7).map(point => point.value);
      const averageEarlier = earlierValues.reduce((sum, val) => sum + val, 0) / earlierValues.length;
      
      if (averageRecent < averageEarlier * 0.8) {
        insights.push({
          title: 'Slowing Progress',
          description: 'Step completion rate has decreased by 20% or more in the last week. Consider checking for bottlenecks.',
          severity: 'high',
          type: 'alert'
        });
      } else if (averageRecent > averageEarlier * 1.5) {
        insights.push({
          title: 'Accelerating Progress',
          description: 'Your team is completing steps 50% faster than before. Keep up the momentum!',
          severity: 'low',
          type: 'prediction'
        });
      }
    }
    
    // Detect tool adoption patterns
    if (toolData && toolData.length > 0) {
      const totalToolSelections = toolData.reduce((sum, point) => sum + point.value, 0);
      
      if (totalToolSelections === 0) {
        insights.push({
          title: 'Low Tool Adoption',
          description: 'Your team hasn\'t selected any recommended tools. Consider reviewing tool recommendations for relevance.',
          severity: 'medium',
          type: 'recommendation'
        });
      } else if (totalToolSelections > 5) {
        insights.push({
          title: 'High Tool Engagement',
          description: 'Your team is actively selecting tools. Consider setting up integration training sessions.',
          severity: 'low',
          type: 'recommendation'
        });
      }
    }
    
    // Add placeholder insights if we don't have enough data
    if (insights.length === 0) {
      insights.push({
        title: 'Continue Current Pace',
        description: 'Based on current progress, maintaining your team\'s pace will lead to on-time completion.',
        severity: 'low',
        type: 'prediction'
      });
      
      insights.push({
        title: 'Consider Tool Exploration',
        description: 'Explore available tools in the marketplace to potentially accelerate your journey progress.',
        severity: 'low',
        type: 'recommendation'
      });
    }
    
    return insights;
  };

  // Render loading state
  if (loading) {
    return (
      <div className={`p-4 bg-white rounded-lg shadow ${className}`}>
        <h2 className="text-lg font-medium mb-2">Predictive Insights</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`p-4 bg-white rounded-lg shadow ${className}`}>
        <h2 className="text-lg font-medium mb-2">Predictive Insights</h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Function to get color class based on severity
  const getSeverityColorClass = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  // Function to get icon based on insight type
  const getInsightTypeIcon = (type: 'prediction' | 'recommendation' | 'alert') => {
    switch (type) {
      case 'prediction':
        return '🔮';
      case 'recommendation':
        return '💡';
      case 'alert':
        return '⚠️';
      default:
        return '📊';
    }
  };

  return (
    <div className={`p-4 bg-white rounded-lg shadow ${className}`}>
      <h2 className="text-xl font-medium mb-4">Predictive Insights</h2>
      
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className={`p-3 border-l-4 rounded ${getSeverityColorClass(insight.severity)}`}
          >
            <div className="flex items-start">
              <span className="text-2xl mr-3">{getInsightTypeIcon(insight.type)}</span>
              <div>
                <h3 className="font-medium">{insight.title}</h3>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {insights.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <p>Not enough data to generate insights yet.</p>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Insights are generated based on historical data and patterns. They are intended as guidance and may not reflect all factors.</p>
      </div>
    </div>
  );
};

export default PredictiveInsightsPanel;
