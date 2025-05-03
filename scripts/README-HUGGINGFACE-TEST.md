# Hugging Face API Key Testing

## Overview
This directory contains a script to test your Hugging Face API key directly from the command line. The script has been updated to match how the application authenticates with Hugging Face, which helps diagnose issues where a key works in the UI but not in the test script.

## Usage

Basic usage:
```bash
node scripts/test-huggingface-api-key.js YOUR_API_KEY
```

Testing with a specific model type:
```bash
node scripts/test-huggingface-api-key.js YOUR_API_KEY base
node scripts/test-huggingface-api-key.js YOUR_API_KEY company
node scripts/test-huggingface-api-key.js YOUR_API_KEY abstraction
```

## Why Keys Can Work in UI But Fail in Tests

There are several reasons why an API key might work in the application UI but fail in a direct test:

1. **Different Model Selection**: The UI might be using a model that your API key has access to, while the test script uses a different model.

2. **Request Parameters**: The application sends specific parameters with each request that might affect authentication.

3. **Context Information**: The application includes additional context information that might be required for successful authentication.

4. **Rate Limiting**: Your API key might be hitting rate limits when testing outside the application.

## How This Script Helps

The updated test script addresses these issues by:

1. Matching the exact parameters used by the application
2. Supporting different model types that match what the application uses
3. Including the same error handling and validation as the application
4. Providing more detailed diagnostics when something goes wrong

If you're still having issues, try using the same model that's configured in your application settings.
