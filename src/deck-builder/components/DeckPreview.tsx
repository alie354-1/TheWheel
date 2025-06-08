import React, { useState, useRef, useEffect, useCallback, ChangeEvent } from 'react';
import { Deck, DeckSection, DeckTheme } from '../types/index.ts'; // Corrected import
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw,
  Maximize2,
  Share,
  Download,
  Settings,
  X as IconX 
} from 'lucide-react';
import { SafeTextRenderer } from './SafeTextRenderer.tsx'; // Added .tsx
import PreviewSlide from '../preview/components/PreviewSlide.tsx'; // Added .tsx

interface DeckPreviewProps {
  deck: Deck;
  isPublic?: boolean;
  onShare?: () => void;
  onEdit?: () => void;
}

export function DeckPreview({ deck, isPublic = false, onShare, onEdit }: DeckPreviewProps) {
  console.log('--- RENDERING DeckPreview component (expected to use NEW PreviewSlide) --- Timestamp:', new Date().toISOString());
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoplayInterval, setAutoplayInterval] = useState(5000);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null); // Changed to number for browser environments
  const presentationAreaRef = useRef<HTMLDivElement>(null);

  const sections = deck.sections || [];
  const totalSlides = sections.length;
  
  // Use the current section's width/height if available, otherwise fallback to 960x540
  const currentSection = sections[currentSlide];
  const LOGICAL_SLIDE_WIDTH = currentSection?.width || 960;
  const LOGICAL_SLIDE_HEIGHT = currentSection?.height || 540;
  const [previewScale, setPreviewScale] = useState(1);

  // Add logging to debug slide dimensions
  useEffect(() => {
    if (currentSection) {
      console.log('DeckPreview dimensions:', {
        sectionId: currentSection.id,
        width: currentSection.width,
        height: currentSection.height,
        effectiveWidth: LOGICAL_SLIDE_WIDTH,
        effectiveHeight: LOGICAL_SLIDE_HEIGHT
      });
    }
  }, [currentSection, LOGICAL_SLIDE_WIDTH, LOGICAL_SLIDE_HEIGHT]);

  // Responsive scaling for preview area
  useEffect(() => {
    function updateScale() {
      if (!presentationAreaRef.current) return;
      const container = presentationAreaRef.current;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      
      // In fullscreen mode with slide list, adjust for the space taken by the slide list
      const availableWidth = isFullscreen ? containerWidth - 200 : containerWidth; // 200px for slide list
      
      const scale = Math.min(
        availableWidth / LOGICAL_SLIDE_WIDTH,
        containerHeight / LOGICAL_SLIDE_HEIGHT
      );
      setPreviewScale(scale);
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [isFullscreen]);

  // Auto-play functionality
  const startAutoplay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(true);
    
    intervalRef.current = window.setInterval(() => { // Use window.setInterval for browser
      setCurrentSlide(prev => {
        if (prev >= totalSlides - 1) {
          setIsPlaying(false);
          if (intervalRef.current) clearInterval(intervalRef.current); // Clear interval here too
          return prev; 
        }
        return prev + 1;
      });
    }, autoplayInterval);
  };

  const stopAutoplay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  };

  const toggleAutoplay = () => {
    if (isPlaying) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  };

  // Navigation
  const nextSlide = useCallback(() => { // Added useCallback
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  }, [currentSlide, totalSlides]);

  const prevSlide = useCallback(() => { // Added useCallback
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  }, [currentSlide]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    if (isPlaying) {
      stopAutoplay();
      startAutoplay(); 
    }
  };

  const resetPresentation = () => {
    setCurrentSlide(0);
    stopAutoplay();
  };

  const toggleFullscreenCb = useCallback(toggleFullscreen, [isFullscreen, containerRef]); // useCallback for toggleFullscreen

  // Fullscreen functionality
  function toggleFullscreen() { // Standard function declaration
    if (!isFullscreen && containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isFullscreen) return; 
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          break;
        case 'Escape':
          e.preventDefault();
          toggleFullscreenCb(); 
          stopAutoplay();
          break;
        case 'Home':
          e.preventDefault();
          setCurrentSlide(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrentSlide(totalSlides - 1);
          break;
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyPress);
      containerRef.current?.focus(); 
    }
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, totalSlides, isFullscreen, nextSlide, prevSlide, toggleFullscreenCb, stopAutoplay]); // Added toggleFullscreenCb
  
  // For fullscreen, update on resize to get the latest window size
  const [fullscreenDims, setFullscreenDims] = useState<{ width: number; height: number }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    if (!isFullscreen) return;
    const updateDims = () => {
      setFullscreenDims({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateDims();
    window.addEventListener('resize', updateDims);
    return () => window.removeEventListener('resize', updateDims);
  }, [isFullscreen]);


  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (totalSlides === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No slides to preview</p>
      </div>
    );
  }

  // Always use the section's slideStyle for background if present
  const currentDeckThemeForPreview: DeckTheme = {
    id: deck.theme?.id || 'default-deck-preview-theme',
    name: deck.theme?.name || 'Default Deck Preview Theme',
    colors: {
      primary: deck.theme?.colors?.primary || '#3B82F6',
      secondary: deck.theme?.colors?.secondary || '#1E40AF',
      accent: deck.theme?.colors?.accent || '#60A5FA',
      background: deck.theme?.colors?.background || '#F8FAFC', 
      text: deck.theme?.colors?.text || '#1F2937',
      slideBackground: (() => {
        const sectionBg = sections[currentSlide]?.slideStyle?.background;
        const sectionBgColor = sections[currentSlide]?.slideStyle?.backgroundColor;
        
        if (typeof sectionBg === 'string' && !sectionBg.startsWith('url(')) return sectionBg; // If it's a color string
        if (typeof sectionBgColor === 'string') return sectionBgColor;
        if (typeof deck.theme?.colors?.slideBackground === 'string') return deck.theme.colors.slideBackground;
        if (typeof deck.theme?.colors?.background === 'string') return deck.theme.colors.background;
        return '#FFFFFF'; // Default fallback
      })(),
    },
    fonts: {
      heading: deck.theme?.fonts?.heading || 'Inter, system-ui, sans-serif',
      body: deck.theme?.fonts?.body || 'Inter, system-ui, sans-serif',
      caption: deck.theme?.fonts?.caption || 'Inter, system-ui, sans-serif',
    },
  };

  return (
    <div 
      ref={containerRef}
      className={`relative bg-gray-100 ${
        isFullscreen ? 'fixed inset-0 z-[1000] flex' : 'rounded-lg shadow-lg overflow-hidden'
      }`}
      tabIndex={-1} 
    >
      {!isFullscreen && (
        <div className="top-0 left-0 right-0 flex items-center justify-between p-3 bg-white border-b z-20">
          <div className="flex items-center space-x-2">
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm">
              {currentSlide + 1} / {totalSlides}
            </span>
            {!isPublic && onEdit && (
              <button
                onClick={onEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleAutoplay}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded transition-all"
              title={isPlaying ? 'Pause slideshow' : 'Start slideshow'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              onClick={resetPresentation}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded transition-all"
              title="Reset to first slide"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            {onShare && (
              <button
                onClick={onShare}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded transition-all"
                title="Share presentation"
              >
                <Share className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={toggleFullscreenCb}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded transition-all"
              title="Toggle fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {isFullscreen && (
        <>
          {/* Slide list panel */}
          <div className="w-48 bg-gray-900 overflow-y-auto flex-shrink-0">
            <div className="p-4">
              <h2 className="text-white text-sm font-semibold mb-4">Slides</h2>
              <div className="space-y-2">
                {sections.map((section: DeckSection, index: number) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-full p-2 rounded-lg transition-all ${
                      currentSlide === index 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xs opacity-60">{index + 1}</span>
                      <span className="text-sm truncate flex-1 text-left">
                        {section.title || `Slide ${index + 1}`}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex flex-col bg-black">
            {/* Top bar */}
            <div className="h-12 bg-black bg-opacity-30 flex items-center justify-between px-4 z-30">
              <h1 className="text-white text-md font-semibold truncate" title={deck.title}>{deck.title}</h1>
              <div className="flex items-center space-x-3">
                <span className="text-white text-xs">
                  {currentSlide + 1} / {totalSlides}
                </span>
                <button 
                  onClick={toggleFullscreenCb} 
                  className="text-white hover:text-gray-300 p-1.5 rounded-full focus:outline-none focus:ring-1 focus:ring-white"
                  aria-label="Exit fullscreen"
                >
                  <IconX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slide area */}
            <div
              ref={presentationAreaRef}
              className="flex-1 relative overflow-hidden"
              style={{
                backgroundColor: 'black',
              }}
            >
              {currentSection && (
                <PreviewSlide
                  section={currentSection}
                  theme={currentDeckThemeForPreview}
                  zoomLevel={previewScale}
                  logicalWidth={LOGICAL_SLIDE_WIDTH}
                  logicalHeight={LOGICAL_SLIDE_HEIGHT}
                  previewMode={true}
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                />
              )}
            </div>
          </div>
        </>
      )}

      {!isFullscreen && (
        <div
          ref={presentationAreaRef}
          className="relative w-full flex-1 flex items-center justify-center h-96 md:h-[500px] p-4"
          style={{
            backgroundColor: typeof sections[currentSlide]?.slideStyle?.backgroundColor === 'string' 
              ? sections[currentSlide]?.slideStyle?.backgroundColor 
              : (typeof deck.theme?.colors?.background === 'string' ? deck.theme.colors.background : '#F8FAFC'),
          }}
        >
          {/* Responsive preview area: center and scale slide to fit */}
          <div
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              position: 'relative',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {currentSection && (
              <div
                style={{
                  width: LOGICAL_SLIDE_WIDTH,
                  height: LOGICAL_SLIDE_HEIGHT,
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'center',
                  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                  background: 'none',
                  position: 'relative',
                }}
              >
                <PreviewSlide
                  section={currentSection}
                  theme={currentDeckThemeForPreview}
                  zoomLevel={previewScale}
                  logicalWidth={LOGICAL_SLIDE_WIDTH}
                  logicalHeight={LOGICAL_SLIDE_HEIGHT}
                  previewMode={true}
                  style={{
                    width: LOGICAL_SLIDE_WIDTH,
                    height: LOGICAL_SLIDE_HEIGHT,
                    minWidth: 0,
                    minHeight: 0,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    display: 'block',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
        
      <button
        onClick={prevSlide}
        disabled={currentSlide === 0}
        className={`absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 text-white p-2 md:p-3 rounded-full transition-all z-20
                    ${isFullscreen ? 'bg-black bg-opacity-30 hover:bg-opacity-50' : 'bg-gray-700 hover:bg-gray-800'}
                    disabled:opacity-30 disabled:cursor-not-allowed`}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      
      <button
        onClick={nextSlide}
        disabled={currentSlide === totalSlides - 1}
        className={`absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 text-white p-2 md:p-3 rounded-full transition-all z-20
                    ${isFullscreen ? 'bg-black bg-opacity-30 hover:bg-opacity-50' : 'bg-gray-700 hover:bg-gray-800'}
                    disabled:opacity-30 disabled:cursor-not-allowed`}
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      {!isFullscreen && totalSlides > 1 && (
        <div className="flex justify-center items-center space-x-2 py-3 bg-white border-t">
          {sections.map((_: DeckSection, index: number) => ( // Added types for map
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                currentSlide === index 
                  ? 'bg-blue-600 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              title={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {!isFullscreen && (
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-blue-600 transition-all duration-150"
            style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
          />
        </div>
      )}

      {!isFullscreen && !isPublic && (
        <div className="absolute top-16 right-4 z-20"> 
          <details className="relative">
            <summary className="bg-gray-700 hover:bg-gray-800 text-white p-2 rounded transition-all cursor-pointer list-none">
              <Settings className="h-4 w-4" />
            </summary>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Autoplay Speed (s)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={autoplayInterval / 1000}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAutoplayInterval(parseInt(e.target.value) * 1000)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-gray-500 mt-1 text-center">
                {autoplayInterval / 1000}s
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
