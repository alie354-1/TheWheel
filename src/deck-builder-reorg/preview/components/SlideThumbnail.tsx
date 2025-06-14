import React from 'react';
import { DeckSection } from '../../types/index.ts';

interface SlideThumbnailProps {
  slide: DeckSection;
  index: number;
  isActive: boolean;
  onClick: (index: number) => void;
}

const SlideThumbnail: React.FC<SlideThumbnailProps> = ({
  slide,
  index,
  isActive,
  onClick,
}) => {
  const handleClick = () => {
    onClick(index);
  };

  const title = slide.title || `Slide ${index + 1}`;
  const slideType = slide.type || 'custom';

  return (
    <div
      className={`slide-thumbnail-item ${isActive ? 'active' : ''}`}
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
    >
      <div className="slide-thumbnail-number">{index + 1}</div>
      <div className="slide-thumbnail-info">
        <div className="slide-thumbnail-title">{title}</div>
        <div className="slide-thumbnail-type">{slideType}</div>
      </div>
    </div>
  );
};

export default SlideThumbnail;
