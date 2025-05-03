import React from 'react';
import { SimplePhaseProgress } from './SimplePhaseProgress';

interface PhaseWithProgress {
  id: string;
  name: string;
  description?: string;
  color?: string;
  completionPercentage: number;
}

export interface SimplePhaseProgressListProps {
  phases: PhaseWithProgress[];
  onPhaseClick?: (phaseId: string) => void;
  className?: string;
}

/**
 * SimplePhaseProgressList Component
 * 
 * Displays a list of phases with their progress information.
 * Extends SimplePhaseProgress to show multiple phases in a row.
 * 
 * Created as part of Sprint 3 implementation.
 */
export const SimplePhaseProgressList: React.FC<SimplePhaseProgressListProps> = ({
  phases,
  onPhaseClick,
  className = '',
}) => {
  // Count completed and total steps for each phase
  const getCompletedAndTotalForPhase = (percentage: number): { completedCount: number, totalCount: number } => {
    // We don't have the actual counts, so we'll generate reasonable ones based on percentage
    const totalCount = 5; // Assume 5 steps per phase
    const completedCount = Math.round((percentage / 100) * totalCount);
    
    return { completedCount, totalCount };
  };
  
  return (
    <div className={`phase-progress-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(phases.length, 4)} gap-4 ${className}`}>
      {phases.map(phase => {
        const { completedCount, totalCount } = getCompletedAndTotalForPhase(phase.completionPercentage);
        
        return (
          <SimplePhaseProgress
            key={phase.id}
            phase={{
              id: phase.id,
              name: phase.name,
              description: phase.description,
              completedCount,
              totalCount
            }}
            onClick={onPhaseClick ? () => onPhaseClick(phase.id) : undefined}
          />
        );
      })}
    </div>
  );
};

export default SimplePhaseProgressList;
