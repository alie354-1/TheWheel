import React from 'react';
import { DemoGalleryBlock as DemoGalleryBlockType } from '../../../types/blocks.ts';

interface DemoGalleryBlockProps {
  block: DemoGalleryBlockType;
}

export const DemoGalleryBlock: React.FC<DemoGalleryBlockProps> = ({ block }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {(block.items ?? []).map((item, idx) => (
        <div key={idx} className="border rounded-lg overflow-hidden">
          {item.type === 'image' ? (
            <img src={item.src} alt={item.caption} className="w-full h-48 object-cover" />
          ) : (
            <video src={item.src} controls className="w-full h-48" />
          )}
          <div className="p-2">
            <p className="text-sm">{item.caption}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
