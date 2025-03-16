import React from 'react';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { useIdeaContext } from '../../lib/contexts/IdeaContext';
import { useNavigate } from 'react-router-dom';

interface StepNavigationProps {
  onSave?: () => Promise<void>;
  disableNext?: boolean;
  disablePrevious?: boolean;
  nextLabel?: string;
  previousLabel?: string;
  showSave?: boolean;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  onSave,
  disableNext = false,
  disablePrevious = false,
  nextLabel = 'Next',
  previousLabel = 'Back',
  showSave = true
}) => {
  const { 
    currentStep, 
    setCurrentStep, 
    totalSteps,
    isLoading,
    saveToLocalStorage,
    ideaData
  } = useIdeaContext();
  
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      console.log('Moving from step', currentStep, 'to step', currentStep + 1);
      
      // Save current state to localStorage
      saveToLocalStorage();
      
      // Use the context's setCurrentStep which now handles navigation properly
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      console.log('Moving from step', currentStep, 'to step', currentStep - 1);
      
      // Save current state to localStorage
      saveToLocalStorage();
      
      // Use the context's setCurrentStep which now handles navigation properly
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Determine if next button should be disabled based on current step data
  const isNextDisabled = () => {
    if (currentStep === totalSteps - 1) return true; // Last step
    if (isLoading) return true;
    if (disableNext) return true;
    
    // Step-specific validation
    switch (currentStep) {
      case 0: // Basic Info
        return !ideaData.title || !ideaData.description;
      case 1: // Concept Variations
        return !ideaData.selected_variation && !ideaData.merged_variation;
      default:
        return false;
    }
  };

  return (
    <div className="flex justify-between pt-6 border-t border-gray-200">
      {/* Previous button */}
      <button
        onClick={handlePrevious}
        disabled={currentStep === 0 || disablePrevious || isLoading}
        className={`
          inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md
          ${currentStep === 0 || disablePrevious || isLoading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50'}
        `}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {previousLabel}
      </button>

      <div className="flex space-x-4">
        {/* Save button */}
        {showSave && onSave && (
          <button
            onClick={onSave}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Progress'}
          </button>
        )}

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={isNextDisabled()}
          className={`
            inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white
            ${isNextDisabled()
              ? 'bg-indigo-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'}
          `}
        >
          {nextLabel}
          <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default StepNavigation;
