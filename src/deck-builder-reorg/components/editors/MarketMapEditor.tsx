import React from 'react';
import { MarketMapBlock as MarketMapBlockType } from '../../types/blocks';

interface MarketMapEditorProps {
  block: MarketMapBlockType;
  onChange: (block: MarketMapBlockType) => void;
}

export const MarketMapEditor: React.FC<MarketMapEditorProps> = ({ block, onChange }) => {
  const handleChange = (field: keyof MarketMapBlockType, value: string) => {
    onChange({ ...block, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">TAM</label>
        <input
          type="text"
          value={block.tam ?? ''}
          onChange={e => handleChange('tam', e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">SAM</label>
        <input
          type="text"
          value={block.sam ?? ''}
          onChange={e => handleChange('sam', e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">SOM</label>
        <input
          type="text"
          value={block.som ?? ''}
          onChange={e => handleChange('som', e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Notes</label>
        <textarea
          value={block.notes ?? ''}
          onChange={e => handleChange('notes', e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
    </div>
  );
};

export default MarketMapEditor;
