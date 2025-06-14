import React from 'react';
import { CitationBlock as CitationBlockType } from '../../../types/blocks.ts';

interface CitationBlockProps {
  block: CitationBlockType;
}

export const CitationBlock: React.FC<CitationBlockProps> = ({ block }) => {
  return (
    <blockquote className="p-4 my-4 border-l-4 border-gray-300 bg-gray-50">
      <p className="text-xl italic font-semibold text-gray-900">{block.text}</p>
      <cite className="block text-right mt-4">
        - {block.author}
        {block.source && <span className="text-sm text-gray-500">, {block.source}</span>}
        {block.year && <span className="text-sm text-gray-500"> ({block.year})</span>}
      </cite>
    </blockquote>
  );
};
