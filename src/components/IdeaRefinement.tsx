import React, { useState } from 'react';
import { 
  Lightbulb,
  Brain,
  ArrowRight,
  AlertCircle,
  Save,
  Edit3,
  Users,
  Zap,
  BarChart4,
  TrendingUp,
  DollarSign,
  Rocket
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import IdeaComponentVariations from './IdeaComponentVariations';
import { useAuthStore } from '../lib/store';
import { ideaGenerationService, IdeaFeedback, BusinessIdea } from '../lib/services/idea-generation.service';
import { ideaMemoryService } from '../lib/services/idea-memory.service';

interface IdeaData {
  id?: string;
  version?: number;
  title: string;
  description: string;
  problem_statement: string;
  solution_concept: string;
  target_audience: string;
  unique_value: string;
  business_model: string;
  marketing_strategy: string;
  revenue_model: string;
  go_to_market: string;
  ai_feedback: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    suggestions: string[];
    market_insights: string[];
    validation_tips: string[];
  };
}

export default function IdeaRefinement() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'detailed' | 'variations'>('basic');
  const [ideaData, setIdeaData] = useState<IdeaData>({
    title: '',
    description: '',
    problem_statement: '',
    solution_concept: '',
    target_audience: '',
    unique_value: '',
    business_model: '',
    marketing_strategy: '',
    revenue_model: '',
    go_to_market: '',
    ai_feedback: {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
      suggestions: [],
      market_insights: [],
      validation_tips: []
    }
  });

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create a base idea object with the required fields
      const ideaObject = {
        user_id: user.id,
        title: ideaData.title,
        description: ideaData.description,
        problem_statement: ideaData.problem_statement,
        solution_concept: ideaData.solution_concept,
        target_audience: ideaData.target_audience,
        unique_value: ideaData.unique_value,
        business_model: ideaData.business_model,
        marketing_strategy: ideaData.marketing_strategy,
        revenue_model: ideaData.revenue_model,
        go_to_market: ideaData.go_to_market,
        status: 'draft'
      };

      // Try to save with ai_feedback first
      try {
        const { error } = await supabase
          .from('ideas')
          .insert({
            ...ideaObject,
            ai_feedback: ideaData.ai_feedback
          });

        if (error) {
          // If there's an error with ai_feedback, try without it
          if (error.message.includes('ai_feedback')) {
            console.log('ai_feedback column not found, trying without it');
            const { error: error2 } = await supabase
              .from('ideas')
              .insert(ideaObject);

            if (error2) throw error2;
          } else {
            throw error;
          }
        }
      } catch (innerError: any) {
        // If the inner try fails, try one more time without ai_feedback
        if (innerError.message.includes('ai_feedback')) {
          const { error: error3 } = await supabase
            .from('ideas')
            .insert(ideaObject);

          if (error3) throw error3;
        } else {
          throw innerError;
        }
      }

      setSuccess('Idea saved successfully!');
    } catch (error: any) {
      console.error('Error saving idea:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
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
        // Use the new ideaGenerationService
        const context = {
          userId: user?.id || '',
          companyId: undefined,
          useExistingModels: true
        };
        
        // Create a BusinessIdea object from the form data
        const idea: BusinessIdea = {
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
        
        // Save the feedback to the idea memory if we have an idea ID
        if (ideaData.id) {
          await ideaMemoryService.addIteration(
            user?.id || '',
            ideaData.id,
            {
              version: ideaData.version || 1,
              title: ideaData.title,
              description: ideaData.description,
              problem_statement: ideaData.problem_statement,
              solution_concept: ideaData.solution_concept,
              target_audience: ideaData.target_audience,
              unique_value: ideaData.unique_value,
              business_model: ideaData.business_model,
              marketing_strategy: ideaData.marketing_strategy,
              revenue_model: ideaData.revenue_model,
              go_to_market: ideaData.go_to_market,
              feedback
            }
          );
        }
      } else {
        // Fallback to mock data
        const mockFeedback: IdeaFeedback = {
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
        };
        
        setIdeaData(prev => ({
          ...prev,
          ai_feedback: mockFeedback
        }));
      }
    } catch (error: any) {
      console.error('Error generating AI feedback:', error);
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Lightbulb className="h-6 w-6 text-indigo-600" />
            <h2 className="ml-2 text-lg font-medium text-gray-900">
              Idea Refinement
            </h2>
          </div>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Progress'}
          </button>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('basic')}
              className={`${
                activeTab === 'basic'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Basic Info
            </button>
            <button
              onClick={() => setActiveTab('detailed')}
              className={`${
                activeTab === 'detailed'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Detailed Refinement
            </button>
            <button
              onClick={() => setActiveTab('variations')}
              className={`${
                activeTab === 'variations'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Component Variations
            </button>
          </nav>
        </div>

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

        {success && (
          <div className="mb-6 rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            {/* Core Idea Fields */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Describe your idea in one sentence
              </label>
              <input
                type="text"
                id="title"
                value={ideaData.title}
                onChange={(e) => setIdeaData(prev => ({ ...prev, title: e.target.value }))}
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
                onChange={(e) => setIdeaData(prev => ({ ...prev, description: e.target.value }))}
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
                onChange={(e) => setIdeaData(prev => ({ ...prev, solution_concept: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., 'A physical product line of custom-made tutus' or 'A software tool that uses AI'"
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
          </div>
        )}
        
        {/* Detailed Refinement Tab */}
        {activeTab === 'detailed' && (
          <div className="space-y-6">
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
                onChange={(e) => setIdeaData(prev => ({ ...prev, problem_statement: e.target.value }))}
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
                value={ideaData.target_audience}
                onChange={(e) => setIdeaData(prev => ({ ...prev, target_audience: e.target.value }))}
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
                onChange={(e) => setIdeaData(prev => ({ ...prev, unique_value: e.target.value }))}
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
                value={ideaData.business_model}
                onChange={(e) => setIdeaData(prev => ({ ...prev, business_model: e.target.value }))}
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
                value={ideaData.marketing_strategy}
                onChange={(e) => setIdeaData(prev => ({ ...prev, marketing_strategy: e.target.value }))}
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
                onChange={(e) => setIdeaData(prev => ({ ...prev, revenue_model: e.target.value }))}
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
                onChange={(e) => setIdeaData(prev => ({ ...prev, go_to_market: e.target.value }))}
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
          </div>
        )}
        
        {/* Variations Tab */}
        {activeTab === 'variations' && (
          <IdeaComponentVariations 
            idea={{
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
            }}
            userId={user?.id}
            onSelectVariation={(componentType, text) => {
              setIdeaData(prev => ({
                ...prev,
                [componentType]: text
              }));
            }}
          />
        )}

        {/* AI Feedback Section */}
        {ideaData.ai_feedback.strengths.length > 0 && (
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

            {/* Next Steps */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Suggested Next Steps</h4>
              <ul className="space-y-2">
                {ideaData.ai_feedback.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <ArrowRight className="h-4 w-4 text-indigo-500 mr-2 mt-0.5" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
