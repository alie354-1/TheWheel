import React from 'react';
import { OpportunityIndicatorBlock } from '../../../types/blocks.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card.tsx';
import { Target } from 'lucide-react';

interface OpportunityIndicatorBlockProps extends Omit<OpportunityIndicatorBlock, 'type' | 'id'> {
  onUpdate?: (data: Partial<OpportunityIndicatorBlock>) => void;
}

export const OpportunityIndicator: React.FC<OpportunityIndicatorBlockProps> = ({
  title,
  value,
  description,
  icon,
  onUpdate,
}) => {
  const IconComponent = icon ? (require('lucide-react')[icon] || Target) : Target;

  return (
    <Card className="flex flex-col items-center justify-center p-4">
      <CardHeader className="flex flex-row items-center justify-between w-full pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <IconComponent className="h-6 w-6 text-purple-500" />
          {title || "Opportunity"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2 w-full">
        <div className="text-2xl font-bold text-purple-700">{value}</div>
        {description && (
          <div className="text-sm text-muted-foreground text-center mt-2">{description}</div>
        )}
      </CardContent>
    </Card>
  );
};

export default OpportunityIndicator;
