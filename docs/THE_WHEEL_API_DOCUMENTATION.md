# THE WHEEL: API DOCUMENTATION

## Overview

This document provides comprehensive documentation for The Wheel platform's API interfaces. The API layer enables integration with client applications, third-party services, and developer tools. The APIs are organized according to the platform's core pillars and follow RESTful and GraphQL paradigms where appropriate.

---

## Authentication & Authorization

All API endpoints require authentication using JWT (JSON Web Tokens). Authentication is handled via the Supabase Auth mechanism.

### Authentication Flow

1. **Login**: Exchange credentials for a JWT
   ```
   POST /auth/login
   {
     "email": "user@example.com",
     "password": "secure-password"
   }
   ```

2. **JWT Format**:
   ```
   Header.Payload.Signature
   ```

3. **Authorization Header**:
   ```
   Authorization: Bearer {jwt_token}
   ```

### Role-Based Access Control

Access to API endpoints is controlled by the user's role and mode. Permissions cascade as follows:

| Role | Permissions |
|------|-------------|
| Platform Admin | Full system access |
| Company Admin | Company-wide data access |
| User | Personal data and shared resources |
| Public | Only publicly accessible content |

### API Mode Context

API requests include a mode context to ensure data is properly scoped:

```
X-Wheel-Mode: founder
```

---

## RESTful API Endpoints

### Identity and Mode System

#### User Profiles

```
GET /api/v1/users/profile
```
Retrieve the current user's profile information

```
PUT /api/v1/users/profile
```
Update user profile information

#### User Modes

```
GET /api/v1/modes
```
Retrieve all available modes for current user

```
GET /api/v1/modes/{mode_id}
```
Get details for a specific mode

```
POST /api/v1/modes
```
Create a new mode

```
PUT /api/v1/modes/{mode_id}
```
Update an existing mode

```
DELETE /api/v1/modes/{mode_id}
```
Delete a mode

```
POST /api/v1/modes/{mode_id}/activate
```
Set a particular mode as active

#### Mode Context

```
GET /api/v1/modes/{mode_id}/context
```
Retrieve context data for a specific mode

```
PUT /api/v1/modes/{mode_id}/context
```
Update context data for a mode

```
POST /api/v1/modes/{mode_id}/context/activities
```
Record a new activity in the mode context

### Progress Tracking

#### Domains and Stages

```
GET /api/v1/progress/domains
```
Retrieve all progress domains

```
GET /api/v1/progress/domains/{domain}/stages
```
Get stages for a specific domain

```
GET /api/v1/progress/status
```
Get overall progress status across all domains

#### Milestones

```
GET /api/v1/progress/domains/{domain}/milestones
```
Get milestones for a specific domain

```
POST /api/v1/progress/domains/{domain}/milestones
```
Create a new milestone

```
PUT /api/v1/progress/domains/{domain}/milestones/{milestone_id}
```
Update a milestone

```
PATCH /api/v1/progress/domains/{domain}/milestones/{milestone_id}/complete
```
Mark a milestone as complete

#### Tasks

```
GET /api/v1/tasks
```
List all tasks

```
GET /api/v1/tasks/{task_id}
```
Get a specific task

```
POST /api/v1/tasks
```
Create a new task

```
PUT /api/v1/tasks/{task_id}
```
Update a task

```
PATCH /api/v1/tasks/{task_id}/complete
```
Mark a task as complete

```
DELETE /api/v1/tasks/{task_id}
```
Delete a task

### Knowledge Hub

#### Resources

```
GET /api/v1/knowledge/resources
```
List knowledge resources with filtering options

```
GET /api/v1/knowledge/resources/{resource_id}
```
Get a specific resource

```
POST /api/v1/knowledge/resources
```
Create a new resource

```
PUT /api/v1/knowledge/resources/{resource_id}
```
Update a resource

```
DELETE /api/v1/knowledge/resources/{resource_id}
```
Delete a resource

```
GET /api/v1/knowledge/resources/recommended
```
Get personalized resource recommendations

#### Templates

```
GET /api/v1/knowledge/templates
```
List all templates

```
GET /api/v1/knowledge/templates/{template_id}
```
Get a specific template

```
POST /api/v1/knowledge/templates
```
Create a new template

```
POST /api/v1/knowledge/templates/{template_id}/documents
```
Create a document from a template

#### Document Management

```
GET /api/v1/documents
```
List all user documents

```
GET /api/v1/documents/{document_id}
```
Get a specific document

```
PUT /api/v1/documents/{document_id}
```
Update a document

