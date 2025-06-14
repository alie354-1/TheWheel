import React from 'react';
import { VideoBlock } from '../../../types/blocks.ts';
import { Card, CardContent } from '../../../../components/ui/card.tsx';

interface VideoBlockProps extends Omit<VideoBlock, 'type' | 'id'> {
  onUpdate?: (data: Partial<VideoBlock>) => void;
}

export const Video: React.FC<VideoBlockProps> = ({
  src,
  provider = 'youtube',
  onUpdate,
}) => {
  const getEmbedUrl = () => {
    if (provider === 'youtube') {
      const videoId = src.split('v=')[1];
      const ampersandPosition = videoId.indexOf('&');
      if (ampersandPosition !== -1) {
        return `https://www.youtube.com/embed/${videoId.substring(0, ampersandPosition)}`;
      }
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (provider === 'vimeo') {
      const videoId = src.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return src;
  };

  return (
    <Card className="h-full">
      <CardContent className="h-full p-0">
        <iframe
          className="w-full h-full rounded-lg"
          src={getEmbedUrl()}
          title="Video Player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </CardContent>
    </Card>
  );
};

export default Video;
