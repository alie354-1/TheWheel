import React from 'react';
import { CompanyStage } from '../../../lib/services/onboarding.service';

interface CompanyStageStepProps {
  onSelect: (stage: CompanyStage) => void;
  onSkip?: () => void;
}

const CompanyStageStep: React.FC<CompanyStageStepProps> = ({ onSelect, onSkip }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">What stage is your company in?</h2>
      <p className="mb-6 text-gray-600">
        This helps us recommend the right tools and resources
      </p>
      <div className="space-y-4">
        <button 
          onClick={() => onSelect(CompanyStage.IDEA_STAGE)}
          className="w-full p-4 bg-indigo-100 hover:bg-indigo-200 text-left rounded-lg transition"
        >
          <div className="font-semibold">Idea Stage</div>
          <div className="text-sm text-gray-600">I'm exploring or validating a business idea</div>
        </button>
        
        <button 
          onClick={() => onSelect(CompanyStage.SOLID_IDEA)}
          className="w-full p-4 bg-indigo-100 hover:bg-indigo-200 text-left rounded-lg transition"
        >
          <div className="font-semibold">Solid Idea</div>
          <div className="text-sm text-gray-600">I have a solid idea and I'm ready to form a company</div>
        </button>
        
        <button 
          onClick={() => onSelect(CompanyStage.FORMED_COMPANY)}
          className="w-full p-4 bg-indigo-100 hover:bg-indigo-200 text-left rounded-lg transition"
        >
          <div className="font-semibold">Existing Company</div>
          <div className="text-sm text-gray-600">I already have a formed company</div>
        </button>
      </div>
      
      {onSkip && (
        <div className="mt-6 text-center">
          <button 
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
};

export default CompanyStageStep;
