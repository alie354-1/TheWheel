import React from 'react';
import { step_status } from '../../../../lib/types/journey-steps.types';

interface StatusBadgeProps {
  status: step_status;
  className?: string;
}

/**
 * StatusBadge component
 * 
 * Displays a status badge for journey steps with appropriate styling based on status.
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  let bgColor = '';
  let textColor = '';
  let label = '';
  
  switch (status) {
    case 'not_started':
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-600';
      label = 'Not Started';
      break;
    case 'in_progress':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-700';
      label = 'In Progress';
      break;
    case 'completed':
      bgColor = 'bg-green-100';
      textColor = 'text-green-700';
      label = 'Completed';
      break;
    case 'skipped':
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-700';
      label = 'Skipped';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-600';
      label = 'Unknown';
  }
  
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor} ${className}`}
      data-testid={`status-badge-${status}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
