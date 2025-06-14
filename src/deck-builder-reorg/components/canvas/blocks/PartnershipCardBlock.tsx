import React from 'react';
import { PartnershipCardBlock } from '../../../types/blocks.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card.tsx';
import { Handshake } from 'lucide-react';

interface PartnershipCardBlockProps extends Omit<PartnershipCardBlock, 'type' | 'id'> {
  onUpdate?: (data: Partial<PartnershipCardBlock>) => void;
}

export const PartnershipCard: React.FC<PartnershipCardBlockProps> = ({
  partnerLogoUrl,
  partnerName,
  description,
  announcementUrl,
  onUpdate,
}) => {
  return (
    <Card className="flex flex-col items-center justify-center p-4 shadow-md bg-white rounded-lg min-w-[220px] max-w-[340px]">
      <CardHeader className="flex flex-row items-center gap-2 pb-2 w-full">
        {partnerLogoUrl ? (
          <img
            src={partnerLogoUrl}
            alt={partnerName}
            className="w-14 h-7 object-contain rounded bg-white border border-gray-200"
            loading="lazy"
          />
        ) : (
          <Handshake className="h-7 w-7 text-primary" />
        )}
        <CardTitle className="text-base font-semibold flex-1 text-center">{partnerName}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center w-full">
        <div className="text-sm text-gray-700 text-center mb-2">{description}</div>
        {announcementUrl && (
          <a
            href={announcementUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs"
            title="View Announcement"
          >
            Announcement
          </a>
        )}
      </CardContent>
    </Card>
  );
};

export default PartnershipCard;
