# Cloud LLM Microservice Integration Guide

This guide explains how to configure your Wheel99 application to use the Hugging Face LLM microservice deployed to Google Cloud Platform.

## 1. Update Environment Variables

After deploying the LLM microservice to GCP Cloud Run, you'll receive a service URL. Add this URL to your `.env` file:

```
# LLM Microservice URL (replace with your actual Cloud Run URL)
VITE_LLM_SERVICE_URL=https://llm-service-abcd1234-uc.a.run.app/api
```

## 2. Enable Hugging Face Feature Flags

You can enable the Hugging Face integration in two ways:

### Option 1: Via Environment Variables

Add these variables to your `.env` file:

```
# Enable Hugging Face integration
VITE_USE_HUGGINGFACE=true

# Optionally enable specific models
VITE_USE_HF_COMPANY_MODEL=true
VITE_USE_HF_ABSTRACTION_MODEL=true
```

### Option 2: Via Settings UI

1. Navigate to your application settings
2. Find the LLM Provider Settings section
3. Toggle "Use Hugging Face" to ON
4. Optionally, toggle specific models:
   - "Use Company-Specific Model" 
   - "Use Abstraction Model"

## 3. Test the Integration

You can test the integration using the following methods:

### Using the Test Component

1. Navigate to the LLM Provider Test page in your application
2. Ensure "Hugging Face" is selected as the provider
3. Enter a test prompt and click "Generate Response"
4. Verify the response comes from the cloud-deployed service

### Using the API Directly

Execute a test API call:

```javascript
import { generalLLMService } from '../lib/services/general-llm.service';

// Test the service
async function testService() {
  try {
    const response = await generalLLMService.query(
      'Write a brief introduction about artificial intelligence',
      {
        userId: 'test-user-id',
        useCompanyModel: true
      }
    );
    console.log('Response:', response.content);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## 4. Verify Connection

Check the connection with the deployed service:

1. Open your browser console
2. Look for network requests to your Cloud Run URL
3. Verify the responses have status code 200
4. Check for any CORS errors in the console

## 5. Managing Cloud Service Environment Variables

If you need to update the LLM microservice configuration after deployment (such as CORS settings), you can do so directly in the Google Cloud Console:

### Updating CORS Configuration

1. **Navigate to the Cloud Run service:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project
   - Go to Cloud Run in the left sidebar
   - Click on your "llm-service" deployment

2. **Update environment variables:**
   - Click on the "Variables & Secrets" tab
   - Click the "Edit" button
   - Find the `ALLOWED_ORIGINS` variable
   - Update its value to include your domain(s), such as:
     ```
     https://yourdomain.com,https://app.yourdomain.com
     ```
   - Click "Deploy" to apply changes

3. **Verify your changes:**
   - A new revision will be created with the updated settings
   - Cloud Run will automatically route traffic to the new revision
   - Test your application again to ensure CORS issues are resolved

### Managing API Keys

You can update the Hugging Face API key and other sensitive variables:

1. **Via direct environment variables:**
   - Navigate to the service as described above
   - Edit the `HUGGINGFACE_API_KEY` variable
   - Enter the new API key value
   - Deploy the changes

2. **Using Secret Manager (recommended):**
   - First, store your API key in Secret Manager:
     ```bash
     gcloud secrets create HUGGINGFACE_API_KEY --replication-policy="automatic"
     echo -n "your-api-key-here" | gcloud secrets versions add HUGGINGFACE_API_KEY --data-file=-
     ```
   - In the Cloud Run console, go to Variables & Secrets
   - Click "Edit" and then "Add Reference to Secret"
   - Configure the reference to use your HUGGINGFACE_API_KEY secret
   - Deploy the changes

## 6. CI/CD Integration for Production

For production deployments, consider setting up CI/CD pipelines to automate updates to both your Wheel99 application and the LLM microservice:

### GitHub Actions Integration

Add a GitHub Actions workflow for your Wheel99 application:

```yaml
name: Deploy Wheel99 to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: |
          npm run build
          # Set the LLM service URL and enable Hugging Face
          echo "VITE_LLM_SERVICE_URL=${{ secrets.LLM_SERVICE_URL }}" >> .env.production
          echo "VITE_USE_HUGGINGFACE=true" >> .env.production
          echo "VITE_USE_HF_COMPANY_MODEL=true" >> .env.production
          
      - name: Deploy to hosting provider
        # Add your deployment steps here (Firebase, Netlify, etc.)
```

### Automated End-to-End Testing

Add comprehensive testing to your CI/CD pipeline:

```yaml
  test_integration:
    needs: build_and_deploy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run integration tests
        run: |
          # Set the environment variables for testing
          echo "VITE_LLM_SERVICE_URL=${{ secrets.LLM_SERVICE_URL }}" >> .env.test
          echo "VITE_USE_HUGGINGFACE=true" >> .env.test
          npm run test:integration
```

## 7. Troubleshooting

### Connection Issues

If you can't connect to the microservice:

1. Verify the VITE_LLM_SERVICE_URL is correct
2. Check that the Cloud Run service is running
3. Ensure your domain is in the allowed CORS origins
4. Try accessing the service health endpoint directly: `https://your-service-url/health`

### CORS Errors

If you see CORS errors:

1. Make sure your domain is included in the ALLOWED_ORIGINS environment variable on the Cloud Run service
2. Update the environment variable in the Cloud Run console as described in Section 5
3. Check that your application is making requests from the expected domain
4. For local development, you may need to add `http://localhost:3000` or similar to ALLOWED_ORIGINS

### Authentication Errors

If you receive authentication errors:

1. Verify that the Hugging Face API key is correctly set in the Cloud Run service
2. Check the Cloud Run logs for detailed error messages
3. Update the API key using the Cloud Run console if needed

### Feature Flag Issues

If the feature flags aren't working:

1. Restart your application after changing environment variables
2. Check that the variables are correctly named and formatted
3. Try toggling the flags in the UI instead of using environment variables

## 8. Costs and Scaling

Keep in mind:

1. Cloud Run charges based on usage (requests and compute time)
2. Set up budget alerts in Google Cloud to monitor spending
3. Consider adjusting the memory/CPU allocation if needed
4. For production, consider setting up autoscaling with minimum instances = 1 to avoid cold starts

## Need Help?

If you encounter any issues deploying or connecting to the LLM microservice, refer to:

1. GCP-DEPLOYMENT-GUIDE.md in the llm-service directory
2. Cloud Run documentation: https://cloud.google.com/run/docs
3. Hugging Face documentation: https://huggingface.co/docs
