import React from 'react';

export interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterUrgent: boolean;
  setFilterUrgent: (value: boolean) => void;
  filterActive: boolean;
  setFilterActive: (value: boolean) => void;
  filterBlocked: boolean;
  setFilterBlocked: (value: boolean) => void;
  filterCompleted: boolean;
  setFilterCompleted: (value: boolean) => void;
  domains: string[];
  selectedDomains: string[];
  setSelectedDomains: (domains: string[]) => void;
}

/**
 * FiltersModal - Modal with filter options for journey steps
 */
const FiltersModal: React.FC<FiltersModalProps> = ({
  isOpen,
  onClose,
  filterUrgent,
  setFilterUrgent,
  filterActive,
  setFilterActive,
  filterBlocked,
  setFilterBlocked,
  filterCompleted,
  setFilterCompleted,
  domains,
  selectedDomains,
  setSelectedDomains
}) => {
  if (!isOpen) return null;

  // Toggle a domain selection
  const toggleDomain = (domain: string) => {
    if (selectedDomains.includes(domain)) {
      setSelectedDomains(selectedDomains.filter(d => d !== domain));
    } else {
      setSelectedDomains([...selectedDomains, domain]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterUrgent(false);
    setFilterActive(false);
    setFilterBlocked(false);
    setFilterCompleted(false);
    setSelectedDomains([]);
  };

  // Apply filters and close modal
  const applyFilters = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Filter Steps</h3>
              
              <div className="mt-4 space-y-4">
                {/* Step Status Filters */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Step Status</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center">
                      <input
                        id="filter-urgent"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={filterUrgent}
                        onChange={e => setFilterUrgent(e.target.checked)}
                      />
                      <label htmlFor="filter-urgent" className="ml-2 block text-sm text-gray-700">
                        Urgent
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="filter-active"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={filterActive}
                        onChange={e => setFilterActive(e.target.checked)}
                      />
                      <label htmlFor="filter-active" className="ml-2 block text-sm text-gray-700">
                        Active
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="filter-blocked"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={filterBlocked}
                        onChange={e => setFilterBlocked(e.target.checked)}
                      />
                      <label htmlFor="filter-blocked" className="ml-2 block text-sm text-gray-700">
                        Blocked
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="filter-completed"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={filterCompleted}
                        onChange={e => setFilterCompleted(e.target.checked)}
                      />
                      <label htmlFor="filter-completed" className="ml-2 block text-sm text-gray-700">
                        Completed
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Domain Filters */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Business Domains</h4>
                  <div className="space-y-2">
                    {domains.map((domain, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          id={`domain-${index}`}
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={selectedDomains.includes(domain)}
                          onChange={() => toggleDomain(domain)}
                        />
                        <label htmlFor={`domain-${index}`} className="ml-2 block text-sm text-gray-700">
                          {domain}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={applyFilters}
            >
              Apply Filters
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={clearFilters}
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersModal;
