import React from 'react';
import { Users } from 'lucide-react';

interface InsightItem {
  title: string;
  value: string;
  description: string;
}

interface PeerInsightsProps {
  insights: InsightItem[];
}

/**
 * Component that displays insights from peers who have completed similar steps
 * Shows anonymous data to help guide the user
 */
const PeerInsights: React.FC<PeerInsightsProps> = ({ insights }) => {
  return (
    <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
      <div className="flex items-center mb-4">
        <Users className="h-5 w-5 text-indigo-500 mr-2" />
        <h2 className="text-lg font-medium text-gray-900">Peer Insights</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <div key={index} className="p-4 border border-gray-100 rounded-md bg-gray-50">
            <h3 className="text-sm font-medium text-gray-500 mb-1">{insight.title}</h3>
            <p className="text-lg font-semibold text-gray-900 mb-2">{insight.value}</p>
            <p className="text-xs text-gray-600">{insight.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PeerInsights;
