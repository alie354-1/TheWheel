# The Wheel: Adaptation Plan for New Schema

This document outlines a detailed plan for adapting the existing codebase to work with the new database schema (`the_wheel_full_schema.sql`), while preserving working components and only building or refactoring where necessary.

## Core Principles

1. **Preserve Working Code**: Adapt existing, functional components rather than rewriting them.
2. **Targeted Refactoring**: Only refactor where there are gaps, bugs, or schema mismatches.
3. **Maintain Functionality**: Ensure all existing features continue to work with the new schema.
4. **Enhance for Requirements**: Add new features and improvements as specified in the MVP requirements.

## Important Clarification

The single venture/company concept means **each user can be part of only one company** (or none), not that each company can only have one user. Companies can have multiple members, but users cannot be members of multiple companies in the MVP.

## Module-by-Module Adaptation Plan

### 1. Identity & Authentication

#### 1.1 Login [✓]
- **Status**: Functionally Complete
- **Adaptation Strategy**: 
  - Keep existing Login.tsx component
  - Update backend service calls to use new schema if needed
  - Improve error messages for clarity
- **Specific Changes**:
  - Update auth service to use new users table structure
  - Ensure proper redirection after login
  - Enhance error handling for specific error cases

#### 1.2 Signup [+/-]
- **Status**: Partially Built
- **Adaptation Strategy**:
  - Enhance existing signup form in Login.tsx
  - Add password confirmation field
  - Implement specific error handling
- **Specific Changes**:
  - Add password confirmation field and validation
  - Add specific error handling for "email already exists"
  - Update backend service to use new schema
  - Ensure proper user record creation in the new users table

#### 1.3 Password Reset [ ]
- **Status**: Not Started
- **Adaptation Strategy**:
  - Implement as a new feature
  - Use Supabase Auth and the new password_reset_requests table
