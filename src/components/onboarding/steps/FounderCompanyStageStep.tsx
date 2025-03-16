import React from 'react';
import { CompanyStage } from '../../../lib/services/onboarding.service';

interface FounderCompanyStageStepProps {
  onSelect: (stage: CompanyStage) => void;
  onSkip?: () => void;
  onBack?: () => void;
}

const FounderCompanyStageStep: React.FC<FounderCompanyStageStepProps> = ({ 
  onSelect, 
  onSkip,
  onBack
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-center mb-6">What stage is your company in?</h2>
      <p className="text-center mb-6">This helps us personalize your experience and highlight relevant features.</p>
      
      <div className="space-y-4">
        <div 
          onClick={() => onSelect(CompanyStage.IDEA_STAGE)}
          className="border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-lg p-4 cursor-pointer transition-colors"
        >
          <div className="flex items-center">
            <span className="h-5 w-5 rounded-full border border-indigo-500 flex items-center justify-center mr-3">
              <span className="h-3 w-3 rounded-full bg-white"></span>
            </span>
            <div>
              <h3 className="font-semibold">Idea Stage</h3>
              <p className="text-sm text-gray-600">I have an idea but haven't started building yet</p>
              <p className="text-xs text-indigo-600 mt-1">Recommended: Idea Playground</p>
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => onSelect(CompanyStage.SOLID_IDEA)}
          className="border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-lg p-4 cursor-pointer transition-colors"
        >
          <div className="flex items-center">
            <span className="h-5 w-5 rounded-full border border-indigo-500 flex items-center justify-center mr-3">
              <span className="h-3 w-3 rounded-full bg-white"></span>
            </span>
            <div>
              <h3 className="font-semibold">Solid Idea, Ready to Form</h3>
              <p className="text-sm text-gray-600">I have a solid idea and need to form a company</p>
              <p className="text-xs text-indigo-600 mt-1">Recommended: Company Formation Tools</p>
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => onSelect(CompanyStage.FORMED_COMPANY)}
          className="border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-lg p-4 cursor-pointer transition-colors"
        >
          <div className="flex items-center">
            <span className="h-5 w-5 rounded-full border border-indigo-500 flex items-center justify-center mr-3">
              <span className="h-3 w-3 rounded-full bg-white"></span>
            </span>
            <div>
              <h3 className="font-semibold">Existing Company</h3>
              <p className="text-sm text-gray-600">I already have a company and want to enter info on it</p>
              <p className="text-xs text-indigo-600 mt-1">Recommended: Company Dashboard</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Back
          </button>
        )}
        
        {onSkip && (
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 transition-colors ml-auto"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};

export default FounderCompanyStageStep;
