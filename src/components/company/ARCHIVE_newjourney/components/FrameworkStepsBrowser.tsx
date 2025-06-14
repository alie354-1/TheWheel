import React, { useState, useEffect } from 'react';
import { journeyFrameworkService, FrameworkStepImportOptions } from '../../../../lib/services/journeyFramework.service';
import { 
  JourneyStep, 
  JourneyPhase, 
  JourneyDomain, 
  difficulty_level 
} from '../../../../lib/types/journey-unified.types';

interface FrameworkStepsBrowserProps {
  companyId: string;
  onImportSteps?: (stepIds: string[]) => void;
  onClose?: () => void;
}

interface StepFilters {
  phaseId?: string;
  domainId?: string;
  difficulty?: difficulty_level;
  search?: string;
}

const FrameworkStepsBrowser: React.FC<FrameworkStepsBrowserProps> = ({
  companyId,
  onImportSteps,
  onClose
}) => {
  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [phases, setPhases] = useState<JourneyPhase[]>([]);
  const [domains, setDomains] = useState<JourneyDomain[]>([]);
  const [selectedSteps, setSelectedSteps] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<StepFilters>({});
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadSteps();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      const [phasesData, domainsData] = await Promise.all([
        journeyFrameworkService.getPhases(),
        journeyFrameworkService.getDomains()
      ]);
      setPhases(phasesData);
      setDomains(domainsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadSteps = async () => {
    try {
      setLoading(true);
      const stepsData = await journeyFrameworkService.getFrameworkSteps(filters);
      setSteps(stepsData);
    } catch (error) {
      console.error('Error loading steps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepSelection = (stepId: string) => {
    const newSelected = new Set(selectedSteps);
    if (newSelected.has(stepId)) {
      newSelected.delete(stepId);
    } else {
      newSelected.add(stepId);
    }
    setSelectedSteps(newSelected);
  };

  const handleImport = async () => {
    if (selectedSteps.size === 0) return;

    try {
      setImporting(true);
      const importOptions: FrameworkStepImportOptions = {
        companyId,
        stepIds: Array.from(selectedSteps),
        customizeOnImport: false,
        preserveOrder: true
      };

      await journeyFrameworkService.importStepsToCompany(importOptions);
      onImportSteps?.(Array.from(selectedSteps));
      setSelectedSteps(new Set());
    } catch (error) {
      console.error('Error importing steps:', error);
    } finally {
      setImporting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-orange-100 text-orange-800';
      case 'Very Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Framework Steps Browser</h2>
            <p className="text-gray-600 mt-1">
              Browse and import steps from the canonical journey framework
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phase</label>
              <select
                value={filters.phaseId || ''}
                onChange={(e) => setFilters({ ...filters, phaseId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Phases</option>
                {phases.map(phase => (
                  <option key={phase.id} value={phase.id}>{phase.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
              <select
                value={filters.domainId || ''}
                onChange={(e) => setFilters({ ...filters, domainId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Domains</option>
                {domains.map(domain => (
                  <option key={domain.id} value={domain.id}>{domain.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={filters.difficulty || ''}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value as difficulty_level || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Very Hard">Very Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
                placeholder="Search steps..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Steps List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {steps.map(step => (
                <div
                  key={step.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedSteps.has(step.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleStepSelection(step.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 flex-1">{step.name}</h3>
                    <input
                      type="checkbox"
                      checked={selectedSteps.has(step.id)}
                      onChange={() => handleStepSelection(step.id)}
                      className="ml-2 mt-1"
                    />
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{step.description}</p>

                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded-full ${getDifficultyColor(step.difficulty)}`}>
                      {step.difficulty}
                    </span>
                    <span className="text-gray-500">
                      {step.estimated_time_days} days
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    Order: {step.order_index}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && steps.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500">No steps found matching your filters</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedSteps.size} step{selectedSteps.size !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={selectedSteps.size === 0 || importing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? 'Importing...' : `Import ${selectedSteps.size} Step${selectedSteps.size !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrameworkStepsBrowser;
