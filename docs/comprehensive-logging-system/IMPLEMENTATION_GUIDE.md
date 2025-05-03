# Implementation Guide: Comprehensive Logging System

## Overview

This guide provides practical instructions for developers to implement and integrate the Comprehensive Logging System into application components. It covers common integration patterns, best practices, and solutions to typical challenges.

## Table of Contents

1. [Integration Patterns](#integration-patterns)
2. [Common Use Cases](#common-use-cases)
3. [Best Practices](#best-practices)
4. [Troubleshooting](#troubleshooting)
5. [Performance Considerations](#performance-considerations)

## Integration Patterns

### Component-Level Integration

For React components, use the `useLogging` hook to access logging functionality:

```typescript
import React from 'react';
import { useLogging } from '../../lib/hooks/useLogging';

const MyComponent: React.FC = () => {
  const { logUIEvent } = useLogging();
  
  const handleButtonClick = () => {
    // Log the interaction
    logUIEvent('MyComponent', 'button_click', { buttonType: 'primary' });
    
    // Proceed with the action
    // ...
  };
  
  return (
    <button onClick={handleButtonClick}>
      Click Me
    </button>
  );
};
```

### Service-Level Integration

For services, import the logging service directly:

```typescript
import { loggingService } from '../logging.service';

class DataService {
  async fetchData(params: any) {
    try {
      // Log the data request
      await loggingService.logEvent({
        event_type: 'service_operation',
        event_source: 'data_service',
        action: 'fetch_data',
        data: { params }
      });
      
      // Proceed with data fetching
      const result = await apiClient.get('/data', { params });
      
      // Log successful response
      await loggingService.logEvent({
        event_type: 'service_operation',
        event_source: 'data_service',
        action: 'fetch_data_success',
        data: { 
          params,
          resultCount: result.data.length,
          responseTime: performance.now() - startTime
        }
      });
      
      return result.data;
    } catch (error) {
      // Log error
      await loggingService.logError(
        error,
        'DataService',
        { method: 'fetchData', params }
      );
      throw error;
    }
  }
}
```

### Router-Level Integration

To log navigation events, integrate with your router:

```typescript
// For React Router
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { loggingService } from '../services/logging.service';

export const NavigationLogger = () => {
  const location = useLocation();
  
  useEffect(() => {
    const logNavigation = async () => {
      await loggingService.logEvent({
        event_type: 'navigation',
        event_source: 'router',
        action: 'page_view',
        data: {
          path: location.pathname,
          search: location.search,
          referrer: document.referrer
        }
      });
    };
    
    logNavigation();
  }, [location]);
  
  return null; // This is a utility component with no UI
};

// Then use it in your app
function App() {
  return (
    <Router>
      <NavigationLogger />
      {/* Rest of your app */}
    </Router>
  );
}
```

### API Client Integration

Wrap your API clients to automatically log all requests and responses:

```typescript
import axios from 'axios';
import { loggingService } from '../services/logging.service';

// Create a logged version of axios
const loggedAxios = axios.create({
  baseURL: 'https://api.example.com'
});

// Add request interceptor
loggedAxios.interceptors.request.use(
  async (config) => {
    const requestId = uuidv4();
    
    // Attach the request ID to the request for correlation
    config.headers['X-Request-ID'] = requestId;
    
    // Log the request
    await loggingService.logEvent({
      event_type: 'api',
      event_source: 'api_client',
      action: 'request',
      data: {
        request_id: requestId,
        method: config.method,
        url: config.url,
        params: config.params,
        // Don't log sensitive data in request body
        has_body: !!config.data
      }
    });
    
    // Store the start time for performance measurement
    config.metadata = {
      startTime: performance.now(),
      requestId
    };
    
    return config;
  },
  (error) => {
    loggingService.logError(error, 'ApiClient', { stage: 'request' });
    return Promise.reject(error);
  }
);

// Add response interceptor
loggedAxios.interceptors.response.use(
  async (response) => {
    const { config } = response;
    const duration = performance.now() - config.metadata.startTime;
    
    // Log the successful response
    await loggingService.logEvent({
      event_type: 'api',
      event_source: 'api_client',
      action: 'response',
      data: {
        request_id: config.metadata.requestId,
        method: config.method,
        url: config.url,
        status: response.status,
        duration_ms: duration,
        response_size: JSON.stringify(response.data).length
      }
    });
    
    return response;
  },
  async (error) => {
    if (error.config) {
      const { config } = error;
      const duration = performance.now() - config.metadata.startTime;
      
      // Log the error response
      await loggingService.logEvent({
        event_type: 'api',
        event_source: 'api_client',
        action: 'response_error',
        data: {
          request_id: config.metadata.requestId,
          method: config.method,
          url: config.url,
          status: error.response?.status,
          error_message: error.message,
          duration_ms: duration
        }
      });
    } else {
      // Network error or other error without config
      await loggingService.logError(error, 'ApiClient', { stage: 'response' });
    }
    
    return Promise.reject(error);
  }
);

export default loggedAxios;
```

## Common Use Cases

### Logging Form Submissions

```typescript
import { useLogging } from '../../lib/hooks/useLogging';

const ContactForm = () => {
  const { logFormSubmission } = useLogging();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Log the form submission, excluding sensitive data
    await logFormSubmission('contact_form', {
      has_name: !!formData.name,
      has_email: !!formData.email,
      message_length: formData.message.length
    });
    
    // Process the form submission
    // ...
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### Logging AI/LLM Interactions

```typescript
import { loggingService } from '../services/logging.service';
import { openaiClient } from '../openai-client';

async function generateSuggestions(prompt: string, options = {}) {
  // Log the AI request
  const interactionId = await loggingService.logAIInteraction(
    'generate_suggestions_request',
    {
      model: options.model || 'gpt-4',
      prompt_length: prompt.length,
      prompt_type: 'suggestion_generation',
      options
    }
  );
  
  try {
    const startTime = performance.now();
    
    // Make the AI request
    const response = await openaiClient.chat.completions.create({
      model: options.model || 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 500
    });
    
    const duration = performance.now() - startTime;
    
    // Log the successful AI response
    await loggingService.logAIInteraction(
      'generate_suggestions_response',
      {
        interaction_id: interactionId,
        duration_ms: duration,
        token_usage: response.usage,
        suggestion_count: response.choices.length,
        content_length: response.choices[0]?.message?.content?.length || 0,
        status: 'success'
      }
    );
    
    return response.choices[0]?.message?.content || '';
  } catch (error) {
    // Log the AI error
    await loggingService.logAIInteraction(
      'generate_suggestions_error',
      {
        interaction_id: interactionId,
        error_message: error.message,
        status: 'error'
      }
    );
    
    throw error;
  }
}
```

### Logging User Preferences

```typescript
import { loggingService } from '../services/logging.service';

class PreferenceService {
  async updatePreferences(userId: string, preferences: UserPreferences) {
    try {
      // Log the preference update
      await loggingService.logEvent({
        event_type: 'user_preference',
        event_source: 'preference_service',
        user_id: userId,
        action: 'update_preferences',
        data: {
          preference_types: Object.keys(preferences),
          has_theme: 'theme' in preferences,
          has_notifications: 'notifications' in preferences,
          // Don't log actual values for privacy
        }
      });
      
      // Update preferences in database
      // ...
      
      return { success: true };
    } catch (error) {
      await loggingService.logError(error, 'PreferenceService', {
        method: 'updatePreferences',
        user_id: userId
      });
      
      throw error;
    }
  }
}
```

### Logging Performance Metrics

```typescript
import { loggingService } from '../services/logging.service';

// Create a performance observer
const performanceObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach(async (entry) => {
    // Log the performance entry
    await loggingService.logPerformance(
      entry.name,
      entry.duration,
      'ms',
      {
        entry_type: entry.entryType,
        start_time: entry.startTime,
        // Add additional context for specific metrics
        ...(entry.name.startsWith('api-') ? {
          api_endpoint: entry.name.substring(4)
        } : {})
      }
    );
  });
});

// Start observing different performance metrics
performanceObserver.observe({ entryTypes: ['measure'] });

// Example of measuring and logging performance
export function measurePerformance(operation: string, callback: () => any) {
  const startMark = `${operation}-start`;
  const endMark = `${operation}-end`;
  
  performance.mark(startMark);
  const result = callback();
  performance.mark(endMark);
  
  // Create the performance measure
  performance.measure(operation, startMark, endMark);
  
  return result;
}

// Usage example
measurePerformance('render-component', () => {
  // Component rendering logic
});
```

## Best Practices

### Sensitive Data Handling

1. **Never log sensitive data directly**:
   - Passwords, authentication tokens, API keys
   - Personal identifiable information (PII)
   - Financial information, health records
   - User-generated content without consent

2. **Use data masking techniques**:
   ```typescript
   // Instead of this
   logger.log({userId, email, address, password});
   
   // Do this
   logger.log({
     userId, 
     hasEmail: !!email,
     addressCountry: address?.country,
     // Never log passwords
   });
   ```

3. **Filter sensitive fields**:
   ```typescript
   const sensitiveFields = ['password', 'token', 'key', 'secret', 'ssn', 'credit'];
   
   function filterSensitiveData(data) {
     if (!data) return data;
     
     const filtered = {...data};
     
     Object.keys(filtered).forEach(key => {
       if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
         filtered[key] = '[REDACTED]';
       } else if (typeof filtered[key] === 'object') {
         filtered[key] = filterSensitiveData(filtered[key]);
       }
     });
     
     return filtered;
   }
   
   // Usage
   logger.log(filterSensitiveData(userData));
   ```

### Log Categorization

Correctly categorize logs to enable better filtering and analysis:

1. **Use consistent event types**:
   - `user_action`: User-initiated interactions
   - `system_event`: System-level operations
   - `api`: API calls (both internal and external)
   - `error`: Errors and exceptions
   - `performance`: Performance measurements
   - `ai_interaction`: AI model interactions

2. **Include context information**:
   ```typescript
   await loggingService.logEvent({
     event_type: 'user_action',
     event_source: 'idea_generator',
     component: 'IdeaForm',
     action: 'submit',
     data: { /* action data */ },
     metadata: {
       workflow_step: 'ideation',
       user_role: userRole,
       feature_flags: activeFeatures
     }
   });
   ```

3. **Use hierarchical naming for actions**:
   - `resource.action`: e.g., `idea.create`, `profile.update`
   - `workflow.step`: e.g., `onboarding.step1`, `checkout.payment`

### Batch Logging

For high-frequency events, use batch logging to reduce overhead:

```typescript
class BatchLogger {
  private queue: LogEvent[] = [];
  private maxBatchSize: number;
  private flushInterval: number;
  private timer: NodeJS.Timeout | null = null;
  
  constructor(maxBatchSize = 50, flushIntervalMs = 5000) {
    this.maxBatchSize = maxBatchSize;
    this.flushInterval = flushIntervalMs;
    this.startTimer();
  }
  
  private startTimer() {
    this.timer = setInterval(() => this.flush(), this.flushInterval);
  }
  
  async log(event: LogEvent) {
    this.queue.push(event);
    
    if (this.queue.length >= this.maxBatchSize) {
      await this.flush();
    }
  }
  
  async flush() {
    if (this.queue.length === 0) return;
    
    const batch = [...this.queue];
    this.queue = [];
    
    try {
      await loggingService.batchLog(batch);
    } catch (error) {
      console.error('Error flushing log batch:', error);
      // Re-add critical logs back to the queue
      const criticalLogs = batch.filter(log => log.event_type === 'error' || log.metadata?.critical);
      this.queue.unshift(...criticalLogs);
    }
  }
  
  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.flush(); // Flush remaining logs
  }
}

// Usage
const batchLogger = new BatchLogger();

// In high-frequency component
function TrackMouseMovement() {
  useEffect(() => {
    const handleMouseMove = (e) => {
      batchLogger.log({
        event_type: 'user_action',
        event_source: 'ui',
        action: 'mouse_move',
        data: { x: e.clientX, y: e.clientY }
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return null;
}
```

## Troubleshooting

### Missing Logs

If logs are not appearing as expected:

1. **Check Consent Settings**:
   ```typescript
   // Check if the user has consented to this type of logging
   const hasConsent = await privacyService.checkConsent(userId, 'analytics');
   console.debug('Analytics consent status:', hasConsent);
   ```

2. **Verify Classification**:
   ```typescript
   // Check how data is being classified
   const { classification, retentionPolicy } = await privacyService.classifyData(data);
   console.debug('Data classification:', classification, retentionPolicy);
   ```

3. **Inspect Network Requests**:
   - Check for errors in network requests to logging endpoints
   - Verify batch logging flush events are completing

### Handling Rate Limits

If hitting rate limits with logging services:

```typescript
// Implement exponential backoff
async function logWithBackoff(event, maxRetries = 3) {
  let retries = 0;
  let delay = 1000; // Start with 1 second delay
  
  while (retries < maxRetries) {
    try {
      return await loggingService.logEvent(event);
    } catch (error) {
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        retries++;
        
        if (retries >= maxRetries) throw error;
        
        // Exponential backoff with jitter
        const jitter = Math.random() * 0.3 + 0.85; // 0.85-1.15
        await sleep(delay * jitter);
        
        delay *= 2; // Double the delay for next attempt
      } else {
        throw error; // Not a rate limit error, rethrow
      }
    }
  }
}
```

### Debugging Log Processing

For issues with log processing or model training:

1. **Enable debug mode**:
   ```typescript
   // Set debug mode in your environment variables
   // LOGGING_DEBUG=true
   
   // In your code
   if (process.env.LOGGING_DEBUG === 'true') {
     console.debug('Logging event:', event);
   }
   ```

2. **Add correlation IDs**:
   ```typescript
   const correlationId = uuidv4();
   
   // Add correlation ID to related logs
   await loggingService.logEvent({
     // Other fields...
     metadata: {
       correlation_id: correlationId
     }
   });
   
   // In another part of the code
   await loggingService.logEvent({
     // Other fields...
     metadata: {
       correlation_id: correlationId
     }
   });
   ```

## Performance Considerations

### Minimize Blocking

Use asynchronous, non-blocking logging:

```typescript
// Don't block the UI thread for logging
const handleClick = () => {
  // Trigger logging but don't await it
  loggingService.logUserAction('button_click', { id: buttonId })
    .catch(err => console.error('Logging error:', err));
  
  // Continue with user action immediately
  navigate('/next-page');
};
```

### Use Sampling for High-Volume Events

For high-volume events, implement sampling:

```typescript
function shouldSampleEvent(eventName, samplingRate = 0.1) {
  // Always log errors and critical events
  if (eventName.includes('error') || eventName.includes('critical')) {
    return true;
  }
  
  // Sample other high-volume events
  return Math.random() < samplingRate;
}

// Usage
if (shouldSampleEvent('mouse_move', 0.05)) {
  loggingService.logEvent({
    event_type: 'user_action',
    action: 'mouse_move',
    // ...
  });
}
```

### Optimize Payload Size

Minimize the size of logged data:

```typescript
// Trim large objects before logging
function trimLargeObject(obj, maxDepth = 3, currentDepth = 0) {
  if (currentDepth >= maxDepth) return '[Truncated]';
  
  if (Array.isArray(obj)) {
    if (obj.length > 10) {
      return obj.slice(0, 10).map(item => 
        typeof item === 'object' && item !== null
          ? trimLargeObject(item, maxDepth, currentDepth + 1)
          : item
      ).concat([`... and ${obj.length - 10} more items`]);
    }
    
    return obj.map(item => 
      typeof item === 'object' && item !== null
        ? trimLargeObject(item, maxDepth, currentDepth + 1)
        : item
    );
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = typeof value === 'object' && value !== null
        ? trimLargeObject(value, maxDepth, currentDepth + 1)
        : value;
    }
    return result;
  }
  
  return obj;
}

// Usage
loggingService.logEvent({
  // ...
  data: trimLargeObject(largeData)
});
```

### Load Testing

Test your logging system under load:

```typescript
// Simple load test function
async function loadTestLogging(events = 1000, concurrency = 10) {
  console.time('loadTestLogging');
  
  const batches = [];
  for (let i = 0; i < events / concurrency; i++) {
    const batch = [];
    for (let j = 0; j < concurrency; j++) {
      batch.push(loggingService.logEvent({
        event_type: 'test',
        event_source: 'load_test',
        action: 'test_event',
        data: {
          test_id: i * concurrency + j,
          timestamp: Date.now()
        }
      }));
    }
    batches.push(Promise.all(batch));
  }
  
  await Promise.all(batches);
  console.timeEnd('loadTestLogging');
}
```

### Offline Logging

Implement offline logging for mobile or unreliable connections:

```typescript
class OfflineLogger {
  private storageKey = 'offline_logs';
  private syncing = false;
  
  constructor() {
    // Try to sync logs when coming back online
    window.addEventListener('online', () => this.syncLogs());
  }
  
  async log(event) {
    if (navigator.onLine) {
      // Online, log directly
      return loggingService.logEvent(event);
    } else {
      // Offline, store the log
      this.storeLog(event);
      return Promise.resolve();
    }
  }
  
  private storeLog(event) {
    try {
      const storedLogs = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      storedLogs.push({
        ...event,
        stored_at: Date.now()
      });
      
      // Cap the number of stored logs to prevent storage overflow
      if (storedLogs.length > 1000) {
        storedLogs.shift(); // Remove oldest log
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(storedLogs));
    } catch (error) {
      console.error('Error storing offline log:', error);
    }
  }
  
  async syncLogs() {
    if (this.syncing || !navigator.onLine) return;
    
    this.syncing = true;
    
    try {
      const storedLogs = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      
      if (storedLogs.length === 0) {
        this.syncing = false;
        return;
      }
      
      // Process logs in batches
      while (storedLogs.length > 0) {
        const batch = storedLogs.splice(0, 50);
        await loggingService.batchLog(batch);
      }
      
      // Clear the stored logs
      localStorage.setItem(this.storageKey, '[]');
    } catch (error) {
      console.error('Error syncing offline logs:', error);
    } finally {
      this.syncing = false;
    }
  }
}

// Usage
const offlineLogger = new OfflineLogger();
offlineLogger.log({
  event_type: 'user_action',
  action: 'button_click',
  // ...
});
```

By following these implementation guidelines, you can effectively integrate the Comprehensive Logging System throughout your application while maintaining high performance and respecting user privacy.
