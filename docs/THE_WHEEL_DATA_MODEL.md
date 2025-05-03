# THE WHEEL: DATA MODEL DOCUMENTATION

## Overview

This document details the comprehensive data model for The Wheel platform, including entity relationships, attribute definitions, and database schema specifications. The data model is designed to support all seven core pillars of the platform while ensuring scalability, security, and performance.

---

## Entity Relationship Diagrams

### Core Identity and Authentication Model

```mermaid
erDiagram
    AUTH_USERS ||--o{ USER_PROFILES : has
    USER_PROFILES ||--o{ USER_MODES : has
    USER_MODES ||--o{ MODE_PREFERENCES : has
    USER_MODES ||--o{ MODE_CONTEXT : has
    USER_PROFILES ||--o{ COMPANIES : belongs_to
    COMPANIES ||--o{ COMPANY_MEMBERS : has
    
    AUTH_USERS {
        uuid id PK
        string email
        string encrypted_password
        timestamp created_at
        timestamp last_sign_in
    }
    
    USER_PROFILES {
        uuid id PK
        uuid user_id FK
        string name
        string bio
        string avatar_url
        jsonb contact_info
        string default_mode
        boolean onboarding_completed
        timestamp created_at
        timestamp updated_at
    }
    
    USER_MODES {
        uuid id PK
        uuid user_id FK
        string mode
        string display_name
        string icon
        string primary_color
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    MODE_PREFERENCES {
        uuid id PK
        uuid user_mode_id FK
        jsonb preferences
        timestamp created_at
        timestamp updated_at
    }
    
    MODE_CONTEXT {
        uuid id PK
        uuid user_mode_id FK
        jsonb recent_activity
        jsonb pinned_items
        jsonb last_viewed_entities
        timestamp created_at
        timestamp updated_at
    }
    
    COMPANIES {
        uuid id PK
        string name
        string logo_url
        string industry
        string stage
        integer team_size
        timestamp founded_date
        uuid created_by_user_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    COMPANY_MEMBERS {
        uuid id PK
        uuid company_id FK
        uuid user_id FK
        string role
        jsonb permissions
        boolean is_admin
        timestamp joined_at
        timestamp updated_at
    }
```

### Progress Tracking Model

```mermaid
erDiagram
    DOMAIN_STAGES ||--o{ MILESTONES : contains
    MILESTONES ||--o{ TASKS : contains
    TASKS ||--o{ TASK_DEPENDENCIES : has
    USER_PROFILES ||--o{ DOMAIN_PROGRESS : tracks
    DOMAIN_PROGRESS ||--o{ MILESTONE_HISTORY : records
    TASKS }o--|| AUTH_USERS : assigned_to
    
    DOMAIN_STAGES {
        uuid id PK
        progress_domain domain
        string name
        text description
        integer order_index
        integer required_completion_percentage
        timestamp created_at
        timestamp updated_at
    }
    
    MILESTONES {
        uuid id PK
        uuid domain_stage_id FK
        string name
        text description
        boolean is_completed
        integer completion_percentage
        integer estimated_time_hours
        timestamp created_at
        timestamp updated_at
    }
    
    TASKS {
        uuid id PK
        uuid milestone_id FK
        uuid user_id FK
        string title
        text description
        string priority
        boolean is_completed
        timestamp due_date
        uuid assignee_id FK
        boolean is_ai_generated
        timestamp completed_at
        timestamp created_at
        timestamp updated_at
    }
    
    TASK_DEPENDENCIES {
        uuid id PK
        uuid task_id FK
        uuid depends_on_task_id FK
        timestamp created_at
    }
    
    DOMAIN_PROGRESS {
        uuid id PK
        uuid user_id FK
        progress_domain domain
        uuid current_stage_id FK
        integer completion_percentage
        timestamp created_at
        timestamp updated_at
    }
    
    MILESTONE_HISTORY {
        uuid id PK
        uuid domain_progress_id FK
        uuid milestone_id FK
        timestamp completed_at
    }
```

### Knowledge Hub Model

