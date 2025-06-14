import React from 'react';
import { difficulty_level } from '../../../../lib/types/journey-challenges.types';

interface DifficultyIndicatorProps {
  level: difficulty_level;
}

/**
 * DifficultyIndicator component
 * 
 * Displays a visual indicator for a challenge's difficulty level
 */
export const DifficultyIndicator: React.FC<DifficultyIndicatorProps> = ({ level }) => {
  const getDifficultyText = () => {
    switch (level) {
      case 1:
        return 'Easy';
      case 2:
        return 'Moderate';
      case 3:
        return 'Standard';
      case 4:
        return 'Advanced';
      case 5:
        return 'Expert';
      default:
        return 'Standard';
    }
  };
  
  const renderDots = () => {
    const dots = [];
    
    for (let i = 1; i <= 5; i++) {
      const isActive = i <= level;
      dots.push(
        <span 
          key={i}
          className={`inline-block w-2 h-2 rounded-full mx-0.5 ${
            isActive ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        />
      );
    }
    
    return dots;
  };
  
  return (
    <div className="inline-flex items-center space-x-1">
      <div className="flex">{renderDots()}</div>
      <span className="text-xs text-gray-600 ml-1">{getDifficultyText()}</span>
    </div>
  );
};
