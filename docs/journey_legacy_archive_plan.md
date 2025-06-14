# Journey Legacy Archive Plan

## Overview

The Wheel is transitioning from the legacy journey tracking system (with completion percentages) to a new maturity-based tracking system that better reflects the philosophy that "the startup journey is never complete." 

This document outlines the plan to archive the legacy components in the `src/components/company/newjourney` folder after confirming that all necessary functionality has been migrated to the new `src/components/company/new_journey` folder.

## Current Status

- The `new_journey` folder contains the updated implementation with the maturity-based tracking system
- The `newjourney` folder contains legacy components, some of which have already been partially updated to use maturity levels instead of completion percentages
- Both systems currently coexist in the codebase

## Functionality Comparison

| Feature | Legacy (`newjourney`) | New (`new_journey`) | Status |
|---------|----------------------|---------------------|--------|
| Maturity Levels | Partially implemented (Exploring, Learning, Practicing, Refining) | Fully implemented (Exploring, Learning, Practicing, Refining, Teaching) | ✅ Complete |
| Engagement States | Partially implemented | Fully implemented (active_focus, maintaining, future_focus, dormant) | ✅ Complete |
| Progress Visualization | Text-based in YourProgress | Graphical representation with maturity level indicators | ✅ Complete |
| Journey Dashboard | Basic implementation | Enhanced with time investment metrics | ✅ Complete |
| Step Management | Basic implementation | Enhanced with better filtering | ✅ Complete |

## Archiving Process

1. **Pre-Archive Review**
   - Confirm all necessary functionality has been migrated
   - Test the new system thoroughly
   - Ensure no critical features are missing

2. **Service Migration**
   - Redirect any service calls from legacy components to new services
   - Update any imports in other parts of the application

3. **Router Updates**
   - Update the main router to use new journey components instead of legacy ones

4. **Archiving Steps**
   - Create a backup branch with the full codebase
   - Move the `newjourney` folder to `src/components/company/archived/newjourney`
   - Update any import paths that may still reference the old location
   - Add documentation in the archived folder explaining its status

5. **Cleanup**
   - Remove any unused service methods that only supported the legacy components
   - Clean up any unused types or interfaces

## Files to Be Archived

### Pages
- `src/components/company/newjourney/pages/JourneyDashboard.tsx`
- `src/components/company/newjourney/pages/StepDetail.tsx`
- `src/components/company/newjourney/pages/BrowseStepsPage.tsx`
- `src/components/company/newjourney/pages/NewJourneyDashboard.tsx`
- `src/components/company/newjourney/pages/JourneyHomePage.tsx`
- `src/components/company/newjourney/pages/JourneyHomePage.updated.tsx`
- `src/components/company/newjourney/pages/JourneyHomePageEnhanced.tsx`
- `src/components/company/newjourney/pages/EnhancedJourneyHomePage.tsx`
- `src/components/company/newjourney/pages/JourneyMapPage.tsx`

### Components
- All components in `src/components/company/newjourney/components/`
- All legacy components prefixed with "Legacy" in `src/components/company/newjourney/`

### Other
- `src/components/company/newjourney/JourneyRouter.tsx`
- All items in `src/components/company/newjourney/data/`
- All items in `src/components/company/newjourney/services/`
- All items in `src/components/company/newjourney/types/`

## Timeline

1. **Week 1**: Complete final review and testing of new system
2. **Week 2**: Redirect services and update router
3. **Week 3**: Archive legacy code and perform cleanup
4. **Week 4**: Testing and verification after archiving

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Missing functionality | Thorough testing before archiving |
| Import path issues | Comprehensive search for all import references |
| Runtime errors | Deploy changes in a staging environment first |
| User experience disruption | Release with appropriate user notifications |

## Conclusion

The archiving of legacy journey components represents the final step in the transition to the new maturity-based tracking system. The new system better reflects our philosophy that "the startup journey is never complete" by focusing on maturity levels and engagement states rather than completion percentages.
