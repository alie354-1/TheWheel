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
