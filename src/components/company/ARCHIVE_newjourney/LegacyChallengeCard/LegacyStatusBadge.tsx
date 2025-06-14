import React from 'react';
import { challenge_status } from '../../../../lib/types/journey-challenges.types';

interface StatusBadgeProps {
  status: challenge_status;
}

/**
 * StatusBadge component
 * 
 * Displays a visual indicator for a challenge's status
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'skipped':
        return 'bg-gray-100 text-gray-800';
      case 'not_started':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'skipped':
        return 'Skipped';
      case 'not_started':
      default:
        return 'Not Started';
    }
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${getStatusStyles()}`}>
      {getStatusText()}
    </span>
  );
};
