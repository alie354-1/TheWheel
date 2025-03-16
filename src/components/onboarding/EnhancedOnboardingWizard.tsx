import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { enhancedOnboardingService, EnhancedOnboardingData } from '../../lib/services/enhanced-onboarding.service';
import { enhancedProfileService } from '../../lib/services/enhanced-profile.service'; 
import { UserRoleType, CompanyStageType } from '../../lib/types/enhanced-profile.types';

// Import step components
import { EnhancedRoleSelectionStep } from './steps/EnhancedRoleSelectionStep';
import { EnhancedCompanyStageStep } from './steps/EnhancedCompanyStageStep';
import { EnhancedInviteCodeStep } from './steps/EnhancedInviteCodeStep';
import { EnhancedServiceCategoriesStep } from './steps/EnhancedServiceCategoriesStep';
// Re-use some existing components for the remaining steps
// Import step components - using default imports since they're exported that way
import IndustrySelectionStep from './steps/IndustrySelectionStep'; 
import SkillLevelStep from './steps/SkillLevelStep';
import GoalsSelectionStep from './steps/GoalsSelectionStep';
import ThemePreferencesStep from './steps/ThemePreferencesStep';
import NotificationPreferencesStep from './steps/NotificationPreferencesStep';
import FeatureRecommendations from './steps/FeatureRecommendations';
import OnboardingCompletion from './steps/OnboardingCompletion';
import OnboardingWelcome from './steps/OnboardingWelcome';

// Onboarding progress component
import { OnboardingProgress } from './OnboardingProgress';

interface EnhancedOnboardingWizardProps {
  onComplete?: () => void;
}

