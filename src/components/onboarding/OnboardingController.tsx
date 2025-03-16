import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { 
  onboardingService, 
  UserRole, 
  CompanyStage, 
  IndustryCategory,
  UserSkillLevel
} from '../../lib/services/onboarding.service';
import { profileService } from '../../lib/services/profile.service';
import { multiPersonaProfileService } from '../../lib/services/multi-persona-profile.service';
import { OnboardingState } from '../../lib/types/multi-persona-profile.types';

// Import step components
import OnboardingWelcome from './steps/OnboardingWelcome';
import RoleSelectionStep from './steps/RoleSelectionStep';
import CompanyStageStep from './steps/CompanyStageStep';
import IndustrySelectionStep from './steps/IndustrySelectionStep';
import SkillLevelStep from './steps/SkillLevelStep';
import GoalsSelectionStep from './steps/GoalsSelectionStep';
import ThemePreferencesStep from './steps/ThemePreferencesStep';
import NotificationPreferencesStep from './steps/NotificationPreferencesStep';
import FeatureRecommendations from './steps/FeatureRecommendations';
import OnboardingCompletion from './steps/OnboardingCompletion';
import { SimpleProgressBar } from './SimpleProgressBar';
import InitialRoleStep from './steps/InitialRoleStep';
import FounderCompanyStageStep from './steps/FounderCompanyStageStep';
import JoinCompanyStep from './steps/JoinCompanyStep';
import ServiceProviderCategoriesStep from './steps/ServiceProviderCategoriesStep';

// Track onboarding analytics - placeholder
const trackStepView = (step: string) => {
  console.log(`[Analytics] Viewing step: ${step}`);
  // In a real implementation, this would send data to your analytics service
};

interface OnboardingControllerProps {
  initialPersonaId?: string;
}

