import React from 'react';
import { PressCardBlock } from '../../../types/blocks.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card.tsx';
import { Newspaper } from 'lucide-react';

interface PressCardBlockProps extends Omit<PressCardBlock, 'type' | 'id'> {
  onUpdate?: (data: Partial<PressCardBlock>) => void;
}

export const PressCard: React.FC<PressCardBlockProps> = ({
  publicationLogoUrl,
  headline,
  articleUrl,
  date,
  onUpdate,
}) => {
  const displayHeadline = headline || "Press headline goes here";
  const displayArticleUrl = articleUrl || "#";

  return (
    <Card className="flex flex-col items-center justify-center p-4 shadow-md bg-white rounded-lg min-w-[220px] max-w-[340px]">
      <CardHeader className="flex flex-row items-center gap-2 pb-2 w-full">
        {publicationLogoUrl ? (
          <img
            src={publicationLogoUrl}
            alt="Publication Logo"
            className="w-14 h-7 object-contain rounded bg-white border border-gray-200"
            loading="lazy"
          />
        ) : (
          <Newspaper className="h-7 w-7 text-primary" />
        )}
        <div className="flex-1" />
        {date && <span className="text-xs text-gray-400">{date}</span>}
      </CardHeader>
      <CardContent className="flex flex-col items-center w-full">
        <a
          href={displayArticleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base font-semibold text-blue-700 hover:underline text-center block"
        >
          {displayHeadline}
        </a>
      </CardContent>
    </Card>
  );
};

export default PressCard;
