import React from 'react';

interface OnboardingCompletionProps {
  personalWelcome: string;
  userSelections: Record<string, any>;
  onComplete: () => void;
}

const OnboardingCompletion: React.FC<OnboardingCompletionProps> = ({
  personalWelcome,
  userSelections,
  onComplete
}) => {
  // Format user selections for display
  const formatSelections = () => {
    const displayItems = [];
    
    if (userSelections.userRole) {
      displayItems.push({
        label: 'Role',
        value: userSelections.userRole.replace(/_/g, ' ')
      });
    }
    
    if (userSelections.companyStage) {
      displayItems.push({
        label: 'Company Stage',
        value: userSelections.companyStage.replace(/_/g, ' ')
      });
    }
    
    if (userSelections.industryCategory) {
      displayItems.push({
        label: 'Industry',
        value: userSelections.industryCategory.replace(/_/g, ' ')
      });
    }
    
    if (userSelections.skillLevel) {
      displayItems.push({
        label: 'Experience Level',
        value: userSelections.skillLevel.replace(/_/g, ' ')
      });
    }
    
    if (userSelections.goals && userSelections.goals.length > 0) {
      displayItems.push({
        label: 'Goals',
        value: userSelections.goals
          .map((goal: string) => goal.replace(/_/g, ' '))
          .join(', ')
      });
    }
    
    return displayItems;
  };

  const selections = formatSelections();

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="text-center mb-8">
        <div className="h-20 w-20 bg-green-500 rounded-full mx-auto flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mt-4">Setup Complete!</h2>
        <p className="text-gray-600 mt-2">
          {personalWelcome}
        </p>
      </div>

      {selections.length > 0 && (
        <div className="mb-8 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Your Profile</h3>
          <div className="space-y-2">
            {selections.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="font-medium text-gray-700">{item.label}:</span>
                <span className="text-gray-600 capitalize">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
            You can update these preferences anytime in your profile settings.
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={onComplete}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          Start Using Wheel99
        </button>
      </div>
    </div>
  );
};

export default OnboardingCompletion;
