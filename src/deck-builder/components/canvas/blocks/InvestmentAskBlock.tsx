import React from 'react';
import { InvestmentAskBlock } from '../../../types/blocks.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card.tsx';
import { DollarSign } from 'lucide-react';

interface InvestmentAskBlockProps extends Omit<InvestmentAskBlock, 'type' | 'id'> {
  onUpdate?: (data: Partial<InvestmentAskBlock>) => void;
}

export const InvestmentAsk: React.FC<InvestmentAskBlockProps> = ({
  amount,
  equity,
  terms,
  onUpdate,
}) => {
  return (
    <Card className="flex flex-col items-center justify-center p-4">
      <CardHeader className="flex flex-row items-center justify-between w-full pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-green-500" />
          Investment Ask
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2">
        <div className="text-2xl font-bold text-green-700">{amount}</div>
        <div className="text-base font-medium text-blue-700">Equity Offered: {equity}</div>
        {terms && (
          <div className="text-sm text-muted-foreground text-center mt-2">
            <span className="font-semibold">Terms:</span> {terms}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvestmentAsk;