```mermaid
erDiagram
    KNOWLEDGE_RESOURCES ||--o{ RESOURCE_RATINGS : receives
    KNOWLEDGE_RESOURCES ||--o{ USER_RESOURCE_INTERACTIONS : has
    KNOWLEDGE_RESOURCES ||--o{ TEMPLATES : provides
    TEMPLATES ||--o{ USER_DOCUMENTS : based_on
    USER_PROFILES ||--o{ USER_DOCUMENTS : owns
    AUTH_USERS ||--o{ RESOURCE_RATINGS : gives
    
    KNOWLEDGE_RESOURCES {
        uuid id PK
        string title
        text description
        knowledge_domain domain
        resource_type type
        string content_url
        jsonb content
        string[] tags
        string[] stage_relevance
        boolean is_premium
        uuid author_id FK
        boolean is_verified
        integer view_count
        timestamp created_at
        timestamp updated_at
    }
    
    RESOURCE_RATINGS {
        uuid id PK
        uuid resource_id FK
        uuid user_id FK
        integer rating
        text comment
        timestamp created_at
        timestamp updated_at
    }
    
    USER_RESOURCE_INTERACTIONS {
        uuid id PK
        uuid user_id FK
        uuid resource_id FK
        string interaction_type
        timestamp created_at
    }
    
    TEMPLATES {
        uuid id PK
        uuid resource_id FK
        jsonb template_schema
        jsonb default_values
        string version
        timestamp created_at
    }
    
    USER_DOCUMENTS {
        uuid id PK
        uuid user_id FK
        string title
        uuid template_id FK
        jsonb content
        boolean is_draft
        timestamp created_at
        timestamp updated_at
    }
```

### AI Cofounder Model

```mermaid
erDiagram
    USER_PROFILES ||--o{ STANDUPS : creates
    STANDUPS ||--o{ STANDUP_ANALYSES : generates
    STANDUPS ||--o{ STANDUP_ANSWERS : contains
    USER_PROFILES ||--o{ AI_CONVERSATIONS : has
    AI_CONVERSATIONS ||--o{ CONVERSATION_MESSAGES : contains
    AI_CONVERSATIONS ||--o{ CONVERSATION_MEMORIES : stores
    USER_PROFILES ||--o{ DOCUMENT_COLLABORATIONS : uses
    DOCUMENT_COLLABORATIONS ||--o{ DOCUMENT_REVISIONS : contains
    
    STANDUPS {
        uuid id PK
        uuid user_id FK
        timestamp standup_date
        boolean is_completed
        string status
        timestamp created_at
        timestamp updated_at
    }
    
    STANDUP_ANSWERS {
        uuid id PK
        uuid standup_id FK
        string question_key
        text answer_text
        timestamp created_at
    }
    
    STANDUP_ANALYSES {
        uuid id PK
        uuid standup_id FK
        jsonb analysis_result
        jsonb suggested_tasks
        jsonb identified_risks
        timestamp created_at
    }
    
    AI_CONVERSATIONS {
        uuid id PK
        uuid user_id FK
        string conversation_type
        string title
        timestamp created_at
        timestamp updated_at
        timestamp last_message_at
    }
    
    CONVERSATION_MESSAGES {
        uuid id PK
        uuid conversation_id FK
        string role
        text content
        jsonb metadata
        timestamp created_at
    }
    
    CONVERSATION_MEMORIES {
        uuid id PK
        uuid conversation_id FK
        text memory_type
        jsonb memory_content
        integer importance
        timestamp created_at
        timestamp updated_at
    }
    
    DOCUMENT_COLLABORATIONS {
        uuid id PK
        uuid user_id FK
        string document_type
        string title
        jsonb document_metadata
        timestamp created_at
        timestamp updated_at
    }
    
    DOCUMENT_REVISIONS {
        uuid id PK
        uuid document_id FK
        integer revision_number
        jsonb content
        jsonb ai_suggestions
        boolean ai_suggestions_applied
        timestamp created_at
    }
```

### Tech Hub Model

