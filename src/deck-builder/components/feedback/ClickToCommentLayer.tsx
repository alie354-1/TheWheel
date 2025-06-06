import React, { useState, useRef } from 'react';
import { CommentInput } from './CommentInput'; // Assuming CommentInput is in the same directory

// Define CommentInputSubmitData if not already imported from CommentInput or a shared types file
interface CommentInputSubmitData {
  textContent: string;
  voiceNoteUrl?: string;
  markupData?: any;
}

interface ClickToCommentLayerProps {
  slideId: string;
  onCommentSubmit: (
    text: string, 
    coordinates: { x: number; y: number }, 
    slideId: string, 
    elementId?: string,
    voiceNoteUrl?: string, // Added for Phase 4
    markupData?: any      // Added for Phase 4
  ) => void;
  currentUserDisplayName?: string | null;
  currentUserAvatarUrl?: string | null;
  isCommentingEnabled: boolean; // To toggle the layer's activity
  style?: React.CSSProperties;
  slideDimensions: { width: number; height: number }; // Dimensions of the slide canvas
}

interface PendingComment {
  text: string;
  coordinates: { x: number; y: number };
  elementId?: string; // If the click was on a specific element
}

export const ClickToCommentLayer: React.FC<ClickToCommentLayerProps> = ({
  slideId,
  onCommentSubmit,
  currentUserDisplayName,
  currentUserAvatarUrl,
  isCommentingEnabled,
  style,
  slideDimensions,
}) => {
  const [pendingComment, setPendingComment] = useState<PendingComment | null>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isCommentingEnabled || !layerRef.current) return;

    // Prevent starting a new comment if one is already pending
    if (pendingComment) return;

    const rect = layerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // TODO: Add logic to identify if the click was on a specific element (VisualComponent)
    // For now, we'll just use coordinates.
    // const targetElement = event.target as HTMLElement;
    // const elementId = targetElement.dataset.componentId; // Example: if components have data-component-id

    setPendingComment({
      text: "",
      coordinates: { x, y },
  // elementId, 
  });
};

const handleInputSubmit = (data: CommentInputSubmitData) => {
  if (pendingComment) {
    // For comments initiated by clicking on the layer, we primarily expect text.
    // Voice/markup might be added through the CommentInput's own buttons,
    // so data.voiceNoteUrl and data.markupData would be populated by CommentInput itself.
    onCommentSubmit(
      data.textContent, 
      pendingComment.coordinates, 
      slideId, 
      pendingComment.elementId,
      data.voiceNoteUrl, // Pass through if available
      data.markupData    // Pass through if available
    );
    setPendingComment(null);
  }
};

  const handleInputCancel = () => {
    setPendingComment(null);
  };

  const layerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    cursor: isCommentingEnabled ? 'copy' : 'default', // Or 'cell', 'crosshair'
    zIndex: 1000, // Above slide content, below comment bubbles/inputs
    ...style,
  };
  
  const inputContainerStyle: React.CSSProperties = {
    position: 'absolute',
    left: pendingComment ? `${pendingComment.coordinates.x}px` : '0px',
    top: pendingComment ? `${pendingComment.coordinates.y}px` : '0px',
    // Adjust positioning to be near the click, e.g., slightly offset
    transform: 'translate(-50%, 10px)', // Example: below and centered
    minWidth: '300px',
    zIndex: 1002, // Above comment bubbles
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    borderRadius: '8px',
  };


  return (
    <div ref={layerRef} style={layerStyle} onClick={handleClick}>
      {isCommentingEnabled && pendingComment && (
        <div style={inputContainerStyle}>
          <CommentInput
            onSubmit={handleInputSubmit}
            onCancel={handleInputCancel}
            currentUserDisplayName={currentUserDisplayName}
            currentUserAvatarUrl={currentUserAvatarUrl}
            placeholder="Add comment here..."
            initialValue=""
            // isSubmitting={...} // Pass down submitting state if needed
          />
        </div>
      )}
      {/* Visual cues for where comments can be placed or existing comment markers could be rendered here */}
    </div>
  );
};
