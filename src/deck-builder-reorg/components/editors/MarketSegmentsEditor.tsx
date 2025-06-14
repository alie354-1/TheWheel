import React from 'react';
import { MarketSegmentsBlock as MarketSegmentsBlockType } from '../../types/blocks';

interface MarketSegmentsEditorProps {
  block: MarketSegmentsBlockType;
  onChange: (block: MarketSegmentsBlockType) => void;
}

export const MarketSegmentsEditor: React.FC<MarketSegmentsEditorProps> = ({ block, onChange }) => {
  const segments = block.segments ?? [];

  const handleSegmentChange = (idx: number, field: string, value: string) => {
    const updated = segments.map((seg, i) =>
      i === idx ? { ...seg, [field]: value } : seg
    );
    onChange({ ...block, segments: updated });
  };

  const addSegment = () => {
    onChange({
      ...block,
      segments: [...segments, { label: '', description: '' }]
    });
  };

  const removeSegment = (idx: number) => {
    onChange({
      ...block,
      segments: segments.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <button type="button" onClick={addSegment} className="px-3 py-1 bg-blue-500 text-white rounded">
          Add Segment
        </button>
      </div>
      {segments.map((segment, idx) => (
        <div key={idx} className="border rounded p-3 mb-2 space-y-2">
          <div>
            <label className="block text-sm font-medium">Label</label>
            <input
              type="text"
              value={segment.label ?? ''}
              onChange={e => handleSegmentChange(idx, 'label', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={segment.description ?? ''}
              onChange={e => handleSegmentChange(idx, 'description', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <button type="button" onClick={() => removeSegment(idx)} className="mt-2 px-2 py-1 bg-red-500 text-white rounded">
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default MarketSegmentsEditor;
