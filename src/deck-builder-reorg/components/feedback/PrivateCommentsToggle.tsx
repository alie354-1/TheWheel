import React from 'react';
import { Lock, Users } from 'lucide-react';

interface PrivateCommentsToggleProps {
  showOnlyOwnComments: boolean;
  onToggle: (showOnlyOwn: boolean) => void;
}

export const PrivateCommentsToggle: React.FC<PrivateCommentsToggleProps> = ({
  showOnlyOwnComments,
  onToggle,
}) => {
  return (
    <div className="flex items-center space-x-2 my-4">
      <span className="text-sm font-medium text-gray-600">View:</span>
      <div className="flex rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => onToggle(false)}
          className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            !showOnlyOwnComments
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:bg-gray-200'
          }`}
          title="Show all shared comments"
        >
          <Users className="h-4 w-4" />
          <span>All Comments</span>
        </button>
        <button
          type="button"
          onClick={() => onToggle(true)}
          className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            showOnlyOwnComments
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:bg-gray-200'
          }`}
          title="Show only your private comments"
        >
          <Lock className="h-4 w-4" />
          <span>My Private</span>
        </button>
      </div>
    </div>
  );
};
