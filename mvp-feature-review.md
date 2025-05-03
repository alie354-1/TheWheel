# The Wheel - MVP Feature Review

This document provides a comprehensive review of the codebase against the MVP requirements, identifying the status of each feature and any gaps that need to be addressed.

## Status Key
- [ ] **Not Started**: No significant work done on this specific feature.
- [+/-] **Partially Built**: Some relevant code exists, but it's incomplete or not functional.
- [~] **Built - Needs Cleanup/Refactor**: The functionality broadly exists but is known to be messy, inefficient, buggy, or needs significant rework for the MVP integration.
- [✓] **Functionally Complete**: Believed to meet the MVP requirement; ready for integration testing/final QA.
- [>>] **Exceeds MVP**: Functionality exists and offers significantly more than the basic MVP requirement described.
- [?] **Status Unknown / Needs Verification**: Uncertainty exists about the feature's status or implementation details.

---

## 1. Identity & Authentication

### Secure User Signup
**Status:** [+/-] Partially Built  
**Gap / Required Work:**  
- Signup is implemented in Login.tsx (toggle between login/signup).  
- No password confirmation field; mismatched password scenario is not handled.  
- Error messages are generic; no specific handling for "email already exists".  
- No explicit email verification UI; relies on Supabase defaults.  
- No UI indication of "unverified email" state.

### Secure User Login
**Status:** [✓] Functionally Complete  
**Gap / Required Work:**  
- Login with email/password is implemented with error handling.  
- Error messages could be more user-friendly (currently generic).  
- Redirects to dashboard on success.

### Password Reset
**Status:** [ ] Not Started  
**Gap / Required Work:**  
- No password reset or "forgot password" UI or logic present anywhere in the codebase.

---

## 2. Basic Profile Data Storage (Name, Company)

**Status:** [+/-] Partially Built  
**Gap / Required Work:**  
- ProfileSetup.tsx collects and stores user name and company (as part of professional background, not necessarily the venture context).  
- CompanySetup.tsx handles venture/company creation and associates it with the user.  
- Data is stored in "profiles" and "companies" tables.  
- UI for profile/venture setup is present and functional.  
- Retrieval and display of names/venture in UI is present in Layout.tsx and profile menus.  
- Some profile fields may be optional or not enforced; validation could be improved.

---

## 3. Enforce Single 'Venture' Context Logic

**Status:** [✓] Functionally Complete  
**Gap / Required Work:**  
- CompanySetup.tsx checks if user already owns/is a member of a company and redirects to dashboard, enforcing single venture context in UI.  
- No UI for switching/creating multiple ventures.  
- Backend service (company.service.ts) allows querying multiple companies, but UI prevents creation/joining of more than one.  
- No explicit backend API enforcement of single venture context, but can be added if needed for security.

---

## 4. Core Application Framework

### Basic UI Shell / Container
**Status:** [✓] Functionally Complete  
**Gap / Required Work:**  
- Layout.tsx provides a consistent shell with top nav, sidebar, and main content area.  
- Responsive design for desktop/mobile.  
- Main content area uses <Outlet /> for routed views.

### Main Navigation Structure (Sidebar/Tabs)
**Status:** [✓] Functionally Complete  
**Gap / Required Work:**  
- Sidebar and mobile nav implemented in Layout.tsx.  
- Navigation links are conditionally rendered (e.g., company page only if company exists).  
- "Company Page" link is shown/hidden based on company status.

### Foundational UI Components/Styling
**Status:** [~] Built - Needs Cleanup/Refactor  
**Gap / Required Work:**  
- Most forms use consistent Tailwind CSS classes for inputs/buttons.  
- No evidence of a shared foundational UI component library (e.g., Button, Input, Select).  
- Some specialized AI-assisted input components exist.  
- Consider abstracting common form elements for maintainability and consistency.

---

## 5. Company/Venture Profile

### Store/Retrieve Completed Journey Steps List
**Status:** [ ] Not Started  
**Gap / Required Work:**  
- No evidence of journey step completion tracking in company or user profile data.
- No UI or backend logic for marking steps complete or displaying progress on a journey map.

