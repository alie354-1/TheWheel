/**
 * Enhanced Logging Hook
 * 
 * This hook ensures comprehensive logging of all system interactions, user behaviors, 
 * and context information for model training purposes. It captures detailed data 
 * about users, companies, and multi-level abstractions to enable more accurate
 * predictions and model training.
 */

import { useEffect, useCallback, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useAuth } from './useAuth';
import { loggingService } from '../services/logging.service';
import { modelTrainingService } from '../services/model-training.service';
import { v4 as uuidv4 } from 'uuid';
import { ExtendedUserProfile } from '../types/extended-profile.types';
import { supabase } from '../supabase';

export interface EnhancedLoggingOptions {
  // Determines how much contextual information to include
  detailLevel: 'minimal' | 'standard' | 'extensive';
  
  // Capture user-specific information for personalization training
  captureUserContext: boolean;
  
  // Capture company-specific information for organizational training
  captureCompanyContext: boolean;
  
  // Capture abstraction layers (UI, business logic, data layer)
  captureAbstractionLayers: boolean;
  
  // Whether to extract features for model training in real-time
  extractFeaturesInRealtime: boolean;
  
  // Enable automatic feedback collection
  enableAutomaticFeedback: boolean;
}

// Default options
const defaultOptions: EnhancedLoggingOptions = {
  detailLevel: 'standard',
  captureUserContext: true,
  captureCompanyContext: true,
  captureAbstractionLayers: true,
  extractFeaturesInRealtime: true,
  enableAutomaticFeedback: true
};

// Helper type for user metrics
interface UserMetrics {
  preferences?: Record<string, any>;
  history?: Record<string, any>;
  behavioral_patterns?: Record<string, any>;
}

// Helper type for company metrics
interface CompanyMetrics {
  company_size?: string;
  company_focus?: string;
  company_growth_stage?: string;
}

