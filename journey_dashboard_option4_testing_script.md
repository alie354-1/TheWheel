# Journey Dashboard Option 4 Testing Script

This script provides a step-by-step procedure to manually test all clickable elements and functionality in the new Journey Dashboard (Option 4) with tabbed layout.

## Prerequisites

1. Open journey_dashboard_option4.html in a modern web browser
2. Have browser console open to check for any JavaScript errors
3. Have browser responsive design tools available for testing different screen sizes

## Test Procedure

### Header & Navigation

1. **Logo and Navigation Links**:
   - [ ] Click TheWheel logo - should behave as a home link
   - [ ] Click "Dashboard" link - should highlight as active
   - [ ] Click "Browse Steps" link - should navigate to browse page
   - [ ] Click "Community" link - should navigate to community page
   - [ ] Click "Resources" link - should navigate to resources page

2. **User Controls**:
   - [ ] Click bell notification icon - should open notifications panel
   - [ ] Click settings icon - should open settings panel
   - [ ] Click user avatar - should open user menu

### Left Sidebar - Steps Panel

1. **Stats Filtering**:
   - [ ] Click "Total" stat filter - should highlight with ring and show toast
   - [ ] Click "Active" stat filter - should highlight with ring and show toast
   - [ ] Click "Done" stat filter - should highlight with ring and show toast 
   - [ ] Click "Urgent" stat filter - should highlight with ring and show toast

2. **Search & Filters**:
   - [ ] Type in search bar - should filter steps (in a real implementation)
   - [ ] Click "Filter Steps" button - should open filter modal

3. **Step Categories**:
   - [ ] Click quick view eye icon on urgent steps - should open quick view
   - [ ] Click quick view eye icon on in-progress steps - should open quick view
   - [ ] Expand "Completed" section by clicking on it - should show completed steps
   - [ ] Collapse "Completed" section by clicking again - should hide completed steps
   - [ ] Click quick view eye icon on completed steps - should open quick view

### Main Content Area - Tab System

1. **Tab Navigation**:
   - [ ] Verify "Current Work" tab is active by default
   - [ ] Click "Recommended Next Steps" tab - should switch to recommendations content
   - [ ] Click "Business Health" tab - should switch to business health content
   - [ ] Click "Current Work" tab - should switch back to current work content
   - [ ] Verify tab styling changes when tabs are switched (active tab should have blue underline)

### Current Work Tab Content

1. **Active Step Cards**:
   - [ ] Verify hover effect works on step cards (should lift slightly with shadow)
   - [ ] Click "Continue" button on "Run Customer Interviews" card - should navigate to step details
   - [ ] Click "Continue" button on "Define MVP Features" card - should navigate to step details

2. **Domain Progress Section**:
   - [ ] Verify domain progress cards display properly
   - [ ] Verify progress bars show correct percentages
   - [ ] Verify status indicators and colors are appropriate

3. **Peer Insights Section**:
   - [ ] Verify peer insight cards display properly
   - [ ] Verify hover effect works on peer insight cards
   - [ ] Click "Connect with more founders" link - should navigate to connection page
   - [ ] Click "View all" link - should navigate to all insights page

### Recommended Next Steps Tab Content

1. **Recommendation Cards**:
   - [ ] Verify all three recommendation cards display properly
   - [ ] Verify hover effect works on cards
   - [ ] Click "Start" button on "Create User Personas" card - should initiate the step
   - [ ] Click "Start" button on other recommendation cards - should initiate those steps

2. **Action Buttons**:
   - [ ] Click "Browse All Steps" button - should navigate to steps browser
   - [ ] Click "Add Custom Step" button - should open custom step creation form

### Business Health Tab Content

1. **Domain Cards**:
   - [ ] Verify all domain cards display properly with correct progress indicators
   - [ ] Click "View Domain Details" button on Product Development card - should navigate to details
   - [ ] Click "View Domain Details" button on Market Research card - should navigate to details
   - [ ] Click "View Domain Details" button on Funding Strategy card - should navigate to details

