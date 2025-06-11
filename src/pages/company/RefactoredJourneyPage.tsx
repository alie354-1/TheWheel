import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Filter, Settings, X } from 'lucide-react';

// Import from our component library
import { Container } from '../../components/layout';
import { Card, CardHeader, CardContent } from '../../components/ui';
import { LoadingSpinner, ErrorDisplay } from '../../components/feedback';

// Import our hooks
import { useAuth } from '../../lib/hooks/useAuth';
import { useLogging } from '../../lib/hooks/useLogging';
import { useFeatureFlags } from '../../lib/hooks/useFeatureFlags';
import { useAnalytics } from '../../lib/hooks/useAnalytics';

// Import journey-specific components
/* import { ViewToggle, ViewMode } from '../../components/company/journey/ViewToggle/ViewToggle'; */
/* import { SimplePhaseProgressList } from '../../components/company/journey/PhaseProgress/SimplePhaseProgressList'; */
import { StepStatus } from '../../components/company/journey/StepCard/StepCardProps';
/* import { TimelineView } from '../../components/company/journey/TimelineView/TimelineView'; */
import { ListView } from '../../components/company/journey/ListView/ListView';
import { Term } from '../../components/terminology/Term';
/* import { StepAssistant } from '../../components/company/journey/StepAssistant/StepAssistant'; */
import { MilestoneCelebrationAnimation } from '../../components/visualization';
/* import { ActionPanel } from '../../components/company/journey/ActionPanel/ActionPanel'; */

// Import journey data hook, but in the future consider migrating to a service
import { useJourneyPageData } from '../../lib/hooks/useJourneyPageData';

/**
 * RefactoredJourneyPage Component
 * 
 * Redesigned Journey page using our infrastructure components and hooks.
 */
