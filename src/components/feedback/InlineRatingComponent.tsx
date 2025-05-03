import React, { useState, useEffect } from 'react';
import { useCompany } from '@/lib/hooks/useCompany';
import { motion, AnimatePresence } from 'framer-motion';

interface RatingProps {
  entityId: string;
  entityType: 'step' | 'tool' | 'resource';
  onRatingSubmit?: (rating: number, comment: string) => void;
  showCommentField?: boolean;
  initialRating?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * InlineRatingComponent
 * 
 * A reusable component for collecting user ratings and optional comments
 * for various entities like steps, tools, and resources.
 * 
 * Part of the Sprint 4 User Feedback Collection System.
 */
export const InlineRatingComponent: React.FC<RatingProps> = ({
  entityId,
  entityType,
  onRatingSubmit,
  showCommentField = false,
  initialRating = 0,
  size = 'md',
  className = '',
}) => {
  const { currentCompany } = useCompany();
  const [rating, setRating] = useState<number>(initialRating);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [showThankYou, setShowThankYou] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  
  // Reset states when entityId changes
  useEffect(() => {
    setRating(initialRating);
    setComment('');
    setShowThankYou(false);
    setHasSubmitted(false);
  }, [entityId, initialRating]);
  
  // Determine star size based on prop
  const starSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  
  // Handle star click
  const handleStarClick = (selectedRating: number) => {
    if (hasSubmitted) return;
    
    setRating(selectedRating);
    
    // If no comment field, submit immediately
    if (!showCommentField) {
      handleSubmit(selectedRating);
    }
  };
  
  // Handle rating submission
  const handleSubmit = async (selectedRating: number = rating) => {
    if (!currentCompany?.id || !entityId || !selectedRating) return;
    
    try {
      // In a real implementation, this would call a feedback service
      // For now, we'll just simulate the API call
      console.log('Submitting rating:', {
        entityId,
        entityType,
        rating: selectedRating,
        comment: comment.trim(),
        companyId: currentCompany.id,
      });
      
      // Call the onRatingSubmit callback if provided
      onRatingSubmit?.(selectedRating, comment.trim());
      
      // Show thank you message
      setShowThankYou(true);
      setHasSubmitted(true);
      
      // Hide thank you message after 3 seconds
      setTimeout(() => {
        setShowThankYou(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };
  
  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className="flex items-center">
        {/* Star rating */}
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => !hasSubmitted && setHoveredRating(star)}
              onMouseLeave={() => !hasSubmitted && setHoveredRating(0)}
              className={`focus:outline-none ${hasSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
              disabled={hasSubmitted}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <svg 
                className={`${starSize} ${
                  star <= (hoveredRating || rating) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300 fill-current'
                } transition-colors duration-150`} 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </button>
          ))}
        </div>
        
        {/* Thank you message */}
        <AnimatePresence>
          {showThankYou && (
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="ml-3 text-sm text-green-600 font-medium"
            >
              Thanks for your feedback!
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      
      {/* Comment field */}
      {showCommentField && rating > 0 && !hasSubmitted && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2"
        >
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us more about your rating (optional)"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
          />
          <button
            onClick={() => handleSubmit()}
            className="mt-2 px-4 py-1 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Submit
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default InlineRatingComponent;
