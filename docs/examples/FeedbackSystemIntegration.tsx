import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCompany } from '@/lib/hooks/useCompany';
import { useAuth } from '@/lib/hooks/useAuth';
import { JourneyStepDetails } from '@/components/company/journey/JourneyStepDetails';
import { StepAssistant } from '@/components/company/journey/StepAssistant';
import { StepRecommendations } from '@/components/company/journey/StepRecommendations';
import { InlineRatingComponent, StepImprovementSuggestionForm } from '@/components/feedback';
import { FeedbackService } from '@/lib/services/feedback.service';
import { journeyStepsService } from '@/lib/services/journeySteps.service';
import { motion, AnimatePresence } from 'framer-motion';

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
 * Example integration of the Sprint 4 Feedback System components in the JourneyStepPage
 * 
 * This example demonstrates how to incorporate:
 * 1. The InlineRatingComponent for quick user feedback
 * 2. The StepImprovementSuggestionForm for detailed improvement suggestions
 */
const JourneyStepPageWithFeedback: React.FC = () => {
  const { stepId } = useParams<{ stepId: string }>();
  const { currentCompany } = useCompany();
  const { user } = useAuth();
  const [step, setStep] = useState<StepData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState<number>(0);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [feedbackStats, setFeedbackStats] = useState<{
    averageRating: number;
    ratingCount: number;
  }>({ averageRating: 0, ratingCount: 0 });
  
  // Fetch step data
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
  
  // Fetch user rating and feedback stats
  useEffect(() => {
    const fetchFeedbackData = async () => {
      if (!stepId || !user) return;
      
      try {
        // Get the user's own rating
        const userFeedback = await FeedbackService.getUserFeedbackForEntity(
          stepId,
          'step', 
          user
        );
        
        if (userFeedback) {
          setUserRating(userFeedback.rating);
        }
        
        // Get overall feedback stats
        const stats = await FeedbackService.getFeedbackStats(stepId, 'step');
        setFeedbackStats({
          averageRating: stats.averageRating,
          ratingCount: stats.ratingCount
        });
      } catch (error) {
        console.error('Error fetching feedback data:', error);
      }
    };
    
    fetchFeedbackData();
  }, [stepId, user]);
  
  // Handle rating submission
  const handleRatingSubmit = async (rating: number, comment: string) => {
    if (!user || !currentCompany || !stepId) return;
    
    try {
      await FeedbackService.submitFeedback({
        userId: user.id,
        companyId: currentCompany.id,
        entityId: stepId,
        entityType: 'step',
        rating,
        comment: comment || undefined
      });
      
      // Update local state
      setUserRating(rating);
      
      // Refresh feedback stats
      const stats = await FeedbackService.getFeedbackStats(stepId, 'step');
      setFeedbackStats({
        averageRating: stats.averageRating,
        ratingCount: stats.ratingCount
      });
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };
  
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
          
          {/* Feedback section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Your Feedback</h2>
              <div className="flex items-center">
                {feedbackStats.ratingCount > 0 && (
                  <div className="text-sm text-gray-500 mr-4">
                    Average: <span className="font-medium">{feedbackStats.averageRating.toFixed(1)}</span> 
                    <span className="text-yellow-500 ml-1">★</span>
                    <span className="ml-1">({feedbackStats.ratingCount} {feedbackStats.ratingCount === 1 ? 'rating' : 'ratings'})</span>
                  </div>
                )}
                <button
                  onClick={() => setShowSuggestionForm(!showSuggestionForm)}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {showSuggestionForm ? 'Cancel Suggestion' : 'Suggest Improvement'}
                </button>
              </div>
            </div>
            
            {/* Rating component */}
            <div className="mb-6">
              <div className="text-sm text-gray-700 mb-2">How would you rate this step?</div>
              <InlineRatingComponent
                entityId={stepId || ''}
                entityType="step"
                initialRating={userRating}
                showCommentField={true}
                onRatingSubmit={handleRatingSubmit}
                size="lg"
              />
            </div>
            
            {/* Improvement suggestion form */}
            <AnimatePresence>
              {showSuggestionForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6"
                >
                  <StepImprovementSuggestionForm
                    entityId={stepId || ''}
                    entityType="step"
                    entityName={step.name}
                    onSubmitSuccess={() => setShowSuggestionForm(false)}
                    onCancel={() => setShowSuggestionForm(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
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

export default JourneyStepPageWithFeedback;
