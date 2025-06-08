# The Wheel - Community Module Documentation

## Overview

The Community Module transforms The Wheel from an isolated productivity tool into a purposeful, structured network where portfolio companies can connect with peers, advisors, and experts for contextual support, knowledge sharing, and collaborative problem-solving throughout their startup journey.

This standalone module implements a comprehensive community infrastructure that can be tested independently before integration with the main application.

## Architecture

The Community Module follows a component-based architecture with clear separation of concerns:

```
TheWheel-Community/
├── src/
│   ├── components/       # Reusable UI components
│   ├── services/         # API and data services
│   ├── utils/            # Helper functions and utilities
│   ├── types/            # TypeScript type definitions
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
├── docs/                 # Documentation
├── migrations/           # Database migrations
├── public/               # Static assets
```

## Core Features

### 1. Tiered Community Structure

The community is organized into three concentric rings:

- **Core Portfolio Circle**: Current portfolio companies with highest trust level
- **Alumni Network**: Successfully exited portfolio companies in mentorship roles
- **Extended Ecosystem**: LPs, industry experts, advisors, and service providers

### 2. Dynamic Group Ecosystem

Groups are categorized into four main types:

- **Stage-Based Cohorts**: Groups based on company growth stage
- **Functional Excellence Guilds**: Cross-stage expertise in specific domains
- **Industry Vertical Chambers**: Market-specific insights and collaboration
- **Geographic Hubs**: Regional focus and local ecosystem connections

### 3. Signature Programs & Events

Structured interaction formats to drive meaningful engagement:

- **Founder Forge Sessions**: Hot seat problem-solving with peer founders
- **Breakthrough Boards**: Virtual board meetings with peer observers
- **Demo Day Plus**: Live product demos with feedback and partnership opportunities
- **Strategic Think Tanks**: Deep dives on industry trends and opportunities
- **Scale Success Stories**: Case studies and lessons learned from portfolio companies

### 4. Intelligent Discussion Framework

Smart conversation tools to maximize knowledge sharing:

- **AI-Powered Topic Clustering**: Automatically groups related discussions
- **Expertise Matching**: Connects questions to relevant experienced founders
- **Context-Aware Suggestions**: Recommends relevant discussions based on company context
- **Resolution Tracking**: Follows up on whether advice was implemented and effective

### 5. Recommendation Engine

Facilitates valuable connections across the portfolio:

- **Vendor & Service Recommendations**: Vetted by peer portfolio companies
- **Talent Pipeline Sharing**: Candidates who might fit elsewhere in the portfolio
- **Customer Introductions**: Cross-portfolio sales opportunities
- **Partnership Opportunities**: Strategic collaborations between portfolio companies
- **Investor Warm Introductions**: Follow-on funding connections

### 6. Gamification & Recognition

Incentivizes and rewards valuable contributions:

- **Contribution Scoring**: Points for knowledge sharing, introductions, mentorship
- **Recognition Programs**: MVP founders, breakthrough achievements, innovation spotlights
- **Collaboration Champions**: Rewards for cross-portfolio partnerships

### 7. Data-Driven Insights

Provides valuable portfolio intelligence:

- **Collective Performance Metrics**: Anonymized portfolio health indicators
- **Trend Identification**: Early signals across portfolio companies
- **Benchmark Comparisons**: How companies compare within their cohort
- **Success Pattern Analysis**: What strategies correlate with positive outcomes

## Database Schema

The community module requires several database tables to support its functionality. The core tables include:

1. **portfolio_companies**: Registry of companies in the portfolio
2. **community_groups**: Different types of community groups
3. **group_memberships**: User participation in groups
4. **discussion_threads**: Conversations within groups
5. **thread_replies**: Responses to discussions
6. **community_events**: Scheduled community activities
7. **event_registrations**: Event participation tracking
8. **contribution_scores**: User reputation system
9. **expert_profiles**: Detailed expertise mapping
10. **recommendation_interactions**: ML training data for recommendations

