import React from 'react';
import { CustomImageBlock } from '../../../types/blocks.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card.tsx';
import { ImageIcon } from 'lucide-react';

interface CustomImageBlockProps extends Omit<CustomImageBlock, 'type' | 'id'> {
  onUpdate?: (data: Partial<CustomImageBlock>) => void;
}

export const CustomImage: React.FC<CustomImageBlockProps> = ({
  src,
  alt,
  onUpdate,
}) => {
  return (
    <Card className="flex flex-col items-center justify-center p-4">
      <CardHeader className="flex flex-row items-center justify-between w-full pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <ImageIcon className="h-6 w-6 text-blue-500" />
          Custom Image
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2 w-full">
        <div className="w-full rounded overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center" style={{ minHeight: 180 }}>
          {src ? (
            <img
              src={src}
              alt={alt || ''}
              className="w-full h-auto object-contain"
              style={{ maxHeight: 320, maxWidth: '100%' }}
            />
          ) : (
            <div className="text-gray-400 text-center py-8 w-full">No image selected</div>
          )}
        </div>
        {alt && <div className="text-xs text-muted-foreground mt-2">{alt}</div>}
      </CardContent>
    </Card>
  );
};

export default CustomImage;
