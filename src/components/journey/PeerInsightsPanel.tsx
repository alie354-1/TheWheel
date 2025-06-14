import React, { useEffect, useState } from 'react';
import { recommendationService, PeerInsight } from '../../lib/services/recommendation';
import { Card, Button, Skeleton, Badge } from '../ui';

interface PeerInsightsPanelProps {
  stepId: string;
  companyId: string;
}

export const PeerInsightsPanel: React.FC<PeerInsightsPanelProps> = ({ 
  stepId, 
  companyId 
}) => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<PeerInsight | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const recommendations = await recommendationService.getStepRecommendations(companyId, stepId);
        setInsights(recommendations.peerInsights);
      } catch (err) {
        console.error('Error fetching peer insights:', err);
        setError('Failed to load peer insights');
      } finally {
        setLoading(false);
      }
    };

    if (companyId && stepId) {
      fetchInsights();
    }
  }, [companyId, stepId]);

  if (loading) {
    return (
      <Card className="p-4 shadow-md">
        <h3 className="text-lg font-semibold mb-4">Peer Insights</h3>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <div className="pt-2">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 shadow-md">
        <h3 className="text-lg font-semibold mb-4">Peer Insights</h3>
        <div className="bg-red-50 p-3 rounded-md text-red-600">
          {error}
        </div>
      </Card>
    );
  }

  if (!insights || insights.relevanceScore < 0.1) {
    return (
      <Card className="p-4 shadow-md">
        <h3 className="text-lg font-semibold mb-4">Peer Insights</h3>
        <div className="text-center py-6 text-gray-500">
          <p>No peer insights available for this step yet.</p>
          <p className="text-sm mt-2">Be the first to complete this step and share your experience!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Peer Insights</h3>
        <Badge variant="outline" className="text-xs">
          {insights.relevanceScore >= 0.7 ? 'High Confidence' : 
           insights.relevanceScore >= 0.4 ? 'Medium Confidence' : 'Low Confidence'}
        </Badge>
      </div>
      
      <div className="space-y-4">
        {insights.avgTimeToComplete && (
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="flex items-center text-blue-700 font-medium mb-1">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Average Completion Time
            </div>
            <p className="text-blue-600">
              Most founders complete this step in <strong>{insights.avgTimeToComplete} days</strong>
            </p>
          </div>
        )}
        
        {insights.commonBlockers && insights.commonBlockers.length > 0 && (
          <div className="bg-red-50 p-3 rounded-md">
            <div className="flex items-center text-red-700 font-medium mb-1">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Common Challenges
            </div>
            <ul className="text-red-600 list-disc list-inside">
              {insights.commonBlockers.map((blocker, index) => (
                <li key={index}>{blocker}</li>
              ))}
            </ul>
          </div>
        )}
        
        {insights.successStrategies && insights.successStrategies.length > 0 && (
          <div className="bg-green-50 p-3 rounded-md">
            <div className="flex items-center text-green-700 font-medium mb-1">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Success Strategies
            </div>
            <ul className="text-green-600 list-disc list-inside">
              {insights.successStrategies.map((strategy, index) => (
                <li key={index}>{strategy}</li>
              ))}
            </ul>
          </div>
        )}
        
        {insights.outcomeMetrics && insights.outcomeMetrics.length > 0 && (
          <div className="bg-purple-50 p-3 rounded-md">
            <div className="flex items-center text-purple-700 font-medium mb-1">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Business Outcomes
            </div>
            <ul className="text-purple-600 list-disc list-inside">
              {insights.outcomeMetrics.map((metric: any, index) => (
                <li key={index}>
                  {metric.metric}: {typeof metric.value === 'object' 
                    ? JSON.stringify(metric.value) 
                    : metric.value}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-3">
          These insights are gathered from other founders who have completed this step.
        </p>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => window.location.href = `/community/discussions?step=${stepId}&source=journey`}
        >
          Discuss With Peers
        </Button>
      </div>
    </Card>
  );
};
