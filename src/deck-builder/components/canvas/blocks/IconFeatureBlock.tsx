import React from 'react';
import { IconFeatureBlock } from '../../../types/blocks.ts';
import { Card, CardContent } from '../../../../components/ui/card.tsx';
import * as LucideIcons from 'lucide-react';

interface IconFeatureBlockProps extends Omit<IconFeatureBlock, 'type' | 'id'> {
  onUpdate?: (data: Partial<IconFeatureBlock>) => void;
}

export const IconFeature: React.FC<IconFeatureBlockProps> = ({
  icon,
  title,
  description,
  iconColor,
  iconSize = 'medium',
  layout = 'vertical-center',
  titleSize = 'text-lg',
  descriptionSize = 'text-base',
  onUpdate,
}) => {
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.HelpCircle;

  const layoutClasses = {
    'vertical-center': 'flex flex-col items-center text-center',
    'horizontal-left': 'flex items-start space-x-4',
    'horizontal-center': 'flex items-center space-x-4',
  };

  const iconSizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12',
    large: 'h-16 w-16',
    xlarge: 'h-20 w-20',
  };

  return (
    <Card className="p-4 h-full">
      <CardContent className={`h-full flex ${layoutClasses[layout]}`}>
        <IconComponent className={iconSizeClasses[iconSize]} style={{ color: iconColor }} />
        <div>
          <h3 className={`${titleSize} font-bold`}>{title}</h3>
          <p className={descriptionSize}>{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default IconFeature;
