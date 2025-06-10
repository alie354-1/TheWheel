import React from 'react';
import { OpportunityIndicatorBlock as OpportunityIndicatorBlockType } from '../../types/blocks';

interface OpportunityIndicatorEditorProps {
  block: OpportunityIndicatorBlockType;
  onChange: (block: OpportunityIndicatorBlockType) => void;
}

export const OpportunityIndicatorEditor: React.FC<OpportunityIndicatorEditorProps> = ({ block, onChange }) => {
  const handleChange = (field: keyof OpportunityIndicatorBlockType, value: string) => {
    onChange({ ...block, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Indicator Label</label>
        <input
          type="text"
          value={block.label ?? ''}
          onChange={e => handleChange('label', e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Value</label>
        <input
          type="text"
          value={block.value ?? ''}
          onChange={e => handleChange('value', e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          value={block.description ?? ''}
          onChange={e => handleChange('description', e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Icon (optional)</label>
        <input
          type="text"
          value={block.icon ?? ''}
          onChange={e => handleChange('icon', e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
    </div>
  );
};

export default OpportunityIndicatorEditor;
