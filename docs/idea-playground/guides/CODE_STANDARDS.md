# Code Standards

This document outlines the coding standards and practices for the Idea Playground rebuild project. Adhering to these standards ensures code consistency, maintainability, and quality across the codebase.

## TypeScript Configuration

### Strict Type Checking

We use TypeScript with strict mode enabled to catch type-related issues at compile time:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "target": "es2020"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build", "dist", "**/*.spec.ts"]
}
```

## Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Files | kebab-case for files, PascalCase for React components | `canvas-service.ts`, `IdeaCard.tsx` |
| Interfaces | PascalCase with "I" prefix for TypeScript interfaces | `ICanvasService`, `IIdeaRepository` |
| Types | PascalCase | `CanvasCreationParams`, `IdeaUpdateParams` |
| Classes | PascalCase | `Canvas`, `IdeaService` |
| Methods/Functions | camelCase | `createCanvas()`, `generateIdea()` |
| Variables | camelCase | `canvasId`, `currentUser` |
| Constants | UPPER_SNAKE_CASE | `MAX_CANVAS_COUNT`, `DEFAULT_TIMEOUT` |
| Components | PascalCase | `CanvasSelector`, `IdeaList` |
| Props | camelCase | `onSubmit`, `isLoading` |
| Enums | PascalCase with singular name | `Permission`, `ComponentType` |
| Private class members | camelCase with underscore prefix | `_id`, `_name` |

## Directory Structure

```
src/
  ├── components/                  # React components
  │   ├── canvas/                  # Canvas-related components
  │   ├── idea/                    # Idea-related components
  │   ├── variation/               # Variation-related components
  │   ├── merge/                   # Merge-related components
  │   ├── shared/                  # Shared/common components
  │   └── ui/                      # UI primitives
  │
  ├── domain/                      # Domain model
  │   ├── entities/                # Domain entities
  │   ├── value-objects/           # Value objects
  │   ├── events/                  # Domain events
  │   └── services/                # Domain services
  │
  ├── application/                 # Application services
  │   ├── commands/                # Command handlers
  │   ├── queries/                 # Query handlers
  │   └── services/                # Application services
  │
  ├── infrastructure/              # Infrastructure implementation
  │   ├── repositories/            # Repository implementations
  │   ├── ai/                      # AI service implementation
  │   ├── persistence/             # Database access
  │   └── api/                     # API client
  │
  ├── hooks/                       # Custom React hooks
  │   ├── domain/                  # Domain-specific hooks
  │   ├── ui/                      # UI-related hooks
  │   └── api/                     # API-related hooks
  │
  ├── pages/                       # Page components
  │   ├── canvas/                  # Canvas-related pages
  │   ├── idea/                    # Idea-related pages
  │   ├── variation/               # Variation-related pages
  │   └── merge/                   # Merge-related pages
  │
  ├── store/                       # Global state management
  │   ├── slices/                  # State slices 
  │   ├── selectors/               # State selectors
  │   └── middleware/              # Store middleware
  │
  ├── utils/                       # Utility functions
  │   ├── formatting/              # Formatting utilities
  │   ├── validation/              # Validation utilities
  │   └── error-handling/          # Error handling utilities
  │
  └── types/                       # TypeScript types and interfaces
      ├── domain/                  # Domain-related types
      ├── api/                     # API-related types
      └── ui/                      # UI-related types
```

## Code Organization

### Component Structure

React components should follow this structure:

```typescript
// Imports (grouped and ordered)
import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
// Internal imports (alphabetical order)
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
// Types
import type { Idea } from '../../types/domain/idea.types';

// Props type definition
interface IdeaCardProps {
  idea: Idea;
  onClick: () => void;
  isSelected?: boolean;
}

// Component
export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  onClick,
  isSelected = false
}) => {
  // State hooks
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Other hooks
  const { data, isLoading } = useQuery(['idea-details', idea.id], () => 
    fetchIdeaDetails(idea.id)
  );
  
  // Effects
  useEffect(() => {
    if (isSelected) {
      setIsExpanded(true);
    }
  }, [isSelected]);
  
  // Event handlers
  const handleClick = () => {
    onClick();
  };
  
  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(prev => !prev);
  };
  
  // Render methods
  const renderDetails = () => {
    if (!isExpanded) return null;
    
    return (
      <div className="idea-card__details">
        <p className="idea-card__problem">{idea.problemStatement}</p>
        <p className="idea-card__audience">{idea.targetAudience}</p>
      </div>
    );
  };
  
  // Component render
  return (
    <Card 
      className={`idea-card ${isSelected ? 'idea-card--selected' : ''}`}
      onClick={handleClick}
    >
      <div className="idea-card__header">
        <h3 className="idea-card__title">{idea.title}</h3>
        <Button 
          variant="icon"
          onClick={handleToggleExpand}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
          icon={isExpanded ? 'chevron-up' : 'chevron-down'}
        />
      </div>
      
      <p className="idea-card__description">{idea.description}</p>
      
      {renderDetails()}
    </Card>
  );
};
```

### Service Structure

Services should follow this structure:

```typescript
// Imports
import { injectable, inject } from 'inversify';
import { TYPES } from '../types';
// Types
import type { Idea } from '../types/domain/idea.types';
import type { IIdeaRepository } from '../domain/repositories/idea-repository.interface';
import type { IAIService } from '../infrastructure/ai/ai-service.interface';
import type { IEventPublisher } from '../infrastructure/events/event-publisher.interface';

// Service interface
export interface IIdeaService {
  createIdea(params: IdeaCreationParams, canvasId: string, userId: string): Promise<Idea>;
  getIdea(ideaId: string, userId: string): Promise<Idea>;
  updateIdea(ideaId: string, params: IdeaUpdateParams, userId: string): Promise<Idea>;
  deleteIdea(ideaId: string, userId: string): Promise<void>;
  listIdeas(canvasId: string, userId: string): Promise<Idea[]>;
  generateIdea(params: IdeaGenerationParams, canvasId: string, userId: string): Promise<Idea>;
}

// Service implementation
@injectable()
export class IdeaService implements IIdeaService {
  constructor(
    @inject(TYPES.IdeaRepository) private ideaRepository: IIdeaRepository,
    @inject(TYPES.CanvasRepository) private canvasRepository: ICanvasRepository,
    @inject(TYPES.AIService) private aiService: IAIService,
    @inject(TYPES.EventPublisher) private eventPublisher: IEventPublisher
  ) {}

  // Method implementations
  async createIdea(params: IdeaCreationParams, canvasId: string, userId: string): Promise<Idea> {
    // Method implementation here
  }
  
  // Additional methods...
}
```

### Domain Entity Structure

Domain entities should follow this structure:

```typescript
import { AggregateRoot } from '../core/aggregate-root';
import { DomainError } from '../errors/domain-error';
import { IdeaCreatedEvent } from '../events/idea-created.event';
import { Component } from '../value-objects/component';

export class Idea extends AggregateRoot {
  // Private properties
  private _id: string;
  private _canvasId: string;
  private _title: string;
  private _description: string;
  private _problemStatement: string;
  private _targetAudience: string;
  private _uniqueValue: string;
  private _components: Component[];
  
  // Constructor
  constructor(params: IdeaCreationParams, canvasId: string) {
    super();
    this._id = params.id || generateUUID();
    this._canvasId = canvasId;
    this._title = params.title;
    this._description = params.description;
    this._problemStatement = params.problemStatement;
    this._targetAudience = params.targetAudience;
    this._uniqueValue = params.uniqueValue;
    this._components = [];
    
    // Validate invariants
    this.validateTitle(this._title);
    
    // Register domain event
    this.registerDomainEvent(new IdeaCreatedEvent(this));
  }
  
  // Getters
  get id(): string { return this._id; }
  get canvasId(): string { return this._canvasId; }
  get title(): string { return this._title; }
  get description(): string { return this._description; }
  get problemStatement(): string { return this._problemStatement; }
  get targetAudience(): string { return this._targetAudience; }
  get uniqueValue(): string { return this._uniqueValue; }
  get components(): Component[] { return [...this._components]; }
  
  // Commands
  public update(details: IdeaUpdateParams): void {
    if (details.title) {
      this.validateTitle(details.title);
      this._title = details.title;
    }
    
    // Additional updates...
    
    this.registerDomainEvent(new IdeaUpdatedEvent(this));
  }
  
  // Private methods
  private validateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new DomainError('Idea title cannot be empty');
    }
    
    if (title.length > 100) {
      throw new DomainError('Idea title cannot exceed 100 characters');
    }
  }
}
```

## Coding Conventions

### General Guidelines

- Use TypeScript for all new code
- Use ESLint and Prettier for code quality and formatting
- Follow SOLID principles
- Write single-responsibility functions and classes
- Use dependency injection
- Prefer immutability
- Use early returns to reduce nesting
- Avoid side effects in pure functions

### Error Handling

```typescript
// Error class hierarchy
export abstract class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class DomainError extends AppError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(entityName: string, id: string) {
    super(`${entityName} with ID ${id} not found`);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

// Error handling in services
async getIdea(ideaId: string, userId: string): Promise<Idea> {
  // Check if idea exists
  const idea = await this.ideaRepository.findById(ideaId);
  if (!idea) {
    throw new NotFoundError('Idea', ideaId);
  }
  
  // Check if user has access
  const canvas = await this.canvasRepository.findById(idea.canvasId);
  if (!canvas) {
    throw new DomainError('Canvas not found for idea');
  }
  
  if (!canvas.canUserAccess(userId)) {
    throw new AuthorizationError('User does not have permission to access this idea');
  }
  
  return idea;
}
```

### Async Code

Use async/await for asynchronous operations:

```typescript
// Good
async function loadIdeas(canvasId: string): Promise<Idea[]> {
  try {
    const ideas = await ideaService.listIdeas(canvasId);
    return ideas;
  } catch (error) {
    logger.error('Failed to load ideas', error);
    throw error;
  }
}

// Avoid
function loadIdeas(canvasId: string): Promise<Idea[]> {
  return ideaService.listIdeas(canvasId)
    .then(ideas => {
      return ideas;
    })
    .catch(error => {
      logger.error('Failed to load ideas', error);
      throw error;
    });
}
```

### React Patterns

#### Functional Components

Use functional components with hooks:

```typescript
// Good
const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="idea-card" onClick={onClick}>
      <h3>{idea.title}</h3>
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Collapse' : 'Expand'}
      </button>
      
      {isExpanded && (
        <div className="idea-card__details">
          <p>{idea.description}</p>
        </div>
      )}
    </div>
  );
};

// Avoid
class IdeaCard extends React.Component<IdeaCardProps, IdeaCardState> {
  constructor(props: IdeaCardProps) {
    super(props);
    this.state = {
      isExpanded: false
    };
  }
  
  toggleExpanded = () => {
    this.setState(prevState => ({
      isExpanded: !prevState.isExpanded
    }));
  };
  
  render() {
    const { idea, onClick } = this.props;
    const { isExpanded } = this.state;
    
    return (
      <div className="idea-card" onClick={onClick}>
        <h3>{idea.title}</h3>
        <button onClick={this.toggleExpanded}>
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
        
        {isExpanded && (
          <div className="idea-card__details">
            <p>{idea.description}</p>
          </div>
        )}
      </div>
    );
  }
}
```

#### Custom Hooks

Extract reusable logic into custom hooks:

```typescript
// Custom hook for idea operations
function useIdeaOperations(canvasId: string) {
  const queryClient = useQueryClient();
  
  // Get ideas query
  const ideasQuery = useQuery(
    ['ideas', canvasId],
    () => ideaService.listIdeas(canvasId),
    { enabled: !!canvasId }
  );
  
  // Create idea mutation
  const createIdeaMutation = useMutation(
    (params: IdeaCreationParams) => ideaService.createIdea(params, canvasId),
    {
      onSuccess: (newIdea) => {
        queryClient.setQueryData<Idea[]>(['ideas', canvasId], (oldData) => {
          return oldData ? [...oldData, newIdea] : [newIdea];
        });
      }
    }
  );
  
  // Delete idea mutation
  const deleteIdeaMutation = useMutation(
    (ideaId: string) => ideaService.deleteIdea(ideaId),
    {
      onSuccess: (_, ideaId) => {
        queryClient.setQueryData<Idea[]>(['ideas', canvasId], (oldData) => {
          return oldData ? oldData.filter(idea => idea.id !== ideaId) : [];
        });
      }
    }
  );
  
  return {
    ideas: ideasQuery.data || [],
    isLoading: ideasQuery.isLoading,
    error: ideasQuery.error,
    createIdea: createIdeaMutation.mutate,
    isCreating: createIdeaMutation.isLoading,
    deleteIdea: deleteIdeaMutation.mutate,
    isDeleting: deleteIdeaMutation.isLoading,
    refetch: ideasQuery.refetch
  };
}
```

## Documentation

### Code Documentation

Use JSDoc for documenting code:

```typescript
/**
 * Generates business idea variations based on a parent idea.
 * 
 * @param ideaId - The ID of the parent idea
 * @param count - The number of variations to generate (default: 3)
 * @param userId - The ID of the user making the request
 * @returns A list of generated variations
 * @throws {NotFoundError} If the parent idea doesn't exist
 * @throws {AuthorizationError} If the user doesn't have access to the parent idea
 */