### Store/Retrieve User-Defined "Current Focus Areas/Steps"
**Status:** [ ] Not Started  
**Gap / Required Work:**  
- No UI or backend logic for setting or displaying current focus areas/steps for a venture.

### Store/Retrieve "Company Formed" Status Flag
**Status:** [+/-] Partially Built  
**Gap / Required Work:**  
- Company creation and setup is implemented (CompanySetup.tsx, companies table).
- No explicit "company formed" flag; inferred from company existence.
- No UI logic for toggling or displaying a "formed" status.

### Store/Retrieve Basic Company Details (Post-Setup)
**Status:** [✓] Functionally Complete  
**Gap / Required Work:**  
- Company details (name, industry, website, etc.) are collected and stored.
- Company profile is associated with the user and can be displayed in the UI.
- Graceful handling of missing details may need review.

---

## 6. Idea Hub

### Backend: Lean Canvas Logic
**Status:** [+/-] Partially Built  
**Gap / Required Work:**  
- ideas table and types support Lean Canvas fields (problem_statement, solution_concept, etc.).
- IdeaCanvas.tsx provides a Lean Canvas UI, but uses a separate idea_canvases table.
- Integration between Lean Canvas UI and main ideas list is unclear; may need consolidation.

### Backend: Status Tracking Logic
**Status:** [+/-] Partially Built  
**Gap / Required Work:**  
- IdeaStatus enum and status field exist in types, but not surfaced in UI or migrations.
- No evidence of status field in ideas table or status update logic in UI.

### Backend: Other "Enhanced" Features Verification
**Status:** [?] Needs Verification  
**Gap / Required Work:**  
- Tagging, relationships, and other enhanced features not clearly documented or surfaced in UI.
- Code review and documentation needed to confirm any additional backend features.

### UI Integration: Idea List/Dashboard View
**Status:** [✓] Functionally Complete  
**Gap / Required Work:**  
- SavedIdeasPage.tsx lists ideas with filtering, sorting, and company association.
- "No ideas yet" and empty state handling present.
- Edit, refine, and delete actions available.

### UI Integration: View/Edit Lean Canvas
**Status:** [+/-] Partially Built  
**Gap / Required Work:**  
- IdeaCanvas.tsx provides Lean Canvas editing, but may not be fully integrated with main ideas.
- UI for editing and saving Lean Canvas fields is present, but linkage to main idea entity may need improvement.

### UI Integration: Update Status via UI
**Status:** [ ] Not Started  
**Gap / Required Work:**  
- No UI for displaying or updating idea status (e.g., Draft, Validating).
- Status field not surfaced in idea list or detail views.

---

## 7. Startup Journey Map Module

### Backend: Data Model (Phases, Steps, Guidance, Tools, Options, Action Flags)
**Status:** [✓] Functionally Complete  
**Gap / Required Work:**  
- company_stages and company_stage_steps tables store phases and steps, with guidance, tools, resources, and options.
- company_progress table tracks per-company, per-step progress and status.
- Data model supports all required fields for journey map functionality.

### Backend: Content Loading Mechanism
**Status:** [+/-] Partially Built  
**Gap / Required Work:**  
- Stages and steps are loaded from the database.
- No evidence of a script or admin UI for bulk loading/updating content from external sources (e.g., spreadsheets).
- Error handling for content loading is present in the UI.

### Backend: Tool Database Model/Loading
**Status:** [+/-] Partially Built  
**Gap / Required Work:**  
- Tools are associated with steps and loaded/displayed in the UI.
- No evidence of a dedicated tool ranking or advanced recommendation logic.

### Frontend: UI for Browse Full Map
**Status:** [✓] Functionally Complete  
**Gap / Required Work:**  
- CompanyStages.tsx provides a visual, interactive journey map with expandable stages and steps.
- Users can browse all phases and steps, view details, and see progress.

### Frontend: UI for Viewing Step Details (Enhanced)
**Status:** [✓] Functionally Complete  
**Gap / Required Work:**  
- Step details include guidance, checklist, tools, resources, and tips.
- UI is clear and well-structured.

