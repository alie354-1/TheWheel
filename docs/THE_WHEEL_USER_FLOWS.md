# THE WHEEL: USER FLOWS & REQUIREMENTS

## Core User Flows

This document outlines the key user flows within The Wheel platform, capturing the user journey through each of the seven core system pillars. These flows represent the primary pathways that users will follow to accomplish their goals within the platform.

---

## 1. Onboarding & Identity Setup Flow

### Initial Onboarding
1. **User Registration**
   * User signs up with email/password or social provider
   * System collects basic profile information
   * User indicates their primary role (founder, advisor, service provider, investor)

2. **Mode Personalization**
   * Based on primary role, system creates initial mode
   * User customizes mode appearance and preferences
   * System explains the concept of modes and context switching

3. **Goal Setting**
   * User specifies their immediate goals on the platform
   * System suggests relevant features based on goals
   * Initial dashboard is configured based on selections

4. **Company Association**
   * User either creates a new company or joins existing one
   * If creating: collects company stage, industry, team size
   * If joining: associates user with company based on invitation

### Mode Management
1. **Adding New Modes**
   * User selects "Add New Mode" from profile
   * Selects role type for the new mode
   * Customizes appearance and preferences
   * Sets privacy levels for mode-specific data

2. **Mode Switching**
   * User clicks on mode switcher in global navigation
   * Views list of available modes
   * Selects desired mode
   * System preserves previous mode's context and loads new mode context

3. **Mode Context Management**
   * User pins important items to mode-specific dashboard
   * Sets notification preferences for each mode
   * Configures which integrations are active in each mode
   * Manages visibility of activities across modes

**User Story Focus:** US-1.1, US-1.2, US-1.3

---

## 2. Progress Tracking Flow

### Domain Progress Setup
1. **Initial Domain Assessment**
   * System presents assessment questionnaire for each domain
   * User completes assessment to establish baseline
   * System generates initial progress state across domains
   * Visualizes current stage in each domain on dashboard

2. **Domain Prioritization**
   * User reviews suggested domain priorities
   * Adjusts priority levels for domains based on immediate needs
   * Sets target completion dates for high-priority domains
   * System adjusts dashboard visualization based on priorities

### Task Management
1. **Task Creation and Organization**
   * User manually creates tasks within domains
   * Alternatively, accepts AI-suggested tasks
   * Sets dependencies between tasks
   * Assigns tasks to team members if applicable

2. **Task Progress Tracking**
   * User marks tasks as complete
   * System automatically updates domain progress
   * Visualizes impact of completed tasks on overall progress
   * Generates milestone achievements when thresholds are reached

3. **Progress Review**
   * User reviews weekly progress summary
   * Identifies blocked or delayed areas
   * Adjusts priorities based on progress
   * System generates suggestions for addressing blockers

**User Story Focus:** US-2.1, US-2.2, US-2.3

---

## 3. Knowledge Hub Flow

### Resource Discovery
1. **Domain-Specific Resource Browsing**
   * User navigates to Knowledge Hub section
   * Selects specific domain (legal, financial, etc.)
   * Browses categorized resources
   * Filters by company stage, resource type, or tags

2. **Contextual Resource Recommendations**
   * Based on current tasks and progress, system suggests relevant resources
   * Highlights recommended resources on dashboard
   * Presents "just in time" resource cards when user is working in related areas
   * Allows user to save recommendations for later

### Template Utilization
1. **Template Selection and Customization**
   * User browses template library
   * Selects appropriate template (legal doc, financial model, etc.)
   * Customizes template with guided form
   * System generates completed document from inputs

2. **Document Management**
   * User saves completed document to personal library
   * Optionally shares with team members
   * Sets reminders for document review/updates
   * Exports in various formats as needed

### Community Knowledge Contribution
1. **Resource Contribution**
   * User submits new resource to knowledge hub
   * Adds metadata (domain, tags, description)
   * System routes for verification if needed
   * Once approved, resource becomes available to community

2. **Resource Rating and Feedback**
   * User rates resources after using them
   * Provides qualitative feedback
   * System uses ratings to improve recommendations
   * Highlights top-rated resources in each category

**User Story Focus:** US-3.1, US-3.2, US-3.3

---

## 4. AI Cofounder Flow

### Daily Standup Workflow
1. **Standup Input**
   * User receives standup prompt (daily or configurable)
   * Enters accomplishments, blockers, and plans
   * Optionally links to specific tasks or milestones
   * Submits standup for AI analysis

2. **Standup Analysis**
   * AI analyzes standup content for patterns, risks, opportunities
   * Generates insights based on historical data
   * Suggests actions to address blockers
   * Updates progress tracker based on reported accomplishments

