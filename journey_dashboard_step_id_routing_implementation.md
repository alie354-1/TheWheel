# Journey Dashboard Step ID Routing Implementation

## Overview

This document outlines the implementation plan for the dual-ID system in the URL routing for the Journey Dashboard. The system will use different step IDs in the URL depending on the step's activation status:

1. **Template Step ID**: Used for browsing/viewing template steps that have not yet been activated by a company
2. **Company Journey Step ID**: Used for steps that have been activated and are part of a company's journey

## Current Implementation

Currently, the system uses a single URL pattern for all steps:

```
/company/new-journey/step/:stepId
```

Where `:stepId` can be either a template step ID or a company journey step ID, leading to potential confusion and data fetching issues.

## Proposed Implementation

### 1. URL Structure

We will implement a dual-URL structure to clearly distinguish between template steps and activated company steps:

```
# For template steps (not yet activated)
/company/new-journey/template-step/:templateStepId

# For company journey steps (activated)
/company/new-journey/company-step/:companyStepId
```

### 2. Router Configuration

Update the `NewJourneyRouter.tsx` component to handle both URL patterns:

```tsx
// In NewJourneyRouter.tsx
<Routes>
  <Route path="dashboard" element={<NewJourneyDashboard />} />
  <Route path="browse" element={<BrowseStepsPage />} />
  
  {/* Template step route */}
  <Route path="template-step/:templateStepId" element={<StepDetailPage isTemplateStep={true} />} />
  
  {/* Company step route */}
  <Route path="company-step/:companyStepId" element={<StepDetailPage isTemplateStep={false} />} />
  
  {/* Legacy route for backward compatibility */}
  <Route path="step/:stepId" element={<StepRedirectHandler />} />
</Routes>
```

### 3. Step Redirect Handler

Create a new component to handle legacy URLs and redirect to the appropriate new URL:

```tsx
// StepRedirectHandler.tsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../../lib/utils/supabaseClient';

const StepRedirectHandler: React.FC = () => {
  const { stepId } = useParams<{ stepId: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    const determineStepType = async () => {
      if (!stepId) return;
      
      try {
        // Check if this is a company journey step
        const { data: companyStepData, error: companyStepError } = await supabase
          .from('company_journey_steps')
          .select('id')
          .eq('id', stepId)
          .single();
        
        if (!companyStepError && companyStepData) {
          // This is a company journey step
          navigate(`/company/new-journey/company-step/${stepId}`, { replace: true });
          return;
        }
        
        // Check if this is a template step
        const { data: templateStepData, error: templateStepError } = await supabase
          .from('journey_step_templates')
          .select('id')
          .eq('id', stepId)
          .single();
        
        if (!templateStepError && templateStepData) {
          // This is a template step
          navigate(`/company/new-journey/template-step/${stepId}`, { replace: true });
          return;
        }
        
        // If we can't determine the type, default to template step
        navigate(`/company/new-journey/template-step/${stepId}`, { replace: true });
      } catch (error) {
        console.error('Error determining step type:', error);
        // Default to template step on error
        navigate(`/company/new-journey/template-step/${stepId}`, { replace: true });
      }
    };
    
    determineStepType();
  }, [stepId, navigate]);
  
  // Show loading while redirecting
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
};

export default StepRedirectHandler;
```

### 4. Update StepDetailPage Component

Modify the `StepDetailPage` component to handle both template steps and company steps:

```tsx
// StepDetailPage.tsx
interface StepDetailPageProps {
  isTemplateStep?: boolean;
}

const StepDetailPage: React.FC<StepDetailPageProps> = ({ isTemplateStep = false }) => {
  // Use different params based on the route
  const templateParams = useParams<{ templateStepId: string }>();
  const companyParams = useParams<{ companyStepId: string }>();
  
  // Determine which ID to use
  const stepId = isTemplateStep ? templateParams.templateStepId : companyParams.companyStepId;
  
  // Rest of the component...
  
  useEffect(() => {
    const fetchStepData = async () => {
      if (!stepId) return;
      
      try {
        if (isTemplateStep) {
          // Fetch template step data
          const { data, error } = await supabase
            .from('journey_step_templates')
            .select('*')
            .eq('id', stepId)
            .single();
          
          if (error) {
            console.error('Error fetching template step:', error);
            return;
          }
          
          // Convert template data to StepDetail format
          setStep({
            id: data.id,
            name: data.name,
            description: data.description,
            // ... other fields
          });
        } else {
          // Fetch company journey step data
          const { data, error } = await supabase
            .from('company_journey_steps')
            .select('*')
            .eq('id', stepId)
            .single();
          
          if (error) {
            console.error('Error fetching company step:', error);
            return;
          }
          
          // Convert company step data to StepDetail format
          setStep({
            id: data.id,
            name: data.name,
            description: data.description,
            // ... other fields
          });
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStepData();
  }, [stepId, isTemplateStep]);
  
  // Rest of the component...
};
```

