# Technical Architecture: Comprehensive Logging System

## Overview

The Comprehensive Logging System is designed to capture system interactions while maintaining privacy compliance and enabling model training. This document outlines the technical architecture, design decisions, and implementation details.

## System Components

### 1. Database Schema

The system introduces new tables for logging and privacy management:

```
┌─────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
│  system_logs        │      │  user_consent        │      │  log_classification  │
│  (main log table)   │      │  (consent settings)  │      │  (classification rules)│
└─────────┬───────────┘      └──────────┬───────────┘      └──────────────────────┘
          │                             │                              
          │                             │                              
┌─────────┴───────────┐      ┌──────────┴───────────┐      ┌──────────────────────┐
│  log_partitions     │      │  privacy_requests    │      │  data_retention      │
│  (partitioning)     │      │  (export/deletion)   │      │  (retention policies)│
└─────────────────────┘      └──────────────────────┘      └──────────────────────┘
```

#### Database Table Definitions

```sql
-- Main logging table
CREATE TABLE system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  persona_id UUID REFERENCES user_personas(id),
  company_id UUID,
  event_type TEXT NOT NULL,
  event_source TEXT NOT NULL,
  component TEXT,
  action TEXT NOT NULL,
  data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  data_classification TEXT NOT NULL 
    CHECK (data_classification IN ('non_personal', 'pseudonymized', 'personal', 'sensitive')),
  retention_policy TEXT NOT NULL
    CHECK (retention_policy IN ('transient', 'short_term', 'medium_term', 'long_term')),
  session_id TEXT,
  client_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User consent settings
CREATE TABLE user_consent (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  essential BOOLEAN NOT NULL DEFAULT true, -- Cannot be disabled
  analytics BOOLEAN NOT NULL DEFAULT false,
  product_improvement BOOLEAN NOT NULL DEFAULT false,
  ai_training BOOLEAN NOT NULL DEFAULT false,
  cross_company_insights BOOLEAN NOT NULL DEFAULT false,
  personalization BOOLEAN NOT NULL DEFAULT false,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified BOOLEAN NOT NULL DEFAULT false
);

-- Privacy requests (for GDPR/CCPA compliance)
CREATE TABLE privacy_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  request_type TEXT NOT NULL CHECK (request_type IN ('export', 'deletion', 'correction', 'restriction')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  request_details JSONB,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Data classification rules
CREATE TABLE log_classification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_type TEXT NOT NULL,
  pattern TEXT NOT NULL, -- Regex or description
  classification TEXT NOT NULL 
    CHECK (classification IN ('non_personal', 'pseudonymized', 'personal', 'sensitive')),
  retention_policy TEXT NOT NULL
    CHECK (retention_policy IN ('transient', 'short_term', 'medium_term', 'long_term')),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Retention policy definitions
CREATE TABLE data_retention (
  policy TEXT PRIMARY KEY,
  retention_days INTEGER NOT NULL,
  description TEXT NOT NULL,
  anonymization_action TEXT CHECK (anonymization_action IN ('delete', 'pseudonymize', 'anonymize')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Design Decisions:**

1. **Flexible Schema**: Using JSONB columns for data and metadata to accommodate different log types.
2. **Classification Integration**: Direct classification and retention policy fields in the log table.
3. **Partitioning Ready**: Structure supports time-based partitioning for performance.
4. **Consent Granularity**: Detailed consent options to comply with privacy regulations.

### 2. Services Layer

The services layer organization:

```
┌───────────────────────┐
│ LoggingService        │
├───────────────────────┤
│ - logEvent()          │
│ - logUIAction()       │
│ - logAIInteraction()  │
│ - batchLog()          │
└─────────┬─────────────┘
          │
          │
┌─────────┼─────────────┐         ┌───────────────────────┐
│ PrivacyService        │◄────────┤AnalyticsService       │
├───────────────────────┤         ├───────────────────────┤
│ - checkConsent()      │         │ - processLogData()    │
│ - classifyData()      │         │ - trainModels()       │
│ - anonymizeData()     │         │ - generateInsights()  │
└───────────────────────┘         └───────────────────────┘
```

#### Core Services Implementation

```typescript
// src/lib/services/logging.service.ts
import { supabase } from '../supabase';
import { v4 as uuidv4 } from 'uuid';
import { privacyService } from './privacy.service';

export interface LogEvent {
  user_id?: string;
  persona_id?: string;
  company_id?: string;
  event_type: string;
  event_source: string;
  component?: string;
  action: string;
  data: any;
  metadata?: any;
  session_id?: string;
}

