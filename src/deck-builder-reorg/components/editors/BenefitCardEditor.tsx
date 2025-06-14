import React from 'react';
import { BenefitCardBlock as BenefitCardBlockType } from '../../types/blocks';

interface BenefitCardEditorProps {
  block: BenefitCardBlockType;
  onChange: (block: BenefitCardBlockType) => void;
}

export const BenefitCardEditor: React.FC<BenefitCardEditorProps> = ({ block, onChange }) => {
  const benefits = block.benefits ?? [];

  const handleBenefitChange = (idx: number, field: string, value: string) => {
    const updated = benefits.map((b, i) =>
      i === idx ? { ...b, [field]: value } : b
    );
    onChange({ ...block, benefits: updated });
  };

  const addBenefit = () => {
    onChange({
      ...block,
      benefits: [...benefits, { label: '', description: '', icon: '' }]
    });
  };

  const removeBenefit = (idx: number) => {
    onChange({
      ...block,
      benefits: benefits.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <button type="button" onClick={addBenefit} className="px-3 py-1 bg-blue-500 text-white rounded">
          Add Benefit
        </button>
      </div>
      {benefits.map((benefit, idx) => (
        <div key={idx} className="border rounded p-3 mb-2 space-y-2">
          <div>
            <label className="block text-sm font-medium">Label</label>
            <input
              type="text"
              value={benefit.label ?? ''}
              onChange={e => handleBenefitChange(idx, 'label', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={benefit.description ?? ''}
              onChange={e => handleBenefitChange(idx, 'description', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Icon (optional)</label>
            <input
              type="text"
              value={benefit.icon ?? ''}
              onChange={e => handleBenefitChange(idx, 'icon', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <button type="button" onClick={() => removeBenefit(idx)} className="mt-2 px-2 py-1 bg-red-500 text-white rounded">
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default BenefitCardEditor;
