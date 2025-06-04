import React from 'react';
import { CitationBlock as CitationBlockType } from '../../../types/blocks'; // Aliasing to avoid name clash

interface CitationBlockProps extends CitationBlockType {
  isSelected?: boolean; // To handle selection state if needed for styling
}

export const CitationBlock: React.FC<CitationBlockProps> = ({
  text,
  author,
  source,
  year,
  // citationStyle, // Not used in basic rendering for now
  // url, // Not used in basic rendering for now
  style, // Pass through style for positioning and base styling
  isSelected,
}) => {
  return (
    <div
      style={style}
      className={`p-4 border ${isSelected ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'} bg-gray-50 rounded deck-block citation-block`}
    >
      <blockquote className="text-lg italic border-l-4 border-gray-400 pl-4 mb-2">
        {text || "Enter quote text here..."}
      </blockquote>
      <footer className="text-sm text-gray-600">
        {author && <span className="font-semibold">{author}</span>}
        {author && (source || year) && <span>, </span>}
        {source && <cite className="italic">{source}</cite>}
        {source && year && <span>, </span>}
        {year && <span>{year}</span>}
        {(!author && !source && !year) && <span>Citation details here...</span>}
      </footer>
    </div>
  );
};

export default CitationBlock;
