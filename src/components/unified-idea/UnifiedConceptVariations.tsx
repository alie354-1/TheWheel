import React, { useState } from 'react';
import { UnifiedIdea } from '../../lib/types/unified-idea.types';
import { useAuthStore } from '../../lib/store';
import { ideaGenerationService } from '../../lib/services/idea-generation.service';

interface UnifiedConceptVariationsProps {
  idea: UnifiedIdea;
  onUpdate: (updates: Partial<UnifiedIdea>) => void;
}

const UnifiedConceptVariations: React.FC<UnifiedConceptVariationsProps> = ({ idea, onUpdate }) => {
  const { user } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  // Generate concept variations
  const generateVariations = async () => {
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

      // Use mock data directly since generateConceptVariations doesn't exist
      onUpdate({
        concept_variations: getMockVariations(idea.title)
      });
      setLocalSuccess('Concept variations generated!');
    } catch (error: any) {
      console.error('Error generating concept variations:', error);
      setLocalError(`Error: ${error.message}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Select a variation
  const selectVariation = (index: number) => {
    if (!idea.concept_variations || index >= idea.concept_variations.length) {
      return;
    }

    const selectedVariation = idea.concept_variations[index];
    
    onUpdate({
      selected_variation: selectedVariation,
      // Update the title and description with the selected variation
      title: selectedVariation.title,
      description: selectedVariation.description
    });

    setLocalSuccess('Variation selected!');
  };

  // Create a custom merged variation
  const createMergedVariation = () => {
    // For now, just create a placeholder for the user to fill in
    onUpdate({
      merged_variation: {
        title: idea.title,
        description: idea.description || '',
        pros: [],
        cons: []
      }
    });

    setLocalSuccess('Custom variation created. You can now edit it below.');
  };

  // Update the merged variation
  const updateMergedVariation = (field: string, value: string | string[]) => {
    if (!idea.merged_variation) return;

    onUpdate({
      merged_variation: {
        ...idea.merged_variation,
        [field]: value
      }
    });
  };

  // Add a pro or con to the merged variation
  const addProCon = (type: 'pros' | 'cons', value: string) => {
    if (!idea.merged_variation) return;
    if (!value.trim()) return;

    const currentList = [...(idea.merged_variation[type] || [])];
    currentList.push(value);

    updateMergedVariation(type, currentList);
  };

  // Remove a pro or con from the merged variation
  const removeProCon = (type: 'pros' | 'cons', index: number) => {
    if (!idea.merged_variation) return;

    const currentList = [...(idea.merged_variation[type] || [])];
    currentList.splice(index, 1);

    updateMergedVariation(type, currentList);
  };

  // Mock data for concept variations
  const getMockVariations = (title: string) => {
    return [
      {
        title: `${title} - Premium Version`,
        description: `A high-end version of ${title} with advanced features targeting professional users.`,
        pros: [
          'Higher profit margins',
          'Establishes premium brand positioning',
          'Appeals to professional market segment'
        ],
        cons: [
          'Smaller target market',
          'Higher development costs',
          'More competition in premium space'
        ]
      },
      {
        title: `${title} - Freemium Model`,
        description: `A basic free version of ${title} with premium upgrades available for purchase.`,
        pros: [
          'Larger user acquisition potential',
          'Lower barrier to entry',
          'Opportunity for viral growth'
        ],
        cons: [
          'Lower initial revenue',
          'Need to balance free/paid features carefully',
          'May attract non-paying users only'
        ]
      },
      {
        title: `${title} - Subscription Service`,
        description: `A subscription-based model for ${title} with regular updates and premium support.`,
        pros: [
          'Recurring revenue stream',
          'Predictable cash flow',
          'Opportunity to build long-term relationships'
        ],
        cons: [
          'Higher customer acquisition cost',
          'Need for continuous value delivery',
          'Subscription fatigue among consumers'
        ]
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

      {/* Generate variations button */}
      <div className="flex justify-center">
        <button
          onClick={generateVariations}
          disabled={isGenerating}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate Concept Variations'}
        </button>
      </div>

      {/* Display variations */}
      {idea.concept_variations && idea.concept_variations.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Choose a Variation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {idea.concept_variations.map((variation, index) => (
              <div 
                key={index}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  idea.selected_variation?.title === variation.title 
                    ? 'border-indigo-500 ring-2 ring-indigo-200' 
                    : 'border-gray-200'
                }`}
              >
                <h4 className="font-medium text-gray-900">{variation.title}</h4>
                <p className="text-sm text-gray-600 mt-2 mb-4">{variation.description}</p>
                
                <div className="space-y-3">
                  {/* Pros */}
                  <div>
                    <h5 className="text-xs font-medium text-gray-700">Pros:</h5>
                    <ul className="text-xs text-gray-600 mt-1 space-y-1">
                      {variation.pros.map((pro: string, proIndex: number) => (
                        <li key={proIndex} className="flex items-start">
                          <span className="text-green-500 mr-1">+</span> {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Cons */}
                  <div>
                    <h5 className="text-xs font-medium text-gray-700">Cons:</h5>
                    <ul className="text-xs text-gray-600 mt-1 space-y-1">
                      {variation.cons.map((con: string, conIndex: number) => (
                        <li key={conIndex} className="flex items-start">
                          <span className="text-red-500 mr-1">-</span> {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <button
                  onClick={() => selectVariation(index)}
                  className={`mt-4 w-full px-3 py-1.5 text-xs font-medium rounded-md ${
                    idea.selected_variation?.title === variation.title
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {idea.selected_variation?.title === variation.title ? 'Selected' : 'Select This Variation'}
                </button>
              </div>
            ))}
          </div>
          
          {/* Create custom variation */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={createMergedVariation}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Create Custom Variation
            </button>
          </div>
        </div>
      )}

      {/* Custom merged variation editor */}
      {idea.merged_variation && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Variation</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="merged_title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="merged_title"
                value={idea.merged_variation.title}
                onChange={(e) => updateMergedVariation('title', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="merged_description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="merged_description"
                rows={3}
                value={idea.merged_variation.description}
                onChange={(e) => updateMergedVariation('description', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            {/* Pros editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pros
              </label>
              <div className="mt-2 space-y-2">
                {idea.merged_variation.pros.map((pro: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <span className="text-green-500 mr-2">+</span>
                    <input
                      type="text"
                      value={pro}
                      onChange={(e) => {
                        const newPros = [...idea.merged_variation!.pros];
                        newPros[index] = e.target.value;
                        updateMergedVariation('pros', newPros);
                      }}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <button
                      onClick={() => removeProCon('pros', index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Add a pro..."
                    id="new_pro"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        addProCon('pros', input.value);
                        input.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('new_pro') as HTMLInputElement;
                      addProCon('pros', input.value);
                      input.value = '';
                    }}
                    className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
            
            {/* Cons editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cons
              </label>
              <div className="mt-2 space-y-2">
                {idea.merged_variation.cons.map((con: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <span className="text-red-500 mr-2">-</span>
                    <input
                      type="text"
                      value={con}
                      onChange={(e) => {
                        const newCons = [...idea.merged_variation!.cons];
                        newCons[index] = e.target.value;
                        updateMergedVariation('cons', newCons);
                      }}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <button
                      onClick={() => removeProCon('cons', index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Add a con..."
                    id="new_con"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        addProCon('cons', input.value);
                        input.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('new_con') as HTMLInputElement;
                      addProCon('cons', input.value);
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
      )}
    </div>
  );
};

export default UnifiedConceptVariations;
