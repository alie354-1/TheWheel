import React from 'react';

interface ThemePreferencesStepProps {
  onSelect: (theme: 'light' | 'dark' | 'system') => void;
  onSkip?: () => void;
}

const ThemePreferencesStep: React.FC<ThemePreferencesStepProps> = ({ onSelect, onSkip }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Visual Preferences</h2>
      <p className="mb-6 text-gray-600">
        Choose your preferred color theme for the platform.
      </p>
      <div className="space-y-4">
        <button 
          onClick={() => onSelect('light')}
          className="w-full p-4 bg-gray-50 hover:bg-gray-100 text-left rounded-lg transition border border-gray-200"
        >
          <div className="flex items-center">
            <div className="h-10 w-10 bg-white rounded-full border border-gray-300 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold">Light Mode</div>
              <div className="text-sm text-gray-600">Bright background with dark text</div>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => onSelect('dark')}
          className="w-full p-4 bg-gray-800 hover:bg-gray-700 text-left rounded-lg transition border border-gray-700"
        >
          <div className="flex items-center">
            <div className="h-10 w-10 bg-gray-900 rounded-full border border-gray-600 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-white">Dark Mode</div>
              <div className="text-sm text-gray-300">Dark background with light text</div>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => onSelect('system')}
          className="w-full p-4 bg-indigo-50 hover:bg-indigo-100 text-left rounded-lg transition border border-indigo-100"
        >
          <div className="flex items-center">
            <div className="h-10 w-10 bg-white rounded-full border border-indigo-200 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-indigo-900">System Preference</div>
              <div className="text-sm text-indigo-700">Follows your device settings</div>
            </div>
          </div>
        </button>
      </div>
      
      {onSkip && (
        <div className="mt-6 text-center">
          <button 
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemePreferencesStep;