See the SQL migrations for detailed schema definitions.

## Component Library

### Group Components

- **GroupCard**: Displays group information with join/leave actions
- **GroupDirectory**: Browsable listing of available groups
- **GroupHeader**: Group title, description, and key metrics
- **GroupMemberList**: Displays and manages group membership
- **CreateGroupForm**: Interface for creating new groups

### Discussion Components

- **ThreadList**: Displays discussion threads with filtering options
- **ThreadDetail**: Full thread with replies and actions
- **CreateThreadForm**: Interface for starting new discussions
- **ReplyComposer**: Rich text editor for replies with mentions
- **ExpertResponseBadge**: Highlights verified expert contributions

### Event Components

- **EventCalendar**: Calendar view of upcoming community events
- **EventCard**: Displays event information with registration options
- **EventDetail**: Full event information with attendee list
- **CreateEventForm**: Interface for creating new events
- **EventRegistrationForm**: Interface for event registration

### Profile Components

- **ExpertiseProfile**: Displays user expertise and contributions
- **ContributionMetrics**: Visualizes user's community impact
- **AchievementGallery**: Displays earned badges and recognition
- **ProfileEditor**: Interface for updating expertise and preferences

### Recommendation Components

- **RecommendedGroups**: Suggests relevant groups to join
- **ExpertMatcher**: Connects questions with relevant experts
- **PartnershipSuggestions**: Identifies potential collaborations
- **RelatedDiscussions**: Shows relevant threads based on context

## Services

### API Services

- **CommunityService**: Manages groups and membership
- **DiscussionService**: Handles threads and replies
- **EventService**: Manages community events
- **ProfileService**: Handles user profiles and expertise
- **RecommendationService**: Provides intelligent suggestions

### Utility Services

- **PermissionService**: Handles access control
- **NotificationService**: Manages community notifications
- **AnalyticsService**: Tracks engagement and impact
- **AIService**: Provides AI-powered features

## Integration Points

The Community Module is designed to be standalone initially but includes clear integration points for connecting with the main application:

1. **Authentication**: Uses a pluggable auth provider that can be connected to the main app
2. **User Profiles**: Extends existing user profiles with community-specific data
3. **Notifications**: Can be integrated with the main notification system
4. **Analytics**: Feeds community metrics into the main analytics dashboard

## Development Roadmap

### Phase 1: Foundation (Weeks 1-2)
- Database schema implementation
- Core API services
- Basic group and membership components

### Phase 2: Discussion System (Weeks 3-4)
- Thread and reply components
- Content moderation tools
- Expert response system

### Phase 3: Events & Programs (Weeks 5-6)
- Event management components
- Program templates
- Registration system

### Phase 4: Intelligence Layer (Weeks 7-8)
- Recommendation engine
- AI-powered features
- Analytics dashboard

### Phase 5: Integration (Weeks 9-10)
- Connection with main application
- Migration of test data
- Performance optimization

## Testing Strategy

The Community Module includes comprehensive testing:

1. **Unit Tests**: For individual components and services
2. **Integration Tests**: For service interactions
3. **E2E Tests**: For complete user flows
4. **Performance Tests**: For scalability and responsiveness

## Deployment

The module can be deployed in three modes:

1. **Standalone**: For independent testing and development
2. **Side-by-Side**: Running alongside the main application with limited integration
3. **Fully Integrated**: Completely integrated with the main application

## Metrics & Success Criteria

The Community Module's success will be measured by:

1. **Engagement Rate**: Percentage of users actively participating
2. **Knowledge Sharing**: Volume and quality of discussions
3. **Connection Value**: Successful introductions and partnerships
4. **Problem Resolution**: Issues solved through community support
5. **User Satisfaction**: NPS and satisfaction surveys

## Conclusion

The Community Module provides a powerful extension to The Wheel platform, creating a structured environment for portfolio companies to connect, collaborate, and grow together. Its component-based architecture allows for independent testing and gradual integration with the main application.
