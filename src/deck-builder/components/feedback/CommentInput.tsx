import React, { useState } from 'react';
import { ReviewerAvatar } from './ReviewerAvatar';

interface CommentInputSubmitData {
  textContent: string;
  voiceNoteUrl?: string;
  markupData?: any;
}

interface CommentInputProps {
  currentUserDisplayName?: string | null;
  currentUserAvatarUrl?: string | null; // For future use
  onSubmit: (data: CommentInputSubmitData) => void;
  onCancel?: () => void;
  placeholder?: string;
  initialValue?: string;
  isSubmitting?: boolean;
  style?: React.CSSProperties;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  currentUserDisplayName,
  currentUserAvatarUrl,
  onSubmit,
  onCancel,
  placeholder = "Add a comment...",
  initialValue = "",
  isSubmitting = false,
  style,
}) => {
  const [commentText, setCommentText] = useState(initialValue);
  // Placeholder states for voice note URL and markup data
  const [pendingVoiceNoteUrl, setPendingVoiceNoteUrl] = useState<string | null>(null);
  const [pendingMarkupData, setPendingMarkupData] = useState<any | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // A comment can be just text, or include voice/markup.
    // For now, we require text if no voice/markup, but this logic can be adjusted.
    if ((commentText.trim() || pendingVoiceNoteUrl || pendingMarkupData) && !isSubmitting) {
      const submitData: CommentInputSubmitData = {
        textContent: commentText.trim(),
      };
      if (pendingVoiceNoteUrl) {
        submitData.voiceNoteUrl = pendingVoiceNoteUrl;
      }
      if (pendingMarkupData) {
        submitData.markupData = pendingMarkupData;
      }
      onSubmit(submitData);
      setCommentText(""); // Clear text input
      setPendingVoiceNoteUrl(null); // Clear pending voice note
      setPendingMarkupData(null); // Clear pending markup
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    padding: '10px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    ...style,
  };

  const textareaStyle: React.CSSProperties = {
    flexGrow: 1,
    border: '1px solid #d0d0d0',
    borderRadius: '4px',
    padding: '8px 10px',
    fontSize: '14px',
    minHeight: '40px',
    resize: 'vertical',
    fontFamily: 'inherit',
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between', // Align items to start and end
    alignItems: 'center', // Vertically align items
    gap: '8px',
    marginTop: '8px',
  };

  const additionalActionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '6px 12px',
    fontSize: '13px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
  };

  const submitButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: 'white',
  };

  const cancelButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#f0f0f0',
    color: '#333',
  };

  return (
    <form onSubmit={handleSubmit} style={containerStyle}>
      <ReviewerAvatar
        displayName={currentUserDisplayName}
        avatarUrl={currentUserAvatarUrl}
        size={36}
      />
      <div style={{ flexGrow: 1 }}>
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={textareaStyle}
          rows={2}
          disabled={isSubmitting}
        />
        <div style={actionsStyle}>
          <div style={additionalActionsStyle}>
            {/* Placeholder for Voice Note Button */}
            <button
              type="button"
              onClick={() => {
                if (pendingVoiceNoteUrl) {
                  setPendingVoiceNoteUrl(null);
                  console.log('Pending voice note cleared.');
                } else {
                  // TODO: Implement actual voice recording UI trigger
                  setPendingVoiceNoteUrl('simulated_voice_note.mp3');
                  console.log('Pending voice note set: simulated_voice_note.mp3');
                }
              }}
              style={{ ...buttonStyle, backgroundColor: pendingVoiceNoteUrl ? '#28a745' : '#6c757d', color: 'white' }}
              disabled={isSubmitting}
              title={pendingVoiceNoteUrl ? `Voice note attached: ${pendingVoiceNoteUrl} (Click to clear)` : "Record Voice Note (Coming Soon)"}
            >
              🎤 {pendingVoiceNoteUrl ? '✓' : ''}
            </button>
            {/* Placeholder for Markup Tool Button */}
            <button
              type="button"
              onClick={() => {
                if (pendingMarkupData) {
                  setPendingMarkupData(null);
                  console.log('Pending markup cleared.');
                } else {
                  // TODO: Implement markup UI trigger
                  setPendingMarkupData({ type: 'simulated_markup', data: 'path...' });
                  console.log('Pending markup set: simulated_markup');
                }
              }}
              style={{ ...buttonStyle, backgroundColor: pendingMarkupData ? '#28a745' : '#6c757d', color: 'white' }}
              disabled={isSubmitting}
              title={pendingMarkupData ? "Markup attached (Click to clear)" : "Add Markup (Coming Soon)"}
            >
              ✏️ {pendingMarkupData ? '✓' : ''}
            </button>
          </div>
          <div>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                style={cancelButtonStyle}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              style={submitButtonStyle}
              disabled={!(commentText.trim() || pendingVoiceNoteUrl || pendingMarkupData) || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Comment'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
