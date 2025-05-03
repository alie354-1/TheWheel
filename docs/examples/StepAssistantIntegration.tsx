import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCompany } from '@/lib/hooks/useCompany';
import { JourneyStepDetails } from '@/components/company/journey/JourneyStepDetails';
import { StepAssistant } from '@/components/company/journey/StepAssistant';
import { StepRecommendations } from '@/components/company/journey/StepRecommendations';
import { journeyStepsService } from '@/lib/services/journeySteps.service';

interface StepData {
  id: string;
  name: string;
  description: string;
  phase_id: string;
  phase_name: string;
  difficulty_level: number;
  estimated_time_min: number;
  estimated_time_max: number;
  status?: string;
}

/**
 * Example integration of the StepAssistant component in the JourneyStepPage
 * This is an example implementation showing how to integrate the new UX components
 * for Sprint 3 journey map enhancements
 */
const JourneyStepPageExample: React.FC = () => {
  const { stepId } = useParams<{ stepId: string }>();
  const { currentCompany } = useCompany();
  const [step, setStep] = useState<StepData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStepData = async () => {
      if (!stepId || !currentCompany?.id) return;
      
      setLoading(true);
      try {
        const stepData = await journeyStepsService.getStepById(stepId, currentCompany.id);
        setStep(stepData);
      } catch (error) {
        console.error('Error fetching step data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStepData();
  }, [stepId, currentCompany?.id]);
  
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading step details...</p>
        </div>
      </div>
    );
  }
  
  if (!step) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4">
          <p>Step not found or you don't have access to this step.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">{step.name}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - 2/3 width on large screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step details component */}
          <JourneyStepDetails 
            step={step} 
            onStatusChange={(newStatus) => console.log('Status changed:', newStatus)} 
          />
          
          {/* Step recommendations at the bottom of main content */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Related Steps</h2>
            <StepRecommendations 
              stepId={stepId} 
              limit={3} 
              showRelationshipMap={true}
            />
          </div>
        </div>
        
        {/* Sidebar - 1/3 width on large screens */}
        <div className="space-y-6">
          {/* AI-powered Step Assistant */}
          <StepAssistant stepId={stepId} />
          
          {/* Additional sidebar components could go here */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-3">Step Statistics</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Difficulty:</span>
                <span className="font-medium">{step.difficulty_level}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated time:</span>
                <span className="font-medium">
                  {Math.round(step.estimated_time_min / 60)} - {Math.round(step.estimated_time_max / 60)} hours
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phase:</span>
                <span className="font-medium">{step.phase_name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyStepPageExample;
