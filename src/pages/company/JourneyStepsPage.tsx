import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EnhancedJourneyStep } from '../../lib/types/journey-steps.types';
import { StepList, DraggableStepList } from '../../components/company/journey/StepList';
import { PhaseProgress } from '../../components/company/journey/PhaseProgress';
import journeyStepsService from '../../lib/services/journeySteps.service';
import { Switch } from '@headlessui/react';

/**
 * JourneyStepsPage Component
 * 
 * Main page for viewing and interacting with a company's journey steps.
 * Replaced JourneyChallengesPage in the rebranding effort.
 */
const JourneyStepsPage: React.FC = () => {
  const { companyId = '' } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  
  // State
  const [steps, setSteps] = useState<EnhancedJourneyStep[]>([]);
  const [phases, setPhases] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [reorderMode, setReorderMode] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  
  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load phases
        const phaseData = await journeyStepsService.getJourneyPhases();
        setPhases(phaseData);
        
        // If no phase is selected, use the first one
        if (phaseData.length > 0 && !selectedPhaseId) {
          setSelectedPhaseId(phaseData[0].id);
        }
        
        // Load steps (enhanced version)
        const stepsData = await journeyStepsService.getEnhancedSteps();
        setSteps(stepsData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading journey data:', err);
        setError('Failed to load journey data. Please try again later.');
        setLoading(false);
      }
    };
    
    loadData();
  }, [companyId]);
  
  // Filter steps based on selected filters
  const filteredSteps = React.useMemo(() => {
    let result = [...steps];
    
    // Apply phase filter
    if (selectedPhaseId) {
      result = result.filter(step => step.phase_id === selectedPhaseId);
    }
    
    // Apply status filter
    if (selectedStatus.length > 0) {
      result = result.filter(step => 
        step.status && selectedStatus.includes(step.status)
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(step => 
        step.name.toLowerCase().includes(lowerSearchTerm) || 
        (step.description && step.description.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    return result;
  }, [steps, selectedPhaseId, selectedStatus, searchTerm]);
  
  // Handle step click - navigate to step detail page
  const handleStepClick = (step: EnhancedJourneyStep) => {
    navigate(`/company/${companyId}/journey/step/${step.id}`);
  };
  
  // Handle mark as irrelevant click
  const handleMarkIrrelevant = async (step: EnhancedJourneyStep) => {
    try {
      await journeyStepsService.markStepAsSkipped(companyId, step.id);
      
      // Update local state
      setSteps(prevSteps => 
        prevSteps.map(s => 
          s.id === step.id ? { ...s, status: 'skipped' } : s
        )
      );
    } catch (err) {
      console.error('Error marking step as irrelevant:', err);
      setError('Failed to mark step as irrelevant. Please try again later.');
    }
  };
  
  // Handle step reordering
  const handleStepsReorder = async (reorderedSteps: EnhancedJourneyStep[]) => {
    try {
      // This method just updates the UI, we'll save when the user clicks "Save Order"
      setSteps(prevSteps => {
        // Create a map of step ids from the reordered steps
        const stepOrderMap = new Map<string, number>();
        reorderedSteps.forEach((step, index) => {
          stepOrderMap.set(step.id, index);
        });
        
        // Return the full list of steps with updated order for the selected phase
        return prevSteps.map(step => {
          if (step.phase_id === selectedPhaseId && stepOrderMap.has(step.id)) {
            return {
              ...step,
              order_index: stepOrderMap.get(step.id) || step.order_index
            };
          }
          return step;
        }).sort((a, b) => {
          // Ensure steps of the same phase are ordered correctly
          if (a.phase_id === b.phase_id) {
            return (a.order_index || 0) - (b.order_index || 0);
          }
          // Otherwise maintain phase ordering
          return 0;
        });
      });
    } catch (err) {
      console.error('Error reordering steps:', err);
      setError('Failed to reorder steps. Please try again later.');
    }
  };
  
  // Save the new step order to the server
  const handleSaveOrder = async () => {
    try {
      setSaving(true);
      
      // Only send the steps that have been reordered in the current phase
      const stepsToUpdate = filteredSteps.map((step, index) => ({
        id: step.id,
        order_index: index
      }));
      
      await journeyStepsService.updateStepOrder(companyId, stepsToUpdate);
      
      // Toast notification or success message here
      alert('Step order saved successfully!');
      
      setSaving(false);
      setReorderMode(false);
    } catch (err) {
      console.error('Error saving step order:', err);
      setError('Failed to save step order. Please try again later.');
      setSaving(false);
    }
  };
  
  // Render loading state
  if (loading) {
    return <div className="p-8 text-center">Loading journey steps...</div>;
  }
  
  // Render error state
  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Journey Steps</h1>
        <p className="text-gray-600">
          Track your progress through the startup journey with these guided steps.
        </p>
      </div>
      
      {/* Phase selector and progress */}
      <div className="mb-8">
        <PhaseProgress 
          phases={phases}
          companyId={companyId}
          selectedPhaseId={selectedPhaseId}
          onPhaseSelect={setSelectedPhaseId}
        />
      </div>
      
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 justify-between">
        <div className="flex flex-wrap gap-4">
          {/* Search filter */}
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Search steps..."
              className="w-full px-4 py-2 border rounded"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              disabled={reorderMode}
            />
          </div>
          
          {/* Status filter */}
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">Status:</span>
            {['not_started', 'in_progress', 'completed', 'skipped'].map(status => (
              <label key={status} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={selectedStatus.includes(status)}
                  onChange={() => {
                    if (selectedStatus.includes(status)) {
                      setSelectedStatus(selectedStatus.filter(s => s !== status));
                    } else {
                      setSelectedStatus([...selectedStatus, status]);
                    }
                  }}
                  disabled={reorderMode}
                />
                {status.replace('_', ' ')}
              </label>
            ))}
          </div>
        </div>
        
        {/* Reorder mode toggle */}
        <div className="flex items-center gap-2">
          <Switch
            checked={reorderMode}
            onChange={setReorderMode}
            className={`${
              reorderMode ? 'bg-blue-600' : 'bg-gray-300'
            } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <span
              className={`${
                reorderMode ? 'translate-x-6' : 'translate-x-1'
              } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
            />
          </Switch>
          <span className="text-sm font-medium">
            {reorderMode ? 'Reorder Mode' : 'View Mode'}
          </span>
          
          {/* Save button when in reorder mode */}
          {reorderMode && (
            <button
              onClick={handleSaveOrder}
              disabled={saving}
              className={`ml-2 px-4 py-1 rounded text-white ${saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {saving ? 'Saving...' : 'Save Order'}
            </button>
          )}
        </div>
      </div>
      
      {/* Steps list - choose between regular and draggable based on mode */}
      <div>
        {reorderMode ? (
          <DraggableStepList
            steps={filteredSteps}
            showPhase={false}
            onStepSelect={(stepId) => {
              const step = filteredSteps.find(s => s.id === stepId);
              if (step) {
                handleStepClick(step);
              }
            }}
            onOrderChange={handleStepsReorder}
            compact={false}
          />
        ) : (
          <StepList
            steps={filteredSteps}
            showPhase={false}  // No need to show phase since we're filtering by phase
            onStepClick={handleStepClick}
            onMarkIrrelevantClick={handleMarkIrrelevant}
            emptyMessage="No steps found matching your filters. Try adjusting your search criteria."
          />
        )}
      </div>
    </div>
  );
};

export default JourneyStepsPage;
