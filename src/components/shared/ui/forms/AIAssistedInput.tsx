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
