# Onboarding Wizard Blinking Fix

## Issue Description

The onboarding wizard was experiencing a bug where screens would blink and not progress properly through the steps. The main symptoms were:

1. Screens would flash/blink rapidly between steps
2. The wizard would sometimes get stuck and not progress to the next step
3. Clicking buttons multiple times was sometimes required to progress

## Root Causes

After investigation, we identified several root causes:

1. **Infinite Re-rendering Loops**: The `useEffect` hooks had dependency arrays that triggered too many re-renders
2. **Race Conditions**: Asynchronous operations were not properly coordinated, causing state updates at unexpected times
3. **State Instability**: Multiple state updates within a short time caused the UI to flash/blink
4. **Missing Error Handling**: Failed API calls weren't properly handled, causing the UI to get stuck in loading states
5. **Persona Creation Race Condition**: When creating a new persona, state updates triggered additional fetches before the persona creation was complete

## Solution Implemented

The following key fixes were implemented in `src/components/onboarding/OnboardingController.tsx`:

### 1. Added Refs to Track API Call Status

```typescript
// Reference to check if fetch has already been initiated
const fetchInitiatedRef = useRef<boolean>(false);
// Reference to track API request status
const isFetchingRef = useRef<boolean>(false);
```

These refs prevent multiple simultaneous API calls and avoid duplicate fetches on re-renders.

### 2. Memoized Fetch Function with useCallback

```typescript
const fetchOnboardingState = useCallback(async () => {
  // Skip if already fetching or already initiated
  if (!user || !personaId || isFetchingRef.current || fetchInitiatedRef.current) return;
  
  // Mark as fetching and initiated
  isFetchingRef.current = true;
  fetchInitiatedRef.current = true;
  
  // ... API call logic ...
}, [user, personaId, activePersona]);
```

The `useCallback` memoization prevents the function from being recreated on each render, and the additional flags track API call status.

### 3. Controlled Fetch Effect

```typescript
useEffect(() => {
  // Skip if there's no user or personaId isn't defined yet
  if (!user || !personaId) return;
  
  // Don't refetch if we've already started fetching
  if (isFetchingRef.current) return;
  
  fetchOnboardingState();
  
  // Cleanup
  return () => {
    // Reset fetching but keep initiated flag
    isFetchingRef.current = false;
  };
}, [user, personaId, fetchOnboardingState]);
```

This controls when the fetch is triggered and prevents unnecessary API calls.

### 4. Transition Protection

```typescript
// Use a ref to track whether we're currently transitioning
const isTransitioningRef = useRef<boolean>(false);

// Handle transitions between steps
const goToNextStep = useCallback(async (stepData: Record<string, any> = {}) => {
  if (!user || isTransitioningRef.current) return;
  
  // Prevent multiple clicks/transitions
  isTransitioningRef.current = true;
  
  // ... state update and API call logic ...
  
  // Allow transitions again after a short delay
  setTimeout(() => {
    isTransitioningRef.current = false;
    setLoading(false);
  }, 300);
}, [user, personaId, currentStep, userSelections]);
```

This prevents double-clicks or multiple rapid transitions, which could cause overlapping state updates.

### 5. Debounced Loading State

```typescript
// Add a debounced loading state to prevent flickering
const [stableLoading, setStableLoading] = useState(false);

useEffect(() => {
  if (loading) {
    // Set stable loading immediately when loading starts
    setStableLoading(true);
  } else {
    // Delay turning off loading indicator to prevent flickering
    const timer = setTimeout(() => {
      setStableLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }
}, [loading]);
```

This prevents the loading indicator from flickering rapidly by delaying its removal.

### 6. Better Error Handling

```typescript
try {
  // API call that might fail
} catch (error) {
  console.error('Error details:', error);
  // Continue anyway with sensible fallbacks
  setPersonalizationReady(true);
}
```

Improved error handling ensures that even if an API call fails, the UI doesn't get stuck.

### 7. Enhanced Logging

Added extensive console logging throughout the component to track state transitions and API calls, making it easier to debug future issues.

## Testing

A test script has been created (`scripts/test-onboarding-flow.js`) that sets up a test user and monitors the onboarding state. This script can be used to verify that the fix is working correctly.

## Future Recommendations

To prevent similar issues in the future:

1. Use refs to track the status of asynchronous operations
2. Memoize functions with useCallback when they're used in dependency arrays
3. Implement debounce mechanisms for state changes that affect the UI
4. Use strict dependency arrays in useEffect hooks
5. Add comprehensive error handling for all API calls
6. Implement detailed logging for state transitions

By following these practices, we can ensure that the onboarding flow remains stable and provides a smooth user experience.
