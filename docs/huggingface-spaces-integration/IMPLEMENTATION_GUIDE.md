# Implementation Guide: Hugging Face Spaces Triple LLM

This document provides step-by-step instructions for implementing the Hugging Face Spaces Triple LLM system in our application.

## Prerequisites

- Hugging Face account with API access
- Access to our application's codebase
- Basic understanding of TypeScript and React
- Familiarity with our existing LLM implementation

## Step 1: Create Required Types

Create a new file: `src/types/huggingface.types.ts`

```typescript
export interface HuggingFaceSpaceResponse {
  generated_text: string;
  model_version?: string;
  generation_time?: number;
  error?: string;
}

export interface HuggingFaceModelInfo {
  modelId: string;
  version: string;
  description: string;
  metrics?: Record<string, any>;
}
```

## Step 2: Implement Hugging Face Client

Create a new file: `src/lib/huggingface-client.ts`

```typescript
import { HuggingFaceSpaceResponse } from '../types/huggingface.types';

// Initialize the HuggingFace client with API key from environment variables
const huggingface = {
  apiKey: import.meta.env.VITE_HUGGINGFACE_API_KEY,
  organization: import.meta.env.VITE_HUGGINGFACE_ORG || 'your-company-org',
  
  // Space names
  spaces: {
    base: import.meta.env.VITE_HF_BASE_SPACE || 'company-base-llm',
    company: import.meta.env.VITE_HF_COMPANY_SPACE || 'company-specific-llm',
    abstraction: import.meta.env.VITE_HF_ABSTRACTION_SPACE || 'company-abstraction-llm'
  },
  
  // Generate text using a Space endpoint
  async generate(spaceName: string, prompt: string, params = {}): Promise<HuggingFaceSpaceResponse> {
    try {
      const orgPrefix = this.organization ? `${this.organization}/` : '';
      const url = `https://huggingface.co/spaces/${orgPrefix}${spaceName}/api/generate`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, params })
      });
      
      if (!response.ok) {
        throw new Error(`Space API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('HuggingFace client error:', error);
      return {
        generated_text: '',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

export default huggingface;
```

## Step 3: Create Hugging Face LLM Service Implementation

Create a new file: `src/lib/services/huggingface-llm.service.ts`

```typescript
import huggingface from '../huggingface-client';
import { supabase } from '../supabase';
import { loggingService } from './logging.service';
import { QueryContext, GeneralLLMService } from './general-llm.service';
import { useAuthStore } from '../store';

export class HuggingFaceGeneralLLMService implements GeneralLLMService {
  async query(input: string, context: QueryContext): Promise<any> {
    const startTime = Date.now();
    
    // Log the AI interaction start
    const interactionId = await loggingService.logAIInteraction(
      'query_start',
      {
        model: "huggingface-spaces",
        input_text: input,
        context_type: context.context || 'general',
        user_id: context.userId,
        company_id: context.companyId,
        features: {
          useCompanyModel: context.useCompanyModel || false,
          useAbstraction: context.useAbstraction || false,
          useExistingModels: context.useExistingModels || false
        }
      }
    );
    
    try {
      // Get the feature flags for Hugging Face
      const { featureFlags } = useAuthStore.getState();
      
      // Determine which Space to use based on context and feature flags
      let spaceName = huggingface.spaces.base;
      
      if (context.useCompanyModel && featureFlags.useHFCompanyModel?.enabled) {
        spaceName = huggingface.spaces.company;
      } else if (context.useAbstraction && featureFlags.useHFAbstractionModel?.enabled) {
        spaceName = huggingface.spaces.abstraction;
      } else if (!featureFlags.useHFBaseModel?.enabled) {
        // Fallback to OpenAI if no Hugging Face models are enabled
        throw new Error('No Hugging Face models are enabled');
      }
      
      // Prepare parameters for the Space
      const params = {
        max_length: 1024,
        temperature: context.temperature || 0.7
      };
      
      // Add context-specific parameters
      if (context.useCompanyModel && context.companyId) {
        Object.assign(params, {
          context: JSON.stringify({
            company_id: context.companyId
          })
        });
      }
      
      // Add conversation history if available
      if (context.conversationHistory?.length > 0) {
        const formattedHistory = context.conversationHistory
          .map(msg => `${msg.role}: ${msg.content}`)
          .join('\n');
          
        Object.assign(params, {
          conversation_history: formattedHistory
        });
      }
      
      // Call the Hugging Face Space
      const response = await huggingface.generate(spaceName, input, params);
      
      const duration = Date.now() - startTime;
      
      // Log successful interaction
      await loggingService.logAIInteraction(
        'query_complete',
        {
          interaction_id: interactionId,
          model: "huggingface-spaces",
          space_name: spaceName,
          input_text: input,
          output_text: response.generated_text,
          duration_ms: duration,
          status: 'success'
        }
      );
      
      // Return in the format expected by the system
      return {
        content: response.generated_text,
        role: 'assistant'
      };
    } catch (error) {
      console.error('Error in Hugging Face LLM query:', error);
      
      // Log error
      await loggingService.logAIInteraction(
        'query_error',
        {
          interaction_id: interactionId,
          model: "huggingface-spaces",
          input_text: input,
          error_message: error instanceof Error ? error.message : String(error),
          duration_ms: Date.now() - startTime,
          status: 'error'
        }
      );
      
      throw error;
    }
  }
}

export const huggingFaceLLMService = new HuggingFaceGeneralLLMService();
```

## Step 4: Update Feature Flags

Update the default feature flags in `src/lib/store.ts`:

```typescript
const defaultFeatureFlags: FeatureFlags = {
  // Existing flags...
  
  // LLM Provider flags
  useOpenAI: { enabled: true, visible: true },
  useHuggingFaceSpaces: { enabled: false, visible: true },
  
  // Hugging Face specific flags
  useHFBaseModel: { enabled: true, visible: true },
  useHFCompanyModel: { enabled: false, visible: true },
  useHFAbstractionModel: { enabled: false, visible: true }
};
```

## Step 5: Update LLM Service Factory

Modify `src/lib/services/general-llm.service.ts` to include the Hugging Face service:

```typescript
// Import the Hugging Face service
import { huggingFaceLLMService } from './huggingface-llm.service';

// Update the getLLMService function
const getLLMService = (): GeneralLLMService => {
  const { featureFlags } = useAuthStore.getState();
  
  console.log('Feature flags state:', {
    useRealAI: featureFlags.useRealAI?.enabled,
    useMockAI: featureFlags.useMockAI?.enabled,
    useHuggingFaceSpaces: featureFlags.useHuggingFaceSpaces?.enabled,
    useMultiTieredAI: featureFlags.useMultiTieredAI?.enabled
  });
  
  // Check if Hugging Face should be used - highest priority
  if (featureFlags.useHuggingFaceSpaces?.enabled) {
    console.log('Using Hugging Face Spaces LLM Service');
    try {
      return huggingFaceLLMService;
    } catch (error) {
      console.error('Error initializing Hugging Face service:', error);
      // Continue to fallback options
    }
  }
  
  // Existing OpenAI logic
  if (featureFlags.useRealAI?.enabled) {
    // Your existing code for real OpenAI vs. mock
    // ...
  }
  
  // Mock service is the ultimate fallback
  console.log('Using Mock General LLM Service');
  return mockGeneralLLMService;
};
```

## Step 6: Add Feature Flag Group to FeatureFlagsSettings Component

Update the `featureGroups` array in `src/components/admin/FeatureFlagsSettings.tsx`:

```typescript
const featureGroups: FeatureGroup[] = [
  // Existing groups...
  
  {
    name: 'LLM Providers',
    description: 'Control which LLM providers are used',
    features: [
      { 
        key: 'useOpenAI', 
        name: 'Use OpenAI', 
        description: 'Use OpenAI for LLM capabilities' 
      },
      { 
        key: 'useHuggingFaceSpaces', 
        name: 'Use Hugging Face Spaces', 
        description: 'Use Hugging Face Spaces for LLM capabilities' 
      },
      { 
        key: 'useHFBaseModel', 
        name: 'Use HF Base Model', 
        description: 'Use base model in triple LLM implementation' 
      },
      { 
        key: 'useHFCompanyModel', 
        name: 'Use HF Company Model', 
        description: 'Use company-specific model in triple LLM implementation' 
      },
      { 
        key: 'useHFAbstractionModel', 
        name: 'Use HF Abstraction Model', 
        description: 'Use abstraction model in triple LLM implementation' 
      }
    ]
  }
];
```

## Step 7: Update Environment Variables

Add the following environment variables to your `.env` file:

```
# Hugging Face Configuration
VITE_HUGGINGFACE_API_KEY=your-huggingface-key
VITE_HUGGINGFACE_ORG=your-company-name

# Space names (optional - defaults are defined in the client)
VITE_HF_BASE_SPACE=company-base-llm
VITE_HF_COMPANY_SPACE=company-specific-llm
VITE_HF_ABSTRACTION_SPACE=company-abstraction-llm
```

## Step 8: Add Database Schema Changes

Create a migration file for the necessary database schema changes:

```sql
-- Add Hugging Face specific columns to model_registry
ALTER TABLE model_registry ADD COLUMN IF NOT EXISTS hf_space_url TEXT;
ALTER TABLE model_registry ADD COLUMN IF NOT EXISTS hf_model_id TEXT;
ALTER TABLE model_registry ADD COLUMN IF NOT EXISTS hf_space_id TEXT;

-- Add a new table for Space configurations
CREATE TABLE IF NOT EXISTS hf_spaces_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_name TEXT NOT NULL,
  space_type TEXT NOT NULL, -- 'base', 'company', 'abstraction'
  api_endpoint TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  model_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for tracking Space deployments
CREATE TABLE IF NOT EXISTS hf_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES hf_spaces_config(id),
  model_id UUID REFERENCES model_registry(id),
  deployment_status TEXT NOT NULL,
  deployment_logs TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Step 9: Set Up Model Training Service Interface

Extend the model training service to support Hugging Face training:

```typescript
// Add these methods to the ModelTrainingService class in src/lib/services/model-training.service.ts

/**
 * Push a trained model to Hugging Face Model Hub
 * @param modelId The ID of the model in the local registry
 * @param options Options for pushing to Hugging Face
 * @returns The Hugging Face Model ID
 */
async pushToHuggingFace(
  modelId: string,
  options: {
    hfRepoName?: string;
    description?: string;
    tags?: string[];
  } = {}
): Promise<string | null> {
  try {
    // Get the model from the registry
    const model = await this.getModel(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }
    
    // Use the model's name if no repo name is provided
    const repoName = options.hfRepoName || `${model.model_name.toLowerCase().replace(/\s+/g, '-')}`;
    
    // Log the push attempt
    loggingService.logEvent({
      event_type: 'model_training',
      event_source: 'huggingface',
      action: 'push_model_attempt',
      data: {
        model_id: modelId,
        model_name: model.model_name,
        hf_repo_name: repoName
      }
    });
    
    // In a real implementation, you would use the Hugging Face JS SDK or API
    // to push the model files to the Model Hub
    
    // Update the model registry with the Hugging Face information
    const { error } = await supabase
      .from('model_registry')
      .update({
        hf_model_id: repoName
      })
      .eq('id', modelId);
    
    if (error) {
      throw error;
    }
    
    // Log successful push
    loggingService.logEvent({
      event_type: 'model_training',
      event_source: 'huggingface',
      action: 'push_model_success',
      data: {
        model_id: modelId,
        model_name: model.model_name,
        hf_repo_name: repoName
      }
    });
    
    return repoName;
  } catch (error) {
    console.error('Error pushing model to Hugging Face:', error);
    loggingService.logError(
      error instanceof Error ? error : new Error(String(error)),
      'ModelTrainingService',
      {
        method: 'pushToHuggingFace',
        modelId
      }
    );
    return null;
  }
}

/**
 * Deploy a model to a Hugging Face Space
 * @param modelId The ID of the model in the local registry
 * @param spaceId The ID of the Hugging Face Space
 * @returns Whether the deployment was successful
 */
async deployToSpace(
  modelId: string,
  spaceId: string
): Promise<boolean> {
  try {
    // Get the model and space information
    const model = await this.getModel(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }
    
    const { data: spaceConfig, error: spaceError } = await supabase
      .from('hf_spaces_config')
      .select('*')
      .eq('id', spaceId)
      .single();
    
    if (spaceError || !spaceConfig) {
      throw new Error(`Space not found: ${spaceId}`);
    }
    
    // Log the deployment attempt
    loggingService.logEvent({
      event_type: 'model_training',
      event_source: 'huggingface',
      action: 'deploy_model_attempt',
      data: {
        model_id: modelId,
        model_name: model.model_name,
        space_id: spaceId,
        space_name: spaceConfig.space_name
      }
    });
    
    // Create a deployment record
    const { data: deployment, error: deploymentError } = await supabase
      .from('hf_deployments')
      .insert({
        space_id: spaceId,
        model_id: modelId,
        deployment_status: 'in_progress'
      })
      .select()
      .single();
    
    if (deploymentError || !deployment) {
      throw new Error('Failed to create deployment record');
    }
    
    // In a real implementation, you would use the Hugging Face API
    // to update the Space with the new model
    
    // Update the deployment record
    const { error: updateError } = await supabase
      .from('hf_deployments')
      .update({
        deployment_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', deployment.id);
    
    if (updateError) {
      throw updateError;
    }
    
    // Log successful deployment
    loggingService.logEvent({
      event_type: 'model_training',
      event_source: 'huggingface',
      action: 'deploy_model_success',
      data: {
        model_id: modelId,
        model_name: model.model_name,
        space_id: spaceId,
        space_name: spaceConfig.space_name,
        deployment_id: deployment.id
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error deploying model to Space:', error);
    loggingService.logError(
      error instanceof Error ? error : new Error(String(error)),
      'ModelTrainingService',
      {
        method: 'deployToSpace',
        modelId,
        spaceId
      }
    );
    return false;
  }
}
```

## Testing the Implementation

1. Set up your Hugging Face Spaces following the [Space Setup Guide](./SPACE_SETUP_GUIDE.md)
2. Add the necessary environment variables
3. Implement the code changes described in this guide
4. Use the admin interface to enable Hugging Face feature flags
5. Test the implementation with simple queries first
6. Gradually test more complex scenarios and all three tiers
7. Monitor logs for any errors or performance issues

## Troubleshooting

- **Authentication Issues**: Ensure your Hugging Face API key is correctly set in the environment variables
- **Space Not Found**: Verify the Space names in your environment variables match your actual Spaces
- **Rate Limiting**: Check if you're hitting Hugging Face API rate limits
- **Response Parsing**: Ensure your Spaces return responses in the expected format
- **Feature Flags**: Confirm the correct feature flags are enabled in the admin interface
