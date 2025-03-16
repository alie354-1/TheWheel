import React from 'react';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';

interface UnifiedStepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete?: () => Promise<void>;
  onSave?: () => Promise<void>;
  isLoading?: boolean;
  disableNext?: boolean;
  disablePrevious?: boolean;
  nextLabel?: string;
  previousLabel?: string;
  showSave?: boolean;
}

const UnifiedStepNavigation: React.FC<UnifiedStepNavigationProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onComplete,
  onSave,
  isLoading = false,
  disableNext = false,
  disablePrevious = false,
  nextLabel = 'Next',
  previousLabel = 'Back',
  showSave = true
}) => {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex justify-between pt-6 border-t border-gray-200">
      {/* Previous button */}
      <button
        onClick={onPrevious}
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

        {/* Next/Complete button */}
        <button
          onClick={isLastStep && onComplete ? onComplete : onNext}
          disabled={disableNext || isLoading}
          className={`
            inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white
            ${disableNext || isLoading
              ? 'bg-indigo-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'}
          `}
        >
          {isLastStep ? 'Complete' : nextLabel}
          {!isLastStep && <ArrowRight className="h-4 w-4 ml-2" />}
        </button>
      </div>
    </div>
  );
};

export default UnifiedStepNavigation;
