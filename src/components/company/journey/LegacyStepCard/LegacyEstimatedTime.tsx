import React from 'react';
import { Clock } from 'lucide-react';

interface EstimatedTimeProps {
  min: number;
  max: number;
  className?: string;
}

/**
 * EstimatedTime component
 * 
 * Shows the estimated time range to complete a journey step.
 * Formats the time in a user-friendly way (minutes, hours, or days).
 */
const EstimatedTime: React.FC<EstimatedTimeProps> = ({ min, max, className = '' }) => {
  // Format time in minutes, hours, or days based on duration
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else if (minutes < 24 * 60) {
      const hours = Math.round(minutes / 60 * 10) / 10;
      return `${hours}h`;
    } else {
      const days = Math.round(minutes / (24 * 60) * 10) / 10;
      return `${days}d`;
    }
  };
  
  // Format the range
  const formatTimeRange = (): string => {
    const formattedMin = formatTime(min);
    const formattedMax = formatTime(max);
    
    if (formattedMin === formattedMax) {
      return formattedMin;
    }
    
    return `${formattedMin}-${formattedMax}`;
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      <Clock size={14} className="mr-1" />
      <span className="text-xs">Est. time: {formatTimeRange()}</span>
    </div>
  );
};

export default EstimatedTime;
