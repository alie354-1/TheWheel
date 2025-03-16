# Shared Components

This directory contains shared components that are used across multiple parts of the application. These components are designed to be reusable, maintainable, and consistent.

## Directory Structure

```
shared/
├── idea/              # Idea-related components
│   ├── BaseIdeaCard.tsx
│   ├── IdeaCard.tsx
│   ├── BaseSuggestionCard.tsx
│   ├── SuggestionCard.tsx
│   └── ...
├── ui/                # UI components
│   ├── forms/
│   │   ├── BaseAIAssistedInput.tsx
│   │   ├── AIAssistedInput.tsx
│   │   ├── AIAssistedTextArea.tsx
│   │   └── ...
│   └── ...
└── README.md          # This file
```

## Component Design Principles

### 1. Base/Extended Pattern

Components follow a base/extended pattern:

- **Base Components**: Provide core functionality without business logic
  - Example: `BaseSuggestionCard.tsx` provides the UI structure and styling
  
- **Extended Components**: Add business logic and specific functionality
  - Example: `SuggestionCard.tsx` extends `BaseSuggestionCard` with specific actions

### 2. Consistent Props Interface

Components maintain a consistent props interface:

- Props are clearly documented with JSDoc comments
- Required props are marked as such
- Default values are provided where appropriate
- Props follow a consistent naming convention

### 3. Backward Compatibility

Components maintain backward compatibility:

- Both named and default exports are provided
- Wrapper components are available for legacy code
- Interface compatibility is maintained

## Usage Guidelines

### Importing Components

```tsx
// Named import (preferred)
import { SuggestionCard } from '../shared/idea/SuggestionCard';

// Default import (for backward compatibility)
import SuggestionCard from '../shared/idea/SuggestionCard';
```

### Using Base Components

Base components should be used when you need to customize the component's behavior:

```tsx
import { BaseSuggestionCard } from '../shared/idea/BaseSuggestionCard';

function CustomSuggestionCard(props) {
  // Custom logic here
  return (
    <BaseSuggestionCard
      {...props}
      actions={customActions}
    >
      {props.children}
    </BaseSuggestionCard>
  );
}
```

### Using Extended Components

Extended components should be used for standard use cases:

```tsx
import { SuggestionCard } from '../shared/idea/SuggestionCard';

function MyComponent() {
  return (
    <SuggestionCard
      title="My Suggestion"
      description="This is a suggestion"
      onAccept={() => console.log('Accepted')}
      onReject={() => console.log('Rejected')}
    />
  );
}
```

## Contributing

When adding new shared components:

1. Follow the base/extended pattern
2. Document props with JSDoc comments
3. Provide both named and default exports
4. Add tests for the component
5. Update this README if necessary
