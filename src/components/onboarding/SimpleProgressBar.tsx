import React from 'react';

interface SimpleProgressBarProps {
  progress: number; // Progress percentage 0-100
  height?: number; // Height in pixels
  color?: string; // Tailwind color class
  backgroundColor?: string; // Tailwind background color
}

export const SimpleProgressBar: React.FC<SimpleProgressBarProps> = ({
  progress,
  height = 4,
  color = 'bg-primary',
  backgroundColor = 'bg-base-300'
}) => {
  // Ensure progress is between 0 and 100
  const safeProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <div 
      className={`w-full rounded-full overflow-hidden ${backgroundColor}`}
      style={{ height: `${height}px` }}
    >
      <div 
        className={`h-full ${color} transition-all duration-300 ease-in-out`}
        style={{ width: `${safeProgress}%` }}
      />
    </div>
  );
};
