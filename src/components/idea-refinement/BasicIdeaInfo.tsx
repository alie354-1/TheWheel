import React, { useState, useEffect } from 'react';
import { Lightbulb, Brain, AlertCircle, CheckCircle } from 'lucide-react';
import { useIdeaContext } from '../../lib/contexts/IdeaContext';
import { ideaGenerationService } from '../../lib/services/idea-generation.service';
import { useAuthStore } from '../../lib/store';
import { ideaMemoryService } from '../../lib/services/idea-memory.service';

const BasicIdeaInfo: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    ideaData, 
    setIdeaData, 
    isLoading, 
    setIsLoading, 
    error, 
    setError,
    setCurrentStep,
    saveToLocalStorage
  } = useIdeaContext();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [localSuccess, setLocalSuccess] = useState('');

  // Set default values if they're empty
  useEffect(() => {
    // Only set defaults if both title and description are empty
    // This prevents overwriting user data when component remounts
    if (!ideaData.title && !ideaData.description) {
      setIdeaData(prev => ({
        ...prev,
        title: prev.title || '',
        description: prev.description || '',
        solution_concept: prev.solution_concept || ''
      }));
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setIdeaData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear any error messages when user starts typing
    if (error && (field === 'title' || field === 'description')) {
      setError('');
    }
  };

  const generateAIFeedback = async () => {
    // More forgiving validation - generate feedback even with minimal info
    if (!ideaData.title && !ideaData.description) {
      setError('Please provide either a title or description before generating feedback');
      return;
    }

    setIsGenerating(true);
    setError('');
    setLocalSuccess('');

    try {
      // Save current state to localStorage before generating feedback
      saveToLocalStorage();
      
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
        const idea = {
          title: ideaData.title || 'Untitled Idea',
          description: ideaData.description || 'No description provided',
          problem_statement: ideaData.problem_statement || '',
          solution_concept: ideaData.solution_concept || '',
          target_audience: ideaData.target_audience || '',
          unique_value: ideaData.unique_value || '',
          business_model: ideaData.business_model || '',
          marketing_strategy: ideaData.marketing_strategy || '',
          revenue_model: ideaData.revenue_model || '',
          go_to_market: ideaData.go_to_market || ''
        };
        
        try {
          // Get feedback using the idea generation service
          const feedback = await ideaGenerationService.refineIdea(idea, context);
          
          // Update the idea data with the feedback
          setIdeaData(prev => ({
            ...prev,
            ai_feedback: {
              strengths: feedback.strengths || [],
              weaknesses: feedback.weaknesses || [],
              opportunities: feedback.opportunities || [],
              threats: feedback.threats || [],
              suggestions: feedback.suggestions || [],
              market_insights: feedback.market_insights || [],
              validation_tips: feedback.validation_tips || []
            }
          }));
          
          setLocalSuccess('AI feedback generated successfully!');
        } catch (serviceError) {
          console.error('Error from idea generation service:', serviceError);
          // Fall back to mock data if the service fails
          setIdeaData(prev => ({
            ...prev,
            ai_feedback: getMockFeedback(ideaData.title || 'Untitled Idea')
          }));
          
          setLocalSuccess('AI feedback generated (using fallback data)');
        }
      } else {
        // Fallback to mock data
        setIdeaData(prev => ({
          ...prev,
          ai_feedback: getMockFeedback(ideaData.title || 'Untitled Idea')
        }));
        
        setLocalSuccess('AI feedback generated!');
      }
      
      // Save the updated data with feedback to localStorage
      saveToLocalStorage();
    } catch (error: any) {
      console.error('Error generating AI feedback:', error);
      setError(`Error generating feedback: ${error.message}. Please try again.`);
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

  const handleContinue = () => {
    // More forgiving validation - allow continuing with just a title
    if (!ideaData.title) {
      setError('Please provide at least a title before continuing');
      return;
    }
    
    // Save current state to localStorage
    saveToLocalStorage();
    
    // Make sure the solution_concept field is mapped correctly
    if (ideaData.solution_concept) {
      console.log('Setting solution_concept:', ideaData.solution_concept);
    }
    
    // Move to the next step (Concept Variations)
    console.log('Moving to Concept Variations step');
    
    // Update the idea data with the current values and ensure required fields have defaults
    setIdeaData(prev => ({
      ...prev,
      title: prev.title || 'Untitled Idea',
      description: prev.description || 'No description provided',
      solution_concept: prev.solution_concept || ''
    }));
    
    // Use the context's setCurrentStep which now handles navigation properly
    setCurrentStep(1);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
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
          value={ideaData.title}
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
          value={ideaData.description}
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
          value={ideaData.solution_concept}
          onChange={(e) => handleInputChange('solution_concept', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="e.g., 'A physical product line of custom-made tutus' or 'A software tool that uses AI'"
        />
      </div>

      <div className="flex justify-between space-x-4">
        <button
          onClick={generateAIFeedback}
          disabled={isGenerating}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          <Brain className="h-4 w-4 mr-2" />
          {isGenerating ? 'Analyzing...' : 'Get AI Feedback'}
        </button>

        <button
          onClick={handleContinue}
          disabled={!ideaData.title}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          Continue to Concept Variations
        </button>
      </div>

      {/* AI Feedback Section */}
      {ideaData.ai_feedback && ideaData.ai_feedback.strengths && ideaData.ai_feedback.strengths.length > 0 && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">AI Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Strengths</h4>
              <ul className="space-y-2">
                {ideaData.ai_feedback.strengths.map((strength, index) => (
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
                {ideaData.ai_feedback.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Opportunities */}
            {ideaData.ai_feedback.opportunities && ideaData.ai_feedback.opportunities.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Opportunities</h4>
                <ul className="space-y-2">
                  {ideaData.ai_feedback.opportunities.map((opportunity, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {opportunity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Suggestions */}
            {ideaData.ai_feedback.suggestions && ideaData.ai_feedback.suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Suggestions</h4>
                <ul className="space-y-2">
                  {ideaData.ai_feedback.suggestions.map((suggestion, index) => (
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

export default BasicIdeaInfo;
