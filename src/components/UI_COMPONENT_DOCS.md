# UI Component Library Documentation

## Overview

This UI Component Library provides a set of reusable, accessible, and customizable components that follow consistent patterns and styling. The library is built with React, TypeScript, and TailwindCSS.

## Component Categories

### UI Components

Basic UI components that serve as building blocks for more complex components.

- `Button`: A versatile button component with support for different variants, sizes, and states.
- `Card`: A container component for displaying content in a contained box.
- `Input`: A text input component for collecting user input.
- `FormField`: A component for creating consistent form fields with labels and validation.

### Feedback Components

Components for providing feedback to users.

- `LoadingSpinner`: A loading indicator with customizable size and color.
- `Alert`: A component for displaying feedback messages, warnings, and errors.
- `EmptyState`: A component for displaying a message when there is no data to show.
- `ErrorDisplay`: A component for displaying error messages with retry options.

### Layout Components

Components for creating consistent layouts.

- `Container`: A component that provides consistent padding and max-width.
- `Stack`: A flex-based layout component that arranges children in a column or row.
- `Grid`: A CSS Grid-based layout component for creating responsive grid layouts.

## Usage Examples

### Button

```tsx
import { Button } from '@/components/ui';

// Primary button (default)
<Button>Click me</Button>

// Secondary button
<Button variant="secondary">Cancel</Button>

// Outline button
<Button variant="outline">Details</Button>

// Loading state
<Button isLoading>Submitting...</Button>

// With icons
<Button leftIcon={<Icon />}>With icon</Button>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>This is the card content.</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Form Field

```tsx
import { FormField, Input } from '@/components/ui';

<FormField 
  label="Email address" 
  id="email" 
  required 
  error={errors.email}
  helperText="We'll never share your email with anyone else."
>
  <Input 
    id="email" 
    type="email" 
    placeholder="Enter your email" 
    value={email} 
    onChange={handleEmailChange} 
    hasError={!!errors.email}
  />
</FormField>
```

### Loading Spinner

```tsx
import { LoadingSpinner } from '@/components/feedback';

// Default spinner
<LoadingSpinner />

// With text
<LoadingSpinner text="Loading..." />

// Different size and color
<LoadingSpinner size="lg" color="primary" />
```

### Layout Components

```tsx
import { Container, Stack, Grid } from '@/components/layout';

// Container
<Container maxWidth="lg" centered>
  Content with max width and centered
</Container>

// Stack
<Stack direction="row" spacing="md" align="center">
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>

// Grid
<Grid cols={1} mdCols={2} lgCols={3} gap="md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>
```

## Composition Patterns

Components can be composed together to create more complex UI patterns:

```tsx
import { Card, CardHeader, CardTitle, CardContent, Button, FormField, Input } from '@/components/ui';
import { LoadingSpinner } from '@/components/feedback';
import { Container, Stack } from '@/components/layout';

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <Container maxWidth="sm">
      <Card>
        <CardHeader>
          <CardTitle>Log in to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <Stack spacing="md">
            <FormField label="Email" id="email" required>
              <Input id="email" type="email" placeholder="Enter your email" />
            </FormField>
            <FormField label="Password" id="password" required>
              <Input id="password" type="password" placeholder="Enter your password" />
            </FormField>
            <Button fullWidth isLoading={isLoading}>
              {isLoading ? 'Logging in...' : 'Log in'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
```

## Accessibility

All components are built with accessibility in mind:

- Proper ARIA attributes
- Keyboard navigation support
- Color contrast compliance
- Screen reader friendly

## Customization

Components can be customized using the `className` prop, which accepts Tailwind CSS classes:

```tsx
<Button className="bg-purple-600 hover:bg-purple-700">
  Custom Button
</Button>
```

## Future Enhancements

1. Add more form components (Select, Checkbox, Radio, etc.)
2. Create data display components (Table, List, etc.)
3. Add navigation components (Tabs, Pagination, etc.)
4. Create disclosure components (Accordion, Disclosure, etc.)
5. Add overlay components (Modal, Drawer, etc.)