3. **Standup Follow-up**
   * User reviews AI analysis
   * Accepts or modifies suggested actions
   * Converts suggestions to tasks if desired
   * System schedules follow-ups for persistent blockers

### Document Collaboration
1. **Document Creation with AI**
   * User selects document type to create
   * Provides initial parameters or outline
   * AI generates draft version
   * User reviews and edits with real-time AI suggestions

2. **Document Review and Improvement**
   * User submits existing document for AI review
   * AI analyzes for completeness, clarity, and effectiveness
   * Suggests improvements with explanations
   * User accepts or modifies suggestions iteratively

### Strategic Decision Support
1. **Decision Framing**
   * User presents strategic decision to be made
   * System guides through structured decision framework
   * AI helps articulate options and considerations
   * User refines decision parameters

2. **Analysis and Recommendation**
   * AI analyzes decision options against criteria
   * Presents pros/cons and potential outcomes
   * Suggests additional considerations
   * User makes informed decision and records rationale

**User Story Focus:** US-4.1, US-4.2, US-4.3

---

## 5. Tech Hub Flow

### Tech Stack Selection
1. **Requirements Specification**
   * User identifies technical needs and constraints
   * Specifies scale, budget, timeline factors
   * Indicates team skill preferences
   * Sets priority for different technical factors

2. **Stack Recommendation**
   * System generates tailored tech stack recommendations
   * Presents comparison of alternatives
   * Provides reasoning for each recommendation
   * User can adjust parameters to see impact on recommendations

3. **Stack Adoption**
   * User selects preferred stack
   * System provides implementation guidelines
   * Suggests learning resources for team
   * Creates tech roadmap based on selection

### Starter Codebase Utilization
1. **Project Template Selection**
   * User browses starter project templates
   * Filters by tech stack, application type
   * Reviews template features and documentation
   * Selects preferred template

2. **Customization and Deployment**
   * User configures template parameters
   * Customizes branding and core features
   * System generates complete codebase
   * Assists with initial deployment setup

### Infrastructure Management
1. **Infrastructure Planning**
   * User specifies infrastructure requirements
   * System recommends appropriate infrastructure pattern
   * Generates cost estimates for different options
   * User selects preferred approach

2. **Deployment and Monitoring**
   * System generates Infrastructure as Code templates
   * Guides user through cloud provider setup
   * Assists with deployment process
   * Sets up basic monitoring and alerts

**User Story Focus:** US-5.1, US-5.2, US-5.3

---

## 6. Community Infrastructure Flow

### Community Engagement
1. **Group Discovery and Joining**
   * User explores available community groups
   * Filters by industry, stage, interests
   * Requests to join relevant groups
   * System suggests groups based on profile

2. **Discussion Participation**
   * User browses active discussions
   * Contributes to conversations
   * Asks questions to the community
   * Receives notifications for relevant activity

3. **Event Participation**
   * User discovers community events
   * Registers for virtual or in-person events
   * Receives reminders and pre-event materials
   * Provides feedback after event completion

### Peer Connection
1. **Peer Matching**
   * User opts into peer matching program
   * Specifies matching preferences (industry, stage, location)
   * System suggests potential peer matches
   * User initiates connection requests

2. **Peer Interaction**
   * Connected peers schedule meetings
   * System provides discussion guides and templates
   * Users share resources and insights
   * Both provide feedback on value of connection

### Founder Health
1. **Wellness Assessment**
   * User completes optional wellness check-in
   * Receives personalized wellness score
   * System provides benchmarking against anonymized peers
   * Suggests resources based on results

2. **Support Engagement**
   * User joins founder support circles
   * Participates in guided wellness activities
   * Accesses mental health resources
   * Sets wellness goals with progress tracking

**User Story Focus:** US-6.1, US-6.2, US-6.3

---

## 7. Marketplace Flow

### Service Provider Discovery
1. **Need Specification**
   * User identifies service need (legal, design, marketing, etc.)
   * Specifies requirements and constraints
   * Sets budget range and timeline
   * Indicates preferred provider characteristics

2. **Provider Matching**
   * System presents matched service providers
   * User filters and sorts results
   * Reviews provider profiles, ratings, and examples
   * Shortlists potential providers

### Service Engagement
1. **RFP Creation**
   * User creates request for proposal
   * System assists with RFP structure and content
   * User specifies deliverables and evaluation criteria
   * Sends RFP to selected providers

2. **Proposal Review and Selection**
   * User receives provider proposals
   * System provides comparison tools
   * User evaluates options with decision support
   * Selects provider and initiates engagement

3. **Project Management**
   * User and provider define milestones
   * System facilitates communication
   * Tracks progress against milestones
   * Manages document sharing and feedback

