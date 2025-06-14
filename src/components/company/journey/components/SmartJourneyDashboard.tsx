import React from "react";

/**
 * SmartJourneyDashboard
 * 
 * Displays personalized recommendations, peer insights, and progress summary
 * for the journey dashboard.
 * 
 * Props:
 * - recommendations: array (recommended next steps)
 * - peerInsights: array (peer trends, stats)
 * - progressSummary: object (progress by area)
 */
export const SmartJourneyDashboard: React.FC<{
  recommendations: any[];
  peerInsights: any[];
  progressSummary: any;
}> = ({
  recommendations,
  peerInsights,
  progressSummary
}) => {
  return (
    <section className="mb-8">
      {/* Recommendations removed */}
      {/* Peer Insights */}
      <div className="bg-blue-50 rounded-lg shadow p-6 mb-4">
        <h2 className="text-lg font-semibold mb-2 text-blue-800">Peer Insights</h2>
        {peerInsights.length === 0 ? (
          <p className="text-gray-500">No peer insights available yet.</p>
        ) : (
          <ul className="space-y-1">
            {peerInsights.map((insight, idx) => (
              <li key={idx} className="text-sm text-blue-900">
                {insight}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Progress Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">Your Progress</h2>
        {progressSummary ? (
          <div className="flex flex-wrap gap-6">
            {Object.entries(progressSummary).map(([area, percent]: [string, any]) => (
              <div key={area} className="flex flex-col items-center">
                <div className="text-sm font-medium text-gray-700">{area}</div>
                <div className="text-2xl font-bold text-blue-700">{percent}%</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No progress data available yet.</p>
        )}
      </div>
    </section>
  );
};

export default SmartJourneyDashboard;
