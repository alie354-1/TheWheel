import React from 'react';
import { BaseIdeaCard, BaseIdeaCardProps } from './BaseIdeaCard';

/**
 * Props for the IdeaCard component
 */
export interface IdeaCardProps extends Omit<BaseIdeaCardProps, 'actions'> {
  /** Callback when the edit button is clicked */
  onEdit?: () => void;
  /** Callback when the delete button is clicked */
  onDelete?: () => void;
  /** Callback when the view button is clicked */
  onView?: () => void;
}

/**
 * A card component for displaying an idea
 * This component uses the BaseIdeaCard component for common functionality
 */
export function IdeaCard({
  title,
  description,
  status,
  tags,
  className,
  onEdit,
  onDelete,
  onView,
  children
}: IdeaCardProps) {
  // Create actions based on the callbacks
  const actions = (
    <>
      {onView && (
        <button
          type="button"
          onClick={onView}
          className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          View
        </button>
      )}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Edit
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Delete
        </button>
      )}
    </>
  );
  
  return (
    <BaseIdeaCard
      title={title}
      description={description}
      status={status}
      tags={tags}
      className={className}
      actions={actions}
    >
      {children}
    </BaseIdeaCard>
  );
}