async generateVariations(
  ideaId: string, 
  count: number = 3, 
  userId: string
): Promise<Variation[]> {
  // Implementation...
}
```

### Interface Documentation

Document interfaces with JSDoc:

```typescript
/**
 * Repository interface for Canvas entity operations.
 */
export interface ICanvasRepository {
  /**
   * Saves a canvas to the repository.
   * 
   * @param canvas - The canvas to save
   */
  save(canvas: Canvas): Promise<void>;
  
  /**
   * Finds a canvas by its ID.
   * 
   * @param id - The canvas ID
   * @returns The canvas if found, null otherwise
   */
  findById(id: string): Promise<Canvas | null>;
  
  /**
   * Finds all canvases owned by a user.
   * 
   * @param ownerId - The owner's user ID
   * @returns An array of canvases
   */
  findByOwner(ownerId: string): Promise<Canvas[]>;
  
  /**
   * Finds all canvases shared with a user.
   * 
   * @param userId - The user ID
   * @returns An array of canvases
   */
  findShared(userId: string): Promise<Canvas[]>;
  
  /**
   * Deletes a canvas from the repository.
   * 
   * @param id - The canvas ID
   */
  delete(id: string): Promise<void>;
}
```

## Performance Guidelines

1. **Memoization**: Use `useMemo` and `useCallback` for expensive computations and callbacks
2. **Virtualization**: Use virtualized lists for large datasets
3. **Lazy Loading**: Lazy load components and data
4. **Code Splitting**: Split code into smaller chunks
5. **Debounce/Throttle**: Limit the frequency of expensive operations

## Linting and Formatting

We use ESLint with a custom configuration:

```json
// .eslintrc.json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier"
  ],
  "plugins": [
    "@typescript-eslint",
    "react",
    "react-hooks",
    "jsx-a11y",
    "prettier"
  ],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-alert": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "prettier/prettier": "error"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

