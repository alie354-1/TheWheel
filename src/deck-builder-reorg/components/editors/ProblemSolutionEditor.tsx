import React from 'react';
import { ProblemSolutionBlock } from '../../types/blocks.ts';
import { Textarea } from '../../../components/ui/textarea.tsx';
import { Label } from '../../../components/ui/label.tsx';

interface ProblemSolutionEditorProps {
  block: ProblemSolutionBlock;
  onChange: (data: Partial<ProblemSolutionBlock>) => void;
}

export const ProblemSolutionEditor: React.FC<ProblemSolutionEditorProps> = ({ block, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Problem</Label>
        <Textarea
          value={block.problem}
          onChange={(e) => onChange({ problem: e.target.value })}
          placeholder="Describe the problem"
        />
      </div>
      <div>
        <Label>Solution</Label>
        <Textarea
          value={block.solution}
          onChange={(e) => onChange({ solution: e.target.value })}
          placeholder="Describe your solution"
        />
      </div>
    </div>
  );
};
