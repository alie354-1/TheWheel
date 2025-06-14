import React, { useState, useEffect } from "react";
import { journeyProgressService, ProgressAnalytics, SmartRecommendation } from "../../../../lib/services/journeyProgress.service";
import { communityJourneyIntegrationService, PeerProgress } from "../../../../lib/services/communityJourneyIntegration.service";
import { useCompany } from "../../../../lib/hooks/useCompany";

interface SmartJourneyDashboardProps {
  companyId?: string;
  showRecommendations?: boolean;
  showPeerInsights?: boolean;
  showProgress?: boolean;
}

const SmartJourneyDashboard: React.FC<SmartJourneyDashboardProps> = ({
  companyId: propCompanyId,
  showRecommendations = true,
  showPeerInsights = true,
  showProgress = true
}) => {
  const { currentCompany } = useCompany();
  const companyId = propCompanyId || currentCompany?.id;

  const [analytics, setAnalytics] = useState<ProgressAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [peerProgress, setPeerProgress] = useState<PeerProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      loadDashboardData();
    }
  }, [companyId]);

  const loadDashboardData = async () => {
    if (!companyId) return;

    try {
      setLoading(true);

      const promises = [];

      if (showProgress) {
        promises.push(journeyProgressService.getProgressAnalytics(companyId));
      }

      if (showRecommendations) {
        promises.push(journeyProgressService.getSmartRecommendations(companyId));
      }

      if (showPeerInsights) {
        promises.push(communityJourneyIntegrationService.getPeerProgress(companyId, {
          anonymized: true,
          limit: 5
        }));
      }

      const results = await Promise.all(promises);
      
      let resultIndex = 0;
      if (showProgress) {
        setAnalytics(results[resultIndex++] as ProgressAnalytics);
      }
      if (showRecommendations) {
        setRecommendations(results[resultIndex++] as SmartRecommendation[]);
      }
      if (showPeerInsights) {
        setPeerProgress(results[resultIndex++] as PeerProgress[]);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-blue-600';
    if (rate >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Smart Recommendations */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Smart Recommendations</h3>
              <p className="text-gray-600 mt-1">AI-powered suggestions based on your progress</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recommendations.slice(0, 3).map(rec => (
                  <div
                    key={rec.id}
                    className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeColor(rec.priority)}`}>
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{rec.description}</p>
                        <p className="text-sm text-gray-600">{rec.estimatedImpact}</p>
                        
                        {rec.actionItems.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Action Items:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {rec.actionItems.slice(0, 3).map((item, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-blue-500 mr-2">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Progress Analytics */}
        {showProgress && analytics && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getProgressColor(analytics.completionRate)}`}>
                    {Math.round(analytics.completionRate)}%
                  </div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {analytics.completedSteps}/{analytics.totalSteps}
                  </div>
                  <div className="text-sm text-gray-600">Steps</div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Phase</span>
                  <span className="font-medium">{analytics.currentPhase}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-medium text-blue-600">{analytics.inProgressSteps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Blocked</span>
                  <span className="font-medium text-red-600">{analytics.blockedSteps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Completion</span>
                  <span className="font-medium">{analytics.estimatedCompletionDays} days</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Peer Insights */}
        {showPeerInsights && peerProgress.length > 0 && (
          <div className="bg-blue-50 rounded-lg shadow">
            <div className="p-6 border-b border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900">Peer Insights</h3>
              <p className="text-blue-700 mt-1">See how similar companies are progressing</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {peerProgress.map(peer => (
                  <div key={peer.companyId} className="bg-white rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">{peer.companyName}</div>
                      <div className={`text-sm font-medium ${getProgressColor(peer.completionRate)}`}>
                        {Math.round(peer.completionRate)}%
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {peer.industry} • {peer.currentPhase}
                    </div>
                    {peer.recentMilestones.length > 0 && (
                      <div className="text-xs text-gray-500">
                        Recent: {peer.recentMilestones[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartJourneyDashboard;
