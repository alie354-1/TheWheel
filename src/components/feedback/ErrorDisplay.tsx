import React from 'react';
import { Link } from 'react-router-dom';

type ErrorDisplayProps = {
  title?: string;
  message: string;
  details?: string;
  actionText?: string;
  actionLink?: string;
  onRetry?: () => void;
  className?: string;
};

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'Error',
  message,
  details,
  actionText,
  actionLink,
  onRetry,
  className = '',
}) => {
  return (
    <div className={`bg-error/10 border border-error/20 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-3 w-full">
          <h3 className="text-sm font-medium text-error">{title}</h3>
          <div className="mt-2 text-sm text-error/90">
            <p>{message}</p>
            {details && (
              <div className="mt-2 p-2 bg-base-100/50 rounded text-xs overflow-auto max-h-32">
                <pre className="whitespace-pre-wrap">{details}</pre>
              </div>
            )}
          </div>
          {(actionText || onRetry) && (
            <div className="mt-4">
              {actionLink && actionText ? (
                <Link to={actionLink} className="btn btn-error btn-sm">
                  {actionText}
                </Link>
              ) : onRetry ? (
                <button
                  onClick={onRetry}
                  className="btn btn-error btn-sm"
                >
                  {actionText || 'Retry'}
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;