# Journey Integration System Implementation Guide

This guide provides detailed instructions for implementing the Journey Integration System, which connects the journey steps with experts, templates, and peer insights.

## Overview

The Journey Integration System enhances the existing journey system by adding:

1. Expert recommendations for each step
2. Template recommendations for each step
3. Peer insights for each step
4. Progress tracking and analytics

## Implementation Steps

### 1. Database Schema

The system uses the following tables:

- `journey_phases`: Phases of the journey (e.g., Validate, Build, Launch, Scale)
- `journey_steps`: Steps within each phase
- `company_journeys`: Company-specific journey information
- `step_progress`: Progress tracking for each step
- `step_resources`: Resources associated with each step
- `step_expert_recommendations`: Expert recommendations for each step
- `step_template_recommendations`: Template recommendations for each step
- `step_completion_analytics`: Analytics for step completions
- `peer_insights`: Peer insights for each step

The database schema is defined in `supabase/migrations/20250609_add_journey_integration_system.sql`.

### 2. Service Layer

The system includes two main services:

1. **Recommendation Service** (`src/lib/services/recommendation/index.real.ts`):
   - Provides expert recommendations
   - Provides template recommendations
   - Provides peer insights

2. **Journey Integration Service** (`src/lib/services/journey-integration/index.real.ts`):
   - Manages journey steps and phases
   - Tracks progress
   - Connects steps with experts and templates
   - Logs step completions for analytics

### 3. UI Components

The system includes the following UI components:

1. **Expert Recommendation Panel** (`src/components/journey/ExpertRecommendationPanel.tsx`):
   - Displays expert recommendations for a step
   - Allows users to connect with experts

2. **Template Recommendation Panel** (`src/components/journey/TemplateRecommendationPanel.tsx`):
   - Displays template recommendations for a step
   - Allows users to use or preview templates

3. **Peer Insights Panel** (`src/components/journey/PeerInsightsPanel.tsx`):
   - Displays peer insights for a step
   - Shows average completion time, common blockers, and success strategies

### 4. Data Migration

The system includes a migration script (`src/lib/services/journey-integration/migration.ts`) that:

1. Creates default journey phases
2. Migrates steps from the old `steps` table to the new `journey_steps` table
3. Migrates progress from the old `company_journey_steps` table to the new `step_progress` table
4. Migrates relationships from the old `step_relationships` table to the new tables

### 5. Integration with Existing System

The system integrates with the existing journey system by:

1. Updating the `JourneyHomePage` component to display the new panels
2. Using the existing company and user data
3. Maintaining compatibility with the existing step structure

## Installation

To install the Journey Integration System, follow these steps:

1. Apply the database migration:
   ```bash
   psql -U postgres -d postgres -f migrations/20250609_add_journey_integration_system.sql
   ```

2. Copy the real service implementations:
   ```bash
   cp src/lib/services/recommendation/index.real.ts src/lib/services/recommendation/index.ts
   cp src/lib/services/journey-integration/index.real.ts src/lib/services/journey-integration/index.ts
   ```

3. Update the JourneyHomePage component:
   ```bash
   cp src/components/company/journey/pages/JourneyHomePage.updated.tsx src/components/company/journey/pages/JourneyHomePage.tsx
   ```

4. Run the migration script:
   ```bash
   npx ts-node -r tsconfig-paths/register src/lib/services/journey-integration/migration.ts
   ```

Alternatively, you can use the provided script:
```bash
cd supabase
./apply_journey_integration.sh
```

## Usage

### Adding Expert Recommendations

To add expert recommendations for a step:

```typescript
import { journeyIntegrationService } from 'src/lib/services/journey-integration';

// Connect a step with experts
await journeyIntegrationService.connectStepWithExperts(
  'step-id',
  ['expert-id-1', 'expert-id-2', 'expert-id-3']
);
```

### Adding Template Recommendations

To add template recommendations for a step:

```typescript
import { journeyIntegrationService } from 'src/lib/services/journey-integration';

// Connect a step with templates
await journeyIntegrationService.connectStepWithTemplates(
  'step-id',
  ['template-id-1', 'template-id-2', 'template-id-3']
);
```

### Tracking Step Progress

To update a step's status:

```typescript
import { journeyIntegrationService } from 'src/lib/services/journey-integration';

// Update a step's status
await journeyIntegrationService.updateStepStatus(
  'step-id',
  'company-id',
  'in_progress',
  'Working on this step now'
);
```

### Getting Journey Progress

To get a company's journey progress:

```typescript
import { journeyIntegrationService } from 'src/lib/services/journey-integration';

// Get journey progress
const progress = await journeyIntegrationService.getJourneyProgress('company-id');
console.log(`Completed ${progress.completedSteps} of ${progress.totalSteps} steps`);
console.log(`Current phase: ${progress.currentPhase}`);
```

## Troubleshooting

### Common Issues

1. **Missing Panels**: If the recommendation panels are not showing up, check that:
   - The JourneyHomePage component has been updated
   - The services are properly imported
   - The step ID and company ID are being passed correctly

2. **No Recommendations**: If no recommendations are showing up, check that:
   - The step has been connected with experts and templates
   - The recommendation service is returning data
   - The database tables have been populated

3. **Migration Errors**: If the migration script fails, check that:
   - The database schema has been applied
   - The old tables exist and have data
   - The database connection is working

### Debugging

To debug the system, you can:

1. Check the browser console for errors
2. Add console.log statements to the services and components
3. Check the database tables to ensure data is being stored correctly

## Future Enhancements

1. **Personalized Recommendations**: Enhance the recommendation algorithm to provide more personalized recommendations based on the company's industry, stage, and goals.

2. **Analytics Dashboard**: Create a dashboard to visualize journey progress and analytics.

3. **Integration with Calendar**: Integrate with calendar systems to schedule meetings with experts.

4. **AI-Powered Insights**: Use AI to generate more insightful peer recommendations and success strategies.

## Conclusion

The Journey Integration System provides a powerful way to enhance the journey experience by connecting steps with experts, templates, and peer insights. By following this guide, you can successfully implement and use the system.
