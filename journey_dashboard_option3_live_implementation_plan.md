# Journey Dashboard Option 3 Live Implementation Plan

## Overview

This implementation plan outlines the steps needed to make the Option 3 Journey Dashboard fully functional with real data. The dashboard is already structured correctly with the right components, but we need to connect it to real data sources and implement the interactive functionality.

## Current State Analysis

The Option 3 dashboard currently:
- Has the correct layout and UI components
- Uses placeholder/mock data for most sections
- Has hooks and services defined but not fully connected
- Lacks some interactive functionality (quick view, step details, etc.)

## Implementation Approach

We'll take a phased approach to implementing the live dashboard:

1. **Data Integration**: Connect existing hooks to UI components
2. **Interactive Features**: Implement quick view, step details, and other interactive features
3. **AI Integration**: Connect AI recommendations and business health to real data
4. **Performance Optimization**: Ensure efficient data loading and real-time updates
5. **Testing & Refinement**: Test all functionality and refine the user experience

## Detailed Implementation Plan

### Phase 1: Data Integration

#### 1.1 Connect Company Steps to Real Data

```typescript
// In NewJourneyDashboardOption3.tsx

// Use the useCompanySteps hook to fetch real data
const { 
  inProgressSteps, 
  urgentSteps, 
  completedSteps, 
  loading: stepsLoading,
  handleDeleteStep 
} = useCompanySteps(companyJourney?.id || '');

// Update the sidebar to use real data
const sidebarContent = (
  <div className="space-y-6 p-4">
    {/* ... */}
    <div className="mb-4">
      <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-3 flex items-center">
        <AlertTriangle className="h-3 w-3 mr-2" />
        Urgent Steps
      </h3>
      <ul className="space-y-2">
        {urgentSteps && urgentSteps.length > 0 ? (
          urgentSteps.map((step) => (
            <li key={step.step.id} className="p-2 border border-red-100 bg-red-50 rounded-md">
              {/* Step content */}
            </li>
          ))
        ) : (
          <li className="p-2 border border-gray-200 bg-gray-50 rounded-md text-center text-sm text-gray-500">
            No urgent steps
          </li>
        )}
      </ul>
    </div>
    {/* ... */}
  </div>
);
```

#### 1.2 Connect Step Tasks to Real Data

```typescript
// In NewJourneyDashboardOption3.tsx

// For each step, use the useStepTasks hook to fetch tasks
const { tasks: stepTasks, loading: tasksLoading } = useStepTasks(stepWithMeta.step.id);

// Pass tasks to the ActiveStepCard component
<ActiveStepCard
  key={stepWithMeta.step.id}
  step={{
    id: stepWithMeta.step.id,
    title: stepWithMeta.step.name,
    description: stepWithMeta.step.description,
    domain: stepWithMeta.step.domain?.name || 'General',
    status: stepWithMeta.step.status,
    priority: stepWithMeta.isUrgent ? 'high' : 'normal'
  }}
  progress={stepWithMeta.completion ? Math.round(stepWithMeta.completion * 100) : 0}
  lastWorkedOn={stepWithMeta.step.updated_at ? new Date(stepWithMeta.step.updated_at).toLocaleString() : 'Recently'}
  startDate={stepWithMeta.step.started_at || undefined}
  dueDate={stepWithMeta.dueDate || undefined}
  nextTasks={tasksLoading ? [] : stepTasks}
  timeSpent={'4.5 hours'} // This should come from analytics data
  tools={['Zoom', 'Google Forms', 'Miro']} // This should come from step metadata
  expandable={true}
  expanded={expandedSteps.includes(stepWithMeta.step.id)}
  onToggleExpand={() => toggleStepExpand(stepWithMeta.step.id)}
  onContinue={() => handleContinueStep(stepWithMeta.step.id)}
/>
```

#### 1.3 Connect AI Recommendations to Real Data

```typescript
// In NewJourneyDashboardOption3.tsx

// Use the useAIDashboard hook to fetch AI recommendations
const { 
  recommendedSteps, 
  peerInsights, 
  businessHealth, 
  isLoading: aiLoading,
  refreshAllData 
} = useAIDashboard(companyJourney?.id || '');

// Update the recommendations section to use real data
{recommendedSteps && recommendedSteps.length > 0 ? (
  recommendedSteps.map(rec => (
    <div key={rec.id} className="mb-3">
      <RecommendationCard
        id={rec.id}
        title={rec.title}
        domain={rec.domain}
        description={rec.description}
        peerPercentage={rec.peerPercentage}
        estimatedTime={rec.estimatedTime}
        difficulty={rec.difficulty as Difficulty}
        expandable={true}
        expanded={expandedRecommendations.includes(rec.id)}
        onToggleExpand={() => toggleRecommendationExpand(rec.id)}
        onStart={() => handleStartRecommendation(rec.id)}
        whyItMatters={rec.reason}
        recommendedTools={rec.tools}
        iconColor={rec.domain === 'Product' ? 'blue' : 
                   rec.domain === 'Development' ? 'purple' : 
                   rec.domain === 'Finance' ? 'green' : 'indigo'}
      />
    </div>
  ))
) : (
  <div className="text-center py-8 text-gray-500">
    <p>No recommendations available at this time.</p>
  </div>
)}
```

