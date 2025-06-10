import React from 'react';
import { VisualQuoteBlock } from '../../../types/blocks.ts';
import { Card, CardContent } from '../../../../components/ui/card.tsx';

interface VisualQuoteBlockProps extends Omit<VisualQuoteBlock, 'type' | 'id'> {
  onUpdate?: (data: Partial<VisualQuoteBlock>) => void;
}

export const VisualQuote: React.FC<VisualQuoteBlockProps> = ({
  text,
  author,
  authorTitle,
  authorImage,
  companyLogo,
  quoteStyle = 'minimal',
  backgroundColor,
  textColor,
  accentColor,
  onUpdate,
}) => {
  const styleClasses: { [key: string]: string } = {
    minimal: 'border-l-4 pl-4',
    card: 'p-6 rounded-lg shadow-lg',
    banner: 'p-6 text-center',
    'inline-image': 'flex items-center space-x-4',
    'pull-quote': 'text-2xl font-bold text-center',
  };

  return (
    <div className="relative w-full h-full">
      <Card className={`h-full flex flex-col justify-center ${styleClasses[quoteStyle]}`}>
        <div className="absolute inset-0" style={{ backgroundColor, color: textColor, borderColor: accentColor }}></div>
      <CardContent>
        {quoteStyle === 'inline-image' && authorImage && (
          <img src={authorImage} alt={author || ''} className="w-16 h-16 rounded-full" />
        )}
        <blockquote className="text-lg">
          <p>"{text}"</p>
        </blockquote>
        <footer className="mt-4">
          {author && <p className="font-bold">{author}</p>}
          {authorTitle && <p className="text-sm">{authorTitle}</p>}
          {companyLogo && <img src={companyLogo} alt="company logo" className="h-8 mt-2" />}
        </footer>
      </CardContent>
    </Card>
    </div>
  );
};

export default VisualQuote;
