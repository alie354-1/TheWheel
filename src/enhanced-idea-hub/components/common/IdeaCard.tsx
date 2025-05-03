/**
 * IdeaCard Component
 * Redesigned card component for displaying idea information with a modern look
 */

import React from 'react';
import { EnhancedIdeaPlaygroundIdea, IdeaType, OwnershipType } from '../../types';

interface IdeaCardProps {
  idea: EnhancedIdeaPlaygroundIdea;
  variant?: 'compact' | 'standard' | 'detailed';
  showActions?: boolean;
  onSelect?: (idea: EnhancedIdeaPlaygroundIdea) => void;
  onToggleSave?: (idea: EnhancedIdeaPlaygroundIdea) => void;
  onMoveToStage?: (idea: EnhancedIdeaPlaygroundIdea, stage: string) => void;
  onPromoteToCompany?: (idea: EnhancedIdeaPlaygroundIdea) => void;
  className?: string;
  currentUserId?: string;
}

/**
 * Get the appropriate badge color for an idea type
 */
const getIdeaTypeBadgeColor = (type: IdeaType) => {
  switch (type) {
    case 'new_company':
      return 'bg-purple-100 text-purple-800 border border-purple-200';
    case 'new_product':
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'new_feature':
      return 'bg-green-100 text-green-800 border border-green-200';
    case 'improvement':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
};

/**
 * Get the appropriate badge color for ownership type
 */
const getOwnershipTypeBadgeColor = (type: OwnershipType) => {
  switch (type) {
    case 'personal':
      return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
    case 'company':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
};

/**
 * Get the appropriate status badge color
 */
const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800 border border-gray-200';
    case 'ready_for_company':
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'pending_approval':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    case 'approved':
      return 'bg-green-100 text-green-800 border border-green-200';
    case 'implemented':
      return 'bg-purple-100 text-purple-800 border border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
};

/**
 * Get the display name for an idea type
 */
const getIdeaTypeDisplayName = (type: IdeaType) => {
  switch (type) {
    case 'new_company':
      return 'New Company';
    case 'new_product':
      return 'New Product';
    case 'new_feature':
      return 'New Feature';
    case 'improvement':
      return 'Improvement';
    default:
      return type;
  }
};

/**
 * Get the display name for ownership type
 */
const getOwnershipTypeDisplayName = (type: OwnershipType) => {
  switch (type) {
    case 'personal':
      return 'Personal';
    case 'company':
      return 'Company';
    default:
      return type;
  }
};

/**
 * Format status for display
 */
const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Format date for display
 */
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} weeks ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  variant = 'standard',
  showActions = true,
  onSelect,
  onToggleSave,
  onMoveToStage,
  onPromoteToCompany,
  className = '',
  currentUserId,
}) => {
  // Determine if the card should be clickable
  const isClickable = !!onSelect;
  
  // Determine if the current user is the creator
  const isCreator = currentUserId && idea.creatorId === currentUserId;
  
  return (
    <div 
      className={`bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 overflow-hidden ${className}`}
      style={{ 
        width: variant === 'compact' ? '220px' : '100%',
        height: variant === 'compact' ? '220px' : 'auto',
        transform: 'translateZ(0)', // Force GPU acceleration for smoother transitions
      }}
    >
      {/* Card Header with Badges */}
      <div className="p-4 pb-2">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getIdeaTypeBadgeColor(idea.ideaType)}`}>
            {getIdeaTypeDisplayName(idea.ideaType)}
          </span>
          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getOwnershipTypeBadgeColor(idea.ownershipType)}`}>
            {getOwnershipTypeDisplayName(idea.ownershipType)}
          </span>
          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(idea.integration.status)}`}>
            {formatStatus(idea.integration.status)}
          </span>
        </div>
        
        {/* Title */}
        <h3 
          className={`font-semibold ${variant === 'compact' ? 'text-md' : 'text-lg'} mb-2 line-clamp-2 cursor-pointer hover:text-indigo-600 transition-colors`}
          onClick={isClickable ? () => onSelect?.(idea) : undefined}
        >
          {idea.title}
        </h3>
      </div>
      
      {/* Card Content */}
      <div 
        className={`px-4 ${variant === 'compact' ? 'pb-2' : 'pb-4'}`}
        onClick={isClickable ? () => onSelect?.(idea) : undefined}
      >
        {/* Description */}
        <p className={`text-gray-600 text-sm ${variant === 'compact' ? 'line-clamp-2' : 'line-clamp-3'}`}>
          {idea.description}
        </p>
        
        {/* Company Name (if applicable) */}
        {idea.companyId && idea.ownershipType === 'company' && (
          <div className="mt-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-gray-500">{idea.companyName || 'Company'}</span>
          </div>
        )}
      </div>
      
      {/* Card Footer */}
      <div className="border-t border-gray-100 p-3 bg-gray-50 flex justify-between items-center">
        {/* Date and Creator Info */}
        <div className="flex items-center text-xs text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span>{formatDate(idea.updated_at)}</span>
          
          {isCreator && (
            <span className="ml-2 bg-indigo-100 text-indigo-800 px-1 rounded text-xs">You</span>
          )}
        </div>
        
        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-2">
            {/* Save Button */}
            {onToggleSave && (
              <button
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(idea);
                }}
                aria-label={idea.is_saved ? "Unsave idea" : "Save idea"}
                title={idea.is_saved ? "Unsave idea" : "Save idea"}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 ${idea.is_saved ? 'text-indigo-600 fill-indigo-600' : 'text-gray-400'}`}
                  viewBox="0 0 20 20"
                  fill={idea.is_saved ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={idea.is_saved ? '0' : '1.5'}
                >
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              </button>
            )}
            
            {/* Promote to Company Button (only for personal ideas) */}
            {idea.ownershipType === 'personal' && onPromoteToCompany && (
              <button
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onPromoteToCompany(idea);
                }}
                title="Promote to company idea"
                aria-label="Promote to company idea"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </button>
            )}
            
            {/* Move to Next Stage Button */}
            {onMoveToStage && idea.integration.status !== 'implemented' && (
              <button
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveToStage(idea, 'next');
                }}
                title="Move to next stage"
                aria-label="Move to next stage"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaCard;
