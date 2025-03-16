import React from 'react';
import { IdeaWorkspace } from '../../lib/types/unified-idea.types';

interface WorkspaceHeaderProps {
  workspace: IdeaWorkspace;
  viewMode: 'exploration' | 'refinement' | 'comparison' | 'merge';
  onViewModeChange: (mode: 'exploration' | 'refinement' | 'comparison' | 'merge') => void;
  selectedIdeasCount: number;
  onCompare: () => void;
  onMerge: () => void;
}

const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  workspace,
  viewMode,
  onViewModeChange,
  selectedIdeasCount,
  onCompare,
  onMerge
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl font-semibold text-gray-900">{workspace.title}</h1>
          {workspace.description && (
            <p className="mt-1 text-sm text-gray-500">{workspace.description}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View mode selector */}
          <div className="hidden md:block">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => onViewModeChange('exploration')}
                className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                  viewMode === 'exploration'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Explore
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('refinement')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'refinement'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border-t border-b border-gray-300 hover:bg-gray-50'
                }`}
                disabled={!workspace.active_idea_id}
              >
                Refine
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('comparison')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'comparison'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border-t border-b border-gray-300 hover:bg-gray-50'
                }`}
                disabled={selectedIdeasCount < 2}
              >
                Compare
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('merge')}
                className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                  viewMode === 'merge'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                disabled={selectedIdeasCount < 2}
              >
                Merge
              </button>
            </div>
          </div>
          
          {/* Action buttons for mobile */}
          <div className="md:hidden">
            <select
              value={viewMode}
              onChange={(e) => onViewModeChange(e.target.value as any)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="exploration">Explore</option>
              <option value="refinement" disabled={!workspace.active_idea_id}>Refine</option>
              <option value="comparison" disabled={selectedIdeasCount < 2}>Compare</option>
              <option value="merge" disabled={selectedIdeasCount < 2}>Merge</option>
            </select>
          </div>
          
          {/* Action buttons based on selected ideas */}
          {viewMode === 'exploration' && selectedIdeasCount >= 2 && (
            <div className="flex space-x-2">
              <button
                onClick={onCompare}
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Compare ({selectedIdeasCount})
              </button>
              <button
                onClick={onMerge}
                className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Merge ({selectedIdeasCount})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceHeader;
