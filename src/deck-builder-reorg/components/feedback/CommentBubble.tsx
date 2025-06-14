import React from 'react';
import { DeckComment } from '../../types'; // Assuming types are in ../../types
import { ReviewerAvatar } from './ReviewerAvatar'; // Assuming ReviewerAvatar is in the same directory

interface CommentBubbleProps {
  comment: DeckComment;
  onClick?: () => void;
  isSelected?: boolean;
  style?: React.CSSProperties;
}

export const CommentBubble: React.FC<CommentBubbleProps> = ({
  comment,
  onClick,
  isSelected,
  style,
}) => {
  const bubbleStyle: React.CSSProperties = {
    position: 'absolute',
    left: comment.coordinates?.x ? `${comment.coordinates.x}px` : 'auto',
    top: comment.coordinates?.y ? `${comment.coordinates.y}px` : 'auto',
    transform: 'translate(-50%, -100%)', // Adjust to position bubble above and centered on the point
    padding: '8px 12px',
    background: isSelected ? '#007bff' : '#ffffff',
    color: isSelected ? '#ffffff' : '#333333',
    borderRadius: '16px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
    cursor: 'pointer',
    zIndex: 1001, // Ensure it's above slide content but below active modals
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    minWidth: '40px', // Ensure it's visible even if only an avatar
    ...style,
  };

  const shortText = comment.textContent.substring(0, 20) + (comment.textContent.length > 20 ? '...' : '');

  return (
    <div style={bubbleStyle} onClick={onClick} title={comment.textContent}>
      <ReviewerAvatar
        displayName={comment.authorDisplayName || 'Anonymous'}
        // avatarUrl={comment.authorAvatarUrl} // Add if you have avatar URLs
        size={24}
      />
      {isSelected && <span>{shortText}</span>}
    </div>
  );
};
