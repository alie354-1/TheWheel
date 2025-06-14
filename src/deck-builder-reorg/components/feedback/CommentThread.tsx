import React, { useState } from 'react';
import { DeckComment, FeedbackCategory } from '../../types/index.ts';
import { DeckService } from '../../services/deckService.ts';
import { ReviewerAvatar } from './ReviewerAvatar.tsx';
import { type CommentInputSubmitData, CommentInput } from './CommentInput.tsx';
import { CommentEditor } from './CommentEditor.tsx';
import { MessageCircle, Brush, Sliders, MapPin } from 'lucide-react';

interface CommentThreadProps {
  comment: DeckComment;
  onReplySubmit: (threadId: string, text: string) => void;
  onCommentDelete: (commentId: string) => void;
  onCommentStatusUpdate?: (commentId: string, status: DeckComment['status']) => void;
  onJumpToSlide?: (slideId: string) => void;
  onJumpToComment?: (commentId: string) => void;
  currentUserId?: string | null;
  currentUserDisplayName?: string | null;
  currentUserAvatarUrl?: string | null;
  style?: React.CSSProperties;
  isSubmittingReply?: boolean;
  isAdminOrDeckOwnerView?: boolean; // New prop
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  onReplySubmit,
  onCommentDelete,
  onCommentStatusUpdate,
  onJumpToSlide,
  onJumpToComment,
  currentUserId,
  currentUserDisplayName,
  currentUserAvatarUrl,
  style,
  isSubmittingReply,
  isAdminOrDeckOwnerView = false, // Default to false
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.textContent);

  const handleReply = (data: CommentInputSubmitData) => {
    // For now, replies only support text content. Voice/markup on replies can be a future enhancement.
    onReplySubmit(comment.id, data.textContent);
    setIsReplying(false);
  };

  const handleEditSubmit = async (updates: Partial<Pick<DeckComment, 'textContent' | 'feedback_category'>>) => {
    console.log('[CommentThread] handleEditSubmit called with:', { commentId: comment.id, updates });
    if (updates.textContent && updates.feedback_category) {
      await DeckService.updateCommentContent(comment.id, updates.textContent, updates.feedback_category);
    }
    setIsEditing(false);
  };
  
  const isCommentAuthor = !!currentUserId && (comment.authorUserId === currentUserId || (comment.reviewerSessionId && comment.reviewerSessionId === currentUserId));
  const canManageComment = isCommentAuthor || isAdminOrDeckOwnerView;


  const threadStyle: React.CSSProperties = {
    padding: '12px',
    border: '1px solid #e8e8e8',
    borderRadius: '8px',
    marginBottom: '12px',
    backgroundColor: '#fff',
    ...style,
  };

  const commentHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  };

  const authorNameStyle: React.CSSProperties = {
    fontWeight: 'bold',
    fontSize: '14px',
  };

  const categoryConfig: Record<FeedbackCategory, { icon: React.ElementType; color: string; label: string }> = {
    Content: { icon: MessageCircle, color: 'text-blue-500', label: 'Content' },
    Form: { icon: Brush, color: 'text-green-500', label: 'Form/Style' },
    General: { icon: Sliders, color: 'text-gray-500', label: 'General' },
  };

  const CategoryIcon = categoryConfig[comment.feedback_category]?.icon;

  const commentMetaStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#666',
    marginTop: '2px',
    display: 'flex', // Added for layout of AI insights
    flexWrap: 'wrap', // Added for layout of AI insights
    gap: '8px', // Added for spacing between AI insights
  };

  const aiInsightStyle: React.CSSProperties = {
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 500,
  };

  const timestampStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#777',
    marginLeft: 'auto',
  };
  
  const commentBodyStyle: React.CSSProperties = {
    fontSize: '14px',
    lineHeight: 1.5,
    color: '#333',
    whiteSpace: 'pre-wrap', // Preserve line breaks
    marginBottom: '8px',
  };

  const commentActionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    marginTop: '8px',
    fontSize: '12px',
    alignItems: 'center',
  };

  const actionButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    padding: 0,
  };

  const repliesContainerStyle: React.CSSProperties = {
    marginLeft: '20px',
    paddingLeft: '15px',
    borderLeft: '2px solid #e8e8e8',
    marginTop: '10px',
  };

  return (
    <div style={threadStyle}>
      <div style={commentHeaderStyle}>
        <ReviewerAvatar displayName={comment.authorDisplayName} size={32} />
        <div style={{ flexGrow: 1 }}>
          <span style={authorNameStyle}>{comment.authorDisplayName || 'Anonymous'}</span>
          <div style={{...commentMetaStyle, alignItems: 'center' }}>
            {comment.feedback_category && CategoryIcon && (
              <span
                className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${
                  categoryConfig[comment.feedback_category].color
                } bg-gray-100`}
              >
                <CategoryIcon className="h-3 w-3" />
                <span>{categoryConfig[comment.feedback_category].label}</span>
              </span>
            )}
            {comment.slideId ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ color: '#4A5568', backgroundColor: '#EBF8FF', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>
                  Slide: {comment.slideId.substring(0, 6)}...
                </span>
                {comment.coordinates && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4A5568', backgroundColor: '#F0F9FF', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>
                    <MapPin size={12} />
                    <span>{`Location: ${comment.coordinates.x.toFixed(0)}, ${comment.coordinates.y.toFixed(0)}`}</span>
                  </span>
                )}
              </div>
            ) : (
              <span style={{ fontWeight: 'bold', color: '#4A5568', backgroundColor: '#E2E8F0', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>
                Deck-Wide
              </span>
            )}
          </div>
          <div style={{...commentMetaStyle, marginTop: '4px'}}>
            {comment.aiSentimentScore != null && (
              <span 
                style={{
                  ...aiInsightStyle,
                  backgroundColor: comment.aiSentimentScore > 0.3 ? '#e6fffa' : comment.aiSentimentScore < -0.3 ? '#fff5f5' : '#f7fafc',
                  color: comment.aiSentimentScore > 0.3 ? '#2c7a7b' : comment.aiSentimentScore < -0.3 ? '#c53030' : '#4a5568',
                }}
              >
                Sentiment: {comment.aiSentimentScore.toFixed(2)}
                {comment.aiSentimentScore > 0.3 ? ' 👍' : comment.aiSentimentScore < -0.3 ? ' 👎' : ' 😐'}
              </span>
            )}
            {comment.aiExpertiseScore != null && ( // Changed from !== undefined to != null
               <span 
                style={{
                  ...aiInsightStyle,
                  backgroundColor: comment.aiExpertiseScore > 0.7 ? '#e6fffa' : comment.aiExpertiseScore < 0.4 ? '#fff5f5' : '#fefcbf',
                  color: comment.aiExpertiseScore > 0.7 ? '#2c7a7b' : comment.aiExpertiseScore < 0.4 ? '#c53030' : '#744210',
                }}
              >
                Expertise: {comment.aiExpertiseScore.toFixed(2)} 
                {comment.aiExpertiseScore > 0.7 ? ' (High)' : comment.aiExpertiseScore < 0.4 ? ' (Low)' : ' (Mid)'}
              </span>
            )}
            {comment.aiImprovementCategory && (
              <span style={{...aiInsightStyle, backgroundColor: '#e2e8f0', color: '#4a5568' }}>
                Category: {comment.aiImprovementCategory}
              </span>
            )}
          </div>
        </div>
        <span style={timestampStyle}>
          {comment.is_edited && <span style={{ fontStyle: 'italic', color: '#666' }}>(edited) </span>}
          {new Date(comment.createdAt).toLocaleString()}
        </span>
      </div>

      {isEditing ? (
        <CommentEditor
          comment={comment}
          onSave={handleEditSubmit}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          {comment.voiceNoteUrl && (
            <div style={{ margin: '8px 0' }}>
              <audio controls src={comment.voiceNoteUrl} style={{ width: '100%' }}>
                Your browser does not support the audio element.
              </audio>
              {comment.voiceTranscription && (
                <p style={{ fontSize: '12px', color: '#555', marginTop: '4px', fontStyle: 'italic' }}>
                  {comment.voiceTranscription}
                </p>
              )}
            </div>
          )}
          {comment.markupData && (
            <div style={{ margin: '8px 0', padding: '8px', border: '1px dashed #ccc', backgroundColor: '#f9f9f9' }}>
              <p style={{ fontSize: '12px', color: '#555', fontStyle: 'italic' }}>
                Markup data present (visual rendering TBD)
              </p>
            </div>
          )}
          {comment.textContent && (
            <div style={commentBodyStyle}>{comment.textContent}</div>
          )}
          {!comment.textContent && !comment.voiceNoteUrl && !comment.markupData && (
            <div style={{...commentBodyStyle, fontStyle: 'italic', color: '#999'}}>(No text content)</div>
          )}
        </>
      )}
      
      {!isEditing && (
        <div style={commentActionsStyle}>
          <button onClick={() => setIsReplying(!isReplying)} style={actionButtonStyle}>
            {isReplying ? 'Cancel Reply' : 'Reply'}
          </button>
          {canManageComment && (
            <>
              {isCommentAuthor && (
                <>
                  <button onClick={() => setIsEditing(true)} style={actionButtonStyle}>Edit</button>
                  <button onClick={() => onCommentDelete(comment.id)} style={{...actionButtonStyle, color: '#dc3545'}}>Delete</button>
                </>
              )}
              {isAdminOrDeckOwnerView && onCommentStatusUpdate && (
                <div style={{ marginLeft: 'auto' }}>
                  <select
                    value={comment.status}
                    onChange={(e) => onCommentStatusUpdate(comment.id, e.target.value as DeckComment['status'])}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      backgroundColor: '#f8f9fa'
                    }}
                  >
                    <option value="Open">Open</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              )}
              {comment.slideId && onJumpToSlide && (
                <button 
                  onClick={() => onJumpToSlide(comment.slideId!)} 
                  style={{...actionButtonStyle, marginLeft: '16px', color: '#555'}}
                  title={`Go to slide ${comment.slideId}`}
                >
                  Jump to Slide
                </button>
              )}
            </>
          )}
        </div>
      )}

      {isReplying && !isEditing && (
        <div style={{ marginTop: '10px' }}>
          <CommentInput
            onSubmit={handleReply}
            onCancel={() => setIsReplying(false)}
            currentUserDisplayName={currentUserDisplayName}
            currentUserAvatarUrl={currentUserAvatarUrl}
            placeholder="Write a reply..."
            isSubmitting={isSubmittingReply}
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div style={repliesContainerStyle}>
          {comment.replies.map((reply: DeckComment) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              onReplySubmit={onReplySubmit}
              onCommentDelete={onCommentDelete}
              onCommentStatusUpdate={onCommentStatusUpdate} // Pass down
              onJumpToSlide={onJumpToSlide}
              onJumpToComment={onJumpToComment}
              isAdminOrDeckOwnerView={isAdminOrDeckOwnerView} // Pass down
              currentUserId={currentUserId}
              currentUserDisplayName={currentUserDisplayName}
              currentUserAvatarUrl={currentUserAvatarUrl}
              isSubmittingReply={isSubmittingReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};
