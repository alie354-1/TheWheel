import React from 'react';
import { BeforeAfterComparisonBlock } from '../../../types/blocks.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card.tsx';
import { GitCompareArrows } from 'lucide-react';

interface BeforeAfterComparisonBlockProps extends Omit<BeforeAfterComparisonBlock, 'type' | 'id'> {
  onUpdate?: (data: Partial<BeforeAfterComparisonBlock>) => void;
}

export const BeforeAfterComparison: React.FC<BeforeAfterComparisonBlockProps> = ({
  beforeImageSrc,
  beforeImageAlt,
  beforeLabel,
  afterImageSrc,
  afterImageAlt,
  afterLabel,
  orientation = 'horizontal',
  onUpdate,
}) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <Card className="flex flex-col items-center justify-center p-4">
      <CardHeader className="flex flex-row items-center justify-between w-full pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <GitCompareArrows className="h-6 w-6 text-indigo-500" />
          Before / After Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2 w-full">
        <div
          className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} gap-4 w-full items-center justify-center`}
        >
          <div className="flex flex-col items-center w-full">
            <img
              src={beforeImageSrc}
              alt={beforeImageAlt || 'Before'}
              className="rounded border border-gray-200 bg-gray-100 object-contain max-h-48 w-full"
              style={{ maxWidth: 240 }}
            />
            {beforeLabel && (
              <div className="text-xs text-muted-foreground mt-1">{beforeLabel}</div>
            )}
          </div>
          <div className="flex flex-col items-center w-full">
            <img
              src={afterImageSrc}
              alt={afterImageAlt || 'After'}
              className="rounded border border-gray-200 bg-gray-100 object-contain max-h-48 w-full"
              style={{ maxWidth: 240 }}
            />
            {afterLabel && (
              <div className="text-xs text-muted-foreground mt-1">{afterLabel}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BeforeAfterComparison;
