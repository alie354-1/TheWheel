import React from 'react';
import { BusinessModelBlock as BusinessModelBlockType } from '../../../types/blocks.ts';

interface BusinessModelBlockProps {
  block: BusinessModelBlockType;
}

export const BusinessModelBlock: React.FC<BusinessModelBlockProps> = ({ block }) => {
  return (
    <div className="p-4">
      <h4 className="font-bold text-lg mb-2">Business Model</h4>
      {block.diagramUrl && <img src={block.diagramUrl} alt="Business Model" className="w-full mb-4" />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {block.streams.map((stream, idx) => (
          <div key={idx} className="p-2 border rounded">
            <h5 className="font-bold">{stream.label}</h5>
            <p className="text-sm">{stream.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