We use Prettier for code formatting:

```json
// .prettierrc
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "arrowParens": "avoid"
}
```

## Git Workflow

### Branch Naming

- `feature/description`: New features
- `fix/description`: Bug fixes
- `refactor/description`: Code refactoring
- `docs/description`: Documentation updates
- `test/description`: Test additions or modifications
- `chore/description`: Routine tasks, maintenance, etc.

### Commit Messages

Follow the conventional commit format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or modifications
- `chore`: Routine tasks, maintenance, etc.

Example:
```
feat(canvas): add canvas sharing functionality

This commit adds the ability for users to share canvases with team members.
- Added collaboration service
- Implemented invite functionality
- Added permission system

Closes #123
```

## Security Guidelines

1. **Input Validation**: Validate all user input
2. **Authentication**: Use JWT for authentication
3. **Authorization**: Implement proper access control
4. **Data Protection**: Encrypt sensitive data
5. **CSRF Protection**: Implement CSRF tokens
6. **Content Security Policy**: Define CSP headers
7. **Error Handling**: Don't expose sensitive information in error messages

## Accessibility Guidelines

1. Use semantic HTML elements
2. Provide alternative text for images
3. Ensure sufficient color contrast
4. Support keyboard navigation
5. Add ARIA attributes where necessary
6. Test with screen readers

## Testing Guidelines

See the [Testing Strategy](./TESTING_STRATEGY.md) document for detailed testing guidelines.

## Continuous Integration

Our CI pipeline runs these checks on every PR:

1. Linting
2. Type checking
3. Unit tests
4. Integration tests
5. Build verification
6. Bundle size analysis

## Development Environment Setup

See the [Contributing Guide](./CONTRIBUTING.md) for detailed instructions on setting up the development environment.
