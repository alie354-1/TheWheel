import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';

type UserRole = 'founder' | 'company_member' | 'service_provider';
type CompanyStage = 'idea_stage' | 'solid_idea' | 'existing_company';

interface OnboardingWizardProps {
  onComplete: (data: {
    role: UserRole[];
    companyStage?: CompanyStage;
  }) => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [companyStage, setCompanyStage] = useState<CompanyStage | undefined>(undefined);
  
  const handleRoleSelection = (role: UserRole) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };
  
  const handleNextStep = () => {
    if (step === 1) {
      // If founder is not selected, skip company stage question
      if (!selectedRoles.includes('founder')) {
        onComplete({
          role: selectedRoles
        });
      } else {
        setStep(2);
      }
    } else if (step === 2) {
      onComplete({
        role: selectedRoles,
        companyStage
      });
    }
  };
  
  const isNextDisabled = () => {
    if (step === 1) {
      return selectedRoles.length === 0;
    } else if (step === 2) {
      return !companyStage;
    }
    return false;
  };
  
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-600 p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-white">Welcome to Wheel99</h2>
        <p className="mt-1 text-indigo-100">Let's get to know you better</p>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2">
        <div 
          className="bg-indigo-600 h-2 transition-all duration-300 ease-in-out" 
          style={{ width: step === 1 ? '50%' : '100%' }}
        ></div>
      </div>
      
      {/* Content */}
      <div className="p-4 sm:p-6">
        {step === 1 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900">What best describes your role?</h3>
            <p className="text-gray-500 text-sm mb-4">Select all that apply</p>
            
            <div className="space-y-3">
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedRoles.includes('founder') ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
                onClick={() => handleRoleSelection('founder')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedRoles.includes('founder') ? 'border-indigo-500' : 'border-gray-400'}`}>
                    {selectedRoles.includes('founder') && (
                      <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    )}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">Founder</h4>
                    <p className="text-sm text-gray-500">I'm starting a company or have founded one</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedRoles.includes('company_member') ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
                onClick={() => handleRoleSelection('company_member')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedRoles.includes('company_member') ? 'border-indigo-500' : 'border-gray-400'}`}>
                    {selectedRoles.includes('company_member') && (
                      <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    )}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">Company Member</h4>
                    <p className="text-sm text-gray-500">I'm part of a company or organization</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedRoles.includes('service_provider') ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
                onClick={() => handleRoleSelection('service_provider')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedRoles.includes('service_provider') ? 'border-indigo-500' : 'border-gray-400'}`}>
                    {selectedRoles.includes('service_provider') && (
                      <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    )}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">Service Provider</h4>
                    <p className="text-sm text-gray-500">I provide services to companies or founders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {step === 2 && selectedRoles.includes('founder') && (
          <div>
            <h3 className="text-lg font-medium text-gray-900">What stage is your company in?</h3>
            <p className="text-gray-500 text-sm mb-4">Select the option that best applies</p>
            
            <div className="space-y-3">
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${companyStage === 'idea_stage' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
                onClick={() => setCompanyStage('idea_stage')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${companyStage === 'idea_stage' ? 'border-indigo-500' : 'border-gray-400'}`}>
                    {companyStage === 'idea_stage' && (
                      <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    )}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">Idea Stage</h4>
                    <p className="text-sm text-gray-500">I'm exploring ideas and concepts</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${companyStage === 'solid_idea' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
                onClick={() => setCompanyStage('solid_idea')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${companyStage === 'solid_idea' ? 'border-indigo-500' : 'border-gray-400'}`}>
                    {companyStage === 'solid_idea' && (
                      <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    )}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">Solid Idea</h4>
                    <p className="text-sm text-gray-500">I have a solid idea and ready to form a company</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${companyStage === 'existing_company' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
                onClick={() => setCompanyStage('existing_company')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${companyStage === 'existing_company' ? 'border-indigo-500' : 'border-gray-400'}`}>
                    {companyStage === 'existing_company' && (
                      <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    )}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">Existing Company</h4>
                    <p className="text-sm text-gray-500">I already have a company and want to enter info about it</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 sm:px-6 bg-gray-50 flex justify-between items-center">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back
          </button>
        ) : (
          <div></div> // Empty div to maintain layout with flex justify-between
        )}
        
        <button
          type="button"
          onClick={handleNextStep}
          disabled={isNextDisabled()}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isNextDisabled() ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {step === 2 || (step === 1 && !selectedRoles.includes('founder')) ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingWizard;
