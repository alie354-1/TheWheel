import React from 'react';
import { BaseBlock } from '../../types/blocks.ts';
import { Input } from '../../../components/ui/input.tsx';
import { Label } from '../../../components/ui/label.tsx';
import { ColorPicker } from './ColorPicker.tsx';

interface StyleEditorProps {
  block: BaseBlock;
  onChange: (data: Partial<BaseBlock>) => void;
}

const StyleEditor: React.FC<StyleEditorProps> = ({ block, onChange }) => {
  const handleStyleChange = (property: string, value: any) => {
    const newStyle = { ...block.style, [property]: value };
    onChange({ style: newStyle });
  };

  return (
    <div className="space-y-4 p-2 border rounded-md">
      <div>
        <Label>Background Color</Label>
        <ColorPicker
          value={block.style?.backgroundColor || '#ffffff'}
          onChange={(color: string) => handleStyleChange('backgroundColor', color)}
        />
      </div>
      <div>
        <Label>Text Color</Label>
        <ColorPicker
          value={block.style?.color || '#000000'}
          onChange={(color: string) => handleStyleChange('color', color)}
        />
      </div>
      <div>
        <Label>Font Size (px)</Label>
        <Input
          type="number"
          value={parseInt(block.style?.fontSize || '16')}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleStyleChange('fontSize', `${e.target.value}px`)}
        />
      </div>
      <div>
        <Label>Padding (px)</Label>
        <Input
          type="number"
          value={parseInt(block.style?.padding || '0')}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleStyleChange('padding', `${e.target.value}px`)}
        />
      </div>
      <div>
        <Label>Border</Label>
        <Input
          type="text"
          value={block.style?.border || 'none'}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleStyleChange('border', e.target.value)}
          placeholder="e.g., 1px solid #000000"
        />
      </div>
    </div>
  );
};

export default StyleEditor;
