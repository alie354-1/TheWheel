import React from 'react';

interface OnboardingWelcomeProps {
  onContinue: () => void;
  onSkip?: () => void;
}

const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({ onContinue, onSkip }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-8 text-center">
        <div className="h-20 w-20 bg-indigo-600 rounded-full mx-auto flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mt-4">Welcome to Wheel99</h1>
        <p className="text-gray-600 mt-2">
          Let's set up your account to get the most out of our platform
        </p>
      </div>
      
      <div className="space-y-4 mb-8">
        <div className="flex items-start">
          <div className="bg-indigo-100 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <div className="font-semibold">Personalized Experience</div>
            <div className="text-sm text-gray-600">We'll customize the platform based on your preferences</div>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="bg-indigo-100 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <div className="font-semibold">Find the Right Tools</div>
            <div className="text-sm text-gray-600">Discover features that match your goals and needs</div>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="bg-indigo-100 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <div className="font-semibold">Connect with Others</div>
            <div className="text-sm text-gray-600">Build relationships with other users on the platform</div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center space-y-3">
        <button
          onClick={onContinue}
          className="w-full px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          Let's Get Started
        </button>
        
        {onSkip && (
          <button 
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingWelcome;
