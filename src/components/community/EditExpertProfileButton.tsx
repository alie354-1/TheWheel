import React, { useState } from 'react';
import { useAuth } from '../../lib/hooks/useAuth';
import ExpertProfileWizard from './ExpertProfileWizard';

interface EditExpertProfileButtonProps {
  variant?: 'button' | 'link';
  className?: string;
}

/**
 * Button component that allows experts to edit their profile
 * Opens the ExpertProfileWizard with the user's existing profile data
 */
const EditExpertProfileButton: React.FC<EditExpertProfileButtonProps> = ({
  variant = 'button',
  className = ''
}) => {
  const { user } = useAuth();
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const openWizard = () => {
    setIsWizardOpen(true);
  };

  const closeWizard = () => {
    setIsWizardOpen(false);
  };

  const handleComplete = () => {
    setIsWizardOpen(false);
    // Optionally refresh the page or update the UI
    window.location.reload();
  };

  if (!user) {
    return null;
  }

  return (
    <>
      {variant === 'button' ? (
        <button
          onClick={openWizard}
          className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium ${className}`}
        >
          Edit Expert Profile
        </button>
      ) : (
        <button
          onClick={openWizard}
          className={`text-blue-600 hover:text-blue-800 font-medium ${className}`}
        >
          Edit Expert Profile
        </button>
      )}

      <ExpertProfileWizard
        isOpen={isWizardOpen}
        onClose={closeWizard}
        onComplete={handleComplete}
        userId={user.id}
      />
    </>
  );
};

export default EditExpertProfileButton;
