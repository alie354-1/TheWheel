import React from 'react';

/**
 * Props for the BaseSuggestionCard component
 */
export interface BaseSuggestionCardProps {
  /** Suggestion title */
  title: string;
  /** Suggestion description */
  description: string;
  /** Suggestion status */
  status?: 'pending' | 'accepted' | 'rejected';
  /** Suggestion tags */
  tags?: string[];
  /** Suggestion actions */
  actions?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Children to render inside the card */
  children?: React.ReactNode;
}

/**
 * Base component for suggestion cards
 * This component provides the common functionality for suggestion cards
 */
export function BaseSuggestionCard({
  title,
  description,
  status = 'pending',
  tags = [],
  actions,
  className = '',
  children
}: BaseSuggestionCardProps) {
  return (
    <div className={`bg-white shadow rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex items-center">
          <span className={`px-2 py-1 text-xs rounded-full ${
            status === 'accepted' ? 'bg-green-100 text-green-800' :
            status === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {status}
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
      {children}
      {actions && (
        <div className="mt-4 flex justify-end">
          {actions}
        </div>
      )}
    </div>
  );
}
