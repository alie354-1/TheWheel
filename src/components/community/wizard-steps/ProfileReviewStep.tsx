import React, { useState } from 'react';
import { ExpertProfile, StartupStage } from '../../../lib/types/community.types';
import ExpertProfilePreview from '../ExpertProfilePreview';

interface ProfileReviewStepProps {
  formData: Partial<ExpertProfile>;
  updateFormData: (data: Partial<ExpertProfile>) => void;
  goToPreviousStep: () => void;
  submitProfile: () => void;
  loading: boolean;
}

// Helper function to format stage for display
const formatStage = (stage: StartupStage): string => {
  switch (stage) {
    case 'pre_seed': return 'Pre-Seed';
    case 'seed': return 'Seed';
    case 'series_a': return 'Series A';
    case 'series_b': return 'Series B';
    case 'series_c_plus': return 'Series C+';
    case 'growth': return 'Growth';
    case 'exit': return 'Exit (IPO/Acquisition)';
    default: return stage;
  }
};

/**
 * Final step of the expert profile wizard
 * Shows a summary of the profile for review before submission
 */
const ProfileReviewStep: React.FC<ProfileReviewStepProps> = ({
  formData,
  updateFormData,
  goToPreviousStep,
  submitProfile,
  loading
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Review Your Expert Profile</h3>
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Please review your expert profile information before submitting. You can go back to make changes if needed.
        </p>
        <button
          type="button"
          onClick={() => setIsPreviewOpen(true)}
          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md font-medium hover:bg-blue-100 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview Profile
        </button>
      </div>

      {isPreviewOpen && (
        <ExpertProfilePreview 
          profile={{
            ...formData,
            user_name: 'Your Name', // This would be replaced with actual user data in production
            user_avatar_url: '', // This would be replaced with actual user data in production
          }} 
          onClose={() => setIsPreviewOpen(false)} 
        />
      )}

      <div className="space-y-6 mb-8">
        {/* Expertise Areas */}
        <div className="border border-gray-200 rounded-md p-4">
          <h4 className="text-md font-medium text-gray-800 mb-2">Areas of Expertise</h4>
          
          {formData.primary_expertise_areas && formData.primary_expertise_areas.length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-gray-700 mb-1">Primary Expertise:</h5>
              <div className="flex flex-wrap gap-2">
                {formData.primary_expertise_areas.map((area) => (
                  <span 
                    key={area}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {formData.secondary_expertise_areas && formData.secondary_expertise_areas.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Secondary Expertise:</h5>
              <div className="flex flex-wrap gap-2">
                {formData.secondary_expertise_areas.map((area) => (
                  <span 
                    key={area}
                    className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Experience */}
        <div className="border border-gray-200 rounded-md p-4">
          <h4 className="text-md font-medium text-gray-800 mb-2">Experience</h4>
          
          {/* Industry Experience */}
          {formData.industry_experience && Object.keys(formData.industry_experience).length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-gray-700 mb-1">Industry Experience:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(formData.industry_experience).map(([industry, data]) => (
                  <div key={industry} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                    <span className="text-gray-800">{industry}</span>
                    <span className="text-gray-600 text-sm">{data.years} {data.years === 1 ? 'year' : 'years'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Functional Experience */}
          {formData.functional_experience && Object.keys(formData.functional_experience).length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-gray-700 mb-1">Functional Experience:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(formData.functional_experience).map(([area, data]) => (
                  <div key={area} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                    <span className="text-gray-800">{area}</span>
                    <span className="text-gray-600 text-sm">{data.years} {data.years === 1 ? 'year' : 'years'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Company Stages */}
          {formData.company_stages_experienced && formData.company_stages_experienced.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Company Stages:</h5>
              <div className="flex flex-wrap gap-2">
                {formData.company_stages_experienced.map((stage) => (
                  <span 
                    key={stage}
                    className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {formatStage(stage)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Success Stories */}
        {formData.success_stories && formData.success_stories.length > 0 && (
          <div className="border border-gray-200 rounded-md p-4">
            <h4 className="text-md font-medium text-gray-800 mb-2">Success Stories</h4>
            <div className="space-y-3">
              {formData.success_stories.map((story, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md">
                  <p className="text-gray-700">{story}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mentorship Preferences */}
        <div className="border border-gray-200 rounded-md p-4">
          <h4 className="text-md font-medium text-gray-800 mb-2">Mentorship Preferences</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Mentorship Capacity:</h5>
              <p className="text-gray-800">
                {formData.mentorship_capacity === 0 
                  ? 'Not currently available for mentorship' 
                  : `Up to ${formData.mentorship_capacity} ${formData.mentorship_capacity === 1 ? 'mentee' : 'mentees'}`
                }
              </p>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Timezone:</h5>
              <p className="text-gray-800">{formData.timezone || 'Not specified'}</p>
            </div>
          </div>
          
          {formData.languages_spoken && formData.languages_spoken.length > 0 && (
            <div className="mt-3">
              <h5 className="text-sm font-medium text-gray-700 mb-1">Languages Spoken:</h5>
              <div className="flex flex-wrap gap-2">
                {formData.languages_spoken.map((language) => (
                  <span 
                    key={language}
                    className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="mb-8">
        <div className="flex items-start mb-4">
          <div className="flex items-center h-5">
            <input
              id="terms"
              type="checkbox"
              checked={true}
              readOnly
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="font-medium text-gray-700">
              I agree to the Expert Community Guidelines
            </label>
            <p className="text-gray-500">
              By submitting this profile, you agree to our expert community guidelines and code of conduct.
            </p>
          </div>
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
          type="button"
          onClick={submitProfile}
          disabled={loading}
          className="px-6 py-2 rounded-md font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Expert Profile'
          )}
        </button>
      </div>
    </div>
  );
};

export default ProfileReviewStep;
