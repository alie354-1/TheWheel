any o# Tool Selection API Documentation

## Overview

The Tool Selection API enables integration between journey steps and recommended tools. This document outlines the key endpoints, data structures, and usage patterns for effectively working with the tool selection system.

## Key Components

### Data Models

#### Tool Reference

Tools are represented using the `ToolReference` interface:

```typescript
interface ToolReference {
  id: string;
  name: string;
  description?: string;
  url?: string;
  logo_url?: string;
}
```

#### Personalized Tool Recommendation

The system can provide personalized tool recommendations with relevance scores:

```typescript
interface PersonalizedToolRecommendation {
  id: string;
  name: string;
  description?: string;
  url?: string;
  logo_url?: string;
  relevance_score: number; // Score from 0-10 indicating relevance
}
```

#### Tool List Item (UI-specific)

For display in the UI, additional properties are sometimes needed:

```typescript
interface ToolListItem extends ToolReference {
  ranking?: number;
  relevance_score?: number;
  is_custom?: boolean;
}
```

#### Scorecard Criterion

Used for evaluating tools against custom criteria:

```typescript
interface ScorecardCriterion {
  name: string;
  weight: number;
}
```

## API Endpoints

### Step-Tool Relationships

#### Get Tools for a Step

Retrieves all tools associated with a specific journey step.

```typescript
getStepTools(stepId: string): Promise<{ data: ToolListItem[], error: any }>
```

#### Get Personalized Recommendations

Returns personalized tool recommendations for a specific company and step, sorted by relevance.

```typescript
getPersonalizedToolRecommendations(
  companyId: string, 
  stepId: string
): Promise<{ data: PersonalizedToolRecommendation[], error: any }>
```

### Custom Tool Management

#### Get Custom Tools

Retrieves custom tools added by a company for a specific step.

```typescript
getCompanyCustomTools(
  companyId: string, 
  stepId: string
): Promise<{ data: ToolListItem[], error: any }>
```

#### Add Custom Tool

Adds a new custom tool for a company's step.

```typescript
addCompanyCustomTool(
  companyId: string,
  stepId: string,
  tool: { 
    name: string; 
    url: string; 
    description?: string; 
    logo_url?: string 
  }
): Promise<{ data: any, error: any }>
```

### Tool Selection & Evaluation

#### Save Scorecard Definition

Creates or updates a scorecard for evaluating tools.

```typescript
saveScorecardDefinition(
  companyId: string,
  toolId: string,
  stepId: string,
  criteria: ScorecardCriterion[],
  userId: string,
  name: string
): Promise<{ data: any, error: any }>
```

#### Get Scorecard Definitions

Retrieves scorecards for a company and step.

```typescript
getScorecardDefinitions(
  companyId: string, 
  stepId: string
): Promise<{ data: any, error: any }>
```

#### Save Tool Evaluation

Records an evaluation of a tool using a specific scorecard.

```typescript
saveToolEvaluation(
  scorecardId: string,
  toolId: string,
  userId: string,
  responses: Record<string, any>,
  notes: string
): Promise<{ data: any, error: any }>
```

#### Get Tool Evaluations

Retrieves evaluations for a specific tool and step.

```typescript
getToolEvaluations(
  toolId: string, 
  stepId: string
): Promise<{ data: any, error: any }>
```

#### Document Upload

Uploads a document related to a tool evaluation.

```typescript
uploadToolDocument(
  companyId: string,
  toolId: string,
  userId: string,
  fileUrl: string,
  fileType?: string,
  description?: string
): Promise<{ data: any, error: any }>
```

#### Get Tool Documents

Retrieves documents uploaded for a specific tool.

```typescript
getToolDocuments(
  toolId: string
): Promise<{ data: any, error: any }>
```

#### Select Tool for Step

Records a company's choice of tool for a specific step.

```typescript
selectCompanyToolForStep(
  companyId: string,
  stepId: string,
  toolId: string
): Promise<{ data: any, error: any }>
```

### Advanced Analytics

#### Get All Selected Tools

Retrieves all tools selected by a company across all steps.

```typescript
getAllCompanySelectedTools(
  companyId: string
): Promise<{ data: any, error: any }>
```

#### Get Similar Companies Using Tool

Finds similar companies that are using a specific tool.

```typescript
getSimilarCompaniesUsingTool(
  companyId: string,
  toolId: string,
  limit: number = 5
): Promise<{ data: any, error: any }>
```

#### Compare Tool Usage Statistics

Compares usage statistics between tools across all companies.

```typescript
compareToolUsageStatistics(
  toolIds: string[]
): Promise<{ data: any, error: any }>
```

## UI Components

Several UI components work with the Tool Selection API:

- `ToolRecommendationList`: Displays personalized tool recommendations
- `ToolList`: Shows all tools available for a step
- `ToolComparisonTable`: Enables comparison between selected tools
- `ToolDetailsModal`: Shows detailed information about a specific tool
- `ScorecardBuilder`: Allows creation of evaluation criteria
- `ToolEvaluationForm`: Facilitates evaluating tools against criteria
- `DocumentUploader`: Enables uploading supporting documents
- `EvaluationHistory`: Displays past evaluations

## Integration with Steps

The Tool Selection API is fully integrated with the journey steps data model:

- Each step can have multiple associated tools
- Tools can be recommended based on step requirements
- Companies can select tools for specific steps
- Tool evaluations are associated with both steps and tools
- Step progress can be influenced by tool selection

## Testing

Use the test script at `scripts/test-tool-selection-service.js` to verify the correct functioning of the Tool Selection API with the steps data model. The test script covers:

- Retrieving tools for steps
- Getting personalized recommendations
- Managing custom tools
- Creating and retrieving scorecards
- Selecting tools for steps

## Implementation Notes

The Tool Selection API uses Supabase for database operations and relies on several database tables:

- `journey_step_tools`: Associates tools with steps
- `company_custom_tools`: Stores custom tools for companies
- `company_tool_scorecards`: Contains evaluation criteria
- `company_tool_scorecard_responses`: Stores evaluation results
- `company_tool_documents`: Holds uploaded documents
- `company_journey_step_tools`: Records tool selections

Some operations use RPC functions for complex operations:

- `get_personalized_tool_recommendations`: Calculates personalized recommendations
- `get_similar_companies_using_tool`: Finds companies with similar tool usage
- `compare_tool_usage_statistics`: Generates usage statistics

## Best Practices

1. Always check for errors in the response objects
2. Use personalized recommendations when available
3. Limit comparison to 3-5 tools for best user experience
4. Ensure evaluation criteria have appropriate weights
5. Provide meaningful descriptions when uploading documents
6. Consider fallback logic if personalized recommendations are unavailable
