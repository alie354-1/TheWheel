# Community Module

This module implements the community features for The Wheel platform, providing functionality for community groups, discussions, events, expert profiles, and achievements.

## Overview

The community module is designed to enhance user engagement and collaboration within The Wheel platform. It allows users to:

- Join and participate in community groups
- Create and engage in discussions
- Attend and organize community events
- Share expertise and get recognized for contributions
- Earn achievements and build reputation

## Architecture

The community module follows a service-based architecture, with each service handling a specific domain of functionality:

1. **Community Service**: Manages community groups and memberships
2. **Discussion Service**: Handles discussion threads, replies, and reactions
3. **Event Service**: Manages community events and registrations
4. **Expert Service**: Handles expert profiles and endorsements
5. **Achievement Service**: Manages user achievements and contribution scores

Each service interacts with the Supabase database and provides a clean API for the frontend to consume.

## Database Schema

The community module uses the following database tables:

- `community_groups`: Stores information about community groups
- `group_memberships`: Tracks user memberships in groups
- `discussion_threads`: Stores discussion threads
- `thread_replies`: Stores replies to discussion threads
- `content_reactions`: Tracks reactions to threads and replies
- `expert_responses`: Tracks expert responses to discussions
- `community_events`: Stores information about community events
- `event_registrations`: Tracks user registrations for events
- `expert_profiles`: Stores expert profiles
- `expert_endorsements`: Tracks endorsements for experts
- `achievements`: Stores user achievements
- `contribution_scores`: Tracks user contribution scores

## Integration with User Profiles

The community module integrates with the existing user profile system but does not replace it. When loading community data, the module links to user profiles using the user ID, but it does not modify or replace the core user profile functionality.

## Usage Examples

### Working with Community Groups

```typescript
import { communityService } from 'lib/services/community';

// Get all community groups
const groups = await communityService.getGroups();

// Create a new community group
const newGroup = await communityService.createGroup({
  name: 'Startup Founders',
  description: 'A group for startup founders to connect and share experiences',
  group_type: 'stage_cohort',
  access_level: 'core_portfolio'
}, currentUserId);

// Join a group
await communityService.joinGroup(groupId, userId);
```

### Working with Discussions

```typescript
import { discussionService } from 'lib/services/community';

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
```

### Working with Events

```typescript
import { eventService } from 'lib/services/community';

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
```

### Working with Expert Profiles

```typescript
import { expertService } from 'lib/services/community';

// Create an expert profile
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
```

### Working with Achievements

```typescript
import { achievementService } from 'lib/services/community';

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
```

## Performance Considerations

- The module uses efficient database queries with appropriate indexes
- Computed fields are used to avoid expensive joins where possible
- Pagination is implemented for list endpoints to handle large datasets
- Caching can be implemented at the API layer for frequently accessed data

## Security Considerations

- All database operations include appropriate access control checks
- User permissions are validated before allowing operations on community entities
- Confidentiality levels are respected when returning community data
- Input validation is performed to prevent injection attacks

## Future Enhancements

- Real-time notifications for community activities
- Advanced search and filtering capabilities
- AI-powered content moderation and recommendation
- Integration with external communication tools
- Analytics dashboard for community engagement metrics
