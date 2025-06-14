import React from 'react';
import { ProblemSolutionBlock as ProblemSolutionBlockType } from '../../../types/blocks.ts';

interface ProblemSolutionBlockProps {
  block: ProblemSolutionBlockType;
}

export const ProblemSolutionBlock: React.FC<ProblemSolutionBlockProps> = ({ block }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h4 className="font-bold text-lg mb-2">Problem</h4>
        <p>{block.problem}</p>
      </div>
      <div>
        <h4 className="font-bold text-lg mb-2">Solution</h4>
        <p>{block.solution}</p>
      </div>
    </div>
  );
};
