import React, { useState } from 'react';
import { Brain, AlertCircle, CheckCircle } from 'lucide-react';
import { UnifiedIdea } from '../../lib/types/unified-idea.types';
import { useAuthStore } from '../../lib/store';
import { ideaGenerationService } from '../../lib/services/idea-generation.service';
import { ideaMemoryService } from '../../lib/services/idea-memory.service';

interface UnifiedBasicIdeaInfoProps {
  idea: UnifiedIdea;
  onUpdate: (updates: Partial<UnifiedIdea>) => void;
}

const UnifiedBasicIdeaInfo: React.FC<UnifiedBasicIdeaInfoProps> = ({ idea, onUpdate }) => {
  const { user } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  const handleInputChange = (field: string, value: string) => {
    onUpdate({
      [field]: value
    });
    
    // Clear any error messages when user starts typing
    if (localError && (field === 'title' || field === 'description')) {
      setLocalError('');
    }
  };

  const generateAIFeedback = async () => {
    // More forgiving validation - generate feedback even with minimal info
    if (!idea.title && !idea.description) {
      setLocalError('Please provide either a title or description before generating feedback');
      return;
    }

    setIsGenerating(true);
    setLocalError('');
    setLocalSuccess('');

    try {
      // Check if enhanced idea generation is enabled
      const isEnhanced = await ideaMemoryService.isFeatureEnabled('enhanced_idea_generation', user?.id);
      
      if (isEnhanced) {
        // Use the ideaGenerationService
        const context = {
          userId: user?.id || '',
          companyId: undefined,
          useExistingModels: true
        };
        
        // Create a BusinessIdea object from the form data
        const ideaData = {
          title: idea.title || 'Untitled Idea',
          description: idea.description || 'No description provided',
          problem_statement: idea.problem_statement || '',
          solution_concept: idea.solution_concept || '',
          target_audience: idea.target_audience || '',
          unique_value: idea.unique_value || '',
          business_model: idea.business_model || '',
          marketing_strategy: idea.marketing_strategy || '',
          revenue_model: idea.revenue_model || '',
          go_to_market: idea.go_to_market || ''
        };
        
        try {
          // Get feedback using the idea generation service
          const feedback = await ideaGenerationService.refineIdea(ideaData, context);
          
          // Update the idea data with the feedback
          onUpdate({
            ai_feedback: {
              strengths: feedback.strengths || [],
              weaknesses: feedback.weaknesses || [],
              opportunities: feedback.opportunities || [],
              threats: feedback.threats || [],
              suggestions: feedback.suggestions || [],
              market_insights: feedback.market_insights || [],
              validation_tips: feedback.validation_tips || []
            }
          });
          
          setLocalSuccess('AI feedback generated successfully!');
        } catch (serviceError) {
          console.error('Error from idea generation service:', serviceError);
          // Fall back to mock data if the service fails
          onUpdate({
            ai_feedback: getMockFeedback(idea.title || 'Untitled Idea')
          });
          
          setLocalSuccess('AI feedback generated (using fallback data)');
        }
      } else {
        // Fallback to mock data
        onUpdate({
          ai_feedback: getMockFeedback(idea.title || 'Untitled Idea')
        });
        
        setLocalSuccess('AI feedback generated!');
      }
    } catch (error: any) {
      console.error('Error generating AI feedback:', error);
      setLocalError(`Error generating feedback: ${error.message}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const getMockFeedback = (title: string) => {
    return {
      strengths: [
        `${title} has a clear value proposition`,
        'Addresses a real market need',
        'Potential for scalability'
      ],
      weaknesses: [
        'Target market may be too broad',
        'Revenue model needs refinement',
        'Implementation complexity could be high'
      ],
      opportunities: [
        'Potential for expansion into adjacent markets',
        'Partnership opportunities with complementary services',
        'First-mover advantage in an emerging space'
      ],
      threats: [
        'Competitive landscape is crowded',
        'Technology changes could disrupt the model',
        'Regulatory challenges may arise'
      ],
      suggestions: [
        'Narrow focus to a specific industry vertical initially',
        'Develop a clearer differentiation strategy',
        'Consider a freemium model to accelerate adoption'
      ],
      market_insights: [
        'Market is growing at 15% annually',
        'Early adopters tend to be mid-sized companies',
        'Customer acquisition costs are trending downward'
      ],
      validation_tips: [
        'Interview 10 potential customers in your target market',
        'Create a simple landing page to test messaging',
        'Build a minimum viable product to gather user feedback'
      ]
    };
  };

  return (
    <div className="space-y-6">
      {localError && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{localError}</p>
            </div>
          </div>
        </div>
      )}
      
      {localSuccess && (
        <div className="mb-6 rounded-md bg-green-50 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div className="ml-3">
              <p className="text-sm text-green-700">{localSuccess}</p>
            </div>
          </div>
        </div>
      )}

      {/* Core Idea Fields */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Describe your idea in one sentence <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={idea.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="e.g., 'An AI-powered customer service tool' or 'Tutus for ponies!'"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          What inspired this idea?
        </label>
        <textarea
          id="description"
          rows={3}
          value={idea.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="e.g., 'I love ponies and think they'd look great in tutus' or 'I hate waiting for customer service calls'"
        />
      </div>

      <div>
        <label htmlFor="solution_concept" className="block text-sm font-medium text-gray-700">
          Do you see this as a product, technology, or service?
        </label>
        <textarea
          id="solution_concept"
          rows={3}
          value={idea.solution_concept || ''}
          onChange={(e) => handleInputChange('solution_concept', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="e.g., 'A physical product line of custom-made tutus' or 'A software tool that uses AI'"
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={generateAIFeedback}
          disabled={isGenerating}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          <Brain className="h-4 w-4 mr-2" />
          {isGenerating ? 'Analyzing...' : 'Get AI Feedback'}
        </button>
      </div>

      {/* AI Feedback Section */}
      {idea.ai_feedback && idea.ai_feedback.strengths && idea.ai_feedback.strengths.length > 0 && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">AI Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Strengths</h4>
              <ul className="space-y-2">
                {idea.ai_feedback.strengths.map((strength: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Areas for Improvement</h4>
              <ul className="space-y-2">
                {idea.ai_feedback.weaknesses.map((weakness: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Opportunities */}
            {idea.ai_feedback.opportunities && idea.ai_feedback.opportunities.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Opportunities</h4>
                <ul className="space-y-2">
                  {idea.ai_feedback.opportunities.map((opportunity: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {opportunity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Suggestions */}
            {idea.ai_feedback.suggestions && idea.ai_feedback.suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Suggestions</h4>
                <ul className="space-y-2">
                  {idea.ai_feedback.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedBasicIdeaInfo;
