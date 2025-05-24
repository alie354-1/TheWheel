# Business Operations Hub Components

This directory contains React components for the Business Operations Hub dashboard, including all Sprint 2 features:

- **DomainCard**: Displays a business domain with progress, health, and priority tasks.
- **DraggableDomainCard**: Wraps DomainCard with drag-and-drop reordering support.
- **DomainEditModal**: Modal for editing domain details (name, color, icon).
- **DomainTaskPreview**: Shows up to 3 high-priority tasks for a domain, with quick status actions and drag-and-drop reordering.
- **OnboardingTipCard**: Dismissible onboarding tip for new users.
- **BusinessOpsSidebar**: Persistent sidebar navigation for domains and dashboard, responsive for mobile.
- **DomainRelationshipGraph**: Placeholder for domain relationship visualization (to be implemented with vis-network/d3).
- **NotificationCenter**: Lists domain-level notifications for the current user.

## Usage

Import and use these components in your dashboard pages. Most components are designed to be used with hooks from `src/business-ops-hub/hooks/` and types from `src/business-ops-hub/types/`.

## Accessibility

All interactive elements have ARIA labels and are keyboard accessible. Touch targets are at least 44x44px for mobile usability.

## Testing

Unit tests for services are in `src/business-ops-hub/services/`. Add component tests as needed using Jest and React Testing Library.
