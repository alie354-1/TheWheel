import React from 'react';
import { MarketSegmentsBlock as MarketSegmentsBlockType } from '../../../types/blocks.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card.tsx';

interface MarketSegmentsProps {
  block: MarketSegmentsBlockType;
}

export const MarketSegmentsBlock: React.FC<MarketSegmentsProps> = ({ block }) => {
  const { segmentData, title } = block;
  const { segments } = segmentData.data;
  const totalValue = segments.reduce((sum: number, s: { value: number }) => sum + s.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || 'Market Segments'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-8 w-full rounded-full overflow-hidden">
          {(segments ?? []).map((segment: { name: string; value: number; color: string }, index: number) => (
            <div
              key={index}
              className="h-full"
              style={{
                width: `${(segment.value / totalValue) * 100}%`,
                backgroundColor: segment.color,
              }}
              title={`${segment.name}: ${segment.value}%`}
            ></div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {(segments ?? []).map((segment: { name: string; value: number; color: string }, index: number) => (
            <div key={index} className="flex items-center">
              <div
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: segment.color }}
              ></div>
              <span>{segment.name} ({segment.value}%)</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
