import React from 'react';
import { IdeaPlaygroundCanvas } from '../../lib/types/idea-playground.types';

interface CanvasSelectorProps {
  canvases: IdeaPlaygroundCanvas[];
  currentCanvas: IdeaPlaygroundCanvas | null;
  onSelectCanvas: (canvas: IdeaPlaygroundCanvas) => void;
  onCreateCanvas: () => void;
}

const CanvasSelector: React.FC<CanvasSelectorProps> = ({
  canvases,
  currentCanvas,
  onSelectCanvas,
  onCreateCanvas
}) => {
  if (canvases.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 max-w-md">
        <label htmlFor="canvas-selector" className="block text-sm font-medium text-gray-700 mb-1">
          Select Canvas
        </label>
        <div className="flex">
          <select
            id="canvas-selector"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={currentCanvas?.id || ''}
            onChange={(e) => {
              const selectedCanvas = canvases.find(canvas => canvas.id === e.target.value);
              if (selectedCanvas) {
                onSelectCanvas(selectedCanvas);
              }
            }}
          >
            {canvases.map((canvas) => (
              <option key={canvas.id} value={canvas.id}>
                {canvas.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onCreateCanvas}
            className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            New Canvas
          </button>
        </div>
      </div>
    </div>
  );
};

export default CanvasSelector;
