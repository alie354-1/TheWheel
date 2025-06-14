import React from 'react';
import { CompetitivePositioningBlock as CompetitivePositioningBlockType } from '../../types/blocks';

interface CompetitivePositioningEditorProps {
  block: CompetitivePositioningBlockType;
  onChange: (block: CompetitivePositioningBlockType) => void;
}

export const CompetitivePositioningEditor: React.FC<CompetitivePositioningEditorProps> = ({ block, onChange }) => {
  const points = block.points ?? [];

  const handlePointChange = (idx: number, field: string, value: string) => {
    const updated = points.map((pt, i) =>
      i === idx ? { ...pt, [field]: value } : pt
    );
    onChange({ ...block, points: updated });
  };

  const addPoint = () => {
    onChange({
      ...block,
      points: [...points, { label: '', description: '' }]
    });
  };

  const removePoint = (idx: number) => {
    onChange({
      ...block,
      points: points.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <button type="button" onClick={addPoint} className="px-3 py-1 bg-blue-500 text-white rounded">
          Add Point
        </button>
      </div>
      {points.map((point, idx) => (
        <div key={idx} className="border rounded p-3 mb-2 space-y-2">
          <div>
            <label className="block text-sm font-medium">Label</label>
            <input
              type="text"
              value={point.label ?? ''}
              onChange={e => handlePointChange(idx, 'label', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={point.description ?? ''}
              onChange={e => handlePointChange(idx, 'description', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <button type="button" onClick={() => removePoint(idx)} className="mt-2 px-2 py-1 bg-red-500 text-white rounded">
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default CompetitivePositioningEditor;
