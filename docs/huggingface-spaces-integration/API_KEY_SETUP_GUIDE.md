# Hugging Face API Key Setup Guide

This guide will help you properly set up a working Hugging Face API key for use in the application.

## Overview

The application can use either OpenAI or Hugging Face as the AI provider. Using Hugging Face requires:
1. A valid Hugging Face account
2. A correctly configured API key with the right permissions
3. Access to the models you want to use

## Creating a New API Key

Your current API key (`hf_HoW01cEmvCFamyyHQCiPwWTgiNqVhajikp`) is failing authentication. Let's create a new one:

1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Sign in to your Hugging Face account if you're not already logged in
3. Under "User Access Tokens", click "New token"
4. Configure the token with these settings:
   - **Name**: `Wheel99 Application` (or any name you prefer)
   - **Role**: Select "Write" role (this includes read permissions plus ability to create model repos)
   - **Expiration**: Choose a suitable expiration period (e.g., 30 days)
5. Click "Generate a token"
6. **Important**: Copy the token immediately - you won't be able to see it again!

## Configuring the Application

1. Go to "Settings" in the application
2. Select the "Integrations" tab
3. In the Hugging Face Settings section:
   - Enter your new API key
   - Check the "Enable Hugging Face" box if you want to use it as your primary AI provider
   - Configure model IDs for each tier (or leave the default suggestions)
   - Click "Test Connection" to verify your key works
   - Save the settings

## Model Configuration

For optimal results, configure these models (or alternatives if you prefer):

- **Base Model**: `mistralai/Mistral-7B-Instruct-v0.2` (default, general usage)
- **Company Model**: `meta-llama/Llama-2-13b-chat-hf` (business context)
- **Abstraction Model**: `google/flan-t5-xxl` (concept abstraction)

## Troubleshooting

If you encounter API key issues:

1. **Verify Token Format**: All Hugging Face tokens start with "hf_"
2. **Check Key Permissions**: Make sure you selected at least "Read" role when creating the token
3. **Verify Token Status**: Go to Hugging Face Settings to confirm the token is active
4. **Model Access**: Some models like Llama-2 require special access - make sure your account has permission
5. **Generate New Token**: If problems persist, revoke the old token and generate a new one

## Advanced Testing

The application includes diagnostic tools to help troubleshoot Hugging Face integration:

```bash
# Test API key directly with Hugging Face API
node scripts/key-validator.js YOUR_API_KEY

# Test specific models
node scripts/test-huggingface-api-key-direct.js YOUR_API_KEY mistralai/Mistral-7B-Instruct-v0.2
```

## Important Notes

- Hugging Face has rate limits for free accounts that may affect performance
- Some models require specific format for prompts - check the model card for details
- Model download time can be significant for first-time use

## Support

If you continue to have issues with Hugging Face integration:
1. Verify your account is in good standing at [Hugging Face](https://huggingface.co/)
2. Check the Hugging Face status page for service disruptions
3. Consider using a different model that you know your account has access to
