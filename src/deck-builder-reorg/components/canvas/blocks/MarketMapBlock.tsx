import React from 'react';
import { MarketMapBlock as MarketMapBlockType } from '../../../types/blocks.ts';

interface MarketMapBlockProps {
  block: MarketMapBlockType;
}

export const MarketMapBlock: React.FC<MarketMapBlockProps> = ({ block }) => {
  const tam = block?.tam ?? "--";
  const sam = block?.sam ?? "--";
  const som = block?.som ?? "--";
  const notes = block?.notes ?? "";

  const allEmpty = [tam, sam, som].every(val => val === "--") && !notes;

  if (allEmpty) {
    return (
      <div className="p-4 text-gray-400 text-center">
        No market map data available.
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-around items-center">
        <div className="text-center">
          <div className="text-2xl font-bold">{tam}</div>
          <div className="text-sm text-gray-500">TAM</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{sam}</div>
          <div className="text-sm text-gray-500">SAM</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{som}</div>
          <div className="text-sm text-gray-500">SOM</div>
        </div>
      </div>
      {notes && <p className="text-xs text-gray-500 mt-4">{notes}</p>}
    </div>
  );
};
