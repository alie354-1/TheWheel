import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowLeft, ArrowRight } from 'lucide-react';
import { useBrowseSteps } from '../hooks/useBrowseSteps';
import { useCompany } from '../../../../lib/hooks/useCompany';
import { useAuth } from '../../../../lib/hooks/useAuth';

/**
 * Component for browsing available journey steps
 * Allows filtering, searching, and starting new steps
 */
const BrowseStepsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const { user } = useAuth();
  const userId = user?.id; // Use the actual user ID instead of company ID
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDomain, setFilterDomain] = useState('');
  const [filterPhase, setFilterPhase] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');

  const {
    isLoading,
    error,
    filteredSteps,
    availableDomains,
    availablePhases,
    updateFilters,
    startStep
  } = useBrowseSteps(userId);

  // Update filters when search or filter selections change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    updateFilters({ searchQuery: e.target.value });
  };

  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterDomain(e.target.value);
    updateFilters({ domain: e.target.value });
  };

  const handlePhaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterPhase(e.target.value);
    updateFilters({ phase: e.target.value });
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterDifficulty(e.target.value);
    updateFilters({ difficulty: e.target.value });
  };

  const handleStartStep = async (stepId: string) => {
    const success = await startStep(stepId);
    if (success) {
      navigate(`/company/new-journey/step/${stepId}`);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/company/new-journey');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
        <button 
          onClick={handleBackToDashboard}
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={handleBackToDashboard}
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900">Browse Available Steps</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select steps you haven't started yet to add them to your journey.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search steps..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        {/* Domain Filter */}
        <div>
          <select
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={filterDomain}
            onChange={handleDomainChange}
          >
            <option value="">All Domains</option>
            {availableDomains.map((domain) => (
              <option key={domain.id} value={domain.name}>
                {domain.name} ({domain.count})
              </option>
            ))}
          </select>
        </div>
        
        {/* Phase Filter */}
        <div>
          <select
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={filterPhase}
            onChange={handlePhaseChange}
          >
            <option value="">All Phases</option>
            {availablePhases.map((phase) => (
              <option key={phase.id} value={phase.name}>
                {phase.name} ({phase.count})
              </option>
            ))}
          </select>
        </div>
        
        {/* Difficulty Filter */}
        <div>
          <select
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={filterDifficulty}
            onChange={handleDifficultyChange}
          >
            <option value="">All Difficulties</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      {/* Steps Table */}
      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Step Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domain
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phase
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difficulty
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Est. Days
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage %
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSteps.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No steps found matching your criteria
                </td>
              </tr>
            ) : (
              filteredSteps.map((step) => (
                <tr key={step.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{step.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {step.domain.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {step.phase.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${step.difficulty === 'Low' ? 'bg-green-100 text-green-800' : 
                        step.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {step.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {step.estimatedDays}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {step.usagePercentage}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleStartStep(step.id)}
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
                    >
                      Start
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BrowseStepsPage;
