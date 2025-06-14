import React, { useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Deck, DeckTheme, DeckComment, FeedbackCategory } from '../../types/index.ts';
import PreviewSlide from './PreviewSlide.tsx';
import PreviewControls from './PreviewControls.tsx';
import { AccessibilitySettings } from './AccessibilityToolbar.tsx';
import ScreenReaderAnnouncer from './ScreenReaderAnnouncer.tsx';
import PresenterNotesPanel from './PresenterNotesPanel.tsx';
import SlideNavigator from './SlideNavigator.tsx';
import { usePreviewState } from '../hooks/usePreviewState.ts';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation.ts';
import '../styles/preview.css';
import { ClickToCommentLayer } from '../../components/feedback/ClickToCommentLayer.tsx';
import { CommentBubble } from '../../components/feedback/CommentBubble.tsx';
import { DeckService } from '../../services/deckService.ts';

interface DeckPreviewerProps {
  deckId?: string;
  isPublicView?: boolean;
  enableCommenting?: boolean;
  shareToken?: string | null | undefined;  // Updated to accept the types that are actually passed
  reviewerSessionId?: string;
  reviewerDisplayName?: string | null;
  reviewerEmail?: string | null;
  onLayerCommentAdded?: (comment: DeckComment) => void;
  disableActions?: boolean;
  onClosePreview?: () => void;
  initialDeckFromLibrary?: Deck;
  onSlideChange?: (slideId: string) => void;
}

const FALLBACK_LOGICAL_SLIDE_WIDTH = 960; 
const FALLBACK_LOGICAL_SLIDE_HEIGHT = 540;

