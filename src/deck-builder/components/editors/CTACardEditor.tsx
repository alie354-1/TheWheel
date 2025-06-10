import React from 'react';
import { CtaCardBlock } from '../../types/blocks.ts';
import { Input } from '../../../components/ui/input.tsx';
import { Textarea } from '../../../components/ui/textarea.tsx';
import { Label } from '../../../components/ui/label.tsx';

interface CtaCardEditorProps {
  block: CtaCardBlock;
  onChange: (data: Partial<CtaCardBlock>) => void;
}

export const CtaCardEditor: React.FC<CtaCardEditorProps> = ({ block, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Text</Label>
        <Textarea
          value={block.text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange({ text: e.target.value })}
          placeholder="Text"
        />
      </div>
      <div>
        <Label>Button Label</Label>
        <Input
          value={block.buttonLabel}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ buttonLabel: e.target.value })}
          placeholder="Button Label"
        />
      </div>
      <div>
        <Label>Button URL</Label>
        <Input
          value={block.buttonUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ buttonUrl: e.target.value })}
          placeholder="Button URL"
        />
      </div>
    </div>
  );
};
