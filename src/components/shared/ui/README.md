# Shared UI Components

This directory contains shared UI components that can be used across the application. The goal is to reduce code duplication and ensure consistency in the UI.

## Directory Structure

```
/ui
  /forms     - Form-related components
```

## Forms Components

The forms components are located at:

```
/ui/forms/
```

This directory contains the following components:

- `BaseAIAssistedInput.tsx`: A base component for AI-assisted inputs
- `AIAssistedInput.tsx`: A wrapper component for AI-assisted inputs
- `AIAssistedTextArea.tsx`: A component for AI-assisted textareas

### BaseAIAssistedInput

A base component for AI-assisted inputs. This component provides the common functionality for AI-assisted inputs, including:

- Displaying an input field with a button to generate suggestions
- Displaying a list of suggestions
- Handling loading and error states

### AIAssistedInput

A wrapper component for AI-assisted inputs. This component uses the BaseAIAssistedInput component for common functionality and adds integration with the AI context.

### AIAssistedTextArea

A component for AI-assisted textareas. This component provides functionality for AI-assisted textareas, including:

- Displaying a textarea with a button to generate AI assistance
- Providing options to complete or improve the text
- Handling loading and error states

## Usage

To use the AI-assisted input components, you need to provide an AI context hook:

```tsx
import { AIAssistedInput } from './shared/ui/forms/AIAssistedInput';
import { useMyAIContext } from './MyAIContextProvider';

function MyComponent() {
  const [value, setValue] = useState('');

  return (
    <AIAssistedInput
      value={value}
      onChange={setValue}
      useAIContext={useMyAIContext}
      label="My Input"
      placeholder="Type here..."
    />
  );
}
```

To use the AI-assisted textarea component:

```tsx
import { AIAssistedTextArea } from './shared/ui/forms/AIAssistedTextArea';
import { useMyAIContext } from './MyAIContextProvider';

function MyComponent() {
  const [value, setValue] = useState('');

  return (
    <AIAssistedTextArea
      value={value}
      onChange={setValue}
      useAIContext={useMyAIContext}
      label="My Textarea"
      placeholder="Type here..."
    />
  );
}
```
