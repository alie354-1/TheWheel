# Journey System Technical Overview

This document provides a technical overview of the Journey System implementation, including architecture, data model, and integration points.

## Architecture

The Journey System follows a layered architecture:

1. **Database Layer**: Supabase PostgreSQL database tables and relationships
2. **Service Layer**: TypeScript services for business logic
3. **UI Layer**: React components for user interface

### System Components

The Journey System consists of the following components:

1. **Journey Integration System**:
   - Manages journey phases and steps
   - Tracks progress through the journey
   - Connects steps with experts, templates, and peer insights

2. **Recommendation System**:
   - Provides expert recommendations
   - Provides template recommendations
   - Provides peer insights

3. **Expert Connection System**:
   - Manages expert profiles
   - Handles availability and scheduling
   - Processes connection requests

4. **Community Integration**:
   - Shares journey steps with the community
   - Imports steps from the community
   - Facilitates discussions about steps

## Data Model

### Core Tables

1. **journey_phases**:
   - `id`: UUID (primary key)
   - `name`: String (e.g., "Validate", "Build", "Launch", "Scale")
   - `description`: Text
   - `order`: Integer
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

2. **journey_steps**:
   - `id`: UUID (primary key)
   - `phase_id`: UUID (foreign key to journey_phases)
   - `name`: String
   - `description`: Text
   - `order`: Integer
   - `estimated_time`: Integer (in hours)
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

3. **company_journeys**:
   - `id`: UUID (primary key)
   - `company_id`: UUID (foreign key to companies)
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

4. **step_progress**:
   - `id`: UUID (primary key)
   - `company_journey_id`: UUID (foreign key to company_journeys)
   - `step_id`: UUID (foreign key to journey_steps)
   - `status`: Enum ("not_started", "in_progress", "completed")
   - `start_date`: Timestamp
   - `completion_date`: Timestamp
   - `notes`: Text
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

### Recommendation Tables

1. **step_expert_recommendations**:
   - `id`: UUID (primary key)
   - `step_id`: UUID (foreign key to journey_steps)
   - `expert_id`: UUID (foreign key to expert_profiles)
   - `recommendation`: Text
   - `order`: Integer
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

2. **step_template_recommendations**:
   - `id`: UUID (primary key)
   - `step_id`: UUID (foreign key to journey_steps)
   - `template_id`: UUID (foreign key to templates)
   - `recommendation`: Text
   - `order`: Integer
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

3. **peer_insights**:
   - `id`: UUID (primary key)
   - `step_id`: UUID (foreign key to journey_steps)
   - `company_id`: UUID (foreign key to companies)
   - `insight`: Text
   - `time_to_complete`: Integer (in hours)
   - `blockers`: Text
   - `success_strategies`: Text
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

### Analytics Tables

1. **step_completion_analytics**:
   - `id`: UUID (primary key)
   - `step_id`: UUID (foreign key to journey_steps)
   - `company_id`: UUID (foreign key to companies)
   - `time_to_complete`: Integer (in hours)
   - `created_at`: Timestamp

## Service Layer

### Journey Integration Service

The Journey Integration Service (`src/lib/services/journey-integration/index.ts`) provides the following functionality:

```typescript
interface JourneyIntegrationService {
  // Phase management
  getPhases(): Promise<Phase[]>;
  getPhaseById(id: string): Promise<Phase>;
  
  // Step management
  getSteps(phaseId?: string): Promise<Step[]>;
  getStepById(id: string): Promise<Step>;
  
  // Progress tracking
  getProgress(companyId: string): Promise<StepProgress[]>;
  updateProgress(progressId: string, status: ProgressStatus): Promise<StepProgress>;
  
  // Analytics
  logStepCompletion(stepId: string, companyId: string, timeToComplete: number): Promise<void>;
  getStepCompletionAnalytics(stepId: string): Promise<StepCompletionAnalytics>;
}
```

### Recommendation Service

The Recommendation Service (`src/lib/services/recommendation/index.ts`) provides the following functionality:

```typescript
interface RecommendationService {
  // Expert recommendations
  getExpertRecommendations(stepId: string): Promise<ExpertRecommendation[]>;
  
  // Template recommendations
  getTemplateRecommendations(stepId: string): Promise<TemplateRecommendation[]>;
  
  // Peer insights
  getPeerInsights(stepId: string): Promise<PeerInsight[]>;
}
```

## UI Components

### JourneyHomePage

The JourneyHomePage component (`src/components/company/journey/pages/JourneyHomePage.tsx`) is the main entry point for the Journey System. It displays:

- Journey phases
- Steps within each phase
- Progress through the journey
- Recommendation panels

### Recommendation Panels

1. **ExpertRecommendationPanel** (`src/components/journey/ExpertRecommendationPanel.tsx`):
   - Displays expert recommendations for a step
   - Allows users to connect with experts

2. **TemplateRecommendationPanel** (`src/components/journey/TemplateRecommendationPanel.tsx`):
   - Displays template recommendations for a step
   - Allows users to use or preview templates

3. **PeerInsightsPanel** (`src/components/journey/PeerInsightsPanel.tsx`):
   - Displays peer insights for a step
   - Shows average completion time, common blockers, and success strategies

### JourneyStepPage

The JourneyStepPage component (`src/components/journey/JourneyStepPage.tsx`) displays detailed information about a specific step, including:

- Step description
- Resources
- Expert recommendations
- Template recommendations
- Peer insights
- Progress tracking

## Integration Points

### Expert Connection System

The Journey System integrates with the Expert Connection System to:

- Display expert recommendations for each step
- Allow users to connect with experts
- Schedule meetings with experts
- Pay for expert services

### Community Integration

The Journey System integrates with the Community module to:

- Share journey steps with the community
- Import steps from the community
- Discuss steps with other founders

### Calendar Integration

The Journey System integrates with calendar systems to:

- Schedule meetings with experts
- Set reminders for step deadlines
- Track time spent on steps

## Deployment

The Journey System is deployed using the following scripts:

1. `supabase/apply_journey_integration.sh`: Applies the journey integration system
2. `supabase/apply_journey_sample_data.sh`: Applies sample data for the journey system
3. `supabase/apply_all_journey_integration.sh`: Master script for applying all changes
4. `supabase/make_journey_system_executable.sh`: Makes scripts executable
5. `supabase/apply_journey_system.sh`: Applies the entire journey system
6. `supabase/make_all_scripts_executable.sh`: Makes all scripts executable

## Future Technical Enhancements

1. **AI-Powered Recommendations**:
   - Integration with OpenAI API
   - Machine learning models for personalized recommendations
   - Natural language processing for content generation

2. **Journey Analytics Dashboard**:
   - Data visualization components
   - Real-time analytics processing
   - Benchmarking algorithms

3. **Mobile Experience**:
   - React Native implementation
   - Offline data synchronization
   - Push notification system

## Conclusion

The Journey System provides a comprehensive technical solution for guiding startup founders through the process of building a successful startup. The layered architecture, robust data model, and integration with other systems create a flexible and extensible platform that can evolve to meet the changing needs of founders.

The implementation follows best practices for TypeScript and React development, with a focus on maintainability, scalability, and performance. The use of Supabase for the database layer provides a solid foundation for data storage and retrieval, with real-time capabilities for a responsive user experience.
