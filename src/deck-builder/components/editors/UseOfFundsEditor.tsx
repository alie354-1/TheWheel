import React from 'react';
import { UseOfFundsBlock as UseOfFundsBlockType } from '../../types/blocks';

interface UseOfFundsEditorProps {
  block: UseOfFundsBlockType;
  onChange: (block: UseOfFundsBlockType) => void;
}

export const UseOfFundsEditor: React.FC<UseOfFundsEditorProps> = ({ block, onChange }) => {
  const allocations = block.allocations ?? [];

  const handleAllocationChange = (idx: number, field: string, value: string) => {
    const updated = allocations.map((a, i) =>
      i === idx ? { ...a, [field]: value } : a
    );
    onChange({ ...block, allocations: updated });
  };

  const addAllocation = () => {
    onChange({
      ...block,
      allocations: [...allocations, { category: '', amount: '' }]
    });
  };

  const removeAllocation = (idx: number) => {
    onChange({
      ...block,
      allocations: allocations.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <button type="button" onClick={addAllocation} className="px-3 py-1 bg-blue-500 text-white rounded">
          Add Allocation
        </button>
      </div>
      {allocations.map((allocation, idx) => (
        <div key={idx} className="border rounded p-3 mb-2 space-y-2">
          <div>
            <label className="block text-sm font-medium">Category</label>
            <input
              type="text"
              value={allocation.category ?? ''}
              onChange={e => handleAllocationChange(idx, 'category', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Amount</label>
            <input
              type="text"
              value={allocation.amount ?? ''}
              onChange={e => handleAllocationChange(idx, 'amount', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <button type="button" onClick={() => removeAllocation(idx)} className="mt-2 px-2 py-1 bg-red-500 text-white rounded">
            Remove
          </button>
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium">Notes</label>
        <textarea
          value={block.notes ?? ''}
          onChange={e => onChange({ ...block, notes: e.target.value })}
          className="w-full border rounded px-2 py-1"
        />
      </div>
    </div>
  );
};

export default UseOfFundsEditor;
