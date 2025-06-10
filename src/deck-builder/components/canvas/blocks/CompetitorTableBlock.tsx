import React from 'react';
import { CompetitorTableBlock as CompetitorTableBlockType } from '../../../types/blocks.ts';

interface CompetitorTableBlockProps {
  block: CompetitorTableBlockType;
}

export const CompetitorTableBlock: React.FC<CompetitorTableBlockProps> = ({ block }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Feature
            </th>
            {block.competitors.map((competitor, idx) => (
              <th key={idx} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {competitor.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {block.featureList.map((feature, fidx) => (
            <tr key={fidx}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{feature}</td>
              {block.competitors.map((competitor, cidx) => (
                <td key={cidx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {competitor.features[feature] ? '✔️' : '❌'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
