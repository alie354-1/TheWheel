import React, { useRef, useLayoutEffect, useState } from 'react'; // Changed to useLayoutEffect
import { DeckSection, DeckTheme } from '../../types'; // Assuming DeckTheme is also in ../../types
import PreviewSlide from './PreviewSlide'; // Import PreviewSlide

// Logical dimensions for a full slide, used for scaling
const LOGICAL_SLIDE_WIDTH = 1280;
const LOGICAL_SLIDE_HEIGHT = 720;

interface SlideThumbnailProps {
  slide: DeckSection;
  index: number;
  isActive: boolean;
  onClick: (index: number) => void;
  theme: DeckTheme | null; // Updated theme prop
}

const SlideThumbnail: React.FC<SlideThumbnailProps> = ({
  slide,
  index,
  isActive,
  onClick,
  theme,
}) => {
  const thumbnailItemRef = useRef<HTMLDivElement>(null);
  const [thumbnailZoomLevel, setThumbnailZoomLevel] = useState<number>(0);

  useLayoutEffect(() => { // Changed to useLayoutEffect
    if (thumbnailItemRef.current && thumbnailItemRef.current.offsetWidth > 0) {
      const calculatedZoom = thumbnailItemRef.current.offsetWidth / LOGICAL_SLIDE_WIDTH;
      setThumbnailZoomLevel(calculatedZoom);
    } else if (thumbnailItemRef.current) {
      // Fallback or error logging if offsetWidth is not available as expected
      // console.warn(`SlideThumbnail ${index}: offsetWidth is 0 or invalid.`);
      setThumbnailZoomLevel(0.0001); // Tiny zoom to ensure PreviewSlide attempts to render
    }
    // This effect should run when the component mounts and when slide or isActive changes,
    // as these might affect layout or content requiring a re-calculation of zoom.
  }, [slide, isActive, index]); // Added index for logging, ensure deps are minimal and correct

  const handleClick = () => {
    onClick(index);
  };

  const title = slide.title || `Slide ${index + 1}`;

  return (
    <div
      ref={thumbnailItemRef}
      className={`slide-thumbnail-item ${isActive ? 'active' : ''}`} // Uses class from preview.css
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      aria-label={`Go to slide ${index + 1}: ${title}`}
      aria-current={isActive ? 'true' : 'false'}
      // Ensure `preview.css` handles aspect-ratio, width, overflow: hidden for this class
    >
      {thumbnailZoomLevel > 0 && (
        <PreviewSlide
          section={slide}
          theme={theme}
          zoomLevel={thumbnailZoomLevel}
          logicalWidth={LOGICAL_SLIDE_WIDTH}
          logicalHeight={LOGICAL_SLIDE_HEIGHT}
          // Add a prop like `isThumbnailContext={true}` or `previewMode="thumbnail"`
          // if PreviewSlide needs to disable internal interactivity or alter behavior.
        />
      )}
    </div>
  );
};

export default SlideThumbnail;
