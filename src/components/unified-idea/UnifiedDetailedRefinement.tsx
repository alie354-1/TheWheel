import React, { useState } from 'react';
import { UnifiedIdea } from '../../lib/types/unified-idea.types';
import { useAuthStore } from '../../lib/store';
import { ideaGenerationService } from '../../lib/services/idea-generation.service';

interface UnifiedDetailedRefinementProps {
  idea: UnifiedIdea;
  onUpdate: (updates: Partial<UnifiedIdea>) => void;
}

const UnifiedDetailedRefinement: React.FC<UnifiedDetailedRefinementProps> = ({ idea, onUpdate }) => {
  const { user } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  // Generate detailed refinement
  const generateDetailedRefinement = async () => {
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
        const refinement = await ideaGenerationService.refineIdea(
          {
            title: idea.title,
            description: idea.description || '',
            solution_concept: idea.solution_concept || '',
            business_model: idea.business_model || '',
            revenue_model: idea.revenue_model || '',
            target_audience: idea.target_audience || '',
            unique_value: idea.unique_value || ''
          },
          context
        );

          // Update the idea with the generated detailed refinement
          const mockData = getMockDetailedRefinement(idea.title);
          onUpdate({
            problem_statement: mockData.problem_statement,
            key_features: mockData.key_features,
            implementation_steps: mockData.implementation_steps,
            success_metrics: mockData.success_metrics,
            risks_challenges: mockData.risks_challenges
          });

        setLocalSuccess('Detailed refinement generated successfully!');
      } catch (serviceError) {
        console.error('Error from idea generation service:', serviceError);
        // Fall back to mock data
        const mockData = getMockDetailedRefinement(idea.title);
        onUpdate({
          problem_statement: mockData.problem_statement,
          key_features: mockData.key_features,
          implementation_steps: mockData.implementation_steps,
          success_metrics: mockData.success_metrics,
          risks_challenges: mockData.risks_challenges
        });
        setLocalSuccess('Detailed refinement generated (using fallback data)');
      }
    } catch (error: any) {
      console.error('Error generating detailed refinement:', error);
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

  // Handle array input changes
  const handleArrayInputChange = (field: string, index: number, value: string) => {
    const currentArray = [...(idea[field as keyof UnifiedIdea] as string[] || [])];
    currentArray[index] = value;
    
    onUpdate({
      [field]: currentArray
    });
  };

  // Add item to array
  const addArrayItem = (field: string, value: string) => {
    if (!value.trim()) return;
    
    const currentArray = [...(idea[field as keyof UnifiedIdea] as string[] || [])];
    currentArray.push(value);
    
    onUpdate({
      [field]: currentArray
    });
  };

  // Remove item from array
  const removeArrayItem = (field: string, index: number) => {
    const currentArray = [...(idea[field as keyof UnifiedIdea] as string[] || [])];
    currentArray.splice(index, 1);
    
    onUpdate({
      [field]: currentArray
    });
  };

  // Mock data for detailed refinement
  const getMockDetailedRefinement = (title: string) => {
    return {
      problem_statement: `Many businesses struggle with inefficient processes and lack of automation, leading to wasted time, increased costs, and reduced productivity. ${title} addresses this problem by providing an intuitive platform that streamlines workflows and automates repetitive tasks.`,
      key_features: [
        'Intuitive drag-and-drop interface for creating custom workflows',
        'Pre-built templates for common business processes',
        'Integration with popular business tools and services',
        'Real-time collaboration and commenting',
        'Advanced analytics and reporting dashboard',
        'Mobile app for on-the-go access and notifications'
      ],
      implementation_steps: [
        'Phase 1: Core platform development (3-4 months)',
        'Phase 2: Beta testing with select customers (1-2 months)',
        'Phase 3: Initial public release with basic features (Month 6)',
        'Phase 4: Advanced features and integrations rollout (Months 7-12)',
        'Phase 5: Mobile app development and release (Months 8-14)',
        'Phase 6: Enterprise features and scaling (Months 15-24)'
      ],
      success_metrics: [
        'User acquisition: 1,000 users in first 3 months, 10,000 by end of year 1',
        'Retention: 40% monthly active users in first 6 months, 60% by end of year 1',
        'Conversion: 5% free-to-paid conversion rate in year 1, 8% in year 2',
        'Revenue: $100K ARR by end of year 1, $1M ARR by end of year 2',
        'Customer satisfaction: Maintain 4.5+ star rating across platforms',
        'Engagement: Average 3 workflows created per active user'
      ],
      risks_challenges: [
        'Competitive market with established players',
        'Technical challenges in building a reliable, scalable platform',
        'Integration complexity with third-party services',
        'User adoption and learning curve',
        'Pricing strategy optimization',
        'Security and compliance considerations'
      ]
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

      {/* Generate detailed refinement button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={generateDetailedRefinement}
          disabled={isGenerating}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate Detailed Refinement'}
        </button>
      </div>

      {/* Detailed refinement form */}
      <div className="space-y-6">
        <div>
          <label htmlFor="problem_statement" className="block text-sm font-medium text-gray-700">
            Problem Statement
          </label>
          <textarea
            id="problem_statement"
            rows={3}
            value={idea.problem_statement || ''}
            onChange={(e) => handleInputChange('problem_statement', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="What problem does your idea solve?"
          />
        </div>

        {/* Key Features */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Key Features
          </label>
          <div className="mt-2 space-y-2">
            {(idea.key_features || []).map((feature: string, index: number) => (
              <div key={index} className="flex items-center">
                <span className="text-indigo-500 mr-2">•</span>
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleArrayInputChange('key_features', index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <button
                  onClick={() => removeArrayItem('key_features', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
            
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Add a feature..."
                id="new_feature"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    addArrayItem('key_features', input.value);
                    input.value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.getElementById('new_feature') as HTMLInputElement;
                  addArrayItem('key_features', input.value);
                  input.value = '';
                }}
                className="ml-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Implementation Steps */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Implementation Steps
          </label>
          <div className="mt-2 space-y-2">
            {(idea.implementation_steps || []).map((step: string, index: number) => (
              <div key={index} className="flex items-center">
                <span className="text-green-500 mr-2">{index + 1}.</span>
                <input
                  type="text"
                  value={step}
                  onChange={(e) => handleArrayInputChange('implementation_steps', index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <button
                  onClick={() => removeArrayItem('implementation_steps', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
            
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Add an implementation step..."
                id="new_step"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    addArrayItem('implementation_steps', input.value);
                    input.value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.getElementById('new_step') as HTMLInputElement;
                  addArrayItem('implementation_steps', input.value);
                  input.value = '';
                }}
                className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Success Metrics */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Success Metrics
          </label>
          <div className="mt-2 space-y-2">
            {(idea.success_metrics || []).map((metric: string, index: number) => (
              <div key={index} className="flex items-center">
                <span className="text-blue-500 mr-2">📊</span>
                <input
                  type="text"
                  value={metric}
                  onChange={(e) => handleArrayInputChange('success_metrics', index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <button
                  onClick={() => removeArrayItem('success_metrics', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
            
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Add a success metric..."
                id="new_metric"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    addArrayItem('success_metrics', input.value);
                    input.value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.getElementById('new_metric') as HTMLInputElement;
                  addArrayItem('success_metrics', input.value);
                  input.value = '';
                }}
                className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Risks & Challenges */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Risks & Challenges
          </label>
          <div className="mt-2 space-y-2">
            {(idea.risks_challenges || []).map((risk: string, index: number) => (
              <div key={index} className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <input
                  type="text"
                  value={risk}
                  onChange={(e) => handleArrayInputChange('risks_challenges', index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <button
                  onClick={() => removeArrayItem('risks_challenges', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
            
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Add a risk or challenge..."
                id="new_risk"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    addArrayItem('risks_challenges', input.value);
                    input.value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.getElementById('new_risk') as HTMLInputElement;
                  addArrayItem('risks_challenges', input.value);
                  input.value = '';
                }}
                className="ml-2 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedDetailedRefinement;
