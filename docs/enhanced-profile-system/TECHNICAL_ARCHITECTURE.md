# Technical Architecture: Enhanced Profile System

## Overview

The Enhanced Profile System is designed to provide a flexible, comprehensive user profile system with role-based customization and completion tracking, while maintaining compatibility with existing services. This document outlines the technical architecture, design decisions, and implementation considerations.

## System Components

### 1. Database Schema

The system builds upon the existing profile structure while adding new tables for enhanced functionality:

```
┌─────────────────┐       ┌────────────────────┐       ┌──────────────────────┐
│   profiles      │       │  profile_sections  │       │  professional_services│
│ (existing table)│       │  (new table)       │       │  (new table)          │
└────────┬────────┘       └─────────┬──────────┘       └───────────┬───────────┘
         │                          │                               │
         │                          │                               │
         │                          │                               │
┌────────┴────────┐       ┌─────────┴──────────┐       ┌───────────┴───────────┐
│ user_education  │       │profile_notifications│       │  user_work_experience │
│ (new table)     │       │(new table)          │       │  (new table)          │
└─────────────────┘       └────────────────────┘        └─────────────────────┘
```

**Key Database Design Decisions:**
1. **Enhancing vs. Replacing:** We add to the existing `profiles` table rather than replacing it to ensure compatibility.
2. **Sectional Approach:** Using `profile_sections` for modular, role-specific information.
3. **Specialized Tables:** Dedicated tables for complex data like work experience and education.
4. **Compatibility Views:** Using database views to provide compatibility with existing code.

### 2. Services Layer

The services layer mediates between the database and UI components:

```
┌───────────────────────┐
│ ProfileService        │
├───────────────────────┤
│ - getProfile()        │
│ - updateProfile()     │
│ - getProfileSections()│
│ - updateSection()     │
└─────────┬─────────────┘
          │
          │
┌─────────┼─────────────┐         ┌───────────────────────┐
│ CompletionService     │◄────────┤NotificationService    │
├───────────────────────┤         ├───────────────────────┤
│ - calculateCompletion()│        │ - createNotification()│
│ - getSectionStatus()   │        │ - getNotifications()  │
└───────────────────────┘         └───────────────────────┘
```

**Key Service Design Decisions:**
1. **Service Separation:** Distinct services for different concerns (profile data, completion calculation, notifications).
2. **Compatibility Layer:** Services that support both old and new profile formats.
3. **Event-Driven Updates:** Completion calculations trigger notification creation when thresholds are reached.

### 3. Data Models

Core TypeScript interfaces that define the system:

```typescript
// Core profile information
interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  company_id?: string; // Maintained for compatibility
  company_role?: string; // Maintained for compatibility
  primary_role?: string; // New field
  additional_roles?: string[]; // New field
  completion_percentage: number; // New field
  is_public: boolean;
  // ... other existing fields
}

// Profile section for modular completion tracking
interface ProfileSection {
  id: string;
  user_id: string;
  section_key: string;
  title: string;
  description?: string;
  completion_percentage: number;
  is_required: boolean;
  display_order: number;
  required_fields: {field: string}[];
  optional_fields: {field: string}[];
  is_role_specific: boolean;
  applicable_roles?: string[];
  last_updated: string;
}

// Work experience entry
interface WorkExperience {
  id: string;
  user_id: string;
  company_name: string;
  title: string;
  start_date?: Date;
  end_date?: Date;
  is_current: boolean;
  description?: string;
  location?: string;
  skills?: string[];
}

// Service offering
interface ProfessionalService {
  id: string;
  user_id: string;
  category: string;
  title: string;
  description?: string;
  expertise_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  rate_type: 'hourly' | 'project' | 'retainer';
  rate_range?: {min?: number; max?: number; currency?: string};
  availability: 'part_time' | 'full_time' | 'contract';
  is_active: boolean;
}

// Profile notification
interface ProfileNotification {
  id: string;
  user_id: string;
  type: 'milestone' | 'section' | 'inactivity' | 'quality' | 'recommendation';
  priority: 'critical' | 'important' | 'standard' | 'informational';
  title: string;
  description?: string;
  action_url?: string;
  action_label?: string;
  icon?: string;
  is_read: boolean;
  dismissible: boolean;
  created_at: string;
  expires_at?: string;
}
```

### 4. Component Architecture

UI components follow a hierarchical organization:

```
┌─────────────────────────────┐
│ OnboardingWizard            │
├─────────────────────────────┤
│ ┌───────────────────────┐   │
│ │ RoleSelectionStep     │   │
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │ CompanyStageStep      │   │
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │ InviteCodeStep        │   │
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │ FeatureRecommendations│   │
│ └───────────────────────┘   │
└─────────────────────────────┘

┌─────────────────────────────┐
│ ProfileBuilder              │
├─────────────────────────────┤
│ ┌───────────────────────┐   │
│ │ ProfileNavigation     │   │
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │ SectionEditor         │   │
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │ CompletionTracker     │   │
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │ NotificationCenter    │   │
│ └───────────────────────┘   │
└─────────────────────────────┘
```

**Key Component Design Decisions:**
1. **Modular Design:** Independent, reusable components that can be composed.
2. **Progressive Disclosure:** Components that reveal complexity progressively.
3. **Conditional Rendering:** Components that adapt based on user roles and context.
4. **State Management:** Centralized state for profile data with context providers.

## Integration with Existing Systems

### 1. Backward Compatibility Approach

The migration preserves compatibility with existing systems through several strategies:

1. **Non-destructive Schema Changes:** Only adding to existing tables, never removing columns.
2. **Database Views:** Creating views that combine old and new data structures.
3. **Service Layer Adapters:** Services that can work with both data models.
4. **Feature Flagging:** Gradual rollout with the ability to revert to old systems.

### 2. Integration Touchpoints

Key points where the new system interacts with existing components:

- **Authentication Flow:** Redirect to new onboarding after signup
- **Layout Components:** Enhanced profile UI in navigation
- **Idea Playground:** Respecting existing profile references and company_id 
- **Standup Bot:** Maintaining compatibility with profile queries
- **Task Generation:** Ensuring services can still access profile information

## Implementation Phases

The implementation will follow a phased approach:

### Phase 1: Database Foundation (1-2 weeks)
- Create new database tables and relationships
- Add compatibility views
- Implement basic profile service

### Phase 2: Onboarding Flow (2-3 weeks)
- Implement role selection components
- Create role-specific question flows
- Build feature recommendation system

### Phase 3: Profile Builder (3-4 weeks)
- Implement profile section components
- Build completion tracking system
- Create notification components

### Phase 4: Integration & Testing (2 weeks)
- Connect with existing services
- Perform comprehensive compatibility testing
- Address any integration issues

## Technical Considerations

### 1. Performance Optimizations
- Use of database indices for frequently queried fields
- Efficient completion calculation with appropriate caching
- Lazy loading of profile sections in the UI

### 2. Security Measures
- Row-Level Security policies for all new tables
- Careful permission checks in service layer
- Input validation for all profile updates

### 3. Scalability Considerations
- Database design supports growing number of profiles and sections
- Service architecture allows for future extensions
- Component design accommodates additional role types

## Future Enhancements

Potential future enhancements to the system:

1. **Advanced Role Management:** More sophisticated role permissions and visibility.
2. **Machine Learning Integration:** Smarter profile completion recommendations.
3. **Social Features:** Connections, endorsements, and network visualization.
4. **Integration APIs:** External system integration with the profile system.
