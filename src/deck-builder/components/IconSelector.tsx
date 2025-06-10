import React from 'react';
import { icons } from 'lucide-react';

interface IconSelectorProps {
  iconName: string;
  className?: string;
}

export const IconSelector: React.FC<IconSelectorProps> = ({ iconName, className }) => {
  // @ts-ignore
  const Icon = icons[iconName];
  return Icon ? <Icon className={className} /> : null;
};
