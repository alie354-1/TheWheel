import React from 'react';
import { MediaHeroBlock } from '../../../types/blocks.ts';
import { Card, CardContent } from '../../../../components/ui/card.tsx';

interface MediaHeroBlockProps extends Omit<MediaHeroBlock, 'type' | 'id'> {
  onUpdate?: (data: Partial<MediaHeroBlock>) => void;
}

export const MediaHero: React.FC<MediaHeroBlockProps> = ({
  mediaType,
  src,
  alt,
  poster,
  headline,
  subheadline,
  description,
  textPosition = 'overlay-center',
  buttonText,
  buttonUrl,
  backgroundColor,
  textColor,
  onUpdate,
}) => {
  const textContainerClasses = `absolute p-8 ${
    textPosition.includes('left') ? 'left-0' : ''
  } ${textPosition.includes('right') ? 'right-0' : ''} ${
    textPosition.includes('center') ? 'left-1/2 -translate-x-1/2' : ''
  } ${textPosition.includes('bottom') ? 'bottom-0' : ''} ${
    textPosition.includes('top') ? 'top-0' : ''
  } ${
    textPosition === 'overlay-center' ? 'top-1/2 -translate-y-1/2' : ''
  } text-white`;

  return (
    <div className="relative w-full h-full">
      <Card className="relative w-full h-full overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundColor }}></div>
      {mediaType === 'image' ? (
        <img src={src} alt={alt || ''} className="w-full h-full object-cover" />
      ) : (
        <video src={src} poster={poster} className="w-full h-full object-cover" controls />
      )}
      <div className={textContainerClasses} style={{ color: textColor }}>
        <h2 className="text-4xl font-bold">{headline}</h2>
        {subheadline && <h3 className="text-2xl">{subheadline}</h3>}
        {description && <p className="mt-4">{description}</p>}
        {buttonText && buttonUrl && (
          <a href={buttonUrl} className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">
            {buttonText}
          </a>
        )}
      </div>
    </Card>
    </div>
  );
};

export default MediaHero;
