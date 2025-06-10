import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { DeckComment, AIFeedbackInsight, Deck, DeckSection, FeedbackCategory } from '../../types/index.ts';
import { CommentThread } from './CommentThread.tsx';
import { CommentInput } from './CommentInput.tsx';
import { DeckService } from '../../services/deckService.ts';

interface CommentInputSubmitData {
  textContent: string;
  voiceNoteUrl?: string;
  markupData?: any;
  feedbackCategory: FeedbackCategory;
}

interface FeedbackPanelProps {
  deckId: string;
  currentDeck?: Deck | null; 
  comments: DeckComment[];
  onCommentSubmit: (text: string, parentCommentId?: string, voiceNoteUrl?: string, markupData?: any, feedbackCategory?: FeedbackCategory, componentId?: string) => void;
  onCommentUpdate: (commentId: string, updates: Partial<Pick<DeckComment, 'textContent' | 'status' | 'feedback_category'>>) => void;
  onCommentDelete: (commentId: string) => void;
  onCommentStatusUpdate?: (commentId: string, status: DeckComment['status']) => void; // Prop for status updates
  onProposalsGenerated?: () => void; 
  onCommentsNeedRefresh?: () => void; // New prop to signal parent to refresh comments
  currentUserId?: string | null;
  currentUserDisplayName?: string | null;
  currentUserAvatarUrl?: string | null;
  selectedSlideId?: string | null;
  style?: React.CSSProperties;
  isSubmittingComment?: boolean;
  isSubmittingReply?: boolean;
  highlightedCommentId?: string | null;
  isAdminOrDeckOwnerView?: boolean; // New prop
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  deckId,
  currentDeck,
  comments,
  onCommentSubmit,
  onCommentUpdate,
  onCommentDelete,
  onCommentStatusUpdate, // Destructure new prop
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
  isAdminOrDeckOwnerView = false, // Default to false, will be true from UnifiedDeckBuilder
}) => {
  const [aggregatedInsights, setAggregatedInsights] = useState<AIFeedbackInsight | null>(null);
  const [isLoadingAggregates, setIsLoadingAggregates] = useState(false);
  const [isGeneratingProposals, setIsGeneratingProposals] = useState(false);
  const [showOnlyOpen, setShowOnlyOpen] = useState(true); // Default to true
  const commentItemRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

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

    const currentSlideFullContent = currentDeck.sections.find(s => s.id === selectedSlideId);
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
    onCommentSubmit(data.textContent, undefined, data.voiceNoteUrl, data.markupData, data.feedbackCategory);
  };

  const handleReplySubmit = (threadId: string, text: string) => {
    onCommentSubmit(text, threadId);
  };

  const handleInternalCommentStatusUpdate = async (commentId: string, status: DeckComment['status']) => {
    try {
      // Call the existing onCommentUpdate but adapt it or use a new specific service call if DeckService.updateComment is flexible
      // For now, assuming onCommentUpdate can handle a status change or we call DeckService directly
      // await DeckService.updateComment(commentId, { status }); // This would be ideal if FeedbackPanel directly calls service
      
      // If onCommentStatusUpdate is provided, use it (it will call DeckService.updateComment and refresh)
      if (onCommentStatusUpdate) {
        onCommentStatusUpdate(commentId, status);
      } else if (onCommentsNeedRefresh) { 
        // Fallback if only a generic refresh mechanism is available from parent
        // This path assumes the parent's onCommentUpdate can handle status or there's another way
        console.warn("onCommentStatusUpdate not provided to FeedbackPanel, attempting generic refresh via onCommentsNeedRefresh after direct service call (if implemented here).");
        // If FeedbackPanel were to call DeckService directly:
        // await DeckService.updateComment(commentId, { status });
        // onCommentsNeedRefresh(); 
      }
      // If onCommentUpdate is meant to be generic enough:
      // onCommentUpdate(commentId, { status }); // This would require onCommentUpdate to accept Partial<DeckComment>

    } catch (error) {
      console.error(`Error updating comment ${commentId} status to ${status}:`, error);
      alert(`Failed to update comment status. See console for details.`);
    }
  };

  const displayedComments = useMemo(() => {
    let filtered = selectedSlideId
      ? comments.filter(comment => comment.slideId === selectedSlideId && !comment.parentCommentId)
      : comments.filter(comment => !comment.parentCommentId);

    if (showOnlyOpen) {
      filtered = filtered.filter(comment => comment.status === 'Open');
    }
    return filtered;
  }, [comments, selectedSlideId, showOnlyOpen]);

  return (
    <div style={panelStyle}>
      <h3 style={titleStyle}>
        {selectedSlideId ? `Feedback for current slide` : 'Deck Feedback'}
      </h3>
      
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
      
      <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
        <input
          type="checkbox"
          id="showOnlyOpenComments"
          checked={showOnlyOpen}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowOnlyOpen(e.target.checked)}
          style={{ marginRight: '8px' }}
        />
        <label htmlFor="showOnlyOpenComments" style={{ fontSize: '13px', color: '#333' }}>
          Show only open comments
        </label>
      </div>

      {aggregatedInsights && aggregatedInsights.insights && (
        <div style={aggregatedInsightsSectionStyle}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>Aggregated Insights</h4>
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
      
      <h4 style={{ fontSize: '16px', fontWeight: '600', marginTop: '20px', marginBottom: '10px', borderTop: aggregatedInsights ? '1px solid #ccc' : 'none', paddingTop: aggregatedInsights ? '15px' : '0' }}>
        Individual Comments {selectedSlideId ? `(Slide ${selectedSlideId.substring(0,4)}...)` : ''}
      </h4>

      <div style={{ marginBottom: '20px' }}>
        <CommentInput
          onSubmit={handleNewTopLevelComment}
          currentUserDisplayName={currentUserDisplayName}
          currentUserAvatarUrl={currentUserAvatarUrl}
          placeholder={selectedSlideId ? "Add a comment for this slide..." : "Add overall deck feedback..."}
          isSubmitting={isSubmittingComment}
        />
      </div>

      {displayedComments.length === 0 && (
        <p style={{ color: '#777', fontStyle: 'italic' }}>
          No feedback yet for {selectedSlideId ? 'this slide' : 'this deck'}.
        </p>
      )}

      {displayedComments.map((comment, index) => (
        <div 
          key={comment.id} 
          ref={(el) => (commentItemRefs.current[comment.id] = el)}
          style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}
        >
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#555', marginTop: '12px', minWidth: '20px', textAlign: 'right' }}>{index + 1}.</span>
          <div style={{ flexGrow: 1 }}>
            <CommentThread
              comment={comment}
              onReplySubmit={handleReplySubmit}
              onCommentUpdate={onCommentUpdate}
              onCommentDelete={onCommentDelete}
              onCommentStatusUpdate={onCommentStatusUpdate} // Pass down the prop
              isAdminOrDeckOwnerView={isAdminOrDeckOwnerView} // Pass down
              currentUserId={currentUserId}
              currentUserDisplayName={currentUserDisplayName}
              currentUserAvatarUrl={currentUserAvatarUrl}
              isSubmittingReply={isSubmittingReply}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
