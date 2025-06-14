import React from 'react';
import { CompetitivePositioningBlock as CompetitivePositioningBlockType } from '../../../types/blocks.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card.tsx';

interface CompetitivePositioningProps {
  block: CompetitivePositioningBlockType;
}

export const CompetitivePositioningBlock: React.FC<CompetitivePositioningProps> = ({ block }) => {
  const { chartData, title } = block;
  const { xLabel, yLabel, points } = chartData.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || 'Competitive Positioning'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-64 border-l border-b border-gray-300">
          {/* Y-Axis Label */}
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90">{yLabel}</div>
          {/* X-Axis Label */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">{xLabel}</div>

          {/* Points */}
          {(points ?? []).map((point: { name: string; x: number; y: number; color: string }, index: number) => (
            <div
              key={index}
              className="absolute w-4 h-4 rounded-full"
              style={{
                left: `${point.x * 100}%`,
                bottom: `${point.y * 100}%`,
                backgroundColor: point.color,
                transform: 'translate(-50%, 50%)',
              }}
              title={point.name}
            ></div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
