import React, { useState } from 'react';
import { IdeaPlaygroundCanvas } from '../../lib/types/idea-playground.types';

interface CanvasSelectorProps {
  canvases: IdeaPlaygroundCanvas[];
  selectedCanvasId: string | null;
  onCanvasChange: (canvasId: string) => void;
  onCreateCanvas: (name: string, description?: string) => void;
  isLoading?: boolean;
}

const CanvasSelector: React.FC<CanvasSelectorProps> = ({
  canvases,
  selectedCanvasId,
  onCanvasChange,
  onCreateCanvas,
  isLoading = false
}) => {
  if (canvases.length === 0) {
    return null;
  }

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCanvasName, setNewCanvasName] = useState('');
  const [newCanvasDescription, setNewCanvasDescription] = useState('');

  const handleCreateCanvas = () => {
    if (newCanvasName.trim()) {
      onCreateCanvas(newCanvasName.trim(), newCanvasDescription.trim() || undefined);
      setNewCanvasName('');
      setNewCanvasDescription('');
      setShowCreateDialog(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <label htmlFor="canvas-selector" className="block text-sm font-medium text-gray-700 mb-1">
            Select Canvas
          </label>
          <div className="flex">
            <select
              id="canvas-selector"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={selectedCanvasId || ''}
              onChange={(e) => onCanvasChange(e.target.value)}
              disabled={isLoading}
            >
              {canvases.map((canvas) => (
                <option key={canvas.id} value={canvas.id}>
                  {canvas.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowCreateDialog(true)}
              className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              New Canvas
            </button>
          </div>
        </div>
      </div>

      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Canvas</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="canvas-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Canvas Name
                </label>
                <input
                  type="text"
                  id="canvas-name"
                  value={newCanvasName}
                  onChange={(e) => setNewCanvasName(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="My New Canvas"
                />
              </div>
              <div>
                <label htmlFor="canvas-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="canvas-description"
                  value={newCanvasDescription}
                  onChange={(e) => setNewCanvasDescription(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Description of canvas purpose"
                  rows={3}
                />
              </div>
              <div className="flex justify-end pt-2 space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateDialog(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateCanvas}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  disabled={!newCanvasName.trim()}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasSelector;
