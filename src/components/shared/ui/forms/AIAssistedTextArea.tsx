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
