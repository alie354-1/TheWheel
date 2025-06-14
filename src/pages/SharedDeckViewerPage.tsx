import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { DeckService } from '../deck-builder/services/deckService.ts';
import { Deck, SmartShareLink, ReviewerSession, DeckComment, ShareType } from '../deck-builder/types/index.ts';
import { AnonymousCommentForm } from '../deck-builder/components/sharing/AnonymousCommentForm.tsx';
import { SharedFeedbackPanel } from '../deck-builder/components/feedback/SharedFeedbackPanel.tsx';
import ReviewerInfoModal from '../deck-builder/components/sharing/ReviewerInfoModal.tsx';
import { AuthorNoteModal } from '../deck-builder/components/sharing/AuthorNoteModal.tsx';
import { InteractiveTutorialModal } from '../deck-builder/components/sharing/InteractiveTutorialModal.tsx';
// import { DeckPreview } from '../deck-builder/components/DeckPreview'; // Old Preview
import DeckPreviewer from '../deck-builder/preview/components/DeckPreviewer.tsx';

interface SharedDeckViewData {
  deck: Deck;
  shareLink: SmartShareLink;
}

const SharedDeckViewerPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken?: string }>();
  
  const [deckViewData, setDeckViewData] = useState<SharedDeckViewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<DeckComment[]>([]);
  const [currentReviewerSession, setCurrentReviewerSession] = useState<ReviewerSession | null>(null);
  const [showReviewerInfoModal, setShowReviewerInfoModal] = useState(false);
  const [isSubmittingReviewerInfo, setIsSubmittingReviewerInfo] = useState(false);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [showAuthorNoteModal, setShowAuthorNoteModal] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [hasViewedAuthorNote, setHasViewedAuthorNote] = useState(false);
  const [shouldCheckReviewerDetails, setShouldCheckReviewerDetails] = useState(false);

  const getSessionId = (): string => {
    let sessionId = localStorage.getItem('reviewerSessionId');
    if (!sessionId) {
      sessionId = `anon_session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('reviewerSessionId', sessionId);
    }
    return sessionId;
  };

  const initializeReviewerSession = useCallback(async (token: string) => {
    if (!token) return;
    const sessionId = getSessionId();
    try {
      console.log(`[SharedDeckViewerPage] initializeReviewerSession: Getting session for sessionId: ${sessionId}, token: ${token}`);
      let session = await DeckService.getReviewerSessionBySessionId(sessionId);
      if (session && session.shareToken === token) {
        console.log('[SharedDeckViewerPage] initializeReviewerSession: Found existing valid session:', session);
        setCurrentReviewerSession(session);
      } else {
        if (session) {
          console.log('[SharedDeckViewerPage] initializeReviewerSession: Found session for different token, creating new one. Old session:', session);
        } else {
          console.log('[SharedDeckViewerPage] initializeReviewerSession: No existing session found, creating new one.');
        }
        const newSessionPayload = { /* Basic details */ };
        console.log('[SharedDeckViewerPage] initializeReviewerSession: Calling createOrUpdateReviewerSession with payload:', newSessionPayload);
        const newSession = await DeckService.createOrUpdateReviewerSession(token, sessionId, newSessionPayload);
        console.log('[SharedDeckViewerPage] initializeReviewerSession: Created/updated session:', newSession);
        setCurrentReviewerSession(newSession);
      }
    } catch (err) {
      console.error("[SharedDeckViewerPage] Error in initializeReviewerSession:", err);
      setCurrentReviewerSession(null); // Explicitly set to null on error
    }
  }, []);

  // First, check for author note when deck data is loaded
  useEffect(() => {
    if (deckViewData && shareLinkAllowsCommenting(deckViewData.shareLink)) {
      if (deckViewData.shareLink.author_note && !hasViewedAuthorNote) {
        console.log('[SharedDeckViewerPage] Showing author note modal first');
        setShowAuthorNoteModal(true);
      } else {
        // No author note, we can check reviewer details
        setShouldCheckReviewerDetails(true);
      }
    }
  }, [deckViewData, hasViewedAuthorNote]);

  // Then, check for reviewer details only after author note is handled
  useEffect(() => {
    console.log('[SharedDeckViewerPage] currentReviewerSession updated:', currentReviewerSession);
    if (shouldCheckReviewerDetails && currentReviewerSession && deckViewData && shareLinkAllowsCommenting(deckViewData.shareLink)) {
      // Use camelCase for ReviewerSession type properties
      if (!currentReviewerSession.reviewerName || !currentReviewerSession.reviewerEmail) {
        console.log('[SharedDeckViewerPage] Reviewer details missing, showing modal.');
        setShowReviewerInfoModal(true);
      } else {
        setShowReviewerInfoModal(false);
      }
    }
  }, [currentReviewerSession, deckViewData, shouldCheckReviewerDetails]);


  const shareLinkAllowsCommenting = (link: SmartShareLink | undefined): boolean => {
    return !!link && link.shareType !== 'view';
  };

  useEffect(() => {
    if (!shareToken) {
      setError('No share token provided.');
      setIsLoading(false);
      return;
    }

    const fetchDeckData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await DeckService.getDeckBySmartShareToken(shareToken);
        if (data) {
          setDeckViewData(data);
          console.log('[SharedDeckViewerPage] Deck data fetched, initializing reviewer session...');
          await initializeReviewerSession(shareToken); // This will set currentReviewerSession
          // Modal display logic is now in the useEffect dependent on currentReviewerSession
          console.log('[SharedDeckViewerPage] Reviewer session initialization attempted.');
          if (shareLinkAllowsCommenting(data.shareLink)) {
            fetchComments(data.deck.id);
          }
        } else {
          setError('Invalid or expired share link.');
        }
      } catch (err) {
        console.error('Error fetching shared deck:', err);
        setError(err instanceof Error ? err.message : 'Failed to load shared deck.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeckData();
  }, [shareToken, initializeReviewerSession]);

  const fetchComments = async (deckId: string) => {
    try {
      const fetchedComments = await DeckService.getComments(deckId);
      setComments(fetchedComments);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      // Potentially set an error state for comments
    }
  };

  const handleCommentSubmitted = (newComment: DeckComment) => {
    console.log('[SharedDeckViewerPage] handleCommentSubmitted CALLED. New comment:', JSON.stringify(newComment));
    setComments(prevComments => {
      const updatedComments = [...prevComments, newComment];
      console.log('[SharedDeckViewerPage] Comments state PREVIOUS length:', prevComments.length, 'NEW length:', updatedComments.length);
      return updatedComments;
    });
    // Potentially update deck's last_feedback_activity_at if needed
  };

  useEffect(() => {
    console.log('[SharedDeckViewerPage] comments state changed, new length:', comments.length, 'comments:', JSON.stringify(comments));
  }, [comments]);

  if (isLoading) {
    return <div style={styles.container}><p>Loading shared deck...</p></div>;
  }

  if (error) {
    return <div style={styles.container}><p style={styles.errorText}>Error: {error}</p></div>;
  }

  if (!deckViewData) {
    return <div style={styles.container}><p>Deck not found.</p></div>;
  }

  const { deck, shareLink } = deckViewData;
  // Use camelCase for ReviewerSession type properties
  const canComment = shareLinkAllowsCommenting(shareLink) && !!currentReviewerSession?.reviewerName && !!currentReviewerSession?.reviewerEmail;

  const handleSaveReviewerDetails = async (details: { firstName: string; lastName: string; email: string }) => {
    if (!shareToken || !currentReviewerSession || !currentReviewerSession.sessionId) {
      console.error('[SharedDeckViewerPage] Missing shareToken or sessionId for saving reviewer details');
      setError('Could not save reviewer details. Please refresh.');
      return;
    }
    setIsSubmittingReviewerInfo(true);
    try {
      // Use camelCase for the payload, assuming DeckService.createOrUpdateReviewerSession
      // expects a Partial<ReviewerSession> or similar for its 'details' argument.
      const sessionDetailsPayload = {
        reviewerName: `${details.firstName.trim()} ${details.lastName.trim()}`,
        reviewerEmail: details.email.trim(),
      };
      const updatedSession = await DeckService.createOrUpdateReviewerSession(
        shareToken,
        currentReviewerSession.sessionId, 
        sessionDetailsPayload 
      );
      setCurrentReviewerSession(updatedSession);
      setShowReviewerInfoModal(false);
      console.log('[SharedDeckViewerPage] Reviewer details saved:', updatedSession);
    } catch (err) {
      console.error('[SharedDeckViewerPage] Error saving reviewer details:', err);
      setError(err instanceof Error ? `Failed to save details: ${err.message}` : 'Failed to save details.');
      // Keep modal open if error
    } finally {
      setIsSubmittingReviewerInfo(false);
    }
  };

  // Log props being passed
  console.log('[SharedDeckViewerPage] Props for DeckPreviewer:', {
    deckId: deck.id,
    enableCommenting: canComment,
    shareToken: shareToken || '',
    reviewerSessionId: currentReviewerSession?.id,
    reviewerDisplayName: currentReviewerSession?.reviewerName,
    reviewerEmail: currentReviewerSession?.reviewerEmail,
  });
  if (shareLinkAllowsCommenting(shareLink)) {
    console.log('[SharedDeckViewerPage] Props for AnonymousCommentForm:', {
      deckId: deck.id,
      shareToken: shareToken || '',
      reviewerSessionId: currentReviewerSession?.id,
      reviewerDisplayName: currentReviewerSession?.reviewerName,
      // disabled: !canComment, // Keep disabled logic based on canComment
    });
  }

  const handleAuthorNoteClose = () => {
    setShowAuthorNoteModal(false);
    setHasViewedAuthorNote(true);
    setShouldCheckReviewerDetails(true);
  };

  const handleShowTutorial = () => {
    setShowAuthorNoteModal(false);
    setHasViewedAuthorNote(true);
    setShowTutorialModal(true);
  };

  const handleTutorialClose = () => {
    setShowTutorialModal(false);
  };

  return (
    <div style={styles.pageLayout}>
      {showReviewerInfoModal && currentReviewerSession && (
        <ReviewerInfoModal
          isOpen={showReviewerInfoModal}
          isSubmitting={isSubmittingReviewerInfo}
          onSubmit={handleSaveReviewerDetails}
        />
      )}
      
      {showAuthorNoteModal && deckViewData?.shareLink.author_note && (
        <AuthorNoteModal
          authorNote={deckViewData.shareLink.author_note}
          deckTitle={deckViewData.deck.title}
          onContinue={handleAuthorNoteClose}
          onShowTutorial={handleShowTutorial}
          hasSeenSystemBefore={false} // TODO: Track if user has seen the system before
        />
      )}
      
      {showTutorialModal && (
        <InteractiveTutorialModal
          isOpen={showTutorialModal}
          onClose={handleTutorialClose}
        />
      )}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerInfo}>
            <h1>{deck.title}</h1>
            <p>Shared for: {shareLink.shareType.replace('_', ' ')}</p>
            {/* Use camelCase for display from ReviewerSession type */}
            {currentReviewerSession?.reviewerName && (
              <p style={{fontSize: '0.9em', color: '#555'}}>
                Viewing as: {currentReviewerSession.reviewerName} 
                {currentReviewerSession.reviewerEmail ? ` (${currentReviewerSession.reviewerEmail})` : ''}
              </p>
            )}
          </div>
          
          {shareLinkAllowsCommenting(shareLink) && (
            <button 
              onClick={() => setShowTutorialModal(true)}
              style={styles.helpButton}
              title="How to use the feedback system"
            >
              <HelpCircle size={20} />
              <span style={styles.helpButtonText}>Help</span>
            </button>
          )}
        </div>
      </header>
      
      <main style={styles.mainContent}>
        <div style={styles.deckRenderArea}>
          {shareToken && (
            <DeckPreviewer
              deckId={deck.id}
              isPublicView={true}
              enableCommenting={canComment}
              shareToken={shareToken || ''}
              reviewerSessionId={currentReviewerSession?.id}
              reviewerDisplayName={currentReviewerSession?.reviewerName}
              reviewerEmail={currentReviewerSession?.reviewerEmail}
              onLayerCommentAdded={handleCommentSubmitted}
              disableActions={true} // Disable actions like export and presenter notes for shared view
              onSlideChange={(slideId: string | null) => setSelectedSlideId(slideId)}
            />
          )}
        </div>

        {shareLinkAllowsCommenting(shareLink) && currentReviewerSession && (
          <aside style={styles.commentsSidebar}>
            <h2>Feedback</h2>
            {!canComment && !showReviewerInfoModal && (
              <p style={{color: 'orange', fontStyle: 'italic', textAlign: 'center', padding: '10px'}}>
                Please provide your details to enable commenting.
              </p>
            )}
            <SharedFeedbackPanel
              deckId={deck.id}
              currentDeck={deck}
              comments={comments}
              onCommentSubmit={(text: string, parentCommentId?: string, voiceNoteUrl?: string, markupData?: any, feedbackCategory?: any, componentId?: string, slideId?: string | null) => {
                // Compose a new comment object and call handleCommentSubmitted
                const newComment: DeckComment = {
                  id: `shared_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  deckId: deck.id,
                  slideId: slideId || '',
                  textContent: text,
                  authorUserId: currentReviewerSession?.id ?? 'anon',
                  authorDisplayName: currentReviewerSession?.reviewerName || 'Anonymous',
                  parentCommentId: parentCommentId,
                  voiceNoteUrl: voiceNoteUrl,
                  markupData: markupData,
                  commentType: 'General',
                  urgency: 'None',
                  status: 'Open',
                  feedback_category: feedbackCategory || 'General',
                  component_id: componentId,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  replies: [],
                  reactions: [],
                  reviewerSessionId: currentReviewerSession?.id ?? undefined,
                };
                handleCommentSubmitted(newComment);
              }}
              onCommentDelete={() => {}}
              onCommentStatusUpdate={() => {}}
              onCommentsNeedRefresh={() => {}}
              isAdminOrDeckOwnerView={false}
              currentUserId={currentReviewerSession?.id ?? ''}
              currentUserDisplayName={currentReviewerSession?.reviewerName || ''}
              selectedSlideId={selectedSlideId}
              isSubmittingComment={false}
              highlightedCommentId={null}
              onProposalsGenerated={() => {}}
              showAggregatedInsights={false}
              showOnlyOwnComments={true}
            />
          </aside>
        )}
      </main>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  pageLayout: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    padding: '10px 20px',
    backgroundColor: '#f0f0f0',
    borderBottom: '1px solid #ddd',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
  },
  helpButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#374151',
    transition: 'all 0.2s',
  },
  helpButtonText: {
    fontWeight: 500,
  },
  mainContent: {
    display: 'flex',
    flexGrow: 1,
    overflow: 'hidden', // Important for layout
  },
  deckRenderArea: {
    flexGrow: 1,
    padding: '20px',
    overflowY: 'auto', // Allow scrolling for deck content
    backgroundColor: '#fff',
  },
  commentsSidebar: {
    width: '350px',
    minWidth: '300px',
    borderLeft: '1px solid #ddd',
    padding: '20px',
    overflowY: 'auto', // Allow scrolling for comments
    backgroundColor: '#f9f9f9',
    display: 'flex',
    flexDirection: 'column',
  },
  commentsList: {
    marginTop: '20px',
    flexGrow: 1,
  },
  commentItem: {
    borderBottom: '1px solid #eee',
    padding: '10px 0',
    marginBottom: '10px',
  },
  errorText: {
    color: 'red',
  },
};

export default SharedDeckViewerPage;
