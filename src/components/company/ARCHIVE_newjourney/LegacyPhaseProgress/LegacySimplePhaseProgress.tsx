import React from 'react';

interface PhaseData {
  id: string;
  name: string;
  description?: string;
  completedCount: number;
  totalCount: number;
}

export interface SimplePhaseProgressProps {
  phase: PhaseData;
  onClick?: () => void;
  className?: string;
}

/**
 * SimplePhaseProgress Component
 * 
 * A simplified version of PhaseProgress that shows a single phase's progress
 * with completion metrics and allows navigation to the phase details.
 * 
 * Created in Sprint 2 to use the unified journey system.
 */
export const SimplePhaseProgress: React.FC<SimplePhaseProgressProps> = ({
  phase,
  onClick,
  className = '',
}) => {
  // Calculate progress percentage
  const percentage = phase.totalCount > 0 
    ? Math.round((phase.completedCount / phase.totalCount) * 100) 
    : 0;
  
  return (
    <div 
      className={`p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium text-gray-900">{phase.name}</h3>
          {phase.description && (
            <p className="text-sm text-gray-500 mt-1">{phase.description}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-600">
            {phase.completedCount} / {phase.totalCount}
          </div>
          <div className="text-xs text-gray-500">
            steps completed
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full bg-primary transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="mt-1 text-xs font-medium text-right text-primary">
          {percentage}% complete
        </div>
      </div>
    </div>
  );
};

export default SimplePhaseProgress;
