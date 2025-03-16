import React from 'react';
import { BaseSuggestionCard, BaseSuggestionCardProps } from './BaseSuggestionCard';

/**
 * Props for the SuggestionCard component
 */
export interface SuggestionCardProps extends Omit<BaseSuggestionCardProps, 'actions' | 'title' | 'description'> {
  /** Title of the suggestion (optional if suggestion prop is provided) */
  title?: string;
  /** Description of the suggestion (optional if suggestion prop is provided) */
  description?: string;
  /** Callback when the accept button is clicked */
  onAccept?: () => void;
  /** Callback when the reject button is clicked */
  onReject?: () => void;
  /** Callback when the edit button is clicked */
  onEdit?: () => void;
  /** The suggestion object (for backward compatibility) */
  suggestion?: BaseSuggestion;
  /** Whether the suggestion is selected (for backward compatibility) */
  isSelected?: boolean;
  /** Callback when the suggestion is selected (for backward compatibility) */
  onSelect?: () => void;
  /** Callback when the suggestion is regenerated (for backward compatibility) */
  onRegenerate?: () => void;
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
  children,
  suggestion,
  isSelected,
  onSelect,
  onRegenerate
}: SuggestionCardProps) {
  // If suggestion prop is provided, use its properties (for backward compatibility)
  const finalTitle = suggestion?.title || title || '';
  const finalDescription = suggestion?.description || description || '';
  const finalStatus = suggestion?.status || status;
  const finalTags = suggestion?.tags || tags;
  
  // Create actions based on the callbacks
  const actions = (
    <>
      {onAccept && finalStatus !== 'accepted' && (
        <button
          type="button"
          onClick={onAccept}
          className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Accept
        </button>
      )}
      {onReject && finalStatus !== 'rejected' && (
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
      {onRegenerate && (
        <button
          type="button"
          onClick={onRegenerate}
          className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Regenerate
        </button>
      )}
      {onSelect && (
        <button
          type="button"
          onClick={onSelect}
          className={`ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${
            isSelected
              ? 'text-white bg-indigo-600 hover:bg-indigo-700'
              : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
          {isSelected ? 'Selected' : 'Select'}
        </button>
      )}
    </>
  );
  
  return (
    <BaseSuggestionCard
      title={finalTitle}
      description={finalDescription}
      status={finalStatus}
      tags={finalTags}
      className={className}
      actions={actions}
    >
      {children}
    </BaseSuggestionCard>
  );
}

// Add default export for backward compatibility
export default SuggestionCard;

// Define BaseSuggestion type for use in other components
export interface BaseSuggestion {
  id?: string;
  title: string;
  description: string;
  status?: 'pending' | 'accepted' | 'rejected';
  tags?: string[];
  // Additional fields for backward compatibility
  problem_statement?: string | string[];
  solution_concept?: string | string[];
  target_audience?: string | string[];
  unique_value?: string | string[];
  business_model?: string | string[];
  marketing_strategy?: string | string[];
  revenue_model?: string | string[];
  go_to_market?: string | string[];
  market_size?: string | string[];
  competition?: string | string[];
  revenue_streams?: string | string[];
  cost_structure?: string | string[];
  key_metrics?: string | string[];
  [key: string]: any; // Allow any additional properties
}
