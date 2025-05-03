# Enhanced Idea Hub: Ownership Model Implementation

This document outlines the implementation of the ownership model for ideas in the Enhanced Idea Hub, which allows for a clear distinction between personal ideas and company ideas.

## Overview

The ownership model introduces two key concepts:

1. **Ownership Type**: Ideas can be either "personal" (owned by an individual user) or "company" (owned by a company and visible to all company members).
2. **Creator ID**: Every idea has a creator, which is the user who initially created the idea.

This model enables a workflow where users can:
- Create personal ideas that only they can see
- Promote personal ideas to company ideas when they're ready to share
- Collaborate on company ideas with their team

## Database Changes

The following changes were made to the database schema:

### 1. New Columns in `idea_playground_ideas` Table

- `creator_id`: UUID reference to `auth.users(id)` - The user who created the idea
- `ownership_type`: TEXT with CHECK constraint to be either 'personal' or 'company' - The ownership type of the idea

### 2. Row-Level Security (RLS) Policies

Updated RLS policies to enforce the following access rules:

- Users can view their own personal ideas OR company ideas they have access to
- Users can only create ideas with themselves as the creator
- Users can update their personal ideas OR company ideas if they have proper role (admin/editor)
- Users can delete their personal ideas OR company ideas if they have admin role

### 3. Database Function for Idea Promotion

Created a PostgreSQL function `promote_idea_to_company` that:
- Takes an idea ID and target company ID as parameters
- Verifies the user is a member of the target company
- Updates the idea to be a company idea with the specified company ID
- Sets the integration status to 'pending_approval'
- Returns a boolean indicating success

## TypeScript Type Changes

Updated the TypeScript types to support the new ownership model:

### 1. Added `OwnershipType` Type

```typescript
/**
 * Ownership type for ideas
 */
export type OwnershipType = 'personal' | 'company';
```

### 2. Updated `EnhancedIdeaPlaygroundIdea` Interface

Added new fields to the interface:

```typescript
// Ownership and creator information
creatorId?: string;
ownershipType: OwnershipType;
```

## API Service Updates

The API service was updated to support the new ownership model:

### 1. Updated `fetchIdeas` Function

Modified to include the new ownership fields in the returned data:

```typescript
// Transform the data to match our enhanced idea structure
return (data || []).map((item: any) => ({
  // ...existing fields
  
  // Ownership and creator information
  creatorId: item.creator_id,
  ownershipType: (item.ownership_type || 'personal') as OwnershipType,
  
  // ...other fields
}));
```

### 2. Updated `createIdea` Function

Modified to set the creator ID to the current user and default ownership type to 'personal':

```typescript
// Get the current user's ID
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  throw new Error('User not authenticated');
}

// Transform the enhanced idea structure to match the database schema
const dbData = {
  // ...existing fields
  
  // Set creator and ownership
  creator_id: user.id,
  ownership_type: ideaData.ownershipType || 'personal',
  
  // ...other fields
};
```

### 3. Added `promoteIdeaToCompany` Function

Added a new function to promote a personal idea to a company idea:

```typescript
/**
 * Promote a personal idea to a company idea
 */
export const promoteIdeaToCompany = async (ideaId: string, companyId: string): Promise<boolean> => {
  try {
    // Call the database function we created in the migration
    const { data, error } = await supabase
      .rpc('promote_idea_to_company', {
        idea_id: ideaId,
        target_company_id: companyId
      });
    
    if (error) {
      handleSupabaseError(error);
      throw new Error(`Error promoting idea to company: ${error.message}`);
    }
    
    // The function returns a boolean indicating success
    return data || false;
    
  } catch (error) {
    console.error('Error in promoteIdeaToCompany:', error);
    return false;
  }
};
```

## How to Run the Migration

To apply the database changes, run the following command:

```bash
node scripts/run-idea-ownership-migration.js
```

This script will:
1. Check if the migration file exists
2. Apply the migration using the Supabase CLI
3. If that fails, attempt to apply it using psql directly

## Troubleshooting

If you encounter the error `column "user_id" does not exist` during migration, it means the `idea_playground_ideas` table doesn't have a `user_id` column. This is expected, as we're transitioning to use `creator_id` instead. The migration has been updated to handle this case.

## Next Steps

1. Update UI components to display ownership information
2. Add UI controls for promoting personal ideas to company ideas
3. Implement filtering by ownership type in the idea list views