#### 1.4 Connect Business Health Widget to Real Data

```typescript
// In NewJourneyDashboardOption3.tsx

// Update the business health section to use real data
{isLoading ? (
  <div className="flex justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
) : businessHealth && businessHealth.domainInsights ? (
  businessHealth.domainInsights.map((domain, index) => (
    <div key={domain.domain} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-800">{domain.domain}</span>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700 flex items-center gap-1">
          {domain.isActiveFocus ? (
            <>
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              <span>Active Focus</span>
            </>
          ) : (
            <>
              <Clock className="h-3 w-3 text-blue-500" />
              <span>Maintaining</span>
            </>
          )}
        </span>
      </div>
      
      {/* Maturity level indicator */}
      <div className="w-full flex mb-2 mt-2 gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div 
            key={level}
            className={`h-2 flex-1 rounded-sm ${
              level <= domain.maturityLevel 
                ? (domain.maturityLevel >= 4 ? 'bg-green-500' : 'bg-blue-500') 
                : 'bg-gray-200'
            }`}
          ></div>
        ))}
      </div>
      
      {/* Rest of domain insights */}
    </div>
  ))
) : (
  <div className="flex justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
)}
```

### Phase 2: Interactive Features

#### 2.1 Implement Quick View Functionality

```typescript
// In NewJourneyDashboardOption3.tsx

// Add state for the quick view modal
const [quickViewStep, setQuickViewStep] = useState<NewCompanyJourneyStep | null>(null);

// Add handler for opening the quick view modal
const handleQuickView = (stepId: string) => {
  const step = [...(inProgressSteps || []), ...(urgentSteps || []), ...(completedSteps || [])].find(s => s.step.id === stepId);
  if (step) {
    setQuickViewStep(step.step);
  }
};

// Add handler for closing the quick view modal
const handleCloseQuickView = () => {
  setQuickViewStep(null);
};

// Add the quick view modal to the component
{quickViewStep && (
  <StepQuickViewModal
    step={quickViewStep}
    onClose={handleCloseQuickView}
    onOpenDetails={(stepId) => {
      handleCloseQuickView();
      handleStepClick(stepId);
    }}
  />
)}

// Update the quick view buttons in the sidebar
<button 
  className="p-1 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-indigo-50" 
  title="Quick view"
  onClick={() => handleQuickView(step.step.id)}
>
  <Eye className="h-3 w-3" />
</button>
```

#### 2.2 Implement Step Continuation

```typescript
// In NewJourneyDashboardOption3.tsx

// Add handler for continuing a step
const handleContinueStep = async (stepId: string) => {
  if (!companyJourney?.id) return;
  
  try {
    // Update step status to active if not already
    const step = [...(inProgressSteps || []), ...(urgentSteps || [])].find(s => s.step.id === stepId);
    if (step?.step.status === 'not_started') {
      await newCompanyJourneyService.updateStepStatus(stepId, 'active');
    }
    
    // Navigate to step detail page
    navigate(`/company/new-journey/step/${stepId}`);
  } catch (error) {
    console.error('Error continuing step:', error);
  }
};
```

#### 2.3 Implement Step Activation from Recommendations

```typescript
// In NewJourneyDashboardOption3.tsx

// Add handler for starting a recommended step
const handleStartRecommendation = async (recId: string) => {
  if (!companyJourney?.id) return;
  
  try {
    // Find the recommendation
    const recommendation = recommendedSteps.find(r => r.id === recId);
    if (!recommendation) return;
    
    // In a real implementation, this would add the step to the journey
    // For now, we'll just navigate to the browse page
    navigate('/company/new-journey/browse', { 
      state: { 
        journeyId: companyJourney.id,
        recommendedStepId: recId
      } 
    });
  } catch (error) {
    console.error('Error starting recommendation:', error);
  }
};
```

### Phase 3: Real-time Updates

#### 3.1 Implement Real-time Task Updates

