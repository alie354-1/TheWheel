# Recommendation System Guide

This guide provides an overview of the journey step and tool recommendation system implemented in The Wheel platform.

## Overview

The recommendation system enhances the user experience by providing personalized guidance through the journey process. It consists of:

1. **SQL Database Components**
   - Tables, views, and functions for storing and calculating recommendations
   - Relationship tracking between journey steps
   - Tool recommendation scoring

2. **React UI Components**
   - Visual components that display recommendations to users
   - Interactive relationship visualizations
   - Animated transitions and loading states

3. **Service Layer**
   - TypeScript service for interacting with the recommendation API
   - Utility functions for formatting and calculations

## Database Setup

### Key Tables

- `tool_recommendations`: Links tools to journey steps with relevance scores
- `journey_steps`: Contains core step data with metadata like difficulty
- `journey_step_relationships`: View showing step relationships (prerequisites/dependents)

### SQL Functions

The system includes several SQL functions that can be directly executed in the Supabase SQL Editor:

1. **`get_steps_by_industry_popularity`**
   - Returns steps ranked by popularity within a specific industry
   - Useful for industry-specific recommendations

2. **`get_common_step_sequences`**
   - Identifies steps commonly taken after completing specific steps
   - Creates a "path" through the journey based on common patterns

3. **`get_personalized_step_recommendations`**
   - Generates personalized step recommendations for a company
   - Factors in prerequisites, industry, and sequence data
   - Provides reasoning for each recommendation

4. **`get_recommended_tools_for_step`**
   - Returns the top tools recommended for a specific step
   - Ordered by relevance score

5. **`get_step_relationships`**
   - Returns relationship data for visualizing step connections
   - Supports multi-level relationship depth

## Setup and Migration

### Database Migration

1. Run the database migration script to create necessary tables and functions:
   ```
   node scripts/run-recommendation-system-migration.js
   ```

2. Seed the initial tool recommendations data using either:
   - JavaScript approach: `node scripts/seed-tool-recommendations.js`
   - SQL approach: Execute `supabase/sql/20250430_seed_tool_recommendations.sql` in the Supabase SQL Editor

### Testing the System

You can test the recommendation functions through the Supabase SQL Editor:

```sql
-- Get tool recommendations for a step
SELECT * FROM get_recommended_tools_for_step(
  'step-id-here',
  5  -- Limit to 5 tools
);

-- Get personalized step recommendations
SELECT * FROM get_personalized_step_recommendations(
  'company-id-here',
  5,   -- Limit to 5 steps
  true -- Exclude completed steps
);

-- Get step relationships for visualization
SELECT * FROM get_step_relationships(
  'step-id-here',
  2  -- Relationship depth
);
```

## UI Components

### NextBestSteps Component

The `NextBestSteps` component displays personalized step recommendations:

```tsx
import { NextBestSteps } from '@/components/company/journey/StepRecommendations';

// In your component:
<NextBestSteps 
  limit={3} 
  onStepSelect={(stepId) => handleStepSelected(stepId)} 
/>
```

**Features:**
- Shows step name, description, and difficulty
- Displays estimated time to complete
- Shows reasoning behind recommendations
- Animated loading states
- Interactive UI with hover effects

### StepRelationshipMap Component

The `StepRelationshipMap` visualizes relationships between steps:

```tsx
import { StepRelationshipMap } from '@/components/company/journey/StepRecommendations';

// In your component:
<StepRelationshipMap 
  stepId="step-id-here" 
  onStepSelect={(stepId) => navigateToStep(stepId)}
  maxItems={8}
/>
```

**Features:**
- Interactive network visualization
- Color-coded relationship types
- Animated node transitions
- Support for relationship exploration

## Scoring Algorithm

Recommendations are ranked using a sophisticated scoring algorithm that considers multiple factors:

1. **Base Score**: All steps start with a base score of 5

2. **Prerequisite Completion**:
   - Steps with no prerequisites: +2 points
   - Steps with all prerequisites complete: +2 points
   - Steps with incomplete prerequisites: -5 points (deprioritized)

3. **Industry Relevance**:
   - Based on popularity within the company's industry
   - Contributes 0-2 points to score

4. **Sequential Patterns**:
   - Based on what other companies typically do next
   - Contributes 0-1 points to score

5. **Final Range**:
   - Scores are clamped to a 1-10 range
   - Higher scores indicate stronger recommendations

## Extension and Customization

The recommendation system is designed to be extensible:

1. **Adding New Factors**:
   - Modify the scoring algorithm in the SQL functions
   - Add additional context to the recommendation records

2. **UI Customization**:
   - Both NextBestSteps and StepRelationshipMap accept custom styling
   - Card layouts can be customized through component props

3. **Future ML Integration**:
   - The scoring system provides a foundation for machine learning models
   - Reasoning fields allow for explanation of ML-based recommendations

## Troubleshooting

### Common Issues

1. **Missing Recommendations**:
   - Ensure tool_recommendations table is populated
   - Check that steps have proper metadata (difficulty, time estimates)
   - Verify company industry is set correctly

2. **Incorrect Relationships**:
   - Check prerequisite_steps JSON arrays in journey_steps
   - Verify relationship views are refreshed after step changes

3. **Performance Issues**:
   - Functions use materialized views for better performance
   - Consider adding indices for frequently queried columns
   - Batch recommendations requests for related operations

## API Reference

For detailed API documentation of the TypeScript services and components, refer to:
- `src/lib/services/recommendation.service.ts`
- `src/components/company/journey/StepRecommendations/NextBestSteps.tsx`
- `src/components/company/journey/StepRecommendations/StepRelationshipMap.tsx`

## Security Considerations

- All database functions use `SECURITY DEFINER` to ensure proper access control
- Row-level security (RLS) policies should be applied to the tool_recommendations table
- Consider adding rate limiting for recommendation API endpoints
