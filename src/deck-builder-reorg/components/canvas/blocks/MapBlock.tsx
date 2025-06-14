import React from 'react';
import { MapBlock } from '../../../types/blocks.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card.tsx';
import { MapPin } from 'lucide-react';

interface MapBlockProps extends Omit<MapBlock, 'type' | 'id'> {
  onUpdate?: (data: Partial<MapBlock>) => void;
}

export const MapBlockComponent: React.FC<MapBlockProps> = ({
  location,
  mapUrl,
  onUpdate,
}) => {
  // Use mapUrl if provided, otherwise use Google Maps embed for the location
  const embedUrl = mapUrl
    ? mapUrl
    : `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;

  return (
    <Card className="flex flex-col items-center justify-center p-4">
      <CardHeader className="flex flex-row items-center justify-between w-full pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-6 w-6 text-blue-500" />
          Location Map
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2 w-full">
        <div className="w-full aspect-video rounded overflow-hidden border border-gray-200 bg-gray-100">
          <iframe
            title="Map"
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: 200 }}
            allowFullScreen
            loading="lazy"
          />
        </div>
        <div className="text-sm text-muted-foreground mt-2">{location}</div>
      </CardContent>
    </Card>
  );
};

export default MapBlockComponent;