export const useEnhancedLogging = (customOptions?: Partial<EnhancedLoggingOptions>) => {
  const options = { ...defaultOptions, ...customOptions };
  const { user, profile } = useAuth();
  const [interactionId, setInteractionId] = useState<string | null>(null);
  
  useEffect(() => {
    // Generate a unique interaction ID for this component instance
    setInteractionId(uuidv4());
    
    return () => {
      // Cleanup - log component unmount if needed
      if (interactionId) {
        logComponentLifecycle('unmount');
      }
    };
  }, []);
  
  /**
   * Get user context data safely
   */
  const getUserContext = (
    user: User | null, 
    profile: ExtendedUserProfile | null, 
    detailLevel: string
  ) => {
    if (!user) return null;
    
    const context: Record<string, any> = {
      user_id: user.id
    };
    
    // Add profile information if available
    if (profile) {
      // Add extended information for detailed logging
      if (detailLevel === 'extensive') {
        const userMetrics: UserMetrics = {};
        
        // Safely add optional fields
        if (profile.setup_progress) userMetrics.preferences = profile.setup_progress;
        
        // Add the metrics only if there are any
        if (Object.keys(userMetrics).length > 0) {
          context.metrics = userMetrics;
        }
        
        // Add session data
        context.session_data = {
          session_id: loggingService.getSessionId(),
          session_duration: new Date().getTime()
        };
      }
    }
    
    return context;
  };
  
  /**
   * Get company context data safely
   */
  const getCompanyContext = async (
    profile: ExtendedUserProfile | null, 
    detailLevel: string
  ) => {
    if (!profile || !profile.company_id) return null;
    
    try {
      // Use secure function to fetch company context without triggering recursion
      const { data, error } = await supabase.rpc(
        'fetch_company_context_securely',
        { 
          p_user_id: profile.id,
          p_company_id: profile.company_id 
        }
      );
      
      // If the secure function is not yet available, use a simplified approach
      if (error && error.message.includes('function "fetch_company_context_securely" does not exist')) {
        // Fall back to simplified context without database queries
        return {
          company_id: profile.company_id,
          company_access_level: 'assumed_member',
          is_fallback: true
        };
      }
      
      // If there's another error or user is not a member, return minimal context
      if (error || !data) {
        return {
          company_id: profile.company_id,
          company_access_level: 'limited'
        };
      }
      
      // Full company context
      const context: Record<string, any> = {
        company_id: profile.company_id,
        company_access_level: 'member'
      };
      
      // Add additional company information if available
      if (profile.company_name) context.company_name = profile.company_name;
      if (profile.company_stage) context.company_stage = profile.company_stage;
      if (profile.company_industry) context.industry = profile.company_industry;
      
      // Add extended information for detailed logging
      if (detailLevel === 'extensive') {
        const companyMetrics: CompanyMetrics = {};
        
        // Safely add optional fields
        if (profile.company_size) companyMetrics.company_size = profile.company_size;
        if (profile.company_website) companyMetrics.company_focus = profile.company_website;
        
        // Add the metrics only if there are any
        if (Object.keys(companyMetrics).length > 0) {
          context.company_metrics = companyMetrics;
        }
      }
      
      return context;
    } catch (err) {
      console.error('Error checking company membership:', err);
      // Return minimal context on error
      return {
        company_id: profile.company_id,
        company_access_level: 'error'
      };
    }
  };
  
  /**
   * Log component lifecycle events
   */
  const logComponentLifecycle = useCallback(async (
    event: 'mount' | 'update' | 'unmount',
    componentName?: string,
    props?: any
  ) => {
    if (!interactionId) return;
    
    const componentData: Record<string, any> = {
      event,
      interaction_id: interactionId,
      component_name: componentName || 'UnnamedComponent'
    };
    
    // Add contextual information based on options
    if (options.captureUserContext) {
      const userContext = getUserContext(user, profile, options.detailLevel);
      if (userContext) componentData.user_context = userContext;
    }
    
    if (options.captureCompanyContext) {
      try {
        const companyContext = await getCompanyContext(profile, options.detailLevel);
        if (companyContext) componentData.company_context = companyContext;
      } catch (err) {
        console.error('Error getting company context for logging:', err);
      }
    }
    
    if (options.captureAbstractionLayers) {
      componentData.abstraction_layers = {
        ui_layer: {
          component_name: componentName,
          props: props ? JSON.stringify(props) : null,
          render_count: 1
        },
        business_layer: {
          current_workflow: 'unknown',
          business_rules_applied: []
        },
        data_layer: {
          data_accessed: [],
          mutations_performed: []
        }
      };
    }
    
    // Log the component lifecycle event
    loggingService.logEvent({
      event_type: 'component_lifecycle',
      event_source: 'react',
      action: event,
      data: componentData,
      metadata: {
        enhanced_logging: true,
        interaction_id: interactionId
      }
    });
    
    // Extract features for model training if needed
    if (options.extractFeaturesInRealtime) {
      modelTrainingService.extractFeatures('component_lifecycle', {
        eventTypes: ['component_lifecycle'],
        limit: 1
      });
    }
  }, [interactionId, options, user, profile]);
  
  /**
   * Log a user interaction with detailed context
   */
  const logInteraction = useCallback(async (
    action: string,
    component: string,
    data: any = {},
    metadata: any = {}
  ) => {
    if (!interactionId) return;
    
    // Enhance the data with contextual information
    const enhancedData = { ...data };
    const enhancedMetadata = { 
      ...metadata,
      enhanced_logging: true,
      interaction_id: interactionId
    };
    
    // Add user-specific context
    if (options.captureUserContext) {
      const userContext = getUserContext(user, profile, options.detailLevel);
      if (userContext) enhancedData.user_context = userContext;
    }
    
    // Add company-specific context
    if (options.captureCompanyContext) {
      try {
        const companyContext = await getCompanyContext(profile, options.detailLevel);
        if (companyContext) enhancedData.company_context = companyContext;
      } catch (err) {
        console.error('Error getting company context for interaction logging:', err);
      }
    }
    
    // Add abstraction layer information
    if (options.captureAbstractionLayers) {
      enhancedData.abstraction_layers = {
        ui_layer: {
          component,
          action,
          element_type: data.element_type || 'unknown',
          element_id: data.element_id || null
        },
        business_layer: {
          workflow: data.workflow || 'unknown',
          process: data.process || 'unknown',
          rules_applied: data.rules_applied || []
        },
        data_layer: {
          entities_affected: data.entities_affected || [],
          data_accessed: data.data_accessed || [],
          mutations: data.mutations || []
        }
      };
    }
    
    // Log the enhanced interaction
    const eventId = loggingService.logUserAction(
      action,
      component,
      enhancedData,
      enhancedMetadata
    );
    
    // Extract features for model training if needed
    if (options.extractFeaturesInRealtime) {
      modelTrainingService.extractFeatures('user_interaction', {
        eventTypes: ['user_action'],
        limit: 1
      });
    }
    
    return eventId;
  }, [interactionId, options, user, profile]);
  
  /**
   * Log AI interactions with detailed context
   */
  const logAIInteraction = useCallback(async (
    action: string,
    data: any = {},
    metadata: any = {}
  ) => {
    if (!interactionId) return;
    
    // Enhance the data with contextual information
    const enhancedData = { 
      ...data,
      interaction_id: interactionId
    };
    
    const enhancedMetadata = { 
      ...metadata,
      enhanced_logging: true,
      interaction_id: interactionId
    };
    
    // Add user-specific context
    if (options.captureUserContext) {
      const userContext = getUserContext(user, profile, options.detailLevel);
      if (userContext) enhancedData.user_context = userContext;
    }
    
    // Add company-specific context
    if (options.captureCompanyContext) {
      try {
        const companyContext = await getCompanyContext(profile, options.detailLevel);
        if (companyContext) enhancedData.company_context = companyContext;
      } catch (err) {
        console.error('Error getting company context for AI interaction logging:', err);
      }
    }
    
    // Add AI-specific training information
    enhancedData.training_metadata = {
      input_prompt: data.prompt || data.input || '',
      model_used: data.model || metadata.model || 'unknown',
      parameters: data.parameters || metadata.parameters || {},
      timestamp: new Date().toISOString(),
      context_window: data.context_window || [],
      training_enabled: true
    };
    
    // Add abstraction layer information
    if (options.captureAbstractionLayers) {
      enhancedData.abstraction_layers = {
        ai_layer: {
          model: data.model || metadata.model || 'unknown',
          action,
          purpose: data.purpose || 'general'
        },
        business_layer: {
          workflow: data.workflow || 'unknown',
          business_context: data.business_context || {}
        },
        application_layer: {
          component: metadata.component || 'unknown',
          feature: metadata.feature || 'unknown'
        }
      };
    }
    
    // Log the enhanced AI interaction
    const eventId = loggingService.logAIInteraction(
      action,
      enhancedData,
      enhancedMetadata
    );
    
    // Extract features for model training
    if (options.extractFeaturesInRealtime) {
      modelTrainingService.extractFeatures('ai_interaction', {
        eventTypes: ['ai_interaction'],
        limit: 1
      });
    }
    
    // Record automatic feedback if enabled
    if (options.enableAutomaticFeedback && data.model && data.input && data.output) {
      modelTrainingService.recordFeedback({
        model_id: data.model_id || 'default',
        user_id: user?.id,
        prediction_input: data.input,
        prediction_output: data.output,
        feedback_type: 'automatic',
        feedback_value: data.feedback_value || 'neutral'
      });
    }
    
    return eventId;
  }, [interactionId, options, user, profile]);
  
  /**
   * Log business logic with detailed context
   */
  const logBusinessLogic = useCallback(async (
    action: string,
    process: string,
    data: any = {},
    metadata: any = {}
  ) => {
    if (!interactionId) return;
    
    // Enhance the data with contextual information
    const enhancedData = { 
      ...data,
      process,
      interaction_id: interactionId
    };
    
    const enhancedMetadata = { 
      ...metadata,
      enhanced_logging: true,
      interaction_id: interactionId,
      process
    };
    
    // Add user-specific context
    if (options.captureUserContext) {
      const userContext = getUserContext(user, profile, options.detailLevel);
      if (userContext) enhancedData.user_context = userContext;
    }
    
    // Add company-specific context
    if (options.captureCompanyContext) {
      try {
        const companyContext = await getCompanyContext(profile, options.detailLevel);
        if (companyContext) enhancedData.company_context = companyContext;
      } catch (err) {
        console.error('Error getting company context for business logic logging:', err);
      }
    }
    
    // Add abstraction layer information
    if (options.captureAbstractionLayers) {
      enhancedData.abstraction_layers = {
        business_layer: {
          process,
          action,
          business_rules: data.business_rules || [],
          decision_points: data.decision_points || []
        },
        data_layer: {
          entities_affected: data.entities_affected || [],
          data_accessed: data.data_accessed || [],
          mutations: data.mutations || []
        },
        application_layer: {
          component: metadata.component || 'unknown',
          feature: metadata.feature || 'unknown'
        }
      };
    }
    
    // Log the enhanced business logic event
    const eventId = loggingService.logEvent({
      event_type: 'business_logic',
      event_source: 'application',
      action,
      data: enhancedData,
      metadata: enhancedMetadata
    });
    
    // Extract features for model training
    if (options.extractFeaturesInRealtime) {
      modelTrainingService.extractFeatures('business_logic', {
        eventTypes: ['business_logic'],
        limit: 1
      });
    }
    
    return eventId;
  }, [interactionId, options, user, profile]);
  
  /**
   * Log data layer operations with detailed context
   */
  const logDataOperation = useCallback(async (
    operation: 'create' | 'read' | 'update' | 'delete' | 'query',
    entity: string,
    data: any = {},
    metadata: any = {}
  ) => {
    if (!interactionId) return;
    
    // Enhance the data with contextual information
    const enhancedData = { 
      ...data,
      entity,
      operation,
      interaction_id: interactionId
    };
    
    const enhancedMetadata = { 
      ...metadata,
      enhanced_logging: true,
      interaction_id: interactionId,
      entity,
      operation
    };
    
    // Add user-specific context
    if (options.captureUserContext) {
      const userContext = getUserContext(user, profile, options.detailLevel);
      if (userContext) enhancedData.user_context = userContext;
    }
    
    // Add company-specific context
    if (options.captureCompanyContext) {
      try {
        const companyContext = await getCompanyContext(profile, options.detailLevel);
        if (companyContext) enhancedData.company_context = companyContext;
      } catch (err) {
        console.error('Error getting company context for data operation logging:', err);
      }
    }
    
    // Add abstraction layer information
    if (options.captureAbstractionLayers) {
      enhancedData.abstraction_layers = {
        data_layer: {
          operation,
          entity,
          entity_id: data.entity_id || null,
          query: data.query || null,
          result_count: data.result_count || null
        },
        business_layer: {
          process: metadata.process || 'unknown',
          business_context: metadata.business_context || {}
        },
        application_layer: {
          component: metadata.component || 'unknown',
          feature: metadata.feature || 'unknown'
        }
      };
    }
    
    // Log the enhanced data operation event
    const eventId = loggingService.logEvent({
      event_type: 'data_operation',
      event_source: 'data_layer',
      action: operation,
      data: enhancedData,
      metadata: enhancedMetadata
    });
    
    // Extract features for model training
    if (options.extractFeaturesInRealtime) {
      modelTrainingService.extractFeatures('data_operation', {
        eventTypes: ['data_operation'],
        limit: 1
      });
    }
    
    return eventId;
  }, [interactionId, options, user, profile]);
  
  return {
    // Log specific types of events with enhanced context
    logInteraction,
    logAIInteraction,
    logBusinessLogic,
    logDataOperation,
    logComponentLifecycle,
    
    // Get current interaction ID
    getInteractionId: () => interactionId,
    
    // Current logging options
    options
  };
};
