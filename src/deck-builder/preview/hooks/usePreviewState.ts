import { useState, useEffect, useCallback, RefObject } from 'react';
import { supabase } from '../../../lib/supabase.ts';
import { Deck, DeckSection, VisualComponent, DeckComment } from '../../types/index.ts'; // Added DeckComment
import { AccessibilitySettings } from '../components/AccessibilityToolbar.tsx';

// Default logical slide dimensions (fallback values if no custom dimensions are set)
export const DEFAULT_LOGICAL_SLIDE_WIDTH = 960;
export const DEFAULT_LOGICAL_SLIDE_HEIGHT = 540;

export interface PreviewState {
  deck: Deck | null;
  currentSlideIndex: number;
  isLoading: boolean;
  error: string | null;
  isFullscreen: boolean;
  accessibilitySettings: AccessibilitySettings;
  isPresenterNotesVisible: boolean; 
  isSlideNavigatorVisible: boolean;
  zoomLevel: number;
  comments: DeckComment[]; // Added for managing comments
  isFullScreenEditMode: boolean; // New state for fullscreen edit mode
}

export interface PreviewActions {
  goToNextSlide: () => void;
  goToPrevSlide: () => void;
  goToSlide: (index: number) => void;
  toggleFullscreen: () => void;
  updateAccessibilitySettings: (newSettings: Partial<AccessibilitySettings>) => void;
  retryFetch: () => void;
  togglePresenterNotes: () => void;
  toggleSlideNavigator: () => void;
  addCommentToState: (comment: DeckComment) => void; // Added for managing comments
  toggleFullScreenEditMode: () => void; // New action
}