```
DELETE /api/v1/documents/{document_id}
```
Delete a document

```
POST /api/v1/documents/{document_id}/export
```
Export a document in various formats

### AI Cofounder

#### Standups

```
GET /api/v1/standups
```
List all standups

```
GET /api/v1/standups/{standup_id}
```
Get a specific standup

```
POST /api/v1/standups
```
Create a new standup

```
PUT /api/v1/standups/{standup_id}/answers
```
Submit answers for a standup

```
GET /api/v1/standups/{standup_id}/analysis
```
Get AI analysis of a standup

#### AI Conversations

```
GET /api/v1/conversations
```
List all AI conversations

```
GET /api/v1/conversations/{conversation_id}
```
Get a specific conversation

```
POST /api/v1/conversations
```
Start a new conversation

```
POST /api/v1/conversations/{conversation_id}/messages
```
Add a message to a conversation

```
GET /api/v1/conversations/{conversation_id}/messages
```
Get all messages in a conversation

#### Document Collaboration

```
POST /api/v1/documents/{document_id}/ai/suggestions
```
Get AI suggestions for a document

```
POST /api/v1/documents/{document_id}/ai/review
```
Request AI review of a document

### Tech Hub

#### Tech Stack Recommendations

```
POST /api/v1/tech/recommend
```
Get tech stack recommendations based on requirements

```
GET /api/v1/tech/stacks
```
List saved tech stacks

```
GET /api/v1/tech/stacks/{stack_id}
```
Get a specific tech stack

```
POST /api/v1/tech/stacks
```
Save a tech stack

#### Starter Codebases

```
GET /api/v1/tech/codebases
```
List available starter codebases

```
GET /api/v1/tech/codebases/{codebase_id}
```
Get details of a starter codebase

```
GET /api/v1/tech/codebases/{codebase_id}/download
```
Download a starter codebase

#### Deployment

```
GET /api/v1/tech/deployment/templates
```
List available deployment templates

```
POST /api/v1/tech/deployment/configure
```
Create a deployment configuration

```
POST /api/v1/tech/deployment/validate
```
Validate a deployment configuration

### Community

#### Groups

```
GET /api/v1/community/groups
```
List available community groups

```
GET /api/v1/community/groups/{group_id}
```
Get a specific group

```
POST /api/v1/community/groups
```
Create a new group

```
PUT /api/v1/community/groups/{group_id}
```
Update a group

```
DELETE /api/v1/community/groups/{group_id}
```
Delete a group

```
POST /api/v1/community/groups/{group_id}/join
```
Join a group

```
POST /api/v1/community/groups/{group_id}/leave
```
Leave a group

#### Discussions

```
GET /api/v1/community/groups/{group_id}/discussions
```
List discussions in a group

```
POST /api/v1/community/groups/{group_id}/discussions
```
Create a new discussion

```
POST /api/v1/community/discussions/{discussion_id}/posts
```
Create a post in a discussion

```
POST /api/v1/community/posts/{post_id}/react
```
React to a post

#### Events

```
GET /api/v1/community/events
```
List all events

```
GET /api/v1/community/events/{event_id}
```
Get a specific event

```
POST /api/v1/community/events
```
Create a new event

```
POST /api/v1/community/events/{event_id}/attend
```
Register attendance for an event

#### Wellness

```
POST /api/v1/community/wellness/assessment
```
Submit a wellness assessment

```
GET /api/v1/community/wellness/history
```
Get wellness assessment history

### Marketplace

#### Service Providers

```
GET /api/v1/marketplace/providers
```
List service providers

```
GET /api/v1/marketplace/providers/{provider_id}
```
Get a specific provider

```
POST /api/v1/marketplace/providers
```
Register as a service provider

```
PUT /api/v1/marketplace/providers/{provider_id}
```
Update provider profile

#### Service Requests

```
GET /api/v1/marketplace/requests
```
List service requests

```
POST /api/v1/marketplace/requests
```
Create a service request

```
GET /api/v1/marketplace/requests/{request_id}/proposals
```
Get proposals for a request

#### Proposals

```
POST /api/v1/marketplace/requests/{request_id}/proposals
```
Submit a proposal

```
PATCH /api/v1/marketplace/proposals/{proposal_id}/accept
```
Accept a proposal

#### Engagements

```
GET /api/v1/marketplace/engagements
```
List engagements

```
GET /api/v1/marketplace/engagements/{engagement_id}
```
Get a specific engagement

```
POST /api/v1/marketplace/engagements/{engagement_id}/milestones/{milestone_id}/complete
```
Mark an engagement milestone as complete