### Frontend: UI for Step Feedback Input
**Status:** [ ] Not Started  
**Gap / Required Work:**  
- No UI for submitting feedback (rating/comment) on journey steps.

### Backend: Step Feedback Storage
**Status:** [ ] Not Started  
**Gap / Required Work:**  
- No backend logic or table for storing user feedback on steps.

### Frontend: UI Displaying Action Choices (Conditional)
**Status:** [+/-] Partially Built  
**Gap / Required Work:**  
- Tools and resources are displayed per step.
- No explicit UI for "Use a Tool", "DIY", "Ask Expert", "Ask The Wheel" action choices with conditional logic.

---

## 8. Progress Tracker (Task Management)

### Backend: Rework/Build Task Storage (Dual Context - General/Journey)
**Status:** [✓] Functionally Complete  
**Gap / Required Work:**  
- Tasks are stored with category and type, supporting both general and contextual (journey-linked) tasks.
- Data model supports required fields for MVP.

### Backend: Flexible Task Association Logic
**Status:** [✓] Functionally Complete  
**Gap / Required Work:**  
- Tasks can be associated with categories/contexts.
- UI and backend support linking/unlinking tasks to journey steps or general backlog.

### Frontend: UI for General Task List
**Status:** [✓] Functionally Complete  
**Gap / Required Work:**  
- TaskManager and TaskList provide a dedicated view for general tasks.
- Basic actions (mark complete, edit, delete) are supported.

### Frontend: UI for Journey Step Task List
**Status:** [+/-] Partially Built  
**Gap / Required Work:**  
- TaskManager supports category/context, but explicit journey step task list UI may need refinement.
- Linking tasks to specific journey steps is possible via category/context, but UI integration with journey map may need improvement.

### Frontend: UI for Associating General Task -> Journey Step
**Status:** [+/-] Partially Built  
**Gap / Required Work:**  
- Tasks can be linked to contexts, but UI for associating a general task to a journey step may need enhancement.

### Frontend: UI for Manual Task Creation (General/Contextual)
**Status:** [✓] Functionally Complete  
**Gap / Required Work:**  
- Manual task creation is supported via CreateTaskDialog and ManualTaskCreation.

### Frontend: UI for Task Completion
**Status:** [✓] Functionally Complete  
**Gap / Required Work:**  
- Tasks can be marked complete/incomplete in the UI.
- Visual consistency is maintained across views.

### Integration: AI Task Ingestion into General Tasks
**Status:** [+/-] Partially Built  
**Gap / Required Work:**  
- AITaskGenerator and related components suggest AI task ingestion is supported.
- Duplicate/similar task handling may need improvement.

---

## 9. AI Cofounder Integration

### UI Integration: Standup Input Section
**Status:** [✓] Functionally Complete  
**Gap / Required Work:**  
- StandupTestPage.tsx provides labeled text areas for standup input (yesterday, today, blockers, goals).
- Submit actions trigger AI feedback and task generation.

### UI Integration: AI Feedback Display
**Status:** [✓] Functionally Complete  
**Gap / Required Work:**  
- AI-generated feedback is displayed in a dedicated area.
- Loading/processing state is indicated.
- Error handling is present.

### Data Flow: AI Task Output -> Progress Tracker Ingestion
**Status:** [+/-] Partially Built  
**Gap / Required Work:**  
- AI-generated tasks are displayed, but direct ingestion into the Progress Tracker is not shown in the UI.
- Integration may exist in services/hooks, but needs verification for seamless task ingestion.

### Context Awareness: AI Backend Aware of Current Journey Step/Focus
**Status:** [+/-] Partially Built  
**Gap / Required Work:**  
- Standup entry includes goals and context, but explicit journey step/focus context passing is not shown.
- Backend may support context, but UI does not expose focus step selection.

---

## 10. Knowledge Hub Integration

### UI Integration: Read-Only Browse/Search Interface
**Status:** [+/-] Partially Built  
**Gap / Required Work:**  
- ResourceLibrary.tsx provides a searchable, filterable interface for templates, guides, and educational content.
- Resources are displayed as cards with title, description, tags, and type.
- Users can view and download resources.
- No explicit article content display or full article reading experience; focus is on downloadable resources.
- No editing capability, as required for MVP.

