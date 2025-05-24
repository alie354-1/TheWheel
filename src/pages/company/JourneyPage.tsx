import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Filter, Settings, X } from 'lucide-react';

import { TimelineView } from '../../components/company/journey/TimelineView';
import { ListView } from '../../components/company/journey/ListView';
import { ViewToggle, ViewMode } from '../../components/company/journey/ViewToggle';
import { SimplePhaseProgressList } from '../../components/company/journey/PhaseProgress/SimplePhaseProgressList';
import { StepStatus } from '../../components/company/journey/StepCard/StepCardProps';
import { Term } from '../../components/terminology/Term';
import { StepAssistant } from '../../components/company/journey/StepAssistant';
import { MilestoneCelebrationAnimation } from '../../components/visualization';
import { ActionPanel } from '../../components/company/journey/ActionPanel';

import { useJourneyPageData } from '../../lib/hooks/useJourneyPageData';

/**
 * JourneyPage Component
 * 
 * Main Journey page with timeline and list views for journey steps.
 * Implementation of the Sprint 3 Journey System Unified Redesign.
 */
const JourneyPage: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<any>(null);
  const [showStepPanel, setShowStepPanel] = useState<boolean>(false);
  const [filterActive, setFilterActive] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<StepStatus[]>([]);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationType, setCelebrationType] = useState<'step_completion' | 'phase_completion' | 'journey_completion'>('step_completion');
  const [completedItem, setCompletedItem] = useState<{ name: string; message?: string }>({ name: '' });

  // Fetch data
  const { 
    phases, 
    steps, 
    companySteps,
    isLoading,
    updateStepStatus
  } = useJourneyPageData(companyId || '');

  // Calculate phase completion percentage
  const calculatePhaseCompletion = (phaseId: string): number => {
    const phaseSteps = steps.filter(step => step.phase_id === phaseId);
    if (phaseSteps.length === 0) return 0;
    
    const completedSteps = phaseSteps.filter(step => {
      const companyStep = companySteps.find(cs => cs.step_id === step.id);
      return companyStep?.status === 'completed';
    });
    
    return Math.round((completedSteps.length / phaseSteps.length) * 100);
  };

  // Handle step selection
  const handleStepSelect = (stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    setSelectedStepId(stepId);
    setSelectedStep(step);
    setShowStepPanel(true);
  };

  // Handle status update
  const handleStatusUpdate = (stepId: string, status: string) => {
    // Get previous status for comparison
    const prevStatus = companySteps.find(cs => cs.step_id === stepId)?.status;
    
    // Update status
    updateStepStatus(stepId, status as StepStatus);
    
    // Show celebration when completing a step
    if (status === 'completed' && prevStatus !== 'completed') {
      const step = steps.find(s => s.id === stepId);
      if (step) {
        // Check if this completes a phase
        const phaseId = step.phase_id;
        const phaseSteps = steps.filter(s => s.phase_id === phaseId);
        const phaseCompletedSteps = phaseSteps.filter(s => {
          const cs = companySteps.find(cs => cs.step_id === s.id);
          return cs?.status === 'completed' || s.id === stepId;
        });
        
        if (phaseCompletedSteps.length === phaseSteps.length) {
          // Phase completion
          const phase = phases.find(p => p.id === phaseId);
          setCelebrationType('phase_completion');
          setCompletedItem({ 
            name: phase?.name || 'Phase', 
            message: `You've completed all steps in this phase! Great progress!` 
          });
        } else {
          // Step completion
          setCelebrationType('step_completion');
          setCompletedItem({ 
            name: step.name || 'Step',
            message: `You've completed "${step.name}"! Keep up the good work!`
          });
        }
        
        setShowCelebration(true);
      }
    }
  };

  // Handle filter toggle
  const handleFilterToggle = () => {
    setFilterActive(!filterActive);
  };

  // Filter steps based on selected filters
  const filteredSteps = React.useMemo(() => {
    if (!statusFilter.length) return steps;
    
    return steps.filter(step => {
      const companyStep = companySteps.find(cs => cs.step_id === step.id);
      const status = companyStep?.status || 'not_started';
      return statusFilter.includes(status as StepStatus);
    });
  }, [steps, companySteps, statusFilter]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="journey-page bg-gray-50 min-h-screen">
      {/* Header with navigation */}
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              <Term keyPath="journeyTerms.journey.singular" fallback="Journey" />
            </h1>
            
            <div className="flex items-center space-x-4">
              <a 
                href={`/company/journey-new`} 
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md bg-white hover:bg-gray-50"
              >
                Try New Journey UI
              </a>
              <button 
                className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md ${
                  filterActive ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-white text-gray-700'
                }`}
                onClick={handleFilterToggle}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </button>
              
              <ViewToggle 
                activeView={viewMode} 
                onChange={setViewMode} 
              />
            </div>
          </div>

          {/* Phase Progress */}
          <div className="mt-6">
            {/* Skip rendering SimplePhaseProgressList if phases are not available */}
            {phases.length > 0 && (
              <SimplePhaseProgressList 
                phases={phases.map(phase => ({
                  id: phase.id,
                  name: phase.name,
                  color: phase.color,
                  completionPercentage: calculatePhaseCompletion(phase.id)
                }))}
                onPhaseClick={(phaseId) => {
                  // Scroll to phase section
                  const phaseElement = document.getElementById(`phase-${phaseId}`);
                  if (phaseElement) {
                    phaseElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6 px-6">
        {/* Filter Panel */}
        {filterActive && (
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Filters</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={handleFilterToggle}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['not_started', 'in_progress', 'completed', 'skipped'].map((status) => (
                    <label 
                      key={status}
                      className="inline-flex items-center"
                    >
                      <input 
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-600"
                        checked={statusFilter.includes(status as StepStatus)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setStatusFilter([...statusFilter, status as StepStatus]);
                          } else {
                            setStatusFilter(statusFilter.filter(s => s !== status));
                          }
                        }}
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {status.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Journey Views with Action Panel - Updated for Sprint 3 */}
        <div className="flex gap-4">
          {/* Main Content Area */}
          <div className={`flex-grow ${showStepPanel ? 'pr-4' : ''}`}>
            {viewMode === 'timeline' ? (
              <TimelineView 
                phases={phases}
                steps={filteredSteps}
                companySteps={companySteps}
                selectedStepId={selectedStepId || undefined}
                onSelectStep={handleStepSelect}
                onUpdateStatus={handleStatusUpdate}
              />
            ) : (
              <ListView 
                phases={phases}
                steps={filteredSteps}
                companySteps={companySteps}
                selectedStepId={selectedStepId || undefined}
                onSelectStep={handleStepSelect}
                onUpdateStatus={handleStatusUpdate}
              />
            )}
          </div>

          {/* Action Panel - Sprint 3 Addition */}
          <div className="w-80 flex flex-col gap-4">
            <ActionPanel 
              companyId={companyId || ''} 
              onStepSelect={handleStepSelect}
            />
            
            {/* Step Preview Panel */}
            {showStepPanel && selectedStepId && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between">
                  <h3 className="font-medium">
                    <Term keyPath="journeyTerms.step.singular" fallback="Step" /> Details
                  </h3>
                  <button 
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowStepPanel(false)}
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-4">
                  {selectedStep && (
                    <>
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900">{selectedStep.name}</h4>
                        {selectedStep.description && (
                          <p className="text-sm text-gray-600 mt-1">{selectedStep.description}</p>
                        )}
                      </div>
                      
                      <StepAssistant
                        stepId={selectedStepId}
                        stepName={selectedStep.name}
                        stepDescription={selectedStep.description}
                        stepDifficulty={selectedStep.difficulty || 'medium'}
                      />
                      
                      <div className="mt-4">
                        <button 
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                          onClick={() => navigate(`/company/${companyId}/journey/step/${selectedStepId}`)}
                        >
                          View Full Details
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Milestone Celebration Modal */}
      <MilestoneCelebrationAnimation
        type={celebrationType}
        title={`${completedItem.name} Complete!`}
        message={completedItem.message}
        isVisible={showCelebration}
        onClose={() => setShowCelebration(false)}
      />
    </div>
  );
};

export default JourneyPage;
