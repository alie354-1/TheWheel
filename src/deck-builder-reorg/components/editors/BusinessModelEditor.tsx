import React from 'react';
import { BusinessModelBlock as BusinessModelBlockType } from '../../types/blocks';

interface BusinessModelEditorProps {
  block: BusinessModelBlockType;
  onChange: (block: BusinessModelBlockType) => void;
}

export const BusinessModelEditor: React.FC<BusinessModelEditorProps> = ({ block, onChange }) => {
  const handleChange = (field: keyof BusinessModelBlockType, value: string) => {
    onChange({ ...block, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Model Name</label>
        <input
          type="text"
          value={block.modelName ?? ''}
          onChange={e => handleChange('modelName', e.target.value)}
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
        <label className="block text-sm font-medium">Key Revenue Streams</label>
        <input
          type="text"
          value={block.revenueStreams ?? ''}
          onChange={e => handleChange('revenueStreams', e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Key Cost Drivers</label>
        <input
          type="text"
          value={block.costDrivers ?? ''}
          onChange={e => handleChange('costDrivers', e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
    </div>
  );
};

export default BusinessModelEditor;
