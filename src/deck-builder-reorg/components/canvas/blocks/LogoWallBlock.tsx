import React from 'react';
import { LogoWallBlock as LogoWallBlockType } from '../../../types/blocks.ts';

interface LogoWallBlockProps {
  block: LogoWallBlockType;
}

export const LogoWallBlock: React.FC<LogoWallBlockProps> = ({ block }) => {
  return (
    <div className="flex flex-wrap justify-center items-center gap-4">
      {(block.logos ?? []).map((logo, idx) => {
        const src = logo?.src || "";
        const alt = logo?.alt || "Logo";
        return <img key={idx} src={src} alt={alt} className="h-12" />;
      })}
    </div>
  );
};
