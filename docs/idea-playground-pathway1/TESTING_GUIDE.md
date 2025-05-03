# Idea Playground Pathway 1: Testing Guide

This document outlines the testing strategy and procedures for the Idea Playground Pathway 1 feature, including unit tests, integration tests, and end-to-end tests.

## Testing Strategy

The testing strategy for the Idea Playground Pathway 1 feature follows a comprehensive approach:

1. **Unit Testing**: Testing individual components and functions in isolation
2. **Integration Testing**: Testing the interaction between components
3. **End-to-End Testing**: Testing the complete user flow
4. **Automated Testing**: Scripts for automated testing of key functionality
5. **Manual Testing**: Test cases for human testers to validate UI and UX

## Test Environments

- **Development**: Local development environment for unit and initial integration tests
- **Staging**: Pre-production environment for full integration and end-to-end tests
- **Production**: Final validation after deployment

## Unit Tests

### Service Layer Tests

| Test ID | Description | Expected Outcome |
|---------|-------------|------------------|
| UT-SRV-001 | Test `generateIdeaVariations` with valid parameters | Return array of variations |
| UT-SRV-002 | Test `generateIdeaVariations` with invalid idea ID | Return empty array |
| UT-SRV-003 | Test `updateVariationSelection` with valid ID | Return true |
| UT-SRV-004 | Test `updateVariationSelection` with invalid ID | Return false |
| UT-SRV-005 | Test `mergeSelectedVariations` with valid parameters | Return array of merged ideas |
| UT-SRV-006 | Test `mergeSelectedVariations` with insufficient variations | Return empty array |
| UT-SRV-007 | Test `getMergedIdeasForCanvas` with valid canvas ID | Return array of merged ideas |
| UT-SRV-008 | Test `getMergedIdeasForCanvas` with invalid canvas ID | Return empty array |

### Component Tests

| Test ID | Description | Expected Outcome |
|---------|-------------|------------------|
| UT-CMP-001 | Test `IdeaVariationCard` renders correctly | Component renders without errors |
| UT-CMP-002 | Test `IdeaVariationCard` selection feature | Selection callback triggered |
| UT-CMP-003 | Test `IdeaVariationList` renders correctly | Component renders without errors |
| UT-CMP-004 | Test `IdeaVariationList` with empty array | Empty state message displayed |
| UT-CMP-005 | Test `IdeaMergePanel` renders correctly | Component renders without errors |
| UT-CMP-006 | Test `IdeaMergePanel` with selected variations | Merge button enabled |
| UT-CMP-007 | Test `PathwayNavigation` renders correctly | Component renders without errors |
| UT-CMP-008 | Test `PathwayNavigation` step control | Step change callback triggered |

## Integration Tests

| Test ID | Description | Expected Outcome |
|---------|-------------|------------------|
| IT-001 | Generate variations and verify database entries | Variations stored correctly |
| IT-002 | Select variations and verify selection state | Selection state persisted |
| IT-003 | Merge variations and verify merged ideas | Merged ideas stored correctly |
| IT-004 | Verify relationships between variations and merged ideas | Relationships maintained correctly |
| IT-005 | Test interaction between IdeaPlaygroundWorkspace and variation components | Components interact correctly |
| IT-006 | Test AI integration for variation generation | AI returns valid variation data |
| IT-007 | Test AI integration for idea merging | AI returns valid merged idea data |

## End-to-End Tests

| Test ID | Description | Steps | Expected Outcome |
|---------|-------------|-------|------------------|
| E2E-001 | Complete Pathway 1 flow | 1. Create initial idea<br>2. Generate variations<br>3. Select variations<br>4. Merge variations<br>5. Select final idea | Complete flow works without errors |
| E2E-002 | Single variation selection | 1. Create initial idea<br>2. Generate variations<br>3. Select one variation<br>4. Continue with selection | Variation selected and flow continues |
| E2E-003 | Multiple variation merge | 1. Create initial idea<br>2. Generate variations<br>3. Select multiple variations<br>4. Merge selected<br>5. Select merged idea | Merged idea created and selected |
| E2E-004 | Regenerate variations | 1. Create initial idea<br>2. Generate variations<br>3. Regenerate variations | New variations generated |
| E2E-005 | Navigation between steps | 1. Navigate through all steps<br>2. Go back to previous steps<br>3. Skip to final step | Navigation works correctly |