### Filter Modal Testing

1. **Modal Open/Close**:
   - [ ] Click "Filter Steps" button to open modal
   - [ ] Click X button - modal should close
   - [ ] Open modal again
   - [ ] Click outside modal - modal should close
   - [ ] Open modal again for further testing

2. **Filter Controls**:
   - [ ] Change "Show items" dropdown selection - should update display count
   - [ ] Click each status filter checkbox - should toggle selection
   - [ ] Click each domain filter checkbox - should toggle selection
   - [ ] Click "Reset" button - should clear all selections
   - [ ] Make some selections and click "Apply Filters" - modal should close and filters apply

### Responsive Design Testing

Test the layout at each of these viewport widths by using browser developer tools:

1. **Desktop (1920px)**:
   - [ ] Verify sidebar and main content display properly
   - [ ] Verify tab system works with proper spacing
   - [ ] Check two-column layout for active steps
   - [ ] Verify domain progress and peer insights sections maintain grid layout

2. **Laptop (1366px)**:
   - [ ] Verify all elements maintain proper spacing and alignment
   - [ ] Verify two-column layout maintains integrity

3. **Tablet (768px)**:
   - [ ] Verify sidebar collapses/hides
   - [ ] Verify main content expands to full width
   - [ ] Verify cards stack appropriately
   - [ ] Verify tab system remains functional

4. **Mobile (375px)**:
   - [ ] Verify all elements stack vertically
   - [ ] Verify text remains readable
   - [ ] Verify tab system remains functional with proper touch targets
   - [ ] Verify cards and sections have appropriate spacing

### JavaScript Functionality Testing

1. **Tab Switching**:
   - [ ] Verify tab switching works without errors
   - [ ] Check browser console for any errors during tab switching
   - [ ] Verify correct content displays for each tab

2. **Collapsible Sections**:
   - [ ] Verify completed steps section toggles properly
   - [ ] Verify arrow indicator rotates when toggled

3. **Filter Toast Notifications**:
   - [ ] Verify toast appears when stat filters are clicked
   - [ ] Verify toast content matches selected filter
   - [ ] Verify toast automatically dismisses after 3 seconds

4. **Console Errors**:
   - [ ] Check browser console for any JavaScript errors throughout testing
   - [ ] Address any errors found

## Final Verification

1. **Visual Inspection**:
   - [ ] Verify all colors and styling are consistent
   - [ ] Check typography hierarchy is clear and readable
   - [ ] Ensure all interactive elements have appropriate hover/active states

2. **Functionality Overview**:
   - [ ] Verify all clickable elements respond to user interaction
   - [ ] Ensure tab system works consistently
   - [ ] Confirm filter modal opens and closes properly
   - [ ] Verify all cards and sections display appropriate content

## Issues Log

| Issue Description | Severity | Affected Component | Reproduction Steps | Status |
|-------------------|----------|-------------------|-------------------|--------|
|                   |          |                   |                   |        |
|                   |          |                   |                   |        |

## Key Advantages of the Tabbed Layout

1. **Improved Information Organization**
   - Each functional area (current work, recommendations, business health) has its own dedicated space
   - Reduces cognitive load by showing only relevant information at a time
   - Follows common UI pattern users are already familiar with

2. **Better Mobile Experience**
   - Content stacks vertically in a logical flow
   - Tab system provides easy navigation on smaller screens
   - No need to scroll through unrelated content

3. **More Focused User Experience**
   - Directs user attention to one context at a time
   - Step cards provide clear visual hierarchy and separation
   - Important actions (Continue buttons) are prominently displayed

4. **Cleaner Visual Design**
   - More white space around elements improves readability
   - Card-based layout creates consistent visual pattern
   - Consistent color system for different status types

## Next Steps

After completing this test script:

1. Document any issues found in the Issues Log
2. Prioritize fixes based on severity
3. Create tickets for identified issues
4. Schedule retesting after fixes are implemented
5. Proceed with integration into the actual React application
