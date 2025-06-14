import React from 'react';
// Import the type and give it an alias to avoid a name conflict.
import { SkillMatrixBlock as SkillMatrixBlockType } from '../../../types/blocks.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card.tsx';

interface SkillMatrixProps {
  // Use the aliased type for the block prop.
  block: SkillMatrixBlockType;
}

// Your component declaration no longer conflicts with an import.
const SkillMatrixBlock: React.FC<SkillMatrixProps> = ({ block }) => {
  const { matrixData, title } = block;
  const { data } = matrixData;

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle>{title || 'Skill Matrix'}</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="pb-2">Team Member</th>
              {data.skills.map((skill: string, i: number) => (
                <th key={i} className="pb-2">{skill}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.team.map((member: { name: string; scores: number[] }, i: number) => (
              <tr key={i} className="border-t">
                <td className="py-2">{member.name}</td>
                {member.scores.map((score: number, j: number) => (
                  <td key={j} className="py-2">{score}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default SkillMatrixBlock;
