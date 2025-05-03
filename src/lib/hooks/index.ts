/**
 * Hooks index file
 * Centralizes export of all custom hooks for easier imports
 */

// Authentication hooks
import { useAuth } from './useAuth';

// Company management hooks
import { useCompany } from './useCompany';

// Logging hooks
import { useCentralizedLogging } from './useCentralizedLogging';
import { useEnhancedLogging } from './useEnhancedLogging';

// Journey hooks
import { useJourneySteps } from './useJourneySteps';
import { useJourneyTools } from './useJourneyTools';
import { useCompanyJourney } from './useCompanyJourney';
import { useStepProgress } from './useStepProgress';

// Export all hooks
export {
  useAuth,
  useCompany,
  useCentralizedLogging,
  useEnhancedLogging,
  useJourneySteps,
  useJourneyTools,
  useCompanyJourney,
  useStepProgress
};
