# Company Members Recursion Fix

## Issue Description

The application was experiencing an infinite recursion error in PostgreSQL's Row Level Security (RLS) policy for the `company_members` relation. The specific error was:

```
App.tsx:67 Error fetching logs for feature extraction: {
  code: '42P17', 
  details: null, 
  hint: null, 
  message: 'infinite recursion detected in policy for relation "company_members"'
}
```

This error occurred because the logging system was attempting to capture company context information while processing logs, which triggered a recursive database query pattern that PostgreSQL detected and prevented.

## Root Cause Analysis

1. The application's `LoggingProvider` component was configured to capture company context by default.
2. When logging events occurred, the `useCentralizedLogging` hook would pass this configuration to `useEnhancedLogging`.
3. The `useEnhancedLogging` hook would then attempt to query the `company_members` table to get company context.
4. This query would trigger the RLS policy, which might have been checking permissions based on the user's company membership.
5. The policy check would then generate additional log events, creating an infinite recursion.

## Solution

We implemented a full configuration chain that properly disables company context capturing:

1. **Default Configuration**: Changed the default value for `captureCompanyContext` to `false` at all levels of the logging system.

2. **LoggingProvider Component**: Ensured the LoggingProvider properly passes configuration options:
   ```tsx
   // Initialize the logging hook with configuration options
   const loggingFunctions = useCentralizedLogging({
     enableDetailedLogging,
     captureUserContext,
     captureCompanyContext,  // Now properly passed
     captureSystemContext,
     featureSets
   });
   ```

3. **useCentralizedLogging Hook**: Updated to accept and forward configuration:
   ```tsx
   export const useCentralizedLogging = (options?: CentralizedLoggingOptions) => {
     // ...
     const enhancedLogging = useEnhancedLogging({
       detailLevel: 'extensive',
       captureUserContext: options?.captureUserContext ?? true,
       captureCompanyContext: options?.captureCompanyContext ?? false, // Default to false
       // ...
     });
     // ...
   };
   ```

4. **App Component**: Already had the correct configuration in place:
   ```tsx
   <LoggingProvider
     enableDetailedLogging={true}
     captureUserContext={true}
     captureCompanyContext={false} // Already disabled for company functionality
     captureSystemContext={true}
     featureSets={['user_behavior', 'system_interactions', 'business_logic', 'ai_conversations', 'idea_generation']}
   >
   ```

5. **Stubbed Company Access Service**: As an additional safeguard, the application has a stubbed company access service that doesn't query the database:
   ```tsx
   async checkUserCompanyAccess(userId: string) {
     // ...
     // Return default empty values with error property to maintain API compatibility
     return {
       hasCompany: false,
       companyData: [],
       accessType: null,
       stubbed: true,
       error: null  // Include error property but set to null
     };
   }
   ```

## Impact and Limitations

- **Resolved Issue**: The infinite recursion error is resolved, allowing the application to function properly.
- **Limited Functionality**: Company-related features may have limited functionality since company context is not being captured for logs.
- **Temporary Solution**: This is a temporary solution until the company functionality and its database schema are properly rebuilt.

## Future Improvements

When rebuilding the company functionality, consider the following:

1. Redesign the RLS policies to avoid circular dependencies.
2. Use a different approach for capturing company context in logs that doesn't rely on querying the same tables that are being logged.
3. Implement a more granular control system for logging contexts to prevent cascading queries.
