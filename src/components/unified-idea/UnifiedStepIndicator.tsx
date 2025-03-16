import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface Step {
  id: string;
  label: string;
}

interface UnifiedStepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

const UnifiedStepIndicator: React.FC<UnifiedStepIndicatorProps> = ({ 
  steps, 
  currentStep,
  onStepClick
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step circle with label */}
            <div 
              className="flex flex-col items-center cursor-pointer" 
              onClick={() => onStepClick(index)}
            >
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full 
                ${index < currentStep 
                  ? 'bg-green-100 text-green-600' 
                  : index === currentStep 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'bg-gray-100 text-gray-400'}
              `}>
                {index < currentStep ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <Circle className={`h-6 w-6 ${index === currentStep ? 'fill-indigo-100' : 'fill-gray-100'}`} />
                )}
              </div>
              <span className={`
                mt-2 text-xs font-medium
                ${index < currentStep 
                  ? 'text-green-600' 
                  : index === currentStep 
                    ? 'text-indigo-600' 
                    : 'text-gray-500'}
              `}>
                {step.label}
              </span>
            </div>

            {/* Connector line between steps */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2">
                <div className={`h-1 ${index < currentStep ? 'bg-green-400' : 'bg-gray-200'}`}></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default UnifiedStepIndicator;
