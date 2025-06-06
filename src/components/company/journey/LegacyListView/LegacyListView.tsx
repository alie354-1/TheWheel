import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { JourneyPhase, JourneyStep } from '../../../../lib/types/journey-unified.types';
import { StepCard } from '../StepCard';
import { StepStatus } from '../StepCard/StepCardProps';
import { Term } from '../../../terminology/Term';

interface ListViewProps {
  phases: JourneyPhase[];
  steps: JourneyStep[];
  companySteps: {
    step_id: string;
    status: StepStatus;
    [key: string]: any;
  }[];
  selectedStepId?: string;
  onSelectStep: (stepId: string) => void;
  onUpdateStatus?: (stepId: string, status: string) => void;
  className?: string;
}

/**
 * ListView Component
 * 
 * A vertical list view of journey steps grouped by phases.
 * Provides a more detailed view with collapsible phase sections.
 * 
 * Part of the Sprint 3 implementation of the Journey System Unified Redesign.
 */
export const ListView: React.FC<ListViewProps> = ({
  phases,
  steps,
  companySteps,
  selectedStepId,
  onSelectStep,
  onUpdateStatus,
  className = '',
}) => {
  const [expandedPhases, setExpandedPhases] = React.useState<Set<string>>(new Set(phases[0]?.id ? [phases[0].id] : []));
  
  // Toggle phase expansion
  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phaseId)) {
        newSet.delete(phaseId);
      } else {
        newSet.add(phaseId);
      }
      return newSet;
    });
  };
  
  // Get step status from company step data
  const getStepStatus = (stepId: string): StepStatus => {
    const companyStep = companySteps.find(cs => cs.step_id === stepId);
    return companyStep?.status || 'not_started';
  };
  
  // Get stats for a phase
  const getPhaseStats = (phaseId: string) => {
    const phaseSteps = steps.filter(step => step.phase_id === phaseId);
    
    const completed = phaseSteps.filter(step => getStepStatus(step.id) === 'completed').length;
    const inProgress = phaseSteps.filter(step => getStepStatus(step.id) === 'in_progress').length;
    const total = phaseSteps.length;
    
    return { completed, inProgress, total };
  };
  
  return (
    <div className={`list-view space-y-4 ${className}`}>
      {phases.map(phase => {
        const isExpanded = expandedPhases.has(phase.id);
        const phaseSteps = steps.filter(step => step.phase_id === phase.id);
        const { completed, total } = getPhaseStats(phase.id);
        
        return (
          <div 
            key={phase.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
          >
            <div 
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => togglePhase(phase.id)}
              style={{ borderLeft: `4px solid ${phase.color || '#4F46E5'}` }}
            >
              <div>
                <h3 className="font-semibold text-gray-800">{phase.name}</h3>
                <div className="text-sm text-gray-600 mt-1">
                  {completed} of {total} <Term keyPath="journeyTerms.step.plural" fallback="steps" /> completed
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-gray-100 rounded-full px-3 py-1 text-sm mr-4">
                  {total} <Term keyPath="journeyTerms.step.plural" fallback="steps" />
                </div>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>
            
            {isExpanded && (
              <div className="p-4 pt-1">
                {phaseSteps.length > 0 ? (
                  <div className="space-y-3">
                    {phaseSteps.map(step => (
                      <StepCard
                        key={step.id}
                        step={step}
                        status={getStepStatus(step.id)}
                        selected={selectedStepId === step.id}
                        mode="detailed"
                        onClick={() => onSelectStep(step.id)}
                        onStatusChange={onUpdateStatus && ((newStatus: StepStatus) => onUpdateStatus(step.id, newStatus))}
                        phase={phase}
                        showPhase={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-gray-500">
                    No <Term keyPath="journeyTerms.step.plural" fallback="steps" /> in this phase.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ListView;
