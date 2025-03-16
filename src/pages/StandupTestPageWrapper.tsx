import React from 'react';
import StandupTestPage from './StandupTestPage';
import { StandupAIProvider } from '../lib/services/ai/standup-context-provider';

/**
 * Wrapper component for the StandupTestPage
 * This is used to make it easier to import the component in App.tsx
 * Wraps the StandupTestPage with the StandupAIProvider to provide standup-specific AI context
 */
const StandupTestPageWrapper: React.FC = () => {
  return (
    <StandupAIProvider>
      <StandupTestPage />
    </StandupAIProvider>
  );
};

export default StandupTestPageWrapper;