class LoggingService {
  private sessionId: string;
  private clientInfo: any;
  
  constructor() {
    this.sessionId = uuidv4();
    this.clientInfo = this.captureClientInfo();
  }
  
  private captureClientInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      timestamp: new Date().toISOString()
    };
  }
  
  async logEvent(event: LogEvent): Promise<void> {
    try {
      // Check consent before logging
      const canLog = await privacyService.checkConsent(
        event.user_id, 
        this.getConsentTypeForEvent(event)
      );
      
      if (!canLog) return;
      
      // Classify data
      const { classification, retentionPolicy } = 
        await privacyService.classifyData(event.data);
      
      // Insert into logs
      const { error } = await supabase
        .from('system_logs')
        .insert({
          ...event,
          session_id: event.session_id || this.sessionId,
          client_info: this.clientInfo,
          data_classification: classification,
          retention_policy: retentionPolicy
        });
        
      if (error) console.error('Error logging event:', error);
    } catch (err) {
      console.error('Failed to log event:', err);
      // Even when logging fails, we don't want to break the application
    }
  }
  
  private getConsentTypeForEvent(event: LogEvent): string {
    // Map event types to consent types
    switch (event.event_type) {
      case 'user_action': return 'analytics';
      case 'ai_interaction': return 'ai_training';
      case 'cross_company': return 'cross_company_insights';
      case 'personalization': return 'personalization';
      case 'system': return 'essential';
      default: return 'product_improvement';
    }
  }
  
  // Specialized logging methods
  async logUserAction(action: string, data: any, metadata?: any): Promise<void> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;
    
    return this.logEvent({
      user_id: user.data.user.id,
      event_type: 'user_action',
      event_source: 'ui',
      action,
      data,
      metadata
    });
  }
  
  async logAIInteraction(action: string, data: any, metadata?: any): Promise<void> {
    const user = await supabase.auth.getUser();
    
    return this.logEvent({
      user_id: user.data?.user?.id,
      event_type: 'ai_interaction',
      event_source: 'ai_service',
      action,
      data,
      metadata
    });
  }
  
  async batchLog(events: LogEvent[]): Promise<void> {
    // Process events in batches for efficiency
    for (const event of events) {
      await this.logEvent(event);
    }
  }
}

export const loggingService = new LoggingService();
```

```typescript
// src/lib/services/privacy.service.ts
import { supabase } from '../supabase';

class PrivacyService {
  async checkConsent(userId: string | undefined, consentType: string): Promise<boolean> {
    if (!userId) return consentType === 'essential'; // Only essential logging for non-logged-in users
    
    // Essential consent is always true
    if (consentType === 'essential') return true;
    
    try {
      const { data, error } = await supabase
        .from('user_consent')
        .select(consentType)
        .eq('user_id', userId)
        .single();
        
      if (error || !data) return false;
      
      return !!data[consentType];
    } catch (err) {
      console.error('Error checking consent:', err);
      return false; // Default to no consent on error
    }
  }
  
  async classifyData(data: any): Promise<{ classification: string; retentionPolicy: string }> {
    // Default classification
    let classification = 'non_personal';
    let retentionPolicy = 'medium_term';
    
    // Check for personal data patterns
    if (this.containsPersonalData(data)) {
      classification = 'personal';
      retentionPolicy = 'short_term';
    }
    
    // Check for sensitive data patterns
    if (this.containsSensitiveData(data)) {
      classification = 'sensitive';
      retentionPolicy = 'transient';
    }
    
    return { classification, retentionPolicy };
  }
  
  private containsPersonalData(data: any): boolean {
    // Check for common personal data patterns
    // This would be a more sophisticated implementation in production
    const dataString = JSON.stringify(data).toLowerCase();
    
    // Simple check for common personal identifiers
    return /email|name|phone|address|location|ip|user_id/.test(dataString);
  }
  
  private containsSensitiveData(data: any): boolean {
    // Check for sensitive data patterns
    // This would be a more sophisticated implementation in production
    const dataString = JSON.stringify(data).toLowerCase();
    
    // Simple check for common sensitive identifiers
    return /password|ssn|credit|token|health|religion|politics|ethnic/.test(dataString);
  }
  
  async anonymizeData(data: any, level: 'pseudonymize' | 'anonymize' = 'anonymize'): Promise<any> {
    if (level === 'pseudonymize') {
      // Replace identifiers with consistent pseudonyms
      return this.pseudonymizeData(data);
    } else {
      // Remove or generalize all identifiers
      return this.fullAnonymization(data);
    }
  }
  
