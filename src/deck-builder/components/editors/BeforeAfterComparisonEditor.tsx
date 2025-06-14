import React from 'react';
import { BeforeAfterComparisonBlock as BeforeAfterComparisonBlockType } from '../../types/blocks';

interface BeforeAfterComparisonEditorProps {
  block: BeforeAfterComparisonBlockType;
  onChange: (block: BeforeAfterComparisonBlockType) => void;
}

export const BeforeAfterComparisonEditor: React.FC<BeforeAfterComparisonEditorProps> = ({ block, onChange }) => {
  const handleChange = (field: keyof BeforeAfterComparisonBlockType, value: string) => {
    onChange({ ...block, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Before</label>
        <textarea
          value={block.before ?? ''}
          onChange={e => handleChange('before', e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">After</label>
        <textarea
          value={block.after ?? ''}
          onChange={e => handleChange('after', e.target.value)}
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
    </div>
  );
};

export default BeforeAfterComparisonEditor;
