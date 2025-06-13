import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { DeckComment, AIFeedbackInsight, Deck, DeckSection, FeedbackCategory } from '../../types/index.ts';
import { CommentThread } from './CommentThread.tsx';
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
  onJumpToComment?: (commentId: string) => void; // To highlight a specific comment bubble
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
  isClickToCommentMode?: boolean; // New: Click-to-comment mode state
  onClickToCommentToggle?: (enabled: boolean) => void; // New: Toggle click-to-comment mode
  showCommentBubbles?: boolean;
  onShowCommentBubblesToggle?: (show: boolean) => void;
  onClose?: () => void;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
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
  onJumpToComment,
  isClickToCommentMode = false, // Default to false
  onClickToCommentToggle,
  showCommentBubbles = true,
  onShowCommentBubblesToggle,
  onClose,
}) => {
  const [aggregatedInsights, setAggregatedInsights] = useState<AIFeedbackInsight | null>(null);
  const [isLoadingAggregates, setIsLoadingAggregates] = useState(false);
  const [isGeneratingProposals, setIsGeneratingProposals] = useState(false);
  const [showOnlyOpen, setShowOnlyOpen] = useState(true); // Default to true
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory | 'All'>('All');
  const [commentScope, setCommentScope] = useState<'slide' | 'deck'>('slide');
  const commentItemRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (highlightedCommentId) {
      const ids = highlightedCommentId.split(',');
      ids.forEach((id, index) => {
        const el = commentItemRefs.current[id];
        if (el) {
          if (index === 0) {
            el.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
          el.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
          setTimeout(() => {
            el.style.backgroundColor = '';
          }, 2000);
        }
      });
    }
  }, [highlightedCommentId]);

  const fetchAggregatedInsights = useCallback(async () => {
    if (!deckId) return;
    setIsLoadingAggregates(true);
    try {
      const insights = await DeckService.generateAndStoreAggregatedInsights(deckId);
      setAggregatedInsights(insights);
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
  
  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '6px 10px',
    fontSize: '12px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const aggregatedInsightsSectionStyle: React.CSSProperties = {
    marginTop: '20px',
    paddingTop: '15px',
    borderTop: '1px solid #ccc',
  };

  const insightItemStyle: React.CSSProperties = {
    marginBottom: '8px',
    fontSize: '13px',
  }

  const handleNewTopLevelComment = (data: CommentInputSubmitData) => {
    onCommentSubmit(data.textContent, undefined, data.voiceNoteUrl, data.markupData, data.feedbackCategory, undefined, data.slideId);
  };

  const handleReplySubmit = (threadId: string, text: string) => {
    onCommentSubmit(text, threadId);
  };

  const commentCountsByCategory = useMemo(() => {
    const counts: Record<FeedbackCategory, number> = {
      General: 0,
      Content: 0,
      Form: 0,
    };
    comments.forEach(comment => {
      if (counts[comment.feedback_category] !== undefined) {
        counts[comment.feedback_category]++;
      }
    });
    return counts;
  }, [comments]);

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

  const exportCommentsToCSV = () => {
    const headers = ['ID', 'Author', 'Text', 'Category', 'Status', 'Slide ID', 'Created At'];
    const rows = displayedComments.map(comment => [
      comment.id,
      comment.authorDisplayName || 'Anonymous',
      comment.textContent,
      comment.feedback_category,
      comment.status,
      comment.slideId || 'Deck-wide',
      new Date(comment.createdAt).toLocaleString(),
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "deck_comments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShowAllOnSlide = () => {
    if (commentScope === 'slide' && selectedSlideId && onJumpToComment) {
      const slideCommentIds = comments
        .filter(c => c.slideId === selectedSlideId)
        .map(c => c.id);
      if (slideCommentIds.length > 0) {
        onJumpToComment(slideCommentIds.join(','));
      }
    }
  };

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={titleStyle}>
          {commentScope === 'deck'
            ? 'All Feedback'
            : selectedSlideId
            ? 'Feedback for Current Slide'
            : 'Deck-Wide Feedback'}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isAdminOrDeckOwnerView && (
            <button
              onClick={exportCommentsToCSV}
              style={{ ...buttonStyle, backgroundColor: '#17a2b8', marginRight: '10px' }}
              title="Export visible comments to CSV"
            >
              Export CSV
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              style={{ ...buttonStyle, backgroundColor: 'transparent', color: '#6c757d', border: '1px solid #6c757d' }}
              title="Close panel"
            >
              &times;
            </button>
          )}
        </div>
      </div>
      
      <CommentScopeToggle
        scope={commentScope}
        onScopeChange={setCommentScope}
      />

      {commentScope === 'slide' && selectedSlideId && (
        <div style={{ marginBottom: '10px' }}>
          <button
            onClick={handleShowAllOnSlide}
            style={{ ...buttonStyle, backgroundColor: '#6c757d', width: '100%' }}
            title="Highlight all comments on the current slide"
          >
            Show All on Slide
          </button>
        </div>
      )}

      {onVisibilityToggle && (
        <PrivateCommentsToggle
          showOnlyOwnComments={showOnlyOwnComments}
          onToggle={onVisibilityToggle}
        />
      )}

      {onClickToCommentToggle && (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={isClickToCommentMode}
              onChange={(e) => onClickToCommentToggle(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Enable click-to-comment mode
          </label>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', marginLeft: '20px' }}>
            Click anywhere on the slide to add contextual comments
          </div>
        </div>
      )}

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

      {onShowCommentBubblesToggle && (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={showCommentBubbles}
              onChange={(e) => onShowCommentBubblesToggle(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Show comment bubbles on slide
          </label>
        </div>
      )}
      
      {isAdminOrDeckOwnerView && (
        <>
          <div style={buttonContainerStyle}>
            <button 
              onClick={fetchAggregatedInsights} 
              disabled={isLoadingAggregates}
              style={{ ...buttonStyle, backgroundColor: '#007bff' }}
            >
              {isLoadingAggregates ? 'Loading Insights...' : 'Show Aggregated Insights'}
            </button>
            {selectedSlideId && (
              <button
                onClick={handleGenerateAIProposals}
                disabled={isGeneratingProposals || !currentDeck?.sections || comments.filter(c => c.slideId === selectedSlideId).length === 0}
                style={{ ...buttonStyle, backgroundColor: '#28a745' }}
                title={comments.filter(c => c.slideId === selectedSlideId).length === 0 ? "No comments on this slide to generate proposals from" : "Generate AI suggestions for this slide"}
              >
                {isGeneratingProposals ? 'Generating...' : 'Generate AI Suggestions'}
              </button>
            )}
          </div>
          
          <CategoryFilterTabs
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            commentCounts={{
              All: comments.length,
              ...commentCountsByCategory,
            }}
          />
        </>
      )}

      {isAdminOrDeckOwnerView && showAggregatedInsights && aggregatedInsights && aggregatedInsights.insights && (
        <div style={aggregatedInsightsSectionStyle}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>Aggregated Insights</h4>
          <FeedbackSummary comments={comments} />
          <div style={insightItemStyle}><strong>Total Comments:</strong> {aggregatedInsights.insights.totalComments}</div>
          
          <div style={insightItemStyle}>
            <strong>Sentiment:</strong> 
            Avg: {aggregatedInsights.insights.sentimentBreakdown?.averageScore?.toFixed(2)} 
            (Pos: {aggregatedInsights.insights.sentimentBreakdown?.positive}, 
            Neu: {aggregatedInsights.insights.sentimentBreakdown?.neutral}, 
            Neg: {aggregatedInsights.insights.sentimentBreakdown?.negative})
          </div>

          {aggregatedInsights.insights.keyThemes && aggregatedInsights.insights.keyThemes.length > 0 && (
            <div style={insightItemStyle}>
              <strong>Key Themes:</strong>
              <ul style={{ listStyleType: 'disc', marginLeft: '20px', marginTop: '4px' }}>
                {aggregatedInsights.insights.keyThemes.map((theme: { category: string, count: number }, index: number) => (
                  <li key={index}>{theme.category} ({theme.count})</li>
                ))}
              </ul>
            </div>
          )}

          {aggregatedInsights.insights.expertiseDistribution && (
             <div style={insightItemStyle}>
              <strong>Expertise Distribution:</strong> 
              High: {aggregatedInsights.insights.expertiseDistribution.high}, 
              Mid: {aggregatedInsights.insights.expertiseDistribution.mid}, 
              Low: {aggregatedInsights.insights.expertiseDistribution.low}
            </div>
          )}
        </div>
      )}
      
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
        {displayedComments.map((comment, index) => (
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
              {comment.slideId && onJumpToComment && (
                <div 
                  style={{ 
                    fontSize: '12px', 
                    color: '#007bff', 
                    cursor: 'pointer', 
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s',
                  }} 
                  onClick={() => onJumpToComment(comment.id)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span role="img" aria-label="location">📍</span>
                  <span>
                    On Slide {(currentDeck?.sections.findIndex(s => s.id === comment.slideId) ?? -1) + 1}
                  </span>
                </div>
              )}
              <CommentThread
                comment={comment}
                onReplySubmit={handleReplySubmit}
                onCommentDelete={onCommentDelete}
                onCommentStatusUpdate={onCommentStatusUpdate}
                onJumpToSlide={onJumpToSlide}
                onJumpToComment={onJumpToComment}
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
