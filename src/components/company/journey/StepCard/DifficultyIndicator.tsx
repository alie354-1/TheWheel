import React from 'react';
import { difficulty_level } from '../../../../lib/types/journey-steps.types';

interface DifficultyIndicatorProps {
  level: difficulty_level | number;
  className?: string;
}

/**
 * DifficultyIndicator component
 * 
 * Visual indicator showing the difficulty level of a journey step.
 * Displays 1-5 dots depending on the difficulty level.
 */
const DifficultyIndicator: React.FC<DifficultyIndicatorProps> = ({ level, className = '' }) => {
  // Ensure level is within 1-5 range
  const safeLevel = Math.min(5, Math.max(1, level)) as difficulty_level;
  
  // Labels for difficulty levels
  const difficultyLabels: Record<difficulty_level, string> = {
    1: 'Very Easy',
    2: 'Easy',
    3: 'Moderate',
    4: 'Hard',
    5: 'Very Hard'
  };
  
  // Render dots based on difficulty level
  const renderDots = () => {
    const dots = [];
    for (let i = 1; i <= 5; i++) {
      dots.push(
        <span 
          key={i}
          className={`
            inline-block w-2 h-2 rounded-full mx-0.5 
            ${i <= safeLevel ? 'bg-gray-600' : 'bg-gray-200'}
          `}
          aria-hidden="true"
        />
      );
    }
    return dots;
  };
  
  return (
    <div className={`flex items-center ${className}`} title={`Difficulty: ${difficultyLabels[safeLevel]}`}>
      <span className="text-xs mr-1">Difficulty:</span>
      <div className="flex">
        {renderDots()}
      </div>
    </div>
  );
};

export default DifficultyIndicator;
