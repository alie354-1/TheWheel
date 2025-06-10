import React from 'react';
import { TractionWidgetBlock as TractionWidgetBlockType } from '../../../types/blocks.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card.tsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TractionWidgetProps {
  block: TractionWidgetBlockType;
}

const TrendIcon = ({ trend }: { trend?: 'up' | 'down' | 'flat' }) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-6 w-6 text-green-500" />;
    case 'down':
      return <TrendingDown className="h-6 w-6 text-red-500" />;
    default:
      return <Minus className="h-6 w-6 text-gray-500" />;
  }
};

export const TractionWidget: React.FC<TractionWidgetProps> = ({ block }) => {
  const metrics = block?.metrics ?? [];
  if (!Array.isArray(metrics) || metrics.length === 0) {
    return (
      <div className="p-4 text-gray-400 text-center">
        No traction metrics available.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.label || "Metric"}</CardTitle>
            <TrendIcon trend={metric.trend} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value ?? "--"}</div>
            <p className="text-xs text-muted-foreground">{metric.description || ""}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