```mermaid
erDiagram
    TECH_STACK_RECOMMENDATIONS ||--o{ TECH_STACK_COMPONENTS : contains
    USER_PROFILES ||--o{ TECH_STACK_RECOMMENDATIONS : receives
    STARTER_CODEBASES ||--o{ STARTER_CODEBASE_VERSIONS : has
    USER_PROFILES ||--o{ USER_TECH_STACKS : implements
    USER_TECH_STACKS ||--o{ USER_STACK_COMPONENTS : contains
    DEPLOYMENT_TEMPLATES ||--o{ DEPLOYMENT_CONFIGURATIONS : provides
    USER_PROFILES ||--o{ DEPLOYMENT_CONFIGURATIONS : uses
    
    TECH_STACK_RECOMMENDATIONS {
        uuid id PK
        uuid user_id FK
        string recommendation_name
        jsonb requirements
        timestamp created_at
        timestamp updated_at
    }
    
    TECH_STACK_COMPONENTS {
        uuid id PK
        uuid recommendation_id FK
        string component_type
        string name
        text description
        integer confidence_score
        jsonb alternatives
        string documentation_url
        timestamp created_at
    }
    
    STARTER_CODEBASES {
        uuid id PK
        string name
        text description
        string[] tags
        string[] technologies
        string complexity
        string github_url
        boolean is_featured
        timestamp created_at
        timestamp updated_at
    }
    
    STARTER_CODEBASE_VERSIONS {
        uuid id PK
        uuid codebase_id FK
        string version
        string download_url
        string changelog
        timestamp created_at
    }
    
    USER_TECH_STACKS {
        uuid id PK
        uuid user_id FK
        string stack_name
        text description
        timestamp created_at
        timestamp updated_at
    }
    
    USER_STACK_COMPONENTS {
        uuid id PK
        uuid user_tech_stack_id FK
        string component_type
        string name
        string version
        timestamp added_at
    }
    
    DEPLOYMENT_TEMPLATES {
        uuid id PK
        string name
        text description
        string cloud_provider
        string[] technologies
        jsonb template_schema
        string template_content_url
        timestamp created_at
        timestamp updated_at
    }
    
    DEPLOYMENT_CONFIGURATIONS {
        uuid id PK
        uuid user_id FK
        uuid template_id FK
        string configuration_name
        jsonb configuration_values
        jsonb deployment_status
        timestamp created_at
        timestamp updated_at
    }
```

### Community Model

```mermaid
erDiagram
    COMMUNITY_GROUPS ||--o{ GROUP_MEMBERS : has
    COMMUNITY_GROUPS ||--o{ GROUP_DISCUSSIONS : contains
    GROUP_DISCUSSIONS ||--o{ DISCUSSION_POSTS : contains
    DISCUSSION_POSTS ||--o{ POST_REACTIONS : receives
    COMMUNITY_GROUPS ||--o{ GROUP_EVENTS : organizes
    USER_PROFILES ||--o{ GROUP_EVENTS_ATTENDEES : attends
    GROUP_EVENTS ||--o{ GROUP_EVENTS_ATTENDEES : has
    USER_PROFILES ||--o{ PEER_CONNECTIONS : initiates
    USER_PROFILES ||--o{ PEER_CONNECTIONS : receives
    USER_PROFILES ||--o{ WELLNESS_ASSESSMENTS : completes
    
    COMMUNITY_GROUPS {
        uuid id PK
        string name
        text description
        string group_type
        string[] tags
        string visibility
        uuid created_by_user_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    GROUP_MEMBERS {
        uuid id PK
        uuid group_id FK
        uuid user_id FK
        string role
        boolean is_admin
        timestamp joined_at
        timestamp updated_at
    }
    
    GROUP_DISCUSSIONS {
        uuid id PK
        uuid group_id FK
        string title
        text description
        boolean is_pinned
        boolean is_locked
        uuid created_by_user_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    DISCUSSION_POSTS {
        uuid id PK
        uuid discussion_id FK
        uuid author_id FK
        text content
        jsonb attachments
        timestamp created_at
        timestamp updated_at
    }
    
    POST_REACTIONS {
        uuid id PK
        uuid post_id FK
        uuid user_id FK
        string reaction_type
        timestamp created_at
    }
    
    GROUP_EVENTS {
        uuid id PK
        uuid group_id FK
        string title
        text description
        timestamp event_datetime
        integer duration_minutes
        string location
        string event_url
        integer max_attendees
        uuid organizer_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    GROUP_EVENTS_ATTENDEES {
        uuid id PK
        uuid event_id FK
        uuid user_id FK
        string status
        timestamp registered_at
    }
    
    PEER_CONNECTIONS {
        uuid id PK
        uuid requestor_id FK
        uuid recipient_id FK
        string status
        string connection_type
        text notes
        timestamp requested_at
        timestamp updated_at
    }
    
    WELLNESS_ASSESSMENTS {
        uuid id PK
        uuid user_id FK
        integer stress_level
        integer burnout_risk
        integer work_life_balance
        text symptoms
        jsonb assessment_responses
        timestamp created_at
    }
```

