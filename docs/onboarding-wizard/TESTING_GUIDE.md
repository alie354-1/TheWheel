# Onboarding Testing Guide

## Overview

This guide provides detailed instructions for testing the onboarding flow, including the new two-phase approach with the Initial Onboarding Wizard. It covers how to use the testing scripts, different testing scenarios, and common issues that might arise during testing.

## Prerequisites

Before testing the onboarding flow, ensure you have:

1. A local development environment set up
2. Access to the Supabase database (local or development)
3. Node.js installed (v16+)
4. The project dependencies installed (`npm install`)

## Testing Tools

### 1. Onboarding Reset Script

The `test-initial-onboarding.js` script resets the onboarding state for testing:

```bash
node scripts/test-initial-onboarding.js
```

This script:
- Connects to your Supabase database
- Finds the mock user profile (`mock-user-id`)
- Resets the `initialOnboardingComplete` flag to `false`
- Clears any previously stored onboarding data

### 2. Mock Authentication

The project uses a mock authentication service (`mock-auth.service.ts`) that automatically logs in a test user. This allows you to test the onboarding flow without needing to create real user accounts.

### 3. Sign Out Button

A SignOutButton component is available in the UI to fully sign out and start fresh. Use this when you want to test with different user accounts.

## Testing Workflow

### Testing Initial Onboarding

1. **Reset Onboarding State**
   ```bash
   node scripts/test-initial-onboarding.js
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```

3. **Access Initial Onboarding**
   - Navigate to: http://localhost:5173/initial-onboarding
   - You should see the first step of the onboarding wizard (role selection)

4. **Test Different Role Paths**

   a. **Founder Path**:
   - Select "Founder" role
   - Choose a company stage:
     - "Idea stage" → Should direct to Idea Playground
     - "Solid idea" → Should direct to Company Formation
     - "Existing company" → Should direct to Company Profile Setup

   b. **Company Member Path**:
   - Select "Company Member" role
   - Test company joining flow:
     - Valid company code
     - Invalid company code
     - Company lookup

   c. **Service Provider Path**:
   - Select "Service Provider" role
   - Select multiple service categories
   - Add specific services (if implemented)
   - Verify redirection to service provider features

5. **Verify Data Storage**
   - After completing the flow, check the database to ensure selections are saved
   - Verify the `initialOnboardingComplete` flag is set to `true`
   - Confirm redirections are appropriate based on selections

### Testing Multi-User Scenarios

1. **Test with Different Users**
   - Use the SignOutButton to fully log out
   - Log in with different test accounts
   - Verify the onboarding flow works correctly for each user

2. **Test Returning Users**
   - Complete the onboarding flow with a user
   - Sign out and sign back in
   - Verify the user is not shown the onboarding again
   - Test resetting the onboarding state

### Testing Persona Selection (Currently Disabled)

The PersonaSelector component is temporarily hidden during the onboarding overhaul. When it is re-enabled in the future, test:

1. **Persona Selection During Onboarding**
   - Creation of personas during onboarding
   - Switching between personas
   - Persona-specific onboarding paths

2. **Onboarding State Per Persona**
   - Each persona should have its own onboarding state
   - Completing onboarding for one persona should not affect others

## Common Issues and Troubleshooting

### Database Connection Issues

**Issue**: The reset script fails to connect to the database.

**Solution**:
- Check the Supabase connection details
- Ensure the Supabase server is running
- Verify environment variables are set correctly

### Redirect Issues

**Issue**: Redirections after onboarding completion don't work as expected.

**Solution**:
- Check routing configuration in `App.tsx`
- Verify that the `navigate` function is being called with the correct path
- Ensure the completion handler in `InitialOnboardingPage.tsx` is working properly

### State Persistence Issues

**Issue**: Onboarding state isn't being saved or is lost between steps.

**Solution**:
- Check the profile service implementation
- Verify Supabase connections and write permissions
- Ensure the profile update operations are awaited properly

### Role-Specific Components Not Showing

**Issue**: Company stage selector doesn't appear for founders, etc.

**Solution**:
- Check conditional rendering logic in `InitialOnboardingWizard.tsx`
- Verify step configuration in the wizard
- Ensure role selection is being saved correctly

### Skipping Onboarding

**Issue**: Users need to skip onboarding for testing.

**Solution**:
- Manually set `initialOnboardingComplete: true` in the database
- Use the App routing system to navigate directly to desired features
- For development, consider adding a "Skip" button (not for production)

## Advanced Testing

### Performance Testing

1. **Measure Load Times**
   - Track initial page load time
   - Measure step transition times
   - Identify slow database operations

2. **Network Analysis**
   - Monitor network requests during onboarding
   - Identify unnecessary data fetching
   - Look for redundant API calls

### Accessibility Testing

1. **Screen Reader Testing**
   - Test with VoiceOver, NVDA, or other screen readers
   - Verify all elements are properly announced
   - Ensure form controls have appropriate labels

2. **Keyboard Navigation**
   - Test completing the entire flow using only keyboard
   - Verify focus order is logical
   - Ensure all interactive elements are reachable

### Mobile Testing

1. **Device Testing**
   - Test on various screen sizes
   - Verify touch targets are appropriately sized
   - Check for responsive layout issues

2. **Orientation Changes**
   - Test rotating devices between portrait and landscape
   - Verify state is preserved during orientation changes
   - Check for layout issues in different orientations

## Adding New Tests

When adding new features to the onboarding flow:

1. Update this testing guide
2. Add test cases to cover new functionality
3. Consider adding automated tests for critical paths
4. Document any new testing scripts or utilities

## Future Testing Enhancements

1. **Automated End-to-End Tests**
   - Implement Cypress or Playwright tests
   - Create test scenarios for all common paths
   - Set up CI/CD integration

2. **User Session Recording**
   - Implement session recording for real users
   - Analyze onboarding completion funnels
   - Identify common drop-off points

3. **A/B Test Infrastructure**
   - Set up feature flags for A/B testing
   - Create metrics for comparing onboarding variations
   - Build a dashboard for visualizing test results
