import React, { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCompanyJourney } from '../../../lib/hooks/useCompanyJourney';
import { SimplePhaseProgress } from './PhaseProgress/SimplePhaseProgress';
import { Term } from '../../terminology/Term';
import { JourneyUnifiedService } from '../../../lib/services/journey-unified.service';
import { JourneyStep } from '../../../lib/types/journey-unified.types';

interface JourneyOverviewProps {
  companyId: string;
  onSelectPhase?: (phaseId: string) => void;
  onSelectStep?: (stepId: string) => void;
  className?: string;
}

/**
 * JourneyOverview Component
 * 
 * A reusable component for displaying journey overview metrics and progress,
 * with the ability to navigate to specific phases or steps.
 * 
 * Created in Sprint 2 to use the unified journey system.
 */
export const JourneyOverview: FC<JourneyOverviewProps> = ({ 
  companyId, 
  onSelectPhase, 
  onSelectStep,
  className = ''
}) => {
  const navigate = useNavigate();
  const { 
    phases, 
    phaseProgress, 
    companySteps, 
    completionPercentage, 
    isLoading, 
    error 
  } = useCompanyJourney(companyId);
  
  // State to store step details
  const [stepDetails, setStepDetails] = useState<Record<string, JourneyStep>>({});

  // Fetch step details for in-progress steps
  useEffect(() => {
    const fetchStepDetails = async () => {
      if (!companySteps || companySteps.length === 0) return;
      
      // Get in-progress step IDs
      const inProgressStepIds = companySteps
        .filter(step => step.status === 'in_progress')
        .slice(0, 3) // Limit to 3 for better UI
        .map(step => step.step_id);
      
      if (inProgressStepIds.length === 0) return;
      
      // Fetch details for each step
      const detailsPromises = inProgressStepIds.map(async (stepId) => {
        try {
          const step = await JourneyUnifiedService.getStepById(stepId);
          if (step) {
            return { [stepId]: step };
          }
          return null;
        } catch (err) {
          console.error(`Error fetching step details for ${stepId}:`, err);
          return null;
        }
      });
      
      const results = await Promise.all(detailsPromises);
      
      // Create an object with only the valid step details
      const validDetails: Record<string, JourneyStep> = {};
      results.forEach(item => {
        if (item) {
          Object.entries(item).forEach(([key, value]) => {
            if (value) {
              validDetails[key] = value;
            }
          });
        }
      });
      
      setStepDetails(validDetails);
    };
    
    fetchStepDetails();
  }, [companySteps]);

  // Calculate statistics
  const totalSteps = companySteps.length;
  const completedSteps = companySteps.filter(s => s.status === 'completed').length;
  const inProgressSteps = companySteps.filter(s => s.status === 'in_progress').length;

  // Handle selecting a phase
  const handlePhaseSelect = (phaseId: string) => {
    if (onSelectPhase) {
      onSelectPhase(phaseId);
    } else {
      navigate(`/company/journey/steps?phase=${phaseId}`);
    }
  };

  // Handle selecting a step
  const handleStepSelect = (stepId: string) => {
    if (onSelectStep) {
      onSelectStep(stepId);
    } else {
      navigate(`/company/journey/step/${stepId}`);
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p><strong>Error:</strong> {error.message}</p>
          <p className="mt-2">Please refresh or try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Progress Summary */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          <Term keyPath="journeyTerms.journey" fallback="Journey" /> Progress
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Progress percentage */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-primary">{Math.round(completionPercentage)}%</div>
            <div className="text-gray-500 text-sm">Overall Completion</div>
          </div>
          
          {/* Completed steps */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-600">{completedSteps}</div>
            <div className="text-gray-500 text-sm">Completed <Term keyPath="journeyTerms.step.plural" fallback="Steps" /></div>
          </div>
          
          {/* In progress steps */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-600">{inProgressSteps}</div>
            <div className="text-gray-500 text-sm">In Progress</div>
          </div>
          
          {/* Total steps */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-gray-700">{totalSteps}</div>
            <div className="text-gray-500 text-sm">Total <Term keyPath="journeyTerms.step.plural" fallback="Steps" /></div>
          </div>
        </div>
      </div>
      
      {/* Phases Progress */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Progress by <Term keyPath="journeyTerms.phase" fallback="Phase" /></h2>
        
        <div className="space-y-6">
          {phaseProgress.map(phase => (
            <SimplePhaseProgress 
              key={phase.id}
              phase={{
                id: phase.id,
                name: phase.name,
                description: phase.description || '',
                completedCount: phase.completed_steps || 0,
                totalCount: phase.steps_count || 0
              }}
              onClick={() => handlePhaseSelect(phase.id)}
            />
          ))}
        </div>
      </div>
      
      {/* Next Steps */}
      {inProgressSteps > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Continue Your <Term keyPath="journeyTerms.journey" fallback="Journey" /></h2>
          
          <div className="grid grid-cols-1 gap-4">
            {companySteps
              .filter(step => step.status === 'in_progress')
              .slice(0, 3) // Limit to 3 for better UI
              .map(step => {
                const stepDetail = stepDetails[step.step_id];
                
                return (
                  <button
                    key={step.step_id}
                    onClick={() => handleStepSelect(step.step_id)}
                    className="flex items-center justify-between bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg transition-colors"
                  >
                    <div>
                      <span className="font-medium">
                        {stepDetail?.name || `Step ${step.step_id.substring(0, 6)}...`}
                      </span>
                      <div className="text-sm text-blue-600 mt-1">In progress - continue working</div>
                    </div>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default JourneyOverview;
