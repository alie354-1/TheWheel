import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Deck, DeckTheme, DeckComment } from '../../types/index.ts'; // Added Deck, Combined DeckComment here
import PreviewSlide from './PreviewSlide.tsx';
import PreviewControls from './PreviewControls.tsx';
import { AccessibilitySettings } from './AccessibilityToolbar.tsx';
import ScreenReaderAnnouncer from './ScreenReaderAnnouncer.tsx';
import PresenterNotesPanel from './PresenterNotesPanel.tsx'; // Ensure this is imported
import SlideNavigator from './SlideNavigator.tsx'; // Import SlideNavigator
import { usePreviewState } from '../hooks/usePreviewState.ts';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation.ts';
import '../styles/preview.css';
import { ClickToCommentLayer } from '../../components/feedback/ClickToCommentLayer.tsx'; // Added for commenting
import { CommentBubble } from '../../components/feedback/CommentBubble.tsx'; // Added for displaying comment markers
import { DeckService } from '../../services/deckService.ts'; // For submitting comments
// DeckComment is now imported from '../../types/index.ts'

interface DeckPreviewerProps {
  deckId?: string;
  isPublicView?: boolean; // Added for public sharing context
  enableCommenting?: boolean; // To enable commenting features
  shareToken?: string; // Needed for comment submission in shared context
  reviewerSessionId?: string; // Needed for comment submission
  reviewerDisplayName?: string | null; // For comment author display
  reviewerEmail?: string | null; // For additional context if needed
  onLayerCommentAdded?: (comment: DeckComment) => void; // Callback for when a comment is added via the layer
  disableActions?: boolean; // New prop to disable export, presenter notes, etc.
  onClosePreview?: () => void; // Prop for closing the preview
  initialDeckFromLibrary?: Deck; // For use in DeckLibraryPage flow
}

// Define initial logical slide dimensions
const INITIAL_LOGICAL_SLIDE_WIDTH = 1280; 
const INITIAL_LOGICAL_SLIDE_HEIGHT = 720;