#### Partner Offers

```
GET /api/v1/marketplace/partners/offers
```
List partner offers

```
POST /api/v1/marketplace/partners/offers/{offer_id}/activate
```
Activate a partner offer

---

## GraphQL API

The GraphQL API provides a flexible alternative to the RESTful endpoints, allowing clients to request exactly the data they need in a single query.

### GraphQL Endpoint

```
POST /api/graphql
```

### Core Types

```graphql
type User {
  id: ID!
  email: String!
  profile: UserProfile
  modes: [UserMode!]!
  companies: [Company!]!
  tasks: [Task!]!
  documents: [Document!]!
  standups: [Standup!]!
  conversations: [Conversation!]!
}

type UserProfile {
  id: ID!
  name: String!
  bio: String
  avatarUrl: String
  contactInfo: JSONObject
  defaultMode: String!
  onboardingCompleted: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type UserMode {
  id: ID!
  mode: String!
  displayName: String!
  icon: String!
  primaryColor: String!
  isActive: Boolean!
  preferences: JSONObject!
  context: ModeContext
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ModeContext {
  id: ID!
  recentActivity: [Activity!]!
  pinnedItems: [PinnedItem!]!
  lastViewedEntities: [ViewedEntity!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type DomainProgress {
  domain: ProgressDomain!
  currentStage: DomainStage
  completionPercentage: Int!
  milestones: [Milestone!]!
  history: [MilestoneHistory!]!
}

type Task {
  id: ID!
  milestone: Milestone
  title: String!
  description: String
  priority: String!
  isCompleted: Boolean!
  dueDate: DateTime
  assignee: User
  isAiGenerated: Boolean!
  completedAt: DateTime
  dependencies: [Task!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type KnowledgeResource {
  id: ID!
  title: String!
  description: String
  domain: KnowledgeDomain!
  type: ResourceType!
  contentUrl: String
  content: JSONObject
  tags: [String!]
  stageRelevance: [String!]
  isPremium: Boolean!
  author: User
  isVerified: Boolean!
  viewCount: Int!
  ratings: [ResourceRating!]!
  templates: [Template!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Standup {
  id: ID!
  user: User!
  standupDate: DateTime!
  isCompleted: Boolean!
  status: String
  answers: [StandupAnswer!]!
  analysis: StandupAnalysis
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Conversation {
  id: ID!
  user: User!
  conversationType: String!
  title: String
  messages: [ConversationMessage!]!
  memories: [ConversationMemory!]!
  createdAt: DateTime!
  updatedAt: DateTime!
  lastMessageAt: DateTime!
}

type CommunityGroup {
  id: ID!
  name: String!
  description: String
  groupType: String!
  tags: [String!]
  visibility: String!
  createdBy: User!
  members: [GroupMember!]!
  discussions: [GroupDiscussion!]!
  events: [GroupEvent!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ServiceProvider {
  id: ID!
  user: User!
  businessName: String!
  description: String
  serviceCategories: [String!]!
  logoUrl: String
  contactInfo: JSONObject
  isVerified: Boolean!
  services: [ProviderService!]!
  ratings: [ProviderRating!]!
  proposals: [ServiceProposal!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Example Queries

#### User Profile with Modes

```graphql
query GetUserWithModes {
  me {
    id
    email
    profile {
      name
      avatarUrl
      defaultMode
    }
    modes {
      id
      mode
      displayName
      isActive
      context {
        recentActivity {
          type
          description
          timestamp
        }
      }
    }
  }
}
```

#### Progress Tracking

```graphql
query GetUserProgress {
  me {
    progress {
      domain
      completionPercentage
      currentStage {
        name
        description
      }
      milestones(status: ACTIVE) {
        id
        name
        completionPercentage
        tasks {
          id
          title
          priority
          isCompleted
          dueDate
          assignee {
            profile {
              name
            }
          }
        }
      }
    }
  }
}
```

#### Knowledge Resources

```graphql
query GetKnowledgeResources($domain: KnowledgeDomain!, $limit: Int = 10, $offset: Int = 0) {
  knowledgeResources(domain: $domain, limit: $limit, offset: $offset) {
    id
    title
    description
    type
    isPremium
    isVerified
    viewCount
    ratings {
      averageRating
      totalRatings
    }
    tags
    createdAt
  }
}
```

#### AI Assistant Conversations

```graphql
query GetConversations($limit: Int = 10) {
  me {
    conversations(limit: $limit, orderBy: { lastMessageAt: DESC }) {
      id
      title
      conversationType
      lastMessageAt
      messages(limit: 1, orderBy: { createdAt: DESC }) {
        content
        role
        createdAt
      }
    }
  }
}
```

### Example Mutations

#### Create Task

```graphql
mutation CreateTask($input: CreateTaskInput!) {
  createTask(input: $input) {
    id
    title
    description
    priority
    dueDate
    milestone {
      id
      name
    }
  }
}
```

#### Start Conversation

```graphql
mutation StartConversation($input: StartConversationInput!) {
  startConversation(input: $input) {
    id
    title
    conversationType
    createdAt
  }
}
```

#### Submit Standup

```graphql
mutation SubmitStandup($input: SubmitStandupInput!) {
  submitStandup(input: $input) {
    id
    isCompleted
    standupDate
    answers {
      questionKey
      answerText
    }
  }
}
```

---

## Webhooks

The Wheel platform provides webhook integration for real-time event notifications. Webhooks can be configured in the developer settings.

### Available Events

| Event Type | Description |
|------------|-------------|
| `user.mode.changed` | User switched to a different mode |
| `progress.milestone.completed` | Milestone has been completed |
| `progress.stage.advanced` | Progress advanced to new stage |
| `task.created` | New task created |
| `task.completed` | Task marked as complete |
| `standup.submitted` | Standup submitted |
| `standup.analyzed` | AI analysis of standup completed |
| `ai.suggestion.generated` | AI generated a suggestion |
| `marketplace.request.created` | New service request created |
| `marketplace.proposal.submitted` | New proposal submitted |
| `engagement.created` | New engagement started |
| `engagement.milestone.completed` | Engagement milestone completed |

### Webhook Format

```json
{
  "event": "task.completed",
  "timestamp": "2025-04-26T15:30:00Z",
  "data": {
    "taskId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Complete user authentication",
    "completedBy": "550e8400-e29b-41d4-a716-446655440111",
    "milestoneId": "550e8400-e29b-41d4-a716-446655440222"
  }
}
```

### Webhook Security

Webhooks include a signature header for verification:

```
X-Wheel-Signature: sha256=...
```

The signature is generated using HMAC-SHA256 with your webhook secret.

---

## Rate Limiting

API requests are subject to rate limiting to protect the system from abuse:

| API Type | Limit | Time Window |
|----------|-------|-------------|
| REST API | 100 | Per minute |
| GraphQL API | 60 | Per minute |
| Webhooks | 10 | Per second |

Rate limiting headers are included in API responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 93
X-RateLimit-Reset: 1619283624
```

