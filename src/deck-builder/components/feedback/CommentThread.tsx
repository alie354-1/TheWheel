import React, { useState } from 'react';
import { DeckComment } from '../../types/index.ts';
import { ReviewerAvatar } from './ReviewerAvatar.tsx';
import { CommentInput } from './CommentInput.tsx';

// Define CommentInputSubmitData if not already imported from CommentInput or a shared types file
// For now, assuming it might be co-located or needs to be defined here if not exported by CommentInput
interface CommentInputSubmitData {
  textContent: string;
  voiceNoteUrl?: string;
  markupData?: any;
}

interface CommentThreadProps {
  comment: DeckComment;
  onReplySubmit: (threadId: string, text: string) => void;
  onCommentUpdate: (commentId: string, updates: Partial<Pick<DeckComment, 'textContent' | 'status' | 'feedback_category'>>) => void;
  onCommentDelete: (commentId: string) => void;
  onCommentStatusUpdate?: (commentId: string, status: DeckComment['status']) => void;
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
  onCommentUpdate,
  onCommentDelete,
  onCommentStatusUpdate,
  currentUserId,
  currentUserDisplayName,
  currentUserAvatarUrl,
  style,
  isSubmittingReply,
  isAdminOrDeckOwnerView = false, // Default to false
}) => {
  // ABSOLUTELY FIRST LOG
  console.log("CommentThread rendering START for comment.id:", comment?.id); 

  // MOVED CONSOLE LOG TO BE ABSOLUTELY FIRST
  console.log(
    `CommentThread RENDER for comment ID ${comment.id}. `,
    `Comment Status: ${comment.status}, Comment Author ID: ${comment.authorUserId}. `,
    `Received currentUserId: ${currentUserId}. `,
    `onCommentStatusUpdate is present: ${!!onCommentStatusUpdate}.`
  );

  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.textContent);

  const handleReply = (data: CommentInputSubmitData) => {
    // For now, replies only support text content. Voice/markup on replies can be a future enhancement.
    onReplySubmit(comment.id, data.textContent);
    setIsReplying(false);
  };

  const handleEditSubmit = () => {
    if (editText.trim() !== comment.textContent) {
      onCommentUpdate(comment.id, { textContent: editText.trim() }); // Pass as partial update
    }
    setIsEditing(false);
  };
  
  const isCommentAuthor = !!currentUserId && comment.authorUserId === currentUserId;
  const canManageComment = isCommentAuthor || isAdminOrDeckOwnerView;

  // Add another log specifically for the outcome of canEditOrDelete
  console.log(`CommentThread for comment ID ${comment.id} - isCommentAuthor: ${isCommentAuthor}, isAdminOrDeckOwnerView: ${isAdminOrDeckOwnerView}, canManageComment: ${canManageComment} (currentUserId: ${currentUserId}, comment.authorUserId: ${comment.authorUserId})`);


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
          <div style={commentMetaStyle}>
            {!comment.slideId && (
              <span>Overall Deck Comment</span>
            )}
            {comment.slideId && !comment.elementId && !comment.coordinates && (
              <span>General comment for Slide: {comment.slideId.substring(0,8)}...</span>
            )}
            {comment.slideId && (comment.elementId || comment.coordinates) && (
              <>
                <span>On Slide: {comment.slideId.substring(0,8)}... </span>
                {comment.elementId && (
                  <span style={{ marginLeft: '5px' }}>Element: {comment.elementId.substring(0,8)}... </span>
                )}
                {comment.coordinates && (
                  <span style={{ marginLeft: '5px' }}>
                    Pos: ({comment.coordinates.x.toFixed(0)}, {comment.coordinates.y.toFixed(0)})
                  </span>
                )}
              </>
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
          {new Date(comment.createdAt).toLocaleString()}
        </span>
      </div>

      {isEditing ? (
        <div>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            style={{ width: '100%', minHeight: '60px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: '4px', padding: '8px' }}
          />
          <button onClick={handleEditSubmit} style={{...actionButtonStyle, marginRight: '8px'}}>Save</button>
          <button onClick={() => {setIsEditing(false); setEditText(comment.textContent);}} style={actionButtonStyle}>Cancel</button>
        </div>
      ) : (
        <>
          {comment.voiceNoteUrl && (
            <div style={{ margin: '8px 0' }}>
              <audio controls src={comment.voiceNoteUrl} style={{ width: '100%' }}>
                Your browser does not support the audio element.
              </audio>
              {comment.voiceTranscription && (
                <p style={{ fontSize: '12px', color: '#555', marginTop: '4px', fontStyle: 'italic' }}>
                  Transcription: {comment.voiceTranscription}
                </p>
              )}
            </div>
          )}
          {comment.markupData && (
            <div style={{ margin: '8px 0', padding: '8px', border: '1px dashed #ccc', backgroundColor: '#f9f9f9' }}>
              <p style={{ fontSize: '12px', color: '#555', fontStyle: 'italic' }}>
                Markup data present (visual rendering TBD)
              </p>
              {/* <pre style={{fontSize: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>{JSON.stringify(comment.markupData, null, 2)}</pre> */}
            </div>
          )}
          {comment.textContent && (
            <div style={commentBodyStyle}>{comment.textContent}</div>
          )}
          {/* If a comment is ONLY voice/markup, the textContent might be empty. 
              Ensure at least one content type is always present or handle empty state. */}
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
          {canManageComment && ( // Use canManageComment here
            <>
              {isCommentAuthor && ( // Only author can edit/delete their own comment
                <>
                  <button onClick={() => setIsEditing(true)} style={actionButtonStyle}>Edit</button>
                  <button onClick={() => onCommentDelete(comment.id)} style={{...actionButtonStyle, color: '#dc3545'}}>Delete</button>
                </>
              )}
              {/* Archive/Re-open can be done by admin/owner OR author */}
              {comment.status === 'Open' && onCommentStatusUpdate && (
                <button 
                  onClick={() => onCommentStatusUpdate(comment.id, 'Archived')} 
                  style={{...actionButtonStyle, color: '#6c757d'}}
                  title="Archive this comment"
                >
                  Archive
                </button>
              )}
               {comment.status === 'Archived' && onCommentStatusUpdate && (
                <button 
                  onClick={() => onCommentStatusUpdate(comment.id, 'Open')} 
                  style={{...actionButtonStyle, color: '#28a745'}}
                  title="Re-open this comment"
                >
                  Re-open
                </button>
              )}
            </>
          )}
          {/* Add reactions display/interaction here later */}
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
              onCommentUpdate={onCommentUpdate}
              onCommentDelete={onCommentDelete}
              onCommentStatusUpdate={onCommentStatusUpdate} // Pass down
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
