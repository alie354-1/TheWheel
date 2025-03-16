import React, { useState } from 'react';
import { 
  Edit3, 
  Users, 
  Zap, 
  BarChart4, 
  TrendingUp, 
  DollarSign, 
  Rocket,
  Brain,
  AlertCircle
} from 'lucide-react';
import { useIdeaContext } from '../../lib/contexts/IdeaContext';
import { ideaGenerationService } from '../../lib/services/idea-generation.service';
import { useAuthStore } from '../../lib/store';
import { ideaMemoryService } from '../../lib/services/idea-memory.service';

const DetailedRefinement: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    ideaData, 
    setIdeaData, 
    error, 
    setError
  } = useIdeaContext();
  
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setIdeaData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateAIFeedback = async () => {
    if (!ideaData.title || !ideaData.description) {
      setError('Please provide at least a title and description');
      return;
    }

    setIsGenerating(true);
    setError('');

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
        const idea = {
          title: ideaData.title,
          description: ideaData.description,
          problem_statement: ideaData.problem_statement,
          solution_concept: ideaData.solution_concept,
          target_audience: ideaData.target_audience,
          unique_value: ideaData.unique_value,
          business_model: ideaData.business_model,
          marketing_strategy: ideaData.marketing_strategy,
          revenue_model: ideaData.revenue_model,
          go_to_market: ideaData.go_to_market
        };
        
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
      } else {
        // Fallback to mock data
        setIdeaData(prev => ({
          ...prev,
          ai_feedback: {
            strengths: [
              'Clear value proposition',
              'Addresses a real market need'
            ],
            weaknesses: [
              'Target market may be too broad',
              'Revenue model needs refinement'
            ],
            opportunities: [
              'Potential for expansion into adjacent markets',
              'Partnership opportunities with complementary services'
            ],
            threats: [
              'Competitive landscape is crowded',
              'Technology changes could disrupt the model'
            ],
            suggestions: [
              'Narrow focus to a specific industry vertical initially',
              'Develop a clearer differentiation strategy'
            ],
            market_insights: [
              'Market is growing at 15% annually',
              'Early adopters tend to be mid-sized companies'
            ],
            validation_tips: [
              'Interview 10 potential customers in your target market',
              'Create a simple landing page to test messaging'
            ]
          }
        }));
      }
    } catch (error: any) {
      console.error('Error generating AI feedback:', error);
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Use selected suggestions to pre-populate fields if they're empty
  const getTargetAudienceFromSuggestions = () => {
    if (ideaData.target_audience) return ideaData.target_audience;
    
    const selectedAudiences = ideaData.selected_suggestions?.target_audience || [];
    if (selectedAudiences.length > 0) {
      return selectedAudiences.join(', ');
    }
    return '';
  };

  const getBusinessModelFromSuggestions = () => {
    if (ideaData.business_model) return ideaData.business_model;
    
    const selectedModels = ideaData.selected_suggestions?.pricing_model || [];
    if (selectedModels.length > 0) {
      return `${selectedModels.join(', ')} model targeting ${ideaData.selected_suggestions?.customer_type?.join(', ') || 'customers'}`;
    }
    return '';
  };

  const getMarketingStrategyFromSuggestions = () => {
    if (ideaData.marketing_strategy) return ideaData.marketing_strategy;
    
    const selectedChannels = ideaData.selected_suggestions?.sales_channels || [];
    if (selectedChannels.length > 0) {
      return `Marketing through ${selectedChannels.join(', ')}`;
    }
    return '';
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

      <div>
        <label htmlFor="problem_statement" className="block text-sm font-medium text-gray-700">
          Problem Statement
        </label>
        <div className="flex items-center">
          <Edit3 className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-xs text-gray-500">What specific problem does your idea solve?</span>
        </div>
        <textarea
          id="problem_statement"
          rows={3}
          value={ideaData.problem_statement}
          onChange={(e) => handleInputChange('problem_statement', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Describe the problem your idea addresses"
        />
      </div>
      
      <div>
        <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700">
          Target Audience
        </label>
        <div className="flex items-center">
          <Users className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-xs text-gray-500">Who will benefit most from your solution?</span>
        </div>
        <textarea
          id="target_audience"
          rows={3}
          value={ideaData.target_audience || getTargetAudienceFromSuggestions()}
          onChange={(e) => handleInputChange('target_audience', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Describe your ideal customers or users"
        />
      </div>
      
      <div>
        <label htmlFor="unique_value" className="block text-sm font-medium text-gray-700">
          Unique Value Proposition
        </label>
        <div className="flex items-center">
          <Zap className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-xs text-gray-500">What makes your solution special?</span>
        </div>
        <textarea
          id="unique_value"
          rows={3}
          value={ideaData.unique_value}
          onChange={(e) => handleInputChange('unique_value', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="What makes your idea different from existing solutions?"
        />
      </div>
      
      <div>
        <label htmlFor="business_model" className="block text-sm font-medium text-gray-700">
          Business Model
        </label>
        <div className="flex items-center">
          <BarChart4 className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-xs text-gray-500">How will your business create and capture value?</span>
        </div>
        <textarea
          id="business_model"
          rows={3}
          value={ideaData.business_model || getBusinessModelFromSuggestions()}
          onChange={(e) => handleInputChange('business_model', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Describe your business model (e.g., SaaS, marketplace, freemium)"
        />
      </div>
      
      <div>
        <label htmlFor="marketing_strategy" className="block text-sm font-medium text-gray-700">
          Marketing Strategy
        </label>
        <div className="flex items-center">
          <TrendingUp className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-xs text-gray-500">How will you reach and acquire customers?</span>
        </div>
        <textarea
          id="marketing_strategy"
          rows={3}
          value={ideaData.marketing_strategy || getMarketingStrategyFromSuggestions()}
          onChange={(e) => handleInputChange('marketing_strategy', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Describe your marketing and customer acquisition strategy"
        />
      </div>
      
      <div>
        <label htmlFor="revenue_model" className="block text-sm font-medium text-gray-700">
          Revenue Model
        </label>
        <div className="flex items-center">
          <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-xs text-gray-500">How will you generate revenue?</span>
        </div>
        <textarea
          id="revenue_model"
          rows={3}
          value={ideaData.revenue_model}
          onChange={(e) => handleInputChange('revenue_model', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Describe your pricing and revenue generation approach"
        />
      </div>
      
      <div>
        <label htmlFor="go_to_market" className="block text-sm font-medium text-gray-700">
          Go-to-Market Strategy
        </label>
        <div className="flex items-center">
          <Rocket className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-xs text-gray-500">How will you launch and scale your business?</span>
        </div>
        <textarea
          id="go_to_market"
          rows={3}
          value={ideaData.go_to_market}
          onChange={(e) => handleInputChange('go_to_market', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Describe your approach to launching and scaling your business"
        />
      </div>
      
      <div className="flex justify-end space-x-4">
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
      {ideaData.ai_feedback && ideaData.ai_feedback.strengths.length > 0 && (
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

            {/* Threats */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Potential Risks</h4>
              <ul className="space-y-2">
                {ideaData.ai_feedback.threats.map((threat, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    {threat}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailedRefinement;
