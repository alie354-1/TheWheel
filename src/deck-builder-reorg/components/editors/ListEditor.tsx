import React from 'react';
import { ListBlock as ListBlockType } from '../../types/blocks';

interface ListEditorProps {
  block: ListBlockType;
  onChange: (block: ListBlockType) => void;
}

export const ListEditor: React.FC<ListEditorProps> = ({ block, onChange }) => {
  const items = block.items ?? [];

  const handleItemChange = (idx: number, value: string) => {
    const updated = items.map((item, i) =>
      i === idx ? value : item
    );
    onChange({ ...block, items: updated });
  };

  const addItem = () => {
    onChange({
      ...block,
      items: [...items, '']
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
          Add List Item
        </button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="border rounded p-3 mb-2 space-y-2 flex items-center">
          <input
            type="text"
            value={item ?? ''}
            onChange={e => handleItemChange(idx, e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
          <button type="button" onClick={() => removeItem(idx)} className="ml-2 px-2 py-1 bg-red-500 text-white rounded">
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default ListEditor;
