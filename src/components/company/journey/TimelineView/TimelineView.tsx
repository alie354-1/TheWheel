import React, { useCallback, useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { JourneyPhase, JourneyStep } from '../../../../lib/types/journey-unified.types';
import { StepCard } from '../StepCard';
import { StepStatus } from '../StepCard/StepCardProps';
import { Term } from '../../../terminology/Term';

interface TimelineViewProps {
  phases: JourneyPhase[];
  steps: JourneyStep[];
  companySteps: {
    step_id: string;
    status: StepStatus;
    [key: string]: any;
  }[]; // Improved typing
  selectedStepId?: string;
  onSelectStep: (stepId: string) => void;
  onUpdateStatus?: (stepId: string, status: string) => void;
  className?: string;
}

/**
 * TimelineView Component
 * 
 * A horizontal timeline visualization of the journey steps grouped by phases.
 * Allows for scrolling, step selection, and status updates.
 * 
 * Part of the Sprint 3 implementation of the Journey System Unified Redesign.
 */
export const TimelineView: React.FC<TimelineViewProps> = ({
  phases,
  steps,
  companySteps,
  selectedStepId,
  onSelectStep,
  onUpdateStatus,
  className = '',
}) => {
  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>(null);
  
  // Group steps by phase
  const stepsByPhase = useMemo(() => {
    return phases.map(phase => {
      const phaseSteps = steps.filter(step => step.phase_id === phase.id);
      return {
        phase,
        steps: phaseSteps,
      };
    });
  }, [phases, steps]);
  
  // Get step status from company step data
  const getStepStatus = useCallback((stepId: string): StepStatus => {
    const companyStep = companySteps.find(cs => cs.step_id === stepId);
    return companyStep?.status || 'not_started';
  }, [companySteps]);
  
  // Toggle phase expansion
  const togglePhase = (phaseId: string) => {
    setExpandedPhaseId(expandedPhaseId === phaseId ? null : phaseId);
  };
  
  return (
    <div className={`timeline-view ${className}`}>
      <div className="timeline-phases">
        {stepsByPhase.map(({ phase, steps }) => (
          <div 
            key={phase.id} 
            className={`timeline-phase ${expandedPhaseId === phase.id ? 'expanded' : ''}`}
            style={{ backgroundColor: `${phase.color}10` }} // Light version of phase color
          >
            <div 
              className="phase-header flex justify-between items-center p-4 cursor-pointer"
              onClick={() => togglePhase(phase.id)}
            >
              <h3 className="font-semibold text-lg">{phase.name}</h3>
              <button className="text-gray-500 hover:text-gray-700">
                {expandedPhaseId === phase.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            
            <div className={`phase-content ${expandedPhaseId === phase.id ? 'block' : 'hidden'} p-4`}>
              <div className="phase-description text-gray-600 mb-4">
                {phase.description || (
                  <span>
                    This phase contains {steps.length} <Term keyPath="journeyTerms.step.plural" fallback="steps" />.
                  </span>
                )}
              </div>
              
              <div className="steps-timeline overflow-x-auto">
                <div className="steps-container flex space-x-4 min-w-max pb-4">
                  {steps.map(step => {
                    const status = getStepStatus(step.id);
                    
                    return (
                      <StepCard
                        key={step.id}
                        step={step}
                        status={status}
                        selected={selectedStepId === step.id}
                        mode="compact"
                        onClick={() => onSelectStep(step.id)}
                        onStatusChange={onUpdateStatus && ((newStatus: StepStatus) => onUpdateStatus(step.id, newStatus))}
                      />
                    );
                  })}
                  
                  {steps.length === 0 && (
                    <div className="empty-state bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                      No <Term keyPath="journeyTerms.step.plural" fallback="steps" /> in this phase.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* For non-expanded phases, show a preview of steps */}
            {expandedPhaseId !== phase.id && steps.length > 0 && (
              <div className="phase-preview p-4 flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {steps.slice(0, 3).map(step => (
                    <div 
                      key={step.id}
                      className="step-dot h-6 w-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold"
                      style={{ 
                        backgroundColor: getStepStatus(step.id) === 'completed' 
                          ? '#10B981' 
                          : getStepStatus(step.id) === 'in_progress' 
                            ? '#3B82F6' 
                            : '#E5E7EB'
                      }}
                    >
                      {getStepStatus(step.id) === 'completed' ? '✓' : ''}
                    </div>
                  ))}
                  {steps.length > 3 && (
                    <div className="step-more h-6 w-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                      +{steps.length - 3}
                    </div>
                  )}
                </div>
                <div className="step-count text-sm text-gray-600">
                  {steps.filter(s => getStepStatus(s.id) === 'completed').length} of {steps.length} complete
                </div>
                <button 
                  className="ml-auto text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePhase(phase.id);
                  }}
                >
                  View <span className="ml-1"><ArrowRight size={14} /></span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineView;