---

## 11. Community Integration

### UI Integration: Forum Browse/Post/Reply Interface
**Status:** [✓] Functionally Complete  
**Gap / Required Work:**  
- CommunityPage.tsx provides a tabbed interface for discussions, events, members, and documents.
- Users can view topics, create new discussions, and reply to posts (via Post.tsx, not shown here but implied).
- Threaded replies and topic view are supported.
- Empty states and membership logic are handled.
- No major gaps for MVP forum functionality.

---

## 12. Messaging Integration

### UI Integration: Basic Inbox/Chat Interface
**Status:** [✓] Functionally Complete  
**Gap / Required Work:**  
- Messages.tsx provides a sidebar for conversations and a main area for chat.
- Users can search, start new conversations, and send/receive messages.
- Conversation history is displayed, and messages are marked as read.
- Error handling and empty states are present.
- No major gaps for MVP messaging functionality.

---

## 13. Platform Administration

### UI Integration: User Lookup
**Status:** [✓] Functionally Complete  
**Gap / Required Work:**  
- UserManagement.tsx (in AdminPanel) provides user search and profile viewing.
- Admins can search by email/name and view basic profile info.
- Handles user not found and access control.

### UI Integration: Feature Flag Management
**Status:** [✓] Functionally Complete  
**Gap / Required Work:**  
- FeatureFlagsSettings.tsx provides a UI for viewing and toggling feature flags.
- Changes are reflected in the backend and UI.
- Feature flags control platform/user segment features.

### Build: Journey Map & Tool Content Management Interface
**Status:** [+/-] Partially Built  
**Gap / Required Work:**  
- No dedicated admin UI for creating/updating journey map phases, steps, guidance, or curated tools.
- Content is managed via database/scripts, not a user-friendly admin interface.

---

## Summary of MVP Status

### Fully Implemented Features (✓)
- Secure User Login
- Enforce Single 'Venture' Context Logic
- Basic UI Shell / Container
- Main Navigation Structure (Sidebar/Tabs)
- Store/Retrieve Basic Company Details (Post-Setup)
- UI Integration: Idea List/Dashboard View
- Backend: Data Model (Phases, Steps, Guidance, Tools, Options, Action Flags)
- Frontend: UI for Browse Full Map
- Frontend: UI for Viewing Step Details (Enhanced)
- Backend: Rework/Build Task Storage (Dual Context - General/Journey)
- Backend: Flexible Task Association Logic
- Frontend: UI for General Task List
- Frontend: UI for Manual Task Creation (General/Contextual)
- Frontend: UI for Task Completion
- UI Integration: Standup Input Section
- UI Integration: AI Feedback Display
- UI Integration: Forum Browse/Post/Reply Interface
- UI Integration: Basic Inbox/Chat Interface
- UI Integration: User Lookup
- UI Integration: Feature Flag Management

### Partially Implemented Features (+/-)
- Secure User Signup
- Basic Profile Data Storage (Name, Company)
- Store/Retrieve "Company Formed" Status Flag
- Backend: Lean Canvas Logic
- Backend: Status Tracking Logic
- Backend: Content Loading Mechanism
- Backend: Tool Database Model/Loading
- Frontend: UI Displaying Action Choices (Conditional)
- Frontend: UI for Journey Step Task List
- Frontend: UI for Associating General Task -> Journey Step
- Integration: AI Task Ingestion into General Tasks
- Data Flow: AI Task Output -> Progress Tracker Ingestion
- Context Awareness: AI Backend Aware of Current Journey Step/Focus
- UI Integration: Read-Only Browse/Search Interface
- Build: Journey Map & Tool Content Management Interface

### Needs Cleanup/Refactor (~)
- Foundational UI Components/Styling

### Not Started ( )
- Password Reset
- Store/Retrieve Completed Journey Steps List
- Store/Retrieve User-Defined "Current Focus Areas/Steps"
- UI Integration: Update Status via UI
- Frontend: UI for Step Feedback Input
- Backend: Step Feedback Storage

### Needs Verification (?)
- Backend: Other "Enhanced" Features Verification

