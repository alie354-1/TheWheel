import React from 'react';

/**
 * Props for the BaseIdeaCard component
 */
export interface BaseIdeaCardProps {
  /** Idea title */
  title: string;
  /** Idea description */
  description: string;
  /** Idea status */
  status?: 'draft' | 'published' | 'archived';
  /** Idea tags */
  tags?: string[];
  /** Idea actions */
  actions?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Children to render inside the card */
  children?: React.ReactNode;
}

/**
 * Base component for idea cards
 * This component provides the common functionality for idea cards
 */
export function BaseIdeaCard({
  title,
  description,
  status = 'draft',
  tags = [],
  actions,
  className = '',
  children
}: BaseIdeaCardProps) {
  return (
    <div className={`bg-white shadow rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex items-center">
          <span className={`px-2 py-1 text-xs rounded-full ${
            status === 'published' ? 'bg-green-100 text-green-800' :
            status === 'archived' ? 'bg-gray-100 text-gray-800' :
            'bg-blue-100 text-blue-800'
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
