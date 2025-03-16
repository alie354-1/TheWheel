import React, { useState, useEffect } from 'react';
import { generalLLMService } from '../../../lib/services/general-llm.service';
import { useAuthStore } from '../../../lib/store';

interface ContextualAIPanelProps {
  currentStage?: string;
  ideaId?: string;
}

/**
 * A persistent sidebar component that provides contextual AI assistance.
 * This panel adapts its guidance based on the current stage or context.
 */
const ContextualAIPanel: React.FC<ContextualAIPanelProps> = ({
  currentStage = 'general',
  ideaId,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [assistanceContent, setAssistanceContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, featureFlags } = useAuthStore();
  const useMockAI = featureFlags?.useMockAI?.enabled || false;

  // Generate contextual assistance based on the current stage
  useEffect(() => {
    if (isExpanded) {
      generateContextualAssistance();
    }
  }, [currentStage, ideaId, isExpanded]);

  const generateContextualAssistance = async () => {
    setIsLoading(true);
    try {
      let prompt = '';
      switch (currentStage) {
        case 'idea_generation':
          prompt = `You are assisting a user in the idea generation stage. Provide concise, helpful tips for brainstorming and evaluating business ideas. Include 3 bullet points with actionable advice.`;
          break;
        case 'problem_solution':
          prompt = `You are assisting a user in defining a problem and solution. Provide concise, helpful tips for clearly articulating problems and developing effective solutions. Include 3 bullet points with actionable advice.`;
          break;
        case 'target_value':
          prompt = `You are assisting a user in identifying target audiences and value propositions. Provide concise, helpful tips for market segmentation and crafting compelling value statements. Include 3 bullet points with actionable advice.`;
          break;
        case 'business_model':
          prompt = `You are assisting a user in developing a business model. Provide concise, helpful tips for revenue strategies, cost structures, and key resources. Include 3 bullet points with actionable advice.`;
          break;
        case 'go_to_market':
          prompt = `You are assisting a user in planning a go-to-market strategy. Provide concise, helpful tips for customer acquisition, marketing channels, and launch planning. Include 3 bullet points with actionable advice.`;
          break;
        default:
          prompt = `You are assisting a user in brainstorming and developing business ideas. Provide concise, helpful tips for idea development and evaluation. Include 3 bullet points with actionable advice.`;
      }

      const response = await generalLLMService.query(prompt, {
        userId: user?.id || 'anonymous',
        useCompanyModel: false,
        useAbstraction: false,
        useExistingModels: true,
        context: currentStage
      });

      setAssistanceContent(formatAssistance(response.content));
    } catch (error) {
      console.error('Error generating AI assistance:', error);
      setAssistanceContent('Unable to generate assistance at this time. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAssistance = (text: string) => {
    // Convert markdown bullet points to HTML
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/- (.*?)(?=\n|$)/g, '• $1');
  };

  return (
    <div className={`flex flex-col h-full border-l transition-all ${isExpanded ? 'w-80' : 'w-12'}`}>
      <div className="border-b bg-indigo-50 flex items-center p-3 justify-between">
        {isExpanded ? (
          <>
            <h3 className="font-medium text-indigo-900">AI Assistant</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-indigo-700 hover:text-indigo-900"
              aria-label="Collapse panel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-indigo-700 hover:text-indigo-900 mx-auto"
            aria-label="Expand panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="p-4 overflow-y-auto flex-1 bg-white">
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: assistanceContent }} />
              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={generateContextualAssistance}
                  className="text-indigo-600 text-sm hover:text-indigo-800 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Refresh suggestions
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContextualAIPanel;