## Next Steps Recommendations

1. **High Priority Gaps**:
   - Implement password reset functionality
   - Add journey step completion tracking and focus areas
   - Implement step feedback UI and storage
   - Integrate Lean Canvas UI with main ideas list
   - Surface idea status in UI

2. **Cleanup/Refactor**:
   - Create a shared UI component library for consistency
   - Improve error messages for authentication flows
   - Enhance integration between journey map and task management

3. **Verification Needed**:
   - Document and verify enhanced idea hub features
   - Confirm AI task ingestion flow to Progress Tracker
   - Validate journey step/focus context awareness in AI backend

4. **Documentation**:
   - Create technical documentation for implemented features
   - Document data models and relationships
   - Create user guides for key features

---

## Role-Based Access Control (RBAC) Implementation Plan & Feature Set

This section outlines the plan for implementing a comprehensive, future-proof Role-Based Access Control (RBAC) system for The Wheel, designed to support multiple user types, contexts, and collaboration models, along with the resulting feature set.

### Part 1: RBAC Implementation Plan

This is a strategic approach to building the RBAC system, ensuring flexibility for future growth even while implementing a simpler version for the MVP.

#### Define Core Concepts

Establish clear, documented definitions for key RBAC entities within the system architecture:

- **User Account**: The individual identity.
- **Context**: A distinct workspace or entity (Platform, Company, Marketplace Profile, Community Space).
- **Mode**: The UI mechanism for switching active Contexts.
- **Permission**: Granular actions (e.g., idea.create, user.invite).
- **Role**: Named collections of Permissions (System or Contextual).
- **Assignment**: The link connecting a User, a Role, and optionally a specific Context instance.

#### Flexible Database Schema Design

Design database tables to represent these concepts, allowing for many-to-many relationships and context-specific assignments:
- users
- roles
- permissions
- contexts (or specific context tables)
- role_permissions
- user_role_assignments

#### Comprehensive Permission Definition

Catalogue all potential granular actions across all planned features and modules, assigning unique permission identifiers.

#### Full Role Definition

Define and implement the complete set of planned System Roles and Contextual Roles (Company, Marketplace, Community) and map the defined Permissions to each Role conceptually. All roles (including future roles) will be implemented in the MVP, even though only a subset will be actively used.

#### Context Implementation

Architect the application to recognize and manage different Context types as distinct operational environments.

#### Assignment Logic Implementation

Build the backend services to create, manage, and query user_role_assignments, correctly linking users to roles within the appropriate scope (system-wide or specific context instance).

#### Centralized Authorization Service

Implement a core authorization mechanism (e.g., middleware, dedicated service) that checks a user's resolved permissions (based on their active context role and system roles) against the permission required for any attempted action.

#### Mode Switching UI Design (Future)

Design the UI component allowing users to view and switch between their assigned roles/contexts. (Implementation deferred post-MVP).

#### Admin UI for RBAC Management (Future)

Plan for administrative interfaces allowing Platform Admins to manage roles, permissions, and potentially global assignments. (Implementation deferred post-MVP, except for MVP-specific admin needs).

#### Phased MVP Implementation

1. Implement all System Roles and Contextual Roles in the database, but only activate/use the essential ones (User, Platform Admin) for the initial launch.
2. Implement the Single Company Context logic, using the flexible backend schema but restricting users to one company context via application logic/UI.
3. Build only the MVP-required Admin functionality (Journey content management, feature flags, basic user lookup).

### Part 2: RBAC-Enabled Feature Set

This lists the user-facing and administrative features enabled by the comprehensive RBAC system. Features marked (MVP) are part of the initial launch scope; others are planned for future iterations.

#### A. Identity & Access Management Features

- **(MVP)** User Signup (Email/Password)
- **(MVP)** User Login (Email/Password)
- **(MVP)** Password Reset Mechanism
- **(MVP)** Basic User Profile Management (Name, Company)
- **(Future)** Multi-Factor Authentication (MFA) Setup & Management
- **(Future)** User API Key Management (for integrations)
- **(Future)** Account Deactivation/Deletion Request

