import React from 'react';
import { useDeck } from '../hooks/useDeck.ts';
import { VisualComponentRenderer } from './VisualComponentRenderer.tsx';

const VisualDeckBuilder: React.FC = () => {
  const { deck } = useDeck();

  if (!deck) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative w-full h-full bg-white shadow-lg">
      {deck.sections.map(section => (
        section.components.map(component => (
          <VisualComponentRenderer key={component.id} component={component} />
        ))
      ))}
    </div>
  );
};

export default VisualDeckBuilder;
