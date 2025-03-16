import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Brain, 
  AlertCircle, 
  RotateCw, 
  Check, 
  Edit3, 
  Save,
  Trash2,
  Shuffle,
  Plus
} from 'lucide-react';
import { useIdeaContext } from '../../lib/contexts/IdeaContext';
import { ideaGenerationService, IdeaVariation } from '../../lib/services/idea-generation.service';
import { useAuthStore } from '../../lib/store';
import { ideaMemoryService } from '../../lib/services/idea-memory.service';
import { v4 as uuidv4 } from 'uuid';

const ConceptVariations: React.FC = () => {
  console.log('ConceptVariations component mounted');
  
  const { user } = useAuthStore();
  const { 
    ideaData, 
    setIdeaData, 
    error, 
    setError,
    setCurrentStep,
    currentStep,
    saveToLocalStorage
  } = useIdeaContext();
  
  console.log('ConceptVariations: Current step is', currentStep);
  console.log('ConceptVariations: Idea data title is', ideaData.title);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState<IdeaVariation[]>([]);
  const [editingVariation, setEditingVariation] = useState<string | null>(null);
  const [mergeMode, setMergeMode] = useState(false);
  const [selectedForMerge, setSelectedForMerge] = useState<string[]>([]);
  const [mergedVariation, setMergedVariation] = useState<IdeaVariation | null>(null);
  
  // Log when the component renders
  console.log('ConceptVariations: Rendering with variations:', variations.length);

  // Initialize variations from context if available
  useEffect(() => {
    if (ideaData.concept_variations && ideaData.concept_variations.length > 0) {
      setVariations(ideaData.concept_variations);
    } else {
      // Generate variations automatically if we have basic info
      if (ideaData.title && ideaData.description) {
        generateVariations();
      }
    }
    
    // Initialize selected variation if available
    if (ideaData.selected_variation) {
      // Mark the selected variation in the UI
      setVariations(prev => 
        prev.map(v => 
          v.id === ideaData.selected_variation?.id 
            ? { ...v, isSelected: true } 
            : { ...v, isSelected: false }
        )
      );
    }
    
    // Initialize merged variation if available
    if (ideaData.merged_variation) {
      setMergedVariation({
        id: 'merged',
        title: ideaData.merged_variation.title,
        description: ideaData.merged_variation.description,
        differentiator: ideaData.merged_variation.differentiator,
        targetMarket: ideaData.merged_variation.targetMarket,
        revenueModel: ideaData.merged_variation.revenueModel,
        isSelected: true
      });
    }
  }, [ideaData.concept_variations, ideaData.selected_variation, ideaData.merged_variation]);

  const generateVariations = async () => {
    if (!ideaData.title || !ideaData.description) {
      setError('Please provide at least a title and description before generating variations');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    // Create mock variations based on the current idea data
    const createMockVariations = (): IdeaVariation[] => {
      console.log('Creating mock variations for:', ideaData.title);
      return [
        {
          id: uuidv4(),
          title: `Premium ${ideaData.title}`,
          description: `A high-end version of ${ideaData.description} targeting luxury market`,
          differentiator: "Premium materials and exclusive features",
          targetMarket: "Affluent professionals and luxury consumers",
          revenueModel: "High margin, subscription-based pricing",
          isSelected: false
        },
        {
          id: uuidv4(),
          title: `Budget ${ideaData.title}`,
          description: `An affordable version of ${ideaData.description} for mass market`,
          differentiator: "Cost-effective solution with essential features",
          targetMarket: "Price-conscious consumers and small businesses",
          revenueModel: "Volume-based, freemium model with upsells",
          isSelected: false
        },
        {
          id: uuidv4(),
          title: `Enterprise ${ideaData.title}`,
          description: `A robust version of ${ideaData.description} for large organizations`,
          differentiator: "Scalable infrastructure with advanced security",
          targetMarket: "Large corporations and government agencies",
          revenueModel: "Annual contracts with service level agreements",
          isSelected: false
        },
        {
          id: uuidv4(),
          title: `Mobile ${ideaData.title}`,
          description: `A portable version of ${ideaData.description} for on-the-go use`,
          differentiator: "Mobility and convenience with cloud sync",
          targetMarket: "Digital nomads and mobile professionals",
          revenueModel: "App store purchases with subscription options",
          isSelected: false
        },
        {
          id: uuidv4(),
          title: `${ideaData.title} Marketplace`,
          description: `A platform connecting providers and users of ${ideaData.description}`,
          differentiator: "Network effects and community features",
          targetMarket: "Two-sided market of providers and consumers",
          revenueModel: "Transaction fees and premium listings",
          isSelected: false
        }
      ];
    };

    try {
      // Always generate mock variations first to ensure we have something to display
      const mockVariations = createMockVariations();
      
      // Update the variations state with mock data immediately
      setVariations(mockVariations);
      
      // Save the mock variations to the context
      setIdeaData(prev => ({
        ...prev,
        concept_variations: mockVariations,
        // Clear any previously selected or merged variations
        selected_variation: undefined,
        merged_variation: undefined
      }));
      
      console.log('Mock variations generated successfully:', mockVariations.length);
      
      // Try to get enhanced variations if the feature is enabled
      try {
        // Check if enhanced idea generation is enabled
        const isEnhanced = await ideaMemoryService.isFeatureEnabled('enhanced_idea_generation', user?.id);
        console.log('Enhanced idea generation enabled:', isEnhanced);
        
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
            solution_concept: ideaData.solution_concept
          };
          
          console.log('Requesting AI-generated variations for:', idea.title);
          
          // Get variations using the idea generation service
          const generatedVariations = await ideaGenerationService.generateIdeaVariations(idea, context);
          
          console.log('AI-generated variations received:', generatedVariations.length);
          
          if (generatedVariations && generatedVariations.length > 0) {
            // Update the variations state with AI-generated data
            setVariations(generatedVariations);
            
            // Save the AI-generated variations to the context
            setIdeaData(prev => ({
              ...prev,
              concept_variations: generatedVariations,
              // Clear any previously selected or merged variations
              selected_variation: undefined,
              merged_variation: undefined
            }));
          }
        }
      } catch (enhancedError: any) {
        console.error('Error generating enhanced variations:', enhancedError);
        // Don't set error since we already have mock variations displayed
      }
    } catch (error: any) {
      console.error('Error in variation generation process:', error);
      setError('Failed to generate variations. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectVariation = (id: string) => {
    if (mergeMode) {
      // In merge mode, toggle selection for merging
      if (selectedForMerge.includes(id)) {
        setSelectedForMerge(prev => prev.filter(vId => vId !== id));
      } else {
        // Limit to 5 selections
        if (selectedForMerge.length < 5) {
          setSelectedForMerge(prev => [...prev, id]);
        } else {
          setError('You can select a maximum of 5 variations to merge');
        }
      }
    } else {
      // In normal mode, select a single variation
      const selectedVariation = variations.find(v => v.id === id);
      if (!selectedVariation) return;
      
      // Update the variations state
      setVariations(prev => 
        prev.map(v => ({
          ...v,
          isSelected: v.id === id
        }))
      );
      
      // Clear any merged variation
      setMergedVariation(null);
      
      // Save the selected variation to the context
      setIdeaData(prev => ({
        ...prev,
        selected_variation: selectedVariation,
        merged_variation: undefined
      }));
    }
  };

  const handleEditVariation = (id: string) => {
    setEditingVariation(id);
  };

  const handleSaveEdit = (id: string, updatedVariation: IdeaVariation) => {
    // Update the variations state
    setVariations(prev => 
      prev.map(v => 
        v.id === id ? { ...updatedVariation, isEditing: false } : v
      )
    );
    
    // If this was the selected variation, update it in the context
    if (variations.find(v => v.id === id)?.isSelected) {
      setIdeaData(prev => ({
        ...prev,
        selected_variation: updatedVariation
      }));
    }
    
    // Exit edit mode
    setEditingVariation(null);
  };

  const handleDeleteVariation = (id: string) => {
    // Remove the variation from the state
    setVariations(prev => prev.filter(v => v.id !== id));
    
    // If this was the selected variation, clear it from the context
    if (variations.find(v => v.id === id)?.isSelected) {
      setIdeaData(prev => ({
        ...prev,
        selected_variation: undefined
      }));
    }
    
    // Remove from merge selection if applicable
    if (selectedForMerge.includes(id)) {
      setSelectedForMerge(prev => prev.filter(vId => vId !== id));
    }
  };

  const handleToggleMergeMode = () => {
    setMergeMode(prev => !prev);
    setSelectedForMerge([]);
  };

  const handleMergeVariations = () => {
    if (selectedForMerge.length < 2) {
      setError('Please select at least two variations to merge');
      return;
    }
    
    // Get the selected variations
    const selectedVariations = variations.filter(v => selectedForMerge.includes(v.id));
    
    // Create a merged variation with a more cohesive combination of the selected variations
    const merged: IdeaVariation = {
      id: 'merged',
      title: `Merged: ${selectedVariations.map(v => v.title.split(' ')[0]).join(' + ')}`,
      description: `A combined approach that ${selectedVariations.map((v, i) => 
        i === 0 
          ? `incorporates ${v.description.toLowerCase().replace(/^a |^an |^the /i, '')}` 
          : `with ${v.description.toLowerCase().replace(/^a |^an |^the /i, '')}`
      ).join(' ')}`,
      differentiator: `Unique combination of ${selectedVariations.map(v => 
        v.differentiator.toLowerCase().replace(/\.$/, '')
      ).join(' and ')}`,
      targetMarket: `${selectedVariations.map(v => 
        v.targetMarket.toLowerCase().replace(/\.$/, '')
      ).join(', serving both ')}`,
      revenueModel: `Multi-faceted approach using ${selectedVariations.map(v => 
        v.revenueModel.toLowerCase().replace(/\.$/, '')
      ).join(' combined with ')}`,
      isSelected: true
    };
    
    // Set the merged variation
    setMergedVariation(merged);
    
    // Update the variations state to deselect all
    setVariations(prev => 
      prev.map(v => ({
        ...v,
        isSelected: false
      }))
    );
    
    // Save the merged variation to the context
    setIdeaData(prev => ({
      ...prev,
      merged_variation: {
        title: merged.title,
        description: merged.description,
        differentiator: merged.differentiator,
        targetMarket: merged.targetMarket,
        revenueModel: merged.revenueModel
      },
      selected_variation: undefined
    }));
    
    // Exit merge mode
    setMergeMode(false);
    setSelectedForMerge([]);
  };

  const handleContinue = () => {
    // Check if a variation is selected or merged
    if (!variations.some(v => v.isSelected) && !mergedVariation) {
      setError('Please select a variation or merge variations before continuing');
      return;
    }
    
    // Save current state to localStorage
    saveToLocalStorage();
    
    // If a variation is selected, update the idea data with its details
    const selectedVariation = variations.find(v => v.isSelected);
    if (selectedVariation) {
      setIdeaData(prev => ({
        ...prev,
        title: selectedVariation.title || prev.title,
        description: selectedVariation.description || prev.description,
        // We can also pre-populate some of the detailed fields
        target_audience: selectedVariation.targetMarket || prev.target_audience,
        unique_value: selectedVariation.differentiator || prev.unique_value,
        revenue_model: selectedVariation.revenueModel || prev.revenue_model
      }));
    } else if (mergedVariation) {
      // If variations were merged, update with the merged details
      setIdeaData(prev => ({
        ...prev,
        title: mergedVariation.title || prev.title,
        description: mergedVariation.description || prev.description,
        target_audience: mergedVariation.targetMarket || prev.target_audience,
        unique_value: mergedVariation.differentiator || prev.unique_value,
        revenue_model: mergedVariation.revenueModel || prev.revenue_model
      }));
    }
    
    // Use the context's setCurrentStep which now handles navigation properly
    setCurrentStep(2);
  };

  const VariationCard: React.FC<{
    variation: IdeaVariation;
    isEditing: boolean;
    isSelected: boolean;
    isMergeSelected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onSave: (updated: IdeaVariation) => void;
    onDelete: () => void;
  }> = ({ 
    variation, 
    isEditing, 
    isSelected, 
    isMergeSelected,
    onSelect, 
    onEdit, 
    onSave, 
    onDelete 
  }) => {
    const [editedVariation, setEditedVariation] = useState<IdeaVariation>(variation);
    
    useEffect(() => {
      setEditedVariation(variation);
    }, [variation]);
    
    const handleInputChange = (field: keyof IdeaVariation, value: string) => {
      setEditedVariation(prev => ({
        ...prev,
        [field]: value
      }));
    };
    
    if (isEditing) {
      return (
        <div className={`p-4 border rounded-lg shadow-sm ${isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={editedVariation.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={2}
                value={editedVariation.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Key Differentiator</label>
              <textarea
                rows={2}
                value={editedVariation.differentiator}
                onChange={(e) => handleInputChange('differentiator', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Market</label>
              <textarea
                rows={2}
                value={editedVariation.targetMarket}
                onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Revenue Model</label>
              <textarea
                rows={2}
                value={editedVariation.revenueModel}
                onChange={(e) => handleInputChange('revenueModel', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => onSave(editedVariation)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div 
        className={`p-4 border rounded-lg shadow-sm transition-all ${
          isSelected 
            ? 'border-indigo-500 bg-indigo-50' 
            : isMergeSelected
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-gray-900">{variation.title}</h3>
          <div className="flex space-x-1">
            <button
              onClick={onEdit}
              className="p-1 text-gray-400 hover:text-gray-500"
              title="Edit"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-gray-400 hover:text-red-500"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mb-3">{variation.description}</p>
        
        <div className="space-y-2 mb-4">
          <div>
            <span className="text-xs font-medium text-gray-500">Key Differentiator:</span>
            <p className="text-sm text-gray-700">{variation.differentiator}</p>
          </div>
          
          <div>
            <span className="text-xs font-medium text-gray-500">Target Market:</span>
            <p className="text-sm text-gray-700">{variation.targetMarket}</p>
          </div>
          
          <div>
            <span className="text-xs font-medium text-gray-500">Revenue Model:</span>
            <p className="text-sm text-gray-700">{variation.revenueModel}</p>
          </div>
        </div>
        
        <button
          onClick={onSelect}
          className={`w-full inline-flex justify-center items-center px-4 py-2 border text-sm font-medium rounded-md ${
            isSelected || isMergeSelected
              ? 'border-transparent text-white bg-indigo-600 hover:bg-indigo-700'
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
          }`}
        >
          {isSelected ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Selected
            </>
          ) : isMergeSelected ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Selected for Merge
            </>
          ) : mergeMode ? (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Select for Merge
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Select This Variation
            </>
          )}
        </button>
      </div>
    );
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

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Concept Variations</h3>
        
        <div className="flex space-x-3">
          <button
            onClick={handleToggleMergeMode}
            className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
              mergeMode
                ? 'border-transparent text-white bg-purple-600 hover:bg-purple-700'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <Shuffle className="h-4 w-4 mr-2" />
            {mergeMode ? 'Exit Merge Mode' : 'Merge Variations'}
          </button>
          
          <button
            onClick={generateVariations}
            disabled={isGenerating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Regenerate Variations
              </>
            )}
          </button>
        </div>
      </div>

      {mergeMode && selectedForMerge.length > 0 && (
        <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-purple-700">
                <span className="font-medium">{selectedForMerge.length}</span> variations selected for merging
              </p>
              <p className="text-xs text-purple-500">
                Select 2-5 variations to combine their features
              </p>
            </div>
            
            <button
              onClick={handleMergeVariations}
              disabled={selectedForMerge.length < 2}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              <Shuffle className="h-4 w-4 mr-1" />
              Merge Selected
            </button>
          </div>
        </div>
      )}

      {/* Merged Variation Card */}
      {mergedVariation && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-purple-700 mb-3">Merged Variation</h4>
          <div className="p-4 border-2 border-purple-500 rounded-lg shadow-sm bg-purple-50">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium text-gray-900">{mergedVariation.title}</h3>
            </div>
            
            <p className="text-sm text-gray-500 mb-3">{mergedVariation.description}</p>
            
            <div className="space-y-2 mb-4">
              <div>
                <span className="text-xs font-medium text-gray-500">Key Differentiator:</span>
                <p className="text-sm text-gray-700">{mergedVariation.differentiator}</p>
              </div>
              
              <div>
                <span className="text-xs font-medium text-gray-500">Target Market:</span>
                <p className="text-sm text-gray-700">{mergedVariation.targetMarket}</p>
              </div>
              
              <div>
                <span className="text-xs font-medium text-gray-500">Revenue Model:</span>
                <p className="text-sm text-gray-700">{mergedVariation.revenueModel}</p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setMergedVariation(null);
                  setIdeaData(prev => ({
                    ...prev,
                    merged_variation: undefined
                  }));
                }}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Discard
              </button>
              
              <button
                onClick={handleContinue}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Continue with This Variation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Variation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {variations.map(variation => (
          <VariationCard
            key={variation.id}
            variation={variation}
            isEditing={editingVariation === variation.id}
            isSelected={variation.isSelected || false}
            isMergeSelected={selectedForMerge.includes(variation.id)}
            onSelect={() => handleSelectVariation(variation.id)}
            onEdit={() => handleEditVariation(variation.id)}
            onSave={(updated) => handleSaveEdit(variation.id, updated)}
            onDelete={() => handleDeleteVariation(variation.id)}
          />
        ))}
      </div>

      {variations.length > 0 && !mergedVariation && (
        <div className="flex justify-end mt-6">
          <button
            onClick={handleContinue}
            disabled={!variations.some(v => v.isSelected)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            Continue with Selected Variation
          </button>
        </div>
      )}
    </div>
  );
};

export default ConceptVariations;
