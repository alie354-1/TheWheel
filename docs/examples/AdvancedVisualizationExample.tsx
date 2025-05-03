import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCompany } from '@/lib/hooks/useCompany';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  InteractiveJourneyMap, 
  MilestoneCelebrationAnimation 
} from '@/components/visualization';
import { journeyStepsService } from '@/lib/services/journeySteps.service';

/**
 * AdvancedVisualizationExample
 * 
 * This example demonstrates the use of the Advanced Journey Visualization
 * components introduced in Sprint 4.
 * 
 * It shows how to:
 * 1. Use the InteractiveJourneyMap for an interactive visualization of the journey
 * 2. Trigger the MilestoneCelebrationAnimation when a step is completed
 */
const AdvancedVisualizationExample: React.FC = () => {
  const navigate = useNavigate();
  const { companyId } = useParams<{ companyId: string }>();
  const { currentCompany } = useCompany();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [completedStep, setCompletedStep] = useState<{
    name: string;
    type: 'completion' | 'achievement' | 'progress';
  } | null>(null);
  
  // Load company data and check for recent milestones
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, this would check for recently completed steps
        // For this example, we'll simulate a milestone detection after 3 seconds
        setTimeout(() => {
          // Simulate detecting a recently completed milestone
          setCompletedStep({
            name: 'Market Research',
            type: 'completion'
          });
          setShowCelebration(true);
        }, 3000);
        
      } catch (err) {
        console.error('Error fetching journey data:', err);
        setError('Failed to load journey data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentCompany?.id || companyId) {
      fetchData();
    }
  }, [companyId, currentCompany?.id]);
  
  // Handle step click in the journey map
  const handleStepClick = (stepId: string) => {
    setSelectedStepId(stepId);
    
    // Navigate to the step details page
    navigate(`/company/${currentCompany?.id || companyId}/journey/step/${stepId}`);
  };
  
  // Handle step completion and show celebration
  const handleStepCompletion = async (stepId: string) => {
    try {
      // In a real implementation, this would update the step status in the database
      // await journeyStepsService.updateStepStatus(stepId, 'completed');
      
      // Get step details
      const stepDetails = await journeyStepsService.getStepById(
        stepId, 
        currentCompany?.id || companyId || ''
      );
      
      // Show celebration animation
      setCompletedStep({
        name: stepDetails.name,
        type: 'completion'
      });
      setShowCelebration(true);
      
    } catch (err) {
      console.error('Error completing step:', err);
    }
  };
  
  // Close celebration modal
  const handleCloseCelebration = () => {
    setShowCelebration(false);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading journey visualization...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Company Journey Map</h1>
      
      {/* Interactive Journey Map */}
      <div className="mb-8">
        <InteractiveJourneyMap
          companyId={currentCompany?.id || companyId}
          onStepClick={handleStepClick}
          highlightStepId={selectedStepId}
        />
      </div>
      
      {/* Sample controls for demonstration */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Demonstration Controls</h2>
        <p className="text-gray-600 mb-4">
          These controls are for demonstration purposes to show how the milestone
          celebration animations can be triggered.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => {
              setCompletedStep({
                name: 'Business Plan',
                type: 'completion'
              });
              setShowCelebration(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Simulate Step Completion
          </button>
          
          <button
            onClick={() => {
              setCompletedStep({
                name: 'Funding Milestone Reached',
                type: 'achievement'
              });
              setShowCelebration(true);
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 ml-4"
          >
            Simulate Achievement
          </button>
          
          <button
            onClick={() => {
              setCompletedStep({
                name: 'Phase 1 Progress: 50%',
                type: 'progress'
              });
              setShowCelebration(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ml-4"
          >
            Simulate Progress Update
          </button>
        </div>
      </div>
      
      {/* Milestone Celebration Modal */}
      {completedStep && (
        <MilestoneCelebrationAnimation
          title={`🎉 ${completedStep.name} Complete!`}
          description={
            completedStep.type === 'completion'
              ? "Congratulations! You've successfully completed this step."
              : completedStep.type === 'achievement'
              ? "You've reached an important milestone in your journey!"
              : "You're making great progress toward your goals!"
          }
          isVisible={showCelebration}
          onClose={handleCloseCelebration}
          type={completedStep.type}
          autoClose={true}
          duration={5000}
        />
      )}
      
      {/* Information about the components */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">About the Visualization Components</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-indigo-700">InteractiveJourneyMap</h3>
            <p className="text-gray-600">
              An interactive, zoomable, and pannable visualization of your company's journey.
              Shows phases, steps, and their relationships. Click on steps to navigate to them,
              and use the mouse wheel to zoom in/out.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-indigo-700">MilestoneCelebrationAnimation</h3>
            <p className="text-gray-600">
              Provides visual celebration effects when users complete steps or reach important
              milestones. Includes different celebration styles for different types of
              achievements.
            </p>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">
              <strong>Note:</strong> These components are part of the Sprint 4 Advanced Journey
              Visualization features. They work together with the feedback system to provide a
              more engaging and informative user experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedVisualizationExample;
