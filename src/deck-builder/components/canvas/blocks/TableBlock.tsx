import React from 'react';
import { TableBlock } from '../../../types/blocks.ts';
import { Card, CardContent } from '../../../../components/ui/card.tsx';

interface TableBlockProps extends Omit<TableBlock, 'type' | 'id'> {
  onUpdate?: (data: Partial<TableBlock>) => void;
}

export const Table: React.FC<TableBlockProps> = ({
  rows,
  onUpdate,
}) => {
  return (
    <Card className="h-full">
      <CardContent className="h-full p-0">
        <table className="w-full h-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              {rows[0].map((header: string, idx: number) => (
                <th key={idx} scope="col" className="px-6 py-3">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(1).map((row: string[], idx: number) => (
              <tr key={idx} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                {row.map((cell: string, cellIdx: number) => (
                  <td key={cellIdx} className="px-6 py-4">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default Table;
