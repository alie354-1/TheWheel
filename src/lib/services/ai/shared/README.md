# Shared AI Components

This directory contains shared components for AI-related functionality. The goal is to reduce code duplication and ensure consistency in the AI-related code.

## Components

- `BaseAIContextProvider.tsx`: A base component for AI context providers

## BaseAIContextProvider

A base component for AI context providers. This component provides the common functionality for AI context providers, including:

- Creating a context for AI operations
- Providing methods for generating responses, suggestions, and analyzing text
- Handling loading and error states
- Providing a hook for consuming the context

## Usage

To create a new AI context provider, you can use the `BaseAIContextProvider` component:

```tsx
import { BaseAIContextProvider, createAIContext, createUseAIContext } from './shared/BaseAIContextProvider';

// Create a context
const MyAIContext = createAIContext();

// Create a provider component
export function MyAIContextProvider({ children }) {
  const service = {
    generateResponse: async (prompt) => {
      // Implement your AI service here
      return 'Response';
    },
    generateSuggestions: async (prompt) => {
      // Implement your AI service here
      return ['Suggestion 1', 'Suggestion 2'];
    },
    analyzeText: async (text) => {
      // Implement your AI service here
      return 'Analysis';
    }
  };

  return (
    <BaseAIContextProvider service={service} contextName="MyAIContext">
      {children}
    </BaseAIContextProvider>
  );
}

// Create a hook to use the context
export const useMyAIContext = createUseAIContext(MyAIContext);
```

Then, you can use the provider and hook in your components:

```tsx
import { MyAIContextProvider, useMyAIContext } from './MyAIContextProvider';

function MyComponent() {
  const { generateResponse, isLoading, error } = useMyAIContext();

  const handleClick = async () => {
    const response = await generateResponse('Hello, AI!');
    console.log(response);
  };

  return (
    <div>
      <button onClick={handleClick}>Generate Response</button>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}

function App() {
  return (
    <MyAIContextProvider>
      <MyComponent />
    </MyAIContextProvider>
  );
}
```
