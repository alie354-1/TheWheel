import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AiRecommendationService, RealAiRecommendationService, Recommendation } from '../lib/services/ai-recommendation';
import { useAuth } from '../lib/contexts/AuthContext';
import { Lightbulb } from 'lucide-react';

const AiRecommendationPanel = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const recommendationService: AiRecommendationService = new RealAiRecommendationService(supabase);

  useEffect(() => {
    if (user) {
      const fetchRecommendations = async () => {
        setIsLoading(true);
        try {
          const stepRecs = await recommendationService.getStepRecommendations(user.id);
          setRecommendations(stepRecs);
        } catch (error) {
          console.error('Error fetching recommendations:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchRecommendations();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="bg-base-100 rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-4">
          <Lightbulb className="h-6 w-6 text-primary mr-3" />
          <h2 className="text-lg font-semibold text-base-content">AI Recommendations</h2>
        </div>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-base-300 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-base-300 rounded"></div>
              <div className="h-4 bg-base-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-base-100 rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center mb-4">
        <Lightbulb className="h-6 w-6 text-primary mr-3" />
        <h2 className="text-lg font-semibold text-base-content">AI Recommendations</h2>
      </div>
      <ul className="space-y-4">
        {recommendations.map((rec) => (
          <li key={rec.id} className="p-4 bg-base-200 rounded-lg">
            <h3 className="font-semibold text-base-content">{rec.title}</h3>
            <p className="text-sm text-base-content/70">{rec.description}</p>
            <p className="text-xs text-base-content/50 mt-2">Type: {rec.type}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AiRecommendationPanel;
