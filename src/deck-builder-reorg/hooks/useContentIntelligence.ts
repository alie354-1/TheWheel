import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DeckLearningInsight } from '../types'; // Assuming this type will be defined

// Placeholder for the actual DeckLearningInsight type if not already defined
// export interface DeckLearningInsight {
//   id: string;
//   insightType: string;
//   description: string;
//   details: any;
//   severity?: 'High' | 'Medium' | 'Low';
//   confidenceScore?: number;
//   status: 'New' | 'Reviewed' | 'Actioned' | 'Dismissed';
//   createdAt: string;
//   updatedAt: string;
//   tags?: string[];
// }

export interface FeedbackHotspot {
  type: 'slide' | 'component' | 'general_theme';
  identifier: string; // e.g., slideId, componentType, or theme name
  commentCount: number;
  negativeSentimentCount?: number;
  averageUrgency?: number; // Could be a numerical representation of urgency
  relatedInsightIds?: string[];
}

export interface TemplateImprovementSuggestion {
  templateId: string; // or template name
  slideType?: string; // e.g., "Problem", "Solution"
  componentType?: string;
  suggestionText: string;
  basedOnInsightIds: string[];
  priority: 'High' | 'Medium' | 'Low';
}

interface ContentIntelligenceData {
  learningInsights: DeckLearningInsight[];
  feedbackHotspots: FeedbackHotspot[];
  templateSuggestions: TemplateImprovementSuggestion[];
  loading: boolean;
  error: Error | null;
}

const useContentIntelligence = (): ContentIntelligenceData => {
  const [learningInsights, setLearningInsights] = useState<DeckLearningInsight[]>([]);
  const [feedbackHotspots, setFeedbackHotspots] = useState<FeedbackHotspot[]>([]);
  const [templateSuggestions, setTemplateSuggestions] = useState<TemplateImprovementSuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch raw learning insights (admin/internal use)
        const { data: insightsData, error: insightsError } = await supabase
          .from('deck_learning_insights')
          .select('*')
          .order('created_at', { ascending: false });

        if (insightsError) throw insightsError;
        setLearningInsights((insightsData || []) as DeckLearningInsight[]);

        // 2. Placeholder: Process logs or insights to derive feedback hotspots
        // This would involve more complex queries or a dedicated backend process in a real system.
        // For now, returning mock data.
        setFeedbackHotspots([
          { type: 'slide', identifier: 'ProblemSlideTemplateV1', commentCount: 25, negativeSentimentCount: 10 },
          { type: 'component', identifier: 'BarChartComponent', commentCount: 15, averageUrgency: 1.8 },
          { type: 'general_theme', identifier: 'MarketSizeClarity', commentCount: 30 },
        ]);

        // 3. Placeholder: Generate template improvement suggestions based on insights
        // This would also be a more complex AI/rule-based process.
        setTemplateSuggestions([
          { 
            templateId: 'SaaS Pitch Template', 
            slideType: 'Market Size', 
            suggestionText: "Consider adding a placeholder for 'Source Citations' as it's a common feedback point.",
            basedOnInsightIds: ['insight_abc', 'insight_def'],
            priority: 'High'
          },
        ]);

      } catch (err) {
        console.error("Error fetching content intelligence data:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { learningInsights, feedbackHotspots, templateSuggestions, loading, error };
};

export default useContentIntelligence;
