import React, { useState, useEffect } from 'react';
import { OnboardingProgress } from './OnboardingProgress';
import { SimpleProgressBar } from './SimpleProgressBar';
import { enhancedOnboardingService, EnhancedOnboardingData, OnboardingStep } from '../../lib/services/enhanced-onboarding.service';
import OnboardingWelcome from '../onboarding/steps/OnboardingWelcome';
import InitialRoleStep from '../onboarding/steps/InitialRoleStep';
import { EnhancedCompanyStageStep } from '../onboarding/steps/EnhancedCompanyStageStep';
import IndustrySelectionStep from '../onboarding/steps/IndustrySelectionStep';
import SkillLevelStep from '../onboarding/steps/SkillLevelStep';
import GoalsSelectionStep from '../onboarding/steps/GoalsSelectionStep';
import OnboardingCompletion from '../onboarding/steps/OnboardingCompletion';
import FeatureRecommendations from '../onboarding/steps/FeatureRecommendations';
import { UserRoleType } from '../../lib/types/enhanced-profile.types';

// Mock local storage key for persisting state
const STORAGE_KEY = 'onboarding_progress_demo';

interface ProgressTrackingDemoProps {
  onBack: () => void;
}

interface OnboardingState {
  currentStep: string;
  completedSteps: string[];
  data: EnhancedOnboardingData;
}

export const ProgressTrackingDemo: React.FC<ProgressTrackingDemoProps> = ({ onBack }) => {
  // State for tracking onboarding progress
  const [state, setState] = useState<OnboardingState>(() => {
    // Check if there's saved state in localStorage
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (e) {
        console.error('Failed to parse saved onboarding state:', e);
      }
    }
    
    // Default initial state
    return {
      currentStep: 'welcome',
      completedSteps: [],
      data: {}
    };
  });
  
  // Steps based on selected role
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  
  // Update steps when role changes
  useEffect(() => {
    const role = state.data.primaryRole as UserRoleType | undefined;
    setSteps(enhancedOnboardingService.getOnboardingSteps(role));
  }, [state.data.primaryRole]);
  
  // Calculate progress percentage
  const calculateProgress = (): number => {
    if (steps.length === 0) return 0;
    
    // For welcome step, show 0%
    if (state.currentStep === 'welcome' && state.completedSteps.length === 0) {
      return 0;
    }
    
    // Otherwise, calculate based on completed steps + current step
    const totalCompleted = state.completedSteps.length;
    const totalSteps = steps.length;
    
    // Current step counts as partial progress
    return Math.min(100, Math.round((totalCompleted / totalSteps) * 100));
  };
  
  // Save state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);
  
  // Step navigation
  const goToNextStep = () => {
    const currentIndex = steps.findIndex(step => step.key === state.currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setState(prev => ({
        ...prev,
        currentStep: nextStep.key,
        completedSteps: [...prev.completedSteps, prev.currentStep]
      }));
    }
  };
  
  const goToPreviousStep = () => {
    const currentIndex = steps.findIndex(step => step.key === state.currentStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      setState(prev => ({
        ...prev,
        currentStep: prevStep.key,
      }));
    }
  };
  
  const goToStep = (step: string) => {
    setState(prev => ({
      ...prev,
      currentStep: step,
    }));
  };
  
  // Save and exit
  const handleSaveAndExit = () => {
    alert('Progress saved! You can continue later.');
    onBack();
  };
  
  // Reset progress
  const resetProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      currentStep: 'welcome',
      completedSteps: [],
      data: {}
    });
  };
  
  // Update data
  const updateData = (newData: Partial<EnhancedOnboardingData>) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, ...newData }
    }));
  };
  
  // Complete onboarding
  const completeOnboarding = () => {
    alert('Onboarding completed successfully!');
    onBack();
  };

  // Get step keys for progress indicator
  const stepKeys = steps.map(step => step.key);
  
  // Render the current step component
  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 'welcome':
        return (
          <OnboardingWelcome
            onContinue={goToNextStep}
            onSkip={onBack}
          />
        );
        
      case 'role_selection':
        return (
          <InitialRoleStep
            onSelect={(role) => {
              updateData({ primaryRole: role as UserRoleType });
              goToNextStep();
            }}
          />
        );
        
      case 'company_stage':
        return (
          <EnhancedCompanyStageStep
            onNext={(data) => {
              updateData({ companyStage: data.companyStage });
              goToNextStep();
            }}
            onBack={goToPreviousStep}
          />
        );
        
      case 'industry_selection':
        return (
          <IndustrySelectionStep
            onSelect={(industry) => {
              updateData({ industryCategory: industry });
              goToNextStep();
            }}
            onSkip={goToNextStep}
          />
        );
        
      case 'skill_level':
        return (
          <SkillLevelStep
            onSelect={(skillLevel) => {
              updateData({ skillLevel });
              goToNextStep();
            }}
            onSkip={goToNextStep}
          />
        );
        
      case 'goals':
        return (
          <GoalsSelectionStep
            onSelect={(goals) => {
              updateData({ goals });
              goToNextStep();
            }}
          />
        );
      
      case 'preferences':
        return (
          <FeatureRecommendations
            features={['idea_playground', 'market_research', 'task_management']}
            personalWelcome={`Welcome to Wheel99${state.data.primaryRole ? `, ${state.data.primaryRole}` : ''}!`}
            onComplete={goToNextStep}
          />
        );
        
      case 'completion':
        return (
          <OnboardingCompletion
            personalWelcome={`Welcome to Wheel99${state.data.primaryRole ? `, ${state.data.primaryRole}` : ''}!`}
            userSelections={state.data}
            onComplete={completeOnboarding}
          />
        );
      
      default:
        return (
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Unknown Step</h2>
            <p>Sorry, this step isn't implemented in the demo.</p>
            <button 
              onClick={goToNextStep}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition mt-4"
            >
              Continue
            </button>
          </div>
        );
    }
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Onboarding Progress Demo</h1>
        <p className="text-gray-600 mb-4">
          This demonstrates the progress tracking component for the onboarding wizard.
        </p>
        
        {/* Debug buttons */}
        <div className="flex space-x-2 mb-6">
          <button 
            onClick={resetProgress}
            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
          >
            Reset Progress
          </button>
          <button 
            onClick={onBack}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
          >
            Back to Demo Menu
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-medium text-gray-700">{calculateProgress()}%</span>
          </div>
          <SimpleProgressBar progress={calculateProgress()} />
        </div>
        
        {/* Step indicators */}
        {steps.length > 0 && (
          <OnboardingProgress 
            steps={stepKeys}
            currentStep={state.currentStep}
            onStepClick={(step) => {
              // Only allow clicking on completed steps
              if (state.completedSteps.includes(step)) {
                goToStep(step);
              }
            }}
          />
        )}
      </div>
      
      {/* Current step component */}
      <div className="mb-6 border border-gray-200 rounded-lg">
        {renderCurrentStep()}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={handleSaveAndExit}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
        >
          Save & Exit
        </button>
        
        <div className="space-x-3">
          <button
            onClick={goToPreviousStep}
            className={`px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition ${
              state.currentStep === 'welcome' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={state.currentStep === 'welcome'}
          >
            Back
          </button>
          
          <button
            onClick={goToNextStep}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition ${
              state.currentStep === 'completion' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={state.currentStep === 'completion'}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