export const EnhancedOnboardingWizard: React.FC<EnhancedOnboardingWizardProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState<EnhancedOnboardingData>({});
  const [currentStep, setCurrentStep] = useState<string>('welcome');
  const [steps, setSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const userId = useAuthStore(state => state.user?.id);
  const navigate = useNavigate();

  // Load initial data and calculate steps based on user profile
  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Get user profile
        const profile = await enhancedProfileService.getProfile(userId);
        
        // If user has completed onboarding, redirect to dashboard
        if (profile?.onboarding_completed) {
          if (onComplete) {
            onComplete();
          } else {
            navigate('/dashboard');
          }
          return;
        }

        // Initialize form data from existing profile if available
        const initialData: EnhancedOnboardingData = {};
        
        if (profile?.primary_role) {
          initialData.primaryRole = profile.primary_role;
        }
        
        if (profile?.additional_roles) {
          initialData.additionalRoles = profile.additional_roles;
        }
        
        // Load legacy data for backward compatibility
        if (profile?.setup_progress?.form_data) {
          const legacyData = profile.setup_progress.form_data;
          
          // Map company stage
          if (legacyData.companyStage) {
            const stageMapping: Record<string, CompanyStageType> = {
              'IDEA_STAGE': 'idea_stage',
              'SOLID_IDEA': 'solid_idea',
              'FORMED_COMPANY': 'existing_company'
            };
            initialData.companyStage = stageMapping[legacyData.companyStage] || undefined;
          }
          
          // Map other fields
          if (legacyData.industryCategory) initialData.industryCategory = legacyData.industryCategory;
          if (legacyData.skillLevel) initialData.skillLevel = legacyData.skillLevel.toLowerCase();
          if (legacyData.goals) initialData.goals = legacyData.goals;
          if (legacyData.preferredTheme) initialData.preferredTheme = legacyData.preferredTheme;
          if (legacyData.notificationPreferences) initialData.notificationPreferences = legacyData.notificationPreferences;
          
          // Set current step from profile if available
          if (profile.setup_progress.current_step) {
            setCurrentStep(profile.setup_progress.current_step);
          }
        }
        
        setFormData(initialData);
        
        // Calculate available steps based on user role
        const availableSteps = enhancedOnboardingService.getOnboardingSteps(profile?.primary_role);
        setSteps(availableSteps.map(step => step.key));
        
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId, navigate, onComplete]);

  // Handle step navigation
  const goToStep = (step: string) => {
    setCurrentStep(step);
  };

  const goToNextStep = async (stepData: Partial<EnhancedOnboardingData> = {}) => {
    if (!userId) return;

    try {
      setLoading(true);
      
      // Update form data with new step data
      const updatedFormData = { ...formData, ...stepData };
      setFormData(updatedFormData);
      
      // Save data to the database
      await enhancedOnboardingService.saveOnboardingData(userId, currentStep, stepData);
      
      // Find the next step
      const nextStep = enhancedOnboardingService.getNextStep(currentStep, updatedFormData.primaryRole);
      
      if (nextStep) {
        setCurrentStep(nextStep.key);
      } else if (currentStep === 'completion') {
        // Onboarding is complete, redirect to dashboard
        if (onComplete) {
          onComplete();
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousStep = () => {
    if (!userId) return;
    
    // Find the previous step
    const previousStep = enhancedOnboardingService.getPreviousStep(currentStep, formData.primaryRole);
    
    if (previousStep) {
      setCurrentStep(previousStep.key);
    }
  };

  // Skip onboarding
  const handleSkipOnboarding = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      await enhancedOnboardingService.skipOnboarding(userId);
      
      if (onComplete) {
        onComplete();
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      setLoading(false);
    }
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <OnboardingWelcome
            onContinue={() => goToNextStep()}
            onSkip={handleSkipOnboarding}
          />
        );
      
      case 'role_selection':
        return (
          <EnhancedRoleSelectionStep
            onNext={(data) => goToNextStep(data)}
            onBack={goToPreviousStep}
          />
        );
      
      case 'company_stage':
        return (
          <EnhancedCompanyStageStep
            onNext={(data) => goToNextStep(data)}
            onBack={goToPreviousStep}
            initialValue={formData.companyStage}
          />
        );
      
      case 'invite_code':
        return (
          <EnhancedInviteCodeStep
            onNext={(data) => goToNextStep(data)}
            onBack={goToPreviousStep}
            initialValue={formData.inviteCode}
          />
        );
      
      case 'service_categories':
        return (
          <EnhancedServiceCategoriesStep
            onNext={(data) => goToNextStep(data)}
            onBack={goToPreviousStep}
            initialCategories={formData.serviceCategories}
            initialExpertise={formData.expertise}
          />
        );
      
      case 'industry_selection':
        return (
          <IndustrySelectionStep
            onNext={(data) => goToNextStep({ industryCategory: data.industryCategory })}
            onBack={goToPreviousStep}
            initialValue={formData.industryCategory}
          />
        );
      
      case 'skill_level':
        return (
          <SkillLevelStep
            onNext={(data) => goToNextStep({ skillLevel: data.skillLevel as any })}
            onBack={goToPreviousStep}
            initialValue={formData.skillLevel as any}
          />
        );
      
      case 'goals':
        return (
          <GoalsSelectionStep
            onSelect={(selectedGoals) => goToNextStep({ goals: selectedGoals })}
          />
        );
      
      case 'preferences':
        return (
          <ThemePreferencesStep
            onNext={(data) => goToNextStep({
              preferredTheme: data.theme,
              notificationPreferences: formData.notificationPreferences
            })}
            onBack={goToPreviousStep}
            initialValue={formData.preferredTheme}
          />
        );
      
      case 'completion':
        return (
          <OnboardingCompletion
            onComplete={() => {
              if (onComplete) {
                onComplete();
              } else {
                navigate('/dashboard');
              }
            }}
          />
        );
      
      default:
        return <div>Step not found</div>;
    }
  };

  if (loading && !currentStep) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-semibold text-gray-900">Wheel99</div>
            <button
              onClick={handleSkipOnboarding}
              className="text-gray-600 hover:text-gray-900"
            >
              Skip Setup
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          {steps.length > 0 && (
            <OnboardingProgress
              steps={steps}
              currentStep={currentStep}
              onStepClick={(step) => {
                // Only allow clicking on completed steps
                const currentIndex = steps.indexOf(currentStep);
                const targetIndex = steps.indexOf(step);
                
                if (targetIndex < currentIndex) {
                  goToStep(step);
                }
              }}
            />
          )}
          
          <div className="mt-8">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
};