  private pseudonymizeData(data: any): any {
    // Implementation would use consistent hashing for identifiers
    // This is a simplified version
    // ...
    return data; // Placeholder
  }
  
  private fullAnonymization(data: any): any {
    // Implementation would remove all identifiers
    // This is a simplified version
    // ...
    return data; // Placeholder
  }
  
  async handlePrivacyRequest(userId: string, requestType: 'export' | 'deletion' | 'correction' | 'restriction'): Promise<string> {
    // Create a privacy request
    const { data, error } = await supabase
      .from('privacy_requests')
      .insert({
        user_id: userId,
        request_type: requestType,
        status: 'pending'
      })
      .select()
      .single();
      
    if (error) {
      throw new Error(`Failed to create privacy request: ${error.message}`);
    }
    
    // Start processing the request asynchronously
    this.processPrivacyRequest(data.id);
    
    return data.id;
  }
  
  private async processPrivacyRequest(requestId: string): Promise<void> {
    // This would be implemented as a background job
    // ...
  }
}

export const privacyService = new PrivacyService();
```

```typescript
// src/lib/services/analytics.service.ts
import { supabase } from '../supabase';

class AnalyticsService {
  async processLogData(startDate?: Date, endDate?: Date): Promise<any> {
    // Process log data for analytics
    // This would extract patterns and prepare for model training
    // ...
  }
  
  async trainModels(): Promise<void> {
    // Train machine learning models on processed data
    // ...
  }
  
  async generateInsights(): Promise<any> {
    // Generate insights from processed data
    // ...
  }
  
  async getCompanyContext(companyId: string): Promise<any> {
    // Build context for a specific company
    // ...
  }
  
  async getCrossCompanyPatterns(industry?: string): Promise<any> {
    // Find patterns across companies (anonymized)
    // ...
  }
}

export const analyticsService = new AnalyticsService();
```

### 3. Data Models

Core TypeScript interfaces that define the system:

```typescript
// src/lib/types/logging.types.ts

// Main log event interface
export interface LogEvent {
  id: string;
  user_id?: string;
  persona_id?: string;
  company_id?: string;
  event_type: string;
  event_source: string;
  component?: string;
  action: string;
  data: any; // JSONB in database
  metadata?: any; // JSONB in database
  data_classification: 'non_personal' | 'pseudonymized' | 'personal' | 'sensitive';
  retention_policy: 'transient' | 'short_term' | 'medium_term' | 'long_term';
  session_id?: string;
  client_info?: any;
  created_at: string;
}

// Consent settings
export interface ConsentSettings {
  user_id: string;
  essential: boolean; // Cannot be disabled
  analytics: boolean;
  product_improvement: boolean;
  ai_training: boolean; 
  cross_company_insights: boolean;
  personalization: boolean;
  last_updated: string;
  verified: boolean;
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
}

// Data classification rule
export interface ClassificationRule {
  id: string;
  data_type: string;
  pattern: string; // Regex or description
  classification: 'non_personal' | 'pseudonymized' | 'personal' | 'sensitive';
  retention_policy: 'transient' | 'short_term' | 'medium_term' | 'long_term';
  description?: string;
  is_active: boolean;
}

// Processed analytics data
export interface AnalyticsData {
  time_period: string;
  metrics: Record<string, number>;
  patterns: any[];
  insights: string[];
  generated_at: string;
}

// Company context
export interface CompanyContext {
  company_id: string;
  industry: string;
  company_size: string;
  usage_patterns: any[];
  common_workflows: any[];
  feature_preferences: any[];
  last_updated: string;
}
```

### 4. Component Architecture

UI components follow a hierarchical organization:

```
┌─────────────────────────────┐
│ LoggingProvider (Context)   │
├─────────────────────────────┤
│                             │
└─────────────────────────────┘

┌─────────────────────────────┐
│ ConsentManager              │
├─────────────────────────────┤
│ ┌───────────────────────┐   │
│ │ ConsentSettings       │   │
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │ ConsentExplanation    │   │
│ └───────────────────────┘   │
└─────────────────────────────┘

┌─────────────────────────────┐
│ PrivacyDashboard            │
├─────────────────────────────┤
│ ┌───────────────────────┐   │
│ │ DataSummary           │   │
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │ ExportTools           │   │
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │ DeletionRequest       │   │
│ └───────────────────────┘   │
└─────────────────────────────┘
```

#### Core Component Implementation

```typescript
// src/lib/contexts/LoggingContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { loggingService } from '../services/logging.service';

