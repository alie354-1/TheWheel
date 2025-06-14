import React, { useState, useEffect } from 'react';
import { ReviewerAvatar } from './ReviewerAvatar.tsx';
import { FeedbackCategory } from '../../types/index.ts';
import { EnhancedCategorySelector } from './EnhancedCategorySelector.tsx';
import { CommentScopeToggle } from './CommentScopeToggle.tsx';
import { VoiceRecorder } from './VoiceRecorder.tsx';
import { aiService } from '../../../lib/services/ai.service.ts';
import { RichTextEditor } from '../editors/RichTextEditor.tsx';

export interface CommentInputSubmitData {
  textContent: string;
  voiceNoteUrl?: string;
  transcription?: string;
  markupData?: any;
  feedbackCategory: FeedbackCategory;
  slideId?: string;
}

interface CommentInputProps {
  currentUserDisplayName?: string | null;
  currentUserAvatarUrl?: string | null;
  onSubmit: (data: CommentInputSubmitData) => void;
  onCancel?: () => void;
  placeholder?: string;
  initialValue?: string;
  isSubmitting?: boolean;
  style?: React.CSSProperties;
  slideId?: string;
  scope?: 'slide' | 'deck';
}

export const CommentInput: React.FC<CommentInputProps> = ({
  currentUserDisplayName = null,
  currentUserAvatarUrl = null,
  onSubmit,
  onCancel,
  placeholder = "Add a comment...",
  initialValue = "",
  isSubmitting = false,
  style,
  slideId,
  scope = 'slide',
}) => {
  const draftKey = scope === 'slide' && slideId ? `comment_draft_${slideId}` : 'comment_draft_deck';
  const [commentText, setCommentText] = useState(initialValue);
  const [feedbackCategory, setFeedbackCategory] = useState<FeedbackCategory>('General');
  const [pendingVoiceNoteUrl, setPendingVoiceNoteUrl] = useState<string | undefined>(undefined);
  const [transcription, setTranscription] = useState<string | undefined>(undefined);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Effect for autosaving drafts
  useEffect(() => {
    const handler = setTimeout(() => {
      if (commentText) {
        localStorage.setItem(draftKey, commentText);
      } else {
        localStorage.removeItem(draftKey);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [commentText, draftKey]);

  // Effect for loading drafts
  useEffect(() => {
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      setCommentText(savedDraft);
    }
  }, [draftKey]);

  const handleVoiceRecordingComplete = async (audioBlob: Blob) => {
    setPendingVoiceNoteUrl(URL.createObjectURL(audioBlob));
    setIsTranscribing(true);
    try {
      const transcript = await aiService.transcribeAudio(audioBlob);
      setTranscription(transcript);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      setTranscription("Transcription failed.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleTextChange = (content: string) => {
    setCommentText(content);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!commentText.trim() && !pendingVoiceNoteUrl) || isSubmitting) {
      return;
    }
    
    onSubmit({
      textContent: commentText.trim(),
      voiceNoteUrl: pendingVoiceNoteUrl || undefined,
      transcription: transcription || undefined,
      feedbackCategory,
      slideId: scope === 'slide' ? slideId : undefined,
    });

    // Reset form state
    setCommentText('');
    setPendingVoiceNoteUrl(undefined);
    setTranscription(undefined);
    setFeedbackCategory('General');
    localStorage.removeItem(draftKey);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e as any);
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    padding: '12px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e5e7eb',
    ...style,
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '14px',
    lineHeight: '1.5',
    resize: 'vertical',
    minHeight: '60px',
    fontFamily: 'inherit',
    backgroundColor: '#f9fafb',
  };

  const controlsContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
  };

  const mainActionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const submitButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#2563eb',
    color: 'white',
  };

  const cancelButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#e5e7eb',
    color: '#374151',
  };

  return (
    <form onSubmit={handleSubmit} style={containerStyle}>
      <ReviewerAvatar
        displayName={currentUserDisplayName ?? null}
        avatarUrl={currentUserAvatarUrl ?? null}
        size={36}
      />
      <div style={{ flexGrow: 1 }}>
        <RichTextEditor
          content={commentText}
          onChange={handleTextChange}
          placeholder={placeholder}
        />
        <div style={{ marginTop: '12px' }}>
          <EnhancedCategorySelector
            selectedCategory={feedbackCategory}
            onSelectCategory={setFeedbackCategory}
          />
        </div>

        {(pendingVoiceNoteUrl || isTranscribing) && (
          <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
            {isTranscribing ? (
              <p>Transcribing audio...</p>
            ) : (
              <>
                <audio src={pendingVoiceNoteUrl || ''} controls style={{ width: '100%' }} />
                {transcription && <p style={{ marginTop: '4px', fontSize: '13px', color: '#4b5563' }}>{transcription}</p>}
                <button
                  type="button"
                  onClick={() => { setPendingVoiceNoteUrl(undefined); setTranscription(undefined); }}
                  style={{...buttonStyle, backgroundColor: '#fee2e2', color: '#ef4444', fontSize: '12px', padding: '4px 8px', marginTop: '8px' }}
                >
                  Remove Voice Note
                </button>
              </>
            )}
          </div>
        )}

        <div style={controlsContainerStyle}>
          <div style={{ flex: 1 }} />
          <div style={mainActionsStyle}>
            <VoiceRecorder onRecordingComplete={handleVoiceRecordingComplete} disabled={isSubmitting} />
            {onCancel && (
              <button type="button" onClick={onCancel} style={cancelButtonStyle} disabled={isSubmitting}>
                Cancel
              </button>
            )}
            <button
              type="submit"
              style={submitButtonStyle}
              disabled={(!commentText.trim() && !pendingVoiceNoteUrl) || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
