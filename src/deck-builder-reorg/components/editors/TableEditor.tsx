import React, { useState, useEffect } from 'react';
import { TableBlock } from '../../types/blocks.ts';
import { Input } from '../../../components/ui/input.tsx';
import { Button } from '../../../components/ui/button.tsx';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { FC } from 'react';

interface TableEditorProps {
  block: TableBlock;
  onChange: (data: Partial<TableBlock>) => void;
}

const TableEditor: React.FC<TableEditorProps> = ({ block, onChange }) => {
  const [rows, setRows] = useState(block.rows || [['', ''], ['', '']]);

  useEffect(() => {
    onChange({ rows });
  }, [rows, onChange]);

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex][colIndex] = value;
    setRows(newRows);
  };

  const addRow = () => {
    const newRow = Array(rows[0]?.length || 1).fill('');
    setRows([...rows, newRow]);
  };

  const removeRow = (rowIndex: number) => {
    const newRows = rows.filter((_: any, i: number) => i !== rowIndex);
    setRows(newRows);
  };

  const addCol = () => {
    const newRows = rows.map(row => [...row, '']);
    setRows(newRows);
  };

  const removeCol = (colIndex: number) => {
    const newRows = rows.map((row: any[]) => row.filter((_: any, i: number) => i !== colIndex));
    setRows(newRows);
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <Button onClick={addRow} size="sm" variant="outline"><PlusCircle className="h-4 w-4 mr-1" /> Add Row</Button>
        <Button onClick={addCol} size="sm" variant="outline"><PlusCircle className="h-4 w-4 mr-1" /> Add Column</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <tbody>
            {rows.map((row: string[], rowIndex: number) => (
              <tr key={rowIndex}>
                {row.map((cell: string, colIndex: number) => (
                  <td key={colIndex} className="p-1">
                    <Input
                      type="text"
                      value={cell}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCellChange(rowIndex, colIndex, e.target.value)}
                      className="w-full"
                    />
                  </td>
                ))}
                <td className="p-1">
                  <Button onClick={() => removeRow(rowIndex)} size="sm" variant="ghost" className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            <tr>
              {rows[0]?.map((_: any, colIndex: number) => (
                <td key={colIndex} className="p-1">
                  <Button onClick={() => removeCol(colIndex)} size="sm" variant="ghost" className="text-red-500 hover:text-red-700 w-full">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableEditor;
