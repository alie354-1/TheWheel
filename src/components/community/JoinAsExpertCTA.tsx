import React, { useState } from 'react';
import { useAuth } from '../../lib/hooks/useAuth';
import ExpertSignUpModal from './ExpertSignUpModal';
import ExpertProfileWizard from './ExpertProfileWizard';

interface JoinAsExpertCTAProps {
  variant?: 'button' | 'banner';
  className?: string;
}

/**
 * Call-to-action component for users to join as experts
 * Supports both existing users and new signups
 */
const JoinAsExpertCTA: React.FC<JoinAsExpertCTAProps> = ({ 
  variant = 'button',
  className = ''
}) => {
  const { user, isAuthenticated } = useAuth();
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showProfileWizard, setShowProfileWizard] = useState(false);

  const handleClick = () => {
    if (isAuthenticated) {
      // Existing user - show profile wizard directly
      setShowProfileWizard(true);
    } else {
      // New user - show signup modal first
      setShowSignUpModal(true);
    }
  };

  // Handle successful signup from modal
  const handleSignUpSuccess = () => {
    setShowSignUpModal(false);
    setShowProfileWizard(true);
  };

  // Handle wizard completion
  const handleWizardComplete = () => {
    setShowProfileWizard(false);
    // Could redirect to expert dashboard or profile page
  };

  // Render button or banner based on variant prop
  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-6 shadow-md ${className}`}>
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0 md:mr-6">
            <h3 className="text-xl font-bold mb-2">Share Your Expertise</h3>
            <p className="text-blue-100">Join our expert network and help others succeed in their journey</p>
          </div>
          <button
            onClick={handleClick}
            className="bg-white text-blue-700 hover:bg-blue-50 font-medium py-2 px-6 rounded-md shadow-sm transition-colors"
          >
            {isAuthenticated ? 'Become an Expert' : 'Join as Expert'}
          </button>
        </div>

        {/* Modals */}
        {showSignUpModal && (
          <ExpertSignUpModal 
            isOpen={showSignUpModal}
            onClose={() => setShowSignUpModal(false)}
            onSuccess={handleSignUpSuccess}
          />
        )}
        
        {showProfileWizard && (
          <ExpertProfileWizard
            isOpen={showProfileWizard}
            onClose={() => setShowProfileWizard(false)}
            onComplete={handleWizardComplete}
            userId={user?.id}
          />
        )}
      </div>
    );
  }

  // Default button variant
  return (
    <>
      <button
        onClick={handleClick}
        className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors ${className}`}
      >
        {isAuthenticated ? 'Become an Expert' : 'Join as Expert'}
      </button>

      {/* Modals */}
      {showSignUpModal && (
        <ExpertSignUpModal 
          isOpen={showSignUpModal}
          onClose={() => setShowSignUpModal(false)}
          onSuccess={handleSignUpSuccess}
        />
      )}
      
      {showProfileWizard && (
        <ExpertProfileWizard
          isOpen={showProfileWizard}
          onClose={() => setShowProfileWizard(false)}
          onComplete={handleWizardComplete}
          userId={user?.id}
        />
      )}
    </>
  );
};

export default JoinAsExpertCTA;
