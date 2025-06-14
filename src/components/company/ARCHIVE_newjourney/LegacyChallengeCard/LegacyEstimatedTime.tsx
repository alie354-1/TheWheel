import React from 'react';
import { Clock } from 'lucide-react';

interface EstimatedTimeProps {
  minMinutes: number;
  maxMinutes: number;
}

/**
 * EstimatedTime component
 * 
 * Displays the estimated time range for completing a challenge
 */
export const EstimatedTime: React.FC<EstimatedTimeProps> = ({ minMinutes, maxMinutes }) => {
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      
      if (mins === 0) {
        return `${hours} hr${hours > 1 ? 's' : ''}`;
      } else {
        return `${hours} hr${hours > 1 ? 's' : ''} ${mins} min`;
      }
    }
  };
  
  // If min and max are the same, just show one value
  if (minMinutes === maxMinutes) {
    return (
      <div className="inline-flex items-center text-gray-600 text-sm">
        <Clock className="h-4 w-4 mr-1" />
        <span>{formatTime(minMinutes)}</span>
      </div>
    );
  }
  
  return (
    <div className="inline-flex items-center text-gray-600 text-sm">
      <Clock className="h-4 w-4 mr-1" />
      <span>{formatTime(minMinutes)} - {formatTime(maxMinutes)}</span>
    </div>
  );
};