const DeckPreviewer: React.FC<DeckPreviewerProps> = ({
  deckId: propDeckId,
  isPublicView,
  enableCommenting,
  shareToken, // Destructure new props
  reviewerSessionId, // Destructure new props
  reviewerDisplayName, // Destructure new prop
  reviewerEmail, // Destructure new prop
  onLayerCommentAdded, // Destructure new prop
  disableActions = false, // Destructure new prop with default
  onClosePreview, // Destructure the new prop
  initialDeckFromLibrary, // Destructure new prop
}) => {
  const params = useParams();
  const navigate = useNavigate();
  // Use initialDeckFromLibrary's ID if available, otherwise fallback to prop or route param
  const deckIdToUse = initialDeckFromLibrary?.id || propDeckId || params.deckId;

  const [canvasWidth, setCanvasWidth] = React.useState<number>(INITIAL_LOGICAL_SLIDE_WIDTH);
  const [canvasHeight, setCanvasHeight] = React.useState<number>(INITIAL_LOGICAL_SLIDE_HEIGHT);

  // State to override zoomLevel when in fullscreen mode
  const [overrideZoom, setOverrideZoom] = React.useState<number | null>(null);

  const [selectedCommentId, setSelectedCommentId] = React.useState<string | null>(null); // State for selected comment bubble
  const slideViewportRef = React.useRef<HTMLDivElement>(null); // Ensure React.useRef is used

  const [
    { deck, currentSlideIndex, isLoading, error, isFullscreen, accessibilitySettings, isPresenterNotesVisible, zoomLevel, isSlideNavigatorVisible, comments, isFullScreenEditMode },
    { goToNextSlide, goToPrevSlide, goToSlide, toggleFullscreen, updateAccessibilitySettings, retryFetch, togglePresenterNotes, toggleSlideNavigator, addCommentToState, toggleFullScreenEditMode }
  ] = usePreviewState(deckIdToUse, slideViewportRef, initialDeckFromLibrary, canvasWidth, canvasHeight);
  
  React.useEffect(() => {
    if (isFullscreen) {
      // Use the actual window size instead of measuring the container
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      // Compute the scale so the 1280×720 "logical slide" fills as much as possible:
      const newScale = Math.min(
        viewportWidth / INITIAL_LOGICAL_SLIDE_WIDTH,
        viewportHeight / INITIAL_LOGICAL_SLIDE_HEIGHT
      );
      setOverrideZoom(newScale);
      console.log(
        '[DeckPreviewer] Fullscreen scale:',
        newScale,
        'window:',
        viewportWidth,
        '×',
        viewportHeight
      );
    } else {
      setOverrideZoom(null);
    }

    // Add window resize handler for fullscreen mode
    const handleResize = () => {
      if (isFullscreen) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const newScale = Math.min(
          viewportWidth / INITIAL_LOGICAL_SLIDE_WIDTH,
          viewportHeight / INITIAL_LOGICAL_SLIDE_HEIGHT
        );
        setOverrideZoom(newScale);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isFullscreen]);
  


  // Removed local handleClosePreview as it's now passed via props

  const handleCommentSubmitOnLayer = useCallback(async (
    text: string,
    coordinates: { x: number; y: number },
    slideId: string,
    elementId?: string,
    voiceNoteUrl?: string,
    markupData?: any
  ) => {
    if (!deck || !shareToken || !reviewerSessionId) {
      console.error("Cannot submit comment: Missing deck, shareToken, or reviewerSessionId");
      // Optionally, show an error to the user
      return;
    }
    try {
      const commentData: Omit<DeckComment, 'id' | 'createdAt' | 'updatedAt' | 'replies' | 'reactions' | 'reviewerSessionId' | 'feedbackWeight' | 'aiSentimentScore' | 'aiExpertiseScore' | 'aiImprovementCategory'> = {
        deckId: deck.id,
        slideId,
        textContent: text,
        authorDisplayName: reviewerDisplayName || 'Anonymous Reviewer', 
        commentType: 'General', // Or allow selection
        status: 'Open',
        urgency: 'None',
        coordinates, // Store coordinates
        elementId,
        voiceNoteUrl,
        markupData,
      };
      const newComment = await DeckService.addComment(deck.id, commentData, shareToken, reviewerSessionId);
      addCommentToState(newComment); // Update local state if usePreviewState handles it
      onLayerCommentAdded?.(newComment); // Propagate the new comment upwards
      console.log('Comment submitted via layer:', newComment);
    } catch (error) {
      console.error('Failed to submit comment via layer:', error);
      // Optionally, show an error to the user
    }
  }, [deck, shareToken, reviewerSessionId, addCommentToState]);

  useKeyboardNavigation({
    onNext: goToNextSlide,
    onPrev: goToPrevSlide,
    onToggleFullscreen: toggleFullscreen,
    isEnabled: !!deck && !isPresenterNotesVisible, 
  });
  
  const currentTheme = deck?.theme || { 
    id: 'default-preview-theme',
    name: 'Default Preview Theme',
    colors: {
      primary: '#3b82f6',
      secondary: '#1f2937',
      accent: '#10b981',
      background: '#ffffff',
      text: '#1f2937',
      slideBackground: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
    },
  };
  
  const currentSlide = deck?.sections?.[currentSlideIndex];

  // Log prerequisite values for debugging
  console.log('[DeckPreviewer] Prerequisites for commenting layer:', {
    enableCommentingProp: enableCommenting,
    shareTokenProp: shareToken,
    reviewerSessionIdProp: reviewerSessionId,
    deckFromState: !!deck, // Log boolean to avoid large object in console
  });

  // Determine if all conditions are met for the ClickToCommentLayer to be truly interactive
  const actualCommentingEnabledForLayer = !!enableCommenting && !!shareToken && !!reviewerSessionId && !!deck;
  console.log('[DeckPreviewer] actualCommentingEnabledForLayer:', actualCommentingEnabledForLayer);


  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading presentation...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500">
        Error: {error}
        <button onClick={retryFetch} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Retry
        </button>
      </div>
    );
  }

  if (!deck || !currentSlide) {
    return <div className="flex items-center justify-center h-screen">Deck or slide not available.</div>;
  }
  
  return (
    <div className={`preview-container ${isFullscreen ? 'fullscreen' : ''} ${accessibilitySettings.highContrast ? 'high-contrast' : ''}`}>
      <ScreenReaderAnnouncer message={currentSlide ? `Slide ${currentSlideIndex + 1} of ${deck.sections.length}: ${currentSlide.title || 'Untitled Slide'}` : 'Loading slide...'} />
      
      {/* New preview-main-area to wrap viewport and navigator */}
      <div className="preview-main-area">
        {/* Slide Navigator Panel - visible when not in fullscreen and deck is loaded */}
        {/* Slide Navigator Panel - visible when not in fullscreen and deck is loaded */}
        {/* Ensure isSlideNavigatorVisible from state is used here if it's meant to be togglable */}
        {!isFullscreen && isSlideNavigatorVisible && deck && deck.sections && deck.sections.length > 0 && (
          <SlideNavigator
            slides={deck.sections}
            currentSlideIndex={currentSlideIndex}
            onNavigateToSlide={goToSlide} 
            theme={currentTheme}
            // No need for toggleSlideNavigator here, it's handled by PreviewControls if needed
          />
        )}

        <div ref={slideViewportRef} className={`preview-slide-viewport ${isPresenterNotesVisible && !isFullscreen ? 'with-presenter-notes' : ''} ${isFullscreen ? 'fullscreen' : ''}`}>
            <div
            className="preview-slide-wrapper"
            style={{
              // Always use the logical slide dimensions
              width: `${INITIAL_LOGICAL_SLIDE_WIDTH}px`,
              height: `${INITIAL_LOGICAL_SLIDE_HEIGHT}px`,
              // Use overrideZoom in fullscreen mode, otherwise use normal zoomLevel
              transform: `scale(${overrideZoom !== null ? overrideZoom : zoomLevel || 1})`,
              // Use consistent transform origin for both modes
              transformOrigin: 'center center',
              overflow: 'hidden',
              position: 'relative',
              // Ensure consistent rendering between small and fullscreen
              boxSizing: 'border-box',
              margin: '0 auto',
              // Don't hardcode background color - allow slide styles to determine it
            }}
          >
            <PreviewSlide
              section={currentSlide}
              theme={currentTheme as DeckTheme}
              zoomLevel={1} // Set zoomLevel to 1 to avoid scaling inside PreviewSlide
              logicalWidth={canvasWidth}
              logicalHeight={canvasHeight}
              previewMode={!isFullScreenEditMode || !!isPublicView} // Edit mode if not public and isFullScreenEditMode is true
              onAddComponentRequested={(x, y) => {
                // In a real implementation, this would call a function to update the deck state
                // (e.g., from a context or a prop like `onUpdateDeck`)
                // For now, we'll just log it.
                console.log(`Request to add component at x: ${x}, y: ${y} on slide ${currentSlide?.id}`);
                // Example: onUpdateDeck(deck.id, currentSlide.id, { type: 'TextBlock', content: 'New Text', layout: { x, y, width: 200, height: 50 } });
              }}
              // Apply CSS for direct scaling and proper layout without transform
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                overflow: 'visible',
              }}
            />
            {enableCommenting && currentSlide && deck && !isFullScreenEditMode && ( // Disable click-to-comment layer in full screen edit mode
              <ClickToCommentLayer
                slideId={currentSlide.id}
                onCommentSubmit={handleCommentSubmitOnLayer}
                isCommentingEnabled={actualCommentingEnabledForLayer} // Use the refined condition here
                slideDimensions={{ width: canvasWidth, height: canvasHeight }}
                // currentUserDisplayName, currentUserAvatarUrl can be passed if available from reviewerSession
              />
            )}
            {/* Render Comment Bubbles for the current slide */}
            {enableCommenting && comments && comments.filter((c: DeckComment) => c.slideId === currentSlide.id).map((comment: DeckComment) => (
              <CommentBubble
                key={comment.id}
                comment={comment}
                onClick={() => setSelectedCommentId(comment.id === selectedCommentId ? null : comment.id)}
                isSelected={comment.id === selectedCommentId}
              />
            ))}
          </div>
          {/* Presenter Notes Panel - Rendered inside viewport for better layout control with flex */}
          {!disableActions && isPresenterNotesVisible && !isFullscreen && currentSlide && (
            <PresenterNotesPanel 
              notes={currentSlide.presenter_notes}
              isVisible={true} // isVisible is true if this block is rendered
              onClose={togglePresenterNotes}
            />
          )}
        </div>
      </div>

      {!isFullscreen && (
          <PreviewControls
            deck={deck} 
            disableActions={disableActions} 
            onPrev={goToPrevSlide}
            onNext={goToNextSlide}
            onToggleFullscreen={toggleFullscreen}
            onClosePreview={onClosePreview} 
            currentSlide={currentSlideIndex}
            totalSlides={deck.sections.length}
            isFullscreen={isFullscreen}
            accessibilitySettings={accessibilitySettings}
            onAccessibilityUpdate={updateAccessibilitySettings}
            onTogglePresenterNotes={togglePresenterNotes}
            isPresenterNotesVisible={isPresenterNotesVisible}
            isFullScreenEditMode={isFullScreenEditMode}
            onToggleFullScreenEditMode={toggleFullScreenEditMode}
            isPublicView={!!isPublicView}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            onCanvasWidthChange={setCanvasWidth}
            onCanvasHeightChange={setCanvasHeight}
        />
      )}
    </div>
  );
};

export default DeckPreviewer;
