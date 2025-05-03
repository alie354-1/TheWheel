# Company Members Functionality Removal

## Overview

This document describes the changes made to remove the company members functionality from the application. This is a temporary measure until the company functionality can be completely rebuilt.

## Issue

We encountered the following error when accessing the dashboard:
```
App.tsx:67 Error fetching logs for feature extraction: {
  code: '42P17', 
  details: null, 
  hint: null, 
  message: 'infinite recursion detected in policy for relation "company_members"'
}
```

The infinite recursion was happening in the PostgreSQL Row Level Security (RLS) policies for the `company_members` table. Instead of fixing the recursion directly, we've chosen to temporarily remove the company members functionality and rebuild it from scratch later.

## Changes Made

### 1. Stubbed Company Access Service

The `company-access.service.ts` file was modified to return a stubbed version that doesn't query the `company_members` table at all. The service now:

- Returns empty company data with a `stubbed: true` flag
- Logs that the stubbed service was used
- Maintains the same API interface to avoid breaking code that depends on it

### 2. Disabled Company Context in Logging

Modified `App.tsx` to disable company context capturing in the `LoggingProvider`:

```typescript
<LoggingProvider
  enableDetailedLogging={true}
  captureUserContext={true}
  captureCompanyContext={false} // Disabled company context to prevent recursion issues
  captureSystemContext={true}
  featureSets={['user_behavior', 'system_interactions', 'business_logic', 'ai_conversations', 'idea_generation']}
>
```

## Affected Functionality

The following functionality is temporarily unavailable:

- Company membership management
- Company role permissions
- Company member lists
- Company context in logs

## Next Steps

When rebuilding the company functionality, consider these improvements:

1. Redesign the database schema to avoid circular dependencies
2. Implement RLS policies that prevent recursive checks
3. Use service-role API functions for complex permission checks
4. Add better error handling for database permission issues

Until the functionality is rebuilt, the application will continue to operate with stubbed company data.
