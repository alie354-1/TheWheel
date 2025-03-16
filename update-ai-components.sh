#!/bin/bash

# This script updates the AI-related components to use the new shared components.
# It creates backup files of the original components before making any changes.

# Set the base directory
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BASE_DIR"

# Create backup directory if it doesn't exist
mkdir -p ./backup

# Backup original files
echo "Creating backups of original files..."
cp ./src/lib/services/ai/ai-context-provider.tsx ./backup/ai-context-provider.tsx.bak
cp ./src/components/ui/forms/AIAssistedInput.tsx ./backup/AIAssistedInput.tsx.bak
cp ./src/components/ui/forms/AIAssistedTextArea.tsx ./backup/AIAssistedTextArea.tsx.bak

# Create BaseAIContextProvider.tsx
echo "Creating BaseAIContextProvider.tsx..."
mkdir -p ./src/lib/services/ai/shared
cat > ./src/lib/services/ai/shared/BaseAIContextProvider.tsx << 'EOL'
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/**
 * Props for the BaseAIContextProvider component
 */
export interface BaseAIContextProviderProps {
  /** Children to render inside the provider */
  children: ReactNode;
  /** Service to use for AI operations */
  service: AIService;
  /** Context name for debugging */
  contextName?: string;
}

/**
 * Interface for AI service
 */
export interface AIService {
  /** Generate a response based on the prompt */
  generateResponse: (prompt: string) => Promise<string>;
  /** Generate suggestions based on the prompt */
  generateSuggestions?: (prompt: string) => Promise<string[]>;
  /** Analyze text and provide feedback */
  analyzeText?: (text: string) => Promise<string>;
}

/**
 * Context for AI operations
 */
export interface BaseAIContext {
  /** Generate a response based on the prompt */
  generateResponse: (prompt: string) => Promise<string>;
  /** Generate suggestions based on the prompt */
  generateSuggestions: (prompt: string) => Promise<string[]>;
  /** Analyze text and provide feedback */
  analyzeText: (text: string) => Promise<string>;
  /** Whether the AI is currently loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Clear the error message */
  clearError: () => void;
}

/**
 * Create a context for AI operations
 */
export function createAIContext() {
  return createContext<BaseAIContext | null>(null);
}

/**
 * Base component for AI context providers
 * This component provides the common functionality for AI context providers
 */
