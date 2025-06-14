import React from 'react';

interface StatsData {
  total: number;
  active: number;
  completed: number;
  urgent: number;
}

interface JourneyStatsBarProps {
  stats: StatsData;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  showDetails?: boolean;
}

/**
 * JourneyStatsBar - Displays a grid of journey statistics with clickable filters
 */
const JourneyStatsBar: React.FC<JourneyStatsBarProps> = ({
  stats,
  activeFilter,
  onFilterChange,
  showDetails = false
}) => {
  return (
    <div className="bg-white p-2 rounded-lg border border-gray-200 mb-4">
      {showDetails && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-700 flex items-center">
            <i className="fas fa-chart-pie mr-1 text-indigo-500"></i>
            Journey Stats
          </h3>
          <button className="text-xs text-indigo-600 hover:text-indigo-800">
            <i className="fas fa-expand-alt mr-1"></i>
            Details
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-4 gap-1">
        {/* Total */}
        <button 
          className={`stat-filter flex flex-col items-center justify-center py-1 px-1 rounded border border-gray-100 hover:bg-gray-50 transition-colors text-center ${
            activeFilter === 'all' ? 'ring-2 ring-indigo-500' : ''
          }`} 
          onClick={() => onFilterChange('all')}
        >
          <div className="h-4 w-4 rounded-full bg-gray-100 flex items-center justify-center mb-1">
            <i className="fas fa-list text-gray-600 text-xs"></i>
          </div>
          <span className="text-xs font-medium text-gray-600">Total</span>
          <span className="text-xs font-bold text-gray-900">{stats.total}</span>
        </button>
        
        {/* Active */}
        <button 
          className={`stat-filter flex flex-col items-center justify-center py-1 px-1 rounded border border-blue-100 hover:bg-blue-50 transition-colors text-center ${
            activeFilter === 'active' ? 'ring-2 ring-indigo-500' : ''
          }`}
          onClick={() => onFilterChange('active')}
        >
          <div className="h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center mb-1">
            <i className="fas fa-clock text-blue-600 text-xs"></i>
          </div>
          <span className="text-xs font-medium text-blue-600">Active</span>
          <span className="text-xs font-bold text-blue-800">{stats.active}</span>
        </button>
        
        {/* Completed */}
        <button 
          className={`stat-filter flex flex-col items-center justify-center py-1 px-1 rounded border border-green-100 hover:bg-green-50 transition-colors text-center ${
            activeFilter === 'completed' ? 'ring-2 ring-indigo-500' : ''
          }`}
          onClick={() => onFilterChange('completed')}
        >
          <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center mb-1">
            <i className="fas fa-check-circle text-green-600 text-xs"></i>
          </div>
          <span className="text-xs font-medium text-green-600">Done</span>
          <span className="text-xs font-bold text-green-800">{stats.completed}</span>
        </button>
        
        {/* Urgent */}
        <button 
          className={`stat-filter flex flex-col items-center justify-center py-1 px-1 rounded border border-amber-100 hover:bg-amber-50 transition-colors text-center ${
            activeFilter === 'urgent' ? 'ring-2 ring-indigo-500' : ''
          }`}
          onClick={() => onFilterChange('urgent')}
        >
          <div className="h-4 w-4 rounded-full bg-amber-100 flex items-center justify-center mb-1">
            <i className="fas fa-exclamation-triangle text-amber-600 text-xs"></i>
          </div>
          <span className="text-xs font-medium text-amber-600">Urgent</span>
          <span className="text-xs font-bold text-amber-800">{stats.urgent}</span>
        </button>
      </div>
    </div>
  );
};

export default JourneyStatsBar;