4. **Payment and Completion**
   * System manages milestone-based payments
   * Holds funds in escrow if needed
   * Releases payment upon milestone approval
   * Facilitates final review and feedback

### Partner Integration
1. **Partner Exploration**
   * User browses platform partners
   * Discovers special offers and integrations
   * Compares partner options
   * Selects desired partners

2. **Partner Onboarding**
   * User activates partner integration
   * System guides through connection process
   * Establishes data sharing permissions
   * Completes integration setup

**User Story Focus:** US-7.1, US-7.2, US-7.3

---

## Cross-Pillar User Flows

### Integrated Dashboard Experience
1. **Personalized Dashboard Configuration**
   * User customizes layout of main dashboard
   * Selects widgets from different pillars
   * Sets refresh frequency and data display preferences
   * Creates multiple dashboard views for different purposes

2. **Cross-Pillar Notification Management**
   * User sets notification preferences across all pillars
   * Creates rules for priority notifications
   * Configures delivery methods (email, in-app, mobile)
   * Sets quiet hours and batching preferences

### Company Management
1. **Team Member Management**
   * User invites team members to platform
   * Assigns roles and permissions
   * Sets up team structure and reporting
   * Configures visibility of company data

2. **Company Settings Administration**
   * User manages company profile information
   * Configures company-wide defaults and policies
   * Sets up team-wide integrations
   * Manages subscription and billing information

---

## Detailed Requirements by Pillar

### 1. Identity and Mode System Requirements

#### Functional Requirements
- Support for multiple user modes with distinct preferences and permissions
- Seamless context preservation when switching between modes
- Visual customization of mode appearance
- Privacy controls for sharing data between modes
- Default modes for founder, advisor, investor, and service provider

#### Technical Requirements
- Unified user identity with mode-specific context storage
- Database schema supporting multi-modal user profiles
- Secure permission model for mode-specific data access
- Efficient state management for mode context switching
- Cross-mode activity logging with privacy controls

### 2. Dynamic Progress Tracker Requirements

#### Functional Requirements
- Multi-domain progress visualization (product, fundraising, team, legal, growth, operations)
- Task creation, management, and dependency tracking
- Milestone and stage progression visualization
- AI-generated task and focus recommendations
- Progress sharing with advisors and team members

#### Technical Requirements
- Domain progress calculation algorithms
- Dependency resolution for complex task relationships
- Machine learning models for task recommendation
- Data visualization components for progress tracking
- Integration with standup and AI analysis systems

### 3. Knowledge Hub Requirements

#### Functional Requirements
- Domain-categorized resource repository
- Template library with customization capabilities
- Context-aware resource recommendations
- Community contribution and rating system
- Resource sharing and permission management

#### Technical Requirements
- Content management system for various resource types
- Template engine with variable substitution
- Recommendation algorithms based on user context
- Rating and moderation system for community content
- Version control for templates and resources

### 4. AI Cofounder Requirements

#### Functional Requirements
- Daily standup analysis and insight generation
- Document creation and improvement assistance
- Strategic decision support frameworks
- Pattern recognition across user activities
- Cross-domain risk and opportunity identification

#### Technical Requirements
- Natural language processing for standup analysis
- Document analysis and generation capabilities
- Decision modeling and simulation algorithms
- User activity pattern recognition models
- Secure handling of sensitive business information

### 5. Tech Hub Requirements

#### Functional Requirements
- Tech stack recommendation based on requirements
- Starter codebase repository with customization
- Infrastructure as Code template generation
- Cloud provider integration guidance
- Technical resource recommendations and learning paths

#### Technical Requirements
- Decision tree algorithms for stack recommendations
- Code repository management and generation
- IaC template engine for multiple cloud providers
- Deployment workflow automation
- Integration with external development tools

### 6. Community Infrastructure Requirements

#### Functional Requirements
- Community group formation and management
- Discussion forums with topic organization
- Event management and scheduling
- Peer matching and relationship tracking
- Founder health assessment and resources

#### Technical Requirements
- Real-time and asynchronous communication platforms
- Event management and calendar integration
- Matching algorithms for peer connections
- Privacy-preserving wellness data management
- Anonymized benchmarking capabilities

### 7. Marketplace and Partner Ecosystem Requirements

#### Functional Requirements
- Service provider profiles and verification
- RFP creation and management tools
- Proposal comparison and selection tools
- Project milestone tracking and payment processing
- Partner integration activation and management

#### Technical Requirements
- Provider matching algorithms
- Document generation for proposals and agreements
- Secure payment processing and escrow services
- Project management and milestone tracking
- API integration with partner services
