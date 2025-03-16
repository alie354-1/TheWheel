import React, { useEffect } from 'react';
import IdeaPlaygroundPage from './IdeaPlaygroundPage';
import { activateAllFeatures } from '../../lib/services/feature-activator';
import { useAuthStore } from '../../lib/store';

/**
 * Wrapper component for the IdeaPlaygroundPage
 * This is used to make it easier to import the component in App.tsx
 * It also ensures all features are activated for the Idea Playground
 */
const IdeaPlaygroundPageWrapper: React.FC = () => {
  const { featureFlags } = useAuthStore();

  // Activate all features when the component mounts
  useEffect(() => {
    console.log('IdeaPlaygroundPageWrapper: Activating all features...');
    // Disabled automatic feature activation to allow pathways to show
    activateAllFeatures(); // Re-enabled to ensure all features are activated
    
    // Log the current feature flags to ensure they're being set
    console.log('Current feature flags:', featureFlags);
  }, []);

  // Render a notification about features being activated
  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-green-500 text-white text-center py-2 z-50">
        <span className="text-sm font-medium">All Idea Playground features have been activated!</span>
      </div>
      <div className="pt-10">
        <IdeaPlaygroundPage />
      </div>
    </>
  );
};

export default IdeaPlaygroundPageWrapper;
