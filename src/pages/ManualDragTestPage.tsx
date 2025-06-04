import React from 'react';
import { ManualDragDeckBuilder } from '../deck-builder/components/ManualDragDeckBuilder.tsx';
import { Deck } from '../deck-builder/types/index.ts';
import { v4 as uuidv4 } from 'uuid';

export const ManualDragTestPage: React.FC = () => {
  // Create a test deck for demonstration
  const testDeck: Deck = {
    id: 'test-deck-1',
    user_id: 'test-user',
    title: 'Test Deck for Manual Drag',
    // description: 'Testing manual drag and drop functionality', // Removed as 'description' is not in Deck type
    sections: [
      {
        id: uuidv4(),
        type: 'blank',
        title: 'Slide 1',
        order: 0,
        components: [
          {
            id: uuidv4(),
            type: 'text',
            order: 0,
            data: { text: 'Hello World' },
            layout: {
              x: 100,
              y: 100,
              width: 200,
              height: 100,
              zIndex: 1,
            },
            style: {
              backgroundColor: '#e0f2fe',
              padding: '10px',
              borderRadius: '8px',
            },
          },
          {
            id: uuidv4(),
            type: 'text',
            order: 1,
            data: { text: 'Drag and resize me!' },
            layout: {
              x: 400,
              y: 300,
              width: 300,
              height: 150,
              zIndex: 2,
            },
            style: {
              backgroundColor: '#fef3c7',
              padding: '10px',
              borderRadius: '8px',
            },
          },
        ],
      },
    ],
    theme: {
      id: 'default',
      name: 'Default Theme',
      colors: {
        primary: '#3b82f6',
        secondary: '#6366f1',
        background: '#ffffff',
        text: '#1f2937',
        accent: '#f59e0b'
      },
      fonts: {
        heading: 'Inter, system-ui, sans-serif',
        body: 'Inter, system-ui, sans-serif'
      }
    },
    // settings: {}, // Removed as 'settings' is not in Deck type
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  return (
    <div className="h-screen w-screen">
      <ManualDragDeckBuilder 
        deck={testDeck}
        onDeckUpdate={(updatedDeck) => console.log('Deck updated:', updatedDeck)}
        onSave={() => console.log('Save clicked')}
        onPreview={() => console.log('Preview clicked')}
      />
    </div>
  );
};

export default ManualDragTestPage;
