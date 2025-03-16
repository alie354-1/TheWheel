import React from 'react';
import { onboardingService } from '../../../lib/services/onboarding.service';

interface FeatureRecommendationsProps {
  features: string[];
  personalWelcome?: string;
  onComplete: () => void;
}

const FeatureRecommendations: React.FC<FeatureRecommendationsProps> = ({
  features,
  personalWelcome = 'Welcome to Wheel99!',
  onComplete
}) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="text-center mb-8">
        <div className="h-20 w-20 bg-indigo-600 rounded-full mx-auto flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mt-4">{personalWelcome}</h2>
        <p className="text-gray-600 mt-2">
          Based on your preferences, we've customized your experience. Here are some features we think you'll love:
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {features.map(featureId => {
          const feature = onboardingService.getFeatureInfo(featureId);
          
          return (
            <div key={featureId} className="border border-indigo-300 p-4 rounded-lg bg-indigo-50">
              <h3 className="font-semibold text-lg">{feature.title}</h3>
              <p className="text-gray-600 mb-2">{feature.description}</p>
              <a 
                href={feature.path}
                className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center"
              >
                Go to {feature.title}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          );
        })}

        {features.length === 0 && (
          <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">
              We're still preparing personalized recommendations for you.
              In the meantime, explore our dashboard to discover all features!
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onComplete}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
};

export default FeatureRecommendations;
