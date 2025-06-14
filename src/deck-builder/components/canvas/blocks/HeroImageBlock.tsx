import React from 'react';
import type { HeroImageBlock as HeroImageBlockType } from '../../../types/blocks.ts';
import { Card, CardContent } from '../../../../components/ui/card.tsx';

interface HeroImageBlockProps {
  src?: string;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaUrl?: string;
  onUpdate?: (data: Partial<HeroImageBlockType>) => void;
}

const HeroImage: React.FC<HeroImageBlockProps> = ({
  src,
  headline,
  subheadline,
  ctaText,
  ctaUrl,
  onUpdate,
}) => {
  return (
    <div className="relative w-full h-full">
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: `url(${src || ''})` }}
      ></div>
      <Card className="relative w-full h-full bg-transparent">
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      <CardContent className="relative z-10 flex flex-col items-center justify-center h-full text-white p-4">
        {headline && <h2 className="text-4xl font-bold text-center">{headline}</h2>}
        {subheadline && <p className="text-lg text-center mt-2">{subheadline}</p>}
        {ctaText && ctaUrl && (
          <a
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
          >
            {ctaText}
          </a>
        )}
      </CardContent>
    </Card>
    </div>
  );
};

export default HeroImage;
