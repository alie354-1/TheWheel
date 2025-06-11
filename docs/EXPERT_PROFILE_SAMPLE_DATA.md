# Expert Profile Sample Data

## Overview

This document explains the sample data service for expert profiles, which provides a way to quickly create sample expert profiles for testing and development purposes.

## Problem

During development and testing, it's often necessary to have sample data to work with. Creating expert profiles manually through the UI can be time-consuming, especially when you need to test various scenarios or when the database is reset.

## Solution

We've implemented a sample data service that allows developers to create sample expert profiles with a single click. This service:

1. Creates a complete expert profile with realistic data
2. Associates the profile with the current user
3. Provides a simple button component that can be added to any page

## Implementation

### Sample Data Service

The `sampleDataService` is implemented in `src/lib/services/sample-data.service.ts` and provides a method to create a sample expert profile for a given user ID:

```typescript
async addSampleExpertProfile(userId: string) {
  // Check if profile already exists
  const existingProfile = await expertService.getExpertProfile(userId);
  
  if (existingProfile) {
    return existingProfile;
  }
  
  // Create sample expert profile with realistic data
  const expertProfile = {
    user_id: userId,
    primary_expertise_areas: ['Startup Strategy', 'Product Development', 'Fundraising'],
    secondary_expertise_areas: ['Marketing', 'Team Building', 'Business Development'],
    industry_experience: {
      years: 10,
      industries: ['SaaS', 'Fintech', 'E-commerce'],
      roles: ['Founder', 'CTO', 'Product Manager']
    },
    functional_experience: {
      areas: ['Engineering', 'Product', 'Strategy'],
      skills: ['Leadership', 'Technical Architecture', 'Agile Methodologies']
    },
    company_stages_experienced: ['seed', 'series_a', 'series_b'],
    mentorship_capacity: 5,
    success_stories: [
      'Helped a startup raise $2M in seed funding',
      'Guided a team through a successful product launch',
      'Mentored 3 founders who went on to build successful companies'
    ],
    languages_spoken: ['English', 'Spanish'],
    timezone: 'America/New_York'
  };
  
  // Save the profile using the expert service
  return await expertService.upsertExpertProfile(expertProfile);
}
```

### Button Component

The `CreateSampleExpertProfileButton` component in `src/components/community/CreateSampleExpertProfileButton.tsx` provides a simple UI for creating sample expert profiles:

```tsx
const CreateSampleExpertProfileButton: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCreateSampleProfile = async () => {
    if (!user) {
      toast.error('Error', 'You must be logged in to create a sample expert profile');
      return;
    }

    try {
      setLoading(true);
      const result = await sampleDataService.addSampleExpertProfile(user.id);
      
      toast.success('Success', 'Sample expert profile created successfully');
      
      console.log('Sample expert profile created:', result);
    } catch (error) {
      console.error('Error creating sample expert profile:', error);
      
      toast.error('Error', 'Failed to create sample expert profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCreateSampleProfile} 
      disabled={loading}
      variant="outline"
      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
    >
      {loading ? 'Creating...' : 'Create Sample Expert Profile'}
    </Button>
  );
};
```

## Integration

The button has been integrated into the `CommunityExpertsPage` component, allowing users to quickly create a sample expert profile from the experts page:

```tsx
{!isExpert ? (
  <div>
    <JoinAsExpertCTA variant="banner" />
    <div className="mt-4 flex justify-end">
      <CreateSampleExpertProfileButton />
    </div>
  </div>
) : (
  // Expert profile UI
)}
```

## Usage

To create a sample expert profile:

1. Navigate to the Community Experts page
2. If you don't already have an expert profile, you'll see the "Create Sample Expert Profile" button
3. Click the button to create a sample expert profile
4. The page will refresh and show your expert profile

## Technical Notes

- The sample data service uses the existing `expertService` to create profiles, ensuring that all business logic and validation is applied
- The service first checks if a profile already exists for the user to avoid creating duplicates
- The sample data is designed to be realistic and comprehensive, covering all required fields
- The button component handles loading states and error handling

## Related Files

- `src/lib/services/sample-data.service.ts` - The sample data service
- `src/components/community/CreateSampleExpertProfileButton.tsx` - The button component
- `src/pages/community/CommunityExpertsPage.tsx` - Integration of the button
- `supabase/apply_sample_data_client.sh` - Script to apply the sample data service
