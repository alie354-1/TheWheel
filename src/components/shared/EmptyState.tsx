/**
 * Empty State Component
 * 
 * A reusable component for displaying empty state messages with optional actions.
 */

import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center',
        className
      )}
    >
      <div className="flex flex-col items-center justify-center">
        {icon && (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
        {(action || secondaryAction) && (
          <div className="mt-6 flex space-x-3">
            {action && (
              <Button onClick={action.onClick}>
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                variant="outline"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}