## Automated Test Script

An automated test script is provided at `scripts/test-idea-playground-pathway1.js` to verify the core functionality of the Idea Playground Pathway 1 feature. This script performs the following tests:

1. Verify database tables exist
2. Create a test canvas
3. Generate a test idea
4. Generate variations for the test idea
5. Select variations
6. Merge selected variations
7. Retrieve merged ideas
8. Verify relationships between variations and merged ideas
9. Clean up test data

To run the automated test script:

```bash
node scripts/test-idea-playground-pathway1.js
```

## Manual Testing Checklist

### Variation Generation

- [ ] UI shows loading state during generation
- [ ] Variations display all required information
- [ ] Each variation is visibly distinct
- [ ] SWOT analysis is properly formatted and visible
- [ ] UI is responsive on different screen sizes

### Variation Selection

- [ ] Clicking on a variation toggles selection state
- [ ] Selected variations are visually highlighted
- [ ] Selection persists when navigating between steps
- [ ] Multiple variations can be selected
- [ ] Continue button is enabled only when at least one variation is selected

### Idea Merging

- [ ] Merged ideas showcase elements from source variations
- [ ] Relationships to source variations are visible
- [ ] Merged ideas have complete SWOT analysis
- [ ] UI adjusts appropriately when different numbers of variations are selected
- [ ] Error states are handled gracefully

### Navigation

- [ ] Step indicator shows current position in workflow
- [ ] Navigation between steps works correctly
- [ ] Previous steps remain accessible
- [ ] UI provides clear direction on how to proceed

## Performance Testing

| Test ID | Description | Target Metric |
|---------|-------------|---------------|
| PERF-001 | Variation generation time | < 15 seconds |
| PERF-002 | Variation merging time | < 15 seconds |
| PERF-003 | UI responsiveness during AI operations | No UI freezing |
| PERF-004 | Loading time for variations list | < 2 seconds |
| PERF-005 | Database query performance | < 500ms |

## Accessibility Testing

| Test ID | Description | Success Criteria |
|---------|-------------|------------------|
| ACC-001 | Keyboard navigation | All interactive elements accessible |
| ACC-002 | Screen reader compatibility | All content properly announced |
| ACC-003 | Color contrast | WCAG AA compliance |
| ACC-004 | Text sizing | UI works with increased text size |
| ACC-005 | Focus management | Focus states visible and logical |

## Security Testing

| Test ID | Description | Success Criteria |
|---------|-------------|------------------|
| SEC-001 | Access control | Users can only access their own data |
| SEC-002 | Input validation | System rejects malicious inputs |
| SEC-003 | API request validation | All requests properly validated |
| SEC-004 | SQL injection protection | Database queries parameterized |
| SEC-005 | Rate limiting | API endpoints protected from abuse |

## Known Issues and Workarounds

| Issue ID | Description | Workaround |
|----------|-------------|------------|
| ISSUE-001 | AI occasionally generates similar variations | Regenerate variations or adjust the input parameters |
| ISSUE-002 | JSON parsing errors can occur with complex responses | Fallback text extraction mechanism in place |
| ISSUE-003 | Selection state may reset on page refresh | Re-select variations after page refresh |

## Test Data

A set of test data is available for testing purposes:

- Test user: Available in environment variables
- Test idea templates: Stored in the database
- Mock AI responses: Available for offline testing

## Conclusion

Following this testing guide will ensure comprehensive validation of the Idea Playground Pathway 1 feature. All aspects of the feature should be tested, including functionality, usability, performance, accessibility, and security.
