#!/bin/bash

# This script updates the existing components to use the new shared components.
# It creates backup files of the original components before making any changes.

# Set the base directory
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BASE_DIR"

# Create backup directory if it doesn't exist
mkdir -p ./backup

# Backup original files
echo "Creating backups of original files..."
cp ./src/components/idea-playground/IdeaCard.tsx ./backup/IdeaCard.tsx.bak
cp ./src/components/idea-playground/IdeaList.tsx ./backup/IdeaList.tsx.bak
cp ./src/components/idea-playground/pathway1/SuggestionCard.tsx ./backup/SuggestionCard.tsx.bak
cp ./src/components/idea-playground/pathway1/SuggestionEditor.tsx ./backup/SuggestionEditor.tsx.bak
cp ./src/components/idea-playground/pathway1/SuggestionMerger.tsx ./backup/SuggestionMerger.tsx.bak

# Create BaseIdeaCard.tsx
echo "Creating BaseIdeaCard.tsx..."
cat > ./src/components/shared/idea/BaseIdeaCard.tsx << 'EOL'
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
EOL

# Create BaseSuggestionCard.tsx
echo "Creating BaseSuggestionCard.tsx..."
cat > ./src/components/shared/idea/BaseSuggestionCard.tsx << 'EOL'
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
EOL

# Create IdeaCard.tsx
echo "Creating IdeaCard.tsx..."
cat > ./src/components/shared/idea/IdeaCard.tsx << 'EOL'
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
EOL

# Create SuggestionCard.tsx
echo "Creating SuggestionCard.tsx..."
cat > ./src/components/shared/idea/SuggestionCard.tsx << 'EOL'
import React from 'react';
import { BaseSuggestionCard, BaseSuggestionCardProps } from './BaseSuggestionCard';

/**
 * Props for the SuggestionCard component
 */
export interface SuggestionCardProps extends Omit<BaseSuggestionCardProps, 'actions'> {
  /** Callback when the accept button is clicked */
  onAccept?: () => void;
  /** Callback when the reject button is clicked */
  onReject?: () => void;
  /** Callback when the edit button is clicked */
  onEdit?: () => void;
}

/**
 * A card component for displaying a suggestion
 * This component uses the BaseSuggestionCard component for common functionality
 */
export function SuggestionCard({
  title,
  description,
  status,
  tags,
  className,
  onAccept,
  onReject,
  onEdit,
  children
}: SuggestionCardProps) {
  // Create actions based on the callbacks
  const actions = (
    <>
      {onAccept && status !== 'accepted' && (
        <button
          type="button"
          onClick={onAccept}
          className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Accept
        </button>
      )}
      {onReject && status !== 'rejected' && (
        <button
          type="button"
          onClick={onReject}
          className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Reject
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
    </>
  );
  
  return (
    <BaseSuggestionCard
      title={title}
      description={description}
      status={status}
      tags={tags}
      className={className}
      actions={actions}
    >
      {children}
    </BaseSuggestionCard>
  );
}
EOL

echo "Component updates completed successfully!"
echo "Original files have been backed up to ./backup/"
echo ""
echo "To revert changes, run:"
echo "cp ./backup/IdeaCard.tsx.bak ./src/components/idea-playground/IdeaCard.tsx"
echo "cp ./backup/IdeaList.tsx.bak ./src/components/idea-playground/IdeaList.tsx"
echo "cp ./backup/SuggestionCard.tsx.bak ./src/components/idea-playground/pathway1/SuggestionCard.tsx"
echo "cp ./backup/SuggestionEditor.tsx.bak ./src/components/idea-playground/pathway1/SuggestionEditor.tsx"
echo "cp ./backup/SuggestionMerger.tsx.bak ./src/components/idea-playground/pathway1/SuggestionMerger.tsx"
