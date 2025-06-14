import React, { useState } from 'react';
import PreviewSlide from '../preview/components/PreviewSlide.tsx';
import { DeckSection, VisualComponent, VisualComponentLayout } from '../types/index.ts';

export const PreviewSlideTest: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [section, setSection] = useState<DeckSection>({
    id: 'test-section',
    type: 'custom',
    title: 'Test Slide',
    order: 0,
    components: [
      {
        id: '1',
        type: 'text',
        order: 0,
        layout: { x: 50, y: 50, width: 200, height: 100, zIndex: 1 },
        data: { text: 'Test Component 1', variant: 'body' },
        style: { backgroundColor: '#e3f2fd' }
      },
      {
        id: '2',
        type: 'text',
        order: 1,
        layout: { x: 300, y: 200, width: 150, height: 150, zIndex: 1 },
        data: { text: 'Test Component 2', variant: 'body' },
        style: { backgroundColor: '#fce4ec' }
      }
    ]
  });

  const handleUpdateLayout = (id: string, newLayout: Partial<VisualComponentLayout>) => {
    console.log('Updating layout:', { id, newLayout });
    
    setSection((prev: DeckSection) => ({
      ...prev,
      components: prev.components.map((comp: VisualComponent) => 
        comp.id === id 
          ? { ...comp, layout: { ...comp.layout, ...newLayout } }
          : comp
      )
    }));
  };

  const handleSelect = (id: string | null) => {
    console.log('Selected:', id);
    setSelectedId(id);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>PreviewSlide Test - Direct Component</h2>
      <p>Selected: {selectedId || 'None'}</p>
      
      <div style={{
        border: '2px solid #ccc',
        width: '800px',
        height: '600px',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#f5f5f5'
      }}>
        <PreviewSlide
          section={section}
          theme={null}
          zoomLevel={1}
          logicalWidth={800}
          logicalHeight={600}
          previewMode={false}
          onSelect={handleSelect}
          onUpdateLayout={handleUpdateLayout}
          selectedComponentId={selectedId}
        />
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Component States:</h3>
        {section.components.map((comp: VisualComponent) => (
          <div key={comp.id} style={{ fontSize: '12px', fontFamily: 'monospace' }}>
            {comp.id}: x={comp.layout.x}, y={comp.layout.y}, w={comp.layout.width}, h={comp.layout.height}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviewSlideTest;