export function BaseAIContextProvider({
  children,
  service,
  contextName = 'BaseAIContext'
}: BaseAIContextProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const generateResponse = useCallback(
    async (prompt: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await service.generateResponse(prompt);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Error generating response: ${errorMessage}`);
        return '';
      } finally {
        setIsLoading(false);
      }
    },
    [service]
  );

  const generateSuggestions = useCallback(
    async (prompt: string) => {
      setIsLoading(true);
      setError(null);
      try {
        if (service.generateSuggestions) {
          const suggestions = await service.generateSuggestions(prompt);
          return suggestions;
        }
        // Fallback to generating a single response and splitting it
        const response = await service.generateResponse(prompt);
        return response.split('\n').filter(Boolean);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Error generating suggestions: ${errorMessage}`);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [service]
  );

  const analyzeText = useCallback(
    async (text: string) => {
      setIsLoading(true);
      setError(null);
      try {
        if (service.analyzeText) {
          const analysis = await service.analyzeText(text);
          return analysis;
        }
        // Fallback to generating a response with a prompt
        const response = await service.generateResponse(`Analyze the following text:\n${text}`);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Error analyzing text: ${errorMessage}`);
        return '';
      } finally {
        setIsLoading(false);
      }
    },
    [service]
  );

  // Create the context value
  const contextValue: BaseAIContext = {
    generateResponse,
    generateSuggestions,
    analyzeText,
    isLoading,
    error,
    clearError
  };

  // Create a dynamic context
  const Context = createAIContext();

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

/**
 * Create a hook to use the AI context
 */
export function createUseAIContext(Context: React.Context<BaseAIContext | null>) {
  return function useAIContext() {
    const context = useContext(Context);
    if (!context) {
      throw new Error('useAIContext must be used within an AIContextProvider');
    }
    return context;
  };
}
EOL

# Create README.md for AI shared components
echo "Creating README.md for AI shared components..."
cat > ./src/lib/services/ai/shared/README.md << 'EOL'
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
EOL

# Create BaseAIAssistedInput.tsx
echo "Creating BaseAIAssistedInput.tsx..."
mkdir -p ./src/components/shared/ui/forms
cat > ./src/components/shared/ui/forms/BaseAIAssistedInput.tsx << 'EOL'
import React, { useState, useCallback, InputHTMLAttributes } from 'react';

/**
 * Props for the BaseAIAssistedInput component
 */
export interface BaseAIAssistedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Value of the input */
  value: string;
  /** Callback when the value changes */
  onChange: (value: string) => void;
  /** Callback to generate AI suggestions */
  onGenerateSuggestions: (prompt: string) => Promise<string[]>;
  /** Placeholder text */
  placeholder?: string;
  /** Label for the input */
  label?: string;
  /** Whether the AI is currently loading */
  isLoading?: boolean;
  /** Error message if any */
  error?: string | null;
  /** Additional CSS classes */
  className?: string;
  /** Button text for generating suggestions */
  buttonText?: string;
}

/**
 * Base component for AI-assisted inputs
 * This component provides the common functionality for AI-assisted inputs
 */
export function BaseAIAssistedInput({
  value,
  onChange,
  onGenerateSuggestions,
  placeholder = 'Type here...',
  label,
  isLoading = false,
  error = null,
  className = '',
  buttonText = 'Get Suggestions',
  ...props
}: BaseAIAssistedInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleGenerateSuggestions = useCallback(async () => {
    try {
      const newSuggestions = await onGenerateSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Error generating suggestions:', err);
    }
  }, [value, onGenerateSuggestions]);

  const handleSelectSuggestion = useCallback(
    (suggestion: string) => {
      onChange(suggestion);
      setShowSuggestions(false);
    },
    [onChange]
  );

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <div className="flex">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            error ? 'border-red-300' : ''
          }`}
          {...props}
        />
        <button
          type="button"
          onClick={handleGenerateSuggestions}
          disabled={isLoading}
          className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : buttonText}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto">
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
EOL

# Create AIAssistedInput.tsx
echo "Creating AIAssistedInput.tsx..."
cat > ./src/components/shared/ui/forms/AIAssistedInput.tsx << 'EOL'
import React, { useCallback } from 'react';
import { BaseAIAssistedInput, BaseAIAssistedInputProps } from './BaseAIAssistedInput';

/**
 * Props for the AIAssistedInput component
 */
export interface AIAssistedInputProps extends Omit<BaseAIAssistedInputProps, 'onGenerateSuggestions' | 'isLoading' | 'error'> {
  /** Context hook to use for AI operations */
  useAIContext: () => {
    generateSuggestions: (prompt: string) => Promise<string[]>;
    isLoading: boolean;
    error: string | null;
  };
  /** Prompt template to use for generating suggestions */
  promptTemplate?: string;
}

/**
 * A component for AI-assisted inputs
 * This component uses the BaseAIAssistedInput component for common functionality
 */
export function AIAssistedInput({
  value,
  onChange,
  useAIContext,
  promptTemplate = 'Suggest some options for: {input}',
  ...props
}: AIAssistedInputProps) {
  const { generateSuggestions, isLoading, error } = useAIContext();

  const handleGenerateSuggestions = useCallback(
    async (input: string) => {
      const prompt = promptTemplate.replace('{input}', input);
      return generateSuggestions(prompt);
    },
    [generateSuggestions, promptTemplate]
  );

  return (
    <BaseAIAssistedInput
      value={value}
      onChange={onChange}
      onGenerateSuggestions={handleGenerateSuggestions}
      isLoading={isLoading}
      error={error}
      {...props}
    />
  );
}
EOL

# Create AIAssistedTextArea.tsx
echo "Creating AIAssistedTextArea.tsx..."
cat > ./src/components/shared/ui/forms/AIAssistedTextArea.tsx << 'EOL'
import React, { useState, useCallback, TextareaHTMLAttributes } from 'react';

/**
 * Props for the AIAssistedTextArea component
 */
export interface AIAssistedTextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  /** Value of the textarea */
  value: string;
  /** Callback when the value changes */
  onChange: (value: string) => void;
  /** Context hook to use for AI operations */
  useAIContext: () => {
    generateResponse: (prompt: string) => Promise<string>;
    isLoading: boolean;
    error: string | null;
  };
  /** Prompt template to use for generating responses */
  promptTemplate?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Label for the textarea */
  label?: string;
  /** Additional CSS classes */
  className?: string;
  /** Button text for generating responses */
  buttonText?: string;
  /** Button text for completing the text */
  completeButtonText?: string;
  /** Button text for improving the text */
  improveButtonText?: string;
}

/**
 * A component for AI-assisted textareas
 */
export function AIAssistedTextArea({
  value,
  onChange,
  useAIContext,
  promptTemplate = 'Complete the following text:\n{input}',
  placeholder = 'Type here...',
  label,
  className = '',
  buttonText = 'AI Assist',
  completeButtonText = 'Complete',
  improveButtonText = 'Improve',
  ...props
}: AIAssistedTextAreaProps) {
  const { generateResponse, isLoading, error } = useAIContext();
  const [showOptions, setShowOptions] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleComplete = useCallback(async () => {
    try {
      const prompt = promptTemplate.replace('{input}', value);
      const response = await generateResponse(prompt);
      onChange(value + response);
      setShowOptions(false);
    } catch (err) {
      console.error('Error completing text:', err);
    }
  }, [value, onChange, generateResponse, promptTemplate]);

  const handleImprove = useCallback(async () => {
    try {
      const prompt = `Improve the following text:\n${value}`;
      const response = await generateResponse(prompt);
      onChange(response);
      setShowOptions(false);
    } catch (err) {
      console.error('Error improving text:', err);
    }
  }, [value, onChange, generateResponse]);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <div>
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            error ? 'border-red-300' : ''
          }`}
          {...props}
        />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : buttonText}
          </button>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {showOptions && (
        <div className="absolute z-10 mt-1 right-0 bg-white shadow-lg rounded-md border border-gray-300">
          <div className="p-2">
            <button
              type="button"
              onClick={handleComplete}
              disabled={isLoading}
              className="w-full mb-2 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {completeButtonText}
            </button>
            <button
              type="button"
              onClick={handleImprove}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {improveButtonText}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
EOL

# Create README.md for UI shared components
echo "Creating README.md for UI shared components..."
cat > ./src/components/shared/ui/README.md << 'EOL'
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
EOL

echo "AI component updates completed successfully!"
echo "Original files have been backed up to ./backup/"
echo ""
echo "To revert changes, run:"
echo "cp ./backup/ai-context-provider.tsx.bak ./src/lib/services/ai/ai-context-provider.tsx"
echo "cp ./backup/AIAssistedInput.tsx.bak ./src/components/ui/forms/AIAssistedInput.tsx"
echo "cp ./backup/AIAssistedTextArea.tsx.bak ./src/components/ui/forms/AIAssistedTextArea.tsx"
