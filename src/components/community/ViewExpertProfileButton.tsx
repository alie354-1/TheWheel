import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/hooks/useAuth';
import { expertService } from '../../lib/services/expert.service';
import ExpertProfilePreview from './ExpertProfilePreview';
import { ExpertProfile } from '../../lib/types/community.types';

interface ViewExpertProfileButtonProps {
  variant?: 'button' | 'link';
  className?: string;
}

/**
 * Button component that allows experts to view their profile as it appears to others
 * Opens the ExpertProfilePreview with the user's existing profile data
 */
const ViewExpertProfileButton: React.FC<ViewExpertProfileButtonProps> = ({
  variant = 'button',
  className = ''
}) => {
  const { user, profile } = useAuth();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [expertProfile, setExpertProfile] = useState<Partial<ExpertProfile> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If the preview is opened, fetch the expert profile
    if (isPreviewOpen && user) {
      fetchExpertProfile();
    }
  }, [isPreviewOpen, user]);

  const fetchExpertProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const expertData = await expertService.getExpertProfile(user.id);
      if (expertData) {
        // Add user name and avatar from the main profile
        setExpertProfile({
          ...expertData,
          user_name: profile?.full_name || 'Your Name',
          user_avatar_url: profile?.avatar_url || ''
        });
      }
    } catch (err) {
      console.error('Error fetching expert profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const openPreview = () => {
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
  };

  if (!user) {
    return null;
  }

  return (
    <>
      {variant === 'button' ? (
        <button
          onClick={openPreview}
          className={`px-4 py-2 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-md font-medium ${className}`}
        >
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Profile
          </span>
        </button>
      ) : (
        <button
          onClick={openPreview}
          className={`text-blue-600 hover:text-blue-800 font-medium flex items-center ${className}`}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View Profile
        </button>
      )}

      {isPreviewOpen && expertProfile && (
        <ExpertProfilePreview 
          profile={expertProfile}
          onClose={closePreview}
        />
      )}

      {isPreviewOpen && loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-700">Loading your expert profile...</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewExpertProfileButton;
