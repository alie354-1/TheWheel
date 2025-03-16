import React, { useState } from 'react';
import { UnifiedIdea } from '../../lib/types/unified-idea.types';
import { useAuthStore } from '../../lib/store';
import { ideaGenerationService } from '../../lib/services/idea-generation.service';

interface UnifiedComponentVariationsProps {
  idea: UnifiedIdea;
  onUpdate: (updates: Partial<UnifiedIdea>) => void;
}

import { ComponentVariation } from '../../lib/types/unified-idea.types';

const UnifiedComponentVariations: React.FC<UnifiedComponentVariationsProps> = ({ idea, onUpdate }) => {
  const { user } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  // Generate component variations
  const generateComponentVariations = async () => {
    if (!idea.title) {
      setLocalError('Please complete the basic info step first');
      return;
    }

    setIsGenerating(true);
    setLocalError('');
    setLocalSuccess('');

    try {
      // Create mock variations since we don't have a direct method for this
      const mockVariations = getMockComponentVariations(idea.title);
      
      // Update the idea with the generated component variations
      onUpdate({
        component_variations: mockVariations
      });

      setLocalSuccess('Component variations generated successfully!');
    } catch (error: any) {
      console.error('Error generating component variations:', error);
      setLocalError(`Error: ${error.message}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle selecting a component
  const handleSelectComponent = (componentName: string) => {
    setSelectedComponent(componentName === selectedComponent ? null : componentName);
  };

  // Handle updating a component variation
  const handleUpdateComponent = (index: number, field: keyof ComponentVariation, value: string | string[]) => {
    if (!idea.component_variations) return;
    
    const updatedVariations = [...idea.component_variations];
    updatedVariations[index] = {
      ...updatedVariations[index],
      [field]: value
    };
    
    onUpdate({
      component_variations: updatedVariations
    });
  };

  // Add a benefit to a component
  const addBenefit = (index: number, benefit: string) => {
    if (!idea.component_variations || !benefit.trim()) return;
    
    const updatedVariations = [...idea.component_variations];
    const updatedBenefits = [...(updatedVariations[index].benefits || []), benefit];
    
    updatedVariations[index] = {
      ...updatedVariations[index],
      benefits: updatedBenefits
    };
    
    onUpdate({
      component_variations: updatedVariations
    });
  };

  // Remove a benefit from a component
  const removeBenefit = (componentIndex: number, benefitIndex: number) => {
    if (!idea.component_variations) return;
    
    const updatedVariations = [...idea.component_variations];
    const updatedBenefits = [...(updatedVariations[componentIndex].benefits || [])];
    updatedBenefits.splice(benefitIndex, 1);
    
    updatedVariations[componentIndex] = {
      ...updatedVariations[componentIndex],
      benefits: updatedBenefits
    };
    
    onUpdate({
      component_variations: updatedVariations
    });
  };

  // Mock data for component variations
  const getMockComponentVariations = (title: string): ComponentVariation[] => {
    return [
      {
        name: 'User Interface',
        description: `The user interface for ${title} can be implemented in several ways, from a minimalist design to a feature-rich dashboard.`,
        benefits: [
          'Intuitive navigation reduces learning curve',
          'Responsive design works on all devices',
          'Customizable layouts for different user preferences',
          'Accessibility features for wider user adoption'
        ],
        implementation_notes: 'Consider using a design system like Material UI or Tailwind CSS for consistent styling. Implement progressive disclosure to avoid overwhelming new users.'
      },
      {
        name: 'Data Storage',
        description: `${title} will need a robust data storage solution to handle user data, preferences, and application state.`,
        benefits: [
          'Scalable architecture for growing user base',
          'Secure data handling for sensitive information',
          'Fast retrieval for responsive application',
          'Backup and recovery systems for data integrity'
        ],
        implementation_notes: 'Consider a hybrid approach with relational database for structured data and NoSQL for unstructured content. Implement caching for frequently accessed data.'
      },
      {
        name: 'Authentication System',
        description: `A secure authentication system is critical for ${title} to protect user accounts and data.`,
        benefits: [
          'Multi-factor authentication for enhanced security',
          'Social login options for convenience',
          'Role-based access control for enterprise features',
          'Session management for security and usability'
        ],
        implementation_notes: 'Consider using OAuth 2.0 for authentication and JWT for authorization. Implement password policies and account recovery workflows.'
      },
      {
        name: 'Integration API',
        description: `An API will allow ${title} to integrate with other tools and services, expanding its functionality.`,
        benefits: [
          'Ecosystem expansion through third-party integrations',
          'Automation capabilities for power users',
          'Data portability between different systems',
          'Extended functionality without core development'
        ],
        implementation_notes: 'Design a RESTful API with clear documentation. Consider implementing webhooks for real-time integrations and GraphQL for flexible data queries.'
      }
    ];
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

      {/* Generate component variations button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={generateComponentVariations}
          disabled={isGenerating}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate Component Variations'}
        </button>
      </div>

      {/* Component variations */}
      {idea.component_variations && idea.component_variations.length > 0 ? (
        <div className="space-y-6">
          {/* Component tabs */}
          <div className="flex flex-wrap gap-2">
            {idea.component_variations.map((component, index) => (
              <button
                key={index}
                onClick={() => handleSelectComponent(component.name)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  selectedComponent === component.name
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {component.name}
              </button>
            ))}
          </div>

          {/* Selected component details */}
          {idea.component_variations.map((component, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg border p-4 ${
                selectedComponent === component.name ? 'block' : 'hidden'
              }`}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Component Name
                  </label>
                  <input
                    type="text"
                    value={component.name}
                    onChange={(e) => handleUpdateComponent(index, 'name', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={component.description}
                    onChange={(e) => handleUpdateComponent(index, 'description', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Benefits
                  </label>
                  <div className="mt-2 space-y-2">
                    {component.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center">
                        <span className="text-green-500 mr-2">•</span>
                        <input
                          type="text"
                          value={benefit}
                          onChange={(e) => {
                            const updatedBenefits = [...component.benefits];
                            updatedBenefits[benefitIndex] = e.target.value;
                            handleUpdateComponent(index, 'benefits', updatedBenefits);
                          }}
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        <button
                          onClick={() => removeBenefit(index, benefitIndex)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder="Add a benefit..."
                        id={`new_benefit_${index}`}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            addBenefit(index, input.value);
                            input.value = '';
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById(`new_benefit_${index}`) as HTMLInputElement;
                          addBenefit(index, input.value);
                          input.value = '';
                        }}
                        className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Implementation Notes
                  </label>
                  <textarea
                    rows={3}
                    value={component.implementation_notes}
                    onChange={(e) => handleUpdateComponent(index, 'implementation_notes', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Generate component variations to see different ways to implement key aspects of your idea.
        </div>
      )}
    </div>
  );
};

export default UnifiedComponentVariations;
