import React from 'react';
import { UserRole } from '../../../lib/services/onboarding.service';
import { UserRoleType } from '../../../lib/types/enhanced-profile.types';

interface InitialRoleStepProps {
  onSelect: (role: UserRole | UserRoleType, options?: any) => void;
  onSkip?: () => void;
}

const InitialRoleStep: React.FC<InitialRoleStepProps> = ({ onSelect, onSkip }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Welcome to Wheel99!</h2>
      <p className="text-center mb-6">Tell us about yourself so we can personalize your experience.</p>
      
      <div className="space-y-4">
        <div 
          onClick={() => onSelect(UserRole.FOUNDER)}
          className="border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-lg p-4 cursor-pointer transition-colors"
        >
          <div className="flex items-center">
            <span className="h-5 w-5 rounded-full border border-indigo-500 flex items-center justify-center mr-3">
              <span className="h-3 w-3 rounded-full bg-white"></span>
            </span>
            <div>
              <h3 className="font-semibold">Founder</h3>
              <p className="text-sm text-gray-600">I'm starting or have started a company</p>
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => onSelect(UserRole.COMPANY_MEMBER)}
          className="border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-lg p-4 cursor-pointer transition-colors"
        >
          <div className="flex items-center">
            <span className="h-5 w-5 rounded-full border border-indigo-500 flex items-center justify-center mr-3">
              <span className="h-3 w-3 rounded-full bg-white"></span>
            </span>
            <div>
              <h3 className="font-semibold">Company Member</h3>
              <p className="text-sm text-gray-600">I'm part of an existing company</p>
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => onSelect(UserRole.SERVICE_PROVIDER)}
          className="border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-lg p-4 cursor-pointer transition-colors"
        >
          <div className="flex items-center">
            <span className="h-5 w-5 rounded-full border border-indigo-500 flex items-center justify-center mr-3">
              <span className="h-3 w-3 rounded-full bg-white"></span>
            </span>
            <div>
              <h3 className="font-semibold">Service Provider</h3>
              <p className="text-sm text-gray-600">I provide services to companies</p>
            </div>
          </div>
        </div>
      </div>
      
      {onSkip && (
        <div className="mt-6 text-center">
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
};

export default InitialRoleStep;
