# Comprehensive Logging System

This directory contains documentation for the Comprehensive Logging System, which is designed to track all user interactions, AI operations, and system events to provide data for model training.

## Key Features

- **Extensive Event Logging**: Track user actions, AI interactions, API requests/responses, and system events
- **Privacy Controls**: Provide user consent management, data anonymization, and privacy request handling
- **Model Training Pipeline**: Extract features from logs, train models, and collect feedback for continuous improvement
- **Data Classification**: Automatically classify and handle data based on sensitivity
- **Retention Policies**: Apply automated data retention policies based on data classification

## Documentation Index

1. [Overview](./OVERVIEW.md) - High-level overview of the logging system
2. [Requirements](./REQUIREMENTS.md) - Detailed requirements for the system
3. [Technical Architecture](./TECHNICAL_ARCHITECTURE.md) - Architecture diagram and component descriptions
4. [Implementation Plan](./IMPLEMENTATION_PLAN.md) - Step-by-step implementation guide
5. [User Guide](./USER_GUIDE.md) - How to use the logging system in your code
6. [Compliance](./COMPLIANCE.md) - Overview of privacy and regulatory compliance features
7. [Data Modeling](./DATA_MODELING.md) - Database schema and data flow

## Quick Start

### Setting Up The System

1. Run the database migration:
   ```bash
   ./scripts/run-comprehensive-logging-migration.js
   ```

2. Import the logging service in your component:
   ```typescript
   import { loggingService } from '../lib/services/logging.service';
   ```

3. Log events throughout your application:
   ```typescript
   // Log a user action
   loggingService.logUserAction(
     'button_click',
     'MainNavigation',
     { button_id: 'dashboard', page: 'home' }
   );

   // Log an AI interaction
   loggingService.logAIInteraction(
     'generate_content',
     {
       model: 'gpt-4',
       prompt: 'Generate ideas for new feature',
       response: 'Here are some ideas...',
       tokens: 150
     }
   );

   // Log an error
   loggingService.logError(
     new Error('Something went wrong'),
     'DataLoader'
   );
   ```

### Testing the System

Run the test script to verify your system is working correctly:

```bash
./scripts/run-logging-test.js
```

### Training Models with Log Data

Extract features and train models:

```typescript
import { modelTrainingService } from '../lib/services/model-training.service';

// Extract features from the last 30 days of user behavior logs
const featureIds = await modelTrainingService.extractFeatures(
  'user_behavior',
  {
    startDate: '2025-02-15T00:00:00Z',
    endDate: '2025-03-16T00:00:00Z'
  }
);

// Register a trained model
const modelId = await modelTrainingService.registerModel({
  model_name: 'user_behavior_predictor',
  model_type: 'classifier',
  model_version: '1.0.0',
  model_description: 'Predicts user behavior based on past actions',
  feature_sets: featureIds,
  is_active: true
});
```

## Privacy Features

The system provides several privacy features:

- User consent management for different data uses
- Data anonymization and pseudonymization capabilities
- Privacy request handling (export, deletion, etc.)
- Automatic data classification and retention policies

## Key Components

- `LoggingService`: Central service for logging all events
- `PrivacyService`: Handles consent, anonymization, and privacy requests
- `ModelTrainingService`: Extracts features from logs for model training

## Database Schema

The system creates several tables:

- `system_logs`: Stores all log events
- `logging_sessions`: Tracks user sessions
- `consent_settings`: Stores user consent preferences
- `privacy_requests`: Manages user privacy requests
- `classification_rules`: Defines data classification rules
- `retention_policies`: Defines data retention policies
- `extracted_features`: Stores features extracted from logs
- `model_registry`: Tracks trained models
- `model_feedback`: Stores feedback on model predictions

## Contributing

When extending the logging system:

1. Update the database schema as needed in `supabase/migrations`
2. Add new types to `src/lib/types/logging.types.ts`
3. Extend the services in `src/lib/services/`
4. Update the documentation in this directory
