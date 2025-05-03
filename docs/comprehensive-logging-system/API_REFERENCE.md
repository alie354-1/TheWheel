# API Reference: Comprehensive Logging System

## Overview

This document provides a complete reference for the Comprehensive Logging System API. It details all available service methods, their parameters, return values, and usage examples. This reference is intended for developers who need to integrate with or extend the logging system.

## Table of Contents

1. [Core Logging Service](#core-logging-service)
2. [Privacy Service](#privacy-service)
3. [Analytics Service](#analytics-service)
4. [React Hooks](#react-hooks)
5. [Helper Utilities](#helper-utilities)
6. [TypeScript Interfaces](#typescript-interfaces)
7. [Error Handling](#error-handling)

## Core Logging Service

The `LoggingService` class is the main entry point for the logging system. It provides methods for logging various types of events.

### Class: `LoggingService`

```typescript
import { LoggingService } from '../lib/services/logging.service';

// Singleton instance
export const loggingService = new LoggingService();
```

#### Constructor

```typescript
constructor(options?: LoggingServiceOptions)
```

**Parameters:**
- `options` (optional): Configuration options for the logging service
  - `enabled`: Boolean to enable/disable logging
  - `verbosity`: Log level ('debug', 'info', 'warn', 'error')
  - `batchingEnabled`: Enable batch logging
  - `maxBatchSize`: Maximum events in a batch
  - `batchIntervalMs`: Batch flush interval in milliseconds

#### Method: `logEvent`

Logs a generic event to the system.

```typescript
async logEvent(event: LogEvent): Promise<string | null>
```

**Parameters:**
- `event`: The event to log
  - `user_id?`: Optional user ID
  - `persona_id?`: Optional persona ID
  - `company_id?`: Optional company ID
  - `event_type`: Type of event ('user_action', 'system_event', etc.)
  - `event_source`: Source of the event ('ui', 'api', etc.)
  - `component?`: Optional component name
  - `action`: The action that occurred
  - `data`: Event data (will be stored as JSONB)
  - `metadata?`: Optional additional metadata
  - `session_id?`: Optional session ID

**Returns:**
- A Promise that resolves to the event ID if successful, or null if logging failed or was disabled

**Example:**
```typescript
await loggingService.logEvent({
  user_id: currentUser.id,
  event_type: 'user_action',
  event_source: 'profile_page',
  component: 'EditProfileForm',
  action: 'save_profile',
  data: {
    fields_updated: ['name', 'bio'],
    has_avatar: true
  },
  metadata: {
    ui_version: '2.3.0',
    feature_flags: ['new_profile_ui', 'enhanced_validation']
  }
});
```

#### Method: `logUserAction`

Convenience method to log user-initiated actions.

```typescript
async logUserAction(action: string, data: any, metadata?: any): Promise<string | null>
```

**Parameters:**
- `action`: The user action (e.g., 'button_click', 'form_submit')
- `data`: Data associated with the action
- `metadata`: Optional additional context

**Returns:**
- A Promise that resolves to the event ID if successful, or null if logging failed

**Example:**
```typescript
const handleSubmit = async (formData) => {
  await loggingService.logUserAction(
    'submit_idea',
    {
      idea_type: formData.type,
      word_count: formData.description.split(' ').length,
      has_attachments: formData.attachments.length > 0
    },
    { form_version: '3.1.2' }
  );
  
  // Process form submission
};
```

#### Method: `logAIInteraction`

Logs interactions with AI models.

```typescript
async logAIInteraction(action: string, data: any, metadata?: any): Promise<string | null>
```

**Parameters:**
- `action`: The AI interaction type (e.g., 'generate_text', 'classify_content')
- `data`: Data associated with the interaction
- `metadata`: Optional additional context

**Returns:**
- A Promise that resolves to the event ID if successful, or null if logging failed

**Example:**
```typescript
// Before making the AI request
const interactionId = await loggingService.logAIInteraction(
  'generate_ideas',
  {
    model: 'gpt-4',
    input_length: prompt.length,
    parameters: {
      temperature: 0.7,
      max_tokens: 500
    }
  }
);

try {
  const result = await openAI.createCompletion({/*...*/});
  
  // Log the result
  await loggingService.logAIInteraction(
    'generate_ideas_result',
    {
      interaction_id: interactionId,
      output_length: result.choices[0].text.length,
      token_usage: result.usage,
      success: true
    }
  );
} catch (error) {
  // Log the error
  await loggingService.logAIInteraction(
    'generate_ideas_error',
    {
      interaction_id: interactionId,
      error: error.message,
      success: false
    }
  );
}
```

#### Method: `logError`

Logs an error event.

```typescript
async logError(error: Error, source: string, context?: any): Promise<string | null>
```

**Parameters:**
- `error`: The Error object
- `source`: Where the error occurred (component or service name)
- `context`: Optional additional context about the error

**Returns:**
- A Promise that resolves to the event ID if successful, or null if logging failed

**Example:**
```typescript
try {
  await fetchData();
} catch (error) {
  await loggingService.logError(error, 'DataService', {
    method: 'fetchUserProfile',
    userId: currentUser.id,
    attempt: retryCount
  });
  
  // Handle the error
}
```

#### Method: `logPerformance`

Logs performance-related metrics.

```typescript
async logPerformance(
  operation: string,
  duration: number,
  unit: 'ms' | 's',
  context?: any
): Promise<string | null>
```

**Parameters:**
- `operation`: The operation being measured
- `duration`: The time it took
- `unit`: Time unit ('ms' or 's')
- `context`: Optional additional context

**Returns:**
- A Promise that resolves to the event ID if successful, or null if logging failed

**Example:**
```typescript
const startTime = performance.now();

// Some operation
const result = await expensiveOperation();

const duration = performance.now() - startTime;
await loggingService.logPerformance(
  'render_dashboard',
  duration,
  'ms',
  {
    component_count: dashboardComponents.length,
    data_size: JSON.stringify(dashboardData).length,
    user_tier: currentUser.tier
  }
);
```

#### Method: `batchLog`

Logs multiple events in a batch for efficiency.

```typescript
async batchLog(events: LogEvent[]): Promise<(string | null)[]>
```

**Parameters:**
- `events`: Array of events to log

**Returns:**
- A Promise that resolves to an array of event IDs or nulls

**Example:**
```typescript
// Collect events during a complex operation
const events = [];

// Step 1
events.push({
  event_type: 'workflow',
  event_source: 'import_wizard',
  action: 'step_1_complete',
  data: { validated_entries: 150 }
});

// Step 2
events.push({
  event_type: 'workflow',
  event_source: 'import_wizard',
  action: 'step_2_complete',
  data: { processed_entries: 130 }
});

// Log all events at once
await loggingService.batchLog(events);
```

#### Method: `enableLogging`

Enables or disables logging.

```typescript
enableLogging(enabled: boolean): void
```

**Parameters:**
- `enabled`: Boolean to enable or disable logging

**Example:**
```typescript
// Disable logging during sensitive operations
loggingService.enableLogging(false);

// Perform sensitive operation
await processSensitiveData();

// Re-enable logging
loggingService.enableLogging(true);
```

#### Method: `setVerbosity`

Sets the logging verbosity level.

```typescript
setVerbosity(level: 'debug' | 'info' | 'warn' | 'error'): void
```

**Parameters:**
- `level`: The verbosity level

**Example:**
```typescript
// Set higher verbosity during development
if (process.env.NODE_ENV === 'development') {
  loggingService.setVerbosity('debug');
} else {
  loggingService.setVerbosity('warn');
}
```

#### Method: `flush`

Manually flushes any batched logs.

```typescript
async flush(): Promise<void>
```

**Example:**
```typescript
// Ensure all logs are sent before the user leaves
window.addEventListener('beforeunload', () => {
  loggingService.flush();
});
```

## Privacy Service

The `PrivacyService` handles consent checking and data protection.

### Class: `PrivacyService`

```typescript
import { privacyService } from '../lib/services/privacy.service';
```

#### Method: `checkConsent`

Checks if a user has given consent for a specific logging purpose.

```typescript
async checkConsent(userId: string | undefined, consentType: string): Promise<boolean>
```

**Parameters:**
- `userId`: The user's ID, or undefined for anonymous users
- `consentType`: The type of consent to check ('analytics', 'ai_training', etc.)

**Returns:**
- A Promise that resolves to a boolean indicating consent status

**Example:**
```typescript
// Before logging analytics data
const canLogAnalytics = await privacyService.checkConsent(
  currentUser?.id,
  'analytics'
);

if (canLogAnalytics) {
  await loggingService.logUserAction('page_view', { page: 'dashboard' });
}
```

#### Method: `classifyData`

Classifies data according to privacy sensitivity.

```typescript
async classifyData(data: any): Promise<{ 
  classification: string; 
  retentionPolicy: string 
}>
```

**Parameters:**
- `data`: The data to classify

**Returns:**
- A Promise that resolves to an object with classification and retention policy

**Example:**
```typescript
// Classify data before logging
const { classification, retentionPolicy } = await privacyService.classifyData(userData);

// Only log if not sensitive
if (classification !== 'sensitive') {
  await loggingService.logEvent({
    event_type: 'user_profile',
    event_source: 'profile_service',
    action: 'profile_update',
    data: userData,
    data_classification: classification,
    retention_policy: retentionPolicy
  });
}
```

#### Method: `anonymizeData`

Anonymizes sensitive data for logging or analysis.

```typescript
async anonymizeData(
  data: any, 
  level: 'pseudonymize' | 'anonymize' = 'anonymize'
): Promise<any>
```

**Parameters:**
- `data`: The data to anonymize
- `level`: The anonymization level

**Returns:**
- A Promise that resolves to the anonymized data

**Example:**
```typescript
// Anonymize user data for AI training
const anonymizedData = await privacyService.anonymizeData(
  userData,
  'pseudonymize' // Preserve patterns but remove identifiers
);

await loggingService.logAIInteraction(
  'train_model',
  {
    input_data: anonymizedData,
    model_type: 'recommendation'
  }
);
```

#### Method: `handlePrivacyRequest`

Creates and processes a privacy request (e.g., data export or deletion).

```typescript
async handlePrivacyRequest(
  userId: string, 
  requestType: 'export' | 'deletion' | 'correction' | 'restriction'
): Promise<string>
```

**Parameters:**
- `userId`: The user's ID
- `requestType`: The type of privacy request

**Returns:**
- A Promise that resolves to the request ID

**Example:**
```typescript
// When user requests their data
async function handleExportRequest(userId: string) {
  try {
    const requestId = await privacyService.handlePrivacyRequest(
      userId,
      'export'
    );
    
    return {
      success: true,
      message: 'Your request is being processed. You will be notified when completed.',
      requestId
    };
  } catch (error) {
    loggingService.logError(error, 'PrivacyController', { userId });
    return {
      success: false,
      message: 'Failed to process your request. Please try again later.'
    };
  }
}
```

## Analytics Service

The `AnalyticsService` processes log data for insights and model training.

### Class: `AnalyticsService`

```typescript
import { analyticsService } from '../lib/services/analytics.service';
```

#### Method: `processLogData`

Processes log data for analysis.

```typescript
async processLogData(startDate?: Date, endDate?: Date): Promise<any>
```

**Parameters:**
- `startDate`: Optional start date for the data range
- `endDate`: Optional end date for the data range

**Returns:**
- A Promise that resolves to the processed data

**Example:**
```typescript
// Process last week's data
const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

const processedData = await analyticsService.processLogData(oneWeekAgo);
```

#### Method: `trainModels`

Trains machine learning models based on log data.

```typescript
async trainModels(): Promise<void>
```

**Example:**
```typescript
// Schedule regular model training
setInterval(async () => {
  try {
    await analyticsService.trainModels();
    console.log('Models trained successfully');
  } catch (error) {
    console.error('Model training failed:', error);
  }
}, 24 * 60 * 60 * 1000); // Daily
```

#### Method: `generateInsights`

Generates insights from processed data.

```typescript
async generateInsights(): Promise<any>
```

**Returns:**
- A Promise that resolves to the generated insights

**Example:**
```typescript
async function generateDashboardInsights() {
  const insights = await analyticsService.generateInsights();
  return insights.filter(insight => insight.confidence > 0.7);
}
```

#### Method: `getCompanyContext`

Builds context for a specific company based on their logs.

```typescript
async getCompanyContext(companyId: string): Promise<any>
```

**Parameters:**
- `companyId`: The company's ID

**Returns:**
- A Promise that resolves to the company context

**Example:**
```typescript
// Get context before generating company-specific recommendations
const companyContext = await analyticsService.getCompanyContext(currentCompany.id);

// Use context to personalize recommendations
const recommendations = await generateRecommendations(companyContext);
```

## React Hooks

### Hook: `useLogging`

A React hook that provides access to logging functionality within components.

```typescript
import { useLogging } from '../lib/hooks/useLogging';

function MyComponent() {
  const { 
    logUIEvent, 
    logFormSubmission, 
    logNavigation 
  } = useLogging();
  
  // Use logging methods in component
}
```

#### Method: `logUIEvent`

Logs a UI interaction.

```typescript
const logUIEvent: (
  component: string,
  action: string,
  data: any,
  metadata?: any
) => Promise<void>;
```

**Example:**
```typescript
function FeatureCard({ feature }) {
  const { logUIEvent } = useLogging();
  
  const handleClick = () => {
    logUIEvent(
      'FeatureCard',
      'feature_click',
      { featureId: feature.id, featureType: feature.type },
      { cardPosition: 'main_dashboard' }
    );
    
    // Handle the click
  };
  
  return (
    <div onClick={handleClick}>
      {/* Card content */}
    </div>
  );
}
```

#### Method: `logFormSubmission`

Logs form submissions.

```typescript
const logFormSubmission: (
  form: string,
  data: any,
  metadata?: any
) => Promise<void>;
```

**Example:**
```typescript
function ContactForm() {
  const { logFormSubmission } = useLogging();
  const [formData, setFormData] = useState({/*...*/});
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Log the submission
    await logFormSubmission(
      'contact_form',
      { 
        has_email: !!formData.email,
        message_length: formData.message.length,
        topic: formData.topic
      }
    );
    
    // Submit the form
    await submitContactForm(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

#### Method: `logNavigation`

Logs navigation events.

```typescript
const logNavigation: (
  from: string,
  to: string,
  metadata?: any
) => Promise<void>;
```

**Example:**
```typescript
function NavigationLink({ to, children }) {
  const { logNavigation } = useLogging();
  const location = useLocation();
  
  const handleClick = () => {
    logNavigation(
      location.pathname,
      to,
      { navSource: 'sidebar_menu' }
    );
  };
  
  return (
    <Link to={to} onClick={handleClick}>
      {children}
    </Link>
  );
}
```

### Hook: `usePerformanceLogging`

A React hook that measures and logs component performance.

```typescript
import { usePerformanceLogging } from '../lib/hooks/usePerformanceLogging';

function DataTable({ data }) {
  usePerformanceLogging('DataTable', { rowCount: data.length });
  
  // Component implementation
}
```

## Helper Utilities

### Utility: `createLogContext`

Creates a context object to add to logs.

```typescript
import { createLogContext } from '../lib/utils/logging-utils';

const context = createLogContext(user, {
  page: 'dashboard',
  view: 'summary'
});
```

### Utility: `sanitizeLogData`

Sanitizes data to remove sensitive information before logging.

```typescript
import { sanitizeLogData } from '../lib/utils/logging-utils';

const safeData = sanitizeLogData(userData);
await loggingService.logEvent({
  // Other properties
  data: safeData
});
```

### Utility: `withLogging`

Higher-order function that adds logging to any function.

```typescript
import { withLogging } from '../lib/utils/logging-utils';

const fetchUserWithLogging = withLogging(
  fetchUser,
  'UserService',
  'fetchUser'
);

// When called, will automatically log start, completion, and errors
const user = await fetchUserWithLogging(userId);
```

## TypeScript Interfaces

### Interface: `LogEvent`

Represents a log event.

```typescript
interface LogEvent {
  id?: string;
  user_id?: string;
  persona_id?: string;
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
  client_info?: any;
  created_at?: string;
}
```

### Interface: `ConsentSettings`

Represents user consent preferences.

```typescript
interface ConsentSettings {
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
```

### Interface: `LoggingServiceOptions`

Configuration options for the logging service.

```typescript
interface LoggingServiceOptions {
  enabled?: boolean;
  verbosity?: 'debug' | 'info' | 'warn' | 'error';
  batchingEnabled?: boolean;
  maxBatchSize?: number;
  batchIntervalMs?: number;
  samplingRate?: number;
}
```

## Error Handling

### LoggingError Class

```typescript
class LoggingError extends Error {
  code: string;
  details?: any;
  
  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'LoggingError';
    this.code = code;
    this.details = details;
  }
}
```

### Common Error Codes

- `CONSENT_REQUIRED`: User hasn't provided required consent
- `CLASSIFICATION_FAILED`: Failed to classify data sensitivity
- `RATE_LIMIT_EXCEEDED`: Too many log events in a short period
- `INVALID_DATA`: Log data doesn't meet schema requirements
- `SERVICE_UNAVAILABLE`: Logging service is unavailable

### Error Handling Example

```typescript
try {
  await loggingService.logEvent({/*...*/});
} catch (error) {
  if (error instanceof LoggingError) {
    switch (error.code) {
      case 'CONSENT_REQUIRED':
        // Prompt user for consent
        showConsentDialog();
        break;
      case 'RATE_LIMIT_EXCEEDED':
        // Implement backoff strategy
        scheduleRetry(error.details.retryAfter);
        break;
      default:
        // Handle other errors
        console.error('Logging error:', error.message);
    }
  } else {
    // Handle unexpected errors
    console.error('Unexpected error:', error);
  }
}
```

This API Reference provides a comprehensive guide to the Comprehensive Logging System. For implementation examples and best practices, see the [Implementation Guide](./IMPLEMENTATION_GUIDE.md).
