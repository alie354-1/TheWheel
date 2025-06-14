import React from 'react';
import { MilestoneTrackerBlock as MilestoneTrackerBlockType } from '../../../types/blocks.ts';

interface MilestoneTrackerBlockProps {
  block: MilestoneTrackerBlockType;
}

export const MilestoneTrackerBlock: React.FC<MilestoneTrackerBlockProps> = ({ block }) => {
  return (
    <div className="p-4">
      <h4 className="font-bold text-lg mb-4">Milestone Tracker</h4>
      <div className="relative">
        <div className="absolute left-1/2 h-full w-0.5 bg-gray-300"></div>
        {block.milestones.map((milestone, idx) => (
          <div key={idx} className={`flex items-center w-full my-8 ${idx % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <div className={`w-5/12 p-4 rounded-lg shadow-md ${milestone.completed ? 'bg-green-100' : 'bg-white'}`}>
              <p className="font-bold">{milestone.date}</p>
              <p>{milestone.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
