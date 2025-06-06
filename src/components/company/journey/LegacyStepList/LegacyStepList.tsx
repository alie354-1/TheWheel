import React, { useState, useMemo } from 'react';
import { EnhancedJourneyStep } from '../../../../lib/types/journey-steps.types';
import { StepCard } from '../StepCard';

interface StepListProps {
  steps: EnhancedJourneyStep[];
  showPhase?: boolean;
  compact?: boolean;
  emptyMessage?: string;
  onStepClick?: (step: EnhancedJourneyStep) => void;
  onStartClick?: (step: EnhancedJourneyStep) => void;
  onCustomizeClick?: (step: EnhancedJourneyStep) => void;
  onMarkIrrelevantClick?: (step: EnhancedJourneyStep) => void;
  filter?: {
    searchTerm?: string;
    phaseId?: string;
    status?: string[];
    difficultyRange?: [number, number];
  };
}

/**
 * StepList Component
 * 
 * Displays a list of journey steps with filtering capabilities.
 * Uses StepCard components to render each step.
 */
const StepList: React.FC<StepListProps> = ({
  steps,
  showPhase = false,
  compact = false,
  emptyMessage = "No steps found",
  onStepClick,
  onStartClick,
  onCustomizeClick,
  onMarkIrrelevantClick,
  filter = {}
}) => {
  // State for local filtering (if needed)
  const [localFilter, setLocalFilter] = useState(filter);
  
  // Apply filters to steps
  const filteredSteps = useMemo(() => {
    let result = [...steps];
    
    // Apply search filter if provided
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      result = result.filter(step => 
        step.name.toLowerCase().includes(searchLower) || 
        (step.description && step.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply phase filter if provided
    if (filter.phaseId) {
      result = result.filter(step => step.phase_id === filter.phaseId);
    }
    
    // Apply status filter if provided
    if (filter.status && Array.isArray(filter.status) && filter.status.length > 0) {
      const statusFilter = filter.status; // Create a local reference that TypeScript can verify
      result = result.filter(step => 
        step.status && statusFilter.includes(step.status)
      );
    }
    
    // Apply difficulty range filter if provided
    if (filter.difficultyRange) {
      const [min, max] = filter.difficultyRange;
      result = result.filter(step => 
        step.difficulty_level >= min && step.difficulty_level <= max
      );
    }
    
    return result;
  }, [steps, filter]);
  
  // If no steps found, show empty message
  if (filteredSteps.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {filteredSteps.map(step => (
        <StepCard
          key={step.id}
          step={step}
          status={step.status}
          // Pass phase info if we should show it
          phase={showPhase ? {
            name: step.phase_name || '',
            color: step.phase_color
          } : undefined}
          compact={compact}
          showPhase={showPhase}
          onClick={onStepClick ? () => onStepClick(step) : undefined}
          onStartClick={onStartClick ? () => onStartClick(step) : undefined}
          onCustomizeClick={onCustomizeClick ? () => onCustomizeClick(step) : undefined}
          onMarkIrrelevantClick={onMarkIrrelevantClick ? () => onMarkIrrelevantClick(step) : undefined}
        />
      ))}
    </div>
  );
};

export default StepList;