### 5. Update Navigation Functions

Update all navigation functions in the dashboard components to use the appropriate URL pattern:

```tsx
// Example in NewJourneyDashboardOption3.tsx
const handleContinueStep = async (stepId: string) => {
  if (!companyJourney?.id) return;
  
  try {
    // Update step status to active if not already
    const step = [...(inProgressSteps || []), ...(urgentSteps || [])].find(s => s.step.id === stepId);
    if (step?.step.status === 'not_started') {
      await newCompanyJourneyService.updateStepStatus(stepId, 'active');
    }
    
    // Navigate to company step detail page
    navigate(`/company/new-journey/company-step/${stepId}`);
  } catch (error) {
    console.error('Error continuing step:', error);
  }
};

// For starting a new step from recommendations
const handleStartRecommendation = async (recId: string) => {
  if (!companyJourney?.id) return;
  
  try {
    // Find the recommendation
    const recommendation = recommendedSteps.find(r => r.id === recId);
    if (!recommendation) return;
    
    // For recommendations, use the template step ID
    navigate(`/company/new-journey/template-step/${recId}`);
  } catch (error) {
    console.error('Error starting recommendation:', error);
  }
};
```

### 6. Step Activation Logic

Implement logic to handle the transition from template step to company step:

```tsx
// In StepDetailPage.tsx for template steps
const handleActivateStep = async () => {
  if (!templateParams.templateStepId || !currentCompany?.id) return;
  
  try {
    // Create a new company journey step based on the template
    const { data, error } = await supabase
      .from('company_journey_steps')
      .insert({
        company_journey_id: companyJourney.id,
        template_step_id: templateParams.templateStepId,
        name: step?.name,
        description: step?.description,
        status: 'active',
        started_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error activating step:', error);
      return;
    }
    
    // Navigate to the newly created company step
    navigate(`/company/new-journey/company-step/${data.id}`);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
};
```

### 7. Update Links and Buttons

Update all links and buttons throughout the application to use the appropriate URL pattern:

```tsx
// For template steps
<Link to={`/company/new-journey/template-step/${step.id}`}>
  {step.name}
</Link>

// For company steps
<Link to={`/company/new-journey/company-step/${step.id}`}>
  {step.name}
</Link>
```

## Data Flow

The data flow for the dual-ID system will work as follows:

1. **Template Step Flow**:
   - User browses step templates or recommendations
   - User clicks on a template step
   - System navigates to `/company/new-journey/template-step/:templateStepId`
   - StepDetailPage fetches template data from `journey_step_templates` table
   - User can view details and choose to activate the step
   - On activation, a new record is created in `company_journey_steps` table
   - User is redirected to the company step URL

2. **Company Step Flow**:
   - User views their active or completed steps
   - User clicks on a company step
   - System navigates to `/company/new-journey/company-step/:companyStepId`
   - StepDetailPage fetches company step data from `company_journey_steps` table
   - User can work on tasks, mark as complete, etc.

## Database Schema Considerations

To support this dual-ID system, ensure the database schema has the following:

1. **journey_step_templates table**:
   - Contains template definitions for all possible steps
   - Has a unique `id` field (UUID)
   - Contains metadata like name, description, domain, etc.

2. **company_journey_steps table**:
   - Contains instances of steps activated by companies
   - Has a unique `id` field (UUID)
   - Has a `template_step_id` field referencing the original template
   - Contains company-specific data like status, progress, start/end dates

## Testing Plan

1. **URL Routing Tests**:
   - Test navigation to template step URLs
   - Test navigation to company step URLs
   - Test legacy URL redirection

2. **Data Fetching Tests**:
   - Test fetching template step data
   - Test fetching company step data
   - Test error handling for invalid IDs

3. **Step Activation Tests**:
   - Test activating a template step
   - Test the transition from template to company step
   - Test data persistence during activation

4. **Integration Tests**:
   - Test the complete flow from browsing templates to working on activated steps
   - Test navigation between different parts of the journey system

## Implementation Timeline

1. **Week 1**: Update router configuration and create redirect handler
2. **Week 1**: Modify StepDetailPage to handle both step types
3. **Week 2**: Update navigation functions throughout the application
4. **Week 2**: Implement step activation logic
5. **Week 3**: Update all links and buttons to use the appropriate URL pattern
6. **Week 3**: Comprehensive testing and bug fixing

## Conclusion

The dual-ID system in the URL routing will provide a clear distinction between template steps and activated company steps. This approach will improve data fetching, make the user flow more intuitive, and ensure proper tracking of step progress throughout the journey system.