interface LoggingContextProps {
  logUIEvent: (component: string, action: string, data: any, metadata?: any) => Promise<void>;
  logFormSubmission: (form: string, data: any, metadata?: any) => Promise<void>;
  logNavigation: (from: string, to: string, metadata?: any) => Promise<void>;
}

const LoggingContext = createContext<LoggingContextProps | undefined>(undefined);

export const LoggingProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const logUIEvent = async (component: string, action: string, data: any, metadata?: any) => {
    return loggingService.logEvent({
      event_type: 'ui_interaction',
      event_source: 'ui',
      component,
      action,
      data,
      metadata
    });
  };
  
  const logFormSubmission = async (form: string, data: any, metadata?: any) => {
    return loggingService.logEvent({
      event_type: 'form_submission',
      event_source: 'ui',
      component: form,
      action: 'submit',
      data,
      metadata
    });
  };
  
  const logNavigation = async (from: string, to: string, metadata?: any) => {
    return loggingService.logEvent({
      event_type: 'navigation',
      event_source: 'router',
      action: 'navigate',
      data: { from, to },
      metadata
    });
  };
  
  return (
    <LoggingContext.Provider value={{
      logUIEvent,
      logFormSubmission,
      logNavigation
    }}>
      {children}
    </LoggingContext.Provider>
  );
};

export const useLogging = () => {
  const context = useContext(LoggingContext);
  if (context === undefined) {
    throw new Error('useLogging must be used within a LoggingProvider');
  }
  return context;
};
```

```typescript
// src/components/privacy/ConsentManager.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ConsentSettings } from '../../lib/types/logging.types';

const ConsentManager: React.FC = () => {
  const [consentSettings, setConsentSettings] = useState<Partial<ConsentSettings>>({
    essential: true, // Cannot be disabled
    analytics: false,
    product_improvement: false,
    ai_training: false,
    cross_company_insights: false,
    personalization: false,
  });
  
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchConsent = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      
      setUserId(user.id);
      
      const { data, error } = await supabase
        .from('user_consent')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        // If not found, we'll create with defaults
        if (error.code === 'PGRST116') {
          await supabase.from('user_consent').insert({
            user_id: user.id,
            essential: true,
            verified: true
          });
        } else {
          console.error('Error fetching consent settings:', error);
        }
      } else if (data) {
        setConsentSettings(data);
      }
      
      setLoading(false);
    };
    
    fetchConsent();
  }, []);
  
  const updateConsent = async (key: string, value: boolean) => {
    if (!userId) return;
    
    // Can't disable essential
    if (key === 'essential' && !value) return;
    
    setConsentSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    const { error } = await supabase
      .from('user_consent')
      .update({
        [key]: value,
        last_updated: new Date().toISOString()
      })
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error updating consent setting:', error);
      // Revert on error
      setConsentSettings(prev => ({
        ...prev,
        [key]: !value
      }));
    }
  };
  
  if (loading) return <div>Loading consent settings...</div>;
  
  return (
    <div className="consent-manager">
      <h2>Data & Privacy Settings</h2>
      <p>Control how your data is used throughout the application.</p>
      
      <div className="consent-options">
        {/* Essential - can't disable */}
        <div className="consent-option">
          <label>
            <input 
              type="checkbox" 
              checked={consentSettings.essential} 
              disabled={true}
            />
            Essential
          </label>
          <p className="description">
            Required for the application to function properly. Includes authentication, 
            error logging, and security-related data.
          </p>
        </div>
        
        {/* Analytics */}
        <div className="consent-option">
          <label>
            <input 
              type="checkbox" 
              checked={consentSettings.analytics} 
              onChange={e => updateConsent('analytics', e.target.checked)}
            />
            Analytics
          </label>
          <p className="description">
            Helps us understand how the application is used, which features are popular, 
            and basic usage metrics.
          </p>
        </div>
        
        {/* Product Improvement */}
        <div className="consent-option">
          <label>
            <input 
              type="checkbox" 
              checked={consentSettings.product_improvement} 
              onChange={e => updateConsent('product_improvement', e.target.checked)}
            />
            Product Improvement
          </label>
          <p className="description">
            Allows us to analyze patterns and improve features based on how they're being used.
          </p>
        </div>
        
        {/* AI Training */}
        <div className="consent-option">
          <label>
            <input 
              type="checkbox" 
              checked={consentSettings.ai_training} 
              onChange={e => updateConsent('ai_training', e.target.checked)}
            />
            AI Training
          </label>
          <p className="description">
            Permits the use of your anonymized data to train AI models that power features 
            like recommendations and assistants.
          </p>
        </div>
        
        {/* Cross-Company Insights */}
        <div className="consent-option">
          <label>
            <input 
              type="checkbox" 
              checked={consentSettings.cross_company_insights} 
              onChange={e => updateConsent('cross_company_insights', e.target.checked)}
            />
            Cross-Company Insights
          </label>
          <p className="description">
            Enables the generation of anonymized, aggregated insights across similar 
            companies to provide benchmarking and best practices.
          </p>
        </div>
        
        {/* Personalization */}
        <div className="consent-option">
          <label>
            <input 
              type="checkbox" 
              checked={consentSettings.personalization} 
              onChange={e => updateConsent('personalization', e.target.checked)}
            />
            Personalization
          </label>
          <p className="description">
            Uses your behavior and preferences to customize your experience and provide 
            more relevant content and features.
          </p>
        </div>
      </div>
      
      <div className="consent-info">
        <h3>Your Rights</h3>
        <p>
          Under GDPR and CCPA, you have the right to access, correct, download, or
          request deletion of your personal data. Visit the Privacy Dashboard to
          exercise these rights.
        </p>
        <button className="secondary">
          Privacy Dashboard
        </button>
      </div>
    </div>
  );
};