### Marketplace Model

```mermaid
erDiagram
    SERVICE_PROVIDERS ||--o{ PROVIDER_SERVICES : offers
    SERVICE_PROVIDERS ||--o{ PROVIDER_RATINGS : receives
    USER_PROFILES ||--o{ PROVIDER_RATINGS : gives
    USER_PROFILES ||--o{ SERVICE_REQUESTS : creates
    SERVICE_REQUESTS ||--o{ SERVICE_PROPOSALS : receives
    SERVICE_PROVIDERS ||--o{ SERVICE_PROPOSALS : submits
    SERVICE_PROPOSALS ||--||o ENGAGEMENTS : leads_to
    ENGAGEMENTS ||--o{ ENGAGEMENT_MILESTONES : has
    ENGAGEMENTS ||--o{ ENGAGEMENT_PAYMENTS : includes
    PLATFORM_PARTNERS ||--o{ PARTNER_OFFERS : provides
    USER_PROFILES ||--o{ PARTNER_ACTIVATIONS : uses
    
    SERVICE_PROVIDERS {
        uuid id PK
        uuid user_id FK
        string business_name
        text description
        string[] service_categories
        string logo_url
        jsonb contact_info
        boolean is_verified
        timestamp created_at
        timestamp updated_at
    }
    
    PROVIDER_SERVICES {
        uuid id PK
        uuid provider_id FK
        string name
        text description
        string category
        integer base_price
        string price_unit
        jsonb service_details
        timestamp created_at
        timestamp updated_at
    }
    
    PROVIDER_RATINGS {
        uuid id PK
        uuid provider_id FK
        uuid user_id FK
        integer rating
        text review
        string engagement_type
        timestamp created_at
        timestamp updated_at
    }
    
    SERVICE_REQUESTS {
        uuid id PK
        uuid user_id FK
        string title
        text description
        string[] service_categories
        integer budget_min
        integer budget_max
        timestamp deadline
        string status
        timestamp created_at
        timestamp updated_at
    }
    
    SERVICE_PROPOSALS {
        uuid id PK
        uuid request_id FK
        uuid provider_id FK
        integer price
        text proposal_content
        integer estimated_duration_days
        string status
        timestamp created_at
        timestamp updated_at
    }
    
    ENGAGEMENTS {
        uuid id PK
        uuid proposal_id FK
        uuid client_id FK
        uuid provider_id FK
        string title
        text description
        string status
        timestamp start_date
        timestamp end_date
        integer total_amount
        timestamp created_at
        timestamp updated_at
    }
    
    ENGAGEMENT_MILESTONES {
        uuid id PK
        uuid engagement_id FK
        string title
        text description
        integer percentage
        integer amount
        string status
        timestamp due_date
        timestamp completed_date
        timestamp created_at
        timestamp updated_at
    }
    
    ENGAGEMENT_PAYMENTS {
        uuid id PK
        uuid engagement_id FK
        uuid milestone_id FK
        integer amount
        string status
        string payment_processor_id
        timestamp paid_at
        timestamp created_at
        timestamp updated_at
    }
    
    PLATFORM_PARTNERS {
        uuid id PK
        string name
        text description
        string logo_url
        string partner_type
        jsonb integration_details
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    PARTNER_OFFERS {
        uuid id PK
        uuid partner_id FK
        string name
        text description
        string benefit_summary
        string redemption_url
        string promo_code
        timestamp valid_from
        timestamp valid_until
        timestamp created_at
        timestamp updated_at
    }
    
    PARTNER_ACTIVATIONS {
        uuid id PK
        uuid user_id FK
        uuid offer_id FK
        string status
        timestamp activated_at
        jsonb activation_details
        timestamp created_at
        timestamp updated_at
    }
```

### Cross-System Models