const RefactoredJourneyPage: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  
  // Use our infrastructure hooks
  const { isAuthenticated, user } = useAuth();
  const { trackView, trackEvent } = useAnalytics();
  const { error: logError, withErrorLogging } = useLogging();
  const { isEnabled } = useFeatureFlags();

  // Local state
  // const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<any>(null);
  const [showStepPanel, setShowStepPanel] = useState<boolean>(false);
  const [filterActive, setFilterActive] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<StepStatus[]>([]);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationType, setCelebrationType] = useState<'step_completion' | 'phase_completion' | 'journey_completion'>('step_completion');
  const [completedItem, setCompletedItem] = useState<{ name: string; message?: string }>({ name: '' });
  const [error, setError] = useState<string | null>(null);

  // Fetch journey data
  const { 
    phases, 
    steps, 
    companySteps,
    isLoading,
    error: journeyError,
    updateStepStatus
  } = useJourneyPageData(companyId || '');

  // Track page view
  useEffect(() => {
    trackView('journey_page', { companyId });
  }, [companyId, trackView]);

  // Set error from journey data
  useEffect(() => {
    if (journeyError) {
      setError(journeyError.message);
      logError('Error loading journey data', journeyError);
    } else {
      setError(null);
    }
  }, [journeyError, logError]);

  // Calculate phase completion percentage
  const calculatePhaseCompletion = useCallback((phaseId: string): number => {
    const phaseSteps = steps.filter(step => step.phase_id === phaseId);
    if (phaseSteps.length === 0) return 0;
    
    const completedSteps = phaseSteps.filter(step => {
      const companyStep = companySteps.find(cs => cs.step_id === step.id);
      return companyStep?.status === 'completed';
    });
    
    return Math.round((completedSteps.length / phaseSteps.length) * 100);
  }, [steps, companySteps]);

  // Handle step selection
  const handleStepSelect = useCallback((stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    setSelectedStepId(stepId);
    setSelectedStep(step);
    setShowStepPanel(true);
    
    // Track analytics
    trackEvent('select_journey_step', { stepId, stepName: step?.name });
  }, [steps, trackEvent]);

  // Handle status update with error logging
  const handleStatusUpdate = withErrorLogging(async (stepId: string, status: string) => {
    // Get previous status for comparison
    const prevStatus = companySteps.find(cs => cs.step_id === stepId)?.status;
    
    // Update status
    await updateStepStatus(stepId, status as StepStatus);
    
    // Track status change
    trackEvent('update_step_status', { 
      stepId, 
      newStatus: status,
      previousStatus: prevStatus 
    });
    
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
          
          // Track phase completion
          trackEvent('complete_journey_phase', { 
            phaseId, 
            phaseName: phase?.name 
          });
        } else {
          // Step completion
          setCelebrationType('step_completion');
          setCompletedItem({ 
            name: step.name || 'Step',
            message: `You've completed "${step.name}"! Keep up the good work!`
          });
          
          // Track step completion
          trackEvent('complete_journey_step', { 
            stepId, 
            stepName: step.name 
          });
        }
        
        setShowCelebration(true);
      }
    }
  }, 'Failed to update step status');

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
      <Container maxWidth="7xl" centered padding>
        <LoadingSpinner size="lg" text="Loading journey data..." centered />
      </Container>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header with navigation */}
      <div className="bg-white border-b border-gray-200 py-4 px-6">
        <Container maxWidth="7xl">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              <Term keyPath="journeyTerms.journey.singular" fallback="Journey" />
            </h1>
            
            <div className="flex items-center space-x-4">
              <button 
                className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md ${
                  filterActive ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-white text-gray-700'
                }`}
                onClick={() => setFilterActive(!filterActive)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </button>
              
              {/* <ViewToggle 
                activeView={viewMode} 
                onChange={(mode) => {
                  setViewMode(mode);
                  trackEvent('change_journey_view', { newView: mode });
                }} 
              /> */}
            </div>
          </div>

          {/* Phase Progress */}
          <div className="mt-6">
            {/* Show error if any */}
            {error && (
              <ErrorDisplay
                title="Error Loading Journey Data"
                message={error}
                className="mb-4"
              />
            )}
            
            {/* Skip rendering SimplePhaseProgressList if phases are not available */}
            {/* {phases.length > 0 && (
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
                  
                  // Track analytics
                  trackEvent('click_journey_phase', { phaseId });
                }}
              />
            )} */}
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container maxWidth="7xl" padding>
        {/* Filter Panel */}
        {filterActive && (
          <Card className="mb-6">
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Filters</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setFilterActive(false)}
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
                              trackEvent('add_journey_filter', { filterType: 'status', value: status });
                            } else {
                              setStatusFilter(statusFilter.filter(s => s !== status));
                              trackEvent('remove_journey_filter', { filterType: 'status', value: status });
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
            </CardContent>
          </Card>
        )}

        {/* Journey Views with Action Panel */}
        <div className="flex gap-4">
          {/* Main Content Area */}
          <div className={`flex-grow ${showStepPanel ? 'pr-4' : ''}`}>
            {/* {viewMode === 'timeline' ? (
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
            )} */}
            {/* <TimelineView 
              phases={phases}
              steps={filteredSteps}
              companySteps={companySteps}
              selectedStepId={selectedStepId || undefined}
              onSelectStep={handleStepSelect}
              onUpdateStatus={handleStatusUpdate}
            /> */}
          </div>

          {/* Action Panel - Sprint 3 Addition */}
          <div className="w-80 flex flex-col gap-4">
            {/* Show action panel if feature is enabled */}
            {/* <ActionPanel 
              companyId={companyId || ''} 
              onStepSelect={handleStepSelect}
            /> */}
            
            {/* Step Preview Panel */}
            {showStepPanel && selectedStepId && (
              <Card className="overflow-hidden">
                <CardHeader className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h3 className="font-medium">
                    <Term keyPath="journeyTerms.step.singular" fallback="Step" /> Details
                  </h3>
                  <button 
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowStepPanel(false)}
                  >
                    <X size={18} />
                  </button>
                </CardHeader>
                <CardContent>
                  {selectedStep && (
                    <>
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900">{selectedStep.name}</h4>
                        {selectedStep.description && (
                          <p className="text-sm text-gray-600 mt-1">{selectedStep.description}</p>
                        )}
                      </div>
                      
                      {/* <StepAssistant
                        stepId={selectedStepId}
                        stepName={selectedStep.name}
                        stepDescription={selectedStep.description}
                        stepDifficulty={selectedStep.difficulty || 'medium'}
                      /> */}
                      
                      <div className="mt-4">
                        <button 
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                          onClick={() => {
                            navigate(`/company/${companyId}/journey/step/${selectedStepId}`);
                            trackEvent('view_full_step_details', { stepId: selectedStepId });
                          }}
                        >
                          View Full Details
                        </button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Container>
      
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

export default RefactoredJourneyPage;
