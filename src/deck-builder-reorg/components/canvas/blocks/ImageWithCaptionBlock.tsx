import React from 'react';
import { ImageWithCaptionBlock } from '../../../types/blocks.ts';
import { Card } from '../../../../components/ui/card.tsx';

interface ImageWithCaptionBlockProps extends Omit<ImageWithCaptionBlock, 'type' | 'id'> {
  onUpdate?: (data: Partial<ImageWithCaptionBlock>) => void;
}

export const ImageWithCaption: React.FC<ImageWithCaptionBlockProps> = ({
  src,
  alt,
  caption,
  captionPosition = 'bottom',
  captionStyle = 'simple',
  imageStyle = 'rounded',
  textAlign = 'left',
  onUpdate,
}) => {
  const imageClasses: Record<string, string> = {
    rounded: 'rounded-lg',
    shadow: 'shadow-lg',
    'full-bleed': '',
  };

  const captionContainerClasses = `absolute left-0 right-0 p-4 ${
    captionPosition.includes('bottom') ? 'bottom-0' : 'top-0'
  }`;

  const captionClasses: Record<string, string> = {
    simple: 'text-sm',
    card: 'p-4 bg-white shadow-md',
    'transparent-overlay': 'bg-black bg-opacity-50 text-white',
  };

  return (
    <Card className="relative w-full h-full overflow-hidden">
      <img src={src} alt={alt || ''} className={`w-full h-full object-cover ${imageClasses[imageStyle as keyof typeof imageClasses]}`} />
      <div className={`${captionContainerClasses} ${captionClasses[captionStyle as keyof typeof captionClasses]}`} style={{ textAlign }}>
        {caption}
      </div>
    </Card>
  );
};

export default ImageWithCaption;
