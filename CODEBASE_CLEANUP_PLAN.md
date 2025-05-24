# TheWheel Codebase Cleanup Plan

## 1. Service Layer Consolidation

### 1.1 Duplicate Idea Generation Services
- Merge `src/lib/services/idea-generation.service.ts` and `src/lib/services/idea-playground/idea-generation.service.ts`
- Create unified interface in `src/lib/services/idea/index.ts`
- Update all component references to use the consolidated service

### 1.2 Profile Service Redundancy
- Consolidate `MultiPersonaProfileService` and `ProfileService` 
- Implement multi-persona capabilities in single service
- Standardize interface and move to `src/lib/services/profile/index.ts`

### 1.3 Logging Services
- Choose between standard and enhanced logging implementation
- Standardize on `logging.service.enhanced.ts` approach
- Ensure consistent logging across all components

### 1.4 Analytics Services
- Merge `src/lib/services/analytics.service.ts` and `services/recommendation/analytics.service.ts`
- Create central analytics service with domain-specific collectors

## 2. Feature Cleanup and Completion

### 2.1 Business Operations Hub
- Decision: Complete MVP or remove entirely
- Complete `src/business-ops-hub/components/dashboard/ExecutiveSummaryPanel.tsx`
- Complete `src/business-ops-hub/components/dashboard/DomainOverviewGrid.tsx`
- Complete `src/business-ops-hub/components/dashboard/ToolRecommendationsPanel.tsx`
- Complete `src/business-ops-hub/components/ProblemBasedToolFinder.tsx`

### 2.2 Journey System Improvements
- Complete AI enrichment in `src/lib/services/companyJourney.service.ts`
- Implement actual AI answers in `src/lib/services/journeyBoard.service.ts`
- Complete tool submissions in `src/lib/services/toolSubmission.service.ts`

### 2.3 Placeholder Component Cleanup
- Finish or remove placeholder Tasks component in CompanyDashboard
- Finish or remove Financial Hub components
- Finish or remove Tools component placeholders
- Finish or remove Team component placeholders

### 2.4 External Integration Features
- Complete `src/lib/services/externalIntegration.service.ts`
- Complete `src/lib/services/externalTrainingIntegration.service.ts`
- Document API contracts for external services

### 2.5 Sprint-Tagged Features
- Decision for each Sprint 2/5 feature: implement, schedule, or remove
- Complete `lib/services/journeyAnalytics.service.ts` predictive functions
- Complete `lib/services/recommendation/content-improvement.service.ts` functions
- Complete `lib/services/learningProfile.service.ts` personalization

## 3. Architecture Improvements

### 3.1 Service Layer Organization
- Implement service registry pattern
- Create barrel exports for each service domain
- Clear interfaces for all services
- Dependency injection for service composition

### 3.2 State Management
- Standardize on single state management approach (Zustand)
- Refactor direct Supabase calls into service layer
- Implement proper state selectors and actions

### 3.3 Type System Improvements
- Eliminate usage of `any` type
- Create proper TypeScript interfaces for all data structures
- Enforce type-checking in CI pipeline

### 3.4 Feature Flag Management
- Create central feature flag management system
- Persist feature flags in database
- Admin UI for toggling features
- Feature flag documentation

## 4. Testing and Documentation

### 4.1 Testing Infrastructure
- Setup Jest tests for critical services
- Component tests for key UI elements
- API service mocks
- Integration tests for critical flows

### 4.2 Architecture Documentation
- Document service layer responsibilities
- Document component hierarchy
- Data flow diagrams
- Database schema documentation

### 4.3 Developer Guides
- How to add new services
- How to extend existing features
- Best practices for codebase
- Onboarding documentation

### 4.4 CI/CD Improvements
- Linting rules enforcement
- Type checking in CI
- Automated tests in CI
- Bundle size analysis

## 5. Implementation Priority

### High Priority
1. Service layer consolidation (eliminate duplicate code)
2. Feature inventory and triage
3. Remove/hide incomplete features
4. Type system improvements

### Medium Priority
1. Complete critical business features
2. Documentation improvements
3. Testing infrastructure
4. State management standardization

### Low Priority
1. Non-critical feature completion
2. Advanced analytics
3. External integrations
4. Developer experience improvements