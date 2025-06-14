import React, { useMemo } from 'react';
import { JourneyPhase } from '../../../../lib/types/journey-steps.types';
import journeyStepsService from '../../../../lib/services/journeySteps.service';

export interface PhaseProgressProps {
  phases: JourneyPhase[];
  companyId: string;
  selectedPhaseId: string | null;
  onPhaseSelect: (phaseId: string) => void;
}

/**
 * PhaseProgress Component
 * 
 * Displays a visual representation of journey phases with progress indicators.
 * Allows users to select a phase for filtering.
 */
const PhaseProgress: React.FC<PhaseProgressProps> = ({
  phases,
  companyId,
  selectedPhaseId,
  onPhaseSelect
}) => {
  // Calculate progress for each phase
  const phaseProgress = useMemo(() => {
    if (!phases.length) return {};
    
    // Create an object to store progress for each phase
    const progress: Record<string, { percentage: number, steps: number, completed: number }> = {};
    
    // Initialize progress for each phase
    phases.forEach(phase => {
      progress[phase.id] = { percentage: 0, steps: 0, completed: 0 };
    });
    
    // Load progress asynchronously for each phase
    phases.forEach(async phase => {
      try {
        const percentage = await journeyStepsService.calculatePhaseProgress(companyId, phase.id);
        
        // Update the progress
        progress[phase.id] = { 
          percentage, 
          steps: 0, // We don't have the count yet, could be added later
          completed: 0 
        };
      } catch (err) {
        console.error(`Error calculating progress for phase ${phase.id}:`, err);
      }
    });
    
    return progress;
  }, [phases, companyId]);
  
  // If no phases, show loading or empty state
  if (!phases || phases.length === 0) {
    return <div className="p-4 bg-gray-50 rounded-md">No phases available</div>;
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Journey Phases</h2>
      
      {/* Phase tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {phases.map(phase => (
          <button
            key={phase.id}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${selectedPhaseId === phase.id 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            style={{
              backgroundColor: selectedPhaseId === phase.id 
                ? (phase.color || '#4A90E2') 
                : '#f3f4f6'
            }}
            onClick={() => onPhaseSelect(phase.id)}
          >
            {phase.name}
          </button>
        ))}
      </div>
      
      {/* Progress bars */}
      <div className="space-y-4">
        {phases.map(phase => {
          const progress = phaseProgress[phase.id]?.percentage || 0;
          
          return (
            <div key={phase.id} className="mb-2">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{phase.name}</span>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: phase.color || '#4A90E2'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PhaseProgress;
