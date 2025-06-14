import React from 'react';
import { MetricCounterBlock } from '../../../types/blocks.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card.tsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCounterBlockProps extends Omit<MetricCounterBlock, 'type' | 'id'> {
  onUpdate?: (data: Partial<MetricCounterBlock>) => void;
}

const TrendIcon = ({ trend }: { trend?: 'up' | 'down' | 'flat' }) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-6 w-6 text-green-500" />;
    case 'down':
      return <TrendingDown className="h-6 w-6 text-red-500" />;
    default:
      return <Minus className="h-6 w-6 text-gray-400" />;
  }
};

export const MetricCounter: React.FC<MetricCounterBlockProps> = ({
  label,
  value,
  targetValue,
  prefix,
  suffix,
  duration = 1200,
  trend,
  icon,
  onUpdate,
}) => {
  // Simple animated counter (no dependencies, robust for SSR)
  const [displayValue, setDisplayValue] = React.useState<number>(value);

  React.useEffect(() => {
    if (typeof value !== 'number' || value === displayValue) return;
    const start = displayValue;
    const end = value;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayValue(Math.round(start + (end - start) * progress));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    // eslint-disable-next-line
  }, [value, duration]);

  return (
    <Card className="flex flex-col items-center justify-center p-4">
      <CardHeader className="flex flex-row items-center justify-between w-full pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <TrendIcon trend={trend} />
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="text-3xl font-bold">
          {prefix}{displayValue}{suffix}
        </div>
        {typeof targetValue === 'number' && (
          <div className="text-xs text-muted-foreground">
            Target: {prefix}{targetValue}{suffix}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCounter;
