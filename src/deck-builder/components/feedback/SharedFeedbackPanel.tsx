import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { DeckComment, AIFeedbackInsight, Deck, DeckSection, FeedbackCategory } from '../../types/index.ts';
import { SharedCommentThread } from './SharedCommentThread.tsx';
import { CommentInput, CommentInputSubmitData } from './CommentInput.tsx';
import { DeckService } from '../../services/deckService.ts';
import { FeedbackSummary } from './FeedbackSummary.tsx';
import { CategoryFilterTabs } from './CategoryFilterTabs.tsx';
import { PrivateCommentsToggle } from './PrivateCommentsToggle.tsx';
import { CommentScopeToggle } from './CommentScopeToggle.tsx';

interface FeedbackPanelProps {
  deckId: string;
  currentDeck?: Deck | null; 
  comments: DeckComment[];
  onCommentSubmit: (text: string, parentCommentId?: string, voiceNoteUrl?: string, markupData?: any, feedbackCategory?: FeedbackCategory, componentId?: string, slideId?: string | null) => void;
  onCommentDelete: (commentId: string) => void;
  onCommentStatusUpdate?: (commentId: string, status: DeckComment['status']) => void; // Prop for status updates
  onProposalsGenerated?: () => void;
  onCommentsNeedRefresh?: () => void; // New prop to signal parent to refresh comments
  onVisibilityToggle?: (showOnlyOwn: boolean) => void; // For private comments toggle
  onJumpToSlide?: (slideId: string) => void;
  currentUserId?: string | null;
  currentUserDisplayName?: string | null;
  currentUserAvatarUrl?: string | null;
  selectedSlideId?: string | null;
  style?: React.CSSProperties;
  isSubmittingComment?: boolean;
  isSubmittingReply?: boolean;
  highlightedCommentId?: string | null;
  isAdminOrDeckOwnerView?: boolean;
  showAggregatedInsights?: boolean; // New: Explicitly control insights visibility
  showOnlyOwnComments?: boolean; // New: Force showing only user's own comments
}

