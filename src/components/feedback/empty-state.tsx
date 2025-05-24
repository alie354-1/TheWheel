/**
 * Empty State Component
 * 
 * A component for displaying a message when there is no data to show.
 */

import React from 'react';
import { Button } from '../ui/button';

export interface EmptyStateProps {
  /** The title to display */
  title: string;
  /** The message to display */
  description?: string;
  /** The icon to display */
  icon?: React.ReactNode;
  /** The action button text */
  actionText?: string;
  /** The action button callback */
  onAction?: () => void;
  /** Whether to show a border around the empty state */
  bordered?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
  bordered = false,
  className = '',
}) => {
  // Default icon if none provided
  const defaultIcon = (
    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
      />
    </svg>
  );

  // Base classes
  const baseClasses = [
    'text-center py-10 px-6',
    bordered ? 'border-2 border-dashed border-gray-300 rounded-lg' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={baseClasses}>
      <div className="flex flex-col items-center">
        <div className="flex justify-center items-center h-16 w-16 rounded-full bg-gray-100">
          {icon || defaultIcon}
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-gray-500">{description}</p>
        )}
        {actionText && onAction && (
          <div className="mt-6">
            <Button
              variant="primary"
              size="md"
              onClick={onAction}
            >
              {actionText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};