export const usePreviewState = (
  deckId: string | undefined,
  slideViewportRef: RefObject<HTMLDivElement>,
  initialDeck?: Deck
): [PreviewState, PreviewActions] => {
  const [deck, setDeck] = useState<Deck | null>(initialDeck || null); // Use initialDeck if provided
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  // If initialDeck is provided, we are not initially loading from DB
  const [isLoading, setIsLoading] = useState(initialDeck ? false : true); 
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({ highContrast: false });
  const [isPresenterNotesVisible, setIsPresenterNotesVisible] = useState(false);
  const [isSlideNavigatorVisible, setIsSlideNavigatorVisible] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [comments, setComments] = useState<DeckComment[]>([]); // Initialized comments state
  const [isFullScreenEditMode, setIsFullScreenEditMode] = useState(false); // New state

  const addCommentToState = useCallback((comment: DeckComment) => {
    setComments(prev => [...prev, comment]);
  }, []);

  const toggleFullScreenEditMode = useCallback(() => {
    // Only allow edit mode if also in fullscreen
    setIsFullScreenEditMode(prev => isFullscreen ? !prev : false);
  }, [isFullscreen]);

  const fetchDeckData = useCallback(async () => {
    if (!deckId) {
      setError('No deck ID provided.');
      setIsLoading(false);
      setDeck(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('pitch_decks')
        .select('*, deck_sections(*)')
        .eq('id', deckId)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Deck not found');

      const fetchedDeckData = {
        ...data,
        sections: (data.deck_sections || []).sort((a: any, b: any) => a.order_index - b.order_index).map((s: any) => {
          let components: VisualComponent[] = [];
          if (s.content && Array.isArray(s.content)) {
            components = (s.content as any[])
              .sort((ca: any, cb: any) => (ca.order || 0) - (cb.order || 0))
              .map(compData => ({ ...compData } as VisualComponent));
          } else if (s.content && typeof s.content === 'object' && s.content.components && Array.isArray(s.content.components)) {
            components = (s.content.components as any[])
              .sort((ca: any, cb: any) => (ca.order || 0) - (cb.order || 0))
              .map(compData => ({ ...compData } as VisualComponent));
          }
          // Attempt to get presenter_notes from section data (e.g., s.presenter_notes or s.content.presenter_notes)
          // This depends on how notes are actually stored. For now, assume s.presenter_notes
          const presenterNotes = s.presenter_notes || (s.content as any)?.presenter_notes || undefined;

          return {
            id: s.id,
            type: s.type as DeckSection['type'],
            title: s.title,
            width: s.width, // Explicitly include width from database record
            height: s.height, // Explicitly include height from database record
            components: components,
            order: s.order_index,
            slideStyle: s.slide_style || s.slideStyle || undefined,
            presenter_notes: presenterNotes, // Add presenter_notes to the section object
          } as DeckSection;
        }),
        theme: undefined, // Theme fetching to be added if necessary
      };
      
      const finalDeck: Deck = {
        id: fetchedDeckData.id,
        title: fetchedDeckData.title,
        sections: fetchedDeckData.sections,
        template_id: fetchedDeckData.template_id,
        created_at: fetchedDeckData.created_at,
        updated_at: fetchedDeckData.updated_at,
        user_id: fetchedDeckData.owner_id,
        theme: fetchedDeckData.theme,
      };

      setDeck(finalDeck);
      setCurrentSlideIndex(0);
    } catch (err: any) {
      console.error('Error fetching deck in usePreviewState:', err);
      setError(err.message || 'Failed to load deck.');
      setDeck(null);
    } finally {
      setIsLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    // Only fetch if no initialDeck was provided and there's a deckId
    if (!initialDeck && deckId) {
      fetchDeckData();
    } else if (initialDeck) {
      // If initialDeck is provided, ensure sections are sorted (if applicable from template creation)
      // This might be redundant if DeckService.createDeckFromTemplate already sorts.
      const sortedSections = (initialDeck.sections || []).sort((a, b) => (a.order || 0) - (b.order || 0));
      setDeck({ ...initialDeck, sections: sortedSections });
      setIsLoading(false);
    }
  }, [fetchDeckData, deckId, initialDeck]);

  const goToNextSlide = useCallback(() => {
    if (deck && currentSlideIndex < deck.sections.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  }, [deck, currentSlideIndex]);

  const goToPrevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  }, [currentSlideIndex]);

  const goToSlide = useCallback((index: number) => {
    if (deck && index >= 0 && index < deck.sections.length) {
      setCurrentSlideIndex(index);
    }
  }, [deck]);

  const toggleFullscreen = useCallback(() => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
          setIsFullScreenEditMode(false); // Exit edit mode when exiting fullscreen
        });
      }
    }
  }, []);
  
  // Update isFullscreen state based on actual browser fullscreen state
  // Also disable fullscreen edit mode if fullscreen is exited externally
  useEffect(() => {
    const handleFullscreenChange = () => {
      const currentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(currentlyFullscreen);
      if (!currentlyFullscreen) {
        setIsFullScreenEditMode(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);


  const updateAccessibilitySettings = useCallback((newSettings: Partial<AccessibilitySettings>) => {
    setAccessibilitySettings((prevSettings: AccessibilitySettings) => ({ ...prevSettings, ...newSettings }));
  }, []);

  const togglePresenterNotes = useCallback(() => {
    setIsPresenterNotesVisible(prev => !prev);
  }, []);

  const toggleSlideNavigator = useCallback(() => { 
    setIsSlideNavigatorVisible(prev => !prev);
  }, []);

  useEffect(() => {
    const calculateZoom = () => {
      if (slideViewportRef.current) {
        const viewportWidth = slideViewportRef.current.offsetWidth;
        const viewportHeight = slideViewportRef.current.offsetHeight;
        const currentSlide = deck?.sections?.[currentSlideIndex];
        
        // Always use section dimensions when available
        const logicalWidth = currentSlide?.width || DEFAULT_LOGICAL_SLIDE_WIDTH;
        const logicalHeight = currentSlide?.height || DEFAULT_LOGICAL_SLIDE_HEIGHT;

        // Ensure dimensions are positive to avoid division by zero or negative scales
        if (viewportWidth > 0 && viewportHeight > 0 && logicalWidth > 0 && logicalHeight > 0) {
          const scaleX = viewportWidth / logicalWidth;
          const scaleY = viewportHeight / logicalHeight;
          // Use Math.max(0, ...) to ensure zoom is not negative if dimensions are unexpectedly small
          setZoomLevel(Math.max(0.1, Math.min(scaleX, scaleY))); // Ensure zoom is at least 0.1
        } else {
          setZoomLevel(1); // Default to 1 if viewport or canvas dimensions are not valid
        }
      } else {
        setZoomLevel(1); // Default to 1 if ref is not available
      }
    };

    calculateZoom(); // Initial calculation
    
    // Recalculate on window resize
    window.addEventListener('resize', calculateZoom);
    
    // Also consider MutationObserver if viewport size can change due to other layout shifts
    // not directly tied to window resize or the specified dependencies.
    // For now, resize and dependency changes cover most cases.

    return () => window.removeEventListener('resize', calculateZoom);
  }, [slideViewportRef, isFullscreen, isPresenterNotesVisible, isSlideNavigatorVisible, deck, currentSlideIndex]);

  const state: PreviewState = {
    deck,
    currentSlideIndex,
    isLoading,
    error,
    isFullscreen,
    accessibilitySettings,
    isPresenterNotesVisible,
    isSlideNavigatorVisible,
    zoomLevel,
    comments, // Added comments to returned state
    isFullScreenEditMode, // Added new state
  };

  const actions: PreviewActions = {
    goToNextSlide,
    goToPrevSlide,
    goToSlide,
    toggleFullscreen,
    updateAccessibilitySettings,
    retryFetch: fetchDeckData,
    togglePresenterNotes,
    toggleSlideNavigator,
    addCommentToState, // Added action to returned actions
    toggleFullScreenEditMode, // Added new action
  };

  return [state, actions];
};
