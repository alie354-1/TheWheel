# Expert Onboarding Implementation

This document outlines the implementation of the expert onboarding system in the community module. The system allows users to create expert profiles, share their expertise, and offer mentorship to other community members.

## Overview

The expert onboarding system consists of several components:

1. **Call-to-Action Component**: A reusable component that prompts users to join as experts
2. **Sign-Up Modal**: For new users who want to become experts
3. **Profile Wizard**: A multi-step wizard that guides users through creating their expert profile
4. **Expert Profile Management**: Backend services for creating and managing expert profiles

## Components

### JoinAsExpertCTA

A versatile call-to-action component that can be displayed in various locations throughout the application. It supports two display variants:

- **Button**: A simple button for inline placement
- **Banner**: A more prominent banner for dedicated sections

The component handles both new and existing users:
- For existing users: Opens the expert profile wizard directly
- For new users: Opens the sign-up modal first, then proceeds to the profile wizard

**Location**: `src/components/community/JoinAsExpertCTA.tsx`

### ExpertSignUpModal

A modal dialog for new users to create an account before proceeding to the expert profile wizard. It collects basic user information and creates a new account using Supabase Auth.

**Location**: `src/components/community/ExpertSignUpModal.tsx`

### ExpertProfileWizard

A comprehensive multi-step wizard that guides users through the process of creating their expert profile. The wizard consists of six steps:

1. **Motivation**: Why the user wants to become an expert
2. **Expertise Areas**: Primary and secondary areas of expertise
3. **Experience**: Industry and functional experience, company stages
4. **Success Stories**: Examples of past successes and achievements
5. **Mentorship**: Mentorship capacity, timezone, and languages spoken
6. **Review**: Final review of the profile before submission with preview capability

The wizard saves progress to localStorage to prevent data loss if the user navigates away or refreshes the page.

**Location**: `src/components/community/ExpertProfileWizard.tsx`

### ExpertProfilePreview

A modal component that shows how an expert profile will appear to other users in the community. It provides two view options:

- **Full Profile**: Shows the complete expert profile page as it would appear when viewed by other users
- **Card View**: Shows how the expert would appear in the experts directory grid

This component helps users visualize their profile before submitting it, ensuring they're satisfied with how their expertise and experience will be presented.

**Location**: `src/components/community/ExpertProfilePreview.tsx`

### ViewExpertProfileButton

A button component that allows experts to preview their profile as it appears to others. It opens the ExpertProfilePreview modal with the user's existing profile data. The component supports two display variants:

- **Button**: A standard button with white background and blue border
- **Link**: A text link for more subtle placement

The component automatically fetches the user's expert profile data and displays it in the preview modal. It also includes a loading state while the profile data is being fetched.

**Location**: `src/components/community/ViewExpertProfileButton.tsx`

### EditExpertProfileButton

A button component that allows experts to edit their profile after it has been created. It opens the ExpertProfileWizard with the user's existing profile data pre-loaded. The component supports two display variants:

- **Button**: A standard button with blue background
- **Link**: A text link for more subtle placement

The component automatically handles retrieving the current user's ID and passing it to the wizard.

**Location**: `src/components/community/EditExpertProfileButton.tsx`

### Wizard Steps

Each step of the wizard is implemented as a separate component for better maintainability:

- `ExpertMotivationStep.tsx`: Collects the user's motivation for becoming an expert
- `ExpertiseAreasStep.tsx`: Allows selection of primary and secondary expertise areas
- `ExperienceStep.tsx`: Collects industry and functional experience details
- `SuccessStoriesStep.tsx`: Enables users to add success stories and achievements
- `MentorshipStep.tsx`: Sets mentorship preferences and availability
- `ProfileReviewStep.tsx`: Shows a summary of the profile for final review with a preview button that opens the ExpertProfilePreview modal

**Location**: `src/components/community/wizard-steps/`

## Database Schema

The expert profiles are stored in the `expert_profiles` table with the following structure:

```sql
CREATE TABLE expert_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_expertise_areas TEXT[] NOT NULL,
  secondary_expertise_areas TEXT[],
  industry_experience JSONB,
  functional_experience JSONB,
  company_stages_experienced TEXT[],
  mentorship_capacity INTEGER NOT NULL DEFAULT 0,
  success_stories TEXT[],
  languages_spoken TEXT[],
  timezone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);
```

## Services

The expert service provides methods for managing expert profiles:

- `getExpertProfile`: Retrieves an expert profile by user ID
- `upsertExpertProfile`: Creates or updates an expert profile
- `deleteExpertProfile`: Deletes an expert profile
- `getTopExperts`: Retrieves top experts based on endorsement count
- `getExpertiseAreas`: Retrieves expertise areas with counts

**Location**: `src/lib/services/expert.service.ts`

## Integration Points

The expert onboarding system is integrated into the application at the following points:

1. **Community Experts Page**: 
   - Displays a banner CTA for non-expert users
   - Shows "View Profile" and "Edit Expert Profile" buttons for existing experts
   - Location: `src/pages/community/CommunityExpertsPage.tsx`

2. **User Profile Page**:
   - Includes an "Expert Profile" section
   - Shows "Join as Expert" CTA for non-expert users
   - Shows "View Profile" and "Edit Expert Profile" buttons for existing experts
   - Location: `src/pages/Profile.tsx`

2. **Future Integration Points**:
   - Community Dashboard: Add a CTA for new users
   - User Profile: Add an option to become an expert
   - Discussion Threads: Prompt active contributors to become experts

## User Flow

### New Expert Onboarding
1. User sees a call-to-action to become an expert
2. If the user is not logged in, they are prompted to create an account
3. The user completes the expert profile wizard
4. In the final review step, the user can preview how their profile will appear to others
5. The profile is saved to the database
6. The user is now visible in the experts directory and can receive mentorship requests

### Viewing Expert Profile
1. User who is already an expert sees a "View Profile" button on their Profile page or Community Experts page
2. Clicking the button opens the ExpertProfilePreview modal showing how their profile appears to others
3. The user can toggle between "Full Profile" and "Card View" to see different presentations of their profile
4. The user can close the preview when finished

### Editing Existing Profile
1. User who is already an expert sees an "Edit Expert Profile" button
2. Clicking the button opens the expert profile wizard with their existing data pre-loaded
3. The user makes changes to their profile
4. In the final review step, the user can preview how their updated profile will appear
5. The updated profile is saved to the database

## Future Enhancements

1. **Expert Verification**: Add a verification process for experts to ensure quality
2. **Expertise Assessment**: Implement a skills assessment or quiz for expertise areas
3. **Expert Dashboard**: Create a dedicated dashboard for experts to manage their profile and mentorship requests
4. **Mentorship Scheduling**: Integrate a calendar system for scheduling mentorship sessions
5. **Expert Ratings and Reviews**: Allow mentees to rate and review experts
6. **Expert Matching Algorithm**: Develop an algorithm to match mentees with suitable experts

## Maintenance Considerations

1. **Expertise Areas**: The list of expertise areas may need to be updated over time as new technologies and business areas emerge
2. **User Experience**: Monitor user drop-off points in the wizard and optimize the flow
3. **Data Validation**: Ensure proper validation of user inputs to maintain data quality
4. **Performance**: Monitor database performance, especially for queries that retrieve expert profiles

## Conclusion

The expert onboarding system provides a comprehensive solution for identifying and onboarding experts within the community. It enables knowledge sharing and mentorship, which are key components of a thriving community platform.
