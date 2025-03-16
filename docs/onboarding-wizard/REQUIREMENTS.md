# Onboarding Wizard Requirements

## Feature Overview
The Onboarding Wizard is a guided, step-by-step process for new users to help customize their experience based on their role and preferences. It now follows a two-phase approach: an initial streamlined onboarding to quickly capture essential role information, followed by a more detailed profile setup.

## Epics & User Stories

### Epic 1: Initial Onboarding (NEW ✅)
Quickly identify the user's primary role and essential information to direct them to appropriate features immediately.

#### User Stories
- **US1.1**: As a new user, I want a streamlined initial onboarding process that quickly captures my role so I can start using the platform.
- **US1.2**: As a founder, I want to quickly specify my company stage during initial onboarding so I get directed to appropriate resources (idea playground, company formation, etc).
- **US1.3**: As a company member, I want a simple process to join my company during initial onboarding so I can collaborate immediately.
- **US1.4**: As a service provider, I want to quickly specify my service categories during initial onboarding so I can be discovered appropriately.
- **US1.5**: As a user, I want my initial onboarding state saved so I can continue with detailed profile setup later.

### Epic 2: User Role Identification
Determine the user's primary role in the system to customize their subsequent onboarding experience.

#### User Stories
- **US2.1**: As a new user, I want to select my role in the system (founder, company member, service provider) so I can see relevant features and content.
- **US2.2**: As a founder, I want the system to recognize my specific needs so I get directed to appropriate company-building resources.
- **US2.3**: As a company member, I want the system to understand I'm part of an existing company so I can quickly access collaboration tools.
- **US2.4**: As a service provider, I want to indicate what services I offer so I can be matched with companies needing my expertise.
- **US2.5**: As a user, I want to see future role options that aren't fully implemented yet so I understand the platform's direction.

### Epic 3: Company Stage Assessment
For founders, determine the current stage of their company to direct them to appropriate resources.

#### User Stories
- **US3.1**: As a founder, I want to specify my company's current stage (idea stage, solid idea, formed company) so I receive relevant guidance.
- **US3.2**: As an idea-stage founder, I want to be directed to ideation and validation tools so I can develop my concept.
- **US3.3**: As a founder with a solid idea, I want to be directed to company formation resources so I can formalize my business.
- **US3.4**: As a founder with an existing company, I want to quickly set up my company profile so I can manage my business on the platform.
- **US3.5**: As a founder, I want to see a visual indicator showing how different company stages align with platform features.

### Epic 4: User Profiling & Personalization
Collect additional information to further personalize the user experience.

#### User Stories
- **US4.1**: As a user, I want to select my industry so I can see industry-specific resources and recommendations.
- **US4.2**: As a user, I want to indicate my experience level so content can be tailored to my expertise.
- **US4.3**: As a user, I want to specify my goals for using the platform so the system can highlight relevant features.
- **US4.4**: As a user, I want to set my visual preferences (light/dark mode) so the interface matches my needs.
- **US4.5**: As a user, I want to configure my notification preferences so I only receive updates that matter to me.

### Epic 5: Guided Feature Introduction
Introduce users to key platform features based on their profile.

#### User Stories
- **US5.1**: As a user, I want to see personalized feature recommendations based on my role and preferences.
- **US5.2**: As a user, I want direct links to recommended features so I can immediately start using them.
- **US5.3**: As a founder, I want the idea playground highlighted if I'm in the ideation stage so I can begin exploring concepts.
- **US5.4**: As a founder ready to form a company, I want company formation tools highlighted so I can take immediate action.
- **US5.5**: As a company member, I want team collaboration tools highlighted so I can connect with colleagues.
- **US5.6**: As a service provider, I want the directory and marketplace highlighted so I can start offering services.

### Epic 6: Onboarding Flow Management
Provide a smooth, flexible onboarding experience with proper progress tracking.

#### User Stories
- **US6.1**: As a user, I want to see my onboarding progress so I know how much is left to complete.
- **US6.2**: As a user, I want the option to skip onboarding so I can access the platform immediately if needed.
- **US6.3**: As a user, I want to save my progress in onboarding so I can resume later if interrupted.
  - **Implementation**: Dedicated "Save & Exit" button allows users to pause at any point
  - **Implementation**: All progress is automatically preserved at the current step
  - **Implementation**: System seamlessly resumes from the last completed step when returning
