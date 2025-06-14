import React from 'react';
import { CtaCardBlock as CTACardBlockType } from '../../../types/blocks.ts';
import { Button } from '../../../../components/ui/button.tsx';

interface CTACardBlockProps {
  block: CTACardBlockType;
}

export const CTACardBlock: React.FC<CTACardBlockProps> = ({ block }) => {
  return (
    <div className="p-6 bg-blue-600 text-white rounded-lg text-center">
      <h4 className="font-bold text-xl mb-2">{block.text}</h4>
      <Button variant="secondary" onClick={() => window.open(block.buttonUrl, '_blank')}>
        {block.buttonLabel}
      </Button>
    </div>
  );
};
