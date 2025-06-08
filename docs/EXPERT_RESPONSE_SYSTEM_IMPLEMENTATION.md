# Expert Response System Implementation

This document outlines the implementation of the Expert Response System within the Community Module. The system allows users with expertise in specific areas to mark their responses as expert responses, providing additional credibility and value to community discussions.

## Overview

The Expert Response System consists of several components:

1. **Expert Profiles**: Users can create expert profiles that define their areas of expertise.
2. **Expert Endorsements**: Other users can endorse experts in specific areas, increasing their credibility.
3. **Expert Responses**: Experts can mark their replies to discussion threads as expert responses, indicating their confidence level.
4. **Verification System**: Certain users (moderators, admins) can verify or dispute expert responses.

## Database Schema

The system uses the following tables:

### expert_profiles

Stores information about users who are recognized as experts in specific areas.

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
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### expert_endorsements

Tracks endorsements given to experts by other users.

```sql
CREATE TABLE expert_endorsements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endorser_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expertise_area TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('strong', 'moderate', 'basic')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (expert_id, endorser_id, expertise_area)
);
```

### expert_responses

Links expert profiles to specific thread replies that are marked as expert responses.

```sql
CREATE TABLE expert_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES discussion_threads(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES thread_replies(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expertise_area TEXT NOT NULL,
  confidence_score INTEGER NOT NULL CHECK (confidence_score BETWEEN 50 AND 100),
  verification_status TEXT NOT NULL DEFAULT 'self_reported' CHECK (verification_status IN ('pending', 'verified', 'disputed', 'self_reported')),
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (reply_id)
);
```

### thread_replies (modified)

The existing thread_replies table is modified to include fields for expert responses:

```sql
ALTER TABLE thread_replies
ADD COLUMN is_expert_response BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN expert_confidence_score INTEGER CHECK (expert_confidence_score BETWEEN 50 AND 100);
```

## Frontend Components

### ExpertResponseBadge

Displays information about an expert response, including the expertise area, confidence score, and verification status.

```tsx
<ExpertResponseBadge
  expertiseArea="Product Management"
  confidenceScore={85}
  verificationStatus="verified"
  verifiedBy="admin-user-id"
  verifiedAt="2025-06-01T12:00:00Z"
/>
```

### MarkAsExpertResponseButton

Allows experts to mark their replies as expert responses or remove the expert response status.

```tsx
<MarkAsExpertResponseButton
  threadId="thread-id"
  replyId="reply-id"
  isExpertResponse={false}
  onUpdate={(isExpert) => handleExpertStatusChange(isExpert)}
/>
```

### AcceptAnswerButton

Allows thread authors to mark a reply as the accepted answer.

```tsx
<AcceptAnswerButton
  threadId="thread-id"
  replyId="reply-id"
  isAccepted={false}
  isThreadAuthor={true}
  onAcceptChange={() => handleAcceptedAnswerChange()}
/>
```

## Services

### ExpertService

Provides methods for managing expert profiles, endorsements, and expert responses.

```typescript
// Get an expert profile
const profile = await expertService.getExpertProfile(userId);

// Mark a reply as an expert response
await expertService.markAsExpertResponse({
  thread_id: threadId,
  reply_id: replyId,
  expert_id: userId,
  expertise_area: 'Product Management',
  confidence_score: 85,
  verification_status: 'self_reported'
});

// Remove expert response status
await expertService.removeExpertResponse(replyId);

// Get top experts
const topExperts = await expertService.getTopExperts(10);
```

## User Flow

1. **Expert Profile Creation**:
   - Users create expert profiles specifying their areas of expertise.
   - Other users can endorse them in specific areas.

2. **Marking Expert Responses**:
   - When an expert replies to a discussion thread, they can mark their reply as an expert response.
   - They specify the relevant expertise area and their confidence level (50-100%).

3. **Verification**:
   - By default, expert responses are marked as "self-reported".
   - Moderators or admins can verify or dispute expert responses.
   - Verified responses have higher visibility and credibility.

4. **Viewing Expert Responses**:
   - Expert responses are highlighted in the UI with a badge showing the expertise area, confidence level, and verification status.
   - Users can filter discussions to see those with expert responses.

## Implementation Notes

### Confidence Score

The confidence score (50-100%) indicates how confident the expert is in their response. This helps users gauge the reliability of the information:

- **90-100%**: Very high confidence, expert is certain about the information.
- **75-89%**: High confidence, expert is reasonably sure but there might be edge cases.
- **50-74%**: Moderate confidence, expert believes this is correct but has some reservations.

### Verification Status

Expert responses can have one of four verification statuses:

- **Self-reported**: The default status when an expert marks their own response.
- **Pending**: A moderator has flagged the response for review.
- **Verified**: A moderator has verified the accuracy of the response.
- **Disputed**: A moderator has disputed the accuracy of the response.

### Performance Considerations

- The `get_expert_endorsement_counts` and `get_expertise_area_counts` database functions use materialized views that are refreshed periodically to improve performance.
- Expert profiles and endorsements are cached on the client side to reduce database queries.

## Future Enhancements

1. **Expert Ranking System**: Implement a ranking system based on the number and quality of expert responses.
2. **AI-Assisted Verification**: Use AI to help verify the accuracy of expert responses.
3. **Expert Notifications**: Notify experts when discussions related to their expertise areas are created.
4. **Expert Directory**: Create a searchable directory of experts by expertise area.
5. **Expert Badges**: Display badges on user profiles indicating their expertise areas and endorsement levels.

## Conclusion

The Expert Response System enhances the value of community discussions by highlighting responses from recognized experts. It provides a way for users to identify high-quality, reliable information and for experts to establish their credibility within the community.
