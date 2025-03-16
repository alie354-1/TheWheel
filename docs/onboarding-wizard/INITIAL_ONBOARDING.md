# Initial Onboarding Process

## Overview

The Initial Onboarding process is the first phase of our two-phase onboarding strategy. It provides a streamlined, focused onboarding experience that quickly captures the most essential user information based on their role, getting users to relevant platform features faster.

This document outlines the technical implementation, user flow, and testing procedures for the Initial Onboarding system.

## User Flow

1. **Initial Entry**
   - New user signs up or logs in for the first time
   - User is automatically redirected to `/initial-onboarding`
   - Non-authenticated users are shown the login screen

2. **Role Selection**
   - User selects their primary role:
     - **Founder**: Building or leading a company
     - **Company Member**: Working at an existing company
     - **Service Provider**: Offering services to companies

3. **Role-Specific Information Collection**
   - **For Founders**: Company stage selection
     - Idea Stage → Directed to Idea Playground
     - Solid Idea → Directed to Company Formation
     - Existing Company → Profile setup for existing company
   - **For Company Members**: Company joining flow
     - Enter company code or information
     - Select role within company
   - **For Service Providers**: Service category selection
     - Multiple categories can be selected
     - Option to add specific services within categories

4. **Completion & Redirection**
   - User profile is updated with initial onboarding information
   - Marked as having completed initial onboarding
   - Redirected to appropriate feature based on role selection
   - Scheduled for detailed onboarding at next appropriate opportunity

## Component Architecture

### 1. InitialOnboardingPage (`src/pages/InitialOnboardingPage.tsx`)

The container page that:
- Checks authentication status
- Renders login for non-authenticated users
- Shows loading state while profile data loads
- Provides the onboarding context wrapper
- Handles completion callbacks and navigation

```typescript
// Key implementation details
const InitialOnboardingPage: React.FC = () => {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  
  // Show login for non-authenticated users
  if (!user) return <Login />;
  
  // Handle onboarding completion
  const handleOnboardingComplete = async () => {
    // Update profile to mark initial onboarding as complete
    // Redirect to appropriate next step
  };
  
  return <InitialOnboardingWizard user={user} onComplete={handleOnboardingComplete} />;
};
```

### 2. InitialOnboardingWizard (`src/components/onboarding/InitialOnboardingWizard.tsx`)

The core component that:
- Manages the onboarding step state
- Renders the appropriate step component
- Provides navigation between steps
- Saves user selections
- Tracks progress

```typescript
// Step definitions
const steps = [
  { id: 'role', label: 'Your Role', component: InitialRoleStep },
  { id: 'company_stage', label: 'Company Stage', component: FounderCompanyStageStep, 
    shouldShow: (data) => data.role === 'founder' },
  { id: 'join_company', label: 'Join Company', component: JoinCompanyStep,
    shouldShow: (data) => data.role === 'company_member' },
  { id: 'service_categories', label: 'Your Services', component: ServiceProviderCategoriesStep,
    shouldShow: (data) => data.role === 'service_provider' },
];
```

### 3. Role-Specific Step Components

#### 3.1 InitialRoleStep (`src/components/onboarding/steps/InitialRoleStep.tsx`)
- Presents role selection cards with icons and descriptions
- Captures user's primary role selection
- Simple, focused UI for quick decisions

#### 3.2 FounderCompanyStageStep (`src/components/onboarding/steps/FounderCompanyStageStep.tsx`)
- Only shown to users who selected "founder" role
- Presents company stage options with visual indicators
- Tailored descriptions and next steps for each stage

#### 3.3 JoinCompanyStep (`src/components/onboarding/steps/JoinCompanyStep.tsx`)
- Only shown to users who selected "company member" role
- Company lookup or code entry
- Role selection within company

#### 3.4 ServiceProviderCategoriesStep (`src/components/onboarding/steps/ServiceProviderCategoriesStep.tsx`)
- Only shown to users who selected "service provider" role
- Multi-select interface for service categories
- Option to specify particular services within categories

## Data Flow

1. **Data Storage**
   - All selections are stored in the user's profile under `setup_progress.form_data`
   - Company-specific information is stored in appropriate company tables
   - Service provider information is stored in service provider tables

2. **Integration with Profile Service**
   - `profile.service.ts` handles all profile data operations
   - Updates are batched to minimize database writes
   - Setup progress tracking is maintained in the profile

3. **State Management**
   - React state for UI interactions
   - Profile data for persistence
   - Redux store for global state coordination

## Testing the Initial Onboarding

### Reset Onboarding State Script

A dedicated script has been created to reset the onboarding state for testing:

```bash
node scripts/test-initial-onboarding.js
```

This script:
1. Connects to the database
2. Finds the mock user profile
3. Updates the profile to mark initial onboarding as incomplete
4. Clears any stored onboarding data

### Testing Process

1. **Reset the Onboarding State**
   ```bash
   node scripts/test-initial-onboarding.js
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```

3. **Navigate to the Initial Onboarding**
   - Go to http://localhost:5173/initial-onboarding
   - You should be automatically logged in with the mock user

4. **Test Different Paths**
   - Test the founder path with different company stages
   - Test the company member path
   - Test the service provider path
   - Verify correct redirections based on selections

5. **Verify Data Storage**
   - Check that selections are properly saved in the user profile
   - Verify that the initial onboarding completion flag is set

## Considerations

### 1. Performance
- Initial onboarding is designed to be lightweight and fast
- Minimal network requests during the process
- Pre-loaded options to avoid waiting for data

### 2. Accessibility
- All steps are keyboard navigable
- ARIA labels and roles for screen readers
- Sufficient color contrast for all UI elements

### 3. Mobile Responsiveness
- Fully responsive design works on all device sizes
- Touch-friendly UI elements
- Appropriate spacing for mobile interactions

### 4. Error Handling
- Graceful handling of network issues
- Automatic saving of progress
- Easy recovery from interruptions

## Future Enhancements

1. **Analytics Integration**
   - Track step completion rates
   - Measure time spent on each step
   - Analyze drop-off points

2. **A/B Testing Framework**
   - Test different role descriptions
   - Experiment with step order variations
   - Optimize for completion rate

3. **Personalization Enhancements**
   - More tailored content based on role
   - Dynamic recommendations
   - Integration with feature discovery

4. **Re-enabling Persona Selection**
   - Once the initial onboarding flow is stabilized
   - Re-introduce the currently hidden PersonaSelector component
   - Integrate multi-persona support with the onboarding flow
