import React, { useState, useEffect } from 'react';
import { expertService } from '../../lib/services/expert.service';
import { ExpertProfile, CreateExpertProfileRequest } from '../../lib/types/community.types';
import ExpertMotivationStep from '../community/wizard-steps/ExpertMotivationStep';
import ExpertiseAreasStep from '../community/wizard-steps/ExpertiseAreasStep';
import ExperienceStep from '../community/wizard-steps/ExperienceStep';
import SuccessStoriesStep from '../community/wizard-steps/SuccessStoriesStep';
import MentorshipStep from '../community/wizard-steps/MentorshipStep';
import ProfileReviewStep from '../community/wizard-steps/ProfileReviewStep';

interface ExpertProfileWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userId?: string;
}

/**
 * Multi-step wizard for creating an expert profile
 * Guides users through the process of setting up their expert profile
 */
const ExpertProfileWizard: React.FC<ExpertProfileWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  userId
}) => {
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<Partial<ExpertProfile>>({
    user_id: userId,
    primary_expertise_areas: [],
    mentorship_capacity: 0,
    success_stories: []
  });

  // Load draft from localStorage if available
  useEffect(() => {
    if (userId) {
      const savedDraft = localStorage.getItem(`expert-profile-draft-${userId}`);
      if (savedDraft) {
        try {
          const parsedDraft = JSON.parse(savedDraft);
          setFormData(prev => ({ ...prev, ...parsedDraft }));
        } catch (err) {
          console.error('Error parsing saved draft:', err);
        }
      }
    }
  }, [userId]);

  // Save draft to localStorage when formData changes
  useEffect(() => {
    if (userId && Object.keys(formData).length > 1) {
      localStorage.setItem(`expert-profile-draft-${userId}`, JSON.stringify(formData));
    }
  }, [formData, userId]);

  if (!isOpen) return null;

  // Handle form field updates
  const updateFormData = (stepData: Partial<ExpertProfile>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  // Navigate to next step
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Navigate to previous step
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit the expert profile
  const submitProfile = async () => {
    if (!userId) {
      setError('User ID is required to create an expert profile');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Ensure user_id is set
      const profileData: Partial<ExpertProfile> = {
        ...formData,
        user_id: userId
      };

      // Create or update the expert profile
      await expertService.upsertExpertProfile(profileData);
      
      // Clear the draft from localStorage
      localStorage.removeItem(`expert-profile-draft-${userId}`);
      
      // Show success message
      setSuccess(true);
      
      // Call onComplete after a delay to allow the user to see the success message
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err) {
      console.error('Error creating expert profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating your expert profile');
    } finally {
      setLoading(false);
    }
  };

  // Total number of steps in the wizard
  const totalSteps = 6;

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ExpertMotivationStep
            formData={formData}
            updateFormData={updateFormData}
            goToNextStep={goToNextStep}
          />
        );
      case 2:
        return (
          <ExpertiseAreasStep
            formData={formData}
            updateFormData={updateFormData}
            goToNextStep={goToNextStep}
            goToPreviousStep={goToPreviousStep}
          />
        );
      case 3:
        return (
          <ExperienceStep
            formData={formData}
            updateFormData={updateFormData}
            goToNextStep={goToNextStep}
            goToPreviousStep={goToPreviousStep}
          />
        );
      case 4:
        return (
          <SuccessStoriesStep
            formData={formData}
            updateFormData={updateFormData}
            goToNextStep={goToNextStep}
            goToPreviousStep={goToPreviousStep}
          />
        );
      case 5:
        return (
          <MentorshipStep
            formData={formData}
            updateFormData={updateFormData}
            goToNextStep={goToNextStep}
            goToPreviousStep={goToPreviousStep}
          />
        );
      case 6:
        return (
          <ProfileReviewStep
            formData={formData}
            updateFormData={updateFormData}
            goToPreviousStep={goToPreviousStep}
            submitProfile={submitProfile}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 relative my-8 mx-4 max-h-[80vh] overflow-y-auto text-gray-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Create Your Expert Profile</h2>
          <p className="text-gray-600 text-center mt-1">Share your expertise and help others succeed</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index + 1 === currentStep
                      ? 'bg-blue-600 text-white'
                      : index + 1 < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1 < currentStep ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-1 hidden sm:block">
                  {index === 0 && 'Motivation'}
                  {index === 1 && 'Expertise'}
                  {index === 2 && 'Experience'}
                  {index === 3 && 'Success Stories'}
                  {index === 4 && 'Mentorship'}
                  {index === 5 && 'Review'}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">Your expert profile has been created successfully!</span>
          </div>
        )}

        {/* Current step content */}
        <div className="mb-6">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default ExpertProfileWizard;