```mermaid
erDiagram
    USER_PROFILES ||--o{ SYSTEM_LOGS : generates
    USER_PROFILES ||--o{ NOTIFICATIONS : receives
    USER_PROFILES ||--o{ USER_SETTINGS : has
    APP_SETTINGS ||--o{ FEATURE_FLAGS : contains
    USER_PROFILES ||--o{ USER_FEATURE_OVERRIDES : has
    USER_PROFILES ||--o{ FEEDBACK : provides
    
    SYSTEM_LOGS {
        uuid id PK
        uuid user_id FK
        string log_type
        string action
        jsonb details
        jsonb metadata
        timestamp created_at
    }
    
    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string notification_type
        string title
        text content
        jsonb additional_data
        string source_type
        uuid source_id
        boolean is_read
        timestamp read_at
        timestamp created_at
    }
    
    USER_SETTINGS {
        uuid id PK
        uuid user_id FK
        jsonb email_preferences
        jsonb notification_preferences
        jsonb privacy_settings
        jsonb ui_preferences
        timestamp created_at
        timestamp updated_at
    }
    
    APP_SETTINGS {
        uuid id PK
        string setting_key
        jsonb setting_value
        text description
        boolean is_system
        boolean is_public
        timestamp created_at
        timestamp updated_at
    }
    
    FEATURE_FLAGS {
        uuid id PK
        string flag_key
        boolean is_enabled
        jsonb conditions
        text description
        timestamp created_at
        timestamp updated_at
    }
    
    USER_FEATURE_OVERRIDES {
        uuid id PK
        uuid user_id FK
        string flag_key
        boolean is_enabled
        timestamp created_at
        timestamp updated_at
    }
    
    FEEDBACK {
        uuid id PK
        uuid user_id FK
        string feedback_type
        integer rating
        text comment
        string source_page
        jsonb additional_data
        timestamp created_at
    }
```

---

## Data Dictionary

### Identity and Mode System

#### AUTH_USERS
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Unique identifier | PK |
| email | STRING | User's email address | UNIQUE, NOT NULL |
| encrypted_password | STRING | Encrypted password hash | NOT NULL |
| created_at | TIMESTAMP | Creation timestamp | NOT NULL |
| last_sign_in | TIMESTAMP | Last sign in timestamp | |

#### USER_PROFILES
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Unique identifier | PK |
| user_id | UUID | Reference to auth.users | FK, NOT NULL |
| name | STRING | User's full name | NOT NULL |
| bio | STRING | User's biography | |
| avatar_url | STRING | URL to avatar image | |
| contact_info | JSONB | Contact information | |
| default_mode | STRING | Default user mode | NOT NULL |
| onboarding_completed | BOOLEAN | Whether onboarding is complete | NOT NULL, DEFAULT false |
| created_at | TIMESTAMP | Creation timestamp | NOT NULL |
| updated_at | TIMESTAMP | Last update timestamp | NOT NULL |

#### USER_MODES
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Unique identifier | PK |
| user_id | UUID | Reference to auth.users | FK, NOT NULL |
| mode | STRING | Mode identifier | NOT NULL |
| display_name | STRING | Custom display name | NOT NULL |
| icon | STRING | Mode icon | NOT NULL |
| primary_color | STRING | Primary color for UI | NOT NULL |
| is_active | BOOLEAN | Whether mode is currently active | DEFAULT false |
| created_at | TIMESTAMP | Creation timestamp | NOT NULL |
| updated_at | TIMESTAMP | Last update timestamp | NOT NULL |

#### MODE_PREFERENCES
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Unique identifier | PK |
| user_mode_id | UUID | Reference to user_modes | FK, NOT NULL |
| preferences | JSONB | Mode-specific preferences | NOT NULL, DEFAULT '{}' |
| created_at | TIMESTAMP | Creation timestamp | NOT NULL |
| updated_at | TIMESTAMP | Last update timestamp | NOT NULL |

#### MODE_CONTEXT
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Unique identifier | PK |
| user_mode_id | UUID | Reference to user_modes | FK, NOT NULL |
| recent_activity | JSONB | Recent activity in this mode | NOT NULL, DEFAULT '[]' |
| pinned_items | JSONB | Pinned items for this mode | NOT NULL, DEFAULT '[]' |
| last_viewed_entities | JSONB | Last viewed entities | NOT NULL, DEFAULT '[]' |
| created_at | TIMESTAMP | Creation timestamp | NOT NULL |
| updated_at | TIMESTAMP | Last update timestamp | NOT NULL |

