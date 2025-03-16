import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../lib/services/auth.service';
import { useAuthStore } from '../../lib/store';

interface SignOutButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'text';
}

const SignOutButton: React.FC<SignOutButtonProps> = ({ 
  className = '', 
  variant = 'text' 
}) => {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();
  
  const handleSignOut = async () => {
    try {
      await authService.signOut();
      clearAuth();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const buttonClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    text: 'text-gray-600 hover:text-gray-900'
  };

  return (
    <button 
      onClick={handleSignOut}
      className={`px-4 py-2 rounded-md transition ${buttonClasses[variant]} ${className}`}
    >
      Sign Out
    </button>
  );
};

export default SignOutButton;