---

## Error Handling

All API endpoints use standard HTTP status codes and return a consistent error format:

```json
{
  "error": {
    "code": "resource_not_found",
    "message": "The requested resource could not be found",
    "details": {
      "resourceType": "Task",
      "resourceId": "550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

Common error codes:

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `invalid_request` | The request was malformed |
| 401 | `unauthorized` | Authentication is required |
| 403 | `forbidden` | Insufficient permissions |
| 404 | `resource_not_found` | The requested resource doesn't exist |
| 409 | `conflict` | The request conflicts with current state |
| 422 | `validation_failed` | The request failed validation |
| 429 | `rate_limit_exceeded` | Too many requests |
| 500 | `internal_error` | Server error occurred |

---

## API Versioning

The Wheel API is versioned to maintain backward compatibility:

- REST API: `/api/v1/...`
- GraphQL API: Schema versioning with directives

Major releases may introduce breaking changes with sufficient notice to users.

---

## SDKs and Client Libraries

Official client libraries are available for popular programming languages:

- JavaScript/TypeScript (React, Node.js)
- Python
- Ruby
- Go
- Java
- Swift (iOS)
- Kotlin (Android)

Example usage with JavaScript SDK:

```javascript
import { WheelClient } from '@wheel/sdk';

const wheel = new WheelClient({
  apiKey: 'your-api-key',
  mode: 'founder'
});

// Get user profile
const profile = await wheel.users.getProfile();

// Create a task
const task = await wheel.tasks.create({
  title: 'Complete API integration',
  description: 'Integrate The Wheel API into our application',
  priority: 'high',
  dueDate: '2025-05-15T00:00:00Z'
});
```

---

## Developer Resources

- [API Explorer](/docs/api-explorer)
- [Getting Started Guide](/docs/api-getting-started)
- [Authentication Guide](/docs/api-authentication)
- [Webhook Implementation Guide](/docs/webhook-implementation)
- [Sample Applications](/docs/sample-apps)
- [Community & Support](/community/developers)
