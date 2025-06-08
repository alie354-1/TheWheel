import React, { useState, useEffect } from 'react';
import { ExpertProfile } from '../../../lib/types/community.types';

interface MentorshipStepProps {
  formData: Partial<ExpertProfile>;
  updateFormData: (data: Partial<ExpertProfile>) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

/**
 * Fifth step of the expert profile wizard
 * Collects mentorship preferences and availability
 */
const MentorshipStep: React.FC<MentorshipStepProps> = ({
  formData,
  updateFormData,
  goToNextStep,
  goToPreviousStep
}) => {
  // Initialize mentorship capacity
  const [mentorshipCapacity, setMentorshipCapacity] = useState<number>(
    formData.mentorship_capacity || 0
  );
  
  // Initialize timezone
  const [timezone, setTimezone] = useState<string>(
    formData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  
  // Initialize languages
  const [languages, setLanguages] = useState<string[]>(
    formData.languages_spoken || ['English']
  );
  
  // Current language being added
  const [newLanguage, setNewLanguage] = useState('');
  
  // Form validation
  const [isValid, setIsValid] = useState(true);
  
  // Common timezones
  const COMMON_TIMEZONES = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Singapore',
    'Australia/Sydney',
    'Pacific/Auckland'
  ];

  // Add a new language
  const addLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      setLanguages([...languages, newLanguage.trim()]);
      setNewLanguage('');
    }
  };

  // Remove a language
  const removeLanguage = (language: string) => {
    setLanguages(languages.filter(lang => lang !== language));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateFormData({
      mentorship_capacity: mentorshipCapacity,
      timezone,
      languages_spoken: languages.length > 0 ? languages : undefined
    });
    
    goToNextStep();
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Mentorship Preferences</h3>
      <p className="text-gray-600 mb-6">
        Set your mentorship availability and preferences to help us match you with the right mentees.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Mentorship Capacity */}
        <div className="mb-6">
          <label htmlFor="mentorship-capacity" className="block text-sm font-medium text-gray-700 mb-1">
            Mentorship Capacity
          </label>
          <p className="text-xs text-gray-500 mb-3">
            How many mentees can you support at one time?
          </p>
          
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setMentorshipCapacity(0)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                mentorshipCapacity === 0
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Not Available
            </button>
            {[1, 2, 3, 5, 10].map((capacity) => (
              <button
                key={capacity}
                type="button"
                onClick={() => setMentorshipCapacity(capacity)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  mentorshipCapacity === capacity
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {capacity}
              </button>
            ))}
          </div>
          
          {mentorshipCapacity > 0 && (
            <p className="text-sm text-green-600 mt-2">
              You're willing to mentor up to {mentorshipCapacity} {mentorshipCapacity === 1 ? 'person' : 'people'} at a time.
            </p>
          )}
          
          {mentorshipCapacity === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              You're not currently available for mentorship. You can change this later.
            </p>
          )}
        </div>

        {/* Timezone */}
        <div className="mb-6">
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
            Your Timezone
          </label>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a timezone</option>
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Languages */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Languages Spoken
          </label>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {languages.map((language) => (
              <div 
                key={language}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center"
              >
                {language}
                <button
                  type="button"
                  onClick={() => removeLanguage(language)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex">
            <input
              type="text"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="Add a language..."
              className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={addLanguage}
              disabled={!newLanguage.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
            >
              Add
            </button>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-8">
          <h4 className="text-md font-medium text-yellow-800 mb-2">What to Expect as a Mentor</h4>
          <p className="text-sm text-yellow-700 mb-2">
            As a mentor, you'll be able to:
          </p>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc pl-5">
            <li>Receive mentorship requests from community members</li>
            <li>Schedule 1:1 sessions with mentees</li>
            <li>Provide guidance on specific challenges</li>
            <li>Build your reputation through mentee feedback</li>
          </ul>
          <p className="text-sm text-yellow-700 mt-2">
            You can adjust your mentorship capacity at any time from your expert profile.
          </p>
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
            className="px-6 py-2 rounded-md font-medium bg-blue-600 hover:bg-blue-700 text-white"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default MentorshipStep;
