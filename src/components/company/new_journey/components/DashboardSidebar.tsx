import React from 'react';
import { Search, AlertTriangle, Clock, CheckCircle, Trash2, ExternalLink, Eye } from 'lucide-react';
import { CompanyStepWithMeta } from '../hooks/useCompanySteps';

export interface DashboardStats {
  total: number;
  active: number;
  completed: number;
  urgent: number;
  skipped: number;
}

export interface DashboardSidebarProps {
  stats: DashboardStats;
  activeFilters: {
    urgent: boolean;
    started: boolean;
    blocked: boolean;
  };
  onFilterChange: (filterName: string, value: string | boolean) => void;
  onBrowseSteps: () => void;
  // New props for company steps
  companySteps?: {
    urgent: CompanyStepWithMeta[];
    inProgress: CompanyStepWithMeta[];
    completed: CompanyStepWithMeta[];
  };
  onViewStep?: (stepId: string) => void;
  onOpenStep?: (stepId: string) => void;
  onDeleteStep?: (stepId: string) => void;
  onAddStep?: () => void;
  searchText?: string;
  onSearchChange?: (value: string) => void;
}

/**
 * Sidebar component for the Journey Dashboard
 * Shows statistics, filtering options, and company steps
 */
const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  stats,
  activeFilters,
  onFilterChange,
  onBrowseSteps,
  // New props for company steps
  companySteps,
  onViewStep,
  onOpenStep,
  onDeleteStep,
  onAddStep,
  searchText = '',
  onSearchChange
}) => {
  // Handle search change that works with both old and new interfaces
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    } else {
      onFilterChange('search', e.target.value);
    }
  };

  return (
    <div className="w-full md:w-72 flex-shrink-0 bg-white border-r border-gray-200 p-4 overflow-y-auto h-[calc(100vh-64px)]">
      <div className="space-y-6">
        {/* Stats Section */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Journey Stats
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
              <span className="text-sm text-gray-600">Total Steps</span>
              <span className="text-sm font-medium">{stats.total}</span>
            </div>
            <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm text-gray-600">Active</span>
              </div>
              <span className="text-sm font-medium">{stats.active}</span>
            </div>
            <div className="flex justify-between items-center bg-green-50 p-2 rounded">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <span className="text-sm font-medium">{stats.completed}</span>
            </div>
            <div className="flex justify-between items-center bg-amber-50 p-2 rounded">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                <span className="text-sm text-gray-600">Urgent</span>
              </div>
              <span className="text-sm font-medium text-amber-500">{stats.urgent}</span>
            </div>
          </div>
        </div>
        
        {/* Filters Section */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Filters
          </h2>
          
          {/* Search */}
          <div className="relative mb-3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search steps..."
              value={searchText}
              onChange={handleSearchChange}
            />
          </div>
          
          {/* Checkboxes */}
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={activeFilters.urgent}
                onChange={() => onFilterChange('urgent', !activeFilters.urgent)}
              />
              <span className="ml-2 text-sm text-gray-600">Urgent</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={activeFilters.started}
                onChange={() => onFilterChange('started', !activeFilters.started)}
              />
              <span className="ml-2 text-sm text-gray-600">Started</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={activeFilters.blocked}
                onChange={() => onFilterChange('blocked', !activeFilters.blocked)}
              />
              <span className="ml-2 text-sm text-gray-600">Blocked</span>
            </label>
          </div>
        </div>
        
        {/* Company Steps Sections - Only show if we have companySteps */}
        {companySteps && (
          <>
            {/* Urgent Steps */}
            {companySteps.urgent.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-3 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Urgent Steps
                </h2>
                <ul className="space-y-2">
                  {companySteps.urgent.map((item) => (
                    <li 
                      key={item.step.id} 
                      className="p-2 border border-red-100 bg-red-50 rounded-md"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm">{item.step.name}</span>
                        <div className="flex space-x-1">
                          {onViewStep && (
                            <button 
                              onClick={() => onViewStep(item.step.id)}
                              className="p-1 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-indigo-50"
                              title="Quick view"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          {onOpenStep && (
                            <button 
                              onClick={() => onOpenStep(item.step.id)}
                              className="p-1 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-indigo-50"
                              title="Open details"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          )}
                          {onDeleteStep && (
                            <button 
                              onClick={() => onDeleteStep(item.step.id)}
                              className="p-1 text-gray-500 hover:text-red-600 rounded-md hover:bg-red-50"
                              title="Delete step"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      {item.dueDate && (
                        <div className="text-xs text-red-600">
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      {item.completion !== undefined && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-red-600 h-1.5 rounded-full" 
                            style={{ width: `${Math.round(item.completion * 100)}%` }}
                          ></div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* In Progress Steps */}
            {companySteps.inProgress.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  In Progress
                </h2>
                <ul className="space-y-2">
                  {companySteps.inProgress.map((item) => (
                    <li 
                      key={item.step.id} 
                      className="p-2 border border-blue-100 bg-blue-50 rounded-md"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm">{item.step.name}</span>
                        <div className="flex space-x-1">
                          {onViewStep && (
                            <button 
                              onClick={() => onViewStep(item.step.id)}
                              className="p-1 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-indigo-50"
                              title="Quick view"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          {onOpenStep && (
                            <button 
                              onClick={() => onOpenStep(item.step.id)}
                              className="p-1 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-indigo-50"
                              title="Open details"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          )}
                          {onDeleteStep && (
                            <button 
                              onClick={() => onDeleteStep(item.step.id)}
                              className="p-1 text-gray-500 hover:text-red-600 rounded-md hover:bg-red-50"
                              title="Delete step"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      {item.completion !== undefined && (
                        <>
                          <div className="text-xs text-gray-600 mb-1">
                            Progress: {Math.round(item.completion * 100)}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${Math.round(item.completion * 100)}%` }}
                            ></div>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Completed Steps - collapsed by default */}
            {companySteps.completed.length > 0 && (
              <div>
                <details className="group">
                  <summary className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1 flex items-center cursor-pointer list-none">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completed
                      <span className="ml-1 text-gray-500">({companySteps.completed.length})</span>
                    </div>
                    <span className="ml-auto text-gray-400 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <ul className="space-y-2 mt-2">
                    {companySteps.completed.map((item) => (
                      <li 
                        key={item.step.id} 
                        className="p-2 border border-green-100 bg-green-50 rounded-md"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-sm">{item.step.name}</span>
                          <div className="flex space-x-1">
                            {onViewStep && (
                              <button 
                                onClick={() => onViewStep(item.step.id)}
                                className="p-1 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-indigo-50"
                                title="Quick view"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            {onOpenStep && (
                              <button 
                                onClick={() => onOpenStep(item.step.id)}
                                className="p-1 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-indigo-50"
                                title="Open details"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        {item.step.completed_at && (
                          <div className="text-xs text-gray-500 mt-1">
                            Completed: {new Date(item.step.completed_at).toLocaleDateString()}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
          </>
        )}
        
        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onBrowseSteps}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Browse All Steps
          </button>
          
          {onAddStep && (
            <button
              onClick={onAddStep}
              className="w-full flex justify-center py-2 px-4 border border-green-600 rounded-md shadow-sm text-sm font-medium text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              + Add Custom Step
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
