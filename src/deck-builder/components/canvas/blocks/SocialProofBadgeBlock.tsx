import React from 'react';
import { SocialProofBadgeBlock as SocialProofBadgeBlockType } from '../../../types/blocks.ts';
import { Card, CardContent } from '../../../../components/ui/card.tsx';
import { Star, Users, Award } from 'lucide-react';

interface SocialProofBadgeBlockProps extends Omit<SocialProofBadgeBlockType, 'type' | 'id'> {
  onUpdate?: (data: Partial<SocialProofBadgeBlockType>) => void;
}

const Icon = ({ name }: { name: string }) => {
  switch (name) {
    case 'star':
      return <Star className="h-8 w-8 text-yellow-400" />;
    case 'users':
      return <Users className="h-8 w-8 text-blue-500" />;
    case 'award':
      return <Award className="h-8 w-8 text-indigo-500" />;
    default:
      return null;
  }
};

export const SocialProofBadgeBlock: React.FC<SocialProofBadgeBlockProps> = ({ 
  icon = 'star', 
  text,
  source,
  style,
  onUpdate 
}) => {
  const displayText = text || "Recognition or award";
  const displaySource = source || "";

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0" style={style}></div>
      <Card className="p-4 flex items-center gap-4 relative z-10">
        <div className="flex-shrink-0">
          <Icon name={icon || 'star'} />
        </div>
        <div>
          <p className="font-semibold text-lg">{displayText}</p>
          {displaySource && <p className="text-sm text-gray-500">Source: {displaySource}</p>}
        </div>
      </Card>
    </div>
  );
};
