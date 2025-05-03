/**
 * Type definitions for the Comprehensive Logging System
 * 
 * This file defines all the types needed for the logging system, privacy controls,
 * and model training pipeline.
 */

// Main log event interface
export interface LogEvent {
  id?: string;
  user_id?: string;
  company_id?: string;
  event_type: string;
  event_source: string;
  component?: string;
  action: string;
  data: any; // JSONB in database
  metadata?: any; // JSONB in database
  data_classification?: 'non_personal' | 'pseudonymized' | 'personal' | 'sensitive';
  retention_policy?: 'transient' | 'short_term' | 'medium_term' | 'long_term';
  session_id?: string;
  client_info?: ClientInfo;
  created_at?: string;
}

// Interface for logging user actions
export interface UserActionEvent extends Omit<LogEvent, 'event_type' | 'event_source'> {
  action: string;
  data: any;
  metadata?: any;
}

// Interface for logging AI interactions
export interface AIInteractionEvent extends Omit<LogEvent, 'event_type' | 'event_source'> {
  action: string;
  data: {
    model?: string;
    prompt?: string;
    response?: string;
    tokens?: number;
    [key: string]: any;
  };
  metadata?: any;
}

// Consent settings
export interface ConsentSettings {
  id?: string;
  user_id: string;
  essential: boolean; // Cannot be disabled
  analytics: boolean;
  product_improvement: boolean;
  ai_training: boolean; 
  cross_company_insights: boolean;
  personalization: boolean;
  last_updated: string;
  verified: boolean;
  consent_history?: any[];
}

// Privacy request
export interface PrivacyRequest {
  id: string;
  user_id: string;
  request_type: 'export' | 'deletion' | 'correction' | 'restriction';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  request_details?: any;
  submitted_at: string;
  completed_at?: string;
  notes?: string;
  handler_id?: string;
}

// Data classification rule
export interface ClassificationRule {
  id?: string;
  data_type: string;
  pattern: string; // Regex or description
  classification: 'non_personal' | 'pseudonymized' | 'personal' | 'sensitive';
  retention_policy: 'transient' | 'short_term' | 'medium_term' | 'long_term';
  description?: string;
  priority?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Retention policy
export interface RetentionPolicy {
  policy: string;
  retention_days: number;
  description: string;
  anonymization_action: 'delete' | 'pseudonymize' | 'anonymize';
  created_at?: string;
  last_updated?: string;
}

// Session information
export interface LoggingSession {
  session_id: string;
  user_id?: string;
  device_info?: ClientInfo;
  start_time: string;
  end_time?: string;
  is_active: boolean;
}

// Feature extraction
export interface ExtractedFeature {
  id: string;
  feature_set: string;
  feature_name: string;
  feature_value: any;
  source_logs: string[];
  is_anonymized: boolean;
  created_at: string;
}

// Model registry
export interface ModelRegistryEntry {
  id: string;
  model_name: string;
  model_type: string;
  model_version: string;
  model_description?: string | null;
  training_date: string;
  metrics?: any | null;
  hyperparameters?: any | null;
  feature_sets?: string[] | null;
  is_active: boolean;
}

// Model feedback
export interface ModelFeedback {
  id: string;
  model_id: string;
  user_id?: string | null;
  prediction_input: any;
  prediction_output: any;
  feedback_type: 'positive' | 'negative' | 'correction' | 'suggestion' | 'automatic' | 'neutral';
  feedback_value: any;
  created_at: string;
}

// Client info
export interface ClientInfo {
  userAgent?: string;
  language?: string;
  viewport?: {
    width: number;
    height: number;
  };
  referrer?: string;
  screenSize?: {
    width: number;
    height: number;
  };
  deviceType?: string;
  operatingSystem?: string;
  browser?: string;
  timestamp: string;
}
