import React from 'react';
import { UserSkillLevel } from '../../../lib/services/onboarding.service';

interface SkillLevelStepProps {
  onSelect: (skillLevel: UserSkillLevel) => void;
  onSkip?: () => void;
}

const SkillLevelStep: React.FC<SkillLevelStepProps> = ({ onSelect, onSkip }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">What's your experience level?</h2>
      <p className="mb-6 text-gray-600">
        We'll customize resources and recommendations based on your expertise.
      </p>
      <div className="space-y-4">
        <button 
          onClick={() => onSelect(UserSkillLevel.BEGINNER)}
          className="w-full p-4 bg-indigo-100 hover:bg-indigo-200 text-left rounded-lg transition"
        >
          <div className="font-semibold">Beginner</div>
          <div className="text-sm text-gray-600">I'm new to this industry or role</div>
        </button>
        
        <button 
          onClick={() => onSelect(UserSkillLevel.INTERMEDIATE)}
          className="w-full p-4 bg-indigo-100 hover:bg-indigo-200 text-left rounded-lg transition"
        >
          <div className="font-semibold">Intermediate</div>
          <div className="text-sm text-gray-600">I have some experience but still learning</div>
        </button>
        
        <button 
          onClick={() => onSelect(UserSkillLevel.EXPERT)}
          className="w-full p-4 bg-indigo-100 hover:bg-indigo-200 text-left rounded-lg transition"
        >
          <div className="font-semibold">Expert</div>
          <div className="text-sm text-gray-600">I have extensive experience in this area</div>
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

export default SkillLevelStep;