- **Specific Changes**:
  - Create ForgotPasswordPage component
  - Create ResetPasswordPage component
  - Implement backend service for password reset token generation and validation
  - Add email sending functionality (or use Supabase's built-in functionality)

#### 1.4 Profile Data Storage [+/-]
- **Status**: Partially Built
- **Adaptation Strategy**:
  - Adapt ProfileSetup.tsx and CompanySetup.tsx
  - Ensure data is stored in the correct tables/fields
- **Specific Changes**:
  - Update profile service to use new users table structure
  - Ensure company name is clearly stored as the venture name
  - Improve validation for required fields
  - Update UI to reflect new data structure

### 2. Company Context Management

#### 2.1 Single Venture Context [✓]
- **Status**: Functionally Complete
- **Adaptation Strategy**:
  - Keep current logic that restricts users to one company
  - Ensure companies can have multiple members
- **Specific Changes**:
  - Verify CompanySetup.tsx correctly checks if user is already a member of a company
  - Update backend service to use new company_members table
  - Add explicit backend API enforcement for security if needed
  - Ensure proper handling of company-user relationships

#### 2.2 Company Formation & Flag [+/-]
- **Status**: Partially Built
- **Adaptation Strategy**:
  - Add explicit "company formed" flag
  - Implement trigger mechanism from journey step completion
- **Specific Changes**:
  - Use the is_formed field in the companies table
  - Implement backend logic to update flag when designated journey step is completed
  - Update UI to check this flag for conditional elements (like Company Page link)

#### 2.3 Company Page [ ]
- **Status**: Not Started
- **Adaptation Strategy**:
  - Build new page component
  - Reuse existing company data fetching logic
- **Specific Changes**:
  - Create CompanyPage component
  - Implement route definition and navigation
  - Add conditional access logic based on company formed flag
  - Build UI for displaying company details
  - Handle missing data gracefully

### 3. Core Application Framework

#### 3.1 UI Shell / Container [✓]
- **Status**: Functionally Complete
- **Adaptation Strategy**:
  - Keep Layout.tsx and navigation structure
  - Update conditional rendering logic if needed
- **Specific Changes**:
  - Verify Layout.tsx works with new schema
  - Update navigation conditional rendering to use new fields/flags
  - Ensure Knowledge Hub link is removed or points to "Coming Soon" for MVP

#### 3.2 UI Components/Styling [~]
- **Status**: Built - Needs Cleanup/Refactor
- **Adaptation Strategy**:
  - Abstract common elements into reusable components
  - Improve consistency and accessibility
- **Specific Changes**:
  - Create shared Button component
  - Create shared Input component
  - Create shared Select component
  - Update existing forms to use new components
  - Implement accessibility attributes (ARIA, labels, etc.)
  - Ensure responsive design across all components

### 4. Journey Map Module

#### 4.1 Journey Map Core [✓]
- **Status**: Functionally Complete
- **Adaptation Strategy**:
  - Keep CompanyStages.tsx and related UI
  - Update backend services to use new schema
- **Specific Changes**:
  - Update journey service to use new journey_phases and journey_steps tables
  - Ensure proper loading of phases, steps, and their relationships
  - Update UI to display journey map correctly with new data structure

#### 4.2 Step Completion Tracking [ ]
- **Status**: Not Started
- **Adaptation Strategy**:
  - Implement backend logic for tracking completed steps
  - Add UI for marking steps complete
- **Specific Changes**:
  - Create service for updating company_progress records
  - Add "Mark as Complete" button/checkbox to step details view
  - Implement visual indicators for completed steps on the map
  - Handle special case for company formation step

#### 4.3 Focus Areas [ ]
- **Status**: Not Started
- **Adaptation Strategy**:
  - Implement backend logic for tracking focus areas
  - Add UI for setting/clearing focus areas
- **Specific Changes**:
  - Create service for managing company_focus_areas records
  - Add UI controls for setting/clearing focus areas
  - Implement visual indicators for focus areas on the map
  - Ensure focus areas are passed to AI context

#### 4.4 Step Details View [✓]
- **Status**: Functionally Complete
- **Adaptation Strategy**:
  - Keep existing step details UI
  - Integrate with new action choices and feedback
- **Specific Changes**:
  - Update service to load step details from new schema
  - Ensure guidance, options, tools, etc. are displayed correctly
  - Add action choices UI (Use Tool, DIY, Ask Expert, Ask Wheel)
  - Add step feedback input form

#### 4.5 Step Feedback [ ]
- **Status**: Not Started
- **Adaptation Strategy**:
  - Implement backend logic for storing feedback
  - Add UI for submitting feedback
- **Specific Changes**:
  - Create service for storing journey_step_feedback records
  - Add rating and comment input UI to step details view
  - Implement submission and confirmation logic
  - Handle validation and error cases

#### 4.6 Action Choices UI [+/-]
- **Status**: Partially Built
- **Adaptation Strategy**:
  - Enhance existing UI with explicit action choices
  - Implement conditional display based on flags
- **Specific Changes**:
  - Add "Use a Tool", "DIY", "Ask Expert", "Ask Wheel" buttons
  - Implement conditional display based on step flags
  - Connect buttons to appropriate functionality
  - Handle disabled/unavailable actions gracefully

### 5. Tool Recommendation & Custom Tools

#### 5.1 Tool Recommendation Logic [ ]
- **Status**: Not Started
- **Adaptation Strategy**:
  - Implement backend logic for ranking tools
  - Create service for personalized recommendations
- **Specific Changes**:
  - Create service for filtering/ranking tools based on profile data
  - Implement default ranking logic for when profile data is insufficient
  - Ensure proper handling of steps with fewer than 3 tools

#### 5.2 Tool Display UI [+/-]
- **Status**: Partially Built
- **Adaptation Strategy**:
  - Enhance existing tool display UI
  - Add "Top 3" section and "See All" option
- **Specific Changes**:
  - Update tool display to show top 3 recommendations prominently
  - Add "See All" button/link to view all tools for the step
  - Implement tool cards with consistent styling
  - Ensure proper display of tool details

#### 5.3 Custom Tool Addition [ ]
- **Status**: Not Started
- **Adaptation Strategy**:
  - Implement UI for adding custom tools
  - Create backend logic for storing custom tools
- **Specific Changes**:
  - Add "Add Custom Tool" button to tool display
  - Create form for entering tool name, URL, and functionality
  - Implement backend service for storing custom tools
  - Connect to AI description generation service

#### 5.4 AI Tool Description Generation [ ]
- **Status**: Not Started
- **Adaptation Strategy**:
  - Implement AI service for generating tool descriptions
  - Create UI for reviewing and accepting generated content
- **Specific Changes**:
  - Create AI service that extracts information from tool URLs
  - Implement preview card for generated descriptions
  - Add accept/reject/regenerate buttons
  - Implement backend storage for accepted descriptions

### 6. Idea Hub

#### 6.1 Idea List/Dashboard [✓]
- **Status**: Functionally Complete
- **Adaptation Strategy**:
  - Keep SavedIdeasPage.tsx and related UI
  - Update data fetching to use new schema
- **Specific Changes**:
  - Update idea service to use new ideas table structure
  - Ensure proper filtering and sorting with new schema
  - Add status display to idea list items
  - Verify company association works correctly

#### 6.2 Lean Canvas [+/-]
- **Status**: Partially Built
- **Adaptation Strategy**:
  - Verify/refactor IdeaCanvas.tsx to use new schema
  - Ensure data is stored in the correct fields
- **Specific Changes**:
  - Update canvas service to use consolidated idea fields
  - Verify all Lean Canvas fields are saved correctly
  - Ensure proper loading and display of saved data
  - Handle validation and error cases

#### 6.3 Status Tracking [ ]
- **Status**: Not Started
- **Adaptation Strategy**:
  - Add status dropdown to existing UI
  - Implement backend logic for updating status
- **Specific Changes**:
  - Add status dropdown to idea details/canvas view
  - Create service for updating idea status
  - Ensure status changes are reflected in the UI
  - Update idea list filtering to use status field

### 7. Task Management

#### 7.1 General Task List [✓]
- **Status**: Functionally Complete
- **Adaptation Strategy**:
  - Keep existing UI and logic
  - Update data access to use new schema
- **Specific Changes**:
  - Update task service to use new tasks table structure
  - Ensure proper filtering and sorting with new schema
  - Verify task creation, editing, and completion work correctly

#### 7.2 Journey Step Task List [+/-]
- **Status**: Partially Built
- **Adaptation Strategy**:
  - Enhance UI for displaying tasks associated with steps
  - Implement integration with journey map
- **Specific Changes**:
  - Add task list section to step details view
  - Update task service to filter by journey_step_id
  - Ensure proper display and management of step-specific tasks

#### 7.3 Task Association [+/-]
- **Status**: Partially Built
- **Adaptation Strategy**:
  - Enhance UI for associating tasks with steps
  - Implement backend logic for updating associations
- **Specific Changes**:
  - Add UI for linking general tasks to journey steps
  - Create service for updating task-step associations
  - Ensure tasks appear in the correct lists after association
  - Handle task context changes gracefully

#### 7.4 AI Task Ingestion [+/-]
- **Status**: Partially Built
- **Adaptation Strategy**:
  - Verify and adapt end-to-end flow
  - Ensure proper handling of AI-generated tasks
- **Specific Changes**:
  - Update standup task service to use new schema
  - Verify task ingestion from AI output to general tasks list
  - Implement duplicate detection/handling
  - Ensure proper display of AI-generated tasks in the UI

### 8. AI Cofounder (Standup Bot)

#### 8.1 Standup Input [✓]
- **Status**: Functionally Complete
- **Adaptation Strategy**:
  - Keep existing UI and logic
  - Update data access to use new schema
- **Specific Changes**:
  - Update standup service to use new standup_entries table
  - Verify form submission and data storage work correctly
  - Ensure proper handling of user/company context

#### 8.2 AI Feedback Display [✓]
- **Status**: Functionally Complete
- **Adaptation Strategy**:
  - Keep existing UI and logic
  - Update data access to use new schema
- **Specific Changes**:
  - Update feedback service to use new standup_feedback table
  - Verify proper display of AI-generated feedback
  - Ensure loading states and error handling work correctly

#### 8.3 Journey Context Integration [+/-]
- **Status**: Partially Built
- **Adaptation Strategy**:
  - Enhance standup service to include journey context
  - Update AI prompt to use focus areas
- **Specific Changes**:
  - Update standup service to include focus_step_id
  - Modify AI prompt to incorporate journey context
  - Ensure context is passed correctly to the AI service
  - Verify AI feedback reflects journey context

### 9. Community & Messaging

#### 9.1 Community Forum [✓]
- **Status**: Functionally Complete
- **Adaptation Strategy**:
  - Keep existing UI and logic
  - Update data access to use new schema
- **Specific Changes**:
  - Update community service to use new communities and related tables
  - Verify post creation, viewing, and replying work correctly
  - Ensure proper handling of user/company context

#### 9.2 Messaging [✓]
- **Status**: Functionally Complete
- **Adaptation Strategy**:
  - Keep existing UI and logic
  - Update data access to use new schema
- **Specific Changes**:
  - Update messaging service to use new conversations and messages tables
  - Verify conversation listing, message sending, and reading work correctly
  - Ensure proper handling of user context

### 10. Administration

#### 10.1 User Lookup [✓]
- **Status**: Functionally Complete
- **Adaptation Strategy**:
  - Keep existing UI and logic
  - Update data access to use new schema
- **Specific Changes**:
  - Update user service to use new users table structure
  - Verify search functionality works correctly
  - Ensure proper display of user details

#### 10.2 Feature Flag Management [✓]
- **Status**: Functionally Complete
- **Adaptation Strategy**:
  - Keep existing UI and logic
  - Update data access to use new schema
- **Specific Changes**:
  - Update feature flag service to use new feature_flags table
  - Verify toggle functionality works correctly
  - Ensure changes are reflected throughout the application

#### 10.3 Journey Content Management [+/-]
- **Status**: Partially Built
- **Adaptation Strategy**:
  - Build admin UI for journey/tool content
  - Reuse any existing scripts/services
- **Specific Changes**:
  - Create AdminJourneyPage component
  - Implement journey structure editor
  - Add step content editor
  - Create tool management UI
  - Implement backend services for content CRUD operations

## Technical Implementation Steps

### 1. Data Model & Type Updates

1. Create TypeScript interfaces for all new database tables
2. Update existing interfaces to match new schema
3. Create type guards and validation functions
4. Update API response/request types

### 2. Service Layer Updates

1. Update authentication service to use new schema
2. Update user/profile service to use new schema
3. Update company service to use new schema
4. Update journey service to use new schema
5. Update idea service to use new schema
6. Update task service to use new schema
7. Update standup service to use new schema
8. Update community service to use new schema
9. Update messaging service to use new schema
10. Update admin services to use new schema

### 3. UI Component Updates

1. Update authentication components
2. Update profile components
3. Update company components
4. Update journey map components
5. Update idea hub components
6. Update task management components
7. Update standup components
8. Update community components
9. Update messaging components
10. Update admin components

### 4. New Feature Implementation

1. Implement password reset
2. Implement step completion tracking
3. Implement focus areas
4. Implement step feedback
5. Implement action choices
6. Implement tool recommendation
7. Implement custom tool addition
8. Implement AI tool description generation
9. Implement idea status tracking
10. Implement company page

### 5. Cross-Cutting Concerns

1. Implement accessibility enhancements
   - Add ARIA attributes
   - Ensure keyboard navigation
   - Implement focus management
   - Add screen reader support
   - Ensure color contrast compliance

2. Implement responsive design
   - Use mobile-first approach
   - Add breakpoints for different screen sizes
   - Ensure touch-friendly UI elements
   - Test on multiple device sizes

3. Implement detailed logging
   - Add frontend event logging
   - Add API request/response logging
   - Add error logging
   - Add business event logging
   - Implement sensitive data masking

## Implementation Timeline

### Week 1: Core Identity & Data Models
- Update all TypeScript interfaces and types
- Update authentication and profile services
- Implement password reset
- Update company service and context management

### Week 2: Journey Map & Company
- Update journey service and map components
- Implement step completion and focus areas
- Implement company page
- Implement step feedback

### Week 3: Tools & Actions
- Implement action choices UI
- Implement tool recommendation
- Implement custom tool addition
- Implement AI tool description generation

### Week 4: Idea Hub & Tasks
- Update idea service and components
- Implement idea status tracking
- Update task service and components
- Enhance task-journey integration

### Week 5: AI Integration & Community
- Update standup service and components
- Enhance journey context integration
- Update community and messaging services
- Implement cross-cutting concerns

### Week 6: Administration & Testing
- Update admin services and components
- Implement journey content management
- Comprehensive testing and bug fixing
- Performance optimization

## Testing Strategy

### Unit Testing
- Test all updated services
- Test new components
- Test utility functions

### Integration Testing
- Test authentication flows
- Test journey map interactions
- Test idea hub workflows
- Test task management workflows
- Test standup bot end-to-end

### Accessibility Testing
- Automated testing with axe-core
- Manual keyboard navigation testing
- Screen reader testing

### Responsive Testing
- Test on mobile, tablet, and desktop viewports
- Test touch interactions
- Verify layout at different breakpoints

## Conclusion

This adaptation plan provides a comprehensive roadmap for updating the existing codebase to work with the new database schema while preserving working components and implementing new features as required. By following this plan, we can ensure a smooth transition to the new schema and deliver a high-quality MVP that meets all the specified requirements.
