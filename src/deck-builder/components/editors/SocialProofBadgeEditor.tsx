import React from 'react';
import { SocialProofBadgeBlock as SocialProofBadgeBlockType } from '../../types/blocks';

interface SocialProofBadgeEditorProps {
  block: SocialProofBadgeBlockType;
  onChange: (block: SocialProofBadgeBlockType) => void;
}

export const SocialProofBadgeEditor: React.FC<SocialProofBadgeEditorProps> = ({ block, onChange }) => {
  const badges = block.badges ?? [];

  const handleBadgeChange = (idx: number, field: string, value: string) => {
    const updated = badges.map((b, i) =>
      i === idx ? { ...b, [field]: value } : b
    );
    onChange({ ...block, badges: updated });
  };

  const addBadge = () => {
    onChange({
      ...block,
      badges: [...badges, { label: '', icon: '', description: '' }]
    });
  };

  const removeBadge = (idx: number) => {
    onChange({
      ...block,
      badges: badges.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <button type="button" onClick={addBadge} className="px-3 py-1 bg-blue-500 text-white rounded">
          Add Badge
        </button>
      </div>
      {badges.map((badge, idx) => (
        <div key={idx} className="border rounded p-3 mb-2 space-y-2">
          <div>
            <label className="block text-sm font-medium">Label</label>
            <input
              type="text"
              value={badge.label ?? ''}
              onChange={e => handleBadgeChange(idx, 'label', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Icon (optional)</label>
            <input
              type="text"
              value={badge.icon ?? ''}
              onChange={e => handleBadgeChange(idx, 'icon', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={badge.description ?? ''}
              onChange={e => handleBadgeChange(idx, 'description', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <button type="button" onClick={() => removeBadge(idx)} className="mt-2 px-2 py-1 bg-red-500 text-white rounded">
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default SocialProofBadgeEditor;
