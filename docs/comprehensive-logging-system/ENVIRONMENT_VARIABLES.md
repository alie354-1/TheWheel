# Environment Variables: Comprehensive Logging System

## Overview

This document describes the environment variables used by the Comprehensive Logging System, how they are configured, and best practices for managing them securely. The logging system relies on several environment variables to connect to external services and configure its behavior.

## Table of Contents

1. [Required Environment Variables](#required-environment-variables)
2. [Configuration Variables](#configuration-variables)
3. [Security Best Practices](#security-best-practices)
4. [Key Rotation Procedures](#key-rotation-procedures)
5. [Environment-Specific Configuration](#environment-specific-configuration)

## Required Environment Variables

### Supabase Configuration

The logging system uses Supabase as its primary data store. The following variables are required for Supabase integration:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- **VITE_SUPABASE_URL**: The URL of your Supabase project
- **VITE_SUPABASE_ANON_KEY**: The anonymous key for your Supabase project, used for authenticated operations

### OpenAI Configuration

For AI interactions that need to be logged, the system uses OpenAI's API:

```
VITE_OPENAI_API_KEY=your-openai-api-key
```

- **VITE_OPENAI_API_KEY**: Your OpenAI API key for making requests to OpenAI's services

### Feature Flag Service

Optional but recommended for controlling logging behaviors dynamically:

```
VITE_FEATURE_FLAGS_API_KEY=your-feature-flags-api-key
```

## Configuration Variables

These variables control how the logging system behaves:

### General Logging Configuration

```
VITE_LOGGING_ENABLED=true
VITE_LOGGING_VERBOSITY=info
VITE_LOGGING_SAMPLE_RATE=1.0
```

- **VITE_LOGGING_ENABLED**: Master switch to enable/disable all logging (`true`/`false`)
- **VITE_LOGGING_VERBOSITY**: Controls the level of detail in logs (`debug`, `info`, `warn`, `error`)
- **VITE_LOGGING_SAMPLE_RATE**: Controls what fraction of events get logged (0.0-1.0)

### Performance Monitoring

```
VITE_PERFORMANCE_MONITORING_ENABLED=true
VITE_PERFORMANCE_SAMPLE_RATE=0.1
```

- **VITE_PERFORMANCE_MONITORING_ENABLED**: Enable/disable performance monitoring
- **VITE_PERFORMANCE_SAMPLE_RATE**: What fraction of performance events to log (0.0-1.0)

### Privacy Settings

```
VITE_DEFAULT_CONSENT_ANALYTICS=false
VITE_DEFAULT_CONSENT_AI_TRAINING=false
VITE_PRIVACY_MODE=strict
```

- **VITE_DEFAULT_CONSENT_ANALYTICS**: Default setting for analytics consent
- **VITE_DEFAULT_CONSENT_AI_TRAINING**: Default setting for AI training consent
- **VITE_PRIVACY_MODE**: Controls privacy strictness (`relaxed`, `standard`, `strict`)

### Batch Configuration

```
VITE_BATCH_LOGGING_ENABLED=true
VITE_BATCH_SIZE=50
VITE_BATCH_INTERVAL_MS=5000
```

- **VITE_BATCH_LOGGING_ENABLED**: Enable/disable batch logging
- **VITE_BATCH_SIZE**: Maximum number of events in a batch
- **VITE_BATCH_INTERVAL_MS**: How often to flush the batch (milliseconds)

## Security Best Practices

### API Key Storage

#### Development Environment

For local development, store keys in a `.env` file that is not committed to source control:

1. Create a `.env` file in the project root
2. Add your environment variables in the format `KEY=value`
3. Add `.env` to your `.gitignore` file to prevent accidental commits

```bash
# .env example
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENAI_API_KEY=your-openai-api-key
```

#### Production Environment

For production, use your cloud provider's secrets management service:

- **AWS**: Use AWS Secrets Manager or Parameter Store
- **GCP**: Use Google Secret Manager
- **Azure**: Use Azure Key Vault
- **Netlify/Vercel**: Use the environment variables configuration in your dashboard

Never store production API keys directly in:
- Source code
- Docker images
- CI/CD logs
- Shared team documents

### Least Privilege Principle

1. **Supabase**: Create dedicated service accounts with minimal permissions needed:
   ```sql
   -- Example of creating a restricted role in Supabase
   CREATE ROLE logging_service;
   GRANT INSERT ON system_logs TO logging_service;
   GRANT SELECT ON user_consent TO logging_service;
   ```

2. **OpenAI**: If possible, create specific API keys for logging purposes with appropriate rate limits

3. **Enforce scopes**: If the API supports scopes, request only the minimal scopes needed

### Encryption

1. **In-transit encryption**: All API communication should use HTTPS
2. **At-rest encryption**: Ensure your Supabase database has encryption at rest enabled
3. **Client-side encryption**: Consider encrypting extremely sensitive data before logging

## Key Rotation Procedures

Regular key rotation is a security best practice. Follow these steps to safely rotate keys:

### Supabase Key Rotation

1. Generate a new API key in the Supabase dashboard
2. Update the key in your environment variable storage (secrets manager)
3. Deploy the application with the new key
4. Monitor for errors after deployment
5. Once confirmed working, revoke the old key

### OpenAI Key Rotation

1. Create a new API key in the OpenAI dashboard
2. Update the key in your environment variables
3. Deploy the application
4. After confirming successful operation, revoke the old key

### Automated Rotation

For production environments, consider implementing automated key rotation:

```typescript
// Pseudocode for automated key rotation
async function rotateKeys() {
  try {
    // 1. Fetch new key from secret manager
    const newKey = await secretManager.getLatestKey('openai');
    
    // 2. Update application configuration (without restart)
    globalConfig.set('OPENAI_API_KEY', newKey);
    
    // 3. Log successful rotation (use old key, as new one is not verified yet)
    await loggingService.logSystemEvent(
      'key_rotation',
      'system',
      'key_updated',
      { service: 'openai', success: true }
    );
    
    // 4. Verify new key works
    const testResult = await testKey(newKey);
    if (!testResult.success) {
      // Rollback to previous key if test fails
      await rollbackKey('openai');
    }
  } catch (error) {
    // Handle rotation errors
    console.error('Key rotation failed:', error);
  }
}
```

## Environment-Specific Configuration

### Development

```bash
# .env.development
VITE_LOGGING_ENABLED=true
VITE_LOGGING_VERBOSITY=debug
VITE_LOGGING_DESTINATION=console
VITE_BATCH_LOGGING_ENABLED=false
VITE_PRIVACY_MODE=relaxed
```

Development environments should prioritize debugging and developer productivity:
- More verbose logging
- Console output for quick debugging
- Relaxed privacy for easier troubleshooting
- Real-time logging (no batching)

### Staging

```bash
# .env.staging
VITE_LOGGING_ENABLED=true
VITE_LOGGING_VERBOSITY=info
VITE_LOGGING_DESTINATION=database
VITE_BATCH_LOGGING_ENABLED=true
VITE_BATCH_SIZE=20
VITE_PRIVACY_MODE=standard
```

Staging environments should closely mirror production:
- Moderate verbosity
- Database storage for logs
- Batching enabled for performance testing
- Standard privacy controls

### Production

```bash
# .env.production
VITE_LOGGING_ENABLED=true
VITE_LOGGING_VERBOSITY=warn
VITE_LOGGING_DESTINATION=database
VITE_BATCH_LOGGING_ENABLED=true
VITE_BATCH_SIZE=50
VITE_PRIVACY_MODE=strict
VITE_PERFORMANCE_SAMPLE_RATE=0.1
```

Production environments prioritize performance and privacy:
- Limited verbosity (warnings and errors)
- Efficient batch processing
- Strict privacy enforcement
- Performance monitoring with sampling

### Testing

```bash
# .env.test
VITE_LOGGING_ENABLED=false
VITE_MOCK_LOGGING=true
```

Test environments should avoid external dependencies:
- Disable actual logging
- Use mocked logging services
- Prevent test data from polluting analytics

## Environment Variable Loading

The application uses Vite's environment variable handling:

```typescript
// Example of accessing environment variables
const isLoggingEnabled = import.meta.env.VITE_LOGGING_ENABLED === 'true';
const verbosity = import.meta.env.VITE_LOGGING_VERBOSITY || 'info';
const sampleRate = parseFloat(import.meta.env.VITE_LOGGING_SAMPLE_RATE || '1.0');

// Fallback pattern
const batchSize = parseInt(import.meta.env.VITE_BATCH_SIZE || '50', 10);
```

### Runtime Configuration

Some configuration can be adjusted at runtime via app settings:

```typescript
// Example of runtime configuration
class LoggingConfig {
  private settings: Map<string, any> = new Map();
  
  async initialize() {
    // Load from environment first
    this.settings.set('enabled', import.meta.env.VITE_LOGGING_ENABLED === 'true');
    this.settings.set('verbosity', import.meta.env.VITE_LOGGING_VERBOSITY || 'info');
    
    // Then try to load from app settings (database)
    try {
      const { data } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['logging_enabled', 'logging_verbosity']);
        
      if (data) {
        data.forEach(setting => {
          this.settings.set(setting.key.replace('logging_', ''), setting.value);
        });
      }
    } catch (error) {
      console.error('Failed to load logging settings:', error);
      // Fall back to environment variables
    }
  }
  
  get(key: string, defaultValue?: any): any {
    return this.settings.has(key) ? this.settings.get(key) : defaultValue;
  }
  
  set(key: string, value: any): void {
    this.settings.set(key, value);
    
    // Optionally persist the setting
    supabase
      .from('app_settings')
      .upsert({ key: `logging_${key}`, value })
      .catch(error => console.error(`Failed to update ${key}:`, error));
  }
}

export const loggingConfig = new LoggingConfig();
```

## Troubleshooting Environment Variables

### Missing Variables

If logging isn't working as expected, check if environment variables are properly loaded:

```typescript
function debugEnvironmentVariables() {
  console.log('Environment Variables:');
  console.log('VITE_LOGGING_ENABLED:', import.meta.env.VITE_LOGGING_ENABLED);
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL?.substring(0, 10) + '...');
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '[SET]' : '[NOT SET]');
  console.log('VITE_OPENAI_API_KEY:', import.meta.env.VITE_OPENAI_API_KEY ? '[SET]' : '[NOT SET]');
  console.log('VITE_LOGGING_VERBOSITY:', import.meta.env.VITE_LOGGING_VERBOSITY);
}
```

### Common Issues

1. **Variables not loading**: 
   - Ensure your `.env` file is in the correct location
   - For Vite, ensure variables are prefixed with `VITE_`
   - Restart the development server after changing `.env`

2. **Incorrect variable format**:
   - Boolean values should be strings: `VITE_FEATURE=true`
   - Check for typos and trailing spaces

3. **Production build not using variables**:
   - Ensure your CI/CD pipeline sets the environment variables
   - For static hosting, environment variables must be set at build time

By properly managing environment variables for your logging system, you ensure secure, configurable operation across all environments.