export const SharedFeedbackPanel: React.FC<FeedbackPanelProps> = ({
  deckId,
  currentDeck,
  comments,
  onCommentSubmit,
  onCommentDelete,
  onCommentStatusUpdate,
  onProposalsGenerated,
  onCommentsNeedRefresh, // Destructure new prop
  currentUserId,
  currentUserDisplayName,
  currentUserAvatarUrl,
  selectedSlideId,
  style,
  isSubmittingComment,
  isSubmittingReply,
  highlightedCommentId,
  isAdminOrDeckOwnerView = false,
  showAggregatedInsights = false, // Default to false for safety
  showOnlyOwnComments = false, // Default to false
  onVisibilityToggle,
  onJumpToSlide,
}) => {
  const [showOnlyOpen, setShowOnlyOpen] = useState(true); // Default to true
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory | 'All'>('All');
  const [commentScope, setCommentScope] = useState<'slide' | 'deck'>('slide');
  const commentItemRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const [isLoadingAggregates, setIsLoadingAggregates] = useState(false);
  const [aggregatedInsights, setAggregatedInsights] = useState<AIFeedbackInsight[] | null>(null);
  const [isGeneratingProposals, setIsGeneratingProposals] = useState(false);

  useEffect(() => {
    if (highlightedCommentId && commentItemRefs.current[highlightedCommentId]) {
      commentItemRefs.current[highlightedCommentId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      const el = commentItemRefs.current[highlightedCommentId];
      if (el) {
        el.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
        setTimeout(() => {
          el.style.backgroundColor = '';
        }, 2000);
      }
    }
  }, [highlightedCommentId]);

  const fetchAggregatedInsights = useCallback(async () => {
    if (!deckId) return;
    setIsLoadingAggregates(true);
    try {
      const insights = await DeckService.generateAndStoreAggregatedInsights(deckId);
      setAggregatedInsights(insights as any);
    } catch (error) {
      console.error("Error fetching aggregated insights:", error);
      setAggregatedInsights(null);
    } finally {
      setIsLoadingAggregates(false);
    }
  }, [deckId]);

  const handleGenerateAIProposals = useCallback(async () => {
    if (!deckId || !selectedSlideId || !currentDeck?.sections) {
      console.warn("Cannot generate AI proposals: missing deckId, selectedSlideId, or currentDeck sections.");
      return;
    }

    const currentSlideFullContent = currentDeck.sections.find((s: DeckSection) => s.id === selectedSlideId);
    if (!currentSlideFullContent) {
      console.warn(`Cannot generate AI proposals: slide content not found for slideId ${selectedSlideId}.`);
      return;
    }

    const slideComments = comments.filter(comment => comment.slideId === selectedSlideId);
    if (slideComments.length === 0) {
      alert("No comments on this slide to generate proposals from.");
      return;
    }

    setIsGeneratingProposals(true);
    try {
      const proposals = await DeckService.createAIProposal(deckId, selectedSlideId, slideComments, currentSlideFullContent);
      console.log("AI Proposals Generated:", proposals);
      alert(`Generated ${proposals.length} AI proposal(s) for this slide.`);
      if (onProposalsGenerated) {
        onProposalsGenerated();
      }
    } catch (error) {
      console.error("Error generating AI proposals:", error);
      alert("Failed to generate AI proposals. See console for details.");
    } finally {
      setIsGeneratingProposals(false);
    }
  }, [deckId, selectedSlideId, comments, currentDeck, onProposalsGenerated]);

  const panelStyle: React.CSSProperties = {
    padding: '15px',
    borderLeft: '1px solid #ddd',
    height: '100%',
    overflowY: 'auto',
    backgroundColor: '#fdfdfd',
    ...style,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333',
  };
  
  const handleNewTopLevelComment = (data: CommentInputSubmitData) => {
    onCommentSubmit(data.textContent, undefined, data.voiceNoteUrl, data.markupData, data.feedbackCategory, undefined, data.slideId);
  };

  const handleReplySubmit = (threadId: string, text: string) => {
    onCommentSubmit(text, threadId);
  };

  const displayedComments = useMemo(() => {
    let filtered = comments.filter(c => !c.parentCommentId); // Start with all top-level comments

    // Hard filter for "show only own comments" mode
    if (showOnlyOwnComments && currentUserId) {
      filtered = filtered.filter(comment => comment.authorUserId === currentUserId || comment.reviewerSessionId === currentUserId);
    }

    // Filter by scope
    if (commentScope === 'slide') {
      if (selectedSlideId) {
        filtered = filtered.filter(comment => comment.slideId === selectedSlideId);
      } else {
        // If no slide is selected, show deck-level comments (those with no slideId)
        filtered = filtered.filter(comment => !comment.slideId);
      }
    }
    // If commentScope is 'deck', we don't filter by slide, showing all comments.
    
    // Filter by status if applicable
    if (showOnlyOpen) {
      filtered = filtered.filter(comment => comment.status === 'Open');
    }
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(comment => comment.feedback_category === selectedCategory);
    }

    return filtered;
  }, [comments, selectedSlideId, showOnlyOpen, showOnlyOwnComments, currentUserId, selectedCategory, commentScope]);

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={titleStyle}>
          Feedback
        </h3>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
          <input
            type="checkbox"
            checked={showOnlyOpen}
            onChange={(e) => setShowOnlyOpen(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          Show only open comments
        </label>
      </div>
      
      <CommentInput
        onSubmit={handleNewTopLevelComment}
        currentUserDisplayName={currentUserDisplayName}
        currentUserAvatarUrl={currentUserAvatarUrl}
        placeholder={
          commentScope === 'deck'
            ? 'Add deck-wide feedback...'
            : selectedSlideId
            ? 'Add feedback for this slide...'
            : 'Add deck-wide feedback...'
        }
        isSubmitting={isSubmittingComment}
        slideId={commentScope === 'slide' && selectedSlideId ? selectedSlideId : undefined}
        scope={commentScope}
        key={`${selectedSlideId}-${commentScope}`} // Re-mount when slide or scope changes
      />

      <div style={{ marginTop: '20px' }}>
        {displayedComments.length === 0 && (
          <p style={{ color: '#777', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
            {commentScope === 'slide' && selectedSlideId ? 'No feedback for this slide yet.' : 
             commentScope === 'slide' && !selectedSlideId ? 'No deck-wide feedback to show.' :
             'No feedback to display.'}
          </p>
        )}
        {displayedComments.map((comment: DeckComment, index: number) => (
          <div
            key={comment.id}
            ref={(el) => (commentItemRefs.current[comment.id] = el)}
            style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '8px', 
              marginBottom: '16px',
              paddingBottom: '16px',
              borderBottom: '1px solid #eee'
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#555', marginTop: '12px', minWidth: '20px', textAlign: 'right' }}>{index + 1}.</span>
            <div style={{ flexGrow: 1 }}>
              <SharedCommentThread
                comment={comment}
                onReplySubmit={handleReplySubmit}
                onCommentDelete={onCommentDelete}
                onCommentStatusUpdate={onCommentStatusUpdate}
                onJumpToSlide={onJumpToSlide}
                isAdminOrDeckOwnerView={isAdminOrDeckOwnerView}
                currentUserId={currentUserId}
                currentUserDisplayName={currentUserDisplayName}
                currentUserAvatarUrl={currentUserAvatarUrl}
                isSubmittingReply={isSubmittingReply}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
