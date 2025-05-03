# Hugging Face Spaces Integration Troubleshooting

## Common Issues with Hugging Face Spaces

When integrating with Hugging Face Spaces, several common issues can occur that prevent successful connection. This guide addresses the most frequent problems and their solutions.

## 1. 404 Error (Not Found) when connecting to Space API

This is the error you're currently facing with the message:
```
POST https://alie354-company-base-expert-model.hf.space/api/predict 404 (Not Found)
```

### Possible Causes and Solutions:

#### Wrong API Endpoint
Hugging Face Spaces can use different API endpoints depending on how the Space is set up:

| Framework | Common Endpoints |
|-----------|-----------------|
| Gradio (newer) | `/api/predict` |
| Gradio (older) | `/run/predict` |
| LLM-focused Spaces | `/api/generate` |
| FastAPI/Custom | `/predict`, `/run`, or custom path |

**Solution:** The fix script (`run-huggingface-fix.js`) automatically updates your settings to use `/api/predict`, which is the standard endpoint for most Gradio Spaces. If this doesn't work, you may need to check your Space's documentation or logs to find the correct endpoint.

#### Space is Paused or Not Running
Hugging Face automatically pauses inactive Spaces after a period of inactivity.

**Solution:** Visit your Space directly at `https://huggingface.co/spaces/yourusername/yourspace` and ensure it's running. If it shows "This Space is currently paused", click the "Restart Space" button and wait for it to start.

#### Space URL Format Issues
You may be using the wrong URL format. Hugging Face Spaces can be accessed using two URL formats:

1. Standard: `https://huggingface.co/spaces/username/space-name`
2. Direct: `https://username-space-name.hf.space`

**Solution:** Make sure your URL follows one of these formats. Our component automatically converts between these formats when needed.

## 2. 401 Error (Unauthorized) when connecting to Space API

This occurs when your Space is private and requires authentication.

### Solution:

1. Obtain a Hugging Face API token from [Hugging Face settings](https://huggingface.co/settings/tokens)
2. Add this token to the "Authentication Token" field in the Space configuration
3. Ensure the token has the necessary permissions to access the Space

## 3. Request Format Issues

Hugging Face Spaces may expect different input formats depending on the model and configuration:

1. Standard format:
```json
{
  "inputs": "Your query text",
  "parameters": {
    "max_new_tokens": 50,
    "temperature": 0.7
  }
}
```

2. Data array format:
```json
{
  "data": ["Your query text"]
}
```

**Solution:** Our fix script tries multiple input formats automatically.

## Testing Your Space Connection

You can test your Space connection directly using the following command:

```bash
curl -X POST \
  https://yourusername-yourspace.hf.space/api/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"inputs": "Test query"}'
```

Replace `yourusername-yourspace` with your actual Space name and `YOUR_TOKEN` with your Hugging Face token if the Space is private.

## Running the Fix Script

To fix the API endpoint issue, you can run:

```bash
node scripts/run-huggingface-fix.js
```

This script will:
1. Update all your Space configurations to use the `/api/predict` endpoint
2. Display diagnostic information to help troubleshoot connection issues
3. Update the settings in your database

## Additional Resources

- [Hugging Face Spaces Documentation](https://huggingface.co/docs/hub/spaces)
- [Gradio API Reference](https://www.gradio.app/guides/sharing-your-app#api-page)
- [FastAPI in Spaces](https://huggingface.co/docs/hub/spaces-sdks-fastapi)

If you continue to have issues, check the Space's specific documentation or contact the Space owner for the correct API endpoint and input format.
