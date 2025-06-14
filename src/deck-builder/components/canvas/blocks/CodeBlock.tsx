import React from 'react';
import { CodeBlock } from '../../../types/blocks.ts';
import { Card, CardContent } from '../../../../components/ui/card.tsx';

interface CodeBlockProps extends Omit<CodeBlock, 'type' | 'id'> {
  onUpdate?: (data: Partial<CodeBlock>) => void;
}

export const Code: React.FC<CodeBlockProps> = ({
  code,
  language = 'typescript',
  onUpdate,
}) => {
  return (
    <Card className="h-full">
      <CardContent className="h-full p-0">
        <pre className="h-full">
          <code
            className={`h-full block w-full p-4 text-sm overflow-auto rounded-lg ${language}`}
          >
            {code}
          </code>
        </pre>
      </CardContent>
    </Card>
  );
};

export default Code;
