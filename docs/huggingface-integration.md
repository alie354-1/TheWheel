# Hugging Face LLM Microservice Integration

This document explains how the Wheel99 application integrates with the Hugging Face LLM microservice for AI capabilities.

## Overview

The Hugging Face LLM microservice provides an alternative to OpenAI for generating AI responses within the application. It offers:

1. **Multi-model support**:
   - Base Model for general requests
   - Company-specific Model fine-tuned with company data
   - Abstraction Model trained on business patterns

2. **Comprehensive logging** with the existing logging system
3. **UI controls** for enabling/disabling the service and specific models
4. **Seamless integration** with the existing application architecture

## Configuration

### Environment Variables

Add the following to your `.env` file:

```
# Hugging Face LLM Microservice URL
VITE_LLM_SERVICE_URL=http://localhost:3001/api

# Optional: Set these to true to enable by default
VITE_USE_HUGGINGFACE=false
VITE_USE_HF_COMPANY_MODEL=false
VITE_USE_HF_ABSTRACTION_MODEL=false
```

### Feature Flags

The following feature flags control the Hugging Face integration:

- `useHuggingFace`: Enables/disables the Hugging Face LLM microservice
- `useHFCompanyModel`: Uses the company-specific fine-tuned model
- `useHFAbstractionModel`: Uses the abstraction model trained on business patterns

These can be toggled in the Settings UI or programmatically:

```typescript
import { useAuthStore } from '../lib/store';

// Get the store and set feature flags
const { setFeatureFlags } = useAuthStore();

// Enable Hugging Face
setFeatureFlags({
  useHuggingFace: { enabled: true, visible: true }
});

// After changing providers, reset the service to apply changes
import { resetGeneralLLMService } from '../lib/services/general-llm.service';
resetGeneralLLMService();
```

## Architecture

### Client

The `huggingface-client.ts` file provides a client for the LLM microservice API:

```typescript
import huggingFaceClient from '../lib/huggingface-client';

// Generate text
const response = await huggingFaceClient.generate(
  'Generate a business idea for a tech startup',
  'base', // 'base', 'company', or 'abstraction'
  { companyId: 'company-123' }, // Optional context
  { temperature: 0.7 } // Optional parameters
);

console.log(response.generated_text);
```

### Service Implementation

The `huggingface-llm.service.ts` file implements the `GeneralLLMService` interface, making it compatible with the existing AI service layer:

```typescript
import { generalLLMService } from '../lib/services/general-llm.service';

// Use the service through the existing interface
const response = await generalLLMService.query(
  'Generate a business idea',
  {
    userId: 'user-123',
    companyId: 'company-456',
    useCompanyModel: true // Use the company-specific model
  }
);
```

### UI Component

The `LLMProviderSettings.tsx` component provides a user interface for toggling between OpenAI and Hugging Face, and selecting which specialized models to use.

## Starting the LLM Microservice

Before enabling the Hugging Face integration in the application, you need to start the LLM microservice:

1. Navigate to the LLM service directory
2. Run `npm start` to start the service
3. The service should be running at `http://localhost:3001`

## Troubleshooting

If you experience issues with the Hugging Face integration:

1. Check that the LLM microservice is running
2. Verify the `VITE_LLM_SERVICE_URL` environment variable is set correctly
3. Look for errors in the browser console
4. Check the server logs for the LLM microservice

## Using Multiple Models

The Hugging Face integration allows using different models for different scenarios:

- **Base Model**: Good for general questions and responses
- **Company Model**: Best for company-specific questions that require context about your business
- **Abstraction Model**: Useful for identifying business patterns and applying them to your specific scenario

You can select which model to use in the settings UI or by setting the appropriate context parameters when calling the service.
