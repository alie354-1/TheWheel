import React, { useState, useEffect } from 'react';
import { ExpertProfile } from '../../../lib/types/community.types';

interface ExpertiseAreasStepProps {
  formData: Partial<ExpertProfile>;
  updateFormData: (data: Partial<ExpertProfile>) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

// Predefined expertise areas
const EXPERTISE_AREAS = [
  'Product Strategy',
  'Marketing',
  'Sales',
  'Finance',
  'Operations',
  'Technology',
  'Leadership',
  'Fundraising',
  'Growth',
  'Customer Success',
  'UX/UI Design',
  'Data Science',
  'AI/ML',
  'Blockchain',
  'Legal',
  'HR',
  'Business Development',
  'International Expansion',
  'Supply Chain',
  'Manufacturing'
];

/**
 * Second step of the expert profile wizard
 * Allows users to select their primary and secondary expertise areas
 */
const ExpertiseAreasStep: React.FC<ExpertiseAreasStepProps> = ({
  formData,
  updateFormData,
  goToNextStep,
  goToPreviousStep
}) => {
  const [primaryAreas, setPrimaryAreas] = useState<string[]>(
    formData.primary_expertise_areas || []
  );
  const [secondaryAreas, setSecondaryAreas] = useState<string[]>(
    formData.secondary_expertise_areas || []
  );
  const [customArea, setCustomArea] = useState('');
  const [isValid, setIsValid] = useState(false);

  // Validate the form
  useEffect(() => {
    setIsValid(primaryAreas.length > 0);
  }, [primaryAreas]);

  const handlePrimaryAreaToggle = (area: string) => {
    if (primaryAreas.includes(area)) {
      setPrimaryAreas(primaryAreas.filter(a => a !== area));
      
      // If it was removed from primary, check if it should be added to secondary
      if (!secondaryAreas.includes(area)) {
        setSecondaryAreas([...secondaryAreas, area]);
      }
    } else {
      setPrimaryAreas([...primaryAreas, area]);
      
      // If it was added to primary, remove from secondary if present
      if (secondaryAreas.includes(area)) {
        setSecondaryAreas(secondaryAreas.filter(a => a !== area));
      }
    }
  };

  const handleSecondaryAreaToggle = (area: string) => {
    if (secondaryAreas.includes(area)) {
      setSecondaryAreas(secondaryAreas.filter(a => a !== area));
    } else {
      // Only add to secondary if not already in primary
      if (!primaryAreas.includes(area)) {
        setSecondaryAreas([...secondaryAreas, area]);
      }
    }
  };

  const addCustomArea = () => {
    if (customArea.trim() && !EXPERTISE_AREAS.includes(customArea) && 
        !primaryAreas.includes(customArea) && !secondaryAreas.includes(customArea)) {
      setPrimaryAreas([...primaryAreas, customArea]);
      setCustomArea('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isValid) {
      updateFormData({
        primary_expertise_areas: primaryAreas,
        secondary_expertise_areas: secondaryAreas.length > 0 ? secondaryAreas : undefined
      });
      goToNextStep();
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Areas of Expertise</h3>
      <p className="text-gray-600 mb-6">
        Select the areas where you have deep expertise and can provide valuable guidance to others.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Expertise Areas <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">
            These are your core strengths where you have the deepest knowledge and experience.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {EXPERTISE_AREAS.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => handlePrimaryAreaToggle(area)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  primaryAreas.includes(area)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {area}
              </button>
            ))}
          </div>

          <div className="flex mb-4">
            <input
              type="text"
              value={customArea}
              onChange={(e) => setCustomArea(e.target.value)}
              placeholder="Add custom expertise area"
              className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={addCustomArea}
              disabled={!customArea.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
            >
              Add
            </button>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Expertise Areas
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Areas where you have good knowledge but may not be your primary focus.
          </p>
          
          <div className="flex flex-wrap gap-2">
            {EXPERTISE_AREAS.map((area) => (
              <button
                key={`secondary-${area}`}
                type="button"
                onClick={() => handleSecondaryAreaToggle(area)}
                disabled={primaryAreas.includes(area)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  secondaryAreas.includes(area)
                    ? 'bg-indigo-100 text-indigo-800'
                    : primaryAreas.includes(area)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={goToPreviousStep}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
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
      </form>
    </div>
  );
};

export default ExpertiseAreasStep;
