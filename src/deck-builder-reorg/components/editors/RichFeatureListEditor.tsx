import React, { useState } from 'react';
import { RichTextEditor } from './RichTextEditor.tsx';
import { Button } from '../../../components/ui/button.tsx';
import { Plus, Trash } from 'lucide-react';

interface RichFeatureListEditorProps {
  items: { content: string }[];
  onChange: (items: { content: string }[]) => void;
}

export const RichFeatureListEditor: React.FC<RichFeatureListEditorProps> = ({ items, onChange }) => {
  const handleItemChange = (index: number, content: any) => {
    const newItems = [...items];
    newItems[index] = { content };
    onChange(newItems);
  };

  const addItem = () => {
    onChange([...items, { content: '<p>New Feature</p>' }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="flex-grow">
            <RichTextEditor
              content={item.content}
              onChange={(content) => handleItemChange(index, content)}
              placeholder={`Feature #${index + 1}`}
            />
          </div>
          <Button variant="danger" size="sm" onClick={() => removeItem(index)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button onClick={addItem} variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        Add Feature
      </Button>
    </div>
  );
};
