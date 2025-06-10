import React from 'react';
import { TeamCardBlock as TeamCardBlockType } from '../../../types/blocks.ts';

interface TeamCardBlockProps {
  block: TeamCardBlockType;
}

export const TeamCardBlock: React.FC<TeamCardBlockProps> = ({ block }) => {
  const members = block?.members ?? [];
  if (!Array.isArray(members) || members.length === 0) {
    return (
      <div className="p-4 text-gray-400 text-center">
        No team members available.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((member, idx) => {
        const photoUrl = member?.photoUrl || "";
        const name = member?.name || "Team Member";
        const title = member?.title || "";
        const bio = member?.bio || "";
        return (
          <div key={idx} className="p-4 border rounded-lg">
            {photoUrl && <img src={photoUrl} alt={name} className="w-24 h-24 rounded-full mx-auto mb-4" />}
            <h4 className="text-lg font-bold text-center">{name}</h4>
            <p className="text-sm text-gray-500 text-center">{title}</p>
            <p className="text-sm mt-2">{bio}</p>
          </div>
        );
      })}
    </div>
  );
};
