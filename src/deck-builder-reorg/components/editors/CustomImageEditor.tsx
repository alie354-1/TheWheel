import React from 'react';
import { CustomImageBlock as CustomImageBlockType } from '../../types/blocks';

interface CustomImageEditorProps {
  block: CustomImageBlockType;
  onChange: (block: CustomImageBlockType) => void;
}

export const CustomImageEditor: React.FC<CustomImageEditorProps> = ({ block, onChange }) => {
  const handleChange = (field: keyof CustomImageBlockType, value: string) => {
    onChange({ ...block, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Image URL</label>
        <input
          type="text"
          value={block.url ?? ''}
          onChange={e => handleChange('url', e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Alt Text</label>
        <input
          type="text"
          value={block.alt ?? ''}
          onChange={e => handleChange('alt', e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Caption</label>
        <input
          type="text"
          value={block.caption ?? ''}
          onChange={e => handleChange('caption', e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
    </div>
  );
};

export default CustomImageEditor;