#### COMPANIES
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Unique identifier | PK |
| name | STRING | Company name | NOT NULL |
| logo_url | STRING | URL to logo image | |
| industry | STRING | Industry category | |
| stage | STRING | Company stage | |
| team_size | INTEGER | Team size | |
| founded_date | TIMESTAMP | Company founding date | |
| created_by_user_id | UUID | Reference to auth.users | FK, NOT NULL |
| created_at | TIMESTAMP | Creation timestamp | NOT NULL |
| updated_at | TIMESTAMP | Last update timestamp | NOT NULL |

#### COMPANY_MEMBERS
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Unique identifier | PK |
| company_id | UUID | Reference to companies | FK, NOT NULL |
| user_id | UUID | Reference to auth.users | FK, NOT NULL |
| role | STRING | Member role | NOT NULL |
| permissions | JSONB | Specific permissions | DEFAULT '{}' |
| is_admin | BOOLEAN | Whether member is admin | DEFAULT false |
| joined_at | TIMESTAMP | Join timestamp | NOT NULL |
| updated_at | TIMESTAMP | Last update timestamp | NOT NULL |

### Progress Tracking System

#### DOMAIN_STAGES
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Unique identifier | PK |
| domain | ENUM | Progress domain | NOT NULL |
| name | STRING | Stage name | NOT NULL |
| description | TEXT | Stage description | |
| order_index | INTEGER | Display order | NOT NULL |
| required_completion_percentage | INTEGER | Required % to advance | NOT NULL, DEFAULT 80 |
| created_at | TIMESTAMP | Creation timestamp | NOT NULL |
| updated_at | TIMESTAMP | Last update timestamp | NOT NULL |

#### MILESTONES
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Unique identifier | PK |
| domain_stage_id | UUID | Reference to domain_stages | FK, NOT NULL |
| name | STRING | Milestone name | NOT NULL |
| description | TEXT | Milestone description | |
| is_completed | BOOLEAN | Completion status | DEFAULT false |
| completion_percentage | INTEGER | Completion percentage | DEFAULT 0 |
| estimated_time_hours | INTEGER | Estimated hours | |
| created_at | TIMESTAMP | Creation timestamp | NOT NULL |
| updated_at | TIMESTAMP | Last update timestamp | NOT NULL |

#### TASKS
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Unique identifier | PK |
| milestone_id | UUID | Reference to milestones | FK, NOT NULL |
| user_id | UUID | Reference to auth.users | FK, NOT NULL |
| title | STRING | Task title | NOT NULL |
| description | TEXT | Task description | |
| priority | STRING | Priority level | DEFAULT 'medium' |
| is_completed | BOOLEAN | Completion status | DEFAULT false |
| due_date | TIMESTAMP | Due date | |
| assignee_id | UUID | Reference to auth.users | FK |
| is_ai_generated | BOOLEAN | Generated by AI | DEFAULT false |
| completed_at | TIMESTAMP | Completion timestamp | |
| created_at | TIMESTAMP | Creation timestamp | NOT NULL |
| updated_at | TIMESTAMP | Last update timestamp | NOT NULL |

### Knowledge Hub System

#### KNOWLEDGE_RESOURCES
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Unique identifier | PK |
| title | STRING | Resource title | NOT NULL |
| description | TEXT | Resource description | |
| domain | ENUM | Knowledge domain | NOT NULL |
| type | ENUM | Resource type | NOT NULL |
| content_url | STRING | URL to content | |
| content | JSONB | Resource content | |
| tags | STRING[] | Resource tags | |
| stage_relevance | STRING[] | Relevant company stages | |
| is_premium | BOOLEAN | Whether premium content | DEFAULT false |
| author_id | UUID | Reference to auth.users | FK |
| is_verified | BOOLEAN | Whether verified | DEFAULT false |
| view_count | INTEGER | View counter | DEFAULT 0 |
| created_at | TIMESTAMP | Creation timestamp | NOT NULL |
| updated_at | TIMESTAMP | Last update timestamp | NOT NULL |

