import React from 'react';
import { Clock, Check, PlayCircle, SkipForward } from 'lucide-react';
import { StepCardProps, StepStatus } from './StepCardProps';
import { Term } from '../../../terminology/Term';

export const StepCard: React.FC<StepCardProps> = ({
  step,
  status = 'not_started',
  selected = false,
  mode = 'standard',
  onClick,
  onStatusChange,
  className = '',
}) => {
  // Get appropriate status icon and color
  const getStatusDisplay = (status: StepStatus) => {
    switch (status) {
      case 'completed':
        return { icon: <Check className="h-4 w-4" />, color: 'text-green-600 bg-green-50' };
      case 'in_progress':
        return { icon: <PlayCircle className="h-4 w-4" />, color: 'text-blue-600 bg-blue-50' };
      case 'skipped':
        return { icon: <SkipForward className="h-4 w-4" />, color: 'text-gray-500 bg-gray-50' };
      default:
        return { icon: <Clock className="h-4 w-4" />, color: 'text-gray-500 bg-gray-50' };
    }
  };

  const { icon, color } = getStatusDisplay(status);
  
  // Determine card size based on mode
  const cardSize = mode === 'compact' 
    ? 'w-48 h-32'
    : mode === 'detailed'
      ? 'w-full'
      : 'w-64 h-48';

  return (
    <div
      className={`step-card ${cardSize} ${color} p-4 rounded-lg shadow-sm transition-all duration-200 cursor-pointer ${
        selected ? 'ring-2 ring-blue-500 shadow-md' : ''
      } ${className}`}
      onClick={() => onClick && onClick(step)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <span className="rounded-full p-1 mr-2 bg-white">{icon}</span>
          <span className="text-sm font-medium capitalize">{status.replace('_', ' ')}</span>
        </div>
        
        {/* Only show status change actions if onStatusChange provided */}
        {onStatusChange && (
          <div className="flex space-x-1">
            {status !== 'completed' && (
              <button
                className="text-green-600 hover:bg-green-100 p-1 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange('completed');
                }}
                title="Mark as completed"
              >
                <Check className="h-3 w-3" />
              </button>
            )}
            {status !== 'in_progress' && status !== 'completed' && (
              <button
                className="text-blue-600 hover:bg-blue-100 p-1 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange('in_progress');
                }}
                title="Mark as in progress"
              >
                <PlayCircle className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>
      
      <h3 className="font-semibold text-gray-800 mb-1">{step.name}</h3>
      
      {mode !== 'compact' && step.description && (
        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
          {step.description}
        </p>
      )}
      
      <div className="flex items-center text-xs text-gray-500 mt-auto">
        <span className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {step.estimated_time_min}-{step.estimated_time_max} 
          <Term keyPath="journeyTerms.time.hours" fallback="hours" />
        </span>
      </div>
    </div>
  );
};

export default StepCard;
