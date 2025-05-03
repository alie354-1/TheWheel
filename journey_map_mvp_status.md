# Journey Map MVP Status Assessment

## Overview

This document assesses the current status of the Journey Map functionality against the MVP requirements outlined in the feature review. It identifies completed items, work in progress, and remaining tasks.

## Status Key

- [✓] Functionally Complete: Meets the MVP requirement; ready for integration testing/final QA.
- [+/-] Partially Built: Some relevant code exists, but it's incomplete or not functional.
- [~] Built - Needs Cleanup/Refactor: Functionality broadly exists but needs significant rework.
- [ ] Not Started: No significant work done on this specific feature.

## Backend Requirements

### Data Model (Phases, Steps, Guidance, Tools, Options, Action Flags)

**Status: [✓] Functionally Complete**

- Database schema for journey phases, steps, guidance, tools, options, and action flags is in place
- Relationships between entities are properly defined
- Action flags for conditional features (Ask Wheel, Ask Expert) are implemented

### Content Loading Mechanism

**Status: [+/-] Partially Built**

- Basic import script exists (`scripts/import-journey-excel.cjs`)
- Need to enhance with support for new fields like tool rankings
- Admin UI for content management is still in development

### Tool Database Model/Loading

**Status: [+/-] Partially Built**

- Database schema for tools is in place
- Tool ranking system has been implemented
- Need to complete the loading mechanism for tool data with rankings

## Frontend Requirements

### UI for Browsing Full Map

**Status: [+/-] Partially Built**

- Basic map view is implemented
- Need to integrate step completion status and focus area indicators
- Need to enhance navigation between steps/phases

### UI for Viewing Step Details

**Status: [✓] Functionally Complete**

- Step details view shows title, goal, guidance, and options
- UI displays structured options for approaching steps
- Navigation between steps is functional
- Content is properly organized before action choices
- User notes section for personal observations is implemented

### UI for User Notes

**Status: [✓] Functionally Complete**

- Notes section implemented in step details
- Save/load functionality using company_progress.notes field implemented
- Auto-save functionality implemented with 2-second delay

### UI for Step Feedback Input

**Status: [✓] Functionally Complete**

- Feedback form with rating and comments is implemented
- Submission confirmation is displayed
- Backend storage for feedback is in place
- Note: This is for platform improvement feedback, not user notes

### UI Displaying Action Choices (Conditional)

**Status: [+/-] Partially Built**

- Basic action choices UI is implemented
- Conditional display based on step flags is working
- Need to complete integration with the tool recommendation system

## Action Choice: "Use a Tool"

### Personalized Tool Recommendation Logic

**Status: [✓] Functionally Complete**

- Backend logic for personalized recommendations is implemented
- Company profile data is used for personalization
- Default ranking fallback is in place

### Display Recommended Tools

**Status: [✓] Functionally Complete**

- Top 3 recommended tools are displayed
- Option to view all tools is available
- Tool cards show name, description, and actions

### Custom Tool Input UI

**Status: [✓] Functionally Complete**

- Form for adding custom tools is implemented
- Fields for name, URL, and functionality are available
- Submission process is working

### Trigger Custom Tool Card Generation

**Status: [+/-] Partially Built**

- Backend structure for AI generation is in place
- Need to implement the actual AI service integration
- Placeholder simulation is currently used

### Card Generation Logic (Public Info Only)

**Status: [+/-] Partially Built**

- Structure for AI-generated descriptions is in place
- Need to implement the actual AI service that respects public info constraint
- Placeholder generation is currently used

### Present AI-Generated Card for Review

**Status: [✓] Functionally Complete**

- UI for reviewing AI-generated descriptions is implemented
- Clear indication that content is AI-generated
- Handling for generation failure is in place

### User Actions on Generated Card

**Status: [✓] Functionally Complete**

- Accept/Reject/Regenerate options are implemented
- Editing capability for AI-generated content is available
- Success/failure states are properly handled

### Store Accepted Custom Tool Data

**Status: [✓] Functionally Complete**

- Backend storage for custom tools is implemented
- Association with user/venture/step is working
- Retrieval of saved custom tools is functional

## Action Choice: "I'll Do This Myself"

**Status: [✓] Functionally Complete**

- UI button is implemented with proper styling and icon
- State tracking is implemented with 'diy' status in company_progress
- Button is conditionally displayed based on step status and diy_enabled flag
- Visual indication when the step is in 'diy' status

## Action Choice: "Ask an Expert"

**Status: [✓] Functionally Complete**

- Conditional display based on step flags is working
- Button is properly styled with appropriate icon
- Modal with "Coming Soon" message is implemented
- Button is hidden when not applicable based on step status and ask_expert_enabled flag

## Action Choice: "Ask The Wheel"

### UI for Submitting Request

**Status: [✓] Functionally Complete**

- Modal with form for submitting questions is implemented
- Success message is displayed after submission
- Placeholder implementation for MVP is in place
- Clearly labeled as a demo feature

### Capture & Route Request

**Status: [+/-] Partially Built**

- Placeholder implementation for MVP is in place
- Backend service for actual request capture and routing will be implemented in the next phase

## Step Completion

### UI for Manual Step Completion

**Status: [✓] Functionally Complete**

- Button for marking steps as complete is implemented
- Visual indication of completion status is in place
- Special handling for company formation step is working

## Main Journey Map View

### UI for Browsing Full Map with Status Indicators

**Status: [+/-] Partially Built**

- Basic map view is implemented
- **Missing**: Visual indicators for step completion status
- **Missing**: Visual indicators for focus areas
- **Missing**: Enhanced navigation between steps/phases

## Next Steps

1. **Enhance Main Journey Map View**
   - Add visual indicators for step completion status
   - Add visual indicators for focus areas
   - Improve navigation between steps/phases

4. **Complete Content Loading Mechanism**
   - Enhance import script to support new fields
   - Develop admin UI for content management

5. **Finish Tool Recommendation System**
   - Complete the AI integration for custom tool descriptions
   - Implement the tool ranking management interface

6. **Future Enhancements**
   - Implement actual backend service for "Ask The Wheel" request capture and routing

7. **Testing and QA**
   - Conduct integration testing for the entire journey flow
   - Perform user acceptance testing for the enhanced UI
