// src/lib/services/aiService.ts
import OpenAI from 'openai';
import { DeckComment, AiServiceRequestPayload, AiGeneratedSuggestion } from '../../deck-builder/types/index.ts';

// Ensure your OpenAI API key is set in your environment variables
// For example, in a .env.local file: OPENAI_API_KEY='your_api_key_here'
// IMPORTANT: Never commit your API key to version control.
// Vite exposes env variables prefixed with VITE_ on import.meta.env
// const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY; // No longer needed here

// The OpenAI client instance is no longer initialized or used directly in this frontend service.
// All AI operations are proxied through Supabase Edge Functions.

// Ensure Supabase client is available. It's typically initialized elsewhere and imported.
// For this service, we'll import it as needed within each function.

interface SentimentAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // Typically -1 to 1 for negative to positive, or 0 to 1 for probability
}

interface IntentRecognitionResult {
  intent: 'question' | 'suggestion' | 'criticism' | 'praise' | 'concern' | 'other';
  confidence: number;
}

interface TopicCategorizationResult {
  category: string; // e.g., "Clarity", "Market Size", "Design", "Financials"
  confidence: number;
}

interface ActionItem {
  text: string;
  priority?: 'high' | 'medium' | 'low';
}

interface FeedbackAnalysis {
  sentiment: SentimentAnalysisResult;
  intent: IntentRecognitionResult;
  topics: TopicCategorizationResult[];
  actionItems: ActionItem[];
  overallSummary?: string; // A brief summary of the feedback
}

interface ExpertiseDetectionResult {
  expertise_score: number; // 0.0 to 1.0
}

/**
 * Analyzes the sentiment of a given text.
 * @param text The text to analyze.
 * @returns A promise that resolves to the sentiment analysis result.
 */
export async function analyzeSentiment(text: string): Promise<SentimentAnalysisResult> {
  // Remove direct OpenAI client initialization check here, as it's now handled by the Edge Function
  // All AI operations are now intended to go through Supabase Edge Functions.
  // The direct OpenAI client (`openai`) and related checks/fallbacks are removed.
  try {
    // Ensure supabase client is imported.
    const { supabase } = await import('../../lib/supabase.ts'); 

    const { data, error } = await supabase.functions.invoke('ai-analyze-sentiment', {
      body: { text },
    });

    if (error) {
      console.error('Error invoking ai-analyze-sentiment function:', error);
      throw error;
    }
    
    return data as SentimentAnalysisResult;

  } catch (error) {
    console.error("Error analyzing sentiment via Edge Function:", error);
    return { sentiment: 'neutral', score: 0 }; // Fallback
  }
}

/**
 * Detects the expertise level from a given text.
 * @param text The text to analyze.
 * @returns A promise that resolves to the expertise detection result.
 */
export async function detectExpertise(text: string): Promise<ExpertiseDetectionResult> {
  try {
    const { supabase } = await import('../../lib/supabase.ts');

    const { data, error } = await supabase.functions.invoke('ai-detect-expertise', {
      body: { text },
    });

    if (error) {
      console.error('Error invoking ai-detect-expertise function:', error);
      throw error;
    }
    
    return data as ExpertiseDetectionResult;

  } catch (error) {
    console.error("Error detecting expertise via Edge Function:", error);
    return { expertise_score: 0 }; // Fallback
  }
}

/**
 * Recognizes the intent of a given text.
 * @param text The text to analyze.
 * @returns A promise that resolves to the intent recognition result.
 */
export async function recognizeIntent(text: string): Promise<IntentRecognitionResult> {
  try {
    const { supabase } = await import('../../lib/supabase.ts'); 

    const { data, error } = await supabase.functions.invoke('ai-recognize-intent', {
      body: { text },
    });

    if (error) {
      console.error('Error invoking ai-recognize-intent function:', error);
      throw error;
    }
    
    return data as IntentRecognitionResult;

  } catch (error) {
    console.error("Error recognizing intent via Edge Function:", error);
    return { intent: 'other', confidence: 0 }; // Fallback
  }
}

/**
 * Categorizes a comment into predefined topics.
 * @param text The comment text to categorize.
 * @returns A promise that resolves to the topic categorization result.
 */
export async function categorizeCommentTopics(text: string): Promise<TopicCategorizationResult[]> {
  try {
    const { supabase } = await import('../../lib/supabase.ts');

    const { data, error } = await supabase.functions.invoke('ai-categorize-comment', {
      body: { text },
    });

    if (error) {
      console.error('Error invoking ai-categorize-comment function:', error);
      throw error;
    }
    
    return data as TopicCategorizationResult[];

  } catch (error) {
    console.error("Error categorizing topics via Edge Function:", error);
    return [{ category: 'General', confidence: 0 }]; // Fallback
  }
}

/**
 * Extracts potential action items from a given text.
 * @param text The text to analyze.
 * @returns A promise that resolves to an array of extracted action items.
 */
