/**
 * Centralized Logging Hook
 * 
 * This is a centralized hook that integrates both basic and enhanced logging for
 * comprehensive data collection across the application. It's designed to be the
 * primary interface for all logging operations, making it easy to capture detailed
 * information for model training.
 */

import { useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { loggingService } from '../services/logging.service';
import { modelTrainingService } from '../services/model-training.service';
import { useEnhancedLogging } from './useEnhancedLogging';
import { useLogging } from './useLogging';

export interface CentralizedLoggingOptions {
  enableDetailedLogging?: boolean;
  captureUserContext?: boolean;
  captureCompanyContext?: boolean;
  captureSystemContext?: boolean;
  featureSets?: string[];
}

export const useCentralizedLogging = (options?: CentralizedLoggingOptions) => {
  const auth = useAuth();
  const basicLogging = useLogging('CentralizedLoggingSystem');
  const enhancedLogging = useEnhancedLogging({
    detailLevel: 'extensive', // Capture maximum details by default
    captureUserContext: options?.captureUserContext ?? true,
    captureCompanyContext: options?.captureCompanyContext ?? false, // Default to false to avoid recursion issues
    captureAbstractionLayers: true,
    extractFeaturesInRealtime: true,
    enableAutomaticFeedback: true
  });
  
  // Start a session when the hook is first used
  useEffect(() => {
    if (auth.user) {
      // Start a logging session with user context
      loggingService.startSession(
        auth.user.id,
        auth.profile?.company_id
      );
      
      // Log session start with enhanced details
      enhancedLogging.logInteraction(
        'session_start',
        'CentralizedLogging',
        {
          user_id: auth.user.id,
          timestamp: new Date().toISOString(),
          session_type: 'application_session'
        },
        {
          training_priority: 'high', // Mark as high priority for model training
          session_metadata: {
            source: 'web_application',
            environment: process.env.NODE_ENV
          }
        }
      );
    }
    
    return () => {
      // End the session when the component using this hook unmounts
      if (auth.user) {
        loggingService.endSession();
        
        // Log session end with enhanced details
        enhancedLogging.logInteraction(
          'session_end',
          'CentralizedLogging',
          {
            user_id: auth.user.id,
            timestamp: new Date().toISOString(),
            duration_ms: Date.now() - new Date().getTime() // Get approximate session duration
          }
        );
      }
    };
  }, [auth.user]);

  /**
   * Log any user action with detailed context for training
   */
  const logAction = useCallback((
    action: string,
    component: string,
    data: any = {},
    metadata: any = {}
  ) => {
    // First log with basic logging for core functionality
    basicLogging.logAction(action, data);
    
    // Then log with enhanced details for model training
    return enhancedLogging.logInteraction(
      action, 
      component, 
      {
        ...data,
        timestamp: new Date().toISOString(),
        training_data: true
      }, 
      {
        ...metadata,
        log_purpose: 'model_training'
      }
    );
  }, [basicLogging, enhancedLogging]);

  /**
   * Log AI interactions with detailed context
   */
  const logAIInteraction = useCallback((
    action: string,
    data: any = {},
    metadata: any = {}
  ) => {
    // First log with basic logging
    basicLogging.logAIInteraction(action, data);
    
    // Then log with enhanced details for model training
    return enhancedLogging.logAIInteraction(
      action,
      {
        ...data,
        timestamp: new Date().toISOString(),
        training_data: true
      },
      {
        ...metadata,
        log_purpose: 'model_training'
      }
    );
  }, [basicLogging, enhancedLogging]);

  /**
   * Log system events with training context
   */
  const logSystemEvent = useCallback((
    category: string,
    source: string,
    action: string,
    data: any = {}
  ) => {
    // Log system event
    const result = loggingService.logSystemEvent(
      category,
      source,
      action,
      {
        ...data,
        timestamp: new Date().toISOString(),
        training_data: true
      }
    );
    
    // Extract features for model training
    modelTrainingService.extractFeatures('system_event', {
      eventTypes: ['system'],
      limit: 1
    });
    
    return result;
  }, []);

  /**
   * Log business logic decisions
   */
  const logBusinessLogic = useCallback((
    action: string,
    process: string,
    data: any = {},
    metadata: any = {}
  ) => {
    // Log with enhanced logging for detailed context capture
    return enhancedLogging.logBusinessLogic(
      action,
      process,
      {
        ...data,
        timestamp: new Date().toISOString(),
        training_data: true
      },
      {
        ...metadata,
        log_purpose: 'model_training'
      }
    );
  }, [enhancedLogging]);

  /**
   * Log data operations with context for training
   */
  const logDataOperation = useCallback((
    operation: 'create' | 'read' | 'update' | 'delete' | 'query',
    entity: string,
    data: any = {},
    metadata: any = {}
  ) => {
    // Log with enhanced logging for detailed context capture
    return enhancedLogging.logDataOperation(
      operation,
      entity,
      {
        ...data,
        timestamp: new Date().toISOString(),
        training_data: true
      },
      {
        ...metadata,
        log_purpose: 'model_training'
      }
    );
  }, [enhancedLogging]);

  /**
   * Record feedback for model improvement
   */
  const recordModelFeedback = useCallback((
    modelId: string,
    input: any,
    output: any,
    feedbackType: 'positive' | 'negative' | 'correction' | 'suggestion' | 'automatic' | 'neutral',
    feedbackValue: any = null
  ) => {
    return modelTrainingService.recordFeedback({
      model_id: modelId,
      user_id: auth.user?.id,
      prediction_input: input,
      prediction_output: output,
      feedback_type: feedbackType,
      feedback_value: feedbackValue
    });
  }, [auth.user]);

  return {
    // Core logging functions
    logAction,
    logAIInteraction,
    logSystemEvent,
    logBusinessLogic,
    logDataOperation,
    
    // Model training specific
    recordModelFeedback,
    
    // Access to both logging systems for advanced use cases
    basic: basicLogging,
    enhanced: enhancedLogging
  };
};
