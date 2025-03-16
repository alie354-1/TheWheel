import React from 'react';
import SharedSuggestionCard, { BaseSuggestion } from '../../shared/idea/SuggestionCard';

export interface Suggestion extends BaseSuggestion {}

interface SuggestionCardProps {
  suggestion: Suggestion;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onRegenerate?: () => void;
}

/**
 * Legacy SuggestionCard component that uses the new shared SuggestionCard component
 * This maintains backward compatibility with existing code
 */
const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  isSelected,
  onSelect,
  onEdit,
  onRegenerate
}) => {
  return (
    <SharedSuggestionCard
      suggestion={suggestion}
      isSelected={isSelected}
      onSelect={onSelect}
      onEdit={onEdit}
      onRegenerate={onRegenerate}
    />
  );
};

export default SuggestionCard;
export type { Suggestion };