- **US6.4**: As a user, I want a personalized welcome message upon completing onboarding so I feel acknowledged.
- **US6.5**: As a returning user, I should not see the onboarding wizard again unless I explicitly choose to restart it.
- **US6.6**: As a platform administrator, I want user onboarding data stored so I can analyze user segments and preferences.
- **US6.7**: As a user, I want to be able to sign out completely so I can test the system with different accounts.
  - **Implementation**: SignOutButton component added to the layout for consistent logout access
  - **Implementation**: Fully clears user state and redirects to login page
  - **Implementation**: Enables easy testing with multiple user accounts
- **US6.8**: As a user, I want my application settings (theme, notifications) to be separate from my core profile data.
  - **Implementation**: Created dedicated AppSettings service with its own storage
  - **Implementation**: Settings auto-initialized with defaults for new users
  - **Implementation**: Clean separation of concerns between profile and preferences
- **US6.9**: As a developer, I want easy testing of the onboarding flow.
  - **Implementation**: Created test script to reset onboarding state
  - **Implementation**: Script available at `scripts/test-initial-onboarding.js`

### Epic 7: Multi-Persona Management (TEMPORARILY DISABLED)
Support for managing multiple personas within a single user account.

#### User Stories
- **US7.1**: As a user, I want to create multiple personas (founder, service provider, etc.) so I can use the platform in different capacities.
  - **Status**: Functionality temporarily disabled during onboarding overhaul
  - **Implementation**: Database structure supports this feature but UI components are hidden
- **US7.2**: As a user, I want to switch between my different personas so I can access different features and views.
  - **Status**: PersonaSelector temporarily hidden in Layout component
- **US7.3**: As a user, I want persona-specific settings and preferences so each persona functions optimally for its purpose.
  - **Status**: Will be reintroduced after core onboarding stabilization

### Epic 8: Analytics & Optimization
Track onboarding metrics to improve the process.

#### User Stories
- **US8.1**: As a product manager, I want to track onboarding completion rates so I can identify drop-off points.
- **US8.2**: As a product manager, I want to see which features users navigate to after onboarding so I can measure effectiveness.
- **US8.3**: As a product manager, I want to A/B test different onboarding flows so I can optimize conversion rates.
- **US8.4**: As a product manager, I want to analyze user role distribution so I can prioritize feature development.
- **US8.5**: As a product manager, I want to track time spent on each onboarding step so I can identify friction points.
- **US8.6**: As a product manager, I want to track how often users utilize the save & exit functionality to improve the flow.
  - **Implementation**: Timestamps stored when users save and exit
  - **Implementation**: Analytics hooks for tracking exit points and resume behavior
- **US8.7**: As a product manager, I want to track user settings changes to understand preferences better.
  - **Implementation**: All settings updates are timestamp tracked
  - **Implementation**: Settings service includes analytics hooks
- **US8.8**: As a product manager, I want to track the effectiveness of initial vs. detailed onboarding to optimize for user retention.
  - **Implementation**: Added tracking for initial onboarding completion
  - **Implementation**: Separate metrics for each onboarding phase

## Future Epics (Placeholders)

### Epic 9: Team Onboarding
Streamline the onboarding process for entire teams joining the platform.

#### User Stories (Placeholder)
- **US9.1**: As a team leader, I want to invite team members to join our workspace during my onboarding process.
- **US9.2**: As a team leader, I want to set default role permissions for team members I invite.
- **US9.3**: As a team member, I want a streamlined onboarding process that recognizes I'm joining an existing team.

### Epic 10: Integration Onboarding
Guide users through connecting external tools and importing data.

#### User Stories (Placeholder)
- **US10.1**: As a user, I want to connect my existing tools (GitHub, Slack, etc.) during onboarding.
- **US10.2**: As a user, I want to import data from other platforms during onboarding.
- **US10.3**: As a user, I want recommendations for integrations based on my role and company stage.

### Epic 11: Internationalization
Support onboarding in multiple languages.

#### User Stories (Placeholder)
- **US11.1**: As a non-English speaking user, I want to complete onboarding in my preferred language.
- **US11.2**: As a user in a different region, I want localized examples relevant to my market.

## Implementation Status

### Completed Features
- ✅ Initial onboarding wizard with role selection
- ✅ Role-specific information collection (company stage, service categories)
- ✅ Integration with existing features (idea playground, company setup)
- ✅ Test script for resetting onboarding state
- ✅ Save & Exit functionality
- ✅ Sign Out capability for testing with multiple users

### In Progress Features
- 🔄 Detailed profile setup
- 🔄 Enhanced personalization based on user role
- 🔄 Feature recommendations

### Temporarily Disabled Features
- ⏸️ Multi-persona management
- ⏸️ PersonaSelector component in Layout

### Upcoming Features
- 📅 Analytics tracking for onboarding
- 📅 A/B testing framework
- 📅 Team onboarding
