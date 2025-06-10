import React from 'react';
import { TimelineBlock as TimelineBlockType, Milestone } from '../../../types/blocks.ts';

interface TimelineProps {
  block: TimelineBlockType;
}

export const Timeline: React.FC<TimelineProps> = ({ block }) => {
  const milestones = block?.milestones ?? [];
  if (!Array.isArray(milestones) || milestones.length === 0) {
    return (
      <div className="p-4 text-gray-400 text-center">
        No milestones available.
      </div>
    );
  }
  return (
    <div className="relative">
      <div className="border-l-2 border-gray-300 absolute h-full top-0 left-4"></div>
      <div className="space-y-8">
        {milestones.map((milestone: Milestone, index: number) => (
          <div key={index} className="flex items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center z-10 ${milestone.completed ? 'bg-green-500' : 'bg-gray-300'}`}>
              {milestone.icon && <span className="text-white">{milestone.icon}</span>}
            </div>
            <div className="ml-4">
              <h4 className="font-bold">{milestone.label || "Milestone"}</h4>
              <p className="text-sm text-gray-600">{milestone.date || ""}</p>
              <p className="text-sm">{milestone.description || ""}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