const OnboardingController: React.FC<OnboardingControllerProps> = ({ initialPersonaId }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<string>('welcome');
  const [loading, setLoading] = useState<boolean>(false);
  const [recommendedFeatures, setRecommendedFeatures] = useState<string[]>([]);
  const [userSelections, setUserSelections] = useState<Record<string, any>>({});
  const [activePersona, setActivePersona] = useState<any>(null);
  const [personaId, setPersonaId] = useState<string | undefined>(initialPersonaId);
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null);
  const [personalizationReady, setPersonalizationReady] = useState<boolean>(false);
  const [personalWelcome, setPersonalWelcome] = useState<string>("");
  
  // Fetch any existing onboarding data
  useEffect(() => {
    if (!user || !personaId) return;
    
    const fetchOnboardingState = async () => {
      setLoading(true);
      try {
        // Load persona information
        const persona = await multiPersonaProfileService.getPersonaById(personaId);
        setActivePersona(persona);
        
        // Load onboarding state
        const state = await multiPersonaProfileService.getOnboardingState(user.id, personaId);
        setOnboardingState(state);
        
        if (state) {
          // Resume from last step
          setCurrentStep(state.current_step || 'welcome');
          // Load saved selections
          setUserSelections(state.form_data || {});
        }
      } catch (error) {
        console.error('Error loading onboarding data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOnboardingState();
  }, [user, personaId]);
  
  // Track step views for analytics
  useEffect(() => {
    if (currentStep) {
      trackStepView(currentStep);
    }
  }, [currentStep]);
  
  // Handle transitions between steps
  const goToNextStep = async (stepData: Record<string, any> = {}) => {
    if (!user) return;
    
    setLoading(true);
    
    // Update user selections
    const updatedSelections = {
      ...userSelections,
      ...stepData
    };
    setUserSelections(updatedSelections);
    
    // Handle persona creation at the role selection step if we don't have a personaId
    if (currentStep === 'role_selection' && !personaId && updatedSelections.userRole) {
      try {
        // Create a new persona based on the selected role
        const role = updatedSelections.userRole;
        // Make sure persona type is one of the allowed types
        const personaType = 
          role === UserRole.FOUNDER ? 'founder' :
          role === UserRole.COMPANY_MEMBER ? 'company_member' : 
          'service_provider';
        
        const newPersona = await multiPersonaProfileService.createPersona(user.id, {
          name: `My ${personaType} profile`,
          type: personaType,
          is_active: true, // Set this persona as active
          is_public: false, // Default to private until user decides to make it public
          visibility_settings: {
            discoverable_as: [personaType as any],
            visible_to: ['connections'],
            hidden_fields: []
          }
        });
        
        if (newPersona && newPersona.id) {
          // Set the new personaId for future steps
          setPersonaId(newPersona.id);
          setActivePersona(newPersona);
          
          console.log(`Created new persona: ${newPersona.id} of type ${personaType}`);
        } else {
          console.error('Failed to create persona: No ID returned');
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error creating persona:', error);
        setLoading(false);
        return;
      }
    }
    
    // Now proceed with saving the onboarding state
    try {
      // Only save to persona if we have a personaId
      if (personaId) {
        await multiPersonaProfileService.updateOnboardingState(user.id, personaId, {
          current_step: currentStep,
          form_data: updatedSelections
        });
      }
      
      // Determine next step based on current step and user type
      let nextStep = '';
      
      if (currentStep === 'welcome') {
        nextStep = 'role_selection';
      } else if (currentStep === 'role_selection') {
        // Different paths based on user role
        if (updatedSelections.userRole === UserRole.FOUNDER) {
          nextStep = 'company_stage';
        } else if (updatedSelections.userRole === UserRole.COMPANY_MEMBER) {
          nextStep = 'join_company';
        } else if (updatedSelections.userRole === UserRole.SERVICE_PROVIDER) {
          nextStep = 'service_categories';
        } else {
          nextStep = 'skill_level'; // Default fallback
        }
      } else if (currentStep === 'company_stage') {
        nextStep = 'industry_selection';
      } else if (currentStep === 'join_company') {
        nextStep = 'skill_level';
      } else if (currentStep === 'service_categories') {
        nextStep = 'industry_selection';
      } else if (currentStep === 'industry_selection' || currentStep === 'skill_level') {
        nextStep = 'goals_selection';
      } else if (currentStep === 'goals_selection') {
        nextStep = 'theme_preferences';
      } else if (currentStep === 'theme_preferences') {
        nextStep = 'notification_preferences';
      } else if (currentStep === 'notification_preferences') {
        // Get recommended features before showing recommendations
        const features = await onboardingService.getRecommendedFeatures(user.id);
        setRecommendedFeatures(features);
        
        // Get personalized welcome message
        const welcome = await onboardingService.getPersonalizedWelcome(user.id);
        setPersonalWelcome(welcome);
        
        setPersonalizationReady(true);
        nextStep = 'recommendations';
      } else if (currentStep === 'recommendations') {
        nextStep = 'completion';
      } else if (currentStep === 'completion') {
        // Complete onboarding, mark as complete and redirect
        if (personaId) {
          await multiPersonaProfileService.updateOnboardingState(user.id, personaId, {
            is_complete: true,
            completed_steps: [...(onboardingState?.completed_steps || []), 'complete']
          });
        }
        handleComplete();
        return;
      }
      
      setCurrentStep(nextStep);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSkip = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Mark onboarding as complete even when skipped, but only if we have a personaId
      if (personaId) {
        await multiPersonaProfileService.updateOnboardingState(user.id, personaId, {
          is_complete: true,
          form_data: { ...userSelections, skipped: true }
        });
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Error skipping onboarding:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleComplete = () => {
    navigate('/dashboard');
  };
  
  if (!user || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // Handle going back to previous step
  const goToPreviousStep = () => {
    if (!user) return;
    
    // Determine previous step based on current step and user role
    let prevStep = '';
    
    if (currentStep === 'role_selection') {
      prevStep = 'welcome';
    } else if (currentStep === 'company_stage' || currentStep === 'join_company' || currentStep === 'service_categories') {
      prevStep = 'role_selection';
    } else if (currentStep === 'industry_selection') {
      // Different previous step based on user role
      if (userSelections.userRole === UserRole.FOUNDER) {
        prevStep = 'company_stage';
      } else if (userSelections.userRole === UserRole.SERVICE_PROVIDER) {
        prevStep = 'service_categories';
      } else {
        prevStep = 'role_selection';
      }
    } else if (currentStep === 'skill_level') {
      if (userSelections.userRole === UserRole.COMPANY_MEMBER) {
        prevStep = 'join_company';
      } else {
        prevStep = 'industry_selection';
      }
    } else if (currentStep === 'goals_selection') {
      prevStep = 'skill_level';
    } else if (currentStep === 'theme_preferences') {
      prevStep = 'goals_selection';
    } else if (currentStep === 'notification_preferences') {
      prevStep = 'theme_preferences';
    } else if (currentStep === 'recommendations') {
      prevStep = 'notification_preferences';
    } else if (currentStep === 'completion') {
      prevStep = 'recommendations';
    }
    
    if (prevStep) {
      setCurrentStep(prevStep);
    }
  };

  // Show current step based on the state
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <OnboardingWelcome onContinue={() => goToNextStep()} onSkip={handleSkip} />;
        
      case 'role_selection':
        return (
          <InitialRoleStep 
            onSelect={(role, options) => goToNextStep({ userRole: role })} 
            onSkip={handleSkip}
          />
        );
        
      case 'company_stage':
        return (
          <FounderCompanyStageStep 
            onSelect={(stage: CompanyStage) => goToNextStep({ companyStage: stage })} 
            onSkip={handleSkip}
            onBack={goToPreviousStep}
          />
        );
        
      case 'join_company':
        return (
          <JoinCompanyStep
            onJoin={(companyId: string, code?: string) => goToNextStep({ 
              companyId, 
              inviteCode: code,
              joinType: code ? 'invitation' : 'direct'
            })}
            onCreateCompany={() => goToNextStep({ 
              isNewCompany: true,
              // We'll continue with company stage next if creating a new company
              userRole: UserRole.FOUNDER  
            })}
            onSkip={handleSkip}
            onBack={goToPreviousStep}
          />
        );
        
      case 'service_categories':
        return (
          <ServiceProviderCategoriesStep 
            onSelect={(categories: string[]) => goToNextStep({ serviceCategories: categories })} 
            onSkip={handleSkip}
            onBack={goToPreviousStep}
          />
        );
        
      case 'industry_selection':
        return (
          <IndustrySelectionStep 
            onSelect={(industry) => goToNextStep({ industryCategory: industry })} 
            onSkip={handleSkip}
            // onBack={goToPreviousStep} - Not supported in this component
          />
        );
        
      case 'skill_level':
        return (
          <SkillLevelStep 
            onSelect={(level) => goToNextStep({ skillLevel: level })} 
            onSkip={handleSkip}
            // onBack={goToPreviousStep} - Not supported in this component
          />
        );
        
      case 'goals_selection':
        return (
          <GoalsSelectionStep 
            onSelect={(goals) => goToNextStep({ goals: goals })} 
            onSkip={handleSkip}
            // onBack={goToPreviousStep} - Not supported in this component
          />
        );
        
      case 'theme_preferences':
        return (
          <ThemePreferencesStep 
            onSelect={(theme) => goToNextStep({ preferredTheme: theme })} 
            onSkip={handleSkip}
            // onBack={goToPreviousStep} - Not supported in this component
          />
        );
        
      case 'notification_preferences':
        return (
          <NotificationPreferencesStep 
            onSelect={(prefs) => goToNextStep({ notificationPreferences: prefs })} 
            onSkip={handleSkip}
            // onBack={goToPreviousStep} - Not supported in this component
          />
        );
        
      case 'recommendations':
        return (
          <FeatureRecommendations 
            features={recommendedFeatures} 
            personalWelcome={personalWelcome}
            onComplete={() => goToNextStep()}
            // onBack={goToPreviousStep} - Not supported in this component
          />
        );
        
      case 'completion':
        return (
          <OnboardingCompletion 
            personalWelcome={personalWelcome}
            userSelections={userSelections}
            onComplete={handleComplete}
            // onBack={goToPreviousStep} - Not supported in this component
          />
        );
        
      default:
        return <div>Unknown step</div>;
    }
  };
  
  // Calculate progress percentage
  const totalSteps = 7; // Adjust based on your flow
  const currentStepIndex = [
    'welcome',
    'role_selection',
    'company_stage',
    'industry_selection',
    'skill_level',
    'goals_selection',
    'theme_preferences',
    'notification_preferences',
    'recommendations',
    'completion'
  ].indexOf(currentStep);
  
  const progress = Math.max(0, Math.min(100, (currentStepIndex / totalSteps) * 100));
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Progress bar */}
      <div className="w-full px-4 pt-2">
        <SimpleProgressBar progress={progress} height={4} />
      </div>
      
      {/* Main content */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {renderCurrentStep()}
          
          {/* Save and Exit button */}
          <div className="mt-4 text-center">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Save & Exit (Resume Later)
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer with brand info */}
      <div className="p-4 text-center text-gray-500 text-sm">
        © 2025 Wheel99 - Empowering founders and teams
      </div>
    </div>
  );
};

export default OnboardingController;
