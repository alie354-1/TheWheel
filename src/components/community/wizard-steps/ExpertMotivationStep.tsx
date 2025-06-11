import React, { useState, useEffect } from 'react';
import { ExpertProfile } from '../../../lib/types/community.types';

interface ExpertMotivationStepProps {
  formData: Partial<ExpertProfile>;
  updateFormData: (data: Partial<ExpertProfile>) => void;
  goToNextStep: () => void;
}

/**
 * First step of the expert profile wizard
 * Asks about the user's motivation for becoming an expert
 */
const ExpertMotivationStep: React.FC<ExpertMotivationStepProps> = ({
  formData,
  updateFormData,
  goToNextStep
}) => {
  // This field isn't in the ExpertProfile type, but we'll store it in localStorage
  // and use it for personalization in the UI
  const [motivation, setMotivation] = useState<string>(
    localStorage.getItem('expert-motivation') || ''
  );
  const [isValid, setIsValid] = useState(false);

  // Validate the form
  useEffect(() => {
    setIsValid(motivation.length >= 50);
  }, [motivation]);

  // Save motivation to localStorage
  useEffect(() => {
    if (motivation) {
      localStorage.setItem('expert-motivation', motivation);
    }
  }, [motivation]);

  const handleContinue = () => {
    if (isValid) {
      // We don't need to update formData since this isn't stored in the profile
      // But we could add it to a custom field if needed
      goToNextStep();
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Why do you want to be an expert?</h3>
      <p className="text-gray-600 mb-6">
        Share your motivation for joining our expert network. What drives you to share your knowledge and help others?
      </p>

      <div>
        <div className="mb-6">
          <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-1">
            Your Motivation <span className="text-red-500">*</span>
          </label>
          <textarea
            id="motivation"
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="I want to become an expert because..."
            required
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500">
              Minimum 50 characters
            </p>
            <p className={`text-xs ${motivation.length >= 50 ? 'text-green-600' : 'text-gray-500'}`}>
              {motivation.length} / 50 characters
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!isValid}
            className={`px-6 py-2 rounded-md font-medium ${
              isValid
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpertMotivationStep;
