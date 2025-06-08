# Community Module Integration Guide

This guide provides detailed instructions on how to integrate the community module with the frontend components of The Wheel platform.

## Table of Contents

1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [Service Integration](#service-integration)
4. [Frontend Component Integration](#frontend-component-integration)
5. [Authentication and Authorization](#authentication-and-authorization)
6. [Performance Considerations](#performance-considerations)
7. [Security Considerations](#security-considerations)
8. [Troubleshooting](#troubleshooting)

## Overview

The community module enhances The Wheel platform with features for community engagement, including:

- Community groups
- Discussion threads
- Community events
- Expert profiles
- User achievements

The module follows a service-based architecture, with each service handling a specific domain of functionality. These services provide a clean API for the frontend to consume without modifying the existing user profile system.

## Database Setup

Before using the community services, you need to set up the database schema:

1. Ensure you have the Supabase CLI installed:
   ```bash
   npm install -g supabase
   ```

2. Set the `SUPABASE_DB_URL` environment variable:
   ```bash
   export SUPABASE_DB_URL=postgresql://postgres:password@localhost:5432/postgres
   ```

3. Run the migration script:
   ```bash
   chmod +x supabase/apply_community_migrations.sh
   ./supabase/apply_community_migrations.sh
   ```

This script will apply the community module schema to your Supabase database, creating all necessary tables, indexes, functions, and policies.

## Service Integration

The community module provides five main services:

1. **Community Service**: Manages community groups and memberships
2. **Discussion Service**: Handles discussion threads, replies, and reactions
3. **Event Service**: Manages community events and registrations
4. **Expert Service**: Handles expert profiles and endorsements
5. **Achievement Service**: Manages user achievements and contribution scores

### Importing Services

Import the services from the community module:

```typescript
// Import individual services
import { communityService } from 'lib/services/community';
import { discussionService } from 'lib/services/community';
import { eventService } from 'lib/services/community';
import { expertService } from 'lib/services/community';
import { achievementService } from 'lib/services/community';

// Or import all services at once
import { 
  communityService, 
  discussionService, 
  eventService, 
  expertService, 
  achievementService 
} from 'lib/services/community';
```

### Using Community Service

The community service manages community groups and memberships:

```typescript
// Get all community groups
const groups = await communityService.getGroups();

// Get groups with pagination
const paginatedGroups = await communityService.getGroups(undefined, { page: 1, page_size: 10 });

// Get a specific group
const group = await communityService.getGroupById(groupId);

// Create a new community group
const newGroup = await communityService.createGroup({
  name: 'Startup Founders',
  description: 'A group for startup founders to connect and share experiences',
  group_type: 'stage_cohort',
  access_level: 'core_portfolio',
  slug: 'startup-founders'
}, currentUserId);

// Join a group
await communityService.joinGroup(groupId, userId);

// Leave a group
await communityService.leaveGroup(groupId, userId);

// Get group members
const members = await communityService.getGroupMembers(groupId);
```

### Using Discussion Service

The discussion service handles discussion threads, replies, and reactions:

```typescript
// Get all discussion threads
const threads = await discussionService.getThreads();

// Get threads with filtering and sorting
const filteredThreads = await discussionService.getThreads(
  { 
    group_id: groupId,
    sort_by: 'last_activity_at', 
    sort_direction: 'desc' 
  }, 
  { page: 1, page_size: 10 }
);

// Get a specific thread
const thread = await discussionService.getThread(threadId);

// Create a new discussion thread
const thread = await discussionService.createThread({
  group_id: groupId,
  title: 'Fundraising strategies for early-stage startups',
  content: 'What strategies have worked well for you when raising your seed round?',
  thread_type: 'question'
}, currentUserId);

// Add a reply to a thread
const reply = await discussionService.createReply({
  thread_id: threadId,
  content: 'We found that focusing on our traction metrics was key to our successful raise.'
}, currentUserId);

// Add a reaction to a reply
await discussionService.addReaction('reply', replyId, userId, 'helpful');

// Remove a reaction
await discussionService.removeReaction('reply', replyId, userId, 'helpful');

// Mark a reply as an accepted answer
await discussionService.markAsAcceptedAnswer(replyId, threadId);

// Get all replies for a thread
const replies = await discussionService.getReplies(threadId);

// Mark a reply as an expert response
await discussionService.markAsExpertResponse(
  replyId,
  expertId,
  'Product Strategy',
  0.95 // confidence score
);
```

### Discussion Components

The community module includes several components for discussions:

#### CreateDiscussionForm

A form component for creating new discussion threads:

```tsx
import CreateDiscussionForm from 'components/community/CreateDiscussionForm';

// In your component
<CreateDiscussionForm 
  groupId={groupId} // Optional, pre-selects the group
  onSuccess={(threadId) => navigate(`/community/discussions/${threadId}`)}
  onCancel={() => navigate(-1)}
/>
```

#### ThreadReactionButtons

A component for displaying and handling reactions to threads and replies:

```tsx
import ThreadReactionButtons from 'components/community/ThreadReactionButtons';

// In your component
<ThreadReactionButtons 
  contentType="thread" // or "reply"
  contentId={thread.id}
  initialReactions={[
    { reaction_type: 'like', count: 5, userHasReacted: false },
    { reaction_type: 'helpful', count: 3, userHasReacted: true },
    { reaction_type: 'insightful', count: 2, userHasReacted: false }
  ]}
  onReactionChange={() => fetchUpdatedData()}
/>
```

#### AcceptAnswerButton

A component for marking a reply as an accepted answer (only visible to thread authors):

```tsx
import AcceptAnswerButton from 'components/community/AcceptAnswerButton';

// In your component
<AcceptAnswerButton
  threadId={threadId}
  replyId={reply.id}
  isAccepted={reply.is_accepted_answer}
  isThreadAuthor={currentUserId === thread.author_id}
  onAcceptChange={(isAccepted) => {
    if (isAccepted) {
      // Update UI or fetch updated data
    }
  }}
/>
```

#### ExpertResponseBadge

A component for displaying expert response information:

```tsx
import ExpertResponseBadge from 'components/community/ExpertResponseBadge';

// In your component
<ExpertResponseBadge
  expertiseArea="Product Strategy"
  confidenceScore={0.95}
  verificationStatus="verified" // 'verified', 'disputed', 'self_reported', or 'pending'
  verifiedBy="Jane Smith" // Optional, only for verified responses
  verifiedAt="2025-06-01T12:00:00Z" // Optional, only for verified responses
/>
```

#### MarkAsExpertResponseButton

A component for experts to mark their responses as expert responses:

```tsx
import MarkAsExpertResponseButton from 'components/community/MarkAsExpertResponseButton';

// In your component
<MarkAsExpertResponseButton
  threadId={threadId}
  replyId={replyId}
  expertId={currentUserId}
  isExpertResponse={false} // Set to true if already marked as expert response
  onMarkAsExpert={(isExpert) => {
    if (isExpert) {
      // Update UI or fetch updated data
    }
  }}
/>
```

### Discussion Pages

The community module includes the following pages for discussions:

- `CommunityDiscussionsPage`: Main page for viewing discussion threads and single thread view
- `CreateDiscussionPage`: Page for creating new discussion threads

These pages are already set up in the routes:

```tsx
// Routes are already configured in CommunityRoutes.tsx
<Route path="discussions" element={<CommunityDiscussionsPage />} />
<Route path="discussions/new" element={<CreateDiscussionPage />} />
<Route path="discussions/new/:groupId" element={<CreateDiscussionPage />} />
<Route path="discussions/:threadId" element={<CommunityDiscussionsPage />} />
```

### Using Event Service

The event service manages community events and registrations:

```typescript
// Get all events
const events = await eventService.getEvents();

// Get upcoming events
const upcomingEvents = await eventService.getUpcomingEvents(3);

// Get a specific event
const event = await eventService.getEventById(eventId);

// Create a new event
const event = await eventService.createEvent({
  title: 'Founder Fireside Chat',
  description: 'Join us for an intimate conversation with successful founders',
  event_type: 'networking',
  start_date: '2025-07-15T18:00:00Z',
  end_date: '2025-07-15T20:00:00Z',
  timezone: 'America/New_York',
  event_format: 'hybrid',
  location_details: {
    virtual_link: 'https://zoom.us/j/123456789',
    physical_address: '123 Startup St, San Francisco, CA'
  }
}, organizerId);

// Register for an event
await eventService.registerForEvent(eventId, userId);

// Cancel registration
await eventService.cancelRegistration(eventId, userId);

// Get event registrations
const registrations = await eventService.getEventRegistrations(eventId);
```

### Using Expert Service

The expert service handles expert profiles and endorsements:

```typescript
// Get all expert profiles
const experts = await expertService.getExpertProfiles();

// Get a specific expert profile
const expert = await expertService.getExpertProfileByUserId(userId);

// Create or update an expert profile
const profile = await expertService.createOrUpdateExpertProfile(userId, {
  primary_expertise_areas: ['Product Strategy', 'Go-to-Market'],
  secondary_expertise_areas: ['Fundraising', 'Team Building'],
  company_stages_experienced: ['seed', 'series_a'],
  mentorship_capacity: 2
});

// Add an endorsement
await expertService.addEndorsement(
  expertId,
  endorserId,
  'Product Strategy',
  'strong',
  'Jane provided invaluable product strategy advice that helped us pivot successfully.'
);

// Get endorsements for an expert
const endorsements = await expertService.getEndorsementsForExpert(expertId);
```

### Using Achievement Service

The achievement service manages user achievements and contribution scores:

```typescript
// Get user achievements
const achievements = await achievementService.getUserAchievements(userId);

// Award an achievement
await achievementService.awardAchievement(
  userId,
  'knowledge_sharing',
  'Knowledge Contributor',
  'silver',
  'Shared valuable knowledge that helped 25+ community members'
);

// Update contribution score
await achievementService.updateContributionScore(userId, 'monthly', {
  knowledge_sharing_points: 5,
  mentorship_impact_score: 3
});

// Get contribution scores
const scores = await achievementService.getUserContributionScores(userId);
```

## Frontend Component Integration

The community module includes several frontend components that can be integrated into your application:

### Community Routes

The community routes are already set up in `src/routes/CommunityRoutes.tsx` and integrated into the main application in `src/App.tsx`:

```tsx
// In App.tsx
import CommunityRoutes from './routes/CommunityRoutes.tsx';

// ...

<Route path="community/*" element={<CommunityRoutes />} />
```

### Community Pages

The community module includes the following pages:

- `CommunityHomePage`: Main landing page for the community features
- `CommunityGroupsPage`: Page for browsing and managing community groups
- `CommunityDiscussionsPage`: Page for browsing and participating in discussions
- `CommunityEventsPage`: Page for browsing and registering for events
- `CommunityExpertsPage`: Page for browsing and connecting with experts
- `CommunityAchievementsPage`: Page for viewing user achievements

These pages are already set up in the `src/pages/community/` directory and integrated into the community routes.

### Example: Using Community Services in a Component

Here's an example of how to use the community services in a React component:

```tsx
import React, { useEffect, useState } from 'react';
import { communityService } from 'lib/services/community';

const CommunityGroupsList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await communityService.getGroups();
        setGroups(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching groups:', err);
        setError('Failed to load groups. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <h2>Community Groups</h2>
      <ul>
        {groups.map((group) => (
          <li key={group.id}>
            <h3>{group.name}</h3>
            <p>{group.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommunityGroupsList;
```

## Authentication and Authorization

The community module integrates with the existing authentication system. All service methods that modify data require a user ID to be passed as a parameter.

The database schema includes Row Level Security (RLS) policies that enforce access control at the database level. These policies ensure that users can only access and modify data that they are authorized to.

### Example: Checking User Permissions

```typescript
// Check if user is a member of a group
const isMember = await communityService.isUserGroupMember(groupId, userId);

// Check if user is an admin of a group
const isAdmin = await communityService.isUserGroupAdmin(groupId, userId);

// Conditionally render UI based on permissions
if (isAdmin) {
  // Show admin controls
} else if (isMember) {
  // Show member controls
} else {
  // Show join button
}
```

## Performance Considerations

The community module is designed with performance in mind:

- **Pagination**: All list endpoints support pagination to handle large datasets
- **Efficient Queries**: The services use efficient database queries with appropriate indexes
- **Lazy Loading**: The community pages are lazy-loaded for better initial load performance
- **Parallel Requests**: Use `Promise.all` for parallel requests when appropriate

### Example: Parallel Requests

```typescript
// Fetch data in parallel for better performance
const [groupsData, discussionsData, eventsData] = await Promise.all([
  communityService.getGroups(undefined, { page: 1, page_size: 3 }),
  discussionService.getThreads({ sort_by: 'last_activity_at', sort_direction: 'desc' }, { page: 1, page_size: 5 }),
  eventService.getUpcomingEvents(3)
]);
```

## Security Considerations

The community module includes several security features:

- **Row Level Security**: Database-level access control ensures users can only access and modify data they are authorized to
- **Input Validation**: All service methods validate input to prevent injection attacks
- **Confidentiality Levels**: Discussion threads and other content can have different confidentiality levels
- **Moderation Controls**: Admins and moderators have special permissions to manage content

### Example: Creating Content with Confidentiality

```typescript
// Create a discussion thread with confidentiality level
const thread = await discussionService.createThread({
  group_id: groupId,
  title: 'Confidential Fundraising Discussion',
  content: 'This is a confidential discussion about our fundraising strategy.',
  thread_type: 'general',
  confidentiality_level: 'private'
}, currentUserId);
```

## Troubleshooting

### Common Issues

1. **Database Migration Errors**:
   - Ensure the Supabase CLI is installed
   - Check that the `SUPABASE_DB_URL` environment variable is set correctly
   - Verify that you have the necessary permissions to apply migrations

2. **Authentication Issues**:
   - Ensure the user is authenticated before making service calls
   - Check that the user ID is being passed correctly to service methods
   - Verify that the user has the necessary permissions for the operation

3. **Data Loading Issues**:
   - Check for errors in the console
   - Verify that the service methods are being called correctly
   - Ensure that the data is being stored in state and rendered properly

### Debugging Tips

1. **Enable Logging**:
   ```typescript
   // Enable debug logging in the services
   communityService.enableDebugLogging();
   ```

2. **Check Network Requests**:
   - Use the browser's developer tools to inspect network requests
   - Look for errors in the response

3. **Verify Database State**:
   - Use the Supabase dashboard to inspect the database tables
   - Check that the data is being stored correctly

### Getting Help

If you encounter issues that you can't resolve, please:

1. Check the community module documentation
2. Search for similar issues in the issue tracker
3. Ask for help in the developer community
4. Contact the community module maintainers

## Conclusion

The community module provides a powerful set of features for enhancing user engagement and collaboration within The Wheel platform. By following this integration guide, you can seamlessly incorporate these features into your application.

Remember to apply the database migrations, import the services, and use them in your components as needed. With proper integration, your users will be able to join groups, participate in discussions, attend events, share expertise, and earn achievements.
