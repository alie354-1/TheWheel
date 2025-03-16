import React, { useState, useEffect } from 'react';
import { useUnifiedIdeaContext } from '../../lib/contexts/UnifiedIdeaContext';
import { UnifiedIdea } from '../../lib/types/unified-idea.types';

// Import existing refinement components
import UnifiedStepIndicator from './UnifiedStepIndicator';
import UnifiedStepNavigation from './UnifiedStepNavigation';
import UnifiedBasicIdeaInfo from './UnifiedBasicIdeaInfo';
import UnifiedConceptVariations from './UnifiedConceptVariations';
import UnifiedBusinessModelGenerator from './UnifiedBusinessModelGenerator';
import UnifiedDetailedRefinement from './UnifiedDetailedRefinement';
import UnifiedComponentVariations from './UnifiedComponentVariations';

interface IdeaRefinementPanelProps {
  idea: UnifiedIdea;
  onBack: () => void;
}

// Define the refinement steps
const REFINEMENT_STEPS = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'concept', label: 'Concept Variations' },
  { id: 'business', label: 'Business Model' },
  { id: 'detailed', label: 'Detailed Refinement' },
  { id: 'components', label: 'Component Variations' }
];

const IdeaRefinementPanel: React.FC<IdeaRefinementPanelProps> = ({ idea, onBack }) => {
  const { 
    updateIdea, 
    currentRefinementStep, 
    setCurrentRefinementStep,
    isLoading,
    error,
    success
  } = useUnifiedIdeaContext();
  
  // Local state for the idea being refined
  const [refinedIdea, setRefinedIdea] = useState<UnifiedIdea>(idea);
  
  // Update local state when the idea changes
  useEffect(() => {
    setRefinedIdea(idea);
  }, [idea]);
  
  // Map refinement stage to step index
  useEffect(() => {
    // Set the initial step based on the idea's refinement stage
    const stageToStepMap: Record<string, number> = {
      'draft': 0,
      'concept': 1,
      'business_model': 2,
      'detailed': 3,
      'components': 4,
      'complete': 4
    };
    
    const initialStep = stageToStepMap[idea.refinement_stage] || 0;
    setCurrentRefinementStep(initialStep);
  }, [idea.refinement_stage, setCurrentRefinementStep]);
  
  // Handle step changes
  const handleStepChange = (step: number) => {
    // Save the current state before changing steps
    saveCurrentState();
    
    // Update the step
    setCurrentRefinementStep(step);
    
    // Update the refinement stage based on the step
    const stepToStageMap: Record<number, UnifiedIdea['refinement_stage']> = {
      0: 'draft',
      1: 'concept',
      2: 'business_model',
      3: 'detailed',
      4: 'components'
    };
    
    const newStage = stepToStageMap[step];
    if (newStage && newStage !== refinedIdea.refinement_stage) {
      updateIdea(refinedIdea.id, { refinement_stage: newStage });
      setRefinedIdea({
        ...refinedIdea,
        refinement_stage: newStage
      });
    }
  };
  
  // Save the current state
  const saveCurrentState = async () => {
    await updateIdea(refinedIdea.id, refinedIdea);
  };
  
  // Handle idea updates
  const handleIdeaUpdate = (updates: Partial<UnifiedIdea>) => {
    setRefinedIdea({
      ...refinedIdea,
      ...updates
    });
  };
  
  // Handle completion
  const handleComplete = async () => {
    // Save the final state
    await updateIdea(refinedIdea.id, {
      ...refinedIdea,
      refinement_stage: 'complete'
    });
    
    // Go back to exploration
    onBack();
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <button
          type="button"
          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          onClick={onBack}
        >
          ← Back to Ideas
        </button>
      </div>
      
      {/* Step indicator */}
      <UnifiedStepIndicator 
        steps={REFINEMENT_STEPS} 
        currentStep={currentRefinementStep} 
        onStepClick={handleStepChange}
      />
      
      {/* Error and success messages */}
      {error && (
        <div className="mb-4 bg-red-50 p-4 rounded-md">
          <div className="text-red-700">{error}</div>
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-50 p-4 rounded-md">
          <div className="text-green-700">{success}</div>
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
      
      {/* Step content */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {currentRefinementStep === 0 && (
          <UnifiedBasicIdeaInfo 
            idea={refinedIdea} 
            onUpdate={handleIdeaUpdate} 
          />
        )}
        
        {currentRefinementStep === 1 && (
          <UnifiedConceptVariations 
            idea={refinedIdea} 
            onUpdate={handleIdeaUpdate} 
          />
        )}
        
        {currentRefinementStep === 2 && (
          <UnifiedBusinessModelGenerator 
            idea={refinedIdea} 
            onUpdate={handleIdeaUpdate} 
          />
        )}
        
        {currentRefinementStep === 3 && (
          <UnifiedDetailedRefinement 
            idea={refinedIdea} 
            onUpdate={handleIdeaUpdate} 
          />
        )}
        
        {currentRefinementStep === 4 && (
          <UnifiedComponentVariations 
            idea={refinedIdea} 
            onUpdate={handleIdeaUpdate} 
          />
        )}
      </div>
      
      {/* Navigation buttons */}
      <UnifiedStepNavigation 
        currentStep={currentRefinementStep}
        totalSteps={REFINEMENT_STEPS.length}
        onPrevious={() => handleStepChange(currentRefinementStep - 1)}
        onNext={() => handleStepChange(currentRefinementStep + 1)}
        onComplete={handleComplete}
        isLoading={isLoading}
      />
    </div>
  );
};

export default IdeaRefinementPanel;