```typescript
// In StepTasksChecklist.tsx

// Add real-time subscription to task updates
useEffect(() => {
  if (!stepId) return;
  
  const subscription = supabase
    .from(`standup_tasks:step_id=eq.${stepId}`)
    .on('INSERT', (payload) => {
      setTasks((currentTasks) => [...currentTasks, payload.new]);
    })
    .on('UPDATE', (payload) => {
      setTasks((currentTasks) => 
        currentTasks.map((task) => 
          task.id === payload.new.id ? payload.new : task
        )
      );
    })
    .on('DELETE', (payload) => {
      setTasks((currentTasks) => 
        currentTasks.filter((task) => task.id !== payload.old.id)
      );
    })
    .subscribe();
  
  return () => {
    supabase.removeSubscription(subscription);
  };
}, [stepId]);
```

#### 3.2 Implement Real-time Step Updates

```typescript
// In useCompanySteps.ts

// Add real-time subscription to step updates
useEffect(() => {
  if (!journeyId) return;
  
  const subscription = supabase
    .from(`company_journey_steps:journey_id=eq.${journeyId}`)
    .on('INSERT', () => {
      fetchCompanySteps();
    })
    .on('UPDATE', () => {
      fetchCompanySteps();
    })
    .on('DELETE', () => {
      fetchCompanySteps();
    })
    .subscribe();
  
  return () => {
    supabase.removeSubscription(subscription);
  };
}, [journeyId]);
```

### Phase 4: Performance Optimization

#### 4.1 Implement Data Caching

```typescript
// In useAIDashboard.ts

// Add caching for AI recommendations
const [cachedRecommendations, setCachedRecommendations] = useState<Record<string, AIRecommendation[]>>({});

// Use cached data if available
const loadAllData = useCallback(async (forceRefresh = false) => {
  if (!companyJourneyId) return;
  
  // Check cache first
  if (!forceRefresh && cachedRecommendations[companyJourneyId]) {
    setRecommendedSteps(cachedRecommendations[companyJourneyId]);
    setIsLoading(false);
    return;
  }
  
  // Fetch data if not in cache
  setIsLoading(true);
  try {
    const recommendations = await aiDashboardService.getRecommendedSteps(companyJourneyId);
    setRecommendedSteps(recommendations);
    setCachedRecommendations((cache) => ({
      ...cache,
      [companyJourneyId]: recommendations
    }));
  } catch (error) {
    console.error('Error loading AI recommendations:', error);
  } finally {
    setIsLoading(false);
  }
}, [companyJourneyId, cachedRecommendations]);
```

#### 4.2 Optimize Data Loading

```typescript
// In NewJourneyDashboardOption3.tsx

// Only show loading state on initial load
const [initialLoadComplete, setInitialLoadComplete] = useState(false);

useEffect(() => {
  // Once all data is loaded at least once, mark initial load as complete
  if (!stepsLoading && !progressLoading && !aiLoading && !initialLoadComplete) {
    setInitialLoadComplete(true);
  }
}, [stepsLoading, progressLoading, aiLoading, initialLoadComplete]);

// Only show loading state on initial load
const isLoading = !initialLoadComplete && (companyLoading || journeyLoading || stepsLoading || progressLoading || aiLoading);
```

### Phase 5: Testing & Refinement

#### 5.1 Test All Functionality

- Test step listing and filtering
- Test quick view functionality
- Test step continuation
- Test recommendation activation
- Test real-time updates
- Test error handling

#### 5.2 Refine User Experience

- Add loading states for all async operations
- Add error handling and recovery
- Add tooltips and help text
- Ensure responsive design works on all screen sizes

## Implementation Timeline

| Phase | Tasks | Estimated Duration |
|-------|-------|-------------------|
| Phase 1: Data Integration | Connect steps, tasks, recommendations, and business health to real data | 2 days |
| Phase 2: Interactive Features | Implement quick view, step continuation, and recommendation activation | 2 days |
| Phase 3: Real-time Updates | Implement real-time task and step updates | 1 day |
| Phase 4: Performance Optimization | Implement data caching and optimize data loading | 1 day |
| Phase 5: Testing & Refinement | Test all functionality and refine user experience | 1 day |

## Conclusion

This implementation plan provides a clear roadmap for making the Option 3 Journey Dashboard fully functional with real data. By following this plan, we'll create a robust, interactive dashboard that provides real value to users tracking their founder journey.

The implementation leverages existing hooks and services, connecting them to UI components and adding interactive functionality. Real-time updates and performance optimizations will ensure a smooth user experience, while comprehensive testing will ensure reliability.
