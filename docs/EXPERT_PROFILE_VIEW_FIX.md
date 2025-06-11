# Expert Profile View Fix

## Overview

This document describes the fix implemented to address an issue with viewing expert profiles in the community experts page. The issue was that when clicking on "View Profile" for an expert in the experts list, the system was trying to fetch the expert profile using the expert profile's ID, but the `getExpertProfile` method in the expert service was designed to fetch profiles by user ID, not by profile ID.

## Problem Details

1. In the CommunityExpertsPage component, when an expertId is provided in the URL (e.g., `/community/experts/:expertId`), it was using `expertService.getExpertProfile(expertId)` to fetch the expert profile.
2. However, the `getExpertProfile` method in the expert service was designed to fetch profiles by user ID, not by profile ID.
3. This resulted in the expert profile not being found when clicking on "View Profile" in the experts list, as the links were using the expert profile's ID, not the user ID.

## Solution

The solution involves two main changes:

1. **Add a new method to the expert service**: A new method called `getExpertProfileById` was added to the expert service to fetch expert profiles by their ID (not by user ID).
2. **Update the CommunityExpertsPage component**: The component was updated to use the new `getExpertProfileById` method when an expertId is provided in the URL.

## Implementation Details

### 1. Expert Service Update (v4)

A new method was added to the expert service:

```typescript
/**
 * Get an expert profile by profile ID
 * 
 * @param profileId The ID of the expert profile
 * @returns The expert profile or null if not found
 */
async getExpertProfileById(profileId: string): Promise<ExpertProfile | null> {
  try {
    console.log('Getting expert profile by profile ID:', profileId);
    
    // Use a more basic query to avoid potential issues with column names or filters
    const { data, error } = await supabase
      .from('expert_profiles')
      .select('*');
      
    if (error) {
      console.error('Error in initial expert profiles query:', error);
      throw error;
    }
    
    // Filter the results manually to find the matching profile
    const matchingProfile = data?.find(profile => profile.id === profileId);
    
    if (!matchingProfile) {
      console.log('No expert profile found for profile ID:', profileId);
      return null;
    }
    
    console.log('Found expert profile:', matchingProfile.id);
    return matchingProfile;
  } catch (error) {
    console.error('Error getting expert profile by ID:', error);
    throw error;
  }
}
```

### 2. CommunityExpertsPage Update

The CommunityExpertsPage component was updated to use the new method:

```typescript
// Fetch single expert or list of experts based on presence of expertId
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (expertId) {
        // Fetch single expert - FIXED: Use getExpertProfileById instead of getExpertProfile
        const expert = await expertService.getExpertProfileById(expertId);
        setCurrentExpert(expert);
        setExperts([]);
      } else {
        // Fetch list of experts
        const experts = await expertService.getTopExperts(pagination.page_size);
        // In a real implementation, we would apply filters and pagination here
        // For now, we'll just use the top experts
        setExperts(experts);
        setTotalPages(Math.ceil(experts.length / pagination.page_size));
        setCurrentExpert(null);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching experts:', err);
      setError('Failed to load experts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [expertId, filters, pagination]);
```

## How to Apply the Fix

To apply the fix, run the following script:

```bash
./supabase/apply_expert_profile_view_fix.sh
```

This script will:
1. Copy the fixed expert service (v4) to the actual expert service file
2. Copy the fixed CommunityExpertsPage component to the actual component file

## Testing

After applying the fix, you should be able to:
1. View the list of experts on the community experts page
2. Click on "View Profile" for any expert
3. See the expert's full profile page

The fix ensures that expert profiles can be fetched by their ID, which is what's used in the URL when viewing an expert's profile.
