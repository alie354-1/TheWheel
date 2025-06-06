import React from 'react';
import { DeckSection } from '../../types'; // Adjust path as necessary
import SlideThumbnail from './SlideThumbnail';

interface SlideNavigatorProps {
  slides: DeckSection[];
  currentSlideIndex: number;
  onNavigateToSlide: (index: number) => void;
  theme?: any; // Optional theme for styling
  isVisible?: boolean; // To control visibility, e.g., if it's collapsible
}

const SlideNavigator: React.FC<SlideNavigatorProps> = ({
  slides,
  currentSlideIndex,
  onNavigateToSlide,
  theme,
  isVisible = true, // Default to visible
}) => {
  if (!isVisible || !slides || slides.length === 0) {
    return null;
  }

  // Removed inline navigatorStyle, styles will come from "slide-navigator-panel" CSS class

  return (
    <div className="slide-navigator-panel" role="navigation" aria-label="Slide Navigator">
      {/* The header can be added here if desired, or kept in CSS if simple */}
      <div className="slide-navigator-header">Slides</div>
      <div className="slide-navigator-list">
        {slides.map((slide, index) => (
          <SlideThumbnail
            key={slide.id || `slide-${index}`} // Prefer stable ID if available
            slide={slide}
            index={index}
            isActive={index === currentSlideIndex}
            onClick={onNavigateToSlide} // Ensure this prop is correctly named if SlideThumbnail expects onNavigate
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
};

export default SlideNavigator;