export default ConsentManager;
```

### 5. OpenAI Integration

Wrapping the OpenAI client for comprehensive logging:

```typescript
// Enhanced openai-client.ts
import OpenAI from 'openai';
import { loggingService } from './services/logging.service';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Create a wrapped version that logs all calls
const loggedOpenAI = {
  chat: {
    completions: {
      create: async (params: any) => {
        // Log the request
        await loggingService.logAIInteraction('openai_request', {
          model: params.model,
          messages: params.messages,
          temperature: params.temperature,
          max_tokens: params.max_tokens
        });
        
        // Make the actual request
        try {
          const response = await openai.chat.completions.create(params);
          
          // Log the response
          await loggingService.logAIInteraction('openai_response', {
            model: params.model,
            completion: response.choices[0]?.message?.content,
            usage: response.usage
          });
          
          return response;
        } catch (error) {
          // Log the error
          await loggingService.logAIInteraction('openai_error', {
            model: params.model,
            error: error
          });
          throw error;
        }
      }
    }
  },
  // Wrap other OpenAI API methods similarly
};

export default loggedOpenAI;
```

## Database Migrations

The implementation requires a new migration file:

```sql
-- Migration: Comprehensive Logging System
-- Created: 2025-03-16
-- Description: Implements logging system with privacy controls

-- Enable extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Create the main logging tables

-- Main logging table
CREATE TABLE system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  persona_id UUID REFERENCES user_personas(id),
  company_id UUID,
  event_type TEXT NOT NULL,
  event_source TEXT NOT NULL,
  component TEXT,
  action TEXT NOT NULL,
  data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  data_classification TEXT NOT NULL 
    CHECK (data_classification IN ('non_personal', 'pseudonymized', 'personal', 'sensitive')),
  retention_policy TEXT NOT NULL
    CHECK (retention_policy IN ('transient', 'short_term', 'medium_term', 'long_term')),
  session_id TEXT,
  client_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User consent settings
CREATE TABLE user_consent (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  essential BOOLEAN NOT NULL DEFAULT true, -- Cannot be disabled
  analytics BOOLEAN NOT NULL DEFAULT false,
  product_improvement BOOLEAN NOT NULL DEFAULT false,
  ai_training BOOLEAN NOT NULL DEFAULT false,
  cross_company_insights BOOLEAN NOT NULL DEFAULT false,
  personalization BOOLEAN NOT NULL DEFAULT false,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified BOOLEAN NOT NULL DEFAULT false
);

-- Privacy requests (for GDPR/CCPA compliance)
CREATE TABLE privacy_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  request_type TEXT NOT NULL CHECK (request_type IN ('export', 'deletion', 'correction', 'restriction')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  request_details JSONB,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Data classification rules
CREATE TABLE log_classification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_type TEXT NOT NULL,
  pattern TEXT NOT NULL, -- Regex or description
  classification TEXT NOT NULL 
    CHECK (classification IN ('non_personal', 'pseudonymized', 'personal', 'sensitive')),
  retention_policy TEXT NOT NULL
    CHECK (retention_policy IN ('transient', 'short_term', 'medium_term', 'long_term')),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Retention policy definitions
CREATE TABLE data_retention (
  policy TEXT PRIMARY KEY,
  retention_days INTEGER NOT NULL,
  description TEXT NOT NULL,
  anonymization_action TEXT CHECK (anonymization_action IN ('delete', 'pseudonymize', 'anonymize')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2
