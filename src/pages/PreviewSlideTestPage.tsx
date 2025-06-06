import React, { useState } from 'react';
import { DeckSection, DeckTheme } from '../deck-builder/types/index.ts';
import PreviewSlide from '../deck-builder/preview/components/PreviewSlide.tsx';

// Simple test page to compare different rendering modes
const PreviewSlideTestPage: React.FC = () => {
  // Sample deck section for testing
  const sampleSection: DeckSection = {
    id: 'test-section',
    type: 'hero',
    title: 'The Wheel',
    order: 1,
    slideStyle: {
      backgroundColor: '#8b0000', // Dark red
    },
    components: [
      {
        id: 'title-component',
        type: 'text',
        data: {
          textContent: 'The Wheel',
        },
        style: {
          fontSize: '48px',
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
        },
        order: 1,
        layout: {
          x: 100,
          y: 240,
          width: 1080,
          height: 60,
          zIndex: 1,
        },
      },
      {
        id: 'subtitle-component',
        type: 'text',
        data: {
          textContent: 'Intelligent Startup Infrastructure for Founders and Funds',
        },
        style: {
          fontSize: '24px',
          color: 'white',
          textAlign: 'center',
        },
        order: 2,
        layout: {
          x: 100,
          y: 370,
          width: 1080,
          height: 40,
          zIndex: 2,
        },
      },
    ],
  };

  // Sample theme
  const theme: DeckTheme = {
    id: 'default-theme',
    name: 'Default Theme',
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#60A5FA',
      background: '#F8FAFC',
      text: '#1F2937',
      slideBackground: '#FFFFFF',
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      caption: 'Inter, system-ui, sans-serif',
    },
  };

  // Toggle between small preview and large view
  const [isLargeView, setIsLargeView] = useState(false);

  // Logical dimensions for slides (16:9 aspect ratio)
  const LOGICAL_SLIDE_WIDTH = 1280;
  const LOGICAL_SLIDE_HEIGHT = 720;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">PreviewSlide Rendering Test</h1>
      
      <div className="mb-4">
        <button
          className={`px-4 py-2 rounded mr-4 ${isLargeView ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
          onClick={() => setIsLargeView(false)}
        >
          Small Preview
        </button>
        <button
          className={`px-4 py-2 rounded ${isLargeView ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
          onClick={() => setIsLargeView(true)}
        >
          Large View
        </button>
      </div>

      <div className="border rounded overflow-hidden" style={{ 
        width: isLargeView ? '100%' : '400px',
        height: isLargeView ? '600px' : '225px', // 16:9 ratio for small preview
      }}>
        <PreviewSlide
          section={sampleSection}
          theme={theme}
          zoomLevel={1}
          logicalWidth={isLargeView ? undefined : LOGICAL_SLIDE_WIDTH}
          logicalHeight={isLargeView ? undefined : LOGICAL_SLIDE_HEIGHT}
          previewMode={true}
          style={{
            width: '100%',
            height: '100%',
            minWidth: 0,
            minHeight: 0,
            maxWidth: '100%',
            maxHeight: '100%',
            display: 'block',
          }}
        />
      </div>
      
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p><strong>Current Mode:</strong> {isLargeView ? 'Large View (100% fill)' : 'Small Preview (fixed logical dimensions)'}</p>
        <p><strong>logicalWidth:</strong> {isLargeView ? 'undefined (100% fill)' : LOGICAL_SLIDE_WIDTH}</p>
        <p><strong>logicalHeight:</strong> {isLargeView ? 'undefined (100% fill)' : LOGICAL_SLIDE_HEIGHT}</p>
      </div>
    </div>
  );
};

export default PreviewSlideTestPage;
