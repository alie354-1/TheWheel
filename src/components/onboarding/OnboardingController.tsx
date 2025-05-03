import React, { useState, useEffect, useCallback, useRef } from 'react';
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

interface OnboardingControllerProps {}

const OnboardingController: React.FC<OnboardingControllerProps> = () => {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<string>('welcome');
  const [loading, setLoading] = useState<boolean>(false);
  const [recommendedFeatures, setRecommendedFeatures] = useState<string[]>([]);
  const [userSelections, setUserSelections] = useState<Record<string, any>>({});
  const [onboardingState, setOnboardingState] = useState<any>(null);
  const [personalizationReady, setPersonalizationReady] = useState<boolean>(false);
  const [personalWelcome, setPersonalWelcome] = useState<string>("");
  
  // Reference to check if fetch has already been initiated
  const fetchInitiatedRef = useRef<boolean>(false);
  // Reference to track API request status
  const isFetchingRef = useRef<boolean>(false);
  
  // Memoized fetch function to prevent recreation on each render
  const fetchOnboardingState = useCallback(async () => {
    // Prevent duplicate fetches & infinite loops with refs
    if (!user || isFetchingRef.current || fetchInitiatedRef.current) return;
    
    // Mark as fetching and initiated
    isFetchingRef.current = true;
    fetchInitiatedRef.current = true;
    
    console.log('Fetching onboarding state');
    setLoading(true);
    
    try {
      // Check if user has onboarding state in profile
      if (profile?.setup_progress) {
        console.log('Loading onboarding state from profile');
        setOnboardingState(profile.setup_progress);
        
        // Resume from last step
        if (profile.setup_progress.current_step) {
          console.log('Setting current step to:', profile.setup_progress.current_step);
          setCurrentStep(profile.setup_progress.current_step);
        }
        
        // Load saved selections
        if (profile.setup_progress.form_data) {
          console.log('Loading saved form data');
          setUserSelections(profile.setup_progress.form_data);
        }
      } else {
        console.log('No onboarding state found, starting fresh');
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [user, profile]);
  
  // Controlled fetch effect
  useEffect(() => {
    // Skip if there's no user
    if (!user) {
      console.log('Skipping fetch - missing user');
      return;
    }
    
    // Don't refetch if we've already started fetching
    if (isFetchingRef.current) {
      console.log('Fetch already in progress, skipping');
      return;
    }
    
    console.log('Initializing fetch sequence');
    fetchOnboardingState();
    
    // Cleanup
    return () => {
      // Reset fetching but keep initiated flag
      isFetchingRef.current = false;
    };
  }, [user, fetchOnboardingState]);
  
  // Track step views for analytics
  useEffect(() => {
    if (currentStep) {
      trackStepView(currentStep);
    }
  }, [currentStep]);
  
  // Use a ref to track whether we're currently transitioning
  const isTransitioningRef = useRef<boolean>(false);
  
  // Handle transitions between steps
  const goToNextStep = useCallback(async (stepData: Record<string, any> = {}) => {
    if (!user || isTransitioningRef.current) return;
    
    // Prevent multiple clicks/transitions
    isTransitioningRef.current = true;
    console.log('Starting transition to next step with data:', stepData);
    setLoading(true);
    
    try {
      // Update user selections
      const updatedSelections = {
        ...userSelections,
        ...stepData
      };
      setUserSelections(updatedSelections);
      console.log('Updated user selections');
      
      // Determine next step based on current step and user type
      let nextStep = '';
      
      console.log('Determining next step from:', currentStep);
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
        try {
          console.log('Fetching recommendations and welcome message');
          // Get recommended features before showing recommendations
          const features = await onboardingService.getRecommendedFeatures(user.id);
          setRecommendedFeatures(features);
          
          // Get personalized welcome message
          const welcome = await onboardingService.getPersonalizedWelcome(user.id);
          setPersonalWelcome(welcome);
          
          setPersonalizationReady(true);
          console.log('Personalization data ready');
        } catch (error) {
          console.error('Error fetching personalization data:', error);
          // Continue anyway with generic content
          setPersonalizationReady(true);
        }
        nextStep = 'recommendations';
      } else if (currentStep === 'recommendations') {
        nextStep = 'completion';
      } else if (currentStep === 'completion') {
        // Complete onboarding, mark as complete and redirect
        handleComplete();
        return;
      }
      
      console.log('Next step determined to be:', nextStep);
      
      // Save the onboarding state to the user's profile
      try {
        // Save the current step to completed_steps before moving to the next one
        const newCompletedSteps = [...(onboardingState?.completed_steps || [])];
        if (currentStep !== 'welcome' && !newCompletedSteps.includes(currentStep)) {
          newCompletedSteps.push(currentStep);
        }
        
        // Update the profile's setup_progress
        const { updateSetupProgress } = useAuthStore.getState();
        await updateSetupProgress({
          ...(profile?.setup_progress || {}),
          current_step: nextStep,
          completed_steps: newCompletedSteps,
          form_data: updatedSelections
        });
        
        console.log('Setting current step to:', nextStep);
        console.log('Updated completed steps:', newCompletedSteps);
        setCurrentStep(nextStep);
        
      } catch (error) {
        console.error('Error saving onboarding data:', error);
      }
    } finally {
      // Allow transitions again after a short delay to prevent accidental double-clicks
      setTimeout(() => {
        isTransitioningRef.current = false;
        setLoading(false);
      }, 300);
    }
  }, [user, currentStep, userSelections, profile, onboardingService]);
  
  const handleSkip = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Mark onboarding as complete even when skipped
      const { updateSetupProgress } = useAuthStore.getState();
      await updateSetupProgress({
        ...(profile?.setup_progress || {}),
        completed_steps: [...(profile?.setup_progress?.completed_steps || []), 'complete'],
        form_data: { ...userSelections, skipped: true },
        initialOnboardingComplete: true,
        lastLogin: new Date().toISOString()
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error skipping onboarding:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleComplete = async () => {
    if (!user) {
      navigate('/dashboard');
      return;
    }
    
    setLoading(true);
    try {
      // Update the main profile's setup_progress to mark overall onboarding as complete
      const { updateSetupProgress } = useAuthStore.getState();
      await updateSetupProgress({
        ...(profile?.setup_progress || {}),
        completed_steps: [...(profile?.setup_progress?.completed_steps || []), 'complete'],
        initialOnboardingComplete: true,
        lastLogin: new Date().toISOString()
      });
      
      console.log('Onboarding successfully completed');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
      navigate('/dashboard');
    }
  };
  
  // Add a debounced loading state to prevent flickering
  const [stableLoading, setStableLoading] = useState(false);
  
  useEffect(() => {
    if (loading) {
      // Set stable loading immediately when loading starts
      setStableLoading(true);
    } else {
      // Delay turning off loading indicator to prevent flickering
      const timer = setTimeout(() => {
        setStableLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading]);
  
  // Show loading state only if stableLoading is true and we have a user
  if (!user || stableLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        {!stableLoading && !user && <div className="mt-4">Loading user data...</div>}
        {stableLoading && <div className="mt-4">Loading your onboarding experience...</div>}
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