#### B. Role & Permission Management Features (Admin Focus)

- **(MVP)** Platform Admin: Manage Journey Map Content (CRUD)
- **(MVP)** Platform Admin: Manage Tool Database (CRUD)
- **(MVP)** Platform Admin: Manage Feature Flags (View/Toggle)
- **(MVP)** Platform Admin: Basic User Lookup (View Profile)
- **(MVP)** Platform Admin: Access "Ask The Wheel" Request Queue
- **(Future)** Platform Admin: Define/Edit System Roles & Permissions
- **(Future)** Platform Admin: Assign/Revoke System Roles (e.g., Platform Admin, Support, Billing Admin)
- **(Future)** Platform Admin: Advanced User Management (Suspend, Impersonate with audit)
- **(Future)** Platform Admin: View Platform-Wide Audit Logs
- **(Future)** Billing Admin: Manage Platform Subscriptions & Billing
- **(Future)** Support Staff: View User/Company Data (Controlled Access)

#### C. Company Context Features

- **(MVP)** User: Operate within a single primary company context.
- **(MVP)** User: Access all core modules (Ideas, Journey, Tasks, Standup, Knowledge Hub, Community, Messaging) based on default User permissions within their company.
- **(MVP)** User: Complete Company Setup process.
- **(MVP)** User: View own Company Page (post-setup).
- **(Future)** Company Owner/Admin: Invite Team Members (Assigning Company Editor, Company Viewer roles).
- **(Future)** Company Owner/Admin: Remove Team Members from Company.
- **(Future)** Company Owner/Admin: Change Team Member Roles within Company.
- **(Future)** Company Owner/Admin: Manage Company-Specific Settings.
- **(Future)** Company Owner: Delete the Company.
- **(Future)** Company Owner: Transfer Company Ownership.
- **(Future)** Company Editor/Member: Create/Edit/Delete content (Ideas, Tasks, etc.) based on assigned permissions.
- **(Future)** Company Viewer: View company content based on assigned permissions.
- **(Future)** Company Owner/Admin: Invite External Advisors (Assigning Company Advisor role with configurable read/comment permissions).

#### D. Mode Switching Feature

- **(Future)** User: Access UI element (e.g., dropdown) listing all assigned Roles/Contexts (e.g., "Company A - Owner", "Company B - Editor", "My Advisor Profile").
- **(Future)** User: Select a Role/Context from the switcher to change the active operating mode and applied permissions.

#### E. Marketplace Provider Context Features

- **(Future)** Vendor Admin: Create/Edit/Manage Company Vendor Profile.
- **(Future)** Vendor Admin: Create/Edit/Manage Service/Product Listings.
- **(Future)** Vendor Admin: Invite/Manage Vendor Team Members & Roles.
- **(Future)** Individual Advisor: Create/Edit/Manage Personal Advisor Profile.
- **(Future)** Providers (Vendor/Advisor): Respond to RFPs/Service Requests.
- **(Future)** Providers (Vendor/Advisor): Manage Engagements/Contracts via platform.

#### F. Community Space Context Features

- **(MVP)** Community Member: View topics, create topics, post replies in general/public community areas.
- **(Future)** Space Admin: Manage Settings & Membership for a specific Community Space.
- **(Future)** Space Admin: Appoint/Remove Moderators for a specific Space.
- **(Future)** Moderator: Edit/Delete/Approve content within assigned Community Space(s).
- **(Future)** Community Member: Join/Leave specific Community Spaces (if applicable).

### Implementation Notes

1. **Future-Proofing Strategy**: By implementing all roles and permissions upfront but only activating the MVP subset, we ensure the system can grow without architectural changes.

2. **Database Considerations**: The schema should be designed to accommodate the full RBAC model from the start, even if only a portion is used initially.

3. **Migration Path**: As new features are added post-MVP, the corresponding roles and permissions can be activated without disrupting existing functionality.

4. **Security Implications**: The centralized authorization service ensures consistent permission enforcement across the application, reducing security risks.

5. **UI/UX Considerations**: The initial MVP will hide multi-context capabilities from users, presenting a simplified single-company experience while maintaining the technical foundation for future expansion.
