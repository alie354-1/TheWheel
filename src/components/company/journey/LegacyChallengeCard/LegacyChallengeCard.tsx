import React from 'react';
import { Link } from 'react-router-dom';
import { JourneyChallenge, challenge_status } from '../../../../lib/types/journey-challenges.types';
import { StatusBadge, DifficultyIndicator, EstimatedTime } from './';
import { ArrowRight, ChevronRight } from 'lucide-react';

interface ChallengeCardProps {
  challenge: JourneyChallenge;
  status?: challenge_status;
  phase?: { name: string; color?: string };
  compact?: boolean;
  showPhase?: boolean;
  onClick?: () => void;
  onStartClick?: () => void;
  onCustomizeClick?: () => void;
  onMarkIrrelevantClick?: () => void;
}

/**
 * ChallengeCard component
 * 
 * A card-based UI for displaying journey challenges with consistent styling
 */
export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  status = 'not_started',
  phase,
  compact = false,
  showPhase = false,
  onClick,
  onStartClick,
  onCustomizeClick,
  onMarkIrrelevantClick
}) => {
  // Build the phase badge color based on the phase color or default
  const getPhaseColor = () => {
    if (!phase?.color) return 'bg-gray-100 text-gray-800';
    
    // Convert hex to a lighter background version
    const baseColor = phase.color.replace('#', '');
    return `bg-${baseColor}/10 text-${baseColor}`;
  };
  
  // Create a truncated description for compact mode
  const truncateDescription = (text?: string, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + '...';
  };
  
  // For handling the click - either use the onClick handler or navigate via Link
  const handleClick = () => {
    if (onClick) onClick();
  };
  
  // Generate the challenge URL
  const challengeUrl = `/company/journey/challenge/${challenge.id}`;
  
  // Render in compact mode for list views or dashboard widgets
  if (compact) {
    return (
      <Link 
        to={challengeUrl} 
        className="block mb-3 hover:no-underline"
        onClick={onClick ? handleClick : undefined}
      >
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-shadow duration-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-1">
                {challenge.name}
              </h3>
              <div className="flex gap-2 mb-2">
                <StatusBadge status={status} />
                <DifficultyIndicator level={challenge.difficulty_level} />
              </div>
            </div>
            <div className="text-gray-400">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
          
          {showPhase && phase && (
            <div className="mt-2">
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${getPhaseColor()}`}>
                {phase.name}
              </span>
            </div>
          )}
        </div>
      </Link>
    );
  }
  
  // Full card view for main listings or featured challenges
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full">
      {/* Card header - status and difficulty */}
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <StatusBadge status={status} />
        <DifficultyIndicator level={challenge.difficulty_level} />
      </div>
      
      {/* Card body - main content */}
      <div className="p-4 flex-grow">
        {showPhase && phase && (
          <div className="mb-2">
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getPhaseColor()}`}>
              {phase.name}
            </span>
          </div>
        )}
        
        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
          {challenge.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {truncateDescription(challenge.description)}
        </p>
        
        <div className="mt-2 text-sm text-gray-500">
          <EstimatedTime 
            minMinutes={challenge.estimated_time_min} 
            maxMinutes={challenge.estimated_time_max} 
          />
        </div>
      </div>
      
      {/* Card footer - action area */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        {/* Primary action button */}
        {onStartClick ? (
          <button 
            className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={onStartClick}
          >
            {status === 'completed' ? 'View Details' : 'Start Challenge'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        ) : (
          <Link 
            to={challengeUrl}
            className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={onClick ? handleClick : undefined}
          >
            {status === 'completed' ? 'View Details' : 'Start Challenge'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        )}
        
        {/* Secondary actions */}
        <div className="flex justify-between">
          {onCustomizeClick && (
            <button 
              onClick={onCustomizeClick}
              className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
            >
              Customize
            </button>
          )}
          
          {onMarkIrrelevantClick && (
            <button 
              onClick={onMarkIrrelevantClick}
              className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
            >
              Mark Irrelevant
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;
