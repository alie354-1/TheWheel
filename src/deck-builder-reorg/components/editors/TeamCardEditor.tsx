import React from 'react';
import { TeamCardBlock as TeamCardBlockType } from '../../types/blocks';

interface TeamCardEditorProps {
  block: TeamCardBlockType;
  onChange: (block: TeamCardBlockType) => void;
}

export const TeamCardEditor: React.FC<TeamCardEditorProps> = ({ block, onChange }) => {
  const members = block.members ?? [];

  const handleMemberChange = (idx: number, field: string, value: string) => {
    const updated = members.map((m, i) =>
      i === idx ? { ...m, [field]: value } : m
    );
    onChange({ ...block, members: updated });
  };

  const addMember = () => {
    onChange({
      ...block,
      members: [...members, { name: '', title: '', bio: '', photoUrl: '' }]
    });
  };

  const removeMember = (idx: number) => {
    onChange({
      ...block,
      members: members.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <button type="button" onClick={addMember} className="px-3 py-1 bg-blue-500 text-white rounded">
          Add Team Member
        </button>
      </div>
      {members.map((member, idx) => (
        <div key={idx} className="border rounded p-3 mb-2 space-y-2">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              value={member.name ?? ''}
              onChange={e => handleMemberChange(idx, 'name', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              value={member.title ?? ''}
              onChange={e => handleMemberChange(idx, 'title', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Bio</label>
            <textarea
              value={member.bio ?? ''}
              onChange={e => handleMemberChange(idx, 'bio', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Photo URL</label>
            <input
              type="text"
              value={member.photoUrl ?? ''}
              onChange={e => handleMemberChange(idx, 'photoUrl', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <button type="button" onClick={() => removeMember(idx)} className="mt-2 px-2 py-1 bg-red-500 text-white rounded">
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default TeamCardEditor;
