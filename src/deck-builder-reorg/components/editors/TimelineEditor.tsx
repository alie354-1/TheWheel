import React from 'react';
import { TimelineBlock as TimelineBlockType, Milestone } from '../../types/blocks';

interface TimelineEditorProps {
  block: TimelineBlockType;
  onChange: (block: TimelineBlockType) => void;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({ block, onChange }) => {
  const milestones = block.milestones ?? [];

  const handleMilestoneChange = (idx: number, field: keyof Milestone, value: string | boolean) => {
    const updated = milestones.map((m, i) =>
      i === idx ? { ...m, [field]: value } : m
    );
    onChange({ ...block, milestones: updated });
  };

  const addMilestone = () => {
    onChange({
      ...block,
      milestones: [
        ...milestones,
        { label: '', date: '', description: '', completed: false, icon: '' }
      ]
    });
  };

  const removeMilestone = (idx: number) => {
    onChange({
      ...block,
      milestones: milestones.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <button type="button" onClick={addMilestone} className="px-3 py-1 bg-blue-500 text-white rounded">
          Add Milestone
        </button>
      </div>
      {milestones.map((milestone, idx) => (
        <div key={idx} className="border rounded p-3 mb-2 space-y-2">
          <div>
            <label className="block text-sm font-medium">Label</label>
            <input
              type="text"
              value={milestone.label ?? ''}
              onChange={e => handleMilestoneChange(idx, 'label', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Date</label>
            <input
              type="text"
              value={milestone.date ?? ''}
              onChange={e => handleMilestoneChange(idx, 'date', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={milestone.description ?? ''}
              onChange={e => handleMilestoneChange(idx, 'description', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Completed</label>
            <input
              type="checkbox"
              checked={!!milestone.completed}
              onChange={e => handleMilestoneChange(idx, 'completed', e.target.checked)}
              className="ml-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Icon (optional)</label>
            <input
              type="text"
              value={milestone.icon ?? ''}
              onChange={e => handleMilestoneChange(idx, 'icon', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <button type="button" onClick={() => removeMilestone(idx)} className="mt-2 px-2 py-1 bg-red-500 text-white rounded">
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default TimelineEditor;
