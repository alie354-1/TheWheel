import React from 'react';
import { AdvisorCardBlock as AdvisorCardBlockType } from '../../../types/blocks.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card.tsx';

interface AdvisorCardProps {
  block: AdvisorCardBlockType;
}

export const AdvisorCardBlock: React.FC<AdvisorCardProps> = ({ block }) => {
  const { name, title, company, photoUrl, bio, linkedin } = block;

  return (
    <Card>
      <CardHeader>
        {photoUrl && <img src={photoUrl} alt={name} className="w-24 h-24 rounded-full mx-auto" />}
        <CardTitle className="text-center">{name}</CardTitle>
        <p className="text-center text-sm text-gray-500">{title}{company && `, ${company}`}</p>
      </CardHeader>
      <CardContent>
        <p className="text-center">{bio}</p>
        {linkedin && (
          <div className="text-center mt-4">
            <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              LinkedIn
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
