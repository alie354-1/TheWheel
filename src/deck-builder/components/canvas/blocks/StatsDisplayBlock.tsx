import React from 'react';
import { StatsDisplayBlock, StatItem } from '../../../types/blocks.ts';
import { Card, CardContent } from '../../../../components/ui/card.tsx';
import { TrendingUp, TrendingDown, Minus, LucideProps } from 'lucide-react';
import * as Icons from 'lucide-react';

interface StatsDisplayBlockProps {
  block: Omit<StatsDisplayBlock, 'type' | 'id'>;
  onUpdate?: (data: Partial<StatsDisplayBlock>) => void;
}

export const StatsDisplay: React.FC<StatsDisplayBlockProps> = ({
  block,
  onUpdate,
}) => {
  const { stats, layout = 'grid', columns = 3, cardStyle = 'card' } = block;

  const layoutClasses: { [key: string]: string } = {
    grid: `grid grid-cols-1 md:grid-cols-${columns} gap-4`,
    horizontal: 'flex space-x-4 overflow-x-auto',
    vertical: 'flex flex-col space-y-4',
  };

  const cardStyles: { [key: string]: string } = {
    card: 'p-4 rounded-lg shadow-md',
    simple: 'p-2',
    pill: 'p-2 rounded-full',
  };

  const TrendIcon = ({ trend }: { trend?: 'up' | 'down' | 'flat' }) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const Icon = ({ name, ...props }: { name: string } & LucideProps) => {
    const LucideIcon = (Icons as any)[name];
    if (!LucideIcon) {
      return null;
    }
    return <LucideIcon {...props} />;
  };

  return (
    <div className={layoutClasses[layout]}>
      {stats.map((stat: StatItem, idx: number) => (
        <Card key={idx} className={cardStyles[cardStyle]}>
          <CardContent className="flex items-center space-x-4">
            {stat.icon && <Icon name={stat.icon} className="h-8 w-8" />}
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            {stat.trend && <TrendIcon trend={stat.trend} />}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsDisplay;
