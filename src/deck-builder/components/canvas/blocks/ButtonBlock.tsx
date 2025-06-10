import React from 'react';
import { ButtonBlock } from '../../../types/blocks.ts';
import { Button } from '../../../../components/ui/button.tsx';

interface ButtonBlockProps extends Omit<ButtonBlock, 'type' | 'id'> {
  onUpdate?: (data: Partial<ButtonBlock>) => void;
}

export const ButtonComponent: React.FC<ButtonBlockProps> = ({
  label,
  url,
  onUpdate,
}) => {
  const handleClick = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <Button onClick={handleClick}>
      {label}
    </Button>
  );
};

export default ButtonComponent;
