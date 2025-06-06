import React from 'react';
import { List, BarChart } from 'lucide-react';

export type ViewMode = 'timeline' | 'list';

interface ViewToggleProps {
  activeView: ViewMode;
  onChange: (view: ViewMode) => void;
  className?: string;
}

/**
 * ViewToggle Component
 * 
 * A toggle switch between Timeline and List views for the Journey page.
 * Part of the Sprint 3 implementation of the Journey System Unified Redesign.
 */
export const ViewToggle: React.FC<ViewToggleProps> = ({
  activeView,
  onChange,
  className = '',
}) => {
  return (
    <div className={`view-toggle inline-flex rounded-md shadow-sm bg-gray-100 ${className}`}>
      <button
        type="button"
        className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-l-md ${
          activeView === 'timeline'
            ? 'bg-white text-gray-900 shadow-sm z-10'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
        onClick={() => onChange('timeline')}
        aria-current={activeView === 'timeline' ? 'page' : undefined}
      >
        <BarChart className="mr-2 h-4 w-4" />
        Timeline
      </button>
      <button
        type="button"
        className={`relative -ml-px inline-flex items-center px-3 py-2 text-sm font-medium rounded-r-md ${
          activeView === 'list'
            ? 'bg-white text-gray-900 shadow-sm z-10'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
        onClick={() => onChange('list')}
        aria-current={activeView === 'list' ? 'page' : undefined}
      >
        <List className="mr-2 h-4 w-4" />
        List
      </button>
    </div>
  );
};

export default ViewToggle;
