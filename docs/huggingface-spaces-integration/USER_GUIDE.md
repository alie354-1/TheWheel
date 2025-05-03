# Hugging Face Spaces Integration: User Guide

This guide explains how to set up and use Hugging Face Spaces with your application, allowing you to leverage custom deployed LLM models.

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Setting Up Your Hugging Face Space](#setting-up-your-hugging-face-space)
4. [Configuring the Application](#configuring-the-application)
5. [Multi-Tier Space Configuration](#multi-tier-space-configuration)
6. [Testing Your Configuration](#testing-your-configuration)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## Introduction

Hugging Face Spaces lets you deploy machine learning models in a serverless environment. This integration enables you to:

- Use your own custom-trained language models
- Maintain full control over your model and prompts
- Implement custom logic for specialized use cases
- Keep your data private within your own infrastructure
- Scale based on your needs with Hugging Face's platform

## Getting Started

### Prerequisites

- A Hugging Face account ([Sign up here](https://huggingface.co/join))
- At least one Hugging Face Space set up with an LLM
- Database migration for Hugging Face Spaces completed

### Running the Migration

Before you can use Hugging Face Spaces, you need to run the migration script that sets up the necessary database entries:

```bash
node scripts/run-huggingface-spaces-migration.js
```

This only needs to be done once. The script will create the required settings entries in your database.

---

## Setting Up Your Hugging Face Space

### Creating a Space

1. Log in to your [Hugging Face account](https://huggingface.co/login)
2. Go to your profile page
3. Click on "New" and select "Space"
4. Choose a suitable template (e.g., Gradio, Streamlit, or Docker)
5. Name your Space and set it to Public or Private as needed
6. Clone the repository and add your code

### Required API Format

Your Space needs to expose an API endpoint that follows this format:

#### Request

```json
{
  "inputs": "Your prompt text here",
  "parameters": {
    "max_new_tokens": 100,
    "temperature": 0.7
  }
}
```

#### Response

```json
{
  "generated_text": "The model's response text"
}
```

### Sample Space Implementation

Here's a minimal example of a Gradio Space that implements the required API:

```python
import gradio as gr
from transformers import pipeline

# Initialize the model
generator = pipeline('text-generation', model='gpt2')

def generate_text(inputs, max_new_tokens=100, temperature=0.7):
    generated = generator(inputs, max_new_tokens=max_new_tokens, temperature=temperature)
    return {"generated_text": generated[0]["generated_text"]}

# Create a Gradio API interface
gr.Interface.load("huggingface/gpt2",
                  inputs=["text", gr.Slider(0, 100), gr.Slider(0, 1)],
                  outputs="text").launch()

# Create the API endpoint
app = gr.mount_gradio_app(app, gr.routes.App(generate_text), path="/api/generate")
```

### Space URL Formats

Your Space will have a URL in one of these formats:
- `https://huggingface.co/spaces/username/space-name`
- `https://username-space-name.hf.space`

Both are compatible with this integration.

---

## Configuring the Application

### Enabling the Feature

1. Navigate to Settings > Features > AI Providers
2. Enable the "Hugging Face Spaces" toggle
3. Save changes

### Setting Up Space Configuration

1. Go to Settings > Integrations > Hugging Face Spaces Settings
2. Toggle "Enable Hugging Face Spaces" to turn on the integration
3. Choose a default tier (usually "Base Model")
4. Configure at least one Space:
   - Enter the Space URL (e.g., `https://username-space-name.hf.space`)
   - Set the API endpoint (default: `/api/generate`)
   - Optionally add an authentication token for private Spaces
   - Optionally specify a model version/revision for tracking purposes
5. Click "Test Connection" to verify your Space is working
6. Save settings

### Authentication for Private Spaces

If your Space is private, you'll need to provide an authentication token:

1. Go to your [Hugging Face settings page](https://huggingface.co/settings/tokens)
2. Create a new access token with at least "read" permissions
3. Copy the token and paste it in the "Authentication Token" field for your Space configuration

---

## Multi-Tier Space Configuration

The application supports four tiers of Spaces:

1. **Base Model**: General-purpose model used as the default
2. **Company Model**: Model fine-tuned for company-specific use cases
3. **Abstraction Model**: Specialized model for abstract reasoning tasks
4. **User Model**: Personalized model for individual users

You can configure any or all of these tiers with different Spaces, allowing for specialized models optimized for different tasks.

### When to Use Multiple Tiers

- **Base Model**: Use for general queries and fallback
- **Company Model**: Use for company-specific knowledge and terminology
- **Abstraction Model**: Use for complex reasoning, planning, and strategic thinking
- **User Model**: Use for personalized responses tailored to individual users

### Switching Between Tiers

The application will automatically use the default tier specified in settings. However, you can also switch tiers programmatically using the Hugging Face Spaces client:

```typescript
import huggingFaceSpacesClient from '../lib/huggingface-spaces-client';

// Use the base model (default)
const response = await huggingFaceSpacesClient.generate("Your prompt", "base");

// Use the company model for company-specific knowledge
const companyResponse = await huggingFaceSpacesClient.generate("Your prompt", "company");
```

---

## Testing Your Configuration

### Manual Testing

After setting up your Space configuration:

1. Go to Settings > Integrations > Hugging Face Spaces Settings
2. Click "Test Connection" for each configured Space
3. Check for a successful connection message

### Using the Test Script

We provide a diagnostic script that tests your entire Hugging Face Spaces configuration:

```bash
node scripts/test-huggingface-spaces-connection.js
```

This script:
- Verifies database settings
- Checks feature flag status
- Tests connection to each configured Space
- Provides detailed feedback

### Testing in the Application

To test if the integration is working in your application:

1. Enable the Hugging Face Spaces feature flag
2. Navigate to a feature that uses AI (like the Idea Playground)
3. Try generating content - it should now use your configured Space

---

## Troubleshooting

If you encounter issues with your Hugging Face Spaces integration, check the following:

1. Verify your Space is online (free Spaces pause after inactivity)
2. Ensure the Space URL is correct and the Space is publicly accessible
3. Check that your Space API follows the expected request/response format
4. Test the connection directly using the test script
5. Look for error messages in the browser console or server logs

For more detailed troubleshooting, see the [Troubleshooting Guide](./TROUBLESHOOTING.md).

---

## Best Practices

### Performance Optimization

1. Use the smallest model that meets your needs to reduce latency
2. Consider a paid Hugging Face plan for better performance and reliability
3. Implement client-side caching for frequently requested responses
4. Keep prompts concise and specific

### Space Implementation Tips

1. Use a model optimized for your specific use case
2. Set reasonable token limits to prevent excessive resource usage
3. Log requests for monitoring and debugging
4. Implement error handling in your Space
5. Consider implementing fallbacks for model failures

### Security Considerations

1. Use private Spaces for sensitive applications
2. Implement authentication for your Space API
3. Regularly rotate authentication tokens
4. Validate and sanitize inputs to prevent prompt injection
5. Consider CORS settings if your Space will be accessed from specific domains

### Model Deployment Strategies

1. Use staging Spaces for testing before production
2. Implement versioning in your Space URLs (e.g., `/v1/generate`)
3. Consider A/B testing between different models
4. Monitor usage and performance to determine when to scale

---

## Advanced Usage

### Structured Generation

For generating structured data like JSON:

```typescript
// Define the structure you want
const schema = {
  title: "string",
  description: "string",
  pros: "string[]",
  cons: "string[]"
};

// Generate structured output
const result = await huggingFaceSpacesClient.generateStructure(
  "Create a product idea for a smart garden device", 
  schema
);

// result will be a typed object matching the schema
console.log(result.title);
console.log(result.pros);
```

### Generating Multiple Variations

To generate multiple different responses to the same prompt:

```typescript
const variations = await huggingFaceSpacesClient.generateVariations(
  "Create a product slogan for an eco-friendly water bottle",
  3,  // Number of variations to generate
  "company"  // Use the company model
);

// variations will be an array of strings
variations.forEach((slogan, index) => {
  console.log(`Slogan ${index + 1}: ${slogan}`);
});
```

### Adding Context

To provide additional context for generation:

```typescript
const context = {
  industry: "healthcare",
  targetAudience: "medical professionals",
  key_features: ["portable", "sterilizable", "long battery life"]
};

const response = await huggingFaceSpacesClient.generate(
  "Create a product description", 
  "base",
  context
);
```

## Further Resources

- [Hugging Face Spaces Documentation](https://huggingface.co/docs/hub/spaces-overview)
- [API Endpoints Guide](https://huggingface.co/docs/api-inference/quicktour)
- [Transformers Documentation](https://huggingface.co/docs/transformers/index)
- [Gradio Documentation](https://www.gradio.app/docs)
