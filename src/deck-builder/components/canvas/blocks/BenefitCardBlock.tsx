import React from 'react';
import { BenefitCardBlock as BenefitCardBlockType } from '../../../types/blocks.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card.tsx';
import { CheckCircle } from 'lucide-react';

interface BenefitCardProps {
  block: BenefitCardBlockType;
}

export const BenefitCardBlock: React.FC<BenefitCardProps> = ({ block }) => {
  const IconComponent = block.icon ? (require('lucide-react')[block.icon] || CheckCircle) : CheckCircle;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <IconComponent className="h-8 w-8 text-green-500" />
          <CardTitle>{block.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p>{block.description}</p>
        {block.imageUrl && <img src={block.imageUrl} alt={block.title} className="mt-4 rounded-lg" />}
      </CardContent>
    </Card>
  );
};
