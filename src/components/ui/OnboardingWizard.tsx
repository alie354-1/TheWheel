import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { enhancedOnboardingService } from '../../lib/services/enhanced-onboarding.service';
import { enhancedProfileService } from '../../lib/services/enhanced-profile.service';
import { UserRoleType, CompanyStageType } from '../../lib/types/enhanced-profile.types';
import { SimpleProgressBar } from '../onboarding/SimpleProgressBar';

interface OnboardingWizardProps {
  onClose?: () => void;
  onComplete?: () => void;
}

/**
 * A simplified onboarding wizard for the UI
 * This is a standalone component that can be shown in a modal or dialog
 */
export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onClose, onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedRole, setSelectedRole] = useState<UserRoleType | null>(null);
  const [companyStage, setCompanyStage] = useState<CompanyStageType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const userId = useAuthStore(state => state.user?.id);
  const navigate = useNavigate();

  // Role options
  const roleOptions = [
    {
      id: 'founder' as UserRoleType,
      title: 'Founder',
      description: 'You have a business idea or already founded a company',
      icon: 'lightbulb'
    },
    {
      id: 'company_member' as UserRoleType,
      title: 'Company Member',
      description: 'You work at a company and want to join your team',
      icon: 'users'
    },
    {
      id: 'service_provider' as UserRoleType,
      title: 'Service Provider',
      description: 'You provide professional services to companies',
      icon: 'briefcase'
    }
  ];

  // Company stage options
  const stageOptions = [
    {
      id: 'idea_stage' as CompanyStageType,
      title: 'Idea Stage',
      description: 'You have an idea but haven\'t formally established a company yet',
      icon: 'lightbulb',
      featuredModule: 'Idea Playground'
    },
    {
      id: 'solid_idea' as CompanyStageType,
      title: 'Solid Idea',
      description: 'You have a well-defined concept and are ready to establish your company',
      icon: 'clipboard-check',
      featuredModule: 'Company Formation'
    },
    {
      id: 'existing_company' as CompanyStageType,
      title: 'Existing Company',
      description: 'You already have an established company and want to enter its information',
      icon: 'building',
      featuredModule: 'Team Management'
    }
  ];

  const saveAndContinue = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      if (step === 1 && selectedRole) {
        // Save role selection
        await enhancedOnboardingService.saveOnboardingData(userId, 'role_selection', {
          primaryRole: selectedRole
        });
        
        // If founder, show company stage step
        if (selectedRole === 'founder') {
          setStep(2);
        } else if (selectedRole === 'company_member') {
          // If company member, redirect to invite code step in the full onboarding
          navigate('/onboarding/enhanced');
        } else if (selectedRole === 'service_provider') {
          // If service provider, redirect to service categories step in the full onboarding
          navigate('/onboarding/enhanced');
        }
      } else if (step === 2 && companyStage) {
        // Save company stage selection
        await enhancedOnboardingService.saveOnboardingData(userId, 'company_stage', {
          companyStage: companyStage
        });

        // Complete onboarding
        if (onComplete) {
          onComplete();
        } else {
          // Redirect to the appropriate feature based on company stage
          if (companyStage === 'idea_stage') {
            navigate('/idea-hub/playground');
          } else if (companyStage === 'solid_idea') {
            navigate('/company/setup');
          } else {
            navigate('/company/team');
          }
        }
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/dashboard');
    }
  };

  // Calculate progress
  const totalSteps = selectedRole === 'founder' ? 2 : 1;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-blue-50 p-4 border-b border-blue-100">
        <h2 className="text-xl font-semibold text-blue-800">Quick Setup</h2>
        <p className="text-blue-600">Tell us about yourself to get the most out of Wheel99</p>
        
        <div className="mt-4">
          <SimpleProgressBar progress={progress} height={4} color="bg-blue-500" />
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {step === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">What best describes your role?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {roleOptions.map((role) => (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedRole === role.id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <div className={`rounded-full p-2 mr-2 ${
                      selectedRole === role.id ? 'bg-blue-500 text-white' : 'bg-gray-100'
                    }`}>
                      <i className={`fas fa-${role.icon} text-sm`}></i>
                    </div>
                    <h4 className="font-medium">{role.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">What stage is your company in?</h3>
            <div className="space-y-4">
              {stageOptions.map((stage) => (
                <div
                  key={stage.id}
                  onClick={() => setCompanyStage(stage.id)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    companyStage === stage.id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`rounded-full p-2 mr-3 mt-1 ${
                      companyStage === stage.id ? 'bg-blue-500 text-white' : 'bg-gray-100'
                    }`}>
                      <i className={`fas fa-${stage.icon} text-sm`}></i>
                    </div>
                    <div>
                      <h4 className="font-medium">{stage.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
                      
                      {companyStage === stage.id && (
                        <div className="mt-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full inline-flex items-center">
                          <i className="fas fa-star mr-1"></i>
                          Recommended: {stage.featuredModule}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between">
        <button
          onClick={handleSkip}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Skip for now
        </button>
        
        <button
          onClick={saveAndContinue}
          disabled={step === 1 ? !selectedRole : !companyStage || loading}
          className={`px-6 py-2 rounded-md ${
            (step === 1 ? selectedRole : companyStage) && !loading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </div>
  );
};

export default OnboardingWizard;
