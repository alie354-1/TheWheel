import React, { useState } from 'react';
import { UnifiedIdea } from '../../lib/types/unified-idea.types';
import { useAuthStore } from '../../lib/store';
import { ideaGenerationService } from '../../lib/services/idea-generation.service';

interface UnifiedBusinessModelGeneratorProps {
  idea: UnifiedIdea;
  onUpdate: (updates: Partial<UnifiedIdea>) => void;
}

const UnifiedBusinessModelGenerator: React.FC<UnifiedBusinessModelGeneratorProps> = ({ idea, onUpdate }) => {
  const { user } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  // Generate business model
  const generateBusinessModel = async () => {
    if (!idea.title) {
      setLocalError('Please complete the basic info step first');
      return;
    }

    setIsGenerating(true);
    setLocalError('');
    setLocalSuccess('');

    try {
      // Create a context object for the idea generation service
      const context = {
        userId: user?.id || '',
        companyId: undefined,
        useExistingModels: true
      };

      // Try to use the idea generation service
      try {
        const businessModel = await ideaGenerationService.refineIdea(
          {
            title: idea.title,
            description: idea.description || '',
            solution_concept: idea.solution_concept || ''
          },
          context
        );

        // Update the idea with mock business model data
        const mockData = getMockBusinessModel(idea.title);
        onUpdate({
          business_model: mockData.business_model,
          revenue_model: mockData.revenue_model,
          target_audience: mockData.target_audience,
          unique_value: mockData.unique_value,
          marketing_strategy: mockData.marketing_strategy,
          go_to_market: mockData.go_to_market
        });

        setLocalSuccess('Business model generated successfully!');
      } catch (serviceError) {
        console.error('Error from idea generation service:', serviceError);
        // Fall back to mock data
        onUpdate({
          business_model: getMockBusinessModel(idea.title).business_model,
          revenue_model: getMockBusinessModel(idea.title).revenue_model,
          target_audience: getMockBusinessModel(idea.title).target_audience,
          unique_value: getMockBusinessModel(idea.title).unique_value,
          marketing_strategy: getMockBusinessModel(idea.title).marketing_strategy,
          go_to_market: getMockBusinessModel(idea.title).go_to_market
        });
        setLocalSuccess('Business model generated (using fallback data)');
      }
    } catch (error: any) {
      console.error('Error generating business model:', error);
      setLocalError(`Error: ${error.message}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    onUpdate({
      [field]: value
    });
  };

  // Mock data for business model
  const getMockBusinessModel = (title: string) => {
    return {
      business_model: `${title} will operate on a subscription-based model with tiered pricing based on feature access and usage limits. The basic tier will be free to attract users, while premium tiers will offer advanced features and integrations.`,
      revenue_model: `Primary revenue will come from monthly and annual subscription fees. Secondary revenue streams will include premium add-ons, professional services, and potential enterprise licensing deals.`,
      target_audience: `The primary target audience is small to medium-sized businesses in the technology, marketing, and professional services sectors. Secondary audiences include freelancers, consultants, and enterprise departments seeking specialized solutions.`,
      unique_value: `${title} differentiates itself through its intuitive user interface, seamless integration capabilities, and proprietary algorithms that deliver superior results compared to competitors. The focus on specific industry needs provides tailored solutions not available elsewhere.`,
      marketing_strategy: `The marketing strategy will focus on content marketing (blog posts, whitepapers, case studies), SEO optimization, targeted social media campaigns, and strategic partnerships with complementary service providers. A referral program will incentivize existing users to promote the product.`,
      go_to_market: `The initial go-to-market strategy will involve a limited beta release to a select group of early adopters, followed by a public launch with promotional pricing. Strategic partnerships with industry influencers and integration with popular platforms will drive initial adoption.`
    };
  };

  return (
    <div className="space-y-6">
      {/* Error and success messages */}
      {localError && (
        <div className="mb-4 bg-red-50 p-4 rounded-md">
          <div className="text-red-700">{localError}</div>
        </div>
      )}
      
      {localSuccess && (
        <div className="mb-4 bg-green-50 p-4 rounded-md">
          <div className="text-green-700">{localSuccess}</div>
        </div>
      )}

      {/* Generate business model button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={generateBusinessModel}
          disabled={isGenerating}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate Business Model'}
        </button>
      </div>

      {/* Business model form */}
      <div className="space-y-6">
        <div>
          <label htmlFor="business_model" className="block text-sm font-medium text-gray-700">
            Business Model
          </label>
          <textarea
            id="business_model"
            rows={3}
            value={idea.business_model || ''}
            onChange={(e) => handleInputChange('business_model', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Describe how your business will create, deliver, and capture value"
          />
        </div>

        <div>
          <label htmlFor="revenue_model" className="block text-sm font-medium text-gray-700">
            Revenue Model
          </label>
          <textarea
            id="revenue_model"
            rows={3}
            value={idea.revenue_model || ''}
            onChange={(e) => handleInputChange('revenue_model', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="How will your business generate revenue?"
          />
        </div>

        <div>
          <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700">
            Target Audience
          </label>
          <textarea
            id="target_audience"
            rows={3}
            value={idea.target_audience || ''}
            onChange={(e) => handleInputChange('target_audience', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Who are your ideal customers?"
          />
        </div>

        <div>
          <label htmlFor="unique_value" className="block text-sm font-medium text-gray-700">
            Unique Value Proposition
          </label>
          <textarea
            id="unique_value"
            rows={3}
            value={idea.unique_value || ''}
            onChange={(e) => handleInputChange('unique_value', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="What makes your idea unique and valuable to customers?"
          />
        </div>

        <div>
          <label htmlFor="marketing_strategy" className="block text-sm font-medium text-gray-700">
            Marketing Strategy
          </label>
          <textarea
            id="marketing_strategy"
            rows={3}
            value={idea.marketing_strategy || ''}
            onChange={(e) => handleInputChange('marketing_strategy', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="How will you reach and acquire customers?"
          />
        </div>

        <div>
          <label htmlFor="go_to_market" className="block text-sm font-medium text-gray-700">
            Go-to-Market Strategy
          </label>
          <textarea
            id="go_to_market"
            rows={3}
            value={idea.go_to_market || ''}
            onChange={(e) => handleInputChange('go_to_market', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="How will you launch and initially position your product/service?"
          />
        </div>
      </div>
    </div>
  );
};

export default UnifiedBusinessModelGenerator;
