import React from 'react';
import { DemoGalleryBlock as DemoGalleryBlockType } from '../../types/blocks';

interface DemoGalleryEditorProps {
  block: DemoGalleryBlockType;
  onChange: (block: DemoGalleryBlockType) => void;
}

export const DemoGalleryEditor: React.FC<DemoGalleryEditorProps> = ({ block, onChange }) => {
  const items = block.items ?? [];

  const handleItemChange = (idx: number, field: string, value: string) => {
    const updated = items.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    );
    onChange({ ...block, items: updated });
  };

  const addItem = () => {
    onChange({
      ...block,
      items: [...items, { title: '', url: '', description: '' }]
    });
  };

  const removeItem = (idx: number) => {
    onChange({
      ...block,
      items: items.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <button type="button" onClick={addItem} className="px-3 py-1 bg-blue-500 text-white rounded">
          Add Demo Item
        </button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="border rounded p-3 mb-2 space-y-2">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              value={item.title ?? ''}
              onChange={e => handleItemChange(idx, 'title', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">URL</label>
            <input
              type="text"
              value={item.url ?? ''}
              onChange={e => handleItemChange(idx, 'url', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={item.description ?? ''}
              onChange={e => handleItemChange(idx, 'description', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <button type="button" onClick={() => removeItem(idx)} className="mt-2 px-2 py-1 bg-red-500 text-white rounded">
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default DemoGalleryEditor;
