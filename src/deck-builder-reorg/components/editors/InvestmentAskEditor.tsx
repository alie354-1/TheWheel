import React from 'react';
import { InvestmentAskBlock as InvestmentAskBlockType } from '../../types/blocks';

interface InvestmentAskEditorProps {
  block: InvestmentAskBlockType;
  onChange: (block: InvestmentAskBlockType) => void;
}

export const InvestmentAskEditor: React.FC<InvestmentAskEditorProps> = ({ block, onChange }) => {
  const handleChange = (field: keyof InvestmentAskBlockType, value: string) => {
    onChange({ ...block, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Amount Requested</label>
        <input
          type="text"
          value={block.amount ?? ''}
          onChange={e => handleChange('amount', e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Valuation</label>
        <input
          type="text"
          value={block.valuation ?? ''}
          onChange={e => handleChange('valuation', e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Use of Funds</label>
        <textarea
          value={block.useOfFunds ?? ''}
          onChange={e => handleChange('useOfFunds', e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Notes</label>
        <textarea
          value={block.notes ?? ''}
          onChange={e => handleChange('notes', e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
    </div>
  );
};

export default InvestmentAskEditor;
