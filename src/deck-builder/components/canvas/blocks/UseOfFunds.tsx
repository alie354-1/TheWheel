import React from 'react';
import { UseOfFundsBlock as UseOfFundsBlockType } from '../../../types/blocks.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card.tsx';

interface UseOfFundsProps {
  block: UseOfFundsBlockType;
}

export const UseOfFundsBlock: React.FC<UseOfFundsProps> = ({ block }) => {
  const { title, allocations, totalAmount } = block;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || 'Use of Funds'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {(allocations ?? []).map((category: { name: string; amount: number }, index: number) => (
            <div key={index} className="flex justify-between">
              <span>{category.name}</span>
              <span>${category.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t flex justify-between font-bold">
          <span>Total</span>
          <span>${totalAmount?.toLocaleString?.() ?? 0}</span>
        </div>
      </CardContent>
    </Card>
  );
};
