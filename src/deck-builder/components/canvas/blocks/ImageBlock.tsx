import React from 'react';
import { ImageBlock as ImageBlockType } from '../../../types/blocks.ts';
import ImageDropzone from '../../ImageDropzone.tsx';

interface ImageBlockProps {
  block: ImageBlockType;
  onUpdate: (data: Partial<ImageBlockType>) => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ block, onUpdate }) => {
  const handleImageUpload = (url: string) => {
    onUpdate({ src: url });
  };

  return (
    <div>
      {block.src ? (
        <img src={block.src} alt={block.alt} style={{ width: '100%', height: 'auto' }} />
      ) : (
        <ImageDropzone onUpload={handleImageUpload} />
      )}
    </div>
  );
};
