import React, { useState, useEffect } from 'react';
import { UserLearningProfile } from '../../lib/types/profile.types.ts';
import { getUserLearningProfile } from '../../lib/services/learningProfile.service.ts';
import { useAuthStore } from '../../lib/store.ts'; // To get current user ID
import LearningProfileEditor from "./LearningProfileEditor.tsx";

interface LearningProfileDisplayProps {
  userId: string; // Explicitly require userId
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

/**
 * Component to display the user's learning profile information.
 */
const LearningProfileDisplay: React.FC<LearningProfileDisplayProps> = ({ userId }) => {
  const [profile, setProfile] = useState<UserLearningProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

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
        setProfile(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch learning profile.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!profile) {
    return (
      <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Learning Profile</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">No learning profile data found. Preferences can be set or inferred over time.</p>
        <button
          className="btn btn-sm btn-primary mt-2"
          onClick={() => setEditing(true)}
        >
          Set Preferences
        </button>
        {editing && (
          <div className="mt-4">
            <LearningProfileEditor
              userId={userId}
              onSave={() => setEditing(false)}
              onCancel={() => setEditing(false)}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 border rounded bg-white dark:bg-gray-800 shadow-sm">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Learning Profile</h3>
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium text-gray-600 dark:text-gray-400">Preferred Style: </span>
          <span className="text-gray-800 dark:text-gray-200">{profile.learning_style_preference || 'Not set'}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600 dark:text-gray-400">Preferred Content: </span>
          <span className="text-gray-800 dark:text-gray-200">{profile.preferred_content_types?.join(', ') || 'Not set'}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600 dark:text-gray-400">Pace Preference: </span>
          <span className="text-gray-800 dark:text-gray-200">{profile.pace_preference ? `${profile.pace_preference}/5` : 'Not set'}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600 dark:text-gray-400">Engagement Level: </span>
          <span className="text-gray-800 dark:text-gray-200">{profile.engagement_level?.toFixed(2) || 'Not calculated'}</span>
        </div>
        {/* Consider how to display skill_gaps and preferences_payload if needed */}
      </div>
      <button
        className="btn btn-sm btn-primary mt-4"
        onClick={() => setEditing(true)}
      >
        Edit Preferences
      </button>
      {editing && (
        <div className="mt-4">
          <LearningProfileEditor
            userId={userId}
            onSave={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}
    </div>
  );
};

// Example of how to use it on a profile page (assuming useAuthStore provides the user id)
/*
const UserProfilePage: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  if (!user) return <div>Please log in.</div>;

  return (
    <div>
      <h1>Your Profile</h1>
      { // Other profile sections }
      <LearningProfileDisplay userId={user.id} />
    </div>
  );
};
*/

export default LearningProfileDisplay;
