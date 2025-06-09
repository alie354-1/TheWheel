import React, { useEffect, useState } from 'react';
import { Recommendation } from '../../lib/services/ai-recommendation';
import { useAuth } from '../../lib/hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { RealAiRecommendationService } from '../../lib/services/ai-recommendation';
import { Lightbulb, Zap, Users, FileText } from 'lucide-react';
import RecommendationFeedback from './RecommendationFeedback';

const recommendationService = new RealAiRecommendationService(supabase);

const iconMap = {
  step: <Lightbulb className="h-5 w-5 text-yellow-400" />,
  expert: <Users className="h-5 w-5 text-blue-400" />,
  template: <FileText className="h-5 w-5 text-green-400" />,
};

export const AiRecommendationPanel: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setLoading(true);
      recommendationService.getStepRecommendations(user.id)
        .then(setRecommendations)
        .catch(err => {
          console.error("Error fetching recommendations:", err);
          setError("Could not load recommendations.");
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="p-4 bg-base-200 rounded-lg shadow-inner">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-base-300 h-10 w-10"></div>
          <div className="flex-1 space-y-3 py-1">
            <div className="h-2 bg-base-300 rounded"></div>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-base-300 rounded col-span-2"></div>
                <div className="h-2 bg-base-300 rounded col-span-1"></div>
              </div>
              <div className="h-2 bg-base-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error/10 text-error-content rounded-lg">
        <h3 className="text-lg font-bold mb-2">Error</h3>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-base-200 rounded-lg shadow-lg">
      <div className="flex items-center mb-4">
        <Zap className="h-6 w-6 text-primary mr-3" />
        <h3 className="text-xl font-bold text-base-content">AI-Powered Recommendations</h3>
      </div>
      {recommendations.length === 0 ? (
        <p className="text-base-content/70">No recommendations available at this time. Check back later!</p>
      ) : (
        <ul className="space-y-4">
          {recommendations.map((rec) => (
            <li key={rec.id} className="p-4 bg-base-100 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4 mt-1">
                  {iconMap[rec.type] || <Lightbulb className="h-5 w-5 text-gray-400" />}
                </div>
                <div>
                  <h4 className="font-semibold text-base-content">{rec.title}</h4>
                  <p className="text-sm text-base-content/80">{rec.description}</p>
                </div>
              </div>
              <RecommendationFeedback />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
