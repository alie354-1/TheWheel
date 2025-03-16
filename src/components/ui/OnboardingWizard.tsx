import React, { useState } from 'react';

// Feature configuration type that will be passed to the component
export interface FeatureConfig {
  id: string;
  name: string;
  description: string;
  steps: FeatureStep[];
  features?: FeatureHighlight[];
}

// Step configuration for the feature
export interface FeatureStep {
  title: string;
  description: string;
}

// Feature highlight configuration for the UI cards
export interface FeatureHighlight {
  title: string;
  description: string;
  icon?: React.ReactNode; // Optional icon element
  colorScheme?: 'blue' | 'indigo' | 'purple' | 'green' | 'red' | 'yellow'; // Different color schemes
}

// Tutorial step for OnboardingTutorial integration
export interface TutorialStep {
  target: string;  // CSS selector for the target element
  title: string;   // Title of the tooltip
  content: string; // Content of the tooltip
  position: 'top' | 'right' | 'bottom' | 'left'; // Position of the tooltip
}

interface OnboardingWizardProps {
  feature: FeatureConfig;
  onStart: () => void;
  onSkip?: () => void;
  primaryColor?: string; // Primary color for the header
  tutorialSteps?: TutorialStep[]; // Optional tutorial steps for OnboardingTutorial integration
  showTutorialOption?: boolean; // Whether to show the tutorial checkbox
  startButtonText?: string; // Custom text for the start button
  skipButtonText?: string; // Custom text for the skip button
  className?: string; // Additional CSS classes
}

/**
 * A reusable onboarding wizard component that can be used across different features
 */
const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  feature,
  onStart,
  onSkip,
  primaryColor = 'bg-indigo-600',
  tutorialSteps,
  showTutorialOption = true,
  startButtonText = 'Get Started',
  skipButtonText = 'Skip',
  className = '',
}) => {
  const [showTutorial, setShowTutorial] = useState(true);

  // Map color scheme to tailwind classes
  const getColorClasses = (scheme: string = 'indigo'): { bg: string; text: string } => {
    switch (scheme) {
      case 'blue':
        return { bg: 'bg-blue-50', text: 'text-blue-800' };
      case 'purple':
        return { bg: 'bg-purple-50', text: 'text-purple-800' };
      case 'green':
        return { bg: 'bg-green-50', text: 'text-green-800' };
      case 'red':
        return { bg: 'bg-red-50', text: 'text-red-800' };
      case 'yellow':
        return { bg: 'bg-yellow-50', text: 'text-yellow-800' };
      case 'indigo':
      default:
        return { bg: 'bg-indigo-50', text: 'text-indigo-800' };
    }
  };

  // Handle the start button click
  const handleStart = () => {
    // Pass along the showTutorial preference
    onStart();
  };

  return (
    <div className={`max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className={`${primaryColor} px-6 py-4`}>
        <h2 className="text-xl font-bold text-white">Welcome to {feature.name}</h2>
        <p className="text-white text-opacity-90 text-sm mt-1">
          {feature.description}
        </p>
      </div>
      
      <div className="p-6">
        {/* Feature introduction */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">About {feature.name}</h3>
          <p className="text-gray-600">
            {feature.description}
          </p>
        </div>
        
        {/* Steps section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">What You'll Do</h3>
          <ol className="list-decimal pl-5 space-y-2 text-gray-600">
            {feature.steps.map((step, index) => (
              <li key={index}>
                <span className="font-medium">{step.title}</span>
                {step.description && <span> - {step.description}</span>}
              </li>
            ))}
          </ol>
        </div>
        
        {/* Feature highlights section */}
        {feature.features && feature.features.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Features to Explore</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feature.features.map((item, index) => {
                const colorClasses = getColorClasses(item.colorScheme);
                return (
                  <div key={index} className={`${colorClasses.bg} rounded-md p-3`}>
                    <div className="flex items-center">
                      {item.icon && <div className="mr-2">{item.icon}</div>}
                      <div className={`font-medium ${colorClasses.text} mb-1`}>{item.title}</div>
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Footer with buttons */}
        <div className="flex justify-between items-center border-t border-gray-200 pt-6">
          <div className="text-sm text-gray-500">
            {showTutorialOption && tutorialSteps && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-indigo-600"
                  checked={showTutorial}
                  onChange={(e) => setShowTutorial(e.target.checked)}
                />
                <span className="ml-2">Show tutorial tips as I go</span>
              </label>
            )}
          </div>
          <div className="flex space-x-3">
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                {skipButtonText}
              </button>
            )}
            <button
              type="button"
              onClick={handleStart}
              className={`px-4 py-2 ${primaryColor.replace('bg-', 'bg-')} text-white rounded-md hover:opacity-90`}
            >
              {startButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
