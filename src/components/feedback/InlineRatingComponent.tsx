import React, { useState } from 'react';
import { feedbackService } from '@/lib/services/feedback.service';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCompany } from '@/lib/hooks/useCompany';

interface RatingProps {
  entityId: string;
  entityType: 'step' | 'tool' | 'resource';
  ratingType: 'clarity' | 'difficulty' | 'usefulness' | 'overall' | 'easeOfUse' | 'functionality' | 'value';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  labels?: string[];
  defaultValue?: number;
  onRatingSubmit?: (value: number) => void;
  className?: string;
}

/**
 * InlineRatingComponent
 * 
 * A reusable component for collecting user ratings.
 * Part of the Sprint 4 User Feedback Collection System.
 */
export const InlineRatingComponent: React.FC<RatingProps> = ({
  entityId,
  entityType,
  ratingType,
  size = 'md',
  showLabels = true,
  labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
  defaultValue = 0,
  onRatingSubmit,
  className = ''
}) => {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const [rating, setRating] = useState<number>(defaultValue);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Determine star size based on the size prop
  const getStarSize = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-8 h-8';
      default: return 'w-6 h-6';
    }
  };

  // Handle rating change
  const handleRatingChange = async (value: number) => {
    if (!user || !currentCompany || isSubmitting || isSubmitted) return;
    
    setRating(value);
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create feedback object with rating
      const feedbackData: Record<string, any> = {};
      
      // Map rating type to correct field name
      const ratingFieldName = {
        clarity: 'ratingClarity',
        difficulty: 'ratingDifficulty',
        usefulness: 'ratingUsefulness',
        overall: 'ratingOverall',
        easeOfUse: 'ratingEaseOfUse',
        functionality: 'ratingFunctionality',
        value: 'ratingValue'
      }[ratingType];
      
      feedbackData[ratingFieldName] = value;
      
      // Submit to appropriate service method based on entity type
      if (entityType === 'step') {
        await feedbackService.submitStepFeedback(
          entityId,
          currentCompany.id,
          user.id,
          feedbackData
        );
      } else if (entityType === 'tool') {
        await feedbackService.submitToolFeedback(
          entityId,
          currentCompany.id,
          user.id,
          feedbackData
        );
      }
      
      setIsSubmitted(true);
      onRatingSubmit?.(value);
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center mb-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={isSubmitting || isSubmitted}
            className={`focus:outline-none ${getStarSize()} ${isSubmitting ? 'cursor-wait' : isSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
            onMouseEnter={() => !isSubmitted && setHoveredRating(star)}
            onMouseLeave={() => !isSubmitted && setHoveredRating(0)}
            onClick={() => handleRatingChange(star)}
            aria-label={`Rate ${star} out of 5`}
          >
            <svg
              className={`${
                (hoveredRating || rating) >= star
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              } ${isSubmitted ? 'opacity-80' : 'hover:text-yellow-500'}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"
              />
            </svg>
          </button>
        ))}
        
        {showLabels && rating > 0 && (
          <span className="ml-2 text-sm text-gray-600">
            {labels[rating - 1]}
          </span>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
      
      {isSubmitted && (
        <p className="text-sm text-green-600 mt-1">Thank you for your feedback!</p>
      )}
    </div>
  );
};

export default InlineRatingComponent;
