import React, { useState, useEffect, useCallback } from 'react';
import { UserLearningProfile } from '../../lib/types/profile.types';
import { getUserLearningProfile, upsertUserLearningProfile } from '../../lib/services/learningProfile.service';
import { Save } from 'lucide-react';

interface LearningProfileEditorProps {
  userId: string;
  onSave?: (profile: UserLearningProfile) => void; // Optional callback after saving
  onCancel?: () => void; // Optional callback for cancellation
}

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div className="p-4 border rounded bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-700 dark:text-red-200">
    <p><strong>Error:</strong> {message}</p>
  </div>
);

// Define available options
const learningStyles = ['visual', 'auditory', 'kinesthetic', 'reading/writing', 'multimodal'];
const contentTypes = ['video', 'article', 'interactive_tutorial', 'podcast', 'webinar', 'case_study'];
const paceOptions = [
  { value: 1, label: 'Slowest' },
  { value: 2, label: 'Slow' },
  { value: 3, label: 'Moderate' },
  { value: 4, label: 'Fast' },
  { value: 5, label: 'Fastest' },
];

/**
 * Component to edit the user's learning profile information.
 */
const LearningProfileEditor: React.FC<LearningProfileEditorProps> = ({ userId, onSave, onCancel }) => {
  const [profileData, setProfileData] = useState<Partial<UserLearningProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError('User ID is required.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await getUserLearningProfile(userId);
        setProfileData(data || { user_id: userId }); // Initialize if no profile exists
      } catch (err: any) {
        setError(err.message || 'Failed to fetch learning profile.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value === '' ? null : value }));
  }, []);

  const handlePaceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value === '' ? null : parseInt(value, 10) }));
  }, []);

  const handleContentTypeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setProfileData(prev => {
      const currentTypes = prev.preferred_content_types || [];
      if (checked) {
        return { ...prev, preferred_content_types: [...currentTypes, value] };
      } else {
        return { ...prev, preferred_content_types: currentTypes.filter(type => type !== value) };
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      // Prepare data for upsert (remove fields managed by DB)
      const { user_id, created_at, updated_at, ...updateData } = profileData;
      const savedProfile = await upsertUserLearningProfile(userId, updateData);
      if (savedProfile) {
        setProfileData(savedProfile); // Update local state with saved data (includes updated_at)
        onSave?.(savedProfile); // Trigger callback
        // Optionally show success message
      } else {
        throw new Error('Failed to save learning profile.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during save.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error && !isSaving) return <ErrorDisplay message={error} />; // Don't show fetch error if saving error occurs

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded bg-white dark:bg-gray-800 shadow-sm space-y-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Edit Learning Preferences</h3>

      {/* Learning Style */}
      <div>
        <label htmlFor="learning_style_preference" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Preferred Learning Style
        </label>
        <select
          id="learning_style_preference"
          name="learning_style_preference"
          value={profileData.learning_style_preference || ''}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select a style (Optional)</option>
          {learningStyles.map(style => (
            <option key={style} value={style}>{style.charAt(0).toUpperCase() + style.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Preferred Content Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Preferred Content Types
        </label>
        <div className="mt-2 space-y-2 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-x-4">
          {contentTypes.map(type => (
            <div key={type} className="flex items-center">
              <input
                id={`content_type_${type}`}
                name="preferred_content_types"
                type="checkbox"
                value={type}
                checked={profileData.preferred_content_types?.includes(type) || false}
                onChange={handleContentTypeChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor={`content_type_${type}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </label>
            </div>
          ))}
        </div>
      </div>

       {/* Pace Preference */}
      <div>
        <label htmlFor="pace_preference" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Preferred Learning Pace
        </label>
        <select
          id="pace_preference"
          name="pace_preference"
          value={profileData.pace_preference ?? ''}
          onChange={handlePaceChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select a pace (Optional)</option>
          {paceOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Save/Cancel Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
         {error && isSaving && <p className="text-sm text-red-600 dark:text-red-400">Error: {error}</p>}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving || isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </form>
  );
};

export default LearningProfileEditor;