const DeckPreviewer: React.FC<DeckPreviewerProps> = ({
  deckId: propDeckId,
  isPublicView,
  enableCommenting,
  shareToken,
  reviewerSessionId,
  reviewerDisplayName,
  onLayerCommentAdded,
  disableActions = false,
  onClosePreview,
  initialDeckFromLibrary,
  onSlideChange,
}) => {
  const params = useParams();
  const navigate = useNavigate();
  const deckIdToUse = initialDeckFromLibrary?.id || propDeckId || params.deckId;

  const [overrideZoom, setOverrideZoom] = React.useState<number | null>(null);
  const [selectedCommentId, setSelectedCommentId] = React.useState<string | null>(null);
  const slideViewportRef = React.useRef<HTMLDivElement>(null);

  const [
    { deck, currentSlideIndex, isLoading, error, isFullscreen, accessibilitySettings, isPresenterNotesVisible, zoomLevel, isSlideNavigatorVisible, comments, isFullScreenEditMode },
    { goToNextSlide, goToPrevSlide, goToSlide, toggleFullscreen, updateAccessibilitySettings, retryFetch, togglePresenterNotes, toggleSlideNavigator, addCommentToState, toggleFullScreenEditMode }
  ] = usePreviewState(deckIdToUse, slideViewportRef, initialDeckFromLibrary);

  const currentSlide = deck?.sections?.[currentSlideIndex];

  useEffect(() => {
    if (currentSlide?.id) {
      onSlideChange?.(currentSlide.id);
    }
  }, [currentSlide?.id, onSlideChange]);
  
  // Extract dimensions directly from the section to ensure they're always read from there
  const sectionWidth = currentSlide?.width;
  const sectionHeight = currentSlide?.height;
  
  // Only fall back if truly undefined
  const logicalWidth = sectionWidth !== undefined ? sectionWidth : FALLBACK_LOGICAL_SLIDE_WIDTH;
  const logicalHeight = sectionHeight !== undefined ? sectionHeight : FALLBACK_LOGICAL_SLIDE_HEIGHT;
  
  console.log('DeckPreviewer dimensions:', {
    currentSlideIndex,
    sectionId: currentSlide?.id,
    directSectionWidth: sectionWidth,
    directSectionHeight: sectionHeight,
    finalLogicalWidth: logicalWidth,
    finalLogicalHeight: logicalHeight,
    fallbackWidth: FALLBACK_LOGICAL_SLIDE_WIDTH,
    fallbackHeight: FALLBACK_LOGICAL_SLIDE_HEIGHT,
    sectionData: currentSlide ? JSON.stringify({
      id: currentSlide.id,
      width: currentSlide.width,
      height: currentSlide.height,
      title: currentSlide.title
    }) : 'No section data'
  });

  useEffect(() => {
    const handleResize = () => {
      if (isFullscreen) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Use the values calculated above
        const currentWidth = logicalWidth;
        const currentHeight = logicalHeight;
        
        const newScale = Math.min(
          viewportWidth / currentWidth,
          viewportHeight / currentHeight
        );
        setOverrideZoom(newScale);
      }
    };

    if (isFullscreen) {
      handleResize(); // Initial calculation
      window.addEventListener('resize', handleResize);
    } else {
      setOverrideZoom(null);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isFullscreen, logicalWidth, logicalHeight]);

  const handleCommentSubmitOnLayer = useCallback(async (
    text: string,
    parentCommentId?: string,
    voiceNoteUrl?: string,
    markupData?: any,
    feedbackCategory?: FeedbackCategory,
    componentId?: string,
    slideId?: string | null,
    coordinates?: { x: number; y: number }
  ) => {
    // Enhanced defensive null checking
    if (!deck) {
      console.error("Cannot submit comment: Missing deck data");
      return;
    }
    
    if (!shareToken) {
      console.error("Cannot submit comment: Missing share token");
      return;
    }
    
    if (!reviewerSessionId) {
      console.error("Cannot submit comment: Missing reviewer session ID");
      return;
    }
    try {
      const commentData: Omit<DeckComment, 'id' | 'createdAt' | 'updatedAt' | 'replies' | 'reactions' | 'reviewerSessionId' | 'feedbackWeight' | 'aiSentimentScore' | 'aiExpertiseScore' | 'aiImprovementCategory'> = {
        deckId: deck.id,
        slideId: slideId ?? '',
        textContent: text,
        authorDisplayName: reviewerDisplayName || 'Anonymous Reviewer',
        commentType: 'General',
        status: 'Open',
        urgency: 'None',
        coordinates,
        elementId: componentId,
        voiceNoteUrl,
        markupData,
        feedback_category: feedbackCategory || 'General',
        parentCommentId: parentCommentId,
      };
      const newComment = await DeckService.addComment(deck.id, commentData, shareToken, reviewerSessionId);
      addCommentToState(newComment);
      onLayerCommentAdded?.(newComment);
    } catch (error) {
      console.error('Failed to submit comment via layer:', error);
    }
  }, [deck, shareToken, reviewerSessionId, addCommentToState, onLayerCommentAdded, reviewerDisplayName]);

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
  
  // Enhanced check for commenting enabled status with more explicit logging
  const actualCommentingEnabledForLayer = !!enableCommenting && !!shareToken && !!reviewerSessionId && !!deck;
  
  // Log the commenting status for debugging
  useEffect(() => {
    if (enableCommenting && !actualCommentingEnabledForLayer) {
      console.log('Commenting is enabled but not active due to missing:', {
        hasShareToken: !!shareToken,
        hasReviewerSessionId: !!reviewerSessionId,
        hasDeck: !!deck
      });
    }
  }, [enableCommenting, actualCommentingEnabledForLayer, shareToken, reviewerSessionId, deck]);

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
      
      <div className="preview-main-area">
        {!isFullscreen && isSlideNavigatorVisible && deck && deck.sections && deck.sections.length > 0 && (
          <SlideNavigator
            slides={deck.sections}
            currentSlideIndex={currentSlideIndex}
            onNavigateToSlide={goToSlide}
          />
        )}

        <div ref={slideViewportRef} className={`preview-slide-viewport ${isPresenterNotesVisible && !isFullscreen ? 'with-presenter-notes' : ''} ${isFullscreen ? 'fullscreen' : ''}`}>
          {isFullscreen ? (
            <div className="fullscreen-slide-container" style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              background: currentTheme?.colors?.background || '#000',
            }}>
              <div style={{
                width: `${logicalWidth}px`,
                height: `${logicalHeight}px`,
                transform: `scale(${overrideZoom || 1})`,
                transformOrigin: 'center center',
                position: 'relative'
              }}>
                <PreviewSlide
                  section={currentSlide}
                  theme={currentTheme as DeckTheme}
                  zoomLevel={1}
                  logicalWidth={logicalWidth}
                  logicalHeight={logicalHeight}
                  previewMode={!isFullScreenEditMode || !!isPublicView}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                />
              </div>
            </div>
          ) : (
            <div
              className="preview-slide-wrapper"
              style={{
                width: `${logicalWidth}px`,
                height: `${logicalHeight}px`,
                transform: `scale(${zoomLevel || 1})`,
                transformOrigin: 'center center',
                overflow: 'hidden',
                position: 'relative',
                boxSizing: 'border-box',
                margin: '0 auto',
              }}
            >
              <PreviewSlide
                section={currentSlide}
                theme={currentTheme as DeckTheme}
                zoomLevel={1}
                logicalWidth={logicalWidth}
                logicalHeight={logicalHeight}
                previewMode={!isFullScreenEditMode || !!isPublicView}
                style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
              />
            </div>
          )}
          
          {enableCommenting && currentSlide && deck && !isFullScreenEditMode && (
            <ClickToCommentLayer
              slideId={currentSlide.id}
              onCommentSubmit={handleCommentSubmitOnLayer}
              isCommentingEnabled={actualCommentingEnabledForLayer}
              slideDimensions={{ width: logicalWidth, height: logicalHeight }}
            />
          )}
          {enableCommenting && comments && comments.filter((c: DeckComment) => c.slideId === currentSlide.id).map((comment: DeckComment) => (
            <CommentBubble
              key={comment.id}
              comment={comment}
              onClick={() => setSelectedCommentId(comment.id === selectedCommentId ? null : comment.id)}
              isSelected={comment.id === selectedCommentId}
            />
          ))}
        </div>
        
        {!disableActions && isPresenterNotesVisible && !isFullscreen && currentSlide && (
          <PresenterNotesPanel 
            notes={currentSlide.presenter_notes}
            isVisible={true}
            onClose={togglePresenterNotes}
          />
        )}
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
            canvasWidth={logicalWidth}
            canvasHeight={logicalHeight}
            onCanvasWidthChange={() => {}}
            onCanvasHeightChange={() => {}}
        />
      )}
    </div>
  );
};

export default DeckPreviewer;
