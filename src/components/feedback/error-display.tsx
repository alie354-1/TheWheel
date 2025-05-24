/**
 * Error Display Component
 * 
 * A component for displaying error messages with options to retry or report the error.
 */

import React from 'react';
import { Button } from '../ui/button';

export interface ErrorDisplayProps {
  /** The error title */
  title?: string;
  /** The error message */
  message: string;
  /** Whether to show technical details */
  showDetails?: boolean;
  /** The technical error details */
  details?: string;
  /** The retry button text */
  retryText?: string;
  /** The retry callback */
  onRetry?: () => void;
  /** The report error button text */
  reportText?: string;
  /** The report error callback */
  onReport?: () => void;
  /** Whether the error is fatal */
  fatal?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'An error occurred',
  message,
  showDetails = false,
  details,
  retryText = 'Try again',
  onRetry,
  reportText = 'Report issue',
  onReport,
  fatal = false,
  className = '',
}) => {
  const [isDetailsExpanded, setIsDetailsExpanded] = React.useState(false);

  const containerClasses = [
    'p-6 rounded-lg bg-red-50 border border-red-200',
    className
  ].join(' ');

  return (
    <div className={containerClasses} role="alert" aria-live="assertive">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="ml-3 w-full">
          <h3 className="text-lg font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
          
          {showDetails && details && (
            <div className="mt-4">
              <button
                type="button"
                className="text-sm text-red-700 font-medium underline"
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              >
                {isDetailsExpanded ? 'Hide technical details' : 'Show technical details'}
              </button>
              {isDetailsExpanded && (
                <div className="mt-2 p-3 bg-red-100 rounded overflow-auto max-h-48">
                  <pre className="text-xs text-red-800 font-mono whitespace-pre-wrap">
                    {details}
                  </pre>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-4 flex">
            {onRetry && !fatal && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
              >
                {retryText}
              </Button>
            )}
            {onReport && (
              <Button
                variant="outline"
                size="sm"
                className="ml-3"
                onClick={onReport}
              >
                {reportText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};