import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import OnboardingWelcome from '../components/onboarding/steps/OnboardingWelcome';
import GoalsSelectionStep from '../components/onboarding/steps/GoalsSelectionStep';
import { EnhancedCompanyStageStep } from '../components/onboarding/steps/EnhancedCompanyStageStep';
import InitialRoleStep from '../components/onboarding/steps/InitialRoleStep';
import ProfileSetupDemo from '../components/profile/ProfileSetupDemo';
import IndustrySelectionStep from '../components/onboarding/steps/IndustrySelectionStep';
import SkillLevelStep from '../components/onboarding/steps/SkillLevelStep';
import ThemePreferencesStep from '../components/onboarding/steps/ThemePreferencesStep';
import NotificationPreferencesStep from '../components/onboarding/steps/NotificationPreferencesStep';
import FeatureRecommendations from '../components/onboarding/steps/FeatureRecommendations';
import OnboardingCompletion from '../components/onboarding/steps/OnboardingCompletion';
import { IndustryCategory, UserSkillLevel } from '../lib/services/onboarding.service';
import { ProgressTrackingDemo } from '../components/onboarding/ProgressTrackingDemo';

/**
 * Simple demo page for the onboarding wizard
 * This demonstration shows individual steps without the need for routing setup
 */
const OnboardingDemoPage: React.FC = () => {
  // State to track which demo component to show
  const [demoComponent, setDemoComponent] = React.useState<string | null>(null);

  // Handler for going back to the selection
  const handleBackToSelection = () => {
    setDemoComponent(null);
  };

  // If no component is selected, show the selection screen
  if (!demoComponent) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Onboarding Wizard Demo</h1>
          
          <p className="mb-6 text-gray-600">
            This page demonstrates the different steps of the onboarding wizard. 
            Select a component below to see it in action:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button 
              onClick={() => setDemoComponent('progress_tracking')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left bg-blue-50 border-blue-200"
            >
              <h3 className="font-semibold mb-2">Progress Tracking</h3>
              <p className="text-sm text-gray-500">Complete onboarding flow with progress indicators and persistence</p>
              <div className="text-xs text-blue-700 mt-1">FEATURED</div>
            </button>
            <button 
              onClick={() => setDemoComponent('welcome')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left"
            >
              <h3 className="font-semibold mb-2">Welcome Screen</h3>
              <p className="text-sm text-gray-500">The initial greeting shown to new users</p>
            </button>
            
            <button 
              onClick={() => setDemoComponent('initial_role')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left bg-green-50 border-green-200"
            >
              <h3 className="font-semibold mb-2">Initial Role Selection</h3>
              <p className="text-sm text-gray-500">First step: User chooses between founder, company member, or service provider</p>
              <div className="text-xs text-green-700 mt-1">NEW</div>
            </button>
            
            <button 
              onClick={() => setDemoComponent('company_stage')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left"
            >
              <h3 className="font-semibold mb-2">Company Stage</h3>
              <p className="text-sm text-gray-500">Founder selects their company stage</p>
            </button>
            
            <button 
              onClick={() => setDemoComponent('industry')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left bg-green-50 border-green-200"
            >
              <h3 className="font-semibold mb-2">Industry Selection</h3>
              <p className="text-sm text-gray-500">User selects their industry</p>
              <div className="text-xs text-green-700 mt-1">NEW</div>
            </button>
            
            <button 
              onClick={() => setDemoComponent('skill_level')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left bg-green-50 border-green-200"
            >
              <h3 className="font-semibold mb-2">Skill Level</h3>
              <p className="text-sm text-gray-500">User indicates their experience level</p>
              <div className="text-xs text-green-700 mt-1">NEW</div>
            </button>
            
            <button 
              onClick={() => setDemoComponent('goals')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left"
            >
              <h3 className="font-semibold mb-2">Goals Selection</h3>
              <p className="text-sm text-gray-500">User selects their goals to personalize recommendations</p>
            </button>
            
            <button 
              onClick={() => setDemoComponent('theme')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left bg-green-50 border-green-200"
            >
              <h3 className="font-semibold mb-2">Theme Preferences</h3>
              <p className="text-sm text-gray-500">User selects visual theme preferences</p>
              <div className="text-xs text-green-700 mt-1">NEW</div>
            </button>
            
            <button 
              onClick={() => setDemoComponent('notifications')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left bg-green-50 border-green-200"
            >
              <h3 className="font-semibold mb-2">Notification Preferences</h3>
              <p className="text-sm text-gray-500">User configures their notification settings</p>
              <div className="text-xs text-green-700 mt-1">NEW</div>
            </button>

            <button 
              onClick={() => setDemoComponent('profile_setup')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left bg-green-50 border-green-200"
            >
              <h3 className="font-semibold mb-2">Profile Setup</h3>
              <p className="text-sm text-gray-500">Complete profile setup with multiple steps</p>
              <div className="text-xs text-green-700 mt-1">NEW</div>
            </button>
            
            <button 
              onClick={() => setDemoComponent('feature_recommendations')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left bg-green-50 border-green-200"
            >
              <h3 className="font-semibold mb-2">Feature Recommendations</h3>
              <p className="text-sm text-gray-500">Personalized feature suggestions</p>
              <div className="text-xs text-green-700 mt-1">NEW</div>
            </button>
            
            <button 
              onClick={() => setDemoComponent('completion')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left bg-green-50 border-green-200"
            >
              <h3 className="font-semibold mb-2">Onboarding Completion</h3>
              <p className="text-sm text-gray-500">Final step with personalized welcome</p>
              <div className="text-xs text-green-700 mt-1">NEW</div>
            </button>
          </div>
          
          <div className="border-t pt-4">
            <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render the selected demo component
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={handleBackToSelection}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Selection
        </button>
        
        <div className="bg-white rounded-lg shadow-md">
          {demoComponent === 'welcome' && (
            <OnboardingWelcome
              onContinue={() => alert('Continue pressed')}
              onSkip={() => alert('Skip pressed')}
            />
          )}

          {demoComponent === 'initial_role' && (
            <InitialRoleStep
              onSelect={(role, options) => alert(`Selected role: ${role}${options?.storeCompanyStage ? `, company stage: ${options.storeCompanyStage}` : ''}`)}
            />
          )}


          {demoComponent === 'company_stage' && (
            <EnhancedCompanyStageStep
              onNext={(data) => alert(`Selected stage: ${data.companyStage}`)}
              onBack={handleBackToSelection}
            />
          )}

          {demoComponent === 'industry' && (
            <IndustrySelectionStep
              onSelect={(industry) => alert(`Selected industry: ${industry}`)}
              onSkip={() => alert('Industry selection skipped')}
            />
          )}

          {demoComponent === 'skill_level' && (
            <SkillLevelStep
              onSelect={(skillLevel) => alert(`Selected skill level: ${skillLevel}`)}
              onSkip={() => alert('Skill level selection skipped')}
            />
          )}

          {demoComponent === 'goals' && (
            <GoalsSelectionStep
              onSelect={(goals) => alert(`Selected goals: ${goals.join(', ')}`)}
            />
          )}
          
          {demoComponent === 'theme' && (
            <ThemePreferencesStep
              onSelect={(theme) => alert(`Selected theme: ${theme}`)}
              onSkip={() => alert('Theme selection skipped')}
            />
          )}
          
          {demoComponent === 'notifications' && (
            <NotificationPreferencesStep
              onSelect={(preferences) => alert(`Notification preferences set: ${Object.keys(preferences).filter(key => preferences[key]).join(', ')}`)}
              onSkip={() => alert('Notification preferences skipped')}
            />
          )}
          
          {demoComponent === 'profile_setup' && (
            <ProfileSetupDemo
              onComplete={() => alert('Profile setup completed!')}
              onBack={handleBackToSelection}
            />
          )}
          
          {demoComponent === 'feature_recommendations' && (
            <FeatureRecommendations
              features={['idea_playground', 'market_research', 'idea_refinement']}
              personalWelcome="Welcome to Wheel99, Startup Founder!"
              onComplete={() => alert('Feature recommendations viewed')}
            />
          )}
          
          {demoComponent === 'completion' && (
            <div className="p-6">
              <OnboardingCompletion
                personalWelcome="Welcome to Wheel99, John!"
                userSelections={{
                  userRole: 'FOUNDER',
                  companyStage: 'IDEA_STAGE',
                  industryCategory: 'TECHNOLOGY',
                  skillLevel: 'INTERMEDIATE',
                  goals: ['networking', 'learning', 'market_research']
                }}
                onComplete={() => alert('Onboarding completed, continuing to dashboard')}
              />
            </div>
          )}
          
          {demoComponent === 'progress_tracking' && (
            <ProgressTrackingDemo onBack={handleBackToSelection} />
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingDemoPage;
