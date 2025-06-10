import React from 'react';
import { MetricCounterBlock as MetricCounterBlockType } from '../../types/blocks';

interface MetricCounterEditorProps {
  block: MetricCounterBlockType;
  onChange: (block: MetricCounterBlockType) => void;
}

export const MetricCounterEditor: React.FC<MetricCounterEditorProps> = ({ block, onChange }) => {
  const metrics = block.metrics ?? [];

  const handleMetricChange = (idx: number, field: string, value: string) => {
    const updated = metrics.map((m, i) =>
      i === idx ? { ...m, [field]: value } : m
    );
    onChange({ ...block, metrics: updated });
  };

  const addMetric = () => {
    onChange({
      ...block,
      metrics: [...metrics, { label: '', value: '', description: '' }]
    });
  };

  const removeMetric = (idx: number) => {
    onChange({
      ...block,
      metrics: metrics.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <button type="button" onClick={addMetric} className="px-3 py-1 bg-blue-500 text-white rounded">
          Add Metric
        </button>
      </div>
      {metrics.map((metric, idx) => (
        <div key={idx} className="border rounded p-3 mb-2 space-y-2">
          <div>
            <label className="block text-sm font-medium">Label</label>
            <input
              type="text"
              value={metric.label ?? ''}
              onChange={e => handleMetricChange(idx, 'label', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Value</label>
            <input
              type="text"
              value={metric.value ?? ''}
              onChange={e => handleMetricChange(idx, 'value', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={metric.description ?? ''}
              onChange={e => handleMetricChange(idx, 'description', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <button type="button" onClick={() => removeMetric(idx)} className="mt-2 px-2 py-1 bg-red-500 text-white rounded">
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default MetricCounterEditor;
