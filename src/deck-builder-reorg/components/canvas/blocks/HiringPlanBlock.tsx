import React from 'react';
import { HiringPlanBlock as HiringPlanBlockType } from '../../../types/blocks.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card.tsx';

interface HiringPlanProps {
  block: HiringPlanBlockType;
}

export const HiringPlanBlock: React.FC<HiringPlanProps> = ({ block }) => {
  const { title, roles } = block;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || 'Hiring Plan'}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {roles.map((role, index) => (
            <li key={index} className="flex justify-between">
              <span>{role.title}</span>
              <span className="text-gray-500">{role.department}</span>
              <span className="text-gray-500">{role.timeline}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
