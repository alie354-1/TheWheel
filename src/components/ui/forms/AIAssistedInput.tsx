import React, { useState } from 'react';
import { useAI } from '../../../lib/services/ai/ai-context.provider';

interface AIAssistedInputProps {
  fieldType: 'title' | 'description' | 'problem' | 'solution' | 'audience' | 'value' | 'business_model';
  label: string;
  value: string;
  onChange: (value: string) => void;
  ideaContext?: Record<string, any>;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function AIAssistedInput({
  fieldType,
  label,
  value,
  onChange,
  ideaContext = {},
  placeholder = '',
  className = '',
  required = false
}: AIAssistedInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use the AI context
  const { isUsingRealAI, aiService } = useAI();
  
  const requestSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock implementation - in a real implementation, this would call the AI service
      const mockSuggestions = getMockSuggestions(fieldType, value);
      setSuggestions(mockSuggestions);
    } catch (err) {
      console.error('Error getting AI suggestions:', err);
      setError('Failed to get suggestions. Please try again.');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const applySuggestion = (suggestion: string) => {
    onChange(suggestion);
    setSuggestions([]);
  };
  
  const clearSuggestions = () => {
    setSuggestions([]);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    clearSuggestions();
  };
  
  // Mock function to generate suggestions based on field type
  const getMockSuggestions = (fieldType: string, currentValue: string): string[] => {
    switch (fieldType) {
      case 'title':
        return [
          'Innovative SaaS Platform for Remote Teams',
          'AI-Powered Productivity Solution',
          'Next-Generation Collaboration Tool'
        ];
      case 'description':
        return [
          'A comprehensive solution that addresses the challenges of remote work through intelligent automation and team coordination features.',
          'An AI-driven platform that helps teams stay productive and connected, regardless of their physical location.',
          'A revolutionary tool that transforms how distributed teams collaborate, communicate, and achieve their goals.'
        ];
      case 'problem':
        return [
          'Remote teams struggle with coordination and communication, leading to decreased productivity and engagement.',
          'Distributed workforces face challenges in maintaining alignment and visibility across projects and priorities.',
          'Organizations lack effective tools to manage and optimize remote work environments at scale.'
        ];
      case 'solution':
        return [
          'Our platform provides real-time collaboration features, automated workflow management, and AI-powered insights to keep teams connected and productive.',
          'We offer a comprehensive suite of tools designed specifically for remote teams, including virtual workspaces, smart scheduling, and progress tracking.',
          'Our solution combines communication, project management, and team analytics in one integrated platform tailored for distributed teams.'
        ];
      default:
        return [
          'Enhanced suggestion 1 for ' + fieldType,
          'Enhanced suggestion 2 for ' + fieldType,
          'Enhanced suggestion 3 for ' + fieldType
        ];
    }
  };
  
  return (
    <div className={`${className}`}>
      <div className="flex justify-between">
        <label htmlFor={`input-${fieldType}`} className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {isUsingRealAI && (
          <button
            type="button"
            onClick={requestSuggestions}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Thinking...
              </>
            ) : (
              <>
                <svg className="-ml-1 mr-2 h-4 w-4 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Suggest
              </>
            )}
          </button>
        )}
      </div>
      
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
          type="text"
          id={`input-${fieldType}`}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          required={required}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {suggestions.length > 0 && (
        <div className="mt-2 space-y-2">
          <p className="text-xs text-gray-500">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => applySuggestion(suggestion)}
                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