#### TEMPLATES
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Unique identifier | PK |
| resource_id | UUID | Reference to knowledge_resources | FK, NOT NULL |
| template_schema | JSONB | Template form schema | NOT NULL |
| default_values | JSONB | Default field values | |
| version | STRING | Template version | |
| created_at | TIMESTAMP | Creation timestamp | NOT NULL |

### AI Cofounder System

#### STANDUPS
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Unique identifier | PK |
| user_id | UUID | Reference to auth.users | FK, NOT NULL |
| standup_date | TIMESTAMP | Standup date | NOT NULL |
| is_completed | BOOLEAN | Completion status | DEFAULT false |
| status | STRING | Processing status | |
| created_at | TIMESTAMP | Creation timestamp | NOT NULL |
| updated_at | TIMESTAMP | Last update timestamp | NOT NULL |

#### STANDUP_ANSWERS
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Unique identifier | PK |
| standup_id | UUID | Reference to standups | FK, NOT NULL |
| question_key | STRING | Question identifier | NOT NULL |
| answer_text | TEXT | Answer content | NOT NULL |
| created_at | TIMESTAMP | Creation timestamp | NOT NULL |

#### AI_CONVERSATIONS
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Unique identifier | PK |
| user_id | UUID | Reference to auth.users | FK, NOT NULL |
| conversation_type | STRING | Type of conversation | NOT NULL |
| title | STRING | Conversation title | |
| created_at | TIMESTAMP | Creation timestamp | NOT NULL |
| updated_at | TIMESTAMP | Last update timestamp | NOT NULL |
| last_message_at | TIMESTAMP | Last message timestamp | NOT NULL |

#### CONVERSATION_MESSAGES
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Unique identifier | PK |
| conversation_id | UUID | Reference to ai_conversations | FK, NOT NULL |
| role | STRING | Message sender role | NOT NULL |
| content | TEXT | Message content | NOT NULL |
| metadata | JSONB | Additional metadata | DEFAULT '{}' |
| created_at | TIMESTAMP | Creation timestamp | NOT NULL |

### System-Wide Components

#### SYSTEM_LOGS
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Unique identifier | PK |
| user_id | UUID | Reference to auth.users | FK |
| log_type | STRING | Log category | NOT NULL |
| action | STRING | Action performed | NOT NULL |
| details | JSONB | Detailed log data | |
| metadata | JSONB | Additional metadata | DEFAULT '{}' |
| created_at | TIMESTAMP | Creation timestamp | NOT NULL |

#### NOTIFICATIONS
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Unique identifier | PK |
| user_id | UUID | Reference to auth.users | FK, NOT NULL |
| notification_type | STRING | Type of notification | NOT NULL |
| title | STRING | Notification title | NOT NULL |
| content | TEXT | Notification content | NOT NULL |
| additional_data | JSONB | Additional data | DEFAULT '{}' |
| source_type | STRING | Source entity type | |
| source_id | UUID | Source entity ID | |
| is_read | BOOLEAN | Read status | DEFAULT false |
| read_at | TIMESTAMP | When read | |
| created_at | TIMESTAMP | Creation timestamp | NOT NULL |

#### FEATURE_FLAGS
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID | Unique identifier | PK |
| flag_key | STRING | Feature flag key | NOT NULL, UNIQUE |
| is_enabled | BOOLEAN | Whether enabled by default | DEFAULT false |
| conditions | JSONB | Conditional activation rules | DEFAULT '{}' |
| description | TEXT | Flag description | |
| created_at | TIMESTAMP | Creation timestamp | NOT NULL |
| updated_at | TIMESTAMP | Last update timestamp | NOT NULL |

---

## Database Design Considerations

### Indexing Strategy

1. **Primary Keys**: All tables have UUID primary keys to ensure uniqueness across environments

2. **Foreign Keys**: All relationships are enforced with foreign key constraints with appropriate cascading rules

3. **Performance Indexes**:
   - Multi-column indexes on frequently queried combinations
   - Text search indexes on searchable content fields
   - Expression indexes for complex query patterns

4. **Query Patterns**:
   - Domain-specific indexes for specialized query patterns
   - Partial indexes for filtered queries
   - Covering indexes for high-volume read operations

### Security Design

1. **Row Level Security**:
   - All tables implement RLS policies
   - Mode-based access control for cross-role data
   - Company-scoped permissions for team data
