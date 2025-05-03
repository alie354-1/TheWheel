/**
 * Enhanced Idea Hub Page
 * Main entry point for the Enhanced Idea Hub feature with a modern dashboard layout
 */

import React, { useEffect, useState } from 'react';
import { useIdeaHubStore } from '../../enhanced-idea-hub/store/idea-hub-store';
import ViewManager from '../../enhanced-idea-hub/components/ViewManager';
import { EnhancedIdeaPlaygroundIdea, OwnershipType, IdeaType } from '../../enhanced-idea-hub/types';

// Icons
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const PersonalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const CompanyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
  </svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Idea type options for filtering
const ideaTypeOptions: { value: IdeaType; label: string }[] = [
  { value: 'new_company', label: 'New Company' },
  { value: 'new_product', label: 'New Product' },
  { value: 'new_feature', label: 'New Feature' },
  { value: 'improvement', label: 'Improvement' }
];

const EnhancedIdeaHub: React.FC = () => {
  // State
  const [selectedIdea, setSelectedIdea] = useState<EnhancedIdeaPlaygroundIdea | null>(null);
  const [showIdeaDetail, setShowIdeaDetail] = useState<boolean>(false);
  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [selectedIdeaTypes, setSelectedIdeaTypes] = useState<IdeaType[]>([]);
  const [isCreatingIdea, setIsCreatingIdea] = useState<boolean>(false);
  const [newIdeaData, setNewIdeaData] = useState({
    title: '',
    description: '',
    ideaType: 'new_feature' as IdeaType,
    ownershipType: 'personal' as OwnershipType
  });
  
  // Get data and actions from the store
  const { 
    ideas, 
    isLoading, 
    error, 
    fetchIdeas,
    createIdea,
    filters,
    setFilters
  } = useIdeaHubStore(state => ({
    ideas: state.ideas,
    isLoading: state.isLoading,
    error: state.error,
    fetchIdeas: state.fetchIdeas,
    createIdea: state.createIdea,
    filters: state.filters,
    setFilters: state.setFilters
  }));
  
  // Fetch ideas on component mount
  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);
  
  // Apply all filters
  const filteredIdeas = ideas
    .filter(idea => ownershipFilter === 'all' ? true : idea.ownershipType === ownershipFilter)
    .filter(idea => selectedIdeaTypes.length === 0 ? true : selectedIdeaTypes.includes(idea.ideaType))
    .filter(idea => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        idea.title.toLowerCase().includes(query) ||
        idea.description.toLowerCase().includes(query)
      );
    });
  
  // Handle ownership filter change
  const handleOwnershipFilterChange = (type: OwnershipType | 'all') => {
    setOwnershipFilter(type);
    setFilters({ ...filters, ownershipType: type === 'all' ? undefined : type });
  };
  
  // Handle idea type filter change
  const handleIdeaTypeFilterChange = (type: IdeaType) => {
    if (selectedIdeaTypes.includes(type)) {
      setSelectedIdeaTypes(selectedIdeaTypes.filter(t => t !== type));
    } else {
      setSelectedIdeaTypes([...selectedIdeaTypes, type]);
    }
  };
  
  // Handle idea selection
  const handleSelectIdea = (idea: EnhancedIdeaPlaygroundIdea) => {
    setSelectedIdea(idea);
    setShowIdeaDetail(true);
  };
  
  // Handle creating a new idea
  const handleCreateIdea = async () => {
    try {
      await createIdea({
        title: newIdeaData.title || 'New Idea',
        description: newIdeaData.description || 'No description provided.',
        ideaType: newIdeaData.ideaType,
        ownershipType: newIdeaData.ownershipType,
        integration: {
          status: 'draft'
        }
      });
      
      // Reset form and close modal
      setNewIdeaData({
        title: '',
        description: '',
        ideaType: 'new_feature',
        ownershipType: 'personal'
      });
      setIsCreatingIdea(false);
    } catch (error) {
      console.error('Failed to create idea:', error);
    }
  };
  
  // Close idea detail view
  const handleCloseDetail = () => {
    setShowIdeaDetail(false);
    setSelectedIdea(null);
  };
  
  // Get stats for the dashboard
  const stats = {
    total: ideas.length,
    personal: ideas.filter(idea => idea.ownershipType === 'personal').length,
    company: ideas.filter(idea => idea.ownershipType === 'company').length,
    saved: ideas.filter(idea => idea.is_saved).length
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Idea Hub</h1>
            </div>
            <div className="flex items-center">
              <button
                className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                onClick={() => setIsCreatingIdea(true)}
              >
                <PlusIcon />
                <span className="ml-2">New Idea</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <DashboardIcon />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Ideas</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <PersonalIcon />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Personal Ideas</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.personal}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <CompanyIcon />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Company Ideas</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.company}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Saved Ideas</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.saved}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:w-1/3 mb-4 md:mb-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search ideas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
                
                <button
                  className={`px-3 py-1 text-sm rounded-md ${
                    ownershipFilter === 'all' 
                      ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}
                  onClick={() => handleOwnershipFilterChange('all')}
                >
                  All
                </button>
                
                <button
                  className={`px-3 py-1 text-sm rounded-md ${
                    ownershipFilter === 'personal' 
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' 
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}
                  onClick={() => handleOwnershipFilterChange('personal')}
                >
                  Personal
                </button>
                
                <button
                  className={`px-3 py-1 text-sm rounded-md ${
                    ownershipFilter === 'company' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}
                  onClick={() => handleOwnershipFilterChange('company')}
                >
                  Company
                </button>
                
                <button
                  className="ml-2 px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-800 border border-gray-200 flex items-center"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <FilterIcon />
                  <span className="ml-1">Advanced</span>
                </button>
              </div>
            </div>
            
            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Idea Type</h3>
                <div className="flex flex-wrap gap-2">
                  {ideaTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`px-3 py-1 text-sm rounded-md ${
                        selectedIdeaTypes.includes(option.value)
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}
                      onClick={() => handleIdeaTypeFilterChange(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Error display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>Error: {error.message}</p>
          </div>
        )}
        
        {/* Main content */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <ViewManager
              ideas={filteredIdeas}
              isLoading={isLoading}
              onSelectIdea={handleSelectIdea}
            />
          </div>
        </div>
      </div>
      
      {/* Idea Detail Modal */}
      {showIdeaDetail && selectedIdea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedIdea.title}</h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={handleCloseDetail}
                >
                  <CloseIcon />
                </button>
              </div>
              
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {selectedIdea.ideaType.replace('_', ' ')}
                </span>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  selectedIdea.ownershipType === 'personal'
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {selectedIdea.ownershipType === 'personal' ? 'Personal' : 'Company'}
                </span>
                {selectedIdea.companyName && selectedIdea.ownershipType === 'company' && (
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                    {selectedIdea.companyName}
                  </span>
                )}
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                  {selectedIdea.integration.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="prose max-w-none mb-6">
                <p>{selectedIdea.description}</p>
              </div>
              
              {/* Additional details */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold mb-2">Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p>{new Date(selectedIdea.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p>{new Date(selectedIdea.updated_at).toLocaleDateString()}</p>
                  </div>
                  {selectedIdea.integration.approvedBy && (
                    <div>
                      <p className="text-sm text-gray-500">Approved By</p>
                      <p>{selectedIdea.integration.approvedBy}</p>
                    </div>
                  )}
                  {selectedIdea.integration.approvalDate && (
                    <div>
                      <p className="text-sm text-gray-500">Approval Date</p>
                      <p>{new Date(selectedIdea.integration.approvalDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors mr-2"
                  onClick={handleCloseDetail}
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Create Idea Modal */}
      {isCreatingIdea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">Create New Idea</h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setIsCreatingIdea(false)}
                >
                  <CloseIcon />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    id="title"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={newIdeaData.title}
                    onChange={(e) => setNewIdeaData({ ...newIdeaData, title: e.target.value })}
                    placeholder="Enter idea title"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    id="description"
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={newIdeaData.description}
                    onChange={(e) => setNewIdeaData({ ...newIdeaData, description: e.target.value })}
                    placeholder="Describe your idea"
                  />
                </div>
                
                <div>
                  <label htmlFor="ideaType" className="block text-sm font-medium text-gray-700">Idea Type</label>
                  <select
                    id="ideaType"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={newIdeaData.ideaType}
                    onChange={(e) => setNewIdeaData({ ...newIdeaData, ideaType: e.target.value as IdeaType })}
                  >
                    {ideaTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ownership</label>
                  <div className="mt-2 space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-indigo-600"
                        name="ownership"
                        value="personal"
                        checked={newIdeaData.ownershipType === 'personal'}
                        onChange={() => setNewIdeaData({ ...newIdeaData, ownershipType: 'personal' })}
                      />
                      <span className="ml-2">Personal</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-indigo-600"
                        name="ownership"
                        value="company"
                        checked={newIdeaData.ownershipType === 'company'}
                        onChange={() => setNewIdeaData({ ...newIdeaData, ownershipType: 'company' })}
                      />
                      <span className="ml-2">Company</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors mr-2"
                  onClick={() => setIsCreatingIdea(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  onClick={handleCreateIdea}
                >
                  Create Idea
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedIdeaHub;
