# Hugging Face Spaces Integration Troubleshooting Guide

## Common Issues

### 1. Connection Failing with 404 Not Found

If you're seeing a 404 Not Found error when trying to connect to your Hugging Face Space, it could be due to:

- Incorrect Space URL format
- Wrong API endpoint path
- Space is paused or offline

### 2. Authentication Issues (401 Unauthorized)

If you're seeing a 401 Unauthorized error, it means:

- Your Space is private and requires authentication
- The authentication token is invalid or missing
- You need to provide a valid token in the Settings UI

## Fix Script

We've created a fix script that updates the Hugging Face Spaces settings to use the correct URL format and API endpoint. This script:

1. Updates the Space URL to use the correct format (`https://huggingface.co/spaces/username/space-name`)
2. Changes the API endpoint to `/api/predict` which is the standard endpoint used by Gradio Spaces
3. Preserves any existing authentication tokens
4. Makes sure the feature flag is properly configured

To run the fix, execute:

```bash
node scripts/fix-huggingface-spaces-migration.js
```

Then open the Settings UI and:
1. Enter your authentication token for the Space
2. Enable the Hugging Face Spaces feature flag
3. Test the connection

## Technical Details

### Correct URL Format

Hugging Face Spaces URLs come in two formats:
- `https://huggingface.co/spaces/username/space-name` (standard format)
- `https://username-space-name.hf.space` (direct domain format)

Our client automatically converts the standard format to the direct domain format when making API calls.

### API Endpoints

Gradio Spaces typically expose their API at one of these endpoints:

- `/api/predict` - Standard Gradio API endpoint (newer versions)
- `/run/predict` - Alternative format for older Gradio
- `/api/generate` - Common for LLM Spaces
- `/run` - Direct endpoint (newer Gradio with FastAPI)
- `/predict` - Direct predict endpoint

The most common and reliable endpoint is `/api/predict` which we now use as the default.

### Request Format

The request should be formatted as:

```json
{
  "inputs": "Your prompt text",
  "parameters": {
    "max_new_tokens": 25,
    "temperature": 0.1
  }
}
```

Or for newer Gradio versions:

```json
{
  "data": ["Your prompt text"]
}
```

The diagnostic script tries both formats to determine which one works with your Space.

## Diagnostic Script

We've also created a diagnostic script that tests different configurations to find the one that works with your Space:

```bash
node scripts/test-huggingface-spaces-connection.js
```

This script:
1. Checks the current settings in the database
2. Tests the Space with the configured endpoint
3. Tries different endpoint formats if the configured one fails
4. Tests different request formats

Use the output from this script to troubleshoot your Space connection issues.
