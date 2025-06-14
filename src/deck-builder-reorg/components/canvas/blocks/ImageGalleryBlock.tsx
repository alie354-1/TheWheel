import React from 'react';
import { ImageGalleryBlock } from '../../../types/blocks.ts';
import { Card, CardContent } from '../../../../components/ui/card.tsx';

interface ImageGalleryBlockProps extends Omit<ImageGalleryBlock, 'type' | 'id'> {
  onUpdate?: (data: Partial<ImageGalleryBlock>) => void;
}

export const ImageGallery: React.FC<ImageGalleryBlockProps> = ({
  images,
  layout = 'grid',
  columns = 3,
  spacing = 4,
  showCaptions = 'hover',
  onUpdate,
}) => {
  const gridClass = layout === 'grid' ? `grid-cols-${columns}` : '';
  const gapClass = `gap-${spacing}`;

  return (
    <Card className="p-4 h-full">
      <CardContent className={`h-full overflow-y-auto ${gapClass} ${layout === 'grid' ? 'grid' : 'flex flex-wrap'}`}>
        {images.map((image, idx) => (
          <div key={idx} className="relative group break-inside-avoid">
            <img
              src={image.src}
              alt={image.alt || ''}
              className="w-full h-auto object-cover rounded-md"
              loading="lazy"
            />
            {image.caption && (
              <div
                className={`absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-xs transition-opacity duration-300 ${
                  showCaptions === 'hover' ? 'opacity-0 group-hover:opacity-100' : ''
                } ${showCaptions === 'none' ? 'hidden' : ''}`}
              >
                {image.caption}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ImageGallery;