export async function extractActionItems(text: string): Promise<ActionItem[]> {
  try {
    const { supabase } = await import('../../lib/supabase.ts');

    const { data, error } = await supabase.functions.invoke('ai-extract-action-items', {
      body: { text },
    });

    if (error) {
      console.error('Error invoking ai-extract-action-items function:', error);
      throw error;
    }
    
    return data as ActionItem[];

  } catch (error) {
    console.error("Error extracting action items via Edge Function:", error);
    return []; // Fallback
  }
}

/**
 * Generates text rewrite suggestions for a given piece of text, optionally using context and feedback.
 * @param originalText The text to rewrite.
 * @param context Optional context about where the text appears (e.g., "slide title", "problem statement section").
 * @param feedbackPrompt Optional specific feedback or instruction for the rewrite (e.g., "Make it more concise", "Explain this for a non-technical audience").
 * @returns A promise that resolves to an array of rewrite suggestions.
 */
export async function generateRewriteSuggestions(
  originalText: string,
  context?: string,
  feedbackPrompt?: string
): Promise<string[]> {
  try {
    const { supabase } = await import('../../lib/supabase.ts');

    const { data, error } = await supabase.functions.invoke('ai-generate-rewrite-suggestions', {
      body: { originalText, context, feedbackPrompt },
    });

    if (error) {
      console.error('Error invoking ai-generate-rewrite-suggestions function:', error);
      throw error;
    }
    
    return data as string[];

  } catch (error) {
    console.error("Error generating rewrite suggestions via Edge Function:", error);
    return [originalText]; // Fallback
  }
}


/**
 * Processes a single DeckComment to extract full analysis.
 * This function is more comprehensive and might be used for detailed views.
 * For simply populating deck_comments, direct calls to individual AI functions might be preferred in deckService.
 * @param comment The DeckComment object.
 * @returns A promise that resolves to a FeedbackAnalysis object.
 */
export async function analyzeSingleComment(comment: DeckComment): Promise<FeedbackAnalysis> {
  const textContent = comment.textContent || "";

  const [sentimentResult, intentResult, topicsResult, actionItemsResult, expertiseResult] = await Promise.all([
    analyzeSentiment(textContent),
    recognizeIntent(textContent),
    categorizeCommentTopics(textContent),
    extractActionItems(textContent),
    detectExpertise(textContent)
  ]);

  let overallSummary: string | undefined = undefined;
  if (textContent.length > 50) {
    try {
      const { supabase } = await import('../../lib/supabase.ts');
      const { data, error } = await supabase.functions.invoke('ai-generate-summary', {
        body: { text: textContent },
      });

      if (error) {
        console.error('Error invoking ai-generate-summary function:', error);
        throw error;
      }
      overallSummary = (data as { summary: string })?.summary || undefined;
    } catch (error) {
      console.error("Error generating summary via Edge Function:", error);
      overallSummary = undefined;
    }
  }

  return {
    sentiment: sentimentResult,
    intent: intentResult,
    topics: topicsResult,
    actionItems: actionItemsResult,
    overallSummary,
  };
}

export const aiService = {
  analyzeSentiment,
  recognizeIntent,
  categorizeCommentTopics,
  extractActionItems,
  generateRewriteSuggestions,
  analyzeSingleComment,
  detectExpertise,
  isInitialized: () => {
    return true; 
  },

  /**
   * Generates slide rewrite suggestions based on comments and existing slide content.
   * This will call the 'ai-generate-slide-rewrite-from-feedback' Supabase function.
   * @param payload The request payload containing deckId, slideId, comments, slideContent, and optional aggregatedInsightsSummary.
   * @returns A promise that resolves to an array of AiGeneratedSuggestion objects.
   */
  async generateSlideRewriteSuggestions(
    payload: AiServiceRequestPayload // Payload now includes aggregatedInsightsSummary
  ): Promise<AiGeneratedSuggestion[]> { 
    if (!this.isInitialized()) { // Though isInitialized always returns true now
      console.warn('AI Service not initialized. Cannot generate slide rewrite suggestions.');
      return [];
    }
    try {
      const { supabase } = await import('../../lib/supabase.ts');
      console.log('[aiService] Invoking ai-generate-slide-rewrite-from-feedback with payload:', payload);
      const { data, error } = await supabase.functions.invoke('ai-generate-slide-rewrite-from-feedback', {
        body: payload, // Pass the whole payload object
      });

      if (error) {
        console.error('Error invoking ai-generate-slide-rewrite-from-feedback function:', error);
        throw error;
      }
      // Assuming the Edge function returns an object like { suggestions: AiGeneratedSuggestion[] }
      // or just the array of suggestions directly. The current Edge function returns { deckId, slideId, suggestions }
      console.log('[aiService] Received from Edge Function:', data);
      return (data as { suggestions: AiGeneratedSuggestion[] })?.suggestions || []; 
    } catch (error) {
      console.error("Error generating slide rewrite suggestions via Edge Function:", error);
      return []; // Fallback
    }
  }
};

export default aiService;
