import React from 'react';
import { UserRole } from '../../../lib/services/onboarding.service';

interface RoleSelectionStepProps {
  onSelect: (role: UserRole) => void;
  onSkip?: () => void;
}

const RoleSelectionStep: React.FC<RoleSelectionStepProps> = ({ onSelect, onSkip }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">What best describes your role?</h2>
      <p className="mb-6 text-gray-600">
        This helps us personalize your experience
      </p>
      <div className="space-y-4">
        <button 
          onClick={() => onSelect(UserRole.FOUNDER)}
          className="w-full p-4 bg-indigo-100 hover:bg-indigo-200 text-left rounded-lg transition"
        >
          <div className="font-semibold">Founder</div>
          <div className="text-sm text-gray-600">I'm starting or running a company</div>
        </button>
        
        <button 
          onClick={() => onSelect(UserRole.COMPANY_MEMBER)}
          className="w-full p-4 bg-indigo-100 hover:bg-indigo-200 text-left rounded-lg transition"
        >
          <div className="font-semibold">Company Member</div>
          <div className="text-sm text-gray-600">I'm part of an existing company</div>
        </button>
        
        <button 
          onClick={() => onSelect(UserRole.SERVICE_PROVIDER)}
          className="w-full p-4 bg-indigo-100 hover:bg-indigo-200 text-left rounded-lg transition"
        >
          <div className="font-semibold">Service Provider</div>
          <div className="text-sm text-gray-600">I provide services to companies</div>
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

export default RoleSelectionStep;
