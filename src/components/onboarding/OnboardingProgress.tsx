import React from 'react';
import { enhancedOnboardingService } from '../../lib/services/enhanced-onboarding.service';

interface OnboardingProgressProps {
  steps: string[];
  currentStep: string;
  onStepClick?: (step: string) => void;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  steps,
  currentStep,
  onStepClick
}) => {
  const getStepTitle = (stepKey: string): string => {
    const allSteps = enhancedOnboardingService.getOnboardingSteps();
    const step = allSteps.find(s => s.key === stepKey);
    return step?.title || stepKey;
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step === currentStep;
          const isCompleted = steps.indexOf(currentStep) > index;
          
          return (
            <div key={step} className="flex flex-col items-center relative flex-1">
              {/* Progress Line */}
              {index > 0 && (
                <div 
                  className={`absolute h-1 top-4 -left-1/2 right-1/2 z-0 ${
                    isCompleted || isActive ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              )}
              
              {/* Circle */}
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center z-10 
                  ${isActive || isCompleted 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                  }
                  ${onStepClick && isCompleted ? 'cursor-pointer hover:bg-blue-600' : ''}
                `}
                onClick={() => {
                  if (onStepClick && isCompleted) {
                    onStepClick(step);
                  }
                }}
              >
                {isCompleted ? (
                  <i className="fas fa-check text-sm" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>
              
              {/* Label */}
              <div 
                className={`
                  mt-2 text-xs font-medium text-center 
                  ${isActive ? 'text-blue-600' : isCompleted ? 'text-gray-700' : 'text-gray-500'}
                `}
              >
                {getStepTitle(step)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
